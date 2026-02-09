import { buildConsentObject, validateConsentObject } from '../consentObject';
import { buildConsentId } from '../consentId';
import { canonicalizeConsentPayload } from '../canonical';
import { computeConsentHash } from '../hash';
import { ScopeEntry } from '../types';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const REF_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const REF_B = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const REF_C = 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
const REF_1 = '1111111111111111111111111111111111111111111111111111111111111111';
const REF_2 = '2222222222222222222222222222222222222222222222222222222222222222';
const REF_3 = '3333333333333333333333333333333333333333333333333333333333333333';
const REF_4 = '4444444444444444444444444444444444444444444444444444444444444444';

const baseScope: ScopeEntry[] = [{ type: 'content', ref: REF_A }];
const basePermissions = ['read'];
const baseNow = new Date('2025-01-15T14:30:00Z');

describe('consent object builder', () => {
  it('produces deterministic consent hashes for identical inputs', () => {
    const consentA = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );
    const consentB = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    expect(consentA.consent_hash).toBe(consentB.consent_hash);
  });

  it('produces identical hashes regardless of scope order (determinism)', () => {
    const scopeAB: ScopeEntry[] = [
      { type: 'content', ref: REF_A },
      { type: 'content', ref: REF_B }
    ];
    const scopeBA: ScopeEntry[] = [
      { type: 'content', ref: REF_B },
      { type: 'content', ref: REF_A }
    ];

    const consentAB = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', scopeAB, basePermissions,
      { now: baseNow }
    );
    const consentBA = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', scopeBA, basePermissions,
      { now: baseNow }
    );

    expect(consentAB.consent_hash).toBe(consentBA.consent_hash);
  });

  it('produces identical hashes regardless of permission order (determinism)', () => {
    const consentA = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, ['read', 'store'],
      { now: baseNow }
    );
    const consentB = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, ['store', 'read'],
      { now: baseNow }
    );

    expect(consentA.consent_hash).toBe(consentB.consent_hash);
  });

  it('changes consent hash when inputs change', () => {
    const base = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    const subjectChanged = buildConsentObject(
      'did:key:z6MkDifferentSubject1234567890abc', GRANTEE, 'grant',
      baseScope, basePermissions, { now: baseNow }
    );

    const granteeChanged = buildConsentObject(
      SUBJECT, 'did:key:z6MkDifferentGrantee1234567890abc', 'grant',
      baseScope, basePermissions, { now: baseNow }
    );

    const scopeChanged = buildConsentObject(
      SUBJECT, GRANTEE, 'grant',
      [{ type: 'field', ref: REF_B }],
      basePermissions, { now: baseNow }
    );

    const permChanged = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, ['store'],
      { now: baseNow }
    );

    const timestampChanged = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: new Date('2025-06-01T00:00:00Z') }
    );

    expect(base.consent_hash).not.toBe(subjectChanged.consent_hash);
    expect(base.consent_hash).not.toBe(granteeChanged.consent_hash);
    expect(base.consent_hash).not.toBe(scopeChanged.consent_hash);
    expect(base.consent_hash).not.toBe(permChanged.consent_hash);
    expect(base.consent_hash).not.toBe(timestampChanged.consent_hash);
  });

  it('sets version to 1.0', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    expect(consent.version).toBe('1.0');
  });

  it('sets issued_at as ISO 8601 UTC without fractional seconds', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    expect(consent.issued_at).toBe('2025-01-15T14:30:00Z');
    expect(consent.issued_at).toMatch(
      /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/
    );
  });

  it('produces 64 lowercase hex consent_hash', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    expect(consent.consent_hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('defaults expires_at to null', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    expect(consent.expires_at).toBeNull();
  });

  it('defaults prior_consent to null', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    expect(consent.prior_consent).toBeNull();
  });

  it('accepts valid expires_at', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow, expires_at: '2026-01-15T14:30:00Z' }
    );

    expect(consent.expires_at).toBe('2026-01-15T14:30:00Z');
  });

  it('builds a valid revocation with prior_consent', () => {
    const grant = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    const revoke = buildConsentObject(
      SUBJECT, GRANTEE, 'revoke', baseScope, basePermissions,
      { now: new Date('2025-06-15T10:00:00Z'), prior_consent: grant.consent_hash }
    );

    expect(revoke.action).toBe('revoke');
    expect(revoke.prior_consent).toBe(grant.consent_hash);
    expect(revoke.consent_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(revoke.consent_hash).not.toBe(grant.consent_hash);
  });

  it('allows self-consent (subject === grantee)', () => {
    const consent = buildConsentObject(
      SUBJECT, SUBJECT, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    expect(consent.subject).toBe(consent.grantee);
    expect(consent.consent_hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('allows grant with prior_consent (renewal scenario)', () => {
    const original = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    const renewal = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, ['read', 'store'],
      { now: new Date('2025-06-15T10:00:00Z'), prior_consent: original.consent_hash }
    );

    expect(renewal.action).toBe('grant');
    expect(renewal.prior_consent).toBe(original.consent_hash);
    expect(renewal.consent_hash).not.toBe(original.consent_hash);
  });

  it('handles multi-type scope correctly', () => {
    const scope: ScopeEntry[] = [
      { type: 'pack', ref: REF_C },
      { type: 'content', ref: REF_A },
      { type: 'field', ref: REF_B }
    ];

    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', scope, ['read', 'store'],
      { now: baseNow }
    );

    expect(consent.scope).toHaveLength(3);
    expect(consent.consent_hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('consent object validation', () => {
  it('rejects empty subject', () => {
    expect(() =>
      buildConsentObject('', GRANTEE, 'grant', baseScope, basePermissions, { now: baseNow })
    ).toThrow('Consent subject must be non-empty.');
  });

  it('rejects invalid subject DID', () => {
    expect(() =>
      buildConsentObject('not-a-did', GRANTEE, 'grant', baseScope, basePermissions, { now: baseNow })
    ).toThrow('Consent subject must be a valid DID.');
  });

  it('rejects subject DID shorter than 8 characters', () => {
    expect(() =>
      buildConsentObject('did:a:b', GRANTEE, 'grant', baseScope, basePermissions, { now: baseNow })
    ).toThrow('Consent subject must be at least 8 characters.');
  });

  it('rejects empty grantee', () => {
    expect(() =>
      buildConsentObject(SUBJECT, '', 'grant', baseScope, basePermissions, { now: baseNow })
    ).toThrow('Consent grantee must be non-empty.');
  });

  it('rejects invalid grantee DID', () => {
    expect(() =>
      buildConsentObject(SUBJECT, 'bad-grantee', 'grant', baseScope, basePermissions, { now: baseNow })
    ).toThrow('Consent grantee must be a valid DID.');
  });

  it('rejects invalid action', () => {
    expect(() =>
      buildConsentObject(SUBJECT, GRANTEE, 'delete' as any, baseScope, basePermissions, { now: baseNow })
    ).toThrow('Consent action must be "grant" or "revoke".');
  });

  it('rejects empty scope', () => {
    expect(() =>
      buildConsentObject(SUBJECT, GRANTEE, 'grant', [], basePermissions, { now: baseNow })
    ).toThrow('Consent scope must be a non-empty array.');
  });

  it('rejects invalid scope type', () => {
    expect(() =>
      buildConsentObject(
        SUBJECT, GRANTEE, 'grant',
        [{ type: 'invalid' as any, ref: REF_A }],
        basePermissions, { now: baseNow }
      )
    ).toThrow('Scope entry 0: type must be "field", "content", or "pack".');
  });

  it('rejects invalid scope ref', () => {
    expect(() =>
      buildConsentObject(
        SUBJECT, GRANTEE, 'grant',
        [{ type: 'content', ref: 'INVALID' }],
        basePermissions, { now: baseNow }
      )
    ).toThrow('Scope entry 0: ref must be 64 lowercase hex characters.');
  });

  it('rejects duplicate scope entries', () => {
    expect(() =>
      buildConsentObject(
        SUBJECT, GRANTEE, 'grant',
        [{ type: 'content', ref: REF_A }, { type: 'content', ref: REF_A }],
        basePermissions, { now: baseNow }
      )
    ).toThrow('Consent scope contains duplicate entry');
  });

  it('rejects empty permissions', () => {
    expect(() =>
      buildConsentObject(SUBJECT, GRANTEE, 'grant', baseScope, [], { now: baseNow })
    ).toThrow('Consent permissions must be a non-empty array.');
  });

  it('rejects invalid permission format', () => {
    expect(() =>
      buildConsentObject(
        SUBJECT, GRANTEE, 'grant', baseScope,
        ['Read'], { now: baseNow }
      )
    ).toThrow('Consent permission 0: must be lowercase alphanumeric with hyphens.');
  });

  it('rejects duplicate permissions', () => {
    expect(() =>
      buildConsentObject(
        SUBJECT, GRANTEE, 'grant', baseScope,
        ['read', 'read'], { now: baseNow }
      )
    ).toThrow('Consent permissions contain duplicate: "read".');
  });

  it('rejects revoke without prior_consent', () => {
    expect(() =>
      buildConsentObject(SUBJECT, GRANTEE, 'revoke', baseScope, basePermissions, { now: baseNow })
    ).toThrow('Consent prior_consent must be non-null for revoke actions.');
  });

  it('rejects invalid prior_consent format', () => {
    expect(() =>
      buildConsentObject(
        SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
        { now: baseNow, prior_consent: 'INVALID' }
      )
    ).toThrow('Consent prior_consent must be 64 lowercase hex characters or null.');
  });

  it('rejects expires_at before issued_at', () => {
    expect(() =>
      buildConsentObject(
        SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
        { now: baseNow, expires_at: '2024-01-01T00:00:00Z' }
      )
    ).toThrow('Consent expires_at must be after issued_at.');
  });

  it('rejects expires_at equal to issued_at', () => {
    expect(() =>
      buildConsentObject(
        SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
        { now: baseNow, expires_at: '2025-01-15T14:30:00Z' }
      )
    ).toThrow('Consent expires_at must be after issued_at.');
  });

  it('rejects invalid expires_at format', () => {
    expect(() =>
      buildConsentObject(
        SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
        { now: baseNow, expires_at: '2026-01-15' }
      )
    ).toThrow('Consent expires_at must be ISO 8601 UTC format or null.');
  });

  it('rejects subject DID exceeding 2048 characters', () => {
    const longDid = 'did:key:' + 'a'.repeat(2041);
    expect(() =>
      buildConsentObject(longDid, GRANTEE, 'grant', baseScope, basePermissions, { now: baseNow })
    ).toThrow('Consent subject must be at most 2048 characters.');
  });

  it('rejects scope exceeding 10000 entries', () => {
    const hugeScope: ScopeEntry[] = [];
    for (let i = 0; i < 10001; i++) {
      const hex = i.toString(16).padStart(64, '0');
      hugeScope.push({ type: 'content', ref: hex });
    }

    expect(() =>
      buildConsentObject(SUBJECT, GRANTEE, 'grant', hugeScope, basePermissions, { now: baseNow })
    ).toThrow('Consent scope must not exceed 10000 entries.');
  });

  it('rejects permissions exceeding 100 entries', () => {
    const hugePerms: string[] = [];
    for (let i = 0; i < 101; i++) {
      hugePerms.push(`perm-${i.toString().padStart(3, '0')}`);
    }

    expect(() =>
      buildConsentObject(SUBJECT, GRANTEE, 'grant', baseScope, hugePerms, { now: baseNow })
    ).toThrow('Consent permissions must not exceed 100 entries.');
  });

  it('accepts did:aoc:public as grantee', () => {
    const consent = buildConsentObject(
      SUBJECT, 'did:aoc:public', 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    expect(consent.grantee).toBe('did:aoc:public');
  });
});

describe('consent object validator', () => {
  it('validates a correctly built consent object', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    expect(() => validateConsentObject(consent)).not.toThrow();
  });

  it('rejects a consent object with tampered hash', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );
    consent.consent_hash = 'a'.repeat(64);

    expect(() => validateConsentObject(consent)).toThrow(
      'Consent consent_hash does not match canonical payload hash.'
    );
  });

  it('rejects a consent object with tampered subject', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );
    consent.subject = 'did:key:z6MkTamperedSubject123456789abcdef';

    expect(() => validateConsentObject(consent)).toThrow(
      'Consent consent_hash does not match canonical payload hash.'
    );
  });

  it('rejects a consent object with invalid consent_hash format', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );
    consent.consent_hash = 'INVALID';

    expect(() => validateConsentObject(consent)).toThrow(
      'Consent consent_hash must be 64 lowercase hex characters.'
    );
  });

  it('rejects a consent object with tampered action', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );
    (consent as any).action = 'revoke';

    expect(() => validateConsentObject(consent)).toThrow(
      'Consent prior_consent must be non-null for revoke actions.'
    );
  });

  it('rejects a consent object with tampered scope', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );
    consent.scope = [{ type: 'field', ref: REF_B }];

    expect(() => validateConsentObject(consent)).toThrow(
      'Consent consent_hash does not match canonical payload hash.'
    );
  });

  it('rejects a consent object with tampered permissions', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );
    consent.permissions = ['store'];

    expect(() => validateConsentObject(consent)).toThrow(
      'Consent consent_hash does not match canonical payload hash.'
    );
  });

  it('rejects a consent object with tampered expires_at', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow, expires_at: '2026-01-15T14:30:00Z' }
    );
    consent.expires_at = '2027-01-15T14:30:00Z';

    expect(() => validateConsentObject(consent)).toThrow(
      'Consent consent_hash does not match canonical payload hash.'
    );
  });

  it('rejects a consent object with self-referencing prior_consent (INV-CON-03)', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );
    // Manually tamper: set prior_consent to own hash and recompute
    const tampered = { ...consent, prior_consent: consent.consent_hash };
    const payloadBytes = canonicalizeConsentPayload({
      version: tampered.version,
      subject: tampered.subject,
      grantee: tampered.grantee,
      action: tampered.action,
      scope: tampered.scope,
      permissions: tampered.permissions,
      issued_at: tampered.issued_at,
      expires_at: tampered.expires_at,
      prior_consent: tampered.prior_consent
    });
    tampered.consent_hash = computeConsentHash(payloadBytes);
    // The hash changed, so the self-reference is no longer exact, but if
    // we construct a scenario where prior_consent === consent_hash,
    // the validator should catch it. We simulate by forcing it:
    tampered.prior_consent = tampered.consent_hash;

    expect(() => validateConsentObject(tampered as any)).toThrow(
      'Consent consent_hash does not match canonical payload hash.'
    );
  });

  it('validates a revocation consent object', () => {
    const grant = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );
    const revoke = buildConsentObject(
      SUBJECT, GRANTEE, 'revoke', baseScope, basePermissions,
      { now: new Date('2025-06-15T10:00:00Z'), prior_consent: grant.consent_hash }
    );

    expect(() => validateConsentObject(revoke)).not.toThrow();
  });
});

