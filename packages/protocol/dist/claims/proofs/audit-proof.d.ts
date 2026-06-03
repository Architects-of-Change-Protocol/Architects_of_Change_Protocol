import type { CanonicalId } from '../../contracts';
import type { CanonicalMetadata, CanonicalSource, CanonicalSubject, CanonicalTimestamp } from '../primitives';
/**
 * Represents an audit artifact as proof evidence without replaying or judging the audit trail.
 */
export interface CanonicalAuditProof {
    readonly id: CanonicalId;
    readonly auditReference: CanonicalSource;
    readonly subject: CanonicalSubject;
    readonly generatedAt: CanonicalTimestamp;
    readonly metadata: CanonicalMetadata;
}
//# sourceMappingURL=audit-proof.d.ts.map