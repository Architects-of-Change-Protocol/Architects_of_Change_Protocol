import { emitCapabilityAuditEvent } from './capability-audit';
import { issueRuntimeCapability } from './capability-lifecycle';
import type { CapabilityAuditHook, GovernanceIssuanceInput, RuntimeCapability } from './types';

export function issueCapabilityFromGovernanceSession(input: GovernanceIssuanceInput, auditHook?: CapabilityAuditHook): RuntimeCapability {
  const { governanceSession } = input;
  if (!['approved', 'completed'].includes(governanceSession.runtimeState)) {
    throw new Error('Governance session must be approved or completed before capability issuance.');
  }
  if (governanceSession.obligations.some((entry) => entry.status === 'pending')) {
    throw new Error('Cannot issue capability while obligations remain pending.');
  }
  if (governanceSession.obligations.some((entry) => entry.status === 'failed')) {
    throw new Error('Cannot issue capability when obligations have failed.');
  }
  if (!governanceSession.policyTraceId) throw new Error('policyTraceId is required for capability issuance.');
  if (!governanceSession.relationshipId) throw new Error('relationshipId is required for capability issuance.');

  const capability = issueRuntimeCapability({
    capabilityId: input.capabilityId,
    subjectActorId: input.subjectActorId,
    granteeActorId: input.granteeActorId,
    relationshipId: governanceSession.relationshipId,
    policyTraceId: governanceSession.policyTraceId,
    governanceSessionId: governanceSession.sessionId,
    scope: input.scope,
    allowedActions: input.allowedActions,
    notBefore: input.notBefore,
    expiresAt: input.expiresAt,
    aiBoundary: input.aiBoundary,
  });

  emitCapabilityAuditEvent(auditHook, 'capability_issued', {
    capabilityId: capability.capabilityId,
    relationshipId: capability.relationshipId,
    governanceSessionId: capability.governanceSessionId,
    policyTraceId: capability.policyTraceId,
  });

  return capability;
}
