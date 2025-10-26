use anchor_lang::prelude::*;
use super::*;

/// Main configuration account for the ERC-3643 token
/// PDA: ["config", mint_pubkey]
#[account]
pub struct TokenConfig {
    /// The mint address this config is for
    pub mint: Pubkey,

    /// Token metadata
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub version: String,

    /// OnchainID address (can be zero if not set)
    pub onchain_id: Pubkey,

    /// Program authorities
    pub owner: Pubkey,
    pub agents: Vec<Pubkey>,

    /// Transfer hook configuration
    pub transfer_hook_program: Option<Pubkey>,
    pub enforcement_mode: EnforcementMode,

    /// Token state
    pub paused: bool,
    pub total_supply: u64,

    /// Compliance settings
    pub require_identity_verification: bool,
    pub allow_forced_transfers: bool,
    pub enable_recovery: bool,

    /// Limits and restrictions
    pub max_holders: Option<u32>,
    pub min_holding: Option<u64>,
    pub max_holding: Option<u64>,

    /// Timestamps
    pub created_at: i64,
    pub updated_at: i64,

    /// Reserved space for future upgrades
    pub reserved: [u8; 128],
}

impl TokenConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // mint
        (4 + MAX_NAME_LENGTH) + // name
        (4 + MAX_SYMBOL_LENGTH) + // symbol
        1 + // decimals
        (4 + TOKEN_VERSION.len()) + // version
        32 + // onchain_id
        32 + // owner
        (4 + MAX_AGENTS * 32) + // agents
        (1 + 32) + // transfer_hook_program (Option<Pubkey>)
        1 + // enforcement_mode
        1 + // paused
        8 + // total_supply
        1 + // require_identity_verification
        1 + // allow_forced_transfers
        1 + // enable_recovery
        (1 + 4) + // max_holders (Option<u32>)
        (1 + 8) + // min_holding (Option<u64>)
        (1 + 8) + // max_holding (Option<u64>)
        8 + // created_at
        8 + // updated_at
        128; // reserved

    /// Check if the given pubkey is the owner
    pub fn is_owner(&self, pubkey: &Pubkey) -> bool {
        self.owner == *pubkey
    }

    /// Check if the given pubkey is an agent
    pub fn is_agent(&self, pubkey: &Pubkey) -> bool {
        self.agents.contains(pubkey)
    }

    /// Check if the given pubkey has agent or owner privileges
    pub fn has_agent_or_owner_role(&self, pubkey: &Pubkey) -> bool {
        self.is_owner(pubkey) || self.is_agent(pubkey)
    }

    /// Add an agent (only owner can call)
    pub fn add_agent(&mut self, agent: Pubkey) -> Result<()> {
        require!(!self.agents.contains(&agent), crate::error::ERC3643Error::InvalidArgument);
        require!(self.agents.len() < MAX_AGENTS, crate::error::ERC3643Error::TooManyTrustedIssuers);
        self.agents.push(agent);
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Remove an agent (only owner can call)
    pub fn remove_agent(&mut self, agent: Pubkey) -> Result<()> {
        if let Some(pos) = self.agents.iter().position(|&x| x == agent) {
            self.agents.remove(pos);
            self.updated_at = Clock::get()?.unix_timestamp;
            Ok(())
        } else {
            Err(crate::error::ERC3643Error::InvalidArgument.into())
        }
    }

    /// Update token metadata
    pub fn update_metadata(&mut self, name: Option<String>, symbol: Option<String>) -> Result<()> {
        if let Some(new_name) = name {
            validate_string_length(&new_name, MAX_NAME_LENGTH, crate::error::ERC3643Error::NameTooLong)?;
            self.name = new_name;
        }
        
        if let Some(new_symbol) = symbol {
            validate_string_length(&new_symbol, MAX_SYMBOL_LENGTH, crate::error::ERC3643Error::SymbolTooLong)?;
            self.symbol = new_symbol;
        }
        
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Set pause status
    pub fn set_paused(&mut self, paused: bool) -> Result<()> {
        self.paused = paused;
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Update total supply
    pub fn update_total_supply(&mut self, new_supply: u64) -> Result<()> {
        self.total_supply = new_supply;
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Set enforcement mode
    pub fn set_enforcement_mode(&mut self, mode: EnforcementMode) -> Result<()> {
        self.enforcement_mode = mode;
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Set transfer hook program
    pub fn set_transfer_hook_program(&mut self, program: Option<Pubkey>) -> Result<()> {
        self.transfer_hook_program = program;
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Validate configuration consistency
    pub fn validate(&self) -> Result<()> {
        validate_pubkey(&self.mint)?;
        validate_pubkey(&self.owner)?;
        validate_string_length(&self.name, MAX_NAME_LENGTH, crate::error::ERC3643Error::NameTooLong)?;
        validate_string_length(&self.symbol, MAX_SYMBOL_LENGTH, crate::error::ERC3643Error::SymbolTooLong)?;
        validate_decimals(self.decimals)?;
        
        // Validate enforcement mode consistency
        match self.enforcement_mode {
            EnforcementMode::TransferHook | EnforcementMode::Hybrid => {
                require!(self.transfer_hook_program.is_some(), crate::error::ERC3643Error::TransferHookNotConfigured);
            }
            _ => {}
        }
        
        Ok(())
    }
}

/// Account for storing frozen addresses and partial token freezes
/// PDA: ["frozen", mint_pubkey, user_pubkey]
#[account]
pub struct FrozenAccount {
    /// The user this freeze info is for
    pub user: Pubkey,
    
    /// The mint this freeze info is for
    pub mint: Pubkey,
    
    /// Whether the entire address is frozen
    pub is_frozen: bool,
    
    /// Amount of tokens that are frozen (partial freeze)
    pub frozen_amount: u64,
    
    /// Timestamp when frozen
    pub frozen_at: i64,
    
    /// Agent who performed the freeze
    pub frozen_by: Pubkey,
    
    /// Reserved space
    pub reserved: [u8; 64],
}

impl FrozenAccount {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        32 + // mint
        1 + // is_frozen
        8 + // frozen_amount
        8 + // frozen_at
        32 + // frozen_by
        64; // reserved

    /// Check if address is completely frozen
    pub fn is_address_frozen(&self) -> bool {
        self.is_frozen
    }

    /// Get amount of frozen tokens
    pub fn get_frozen_amount(&self) -> u64 {
        self.frozen_amount
    }

    /// Set address frozen status
    pub fn set_frozen(&mut self, frozen: bool, agent: Pubkey) -> Result<()> {
        self.is_frozen = frozen;
        self.frozen_at = Clock::get()?.unix_timestamp;
        self.frozen_by = agent;
        Ok(())
    }

    /// Freeze partial tokens
    pub fn freeze_tokens(&mut self, amount: u64, agent: Pubkey) -> Result<()> {
        self.frozen_amount = self.frozen_amount
            .checked_add(amount)
            .ok_or(crate::error::ERC3643Error::ArithmeticOverflow)?;
        self.frozen_at = Clock::get()?.unix_timestamp;
        self.frozen_by = agent;
        Ok(())
    }

    /// Unfreeze partial tokens
    pub fn unfreeze_tokens(&mut self, amount: u64, agent: Pubkey) -> Result<()> {
        require!(self.frozen_amount >= amount, crate::error::ERC3643Error::InsufficientFrozenTokens);
        self.frozen_amount = self.frozen_amount
            .checked_sub(amount)
            .ok_or(crate::error::ERC3643Error::ArithmeticUnderflow)?;
        self.frozen_at = Clock::get()?.unix_timestamp;
        self.frozen_by = agent;
        Ok(())
    }
}
