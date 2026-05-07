import { ExecutionAttestationRef } from './types';

export function buildExecutionAttestationRef(executionPlanId: string, stepId: string, attestationRef: string): ExecutionAttestationRef {
  return {
    executionPlanId,
    stepId,
    attestationRef,
    attachedAt: new Date().toISOString(),
  };
}
