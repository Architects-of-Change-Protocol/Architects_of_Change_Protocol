import type { CanonicalMetadata } from '../primitives';
import type { CanonicalSemanticCategory } from './semantic-category';
import type { CanonicalSemanticNamespace, CanonicalSemanticVocabularyId } from './semantic-identifiers';

/**
 * Portable vocabulary declaration.
 *
 * A vocabulary bundles semantic categories for interoperability and
 * explainability. It is descriptive only and has no evaluation behavior.
 */
export interface CanonicalSemanticVocabulary {
  readonly id: CanonicalSemanticVocabularyId;
  readonly name: string;
  readonly description: string;
  readonly namespace: CanonicalSemanticNamespace;
  readonly categories: readonly CanonicalSemanticCategory[];
  readonly metadata?: CanonicalMetadata;
}
