import { buildConsentObject } from '../../../consent';
import {
  evaluateCapabilityAccess,
  evaluateCapabilityState,
  mintCapability,
  verifyCapability,
} from '..';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const REF_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const REF_B = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

function buildConsent() {
  return buildConsentObject(
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
}

describe('protocol capability lifecycle', () => {
  it('mint válido', () => {
    const capability = mintCapability({
      consent: buildConsent(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
      marketMakerId: 'mm-01',
    });

    expect(capability.parent_consent_hash).toHaveLength(64);
    expect(capability.capability_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(capability.scope).toEqual([{ type: 'content', ref: REF_A }]);
    expect(capability.permissions).toEqual(['read']);
  });

  it('mint con scope inválido -> throw', () => {
    expect(() =>
      mintCapability({
        consent: buildConsent(),
        requested_scope: [{ type: 'field', ref: REF_A }],
        requested_permissions: ['read'],
        issued_at: '2026-02-01T00:00:00Z',
        expires_at: '2026-03-01T00:00:00Z',
      })
    ).toThrow('requested_scope must be a subset of consent.scope.');
  });

  it('mint con permissions inválidos -> throw', () => {
    expect(() =>
      mintCapability({
        consent: buildConsent(),
        requested_scope: [{ type: 'content', ref: REF_A }],
        requested_permissions: ['aggregate'],
        issued_at: '2026-02-01T00:00:00Z',
        expires_at: '2026-03-01T00:00:00Z',
      })
    ).toThrow('requested_permissions must be a subset of consent.permissions.');
  });

  it('mint con expires inválido -> throw', () => {
    expect(() =>
      mintCapability({
        consent: buildConsent(),
        requested_scope: [{ type: 'content', ref: REF_A }],
        requested_permissions: ['read'],
        issued_at: '2026-02-01T00:00:00Z',
        expires_at: '2027-01-01T00:00:00Z',
      })
    ).toThrow('expires_at cannot exceed consent.expires_at.');
  });

  it('verify válido', () => {
    const capability = mintCapability({
      consent: buildConsent(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
      marketMakerId: 'mm-01',
    });

    const result = verifyCapability(capability);
    expect(result.valid).toBe(true);
  });

  it('verify con hash incorrecto -> invalid', () => {
    const capability = mintCapability({
      consent: buildConsent(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
      marketMakerId: 'mm-01',
    });

    const invalid = {
      ...capability,
      capability_hash: 'f'.repeat(64),
    };

    const result = verifyCapability(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Capability hash integrity mismatch.');
  });

  it('evaluate active', () => {
    const capability = mintCapability({
      consent: buildConsent(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
      marketMakerId: 'mm-01',
    });

    const state = evaluateCapabilityState(capability, { now: new Date('2026-02-15T00:00:00Z') });
    expect(state.state).toBe('active');
  });

  it('evaluate expired', () => {
    const capability = mintCapability({
      consent: buildConsent(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
      marketMakerId: 'mm-01',
    });

    const state = evaluateCapabilityState(capability, { now: new Date('2026-04-01T00:00:00Z') });
    expect(state.state).toBe('expired');
  });

  it('evaluate not_yet_active', () => {
    const capability = mintCapability({
      consent: buildConsent(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      not_before: '2026-02-10T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
      marketMakerId: 'mm-01',
    });

    const state = evaluateCapabilityState(capability, { now: new Date('2026-02-05T00:00:00Z') });
    expect(state.state).toBe('not_yet_active');
  });

  it('evaluate revoked (mock hook)', () => {
    const capability = mintCapability({
      consent: buildConsent(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
      marketMakerId: 'mm-01',
    });

    const state = evaluateCapabilityState(capability, {
      now: new Date('2026-02-15T00:00:00Z'),
      isRevoked: () => true,
    });

    expect(state.state).toBe('revoked');
  });

  it('access permitido', () => {
    const capability = mintCapability({
      consent: buildConsent(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
      marketMakerId: 'mm-01',
    });

    expect(
      evaluateCapabilityAccess(capability, {
        requested_scope: [{ type: 'content', ref: REF_A }],
        requested_permissions: ['read'],
        subject: SUBJECT,
        grantee: GRANTEE,
        marketMakerId: 'mm-01',
        now: new Date('2026-02-15T00:00:00Z'),
      })
    ).toBe(true);
  });

  it('access con scope fuera -> deny', () => {
    const capability = mintCapability({
      consent: buildConsent(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
      marketMakerId: 'mm-01',
    });

    expect(
      evaluateCapabilityAccess(capability, {
        requested_scope: [{ type: 'pack', ref: REF_B }],
        requested_permissions: ['read'],
        now: new Date('2026-02-15T00:00:00Z'),
      })
    ).toBe(false);
  });

  it('access con permission fuera -> deny', () => {
    const capability = mintCapability({
      consent: buildConsent(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
      marketMakerId: 'mm-01',
    });

    expect(
      evaluateCapabilityAccess(capability, {
        requested_scope: [{ type: 'content', ref: REF_A }],
        requested_permissions: ['derive'],
        now: new Date('2026-02-15T00:00:00Z'),
      })
    ).toBe(false);
  });

  it('binding mismatch -> deny', () => {
    const capability = mintCapability({
      consent: buildConsent(),
      requested_scope: [{ type: 'content', ref: REF_A }],
      requested_permissions: ['read'],
      issued_at: '2026-02-01T00:00:00Z',
      expires_at: '2026-03-01T00:00:00Z',
      marketMakerId: 'mm-01',
    });

    expect(
      evaluateCapabilityAccess(capability, {
        requested_scope: [{ type: 'content', ref: REF_A }],
        requested_permissions: ['read'],
        subject: 'did:key:z6MkDifferentSubject1234567890abc',
        now: new Date('2026-02-15T00:00:00Z'),
      })
    ).toBe(false);
  });
});
