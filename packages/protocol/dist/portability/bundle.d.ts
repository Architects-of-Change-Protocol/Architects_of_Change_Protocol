import { CANONICAL_JSON_PROFILE } from '../canonical';
import type { CanonicalStanding } from '../claims/standing';
import { type SovereignSubjectRef } from '../identity';
import { type AuthorityClaim, type DerivationClaim, type OriginClaim, type SignedClaim, type SignedSovereignManifest, type SovereignManifestV1 } from '../manifest';
/**
 * The canonical AOC sovereign portability bundle — the smallest Protocol-owned
 * representation by which a sovereign subject's supplied sovereign artifacts
 * can leave one application/runtime, travel as data, and be reconstructed
 * somewhere else as *the same* sovereign representation.
 *
 * ## What portability means here
 *
 *     APPLICATION A ─► sovereign subject + supplied sovereign artifacts
 *                          │
 *                          ▼
 *                   PORTABILITY BUNDLE  ──(canonical JSON)──►  transport
 *                                                                  │
 *                                                                  ▼
 *     APPLICATION B ◄─ same SovereignAssetId, same supplied artifacts
 *
 * No reminting, no source provider, no source storage backend, no database, no
 * Enterprise, and no rewriting of the artifacts that were handed over.
 *
 * ## What it deliberately is not
 *
 * - **Not storage migration.** The bundle carries the sovereign
 *   *representation*, never the underlying content bytes. Moving a 500 MB video
 *   between providers is application/storage work; the sovereign record that
 *   describes it is what travels here.
 * - **Not a backup.** It is not a database dump, a filesystem snapshot, a
 *   provider export or a tenant archive.
 * - **Not interoperability.** It establishes one canonical AOC wire
 *   representation. Whether some *other* ecosystem can understand, map,
 *   translate or negotiate those semantics is a different question, and no
 *   external-standard mapping exists here.
 * - **Not verifiability.** Supplied signed artifacts are preserved byte-exact
 *   and are never verified, re-signed, re-digested or re-timestamped. A bundle
 *   that transports structurally intact but cryptographically invalid proof
 *   material is doing its job correctly.
 * - **Not integrity.** There is deliberately no `digest`, `hash` or `checksum`
 *   field. Integrity over a bundle is explicit mineral composition: serialize
 *   it, then hand the bytes to AOC.INTEGRITY.
 * - **Not identity.** Nothing here mints a `SovereignAssetId`. An existing one
 *   is transported.
 * - **Not provenance.** Exporting and importing creates no origin, authorship,
 *   derivation or custody assertion. Transport history is not sovereign
 *   provenance unless somebody asserts it through AOC.PROVENANCE.
 * - **Not ownership.** Possessing a bundle is possessing data. It conveys no
 *   title, custody, rights or authority over the subject it describes.
 *
 * ## What a bundle claims
 *
 * Exactly this: *these are the sovereign artifacts supplied in this bundle for
 * this subject.* It does not claim to be every artifact that exists — Protocol
 * has no global registry of manifests, claims or standing records and could not
 * know that — so there is deliberately no `complete` flag and no
 * partial/complete/archive profile enum.
 */
export declare const SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION: "aoc-sovereignty-portability-bundle/1";
export type SovereigntyPortabilityBundleSchemaVersion = typeof SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION;
/**
 * Stable, machine-readable reason codes the portability contract can report.
 *
 * One map, shared by the bundle validator, the parser and the production
 * capsule, so a consumer sees the same code for the same defect no matter which
 * surface reported it. The capsule extends this map with its own
 * operation-level codes rather than restating any of these.
 */
