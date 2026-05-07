import { assertStateTransition } from './runtime-state';
import type { GovernanceObligation, GovernanceRuntimeState, GovernanceSession } from './types';

export function createGovernanceSession(input: {
  sessionId: string;
  actorId: string;
  relationshipId: string;
  policyTraceId: string;
  startedAt?: string;
}): GovernanceSession {
  return {
    sessionId: input.sessionId,
    actorId: input.actorId,
    relationshipId: input.relationshipId,
    policyTraceId: input.policyTraceId,
    startedAt: input.startedAt ?? new Date().toISOString(),
    runtimeState: 'pending',
    obligations: [],
    escalationRefs: [],
    auditRefs: [],
  };
}

export function startGovernanceEvaluation(session: GovernanceSession): GovernanceSession {
  return transition(session, 'evaluating');
}

export function completeGovernanceSession(session: GovernanceSession, completedAt?: string): GovernanceSession {
  if (session.runtimeState === 'escalated') {
    throw new Error('Cannot complete governance session while escalations are active.');
  }
  if (session.runtimeState === 'awaiting_human_review') {
    throw new Error('Cannot complete governance session while human review is pending.');
  }
  if (session.obligations.some((obligation) => obligation.status === 'pending')) {
    throw new Error('Cannot complete governance session with pending obligations.');
  }
  if (session.obligations.some((obligation) => obligation.status === 'failed')) {
    throw new Error('Cannot complete governance session with failed obligations.');
  }

  const resolved: GovernanceSession = session.runtimeState === 'denied' ? transition(session, 'completed') : transition(transition(session, 'approved'), 'completed');
  return { ...resolved, completedAt: completedAt ?? new Date().toISOString() };
}

export function failGovernanceSession(session: GovernanceSession, completedAt?: string): GovernanceSession {
  return { ...transition(session, 'failed'), completedAt: completedAt ?? new Date().toISOString() };
}

export function setSessionState(session: GovernanceSession, runtimeState: GovernanceRuntimeState): GovernanceSession {
  return transition(session, runtimeState);
}

export function upsertObligation(session: GovernanceSession, obligation: GovernanceObligation): GovernanceSession {
  const obligations = session.obligations.filter((entry) => entry.obligationId !== obligation.obligationId);
  obligations.push(obligation);
  return { ...session, obligations };
}

function transition(session: GovernanceSession, to: GovernanceRuntimeState): GovernanceSession {
  assertStateTransition(session.runtimeState, to);
  return { ...session, runtimeState: to };
}
