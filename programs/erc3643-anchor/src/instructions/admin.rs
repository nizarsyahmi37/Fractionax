use anchor_lang::prelude::*;
use crate::{
    error::ERC3643Error,
    events::*,
    state::*,
};

/// Add a trusted issuer
#[derive(Accounts)]
pub struct AddTrustedIssuer<'info> {
    /// Owner performing the operation
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        has_one = owner @ ERC3643Error::OwnerRoleRequired
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// Trusted issuers registry
    #[account(
        mut,
        seeds = [TRUSTED_ISSUERS_SEED, mint.key().as_ref()],
        bump
    )]
    pub trusted_issuers_registry: Account<'info, TrustedIssuersRegistry>,
}

pub fn add_trusted_issuer(
    ctx: Context<AddTrustedIssuer>,
    issuer: Pubkey,
    claim_topics: Vec<u64>,
) -> Result<()> {
    let trusted_issuers = &mut ctx.accounts.trusted_issuers_registry;

    // Validate inputs
    validate_pubkey(&issuer)?;
    require!(!claim_topics.is_empty(), ERC3643Error::InvalidArgument);

    // Add the trusted issuer
    trusted_issuers.add_issuer(issuer, claim_topics.clone())?;

    emit!(TrustedIssuerAdded {
        trusted_issuer: issuer,
        claim_topics: claim_topics.clone(),
    });

    msg!("Trusted issuer added: {}", issuer);
    msg!("Claim topics: {:?}", claim_topics);

    Ok(())
}

/// Remove a trusted issuer
#[derive(Accounts)]
pub struct RemoveTrustedIssuer<'info> {
    /// Owner performing the operation
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        has_one = owner @ ERC3643Error::OwnerRoleRequired
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// Trusted issuers registry
    #[account(
        mut,
        seeds = [TRUSTED_ISSUERS_SEED, mint.key().as_ref()],
        bump
    )]
    pub trusted_issuers_registry: Account<'info, TrustedIssuersRegistry>,
}

pub fn remove_trusted_issuer(ctx: Context<RemoveTrustedIssuer>, issuer: Pubkey) -> Result<()> {
    let trusted_issuers = &mut ctx.accounts.trusted_issuers_registry;

    // Validate input
    validate_pubkey(&issuer)?;

    // Remove the trusted issuer
    trusted_issuers.remove_issuer(issuer)?;

    emit!(TrustedIssuerRemoved {
        trusted_issuer: issuer,
    });

    msg!("Trusted issuer removed: {}", issuer);

    Ok(())
}

/// Set address frozen status
#[derive(Accounts)]
#[instruction(user: Pubkey, frozen: bool)]
pub struct SetAddressFrozen<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Agent performing the operation
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

    /// Frozen account info
    #[account(
        init_if_needed,
        payer = payer,
        space = FrozenAccount::LEN,
        seeds = [b"frozen", mint.key().as_ref(), user.as_ref()],
        bump
    )]
    pub frozen_account: Account<'info, FrozenAccount>,

    /// System program
    pub system_program: Program<'info, System>,
}

pub fn set_address_frozen(
    ctx: Context<SetAddressFrozen>,
    user: Pubkey,
    frozen: bool,
) -> Result<()> {
    let frozen_account = &mut ctx.accounts.frozen_account;
    let agent = &ctx.accounts.agent;
    let mint = &ctx.accounts.mint;

    // Initialize if needed
    if frozen_account.user == Pubkey::default() {
        frozen_account.user = user;
        frozen_account.mint = mint.key();
        frozen_account.is_frozen = false;
        frozen_account.frozen_amount = 0;
        frozen_account.frozen_at = 0;
        frozen_account.frozen_by = Pubkey::default();
        frozen_account.reserved = [0; 64];
    }

    // Set frozen status
    frozen_account.set_frozen(frozen, agent.key())?;

    emit!(AddressFrozen {
        user_address: user,
        is_frozen: frozen,
        agent: agent.key(),
    });

    msg!("Address {} frozen status set to: {}", user, frozen);
    msg!("Set by agent: {}", agent.key());

    Ok(())
}

