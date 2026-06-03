import type { ClaimType } from './claim-enums';
import type { CanonicalCredentialRef } from './credentials/credential-reference';
import type { CanonicalProofRef } from './proofs';
import type { CanonicalRegistryEntryRef } from './registries/registry-entry-reference';
import type {
  CanonicalAssertionId,
  CanonicalAttestationId,
  CanonicalClaimId,
  CanonicalEvidenceId,
  CanonicalIssuer,
  CanonicalMetadata,
  CanonicalSubject,
  CanonicalTimestamp,
} from './primitives';

export interface CanonicalClaim {
  readonly id: CanonicalClaimId;
  readonly type: ClaimType;
  readonly subject: CanonicalSubject;
  readonly issuer: CanonicalIssuer;
  readonly assertionRef: CanonicalAssertionId;
  readonly evidenceRefs: readonly CanonicalEvidenceId[];
  readonly attestationRefs: readonly CanonicalAttestationId[];
  readonly credentialRefs?: readonly CanonicalCredentialRef[];
  readonly proofRefs?: readonly CanonicalProofRef[];
  readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
  readonly issuedAt: CanonicalTimestamp;
  readonly expiresAt?: CanonicalTimestamp;
  readonly metadata?: CanonicalMetadata;
}
