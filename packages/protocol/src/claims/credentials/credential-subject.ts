import type { CanonicalId } from '../../contracts';
import type { CanonicalMetadata } from '../primitives';
import type { CanonicalPrincipalRef } from '../references';
import type { CanonicalRegistryEntryRef } from '../registries/registry-entry-reference';
import type { CredentialSubjectKind } from './credential-enums';

/**
 * Identifies the subject of a credential without verifying identity or standing.
 */
export interface CanonicalCredentialSubject {
  readonly id: CanonicalId;
  readonly kind: CredentialSubjectKind;
  readonly principalRef?: CanonicalPrincipalRef;
  readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
  readonly metadata?: CanonicalMetadata;
}
