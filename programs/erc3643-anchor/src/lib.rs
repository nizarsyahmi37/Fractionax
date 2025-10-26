use anchor_lang::prelude::*;

pub mod error;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

declare_id!("DsZZehksyoo7hNKDZa4EVL8iq5FWTJnUypmw5DjSNvio");

#[program]
pub mod erc3643_anchor {
    use super::*;

    /// Initialize the ERC-3643 token with compliance and identity registry
    pub fn initialize_token(
        ctx: Context<InitializeToken>,
        name: String,
        symbol: String,
        decimals: u8,
        initial_supply: Option<u64>,
    ) -> Result<()> {
        instructions::initialize_token::handler(ctx, name, symbol, decimals, initial_supply)
    }

    /// Register a new identity in the registry
    pub fn register_identity(
        ctx: Context<RegisterIdentity>,
        user: Pubkey,
        country: u16,
    ) -> Result<()> {
        instructions::identity::register_identity(ctx, user, country)
    }

    /// Add a claim to an identity
    pub fn add_claim(
        ctx: Context<AddClaim>,
        topic: u64,
        scheme: u64,
        data: Vec<u8>,
        signature: Vec<u8>,
        uri: String,
    ) -> Result<()> {
        instructions::identity::add_claim(ctx, topic, scheme, data, signature, uri)
    }

    /// Remove a claim from an identity
    pub fn remove_claim(ctx: Context<RemoveClaim>, claim_id: [u8; 32]) -> Result<()> {
        instructions::identity::remove_claim(ctx, claim_id)
    }

    /// Add a trusted issuer
    pub fn add_trusted_issuer(
        ctx: Context<AddTrustedIssuer>,
        issuer: Pubkey,
        claim_topics: Vec<u64>,
    ) -> Result<()> {
        instructions::admin::add_trusted_issuer(ctx, issuer, claim_topics)
    }

    /// Remove a trusted issuer
    pub fn remove_trusted_issuer(
        ctx: Context<RemoveTrustedIssuer>,
        issuer: Pubkey,
    ) -> Result<()> {
        instructions::admin::remove_trusted_issuer(ctx, issuer)
    }

    /// Mint tokens to a verified address
    pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        instructions::token::mint_tokens(ctx, amount)
    }

    /// Burn tokens from an address
    pub fn burn_tokens(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
        instructions::token::burn_tokens(ctx, amount)
    }

    /// Set address frozen status
    pub fn set_address_frozen(
        ctx: Context<SetAddressFrozen>,
        user: Pubkey,
        frozen: bool,
    ) -> Result<()> {
        instructions::admin::set_address_frozen(ctx, user, frozen)
    }

    /// Freeze partial tokens
    pub fn freeze_partial_tokens(
        ctx: Context<FreezePartialTokens>,
        user: Pubkey,
        amount: u64,
    ) -> Result<()> {
        instructions::admin::freeze_partial_tokens(ctx, user, amount)
    }

    /// Unfreeze partial tokens
    pub fn unfreeze_partial_tokens(
        ctx: Context<UnfreezePartialTokens>,
        user: Pubkey,
        amount: u64,
    ) -> Result<()> {
        instructions::admin::unfreeze_partial_tokens(ctx, user, amount)
    }

    /// Set pause status
    pub fn set_pause_status(ctx: Context<SetPauseStatus>, paused: bool) -> Result<()> {
        instructions::admin::set_pause_status(ctx, paused)
    }

    /// Check if transfer is allowed (read-only)
    pub fn check_transfer_allowed(
        ctx: Context<CheckTransferAllowed>,
        from: Pubkey,
        to: Pubkey,
        amount: u64,
    ) -> Result<bool> {
        instructions::compliance::check_transfer_allowed(ctx, from, to, amount)
    }

    /// Check if address is verified (read-only)
    pub fn check_verification(ctx: Context<CheckVerification>, user: Pubkey) -> Result<bool> {
        instructions::compliance::check_verification(ctx, user)
    }

    /// Forced transfer (agent only)
    pub fn forced_transfer(
        ctx: Context<ForcedTransfer>,
        from: Pubkey,
        to: Pubkey,
        amount: u64,
    ) -> Result<()> {
        instructions::token::forced_transfer(ctx, from, to, amount)
    }

    /// Recovery address (agent only)
    pub fn recovery_address(
        ctx: Context<RecoveryAddress>,
        lost_wallet: Pubkey,
        new_wallet: Pubkey,
        investor_identity: Pubkey,
    ) -> Result<()> {
        instructions::token::recovery_address(ctx, lost_wallet, new_wallet, investor_identity)
    }

    /// Add required claim topic
    pub fn add_claim_topic(ctx: Context<AddClaimTopic>, topic: u64) -> Result<()> {
        instructions::admin::add_claim_topic(ctx, topic)
    }

    /// Remove required claim topic
    pub fn remove_claim_topic(ctx: Context<RemoveClaimTopic>, topic: u64) -> Result<()> {
        instructions::admin::remove_claim_topic(ctx, topic)
    }

    /// Update identity country
    pub fn update_country(ctx: Context<UpdateCountry>, country: u16) -> Result<()> {
        instructions::identity::update_country(ctx, country)
    }

    /// Delete an identity
    pub fn delete_identity(ctx: Context<DeleteIdentity>) -> Result<()> {
        instructions::identity::delete_identity(ctx)
    }

    /// Add agent
    pub fn add_agent(ctx: Context<AddAgent>, agent: Pubkey) -> Result<()> {
        instructions::admin::add_agent(ctx, agent)
    }

    /// Remove agent
    pub fn remove_agent(ctx: Context<RemoveAgent>, agent: Pubkey) -> Result<()> {
        instructions::admin::remove_agent(ctx, agent)
    }

    /// Transfer ownership
    pub fn transfer_ownership(ctx: Context<TransferOwnership>, new_owner: Pubkey) -> Result<()> {
        instructions::admin::transfer_ownership(ctx, new_owner)
    }
}