/// Freeze partial tokens
#[derive(Accounts)]
#[instruction(user: Pubkey, amount: u64)]
pub struct FreezePartialTokens<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Agent performing the operation
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

    /// Frozen account info
    #[account(
        init_if_needed,
        payer = payer,
        space = FrozenAccount::LEN,
        seeds = [b"frozen", mint.key().as_ref(), user.as_ref()],
        bump
    )]
    pub frozen_account: Account<'info, FrozenAccount>,

    /// System program
    pub system_program: Program<'info, System>,
}

pub fn freeze_partial_tokens(
    ctx: Context<FreezePartialTokens>,
    user: Pubkey,
    amount: u64,
) -> Result<()> {
    let frozen_account = &mut ctx.accounts.frozen_account;
    let agent = &ctx.accounts.agent;
    let mint = &ctx.accounts.mint;

    // Validate amount
    validate_amount(amount)?;

    // Initialize if needed
    if frozen_account.user == Pubkey::default() {
        frozen_account.user = user;
        frozen_account.mint = mint.key();
        frozen_account.is_frozen = false;
        frozen_account.frozen_amount = 0;
        frozen_account.frozen_at = 0;
        frozen_account.frozen_by = Pubkey::default();
        frozen_account.reserved = [0; 64];
    }

    // Freeze tokens
    frozen_account.freeze_tokens(amount, agent.key())?;

    emit!(TokensFrozen {
        user_address: user,
        amount,
    });

    msg!("Frozen {} tokens for address: {}", amount, user);
    msg!("Total frozen tokens: {}", frozen_account.frozen_amount);
    msg!("Frozen by agent: {}", agent.key());

    Ok(())
}

/// Unfreeze partial tokens
#[derive(Accounts)]
#[instruction(user: Pubkey, amount: u64)]
pub struct UnfreezePartialTokens<'info> {
    /// Agent performing the operation
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

    /// Frozen account info
    #[account(
        mut,
        seeds = [b"frozen", mint.key().as_ref(), user.as_ref()],
        bump
    )]
    pub frozen_account: Account<'info, FrozenAccount>,
}

pub fn unfreeze_partial_tokens(
    ctx: Context<UnfreezePartialTokens>,
    user: Pubkey,
    amount: u64,
) -> Result<()> {
    let frozen_account = &mut ctx.accounts.frozen_account;
    let agent = &ctx.accounts.agent;

    // Validate amount
    validate_amount(amount)?;

    // Unfreeze tokens
    frozen_account.unfreeze_tokens(amount, agent.key())?;

    emit!(TokensUnfrozen {
        user_address: user,
        amount,
    });

    msg!("Unfrozen {} tokens for address: {}", amount, user);
    msg!("Remaining frozen tokens: {}", frozen_account.frozen_amount);
    msg!("Unfrozen by agent: {}", agent.key());

    Ok(())
}

/// Set pause status
#[derive(Accounts)]
pub struct SetPauseStatus<'info> {
    /// Agent performing the operation
    #[account(mut)]
    pub agent: Signer<'info>,

    /// Token configuration
    #[account(
        mut,
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        constraint = config.has_agent_or_owner_role(&agent.key()) @ ERC3643Error::AgentRoleRequired
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,
}

pub fn set_pause_status(ctx: Context<SetPauseStatus>, paused: bool) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let agent = &ctx.accounts.agent;

    // Set pause status
    config.set_paused(paused)?;

    if paused {
        emit!(Paused {
            user_address: agent.key(),
        });
        msg!("Token paused by: {}", agent.key());
    } else {
        emit!(Unpaused {
            user_address: agent.key(),
        });
        msg!("Token unpaused by: {}", agent.key());
    }

    Ok(())
}

