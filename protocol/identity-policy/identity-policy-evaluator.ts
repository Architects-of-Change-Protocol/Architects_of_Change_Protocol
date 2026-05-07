import { normalizeActorForPDP } from '../identity/actor-registry';
import { validateDelegationGrant } from '../identity/delegation';
import { buildTrustChain, validateTrustChain } from '../identity/trust-chain';
import type { DelegationGrant } from '../identity/types';
import type { IdentityPolicyContext, IdentityPolicyDecision } from './types';

function findDelegationGrant(context: IdentityPolicyContext, now: Date): DelegationGrant | undefined {
  if (!context.rootActor || !context.delegateActor) return undefined;
  return context.delegationGrants.find((grant) => {
    if (grant.delegatorActorId !== context.rootActor!.actorId) return false;
    if (grant.delegateActorId !== context.delegateActor!.actorId) return false;
    if (grant.revokedAt && grant.revokedAt <= now.toISOString()) return false;
    if (grant.expiresAt && grant.expiresAt <= now.toISOString()) return false;
    return true;
  });
}

export function evaluateIdentityPolicy(context: IdentityPolicyContext): IdentityPolicyDecision {
  const now = context.now ?? new Date();
  const reasons: string[] = [];
  const obligations: string[] = [];
  const normalizedActor = normalizeActorForPDP(context.actor);
  const grantIds: string[] = [];

  const flags = {
    requiresHumanReview: false,
    autonomousDelegationBlocked: false,
    sensitiveActionEscalationRequired: false,
    blockedByAIScopeRestriction: false
  };

  if (!context.actor.active) {
    reasons.push('DENY_ACTOR_INACTIVE');
  }

  const actingBoundary = context.actor.authorityBoundary;
  if (actingBoundary.blockedActions.includes(context.requestedAction)) {
    reasons.push('DENY_ACTOR_ACTION_BLOCKED');
  }

  const restrictedScopeHit = context.requestedScopes.some((scope) => actingBoundary.restrictedScopes.includes(scope));
  if (restrictedScopeHit) {
    reasons.push('DENY_ACTOR_SCOPE_RESTRICTED');
  }

  if (context.delegateActor) {
    if (!context.delegateActor.active) reasons.push('DENY_ACTOR_INACTIVE');

    const grant = findDelegationGrant(context, now);
    if (!grant) {
      reasons.push('DENY_NO_ACTIVE_DELEGATION');
    } else {
      grantIds.push(grant.grantId);
      const validation = validateDelegationGrant(grant, context.requestedAction, context.requestedScopes, now);
      if (!validation.valid) {
        if (validation.reasons.some((r) => r.includes('SCOPE_NOT_ALLOWED'))) reasons.push('DENY_DELEGATION_SCOPE_NOT_ALLOWED');
        if (validation.reasons.includes('ACTION_NOT_ALLOWED')) reasons.push('DENY_DELEGATION_ACTION_NOT_ALLOWED');
        if (validation.reasons.includes('GRANT_EXPIRED') || validation.reasons.includes('GRANT_REVOKED')) reasons.push('DENY_NO_ACTIVE_DELEGATION');
      }
    }

    if (context.rootActor) {
      const chain = context.trustChain ?? buildTrustChain(context.rootActor.actorId, context.delegateActor.actorId, context.delegationGrants, now);
      const maxDepth = Math.min(context.rootActor.authorityBoundary.maxDelegationDepth, context.delegateActor.authorityBoundary.maxDelegationDepth);
      const chainValidation = validateTrustChain(chain, maxDepth);
      if (!chainValidation.valid) {
        reasons.push('DENY_TRUST_CHAIN_INVALID');
        if (chainValidation.reasons.includes('MAX_DELEGATION_DEPTH_EXCEEDED')) reasons.push('DENY_MAX_DELEGATION_DEPTH_EXCEEDED');
      }
    }
  }

  if (context.actor.authorityBoundary.maxDelegationDepth < 0) {
    reasons.push('DENY_MAX_DELEGATION_DEPTH_EXCEEDED');
  }

  const aiActors = [context.actor, context.delegateActor].filter((a): a is NonNullable<typeof a> => Boolean(a)).filter((a) => a.actorType === 'ai_agent');
  for (const aiActor of aiActors) {
    const aiPolicy = aiActor.authorityBoundary.aiRestrictions;
    if (aiPolicy.disallowAutonomousDelegation && context.delegateActor && context.actor.actorType === 'ai_agent') {
      flags.autonomousDelegationBlocked = true;
      reasons.push('DENY_NO_ACTIVE_DELEGATION');
    }

    const blockedScope = context.requestedScopes.some((scope) => aiPolicy.blockedScopes.includes(scope));
    if (blockedScope) {
      flags.blockedByAIScopeRestriction = true;
      reasons.push('DENY_AI_SCOPE_BLOCKED');
    }

    const requiresEscalation = aiPolicy.requireHumanEscalationForActions.includes(context.requestedAction);
    if (requiresEscalation) {
      flags.sensitiveActionEscalationRequired = true;
      obligations.push('OBLIGATION_AI_ESCALATION_REQUIRED');
    }

    if (aiActor.authorityBoundary.requireHumanReview) {
      flags.requiresHumanReview = true;
      obligations.push('OBLIGATION_HUMAN_REVIEW_REQUIRED');
    }
  }

  return {
    allow: reasons.length === 0,
    reasons: Array.from(new Set(reasons)),
    obligations: Array.from(new Set(obligations)),
    normalizedActor,
    trustChainSummary: context.trustChain
      ? {
          rootActorId: context.trustChain.rootActorId,
          delegatedActors: context.trustChain.delegatedActors,
          depth: context.trustChain.trustPath.length,
          valid: context.trustChain.chainValidity === 'valid',
          reasons: context.trustChain.reasons
        }
      : undefined,
    delegationGrantIds: grantIds,
    aiGovernanceFlags: flags
  };
}
