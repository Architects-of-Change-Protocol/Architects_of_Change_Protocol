import type { CanonicalId } from '../../contracts';
import type { CanonicalIssuer, CanonicalMetadata, CanonicalSource, CanonicalTimestamp } from '../primitives';
import type { ProofFormat } from './proof-enums';

/**
 * Represents a signature artifact or detached signature locator without verifying it.
 */
export interface CanonicalSignatureProof {
  readonly id: CanonicalId;
  readonly signer: CanonicalIssuer;
  readonly signatureFormat: ProofFormat;
  readonly signatureReference: CanonicalSource;
  readonly signedAt: CanonicalTimestamp;
  readonly metadata: CanonicalMetadata;
}
