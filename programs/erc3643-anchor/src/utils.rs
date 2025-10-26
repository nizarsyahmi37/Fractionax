use anchor_lang::prelude::*;
use crate::{error::ERC3643Error, state::*};

/// Utility functions for the ERC-3643 program

/// Validate that a transfer is compliant with all rules
pub fn validate_transfer_compliance(
    from: &Pubkey,
    to: &Pubkey,
    amount: u64,
    config: &TokenConfig,
    from_identity: Option<&IdentityRegistry>,
    to_identity: &IdentityRegistry,
    compliance: &ComplianceRegistry,
    from_frozen: Option<&FrozenAccount>,
    to_frozen: Option<&FrozenAccount>,
) -> Result<bool> {
    // Check if token is paused
    if config.paused {
        return Ok(false);
    }

    // Check if addresses are frozen
    if let Some(from_frozen_info) = from_frozen {
        if from_frozen_info.is_address_frozen() {
            return Ok(false);
        }
    }

    if let Some(to_frozen_info) = to_frozen {
        if to_frozen_info.is_address_frozen() {
            return Ok(false);
        }
    }

    // Check identity verification for recipient
    if !to_identity.is_verified {
        return Ok(false);
    }

    // Check identity verification for sender (if not minting)
    if *from != Pubkey::default() {
        if let Some(from_identity_info) = from_identity {
            if !from_identity_info.is_verified {
                return Ok(false);
            }
        } else {
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
        from,
        to,
        amount,
        from_balance,
        to_balance,
        from_country,
        to_country,
    )?;

    Ok(compliance_result.allowed)
}

/// Calculate the required space for a dynamic account
pub fn calculate_dynamic_account_space(
    base_size: usize,
    dynamic_fields: &[(usize, usize)], // (count, item_size) pairs
) -> usize {
    let mut total_size = base_size + 8; // +8 for discriminator
    
    for (count, item_size) in dynamic_fields {
        total_size += 4; // Vec length prefix
        total_size += count * item_size;
    }
    
    total_size
}

/// Verify that all required claim topics are covered by valid claims
pub fn verify_required_claims_coverage(
    identity: &Pubkey,
    required_topics: &[u64],
    trusted_issuers: &TrustedIssuersRegistry,
    // In a real implementation, we would also pass the claims for this identity
) -> Result<bool> {
    // This is a simplified version - in a real implementation we would:
    // 1. Fetch all claims for the identity
    // 2. Validate each claim's signature and expiration
    // 3. Check that the issuer is trusted for the claim topic
    // 4. Ensure all required topics are covered

    if required_topics.is_empty() {
        return Ok(true);
    }

    // For now, we'll return true if there are trusted issuers for all required topics
    for topic in required_topics {
        let issuers_for_topic = trusted_issuers.get_issuers_for_topic(*topic);
        if issuers_for_topic.is_empty() {
            return Ok(false);
        }
    }

    Ok(true)
}

/// Generate a deterministic seed for PDA derivation
pub fn generate_pda_seed(base_seed: &[u8], additional_data: &[&[u8]]) -> Vec<u8> {
    let mut seed = base_seed.to_vec();
    for data in additional_data {
        seed.extend_from_slice(data);
    }
    seed
}

/// Validate claim data format and size
pub fn validate_claim_data(
    data: &[u8],
    signature: &[u8],
    uri: &str,
) -> Result<()> {
    validate_data_size(data, MAX_CLAIM_DATA_SIZE)?;
    validate_data_size(signature, MAX_CLAIM_SIGNATURE_SIZE)?;
    validate_string_length(uri, MAX_URI_LENGTH, ERC3643Error::InvalidURIFormat)?;
    
    // Additional validation could include:
    // - URI format validation
    // - Data structure validation
    // - Signature format validation
    
    Ok(())
}

/// Check if a timestamp is within a valid range
pub fn is_timestamp_valid(timestamp: i64, max_age_seconds: i64) -> bool {
    let now = Clock::get().unwrap().unix_timestamp;
    let age = now - timestamp;
    age >= 0 && age <= max_age_seconds
}

/// Calculate token amounts with proper overflow checking
pub fn safe_token_math(
    operation: TokenMathOperation,
    a: u64,
    b: u64,
) -> Result<u64> {
    match operation {
        TokenMathOperation::Add => {
            a.checked_add(b).ok_or(ERC3643Error::ArithmeticOverflow.into())
        }
        TokenMathOperation::Subtract => {
            a.checked_sub(b).ok_or(ERC3643Error::ArithmeticUnderflow.into())
        }
        TokenMathOperation::Multiply => {
            a.checked_mul(b).ok_or(ERC3643Error::ArithmeticOverflow.into())
        }
        TokenMathOperation::Divide => {
            if b == 0 {
                return Err(ERC3643Error::InvalidArgument.into());
            }
            Ok(a / b)
        }
    }
}

/// Token math operations
pub enum TokenMathOperation {
    Add,
    Subtract,
    Multiply,
    Divide,
}

/// Format error messages for better debugging
pub fn format_compliance_error(
    from: &Pubkey,
    to: &Pubkey,
    amount: u64,
    reason: &str,
) -> String {
    format!(
        "Transfer compliance failed: {} -> {} (amount: {}) - {}",
        from, to, amount, reason
    )
}

/// Validate account ownership and program derivation
pub fn validate_account_ownership(
    account: &AccountInfo,
    expected_owner: &Pubkey,
) -> Result<()> {
    require!(
        account.owner == expected_owner,
        ERC3643Error::InvalidArgument
    );
    Ok(())
}

/// Check if an account is rent exempt
pub fn check_rent_exemption(account: &AccountInfo, rent: &Rent) -> Result<()> {
    require!(
        rent.is_exempt(account.lamports(), account.data_len()),
        ERC3643Error::InvalidArgument
    );
    Ok(())
}

/// Validate PDA derivation
pub fn validate_pda_derivation(
    account: &Pubkey,
    seeds: &[&[u8]],
    program_id: &Pubkey,
) -> Result<u8> {
    let (expected_pda, bump) = Pubkey::find_program_address(seeds, program_id);
    require!(
        *account == expected_pda,
        ERC3643Error::InvalidPDADerivation
    );
    Ok(bump)
}

/// Convert between different numeric types safely
pub fn safe_cast_u64_to_u32(value: u64) -> Result<u32> {
    value.try_into().map_err(|_| ERC3643Error::ArithmeticOverflow.into())
}

pub fn safe_cast_u32_to_u16(value: u32) -> Result<u16> {
    value.try_into().map_err(|_| ERC3643Error::ArithmeticOverflow.into())
}

/// Batch operation utilities
pub fn validate_batch_size(size: usize, max_size: usize) -> Result<()> {
    require!(
        size <= max_size,
        ERC3643Error::BatchOperationLimitExceeded
    );
    Ok(())
}

/// Time-based utilities
pub fn get_current_timestamp() -> i64 {
    Clock::get().unwrap().unix_timestamp
}

pub fn is_expired(timestamp: i64, expiry: Option<i64>) -> bool {
    if let Some(exp) = expiry {
        get_current_timestamp() > exp
    } else {
        false
    }
}

/// String utilities
pub fn truncate_string(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len.saturating_sub(3)])
    }
}

