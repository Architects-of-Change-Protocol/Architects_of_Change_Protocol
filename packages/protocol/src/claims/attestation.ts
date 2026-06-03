import type { AttestationType } from './claim-enums';
import type { CanonicalCredentialRef } from './credentials/credential-reference';
import type { CanonicalProofRef } from './proofs';
import type { CanonicalRegistryEntryRef } from './registries/registry-entry-reference';
import type {
  CanonicalAttestationId,
  CanonicalAttester,
  CanonicalClaimId,
  CanonicalMetadata,
  CanonicalTimestamp,
} from './primitives';

export interface CanonicalAttestation {
  readonly id: CanonicalAttestationId;
  readonly type: AttestationType;
  readonly attester: CanonicalAttester;
  readonly claimRef: CanonicalClaimId;
  readonly statement: string;
  readonly issuedAt: CanonicalTimestamp;
  readonly credentialRefs?: readonly CanonicalCredentialRef[];
  readonly proofRefs?: readonly CanonicalProofRef[];
  readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
  readonly metadata?: CanonicalMetadata;
}
