export const RELATIONSHIP_AUDIT_EVENT_TYPES = [
  'relationship_created',
  'relationship_activated',
  'relationship_suspended',
  'relationship_revoked',
  'relationship_expired',
  'relationship_disputed',
  'policy_attached',
  'policy_detached',
] as const;

export type RelationshipAuditEventType = (typeof RELATIONSHIP_AUDIT_EVENT_TYPES)[number];

export type RelationshipAuditEvent = {
  eventId: string;
  type: RelationshipAuditEventType;
  relationshipId: string;
  actorId?: string;
  occurredAt: string;
  policyTraceId?: string;
  metadata?: Record<string, unknown>;
};

function buildEvent(
  type: RelationshipAuditEventType,
  input: {
    relationshipId: string;
    actorId?: string;
    occurredAt?: string;
    policyTraceId?: string;
    metadata?: Record<string, unknown>;
  },
): RelationshipAuditEvent {
  const occurredAt = input.occurredAt ?? new Date().toISOString();

  return {
    eventId: `${type}:${input.relationshipId}:${occurredAt}`,
    type,
    relationshipId: input.relationshipId,
    actorId: input.actorId,
    occurredAt,
    policyTraceId: input.policyTraceId,
    metadata: input.metadata,
  };
}

export const emitRelationshipCreated = (input: {
  relationshipId: string;
  actorId?: string;
  occurredAt?: string;
  policyTraceId?: string;
  metadata?: Record<string, unknown>;
}): RelationshipAuditEvent => buildEvent('relationship_created', input);

export const emitRelationshipActivated = (input: {
  relationshipId: string;
  actorId?: string;
  occurredAt?: string;
  policyTraceId?: string;
  metadata?: Record<string, unknown>;
}): RelationshipAuditEvent => buildEvent('relationship_activated', input);

export const emitRelationshipSuspended = (input: {
  relationshipId: string;
  actorId?: string;
  occurredAt?: string;
  policyTraceId?: string;
  metadata?: Record<string, unknown>;
}): RelationshipAuditEvent => buildEvent('relationship_suspended', input);

export const emitRelationshipRevoked = (input: {
  relationshipId: string;
  actorId?: string;
  occurredAt?: string;
  policyTraceId?: string;
  metadata?: Record<string, unknown>;
}): RelationshipAuditEvent => buildEvent('relationship_revoked', input);

export const emitRelationshipExpired = (input: {
  relationshipId: string;
  actorId?: string;
  occurredAt?: string;
  policyTraceId?: string;
  metadata?: Record<string, unknown>;
}): RelationshipAuditEvent => buildEvent('relationship_expired', input);

export const emitRelationshipDisputed = (input: {
  relationshipId: string;
  actorId?: string;
  occurredAt?: string;
  policyTraceId?: string;
  metadata?: Record<string, unknown>;
}): RelationshipAuditEvent => buildEvent('relationship_disputed', input);

export const emitPolicyAttached = (input: {
  relationshipId: string;
  actorId?: string;
  occurredAt?: string;
  policyTraceId?: string;
  metadata?: Record<string, unknown>;
}): RelationshipAuditEvent => buildEvent('policy_attached', input);

export const emitPolicyDetached = (input: {
  relationshipId: string;
  actorId?: string;
  occurredAt?: string;
  policyTraceId?: string;
  metadata?: Record<string, unknown>;
}): RelationshipAuditEvent => buildEvent('policy_detached', input);
