import { AutonomousGovernanceRuntime } from '../autonomous-governance-runtime';
import type { AutonomousGovernanceInput } from '../types';

describe('AutonomousGovernanceRuntime', () => {
  const runtime = new AutonomousGovernanceRuntime();

  const baseInput: AutonomousGovernanceInput = {
    nowIso: '2026-05-11T00:00:00.000Z',
    humanOverride: { active: false },
    actor: {
      machineActorId: 'machine_scheduler',
      actorLabel: 'Scheduling Agent',
      status: 'active',
      delegatedFromMachineActorId: 'machine_ops',
      machineAncestry: ['machine_ops', 'machine_scheduler'],
      capabilityEnvelope: {
        envelopeId: 'env_1',
        capabilityIds: ['cap.schedule.run'],
        namespaceAllowList: ['org.enterprise/scheduling'],
        operationalCeilings: { executionCeiling: 20, actionQuota: 50, escalationThreshold: 2 },
      },
    },
    authority: {
      authorityId: 'auth_1',
      machineActorId: 'machine_scheduler',
      issuedByActorId: 'human_admin',
      capabilityAllowList: ['cap.schedule.run'],
      namespaceAllowList: ['org.enterprise/scheduling'],
      trustPath: ['enterprise_runtime', 'machine_ops', 'machine_scheduler'],
      delegationChain: ['machine_ops'],
      issuedAt: '2026-05-10T00:00:00.000Z',
    },
    grant: {
      grantId: 'grant_1',
      authorityId: 'auth_1',
      grantedToMachineActorId: 'machine_scheduler',
      grantedByActorId: 'machine_ops',
      scope: { capabilityIds: ['cap.schedule.run'], namespacePaths: ['org.enterprise/scheduling'] },
      issuedAt: '2026-05-10T00:00:00.000Z',
    },
    constraintPolicy: {
      policyId: 'policy_1',
      executionCeiling: 20,
      actionQuota: 50,
      escalationThreshold: 2,
      restrictedDomains: ['org.enterprise/finance'],
      approvalGateRequired: true,
      humanRequiredBoundary: 'org.enterprise/payments',
    },
    request: {
      requestId: 'req_1',
      capabilityId: 'cap.schedule.run',
      namespacePath: 'org.enterprise/scheduling',
      usage: { executionCount: 2, actionCount: 4, escalationCount: 0, hasHumanApproval: true },
    },
  };

  it('permits bounded autonomous execution with explainability and obligations', () => {
    const result = runtime.validateAutonomousExecution(baseInput);
    expect(result.permitted).toBe(true);
    expect(result.deniedReasonCodes).toEqual([]);
    expect(result.obligations).toHaveLength(5);
    expect(result.lineage.grantId).toBe('grant_1');
  });

  it('denies execution when human override is active', () => {
    const denied = runtime.validateAutonomousExecution({
      ...baseInput,
      humanOverride: { active: true, overrideActorId: 'human_admin' },
      request: { ...baseInput.request, requestId: 'req_2' },
    });

    expect(denied.permitted).toBe(false);
    expect(denied.deniedReasonCodes).toContain('HUMAN_OVERRIDE_ACTIVE');
    expect(denied.escalations).toHaveLength(1);
  });
});
