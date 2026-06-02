import type { VerificationStatus } from './claim-enums';
import type {
  CanonicalClaimId,
  CanonicalTimestamp,
  CanonicalVerificationId,
  CanonicalVerifier,
} from './primitives';

export interface CanonicalVerification {
  readonly id: CanonicalVerificationId;
  readonly claimRef: CanonicalClaimId;
  readonly status: VerificationStatus;
  readonly verifier: CanonicalVerifier;
  readonly verifiedAt: CanonicalTimestamp;
  readonly findings: readonly string[];
  readonly confidence?: number;
}
