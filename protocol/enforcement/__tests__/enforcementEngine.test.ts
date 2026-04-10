import { buildConsentObject } from '../../../consent';
import { mintCapability } from '../../capability';
import { ENFORCEMENT_REASON_CODES, evaluateEnforcement } from '..';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const REF_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const REF_B = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

function buildCapability() {
  const consent = buildConsentObject(
    SUBJECT,
    GRANTEE,
    'grant',
    [
      { type: 'content', ref: REF_A },
      { type: 'pack', ref: REF_B },
    ],
    ['read', 'share'],
    {
      now: new Date('2026-01-01T00:00:00Z'),
      expires_at: '2026-12-31T00:00:00Z',
      marketMakerId: 'mm-01',
    }
  );

  return mintCapability({
    consent,
    requested_scope: [{ type: 'content', ref: REF_A }],
    requested_permissions: ['read'],
    issued_at: '2026-02-01T00:00:00Z',
    expires_at: '2026-03-01T00:00:00Z',
    marketMakerId: 'mm-01',
  });
}

describe('protocol enforcement runtime', () => {
  it('request válido => allow', () => {
    const decision = evaluateEnforcement({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      subject: SUBJECT,
      grantee: GRANTEE,
      marketMakerId: 'mm-01',
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(decision.allowed).toBe(true);
    expect(decision.decision).toBe('allow');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.ENFORCEMENT_ALLOW);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('capability inválido => deny CAPABILITY_INVALID', () => {
    const decision = evaluateEnforcement({
      capability: {},
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('deny');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.CAPABILITY_INVALID);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('capability expired => deny CAPABILITY_EXPIRED', () => {
    const decision = evaluateEnforcement({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      now: new Date('2026-04-01T00:00:00Z'),
    });

    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('deny');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.CAPABILITY_EXPIRED);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('capability revoked => deny CAPABILITY_REVOKED', () => {
    const decision = evaluateEnforcement({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      now: new Date('2026-02-15T00:00:00Z'),
      isRevoked: () => true,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('deny');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.CAPABILITY_REVOKED);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('capability not_yet_active => deny CAPABILITY_NOT_YET_ACTIVE', () => {
    const consent = buildConsentObject(
      SUBJECT,
      GRANTEE,
      'grant',
      [{ type: 'content', ref: REF_A }],
      ['read'],
      { now: new Date('2026-01-01T00:00:00Z'), expires_at: '2026-12-31T00:00:00Z' }
    );

    const capability = mintCapability({
      consent,
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      not_before: '2026-02-20T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
    });

    const decision = evaluateEnforcement({
      capability,
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('deny');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.CAPABILITY_NOT_YET_ACTIVE);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('requested_scope fuera => deny SCOPE_NOT_ALLOWED', () => {
    const decision = evaluateEnforcement({
      capability: buildCapability(),
      requested_scope: [{ type: 'pack', ref: REF_B }],
      requested_permissions: ['read'],
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('deny');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.SCOPE_NOT_ALLOWED);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('requested_permissions fuera => deny PERMISSION_NOT_ALLOWED', () => {
    const decision = evaluateEnforcement({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['share'],
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('deny');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.PERMISSION_NOT_ALLOWED);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('subject mismatch => deny SUBJECT_MISMATCH', () => {
    const decision = evaluateEnforcement({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      subject: 'did:key:z6MkDifferentSubject1234567890abc',
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('deny');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.SUBJECT_MISMATCH);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('grantee mismatch => deny GRANTEE_MISMATCH', () => {
    const decision = evaluateEnforcement({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      grantee: 'did:key:z6MkDifferentGrantee1234567890abc',
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('deny');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.GRANTEE_MISMATCH);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('marketMaker mismatch => deny MARKET_MAKER_MISMATCH', () => {
    const decision = evaluateEnforcement({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      marketMakerId: 'mm-02',
      now: new Date('2026-02-15T00:00:00Z'),
    });

    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('deny');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.MARKET_MAKER_MISMATCH);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('request inválido => deny REQUEST_INVALID', () => {
    const decision = evaluateEnforcement({
      capability: buildCapability(),
      requested_scope: [],
      requested_permissions: ['read'],
      now: new Date('2026-02-15T00:00:00Z'),
    } as any);

    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('deny');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.REQUEST_INVALID);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });

  it('fail-closed cuando permission está vacía', () => {
    const decision = evaluateEnforcement({
      capability: buildCapability(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['   '],
      now: new Date('2026-02-15T00:00:00Z'),
    } as any);

    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('deny');
    expect(decision.reason_code).toBe(ENFORCEMENT_REASON_CODES.REQUEST_INVALID);
  });
});
