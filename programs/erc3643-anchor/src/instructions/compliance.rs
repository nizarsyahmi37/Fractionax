use anchor_lang::prelude::*;
use crate::{
    error::ERC3643Error,
    events::*,
    state::*,
};

/// Check if transfer is allowed (read-only)
#[derive(Accounts)]
pub struct CheckTransferAllowed<'info> {
    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint account
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// From identity registry (optional for minting)
    #[account(
        seeds = [IDENTITY_SEED, from_identity.key().as_ref()],
        bump
    )]
    pub from_identity_registry: Option<Account<'info, IdentityRegistry>>,

    /// To identity registry
    #[account(
        seeds = [IDENTITY_SEED, to_identity.key().as_ref()],
        bump,
        constraint = to_identity_registry.is_verified @ ERC3643Error::IdentityNotVerified
    )]
    pub to_identity_registry: Account<'info, IdentityRegistry>,

    /// Compliance registry
    #[account(
        seeds = [COMPLIANCE_SEED, mint.key().as_ref()],
        bump
    )]
    pub compliance_registry: Account<'info, ComplianceRegistry>,

    /// Claim topics registry
    #[account(
        seeds = [CLAIM_TOPICS_SEED, mint.key().as_ref()],
        bump
    )]
    pub claim_topics_registry: Account<'info, ClaimTopicsRegistry>,

    /// From identity (for PDA derivation)
    /// CHECK: Used for PDA derivation only
    pub from_identity: UncheckedAccount<'info>,

    /// To identity (for PDA derivation)
    /// CHECK: Used for PDA derivation only
    pub to_identity: UncheckedAccount<'info>,

    /// From frozen account (if exists)
    #[account(
        seeds = [b"frozen", mint.key().as_ref(), from_identity.key().as_ref()],
        bump
    )]
    pub from_frozen_account: Option<Account<'info, FrozenAccount>>,

    /// To frozen account (if exists)
    #[account(
        seeds = [b"frozen", mint.key().as_ref(), to_identity.key().as_ref()],
        bump
    )]
    pub to_frozen_account: Option<Account<'info, FrozenAccount>>,
}

pub fn check_transfer_allowed(
    ctx: Context<CheckTransferAllowed>,
    from: Pubkey,
    to: Pubkey,
    amount: u64,
) -> Result<bool> {
    let config = &ctx.accounts.config;
    let compliance = &ctx.accounts.compliance_registry;
    let to_identity = &ctx.accounts.to_identity_registry;
    let from_identity = ctx.accounts.from_identity_registry.as_ref();
    let from_frozen = ctx.accounts.from_frozen_account.as_ref();
    let to_frozen = ctx.accounts.to_frozen_account.as_ref();

    // Check if token is paused
    if config.paused {
        emit!(TransferValidated {
            from,
            to,
            amount,
            allowed: false,
            reason: "Token is paused".to_string(),
        });
        return Ok(false);
    }

    // Check if addresses are frozen
    if let Some(from_frozen_info) = from_frozen {
        if from_frozen_info.is_address_frozen() {
            emit!(TransferValidated {
                from,
                to,
                amount,
                allowed: false,
                reason: "From address is frozen".to_string(),
            });
            return Ok(false);
        }
    }

    if let Some(to_frozen_info) = to_frozen {
        if to_frozen_info.is_address_frozen() {
            emit!(TransferValidated {
                from,
                to,
                amount,
                allowed: false,
                reason: "To address is frozen".to_string(),
            });
            return Ok(false);
        }
    }

    // Check identity verification for recipient
    if !to_identity.is_verified {
        emit!(TransferValidated {
            from,
            to,
            amount,
            allowed: false,
            reason: "Recipient identity not verified".to_string(),
        });
        return Ok(false);
    }

    // Check identity verification for sender (if not minting)
    if from != Pubkey::default() {
        if let Some(from_identity_info) = from_identity {
            if !from_identity_info.is_verified {
                emit!(TransferValidated {
                    from,
                    to,
                    amount,
                    allowed: false,
                    reason: "Sender identity not verified".to_string(),
                });
                return Ok(false);
            }
        } else {
            emit!(TransferValidated {
                from,
                to,
                amount,
                allowed: false,
                reason: "Sender identity not found".to_string(),
            });
            return Ok(false);
        }
    }

    // Get country codes for compliance check
    let from_country = if let Some(from_identity_info) = from_identity {
        from_identity_info.country
    } else {
        0 // Default for minting operations
    };
    let to_country = to_identity.country;

    // Simulate token balances (in real implementation, these would be fetched from token accounts)
    let from_balance = 1000; // Placeholder
    let to_balance = 500;    // Placeholder

    // Check compliance
    let compliance_result = compliance.check_transfer_compliance(
        &from,
        &to,
        amount,
        from_balance,
        to_balance,
        from_country,
        to_country,
    )?;

    emit!(TransferValidated {
        from,
        to,
        amount,
        allowed: compliance_result.allowed,
        reason: compliance_result.reason.clone(),
    });

    emit!(ComplianceCheck {
        from,
        to,
        amount,
        result: compliance_result.allowed,
        module: compliance_result.module,
    });

    Ok(compliance_result.allowed)
}

