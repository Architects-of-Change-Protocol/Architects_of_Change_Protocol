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

const DEFAULT_MAX_AUDIT_EVENTS = 10_000;

const cloneLegacyEvent = <T extends LegacyAuditEvent>(event: T): T => ({
  ...event,
  metadata: event.metadata === undefined ? undefined : { ...event.metadata },
});

export class InMemoryAuditService {
  private readonly events: LegacyAuditEvent[] = [];
  private readonly maxEvents: number;

  constructor(maxEvents: number = DEFAULT_MAX_AUDIT_EVENTS) {
    this.maxEvents = Number.isFinite(maxEvents) && maxEvents > 0 ? Math.floor(maxEvents) : DEFAULT_MAX_AUDIT_EVENTS;
  }

  recordEvent<T extends LegacyAuditEvent>(event: T): void {
    this.events.push(cloneLegacyEvent(event));
    while (this.events.length > this.maxEvents) this.events.shift();
  }

  listEvents<T extends LegacyAuditEvent = LegacyAuditEvent>(query: LegacyAuditEventQuery = {}): T[] {
    return this.events
      .filter((event) => this.matchesQuery(event, query))
      .slice()
      .sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at))
      .map((event) => cloneLegacyEvent(event) as T);
  }

  private matchesQuery(event: LegacyAuditEvent, query: LegacyAuditEventQuery): boolean {
    if (query.event_type !== undefined && event.event_type !== query.event_type) return false;
    if (query.subject_id !== undefined && event.subject_id !== query.subject_id) return false;
    if (query.requester_id !== undefined && event.requester_id !== query.requester_id) return false;
    if (query.consent_id !== undefined && event.consent_id !== query.consent_id) return false;
    if (query.capability_id !== undefined && event.capability_id !== query.capability_id) return false;
    const occurredAt = Date.parse(event.occurred_at);
    if (query.from !== undefined && occurredAt < query.from.getTime()) return false;
    if (query.to !== undefined && occurredAt > query.to.getTime()) return false;
    return true;
  }
}

export class InMemoryAuditEventSink implements AuditEventSink {
  private readonly events: AuditEventEnvelope[] = [];

  constructor(private readonly maxEvents = DEFAULT_MAX_AUDIT_EVENTS) {}

  recordAuditEvent(event: AuditEventEnvelope, _context?: AdapterLookupContext): void {
    this.events.push({ ...event, payload: { ...event.payload } });
    while (this.events.length > this.maxEvents) this.events.shift();
  }

  listAuditEvents(): readonly AuditEventEnvelope[] {
    return this.events.map((event) => ({ ...event, payload: { ...event.payload } }));
  }
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

export class RuntimeAuditService<TEvent extends RuntimeAuditEventLike> {
  constructor(private readonly sources: readonly AuditEventSource<TEvent>[]) {}

  listEvents(input: RuntimeAuditListInput): TEvent[] {
    return this.sources
      .flatMap((source) => [...source.getAuditEvents()])
      .filter((event) => this.matchesFilters(event, input))
      .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  }

  private matchesFilters(event: TEvent, input: RuntimeAuditListInput): boolean {
    if (input.subject_hash !== undefined && event.subject_hash !== input.subject_hash) return false;
    if (input.consumer_id !== undefined && event.consumer_id !== input.consumer_id) return false;
    if (input.event_type !== undefined && event.event_type !== input.event_type) return false;
    const eventAt = Date.parse(event.at);
    if (input.from !== undefined && eventAt < input.from.getTime()) return false;
    if (input.to !== undefined && eventAt > input.to.getTime()) return false;
    return true;
  }
}
