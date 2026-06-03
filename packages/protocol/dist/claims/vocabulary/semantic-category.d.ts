import type { CanonicalMetadata } from '../primitives';
import type { CanonicalSemanticCategoryId, CanonicalSemanticNamespace, CanonicalSemanticTermId } from './semantic-identifiers';
/**
 * Group of related semantic terms.
 *
 * Categories organize term references without resolving taxonomies, ontologies,
 * graph relationships, or trust consequences.
 */
export interface CanonicalSemanticCategory {
    readonly id: CanonicalSemanticCategoryId;
    readonly name: string;
    readonly description: string;
    readonly namespace: CanonicalSemanticNamespace;
    readonly termRefs: readonly CanonicalSemanticTermId[];
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=semantic-category.d.ts.map