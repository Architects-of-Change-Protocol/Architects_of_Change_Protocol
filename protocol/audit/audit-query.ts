import type { AuditEvent } from './types';

export function getEventsForActor(events: AuditEvent[], actorId: string): AuditEvent[] {
  return events.filter((event) => event.actorId === actorId || event.targetActorId === actorId);
}
export function getEventsForRelationship(events: AuditEvent[], relationshipId: string): AuditEvent[] {
  return events.filter((event) => event.relationshipId === relationshipId);
}
export function getEventsForTrace(events: AuditEvent[], traceId: string): AuditEvent[] {
  return events.filter((event) => event.policyTraceId === traceId);
}
export function getDeniedActions(events: AuditEvent[]): AuditEvent[] {
  return events.filter((event) => event.decision === 'deny');
}
export function getAIEscalationEvents(events: AuditEvent[]): AuditEvent[] {
  return events.filter((event) => event.eventType === 'ai_escalation_required' || event.obligations.includes('OBLIGATION_AI_ESCALATION_REQUIRED'));
}
