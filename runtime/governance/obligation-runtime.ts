import { failGovernanceSession, setSessionState, upsertObligation } from './governance-session';
import type { GovernanceObligation, GovernanceObligationType, GovernanceSession } from './types';

export function registerObligation(
  session: GovernanceSession,
  input: { obligationId: string; obligationType: GovernanceObligationType; issuedAt?: string; metadata?: Record<string, unknown> }
): GovernanceSession {
  const obligation: GovernanceObligation = {
    obligationId: input.obligationId,
    obligationType: input.obligationType,
    status: 'pending',
    issuedAt: input.issuedAt ?? new Date().toISOString(),
    metadata: input.metadata,
  };
  return upsertObligation(session, obligation);
}

export function completeObligation(session: GovernanceSession, obligationId: string, completedAt?: string): GovernanceSession {
  const found = session.obligations.find((entry) => entry.obligationId === obligationId);
  if (found === undefined) throw new Error(`Obligation not found: ${obligationId}`);
  if (found.status === 'failed') throw new Error(`Cannot complete failed obligation: ${obligationId}`);
  return upsertObligation(session, { ...found, status: 'completed', completedAt: completedAt ?? new Date().toISOString() });
}

export function failObligation(session: GovernanceSession, obligationId: string, completedAt?: string): GovernanceSession {
  const found = session.obligations.find((entry) => entry.obligationId === obligationId);
  if (found === undefined) throw new Error(`Obligation not found: ${obligationId}`);
  const updated = upsertObligation(session, { ...found, status: 'failed', completedAt: completedAt ?? new Date().toISOString() });
  return failGovernanceSession(updated, completedAt);
}

export function listPendingObligations(session: GovernanceSession): GovernanceObligation[] {
  return session.obligations.filter((entry) => entry.status === 'pending');
}

export function canFinalizeEvaluation(session: GovernanceSession): GovernanceSession {
  if (listPendingObligations(session).length > 0) {
    return setSessionState(session, 'evaluating');
  }
  return setSessionState(session, 'approved');
}
