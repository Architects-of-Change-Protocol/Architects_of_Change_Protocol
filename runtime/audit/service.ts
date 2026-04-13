import type { DataAccessService } from '../access/service';
import type { DataAccessAuditEvent } from '../access/types';
import type { RlusdPayoutExecutorService } from '../payout/rlusdPayoutExecutor.service';
import type { PayoutAuditEvent } from '../payout/types';
import type { InMemoryTrustService } from '../trust/service';
import type { TrustAuditEvent } from '../trust/types';

export type AuditEvent = TrustAuditEvent | PayoutAuditEvent | DataAccessAuditEvent;

export type ListAuditEventsInput = {
  subject_hash?: string;
  consumer_id?: string;
  event_type?: string;
  from?: Date;
  to?: Date;
};

export class RuntimeAuditService {
  constructor(
    private readonly trustService: InMemoryTrustService,
    private readonly payoutExecutor: RlusdPayoutExecutorService,
    private readonly dataAccessService: DataAccessService
  ) {}

  listEvents(input: ListAuditEventsInput): AuditEvent[] {
    const all = [
      ...this.trustService.getAuditEvents(),
      ...this.payoutExecutor.getAuditEvents(),
      ...this.dataAccessService.getAuditEvents(),
    ];

    return all
      .filter((event) => this.matchesFilters(event, input))
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  }

  private matchesFilters(event: AuditEvent, input: ListAuditEventsInput): boolean {
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
