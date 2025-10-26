pub mod config;
pub mod identity;
pub mod compliance;
pub mod claims;

pub use config::*;
pub use identity::*;
pub use compliance::*;
pub use claims::*;

use anchor_lang::prelude::*;

/// Maximum number of trusted issuers allowed
pub const MAX_TRUSTED_ISSUERS: usize = 50;

/// Maximum number of claim topics allowed
pub const MAX_CLAIM_TOPICS: usize = 15;

/// Maximum number of agents allowed
pub const MAX_AGENTS: usize = 10;

/// Maximum length for token name
pub const MAX_NAME_LENGTH: usize = 32;

/// Maximum length for token symbol
pub const MAX_SYMBOL_LENGTH: usize = 10;

/// Maximum length for URI
pub const MAX_URI_LENGTH: usize = 200;

/// Maximum size for claim data
pub const MAX_CLAIM_DATA_SIZE: usize = 1024;

/// Maximum size for claim signature
pub const MAX_CLAIM_SIGNATURE_SIZE: usize = 64;

/// Current version of the token implementation
pub const TOKEN_VERSION: &str = "1.0.0";

/// Seeds for PDA derivation
pub const CONFIG_SEED: &[u8] = b"config";
pub const IDENTITY_SEED: &[u8] = b"identity";
pub const TRUSTED_ISSUERS_SEED: &[u8] = b"trusted_issuers";
pub const CLAIM_SEED: &[u8] = b"claim";
pub const COMPLIANCE_SEED: &[u8] = b"compliance";
pub const CLAIM_TOPICS_SEED: &[u8] = b"claim_topics";

/// Role definitions
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum Role {
    Owner,
    Agent,
    Issuer,
    ComplianceManager,
}

/// Enforcement mode for transfers
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum EnforcementMode {
    /// Use Token-2022 transfer hooks (primary)
    TransferHook,
    /// Use program-controlled transfers (fallback)
    ProgramControlled,
    /// Both modes enabled
    Hybrid,
}

/// Claim scheme types
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum ClaimScheme {
    /// ECDSA signature scheme
    ECDSA = 1,
    /// RSA signature scheme  
    RSA = 2,
    /// Contract-based claim
    Contract = 3,
}

/// Compliance check result
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ComplianceResult {
    pub allowed: bool,
    pub reason: String,
    pub module: String,
}

/// Transfer validation context
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TransferContext {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub is_mint: bool,
    pub is_burn: bool,
}

/// Batch operation result
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct BatchResult {
    pub total: u32,
    pub success: u32,
    pub failures: Vec<String>,
}

/// Utility functions for account validation
pub fn validate_pubkey(pubkey: &Pubkey) -> Result<()> {
    require!(*pubkey != Pubkey::default(), crate::error::ERC3643Error::ZeroAddressNotAllowed);
    Ok(())
}

pub fn validate_amount(amount: u64) -> Result<()> {
    require!(amount > 0, crate::error::ERC3643Error::InvalidAmount);
    Ok(())
}

pub fn validate_string_length(s: &str, max_length: usize, error: crate::error::ERC3643Error) -> Result<()> {
    if s.len() > max_length {
        return Err(error.into());
    }
    if s.is_empty() {
        return Err(crate::error::ERC3643Error::InvalidArgument.into());
    }
    Ok(())
}

pub fn validate_data_size(data: &[u8], max_size: usize) -> Result<()> {
    require!(data.len() <= max_size, crate::error::ERC3643Error::DataTooLarge);
    Ok(())
}

pub fn validate_country_code(country: u16) -> Result<()> {
    // ISO 3166-1 numeric codes range from 1 to 999
    require!(country > 0 && country <= 999, crate::error::ERC3643Error::InvalidCountryCode);
    Ok(())
}

pub fn validate_decimals(decimals: u8) -> Result<()> {
    require!(decimals <= 18, crate::error::ERC3643Error::InvalidDecimals);
    Ok(())
}

/// Generate claim ID from issuer and topic
pub fn generate_claim_id(issuer: &Pubkey, topic: u64) -> [u8; 32] {
    use solana_program::hash::hash;
    let mut data = Vec::new();
    data.extend_from_slice(&issuer.to_bytes());
    data.extend_from_slice(&topic.to_le_bytes());
    hash(&data).to_bytes()
}

/// Check if current time is within claim validity period
pub fn is_claim_valid_time(issued_at: i64, expires_at: Option<i64>) -> bool {
    let now = Clock::get().unwrap().unix_timestamp;
    if let Some(expiry) = expires_at {
        now >= issued_at && now <= expiry
    } else {
        now >= issued_at
    }
}

/// Calculate required account space for dynamic arrays
pub fn calculate_account_space(base_size: usize, array_items: usize, item_size: usize) -> usize {
    base_size + (array_items * item_size) + 8 // +8 for discriminator
}
