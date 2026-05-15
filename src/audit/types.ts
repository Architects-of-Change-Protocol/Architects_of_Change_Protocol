export type AuditEventCategory =
  | "capability"
  | "delegation"
  | "policy"
  | "consent"
  | "agent"
  | "authorization"
  | "audit"
  | "identity";

export type AuditSeverity = "debug" | "info" | "notice" | "warning" | "error" | "critical";

export type AuditEventType =
  | "capability.requested"
  | "capability.granted"
  | "capability.revoked"
  | "delegation.created"
  | "delegation.revoked"
  | "policy.evaluated"
  | "consent.updated"
  | "agent.action"
  | "authorization.failed"
  | "audit.exported"
  | "scope.violation";

export type AuditActor = {
  principalId: string;
  principalType: "human" | "agent" | "service" | "system";
};

export type AuditSubject = {
  subjectType: string;
  subjectId: string;
};

export type AuditTimelineItem = {
  id?: string;
  createdAt: string;
  eventType: AuditEventType;
  category: AuditEventCategory;
  severity: AuditSeverity;
  workspaceId?: string | null;
  actor?: AuditActor | null;
  subject?: AuditSubject | null;
  details?: Record<string, unknown> | null;
  correlationId?: string | null;
  [key: string]: unknown;
};
