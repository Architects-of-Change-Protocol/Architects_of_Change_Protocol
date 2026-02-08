import { canonicalizeJSON } from '../canonicalize';
import { CapabilityTokenV1, ScopeEntry } from './types';

export type CapabilityPayload = Omit<CapabilityTokenV1, 'capability_hash'>;

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