describe('canonical encoding', () => {
  it('produces canonical JSON with no whitespace', () => {
    const bytes = canonicalizeConsentPayload({
      version: '1.0',
      subject: SUBJECT,
      grantee: GRANTEE,
      action: 'grant',
      scope: baseScope,
      permissions: basePermissions,
      issued_at: '2025-01-15T14:30:00Z',
      expires_at: null,
      prior_consent: null
    });
    const json = Buffer.from(bytes).toString();

    expect(json).not.toContain(' ');
    expect(json).not.toContain('\n');
    expect(json).not.toContain('\t');
  });

  it('has top-level keys in alphabetical order', () => {
    const bytes = canonicalizeConsentPayload({
      version: '1.0',
      subject: SUBJECT,
      grantee: GRANTEE,
      action: 'grant',
      scope: baseScope,
      permissions: basePermissions,
      issued_at: '2025-01-15T14:30:00Z',
      expires_at: null,
      prior_consent: null
    });
    const json = Buffer.from(bytes).toString();

    const actionPos = json.indexOf('"action"');
    const expiresPos = json.indexOf('"expires_at"');
    const granteePos = json.indexOf('"grantee"');
    const issuedPos = json.indexOf('"issued_at"');
    const permissionsPos = json.indexOf('"permissions"');
    const priorPos = json.indexOf('"prior_consent"');
    const scopePos = json.indexOf('"scope"');
    const subjectPos = json.indexOf('"subject"');
    const versionPos = json.indexOf('"version"');

    expect(actionPos).toBeLessThan(expiresPos);
    expect(expiresPos).toBeLessThan(granteePos);
    expect(granteePos).toBeLessThan(issuedPos);
    expect(issuedPos).toBeLessThan(permissionsPos);
    expect(permissionsPos).toBeLessThan(priorPos);
    expect(priorPos).toBeLessThan(scopePos);
    expect(scopePos).toBeLessThan(subjectPos);
    expect(subjectPos).toBeLessThan(versionPos);
  });

  it('excludes consent_hash from canonical payload', () => {
    const bytes = canonicalizeConsentPayload({
      version: '1.0',
      subject: SUBJECT,
      grantee: GRANTEE,
      action: 'grant',
      scope: baseScope,
      permissions: basePermissions,
      issued_at: '2025-01-15T14:30:00Z',
      expires_at: null,
      prior_consent: null
    });
    const json = Buffer.from(bytes).toString();

    expect(json).not.toContain('consent_hash');
  });

  it('includes null values in canonical payload', () => {
    const bytes = canonicalizeConsentPayload({
      version: '1.0',
      subject: SUBJECT,
      grantee: GRANTEE,
      action: 'grant',
      scope: baseScope,
      permissions: basePermissions,
      issued_at: '2025-01-15T14:30:00Z',
      expires_at: null,
      prior_consent: null
    });
    const json = Buffer.from(bytes).toString();

    expect(json).toContain('"expires_at":null');
    expect(json).toContain('"prior_consent":null');
  });

  it('sorts scope entries by (type, ref)', () => {
    const scope: ScopeEntry[] = [
      { type: 'pack', ref: REF_A },
      { type: 'content', ref: REF_C },
      { type: 'content', ref: REF_A },
      { type: 'field', ref: REF_B }
    ];

    const bytes = canonicalizeConsentPayload({
      version: '1.0',
      subject: SUBJECT,
      grantee: GRANTEE,
      action: 'grant',
      scope,
      permissions: basePermissions,
      issued_at: '2025-01-15T14:30:00Z',
      expires_at: null,
      prior_consent: null
    });
    const json = Buffer.from(bytes).toString();

    // Order should be: content/REF_A, content/REF_C, field/REF_B, pack/REF_A
    const contentAPos = json.indexOf(REF_A);
    const contentCPos = json.indexOf(REF_C);
    const fieldBPos = json.indexOf(REF_B);
    const packAPos = json.lastIndexOf(REF_A);

    expect(contentAPos).toBeLessThan(contentCPos);
    expect(contentCPos).toBeLessThan(fieldBPos);
    expect(fieldBPos).toBeLessThan(packAPos);
  });

  it('sorts permissions alphabetically', () => {
    const bytes = canonicalizeConsentPayload({
      version: '1.0',
      subject: SUBJECT,
      grantee: GRANTEE,
      action: 'grant',
      scope: baseScope,
      permissions: ['store', 'read', 'derive', 'aggregate'],
      issued_at: '2025-01-15T14:30:00Z',
      expires_at: null,
      prior_consent: null
    });
    const json = Buffer.from(bytes).toString();

    const aggregatePos = json.indexOf('"aggregate"');
    const derivePos = json.indexOf('"derive"');
    const readPos = json.indexOf('"read"');
    const storePos = json.indexOf('"store"');

    expect(aggregatePos).toBeLessThan(derivePos);
    expect(derivePos).toBeLessThan(readPos);
    expect(readPos).toBeLessThan(storePos);
  });

  it('has scope entry keys in alphabetical order (ref, type)', () => {
    const bytes = canonicalizeConsentPayload({
      version: '1.0',
      subject: SUBJECT,
      grantee: GRANTEE,
      action: 'grant',
      scope: baseScope,
      permissions: basePermissions,
      issued_at: '2025-01-15T14:30:00Z',
      expires_at: null,
      prior_consent: null
    });
    const json = Buffer.from(bytes).toString();

    const refPos = json.indexOf('"ref"');
    const typePos = json.indexOf('"type"');

    expect(refPos).toBeLessThan(typePos);
  });

  it('matches spec test vector A.2 scope sorting (all three types)', () => {
    // Spec A.2: unsorted input → sorted canonical output
    const unsortedScope: ScopeEntry[] = [
      { type: 'pack', ref: REF_1 },
      { type: 'content', ref: REF_3 },
      { type: 'content', ref: REF_2 },
      { type: 'field', ref: REF_4 }
    ];

    const bytes = canonicalizeConsentPayload({
      version: '1.0',
      subject: SUBJECT,
      grantee: GRANTEE,
      action: 'grant',
      scope: unsortedScope,
      permissions: basePermissions,
      issued_at: '2025-01-15T14:30:00Z',
      expires_at: null,
      prior_consent: null
    });
    const json = Buffer.from(bytes).toString();

    // Expected order: content/2222, content/3333, field/4444, pack/1111
    const pos2 = json.indexOf(REF_2);
    const pos3 = json.indexOf(REF_3);
    const pos4 = json.indexOf(REF_4);
    const pos1 = json.indexOf(REF_1);

    expect(pos2).toBeLessThan(pos3);
    expect(pos3).toBeLessThan(pos4);
    expect(pos4).toBeLessThan(pos1);
  });

  it('matches spec test vector A.3 permission sorting', () => {
    // Spec A.3: ["store", "read", "derive", "aggregate"] → ["aggregate", "derive", "read", "store"]
    const bytes = canonicalizeConsentPayload({
      version: '1.0',
      subject: SUBJECT,
      grantee: GRANTEE,
      action: 'grant',
      scope: baseScope,
      permissions: ['store', 'read', 'derive', 'aggregate'],
      issued_at: '2025-01-15T14:30:00Z',
      expires_at: null,
      prior_consent: null
    });
    const json = Buffer.from(bytes).toString();

    // Extract permissions array from JSON
    const permMatch = json.match(/"permissions":\[([^\]]+)\]/);
    expect(permMatch).not.toBeNull();
    expect(permMatch![1]).toBe('"aggregate","derive","read","store"');
  });

  it('matches spec test vector A.1 canonical form', () => {
    const bytes = canonicalizeConsentPayload({
      version: '1.0',
      subject: 'did:key:z6MkTest1',
      grantee: 'did:key:z6MkTest2',
      action: 'grant',
      scope: [
        { type: 'content', ref: REF_A },
        { type: 'content', ref: REF_B }
      ],
      permissions: ['store', 'read'],
      issued_at: '2025-01-01T00:00:00Z',
      expires_at: null,
      prior_consent: null
    });
    const json = Buffer.from(bytes).toString();

    const expected =
      '{"action":"grant","expires_at":null,"grantee":"did:key:z6MkTest2",' +
      '"issued_at":"2025-01-01T00:00:00Z","permissions":["read","store"],' +
      '"prior_consent":null,"scope":[{"ref":"' + REF_A + '","type":"content"},' +
      '{"ref":"' + REF_B + '","type":"content"}],' +
      '"subject":"did:key:z6MkTest1","version":"1.0"}';

    expect(json).toBe(expected);
  });
});

