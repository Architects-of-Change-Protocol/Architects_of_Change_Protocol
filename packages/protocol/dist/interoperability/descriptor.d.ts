import type { StandingStatus } from '../claims/claim-enums';
import type { SovereignSubjectRef } from '../identity';
import { type PortableSovereignClaimArtifactKind, type PortableSovereignManifestArtifactKind, type SovereigntyPortabilityBundleV1 } from '../portability';
import { type InteroperabilitySemanticRequirement, type InteroperableClaimType, type SovereigntyInteroperabilityArtifactKind } from './features';
import { type AocSovereigntyPortabilityMediaType, type SovereigntyInteroperabilityProfileRef, type SovereigntyInteroperabilityRepresentationProfile } from './profile';
import { type SovereigntyInteroperabilityReasonCode } from './reason-codes';
export declare const SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION: "aoc-sovereignty-interoperability-descriptor/1";
export type SovereigntyInteroperabilityDescriptorSchemaVersion = typeof SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION;
/**
 * What semantic features are actually present in one concrete representation.
 *
 * Every array reports *presence*, never possibility: an empty array means the
 * bundle genuinely contains none of that feature, and is never a placeholder
 * for "unknown" or an invitation to assume the profile's full range.
 */
export interface SovereigntyInteroperabilityPresentFeatures {
    readonly manifestArtifactKinds: readonly PortableSovereignManifestArtifactKind[];
    /**
     * The `manifestVersion` values actually carried, ascending.
     *
     * This is *historical manifest version* information about the subject — the
     * versions of the subject's record that travelled — and is not the manifest
     * schema version, the bundle schema version or the profile version. Those
     * three are single values elsewhere in this document; this is a list.
     */
    readonly manifestVersions: readonly number[];
    readonly claimArtifactKinds: readonly PortableSovereignClaimArtifactKind[];
    /**
     * The underlying claim semantics present, independent of wrapper kind. A
     * signed `Derivation` contributes `Derivation` here and `signed-claim` above;
     * conflating the two would make "I understand Derivation" and "I understand
     * signed wrappers" the same statement, which they are not.
     */
    readonly claimTypes: readonly InteroperableClaimType[];
    readonly standingStatuses: readonly StandingStatus[];
    readonly semanticRequirements: readonly InteroperabilitySemanticRequirement[];
}
/**
 * SovereigntyInteroperabilityDescriptorV1 — the machine-readable description of
 * one specific `SovereigntyPortabilityBundleV1`.
 *
 * ## What it is
 *
 * The answer to "what did I just receive?", produced from the bundle itself and
 * nothing else. It names the profile the representation speaks, the wire
 * schemas it uses, the subject it is about, and the exact set of semantic
 * features present in it.
 *
 * ## What it is not
 *
 * Not a copy of the bundle. Manifests, claims, standings, proofs, digests,
 * statements, evidence references and metadata are **not** duplicated here: the
 * descriptor reports which semantic shapes are present, and the bundle carries
 * the data. A descriptor that inlined the payload would be a second
 * representation of the same sovereign facts, free to drift from the first, and
 * would leak the payload into every place a description was safe to send.
 *
 * ## Fields deliberately absent, and why
 *
 * - **`descriptorId`** — a descriptor is a deterministic *description* of an
 *   existing representation, not a new sovereign object. It has no owner and no
 *   lifecycle, so an identity for it would be an id nobody can be responsible
 *   for. Describing the same bundle twice must produce the same value, and an
 *   id would make that impossible.
 * - **`describedAt`** — the same determinism requirement. *When* a description
 *   was produced is recorded truthfully in the SM-03 invocation evidence;
 *   *what* was described is this document, and it does not move.
 * - **`digest` / `signature`** — Integrity and Verifiability concerns, reached
 *   by explicit composition over this document's canonical serialization.
 * - **`trustScore` / `verifiedIssuer` / `signatureValid`** — a descriptor may
 *   report that a `signed-claim` is present; it never reports whether its proof
 *   holds. Understanding what an artifact claims to be and checking whether its
 *   proof is authentic are different minerals.
 * - **`owner` / `provider` / `sourceApplication` / `region`** — describing a
 *   representation says nothing about who holds it or where it has been.
 */
