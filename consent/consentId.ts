import { ConsentObjectV1 } from './types';

const VERSION_PATTERN = /^[0-9]+\.[0-9]+$/;
const HASH_HEX_PATTERN = /^[a-f0-9]{64}$/;

/**
 * Builds a consent URI identifier per consent-object-spec.md Section 8.
 *
 * Format: aoc://consent/v{major}/{minor}/0x{consent_hash}
 * Example: aoc://consent/v1/0/0xa1b2c3...
 */
export function buildConsentId(consent: ConsentObjectV1): string {
  if (
    typeof consent.version !== 'string' ||
    !VERSION_PATTERN.test(consent.version)
  ) {
    throw new Error(
      'Consent version must match pattern MAJOR.MINOR (e.g., "1.0").'
    );
  }
  if (
    typeof consent.consent_hash !== 'string' ||
    !HASH_HEX_PATTERN.test(consent.consent_hash)
  ) {
    throw new Error(
      'Consent hash must be 64 lowercase hex characters.'
    );
  }

  const [major, minor] = consent.version.split('.');
  return `aoc://consent/v${major}/${minor}/0x${consent.consent_hash}`;
}
