import type { Actor, DelegationGrant, TrustChain } from '../identity/types';
import type { Actor as PDPActor, PolicyDecision, PolicyEvaluationInput } from '../policy/types';

export type AIGovernanceFlags = {
  requiresHumanReview: boolean;
  autonomousDelegationBlocked: boolean;
  sensitiveActionEscalationRequired: boolean;
  blockedByAIScopeRestriction: boolean;
};

export type IdentityPolicyContext = {
  actor: Actor;
  rootActor?: Actor;
  delegateActor?: Actor;
  delegationGrants: DelegationGrant[];
  requestedAction: string;
  requestedScopes: string[];
  trustChain?: TrustChain;
  now?: Date;
};

export type IdentityPolicyDecision = {
  allow: boolean;
  reasons: string[];
  obligations: string[];
  normalizedActor: ReturnType<typeof import('../identity/actor-registry').normalizeActorForPDP>;
  trustChainSummary?: {
    rootActorId: string;
    delegatedActors: string[];
    depth: number;
    valid: boolean;
    reasons: string[];
  };
  delegationGrantIds: string[];
  aiGovernanceFlags: AIGovernanceFlags;
};

export type EvaluateAccessWithIdentityInput = {
  identity: IdentityPolicyContext;
  policyInput: Omit<PolicyEvaluationInput, 'actor' | 'action'> & {
    actor?: PDPActor;
    action?: string;
  };
};

export type IdentityAwarePolicyDecision = PolicyDecision & {
  identityReasons?: string[];
  identityTrace?: {
    trustChainSummary?: IdentityPolicyDecision['trustChainSummary'];
    delegationGrantIds: string[];
    aiGovernanceFlags: AIGovernanceFlags;
  };
};
