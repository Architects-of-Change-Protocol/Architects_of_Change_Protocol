import type { ClaimType } from './claim-enums';
import type { CanonicalProofRef } from './proofs';
import type { CanonicalAssertionId, CanonicalAttestationId, CanonicalClaimId, CanonicalEvidenceId, CanonicalIssuer, CanonicalMetadata, CanonicalSubject, CanonicalTimestamp } from './primitives';
export interface CanonicalClaim {
    readonly id: CanonicalClaimId;
    readonly type: ClaimType;
    readonly subject: CanonicalSubject;
    readonly issuer: CanonicalIssuer;
    readonly assertionRef: CanonicalAssertionId;
    readonly evidenceRefs: readonly CanonicalEvidenceId[];
    readonly attestationRefs: readonly CanonicalAttestationId[];
    readonly proofRefs?: readonly CanonicalProofRef[];
    readonly issuedAt: CanonicalTimestamp;
    readonly expiresAt?: CanonicalTimestamp;
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=claim.d.ts.map