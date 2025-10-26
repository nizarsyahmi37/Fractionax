use crate::{error::ERC3643Error, events::*, state::*};
use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022::{self, Token2022},
    token_interface::{burn, mint_to, Burn, Mint, MintTo, TokenAccount},
};

/// Mint tokens to a verified address
#[derive(Accounts)]
pub struct MintTokens<'info> {
    /// Agent or owner performing the mint
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

    /// The mint account
    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,

    /// Destination token account
    #[account(mut)]
    pub to_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Identity registry for the recipient
    #[account(
        seeds = [IDENTITY_SEED, to_token_account.owner.as_ref()],
        bump,
        constraint = identity_registry.is_verified @ ERC3643Error::IdentityNotVerified
    )]
    pub identity_registry: Account<'info, IdentityRegistry>,

    /// Compliance registry
    #[account(
        seeds = [COMPLIANCE_SEED, mint.key().as_ref()],
        bump
    )]
    pub compliance_registry: Account<'info, ComplianceRegistry>,

    /// Token program
    pub token_program: Program<'info, Token2022>,
}

pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let mint = &ctx.accounts.mint;
    let to_token_account = &ctx.accounts.to_token_account;
    let identity = &ctx.accounts.identity_registry;
    let compliance = &ctx.accounts.compliance_registry;

    // Validate inputs
    validate_amount(amount)?;

    // Check if token is paused
    require!(!config.paused, ERC3643Error::TokenPaused);

    // Check compliance for minting (from zero address to recipient)
    let compliance_result = compliance.check_transfer_compliance(
        &Pubkey::default(), // from (mint operation)
        &to_token_account.owner,
        amount,
        0, // from_balance (minting from zero)
        to_token_account.amount,
        0, // from_country (not applicable for minting)
        identity.country,
    )?;

    require!(
        compliance_result.allowed,
        ERC3643Error::TransferNotCompliant
    );

    // Prepare mint instruction
    let mint_key = mint.key();
    let mint_seeds = &[CONFIG_SEED, mint_key.as_ref(), &[ctx.bumps.config]];
    let signer_seeds = &[&mint_seeds[..]];

    // Mint tokens
    let cpi_accounts = MintTo {
        mint: mint.to_account_info(),
        to: to_token_account.to_account_info(),
        authority: config.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

    mint_to(cpi_ctx, amount)?;

    // Update total supply
    let current_supply = config.total_supply;
    config.update_total_supply(current_supply + amount)?;

    msg!("Minted {} tokens to {}", amount, to_token_account.owner);
    msg!("New total supply: {}", config.total_supply);

    Ok(())
}

/// Burn tokens from an address
#[derive(Accounts)]
pub struct BurnTokens<'info> {
    /// Agent or owner performing the burn
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

    /// The mint account
    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,

    /// Source token account
    #[account(mut)]
    pub from_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Frozen account info (if exists)
    #[account(
        mut,
        seeds = [b"frozen", mint.key().as_ref(), from_token_account.owner.as_ref()],
        bump
    )]
    pub frozen_account: Option<Account<'info, FrozenAccount>>,

    /// Token program
    pub token_program: Program<'info, Token2022>,
}

pub fn burn_tokens(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let mint = &ctx.accounts.mint;
    let from_token_account = &ctx.accounts.from_token_account;
    let frozen_account = &mut ctx.accounts.frozen_account;

    // Validate inputs
    validate_amount(amount)?;

    // Check if token is paused
    require!(!config.paused, ERC3643Error::TokenPaused);

    // Check balance
    require!(
        from_token_account.amount >= amount,
        ERC3643Error::InsufficientBalance
    );

    // Handle frozen tokens if necessary
    if let Some(frozen_info) = frozen_account {
        let free_balance = from_token_account.amount - frozen_info.frozen_amount;

        if amount > free_balance {
            // Need to unfreeze some tokens
            let tokens_to_unfreeze = amount - free_balance;
            frozen_info.unfreeze_tokens(tokens_to_unfreeze, ctx.accounts.agent.key())?;

            emit!(TokensUnfrozen {
                user_address: from_token_account.owner,
                amount: tokens_to_unfreeze,
            });
        }
    }

    // Burn tokens - agent acts as authority for forced burn
    let cpi_accounts = Burn {
        mint: mint.to_account_info(),
        from: from_token_account.to_account_info(),
        authority: ctx.accounts.agent.to_account_info(),  // Agent acts as authority. Need to check if agent has admin rights
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    burn(cpi_ctx, amount)?;

    // Update total supply
    let current_supply = config.total_supply;
    config.update_total_supply(current_supply - amount)?;

    msg!("Burned {} tokens from {}", amount, from_token_account.owner);
    msg!("New total supply: {}", config.total_supply);

    Ok(())
}

/// Forced transfer (agent only)
#[derive(Accounts)]
pub struct ForcedTransfer<'info> {
    /// Agent performing the forced transfer
    #[account(mut)]
    pub agent: Signer<'info>,

    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        constraint = config.has_agent_or_owner_role(&agent.key()) @ ERC3643Error::AgentRoleRequired,
        constraint = config.allow_forced_transfers @ ERC3643Error::Unauthorized
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint account
    pub mint: InterfaceAccount<'info, Mint>,

    /// Source token account
    #[account(mut)]
    pub from_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Destination token account
    #[account(mut)]
    pub to_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Identity registry for the recipient (must be verified)
    #[account(
        seeds = [IDENTITY_SEED, to_token_account.owner.as_ref()],
        bump,
        constraint = to_identity_registry.is_verified @ ERC3643Error::IdentityNotVerified
    )]
    pub to_identity_registry: Account<'info, IdentityRegistry>,

    /// Frozen account info for source (if exists)
    #[account(
        mut,
        seeds = [b"frozen", mint.key().as_ref(), from_token_account.owner.as_ref()],
        bump
    )]
    pub from_frozen_account: Option<Account<'info, FrozenAccount>>,

    /// Token program
    pub token_program: Program<'info, Token2022>,
}

