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
