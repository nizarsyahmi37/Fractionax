use anchor_lang::prelude::*;

/// Event emitted when token information is updated
#[event]
pub struct UpdatedTokenInformation {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub version: String,
    pub onchain_id: Pubkey,
}

/// Event emitted when identity registry is set
#[event]
pub struct IdentityRegistryAdded {
    pub identity_registry: Pubkey,
}

/// Event emitted when compliance is set
#[event]
pub struct ComplianceAdded {
    pub compliance: Pubkey,
}

/// Event emitted when recovery is successful
#[event]
pub struct RecoverySuccess {
    pub lost_wallet: Pubkey,
    pub new_wallet: Pubkey,
    pub investor_onchain_id: Pubkey,
}

/// Event emitted when address is frozen/unfrozen
#[event]
pub struct AddressFrozen {
    pub user_address: Pubkey,
    pub is_frozen: bool,
    pub agent: Pubkey,
}

/// Event emitted when tokens are frozen
#[event]
pub struct TokensFrozen {
    pub user_address: Pubkey,
    pub amount: u64,
}

/// Event emitted when tokens are unfrozen
#[event]
pub struct TokensUnfrozen {
    pub user_address: Pubkey,
    pub amount: u64,
}

/// Event emitted when token is paused
#[event]
pub struct Paused {
    pub user_address: Pubkey,
}

/// Event emitted when token is unpaused
#[event]
pub struct Unpaused {
    pub user_address: Pubkey,
}

/// Event emitted when identity is registered
#[event]
pub struct IdentityRegistered {
    pub investor_address: Pubkey,
    pub identity: Pubkey,
}

/// Event emitted when identity is removed
#[event]
pub struct IdentityRemoved {
    pub investor_address: Pubkey,
    pub identity: Pubkey,
}

/// Event emitted when identity is updated
#[event]
pub struct IdentityUpdated {
    pub old_identity: Pubkey,
    pub new_identity: Pubkey,
}

/// Event emitted when country is updated
#[event]
pub struct CountryUpdated {
    pub investor_address: Pubkey,
    pub country: u16,
}

/// Event emitted when claim is added
#[event]
pub struct ClaimAdded {
    pub claim_id: [u8; 32],
    pub topic: u64,
    pub scheme: u64,
    pub issuer: Pubkey,
    pub signature: Vec<u8>,
    pub data: Vec<u8>,
    pub uri: String,
}

/// Event emitted when claim is removed
#[event]
pub struct ClaimRemoved {
    pub claim_id: [u8; 32],
    pub topic: u64,
    pub scheme: u64,
    pub issuer: Pubkey,
    pub signature: Vec<u8>,
    pub data: Vec<u8>,
    pub uri: String,
}

/// Event emitted when claim is changed
#[event]
pub struct ClaimChanged {
    pub claim_id: [u8; 32],
    pub topic: u64,
    pub scheme: u64,
    pub issuer: Pubkey,
    pub signature: Vec<u8>,
    pub data: Vec<u8>,
    pub uri: String,
}

/// Event emitted when claim is revoked
#[event]
pub struct ClaimRevoked {
    pub signature: Vec<u8>,
}

/// Event emitted when trusted issuer is added
#[event]
pub struct TrustedIssuerAdded {
    pub trusted_issuer: Pubkey,
    pub claim_topics: Vec<u64>,
}

/// Event emitted when trusted issuer is removed
#[event]
pub struct TrustedIssuerRemoved {
    pub trusted_issuer: Pubkey,
}

/// Event emitted when claim topics are updated for issuer
#[event]
pub struct ClaimTopicsUpdated {
    pub trusted_issuer: Pubkey,
    pub claim_topics: Vec<u64>,
}

/// Event emitted when claim topic is added
#[event]
pub struct ClaimTopicAdded {
    pub claim_topic: u64,
}

/// Event emitted when claim topic is removed
#[event]
pub struct ClaimTopicRemoved {
    pub claim_topic: u64,
}

/// Event emitted when transfer is validated
#[event]
pub struct TransferValidated {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub allowed: bool,
    pub reason: String,
}

/// Event emitted when compliance check is performed
#[event]
pub struct ComplianceCheck {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub result: bool,
    pub module: String,
}

/// Event emitted when agent is added
#[event]
pub struct AgentAdded {
    pub agent: Pubkey,
    pub added_by: Pubkey,
}

/// Event emitted when agent is removed
#[event]
pub struct AgentRemoved {
    pub agent: Pubkey,
    pub removed_by: Pubkey,
}

/// Event emitted when ownership is transferred
#[event]
pub struct OwnershipTransferred {
    pub previous_owner: Pubkey,
    pub new_owner: Pubkey,
}

/// Event emitted when mint authority is transferred
#[event]
pub struct MintAuthorityTransferred {
    pub previous_authority: Pubkey,
    pub new_authority: Pubkey,
}

/// Event emitted when freeze authority is transferred
#[event]
pub struct FreezeAuthorityTransferred {
    pub previous_authority: Pubkey,
    pub new_authority: Pubkey,
}

/// Event emitted when transfer hook is configured
#[event]
pub struct TransferHookConfigured {
    pub mint: Pubkey,
    pub hook_program: Pubkey,
}

/// Event emitted when fallback mode is toggled
#[event]
pub struct FallbackModeToggled {
    pub enabled: bool,
    pub changed_by: Pubkey,
}

/// Event emitted for batch operations
#[event]
pub struct BatchOperationCompleted {
    pub operation_type: String,
    pub count: u32,
    pub success_count: u32,
    pub failure_count: u32,
}

/// Event emitted when compliance module is added
#[event]
pub struct ComplianceModuleAdded {
    pub module: Pubkey,
    pub module_type: String,
}

/// Event emitted when compliance module is removed
#[event]
pub struct ComplianceModuleRemoved {
    pub module: Pubkey,
    pub module_type: String,
}
