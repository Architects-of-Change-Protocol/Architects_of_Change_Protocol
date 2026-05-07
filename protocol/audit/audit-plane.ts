import { attachRelatedEvent, createCorrelation } from './audit-correlation';
import { normalizeAuditEvent } from './audit-normalization';
import { getAIEscalationEvents, getDeniedActions, getEventsForActor, getEventsForRelationship, getEventsForTrace } from './audit-query';
import type { AuditCorrelation, AuditEvent, AuditQueryFilter } from './types';

export class InMemoryAuditPlane {
  private readonly events: AuditEvent[] = [];
  private readonly correlations = new Map<string, AuditCorrelation>();

  emitAuditEvent(input: Record<string, unknown>): AuditEvent {
    const event = normalizeAuditEvent(input);
    this.events.push(event);
    return event;
  }

  emitCorrelatedAuditEvent(correlationId: string, input: Record<string, unknown>): AuditEvent {
    const event = this.emitAuditEvent(input);
    const correlation = this.correlations.get(correlationId);
    if (!correlation) throw new Error(`Unknown correlation: ${correlationId}`);
    this.correlations.set(correlationId, attachRelatedEvent(correlation, event));
    return event;
  }

  listAuditEvents(): AuditEvent[] { return [...this.events]; }

  queryAuditEvents(filter: AuditQueryFilter): AuditEvent[] {
    return this.events.filter((event) => {
      if (filter.actorId && event.actorId !== filter.actorId && event.targetActorId !== filter.actorId) return false;
      if (filter.relationshipId && event.relationshipId !== filter.relationshipId) return false;
      if (filter.eventType && event.eventType !== filter.eventType) return false;
      if (filter.decision && event.decision !== filter.decision) return false;
      if (filter.traceId && event.policyTraceId !== filter.traceId) return false;
      const ts = Date.parse(event.timestamp);
      if (filter.from && ts < filter.from.getTime()) return false;
      if (filter.to && ts > filter.to.getTime()) return false;
      return true;
    });
  }

  createCorrelationFromEvent(event: AuditEvent): AuditCorrelation {
    const correlation = createCorrelation(event);
    this.correlations.set(correlation.correlationId, correlation);
    return correlation;
  }

  resolveCorrelation(correlationId: string): AuditEvent[] {
    const correlation = this.correlations.get(correlationId);
    if (!correlation) return [];
    return this.events.filter((event) => correlation.relatedEventIds.includes(event.eventId));
  }

  getEventsForActor = (actorId: string) => getEventsForActor(this.events, actorId);
  getEventsForRelationship = (relationshipId: string) => getEventsForRelationship(this.events, relationshipId);
  getEventsForTrace = (traceId: string) => getEventsForTrace(this.events, traceId);
  getDeniedActions = () => getDeniedActions(this.events);
  getAIEscalationEvents = () => getAIEscalationEvents(this.events);
}
