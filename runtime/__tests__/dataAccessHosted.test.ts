import type { AddressInfo } from 'net';
import { DataAccessService } from '../access/service';
import { RuntimeAuditService } from '../audit/service';
import { DEFAULT_RUNTIME_CORE } from '../api/routes';
import { createRuntimeServer } from '../api/server';
import { RlusdPayoutAdapter } from '../payout/payoutAdapters/rlusd.adapter';
import { RlusdPayoutExecutorService } from '../payout/rlusdPayoutExecutor.service';
import { HostedRuntimeClient } from '../sdk/client';
import { DEFAULT_TRUST_ISSUERS, InMemoryTrustService } from '../trust/service';
import { closeServer, startServer } from './helpers/serverLifecycle';

function buildCore() {
  const trustService = new InMemoryTrustService(DEFAULT_TRUST_ISSUERS);
  const payoutExecutor = new RlusdPayoutExecutorService(trustService, new RlusdPayoutAdapter());
  const dataAccessService = new DataAccessService(trustService);
  const auditService = new RuntimeAuditService(trustService, payoutExecutor, dataAccessService);

  return {
    ...DEFAULT_RUNTIME_CORE,
    trustService,
    payoutExecutor,
    dataAccessService,
    auditService,
  };
}

describe('data access + audit endpoints', () => {
  it('allows data access with valid credential + consent and emits audit events', async () => {
    const server = createRuntimeServer({ core: buildCore() });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const client = new HostedRuntimeClient({ baseUrl: `http://127.0.0.1:${port}`, apiKey: 'aoc_free_dev_key' });

      await client.registerCredential({
        credential_ref: 'cred_allowed_1',
        subject_hash: '0xsubject_a',
        issuer_id: 'kyc-global-v1',
        credential_hash: '0xcredhash',
        metadata_hash: '0xmeta',
        kyc_level: 'enhanced',
        issued_at: '2026-01-01T00:00:00Z',
      });
      await client.grantIdentityConsent({
        consent_id: 'consent_allowed_1',
        subject_hash: '0xsubject_a',
        consumer_id: 'mm-alpha',
        issuer_id: 'kyc-global-v1',
        granted_at: '2026-01-02T00:00:00Z',
      });

      const decision = await client.requestDataAccess({
        subject_hash: '0xsubject_a',
        consumer_id: 'mm-alpha',
        dataset_id: 'dataset-001',
        purpose: 'risk_scoring',
        requested_scope: ['summary'],
        now: new Date('2026-01-03T00:00:00Z'),
      });

      expect(decision.allowed).toBe(true);
      expect(decision.reason_code).toBe('ACCESS_ALLOWED');
      expect(decision.access_token).toContain('aoc_access_');
      expect(decision.expires_at).toBeDefined();
      expect(decision.audit_ref).toBeDefined();

      const events = await client.listAuditEvents({
        subject_hash: '0xsubject_a',
        consumer_id: 'mm-alpha',
      });
      const accessRequested = events.find((event) => event.event_type === 'DATA_ACCESS_REQUESTED');
      const accessAllowed = events.find((event) => event.event_type === 'DATA_ACCESS_ALLOWED');

      expect(accessRequested).toBeDefined();
      expect(accessAllowed).toBeDefined();
    } finally {
      await closeServer(server);
    }
  });

  it('denies access when consent is missing', async () => {
    const server = createRuntimeServer({ core: buildCore() });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const client = new HostedRuntimeClient({ baseUrl: `http://127.0.0.1:${port}`, apiKey: 'aoc_free_dev_key' });

      await client.registerCredential({
        credential_ref: 'cred_noconsent_1',
        subject_hash: '0xsubject_b',
        issuer_id: 'kyc-global-v1',
        credential_hash: '0xcredhashb',
        metadata_hash: '0xmetab',
        kyc_level: 'basic',
        issued_at: '2026-02-01T00:00:00Z',
      });

      const decision = await client.requestDataAccess({
        subject_hash: '0xsubject_b',
        consumer_id: 'mm-beta',
        dataset_id: 'dataset-001',
        purpose: 'analytics',
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reason_code).toBe('ACCESS_DENIED_CONSENT_REQUIRED');

      const deniedEvents = await client.listAuditEvents({ event_type: 'DATA_ACCESS_DENIED', consumer_id: 'mm-beta' });
      expect(deniedEvents.length).toBeGreaterThan(0);
    } finally {
      await closeServer(server);
    }
  });

  it('denies access when trust/credential is missing and keeps market-maker separation', async () => {
    const server = createRuntimeServer({ core: buildCore() });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const client = new HostedRuntimeClient({ baseUrl: `http://127.0.0.1:${port}`, apiKey: 'aoc_free_dev_key' });

      await client.registerCredential({
        credential_ref: 'cred_mm_scope_1',
        subject_hash: '0xsubject_c',
        issuer_id: 'kyc-global-v1',
        credential_hash: '0xcredhashc',
        metadata_hash: '0xmetac',
        kyc_level: 'basic',
        issued_at: '2026-03-01T00:00:00Z',
      });
      await client.grantIdentityConsent({
        consent_id: 'consent_mm_scope_1',
        subject_hash: '0xsubject_c',
        consumer_id: 'mm-gamma',
        issuer_id: 'kyc-global-v1',
        granted_at: '2026-03-02T00:00:00Z',
      });

      const missingTrust = await client.requestDataAccess({
        subject_hash: '0xsubject_missing',
        consumer_id: 'mm-gamma',
        dataset_id: 'dataset-009',
        purpose: 'risk_scoring',
      });
      expect(missingTrust.allowed).toBe(false);
      expect(missingTrust.reason_code).toBe('ACCESS_DENIED_NOT_FOUND');

      const wrongMarketMaker = await client.requestDataAccess({
        subject_hash: '0xsubject_c',
        consumer_id: 'mm-delta',
        dataset_id: 'dataset-009',
        purpose: 'risk_scoring',
      });
      expect(wrongMarketMaker.allowed).toBe(false);
      expect(wrongMarketMaker.reason_code).toBe('ACCESS_DENIED_CONSENT_REQUIRED');

      const gammaEvents = await client.listAuditEvents({ consumer_id: 'mm-gamma', event_type: 'DATA_ACCESS_DENIED' });
      const deltaEvents = await client.listAuditEvents({ consumer_id: 'mm-delta', event_type: 'DATA_ACCESS_DENIED' });

      expect(gammaEvents.every((event) => !('consumer_id' in event) || event.consumer_id === 'mm-gamma')).toBe(true);
      expect(deltaEvents.every((event) => !('consumer_id' in event) || event.consumer_id === 'mm-delta')).toBe(true);
    } finally {
      await closeServer(server);
    }
  });

  it('supports direct GET filter queries for audit events', async () => {
    const server = createRuntimeServer({ core: buildCore() });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const base = `http://127.0.0.1:${port}`;
      const headers = { 'x-api-key': 'aoc_free_dev_key' };

      await fetch(`${base}/trust/credential/register`, {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json' },
        body: JSON.stringify({
          credential_ref: 'cred_query_1',
          subject_hash: '0xsubject_d',
          issuer_id: 'kyc-global-v1',
          credential_hash: '0xcredhashd',
          metadata_hash: '0xmetad',
          kyc_level: 'basic',
          issued_at: '2026-04-01T00:00:00Z',
        }),
      });

      await fetch(`${base}/data/access`, {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json' },
        body: JSON.stringify({
          subject_hash: '0xsubject_d',
          consumer_id: 'mm-epsilon',
          dataset_id: 'dataset-777',
          purpose: 'fraud_detection',
          now: '2026-04-03T00:00:00Z',
        }),
      });

      const response = await fetch(
        `${base}/audit/events?event_type=DATA_ACCESS_DENIED&subject_hash=0xsubject_d&from=2026-04-02T00:00:00Z`,
        { method: 'GET', headers }
      );

      const json = (await response.json()) as { success: boolean; data?: { events: Array<{ event_type: string }> } };
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data?.events.every((event) => event.event_type === 'DATA_ACCESS_DENIED')).toBe(true);
    } finally {
      await closeServer(server);
    }
  });
});