/// Add required claim topic
#[derive(Accounts)]
pub struct AddClaimTopic<'info> {
    /// Owner performing the operation
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        has_one = owner @ ERC3643Error::OwnerRoleRequired
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// Claim topics registry
    #[account(
        mut,
        seeds = [CLAIM_TOPICS_SEED, mint.key().as_ref()],
        bump
    )]
    pub claim_topics_registry: Account<'info, ClaimTopicsRegistry>,
}

pub fn add_claim_topic(ctx: Context<AddClaimTopic>, topic: u64) -> Result<()> {
    let claim_topics = &mut ctx.accounts.claim_topics_registry;

    // Add the claim topic
    claim_topics.add_topic(topic)?;

    emit!(ClaimTopicAdded {
        claim_topic: topic,
    });

    msg!("Claim topic added: {}", topic);

    Ok(())
}

/// Remove required claim topic
#[derive(Accounts)]
pub struct RemoveClaimTopic<'info> {
    /// Owner performing the operation
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        has_one = owner @ ERC3643Error::OwnerRoleRequired
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// Claim topics registry
    #[account(
        mut,
        seeds = [CLAIM_TOPICS_SEED, mint.key().as_ref()],
        bump
    )]
    pub claim_topics_registry: Account<'info, ClaimTopicsRegistry>,
}

pub fn remove_claim_topic(ctx: Context<RemoveClaimTopic>, topic: u64) -> Result<()> {
    let claim_topics = &mut ctx.accounts.claim_topics_registry;

    // Remove the claim topic
    claim_topics.remove_topic(topic)?;

    emit!(ClaimTopicRemoved {
        claim_topic: topic,
    });

    msg!("Claim topic removed: {}", topic);

    Ok(())
}

/// Add agent
#[derive(Accounts)]
pub struct AddAgent<'info> {
    /// Owner performing the operation
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Token configuration
    #[account(
        mut,
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        has_one = owner @ ERC3643Error::OwnerRoleRequired
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,
}

pub fn add_agent(ctx: Context<AddAgent>, agent: Pubkey) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let owner = &ctx.accounts.owner;

    // Validate input
    validate_pubkey(&agent)?;

    // Add the agent
    config.add_agent(agent)?;

    emit!(AgentAdded {
        agent,
        added_by: owner.key(),
    });

    msg!("Agent added: {}", agent);
    msg!("Added by owner: {}", owner.key());

    Ok(())
}

/// Remove agent
#[derive(Accounts)]
pub struct RemoveAgent<'info> {
    /// Owner performing the operation
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Token configuration
    #[account(
        mut,
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        has_one = owner @ ERC3643Error::OwnerRoleRequired
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,
}

pub fn remove_agent(ctx: Context<RemoveAgent>, agent: Pubkey) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let owner = &ctx.accounts.owner;

    // Validate input
    validate_pubkey(&agent)?;

    // Remove the agent
    config.remove_agent(agent)?;

    emit!(AgentRemoved {
        agent,
        removed_by: owner.key(),
    });

    msg!("Agent removed: {}", agent);
    msg!("Removed by owner: {}", owner.key());

    Ok(())
}

/// Transfer ownership
#[derive(Accounts)]
pub struct TransferOwnership<'info> {
    /// Current owner
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Token configuration
    #[account(
        mut,
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        has_one = owner @ ERC3643Error::OwnerRoleRequired
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,
}

pub fn transfer_ownership(ctx: Context<TransferOwnership>, new_owner: Pubkey) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let current_owner = &ctx.accounts.owner;

    // Validate input
    validate_pubkey(&new_owner)?;
    require!(new_owner != current_owner.key(), ERC3643Error::InvalidArgument);

    let previous_owner = config.owner;
    config.owner = new_owner;
    config.updated_at = Clock::get()?.unix_timestamp;

    emit!(OwnershipTransferred {
        previous_owner,
        new_owner,
    });

    msg!("Ownership transferred from {} to {}", previous_owner, new_owner);

    Ok(())
}
