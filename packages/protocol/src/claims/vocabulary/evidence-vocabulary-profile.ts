import type { EvidenceType } from '../claim-enums';
import type { CanonicalMetadata } from '../primitives';
import type { CanonicalSemanticRef } from './semantic-reference';

/** Descriptive semantic profile for evidence types. */
export interface CanonicalEvidenceVocabularyProfile {
  readonly evidenceType: EvidenceType;
  readonly semanticRefs: readonly CanonicalSemanticRef[];
  readonly metadata?: CanonicalMetadata;
}
