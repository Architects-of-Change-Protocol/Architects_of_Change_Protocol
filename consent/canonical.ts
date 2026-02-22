import { canonicalizeJSON } from '../canonicalize';
import { ConsentObjectV1, ConsentObjectV2, ScopeEntry } from './types';

export type ConsentPayload = Omit<ConsentObjectV1, 'consent_hash'>;
export type ConsentV2Payload = Omit<ConsentObjectV2, 'consent_hash'>;

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

/**
 * Canonicalizes a ConsentObjectV2 payload for hashing.
 *
 * Per temporal-consent-spec.md:
 * - Excludes consent_hash (self-referential)
 * - Includes ALL V2 fields in the canonical payload
 * - Top-level keys in strict alphabetical order:
 *     access_expiration_timestamp, access_scope_hash, access_start_timestamp,
 *     action, affiliation, consent_mode, expires_at, grantee, issued_at,
 *     max_renewals, permissions, prior_consent, renewable, renewal_count,
 *     scope, subject, version
 * - Scope entry keys in alphabetical order: ref, type
 * - Affiliation entry keys in alphabetical order (when non-null):
 *     affiliation_credential_ref, affiliation_type,
 *     auto_expires_on_affiliation_change, institution_did
 * - Null values MUST be included literally
 */
export function canonicalizeConsentV2Payload(
  payload: ConsentV2Payload
): Uint8Array {
  // Sort scope entries by (type, ref)
  const sortedScope = [...payload.scope].sort((a, b) => {
    const typeCmp = a.type.localeCompare(b.type);
    if (typeCmp !== 0) return typeCmp;
    return a.ref.localeCompare(b.ref);
  });

  // Sort permissions
  const sortedPermissions = [...payload.permissions].sort();

  // Canonicalize affiliation (keys in alphabetical order) or null
  const canonicalAffiliation =
    payload.affiliation === null
      ? null
      : {
          affiliation_credential_ref: payload.affiliation.affiliation_credential_ref,
          affiliation_type: payload.affiliation.affiliation_type,
          auto_expires_on_affiliation_change:
            payload.affiliation.auto_expires_on_affiliation_change,
          institution_did: payload.affiliation.institution_did,
        };

  // Build canonical payload with keys in strict alphabetical order
  const canonicalPayload = {
    access_expiration_timestamp: payload.access_expiration_timestamp,
    access_scope_hash: payload.access_scope_hash,
    access_start_timestamp: payload.access_start_timestamp,
    action: payload.action,
    affiliation: canonicalAffiliation,
    consent_mode: payload.consent_mode,
    expires_at: payload.expires_at,
    grantee: payload.grantee,
    issued_at: payload.issued_at,
    max_renewals: payload.max_renewals,
    permissions: sortedPermissions,
    prior_consent: payload.prior_consent,
    renewable: payload.renewable,
    renewal_count: payload.renewal_count,
    scope: sortedScope.map(canonicalizeScopeEntry),
    subject: payload.subject,
    version: payload.version,
  };

  const canonical = canonicalizeJSON(canonicalPayload);
  return new TextEncoder().encode(canonical);
}
