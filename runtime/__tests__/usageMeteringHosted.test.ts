import type { AddressInfo } from 'net';
import { DataAccessService } from '../access/service';
import { DEFAULT_RUNTIME_CORE } from '../api/routes';
import { createRuntimeServer } from '../api/server';
import { RlusdPayoutAdapter } from '../payout/payoutAdapters/rlusd.adapter';
import { RlusdPayoutExecutorService } from '../payout/rlusdPayoutExecutor.service';
import { HostedRuntimeClient } from '../sdk/client';
import { DEFAULT_TRUST_ISSUERS, InMemoryTrustService } from '../trust/service';
import { InMemoryUsageService } from '../usage';
import { RuntimeAuditService } from '../audit/service';
import { InMemoryMonetizationService, InMemoryPricingRegistry, type PricingRule } from '../monetization';
import { closeServer, startServer } from './helpers/serverLifecycle';

const TEST_PRICING_RULES: PricingRule[] = [
  { resource: '/data/access', action: 'execute', unit_price: 0.05, currency: 'AOC' },
  { resource: '/payout/execute', action: 'execute', unit_price: 0.25, currency: 'AOC' },
  { resource: '/trust/verify', action: 'execute', unit_price: 0, currency: 'AOC' },
];

function buildCore() {
  const trustService = new InMemoryTrustService(DEFAULT_TRUST_ISSUERS);
  const payoutExecutor = new RlusdPayoutExecutorService(trustService, new RlusdPayoutAdapter());
  const dataAccessService = new DataAccessService(trustService);
  const usageService = new InMemoryUsageService();
  const auditService = new RuntimeAuditService(trustService, payoutExecutor, dataAccessService);
  const monetizationService = new InMemoryMonetizationService(new InMemoryPricingRegistry(TEST_PRICING_RULES));

  return {
    ...DEFAULT_RUNTIME_CORE,
    trustService,
    payoutExecutor,
    dataAccessService,
    auditService,
    usageService,
    monetizationService,
  };
}

