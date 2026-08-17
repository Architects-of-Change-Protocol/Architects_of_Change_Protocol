import type { CanonicalStanding } from '../../claims/standing';
import { type PortableSovereignClaimArtifact, type PortableSovereignManifestArtifact, type SovereigntyPortabilityBundleV1 } from '../../portability';
import type { SovereigntyCapabilityImplementation } from '../implementation';
/**
 * AOC.PORTABILITY — the production Sovereignty Capability capsule that answers:
 *
 *   "Can this subject's sovereign representation leave the system it is
 *    currently used in, and remain the SAME sovereign representation
 *    elsewhere?"
 *
 * It is the fourth of the canonical eight to become a real implementation of
 * the SM-03 socket. The portable data contract itself lives in
 * `@aoc/protocol/portability`; this capsule is what makes export and import
 * ordinary capability invocations producing capability-attributed evidence.
 *
 * ## Two operations, deliberately
 *
 *   export-bundle   supplied artifacts        → canonical bundle + wire string
 *   import-bundle   canonical wire string     → canonical bundle + its subject
 *
 * That is the whole surface. There is no file manager, no directory listing, no
 * partial patch, no diff, no merge and no sync: each of those would be a
 * lifecycle or reconciliation semantic that portability does not own.
 *
 * ## What this capsule never does
 *
 * - **Mint identity.** `mintSovereignAssetId` is not called, on either
 *   operation. Export transports an existing `SovereignAssetId`; import returns
 *   the one that arrived in the bundle. Export therefore requires
 *   `invocation.subject` rather than creating one.
 * - **Persist or register.** No `SovereignAssetRegistry` is injected, nothing
 *   is written to a database, a filesystem or a provider. Import means "this
 *   canonical AOC representation was accepted and reconstructed in memory" —
 *   storing it afterwards is the consumer's infrastructure decision, and
 *   registry persistence would additionally have made *signing* a precondition
 *   of portability, since `SovereignAssetRegistry.register` takes a
 *   `SignedSovereignManifest` while AOC.IDENTITY produces unsigned ones.
 * - **Verify or sign.** `verifySignedClaim`, `verifySovereignManifest`,
 *   `verifySovereignSignature`, `signClaim` and `signSovereignManifest` are not
 *   called. Supplied proof material is preserved exactly — public key,
 *   signature, payload hash, timestamps and digests — and judged later by
 *   whoever is entitled to judge it. Portability preserves proof; Verifiability
 *   interprets it, and "portable" never means "verified".
 * - **Compute integrity.** `computeContentIdentity` and `computeManifestDigest`
 *   are not called, and a supplied `manifestDigest` is never "fixed". Integrity
 *   over a bundle is explicit composition: serialize, then invoke
 *   AOC.INTEGRITY over the bytes.
 * - **Create provenance.** Moving a bundle from one system to another asserts
 *   no origin, authorship, derivation or custody. Transport history is not
 *   sovereign provenance.
 * - **Transfer anything.** Exporting conveys no ownership, title, rights,
 *   custody or authority, and importing conveys none either. Possession of a
 *   bundle is possession of data.
 * - **Touch the outside world.** No fetch, no upload, no download, no IPFS, no
 *   S3, no chain RPC. `externalReference.locator` is carried verbatim and never
 *   dereferenced, and no key material, credential or secret is accepted.
 * - **Discover artifacts.** Export bundles what the caller supplied and never
 *   queries a registry, index, provider or Enterprise service to "complete" the
 *   set — Protocol has no universal claim registry and could not guarantee
 *   completeness if it tried. Explicit input is the honest contract.
 * - **Recurse.** A `DerivationClaim` naming sources A and B is transported with
 *   those references intact; bundles for A and B are not fetched, built or
 *   implied. Exporting one subject never expands into exporting a graph.
 */
/** The operations AOC.PORTABILITY 1.0.0 supports. Closed for this version. */
export declare const PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS: readonly ["export-bundle", "import-bundle"];
export type PortabilitySovereigntyCapabilityOperation = (typeof PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS)[number];
/**
 * Stable, machine-readable reason codes this capsule can report.
 *
 * The bundle-level codes are not restated here: they are spread in from
 * `@aoc/protocol/portability`'s single map, so the code a consumer sees for a
 * duplicate manifest version is identical whether it came from the bundle
 * validator, the parser, or a failed capability invocation.
 */
