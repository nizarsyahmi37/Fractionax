use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022::{self, Token2022},
    token_interface::{Mint, TokenAccount},
};
use crate::{
    error::ERC3643Error,
    events::*,
    state::*,
};

/// Initialize the ERC-3643 token with compliance and identity registry
#[derive(Accounts)]
#[instruction(name: String, symbol: String, decimals: u8)]
pub struct InitializeToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The owner/authority of the token
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The mint account to be created
    #[account(
        init,
        payer = payer,
        mint::decimals = decimals,
        mint::authority = config,
        mint::freeze_authority = config,
        mint::token_program = token_program,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    /// Token configuration PDA
    #[account(
        init,
        payer = payer,
        space = TokenConfig::LEN,
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump
    )]
    pub config: Account<'info, TokenConfig>,

    /// Identity registry PDA (will be initialized later per user)
    /// CHECK: This is a PDA that will be used for identity registry
    #[account(
        seeds = [b"identity_registry", mint.key().as_ref()],
        bump
    )]
    pub identity_registry: UncheckedAccount<'info>,

    /// Trusted issuers registry PDA
    #[account(
        init,
        payer = payer,
        space = TrustedIssuersRegistry::LEN,
        seeds = [TRUSTED_ISSUERS_SEED, mint.key().as_ref()],
        bump
    )]
    pub trusted_issuers_registry: Account<'info, TrustedIssuersRegistry>,

    /// Claim topics registry PDA
    #[account(
        init,
        payer = payer,
        space = ClaimTopicsRegistry::LEN,
        seeds = [CLAIM_TOPICS_SEED, mint.key().as_ref()],
        bump
    )]
    pub claim_topics_registry: Account<'info, ClaimTopicsRegistry>,

    /// Compliance registry PDA
    #[account(
        init,
        payer = payer,
        space = ComplianceRegistry::LEN,
        seeds = [COMPLIANCE_SEED, mint.key().as_ref()],
        bump
    )]
    pub compliance_registry: Account<'info, ComplianceRegistry>,

    /// Token program (Token-2022)
    pub token_program: Program<'info, Token2022>,
    
    /// System program
    pub system_program: Program<'info, System>,
    
    /// Rent sysvar
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializeToken>,
    name: String,
    symbol: String,
    decimals: u8,
    initial_supply: Option<u64>,
) -> Result<()> {
    let mint = &ctx.accounts.mint;
    let config = &mut ctx.accounts.config;
    let trusted_issuers = &mut ctx.accounts.trusted_issuers_registry;
    let claim_topics = &mut ctx.accounts.claim_topics_registry;
    let compliance = &mut ctx.accounts.compliance_registry;
    let owner = &ctx.accounts.owner;

    // Validate inputs
    validate_string_length(&name, MAX_NAME_LENGTH, ERC3643Error::NameTooLong)?;
    validate_string_length(&symbol, MAX_SYMBOL_LENGTH, ERC3643Error::SymbolTooLong)?;
    validate_decimals(decimals)?;

    let now = Clock::get()?.unix_timestamp;

    // Initialize token configuration
    config.mint = mint.key();
    config.name = name.clone();
    config.symbol = symbol.clone();
    config.decimals = decimals;
    config.version = TOKEN_VERSION.to_string();
    config.onchain_id = Pubkey::default(); // Can be set later
    config.owner = owner.key();
    config.agents = Vec::new();
    config.transfer_hook_program = None; // Will be set when transfer hook is configured
    config.enforcement_mode = EnforcementMode::ProgramControlled; // Start with fallback mode
    config.paused = true; // Start paused for safety
    config.total_supply = 0;
    config.require_identity_verification = true;
    config.allow_forced_transfers = true;
    config.enable_recovery = true;
    config.max_holders = None;
    config.min_holding = None;
    config.max_holding = None;
    config.created_at = now;
    config.updated_at = now;
    config.reserved = [0; 128];

    // Initialize trusted issuers registry
    trusted_issuers.mint = mint.key();
    trusted_issuers.issuers = Vec::new();
    trusted_issuers.created_at = now;
    trusted_issuers.updated_at = now;
    trusted_issuers.reserved = [0; 64];

    // Initialize claim topics registry
    claim_topics.mint = mint.key();
    claim_topics.required_topics = Vec::new();
    claim_topics.created_at = now;
    claim_topics.updated_at = now;
    claim_topics.reserved = [0; 64];

    // Initialize compliance registry
    compliance.mint = mint.key();
    compliance.modules = Vec::new();
    compliance.country_restrictions = Vec::new();
    compliance.transfer_limits = TransferLimits {
        min_transfer_amount: None,
        max_transfer_amount: None,
        daily_limit: None,
        monthly_limit: None,
        reset_period: 86400, // 24 hours
    };
    compliance.holding_limits = HoldingLimits {
        min_holding_amount: None,
        max_holding_amount: None,
        max_holding_percentage: None,
    };
    compliance.lock_periods = Vec::new();
    compliance.trading_windows = Vec::new();
    compliance.max_investors = None;
    compliance.current_investors = 0;
    compliance.require_whitelist = false;
    compliance.enable_blacklist = false;
    compliance.require_kyc = true;
    compliance.require_aml = true;
    compliance.created_at = now;
    compliance.updated_at = now;
    compliance.reserved = [0; 64];

    // Mint initial supply if specified
    if let Some(supply) = initial_supply {
        validate_amount(supply)?;
        
        // For initial supply, we'll mint to the owner
        // In a real implementation, this would require the owner to be verified first
        config.total_supply = supply;
        
        // Note: Actual minting would be done through a separate mint instruction
        // after proper identity verification is set up
    }

    // Emit events
    emit!(UpdatedTokenInformation {
        name: name.clone(),
        symbol: symbol.clone(),
        decimals,
        version: TOKEN_VERSION.to_string(),
        onchain_id: config.onchain_id,
    });

    emit!(IdentityRegistryAdded {
        identity_registry: ctx.accounts.identity_registry.key(),
    });

    emit!(ComplianceAdded {
        compliance: compliance.key(),
    });

    msg!("ERC-3643 token initialized: {} ({})", name, symbol);
    msg!("Mint: {}", mint.key());
    msg!("Owner: {}", owner.key());
    msg!("Token is paused - use unpause instruction to enable transfers");

    Ok(())
}

