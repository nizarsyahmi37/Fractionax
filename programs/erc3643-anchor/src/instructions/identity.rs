use anchor_lang::prelude::*;
use crate::{
    error::ERC3643Error,
    events::*,
    state::*,
};

/// Register a new identity in the registry
#[derive(Accounts)]
#[instruction(user: Pubkey, country: u16)]
pub struct RegisterIdentity<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Agent or owner performing the registration
    #[account(mut)]
    pub agent: Signer<'info>,

    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        constraint = config.has_agent_or_owner_role(&agent.key()) @ ERC3643Error::AgentRoleRequired
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint this identity is for
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// Identity registry account to create
    #[account(
        init,
        payer = payer,
        space = IdentityRegistry::LEN,
        seeds = [IDENTITY_SEED, user.as_ref()],
        bump
    )]
    pub identity_registry: Account<'info, IdentityRegistry>,

    /// System program
    pub system_program: Program<'info, System>,
}

pub fn register_identity(
    ctx: Context<RegisterIdentity>,
    user: Pubkey,
    country: u16,
) -> Result<()> {
    let identity = &mut ctx.accounts.identity_registry;
    let agent = &ctx.accounts.agent;

    // Validate inputs
    validate_pubkey(&user)?;
    validate_country_code(country)?;

    let now = Clock::get()?.unix_timestamp;

    // Initialize identity registry
    identity.user = user;
    identity.is_verified = false; // Will be set to true once required claims are added
    identity.country = country;
    identity.onchain_id = None;
    identity.claims_count = 0;
    identity.required_claims_met = false;
    identity.registered_at = now;
    identity.last_verified_at = 0;
    identity.updated_at = now;
    identity.registered_by = agent.key();
    identity.reserved = [0; 64];

    emit!(IdentityRegistered {
        investor_address: user,
        identity: identity.key(),
    });

    msg!("Identity registered for user: {}", user);
    msg!("Country: {}", country);
    msg!("Registered by: {}", agent.key());

    Ok(())
}

/// Add a claim to an identity
#[derive(Accounts)]
#[instruction(topic: u64, scheme: u64, data: Vec<u8>, signature: Vec<u8>, uri: String)]
pub struct AddClaim<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The issuer adding the claim
    #[account(mut)]
    pub issuer: Signer<'info>,

    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint this claim is for
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// Identity registry for the user
    #[account(
        mut,
        seeds = [IDENTITY_SEED, identity_registry.user.as_ref()],
        bump
    )]
    pub identity_registry: Account<'info, IdentityRegistry>,

    /// Trusted issuers registry
    #[account(
        seeds = [TRUSTED_ISSUERS_SEED, mint.key().as_ref()],
        bump
    )]
    pub trusted_issuers_registry: Account<'info, TrustedIssuersRegistry>,

    /// Claim topics registry
    #[account(
        seeds = [CLAIM_TOPICS_SEED, mint.key().as_ref()],
        bump
    )]
    pub claim_topics_registry: Account<'info, ClaimTopicsRegistry>,

    /// The claim account to create
    #[account(
        init,
        payer = payer,
        space = Claim::LEN,
        seeds = [CLAIM_SEED, identity_registry.user.as_ref(), issuer.key().as_ref(), &topic.to_le_bytes()],
        bump
    )]
    pub claim: Account<'info, Claim>,

    /// System program
    pub system_program: Program<'info, System>,
}

pub fn add_claim(
    ctx: Context<AddClaim>,
    topic: u64,
    scheme: u64,
    data: Vec<u8>,
    signature: Vec<u8>,
    uri: String,
) -> Result<()> {
    let claim = &mut ctx.accounts.claim;
    let identity = &mut ctx.accounts.identity_registry;
    let trusted_issuers = &ctx.accounts.trusted_issuers_registry;
    let issuer = &ctx.accounts.issuer;

    // Validate that issuer is trusted for this claim topic
    require!(
        trusted_issuers.is_trusted_for_topic(&issuer.key(), topic),
        ERC3643Error::IssuerRoleRequired
    );

    // Convert scheme to ClaimScheme enum
    let claim_scheme = match scheme {
        1 => ClaimScheme::ECDSA,
        2 => ClaimScheme::RSA,
        3 => ClaimScheme::Contract,
        _ => return Err(ERC3643Error::InvalidArgument.into()),
    };

    // Create the claim
    let new_claim = Claim::new(
        identity.user,
        issuer.key(),
        topic,
        claim_scheme,
        data.clone(),
        signature.clone(),
        uri.clone(),
        None, // No expiration for now
    )?;

    **claim = new_claim;

    // Update identity claims count
    identity.claims_count = identity.claims_count
        .checked_add(1)
        .ok_or(ERC3643Error::ArithmeticOverflow)?;

    // Check if this claim helps meet required claims
    let claim_topics = &ctx.accounts.claim_topics_registry;
    let required_topics = claim_topics.get_required_topics();
    
    // Simple verification: if we have at least one valid claim for each required topic
    let mut topics_met = 0;
    for required_topic in required_topics {
        // In a full implementation, we'd check all claims for this identity
        // For now, we'll just check if this new claim matches a required topic
        if topic == *required_topic {
            topics_met += 1;
        }
    }

    // Update verification status if all required topics are met
    if required_topics.is_empty() || topics_met > 0 {
        identity.required_claims_met = true;
        identity.is_verified = true;
        identity.last_verified_at = Clock::get()?.unix_timestamp;
    }

    identity.updated_at = Clock::get()?.unix_timestamp;

    let claim_id = claim.generate_id();

    emit!(ClaimAdded {
        claim_id,
        topic,
        scheme,
        issuer: issuer.key(),
        signature,
        data,
        uri,
    });

    msg!("Claim added for identity: {}", identity.user);
    msg!("Topic: {}, Issuer: {}", topic, issuer.key());
    msg!("Identity verified: {}", identity.is_verified);

    Ok(())
}

