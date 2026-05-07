import { ExecutionFabric } from '../execution-fabric';
import { GovernanceExecutionPlan } from '../types';

const basePlan = (): GovernanceExecutionPlan => ({
  executionPlanId: 'plan-1',
  governanceSessionId: 'session-1',
  sourceRuntimeId: 'runtime-a',
  targetRuntimeIds: ['runtime-b'],
  relationshipId: 'rel-1',
  capabilityRefs: ['cap-1'],
  requiredObligations: ['obl-1'],
  executionSteps: [],
  status: 'planned',
  createdAt: new Date().toISOString(),
});

describe('ExecutionFabric', () => {
  it('supports execution plan lifecycle', () => {
    const fabric = new ExecutionFabric();
    fabric.createExecutionPlan(basePlan());
    fabric.startExecutionPlan('plan-1');
    fabric.pauseExecutionPlan('plan-1');
    fabric.startExecutionPlan('plan-1');
    fabric.completeExecutionPlan('plan-1');

    expect(() => fabric.startExecutionPlan('plan-1')).toThrow(/cannot start/i);
  });

  it('enforces dependency-gated and blocked step listing', () => {
    const fabric = new ExecutionFabric();
    fabric.createExecutionPlan(basePlan());
    fabric.addExecutionStep('plan-1', { stepId: 's1', stepType: 'evaluate_policy', runtimeId: 'runtime-a', status: 'planned', dependsOn: [], obligationRefs: [], attestationRefs: [] });
    fabric.addExecutionStep('plan-1', { stepId: 's2', stepType: 'validate_identity', runtimeId: 'runtime-a', status: 'planned', dependsOn: ['s1'], obligationRefs: [], attestationRefs: [] });

    expect(fabric.listExecutableSteps('plan-1').map((s) => s.stepId)).toEqual(['s1']);
    expect(fabric.listBlockedSteps('plan-1').map((s) => s.stepId)).toEqual(['s2']);
  });

  it('fails plan on failed required step but not optional step', () => {
    const fabric = new ExecutionFabric();
    const plan = fabric.createExecutionPlan(basePlan());
    fabric.startExecutionPlan(plan.executionPlanId);

    fabric.addExecutionStep('plan-1', { stepId: 'required', stepType: 'execute_obligation', runtimeId: 'runtime-a', status: 'planned', dependsOn: [], obligationRefs: ['obl-1'], attestationRefs: [] });
    fabric.failExecutionStep('plan-1', 'required', 'boom');
    expect(() => fabric.startExecutionPlan('plan-1')).toThrow();

    const fabric2 = new ExecutionFabric();
    fabric2.createExecutionPlan({ ...basePlan(), executionPlanId: 'plan-2' });
    fabric2.startExecutionPlan('plan-2');
    fabric2.addExecutionStep('plan-2', { stepId: 'optional', stepType: 'emit_attestation', runtimeId: 'runtime-a', status: 'planned', dependsOn: [], obligationRefs: [], attestationRefs: [], optional: true });
    fabric2.failExecutionStep('plan-2', 'optional', 'non-critical');
    fabric2.completeExecutionPlan('plan-2');
  });

  it('supports lease validation/release/revocation', () => {
    const fabric = new ExecutionFabric();
    fabric.issueExecutionLease({ leaseId: 'lease-1', executionPlanId: 'plan-1', runtimeId: 'runtime-a', holderActorId: 'actor-1', issuedAt: new Date().toISOString(), expiresAt: '2999-01-01T00:00:00.000Z', status: 'active' });
    expect(fabric.validateExecutionLease('lease-1')).toBe(true);
    fabric.releaseExecutionLease('lease-1');
    expect(fabric.validateExecutionLease('lease-1')).toBe(false);
    fabric.revokeExecutionLease('lease-1');
    expect(fabric.validateExecutionLease('lease-1')).toBe(false);
  });

  it('supports continuation creation and resolution', () => {
    const fabric = new ExecutionFabric();
    fabric.createExecutionContinuation({ continuationId: 'cont-1', executionPlanId: 'plan-1', sourceRuntimeId: 'runtime-a', targetRuntimeId: 'runtime-b', continuationType: 'remote_governance', statePayloadRef: 'state://1', requiredAttestationRefs: [], createdAt: new Date().toISOString(), status: 'pending' });
    expect(fabric.listPendingContinuations('plan-1')).toHaveLength(1);
    fabric.resolveExecutionContinuation('cont-1');
    expect(fabric.listPendingContinuations('plan-1')).toHaveLength(0);
  });

  it('derives retry recommendations', () => {
    const fabric = new ExecutionFabric();
    fabric.recordExecutionFailure({ failureId: 'f1', executionPlanId: 'plan-1', stepId: 's1', runtimeId: 'runtime-a', reasonCode: 'remote_runtime_timeout', retryable: true, occurredAt: new Date().toISOString() });
    expect(fabric.isFailureRetryable('f1')).toBe(true);
    expect(fabric.deriveRetryRecommendation('f1')).toBe('retry_remote_runtime');
  });

  it('enforces attestation-required step validation', () => {
    const fabric = new ExecutionFabric();
    fabric.createExecutionPlan(basePlan());
    fabric.addExecutionStep('plan-1', { stepId: 'att-step', stepType: 'emit_attestation', runtimeId: 'runtime-a', status: 'planned', dependsOn: [], obligationRefs: [], attestationRefs: [] });
    fabric.requireStepAttestation('plan-1', 'att-step');
    expect(() => fabric.completeExecutionStep('plan-1', 'att-step')).toThrow(/attestation/i);
    fabric.attachExecutionAttestation('plan-1', 'att-step', 'att-1');
    fabric.completeExecutionStep('plan-1', 'att-step');
  });
});
