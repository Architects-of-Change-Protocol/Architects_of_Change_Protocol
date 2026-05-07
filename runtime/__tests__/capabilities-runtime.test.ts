import {
  activateRuntimeCapability,
  applyCapabilityRevocation,
  createCapabilityRevocation,
  createCapabilitySession,
  evaluateCapabilityUse,
  expireRuntimeCapability,
  isCapabilityCurrentlyValid,
  issueCapabilityFromGovernanceSession,
} from '../capabilities';
import type { GovernanceSession } from '../governance/types';

function session(overrides: Partial<GovernanceSession> = {}): GovernanceSession {
  return {
    sessionId: 'gov_1',
    actorId: 'actor_a',
    relationshipId: 'rel_1',
    policyTraceId: 'trace_1',
    startedAt: '2026-05-01T00:00:00.000Z',
    runtimeState: 'approved',
    obligations: [],
    escalationRefs: [],
    auditRefs: [],
    ...overrides,
  };
}

describe('capability runtime layer', () => {
  test('issue and activate lifecycle', () => {
    const issued = issueCapabilityFromGovernanceSession({
      capabilityId: 'cap_1', subjectActorId: 'subject_1', granteeActorId: 'grantee_1', allowedActions: ['read'], scope: ['res://docs/'], governanceSession: session(),
    });
    const active = activateRuntimeCapability(issued);
    expect(active.status).toBe('active');
  });

  test('revoked cannot reactivate', () => {
    const issued = issueCapabilityFromGovernanceSession({ capabilityId: 'cap_2', subjectActorId: 'subject_1', granteeActorId: 'grantee_1', allowedActions: ['read'], scope: ['res://'], governanceSession: session() });
    const revoked = applyCapabilityRevocation(issued, createCapabilityRevocation({ revocationId: 'rev_1', capabilityId: 'cap_2', revokedByActorId: 'admin', reasonCodes: ['RISK'] }));
    expect(() => activateRuntimeCapability(revoked)).toThrow(/Revoked capability/);
  });

  test('expired cannot reactivate', () => {
    const issued = issueCapabilityFromGovernanceSession({ capabilityId: 'cap_3', subjectActorId: 'subject_1', granteeActorId: 'grantee_1', allowedActions: ['read'], scope: ['res://'], governanceSession: session() });
    const expired = expireRuntimeCapability(issued);
    expect(() => activateRuntimeCapability(expired)).toThrow(/Expired capability/);
  });

  test('notBefore blocks validity', () => {
    const issued = issueCapabilityFromGovernanceSession({ capabilityId: 'cap_4', subjectActorId: 'subject_1', granteeActorId: 'grantee_1', allowedActions: ['read'], scope: ['res://'], governanceSession: session(), notBefore: '2099-01-01T00:00:00.000Z' });
    const active = activateRuntimeCapability(issued);
    expect(isCapabilityCurrentlyValid(active, '2026-01-01T00:00:00.000Z')).toBe(false);
  });

  test('governance session required for issuance', () => {
    expect(() => issueCapabilityFromGovernanceSession({ capabilityId: 'cap_5', subjectActorId: 'subject_1', granteeActorId: 'grantee_1', allowedActions: ['read'], scope: ['res://'], governanceSession: session({ runtimeState: 'pending' }) })).toThrow(/approved or completed/);
  });

  test('pending obligations block issuance', () => {
    expect(() => issueCapabilityFromGovernanceSession({ capabilityId: 'cap_6', subjectActorId: 'subject_1', granteeActorId: 'grantee_1', allowedActions: ['read'], scope: ['res://'], governanceSession: session({ obligations: [{ obligationId: 'o1', obligationType: 'purpose_assertion', status: 'pending', issuedAt: '2026-01-01T00:00:00.000Z' }] }) })).toThrow(/pending/);
  });

  test('capability use denied for disallowed action', () => {
    const active = activateRuntimeCapability(issueCapabilityFromGovernanceSession({ capabilityId: 'cap_7', subjectActorId: 'subject_1', granteeActorId: 'grantee_1', allowedActions: ['read'], scope: ['res://docs/'], governanceSession: session() }));
    const result = evaluateCapabilityUse({ capability: active, session: createCapabilitySession({ sessionId: 'use_1', capabilityId: 'cap_7', actorId: 'grantee_1', action: 'write', resourceId: 'res://docs/a' }) });
    expect(result.decision.decision).toBe('deny');
    expect(result.decision.reasonCodes).toContain('ACTION_NOT_ALLOWED');
  });

  test('revocation application marks capability revoked', () => {
    const issued = issueCapabilityFromGovernanceSession({ capabilityId: 'cap_8', subjectActorId: 'subject_1', granteeActorId: 'grantee_1', allowedActions: ['read'], scope: ['res://'], governanceSession: session() });
    const revoked = applyCapabilityRevocation(issued, createCapabilityRevocation({ revocationId: 'rev_8', capabilityId: 'cap_8', revokedByActorId: 'admin', reasonCodes: ['EMERGENCY_STOP'] }));
    expect(revoked.status).toBe('revoked');
    expect(revoked.revokedAt).toBeDefined();
  });

  test('AI boundary denial', () => {
    const active = activateRuntimeCapability(issueCapabilityFromGovernanceSession({ capabilityId: 'cap_9', subjectActorId: 'subject_1', granteeActorId: 'grantee_1', allowedActions: ['read'], scope: ['res://'], governanceSession: session(), aiBoundary: { blockedScopes: ['res://secret/'] } }));
    const result = evaluateCapabilityUse({ capability: active, session: createCapabilitySession({ sessionId: 'use_9', capabilityId: 'cap_9', actorId: 'grantee_1', action: 'read', resourceId: 'res://secret/doc1' }) });
    expect(result.decision.decision).toBe('deny');
    expect(result.decision.reasonCodes).toContain('AI_BLOCKED_SCOPE');
  });
});
