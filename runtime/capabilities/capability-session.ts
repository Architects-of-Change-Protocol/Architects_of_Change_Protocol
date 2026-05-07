import { emitCapabilityAuditEvent } from './capability-audit';
import { isCapabilityCurrentlyValid } from './capability-lifecycle';
import type { CapabilityAuditHook, CapabilitySession, CapabilityUseDecision, PdpCapabilityAdapter, RuntimeCapability } from './types';

export function createCapabilitySession(input: {
  sessionId: string;
  capabilityId: string;
  actorId: string;
  action: string;
  resourceId: string;
  startedAt?: string;
  purpose?: string;
}): CapabilitySession {
  return { ...input, startedAt: input.startedAt ?? new Date().toISOString(), auditRefs: [] };
}

export function evaluateCapabilityUse(input: {
  capability: RuntimeCapability;
  session: CapabilitySession;
  pdpAdapter?: PdpCapabilityAdapter;
  auditHook?: CapabilityAuditHook;
}): { session: CapabilitySession; decision: CapabilityUseDecision } {
  const { capability, session, pdpAdapter, auditHook } = input;

  const deny = (reasonCodes: string[], requiresHumanReview = false): { session: CapabilitySession; decision: CapabilityUseDecision } => {
    const decision: CapabilityUseDecision = {
      decision: 'deny',
      reasonCodes,
      capabilityStatus: capability.status,
      policyTraceId: capability.policyTraceId,
      requiresHumanReview,
    };
    const finalized = { ...session, completedAt: new Date().toISOString(), decision: 'deny' as const, requiresHumanReview };
    emitCapabilityAuditEvent(auditHook, 'capability_denied', { capabilityId: capability.capabilityId, sessionId: session.sessionId, reasonCodes });
    return { session: finalized, decision };
  };

  if (!isCapabilityCurrentlyValid(capability)) return deny(['CAPABILITY_NOT_VALID']);
  if (session.actorId !== capability.granteeActorId) return deny(['ACTOR_NOT_GRANTEE']);
  if (!capability.allowedActions.includes(session.action)) return deny(['ACTION_NOT_ALLOWED']);
  if (!capability.scope.some((scope) => session.resourceId.startsWith(scope))) return deny(['RESOURCE_OUT_OF_SCOPE']);

  if (capability.aiBoundary?.blockedScopes?.some((scope) => session.resourceId.startsWith(scope))) return deny(['AI_BLOCKED_SCOPE']);
  if (capability.aiBoundary?.allowedPurposes && session.purpose && !capability.aiBoundary.allowedPurposes.includes(session.purpose)) {
    return deny(['AI_PURPOSE_NOT_ALLOWED']);
  }
  if (capability.aiBoundary?.maxAutonomousUses !== undefined) {
    const used = capability.aiBoundary.autonomousUseCount ?? 0;
    if (used >= capability.aiBoundary.maxAutonomousUses) return deny(['AI_MAX_AUTONOMOUS_USES_EXCEEDED'], true);
  }
  if (capability.aiBoundary?.requiresHumanReview) return deny(['AI_HUMAN_REVIEW_REQUIRED'], true);

  if (pdpAdapter) {
    const pdp = pdpAdapter({ capability, actorId: session.actorId, action: session.action, resourceId: session.resourceId, purpose: session.purpose });
    if (!pdp.allow) return deny(pdp.reasonCodes ?? ['PDP_DENIED']);
  }

  const decision: CapabilityUseDecision = {
    decision: 'allow',
    reasonCodes: ['CAPABILITY_USE_ALLOWED'],
    capabilityStatus: capability.status,
    policyTraceId: capability.policyTraceId,
  };
  const finalized = { ...session, completedAt: new Date().toISOString(), decision: 'allow' as const };
  emitCapabilityAuditEvent(auditHook, 'capability_use_evaluated', {
    capabilityId: capability.capabilityId,
    sessionId: session.sessionId,
    decision: 'allow',
  });
  return { session: finalized, decision };
}
