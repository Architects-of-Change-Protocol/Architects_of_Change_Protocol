import type { AdapterLookupContext, AuditEventSink, ObservabilityEventSink, ProtocolEvent, ProtocolEventSink, SecurityEvent, SecurityEventSink } from '@aoc/protocol/adapters';
import type { AuditEventEnvelope } from '@aoc/protocol/contracts';
export type AssuranceObservation = ProtocolEvent | SecurityEvent | AuditEventEnvelope;
export declare class InMemoryAssuranceEventSink implements AuditEventSink, SecurityEventSink, ProtocolEventSink, ObservabilityEventSink {
    private readonly observations;
    recordAuditEvent(event: AuditEventEnvelope, context?: AdapterLookupContext): void;
    recordSecurityEvent(event: SecurityEvent, context?: AdapterLookupContext): void;
    emitProtocolEvent(event: ProtocolEvent, context?: AdapterLookupContext): void;
    recordObservation(event: AssuranceObservation, _context?: AdapterLookupContext): void;
    listObservations(): readonly AssuranceObservation[];
}
//# sourceMappingURL=protocol-event-sinks.d.ts.map