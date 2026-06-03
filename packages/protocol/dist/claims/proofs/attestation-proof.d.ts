import type { CanonicalId } from '../../contracts';
import type { CanonicalAttestationId, CanonicalAttester, CanonicalMetadata, CanonicalTimestamp } from '../primitives';
/**
 * Bridges a canonical or runtime attestation reference into proof space without re-evaluating it.
 */
export interface CanonicalAttestationProof {
    readonly id: CanonicalId;
    readonly attestationRef: CanonicalAttestationId;
    readonly attester: CanonicalAttester;
    readonly issuedAt: CanonicalTimestamp;
    readonly metadata: CanonicalMetadata;
}
//# sourceMappingURL=attestation-proof.d.ts.map