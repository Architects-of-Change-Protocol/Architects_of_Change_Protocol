import type { AddressInfo } from 'net';
import { createRuntimeServer } from '../api/server';
import { DEFAULT_RUNTIME_CORE } from '../api/routes';
import { DEFAULT_TRUST_ISSUERS, InMemoryTrustService } from '../trust/service';
import { RlusdPayoutAdapter } from '../payout/payoutAdapters/rlusd.adapter';
import { RlusdPayoutExecutorService } from '../payout/rlusdPayoutExecutor.service';

describe('trust layer hosted endpoints', () => {
  it('supports credential registration and verification', async () => {
    const trustService = new InMemoryTrustService(DEFAULT_TRUST_ISSUERS);
    const server = createRuntimeServer({
      core: {
        ...DEFAULT_RUNTIME_CORE,
        trustService,
        payoutExecutor: new RlusdPayoutExecutorService(trustService, new RlusdPayoutAdapter()),
      },
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));

    try {
      const { port } = server.address() as AddressInfo;
      const base = `http://127.0.0.1:${port}`;
      const headers = { 'content-type': 'application/json', 'x-api-key': 'aoc_free_dev_key' };

      const register = await fetch(`${base}/trust/credential/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          credential_ref: 'cred_1',
          subject_hash: '0xsubjecthash01',
          issuer_id: 'kyc-global-v1',
          credential_hash: '0xcredentialhash',
          metadata_hash: '0xmetadatahash',
          kyc_level: 'enhanced',
          wallet_address: '0xabc123',
          issued_at: '2026-01-01T00:00:00Z',
        }),
      });
      expect(register.status).toBe(200);

      const verify = await fetch(`${base}/trust/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject_hash: '0xsubjecthash01',
          now: '2026-01-02T00:00:00Z',
        }),
      });
      const verifyJson = (await verify.json()) as { success: boolean; data?: { valid: boolean; issuer?: string } };
      expect(verify.status).toBe(200);
      expect(verifyJson.success).toBe(true);
      expect(verifyJson.data?.valid).toBe(true);
      expect(verifyJson.data?.issuer).toBe('kyc-global-v1');
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });

  it('enforces consent and blocks payout without KYC', async () => {
    const trustService = new InMemoryTrustService(DEFAULT_TRUST_ISSUERS);
    const server = createRuntimeServer({
      core: {
        ...DEFAULT_RUNTIME_CORE,
        trustService,
        payoutExecutor: new RlusdPayoutExecutorService(trustService, new RlusdPayoutAdapter()),
      },
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));

    try {
      const { port } = server.address() as AddressInfo;
      const base = `http://127.0.0.1:${port}`;
      const headers = { 'content-type': 'application/json', 'x-api-key': 'aoc_free_dev_key' };

      const blocked = await fetch(`${base}/payout/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          withdrawal_id: 'wd_1',
          subject_hash: '0xsubjecthash01',
          consumer_id: 'hrkey-v1',
          amount: '100.00',
          wallet_address: '0xabc123',
        }),
      });
      const blockedJson = (await blocked.json()) as { data?: { allowed: boolean; reason_code: string } };
      expect(blocked.status).toBe(200);
      expect(blockedJson.data?.allowed).toBe(false);
      expect(blockedJson.data?.reason_code).toBe('PAYOUT_BLOCKED_NOT_FOUND');

      await fetch(`${base}/trust/credential/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          credential_ref: 'cred_1',
          subject_hash: '0xsubjecthash01',
          issuer_id: 'kyc-global-v1',
          credential_hash: '0xcredentialhash',
          metadata_hash: '0xmetadatahash',
          kyc_level: 'basic',
          issued_at: '2026-01-01T00:00:00Z',
        }),
      });

      const missingConsent = await fetch(`${base}/trust/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject_hash: '0xsubjecthash01',
          consumer_id: 'hrkey-v1',
          now: '2026-01-02T00:00:00Z',
        }),
      });
      const missingConsentJson = (await missingConsent.json()) as { data?: { valid: boolean; reason_code: string } };
      expect(missingConsentJson.data?.valid).toBe(false);
      expect(missingConsentJson.data?.reason_code).toBe('CONSENT_REQUIRED');

      await fetch(`${base}/trust/consent/grant`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          consent_id: 'consent_1',
          subject_hash: '0xsubjecthash01',
          consumer_id: 'hrkey-v1',
          issuer_id: 'kyc-global-v1',
          granted_at: '2026-01-02T00:00:00Z',
        }),
      });

      const allowed = await fetch(`${base}/payout/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          withdrawal_id: 'wd_2',
          subject_hash: '0xsubjecthash01',
          consumer_id: 'hrkey-v1',
          amount: '100.00',
          wallet_address: '0xabc123',
          identity_issuer: 'kyc-global-v1',
        }),
      });
      const allowedJson = (await allowed.json()) as { data?: { allowed: boolean; reason_code: string } };
      expect(allowedJson.data?.allowed).toBe(true);
      expect(allowedJson.data?.reason_code).toBe('PAYOUT_ALLOWED');
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });
});
