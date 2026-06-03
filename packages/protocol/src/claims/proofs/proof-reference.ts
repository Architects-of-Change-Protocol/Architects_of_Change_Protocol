import type { CanonicalId } from '../../contracts';
import type { CanonicalMetadata, CanonicalSource } from '../primitives';
import type { ProofType } from './proof-enums';

/**
 * References a proof artifact without embedding, resolving, or validating that artifact.
 */
export interface CanonicalProofRef {
  readonly id: CanonicalId;
  readonly type: ProofType;
  readonly source: CanonicalSource;
  readonly description?: string;
  readonly metadata?: CanonicalMetadata;
}
