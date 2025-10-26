use anchor_lang::prelude::*;
use super::*;

/// Compliance rules and configuration
/// PDA: ["compliance", mint_pubkey]
#[account]
pub struct ComplianceRegistry {
    /// The mint this compliance is for
    pub mint: Pubkey,
    
    /// Compliance modules configuration
    pub modules: Vec<ComplianceModule>,
    
    /// Transfer restrictions
    pub country_restrictions: Vec<CountryRestriction>,
    pub transfer_limits: TransferLimits,
    pub holding_limits: HoldingLimits,
    
    /// Time-based restrictions
    pub lock_periods: Vec<LockPeriod>,
    pub trading_windows: Vec<TradingWindow>,
    
    /// Investor limits
    pub max_investors: Option<u32>,
    pub current_investors: u32,
    
    /// Compliance flags
    pub require_whitelist: bool,
    pub enable_blacklist: bool,
    pub require_kyc: bool,
    pub require_aml: bool,
    
    /// Timestamps
    pub created_at: i64,
    pub updated_at: i64,
    
    /// Reserved space
    pub reserved: [u8; 64],
}

impl ComplianceRegistry {
    pub const LEN: usize = 8 + // discriminator
        32 + // mint
        (4 + 10 * ComplianceModule::LEN) + // modules (max 10)
        (4 + 50 * CountryRestriction::LEN) + // country_restrictions (max 50)
        TransferLimits::LEN + // transfer_limits
        HoldingLimits::LEN + // holding_limits
        (4 + 10 * LockPeriod::LEN) + // lock_periods (max 10)
        (4 + 10 * TradingWindow::LEN) + // trading_windows (max 10)
        (1 + 4) + // max_investors (Option<u32>)
        4 + // current_investors
        1 + // require_whitelist
        1 + // enable_blacklist
        1 + // require_kyc
        1 + // require_aml
        8 + // created_at
        8 + // updated_at
        64; // reserved

    /// Check if transfer is compliant
    pub fn check_transfer_compliance(
        &self,
        from: &Pubkey,
        to: &Pubkey,
        amount: u64,
        from_balance: u64,
        to_balance: u64,
        from_country: u16,
        to_country: u16,
    ) -> Result<ComplianceResult> {
        let mut result = ComplianceResult {
            allowed: true,
            reason: String::new(),
            module: "base".to_string(),
        };

        // Check country restrictions
        if let Err(e) = self.check_country_restrictions(from_country, to_country) {
            result.allowed = false;
            result.reason = format!("Country restriction: {}", e);
            return Ok(result);
        }

        // Check transfer limits
        if let Err(e) = self.check_transfer_limits(amount) {
            result.allowed = false;
            result.reason = format!("Transfer limit: {}", e);
            return Ok(result);
        }

        // Check holding limits
        if let Err(e) = self.check_holding_limits(to_balance + amount) {
            result.allowed = false;
            result.reason = format!("Holding limit: {}", e);
            return Ok(result);
        }

        // Check investor limits
        if to_balance == 0 && self.current_investors >= self.max_investors.unwrap_or(u32::MAX) {
            result.allowed = false;
            result.reason = "Maximum investors reached".to_string();
            return Ok(result);
        }

        // Check lock periods
        if let Err(e) = self.check_lock_periods(from) {
            result.allowed = false;
            result.reason = format!("Lock period: {}", e);
            return Ok(result);
        }

        // Check trading windows
        if let Err(e) = self.check_trading_windows() {
            result.allowed = false;
            result.reason = format!("Trading window: {}", e);
            return Ok(result);
        }

        Ok(result)
    }

    /// Check country restrictions
    fn check_country_restrictions(&self, from_country: u16, to_country: u16) -> Result<()> {
        for restriction in &self.country_restrictions {
            if restriction.applies_to_country(from_country) || restriction.applies_to_country(to_country) {
                if restriction.is_blocked() {
                    return Err(crate::error::ERC3643Error::CountryNotAllowed.into());
                }
            }
        }
        Ok(())
    }

    /// Check transfer limits
    fn check_transfer_limits(&self, amount: u64) -> Result<()> {
        if let Some(max_transfer) = self.transfer_limits.max_transfer_amount {
            require!(amount <= max_transfer, crate::error::ERC3643Error::TransferLimitExceeded);
        }

        if let Some(min_transfer) = self.transfer_limits.min_transfer_amount {
            require!(amount >= min_transfer, crate::error::ERC3643Error::InvalidAmount);
        }

        Ok(())
    }

    /// Check holding limits
    fn check_holding_limits(&self, new_balance: u64) -> Result<()> {
        if let Some(max_holding) = self.holding_limits.max_holding_amount {
            require!(new_balance <= max_holding, crate::error::ERC3643Error::MaximumHoldingExceeded);
        }

        if let Some(min_holding) = self.holding_limits.min_holding_amount {
            require!(new_balance >= min_holding, crate::error::ERC3643Error::MinimumHoldingNotMet);
        }

        Ok(())
    }

    /// Check lock periods
    fn check_lock_periods(&self, user: &Pubkey) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        
        for lock_period in &self.lock_periods {
            if lock_period.applies_to_user(user) && lock_period.is_active(now) {
                return Err(crate::error::ERC3643Error::LockPeriodActive.into());
            }
        }
        