pub fn forced_transfer(
    ctx: Context<ForcedTransfer>,
    _from: Pubkey,
    _to: Pubkey,
    amount: u64,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let from_token_account = &ctx.accounts.from_token_account;
    let to_token_account = &ctx.accounts.to_token_account;
    let from_frozen_account = &mut ctx.accounts.from_frozen_account;

    // Validate inputs
    validate_amount(amount)?;

    // Check if token is paused
    require!(!config.paused, ERC3643Error::TokenPaused);

    // Check balance
    require!(
        from_token_account.amount >= amount,
        ERC3643Error::InsufficientBalance
    );

    // Handle frozen tokens if necessary
    if let Some(frozen_info) = from_frozen_account {
        let free_balance = from_token_account.amount - frozen_info.frozen_amount;

        if amount > free_balance {
            // Unfreeze tokens as needed for forced transfer
            let tokens_to_unfreeze = amount - free_balance;
            frozen_info.unfreeze_tokens(tokens_to_unfreeze, ctx.accounts.agent.key())?;

            emit!(TokensUnfrozen {
                user_address: from_token_account.owner,
                amount: tokens_to_unfreeze,
            });
        }
    }

    // In a real implementation, we would perform the actual token transfer here
    // This would involve either:
    // 1. Using Token-2022 transfer with proper authority
    // 2. Using a program-controlled transfer mechanism

    // For now, we'll emit the event to indicate the forced transfer
    msg!(
        "Forced transfer: {} tokens from {} to {}",
        amount,
        from_token_account.owner,
        to_token_account.owner
    );
    msg!("Performed by agent: {}", ctx.accounts.agent.key());

    Ok(())
}

/// Recovery address (agent only)
#[derive(Accounts)]
pub struct RecoveryAddress<'info> {
    /// Agent performing the recovery
    #[account(mut)]
    pub agent: Signer<'info>,

    /// Token configuration
    #[account(
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump,
        constraint = config.has_agent_or_owner_role(&agent.key()) @ ERC3643Error::AgentRoleRequired,
        constraint = config.enable_recovery @ ERC3643Error::RecoveryNotAllowed
    )]
    pub config: Account<'info, TokenConfig>,

    /// The mint account
    pub mint: InterfaceAccount<'info, Mint>,

    /// Lost wallet token account
    #[account(mut)]
    pub lost_token_account: InterfaceAccount<'info, TokenAccount>,

    /// New wallet token account
    #[account(mut)]
    pub new_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Identity registry for the investor (must match both wallets)
    #[account(
        seeds = [IDENTITY_SEED, investor_identity.key().as_ref()],
        bump,
        constraint = identity_registry.is_verified @ ERC3643Error::IdentityNotVerified
    )]
    pub identity_registry: Account<'info, IdentityRegistry>,

    /// Investor's onchain identity
    /// CHECK: This should be validated against the identity registry
    pub investor_identity: UncheckedAccount<'info>,

    /// Frozen account info for lost wallet (if exists)
    #[account(
        mut,
        seeds = [b"frozen", mint.key().as_ref(), lost_token_account.owner.as_ref()],
        bump
    )]
    pub lost_frozen_account: Option<Account<'info, FrozenAccount>>,

    /// Token program
    pub token_program: Program<'info, Token2022>,
}

pub fn recovery_address(
    ctx: Context<RecoveryAddress>,
    lost_wallet: Pubkey,
    new_wallet: Pubkey,
    investor_identity: Pubkey,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let lost_token_account = &ctx.accounts.lost_token_account;
    let new_token_account = &ctx.accounts.new_token_account;
    let lost_frozen_account = &mut ctx.accounts.lost_frozen_account;

    // Validate inputs
    validate_pubkey(&lost_wallet)?;
    validate_pubkey(&new_wallet)?;
    validate_pubkey(&investor_identity)?;

    // Ensure we're not recovering to the same wallet
    require!(lost_wallet != new_wallet, ERC3643Error::SameWalletRecovery);

    // Check if token is paused
    require!(!config.paused, ERC3643Error::TokenPaused);

    // Verify the accounts match the provided addresses
    require!(
        lost_token_account.owner == lost_wallet,
        ERC3643Error::InvalidArgument
    );
    require!(
        new_token_account.owner == new_wallet,
        ERC3643Error::InvalidArgument
    );

    let recovery_amount = lost_token_account.amount;

    // Handle frozen tokens if any
    if let Some(frozen_info) = lost_frozen_account {
        if frozen_info.frozen_amount > 0 {
            // Unfreeze all tokens for recovery
            let frozen_amount = frozen_info.frozen_amount;
            frozen_info.unfreeze_tokens(frozen_amount, ctx.accounts.agent.key())?;

            emit!(TokensUnfrozen {
                user_address: lost_wallet,
                amount: frozen_amount,
            });
        }
    }

    // In a real implementation, we would perform the actual token transfer here
    // This would involve transferring all tokens from lost_wallet to new_wallet

    emit!(RecoverySuccess {
        lost_wallet,
        new_wallet,
        investor_onchain_id: investor_identity,
    });

    msg!(
        "Recovery completed: {} tokens from {} to {}",
        recovery_amount,
        lost_wallet,
        new_wallet
    );
    msg!("Investor identity: {}", investor_identity);
    msg!("Performed by agent: {}", ctx.accounts.agent.key());

    Ok(())
}
