import { randomUUID } from 'crypto';
import type { AuditCorrelation, AuditEvent } from './types';

export function createCorrelation(rootEvent: AuditEvent): AuditCorrelation {
  return {
    correlationId: randomUUID(),
    rootEventId: rootEvent.eventId,
    relatedEventIds: [rootEvent.eventId],
    traceIds: rootEvent.policyTraceId ? [rootEvent.policyTraceId] : [],
    actorRefs: [rootEvent.actorId, rootEvent.targetActorId].filter((v): v is string => Boolean(v)),
  };
}

export function attachRelatedEvent(correlation: AuditCorrelation, event: AuditEvent): AuditCorrelation {
  return {
    ...correlation,
    relatedEventIds: Array.from(new Set([...correlation.relatedEventIds, event.eventId])),
    traceIds: event.policyTraceId ? Array.from(new Set([...correlation.traceIds, event.policyTraceId])) : correlation.traceIds,
    actorRefs: Array.from(new Set([...correlation.actorRefs, event.actorId, event.targetActorId].filter((v): v is string => Boolean(v)))),
  };
}

export function resolveCorrelation(correlation: AuditCorrelation, events: AuditEvent[]): AuditEvent[] {
  const ids = new Set(correlation.relatedEventIds);
  return events.filter((event) => ids.has(event.eventId)).sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}
