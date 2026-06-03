import type { CanonicalProofRef } from './proofs';
import type { CanonicalAssertionId, CanonicalEvidenceId, CanonicalIssuer, CanonicalSubject, CanonicalTimestamp } from './primitives';
export interface CanonicalAssertion {
    readonly id: CanonicalAssertionId;
    readonly subject: CanonicalSubject;
    readonly statement: string;
    readonly evidenceRefs: readonly CanonicalEvidenceId[];
    readonly proofRefs?: readonly CanonicalProofRef[];
    readonly issuer: CanonicalIssuer;
    readonly createdAt: CanonicalTimestamp;
}
//# sourceMappingURL=assertion.d.ts.map