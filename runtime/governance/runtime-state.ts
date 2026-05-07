import type { GovernanceRuntimeState } from './types';

const ALLOWED_TRANSITIONS: Record<GovernanceRuntimeState, GovernanceRuntimeState[]> = {
  pending: ['evaluating', 'failed'],
  evaluating: ['approved', 'denied', 'escalated', 'awaiting_human_review', 'failed'],
  approved: ['completed', 'failed'],
  denied: ['completed'],
  escalated: ['evaluating', 'awaiting_human_review', 'failed'],
  awaiting_human_review: ['evaluating', 'denied', 'failed'],
  completed: [],
  failed: [],
};

export function assertStateTransition(from: GovernanceRuntimeState, to: GovernanceRuntimeState): void {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid governance state transition: ${from} -> ${to}`);
  }
}