export declare const PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES: Readonly<{
    /**
     * `export-bundle` was invoked with no sovereign subject. Portability
     * transports an identity that already exists; minting one to have something
     * to export would make this capsule quietly become AOC.IDENTITY.
     */
    readonly subjectRequired: "PORTABILITY_SUBJECT_REQUIRED";
    readonly invalidInput: "PORTABILITY_INVALID_INPUT";
    readonly unsupportedOperation: "PORTABILITY_UNSUPPORTED_OPERATION";
    /**
     * `import-bundle` was invoked with an explicit subject that is not the
     * bundle's subject. The two references are never merged and no winner is
     * picked — reconciling a changed locator or a different external reference is
     * a lifecycle decision, not a transport one.
     */
    readonly subjectMismatch: "PORTABILITY_SUBJECT_MISMATCH";
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
export type PortabilitySovereigntyCapabilityReasonCode = (typeof PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES)[keyof typeof PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES];
/**
 * Capability-specific input for `export-bundle`.
 *
 * The subject is deliberately *not* a field: it always comes from
 * `invocation.subject`, so an export can never disagree with the invocation it
 * was made under, and there is no second subject for the two to drift apart on.
 *
 * All three artifact lists are optional, and an export supplying none of them
 * is valid: a subject-only bundle is a real sovereign representation, because
 * sovereign identity exists independently of bytes, manifests, provenance and
 * standing.
 */
export interface ExportPortabilityBundleInput {
    readonly operation: 'export-bundle';
    readonly manifests?: readonly PortableSovereignManifestArtifact[];
    readonly claims?: readonly PortableSovereignClaimArtifact[];
    readonly standings?: readonly CanonicalStanding[];
}
/**
 * Capability-specific input for `import-bundle`.
 *
 * `invocation.subject` is optional here, and that is load-bearing: an importing
 * application may have no local record of the subject yet, which is the ordinary
 * case for a bundle arriving from somewhere else. Supplying one is an assertion
 * that the bundle is expected to be about exactly that subject reference, and it
 * is checked for exact equality rather than reconciled.
 */
export interface ImportPortabilityBundleInput {
    readonly operation: 'import-bundle';
    /** Untrusted transport input. Parsed and validated fail-closed; never evaluated. */
    readonly serializedBundle: string;
}
export type PortabilitySovereigntyCapabilityInput = ExportPortabilityBundleInput | ImportPortabilityBundleInput;
/**
 * Both the typed bundle and its canonical wire string are returned.
 *
 * A consumer normally needs both — the typed value inside the runtime, the
 * string for transport — and returning both means no consumer has to reinvent
 * serialization. There is still exactly one serializer:
 * `serializeSovereigntyPortabilityBundle`, which this capsule calls.
 */
export interface ExportPortabilityBundleOutput {
    readonly operation: 'export-bundle';
    readonly bundle: SovereigntyPortabilityBundleV1;
    readonly serializedBundle: string;
}
/**
 * The reconstructed bundle, plus its canonical serialization.
 *
 * Re-serializing on import is what makes round-trip stability observable: a
 * bundle whose envelope arrived in a non-canonical order comes back in the
 * canonical one, and a bundle that was already canonical comes back byte-identical.
 */
export interface ImportPortabilityBundleOutput {
    readonly operation: 'import-bundle';
    readonly bundle: SovereigntyPortabilityBundleV1;
    readonly serializedBundle: string;
}
export type PortabilitySovereigntyCapabilityOutput = ExportPortabilityBundleOutput | ImportPortabilityBundleOutput;
export interface PortabilitySovereigntyCapabilityInputValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly PortabilitySovereigntyCapabilityReasonCode[];
}
export interface PortabilitySovereigntyCapabilityImplementation extends SovereigntyCapabilityImplementation<PortabilitySovereigntyCapabilityInput, PortabilitySovereigntyCapabilityOutput> {
}
/**
 * Validates the capability-specific Portability input.
 *
 * This checks the *operation envelope* only — that the operation is one this
 * capability version supports, that the export artifact lists are lists, and
 * that an import carries a non-blank transport string. It deliberately does not
 * restate the nested artifact rules: those belong to the real bundle validators
 * in `@aoc/protocol/portability`, a second copy of them here would be a drift
 * source, and the subject-dependent rules (manifest and claim subject
 * consistency, standing resolution) cannot be answered from the input alone
 * because the subject arrives on the invocation. The capsule applies those by
 * running the real builder and parser, whose reasons it reports verbatim.
 */
export declare function validatePortabilitySovereigntyCapabilityInput(value: unknown): PortabilitySovereigntyCapabilityInputValidationResult;
export declare function isValidPortabilitySovereigntyCapabilityInput(value: unknown): value is PortabilitySovereigntyCapabilityInput;
/**
 * Builds the production AOC.PORTABILITY capsule.
 *
 * A factory, so that importing this module performs no work: nothing is
 * registered, nothing is mutated, no global is touched, no clock is read and no
 * id is generated at import time. There is no implementation registry — the
 * capsule is passed explicitly to `invokeSovereigntyCapability`, which is the
 * only supported way to execute it, and no options are needed because neither
 * operation reads the clock: the bundle is a deterministic function of the
 * artifacts it carries, and *when* an export happened is recorded truthfully in
 * the invocation evidence instead.
 */
export declare function createPortabilitySovereigntyCapabilityImplementation(): PortabilitySovereigntyCapabilityImplementation;
//# sourceMappingURL=portability.d.ts.map