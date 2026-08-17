"use strict";
/**
 * Canonical identities for the eight AOC Protocol Sovereignty Capabilities.
 *
 * These are the "sovereignty minerals": the fixed inventory of sovereignty
 * properties AOC Protocol itself defines. They are deliberately NOT the same
 * concept as any of the repository's pre-existing `Capability*` models, all of
 * which describe a *grant* — permission to do something — rather than a
 * sovereignty property the Protocol provides:
 *
 *   - `CapabilityToken` / `CapabilityGrant` (the `@aoc/protocol/contracts`
 *     subpath) — bearer authorization over a resource.
 *   - `ProtocolCapabilityDefinition` (the legacy wallet/portfolio/insight
 *     financial permission catalog) — a domain permission entry.
 *   - `RuntimeCapability` / delegation + consent capability types
 *     — runtime execution authorization.
 *
 * Every public symbol here is therefore sovereignty-qualified so the two
 * vocabularies can coexist without ambiguity. SM-01 renames nothing; the
 * legacy models are untouched.
 *
 * Identifier grammar follows the existing AOC identifier scheme established by
 * `SovereignAssetId` (`aoc:sovereign-asset:<uuid>`): a lowercase, colon
 * separated `aoc:<namespace>:<slug>`. Unlike a SovereignAssetId, a Sovereignty
 * Capability id is never minted — it is a fixed, deterministic, human-readable
 * constant of the Protocol itself, independent of any subject, provider,
 * grant, evidence record or runtime.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOVEREIGNTY_CAPABILITY_IDS = exports.SOVEREIGNTY_CAPABILITY_KEYS = exports.SOVEREIGNTY_CAPABILITY_NAMESPACE = void 0;
exports.isSovereigntyCapabilityId = isSovereigntyCapabilityId;
exports.isSovereigntyCapabilityKey = isSovereigntyCapabilityKey;
/** Namespace segment shared by every canonical Sovereignty Capability id. */
exports.SOVEREIGNTY_CAPABILITY_NAMESPACE = 'aoc:sovereignty-capability';
/**
 * The canonical enumeration order of the Sovereignty Capabilities. Every
 * ordered surface in this module derives from this single tuple, so adding a
 * future canonical capability means editing this list, its definition, and its
 * tests — nothing else.
 */
exports.SOVEREIGNTY_CAPABILITY_KEYS = Object.freeze([
    'identity',
    'integrity',
    'provenance',
    'portability',
    'interoperability',
    'verifiability',
    'licensing_terms',
    'governance_compatibility',
]);
/**
 * Slug used as the final segment of the canonical id. It is the key in
 * kebab-case, kept explicit rather than derived so the serialized identity can
 * never change as a side effect of a key rename.
 */
const SOVEREIGNTY_CAPABILITY_SLUGS = Object.freeze({
    identity: 'identity',
    integrity: 'integrity',
    provenance: 'provenance',
    portability: 'portability',
    interoperability: 'interoperability',
    verifiability: 'verifiability',
    licensing_terms: 'licensing-terms',
    governance_compatibility: 'governance-compatibility',
});
exports.SOVEREIGNTY_CAPABILITY_IDS = Object.freeze({
    identity: `${exports.SOVEREIGNTY_CAPABILITY_NAMESPACE}:${SOVEREIGNTY_CAPABILITY_SLUGS.identity}`,
    integrity: `${exports.SOVEREIGNTY_CAPABILITY_NAMESPACE}:${SOVEREIGNTY_CAPABILITY_SLUGS.integrity}`,
    provenance: `${exports.SOVEREIGNTY_CAPABILITY_NAMESPACE}:${SOVEREIGNTY_CAPABILITY_SLUGS.provenance}`,
    portability: `${exports.SOVEREIGNTY_CAPABILITY_NAMESPACE}:${SOVEREIGNTY_CAPABILITY_SLUGS.portability}`,
    interoperability: `${exports.SOVEREIGNTY_CAPABILITY_NAMESPACE}:${SOVEREIGNTY_CAPABILITY_SLUGS.interoperability}`,
    verifiability: `${exports.SOVEREIGNTY_CAPABILITY_NAMESPACE}:${SOVEREIGNTY_CAPABILITY_SLUGS.verifiability}`,
    licensing_terms: `${exports.SOVEREIGNTY_CAPABILITY_NAMESPACE}:${SOVEREIGNTY_CAPABILITY_SLUGS.licensing_terms}`,
    governance_compatibility: `${exports.SOVEREIGNTY_CAPABILITY_NAMESPACE}:${SOVEREIGNTY_CAPABILITY_SLUGS.governance_compatibility}`,
});
const CANONICAL_IDS = new Set(Object.values(exports.SOVEREIGNTY_CAPABILITY_IDS));
const CANONICAL_KEYS = new Set(exports.SOVEREIGNTY_CAPABILITY_KEYS);
/**
 * Structural + membership check. Unlike `isValidSovereignAssetId`, this is not
 * a shape test over an open value space: the canonical inventory is closed, so
 * a value is a Sovereignty Capability id only if it is one of the eight.
 */
function isSovereigntyCapabilityId(value) {
    return typeof value === 'string' && CANONICAL_IDS.has(value);
}
function isSovereigntyCapabilityKey(value) {
    return typeof value === 'string' && CANONICAL_KEYS.has(value);
}
