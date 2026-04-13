export type KycLevel = 'basic' | 'enhanced' | 'institutional';

export type IdentityIssuer = {
  issuer_id: string;
  display_name: string;
  active: boolean;
  supported_kyc_levels: readonly KycLevel[];
};

// aoc_identity_issuers
export type AocIdentityIssuerRecord = IdentityIssuer;

// aoc_identity_credentials
export type AocIdentityCredentialRecord = {
  credential_ref: string;
  subject_hash: string;
  issuer_id: string;
  credential_hash: string;
  kyc_level: KycLevel;
  metadata_hash: string;
  wallet_address?: string;
  issued_at: string;
  expires_at?: string;
  revoked_at?: string;
};

// aoc_identity_consents
export type AocIdentityConsentRecord = {
  consent_id: string;
  subject_hash: string;
  consumer_id: string;
  issuer_id: string;
  granted_at: string;
  revoked_at?: string;
};

// Compatibility extension of rlusd_withdrawal_requests
export type RlusdWithdrawalRequest = {
  withdrawal_id: string;
  subject_hash: string;
  consumer_id: string;
  amount: string;
  wallet_address: string;
  identity_ref?: string;
  identity_issuer?: string;
  kyc_level?: KycLevel;
};

export type IdentityVerificationResult = {
  valid: boolean;
  issuer?: string;
  kyc_level?: KycLevel;
  reason_code: 'VERIFIED' | 'NOT_FOUND' | 'ISSUER_INACTIVE' | 'EXPIRED' | 'REVOKED' | 'CONSENT_REQUIRED';
};

export type TrustAuditEvent = {
  event_type:
    | 'CREDENTIAL_REGISTERED'
    | 'VERIFICATION_PERFORMED'
    | 'CONSENT_GRANTED'
    | 'WALLET_LINKED'
    | 'PAYOUT_BLOCKED'
    | 'PAYOUT_ALLOWED';
  at: string;
  subject_hash: string;
  consumer_id?: string;
  issuer_id?: string;
  credential_ref?: string;
  reason_code?: string;
};
