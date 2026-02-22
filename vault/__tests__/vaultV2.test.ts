import { createInMemoryVault } from '../vault';
import { buildConsentObjectV2 } from '../../consent/consentObject';
import { buildPackManifest } from '../../pack';
import { buildStoragePointer } from '../../storage';
import { FieldReference } from '../../pack/types';
import { resetRevocationRegistry, resetNonceRegistry } from '../../capability';
import { resetAccessLedger } from '../accessLedger';
import type { ScopeEntry, AffiliationBinding } from '../../consent/types';

// --- Test constants ---

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const INSTITUTION_DID = 'did:web:university.example.edu';
const VC_REF = 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';

const CONTENT_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const STORAGE_HASH_A = '1111111111111111111111111111111111111111111111111111111111111111';

const ISSUED = new Date('2025-01-01T00:00:00Z');
const CONSENT_EXPIRY = '2026-01-01T00:00:00Z';
const TOKEN_EXPIRY = '2025-12-01T00:00:00Z';
const EVAL_TIME = new Date('2025-06-01T00:00:00Z');

// --- Helpers ---

function makeFieldRefs(): FieldReference[] {
  return [
    {
      field_id: 'identity-name',
      content_id: CONTENT_A,
      storage: buildStoragePointer('local', STORAGE_HASH_A),
      bytes: 100,
    },
  ];
}

function makePack() {
  return buildPackManifest(SUBJECT, makeFieldRefs(), { now: ISSUED });
}

function makeScope(packHash: string): ScopeEntry[] {
  return [{ type: 'pack', ref: packHash }];
}

function makeConsent(scope: ScopeEntry[], opts: Record<string, unknown> = {}) {
  return buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', scope, ['read'], CONSENT_EXPIRY, {
    now: ISSUED, ...opts,
  });
}

beforeEach(() => {
  resetRevocationRegistry();
  resetNonceRegistry();
  resetAccessLedger();
});

// ---------------------------------------------------------------------------
// Temporal Enforcement
// ---------------------------------------------------------------------------

