import { AuditRuntime as LegacyAuditRuntime } from '@aoc-runtime/audit-runtime';
import { TrustRegistryRuntime as LegacyTrustRegistryRuntime } from '@aoc-runtime/trust-registry-runtime';
import {
  AuditRuntime as EnterpriseAuditRuntime,
  InMemoryAuditService as EnterpriseAuditService,
} from '@aoc/enterprise/assurance/audit';
import {
  InMemoryTrustService as EnterpriseTrustService,
  TrustRegistryRuntime as EnterpriseTrustRegistryRuntime,
} from '@aoc/enterprise/assurance/trust';
import {
  DefaultTraceContextProvider as EnterpriseTraceContextProvider,
} from '@aoc/enterprise/assurance/observability';
import { InMemoryAuditService as LegacyAuditService } from '../../runtime/audit';
import { InMemoryTrustService as HostedTrustService } from '../../runtime/trust';
import { DefaultTraceContextProvider as LegacyTraceContextProvider } from '../../runtime/observability';

const events = [
  {
    event_id: 'audit:2',
    event_type: 'CAPABILITY_VALIDATED',
    occurred_at: '2026-06-02T00:00:00.000Z',
    metadata: { order: 2 },
  },
  {
    event_id: 'audit:1',
    event_type: 'CAPABILITY_VALIDATED',
    occurred_at: '2026-06-01T00:00:00.000Z',
    metadata: { order: 1 },
  },
] as const;

describe('PR-11 legacy runtime compatibility', () => {
  it('keeps legacy package exports bound to Enterprise implementations', () => {
    expect(LegacyAuditRuntime).toBe(EnterpriseAuditRuntime);
    expect(LegacyTrustRegistryRuntime).toBe(EnterpriseTrustRegistryRuntime);
  });

  it('keeps hosted trust and observability bridges bound to Enterprise implementations', () => {
    expect(HostedTrustService).toBe(EnterpriseTrustService);
    expect(LegacyTraceContextProvider).toBe(EnterpriseTraceContextProvider);
  });

  it('preserves audit behavior through the delegating compatibility facade', () => {
    const legacy = new LegacyAuditService();
    const enterprise = new EnterpriseAuditService();
    for (const event of events) {
      legacy.recordEvent(event as never);
      enterprise.recordEvent(event);
    }

    expect(legacy.listEvents({ event_type: 'CAPABILITY_VALIDATED' }))
      .toEqual(enterprise.listEvents({ event_type: 'CAPABILITY_VALIDATED' }));
    expect(legacy.listEvents()).toEqual([events[1], events[0]]);
  });
});
