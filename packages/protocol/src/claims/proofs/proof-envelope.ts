import type { CanonicalId } from '../../contracts';
import type { CanonicalIssuer, CanonicalMetadata, CanonicalSubject, CanonicalTimestamp } from '../primitives';
import type { CanonicalRegistryEntryRef } from '../registries/registry-entry-reference';
import type { ProofType } from './proof-enums';
import type { CanonicalProofRef } from './proof-reference';

/**
 * Portable wrapper for proof artifacts. The envelope names proof references and
 * participants without knowing how a proof was produced or whether it is valid.
 */
export interface CanonicalProofEnvelope {
  readonly id: CanonicalId;
  readonly proofType: ProofType;
  readonly proofRefs: readonly CanonicalProofRef[];
  readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
  readonly subject: CanonicalSubject;
  readonly issuer: CanonicalIssuer;
  readonly issuedAt: CanonicalTimestamp;
  readonly metadata: CanonicalMetadata;
}