export interface SovereigntyInteroperabilityDescriptorV1 {
    readonly schemaVersion: SovereigntyInteroperabilityDescriptorSchemaVersion;
    /** Versioned reference to the profile whose meanings this description uses. */
    readonly profile: SovereigntyInteroperabilityProfileRef;
    readonly mediaType: AocSovereigntyPortabilityMediaType;
    /**
     * The subject the described representation is about — the canonical SM-02
     * reference carried by the bundle, passed through unchanged. Nothing is
     * minted, and no second subject model is introduced.
     */
    readonly subject: SovereignSubjectRef;
    readonly representation: SovereigntyInteroperabilityRepresentationProfile;
    readonly present: SovereigntyInteroperabilityPresentFeatures;
}
export interface SovereigntyInteroperabilityDescriptorValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly SovereigntyInteroperabilityReasonCode[];
}
export type SovereigntyInteroperabilityDescriptorBuildResult = {
    readonly valid: true;
    readonly descriptor: SovereigntyInteroperabilityDescriptorV1;
} | {
    readonly valid: false;
    readonly reasons: readonly SovereigntyInteroperabilityReasonCode[];
};
/**
 * Describes one canonical portability bundle.
 *
 * ## What it does
 *
 * Validates the bundle with SM-06's own validator, inspects it without
 * mutation, extracts only semantic *presence* metadata, sorts everything
 * deterministically, and returns the descriptor.
 *
 * ## What it does not do
 *
 * It does not reimplement bundle validation — `@aoc/protocol/portability`'s
 * validator is the single source of what a valid bundle is, and a second copy
 * of those rules inside a describing layer would be a drift source. It does not
 * parse: a serialized bundle is turned into a bundle by the Portability parser,
 * outside this function, so there is no second JSON entry point into the
 * representation.
 *
 * Reusing the Portability *contract* this way is not hidden capability
 * execution: no `invokeSovereigntyCapability` call is made, the AOC.PORTABILITY
 * capsule is not constructed, and no evidence is produced here. Composing
 * minerals stays the caller's decision.
 *
 * The bundle is never mutated. Arrays are copied before sorting, nested
 * artifacts are only read, and the caller's `semanticRefs` are left exactly as
 * they are.
 */
export declare function tryBuildSovereigntyInteroperabilityDescriptorV1(bundle: SovereigntyPortabilityBundleV1): SovereigntyInteroperabilityDescriptorBuildResult;
/**
 * Describes a bundle, throwing on an invalid one rather than describing it
 * partially — a construction helper, not a lenient parser, matching
 * `buildSovereigntyPortabilityBundleV1`.
 */
export declare function buildSovereigntyInteroperabilityDescriptorV1(bundle: SovereigntyPortabilityBundleV1): SovereigntyInteroperabilityDescriptorV1;
/**
 * Structural validation for a descriptor.
 *
 * A descriptor is produced deterministically here, but it is also exactly the
 * kind of document that crosses an external trust boundary: it is the thing a
 * receiving system is handed, may store, and may later feed back in to ask for
 * a compatibility assessment. Accepting `value as Descriptor` at that boundary
 * would let a malformed document become authoritative by assertion, which is
 * the same failure the SM-06 parser exists to prevent.
 */
export declare function validateSovereigntyInteroperabilityDescriptorV1(value: unknown): SovereigntyInteroperabilityDescriptorValidationResult;
export declare function isValidSovereigntyInteroperabilityDescriptorV1(value: unknown): value is SovereigntyInteroperabilityDescriptorV1;
/**
 * The complete set of artifact kinds a described representation presents.
 *
 * Derived rather than stored, so it cannot disagree with the three per-artifact
 * lists it is derived from. `standing` appears exactly when the representation
 * carries at least one standing record: a consumer that does not understand
 * standing records at all needs to be told that as an artifact-level gap, not
 * only as a list of statuses it did not recognise.
 */
export declare function presentInteroperabilityArtifactKinds(descriptor: SovereigntyInteroperabilityDescriptorV1): readonly SovereigntyInteroperabilityArtifactKind[];
//# sourceMappingURL=descriptor.d.ts.map