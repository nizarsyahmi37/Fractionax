use anchor_lang::prelude::*;
use super::*;

/// Individual claim account
/// PDA: ["claim", identity_pubkey, issuer_pubkey, topic_u64]
#[account]
pub struct Claim {
    /// The identity this claim belongs to
    pub identity: Pubkey,
    
    /// The issuer of this claim
    pub issuer: Pubkey,
    
    /// Claim topic (e.g., KYC=1, AML=2, etc.)
    pub topic: u64,
    
    /// Claim scheme (ECDSA, RSA, Contract, etc.)
    pub scheme: ClaimScheme,
    
    /// Claim data
    pub data: Vec<u8>,
    
    /// Claim signature
    pub signature: Vec<u8>,
    
    /// URI for additional claim information
    pub uri: String,
    
    /// Claim status
    pub is_valid: bool,
    pub is_revoked: bool,
    
    /// Timestamps
    pub issued_at: i64,
    pub expires_at: Option<i64>,
    pub revoked_at: Option<i64>,
    
    /// Who revoked the claim (if revoked)
    pub revoked_by: Option<Pubkey>,
    
    /// Reserved space
    pub reserved: [u8; 32],
}

impl Claim {
    pub const LEN: usize = 8 + // discriminator
        32 + // identity
        32 + // issuer
        8 + // topic
        1 + // scheme
        (4 + MAX_CLAIM_DATA_SIZE) + // data
        (4 + MAX_CLAIM_SIGNATURE_SIZE) + // signature
        (4 + MAX_URI_LENGTH) + // uri
        1 + // is_valid
        1 + // is_revoked
        8 + // issued_at
        (1 + 8) + // expires_at (Option<i64>)
        (1 + 8) + // revoked_at (Option<i64>)
        (1 + 32) + // revoked_by (Option<Pubkey>)
        32; // reserved

    /// Create a new claim
    pub fn new(
        identity: Pubkey,
        issuer: Pubkey,
        topic: u64,
        scheme: ClaimScheme,
        data: Vec<u8>,
        signature: Vec<u8>,
        uri: String,
        expires_at: Option<i64>,
    ) -> Result<Self> {
        // Validate inputs
        validate_data_size(&data, MAX_CLAIM_DATA_SIZE)?;
        validate_data_size(&signature, MAX_CLAIM_SIGNATURE_SIZE)?;
        validate_string_length(&uri, MAX_URI_LENGTH, crate::error::ERC3643Error::InvalidURIFormat)?;

        let now = Clock::get()?.unix_timestamp;
        
        // Validate expiration
        if let Some(expiry) = expires_at {
            require!(expiry > now, crate::error::ERC3643Error::InvalidArgument);
        }

        Ok(Self {
            identity,
            issuer,
            topic,
            scheme,
            data,
            signature,
            uri,
            is_valid: true,
            is_revoked: false,
            issued_at: now,
            expires_at,
            revoked_at: None,
            revoked_by: None,
            reserved: [0; 32],
        })
    }

    /// Check if claim is currently valid
    pub fn is_currently_valid(&self) -> bool {
        if !self.is_valid || self.is_revoked {
            return false;
        }

        // Check expiration
        if let Some(expiry) = self.expires_at {
            let now = Clock::get().unwrap().unix_timestamp;
            if now > expiry {
                return false;
            }
        }

        true
    }

    /// Revoke the claim
    pub fn revoke(&mut self, revoked_by: Pubkey) -> Result<()> {
        require!(!self.is_revoked, crate::error::ERC3643Error::ClaimRevoked);
        
        self.is_revoked = true;
        self.revoked_at = Some(Clock::get()?.unix_timestamp);
        self.revoked_by = Some(revoked_by);
        
        Ok(())
    }

    /// Update claim data (only by issuer)
    pub fn update_data(&mut self, data: Vec<u8>, signature: Vec<u8>) -> Result<()> {
        require!(!self.is_revoked, crate::error::ERC3643Error::ClaimRevoked);
        
        validate_data_size(&data, MAX_CLAIM_DATA_SIZE)?;
        validate_data_size(&signature, MAX_CLAIM_SIGNATURE_SIZE)?;
        
        self.data = data;
        self.signature = signature;
        
        Ok(())
    }

    /// Generate claim ID
    pub fn generate_id(&self) -> [u8; 32] {
        generate_claim_id(&self.issuer, self.topic)
    }

