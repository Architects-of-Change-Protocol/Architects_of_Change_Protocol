import { buildConsentObject } from '../../../consent';
import { mintCapability } from '../../../protocol/capability';
import { revokeCapabilityToken, resetRevocationRegistry } from '../../../capability';
import { isMeteredEndpoint } from '../../usage';
import { executeRoute, isContainmentEndpoint, DEFAULT_RUNTIME_CORE } from '../routes';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const REF_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function alwaysNotRevoked() {
  return { status: 'verified_not_revoked' as const, subjectId: 'fixture', subjectType: 'capability_grant' as const, checkedAt: new Date().toISOString(), sourceVersion: 'v1' };
}

function mintFixtureCapability() {
  const consent = buildConsentObject(SUBJECT, GRANTEE, 'grant', [{ type: 'content', ref: REF_A }], ['read'], {
    now: new Date('2026-01-01T00:00:00Z'),
    expires_at: '2026-12-31T00:00:00Z',
  });

  return mintCapability({
    consent,
    requested_scope: [{ type: 'content', ref: REF_A }],
    requested_permissions: ['read'],
    issued_at: '2026-02-01T00:00:00Z',
    expires_at: '2026-03-01T00:00:00Z',
    checkConsentRevocation: () => alwaysNotRevoked(),
  });
}

describe('runtime/api/routes.ts — /enforcement/evaluate and /execution/authorize actually check revocation', () => {
  afterEach(() => {
    resetRevocationRegistry();
  });

  it('REGRESSION (was fail-open): a revoked capability is denied via the real API route, not silently allowed', () => {
    const capability = mintFixtureCapability();

    // Before revocation: the route allows the request.
    const before = executeRoute('/enforcement/evaluate', {
      capability,
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      now: new Date('2026-02-15T00:00:00Z'),
    });
    expect(before.success).toBe(true);
    expect(before.data && 'allowed' in before.data ? before.data.allowed : undefined).toBe(true);

    // Revoke via the canonical capability-hash registry that routes.ts is wired to.
    revokeCapabilityToken(capability.capability_hash);

    const after = executeRoute('/enforcement/evaluate', {
      capability,
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(after.success).toBe(true);
    expect(after.data && 'allowed' in after.data ? after.data.allowed : undefined).toBe(false);
    expect(after.data && 'reason_code' in after.data ? after.data.reason_code : undefined).toBe('CAPABILITY_REVOKED');
  });

  it('REGRESSION (was fail-open): /execution/authorize also denies a revoked capability', () => {
    const capability = mintFixtureCapability();
    revokeCapabilityToken(capability.capability_hash);

    const result = executeRoute('/execution/authorize', {
      capability,
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      execution_target: { adapter: 'hrkey', operation: 'read_content' },
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(result.success).toBe(true);
    expect(result.data && 'authorized' in result.data ? result.data.authorized : undefined).toBe(false);
  });

  it('a client-supplied `isRevoked` field in the JSON payload is ignored (cannot be used to fake "not revoked")', () => {
    const capability = mintFixtureCapability();
    revokeCapabilityToken(capability.capability_hash);

    const result = executeRoute('/enforcement/evaluate', {
      capability,
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      now: new Date('2026-02-15T00:00:00Z'),
      isRevoked: () => false, // attempted spoof; must have no effect
    } as unknown);

    expect(result.data && 'allowed' in result.data ? result.data.allowed : undefined).toBe(false);
  });
});

describe('runtime/api/routes.ts — billing safety override (ADR §13)', () => {
  it('/access/grant/revoke is a containment endpoint and is never metered/priced', () => {
    expect(isContainmentEndpoint('/access/grant/revoke')).toBe(true);
    expect(isMeteredEndpoint('/access/grant/revoke')).toBe(false);
  });

  it('revoking a grant end-to-end through executeRoute succeeds and is idempotent', () => {
    const core = DEFAULT_RUNTIME_CORE;
    const request = core.controlPlaneService.createAccessRequest({
      subject_id: 'subject-route-1',
      requester_id: 'requester-route-1',
      dataset_id: 'dataset-1',
      purpose: 'analysis',
      requested_scope: ['content:a'],
    });
    const { grant } = core.controlPlaneService.decideAccessRequest({ request_id: request.request_id, decision: 'approve' });
    expect(grant).toBeDefined();

    const first = executeRoute('/access/grant/revoke', { grant_id: grant!.grant_id, idempotency_key: 'route-idem-1' });
    const second = executeRoute('/access/grant/revoke', { grant_id: grant!.grant_id, idempotency_key: 'route-idem-1' });

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect((first.data as { revocationId?: string })?.revocationId).toBe((second.data as { revocationId?: string })?.revocationId);
  });

  it('idempotency conflict on /access/grant/revoke is surfaced as a stable error, not a silent overwrite', () => {
    const core = DEFAULT_RUNTIME_CORE;
    const requestA = core.controlPlaneService.createAccessRequest({
      subject_id: 'subject-route-a',
      requester_id: 'requester-route-a',
      dataset_id: 'dataset-1',
      purpose: 'analysis',
      requested_scope: ['content:a'],
    });
    const { grant: grantA } = core.controlPlaneService.decideAccessRequest({ request_id: requestA.request_id, decision: 'approve' });
    const requestB = core.controlPlaneService.createAccessRequest({
      subject_id: 'subject-route-b',
      requester_id: 'requester-route-b',
      dataset_id: 'dataset-1',
      purpose: 'analysis',
      requested_scope: ['content:a'],
    });
    const { grant: grantB } = core.controlPlaneService.decideAccessRequest({ request_id: requestB.request_id, decision: 'approve' });

    executeRoute('/access/grant/revoke', { grant_id: grantA!.grant_id, idempotency_key: 'route-conflict-1' });
    const conflict = executeRoute('/access/grant/revoke', { grant_id: grantB!.grant_id, idempotency_key: 'route-conflict-1' });

    expect(conflict.success).toBe(false);
    expect(conflict.error?.code).toBe('IDEMPOTENCY_CONFLICT');
  });
});
