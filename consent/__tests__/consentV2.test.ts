import { buildConsentObjectV2, validateConsentObjectV2 } from '../consentObject';
import type { ScopeEntry, ConsentObjectV2, AffiliationBinding } from '../types';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const INSTITUTION_DID = 'did:web:university.example.edu';
const VC_REF = 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';

const SCOPE: ScopeEntry[] = [
  { type: 'content', ref: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
];

const NOW = new Date('2025-01-01T00:00:00Z');
const EXPIRY = '2026-01-01T00:00:00Z';

describe('ConsentObjectV2 — buildConsentObjectV2', () => {
  it('builds a valid standard consent with temporal fields', () => {
    const consent = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY,
      { now: NOW }
    );

    expect(consent.version).toBe('2.0');
    expect(consent.access_expiration_timestamp).toBe(EXPIRY);
    expect(consent.access_start_timestamp).toBe(consent.issued_at);
    expect(consent.expires_at).toBe(EXPIRY);
    expect(consent.renewable).toBe(false);
    expect(consent.max_renewals).toBeNull();
    expect(consent.renewal_count).toBe(0);
    expect(consent.consent_mode).toBe('standard');
    expect(consent.affiliation).toBeNull();
    expect(consent.access_scope_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(consent.consent_hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('sets access_start_timestamp independently of issued_at when provided', () => {
    const consent = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY,
      { now: NOW, access_start_timestamp: '2025-03-01T00:00:00Z' }
    );
    expect(consent.access_start_timestamp).toBe('2025-03-01T00:00:00Z');
    expect(consent.issued_at).toBe('2025-01-01T00:00:00Z');
  });

  it('allows renewable with max_renewals', () => {
    const consent = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY,
      { now: NOW, renewable: true, max_renewals: 3 }
    );
    expect(consent.renewable).toBe(true);
    expect(consent.max_renewals).toBe(3);
  });

  it('allows renewable with unlimited renewals (max_renewals=null)', () => {
    const consent = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY,
      { now: NOW, renewable: true, max_renewals: null }
    );
    expect(consent.renewable).toBe(true);
    expect(consent.max_renewals).toBeNull();
  });

  it('rejects max_renewals when renewable=false', () => {
    expect(() =>
      buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, {
        now: NOW, renewable: false, max_renewals: 3,
      })
    ).toThrow('max_renewals must be null when renewable is false');
  });

  it('rejects access_start_timestamp before issued_at', () => {
    expect(() =>
      buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, {
        now: NOW, access_start_timestamp: '2024-12-01T00:00:00Z',
      })
    ).toThrow('access_start_timestamp must be at or after issued_at');
  });

  it('rejects access_expiration_timestamp before access_start_timestamp', () => {
    expect(() =>
      buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], '2024-12-01T00:00:00Z', {
        now: NOW,
      })
    ).toThrow('access_expiration_timestamp must be after access_start_timestamp');
  });

  it('builds a valid institutional-affiliation consent', () => {
    const affiliation: AffiliationBinding = {
      institution_did: INSTITUTION_DID,
      affiliation_type: 'membership',
      affiliation_credential_ref: VC_REF,
      auto_expires_on_affiliation_change: true,
    };
    const consent = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY,
      { now: NOW, consent_mode: 'institutional-affiliation', affiliation }
    );
    expect(consent.consent_mode).toBe('institutional-affiliation');
    expect(consent.affiliation).toEqual(affiliation);
  });

  it('rejects institutional-affiliation mode without affiliation binding', () => {
    expect(() =>
      buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, {
        now: NOW, consent_mode: 'institutional-affiliation', affiliation: null,
      })
    ).toThrow('affiliation must be non-null');
  });

  it('rejects standard mode with affiliation binding', () => {
    const affiliation: AffiliationBinding = {
      institution_did: INSTITUTION_DID,
      affiliation_type: 'employment',
      affiliation_credential_ref: VC_REF,
      auto_expires_on_affiliation_change: false,
    };
    expect(() =>
      buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, {
        now: NOW, consent_mode: 'standard', affiliation,
      })
    ).toThrow('affiliation must be null when consent_mode is "standard"');
  });

  it('the consent_hash covers all temporal fields (deterministic)', () => {
    const c1 = buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, { now: NOW });
    const c2 = buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, { now: NOW });
    expect(c1.consent_hash).toBe(c2.consent_hash);
  });

  it('produces different consent_hash when expiration changes', () => {
    const c1 = buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, { now: NOW });
    const c2 = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], '2027-01-01T00:00:00Z', { now: NOW }
    );
    expect(c1.consent_hash).not.toBe(c2.consent_hash);
  });

  it('produces different consent_hash when renewable changes', () => {
    const c1 = buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, {
      now: NOW, renewable: false,
    });
    const c2 = buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, {
      now: NOW, renewable: true,
    });
    expect(c1.consent_hash).not.toBe(c2.consent_hash);
  });
});

describe('ConsentObjectV2 — validateConsentObjectV2', () => {
  it('validates a freshly built consent without error', () => {
    const consent = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, { now: NOW }
    );
    expect(() => validateConsentObjectV2(consent)).not.toThrow();
  });

  it('rejects tampered expires_at (hash mismatch)', () => {
    const consent = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, { now: NOW }
    );
    const tampered = { ...consent, access_expiration_timestamp: '2099-01-01T00:00:00Z' };
    expect(() => validateConsentObjectV2(tampered as ConsentObjectV2)).toThrow();
  });

  it('rejects when access_scope_hash does not match scope+timestamps', () => {
    const consent = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, { now: NOW }
    );
    // Forge scope_hash to something random
    const tampered = {
      ...consent,
      access_scope_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    };
    expect(() => validateConsentObjectV2(tampered as ConsentObjectV2)).toThrow(
      'access_scope_hash does not match'
    );
  });

  it('rejects when version is not 2.0', () => {
    const consent = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, { now: NOW }
    );
    const tampered = { ...consent, version: '1.0' };
    expect(() => validateConsentObjectV2(tampered as unknown as ConsentObjectV2)).toThrow(
      'version "2.0"'
    );
  });

  it('rejects when expires_at != access_expiration_timestamp', () => {
    const consent = buildConsentObjectV2(
      SUBJECT, GRANTEE, 'grant', SCOPE, ['read'], EXPIRY, { now: NOW }
    );
    // Both need to match in V2
    const tampered = { ...consent, expires_at: '2027-01-01T00:00:00Z' };
    expect(() => validateConsentObjectV2(tampered as unknown as ConsentObjectV2)).toThrow();
  });
});