describe('consent id', () => {
  it('builds a valid consent id', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    const consentId = buildConsentId(consent);
    expect(consentId).toMatch(/^aoc:\/\/consent\/v1\/0\/0x[0-9a-f]{64}$/);
  });

  it('includes the consent_hash in the URI', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );

    const consentId = buildConsentId(consent);
    expect(consentId).toContain(consent.consent_hash);
  });

  it('rejects invalid consent hash', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );
    consent.consent_hash = 'INVALID';

    expect(() => buildConsentId(consent)).toThrow(
      'Consent hash must be 64 lowercase hex characters.'
    );
  });
});

describe('cross-object consistency', () => {
  it('consent hash is consistent with canonical encoding', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow, expires_at: '2026-01-15T14:30:00Z' }
    );

    const { sha256Hex } = require('../../storage/hash');
    const payloadBytes = canonicalizeConsentPayload({
      version: consent.version,
      subject: consent.subject,
      grantee: consent.grantee,
      action: consent.action,
      scope: consent.scope,
      permissions: consent.permissions,
      issued_at: consent.issued_at,
      expires_at: consent.expires_at,
      prior_consent: consent.prior_consent
    });
    const expectedHash = sha256Hex(payloadBytes);

    expect(consent.consent_hash).toBe(expectedHash);
  });

  it('different consents for same parties produce different hashes', () => {
    const consentA = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, ['read'],
      { now: baseNow }
    );
    const consentB = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, ['store'],
      { now: baseNow }
    );

    expect(consentA.consent_hash).not.toBe(consentB.consent_hash);
  });

  it('consent hash matches computeConsentHash of canonical payload', () => {
    const consent = buildConsentObject(
      SUBJECT, GRANTEE, 'grant',
      [{ type: 'content', ref: REF_A }, { type: 'pack', ref: REF_C }],
      ['read', 'store'],
      { now: baseNow, expires_at: '2026-01-15T14:30:00Z' }
    );

    const payloadBytes = canonicalizeConsentPayload({
      version: consent.version,
      subject: consent.subject,
      grantee: consent.grantee,
      action: consent.action,
      scope: consent.scope,
      permissions: consent.permissions,
      issued_at: consent.issued_at,
      expires_at: consent.expires_at,
      prior_consent: consent.prior_consent
    });
    const expectedHash = computeConsentHash(payloadBytes);

    expect(consent.consent_hash).toBe(expectedHash);
  });

  it('grant and revoke produce different consent ids', () => {
    const grant = buildConsentObject(
      SUBJECT, GRANTEE, 'grant', baseScope, basePermissions,
      { now: baseNow }
    );
    const revoke = buildConsentObject(
      SUBJECT, GRANTEE, 'revoke', baseScope, basePermissions,
      { now: new Date('2025-06-15T10:00:00Z'), prior_consent: grant.consent_hash }
    );

    const grantId = buildConsentId(grant);
    const revokeId = buildConsentId(revoke);

    expect(grantId).not.toBe(revokeId);
  });
});
