import type {
  AutonomousExecutionGrant,
  AutonomousGovernanceDecision,
  AutonomousGovernanceInput,
  BehaviorConstraintPolicy,
  EscalationPath,
  GovernanceObligation,
  MachineAuthorityProfile,
  RuntimeMachineActor,
} from './types';

const MACHINE_OBLIGATION_TYPES: GovernanceObligation['obligationType'][] = [
  'machine_audit',
  'machine_escalation',
  'machine_approval',
  'machine_reconciliation',
  'machine_expiration',
];

export class AutonomousGovernanceRuntime {
  validateAutonomousExecution(input: AutonomousGovernanceInput): AutonomousGovernanceDecision {
    const deniedReasonCodes: string[] = [];
    const obligations: GovernanceObligation[] = [];

    if (input.humanOverride.active) {
      deniedReasonCodes.push('HUMAN_OVERRIDE_ACTIVE');
    }

    if (isExpired(input.grant.expiresAt, input.nowIso)) {
      deniedReasonCodes.push('AUTONOMOUS_GRANT_EXPIRED');
    }

    if (input.actor.status !== 'active') {
      deniedReasonCodes.push('MACHINE_ACTOR_INACTIVE');
    }

    if (input.authority.revokedAt || input.grant.revokedAt) {
      deniedReasonCodes.push('MACHINE_AUTHORITY_REVOKED');
    }

    if (!input.authority.namespaceAllowList.includes(input.request.namespacePath)) {
      deniedReasonCodes.push('NAMESPACE_RESTRICTION_VIOLATION');
    }

    if (!input.authority.capabilityAllowList.includes(input.request.capabilityId)) {
      deniedReasonCodes.push('CAPABILITY_RESTRICTION_VIOLATION');
    }

    const behaviorViolations = validateBehavior(input.constraintPolicy, input.request.usage);
    deniedReasonCodes.push(...behaviorViolations);

    const violatesDelegation = !validateDelegationChain(input.actor, input.authority, input.grant);
    if (violatesDelegation) {
      deniedReasonCodes.push('DELEGATED_SCOPE_VIOLATION');
    }

    for (const obligationType of MACHINE_OBLIGATION_TYPES) {
      obligations.push({
        obligationId: `${obligationType}_${input.request.requestId}`,
        obligationType,
        status: 'pending',
        issuedAt: input.nowIso,
        metadata: {
          machineActorId: input.actor.machineActorId,
          requestId: input.request.requestId,
          delegatedFrom: input.actor.delegatedFromMachineActorId,
        },
      });
    }

    const lineage = {
      machineActorId: input.actor.machineActorId,
      authorityId: input.authority.authorityId,
      grantId: input.grant.grantId,
      delegatedFromMachineActorId: input.actor.delegatedFromMachineActorId,
      delegationChain: input.authority.delegationChain,
      trustPath: input.authority.trustPath,
      capabilityProvenance: input.request.capabilityId,
      constraintPolicyId: input.constraintPolicy.policyId,
    };

    const escalations: EscalationPath[] = deniedReasonCodes.length
      ? [
          {
            escalationId: `autonomous_escalation_${input.request.requestId}`,
            escalationType: 'human_review_required',
            triggeredBy: input.actor.machineActorId,
            targetActorId: input.authority.issuedByActorId,
            reasonCodes: deniedReasonCodes,
            status: 'active',
            createdAt: input.nowIso,
          },
        ]
      : [];

    return {
      permitted: deniedReasonCodes.length === 0,
      deniedReasonCodes,
      obligations,
      lineage,
      escalations,
      explainability: {
        decisionAt: input.nowIso,
        appliedConstraints: summarizeConstraintPolicy(input.constraintPolicy),
        authoritySource: input.authority.issuedByActorId,
      },
    };
  }

  revokeMachineAuthority(profile: MachineAuthorityProfile, revokedAt: string, revokedByActorId: string): MachineAuthorityProfile {
    return {
      ...profile,
      revokedAt,
      revocationReason: `revoked_by_${revokedByActorId}`,
    };
  }

  emergencyShutdown(actor: RuntimeMachineActor, at: string): RuntimeMachineActor {
    return {
      ...actor,
      status: 'frozen',
      frozenAt: at,
    };
  }
}

function validateDelegationChain(
  actor: RuntimeMachineActor,
  authority: MachineAuthorityProfile,
  grant: AutonomousExecutionGrant
): boolean {
  if (!actor.delegatedFromMachineActorId) return true;
  if (!authority.delegationChain.length) return false;
  return authority.delegationChain[authority.delegationChain.length - 1] === grant.grantedByActorId;
}

function isExpired(expiresAt: string | undefined, nowIso: string): boolean {
  if (!expiresAt) return false;
  return Date.parse(expiresAt) < Date.parse(nowIso);
}

function validateBehavior(policy: BehaviorConstraintPolicy, usage: AutonomousGovernanceInput['request']['usage']): string[] {
  const reasons: string[] = [];
  if (usage.executionCount > policy.executionCeiling) reasons.push('EXECUTION_CEILING_EXCEEDED');
  if (usage.actionCount > policy.actionQuota) reasons.push('ACTION_QUOTA_EXCEEDED');
  if (usage.escalationCount > policy.escalationThreshold) reasons.push('ESCALATION_THRESHOLD_EXCEEDED');
  if (policy.approvalGateRequired && !usage.hasHumanApproval) reasons.push('APPROVAL_GATE_REQUIRED');
  return reasons;
}

function summarizeConstraintPolicy(policy: BehaviorConstraintPolicy): Record<string, unknown> {
  return {
    policyId: policy.policyId,
    executionCeiling: policy.executionCeiling,
    actionQuota: policy.actionQuota,
    escalationThreshold: policy.escalationThreshold,
    restrictedDomains: policy.restrictedDomains,
    approvalGateRequired: policy.approvalGateRequired,
    humanRequiredBoundary: policy.humanRequiredBoundary,
  };
}
