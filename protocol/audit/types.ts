export type AuditDecision = 'allow' | 'deny' | 'conditional' | 'unknown';

export type AuditEventType =
  | 'policy_decision'
  | 'relationship_created'
  | 'relationship_activated'
  | 'relationship_revoked'
  | 'delegation_created'
  | 'delegation_revoked'
  | 'identity_denied'
  | 'ai_escalation_required'
  | 'ai_scope_blocked'
  | 'intent_activated'
  | 'audience_access_evaluated';

export type AuditEvent = {
  eventId: string;
  eventType: AuditEventType;
  timestamp: string;
  actorId?: string;
  targetActorId?: string;
  relationshipId?: string;
  policyTraceId?: string;
  delegationGrantIds: string[];
  trustChainRef?: string;
  resourceId?: string;
  action?: string;
  decision?: AuditDecision;
  reasons: string[];
  obligations: string[];
  metadata: Record<string, unknown>;
};

export type AuditEventInput = Omit<AuditEvent, 'eventId' | 'timestamp' | 'delegationGrantIds' | 'reasons' | 'obligations' | 'metadata'> & {
  eventId?: string;
  timestamp?: Date | string;
  delegationGrantIds?: string[];
  reasons?: string[];
  obligations?: string[];
  metadata?: Record<string, unknown>;
};

export type AuditCorrelation = {
  correlationId: string;
  rootEventId: string;
  relatedEventIds: string[];
  traceIds: string[];
  actorRefs: string[];
};

export type AuditQueryFilter = {
  actorId?: string;
  relationshipId?: string;
  eventType?: AuditEventType;
  decision?: AuditDecision;
  from?: Date;
  to?: Date;
  traceId?: string;
};

// legacy runtime audit contract retained for compatibility
export const LEGACY_AUDIT_EVENT_TYPES = [
  'CONSENT_EVALUATED',
  'CAPABILITY_ISSUED',
  'CAPABILITY_VALIDATED',
  'CAPABILITY_AUTHORIZED',
  'CAPABILITY_DENIED',
] as const;
export type LegacyAuditEventType = (typeof LEGACY_AUDIT_EVENT_TYPES)[number];
export type LegacyAuditEvent = {
  event_id: string; event_type: LegacyAuditEventType; occurred_at: string; allowed?: boolean; reason_code?: string;
  subject_id?: string; requester_id?: string; resource?: string; action?: string; consent_id?: string | null; capability_id?: string | null;
  metadata?: Record<string, unknown>;
};
export type LegacyAuditEventQuery = {
  event_type?: LegacyAuditEventType; subject_id?: string; requester_id?: string; consent_id?: string; capability_id?: string; from?: Date; to?: Date;
};
