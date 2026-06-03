import type { CanonicalMetadata, CanonicalSource, CanonicalTimestamp } from '../primitives';
import type { CanonicalProofRef } from '../proofs/proof-reference';
import type { CanonicalRegistryEntryRef } from '../registries/registry-entry-reference';
import type { CredentialStatus } from './credential-enums';

/**
 * Describes a declared or observed credential status without checking revocation,
 * evaluating standing, or verifying the credential.
 */
export interface CanonicalCredentialStatusRef {
  readonly status: CredentialStatus;
  readonly statusSource?: CanonicalSource;
  readonly observedAt?: CanonicalTimestamp;
  readonly proofRefs?: readonly CanonicalProofRef[];
  readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
  readonly metadata?: CanonicalMetadata;
}
