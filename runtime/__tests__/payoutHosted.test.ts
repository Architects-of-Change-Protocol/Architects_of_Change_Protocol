import type { AddressInfo } from 'net';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createRuntimeServer } from '../api/server';
import { DEFAULT_RUNTIME_CORE } from '../api/routes';
import { RlusdPayoutAdapter } from '../payout/payoutAdapters/rlusd.adapter';
import { RlusdPayoutExecutorService } from '../payout/rlusdPayoutExecutor.service';
import { DEFAULT_TRUST_ISSUERS, InMemoryTrustService } from '../trust/service';

describe('payout engine hosted endpoints', () => {
  it('supports payout callback endpoint', async () => {
    const trustService = new InMemoryTrustService(DEFAULT_TRUST_ISSUERS);
    const payoutExecutor = new RlusdPayoutExecutorService(trustService, new RlusdPayoutAdapter());
    const server = createRuntimeServer({
      core: {
        ...DEFAULT_RUNTIME_CORE,
        trustService,
        payoutExecutor,
      },
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));

    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/payout/callback`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': 'aoc_free_dev_key',
        },
        body: JSON.stringify({
          payout_id: 'rlusd_wd_1',
          provider_status: 'completed',
          reason_code: 'SETTLED',
        }),
      });

      const json = (await response.json()) as { success: boolean; data?: { received: boolean; reason_code: string } };
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data?.received).toBe(true);
      expect(json.data?.reason_code).toBe('SETTLED');
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });

  it('returns INVALID_PAYOUT_REQUEST for malformed payout payload', async () => {
    const trustService = new InMemoryTrustService(DEFAULT_TRUST_ISSUERS);
    const payoutExecutor = new RlusdPayoutExecutorService(trustService, new RlusdPayoutAdapter());
    const server = createRuntimeServer({
      core: {
        ...DEFAULT_RUNTIME_CORE,
        trustService,
        payoutExecutor,
      },
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));

    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/payout/execute`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': 'aoc_free_dev_key',
        },
        body: JSON.stringify({
          withdrawal_id: '',
          subject_hash: '0xsubjecthash01',
          consumer_id: 'hrkey-v1',
          amount: 'not-a-number',
          wallet_address: '0xabc123',
        }),
      });

      const json = (await response.json()) as { success: boolean; error?: { code: string } };
      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error?.code).toBe('INVALID_PAYOUT_REQUEST');
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });

  it('preserves idempotent response for repeated payout execution', () => {
    const trustService = new InMemoryTrustService(DEFAULT_TRUST_ISSUERS);
    trustService.registerCredential({
      credential_ref: 'cred_1',
      subject_hash: '0xsubjecthash01',
      issuer_id: 'kyc-global-v1',
      credential_hash: '0xcredentialhash',
      metadata_hash: '0xmetadatahash',
      kyc_level: 'basic',
      issued_at: '2026-01-01T00:00:00Z',
    });
    trustService.grantConsent({
      consent_id: 'consent_1',
      subject_hash: '0xsubjecthash01',
      consumer_id: 'hrkey-v1',
      issuer_id: 'kyc-global-v1',
      granted_at: '2026-01-02T00:00:00Z',
    });

    const payoutExecutor = new RlusdPayoutExecutorService(trustService, new RlusdPayoutAdapter());
    const request = {
      withdrawal_id: 'wd_1',
      subject_hash: '0xsubjecthash01',
      consumer_id: 'hrkey-v1',
      amount: '100.00',
      wallet_address: '0xabc123',
      identity_issuer: 'kyc-global-v1',
    };

    const first = payoutExecutor.execute(request, new Date('2026-01-03T00:00:00Z'));
    const second = payoutExecutor.execute(request, new Date('2026-01-04T00:00:00Z'));

    expect(first).toEqual(second);
    expect(first.allowed).toBe(true);
    expect(first.reason_code).toBe('PAYOUT_ALLOWED');
  });

  it('routes /payout/execute through payoutExecutor (single execution path)', async () => {
    const server = createRuntimeServer({
      core: {
        ...DEFAULT_RUNTIME_CORE,
        payoutExecutor: {
          execute: () => ({ allowed: true, reason_code: 'PAYOUT_ALLOWED' }),
          callback: DEFAULT_RUNTIME_CORE.payoutExecutor.callback.bind(DEFAULT_RUNTIME_CORE.payoutExecutor),
        } as never,
      },
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));

    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/payout/execute`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': 'aoc_free_dev_key',
        },
        body: JSON.stringify({
          withdrawal_id: 'wd_route_1',
          subject_hash: '0xsubjecthash01',
          consumer_id: 'hrkey-v1',
          amount: '100.00',
          wallet_address: '0xabc123',
        }),
      });

      const json = (await response.json()) as { success: boolean; data?: { allowed: boolean; reason_code: string } };
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data?.allowed).toBe(true);
      expect(json.data?.reason_code).toBe('PAYOUT_ALLOWED');
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });

  it('keeps only one /payout/execute case and no direct enforcePayoutKyc route call', () => {
    const routesSource = readFileSync(join(__dirname, '..', 'api', 'routes.ts'), 'utf8');
    const executeCaseCount = routesSource.split("case '/payout/execute':").length - 1;

    expect(executeCaseCount).toBe(1);
    expect(routesSource.includes('enforcePayoutKyc')).toBe(false);
  });
});