/// Set transfer hook program for Token-2022 enforcement
#[derive(Accounts)]
pub struct SetTransferHook<'info> {
    /// Token owner
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Token configuration
    #[account(
        mut,
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        has_one = owner @ ERC3643Error::Unauthorized
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint account
    pub mint: InterfaceAccount<'info, Mint>,

    /// Transfer hook program
    /// CHECK: This will be validated as a proper transfer hook program
    pub transfer_hook_program: UncheckedAccount<'info>,

    /// Token program
    pub token_program: Program<'info, Token2022>,
}

pub fn set_transfer_hook(ctx: Context<SetTransferHook>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let hook_program = ctx.accounts.transfer_hook_program.key();

    // Update configuration
    config.transfer_hook_program = Some(hook_program);
    config.enforcement_mode = EnforcementMode::TransferHook;
    config.updated_at = Clock::get()?.unix_timestamp;

    // In a real implementation, we would configure the Token-2022 mint
    // to use the transfer hook extension here
    // This requires calling the appropriate Token-2022 instructions

    emit!(TransferHookConfigured {
        mint: config.mint,
        hook_program,
    });

    msg!("Transfer hook configured: {}", hook_program);

    Ok(())
}

/// Toggle enforcement mode between transfer hook and program controlled
#[derive(Accounts)]
pub struct SetEnforcementMode<'info> {
    /// Token owner
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Token configuration
    #[account(
        mut,
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        has_one = owner @ ERC3643Error::Unauthorized
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint account
    pub mint: InterfaceAccount<'info, Mint>,
}

pub fn set_enforcement_mode(
    ctx: Context<SetEnforcementMode>,
    mode: EnforcementMode,
) -> Result<()> {
    let config = &mut ctx.accounts.config;

    // Validate mode is supported
    match mode {
        EnforcementMode::TransferHook | EnforcementMode::Hybrid => {
            require!(
                config.transfer_hook_program.is_some(),
                ERC3643Error::TransferHookNotConfigured
            );
        }
        EnforcementMode::ProgramControlled => {
            // Always supported
        }
    }

    config.enforcement_mode = mode.clone();
    config.updated_at = Clock::get()?.unix_timestamp;

    let enabled = matches!(mode, EnforcementMode::ProgramControlled);
    emit!(FallbackModeToggled {
        enabled,
        changed_by: ctx.accounts.owner.key(),
    });

    msg!("Enforcement mode set to: {:?}", mode);

    Ok(())
}
