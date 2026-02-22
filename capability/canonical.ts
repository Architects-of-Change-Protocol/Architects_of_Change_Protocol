import { canonicalizeJSON } from '../canonicalize';
import { CapabilityTokenV1, CapabilityTokenV2, ScopeEntry } from './types';

export type CapabilityPayload = Omit<CapabilityTokenV1, 'capability_hash'>;
export type CapabilityV2Payload = Omit<CapabilityTokenV2, 'capability_hash'>;

/**
 * Canonicalizes a single ScopeEntry for deterministic encoding.
 * Keys are sorted alphabetically: ref, type.
 */
function canonicalizeScopeEntry(entry: ScopeEntry): object {
  return {
    ref: entry.ref,
    type: entry.type
  };
}

/**
 * Canonicalizes the capability token payload for hashing.
 *
 * Per capability-token-spec.md Section 7:
 * - Excludes capability_hash (self-referential)
 * - Sorts scope array by (type, ref) in ascending lexicographic order
 * - Sorts permissions array in ascending lexicographic order
 * - Top-level keys in alphabetical order:
 *   consent_ref, expires_at, grantee, issued_at, not_before,
 *   permissions, scope, subject, token_id, version
 * - Scope entry keys in alphabetical order: ref, type
 * - Null values are included in the canonical payload
 */
export function canonicalizeCapabilityPayload(
  payload: CapabilityPayload
): Uint8Array {
  // Sort scope entries by (type, ref) in ascending lexicographic order
  const sortedScope = [...payload.scope].sort((a, b) => {
    const typeCmp = a.type.localeCompare(b.type);
    if (typeCmp !== 0) return typeCmp;
    return a.ref.localeCompare(b.ref);
  });

  // Sort permissions in ascending lexicographic order
  const sortedPermissions = [...payload.permissions].sort();

  // Build canonical payload with keys in alphabetical order
  const canonicalPayload = {
    consent_ref: payload.consent_ref,
    expires_at: payload.expires_at,
    grantee: payload.grantee,
    issued_at: payload.issued_at,
    not_before: payload.not_before,
    permissions: sortedPermissions,
    scope: sortedScope.map(canonicalizeScopeEntry),
    subject: payload.subject,
    token_id: payload.token_id,
    version: payload.version
  };

  const canonical = canonicalizeJSON(canonicalPayload);
  return new TextEncoder().encode(canonical);
}

/**
 * Canonicalizes a CapabilityTokenV2 payload for hashing.
 *
 * Per temporal-consent-spec.md (Capability Token section):
 * - Excludes capability_hash (self-referential)
 * - Includes all V2 fields
 * - Top-level keys in strict alphabetical order:
 *     bound_consent_hash, consent_ref, expires_at, grantee, issued_at,
 *     issuer_signature, not_before, permissions, renewal_generation,
 *     scope, subject, token_id, version
 * - Null values MUST be included literally
 */
export function canonicalizeCapabilityV2Payload(
  payload: CapabilityV2Payload
): Uint8Array {
  const sortedScope = [...payload.scope].sort((a, b) => {
    const typeCmp = a.type.localeCompare(b.type);
    if (typeCmp !== 0) return typeCmp;
    return a.ref.localeCompare(b.ref);
  });

  const sortedPermissions = [...payload.permissions].sort();

  // Keys in strict alphabetical order
  const canonicalPayload = {
    bound_consent_hash: payload.bound_consent_hash,
    consent_ref: payload.consent_ref,
    expires_at: payload.expires_at,
    grantee: payload.grantee,
    issued_at: payload.issued_at,
    issuer_signature: payload.issuer_signature,
    not_before: payload.not_before,
    permissions: sortedPermissions,
    renewal_generation: payload.renewal_generation,
    scope: sortedScope.map(canonicalizeScopeEntry),
    subject: payload.subject,
    token_id: payload.token_id,
    version: payload.version,
  };

  const canonical = canonicalizeJSON(canonicalPayload);
  return new TextEncoder().encode(canonical);
}
