import { type ContentIdentity } from '../../identity';
import { type SovereignManifestV1 } from '../../manifest';
import type { SovereigntyCapabilityImplementation } from '../implementation';
/**
 * AOC.INTEGRITY — the production Sovereignty Capability capsule that answers:
 *
 *   "What exact integrity commitment applies to this representation, and does
 *    a representation match a declared commitment?"
 *
 * It is a wrapper over the repository's existing integrity primitives and
 * introduces no new hashing semantics: `computeContentIdentity` remains
 * SHA-256 over the exact bytes, `verifyContentIdentity` remains the explicit
 * comparison, and `computeManifestDigest` remains SHA-256 over the
 * `aoc-canonical-json/1` representation of a manifest. There is no second
 * digest implementation and no second content-hash meaning.
 *
 * ## Independent of identity, location and everything operational
 *
 * Integrity needs no `SovereignAssetId`, no subject, no provider, no locator
 * and no storage: it measures the representation it is handed. The invocation
 * may carry a subject as attribution/context, and that subject can never
 * influence a digest — same bytes under different subjects produce the same
 * `ContentIdentity`, which is exactly why identity and integrity stay
 * separable. This capsule never mints a `SovereignAssetId` and never returns a
 * subject of its own.
 *
 * ## Where the boundary with Verifiability runs
 *
 * `computeManifestDigest` belongs here because it answers "what is the
 * canonical digest of this manifest?". It does **not** answer "was this
 * manifest signed by the right principal?" — signature checking, issuer
 * binding, public-key resolution and proof-payload validation are
 * AOC.VERIFIABILITY, and none of them happen in this file.
 *
 * Generic canonicalization is likewise not exposed as an operation: an
 * `canonicalize-any-json` operation would broaden Integrity into
 * Interoperability's contract. `computeManifestDigest` uses canonicalization
 * internally, which is not the same as offering it.
 */
/** Stable, machine-readable reason codes this capsule can report. */
export declare const INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES: Readonly<{
    readonly invalidInput: "INTEGRITY_INVALID_INPUT";
    readonly unsupportedOperation: "INTEGRITY_UNSUPPORTED_OPERATION";
    readonly invalidBytes: "INTEGRITY_INVALID_BYTES";
    readonly invalidExpectedContentIdentity: "INTEGRITY_INVALID_EXPECTED_CONTENT_IDENTITY";
    readonly invalidManifest: "INTEGRITY_INVALID_MANIFEST";
}>;
export type IntegritySovereigntyCapabilityReasonCode = (typeof INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES)[keyof typeof INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES];
/**
 * The operations AOC.INTEGRITY 1.0.0 supports. The set is closed for this
 * capability version: adding one later is a capability-contract change, and an
 * unrecognized operation is reported rather than guessed at.
 */
export declare const INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS: readonly ["compute-content-identity", "verify-content-identity", "compute-manifest-digest"];
export type IntegritySovereigntyCapabilityOperation = (typeof INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS)[number];
export interface ComputeContentIdentityIntegrityInput {
    readonly operation: 'compute-content-identity';
    /** Passed to the primitive exactly as supplied — never copied, framed or re-encoded. */
    readonly bytes: Uint8Array;
}
export interface VerifyContentIdentityIntegrityInput {
    readonly operation: 'verify-content-identity';
    readonly bytes: Uint8Array;
    /** The commitment the bytes are checked against. Not recomputed from them. */
    readonly expected: ContentIdentity;
}
export interface ComputeManifestDigestIntegrityInput {
    readonly operation: 'compute-manifest-digest';
    readonly manifest: SovereignManifestV1;
}
export type IntegritySovereigntyCapabilityInput = ComputeContentIdentityIntegrityInput | VerifyContentIdentityIntegrityInput | ComputeManifestDigestIntegrityInput;
export interface ComputeContentIdentityIntegrityOutput {
    readonly operation: 'compute-content-identity';
    readonly contentIdentity: ContentIdentity;
}
/**
 * The result of an integrity *check*, preserved as the primitive reported it.
 *
 * `valid: false` is a legitimate, successful answer to a legitimate question —
 * see `verify-content-identity` on the implementation below.
 */
export interface IntegrityContentIdentityCheck {
    readonly valid: boolean;
    readonly reason?: 'CONTENT_DIGEST_MISMATCH' | 'UNSUPPORTED_CONTENT_DIGEST_ALGORITHM';
}
export interface VerifyContentIdentityIntegrityOutput {
    readonly operation: 'verify-content-identity';
    readonly check: IntegrityContentIdentityCheck;
}
export interface ComputeManifestDigestIntegrityOutput {
    readonly operation: 'compute-manifest-digest';
    readonly manifestDigest: string;
}
export type IntegritySovereigntyCapabilityOutput = ComputeContentIdentityIntegrityOutput | VerifyContentIdentityIntegrityOutput | ComputeManifestDigestIntegrityOutput;
export interface IntegritySovereigntyCapabilityInputValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly IntegritySovereigntyCapabilityReasonCode[];
}
/**
 * Validates the capability-specific Integrity input.
 *
 * Nested Protocol values reuse their existing canonical validators
 * (`isValidContentIdentity`, `validateSovereignManifestV1`) rather than a
 * second copy of those rules.
 */
export declare function validateIntegritySovereigntyCapabilityInput(value: unknown): IntegritySovereigntyCapabilityInputValidationResult;
export declare function isValidIntegritySovereigntyCapabilityInput(value: unknown): value is IntegritySovereigntyCapabilityInput;
export interface IntegritySovereigntyCapabilityImplementation extends SovereigntyCapabilityImplementation<IntegritySovereigntyCapabilityInput, IntegritySovereigntyCapabilityOutput> {
}
/**
 * Builds the production AOC.INTEGRITY capsule.
 *
 * Stateless — it holds no configuration and needs no dependency injection —
 * but exposed as a factory for symmetry with the Identity capsule and so that
 * importing this module performs no work: nothing is registered, nothing is
 * mutated, no global is touched. Execution goes through
 * `invokeSovereigntyCapability` and nowhere else.
 */
export declare function createIntegritySovereigntyCapabilityImplementation(): IntegritySovereigntyCapabilityImplementation;
//# sourceMappingURL=integrity.d.ts.map