/**
 * SemVer-shaped version of a Sovereignty Capability's own semantic contract.
 *
 * This is a first-class property of the capability, and is intentionally
 * independent of every other version in the repository:
 *
 *   capabilityVersion != @aoc/protocol package version
 *   capabilityVersion != SignedSovereignManifest.manifestVersion
 *   capabilityVersion != CapabilityToken.schemaVersion
 *   capabilityVersion != CANONICAL_JSON_PROFILE (canonicalization profile)
 *   capabilityVersion != AdapterToken.contractVersion
 *
 * It exists so a later work package can record, unambiguously, that an
 * operation consumed a specific version of a specific sovereignty capability.
 *
 * The template literal is a cheap compile-time filter, not the contract:
 * TypeScript's `${number}` also admits negatives, exponent notation and extra
 * dotted segments (`-1.2.3`, `1e2.0.0`, `1.2.3.4` all satisfy it). A concrete
 * type alias cannot express "one or more digits" for an unbounded numeric
 * string, and a branded type would force every consumer to parse a version
 * before constructing one — heavier than this contract needs. The authoritative
 * rule is therefore `isSovereigntyCapabilityVersion`, which any consumer
 * validating or persisting a version should use.
 */
export type SovereigntyCapabilityVersion = `${number}.${number}.${number}`;

const CAPABILITY_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

/**
 * Authoritative structural check for a capability version: exactly three
 * dot-separated runs of digits, no sign, exponent, pre-release or build
 * metadata. Every canonical definition satisfies this.
 */
export function isSovereigntyCapabilityVersion(value: unknown): value is SovereigntyCapabilityVersion {
  return typeof value === 'string' && CAPABILITY_VERSION_PATTERN.test(value);
}