export declare const SOVEREIGNTY_PORTABILITY_REASON_CODES: Readonly<{
    readonly invalidBundle: "PORTABILITY_INVALID_BUNDLE";
    readonly invalidJson: "PORTABILITY_INVALID_JSON";
    readonly unsupportedBundleSchema: "PORTABILITY_UNSUPPORTED_BUNDLE_SCHEMA";
    readonly unsupportedCanonicalizationProfile: "PORTABILITY_UNSUPPORTED_CANONICALIZATION_PROFILE";
    readonly invalidSubject: "PORTABILITY_INVALID_SUBJECT";
    readonly invalidManifestArtifact: "PORTABILITY_INVALID_MANIFEST_ARTIFACT";
    readonly manifestSubjectMismatch: "PORTABILITY_MANIFEST_SUBJECT_MISMATCH";
    readonly duplicateManifestVersion: "PORTABILITY_DUPLICATE_MANIFEST_VERSION";
    readonly invalidClaimArtifact: "PORTABILITY_INVALID_CLAIM_ARTIFACT";
    readonly claimSubjectMismatch: "PORTABILITY_CLAIM_SUBJECT_MISMATCH";
    readonly duplicateClaimId: "PORTABILITY_DUPLICATE_CLAIM_ID";
    readonly invalidStanding: "PORTABILITY_INVALID_STANDING";
    readonly duplicateStandingId: "PORTABILITY_DUPLICATE_STANDING_ID";
    readonly danglingStandingClaimRef: "PORTABILITY_DANGLING_STANDING_CLAIM_REF";
    readonly unsupportedArtifactKind: "PORTABILITY_UNSUPPORTED_ARTIFACT_KIND";
    readonly canonicalizationFailed: "PORTABILITY_CANONICALIZATION_FAILED";
}>;
export type SovereigntyPortabilityReasonCode = (typeof SOVEREIGNTY_PORTABILITY_REASON_CODES)[keyof typeof SOVEREIGNTY_PORTABILITY_REASON_CODES];
/** The manifest artifact wrapper kinds this bundle version understands. */
export declare const PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS: readonly ["manifest", "signed-manifest"];
export type PortableSovereignManifestArtifactKind = (typeof PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS)[number];
/** The claim artifact wrapper kinds this bundle version understands. */
export declare const PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS: readonly ["claim", "signed-claim"];
export type PortableSovereignClaimArtifactKind = (typeof PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS)[number];
export interface PortableUnsignedSovereignManifestArtifact {
    readonly kind: 'manifest';
    readonly manifest: SovereignManifestV1;
}
/**
 * A signed manifest travels whole: `manifest`, `manifestDigest` and `proof` are
 * preserved exactly as supplied and are never flattened into the envelope,
 * recomputed, re-signed or re-timestamped. Flattening would destroy the very
 * thing a later verifier needs.
 */
export interface PortableSignedSovereignManifestArtifact {
    readonly kind: 'signed-manifest';
    readonly signedManifest: SignedSovereignManifest;
}
/**
 * Both canonical manifest states are portable, and neither is forced.
 * AOC.IDENTITY produces *unsigned* `SovereignManifestV1` records, while the
 * lower-level manifest primitives can produce signed ones — a transport that
 * demanded either would make an entire legitimate half of the Protocol
 * unportable.
 */
export type PortableSovereignManifestArtifact = PortableUnsignedSovereignManifestArtifact | PortableSignedSovereignManifestArtifact;
/**
 * The sovereignty-facing claim union v1 transports: exactly the claim types
 * that participate in the production mineral architecture today.
 *
 * Deliberately not `CanonicalClaim` in general. There is no canonical runtime
 * validator for every current and future `CanonicalClaim` variant, so accepting
 * an arbitrary one at an external trust boundary would mean advertising an
 * understanding of semantics Protocol does not have. `ClaimType.Custom` is not
 * used as an escape hatch for that gap. A future additive bundle version can
 * widen this union once the validators exist.
 */
export type PortableSovereignClaim = OriginClaim | AuthorityClaim | DerivationClaim;
export interface PortableUnsignedSovereignClaimArtifact {
    readonly kind: 'claim';
    readonly claim: PortableSovereignClaim;
}
export interface PortableSignedSovereignClaimArtifact {
    readonly kind: 'signed-claim';
    readonly signedClaim: SignedClaim<PortableSovereignClaim>;
}
export type PortableSovereignClaimArtifact = PortableUnsignedSovereignClaimArtifact | PortableSignedSovereignClaimArtifact;
/**
 * SovereigntyPortabilityBundleV1 — the canonical portable representation.
 *
 * Fields that are deliberately absent, and why:
 *
 * - **`bundleId`** — the bundle represents existing sovereign artifacts; it is
 *   not a new sovereign object. The subject's identity is already
 *   `SovereignAssetId`, and minting a second persistent identity layer for the
 *   envelope would create an id with no owner and no lifecycle.
 * - **`exportedAt`** — an automatic timestamp would make the same sovereign
 *   state serialize differently every time it left the building. *When* an
 *   export happened is recorded truthfully in the SM-03 invocation evidence;
 *   *what* was exported is this bundle, and it stays deterministic.
 * - **`digest` / `hash` / `bundleSignature`** — see the Integrity and
 *   Verifiability notes above.
 * - **`provider` / `storageUri` / `bucket` / `CID` / `region` / `tenantId` /
 *   `sourceApplication` / `destinationApplication`** — a bundle that named where
 *   it came from would be transport-history dependent and provider-coupled,
 *   which is the exact lock-in portability exists to remove. The one nested
 *   locator that does survive is `subject.externalReference.locator`, because it
 *   belongs to the canonical SM-02 subject model: it is preserved verbatim and
 *   never dereferenced, required, or treated as identity or transport.
 * - **`contentBytes`** — a building, an API resource, an agent or an external
 *   token may have no byte payload at all. Where bytes exist, `ContentIdentity`
 *   inside a supplied manifest already carries the integrity commitment.
 * - **`complete` / `containsFullHistory`** — see the bundle-claim note above.
 * - **`license` / `terms` / `policy` / `governanceContext` / ownership** — those
 *   are other minerals' contracts, not envelope metadata.
 */
