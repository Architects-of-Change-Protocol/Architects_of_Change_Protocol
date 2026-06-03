import type { CanonicalMetadata } from '../primitives';
import type { RegistryType } from '../registries/registry-enums';
import type { CanonicalSemanticRef } from './semantic-reference';

/** Descriptive semantic profile for registry types. */
export interface CanonicalRegistryVocabularyProfile {
  readonly registryType: RegistryType;
  readonly semanticRefs: readonly CanonicalSemanticRef[];
  readonly metadata?: CanonicalMetadata;
}
