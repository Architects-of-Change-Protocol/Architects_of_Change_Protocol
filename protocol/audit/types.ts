export const AUDIT_EVENT_TYPES = [
  'CONSENT_EVALUATED',
  'CAPABILITY_ISSUED',
  'CAPABILITY_VALIDATED',
  'CAPABILITY_AUTHORIZED',
  'CAPABILITY_DENIED',
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

export type AuditEvent = {
  event_id: string;
  event_type: AuditEventType;
  occurred_at: string;
  allowed?: boolean;
  reason_code?: string;
  subject_id?: string;
  requester_id?: string;
  resource?: string;
  action?: string;
  consent_id?: string | null;
  capability_id?: string | null;
  metadata?: Record<string, unknown>;
};

export type AuditEventQuery = {
  event_type?: AuditEventType;
  subject_id?: string;
  requester_id?: string;
  consent_id?: string;
  capability_id?: string;
  from?: Date;
  to?: Date;
};
