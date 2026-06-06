import type { AdapterLookupContext, AuditEventSink } from '@aoc/protocol/adapters';
import type { AuditEventEnvelope } from '@aoc/protocol/contracts';
export interface LegacyAuditEvent {
    readonly event_id: string;
    readonly event_type: string;
    readonly occurred_at: string;
    readonly subject_id?: string;
    readonly requester_id?: string;
    readonly consent_id?: string;
    readonly capability_id?: string;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface LegacyAuditEventQuery {
    readonly event_type?: string;
    readonly subject_id?: string;
    readonly requester_id?: string;
    readonly consent_id?: string;
    readonly capability_id?: string;
    readonly from?: Date;
    readonly to?: Date;
}
export declare class InMemoryAuditService {
    private readonly events;
    private readonly maxEvents;
    constructor(maxEvents?: number);
    recordEvent<T extends LegacyAuditEvent>(event: T): void;
    listEvents<T extends LegacyAuditEvent = LegacyAuditEvent>(query?: LegacyAuditEventQuery): T[];
    private matchesQuery;
}
export declare class InMemoryAuditEventSink implements AuditEventSink {
    private readonly maxEvents;
    private readonly events;
    constructor(maxEvents?: number);
    recordAuditEvent(event: AuditEventEnvelope, _context?: AdapterLookupContext): void;
    listAuditEvents(): readonly AuditEventEnvelope[];
}
export interface RuntimeAuditEventLike {
    readonly event_type: string;
    readonly at: string;
    readonly subject_hash?: string;
    readonly consumer_id?: string;
}
export interface AuditEventSource<TEvent extends RuntimeAuditEventLike> {
    getAuditEvents(): readonly TEvent[];
}
export interface RuntimeAuditListInput {
    readonly subject_hash?: string;
    readonly consumer_id?: string;
    readonly event_type?: string;
    readonly from?: Date;
    readonly to?: Date;
}
export declare class RuntimeAuditService<TEvent extends RuntimeAuditEventLike> {
    private readonly sources;
    constructor(sources: readonly AuditEventSource<TEvent>[]);
    listEvents(input: RuntimeAuditListInput): TEvent[];
    private matchesFilters;
}
//# sourceMappingURL=in-memory-audit.d.ts.map