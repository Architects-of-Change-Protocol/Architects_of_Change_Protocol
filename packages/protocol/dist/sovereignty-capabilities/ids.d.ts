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
/** Namespace segment shared by every canonical Sovereignty Capability id. */
export declare const SOVEREIGNTY_CAPABILITY_NAMESPACE: "aoc:sovereignty-capability";
export type SovereigntyCapabilityNamespace = typeof SOVEREIGNTY_CAPABILITY_NAMESPACE;
/**
 * The canonical enumeration order of the Sovereignty Capabilities. Every
 * ordered surface in this module derives from this single tuple, so adding a
 * future canonical capability means editing this list, its definition, and its
 * tests — nothing else.
 */
export declare const SOVEREIGNTY_CAPABILITY_KEYS: readonly ["identity", "integrity", "provenance", "portability", "interoperability", "verifiability", "licensing_terms", "governance_compatibility"];
/** Stable programmatic key for a canonical Sovereignty Capability. */
export type SovereigntyCapabilityKey = (typeof SOVEREIGNTY_CAPABILITY_KEYS)[number];
/**
 * Slug used as the final segment of the canonical id. It is the key in
 * kebab-case, kept explicit rather than derived so the serialized identity can
 * never change as a side effect of a key rename.
 */
declare const SOVEREIGNTY_CAPABILITY_SLUGS: Readonly<{
    readonly identity: "identity";
    readonly integrity: "integrity";
    readonly provenance: "provenance";
    readonly portability: "portability";
    readonly interoperability: "interoperability";
    readonly verifiability: "verifiability";
    readonly licensing_terms: "licensing-terms";
    readonly governance_compatibility: "governance-compatibility";
}>;
/** Canonical serialized identity of a Sovereignty Capability. */
export type SovereigntyCapabilityId = `${SovereigntyCapabilityNamespace}:${(typeof SOVEREIGNTY_CAPABILITY_SLUGS)[SovereigntyCapabilityKey]}`;
export declare const SOVEREIGNTY_CAPABILITY_IDS: Readonly<{
    readonly identity: "aoc:sovereignty-capability:identity";
    readonly integrity: "aoc:sovereignty-capability:integrity";
    readonly provenance: "aoc:sovereignty-capability:provenance";
    readonly portability: "aoc:sovereignty-capability:portability";
    readonly interoperability: "aoc:sovereignty-capability:interoperability";
    readonly verifiability: "aoc:sovereignty-capability:verifiability";
    readonly licensing_terms: "aoc:sovereignty-capability:licensing-terms";
    readonly governance_compatibility: "aoc:sovereignty-capability:governance-compatibility";
}>;
/**
 * Structural + membership check. Unlike `isValidSovereignAssetId`, this is not
 * a shape test over an open value space: the canonical inventory is closed, so
 * a value is a Sovereignty Capability id only if it is one of the eight.
 */
export declare function isSovereigntyCapabilityId(value: unknown): value is SovereigntyCapabilityId;
export declare function isSovereigntyCapabilityKey(value: unknown): value is SovereigntyCapabilityKey;
export {};
//# sourceMappingURL=ids.d.ts.map