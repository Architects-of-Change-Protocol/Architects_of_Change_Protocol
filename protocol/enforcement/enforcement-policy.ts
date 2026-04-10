import type { CapabilityState } from '../capability/capability-types';
import type {
  EnforcementDecision,
  EnforcementReasonCode,
  NormalizedEnforcementRequest,
} from './enforcement-types';
import { ENFORCEMENT_REASON_CODES } from './enforcement-types';
import type { ProtocolCapability } from '../capability/capability-types';
import { buildDecisionTimestamp } from './enforcement-decision';

export function mapCapabilityStateToReason(state: CapabilityState): EnforcementReasonCode {
  switch (state) {
    case 'expired':
      return ENFORCEMENT_REASON_CODES.CAPABILITY_EXPIRED;
    case 'revoked':
      return ENFORCEMENT_REASON_CODES.CAPABILITY_REVOKED;
    case 'not_yet_active':
      return ENFORCEMENT_REASON_CODES.CAPABILITY_NOT_YET_ACTIVE;
    case 'invalid':
      return ENFORCEMENT_REASON_CODES.CAPABILITY_INVALID;
    case 'active':
      return ENFORCEMENT_REASON_CODES.ENFORCEMENT_ALLOW;
    default:
      return ENFORCEMENT_REASON_CODES.CAPABILITY_INVALID;
  }
}

type DecisionContext = {
  now: Date;
  normalized_request?: NormalizedEnforcementRequest;
  normalized_capability?: ProtocolCapability;
  matched_scope?: NormalizedEnforcementRequest['requested_scope'];
  matched_permissions?: string[];
};

export function buildDenyDecision(
  reason_code: EnforcementReasonCode,
  reasons: string[],
  context: DecisionContext
): EnforcementDecision {
  return {
    allowed: false,
    decision: 'deny',
    reason_code,
    reasons,
    evaluated_at: buildDecisionTimestamp(context.now),
    normalized_request: context.normalized_request,
    normalized_capability: context.normalized_capability,
    matched_scope: context.matched_scope,
    matched_permissions: context.matched_permissions,
  };
}

export function buildAllowDecision(context: DecisionContext): EnforcementDecision {
  return {
    allowed: true,
    decision: 'allow',
    reason_code: ENFORCEMENT_REASON_CODES.ENFORCEMENT_ALLOW,
    reasons: ['Enforcement checks passed.'],
    evaluated_at: buildDecisionTimestamp(context.now),
    normalized_request: context.normalized_request,
    normalized_capability: context.normalized_capability,
    matched_scope: context.matched_scope,
    matched_permissions: context.matched_permissions,
  };
}