        Ok(())
    }

    /// Check trading windows
    fn check_trading_windows(&self) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        
        // If no trading windows defined, allow all times
        if self.trading_windows.is_empty() {
            return Ok(());
        }

        // Check if current time falls within any allowed trading window
        for window in &self.trading_windows {
            if window.is_trading_allowed(now) {
                return Ok(());
            }
        }

        Err(crate::error::ERC3643Error::TransferNotCompliant.into())
    }

    /// Add compliance module
    pub fn add_module(&mut self, module: ComplianceModule) -> Result<()> {
        require!(self.modules.len() < 10, crate::error::ERC3643Error::TooManyTrustedIssuers);
        self.modules.push(module);
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Remove compliance module
    pub fn remove_module(&mut self, module_id: u32) -> Result<()> {
        if let Some(pos) = self.modules.iter().position(|m| m.id == module_id) {
            self.modules.remove(pos);
            self.updated_at = Clock::get()?.unix_timestamp;
            Ok(())
        } else {
            Err(crate::error::ERC3643Error::ComplianceModuleNotFound.into())
        }
    }
}

/// Compliance module configuration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ComplianceModule {
    pub id: u32,
    pub name: String,
    pub module_type: ComplianceModuleType,
    pub is_active: bool,
    pub parameters: Vec<u8>, // Serialized module-specific parameters
}

impl ComplianceModule {
    pub const LEN: usize = 4 + // id
        (4 + 32) + // name (max 32 chars)
        1 + // module_type
        1 + // is_active
        (4 + 256); // parameters (max 256 bytes)
}

/// Types of compliance modules
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum ComplianceModuleType {
    CountryRestriction,
    TransferLimit,
    HoldingLimit,
    LockPeriod,
    TradingWindow,
    Whitelist,
    Blacklist,
    Custom,
}

/// Country restriction configuration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CountryRestriction {
    pub country_code: u16,
    pub restriction_type: RestrictionType,
    pub is_active: bool,
}

impl CountryRestriction {
    pub const LEN: usize = 2 + // country_code
        1 + // restriction_type
        1; // is_active

    pub fn applies_to_country(&self, country: u16) -> bool {
        self.is_active && self.country_code == country
    }

    pub fn is_blocked(&self) -> bool {
        matches!(self.restriction_type, RestrictionType::Blocked)
    }
}

/// Types of country restrictions
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum RestrictionType {
    Allowed,
    Blocked,
    RequiresApproval,
}

/// Transfer limits configuration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TransferLimits {
    pub min_transfer_amount: Option<u64>,
    pub max_transfer_amount: Option<u64>,
    pub daily_limit: Option<u64>,
    pub monthly_limit: Option<u64>,
    pub reset_period: u32, // seconds
}

impl TransferLimits {
    pub const LEN: usize = (1 + 8) + // min_transfer_amount
        (1 + 8) + // max_transfer_amount
        (1 + 8) + // daily_limit
        (1 + 8) + // monthly_limit
        4; // reset_period
}

/// Holding limits configuration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct HoldingLimits {
    pub min_holding_amount: Option<u64>,
    pub max_holding_amount: Option<u64>,
    pub max_holding_percentage: Option<u16>, // basis points (10000 = 100%)
}

impl HoldingLimits {
    pub const LEN: usize = (1 + 8) + // min_holding_amount
        (1 + 8) + // max_holding_amount
        (1 + 2); // max_holding_percentage
}

/// Lock period configuration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct LockPeriod {
    pub user: Option<Pubkey>, // None means applies to all users
    pub start_time: i64,
    pub end_time: i64,
    pub lock_type: LockType,
    pub is_active: bool,
}

impl LockPeriod {
    pub const LEN: usize = (1 + 32) + // user
        8 + // start_time
        8 + // end_time
        1 + // lock_type
        1; // is_active

    pub fn applies_to_user(&self, user: &Pubkey) -> bool {
        self.is_active && (self.user.is_none() || self.user == Some(*user))
    }

    pub fn is_active(&self, current_time: i64) -> bool {
        self.is_active && current_time >= self.start_time && current_time <= self.end_time
    }
}

/// Types of lock periods
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum LockType {
    /// No transfers allowed
    FullLock,
    /// Only incoming transfers allowed
    ReceiveOnly,
    /// Only outgoing transfers allowed
    SendOnly,
}

/// Trading window configuration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TradingWindow {
    pub start_time: u32, // seconds since midnight UTC
    pub end_time: u32,   // seconds since midnight UTC
    pub days_of_week: u8, // bitmask: bit 0 = Sunday, bit 1 = Monday, etc.
    pub is_active: bool,
}

impl TradingWindow {
    pub const LEN: usize = 4 + // start_time
        4 + // end_time
        1 + // days_of_week
        1; // is_active

    pub fn is_trading_allowed(&self, timestamp: i64) -> bool {
        if !self.is_active {
            return false;
        }

        // Convert timestamp to day of week and time of day
        let seconds_per_day = 86400;
        let days_since_epoch = timestamp / seconds_per_day;
        let day_of_week = ((days_since_epoch + 4) % 7) as u8; // Epoch was Thursday
        let time_of_day = (timestamp % seconds_per_day) as u32;

        // Check if today is an allowed day
        let day_bit = 1 << day_of_week;
        if (self.days_of_week & day_bit) == 0 {
            return false;
        }

        // Check if current time is within trading window
        if self.start_time <= self.end_time {
            // Normal case: window doesn't cross midnight
            time_of_day >= self.start_time && time_of_day <= self.end_time
        } else {
            // Window crosses midnight
            time_of_day >= self.start_time || time_of_day <= self.end_time
        }
    }
}
