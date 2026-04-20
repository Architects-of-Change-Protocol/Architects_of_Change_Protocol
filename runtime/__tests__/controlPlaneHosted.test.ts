import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { AddressInfo } from 'net';
import { createRuntimeServer } from '../api/server';
import { DEFAULT_RUNTIME_CORE } from '../api/routes';
import { ControlPlaneService, FileControlPlaneStore } from '../controlPlane';
import { HostedRuntimeClient } from '../sdk/client';
import { closeServer, startServer } from './helpers/serverLifecycle';

describe('control plane lifecycle hosted endpoints', () => {
  it('creates request, approves it, lists active grants, and revokes grant', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'aoc-control-plane-'));
    const controlPlaneService = new ControlPlaneService(new FileControlPlaneStore(join(tempDir, 'state.json')));

    const server = createRuntimeServer({
      core: {
        ...DEFAULT_RUNTIME_CORE,
        controlPlaneService,
      },
    });
    await startServer(server);

    try {
      const { port } = server.address() as AddressInfo;
      const client = new HostedRuntimeClient({ baseUrl: `http://127.0.0.1:${port}`, apiKey: 'aoc_free_dev_key' });

      const request = await client.createAccessRequest({
        subject_id: 'subject-1',
        requester_id: 'mm-1',
        dataset_id: 'dataset-1',
        purpose: 'risk',
        requested_scope: ['summary'],
      });

      expect(request.status).toBe('pending');

      const pending = await client.listAccessRequests({ subject_id: 'subject-1', status: 'pending' });
      expect(pending).toHaveLength(1);
      expect(pending[0].request_id).toBe(request.request_id);

      const decision = await client.decideAccessRequest({
        request_id: request.request_id,
        subject_id: 'subject-1',
        decision: 'approve',
      });

      expect(decision.decision.decision).toBe('approve');
      expect(decision.grant?.status).toBe('active');

      const grants = await client.listActiveGrants({ subject_id: 'subject-1' });
      expect(grants).toHaveLength(1);

      const revoked = await client.revokeGrant({ grant_id: grants[0].grant_id, subject_id: 'subject-1' });
      expect(revoked.status).toBe('revoked');

      const afterRevoke = await client.listActiveGrants({ subject_id: 'subject-1' });
      expect(afterRevoke).toHaveLength(0);
    } finally {
      await closeServer(server);
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
