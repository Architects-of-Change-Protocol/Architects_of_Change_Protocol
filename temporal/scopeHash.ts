import { canonicalizeJSON } from '../canonicalize';
import { sha256Hex } from '../storage/hash';
import type { ScopeEntry } from '../consent/types';

export type ScopeHashInput = {
  scope: ScopeEntry[];
  access_start_timestamp: string;
  access_expiration_timestamp: string;
};

/**
 * Computes the access_scope_hash — a cryptographic commitment binding the
 * selected scope entries AND the temporal access window into a single digest.
 *
 * This satisfies the protocol requirement:
 *   "Time constraints must be hash-bound to Consent Object"
 *
 * Canonical key order (alphabetical):
 *   access_expiration_timestamp, access_start_timestamp, scope
 *
 * Within scope entries: ref, type (alphabetical).
 * Scope array sorted by (type, ref) ascending lexicographic order.
 */
export function computeAccessScopeHash(input: ScopeHashInput): string {
  const sortedScope = [...input.scope].sort((a, b) => {
    const typeCmp = a.type.localeCompare(b.type);
    if (typeCmp !== 0) return typeCmp;
    return a.ref.localeCompare(b.ref);
  });

  const payload = {
    access_expiration_timestamp: input.access_expiration_timestamp,
    access_start_timestamp: input.access_start_timestamp,
    scope: sortedScope.map(e => ({ ref: e.ref, type: e.type })),
  };

  const canonical = canonicalizeJSON(payload);
  const bytes = new TextEncoder().encode(canonical);
  return sha256Hex(bytes);
}

/**
 * Verifies that a given access_scope_hash matches the recomputed value
 * for the supplied scope + temporal window.
 *
 * Throws if verification fails.
 */
export function verifyAccessScopeHash(
  claimed_hash: string,
  input: ScopeHashInput
): void {
  const expected = computeAccessScopeHash(input);
  if (claimed_hash !== expected) {
    throw new Error(
      'access_scope_hash does not match recomputed value — temporal or scope binding has been tampered with.'
    );
  }
}
