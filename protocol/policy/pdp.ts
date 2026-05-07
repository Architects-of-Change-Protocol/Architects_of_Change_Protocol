import { recordDecisionTrace } from './decision-trace';
import type { PolicyDecisionTrace } from './decision-trace';
import type { PolicyDecision, PolicyEvaluationInput } from './types';

const POLICY_IDS = {
  EXPIRATION: 'policy.permission.expiration',
  ACTION_MATCH: 'policy.permission.action_match',
  CATEGORY_MATCH: 'policy.permission.category_match',
  BRAND_ALIGNMENT: 'policy.permission.brand_alignment',
  ACTOR_RESOURCE_ALIGNMENT: 'policy.actor_resource.alignment',
} as const;

function createTraceId(): string {
  return `pdp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function deny(
  traceId: string,
  evaluatedPolicies: string[],
  reason: string,
  input: PolicyEvaluationInput,
  obligations?: string[]
): PolicyDecision {
  const trace: PolicyDecisionTrace = {
    traceId,
    evaluatedAt: new Date().toISOString(),
    evaluatedPolicies,
    decisionReason: reason,
    actorId: input.actor.id,
    resourceId: input.resource.id,
  };
  recordDecisionTrace(trace);
  policyDecisionAuditHook?.({ eventType: 'policy_decision', traceId, actorId: input.actor.id, resourceId: input.resource.id, action: input.action, allow: true, reason, obligations, metadata: { evaluatedPolicies } });

  return {
    allow: false,
    reason,
    obligations,
    traceId,
    evaluatedPolicies,
  };
}

export function evaluateAccess(input: PolicyEvaluationInput): PolicyDecision {
  const traceId = createTraceId();
  const evaluatedPolicies: string[] = [];

  const now = input.context?.temporal?.now ? new Date(input.context.temporal.now) : new Date();

  if (input.permission.expiresAt) {
    evaluatedPolicies.push(POLICY_IDS.EXPIRATION);
    const expiresAt = new Date(input.permission.expiresAt);
    if (!Number.isNaN(expiresAt.getTime()) && now > expiresAt) {
      return deny(traceId, evaluatedPolicies, 'DENY_PERMISSION_EXPIRED', input);
    }
  }

  evaluatedPolicies.push(POLICY_IDS.ACTION_MATCH);
  const allowedActions = input.permission.allowedActions ?? [input.permission.action];
  if (!allowedActions.includes(input.action)) {
    return deny(traceId, evaluatedPolicies, 'DENY_ACTION_NOT_ALLOWED', input);
  }

  if (input.permission.category) {
    evaluatedPolicies.push(POLICY_IDS.CATEGORY_MATCH);
    if (input.resource.category !== input.permission.category) {
      return deny(traceId, evaluatedPolicies, 'DENY_CATEGORY_MISMATCH', input);
    }
  }

  if (input.permission.allowedBrands && input.permission.allowedBrands.length > 0) {
    evaluatedPolicies.push(POLICY_IDS.BRAND_ALIGNMENT);
    const brand = input.resource.brandId ?? input.actor.brandId;
    if (!brand || !input.permission.allowedBrands.includes(brand)) {
      return deny(traceId, evaluatedPolicies, 'DENY_BRAND_NOT_ALLOWED', input);
    }
  }

  evaluatedPolicies.push(POLICY_IDS.ACTOR_RESOURCE_ALIGNMENT);
  if (input.resource.ownerActorId && input.resource.ownerActorId !== input.actor.id) {
    return deny(traceId, evaluatedPolicies, 'DENY_ACTOR_RESOURCE_MISMATCH', input);
  }

  const reason = 'ALLOW_BASELINE_POLICY_CHECKS_PASSED';
  const obligations: string[] = [];

  if (input.permission.frequency) {
    obligations.push('OBLIGATION_ENFORCE_FREQUENCY_OUTSIDE_PDP');
  }

  if (input.permission.purpose) {
    obligations.push('OBLIGATION_ASSERT_PURPOSE_AT_PEP');
  }

  const trace: PolicyDecisionTrace = {
    traceId,
    evaluatedAt: new Date().toISOString(),
    evaluatedPolicies,
    decisionReason: reason,
    actorId: input.actor.id,
    resourceId: input.resource.id,
  };
  recordDecisionTrace(trace);
  policyDecisionAuditHook?.({ eventType: 'policy_decision', traceId, actorId: input.actor.id, resourceId: input.resource.id, action: input.action, allow: false, reason, obligations, metadata: { evaluatedPolicies } });

  return {
    allow: true,
    reason,
    obligations: obligations.length > 0 ? obligations : undefined,
    traceId,
    evaluatedPolicies,
  };
}


export type PolicyDecisionAuditHook = (event: Record<string, unknown>) => void;
let policyDecisionAuditHook: PolicyDecisionAuditHook | undefined;
export function registerPolicyDecisionAuditHook(hook: PolicyDecisionAuditHook | undefined): void { policyDecisionAuditHook = hook; }