/// Check if address is verified (read-only)
#[derive(Accounts)]
pub struct CheckVerification<'info> {
    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint account
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// Identity registry
    #[account(
        seeds = [IDENTITY_SEED, user.key().as_ref()],
        bump
    )]
    pub identity_registry: Account<'info, IdentityRegistry>,

    /// Claim topics registry
    #[account(
        seeds = [CLAIM_TOPICS_SEED, mint.key().as_ref()],
        bump
    )]
    pub claim_topics_registry: Account<'info, ClaimTopicsRegistry>,

    /// Trusted issuers registry
    #[account(
        seeds = [TRUSTED_ISSUERS_SEED, mint.key().as_ref()],
        bump
    )]
    pub trusted_issuers_registry: Account<'info, TrustedIssuersRegistry>,

    /// User identity (for PDA derivation)
    /// CHECK: Used for PDA derivation only
    pub user: UncheckedAccount<'info>,
}

pub fn check_verification(ctx: Context<CheckVerification>, user: Pubkey) -> Result<bool> {
    let identity = &ctx.accounts.identity_registry;
    let claim_topics = &ctx.accounts.claim_topics_registry;
    let trusted_issuers = &ctx.accounts.trusted_issuers_registry;

    // Basic verification check
    if !identity.is_verified {
        return Ok(false);
    }

    // Check if required claims are met
    if !identity.required_claims_met {
        return Ok(false);
    }

    // Get required topics
    let required_topics = claim_topics.get_required_topics();
    
    // If no topics are required, verification is based on basic identity status
    if required_topics.is_empty() {
        return Ok(identity.is_verified);
    }

    // In a full implementation, we would:
    // 1. Fetch all claims for this identity
    // 2. Verify each claim's signature and validity
    // 3. Check that trusted issuers issued the claims
    // 4. Ensure all required topics are covered by valid claims

    // For now, we'll use the cached verification status
    let verification_result = identity.is_valid_for_transfer();

    msg!("Verification check for {}: {}", user, verification_result);
    msg!("Required claims met: {}", identity.required_claims_met);
    msg!("Claims count: {}", identity.claims_count);

    Ok(verification_result)
}

/// Validate a specific claim
#[derive(Accounts)]
pub struct ValidateClaim<'info> {
    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint account
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// The claim to validate
    #[account(
        seeds = [CLAIM_SEED, claim.identity.as_ref(), claim.issuer.as_ref(), &claim.topic.to_le_bytes()],
        bump
    )]
    pub claim: Account<'info, Claim>,

    /// Trusted issuers registry
    #[account(
        seeds = [TRUSTED_ISSUERS_SEED, mint.key().as_ref()],
        bump
    )]
    pub trusted_issuers_registry: Account<'info, TrustedIssuersRegistry>,
}

pub fn validate_claim(ctx: Context<ValidateClaim>) -> Result<ClaimVerificationResult> {
    let claim = &ctx.accounts.claim;
    let trusted_issuers = &ctx.accounts.trusted_issuers_registry;

    // Check if issuer is trusted for this claim topic
    let issuer_trusted = trusted_issuers.is_trusted_for_topic(&claim.issuer, claim.topic);

    // Create verification result
    let result = ClaimVerificationResult::new(claim, issuer_trusted)?;

    msg!("Claim validation result:");
    msg!("  Claim ID: {:?}", result.claim_id);
    msg!("  Valid: {}", result.is_valid);
    msg!("  Expired: {}", result.is_expired);
    msg!("  Revoked: {}", result.is_revoked);
    msg!("  Issuer trusted: {}", result.issuer_trusted);
    msg!("  Signature valid: {}", result.signature_valid);

    Ok(result)
}

/// Perform comprehensive identity verification
#[derive(Accounts)]
pub struct VerifyIdentity<'info> {
    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint account
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// Identity registry to verify
    #[account(
        mut,
        seeds = [IDENTITY_SEED, identity_registry.user.as_ref()],
        bump
    )]
    pub identity_registry: Account<'info, IdentityRegistry>,

    /// Claim topics registry
    #[account(
        seeds = [CLAIM_TOPICS_SEED, mint.key().as_ref()],
        bump
    )]
    pub claim_topics_registry: Account<'info, ClaimTopicsRegistry>,

    /// Trusted issuers registry
    #[account(
        seeds = [TRUSTED_ISSUERS_SEED, mint.key().as_ref()],
        bump
    )]
    pub trusted_issuers_registry: Account<'info, TrustedIssuersRegistry>,
}

pub fn verify_identity(ctx: Context<VerifyIdentity>) -> Result<IdentityVerificationResult> {
    let identity = &mut ctx.accounts.identity_registry;
    let claim_topics = &ctx.accounts.claim_topics_registry;
    let trusted_issuers = &ctx.accounts.trusted_issuers_registry;

    let mut result = IdentityVerificationResult::new(identity.user);
    let required_topics = claim_topics.get_required_topics();

    // In a full implementation, we would:
    // 1. Fetch all claims for this identity
    // 2. Validate each claim
    // 3. Check coverage of required topics
    // 4. Update verification status

    // For now, we'll simulate the verification process
    result.claims_checked = identity.claims_count;
    
    // Simulate checking required topics
    for topic in required_topics {
        // Check if we have valid claims for this topic
        let has_valid_claim = true; // Placeholder - would check actual claims
        
        if has_valid_claim {
            result.add_valid_claim(*topic);
        } else {
            result.add_missing_topic(*topic);
        }
    }

    // Finalize verification result
    result.finalize(required_topics);

    // Update identity registry
    identity.update_verification(result.is_verified)?;
    identity.update_required_claims_status(result.is_verified)?;

    msg!("Identity verification completed for: {}", identity.user);
    msg!("Verified: {}", result.is_verified);
    msg!("Claims checked: {}", result.claims_checked);
    msg!("Valid claims: {}", result.valid_claims);
    msg!("Missing topics: {:?}", result.missing_topics);

    Ok(result)
}
