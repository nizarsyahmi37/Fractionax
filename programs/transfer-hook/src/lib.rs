use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022::Token2022,
    token_interface::{Mint, TokenAccount},
};
use spl_transfer_hook_interface::{
    instruction::{ExecuteInstruction, TransferHookInstruction},
    get_extra_account_metas_address, get_extra_account_metas_address_and_bump_seed,
};
use spl_tlv_account_resolution::{
    account::ExtraAccountMeta, seeds::Seed, state::ExtraAccountMetaList,
};
use erc3643_anchor::{
    cpi::{accounts::CheckTransferAllowed, check_transfer_allowed},
    program::Erc3643Anchor,
    state::*,
};

declare_id!("5ovac8RUQzUoM8U3h3KfXG4EeRPzz9unoV5AotSHdD9o");

#[program]
pub mod transfer_hook {
    use super::*;

    /// Initialize extra account metas for the transfer hook
    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        // Define the extra accounts needed for compliance checking
        let account_metas = vec![
            // ERC3643 program
            ExtraAccountMeta::new_with_pubkey(&erc3643_anchor::ID, false, false)?,
            
            // Token config PDA
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal {
                        bytes: b"config".to_vec(),
                    },
                    Seed::AccountKey { index: 0 }, // mint
                ],
                false, // is_signer
                false, // is_writable
            )?,
            
            // From identity registry PDA (optional for minting)
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal {
                        bytes: b"identity".to_vec(),
                    },
                    Seed::AccountKey { index: 1 }, // from token account owner
                ],
                false, // is_signer
                false, // is_writable
            )?,
            
            // To identity registry PDA
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal {
                        bytes: b"identity".to_vec(),
                    },
                    Seed::AccountKey { index: 2 }, // to token account owner
                ],
                false, // is_signer
                false, // is_writable
            )?,
            
            // Compliance registry PDA
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal {
                        bytes: b"compliance".to_vec(),
                    },
                    Seed::AccountKey { index: 0 }, // mint
                ],
                false, // is_signer
                false, // is_writable
            )?,
            
            // Claim topics registry PDA
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal {
                        bytes: b"claim_topics".to_vec(),
                    },
                    Seed::AccountKey { index: 0 }, // mint
                ],
                false, // is_signer
                false, // is_writable
            )?,
            
            // From identity (for PDA derivation)
            ExtraAccountMeta::new_with_pubkey(&Pubkey::default(), false, false)?,
            
            // To identity (for PDA derivation)
            ExtraAccountMeta::new_with_pubkey(&Pubkey::default(), false, false)?,
            
            // From frozen account PDA (optional)
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal {
                        bytes: b"frozen".to_vec(),
                    },
                    Seed::AccountKey { index: 0 }, // mint
                    Seed::AccountKey { index: 1 }, // from token account owner
                ],
                false, // is_signer
                false, // is_writable
            )?,
            
            // To frozen account PDA (optional)
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal {
                        bytes: b"frozen".to_vec(),
                    },
                    Seed::AccountKey { index: 0 }, // mint
                    Seed::AccountKey { index: 2 }, // to token account owner
                ],
                false, // is_signer
                false, // is_writable
            )?,
        ];

        // Initialize the extra account meta list
        let account_size = ExtraAccountMetaList::size_of(account_metas.len())?;
        let lamports = Rent::get()?.minimum_balance(account_size);

        let mint = ctx.accounts.mint.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"extra-account-metas",
            &mint.as_ref(),
            &[ctx.bumps.extra_account_meta_list],
        ]];

        // Create the account
        anchor_lang::system_program::create_account(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::CreateAccount {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.extra_account_meta_list.to_account_info(),
                },
                signer_seeds,
            ),
            lamports,
            account_size as u64,
            &crate::ID,
        )?;

        // Initialize the account data
        ExtraAccountMetaList::init::<ExecuteInstruction>(
            &mut ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?,
            &account_metas,
        )?;

        Ok(())
    }

    /// Execute the transfer hook - this is called by Token-2022 on every transfer
    pub fn execute(ctx: Context<Execute>, amount: u64) -> Result<()> {
        let mint = &ctx.accounts.mint;
        let from_token_account = &ctx.accounts.source_token;
        let to_token_account = &ctx.accounts.destination_token;

        // Get the from and to addresses
        let from = from_token_account.owner;
        let to = to_token_account.owner;

        msg!("Transfer hook executing: {} tokens from {} to {}", amount, from, to);

        // Check if this is a mint operation (from is zero address equivalent)
        let is_mint = from_token_account.amount == 0 && amount > 0;
        
        // Check if this is a burn operation (to is zero address equivalent)
        let is_burn = to_token_account.amount == 0 && amount > 0;

        // Skip compliance check for burn operations (handled by burn instruction)
        if is_burn {
            msg!("Skipping compliance check for burn operation");
            return Ok(());
        }

        // Perform compliance check via CPI to ERC3643 program
        let cpi_program = ctx.accounts.erc3643_program.to_account_info();
        let cpi_accounts = CheckTransferAllowed {
            config: ctx.accounts.config.to_account_info(),
            mint: mint.to_account_info(),
            from_identity_registry: if is_mint {
                None
            } else {
                Some(ctx.accounts.from_identity_registry.to_account_info())
            },
            to_identity_registry: ctx.accounts.to_identity_registry.to_account_info(),
            compliance_registry: ctx.accounts.compliance_registry.to_account_info(),
            claim_topics_registry: ctx.accounts.claim_topics_registry.to_account_info(),
            from_identity: ctx.accounts.from_identity.to_account_info(),
            to_identity: ctx.accounts.to_identity.to_account_info(),
            from_frozen_account: Some(ctx.accounts.from_frozen_account.to_account_info()),
            to_frozen_account: Some(ctx.accounts.to_frozen_account.to_account_info()),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        let transfer_allowed = check_transfer_allowed(cpi_ctx, from, to, amount)?;

        // Reject transfer if not compliant
        if !transfer_allowed.get() {
            msg!("Transfer rejected by compliance check");
            return Err(TransferHookError::TransferNotCompliant.into());
        }

        msg!("Transfer approved by compliance check");
        Ok(())
    }

    /// Fallback function for any other transfer hook instructions
    pub fn fallback<'info>(
        _program_id: &Pubkey,
        _accounts: &'info [AccountInfo<'info>],
        _data: &[u8],
    ) -> Result<()> {
        msg!("Transfer hook fallback called");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The mint to create the extra account meta list for
    pub mint: InterfaceAccount<'info, Mint>,

    /// The extra account meta list PDA
    #[account(
        mut,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump
    )]
    /// CHECK: This account will be initialized by the instruction
    pub extra_account_meta_list: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Execute<'info> {
    /// The mint being transferred
    pub mint: InterfaceAccount<'info, Mint>,

    /// Source token account
    pub source_token: InterfaceAccount<'info, TokenAccount>,

    /// Destination token account
    pub destination_token: InterfaceAccount<'info, TokenAccount>,

    /// Transfer authority (usually the owner of source_token)
    /// CHECK: This is validated by the Token-2022 program
    pub authority: UncheckedAccount<'info>,

    /// Extra account meta list
    /// CHECK: This is validated by the transfer hook interface
    pub extra_account_meta_list: UncheckedAccount<'info>,

    // Extra accounts for compliance checking
    /// ERC3643 program
    pub erc3643_program: Program<'info, Erc3643Anchor>,

    /// Token config PDA
    /// CHECK: This is validated by the ERC3643 program
    pub config: UncheckedAccount<'info>,

    /// From identity registry PDA
    /// CHECK: This is validated by the ERC3643 program
    pub from_identity_registry: UncheckedAccount<'info>,

    /// To identity registry PDA
    /// CHECK: This is validated by the ERC3643 program
    pub to_identity_registry: UncheckedAccount<'info>,

    /// Compliance registry PDA
    /// CHECK: This is validated by the ERC3643 program
    pub compliance_registry: UncheckedAccount<'info>,

    /// Claim topics registry PDA
    /// CHECK: This is validated by the ERC3643 program
    pub claim_topics_registry: UncheckedAccount<'info>,

    /// From identity (for PDA derivation)
    /// CHECK: Used for PDA derivation only
    pub from_identity: UncheckedAccount<'info>,

    /// To identity (for PDA derivation)
    /// CHECK: Used for PDA derivation only
    pub to_identity: UncheckedAccount<'info>,

    /// From frozen account PDA
    /// CHECK: This is validated by the ERC3643 program
    pub from_frozen_account: UncheckedAccount<'info>,

    /// To frozen account PDA
    /// CHECK: This is validated by the ERC3643 program
    pub to_frozen_account: UncheckedAccount<'info>,
}

#[error_code]
pub enum TransferHookError {
    #[msg("Transfer not compliant with ERC-3643 rules")]
    TransferNotCompliant,
    
    #[msg("Invalid transfer hook configuration")]
    InvalidConfiguration,
    
    #[msg("Identity verification failed")]
    IdentityVerificationFailed,
    
    #[msg("Compliance check failed")]
    ComplianceCheckFailed,
}
