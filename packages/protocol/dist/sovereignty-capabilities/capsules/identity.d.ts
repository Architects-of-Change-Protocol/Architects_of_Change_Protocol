import { type ContentIdentity, type SovereignExternalReference, type SovereignSubjectRef } from '../../identity';
import { type SovereignManifestV1, type SovereignRegistrant } from '../../manifest';
import type { SovereigntyCapabilityImplementation } from '../implementation';
import { type SovereigntyCapabilityClock } from '../time';
/**
 * AOC.IDENTITY — the production Sovereignty Capability capsule that answers:
 *
 *   "Create a new canonical AOC sovereign identity for this registration
 *    action and return the canonical subject representation."
 *
 * It is the first of the canonical eight to become a real implementation of
 * the SM-03 `SovereigntyCapabilityImplementation` socket. It creates nothing
 * new underneath: `mintSovereignAssetId`, `buildSovereignManifestV1` and the
 * SM-02 subject/reference primitives already existed and are reused verbatim.
 * What SM-04 adds is that they are now reachable *through* the common
 * invocation contract, so a consumer receives a `SovereignSubjectRef`, a
 * canonical manifest and capability-attributed invocation evidence from one
 * socket rather than by hand-assembling primitives.
 *
 * ## What Identity is responsible for
 *
 * Minting a new `SovereignAssetId`; associating an optional open-world
 * external reference; binding an optional *precomputed* `ContentIdentity`;
 * recording the registrant; building the canonical unsigned manifest; and
 * returning the resulting subject.
 *
 * ## What Identity is emphatically not responsible for
 *
 * - **Ownership.** `registrant` records *who submitted this registration*, and
 *   is deliberately not `owner`/`legalOwner`. Nothing here asserts that the
 *   registrant owns, controls or has any legal right over the referenced
 *   external thing. Declared (and disputable) authority assertions are
 *   `AuthorityClaim`, which belongs to Provenance, not here.
 * - **Integrity.** It never calls `computeContentIdentity`. A `ContentIdentity`
 *   may be supplied, already computed, by AOC.INTEGRITY or by anything else;
 *   Identity binds it and does not recompute or verify it. This is what keeps
 *   Identity independently consumable over subjects that have no bytes at all.
 * - **Signing.** See `IdentitySovereigntyCapabilityOutput.manifest` below.
 * - **The external world.** `externalReference` is passive metadata: no fetch,
 *   no provider lookup, no chain RPC, no registry or storage resolution, and
 *   no interpretation of `namespace`, `id` or `locator`. A namespace nobody has
 *   invented yet is a first-class input.
 * - **Governance.** No policy, approval, grant, access decision, credential,
 *   price, quota or settlement — those are AOC Enterprise concerns and are
 *   absent by construction.
 *
 * ## One operation, deliberately
 *
 * SM-04 defines exactly one Identity operation: *create*. Resolve, rename,
 * rebind, merge, recover, supersede and transfer are real future Identity
 * lifecycle questions, and each needs its own semantics; overloading them into
 * this first production capsule would make an invocation's meaning ambiguous.
 */
/** Stable, machine-readable reason codes this capsule can report. */
export declare const IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES: Readonly<{
    /**
     * The invocation already named a sovereign subject. This operation *creates*
     * identity, so a second `SovereignAssetId` is never minted for a subject that
     * already exists — that would silently fork the subject rather than identify it.
     */
    readonly subjectAlreadyExists: "IDENTITY_SUBJECT_ALREADY_EXISTS";
    readonly invalidInput: "IDENTITY_INVALID_INPUT";
    readonly invalidRegistrant: "IDENTITY_INVALID_REGISTRANT";
    readonly invalidExternalReference: "IDENTITY_INVALID_EXTERNAL_REFERENCE";
    readonly invalidContentIdentity: "IDENTITY_INVALID_CONTENT_IDENTITY";
}>;
export type IdentitySovereigntyCapabilityReasonCode = (typeof IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES)[keyof typeof IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES];
/**
 * Capability-specific input for AOC.IDENTITY.
 *
 * Deliberately absent: any `sovereignAssetId` the caller would like to use (a
 * capability that accepted one would not be establishing identity), any
 * lifecycle `state` (Identity is not an asset state machine), any
 * `manifestVersion` (a newly created identity begins at the canonical initial
 * version, never at version 47), and every provenance, licensing and
 * governance field — `originClaim`, `authorityClaims`, `derivedFrom`,
 * `parent`, `custody`, `license`, `terms`, `permissions`, `restrictions` —
 * which belong to other minerals.
 */
