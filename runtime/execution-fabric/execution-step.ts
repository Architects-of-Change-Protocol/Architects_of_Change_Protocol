import { GovernanceExecutionPlan, GovernanceExecutionStep } from './types';

export function dependenciesCompleted(plan: GovernanceExecutionPlan, step: GovernanceExecutionStep): boolean {
  return step.dependsOn.every((stepId) => plan.executionSteps.some((candidate) => candidate.stepId === stepId && candidate.status === 'completed'));
}

export function listExecutable(plan: GovernanceExecutionPlan): GovernanceExecutionStep[] {
  return plan.executionSteps.filter((step) => step.status === 'planned' && dependenciesCompleted(plan, step));
}

export function listBlocked(plan: GovernanceExecutionPlan): GovernanceExecutionStep[] {
  return plan.executionSteps.filter((step) => step.status === 'planned' && !dependenciesCompleted(plan, step));
}
