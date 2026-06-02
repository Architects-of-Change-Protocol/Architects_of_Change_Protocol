import type { StandingStatus } from './claim-enums';
import type {
  CanonicalClaimId,
  CanonicalStandingId,
  CanonicalTimestamp,
} from './primitives';

export interface CanonicalStanding {
  readonly id: CanonicalStandingId;
  readonly claimRef: CanonicalClaimId;
  readonly status: StandingStatus;
  readonly reason?: string;
  readonly effectiveAt: CanonicalTimestamp;
  readonly expiresAt?: CanonicalTimestamp;
}
