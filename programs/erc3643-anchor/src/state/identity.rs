use anchor_lang::prelude::*;
use super::*;

/// Identity registry account for a user
/// PDA: ["identity", user_pubkey]
#[account]
pub struct IdentityRegistry {
    /// The user this identity is for
    pub user: Pubkey,
    
    /// Verification status
    pub is_verified: bool,
    
    /// Country code (ISO 3166-1 numeric)
    pub country: u16,
    
    /// OnchainID address (if using external identity)
    pub onchain_id: Option<Pubkey>,
    
    /// Claims summary for quick verification
    pub claims_count: u32,
    pub required_claims_met: bool,
    
    /// Timestamps
    pub registered_at: i64,
    pub last_verified_at: i64,
    pub updated_at: i64,
    
    /// Agent who registered this identity
    pub registered_by: Pubkey,
    
    /// Reserved space
    pub reserved: [u8; 64],
}

impl IdentityRegistry {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        1 + // is_verified
        2 + // country
        (1 + 32) + // onchain_id (Option<Pubkey>)
        4 + // claims_count
        1 + // required_claims_met
        8 + // registered_at
        8 + // last_verified_at
        8 + // updated_at
        32 + // registered_by
        64; // reserved

    /// Update verification status
    pub fn update_verification(&mut self, verified: bool) -> Result<()> {
        self.is_verified = verified;
        if verified {
            self.last_verified_at = Clock::get()?.unix_timestamp;
        }
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Update country
    pub fn update_country(&mut self, country: u16) -> Result<()> {
        validate_country_code(country)?;
        self.country = country;
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Update claims count
    pub fn update_claims_count(&mut self, count: u32) -> Result<()> {
        self.claims_count = count;
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Update required claims status
    pub fn update_required_claims_status(&mut self, met: bool) -> Result<()> {
        self.required_claims_met = met;
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Check if identity is valid for transfers
    pub fn is_valid_for_transfer(&self) -> bool {
        self.is_verified && self.required_claims_met
    }
}

/// Trusted issuers registry
/// PDA: ["trusted_issuers", mint_pubkey]
#[account]
pub struct TrustedIssuersRegistry {
    /// The mint this registry is for
    pub mint: Pubkey,
    
    /// List of trusted issuers
    pub issuers: Vec<TrustedIssuer>,
    
    /// Timestamps
    pub created_at: i64,
    pub updated_at: i64,
    
    /// Reserved space
    pub reserved: [u8; 64],
}

impl TrustedIssuersRegistry {
    pub const LEN: usize = 8 + // discriminator
        32 + // mint
        (4 + MAX_TRUSTED_ISSUERS * TrustedIssuer::LEN) + // issuers
        8 + // created_at
        8 + // updated_at
        64; // reserved

    /// Add a trusted issuer
    pub fn add_issuer(&mut self, issuer: Pubkey, claim_topics: Vec<u64>) -> Result<()> {
        require!(self.issuers.len() < MAX_TRUSTED_ISSUERS, crate::error::ERC3643Error::TooManyTrustedIssuers);
        require!(!claim_topics.is_empty(), crate::error::ERC3643Error::InvalidArgument);
        require!(claim_topics.len() <= MAX_CLAIM_TOPICS, crate::error::ERC3643Error::TooManyClaimTopics);
        
        // Check if issuer already exists
        if self.issuers.iter().any(|i| i.issuer == issuer) {
            return Err(crate::error::ERC3643Error::TrustedIssuerAlreadyExists.into());
        }

        let trusted_issuer = TrustedIssuer {
            issuer,
            claim_topics,
            added_at: Clock::get()?.unix_timestamp,
            is_active: true,
        };

        self.issuers.push(trusted_issuer);
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Remove a trusted issuer
    pub fn remove_issuer(&mut self, issuer: Pubkey) -> Result<()> {
        if let Some(pos) = self.issuers.iter().position(|i| i.issuer == issuer) {
            self.issuers.remove(pos);
            self.updated_at = Clock::get()?.unix_timestamp;
            Ok(())
        } else {
            Err(crate::error::ERC3643Error::TrustedIssuerNotFound.into())
        }
    }

    /// Update issuer claim topics
    pub fn update_issuer_topics(&mut self, issuer: Pubkey, claim_topics: Vec<u64>) -> Result<()> {
        require!(!claim_topics.is_empty(), crate::error::ERC3643Error::InvalidArgument);
        require!(claim_topics.len() <= MAX_CLAIM_TOPICS, crate::error::ERC3643Error::TooManyClaimTopics);

        if let Some(trusted_issuer) = self.issuers.iter_mut().find(|i| i.issuer == issuer) {
            trusted_issuer.claim_topics = claim_topics;
            self.updated_at = Clock::get()?.unix_timestamp;
            Ok(())
        } else {
            Err(crate::error::ERC3643Error::TrustedIssuerNotFound.into())
        }
    }

    /// Check if issuer is trusted for a specific claim topic
    pub fn is_trusted_for_topic(&self, issuer: &Pubkey, topic: u64) -> bool {
        self.issuers
            .iter()
            .any(|i| i.issuer == *issuer && i.is_active && i.claim_topics.contains(&topic))
    }

    /// Get all trusted issuers for a claim topic
    pub fn get_issuers_for_topic(&self, topic: u64) -> Vec<Pubkey> {
        self.issuers
            .iter()
            .filter(|i| i.is_active && i.claim_topics.contains(&topic))
            .map(|i| i.issuer)
            .collect()
    }
}

/// Individual trusted issuer entry
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TrustedIssuer {
    /// Issuer's public key
    pub issuer: Pubkey,
    
    /// Claim topics this issuer is trusted for
    pub claim_topics: Vec<u64>,
    
    /// When this issuer was added
    pub added_at: i64,
    
    /// Whether this issuer is currently active
    pub is_active: bool,
}

impl TrustedIssuer {
    pub const LEN: usize = 32 + // issuer
        (4 + MAX_CLAIM_TOPICS * 8) + // claim_topics (Vec<u64>)
        8 + // added_at
        1; // is_active
}

/// Claim topics registry
/// PDA: ["claim_topics", mint_pubkey]
#[account]
pub struct ClaimTopicsRegistry {
    /// The mint this registry is for
    pub mint: Pubkey,
    
    /// Required claim topics for verification
    pub required_topics: Vec<u64>,
    
    /// Timestamps
    pub created_at: i64,
    pub updated_at: i64,
    
    /// Reserved space
    pub reserved: [u8; 64],
}

impl ClaimTopicsRegistry {
    pub const LEN: usize = 8 + // discriminator
        32 + // mint
        (4 + MAX_CLAIM_TOPICS * 8) + // required_topics
        8 + // created_at
        8 + // updated_at
        64; // reserved

    /// Add a required claim topic
    pub fn add_topic(&mut self, topic: u64) -> Result<()> {
        require!(self.required_topics.len() < MAX_CLAIM_TOPICS, crate::error::ERC3643Error::TooManyClaimTopics);
        
        if self.required_topics.contains(&topic) {
            return Err(crate::error::ERC3643Error::ClaimTopicAlreadyExists.into());
        }

        self.required_topics.push(topic);
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Remove a required claim topic
    pub fn remove_topic(&mut self, topic: u64) -> Result<()> {
        if let Some(pos) = self.required_topics.iter().position(|&t| t == topic) {
            self.required_topics.remove(pos);
            self.updated_at = Clock::get()?.unix_timestamp;
            Ok(())
        } else {
            Err(crate::error::ERC3643Error::ClaimTopicNotFound.into())
        }
    }

    /// Check if topic is required
    pub fn is_topic_required(&self, topic: u64) -> bool {
        self.required_topics.contains(&topic)
    }

    /// Get all required topics
    pub fn get_required_topics(&self) -> &Vec<u64> {
        &self.required_topics
    }
}
