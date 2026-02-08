import { CapabilityTokenV1 } from './types';

const VERSION_PATTERN = /^[0-9]+\.[0-9]+$/;
const HASH_HEX_PATTERN = /^[a-f0-9]{64}$/;

/**
 * Builds a capability token URI identifier per capability-token-spec.md Section 9.
 *
 * Format: aoc://capability/v{major}/{minor}/0x{capability_hash}
 * Example: aoc://capability/v1/0/0xa1b2c3...
 */
export function buildCapabilityId(token: CapabilityTokenV1): string {
  if (
    typeof token.version !== 'string' ||
    !VERSION_PATTERN.test(token.version)
  ) {
    throw new Error(
      'Capability version must match pattern MAJOR.MINOR (e.g., "1.0").'
    );
  }
  if (
    typeof token.capability_hash !== 'string' ||
    !HASH_HEX_PATTERN.test(token.capability_hash)
  ) {
    throw new Error(
      'Capability hash must be 64 lowercase hex characters.'
    );
  }

  const [major, minor] = token.version.split('.');
  return `aoc://capability/v${major}/${minor}/0x${token.capability_hash}`;
}
