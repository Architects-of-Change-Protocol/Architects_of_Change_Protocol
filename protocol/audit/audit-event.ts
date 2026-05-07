import { randomUUID } from 'crypto';
import type { AuditDecision, AuditEvent, AuditEventInput, AuditEventType } from './types';

export function createAuditEvent(input: AuditEventInput): AuditEvent {
  return {
    eventId: input.eventId ?? randomUUID(),
    eventType: input.eventType,
    timestamp: normalizeTimestamp(input.timestamp),
    actorId: input.actorId,
    targetActorId: input.targetActorId,
    relationshipId: input.relationshipId,
    policyTraceId: input.policyTraceId,
    delegationGrantIds: input.delegationGrantIds ?? [],
    trustChainRef: input.trustChainRef,
    resourceId: input.resourceId,
    action: input.action,
    decision: input.decision,
    reasons: input.reasons ?? [],
    obligations: input.obligations ?? [],
    metadata: input.metadata ?? {},
  };
}

export function inferEventTypeFromDecision(decision: AuditDecision, aiEscalation = false, aiScopeBlocked = false): AuditEventType {
  if (aiScopeBlocked) return 'ai_scope_blocked';
  if (aiEscalation) return 'ai_escalation_required';
  return 'policy_decision';
}

function normalizeTimestamp(value?: Date | string): string {
  if (!value) return new Date().toISOString();
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}
