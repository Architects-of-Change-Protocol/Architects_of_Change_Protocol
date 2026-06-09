import { ENFORCEMENT_REASON_CODES } from './enforcement-types';
import { buildDecisionTimestamp } from './enforcement-decision';
export function mapCapabilityStateToReason(state) {
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
export function buildDenyDecision(reason_code, reasons, context) {
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
export function buildAllowDecision(context) {
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
