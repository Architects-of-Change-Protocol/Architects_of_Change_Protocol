import { GovernanceExecutionPlan, GovernanceExecutionPlanStatus, GovernanceExecutionStep } from './types';

export function canStartPlan(status: GovernanceExecutionPlanStatus): boolean {
  return status === 'planned' || status === 'paused';
}

export function hasUnfinishedRequiredSteps(plan: GovernanceExecutionPlan): boolean {
  return plan.executionSteps.some((step) => !step.optional && step.status !== 'completed');
}

export function planIsWaiting(plan: GovernanceExecutionPlan): boolean {
  return plan.status === 'waiting_remote_runtime' || plan.status === 'waiting_human_review';
}

export function findStep(plan: GovernanceExecutionPlan, stepId: string): GovernanceExecutionStep {
  const step = plan.executionSteps.find((candidate) => candidate.stepId === stepId);
  if (!step) throw new Error(`Execution step not found: ${stepId}`);
  return step;
}
