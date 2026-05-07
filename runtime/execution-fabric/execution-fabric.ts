import { buildExecutionAttestationRef } from './execution-attestation';
import { isPendingContinuation } from './execution-continuation';
import { deriveRecommendation, failureRetryable } from './execution-failure';
import { isLeaseActive } from './execution-lease';
import { canStartPlan, findStep, hasUnfinishedRequiredSteps, planIsWaiting } from './execution-plan';
import { dependenciesCompleted, listBlocked, listExecutable } from './execution-step';
import {
  ExecutionAttestationRef,
  ExecutionContinuation,
  ExecutionFabricAdapters,
  ExecutionFailure,
  ExecutionLease,
  GovernanceExecutionPlan,
  GovernanceExecutionStep,
  RetryRecommendation,
} from './types';

export class ExecutionFabric {
  private readonly plans = new Map<string, GovernanceExecutionPlan>();
  private readonly leases = new Map<string, ExecutionLease>();
  private readonly continuations = new Map<string, ExecutionContinuation>();
  private readonly failures = new Map<string, ExecutionFailure>();
  private readonly stepAttestations = new Map<string, ExecutionAttestationRef[]>();

  constructor(private readonly adapters: ExecutionFabricAdapters = {}) {}

  createExecutionPlan(plan: GovernanceExecutionPlan): GovernanceExecutionPlan {
    this.plans.set(plan.executionPlanId, { ...plan, status: 'planned', createdAt: plan.createdAt ?? new Date().toISOString() });
    return this.getPlan(plan.executionPlanId);
  }

  startExecutionPlan(executionPlanId: string): GovernanceExecutionPlan {
    const plan = this.getPlan(executionPlanId);
    if (!canStartPlan(plan.status)) throw new Error(`Plan cannot start from state ${plan.status}`);
    plan.status = 'running';
    return plan;
  }

  pauseExecutionPlan(executionPlanId: string): GovernanceExecutionPlan {
    const plan = this.getPlan(executionPlanId);
    if (plan.status !== 'running') throw new Error('Only running plans can be paused');
    plan.status = 'paused';
    return plan;
  }

  completeExecutionPlan(executionPlanId: string): GovernanceExecutionPlan {
    const plan = this.getPlan(executionPlanId);
    if (planIsWaiting(plan)) throw new Error('Plan waiting on remote runtime or human review cannot complete');
    if (hasUnfinishedRequiredSteps(plan)) throw new Error('Plan has unfinished required steps');
    plan.status = 'completed';
    plan.completedAt = new Date().toISOString();
    return plan;
  }

  cancelExecutionPlan(executionPlanId: string): GovernanceExecutionPlan {
    const plan = this.getPlan(executionPlanId);
    if (plan.status === 'completed') throw new Error('Completed plan cannot be cancelled');
    plan.status = 'cancelled';
    plan.completedAt = new Date().toISOString();
    return plan;
  }

  failExecutionPlan(executionPlanId: string): GovernanceExecutionPlan {
    const plan = this.getPlan(executionPlanId);
    if (plan.status === 'completed' || plan.status === 'cancelled') throw new Error('Terminal plan cannot be failed');
    plan.status = 'failed';
    return plan;
  }

  addExecutionStep(executionPlanId: string, step: GovernanceExecutionStep): GovernanceExecutionPlan {
    const plan = this.getPlan(executionPlanId);
    plan.executionSteps.push(step);
    return plan;
  }

  startExecutionStep(executionPlanId: string, stepId: string): GovernanceExecutionStep {
    const plan = this.getPlan(executionPlanId);
    const step = findStep(plan, stepId);
    if (!dependenciesCompleted(plan, step)) throw new Error('Step dependencies are not completed');
    step.status = 'running';
    step.startedAt = new Date().toISOString();
    this.adapters.governanceRuntime?.beginGovernanceStep(step);
    return step;
  }

  completeExecutionStep(executionPlanId: string, stepId: string): GovernanceExecutionStep {
    const plan = this.getPlan(executionPlanId);
    const step = findStep(plan, stepId);
    if (step.stepType === 'emit_attestation' && step.attestationRefs.length === 0) throw new Error('Attestation step requires attestation references');
    if (step.requiresAttestation && step.attestationRefs.length === 0) throw new Error('Step requires attestation references');
    step.status = 'completed';
    step.completedAt = new Date().toISOString();
    this.adapters.governanceRuntime?.completeGovernanceStep(step);
    return step;
  }

  failExecutionStep(executionPlanId: string, stepId: string, reason: string): GovernanceExecutionStep {
    const plan = this.getPlan(executionPlanId);
    const step = findStep(plan, stepId);
    step.status = 'failed';
    step.failureReason = reason;
    if (!step.optional) this.failExecutionPlan(executionPlanId);
    return step;
  }

