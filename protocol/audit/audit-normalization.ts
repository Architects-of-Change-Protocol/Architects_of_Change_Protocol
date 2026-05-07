import { createAuditEvent, inferEventTypeFromDecision } from './audit-event';
import type { AuditEvent, AuditEventInput } from './types';

export function normalizeAuditEvent(input: Record<string, unknown>): AuditEvent {
  const explicitType = typeof input.eventType === 'string' ? input.eventType : undefined;
  const reasons = asStringArray(input.reasons ?? input.identityReasons ?? input.reason);
  const obligations = asStringArray(input.obligations);
  const aiEscalation = obligations.includes('OBLIGATION_AI_ESCALATION_REQUIRED');
  const aiScopeBlocked = reasons.includes('DENY_AI_SCOPE_BLOCKED');
  const decision = inferDecision(input);
  const eventType = (explicitType as AuditEventInput['eventType'] | undefined) ?? inferEventTypeFromDecision(decision, aiEscalation, aiScopeBlocked);

  return createAuditEvent({
    eventId: asString(input.eventId ?? input.event_id),
    eventType,
    timestamp: asDateish(input.timestamp ?? input.occurred_at),
    actorId: asString(input.actorId ?? input.actor_id ?? input.subject_id),
    targetActorId: asString(input.targetActorId ?? input.requester_id),
    relationshipId: asString(input.relationshipId),
    policyTraceId: asString(input.policyTraceId ?? input.traceId),
    delegationGrantIds: asStringArray(input.delegationGrantIds ?? input.delegation_grant_ids),
    trustChainRef: asString(input.trustChainRef),
    resourceId: asString(input.resourceId ?? input.resource),
    action: asString(input.action),
    decision,
    reasons,
    obligations,
    metadata: (input.metadata as Record<string, unknown> | undefined) ?? {},
  });
}

function inferDecision(input: Record<string, unknown>) {
  if (typeof input.decision === 'string') return input.decision as any;
  if (typeof input.allow === 'boolean') return input.allow ? 'allow' : 'deny';
  if (typeof input.allowed === 'boolean') return input.allowed ? 'allow' : 'deny';
  return 'unknown' as const;
}
const asString = (value: unknown) => (typeof value === 'string' && value.length > 0 ? value : undefined);
const asDateish = (value: unknown) => (value instanceof Date || typeof value === 'string' ? value : undefined);
function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value === 'string') return [value];
  return [];
}
