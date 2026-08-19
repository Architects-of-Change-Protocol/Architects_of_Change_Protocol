import type { AttestationType, CanonicalAttestation, CanonicalAttestationId, CanonicalClaimId, CanonicalCredentialRef, CanonicalPrincipalRef, CanonicalProofRef } from '@aoc/protocol/claims';
import type { UtcDateTime } from '@aoc/protocol/contracts';
/**
 * A proof reference this package will attach.
 *
 * Identity, a Protocol `ProofType` and a source. Whether the proof verifies is
 * emphatically not decided here — Protocol's own contract for this type is
 * "references a proof artifact without embedding, resolving, or validating that
 * artifact", and this package has no way to do more.
 */
export declare function isUsableProofRef(value: unknown): value is CanonicalProofRef;
/** Everything `prepareCanonicalAttestationFromReview` needs, and nothing more. */
export interface PrepareCanonicalAttestationInput {
    /** Caller-provided, exactly like every other identifier in this package. */
    readonly attestationId: CanonicalAttestationId;
    /** One of the pinned requirement's `acceptedTypes`, checked before this point. */
    readonly attestationType: AttestationType;
    /** The reviewer. Becomes the attestation's `attester`. */
    readonly attester: CanonicalPrincipalRef;
    /** A claim this case already holds. Checked against the case before this point. */
    readonly claimRef: CanonicalClaimId;
    /** The attester's own words. Never generated from the case. */
    readonly statement: string;
    /** The decision instant, from the injected clock. */
    readonly issuedAt: UtcDateTime;
    /** The credential references the reviewer presented, as presented. */
    readonly credentialRefs?: readonly CanonicalCredentialRef[];
    /** Proof references an injected signer produced. Never synthesized here. */
    readonly proofRefs?: readonly CanonicalProofRef[];
}
/**
 * Builds a structurally legitimate `CanonicalAttestation`, or fails.
 *
 * Pure and synchronous: no clock, no repository, no catalogue, no I/O. It
 * assembles Protocol's record from values its caller established and returns it;
 * persisting it, associating it to a case and emitting anything about it happen
 * elsewhere.
 *
 * Optional fields are omitted rather than set to `undefined`, because
 * `{ proofRefs: undefined }` and `{}` serialize differently and a store that
 * round-tripped one into the other would change what the record says.
 */
export declare function prepareCanonicalAttestationFromReview(input: PrepareCanonicalAttestationInput): CanonicalAttestation;
//# sourceMappingURL=attestation-preparation.d.ts.map