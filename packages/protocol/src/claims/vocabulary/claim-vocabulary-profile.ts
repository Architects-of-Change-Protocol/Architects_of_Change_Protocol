import type { ClaimType } from '../claim-enums';
import type { CanonicalMetadata } from '../primitives';
import type { CanonicalSemanticRef } from './semantic-reference';

/**
 * Describes semantic concepts commonly associated with a claim type.
 *
 * This profile is descriptive only and carries no runtime evaluation behavior.
 */
export interface CanonicalClaimVocabularyProfile {
  readonly claimType: ClaimType;
  readonly semanticRefs: readonly CanonicalSemanticRef[];
  readonly metadata?: CanonicalMetadata;
}
