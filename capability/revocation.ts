const HASH_HEX_PATTERN = /^[a-f0-9]{64}$/;

// In-memory revocation registry (v0.1 — no persistence layer)
const revokedTokens = new Set<string>();

/**
 * Revokes a capability token by its capability_hash.
 * Once revoked, verification of the token will fail.
 *
 * @param capabilityHash - The capability_hash of the token to revoke
 * @throws If the hash is not a valid 64-character lowercase hex string
 */
export function revokeCapabilityToken(capabilityHash: string): void {
  if (
    typeof capabilityHash !== 'string' ||
    !HASH_HEX_PATTERN.test(capabilityHash)
  ) {
    throw new Error(
      'Revocation target must be a valid capability_hash (64 lowercase hex characters).'
    );
  }
  revokedTokens.add(capabilityHash);
}

/**
 * Checks whether a capability token has been revoked.
 *
 * @param capabilityHash - The capability_hash to check
 * @returns true if the token has been revoked
 */
export function isRevoked(capabilityHash: string): boolean {
  return revokedTokens.has(capabilityHash);
}

/**
 * Resets the revocation registry. Intended for testing only.
 */
export function resetRevocationRegistry(): void {
  revokedTokens.clear();
}