describe('VaultV2 — temporal enforcement', () => {
  it('grants access within valid temporal window', () => {
    const vault = createInMemoryVault();
    const pack = makePack();
    vault.storePack(pack);

    const scope = makeScope(pack.pack_hash);
    const consent = makeConsent(scope);
    vault.storeConsentV2(consent);

    const token = vault.mintCapabilityV2(consent.consent_hash, scope, ['read'], TOKEN_EXPIRY, {
      now: ISSUED,
    });

    const result = vault.requestAccessV2(
      { capability_token: token, sdl_paths: [], pack_ref: pack.pack_hash },
      { now: EVAL_TIME }
    );

    expect(result.policy.decision).toBe('ALLOW');
  });

  it('denies access after token expiry and logs EXPIRED event', () => {
    const vault = createInMemoryVault();
    const pack = makePack();
    vault.storePack(pack);

    const scope = makeScope(pack.pack_hash);
    const consent = makeConsent(scope);
    vault.storeConsentV2(consent);

    const shortExpiry = '2025-03-01T00:00:00Z';
    const token = vault.mintCapabilityV2(consent.consent_hash, scope, ['read'], shortExpiry, {
      now: ISSUED,
    });

    // Evaluate after expiry
    const afterExpiry = new Date('2025-06-01T00:00:00Z');
    const result = vault.requestAccessV2(
      { capability_token: token, sdl_paths: [], pack_ref: pack.pack_hash },
      { now: afterExpiry }
    );

    expect(result.policy.decision).toBe('DENY');
    expect(result.policy.reason_codes).toContain('EXPIRED');

    const ledger = vault.getLedger();
    const expiredEntries = ledger.filter(e => e.event_type === 'EXPIRED');
    expect(expiredEntries.length).toBe(1);
    expect(expiredEntries[0].capability_hash).toBe(token.capability_hash);
  });

  it('denies access before access_start_timestamp', () => {
    const vault = createInMemoryVault();
    const pack = makePack();
    vault.storePack(pack);

    const scope = makeScope(pack.pack_hash);
    const accessStart = '2025-06-01T00:00:00Z';
    const consent = makeConsent(scope, { access_start_timestamp: accessStart });
    vault.storeConsentV2(consent);

    const token = vault.mintCapabilityV2(
      consent.consent_hash, scope, ['read'], TOKEN_EXPIRY,
      { now: new Date(accessStart) }  // issued exactly at window open
    );

    // Try access before window opens
    const beforeWindow = new Date('2025-02-01T00:00:00Z');
    const result = vault.requestAccessV2(
      { capability_token: token, sdl_paths: [], pack_ref: pack.pack_hash },
      { now: beforeWindow }
    );

    expect(result.policy.decision).toBe('DENY');
    expect(result.policy.reason_codes).toContain('ACCESS_WINDOW_NOT_OPEN');
  });

  it('logs ACCESS_GRANTED on successful access', () => {
    const vault = createInMemoryVault();
    const pack = makePack();
    vault.storePack(pack);

    const scope = makeScope(pack.pack_hash);
    const consent = makeConsent(scope);
    vault.storeConsentV2(consent);

    const token = vault.mintCapabilityV2(consent.consent_hash, scope, ['read'], TOKEN_EXPIRY, {
      now: ISSUED,
    });

    vault.requestAccessV2(
      { capability_token: token, sdl_paths: [], pack_ref: pack.pack_hash },
      { now: EVAL_TIME }
    );

    const ledger = vault.getLedger();
    const grantedEntries = ledger.filter(e => e.event_type === 'ACCESS_GRANTED');
    expect(grantedEntries.length).toBe(1);
    expect(grantedEntries[0].subject).toBe(SUBJECT);
    expect(grantedEntries[0].grantee).toBe(GRANTEE);
  });

  it('denies access when consent is revoked before expiry and logs REVOKED entries', () => {
    const vault = createInMemoryVault();
    const pack = makePack();
    vault.storePack(pack);

    const scope = makeScope(pack.pack_hash);
    const consent = makeConsent(scope);
    vault.storeConsentV2(consent);

    const token = vault.mintCapabilityV2(consent.consent_hash, scope, ['read'], TOKEN_EXPIRY, {
      now: ISSUED,
    });

    // Revoke before expiry
    vault.revokeConsentV2(consent.consent_hash, { now: EVAL_TIME });

    const ledger = vault.getLedger();
    const revokedEntries = ledger.filter(e => e.event_type === 'REVOKED');
    expect(revokedEntries.length).toBe(1);
    expect(revokedEntries[0].capability_hash).toBe(token.capability_hash);

    // Subsequent access attempt should fail
    resetNonceRegistry();
    const token2 = vault.mintCapabilityV2(consent.consent_hash, scope, ['read'], TOKEN_EXPIRY, {
      now: ISSUED,
    });

    const result = vault.requestAccessV2(
      { capability_token: token2, sdl_paths: [], pack_ref: pack.pack_hash },
      { now: EVAL_TIME }
    );

    expect(result.policy.decision).toBe('DENY');
    expect(result.policy.reason_codes).toContain('REVOKED');
  });
});

// ---------------------------------------------------------------------------
// Institutional Affiliation Access
// ---------------------------------------------------------------------------

describe('VaultV2 — Institutional Affiliation Access', () => {
  const makeAffiliationConsent = (
    scope: ScopeEntry[],
    autoExpires = true
  ) => {
    const affiliation: AffiliationBinding = {
      institution_did: INSTITUTION_DID,
      affiliation_type: 'membership',
      affiliation_credential_ref: VC_REF,
      auto_expires_on_affiliation_change: autoExpires,
    };
    return makeConsent(scope, {
      consent_mode: 'institutional-affiliation',
      affiliation,
    });
  };

  it('revokes affiliation consents when VC is invalidated', () => {
    const vault = createInMemoryVault();
    const pack = makePack();
    vault.storePack(pack);

    const scope = makeScope(pack.pack_hash);
    const consent = makeAffiliationConsent(scope, true);
    vault.storeConsentV2(consent);

    const revoked = vault.revokeByAffiliation(VC_REF, { now: EVAL_TIME });
    expect(revoked).toContain(consent.consent_hash);

    // Log check
    const ledger = vault.getLedger();
    const affRevokedEntries = ledger.filter(e => e.event_type === 'AFFILIATION_REVOKED');
    expect(affRevokedEntries.length).toBe(1);
    expect(affRevokedEntries[0].consent_hash).toBe(consent.consent_hash);
  });

  it('does not revoke when auto_expires_on_affiliation_change=false', () => {
    const vault = createInMemoryVault();
    const pack = makePack();
    vault.storePack(pack);

    const scope = makeScope(pack.pack_hash);
    const consent = makeAffiliationConsent(scope, false);
    vault.storeConsentV2(consent);

    const revoked = vault.revokeByAffiliation(VC_REF, { now: EVAL_TIME });
    expect(revoked).not.toContain(consent.consent_hash);
  });

  it('standard consents are not affected by affiliation revocation', () => {
    const vault = createInMemoryVault();
    const pack = makePack();
    vault.storePack(pack);

    const scope = makeScope(pack.pack_hash);
    const standardConsent = makeConsent(scope); // standard mode
    vault.storeConsentV2(standardConsent);

    const revoked = vault.revokeByAffiliation(VC_REF, { now: EVAL_TIME });
    expect(revoked).not.toContain(standardConsent.consent_hash);
  });
});

