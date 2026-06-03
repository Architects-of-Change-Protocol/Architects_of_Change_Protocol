import type {
  CanonicalAttestationId,
  CanonicalClaimId,
  CanonicalEvidenceId,
  CanonicalMetadata,
  CanonicalTimestamp,
} from '../primitives';
import type { CanonicalProofRef } from '../proofs/proof-reference';
import type { CanonicalRegistryEntryRef } from '../registries/registry-entry-reference';
import type { CredentialFormat, CredentialType } from './credential-enums';
import type { CanonicalCredentialId } from './credential-identifiers';
import type { CanonicalCredentialIssuer } from './credential-issuer';
import type { CanonicalCredentialStatusRef } from './credential-status-reference';
import type { CanonicalCredentialSubject } from './credential-subject';

/**
 * Portable credential descriptor that bundles references to trust-chain artifacts.
 * It does not embed claims or evaluate verification, standing, authority, or decisions.
 */
export interface CanonicalCredential {
  readonly id: CanonicalCredentialId;
  readonly type: CredentialType;
  readonly format: CredentialFormat;
  readonly issuer: CanonicalCredentialIssuer;
  readonly subject: CanonicalCredentialSubject;
  readonly claimRefs: readonly CanonicalClaimId[];
  readonly evidenceRefs?: readonly CanonicalEvidenceId[];
  readonly attestationRefs?: readonly CanonicalAttestationId[];
  readonly proofRefs?: readonly CanonicalProofRef[];
  readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
  readonly status?: CanonicalCredentialStatusRef;
  readonly issuedAt: CanonicalTimestamp;
  readonly expiresAt?: CanonicalTimestamp;
  readonly metadata?: CanonicalMetadata;
}
