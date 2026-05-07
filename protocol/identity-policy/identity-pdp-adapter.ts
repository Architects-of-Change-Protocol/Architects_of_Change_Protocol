import type { IdentityPolicyContext } from './types';
import { evaluateAccess } from '../policy/pdp';
import type { PolicyDecision } from '../policy/types';
import { evaluateIdentityPolicy } from './identity-policy-evaluator';
import type { EvaluateAccessWithIdentityInput, IdentityAwarePolicyDecision } from './types';

export function evaluateAccessWithIdentity(input: EvaluateAccessWithIdentityInput): IdentityAwarePolicyDecision {
  const identityDecision = evaluateIdentityPolicy(input.identity);

  if (!identityDecision.allow) {
    const denied: PolicyDecision = {
      allow: false,
      reason: identityDecision.reasons[0] ?? 'DENY_IDENTITY_POLICY',
      obligations: identityDecision.obligations.length > 0 ? identityDecision.obligations : undefined,
      traceId: `pdp_identity_${Date.now()}`,
      evaluatedPolicies: ['policy.identity.precheck']
    };

    identityDecisionAuditHook?.({ eventType: 'identity_denied', actorId: input.identity.actor.actorId, action: input.identity.requestedAction, allow: false, reasons: identityDecision.reasons, obligations: identityDecision.obligations, delegationGrantIds: identityDecision.delegationGrantIds, trustChainRef: identityDecision.trustChainSummary?.rootActorId, metadata: { aiGovernanceFlags: identityDecision.aiGovernanceFlags } });
  return {
      ...denied,
      identityReasons: identityDecision.reasons,
      identityTrace: {
        trustChainSummary: identityDecision.trustChainSummary,
        delegationGrantIds: identityDecision.delegationGrantIds,
        aiGovernanceFlags: identityDecision.aiGovernanceFlags
      }
    };
  }

  const pdpDecision = evaluateAccess({
    ...input.policyInput,
    actor: input.policyInput.actor ?? {
      id: identityDecision.normalizedActor.actorId,
      type: identityDecision.normalizedActor.actorType as 'human' | 'organization' | 'brand' | 'app' | 'ai_agent',
      organizationId: identityDecision.normalizedActor.organizationId,
      metadata: {
        trustLevel: identityDecision.normalizedActor.trustLevel,
        active: identityDecision.normalizedActor.active
      }
    },
    action: input.policyInput.action ?? input.identity.requestedAction
  });


  identityDecisionAuditHook?.({
    eventType: identityDecision.aiGovernanceFlags.blockedByAIScopeRestriction
      ? 'ai_scope_blocked'
      : identityDecision.aiGovernanceFlags.sensitiveActionEscalationRequired
        ? 'ai_escalation_required'
        : 'policy_decision',
    actorId: input.identity.actor.actorId,
    action: input.identity.requestedAction,
    allow: pdpDecision.allow,
    reasons: identityDecision.reasons,
    obligations: Array.from(new Set([...(pdpDecision.obligations ?? []), ...identityDecision.obligations])),
    traceId: pdpDecision.traceId,
    delegationGrantIds: identityDecision.delegationGrantIds,
    trustChainRef: identityDecision.trustChainSummary?.rootActorId,
    metadata: { aiGovernanceFlags: identityDecision.aiGovernanceFlags }
  });

  return {
    ...pdpDecision,
    obligations: Array.from(new Set([...(pdpDecision.obligations ?? []), ...identityDecision.obligations])),
    evaluatedPolicies: [...pdpDecision.evaluatedPolicies, 'policy.identity.precheck'],
    identityReasons: identityDecision.reasons,
    identityTrace: {
      trustChainSummary: identityDecision.trustChainSummary,
      delegationGrantIds: identityDecision.delegationGrantIds,
      aiGovernanceFlags: identityDecision.aiGovernanceFlags
    }
  };
}


export type IdentityDecisionAuditHook = (event: Record<string, unknown>) => void;
let identityDecisionAuditHook: IdentityDecisionAuditHook | undefined;
export function registerIdentityDecisionAuditHook(hook: IdentityDecisionAuditHook | undefined): void { identityDecisionAuditHook = hook; }