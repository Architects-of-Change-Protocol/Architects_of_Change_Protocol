import { buildConsentObject } from '../../../consent';
import {
  doesConsentAllowScope,
  evaluateConsentState,
  isConsentActive,
  isConsentRevoked,
  normalizeConsent,
  parseConsent,
  validateConsent,
} from '..';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const REF_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

describe('protocol consent core extraction', () => {
  it('accepts a valid active consent', () => {
    const consent = buildConsentObject(
      SUBJECT,
      GRANTEE,
      'grant',
      [{ type: 'content', ref: REF_A }],
      ['read'],
      {
        now: new Date('2025-01-01T00:00:00Z'),
        expires_at: '2025-12-31T00:00:00Z',
      }
    );

    const parsed = parseConsent(consent);
    const normalized = normalizeConsent(parsed);
    const validation = validateConsent(normalized);
    const state = evaluateConsentState(normalized, { now: new Date('2025-06-01T00:00:00Z') });

    expect(validation.valid).toBe(true);
    expect(state.state).toBe('active');
    expect(isConsentActive(normalized, { now: new Date('2025-06-01T00:00:00Z') })).toBe(true);
    expect(
      doesConsentAllowScope(normalized, {
        scope: [{ type: 'content', ref: REF_A }],
        permissions: ['read'],
        now: new Date('2025-06-01T00:00:00Z'),
      })
    ).toBe(true);
  });

  it('marks expired consent as expired and deny scope', () => {
    const consent = buildConsentObject(
      SUBJECT,
      GRANTEE,
      'grant',
      [{ type: 'content', ref: REF_A }],
      ['read'],
      {
        now: new Date('2025-01-01T00:00:00Z'),
        expires_at: '2025-01-02T00:00:00Z',
      }
    );

    const state = evaluateConsentState(consent, { now: new Date('2025-01-03T00:00:00Z') });
    expect(state.state).toBe('expired');
    expect(
      doesConsentAllowScope(consent, {
        scope: [{ type: 'content', ref: REF_A }],
        permissions: ['read'],
        now: new Date('2025-01-03T00:00:00Z'),
      })
    ).toBe(false);
  });

  it('marks consent as revoked by revocation hook', () => {
    const consent = buildConsentObject(
      SUBJECT,
      GRANTEE,
      'grant',
      [{ type: 'content', ref: REF_A }],
      ['read'],
      { now: new Date('2025-01-01T00:00:00Z') }
    );

    const state = evaluateConsentState(consent, {
      now: new Date('2025-01-03T00:00:00Z'),
      isRevoked: () => true,
    });

    expect(state.state).toBe('revoked');
    expect(isConsentRevoked(consent, { isRevoked: () => true })).toBe(true);
  });

  it('fails closed on invalid or incomplete scope requests', () => {
    const consent = buildConsentObject(
      SUBJECT,
      GRANTEE,
      'grant',
      [{ type: 'content', ref: REF_A }],
      ['read'],
      { now: new Date('2025-01-01T00:00:00Z') }
    );

    expect(
      doesConsentAllowScope(consent, {
        scope: [],
        permissions: ['read'],
        now: new Date('2025-01-01T01:00:00Z'),
      })
    ).toBe(false);

    expect(
      doesConsentAllowScope(consent, {
        scope: [{ type: 'content', ref: '' }],
        permissions: ['read'],
        now: new Date('2025-01-01T01:00:00Z'),
      })
    ).toBe(false);
  });

  it('denies when request permissions are invalid or not granted', () => {
    const consent = buildConsentObject(
      SUBJECT,
      GRANTEE,
      'grant',
      [{ type: 'content', ref: REF_A }],
      ['read'],
      { now: new Date('2025-01-01T00:00:00Z') }
    );

    expect(
      doesConsentAllowScope(consent, {
        scope: [{ type: 'content', ref: REF_A }],
        permissions: ['store'],
      })
    ).toBe(false);

    expect(
      doesConsentAllowScope(consent, {
        scope: [{ type: 'content', ref: REF_A }],
        permissions: [''],
      })
    ).toBe(false);
  });

  it('denies on subject/grantee binding mismatch', () => {
    const consent = buildConsentObject(
      SUBJECT,
      GRANTEE,
      'grant',
      [{ type: 'content', ref: REF_A }],
      ['read'],
      { now: new Date('2025-01-01T00:00:00Z'), marketMakerId: 'hrkey-v1' }
    );

    expect(
      doesConsentAllowScope(consent, {
        scope: [{ type: 'content', ref: REF_A }],
        permissions: ['read'],
        subject: 'did:key:z6MkDifferentSubject1234567890abc',
      })
    ).toBe(false);

    expect(
      doesConsentAllowScope(consent, {
        scope: [{ type: 'content', ref: REF_A }],
        permissions: ['read'],
        grantee: 'did:key:z6MkDifferentGrantee1234567890abc',
      })
    ).toBe(false);

    expect(
      doesConsentAllowScope(consent, {
        scope: [{ type: 'content', ref: REF_A }],
        permissions: ['read'],
        marketMakerId: 'another-mm',
      })
    ).toBe(false);
  });

  it('fails closed with missing critical fields', () => {
    expect(() => parseConsent({})).toThrow('Consent field "subject" must be a string.');
    expect(() => parseConsent({ subject: SUBJECT, grantee: GRANTEE, action: 'grant' })).toThrow(
      'Consent field "scope" must be a non-empty array.'
    );
    expect(() =>
      parseConsent({
        subject: SUBJECT,
        grantee: GRANTEE,
        action: 'grant',
        scope: [{ type: 'content', ref: REF_A }],
      })
    ).toThrow('Consent field "permissions" must be a non-empty array.');

    const malformed = {
      version: '1.0',
      subject: SUBJECT,
      grantee: GRANTEE,
      action: 'grant',
      scope: [{ type: 'content', ref: REF_A }],
      permissions: ['read'],
      issued_at: '2025-01-01T00:00:00Z',
      expires_at: null,
      prior_consent: null,
      consent_hash: 'not-a-hash',
    } as any;

    const validation = validateConsent(malformed);
    expect(validation.valid).toBe(false);
  });

  it('invalid state denies by default', () => {
    const malformed = {
      version: '1.0',
      subject: SUBJECT,
      grantee: GRANTEE,
      action: 'grant',
      scope: [{ type: 'content', ref: REF_A }],
      permissions: ['read'],
      issued_at: 'invalid-date',
      expires_at: null,
      prior_consent: null,
      consent_hash: REF_A,
    } as any;

    const state = evaluateConsentState(malformed, {
      now: new Date('2025-01-01T00:00:00Z'),
    });

    expect(state.state).toBe('invalid');
    expect(
      doesConsentAllowScope(malformed, {
        scope: [{ type: 'content', ref: REF_A }],
        permissions: ['read'],
      })
    ).toBe(false);
  });
});
