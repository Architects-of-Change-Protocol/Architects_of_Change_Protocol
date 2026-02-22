// --- Affiliation Types ---

export type AffiliationType = 'membership' | 'employment' | 'enrollment';

export type ConsentMode = 'standard' | 'institutional-affiliation';

/**
 * Binding that ties a consent to an institutional affiliation credential.
 * Used exclusively when consent_mode = 'institutional-affiliation'.
 *
 * Keys are alphabetically ordered in canonical payload.
 */
export type AffiliationBinding = {
  affiliation_credential_ref: string; // SHA-256 hash of the Verifiable Credential (64 hex)
  affiliation_type: AffiliationType;
  auto_expires_on_affiliation_change: boolean;
  institution_did: string;            // DID of the institution
};

// --- Temporal Policy ---

/**
 * Temporal policy governing renewal behaviour for a consent.
 * Stored outside the canonical hash as an advisory configuration.
 */
export type TemporalPolicy = {
  auto_renewal: boolean;              // default: false (manual renewal required)
  max_renewals: number | null;        // null = unlimited (only meaningful when renewable)
  renewal_window_seconds: number;     // how many seconds before expiry renewal is permitted
};

// --- Renewal Types ---

/**
 * Submitted by an institution to request renewal of an expiring consent.
 */
export type RenewalRequest = {
  prior_consent_hash: string;         // consent_hash of the consent being renewed (64 hex)
  requesting_grantee: string;         // DID of requesting institution
  proposed_expiration: string;        // ISO 8601 UTC: proposed new access_expiration_timestamp
  requires_user_signature: boolean;   // whether subject approval is required
  renewal_signature: string | null;   // subject's approval signature (when pre-authorised)
  requested_at: string;               // ISO 8601 UTC timestamp of the request
  renewal_reason: string | null;      // optional human-readable reason
};

export type RenewalStatus =
  | 'APPROVED'
  | 'DENIED'
  | 'PENDING_SUBJECT_SIGNATURE';

/**
 * Result returned by the vault's renewal handler.
 */
export type RenewalResponse = {
  status: RenewalStatus;
  new_consent_hash: string | null;      // hash of newly issued consent (APPROVED only)
  denial_reason: string | null;         // human-readable reason (DENIED only)
  signature_request_id: string | null;  // tracking id (PENDING only)
};

// --- Access Ledger ---

export type LedgerEventType =
  | 'ACCESS_GRANTED'
  | 'ACCESS_DENIED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'RENEWED'
  | 'AFFILIATION_REVOKED';

/**
 * Immutable entry recorded in the Access Ledger for every significant event.
 */
export type AccessLedgerEntry = {
  entry_id: string;                   // 64 hex random identifier
  event_type: LedgerEventType;
  capability_hash: string;            // token involved (64 hex)
  consent_hash: string;               // consent involved (64 hex)
  subject: string;                    // DID of data owner
  grantee: string;                    // DID of accessor
  timestamp: string;                  // ISO 8601 UTC
  reason_code: string | null;         // structured code if DENIED/EXPIRED/REVOKED
  metadata: Record<string, string> | null;
};