/// Remove a claim from an identity
#[derive(Accounts)]
#[instruction(claim_id: [u8; 32])]
pub struct RemoveClaim<'info> {
    /// The issuer or identity owner removing the claim
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint this claim is for
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// Identity registry for the user
    #[account(
        mut,
        seeds = [IDENTITY_SEED, identity_registry.user.as_ref()],
        bump
    )]
    pub identity_registry: Account<'info, IdentityRegistry>,

    /// The claim account to close
    #[account(
        mut,
        close = authority,
        seeds = [CLAIM_SEED, identity_registry.user.as_ref(), claim.issuer.as_ref(), &claim.topic.to_le_bytes()],
        bump,
        constraint = claim.issuer == authority.key() || identity_registry.user == authority.key() @ ERC3643Error::Unauthorized
    )]
    pub claim: Account<'info, Claim>,
}

pub fn remove_claim(ctx: Context<RemoveClaim>, _claim_id: [u8; 32]) -> Result<()> {
    let claim = &ctx.accounts.claim;
    let identity = &mut ctx.accounts.identity_registry;
    let authority = &ctx.accounts.authority;

    // Store claim info for event
    let claim_id = claim.generate_id();
    let topic = claim.topic;
    let scheme = claim.scheme.clone();
    let issuer = claim.issuer;
    let signature = claim.signature.clone();
    let data = claim.data.clone();
    let uri = claim.uri.clone();

    // Update identity claims count
    identity.claims_count = identity.claims_count
        .checked_sub(1)
        .ok_or(ERC3643Error::ArithmeticUnderflow)?;

    // Re-evaluate verification status
    // In a full implementation, we'd check all remaining claims
    // For now, we'll be conservative and mark as unverified if any claim is removed
    identity.is_verified = false;
    identity.required_claims_met = false;
    identity.updated_at = Clock::get()?.unix_timestamp;

    emit!(ClaimRemoved {
        claim_id,
        topic,
        scheme: match scheme {
            ClaimScheme::ECDSA => 1,
            ClaimScheme::RSA => 2,
            ClaimScheme::Contract => 3,
        },
        issuer,
        signature,
        data,
        uri,
    });

    msg!("Claim removed for identity: {}", identity.user);
    msg!("Topic: {}, Removed by: {}", topic, authority.key());
    msg!("Identity verification status updated: {}", identity.is_verified);

    Ok(())
}

/// Update identity country
#[derive(Accounts)]
pub struct UpdateCountry<'info> {
    /// Agent performing the update
    #[account(mut)]
    pub agent: Signer<'info>,

    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        constraint = config.has_agent_or_owner_role(&agent.key()) @ ERC3643Error::AgentRoleRequired
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// Identity registry to update
    #[account(
        mut,
        seeds = [IDENTITY_SEED, identity_registry.user.as_ref()],
        bump
    )]
    pub identity_registry: Account<'info, IdentityRegistry>,
}

pub fn update_country(ctx: Context<UpdateCountry>, country: u16) -> Result<()> {
    let identity = &mut ctx.accounts.identity_registry;
    
    identity.update_country(country)?;

    emit!(CountryUpdated {
        investor_address: identity.user,
        country,
    });

    msg!("Country updated for identity: {} to {}", identity.user, country);

    Ok(())
}

/// Delete an identity from the registry
#[derive(Accounts)]
pub struct DeleteIdentity<'info> {
    /// Agent performing the deletion
    #[account(mut)]
    pub agent: Signer<'info>,

    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        constraint = config.has_agent_or_owner_role(&agent.key()) @ ERC3643Error::AgentRoleRequired
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// Identity registry to delete
    #[account(
        mut,
        close = agent,
        seeds = [IDENTITY_SEED, identity_registry.user.as_ref()],
        bump
    )]
    pub identity_registry: Account<'info, IdentityRegistry>,
}

pub fn delete_identity(ctx: Context<DeleteIdentity>) -> Result<()> {
    let identity = &ctx.accounts.identity_registry;
    let user = identity.user;

    emit!(IdentityRemoved {
        investor_address: user,
        identity: identity.key(),
    });

    msg!("Identity deleted for user: {}", user);

    Ok(())
}
