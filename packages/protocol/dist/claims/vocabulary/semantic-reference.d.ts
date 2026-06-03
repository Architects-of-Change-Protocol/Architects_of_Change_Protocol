import type { CanonicalMetadata } from '../primitives';
import type { CanonicalSemanticId, CanonicalSemanticNamespace, CanonicalSemanticTermId } from './semantic-identifiers';
/**
 * Reference to a semantic concept without carrying the semantic term.
 *
 * References let claims, evidence, proofs, credentials, and registry entries
 * point at vocabulary concepts while remaining portable and behavior-free.
 */
export interface CanonicalSemanticRef {
    readonly id: CanonicalSemanticId;
    readonly termRef: CanonicalSemanticTermId;
    readonly namespace: CanonicalSemanticNamespace;
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=semantic-reference.d.ts.map