/// Logging utilities
pub fn log_transfer_attempt(
    from: &Pubkey,
    to: &Pubkey,
    amount: u64,
    allowed: bool,
    reason: &str,
) {
    msg!("Transfer attempt: {} -> {} ({})", from, to, amount);
    msg!("Result: {} - {}", if allowed { "ALLOWED" } else { "DENIED" }, reason);
}

pub fn log_identity_operation(
    operation: &str,
    identity: &Pubkey,
    details: &str,
) {
    msg!("Identity {}: {} - {}", operation, identity, details);
}

pub fn log_compliance_check(
    check_type: &str,
    result: bool,
    details: &str,
) {
    msg!("Compliance check [{}]: {} - {}", 
         check_type, 
         if result { "PASS" } else { "FAIL" }, 
         details);
}

/// Constants for common operations
pub const SECONDS_PER_DAY: i64 = 86400;
pub const SECONDS_PER_HOUR: i64 = 3600;
pub const SECONDS_PER_MINUTE: i64 = 60;

/// Helper to convert days to seconds
pub fn days_to_seconds(days: u32) -> i64 {
    (days as i64) * SECONDS_PER_DAY
}

/// Helper to convert hours to seconds
pub fn hours_to_seconds(hours: u32) -> i64 {
    (hours as i64) * SECONDS_PER_HOUR
}

/// Helper to check if current time is within business hours (UTC)
pub fn is_business_hours(start_hour: u8, end_hour: u8) -> bool {
    let now = get_current_timestamp();
    let seconds_today = now % SECONDS_PER_DAY;
    let current_hour = (seconds_today / SECONDS_PER_HOUR) as u8;
    
    if start_hour <= end_hour {
        current_hour >= start_hour && current_hour < end_hour
    } else {
        // Handles overnight periods (e.g., 22:00 to 06:00)
        current_hour >= start_hour || current_hour < end_hour
    }
}