// ---------------------------------------------------------------------------
// Renewal Mechanism
// ---------------------------------------------------------------------------

describe('VaultV2 — Renewal Mechanism', () => {
  const CONTENT_SCOPE: ScopeEntry[] = [
    { type: 'content', ref: CONTENT_A },
  ];

  it('returns PENDING_SUBJECT_SIGNATURE when requires_user_signature=true and no sig provided', () => {
    const vault = createInMemoryVault();
    const consent = makeConsent(CONTENT_SCOPE, { renewable: true, max_renewals: 5 });
    vault.storeConsentV2(consent);

    const { response } = vault.processRenewal({
      prior_consent_hash: consent.consent_hash,
      requesting_grantee: GRANTEE,
      proposed_expiration: '2027-01-01T00:00:00Z',
      requires_user_signature: true,
      renewal_signature: null,
      requested_at: '2025-11-01T00:00:00Z',
      renewal_reason: 'Annual renewal',
    }, { now: EVAL_TIME });

    expect(response.status).toBe('PENDING_SUBJECT_SIGNATURE');
    expect(response.signature_request_id).not.toBeNull();
    expect(response.signature_request_id!.length).toBe(64);
  });

  it('approves renewal when auto_renewal=true', () => {
    const vault = createInMemoryVault();
    const consent = makeConsent(CONTENT_SCOPE, { renewable: true });
    vault.storeConsentV2(consent);

    const { response, new_consent } = vault.processRenewal({
      prior_consent_hash: consent.consent_hash,
      requesting_grantee: GRANTEE,
      proposed_expiration: '2027-01-01T00:00:00Z',
      requires_user_signature: false,
      renewal_signature: null,
      requested_at: '2025-11-01T00:00:00Z',
      renewal_reason: null,
    }, { now: EVAL_TIME, auto_renewal: true });

    expect(response.status).toBe('APPROVED');
    expect(response.new_consent_hash).not.toBeNull();
    expect(new_consent).not.toBeNull();
    expect(new_consent!.renewal_count).toBe(1);
    expect(new_consent!.prior_consent).toBe(consent.consent_hash);
    expect(new_consent!.access_expiration_timestamp).toBe('2027-01-01T00:00:00Z');
    // New window starts exactly where old window ended
    expect(new_consent!.access_start_timestamp).toBe(consent.access_expiration_timestamp);
  });

  it('approves renewal when renewal_signature is provided (manual)', () => {
    const vault = createInMemoryVault();
    const consent = makeConsent(CONTENT_SCOPE, { renewable: true });
    vault.storeConsentV2(consent);

    const { response, new_consent } = vault.processRenewal({
      prior_consent_hash: consent.consent_hash,
      requesting_grantee: GRANTEE,
      proposed_expiration: '2027-01-01T00:00:00Z',
      requires_user_signature: true,
      renewal_signature: 'mock-subject-signature-1234567890abcdef',  // signature present
      requested_at: '2025-11-01T00:00:00Z',
      renewal_reason: null,
    }, { now: EVAL_TIME });

    expect(response.status).toBe('APPROVED');
    expect(new_consent!.renewal_count).toBe(1);
  });

  it('denies renewal when consent is not renewable', () => {
    const vault = createInMemoryVault();
    const consent = makeConsent(CONTENT_SCOPE, { renewable: false });
    vault.storeConsentV2(consent);

    const { response } = vault.processRenewal({
      prior_consent_hash: consent.consent_hash,
      requesting_grantee: GRANTEE,
      proposed_expiration: '2027-01-01T00:00:00Z',
      requires_user_signature: false,
      renewal_signature: null,
      requested_at: '2025-11-01T00:00:00Z',
      renewal_reason: null,
    }, { now: EVAL_TIME, auto_renewal: true });

    expect(response.status).toBe('DENIED');
    expect(response.denial_reason).toContain('not renewable');
  });

  it('denies renewal when max_renewals is exhausted', () => {
    const vault = createInMemoryVault();
    const consent = buildConsentObjectV2(SUBJECT, GRANTEE, 'grant', CONTENT_SCOPE, ['read'], CONSENT_EXPIRY, {
      now: ISSUED, renewable: true, max_renewals: 2, renewal_count: 2,
    });
    vault.storeConsentV2(consent);

    const { response } = vault.processRenewal({
      prior_consent_hash: consent.consent_hash,
      requesting_grantee: GRANTEE,
      proposed_expiration: '2027-01-01T00:00:00Z',
      requires_user_signature: false,
      renewal_signature: null,
      requested_at: '2025-11-01T00:00:00Z',
      renewal_reason: null,
    }, { now: EVAL_TIME, auto_renewal: true });

    expect(response.status).toBe('DENIED');
    expect(response.denial_reason).toContain('max_renewals');
  });

  it('denies renewal when proposed_expiration is not after current expiry', () => {
    const vault = createInMemoryVault();
    const consent = makeConsent(CONTENT_SCOPE, { renewable: true });
    vault.storeConsentV2(consent);

    const { response } = vault.processRenewal({
      prior_consent_hash: consent.consent_hash,
      requesting_grantee: GRANTEE,
      proposed_expiration: '2025-06-01T00:00:00Z', // before current expiry
      requires_user_signature: false,
      renewal_signature: null,
      requested_at: '2025-11-01T00:00:00Z',
      renewal_reason: null,
    }, { now: EVAL_TIME, auto_renewal: true });

    expect(response.status).toBe('DENIED');
    expect(response.denial_reason).toContain('proposed_expiration');
  });

  it('denies renewal when requesting_grantee does not match', () => {
    const vault = createInMemoryVault();
    const consent = makeConsent(CONTENT_SCOPE, { renewable: true });
    vault.storeConsentV2(consent);

    const { response } = vault.processRenewal({
      prior_consent_hash: consent.consent_hash,
      requesting_grantee: 'did:key:z6MkWRONGDID0000000000000000000000000000000000000',
      proposed_expiration: '2027-01-01T00:00:00Z',
      requires_user_signature: false,
      renewal_signature: null,
      requested_at: '2025-11-01T00:00:00Z',
      renewal_reason: null,
    }, { now: EVAL_TIME, auto_renewal: true });

    expect(response.status).toBe('DENIED');
    expect(response.denial_reason).toContain('grantee');
  });

  it('logs RENEWED event to Access Ledger on successful renewal', () => {
    const vault = createInMemoryVault();
    const consent = makeConsent(CONTENT_SCOPE, { renewable: true });
    vault.storeConsentV2(consent);

    vault.processRenewal({
      prior_consent_hash: consent.consent_hash,
      requesting_grantee: GRANTEE,
      proposed_expiration: '2027-01-01T00:00:00Z',
      requires_user_signature: false,
      renewal_signature: null,
      requested_at: '2025-11-01T00:00:00Z',
      renewal_reason: null,
    }, { now: EVAL_TIME, auto_renewal: true });

    const ledger = vault.getLedger();
    const renewedEntries = ledger.filter(e => e.event_type === 'RENEWED');
    expect(renewedEntries.length).toBe(1);
    expect(renewedEntries[0].metadata?.prior_consent_hash).toBe(consent.consent_hash);
    expect(renewedEntries[0].metadata?.renewal_count).toBe('1');
  });

  it('new consent is stored and accessible after renewal', () => {
    const vault = createInMemoryVault();
    const consent = makeConsent(CONTENT_SCOPE, { renewable: true });
    vault.storeConsentV2(consent);

    const { response } = vault.processRenewal({
      prior_consent_hash: consent.consent_hash,
      requesting_grantee: GRANTEE,
      proposed_expiration: '2027-01-01T00:00:00Z',
      requires_user_signature: false,
      renewal_signature: null,
      requested_at: '2025-11-01T00:00:00Z',
      renewal_reason: null,
    }, { now: EVAL_TIME, auto_renewal: true });

    expect(response.status).toBe('APPROVED');
    // The renewed consent should be in the vault store
    const store = vault.getStore();
    expect(store.consents_v2.has(response.new_consent_hash!)).toBe(true);
  });
});
