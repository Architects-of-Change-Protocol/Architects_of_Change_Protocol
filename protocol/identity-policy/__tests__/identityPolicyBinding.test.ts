import { createDelegationGrant } from '../../identity/delegation';
import type { Actor } from '../../identity/types';
import { evaluateAccessWithIdentity } from '../identity-pdp-adapter';
import { evaluateIdentityPolicy } from '../identity-policy-evaluator';

function actor(overrides: Partial<Actor> = {}): Actor {
  const now = new Date().toISOString();
  return {
    actorId: overrides.actorId ?? 'actor-1',
    actorType: overrides.actorType ?? 'human',
    displayName: 'Actor',
    trustLevel: 'trusted',
    active: overrides.active ?? true,
    authorityBoundary: {
      maxDelegationDepth: 3,
      blockedActions: [],
      restrictedScopes: [],
      aiRestrictions: {
        disallowAutonomousDelegation: true,
        requireHumanEscalationForActions: [],
        blockedScopes: []
      },
      requireHumanReview: false,
      ...(overrides.authorityBoundary ?? {})
    },
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

describe('identity policy binding', () => {
  test('inactive actor denied', () => {
    const decision = evaluateIdentityPolicy({
      actor: actor({ active: false }),
      delegationGrants: [],
      requestedAction: 'read',
      requestedScopes: []
    });
    expect(decision.allow).toBe(false);
    expect(decision.reasons).toContain('DENY_ACTOR_INACTIVE');
  });

  test('valid delegation allowed through to PDP', () => {
    const root = actor({ actorId: 'root-1' });
    const delegate = actor({ actorId: 'delegate-1', actorType: 'delegate' });
    const grant = createDelegationGrant({
      grantId: 'g-1',
      delegatorActorId: root.actorId,
      delegateActorId: delegate.actorId,
      allowedActions: ['read'],
      allowedScopes: ['scope.a'],
      expiresAt: '2099-01-01T00:00:00.000Z'
    });

    const decision = evaluateAccessWithIdentity({
      identity: {
        actor: delegate,
        rootActor: root,
        delegateActor: delegate,
        delegationGrants: [grant],
        requestedAction: 'read',
        requestedScopes: ['scope.a']
      },
      policyInput: {
        resource: { id: 'r1', type: 'doc', ownerActorId: delegate.actorId },
        permission: { action: 'read' }
      }
    });

    expect(decision.allow).toBe(true);
    expect(decision.traceId).toBeDefined();
  });

  test('expired delegation denied', () => {
    const root = actor({ actorId: 'root-2' });
    const delegate = actor({ actorId: 'delegate-2', actorType: 'delegate' });
    const grant = createDelegationGrant({
      grantId: 'g-2',
      delegatorActorId: root.actorId,
      delegateActorId: delegate.actorId,
      allowedActions: ['read'],
      allowedScopes: ['scope.a'],
      expiresAt: '2000-01-01T00:00:00.000Z'
    });

    const decision = evaluateIdentityPolicy({
      actor: delegate,
      rootActor: root,
      delegateActor: delegate,
      delegationGrants: [grant],
      requestedAction: 'read',
      requestedScopes: ['scope.a']
    });

    expect(decision.allow).toBe(false);
    expect(decision.reasons).toContain('DENY_NO_ACTIVE_DELEGATION');
  });

  test('blocked action denied', () => {
    const decision = evaluateIdentityPolicy({
      actor: actor({ authorityBoundary: { maxDelegationDepth: 1, blockedActions: ['delete'], restrictedScopes: [], aiRestrictions: { disallowAutonomousDelegation: true, requireHumanEscalationForActions: [], blockedScopes: [] }, requireHumanReview: false } }),
      delegationGrants: [],
      requestedAction: 'delete',
      requestedScopes: []
    });

    expect(decision.allow).toBe(false);
    expect(decision.reasons).toContain('DENY_ACTOR_ACTION_BLOCKED');
  });

  test('AI blocked scope denied', () => {
    const decision = evaluateIdentityPolicy({
      actor: actor({ actorType: 'ai_agent', authorityBoundary: { maxDelegationDepth: 1, blockedActions: [], restrictedScopes: [], aiRestrictions: { disallowAutonomousDelegation: true, requireHumanEscalationForActions: [], blockedScopes: ['scope.secret'] }, requireHumanReview: false } }),
      delegationGrants: [],
      requestedAction: 'read',
      requestedScopes: ['scope.secret']
    });

    expect(decision.allow).toBe(false);
    expect(decision.reasons).toContain('DENY_AI_SCOPE_BLOCKED');
  });

  test('human review obligation returned for AI actor', () => {
    const decision = evaluateIdentityPolicy({
      actor: actor({ actorType: 'ai_agent', authorityBoundary: { maxDelegationDepth: 1, blockedActions: [], restrictedScopes: [], aiRestrictions: { disallowAutonomousDelegation: true, requireHumanEscalationForActions: ['deploy'], blockedScopes: [] }, requireHumanReview: true } }),
      delegationGrants: [],
      requestedAction: 'deploy',
      requestedScopes: []
    });

    expect(decision.obligations).toContain('OBLIGATION_HUMAN_REVIEW_REQUIRED');
    expect(decision.obligations).toContain('OBLIGATION_AI_ESCALATION_REQUIRED');
  });
});
