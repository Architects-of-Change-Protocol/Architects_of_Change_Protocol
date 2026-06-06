import type {
  AdapterLookupContext,
  AuditEventSink,
  ObservabilityEventSink,
  ProtocolEvent,
  ProtocolEventSink,
  SecurityEvent,
  SecurityEventSink,
} from '@aoc/protocol/adapters';
import type { AuditEventEnvelope } from '@aoc/protocol/contracts';

export type AssuranceObservation = ProtocolEvent | SecurityEvent | AuditEventEnvelope;

export class InMemoryAssuranceEventSink
  implements AuditEventSink, SecurityEventSink, ProtocolEventSink, ObservabilityEventSink
{
  private readonly observations: AssuranceObservation[] = [];

  recordAuditEvent(event: AuditEventEnvelope, context?: AdapterLookupContext): void {
    this.recordObservation(event, context);
  }

  recordSecurityEvent(event: SecurityEvent, context?: AdapterLookupContext): void {
    this.recordObservation(event, context);
  }

  emitProtocolEvent(event: ProtocolEvent, context?: AdapterLookupContext): void {
    this.recordObservation(event, context);
  }

  recordObservation(event: AssuranceObservation, _context?: AdapterLookupContext): void {
    this.observations.push({ ...event, payload: event.payload === undefined ? undefined : { ...event.payload } } as AssuranceObservation);
  }

  listObservations(): readonly AssuranceObservation[] {
    return this.observations.map((event) => ({
      ...event,
      payload: event.payload === undefined ? undefined : { ...event.payload },
    } as AssuranceObservation));
  }
}