  listExecutableSteps(executionPlanId: string): GovernanceExecutionStep[] {
    return listExecutable(this.getPlan(executionPlanId));
  }

  listBlockedSteps(executionPlanId: string): GovernanceExecutionStep[] {
    return listBlocked(this.getPlan(executionPlanId));
  }

  issueExecutionLease(lease: ExecutionLease): ExecutionLease {
    this.leases.set(lease.leaseId, { ...lease, status: 'active' });
    return this.getLease(lease.leaseId);
  }

  validateExecutionLease(leaseId: string): boolean {
    const lease = this.getLease(leaseId);
    return isLeaseActive(lease, new Date().toISOString());
  }

  releaseExecutionLease(leaseId: string): ExecutionLease {
    const lease = this.getLease(leaseId);
    lease.status = 'released';
    return lease;
  }

  revokeExecutionLease(leaseId: string): ExecutionLease {
    const lease = this.getLease(leaseId);
    lease.status = 'revoked';
    return lease;
  }

  expireExecutionLease(leaseId: string): ExecutionLease {
    const lease = this.getLease(leaseId);
    lease.status = 'expired';
    return lease;
  }

  createExecutionContinuation(continuation: ExecutionContinuation): ExecutionContinuation {
    this.continuations.set(continuation.continuationId, { ...continuation, status: 'pending' });
    this.adapters.distributedGovernance?.notifyContinuation(continuation);
    return this.getContinuation(continuation.continuationId);
  }

  resolveExecutionContinuation(continuationId: string): ExecutionContinuation {
    const continuation = this.getContinuation(continuationId);
    continuation.status = 'resolved';
    continuation.resolvedAt = new Date().toISOString();
    return continuation;
  }

  listPendingContinuations(executionPlanId: string): ExecutionContinuation[] {
    return Array.from(this.continuations.values()).filter((continuation) => continuation.executionPlanId === executionPlanId && isPendingContinuation(continuation));
  }

  recordExecutionFailure(failure: ExecutionFailure): ExecutionFailure {
    this.failures.set(failure.failureId, failure);
    return failure;
  }

  markFailureResolved(failureId: string): ExecutionFailure {
    const failure = this.getFailure(failureId);
    failure.resolvedAt = new Date().toISOString();
    return failure;
  }

  isFailureRetryable(failureId: string): boolean {
    return failureRetryable(this.getFailure(failureId));
  }

  deriveRetryRecommendation(failureId: string): RetryRecommendation {
    return deriveRecommendation(this.getFailure(failureId));
  }

  createExecutionAttestationRef(executionPlanId: string, stepId: string, attestationRef: string): ExecutionAttestationRef {
    return buildExecutionAttestationRef(executionPlanId, stepId, attestationRef);
  }

  attachExecutionAttestation(executionPlanId: string, stepId: string, attestationRef: string): ExecutionAttestationRef {
    if (this.adapters.attestationLayer && !this.adapters.attestationLayer.validateAttestationRef(attestationRef)) {
      throw new Error(`Invalid attestation reference: ${attestationRef}`);
    }
    const record = this.createExecutionAttestationRef(executionPlanId, stepId, attestationRef);
    const key = `${executionPlanId}:${stepId}`;
    const existing = this.stepAttestations.get(key) ?? [];
    existing.push(record);
    this.stepAttestations.set(key, existing);
    const step = findStep(this.getPlan(executionPlanId), stepId);
    step.attestationRefs.push(attestationRef);
    return record;
  }

  requireStepAttestation(executionPlanId: string, stepId: string): GovernanceExecutionStep {
    const step = findStep(this.getPlan(executionPlanId), stepId);
    step.requiresAttestation = true;
    return step;
  }

  private getPlan(executionPlanId: string): GovernanceExecutionPlan {
    const plan = this.plans.get(executionPlanId);
    if (!plan) throw new Error(`Execution plan not found: ${executionPlanId}`);
    return plan;
  }

  private getLease(leaseId: string): ExecutionLease {
    const lease = this.leases.get(leaseId);
    if (!lease) throw new Error(`Execution lease not found: ${leaseId}`);
    return lease;
  }

  private getContinuation(continuationId: string): ExecutionContinuation {
    const continuation = this.continuations.get(continuationId);
    if (!continuation) throw new Error(`Execution continuation not found: ${continuationId}`);
    return continuation;
  }

  private getFailure(failureId: string): ExecutionFailure {
    const failure = this.failures.get(failureId);
    if (!failure) throw new Error(`Execution failure not found: ${failureId}`);
    return failure;
  }
}
