import { createDelegationGrant, revokeDelegationGrant } from '../../identity/delegation';
import { evaluateAccessWithIdentity, registerIdentityDecisionAuditHook } from '../../identity-policy/identity-pdp-adapter';
import { type Actor, type DelegationGrant } from '../../identity/types';
import { evaluateAccess, registerPolicyDecisionAuditHook } from '../../policy/pdp';
import { createRelationship, activateRelationship, revokeRelationship } from '../../relationships/relationship-lifecycle';
import { InMemoryAuditPlane } from '../audit-plane';
import { createCorrelation, attachRelatedEvent } from '../audit-correlation';
import { normalizeAuditEvent } from '../audit-normalization';

const baseActor: Actor = {
  actorId: 'actor-1', actorType: 'human', displayName: 'Actor', trustLevel: 'trusted', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), authorityBoundary: { maxDelegationDepth: 2, blockedActions: [], restrictedScopes: [], requireHumanReview: false, aiRestrictions: { blockedScopes: [], disallowAutonomousDelegation: false, requireHumanEscalationForActions: [] } }
};

describe('durable audit plane', () => {
  it('normalizes heterogeneous events', () => {
    const event = normalizeAuditEvent({ event_id: 'e1', allow: false, reason: 'DENY_ACTION', subject_id: 'a1', traceId: 't1' });
    expect(event.eventId).toBe('e1');
    expect(event.decision).toBe('deny');
    expect(event.policyTraceId).toBe('t1');
  });

  it('creates and attaches correlated events', () => {
    const plane = new InMemoryAuditPlane();
    const root = plane.emitAuditEvent({ eventType: 'policy_decision', actorId: 'a1', allow: true, traceId: 'tr-1' });
    const corr = createCorrelation(root);
    const child = plane.emitAuditEvent({ eventType: 'delegation_created', actorId: 'a1' });
    const updated = attachRelatedEvent(corr, child);
    expect(updated.relatedEventIds).toContain(root.eventId);
    expect(updated.relatedEventIds).toContain(child.eventId);
  });

  it('emits PDP decision audit hooks', () => {
    const plane = new InMemoryAuditPlane();
    registerPolicyDecisionAuditHook((event) => plane.emitAuditEvent(event));
    evaluateAccess({ actor: { id: 'a1', type: 'human' }, action: 'write', permission: { action: 'read' }, resource: { id: 'r1', type: 'record' } });
    expect(plane.listAuditEvents().some((e) => e.eventType === 'policy_decision')).toBe(true);
  });

  it('emits identity denied and AI escalation events', () => {
    const plane = new InMemoryAuditPlane();
    registerIdentityDecisionAuditHook((event) => plane.emitAuditEvent(event));
    const grant: DelegationGrant = createDelegationGrant({ grantId: 'g1', delegatorActorId: 'root', delegateActorId: 'ai1', allowedActions: ['read'], allowedScopes: ['scope:ok'] });
    const aiActor: Actor = { ...baseActor, actorId: 'ai1', actorType: 'ai_agent', authorityBoundary: { ...baseActor.authorityBoundary, aiRestrictions: { blockedScopes: ['scope:blocked'], disallowAutonomousDelegation: false, requireHumanEscalationForActions: ['delete'] } } };
    evaluateAccessWithIdentity({ identity: { actor: aiActor, rootActor: { ...baseActor, actorId: 'root' }, delegateActor: aiActor, delegationGrants: [grant], requestedAction: 'delete', requestedScopes: ['scope:blocked'] }, policyInput: { permission: { action: 'delete' }, resource: { id: 'r1', type: 'record' } } });
    const events = plane.listAuditEvents();
    expect(events.some((e) => e.eventType === 'ai_scope_blocked' || e.eventType === 'identity_denied')).toBe(true);
  });

  it('emits relationship lifecycle and delegation grant changes', () => {
    const plane = new InMemoryAuditPlane();
    const relationship = createRelationship({ id: 'rel-1', type: 'employment', actors: [{ actorId: 'a', role: 'subject', actorType: 'human' }, { actorId: 'b', role: 'organization', actorType: 'organization' }] });
    plane.emitAuditEvent({ eventType: 'relationship_created', relationshipId: relationship.id, actorId: 'a' });
    const active = activateRelationship(relationship);
    plane.emitAuditEvent({ eventType: 'relationship_activated', relationshipId: active.id, actorId: 'a' });
    const revoked = revokeRelationship(active);
    plane.emitAuditEvent({ eventType: 'relationship_revoked', relationshipId: revoked.id, actorId: 'a' });
    const grant = createDelegationGrant({ grantId: 'g-1', delegatorActorId: 'a', delegateActorId: 'b', allowedActions: ['read'], allowedScopes: ['s1'] });
    plane.emitAuditEvent({ eventType: 'delegation_created', actorId: 'a', targetActorId: 'b', delegationGrantIds: [grant.grantId] });
    const revokedGrant = revokeDelegationGrant(grant);
    plane.emitAuditEvent({ eventType: 'delegation_revoked', actorId: 'a', targetActorId: 'b', delegationGrantIds: [revokedGrant.grantId] });
    expect(plane.getEventsForRelationship('rel-1')).toHaveLength(3);
  });
});
