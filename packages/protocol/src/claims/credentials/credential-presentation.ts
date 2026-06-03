import type { CanonicalId } from '../../contracts';
import type { CanonicalMetadata, CanonicalTimestamp } from '../primitives';
import type { CanonicalPrincipalRef } from '../references';
import type { CanonicalProofRef } from '../proofs/proof-reference';
import type { CanonicalRegistryEntryRef } from '../registries/registry-entry-reference';
import type { CanonicalCredentialRef } from './credential-reference';

/**
 * Represents a portable credential presentation event without wallet behavior,
 * selective disclosure, or presentation verification.
 */
export interface CanonicalCredentialPresentation {
  readonly id: CanonicalId;
  readonly credentialRefs: readonly CanonicalCredentialRef[];
  readonly holder: CanonicalPrincipalRef;
  readonly presentedTo?: CanonicalPrincipalRef;
  readonly presentedAt: CanonicalTimestamp;
  readonly proofRefs?: readonly CanonicalProofRef[];
  readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
  readonly metadata?: CanonicalMetadata;
}
