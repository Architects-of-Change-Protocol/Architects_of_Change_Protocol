import { buildConsentObjectV2 } from '../../consent/consentObject';
import { resetRevocationRegistry } from '../revocation';
import {
  mintCapabilityTokenV2,
  validateCapabilityTokenV2,
  verifyCapabilityTokenV2,
  resetNonceRegistry,
} from '../capabilityToken';
import type { ScopeEntry } from '../../consent/types';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';

const SCOPE: ScopeEntry[] = [
  { type: 'content', ref: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
];

const ISSUED = new Date('2025-01-01T00:00:00Z');
const CONSENT_EXPIRY = '2026-01-01T00:00:00Z';
const TOKEN_EXPIRY = '2025-12-01T00:00:00Z';

function buildConsent(opts = {}) {
  return buildConsentObjectV2(
    SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], CONSENT_EXPIRY,
    { now: ISSUED, ...opts }
  );
}

beforeEach(() => {
  resetNonceRegistry();
  resetRevocationRegistry();
});

describe('mintCapabilityTokenV2', () => {
  it('mints a valid V2 token', () => {
    const consent = buildConsent();
    const token = mintCapabilityTokenV2(consent, SCOPE, ['read'], TOKEN_EXPIRY, { now: ISSUED });

    expect(token.version).toBe('2.0');
    expect(token.bound_consent_hash).toBe(consent.consent_hash);
    expect(token.consent_ref).toBe(consent.consent_hash);
    expect(token.bound_consent_hash).toBe(token.consent_ref);
    expect(token.renewal_generation).toBe(0);
    expect(token.issuer_signature).toBeNull();
    expect(token.capability_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(token.token_id).toMatch(/^[a-f0-9]{64}$/);
  });

  it('rejects token expiry after consent access_expiration_timestamp', () => {
    const consent = buildConsent();
    expect(() =>
      mintCapabilityTokenV2(consent, SCOPE, ['read'], '2027-01-01T00:00:00Z', { now: ISSUED })
    ).toThrow('access_expiration_timestamp');
  });

  it('rejects token issued_at before consent access_start_timestamp', () => {
    // consent starts 2025-06-01, but token is issued 2025-01-01
    const consent = buildConsent({ access_start_timestamp: '2025-06-01T00:00:00Z' });
    expect(() =>
      mintCapabilityTokenV2(consent, SCOPE, ['read'], TOKEN_EXPIRY, { now: ISSUED })
    ).toThrow('access_start_timestamp');
  });

  it('includes renewal_generation when specified', () => {
    const consent = buildConsent({ renewable: true });
    const token = mintCapabilityTokenV2(consent, SCOPE, ['read'], TOKEN_EXPIRY, {
      now: ISSUED, renewal_generation: 2,
    });
    expect(token.renewal_generation).toBe(2);
  });

  it('rejects derivation from a revoke consent', () => {
    const original = buildConsent();
    const revoke = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'revoke', SCOPE, ['read'], CONSENT_EXPIRY,
      { now: ISSUED, prior_consent: original.consent_hash }
    );
    expect(() =>
      mintCapabilityTokenV2(revoke, SCOPE, ['read'], TOKEN_EXPIRY, { now: ISSUED })
    ).toThrow('action "grant"');
  });

  it('rejects scope escalation beyond consent scope', () => {
    const consent = buildConsent();
    const extraScope: ScopeEntry[] = [
      ...SCOPE,
      { type: 'pack', ref: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
    ];
    expect(() =>
      mintCapabilityTokenV2(consent, extraScope, ['read'], TOKEN_EXPIRY, { now: ISSUED })
    ).toThrow('Scope escalation');
  });
});

describe('validateCapabilityTokenV2', () => {
  it('validates a freshly minted token', () => {
    const consent = buildConsent();
    const token = mintCapabilityTokenV2(consent, SCOPE, ['read'], TOKEN_EXPIRY, { now: ISSUED });
    expect(() => validateCapabilityTokenV2(token)).not.toThrow();
  });

  it('rejects when bound_consent_hash != consent_ref', () => {
    const consent = buildConsent();
    const token = mintCapabilityTokenV2(consent, SCOPE, ['read'], TOKEN_EXPIRY, { now: ISSUED });
    const tampered = {
      ...token,
      bound_consent_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    };
    expect(() => validateCapabilityTokenV2(tampered)).toThrow('bound_consent_hash must equal consent_ref');
  });

  it('rejects when capability_hash does not match payload', () => {
    const consent = buildConsent();
    const token = mintCapabilityTokenV2(consent, SCOPE, ['read'], TOKEN_EXPIRY, { now: ISSUED });
    const tampered = { ...token, renewal_generation: 99 };
    expect(() => validateCapabilityTokenV2(tampered)).toThrow('capability_hash does not match');
  });
});

describe('verifyCapabilityTokenV2', () => {
  it('verifies a valid token at mint time', () => {
    const consent = buildConsent();
    const token = mintCapabilityTokenV2(consent, SCOPE, ['read'], TOKEN_EXPIRY, { now: ISSUED });
    const evalTime = new Date('2025-06-01T00:00:00Z');
    expect(() => verifyCapabilityTokenV2(token, consent, { now: evalTime })).not.toThrow();
  });

  it('rejects when token is expired', () => {
    const consent = buildConsent();
    const token = mintCapabilityTokenV2(consent, SCOPE, ['read'], '2025-03-01T00:00:00Z', { now: ISSUED });
    const evalTime = new Date('2025-06-01T00:00:00Z'); // after expiry
    expect(() => verifyCapabilityTokenV2(token, consent, { now: evalTime })).toThrow('expired');
  });

  it('rejects when evaluated before access_start_timestamp', () => {
    const consent = buildConsent({ access_start_timestamp: '2025-06-01T00:00:00Z' });
    const token = mintCapabilityTokenV2(consent, SCOPE, ['read'], TOKEN_EXPIRY, {
      now: new Date('2025-06-01T00:00:00Z'),
    });
    const evalTime = new Date('2025-01-15T00:00:00Z'); // before access window opens
    expect(() => verifyCapabilityTokenV2(token, consent, { now: evalTime })).toThrow(
      'Access window'
    );
  });

  it('rejects replay: same token presented twice', () => {
    const consent = buildConsent();
    const token = mintCapabilityTokenV2(consent, SCOPE, ['read'], TOKEN_EXPIRY, { now: ISSUED });
    const evalTime = new Date('2025-06-01T00:00:00Z');
    verifyCapabilityTokenV2(token, consent, { now: evalTime });
    expect(() => verifyCapabilityTokenV2(token, consent, { now: evalTime })).toThrow('replay');
  });

  it('rejects when consent_ref does not match consent hash', () => {
    const consent1 = buildConsent();
    const consent2 = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], CONSENT_EXPIRY,
      { now: new Date('2025-02-01T00:00:00Z') } // different issued_at → different hash
    );
    const token = mintCapabilityTokenV2(consent1, SCOPE, ['read'], TOKEN_EXPIRY, { now: ISSUED });
    const evalTime = new Date('2025-06-01T00:00:00Z');
    expect(() => verifyCapabilityTokenV2(token, consent2, { now: evalTime })).toThrow(
      'consent_ref does not match'
    );
  });
});
