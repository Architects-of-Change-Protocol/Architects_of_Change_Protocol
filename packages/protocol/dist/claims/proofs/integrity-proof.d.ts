import type { CanonicalId } from '../../contracts';
import type { CanonicalMetadata, CanonicalSubject, CanonicalTimestamp } from '../primitives';
import type { CanonicalProofRef } from './proof-reference';
/**
 * Represents integrity evidence for a subject. It does not evaluate integrity.
 */
export interface CanonicalIntegrityProof {
    readonly id: CanonicalId;
    readonly subject: CanonicalSubject;
    readonly proofRefs: readonly CanonicalProofRef[];
    readonly generatedAt: CanonicalTimestamp;
    readonly metadata: CanonicalMetadata;
}
//# sourceMappingURL=integrity-proof.d.ts.map