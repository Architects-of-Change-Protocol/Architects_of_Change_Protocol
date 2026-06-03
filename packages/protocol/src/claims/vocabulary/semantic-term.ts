import type { CanonicalMetadata } from '../primitives';
import type { CanonicalSemanticNamespace, CanonicalSemanticTermId } from './semantic-identifiers';

/**
 * Portable semantic definition.
 *
 * A term names a concept and its meaning. It does not classify data at runtime,
 * infer relationships, evaluate trust, derive authority, or make decisions.
 */
export interface CanonicalSemanticTerm {
  readonly id: CanonicalSemanticTermId;
  readonly name: string;
  readonly description: string;
  readonly namespace: CanonicalSemanticNamespace;
  readonly aliases?: readonly string[];
  readonly metadata?: CanonicalMetadata;
}
