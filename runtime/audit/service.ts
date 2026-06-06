import {
  InMemoryAuditService as EnterpriseInMemoryAuditService,
  RuntimeAuditService as EnterpriseRuntimeAuditService,
  type AuditEventSource,
  type LegacyAuditEvent,
} from '../../enterprise/src/assurance/audit';
import type { AuditEventQuery, AuditEvent as ProtocolAuditEvent } from '../../protocol/audit';
import type { DataAccessService } from '../access/service';
import type { DataAccessAuditEvent } from '../access/types';
import type { RlusdPayoutExecutorService } from '../payout/rlusdPayoutExecutor.service';
import type { PayoutAuditEvent } from '../payout/types';
import type { InMemoryTrustService } from '../trust/service';
import type { TrustAuditEvent } from '../trust/types';

export type RuntimeAuditEvent = TrustAuditEvent | PayoutAuditEvent | DataAccessAuditEvent;

export type ListAuditEventsInput = {
  subject_hash?: string;
  consumer_id?: string;
  event_type?: string;
  from?: Date;
  to?: Date;
};

/** Compatibility facade preserving the historical Protocol audit signatures. */
export class InMemoryAuditService {
  private readonly implementation: EnterpriseInMemoryAuditService;

  constructor(maxEvents?: number) {
    this.implementation = new EnterpriseInMemoryAuditService(maxEvents);
  }

  recordEvent(event: ProtocolAuditEvent): void {
    this.implementation.recordEvent(event as unknown as LegacyAuditEvent);
  }

  listEvents(query: AuditEventQuery = {}): ProtocolAuditEvent[] {
    return this.implementation.listEvents(query) as unknown as ProtocolAuditEvent[];
  }
}

/** Compatibility facade preserving the historical three-source constructor. */
export class RuntimeAuditService {
  private readonly implementation: EnterpriseRuntimeAuditService<RuntimeAuditEvent>;

  constructor(
    trustService: InMemoryTrustService,
    payoutExecutor: RlusdPayoutExecutorService,
    dataAccessService: DataAccessService,
  ) {
    this.implementation = new EnterpriseRuntimeAuditService([
      trustService as AuditEventSource<RuntimeAuditEvent>,
      payoutExecutor as AuditEventSource<RuntimeAuditEvent>,
      dataAccessService as AuditEventSource<RuntimeAuditEvent>,
    ]);
  }

  listEvents(input: ListAuditEventsInput): RuntimeAuditEvent[] {
    return this.implementation.listEvents(input);
  }
}
