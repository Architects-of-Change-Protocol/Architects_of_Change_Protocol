import { setSessionState } from './governance-session';
import type { EscalationPath, EscalationType, GovernanceSession } from './types';

export function createEscalation(
  session: GovernanceSession,
  input: {
    escalationId: string;
    escalationType: EscalationType;
    triggeredBy: string;
    targetActorId: string;
    reasonCodes: string[];
    createdAt?: string;
  }
): { session: GovernanceSession; escalation: EscalationPath } {
  const escalation: EscalationPath = {
    escalationId: input.escalationId,
    escalationType: input.escalationType,
    triggeredBy: input.triggeredBy,
    targetActorId: input.targetActorId,
    reasonCodes: input.reasonCodes,
    status: 'active',
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  const nextSession = setSessionState({ ...session, escalationRefs: [...session.escalationRefs, escalation.escalationId] }, 'escalated');
  return { session: nextSession, escalation };
}

export function resolveEscalation(escalation: EscalationPath, resolvedAt?: string): EscalationPath {
  if (escalation.status === 'resolved') return escalation;
  return { ...escalation, status: 'resolved', resolvedAt: resolvedAt ?? new Date().toISOString() };
}

export function getActiveEscalations(escalations: readonly EscalationPath[]): EscalationPath[] {
  return escalations.filter((entry) => entry.status === 'active');
}
