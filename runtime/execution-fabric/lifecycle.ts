import { GovernanceExecutionPlanStatus } from './types';

export const EXECUTION_STATE_TRANSITIONS: Record<GovernanceExecutionPlanStatus, GovernanceExecutionPlanStatus[]> = {
  planned: ['running', 'cancelled', 'invalid'],
  running: ['paused', 'waiting_remote_runtime', 'waiting_human_review', 'failed', 'completed', 'cancelled', 'checkpointed', 'suspended'],
  paused: ['running', 'cancelled', 'failed', 'suspended'],
  waiting_remote_runtime: ['running', 'failed', 'cancelled', 'suspended'],
  waiting_human_review: ['running', 'failed', 'cancelled', 'suspended'],
  checkpointed: ['running', 'suspended', 'replayed', 'failed', 'cancelled'],
  suspended: ['resumed', 'cancelled', 'failed'],
  resumed: ['running', 'failed', 'cancelled'],
  replayed: ['running', 'failed', 'completed', 'cancelled'],
  failed: ['replayed'],
  completed: [],
  cancelled: [],
  invalid: [],
};

export function validateExecutionTransition(
  from: GovernanceExecutionPlanStatus,
  to: GovernanceExecutionPlanStatus,
): boolean {
  return EXECUTION_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transitionExecutionState(
  from: GovernanceExecutionPlanStatus,
  to: GovernanceExecutionPlanStatus,
): GovernanceExecutionPlanStatus {
  if (!validateExecutionTransition(from, to)) {
    throw new Error(`Invalid execution transition: ${from} -> ${to}`);
  }
  return to;
}
