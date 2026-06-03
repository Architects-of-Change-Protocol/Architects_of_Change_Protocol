import type { CanonicalId } from '../../contracts';
import type { CanonicalMetadata, CanonicalTimestamp } from '../primitives';
import type { CanonicalProofRef } from './proof-reference';
/**
 * Represents proof lineage. It does not verify continuity, ancestry, or chain validity.
 */
export interface CanonicalChainProof {
    readonly id: CanonicalId;
    readonly proofRefs: readonly CanonicalProofRef[];
    readonly rootProof: CanonicalProofRef;
    readonly generatedAt: CanonicalTimestamp;
    readonly metadata: CanonicalMetadata;
}
//# sourceMappingURL=chain-proof.d.ts.map