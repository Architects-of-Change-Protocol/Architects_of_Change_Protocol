import type { CanonicalMetadata } from '../primitives';
import type { CanonicalProofRef } from '../proofs/proof-reference';
import type { CanonicalRegistryEntryRef } from '../registries/registry-entry-reference';
import type { CredentialFormat, CredentialType } from './credential-enums';
import type { CanonicalCredentialId, CanonicalCredentialLocator } from './credential-identifiers';
import type { CanonicalCredentialIssuer } from './credential-issuer';
import type { CanonicalCredentialStatusRef } from './credential-status-reference';
import type { CanonicalCredentialSubject } from './credential-subject';

/**
 * References a credential without embedding or verifying the full credential.
 */
export interface CanonicalCredentialRef {
  readonly id: CanonicalCredentialId;
  readonly type: CredentialType;
  readonly format?: CredentialFormat;
  readonly locator?: CanonicalCredentialLocator;
  readonly issuer?: CanonicalCredentialIssuer;
  readonly subject?: CanonicalCredentialSubject;
  readonly status?: CanonicalCredentialStatusRef;
  readonly proofRefs?: readonly CanonicalProofRef[];
  readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
  readonly metadata?: CanonicalMetadata;
}
