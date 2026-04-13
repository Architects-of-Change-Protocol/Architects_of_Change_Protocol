import type { AuditEventQuery, AuditEvent as ProtocolAuditEvent } from '../../protocol/audit';
import type { DataAccessService } from '../access/service';
import type { DataAccessAuditEvent } from '../access/types';
import type { RlusdPayoutExecutorService } from '../payout/rlusdPayoutExecutor.service';
import type { PayoutAuditEvent } from '../payout/types';
import type { InMemoryTrustService } from '../trust/service';
import type { TrustAuditEvent } from '../trust/types';

const DEFAULT_MAX_AUDIT_EVENTS = 10_000;

export type RuntimeAuditEvent = TrustAuditEvent | PayoutAuditEvent | DataAccessAuditEvent;

export type ListAuditEventsInput = {
  subject_hash?: string;
  consumer_id?: string;
  event_type?: string;
  from?: Date;
  to?: Date;
};

export class InMemoryAuditService {
  private readonly events: ProtocolAuditEvent[] = [];
  private readonly maxEvents: number;

  constructor(maxEvents: number = DEFAULT_MAX_AUDIT_EVENTS) {
    this.maxEvents = Number.isFinite(maxEvents) && maxEvents > 0 ? Math.floor(maxEvents) : DEFAULT_MAX_AUDIT_EVENTS;
  }

  recordEvent(event: ProtocolAuditEvent): void {
    this.events.push({
      ...event,
      metadata: event.metadata === undefined ? undefined : { ...event.metadata },
    });

    while (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  listEvents(query: AuditEventQuery = {}): ProtocolAuditEvent[] {
    return this.events
      .filter((event) => this.matchesQuery(event, query))
      .slice()
      .sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at))
      .map((event) => ({
        ...event,
        metadata: event.metadata === undefined ? undefined : { ...event.metadata },
      }));
  }

  private matchesQuery(event: ProtocolAuditEvent, query: AuditEventQuery): boolean {
    if (query.event_type !== undefined && event.event_type !== query.event_type) {
      return false;
    }

    if (query.subject_id !== undefined && event.subject_id !== query.subject_id) {
      return false;
    }

    if (query.requester_id !== undefined && event.requester_id !== query.requester_id) {
      return false;
    }

    if (query.consent_id !== undefined && event.consent_id !== query.consent_id) {
      return false;
    }

    if (query.capability_id !== undefined && event.capability_id !== query.capability_id) {
      return false;
    }

    const occurredAt = Date.parse(event.occurred_at);
    if (query.from !== undefined && occurredAt < query.from.getTime()) {
      return false;
    }

    if (query.to !== undefined && occurredAt > query.to.getTime()) {
      return false;
    }

    return true;
  }
}

export class RuntimeAuditService {
  constructor(
    private readonly trustService: InMemoryTrustService,
    private readonly payoutExecutor: RlusdPayoutExecutorService,
    private readonly dataAccessService: DataAccessService
  ) {}

  listEvents(input: ListAuditEventsInput): RuntimeAuditEvent[] {
    const all: RuntimeAuditEvent[] = [
      ...this.trustService.getAuditEvents(),
      ...this.payoutExecutor.getAuditEvents(),
      ...this.dataAccessService.getAuditEvents(),
    ];

    return all
      .filter((event) => this.matchesFilters(event, input))
      .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  }

  private matchesFilters(event: RuntimeAuditEvent, input: ListAuditEventsInput): boolean {
    if (input.subject_hash !== undefined) {
      if (!('subject_hash' in event) || event.subject_hash !== input.subject_hash) {
        return false;
      }
    }

    if (input.consumer_id !== undefined) {
      if (!('consumer_id' in event) || event.consumer_id !== input.consumer_id) {
        return false;
      }
    }

    if (input.event_type !== undefined && event.event_type !== input.event_type) {
      return false;
    }

    const eventAt = Date.parse(event.at);
    if (input.from !== undefined && eventAt < input.from.getTime()) {
      return false;
    }
    if (input.to !== undefined && eventAt > input.to.getTime()) {
      return false;
    }

    return true;
  }
}
