import type { AddressInfo } from 'net';
import { issueCapabilityToken, type ConsentDecision, type ConsentRecord, type ConsentRequest } from '../../protocol/consent';
import { DEFAULT_RUNTIME_CORE, type RuntimeCore } from '../api/routes';
import { createRuntimeServer } from '../api/server';
import { closeServer, startServer } from './helpers/serverLifecycle';

const CAPABILITY_SECRET = 'runtime-enforcement-secret';

function buildConsent(overrides: Partial<ConsentRecord> = {}): ConsentRecord {
  return {
    consent_id: 'consent-runtime-1',
    subject_id: 'subject-1',
    requester_id: 'requester-1',
    resource: '/data/access',
    actions: ['execute'],
    granted: true,
    created_at: '2026-01-01T00:00:00.000Z',
    expires_at: '2026-12-31T00:00:00.000Z',
    revoked_at: null,
    consent_hash: 'consent-hash-runtime-1',
    ...overrides,
  };
}

function buildRequest(overrides: Partial<ConsentRequest> = {}): ConsentRequest {
  return {
    subject_id: 'subject-1',
    requester_id: 'requester-1',
    resource: '/data/access',
    action: 'execute',
    requested_at: '2026-02-01T00:00:00.000Z',
    ...overrides,
  };
}

function buildDecision(overrides: Partial<ConsentDecision> = {}): ConsentDecision {
  return {
    allowed: true,
    reason_code: 'ALLOW',
    evaluated_at: '2026-02-01T00:00:00.000Z',
    consent_id: 'consent-runtime-1',
    ...overrides,
  };
}

function makeCapability(resource: '/data/access' | '/payout/execute', requester = 'requester-1') {
  return issueCapabilityToken(
    {
      consent: buildConsent({ resource, requester_id: requester }),
      request: buildRequest({ resource, requester_id: requester }),
      decision: buildDecision(),
    },
    CAPABILITY_SECRET
  );
}

function makeCore(overrides: Partial<RuntimeCore> = {}): RuntimeCore {
  return {
    ...DEFAULT_RUNTIME_CORE,
    ...overrides,
  };
}

describe('runtime capability enforcement', () => {
  it('allows access with valid capability', async () => {
    const dataAccessService = {
      requestAccess: jest.fn().mockReturnValue({
        allowed: true,
        reason_code: 'ACCESS_ALLOWED',
        evaluated_at: '2026-03-01T00:00:00.000Z',
        access_token: 'aoc_access_valid',
        expires_at: '2026-03-01T01:00:00.000Z',
        audit_ref: 'audit-1',
      }),
      getAuditEvents: jest.fn().mockReturnValue([]),
    } as unknown as RuntimeCore['dataAccessService'];

    const core = makeCore({ dataAccessService });
    const server = createRuntimeServer({ core, capabilitySecret: CAPABILITY_SECRET, enforcementMode: 'strict' });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/data/access`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': 'aoc_free_dev_key',
          'x-aoc-capability': JSON.stringify(makeCapability('/data/access')),
        },
        body: JSON.stringify({
          subject_hash: 'subject-1',
          consumer_id: 'requester-1',
          dataset_id: 'dataset-1',
          purpose: 'risk',
        }),
      });

      expect(response.status).toBe(200);
      expect(dataAccessService.requestAccess).toHaveBeenCalledTimes(1);
    } finally {
      await closeServer(server);
    }
  });

  it('denies access with invalid capability', async () => {
    const dataAccessService = {
      requestAccess: jest.fn(),
      getAuditEvents: jest.fn().mockReturnValue([]),
    } as unknown as RuntimeCore['dataAccessService'];

    const core = makeCore({ dataAccessService });
    const server = createRuntimeServer({ core, capabilitySecret: CAPABILITY_SECRET, enforcementMode: 'strict' });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/data/access`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': 'aoc_free_dev_key',
          'x-aoc-capability': JSON.stringify({ bad: true }),
        },
        body: JSON.stringify({
          subject_hash: 'subject-1',
          consumer_id: 'requester-1',
          dataset_id: 'dataset-1',
          purpose: 'risk',
        }),
      });

      expect(response.status).toBe(403);
      expect(dataAccessService.requestAccess).not.toHaveBeenCalled();
    } finally {
      await closeServer(server);
    }
  });

  it('allows access in soft mode without token', async () => {
    const dataAccessService = {
      requestAccess: jest.fn().mockReturnValue({
        allowed: true,
        reason_code: 'ACCESS_ALLOWED',
        evaluated_at: '2026-03-01T00:00:00.000Z',
        access_token: 'aoc_access_valid',
        expires_at: '2026-03-01T01:00:00.000Z',
        audit_ref: 'audit-2',
      }),
      getAuditEvents: jest.fn().mockReturnValue([]),
    } as unknown as RuntimeCore['dataAccessService'];

    const core = makeCore({ dataAccessService });
    const server = createRuntimeServer({ core, capabilitySecret: CAPABILITY_SECRET, enforcementMode: 'soft' });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/data/access`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': 'aoc_free_dev_key',
        },
        body: JSON.stringify({
          subject_hash: 'subject-1',
          consumer_id: 'requester-1',
          dataset_id: 'dataset-1',
          purpose: 'risk',
        }),
      });

      expect(response.status).toBe(200);
      expect(dataAccessService.requestAccess).toHaveBeenCalledTimes(1);
    } finally {
      await closeServer(server);
    }
  });

  it('denies access in strict mode without token', async () => {
    const payoutExecutor = {
      execute: jest.fn(),
      callback: jest.fn(),
      getAuditEvents: jest.fn().mockReturnValue([]),
    } as unknown as RuntimeCore['payoutExecutor'];

    const core = makeCore({ payoutExecutor });
    const server = createRuntimeServer({ core, capabilitySecret: CAPABILITY_SECRET, enforcementMode: 'strict' });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/payout/execute`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': 'aoc_free_dev_key',
        },
        body: JSON.stringify({
          withdrawal_id: 'wd-1',
          subject_hash: 'subject-1',
          consumer_id: 'requester-1',
          amount: '10',
        }),
      });

      expect(response.status).toBe(403);
      expect(payoutExecutor.execute).not.toHaveBeenCalled();
    } finally {
      await closeServer(server);
    }
  });

  it('records capability audit events for authorized and denied requests', async () => {
    const core = makeCore();
    const server = createRuntimeServer({ core, capabilitySecret: CAPABILITY_SECRET, enforcementMode: 'strict' });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const base = `http://127.0.0.1:${port}`;

      await fetch(`${base}/data/access`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': 'aoc_free_dev_key',
          'x-aoc-capability': JSON.stringify(makeCapability('/data/access')),
        },
        body: JSON.stringify({
          subject_hash: 'subject-1',
          consumer_id: 'requester-1',
          dataset_id: 'dataset-1',
          purpose: 'risk',
        }),
      });

      await fetch(`${base}/data/access`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': 'aoc_free_dev_key',
          'x-aoc-capability': JSON.stringify(makeCapability('/data/access', 'other-requester')),
        },
        body: JSON.stringify({
          subject_hash: 'subject-1',
          consumer_id: 'requester-1',
          dataset_id: 'dataset-1',
          purpose: 'risk',
        }),
      });

      const events = core.capabilityAuditService.listEvents();
      expect(events.some((event) => event.event_type === 'CAPABILITY_AUTHORIZED')).toBe(true);
      expect(events.some((event) => event.event_type === 'CAPABILITY_DENIED')).toBe(true);
    } finally {
      await closeServer(server);
    }
  });
});
