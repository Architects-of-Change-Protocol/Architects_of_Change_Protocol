import { createRuntimeServer } from '../api/server';
import { DEFAULT_RUNTIME_CORE } from '../api/routes';
import { DataAccessService } from '../access/service';
import { RuntimeAuditService } from '../audit/service';
import { InMemoryMonetizationService, InMemoryPricingRegistry, type PricingRule } from '../monetization';
import { RlusdPayoutAdapter } from '../payout/payoutAdapters/rlusd.adapter';
import { RlusdPayoutExecutorService } from '../payout/rlusdPayoutExecutor.service';
import { closeServer, startServer } from './helpers/serverLifecycle';
import { DEFAULT_TRUST_ISSUERS, InMemoryTrustService } from '../trust/service';
import { InMemoryUsageService } from '../usage';

const PRICING_RULES: PricingRule[] = [
  { resource: '/data/access', action: 'execute', unit_price: 0.05, currency: 'AOC' },
  { resource: '/payout/execute', action: 'execute', unit_price: 0.25, currency: 'AOC' },
];

describe('in-memory monetization service', () => {
  it('calculates price and total_price correctly with deterministic timestamps', () => {
    const service = new InMemoryMonetizationService(new InMemoryPricingRegistry(PRICING_RULES));

    const event = service.recordUsageAsBillable({
      consumer_id: 'mm-1',
      resource: '/data/access',
      action: 'execute',
      quantity: 3,
      occurred_at: '2026-03-01T12:00:00.000Z',
      audit_event_id: 'audit-1',
    });

    expect(event).toBeDefined();
    expect(event).toMatchObject({
      consumer_id: 'mm-1',
      resource: '/data/access',
      action: 'execute',
      unit_price: 0.05,
      quantity: 3,
      total_price: 0.15,
      currency: 'AOC',
      occurred_at: '2026-03-01T12:00:00.000Z',
      audit_event_id: 'audit-1',
    });
  });

  it('does not generate billable event when pricing rule is missing', () => {
    const service = new InMemoryMonetizationService(new InMemoryPricingRegistry(PRICING_RULES));

    const event = service.recordUsageAsBillable({
      consumer_id: 'mm-2',
      resource: '/trust/verify',
      action: 'execute',
      quantity: 1,
      occurred_at: '2026-03-01T12:00:00.000Z',
    });

    expect(event).toBeUndefined();
    expect(service.listBillableEvents()).toHaveLength(0);
  });

  it('aggregates totals per consumer across multiple usage events', () => {
    const service = new InMemoryMonetizationService(new InMemoryPricingRegistry(PRICING_RULES));

    service.recordUsageAsBillable({
      consumer_id: 'mm-3',
      resource: '/data/access',
      action: 'execute',
      quantity: 2,
      occurred_at: '2026-03-01T10:00:00.000Z',
    });
    service.recordUsageAsBillable({
      consumer_id: 'mm-3',
      resource: '/payout/execute',
      action: 'execute',
      quantity: 1,
      occurred_at: '2026-03-01T11:00:00.000Z',
    });
    service.recordUsageAsBillable({
      consumer_id: 'mm-other',
      resource: '/data/access',
      action: 'execute',
      quantity: 100,
      occurred_at: '2026-03-01T12:00:00.000Z',
    });

    const summary = service.getConsumerSummary('mm-3');
    expect(summary).toEqual({
      consumer_id: 'mm-3',
      currency: 'AOC',
      total_quantity: 3,
      total_price: 0.35,
      total_events: 2,
      by_resource_action: [
        {
          resource: '/data/access',
          action: 'execute',
          quantity: 2,
          total_price: 0.1,
          event_count: 1,
        },
        {
          resource: '/payout/execute',
          action: 'execute',
          quantity: 1,
          total_price: 0.25,
          event_count: 1,
        },
      ],
    });
  });

  it('prevents mutation leaks from listed events', () => {
    const service = new InMemoryMonetizationService(new InMemoryPricingRegistry(PRICING_RULES));
    service.recordUsageAsBillable({
      consumer_id: 'mm-4',
      resource: '/data/access',
      action: 'execute',
      quantity: 1,
      occurred_at: '2026-03-01T12:00:00.000Z',
    });

    const listed = service.listBillableEvents({ consumer_id: 'mm-4' });
    listed[0].total_price = 999;

    const listedAgain = service.listBillableEvents({ consumer_id: 'mm-4' });
    expect(listedAgain[0].total_price).toBe(0.05);
  });
});

describe('usage integration with monetization', () => {
  function buildCore() {
    const trustService = new InMemoryTrustService(DEFAULT_TRUST_ISSUERS);
    const payoutExecutor = new RlusdPayoutExecutorService(trustService, new RlusdPayoutAdapter());
    const dataAccessService = new DataAccessService(trustService);
    const usageService = new InMemoryUsageService();
    const auditService = new RuntimeAuditService(trustService, payoutExecutor, dataAccessService);
    const monetizationService = new InMemoryMonetizationService(new InMemoryPricingRegistry(PRICING_RULES));

    return {
      ...DEFAULT_RUNTIME_CORE,
      trustService,
      payoutExecutor,
      dataAccessService,
      usageService,
      auditService,
      monetizationService,
    };
  }

  it('creates billable events from metered endpoint executions without blocking', async () => {
    const core = buildCore();
    const server = createRuntimeServer({ core });
    await startServer(server);

    try {
      const { port } = server.address() as { port: number };
      const base = `http://127.0.0.1:${port}`;
      const headers = { 'x-api-key': 'aoc_free_dev_key', 'content-type': 'application/json' };

      const response = await fetch(`${base}/data/access`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject_hash: '0xsubject_monetized',
          consumer_id: 'mm-integrated',
          dataset_id: 'dataset-z',
          purpose: 'analytics',
        }),
      });

      expect(response.status).toBe(200);

      await new Promise((resolve) => setTimeout(resolve, 0));

      const events = core.monetizationService.listBillableEvents({ consumer_id: 'mm-integrated' });
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        consumer_id: 'mm-integrated',
        resource: '/data/access',
        action: 'execute',
        unit_price: 0.05,
        quantity: 1,
        total_price: 0.05,
        currency: 'AOC',
      });
    } finally {
      await closeServer(server);
    }
  });

  it('skips billable events when pricing rule does not exist', async () => {
    const core = buildCore();
    const unpricedCore = {
      ...core,
      monetizationService: new InMemoryMonetizationService(new InMemoryPricingRegistry([])),
    };

    const server = createRuntimeServer({ core: unpricedCore });
    await startServer(server);

    try {
      const { port } = server.address() as { port: number };
      const base = `http://127.0.0.1:${port}`;

      const response = await fetch(`${base}/data/access`, {
        method: 'POST',
        headers: { 'x-api-key': 'aoc_free_dev_key', 'content-type': 'application/json' },
        body: JSON.stringify({
          subject_hash: '0xsubject_unpriced',
          consumer_id: 'mm-unpriced',
          dataset_id: 'dataset-no-price',
          purpose: 'analytics',
        }),
      });

      expect(response.status).toBe(200);

      await new Promise((resolve) => setTimeout(resolve, 0));

      const events = unpricedCore.monetizationService.listBillableEvents({ consumer_id: 'mm-unpriced' });
      expect(events).toHaveLength(0);
    } finally {
      await closeServer(server);
    }
  });
});