export interface IdentitySovereigntyCapabilityInput {
    /**
     * Who is recording this registration. Not an owner, not a legal owner, not a
     * beneficial owner — see `SovereignRegistrant`.
     */
    readonly registrant: SovereignRegistrant;
    /** Optional open-world reference to how another namespace names this subject. */
    readonly externalReference?: SovereignExternalReference;
    /**
     * Optional, *already computed* integrity commitment. Identity binds it into
     * the manifest and never computes or verifies it, so composing
     * AOC.INTEGRITY → AOC.IDENTITY stays possible without Identity depending on
     * Integrity. Omit it entirely when no genuine integrity material exists;
     * nothing is fabricated in its place.
     */
    readonly contentIdentity?: ContentIdentity;
}
/**
 * Capability-specific output for AOC.IDENTITY.
 *
 * `subject.sovereignAssetId` and `manifest.sovereignAssetId` are the same
 * value, so it is not repeated a third time as a standalone field.
 *
 * `manifest` is a `SovereignManifestV1` and **not** a `SignedSovereignManifest`,
 * deliberately. Identity establishes *what the sovereign subject is*;
 * whether a cryptographic assertion over that record can be independently
 * verified is AOC.VERIFIABILITY's question. A capsule that generated a key
 * pair and signed its own output would silently absorb part of another
 * mineral, and would make an unsigned-by-choice registration inexpressible.
 * An unsigned manifest is a canonical record, not cryptographic proof; sign it
 * with `signSovereignManifest` when a proof is actually wanted.
 */
export interface IdentitySovereigntyCapabilityOutput {
    readonly subject: SovereignSubjectRef;
    readonly manifest: SovereignManifestV1;
}
export interface IdentitySovereigntyCapabilityInputValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly IdentitySovereigntyCapabilityReasonCode[];
}
export interface CreateIdentitySovereigntyCapabilityImplementationOptions {
    /**
     * Injectable time source for the manifest's `createdAt`, defaulting to the
     * system clock.
     *
     * `invocation.requestedAt` is deliberately *not* used: it is caller-supplied
     * envelope metadata describing when the request was constructed, which is
     * not the same fact as when this sovereign record was produced, and a caller
     * could set it to anything. The existing SM-03 `SovereigntyCapabilityClock`
     * is reused rather than adding a second clock abstraction or an external
     * time dependency.
     */
    readonly clock?: SovereigntyCapabilityClock;
}
/**
 * Validates the capability-specific Identity input, accumulating every reason
 * rather than reporting only the first.
 *
 * Nested Protocol values are checked with their existing canonical validators
 * (`isValidSovereignExternalReference`, `isValidContentIdentity`) rather than a
 * second copy of those rules. A present-but-`undefined` optional is rejected
 * rather than treated as absent, matching the rest of the sovereign contracts:
 * canonical JSON refuses `undefined`, so accepting it here would only defer the
 * failure to canonicalization.
 */
export declare function validateIdentitySovereigntyCapabilityInput(value: unknown): IdentitySovereigntyCapabilityInputValidationResult;
export declare function isValidIdentitySovereigntyCapabilityInput(value: unknown): value is IdentitySovereigntyCapabilityInput;
export interface IdentitySovereigntyCapabilityImplementation extends SovereigntyCapabilityImplementation<IdentitySovereigntyCapabilityInput, IdentitySovereigntyCapabilityOutput> {
}
/**
 * Builds the production AOC.IDENTITY capsule.
 *
 * A factory rather than a constant because of the injectable clock, and
 * because constructing it performs no work at import time: this module
 * registers nothing, mutates nothing and reaches no global. There is no
 * implementation registry to register into — the capsule is passed explicitly
 * to `invokeSovereigntyCapability`, which is also the only supported way to
 * execute it. It exposes no second `execute()` entry point that would bypass
 * the common result and evidence semantics.
 */
export declare function createIdentitySovereigntyCapabilityImplementation(options?: CreateIdentitySovereigntyCapabilityImplementationOptions): IdentitySovereigntyCapabilityImplementation;
//# sourceMappingURL=identity.d.ts.map