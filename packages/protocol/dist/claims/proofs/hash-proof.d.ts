import type { CanonicalId } from '../../contracts';
import type { CanonicalMetadata, CanonicalSubject, CanonicalTimestamp } from '../primitives';
/**
 * Describes a declared digest for a subject. Algorithms such as SHA256, SHA512,
 * or BLAKE3 are named only; this contract performs no hashing.
 */
export interface CanonicalHashProof {
    readonly id: CanonicalId;
    readonly algorithm: string;
    readonly digest: string;
    readonly subject: CanonicalSubject;
    readonly generatedAt: CanonicalTimestamp;
    readonly metadata: CanonicalMetadata;
}
//# sourceMappingURL=hash-proof.d.ts.map