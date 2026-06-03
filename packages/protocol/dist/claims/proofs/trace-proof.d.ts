import type { CanonicalId } from '../../contracts';
import type { CanonicalMetadata, CanonicalSource, CanonicalSubject, CanonicalTimestamp } from '../primitives';
/**
 * Represents a runtime or policy trace artifact. It does not evaluate the trace.
 */
export interface CanonicalTraceProof {
    readonly id: CanonicalId;
    readonly traceReference: CanonicalSource;
    readonly subject: CanonicalSubject;
    readonly generatedAt: CanonicalTimestamp;
    readonly metadata: CanonicalMetadata;
}
//# sourceMappingURL=trace-proof.d.ts.map