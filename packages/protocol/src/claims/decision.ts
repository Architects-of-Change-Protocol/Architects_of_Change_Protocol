import type { DecisionStatus } from './claim-enums';
import type {
  CanonicalAuthorityId,
  CanonicalDecisionId,
  CanonicalDecisionMaker,
  CanonicalTimestamp,
} from './primitives';

export interface CanonicalDecision {
  readonly id: CanonicalDecisionId;
  readonly authorityRef: CanonicalAuthorityId;
  readonly status: DecisionStatus;
  readonly decisionMaker: CanonicalDecisionMaker;
  readonly decisionDate: CanonicalTimestamp;
  readonly reason?: string;
}
