import type { ScopeEntry } from '../consent/types';

export type { ScopeEntry };

export type CapabilityTokenV1 = {
  version: string;
  subject: string;
  grantee: string;
  consent_ref: string;
  scope: ScopeEntry[];
  permissions: string[];
  issued_at: string;
  not_before: string | null;
  expires_at: string;
  token_id: string;
  capability_hash: string;
};

export type MintCapabilityOptions = {
  now?: Date;
  not_before?: string | null;
};

// ---------------------------------------------------------------------------
// Capability Token V2 — Temporal Consent Control
// ---------------------------------------------------------------------------

/**
 * CapabilityTokenV2 extends V1 with explicit temporal binding fields.
 *
 * Additions:
 *  - bound_consent_hash:   equals consent_ref; surfaced explicitly so verifiers
 *                          can validate temporal binding without ambiguity
 *  - renewal_generation:   0 for original mint; incremented by 1 per renewal cycle
 *  - issuer_signature:     placeholder for subject's digital signature over
 *                          capability_hash (key management is outside spec scope)
 *
 * All new fields are included in the canonical payload and covered by capability_hash.
 * Version is "2.0".
 */
export type CapabilityTokenV2 = {
  version: string;              // "2.0"
  subject: string;
  grantee: string;
  consent_ref: string;
  scope: ScopeEntry[];
  permissions: string[];
  issued_at: string;
  not_before: string | null;
  expires_at: string;
  token_id: string;
  capability_hash: string;

  // V2 additions
  bound_consent_hash: string;   // == consent_ref; explicit temporal-binding field
  renewal_generation: number;   // 0 = original; +1 per renewal cycle
  issuer_signature: string | null; // placeholder; out of spec scope for key management
};

export type MintCapabilityV2Options = {
  now?: Date;
  not_before?: string | null;
  renewal_generation?: number;   // defaults to 0
  issuer_signature?: string | null; // defaults to null
};