    /// Validate claim signature (simplified - in production would verify cryptographic signature)
    pub fn validate_signature(&self) -> Result<bool> {
        // In a real implementation, this would:
        // 1. Reconstruct the signed message from identity + topic + data
        // 2. Verify the signature against the issuer's public key
        // 3. Check the signature scheme matches
        
        // For now, we'll do basic validation
        require!(!self.signature.is_empty(), crate::error::ERC3643Error::InvalidClaimSignature);
        require!(!self.data.is_empty(), crate::error::ERC3643Error::InvalidArgument);
        
        Ok(true)
    }
}

/// Claim verification result
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ClaimVerificationResult {
    pub claim_id: [u8; 32],
    pub is_valid: bool,
    pub is_expired: bool,
    pub is_revoked: bool,
    pub issuer_trusted: bool,
    pub signature_valid: bool,
}

impl ClaimVerificationResult {
    pub fn new(claim: &Claim, issuer_trusted: bool) -> Result<Self> {
        let now = Clock::get()?.unix_timestamp;
        let is_expired = claim.expires_at.map_or(false, |exp| now > exp);
        let signature_valid = claim.validate_signature()?;
        
        Ok(Self {
            claim_id: claim.generate_id(),
            is_valid: claim.is_currently_valid() && issuer_trusted && signature_valid,
            is_expired,
            is_revoked: claim.is_revoked,
            issuer_trusted,
            signature_valid,
        })
    }
}

/// Batch claim verification for identity
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct IdentityVerificationResult {
    pub identity: Pubkey,
    pub is_verified: bool,
    pub claims_checked: u32,
    pub valid_claims: u32,
    pub required_topics_met: Vec<u64>,
    pub missing_topics: Vec<u64>,
    pub verification_timestamp: i64,
}

impl IdentityVerificationResult {
    pub fn new(identity: Pubkey) -> Self {
        Self {
            identity,
            is_verified: false,
            claims_checked: 0,
            valid_claims: 0,
            required_topics_met: Vec::new(),
            missing_topics: Vec::new(),
            verification_timestamp: Clock::get().unwrap().unix_timestamp,
        }
    }

    pub fn add_valid_claim(&mut self, topic: u64) {
        self.valid_claims += 1;
        if !self.required_topics_met.contains(&topic) {
            self.required_topics_met.push(topic);
        }
    }

    pub fn add_missing_topic(&mut self, topic: u64) {
        if !self.missing_topics.contains(&topic) {
            self.missing_topics.push(topic);
        }
    }

    pub fn finalize(&mut self, required_topics: &[u64]) {
        // Check if all required topics are met
        self.is_verified = required_topics.iter().all(|topic| {
            self.required_topics_met.contains(topic)
        });

        // Update missing topics
        self.missing_topics = required_topics
            .iter()
            .filter(|topic| !self.required_topics_met.contains(topic))
            .cloned()
            .collect();
    }
}

/// Common claim topics (following ERC-3643 standard)
pub mod claim_topics {
    /// KYC (Know Your Customer) claim
    pub const KYC: u64 = 1;
    
    /// AML (Anti-Money Laundering) claim
    pub const AML: u64 = 2;
    
    /// Accredited investor claim
    pub const ACCREDITED_INVESTOR: u64 = 3;
    
    /// Country verification claim
    pub const COUNTRY_VERIFICATION: u64 = 4;
    
    /// Sanctions screening claim
    pub const SANCTIONS_SCREENING: u64 = 5;
    
    /// Professional investor claim
    pub const PROFESSIONAL_INVESTOR: u64 = 6;
    
    /// Retail investor claim
    pub const RETAIL_INVESTOR: u64 = 7;
    
    /// Institutional investor claim
    pub const INSTITUTIONAL_INVESTOR: u64 = 8;
    
    /// Tax residency claim
    pub const TAX_RESIDENCY: u64 = 9;
    
    /// Identity verification claim
    pub const IDENTITY_VERIFICATION: u64 = 10;
}

/// Utility functions for claim management
impl Claim {
    /// Check if claim matches a specific topic and issuer
    pub fn matches(&self, topic: u64, issuer: &Pubkey) -> bool {
        self.topic == topic && self.issuer == *issuer
    }

    /// Get claim age in seconds
    pub fn get_age(&self) -> i64 {
        Clock::get().unwrap().unix_timestamp - self.issued_at
    }

    /// Get time until expiration (if any)
    pub fn time_until_expiry(&self) -> Option<i64> {
        self.expires_at.map(|exp| exp - Clock::get().unwrap().unix_timestamp)
    }

    /// Check if claim is about to expire (within threshold)
    pub fn is_expiring_soon(&self, threshold_seconds: i64) -> bool {
        if let Some(time_left) = self.time_until_expiry() {
            time_left <= threshold_seconds && time_left > 0
        } else {
            false
        }
    }
}
