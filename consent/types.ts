export type ScopeEntry = {
  type: 'field' | 'content' | 'pack';
  ref: string;
};

export type ConsentObjectV1 = {
  version: string;
  subject: string;
  grantee: string;
  action: 'grant' | 'revoke';
  scope: ScopeEntry[];
  permissions: string[];
  issued_at: string;
  expires_at: string | null;
  prior_consent: string | null;
  consent_hash: string;
};

export type BuildConsentOptions = {
  now?: Date;
  expires_at?: string | null;
  prior_consent?: string | null;
};

// ---------------------------------------------------------------------------
// Consent Object V2 — Temporal Consent Control
// ---------------------------------------------------------------------------

import type { AffiliationBinding, ConsentMode } from '../temporal/types';
export type { AffiliationBinding, ConsentMode } from '../temporal/types';

/**
 * ConsentObjectV2 extends V1 with explicit temporal access control fields.
 *
 * Key additions:
 *  - access_start_timestamp:      explicit window start (may differ from issued_at)
 *  - access_expiration_timestamp: REQUIRED (non-null) expiration for V2
 *  - renewable:                   whether renewal is permitted
 *  - max_renewals:                optional cap on renewal cycles
 *  - renewal_count:               current generation (0 = original, +1 per renewal)
 *  - access_scope_hash:           SHA-256 commitment over (scope + start + expiration)
 *  - consent_mode:                'standard' | 'institutional-affiliation'
 *  - affiliation:                 binding to a Verifiable Credential (affiliation mode only)
 *
 * All new fields are included in the canonical payload and therefore covered
 * by the consent_hash.  Version is "2.0".
 */
export type ConsentObjectV2 = {
  version: string;                              // "2.0"
  subject: string;
  grantee: string;
  action: 'grant' | 'revoke';
  scope: ScopeEntry[];
  permissions: string[];
  issued_at: string;
  expires_at: string;                           // REQUIRED (equals access_expiration_timestamp)
  prior_consent: string | null;
  consent_hash: string;

  // --- V2 temporal extension ---
  access_start_timestamp: string;               // ISO 8601 UTC: explicit access window open
  access_expiration_timestamp: string;          // ISO 8601 UTC: explicit access window close
  renewable: boolean;
  max_renewals: number | null;                  // null = unlimited when renewable=true
  renewal_count: number;                        // 0 for original grant
  access_scope_hash: string;                    // SHA-256(scope + start + expiration)
  consent_mode: ConsentMode;
  affiliation: AffiliationBinding | null;       // non-null iff consent_mode = 'institutional-affiliation'
};

export type BuildConsentV2Options = {
  now?: Date;
  prior_consent?: string | null;
  access_start_timestamp?: string;              // defaults to issued_at
  renewable?: boolean;                          // defaults to false
  max_renewals?: number | null;                 // defaults to null
  renewal_count?: number;                       // defaults to 0
  consent_mode?: ConsentMode;                   // defaults to 'standard'
  affiliation?: AffiliationBinding | null;      // defaults to null
};
