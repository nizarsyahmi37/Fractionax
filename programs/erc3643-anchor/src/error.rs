use anchor_lang::prelude::*;

#[error_code]
pub enum ERC3643Error {
    #[msg("Token is paused")]
    TokenPaused,
    
    #[msg("Address is frozen")]
    AddressFrozen,
    
    #[msg("Insufficient balance")]
    InsufficientBalance,
    
    #[msg("Identity not verified")]
    IdentityNotVerified,
    
    #[msg("Transfer not compliant")]
    TransferNotCompliant,
    
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("Invalid argument")]
    InvalidArgument,
    
    #[msg("Identity already registered")]
    IdentityAlreadyRegistered,
    
    #[msg("Identity not found")]
    IdentityNotFound,
    
    #[msg("Claim not found")]
    ClaimNotFound,
    
    #[msg("Claim already exists")]
    ClaimAlreadyExists,
    
    #[msg("Invalid claim signature")]
    InvalidClaimSignature,
    
    #[msg("Claim expired")]
    ClaimExpired,
    
    #[msg("Claim revoked")]
    ClaimRevoked,
    
    #[msg("Trusted issuer not found")]
    TrustedIssuerNotFound,
    
    #[msg("Trusted issuer already exists")]
    TrustedIssuerAlreadyExists,
    
    #[msg("Too many trusted issuers")]
    TooManyTrustedIssuers,
    
    #[msg("Too many claim topics")]
    TooManyClaimTopics,
    
    #[msg("Claim topic not found")]
    ClaimTopicNotFound,
    
    #[msg("Claim topic already exists")]
    ClaimTopicAlreadyExists,
    
    #[msg("Invalid country code")]
    InvalidCountryCode,
    
    #[msg("Insufficient frozen tokens")]
    InsufficientFrozenTokens,
    
    #[msg("Cannot freeze more than balance")]
    CannotFreezeMoreThanBalance,
    
    #[msg("Agent role required")]
    AgentRoleRequired,
    
    #[msg("Owner role required")]
    OwnerRoleRequired,
    
    #[msg("Issuer role required")]
    IssuerRoleRequired,
    
    #[msg("Invalid mint authority")]
    InvalidMintAuthority,
    
    #[msg("Invalid freeze authority")]
    InvalidFreezeAuthority,
    
    #[msg("Transfer hook not configured")]
    TransferHookNotConfigured,
    
    #[msg("Fallback mode not enabled")]
    FallbackModeNotEnabled,
    
    #[msg("Account size mismatch")]
    AccountSizeMismatch,
    
    #[msg("Invalid PDA derivation")]
    InvalidPDADerivation,
    
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    
    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,
    
    #[msg("Invalid token program")]
    InvalidTokenProgram,
    
    #[msg("Invalid associated token account")]
    InvalidAssociatedTokenAccount,
    
    #[msg("Recovery not allowed")]
    RecoveryNotAllowed,
    
    #[msg("Invalid recovery identity")]
    InvalidRecoveryIdentity,
    
    #[msg("Same wallet recovery")]
    SameWalletRecovery,
    
    #[msg("Batch operation limit exceeded")]
    BatchOperationLimitExceeded,
    
    #[msg("Invalid URI format")]
    InvalidURIFormat,
    
    #[msg("Data too large")]
    DataTooLarge,
    
    #[msg("Signature too large")]
    SignatureTooLarge,
    
    #[msg("Name too long")]
    NameTooLong,
    
    #[msg("Symbol too long")]
    SymbolTooLong,
    
    #[msg("Invalid decimals")]
    InvalidDecimals,
    
    #[msg("Zero address not allowed")]
    ZeroAddressNotAllowed,
    
    #[msg("Self transfer not allowed")]
    SelfTransferNotAllowed,
    
    #[msg("Invalid amount")]
    InvalidAmount,
    
    #[msg("Token already initialized")]
    TokenAlreadyInitialized,
    
    #[msg("Compliance module not found")]
    ComplianceModuleNotFound,
    
    #[msg("Invalid compliance configuration")]
    InvalidComplianceConfiguration,
    
    #[msg("Transfer limit exceeded")]
    TransferLimitExceeded,
    
    #[msg("Daily limit exceeded")]
    DailyLimitExceeded,
    
    #[msg("Monthly limit exceeded")]
    MonthlyLimitExceeded,
    
    #[msg("Country not allowed")]
    CountryNotAllowed,
    
    #[msg("Investor limit reached")]
    InvestorLimitReached,
    
    #[msg("Minimum holding not met")]
    MinimumHoldingNotMet,
    
    #[msg("Maximum holding exceeded")]
    MaximumHoldingExceeded,
    
    #[msg("Lock period active")]
    LockPeriodActive,
    
    #[msg("Whitelist required")]
    WhitelistRequired,
    
    #[msg("Blacklist violation")]
    BlacklistViolation,
}
