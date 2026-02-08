import { canonicalizeJSON } from '../canonicalize';
import { ConsentObjectV1, ScopeEntry } from './types';

type ConsentPayload = Omit<ConsentObjectV1, 'consent_hash'>;

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
 * Canonicalizes the consent payload for hashing.
 *
 * Per consent-object-spec.md Section 6-7:
 * - Excludes consent_hash (self-referential)
 * - Sorts scope array by (type, ref) in ascending lexicographic order
 * - Sorts permissions array in ascending lexicographic order
 * - Top-level keys in alphabetical order:
 *   action, expires_at, grantee, issued_at, permissions, prior_consent, scope, subject, version
 * - Scope entry keys in alphabetical order: ref, type
 * - Null values are included in the canonical payload
 */
export function canonicalizeConsentPayload(
  payload: ConsentPayload
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
    action: payload.action,
    expires_at: payload.expires_at,
    grantee: payload.grantee,
    issued_at: payload.issued_at,
    permissions: sortedPermissions,
    prior_consent: payload.prior_consent,
    scope: sortedScope.map(canonicalizeScopeEntry),
    subject: payload.subject,
    version: payload.version
  };

  const canonical = canonicalizeJSON(canonicalPayload);
  return new TextEncoder().encode(canonical);
}
