import type { CanonicalProofRef } from '../proofs';
import type { CanonicalAttester, CanonicalAttestationId, CanonicalMetadata, CanonicalTimestamp } from '../primitives';
import type { CanonicalRegistryRef } from './registry-reference';

/**
 * Attests a registry declaration without evaluating trust in that declaration.
 */
export interface CanonicalRegistryAttestation {
  readonly id: CanonicalAttestationId;
  readonly registryRef: CanonicalRegistryRef;
  readonly attester: CanonicalAttester;
  readonly statement: string;
  readonly issuedAt: CanonicalTimestamp;
  readonly proofRefs?: readonly CanonicalProofRef[];
  readonly metadata?: CanonicalMetadata;
}