describe('usage metering + fee estimation', () => {
  it('increments usage for allowed /data/access', async () => {
    const server = createRuntimeServer({ core: buildCore() });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const client = new HostedRuntimeClient({ baseUrl: `http://127.0.0.1:${port}`, apiKey: 'aoc_free_dev_key' });

      await client.registerCredential({
        credential_ref: 'cred_usage_allow',
        subject_hash: '0xusage_subject_allow',
        issuer_id: 'kyc-global-v1',
        credential_hash: '0xusage_cred_allow',
        metadata_hash: '0xusage_meta_allow',
        kyc_level: 'enhanced',
        issued_at: '2026-01-01T00:00:00Z',
      });
      await client.grantIdentityConsent({
        consent_id: 'consent_usage_allow',
        subject_hash: '0xusage_subject_allow',
        consumer_id: 'mm-usage-a',
        issuer_id: 'kyc-global-v1',
        granted_at: '2026-01-02T00:00:00Z',
      });

      const access = await client.requestDataAccess({
        subject_hash: '0xusage_subject_allow',
        consumer_id: 'mm-usage-a',
        dataset_id: 'dataset-usage-1',
        purpose: 'risk_scoring',
        now: new Date('2026-01-03T00:00:00Z'),
      });
      expect(access.allowed).toBe(true);

      const summary = await client.getUsageSummary({ consumer_id: 'mm-usage-a' });
      expect(summary.consumer_id).toBe('mm-usage-a');
      expect(summary.endpoints).toHaveLength(1);
      expect(summary.endpoints[0]).toMatchObject({
        endpoint: '/data/access',
        count: 1,
        allowed_count: 1,
        denied_count: 0,
        unit_price: 0.05,
        total_estimated_fee: 0.05,
      });
    } finally {
      await closeServer(server);
    }
  });

  it('increments usage for denied /data/access', async () => {
    const server = createRuntimeServer({ core: buildCore() });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const client = new HostedRuntimeClient({ baseUrl: `http://127.0.0.1:${port}`, apiKey: 'aoc_free_dev_key' });

      const access = await client.requestDataAccess({
        subject_hash: '0xusage_subject_deny',
        consumer_id: 'mm-usage-b',
        dataset_id: 'dataset-usage-2',
        purpose: 'analytics',
      });
      expect(access.allowed).toBe(false);

      const summary = await client.getUsageSummary({ consumer_id: 'mm-usage-b', endpoint: '/data/access' });
      expect(summary.endpoints).toHaveLength(1);
      expect(summary.endpoints[0]).toMatchObject({
        endpoint: '/data/access',
        count: 1,
        allowed_count: 0,
        denied_count: 1,
        total_estimated_fee: 0.05,
      });
    } finally {
      await closeServer(server);
    }
  });

  it('increments usage for /payout/execute and calculates fee', async () => {
    const server = createRuntimeServer({ core: buildCore() });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const client = new HostedRuntimeClient({ baseUrl: `http://127.0.0.1:${port}`, apiKey: 'aoc_free_dev_key' });

      await client.registerCredential({
        credential_ref: 'cred_usage_payout',
        subject_hash: '0xusage_subject_payout',
        issuer_id: 'kyc-global-v1',
        credential_hash: '0xusage_cred_payout',
        metadata_hash: '0xusage_meta_payout',
        kyc_level: 'basic',
        issued_at: '2026-02-01T00:00:00Z',
      });
      await client.grantIdentityConsent({
        consent_id: 'consent_usage_payout',
        subject_hash: '0xusage_subject_payout',
        consumer_id: 'mm-usage-c',
        issuer_id: 'kyc-global-v1',
        granted_at: '2026-02-02T00:00:00Z',
      });

      const payout = await client.executePayout({
        withdrawal_id: 'wd_usage_1',
        subject_hash: '0xusage_subject_payout',
        consumer_id: 'mm-usage-c',
        amount: '10.00',
        wallet_address: '0xabc123',
      });
      expect(payout.allowed).toBe(true);

      const summary = await client.getUsageSummary({ consumer_id: 'mm-usage-c', endpoint: '/payout/execute' });
      expect(summary.endpoints).toHaveLength(1);
      expect(summary.endpoints[0]).toMatchObject({
        endpoint: '/payout/execute',
        count: 1,
        unit_price: 0.25,
        total_estimated_fee: 0.25,
      });
    } finally {
      await closeServer(server);
    }
  });

  it('filters usage summary by endpoint and date', async () => {
    const server = createRuntimeServer({ core: buildCore() });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const base = `http://127.0.0.1:${port}`;
      const headers = { 'x-api-key': 'aoc_free_dev_key', 'content-type': 'application/json' };

      await fetch(`${base}/data/access`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject_hash: '0xraw_usage_filter_1',
          consumer_id: 'mm-usage-d',
          dataset_id: 'dataset-d1',
          purpose: 'analytics',
        }),
      });
      await fetch(`${base}/data/access`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject_hash: '0xraw_usage_filter_2',
          consumer_id: 'mm-usage-d',
          dataset_id: 'dataset-d2',
          purpose: 'analytics',
        }),
      });

      const response = await fetch(
        `${base}/usage/summary?consumer_id=mm-usage-d&endpoint=/data/access&from=2026-01-01T00:00:00Z&to=2026-12-31T23:59:59Z`,
        { method: 'GET', headers: { 'x-api-key': 'aoc_free_dev_key' } }
      );
      const json = (await response.json()) as {
        success: boolean;
        data?: { endpoints: Array<{ endpoint: string; count: number; total_estimated_fee: number }> };
      };

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data?.endpoints).toHaveLength(1);
      expect(json.data?.endpoints[0]).toMatchObject({
        endpoint: '/data/access',
        count: 2,
        total_estimated_fee: 0.1,
      });
    } finally {
      await closeServer(server);
    }
  });

  it('preserves multi-market-maker separation in usage summaries', async () => {
    const server = createRuntimeServer({ core: buildCore() });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const base = `http://127.0.0.1:${port}`;

      await fetch(`${base}/data/access`, {
        method: 'POST',
        headers: { 'x-api-key': 'aoc_free_dev_key', 'content-type': 'application/json' },
        body: JSON.stringify({
          subject_hash: '0xmm_sep_1',
          consumer_id: 'mm-usage-x',
          dataset_id: 'dataset-x',
          purpose: 'analytics',
        }),
      });
      await fetch(`${base}/data/access`, {
        method: 'POST',
        headers: { 'x-api-key': 'aoc_free_dev_key', 'content-type': 'application/json' },
        body: JSON.stringify({
          subject_hash: '0xmm_sep_2',
          consumer_id: 'mm-usage-y',
          dataset_id: 'dataset-y',
          purpose: 'analytics',
        }),
      });

      const xSummaryResponse = await fetch(`${base}/usage/summary?consumer_id=mm-usage-x`, {
        method: 'GET',
        headers: { 'x-api-key': 'aoc_free_dev_key' },
      });
      const ySummaryResponse = await fetch(`${base}/usage/summary?consumer_id=mm-usage-y`, {
        method: 'GET',
        headers: { 'x-api-key': 'aoc_free_dev_key' },
      });

      const xSummary = (await xSummaryResponse.json()) as { success: boolean; data?: { endpoints: Array<{ count: number }> } };
      const ySummary = (await ySummaryResponse.json()) as { success: boolean; data?: { endpoints: Array<{ count: number }> } };

      expect(xSummary.success).toBe(true);
      expect(ySummary.success).toBe(true);
      expect(xSummary.data?.endpoints[0]?.count).toBe(1);
      expect(ySummary.data?.endpoints[0]?.count).toBe(1);
    } finally {
      await closeServer(server);
    }
  });

  it('does not meter malformed requests that fail validation', async () => {
    const server = createRuntimeServer({ core: buildCore() });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const base = `http://127.0.0.1:${port}`;

      const malformed = await fetch(`${base}/data/access`, {
        method: 'POST',
        headers: { 'x-api-key': 'aoc_free_dev_key', 'content-type': 'application/json' },
        body: JSON.stringify({
          subject_hash: '0xmalformed',
          consumer_id: '',
          dataset_id: 'dataset-bad',
          purpose: 'analytics',
        }),
      });
      expect(malformed.status).toBe(400);

      const summaryResponse = await fetch(`${base}/usage/summary?consumer_id=mm-bad`, {
        method: 'GET',
        headers: { 'x-api-key': 'aoc_free_dev_key' },
      });
      const summary = (await summaryResponse.json()) as { success: boolean; data?: { endpoints: unknown[] } };

      expect(summary.success).toBe(true);
      expect(summary.data?.endpoints).toEqual([]);
    } finally {
      await closeServer(server);
    }
  });
});
