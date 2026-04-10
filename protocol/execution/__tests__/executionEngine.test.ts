import { buildConsentObject } from '../../../consent';
import { mintCapability } from '../../capability';
import { ENFORCEMENT_REASON_CODES } from '../../enforcement';
import { authorizeExecution } from '..';
import { EXECUTION_REASON_CODES } from '../execution-types';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const REF_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function buildCapability() {
  const consent = buildConsentObject(SUBJECT, GRANTEE, 'grant', [{ type: 'content', ref: REF_A }], ['read'], {
    now: new Date('2026-01-01T00:00:00Z'),
    expires_at: '2026-12-31T00:00:00Z',
    marketMakerId: 'mm-01',
  });

  return mintCapability({
    consent,
    requested_scope: [{ type: 'content', ref: REF_A }],
    requested_permissions: ['read'],
    issued_at: '2026-02-01T00:00:00Z',
    expires_at: '2026-03-01T00:00:00Z',
    marketMakerId: 'mm-01',
  });
}

describe('protocol execution authorization handoff', () => {
  it('execution request válido + enforcement allow => authorized', () => {
    const result = authorizeExecution({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      subject: SUBJECT,
      grantee: GRANTEE,
      marketMakerId: 'mm-01',
      execution_target: { adapter: 'hrkey', operation: 'read_content' },
      action_context: { workflow: 'access-request' },
      payload: { correlationId: 'abc-123' },
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(result.authorized).toBe(true);
    expect(result.decision).toBe('authorized');
    expect(result.reason_code).toBe(EXECUTION_REASON_CODES.EXECUTION_AUTHORIZED);
    expect(result.execution_target).toEqual({ adapter: 'hrkey', operation: 'read_content' });
    expect(result.enforcement_decision).toBeDefined();
    expect(result.enforcement_decision?.allowed).toBe(true);
    expect(result.execution_contract).toBeDefined();
    expect(result.execution_contract).toMatchObject({
      adapter: 'hrkey',
      operation: 'read_content',
      subject: SUBJECT,
      grantee: GRANTEE,
      allowed_scope: [{ type: 'content', ref: REF_A }],
      allowed_permissions: ['read'],
      marketMakerId: 'mm-01',
    });
  });

  it('execution request inválido => rejected', () => {
    const result = authorizeExecution({
      capability: buildCapability(),
      requested_scope: [],
      requested_permissions: ['read'],
      execution_target: { adapter: 'hrkey', operation: 'read_content' },
      now: new Date('2026-02-15T00:00:00Z'),
    } as any);

    expect(result.authorized).toBe(false);
    expect(result.decision).toBe('rejected');
    expect(result.reason_code).toBe(EXECUTION_REASON_CODES.EXECUTION_REQUEST_INVALID);
    expect(result.execution_contract).toBeUndefined();
  });

  it('capability inválido => rejected', () => {
    const result = authorizeExecution({
      capability: {},
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      execution_target: { adapter: 'hrkey', operation: 'read_content' },
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(result.authorized).toBe(false);
    expect(result.decision).toBe('rejected');
    expect(result.reason_code).toBe(ENFORCEMENT_REASON_CODES.CAPABILITY_INVALID);
    expect(result.enforcement_decision).toBeDefined();
    expect(result.execution_contract).toBeUndefined();
  });

  it('enforcement expired => rejected', () => {
    const result = authorizeExecution({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      execution_target: { adapter: 'hrkey', operation: 'read_content' },
      now: new Date('2026-04-01T00:00:00Z'),
    });

    expect(result.authorized).toBe(false);
    expect(result.reason_code).toBe(ENFORCEMENT_REASON_CODES.CAPABILITY_EXPIRED);
  });

  it('enforcement permission deny => rejected', () => {
    const result = authorizeExecution({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['write'],
      execution_target: { adapter: 'hrkey', operation: 'write_content' },
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(result.authorized).toBe(false);
    expect(result.reason_code).toBe(ENFORCEMENT_REASON_CODES.PERMISSION_NOT_ALLOWED);
  });

  it('enforcement subject mismatch => rejected', () => {
    const result = authorizeExecution({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      subject: 'did:key:z6MkDifferentSubject1234567890abc',
      execution_target: { adapter: 'hrkey', operation: 'read_content' },
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(result.authorized).toBe(false);
    expect(result.reason_code).toBe(ENFORCEMENT_REASON_CODES.SUBJECT_MISMATCH);
  });

  it('execution_target inválido => rejected', () => {
    const result = authorizeExecution({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      execution_target: { adapter: '', operation: 'read_content' },
      now: new Date('2026-02-15T00:00:00Z'),
    } as any);

    expect(result.authorized).toBe(false);
    expect(result.reason_code).toBe(EXECUTION_REASON_CODES.EXECUTION_REQUEST_INVALID);
  });

  it('payload inválido => rejected', () => {
    const result = authorizeExecution({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      execution_target: { adapter: 'hrkey', operation: 'read_content' },
      payload: 'invalid-payload',
      now: new Date('2026-02-15T00:00:00Z'),
    } as any);

    expect(result.authorized).toBe(false);
    expect(result.reason_code).toBe(EXECUTION_REASON_CODES.EXECUTION_REQUEST_INVALID);
  });

  it('authorization result incluye execution_contract cuando authorized', () => {
    const result = authorizeExecution({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      execution_target: { adapter: 'hrkey', operation: 'read_content' },
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(result.authorized).toBe(true);
    expect(result.execution_contract).toBeDefined();
    expect(result.execution_contract?.capability_hash).toHaveLength(64);
    expect(result.execution_contract?.parent_consent_hash).toHaveLength(64);
  });

  it('authorization result NO incluye execution_contract válido cuando rejected', () => {
    const result = authorizeExecution({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['write'],
      execution_target: { adapter: 'hrkey', operation: 'write_content' },
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(result.authorized).toBe(false);
    expect(result.execution_contract).toBeUndefined();
    expect(result.execution_target).toEqual({ adapter: 'hrkey', operation: 'write_content' });
    expect(result.enforcement_decision).toBeDefined();
  });
});