export interface SovereigntyPortabilityBundleV1 {
    readonly schemaVersion: SovereigntyPortabilityBundleSchemaVersion;
    readonly canonicalizationProfile: typeof CANONICAL_JSON_PROFILE;
    /**
     * The single identity anchor every artifact in the bundle is scoped to. This
     * is the canonical SM-02 `SovereignSubjectRef` itself — there is no parallel
     * "portable subject" model, because a second subject type is exactly how two
     * representations of one subject start to disagree.
     */
    readonly subject: SovereignSubjectRef;
    readonly manifests: readonly PortableSovereignManifestArtifact[];
    readonly claims: readonly PortableSovereignClaimArtifact[];
    readonly standings: readonly CanonicalStanding[];
}
export interface BuildSovereigntyPortabilityBundleV1Input {
    readonly subject: SovereignSubjectRef;
    readonly manifests?: readonly PortableSovereignManifestArtifact[];
    readonly claims?: readonly PortableSovereignClaimArtifact[];
    readonly standings?: readonly CanonicalStanding[];
}
/**
 * The result of checking *structural portability validity*.
 *
 * The field is `valid`, never `verified`. Nothing cryptographic happens in this
 * module, and a result that said "verified" would be claiming a property only
 * AOC.VERIFIABILITY can establish.
 */
export interface SovereigntyPortabilityBundleValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly SovereigntyPortabilityReasonCode[];
}
export type SovereigntyPortabilityBundleBuildResult = {
    readonly valid: true;
    readonly bundle: SovereigntyPortabilityBundleV1;
} | {
    readonly valid: false;
    readonly reasons: readonly SovereigntyPortabilityReasonCode[];
};
/** The manifest a manifest artifact carries, whichever wrapper kind it uses. */
export declare function portableManifestOf(artifact: PortableSovereignManifestArtifact): SovereignManifestV1;
/** The claim a claim artifact carries, whichever wrapper kind it uses. */
export declare function portableClaimOf(artifact: PortableSovereignClaimArtifact): PortableSovereignClaim;
export declare function isPortableSovereignManifestArtifact(value: unknown): value is PortableSovereignManifestArtifact;
export declare function isPortableSovereignClaimArtifact(value: unknown): value is PortableSovereignClaimArtifact;
/**
 * Structural portability validity for a complete bundle value, suitable for use
 * at an external trust boundary.
 *
 * A structurally valid bundle means: a supported bundle schema and
 * canonicalization profile, a valid subject, recognized artifact kinds, valid
 * nested canonical structures, artifact/subject consistency, unique manifest
 * versions, unique claim ids, unique and valid standings whose `claimRef`
 * resolves inside the bundle, and a value `aoc-canonical-json/1` can serialize.
 *
 * It emphatically does **not** mean: signatures verified, claims historically
 * true, content bytes matching a `ContentIdentity`, evidence refs resolvable,
 * the bundle globally complete, the issuer's identity established, or ownership
 * proven. Every one of those is a different property owned by a different
 * mineral or by nobody at all.
 */
export declare function validateSovereigntyPortabilityBundleV1(value: unknown): SovereigntyPortabilityBundleValidationResult;
export declare function isValidSovereigntyPortabilityBundleV1(value: unknown): value is SovereigntyPortabilityBundleV1;
/**
 * Non-throwing bundle construction, for callers sitting on a boundary where a
 * malformed artifact set is an expected outcome rather than a programming
 * fault — the production AOC.PORTABILITY capsule is exactly such a caller, and
 * it turns these reasons into an ordinary failed capability outcome.
 *
 * The input's own arrays are never mutated, and no nested artifact is ever
 * rewritten, re-signed, re-digested or repaired.
 */
export declare function tryBuildSovereigntyPortabilityBundleV1(input: BuildSovereigntyPortabilityBundleV1Input): SovereigntyPortabilityBundleBuildResult;
/**
 * Builds a validated canonical portability bundle, throwing on a malformed
 * artifact set rather than repairing it — a construction helper, not a lenient
 * parser, matching `buildSovereignManifestV1` and `buildDerivationClaim`.
 */
export declare function buildSovereigntyPortabilityBundleV1(input: BuildSovereigntyPortabilityBundleV1Input): SovereigntyPortabilityBundleV1;
//# sourceMappingURL=bundle.d.ts.map