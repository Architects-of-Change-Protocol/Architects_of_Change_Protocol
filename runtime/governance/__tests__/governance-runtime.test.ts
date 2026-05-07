import { GovernanceRuntime } from '../governance-runtime';
import { completeGovernanceSession, createGovernanceSession, startGovernanceEvaluation } from '../governance-session';
import { createEscalation, getActiveEscalations, resolveEscalation } from '../escalation-runtime';
import { approveHumanReview, createHumanReviewRequest, denyHumanReview } from '../human-review';
import { completeObligation, failObligation, listPendingObligations, registerObligation } from '../obligation-runtime';

describe('runtime/governance', () => {
  it('runs governance session lifecycle', () => {
    let session = createGovernanceSession({
      sessionId: 'sess_1',
      actorId: 'actor_1',
      relationshipId: 'rel_1',
      policyTraceId: 'trace_1',
      startedAt: '2026-01-01T00:00:00Z',
    });

    session = startGovernanceEvaluation(session);
    session = registerObligation(session, { obligationId: 'obl_1', obligationType: 'purpose_assertion' });
    session = completeObligation(session, 'obl_1');
    session = completeGovernanceSession(session, '2026-01-01T00:05:00Z');

    expect(session.runtimeState).toBe('completed');
    expect(session.completedAt).toBe('2026-01-01T00:05:00Z');
  });

  it('tracks obligation registration and pending list', () => {
    let session = startGovernanceEvaluation(
      createGovernanceSession({ sessionId: 'sess_2', actorId: 'actor_2', relationshipId: 'rel_2', policyTraceId: 'trace_2' })
    );
    session = registerObligation(session, { obligationId: 'obl_1', obligationType: 'consent_reaffirmation' });
    session = registerObligation(session, { obligationId: 'obl_2', obligationType: 'relationship_validation' });
    session = completeObligation(session, 'obl_1');

    const pending = listPendingObligations(session);
    expect(pending).toHaveLength(1);
    expect(pending[0].obligationId).toBe('obl_2');
  });

  it('handles escalation creation and resolution', () => {
    const session = startGovernanceEvaluation(
      createGovernanceSession({ sessionId: 'sess_3', actorId: 'actor_3', relationshipId: 'rel_3', policyTraceId: 'trace_3' })
    );
    const created = createEscalation(session, {
      escalationId: 'esc_1',
      escalationType: 'blocked_scope',
      triggeredBy: 'pdp',
      targetActorId: 'actor_3',
      reasonCodes: ['SCOPE_BLOCKED'],
    });

    const active = getActiveEscalations([created.escalation]);
    expect(active).toHaveLength(1);

    const resolved = resolveEscalation(created.escalation);
    expect(resolved.status).toBe('resolved');
  });

  it('supports human review approval and denial paths', () => {
    let session = startGovernanceEvaluation(
      createGovernanceSession({ sessionId: 'sess_4', actorId: 'actor_4', relationshipId: 'rel_4', policyTraceId: 'trace_4' })
    );
    const created = createHumanReviewRequest(session, {
      reviewId: 'rev_1',
      actorId: 'actor_4',
      requestedAction: 'sensitive_write',
      requestedScopes: ['records:write'],
      reasonCodes: ['SENSITIVE_ACTION'],
    });
    expect(created.session.runtimeState).toBe('awaiting_human_review');

    const approved = approveHumanReview(created.session, created.review);
    expect(approved.review.reviewStatus).toBe('approved');
    expect(approved.session.runtimeState).toBe('evaluating');

    const denied = denyHumanReview(created.session, { ...created.review, reviewId: 'rev_2' });
    expect(denied.review.reviewStatus).toBe('denied');
    expect(denied.session.runtimeState).toBe('denied');
  });

  it('enforces governance state transition constraints', () => {
    const session = createGovernanceSession({ sessionId: 'sess_5', actorId: 'actor_5', relationshipId: 'rel_5', policyTraceId: 'trace_5' });
    expect(() => completeGovernanceSession(session)).toThrow('Invalid governance state transition: pending -> approved');
  });

  it('propagates failed obligations to failed governance session', () => {
    let session = startGovernanceEvaluation(
      createGovernanceSession({ sessionId: 'sess_6', actorId: 'actor_6', relationshipId: 'rel_6', policyTraceId: 'trace_6' })
    );
    session = registerObligation(session, { obligationId: 'obl_fail', obligationType: 'frequency_enforcement' });
    session = failObligation(session, 'obl_fail');

    expect(session.runtimeState).toBe('failed');
  });

  it('runs ai escalation and human review orchestration hooks', () => {
    const events: string[] = [];
    const runtime = new GovernanceRuntime({ auditHook: (eventType) => events.push(eventType) });

    let session = runtime.startGovernanceEvaluation(
      runtime.createGovernanceSession({
        sessionId: 'sess_7',
        actorId: 'actor_7',
        relationshipId: 'rel_7',
        policyTraceId: 'trace_7',
      })
    );

    const applied = runtime.applyIdentityGovernanceFlags(session, {
      requiresEscalation: true,
      requiresHumanReview: true,
      reasonCodes: ['AI_FLAGGED'],
    });

    expect(applied.session.runtimeState).toBe('awaiting_human_review');
    expect(applied.escalations).toHaveLength(1);
    expect(applied.humanReview?.reviewStatus).toBe('pending');
    expect(events).toContain('AI_GOVERNANCE_FLAGS_APPLIED');
  });
});
