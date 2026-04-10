import type { AddressInfo } from 'net';
import { buildConsentObject } from '../../consent';
import { createRuntimeServer } from '../api/server';
import { InMemoryApiKeyStore } from '../auth/apiKeys';
import { InMemoryRateLimiter } from '../limits/rateLimiter';
import { HostedRuntimeClient } from '../sdk/client';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const REF_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function buildMintInput() {
  const consent = buildConsentObject(SUBJECT, GRANTEE, 'grant', [{ type: 'content', ref: REF_A }], ['read'], {
    now: new Date('2026-01-01T00:00:00Z'),
    expires_at: '2026-12-31T00:00:00Z',
    marketMakerId: 'mm-01',
  });

  return {
    consent,
    requested_scope: [{ type: 'content' as const, ref: REF_A }],
    requested_permissions: ['read'],
    issued_at: '2026-02-01T00:00:00Z',
    expires_at: '2026-03-01T00:00:00Z',
    marketMakerId: 'mm-01',
  };
}

describe('hosted runtime API + SDK', () => {
  it('endpoint success: /execution/authorize', async () => {
    const server = createRuntimeServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));

    try {
      const { port } = server.address() as AddressInfo;
      const baseUrl = `http://127.0.0.1:${port}`;
      const client = new HostedRuntimeClient({ baseUrl, apiKey: 'aoc_free_dev_key' });

      const capability = await client.mintCapability(buildMintInput());
      const result = await client.authorizeExecution({
        capability,
        requested_scope: [{ type: 'content' as const, ref: REF_A }],
        requested_permissions: ['read'],
        subject: SUBJECT,
        grantee: GRANTEE,
        marketMakerId: 'mm-01',
        execution_target: { adapter: 'hrkey', operation: 'read_content' },
        now: new Date('2026-02-15T00:00:00Z'),
      });

      expect(result.authorized).toBe(true);
      expect(result.reason_code).toBe('EXECUTION_AUTHORIZED');
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });

  it('invalid API key -> reject fail-closed', async () => {
    const server = createRuntimeServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));

    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/enforcement/evaluate`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': 'bad_key',
        },
        body: JSON.stringify({}),
      });

      const json = (await response.json()) as { success: boolean; error?: { code: string } };
      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error?.code).toBe('AUTH_INVALID_API_KEY');
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });

  it('rate limit exceeded -> reject', async () => {
    const apiKeys = new InMemoryApiKeyStore([{ apiKey: 'tiny-free', owner: 'test', tier: 'free' }]);
    const server = createRuntimeServer({
      apiKeyStore: apiKeys,
      rateLimiter: new InMemoryRateLimiter({ free: 1 }),
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));

    try {
      const { port } = server.address() as AddressInfo;
      const url = `http://127.0.0.1:${port}/enforcement/evaluate`;
      const payload = {
        capability: {},
        requested_scope: [{ type: 'content' as const, ref: REF_A }],
        requested_permissions: ['read'],
      };

      const first = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': 'tiny-free' },
        body: JSON.stringify(payload),
      });
      expect(first.status).toBe(200);

      const second = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': 'tiny-free' },
        body: JSON.stringify(payload),
      });
      const json = (await second.json()) as { success: boolean; error?: { code: string } };

      expect(second.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error?.code).toBe('RATE_LIMIT_EXCEEDED');
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });

  it('valid end-to-end flow + SDK local mode', async () => {
    const localClient = new HostedRuntimeClient({ mode: 'local' });
    const capability = await localClient.mintCapability(buildMintInput());

    const decision = await localClient.evaluateEnforcement({
      capability,
      requested_scope: [{ type: 'content' as const, ref: REF_A }],
      requested_permissions: ['read'],
      subject: SUBJECT,
      grantee: GRANTEE,
      marketMakerId: 'mm-01',
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(decision.allowed).toBe(true);
    expect(decision.reason_code).toBe('ENFORCEMENT_ALLOW');
  });
});
