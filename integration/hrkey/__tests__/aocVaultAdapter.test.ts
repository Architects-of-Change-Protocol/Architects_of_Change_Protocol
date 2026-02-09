/**
 * HRKey ↔ AOC Vault Adapter — Integration Tests
 *
 * These tests exercise the adapter against a real in-memory Vault.
 * They verify that HRKey's domain operations translate correctly
 * into AOC Vault operations and that AOC invariants hold.
 *
 * Reference flow (test #1):
 *   1. Candidate registers a data pack (professional references).
 *   2. Candidate grants consent to an employer.
 *   3. HRKey mints an attenuated capability (read-only, time-limited).
 *   4. Employer requests access to specific SDL paths.
 *   5. Vault returns ALLOW with resolved fields.
 */

import { createHRKeyAdapter } from '../aocVaultAdapter';
import type { IHRKeyVaultAdapter } from '../types';
import { buildPackManifest } from '../../../pack';
import { buildStoragePointer } from '../../../storage';
import { resetNonceRegistry, resetRevocationRegistry } from '../../../capability';

// ─── Constants ──────────────────────────────────────────────────────

const CANDIDATE = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const EMPLOYER  = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';

const CONTENT_REFSCORE = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const CONTENT_JOBTITLE = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const CONTENT_TENURE   = 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';

const STORAGE_A = '1111111111111111111111111111111111111111111111111111111111111111';
const STORAGE_B = '2222222222222222222222222222222222222222222222222222222222222222';
const STORAGE_C = '3333333333333333333333333333333333333333333333333333333333333333';

const T_CONSENT = new Date('2025-01-15T14:30:00Z');
const T_MINT    = new Date('2025-06-15T10:00:00Z');
const T_ACCESS  = new Date('2025-08-01T00:00:00Z');
const CONSENT_EXPIRES = '2026-01-15T14:30:00Z';
const TOKEN_EXPIRES   = '2025-12-31T23:59:59Z';

// ─── Helpers ────────────────────────────────────────────────────────

function makeCandidatePack() {
  return buildPackManifest(CANDIDATE, [
    {
      field_id: 'reference-score',
      content_id: CONTENT_REFSCORE,
      storage: buildStoragePointer('local', STORAGE_A),
      bytes: 64,
    },
    {
      field_id: 'job-title',
      content_id: CONTENT_JOBTITLE,
      storage: buildStoragePointer('local', STORAGE_B),
      bytes: 128,
    },
    {
      field_id: 'tenure-months',
      content_id: CONTENT_TENURE,
      storage: buildStoragePointer('local', STORAGE_C),
      bytes: 16,
    },
  ], { now: T_CONSENT });
}

const SDL_MAPPINGS = [
  { sdl_path: 'work.reference.score',    field_id: 'reference-score' },
  { sdl_path: 'work.position.title',     field_id: 'job-title' },
  { sdl_path: 'work.tenure.months',      field_id: 'tenure-months' },
];

const FULL_SCOPE = [
  { type: 'content' as const, ref: CONTENT_REFSCORE },
  { type: 'content' as const, ref: CONTENT_JOBTITLE },
  { type: 'content' as const, ref: CONTENT_TENURE },
];

// ─── Reset global registries between tests ──────────────────────────

beforeEach(() => {
  resetNonceRegistry();
  resetRevocationRegistry();
});

// ════════════════════════════════════════════════════════════════════
// 1. REFERENCE FLOW: Full happy path
// ════════════════════════════════════════════════════════════════════

describe('HRKey reference flow: candidate → consent → capability → access', () => {
  it('completes the full flow with ALLOW', () => {
    const adapter = createHRKeyAdapter();

    // Step 1: Candidate registers their professional reference pack.
    const pack = makeCandidatePack();
    const packResult = adapter.registerPack({
      pack,
      sdl_mappings: SDL_MAPPINGS,
    });
    expect(packResult.pack_hash).toBe(pack.pack_hash);
    expect(packResult.sdl_paths_registered).toBe(3);

    // Step 2: Candidate grants consent to the employer.
    const consentResult = adapter.grantConsent({
      candidate: CANDIDATE,
      employer: EMPLOYER,
      scope: FULL_SCOPE,
      permissions: ['read'],
      expires_at: CONSENT_EXPIRES,
    }, { now: T_CONSENT });
    expect(consentResult.consent_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(consentResult.consent.subject).toBe(CANDIDATE);
    expect(consentResult.consent.grantee).toBe(EMPLOYER);
    expect(consentResult.consent.action).toBe('grant');

    // Step 3: HRKey mints a limited capability (read-only, subset could be used).
    const capResult = adapter.mintCapability({
      consent_hash: consentResult.consent_hash,
      scope: FULL_SCOPE,
      permissions: ['read'],
      expires_at: TOKEN_EXPIRES,
    }, { now: T_MINT });
    expect(capResult.capability_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(capResult.capability.consent_ref).toBe(consentResult.consent_hash);

    // Step 4: Employer requests access to specific SDL paths.
    const accessResult = adapter.requestAccess({
      capability: capResult.capability,
      sdl_paths: ['work.reference.score', 'work.position.title'],
      pack_hash: packResult.pack_hash,
    }, { now: T_ACCESS });

    // Step 5: Vault returns ALLOW with resolved fields.
    expect(accessResult.policy.decision).toBe('ALLOW');
    expect(accessResult.policy.reason_codes).toEqual([]);
    expect(accessResult.resolved_fields).toHaveLength(2);
    expect(accessResult.unresolved_fields).toHaveLength(0);

    // Verify deterministic ordering (sorted by sdl_path).
    expect(accessResult.resolved_fields[0].sdl_path).toBe('work.position.title');
    expect(accessResult.resolved_fields[0].field_id).toBe('job-title');
    expect(accessResult.resolved_fields[0].content_id).toBe(CONTENT_JOBTITLE);

    expect(accessResult.resolved_fields[1].sdl_path).toBe('work.reference.score');
    expect(accessResult.resolved_fields[1].field_id).toBe('reference-score');
    expect(accessResult.resolved_fields[1].content_id).toBe(CONTENT_REFSCORE);
  });
});

// ════════════════════════════════════════════════════════════════════
// 2. ATTENUATED SCOPE: employer only gets what consent allows
// ════════════════════════════════════════════════════════════════════

describe('HRKey attenuated capability: scope containment enforced', () => {
  it('DENY when employer requests fields outside attenuated scope', () => {
    const adapter = createHRKeyAdapter();
    const pack = makeCandidatePack();

    adapter.registerPack({ pack, sdl_mappings: SDL_MAPPINGS });

    // Consent covers only reference-score (CONTENT_REFSCORE).
    const limitedScope = [{ type: 'content' as const, ref: CONTENT_REFSCORE }];

    const consentResult = adapter.grantConsent({
      candidate: CANDIDATE,
      employer: EMPLOYER,
      scope: limitedScope,
      permissions: ['read'],
      expires_at: CONSENT_EXPIRES,
    }, { now: T_CONSENT });

    const capResult = adapter.mintCapability({
      consent_hash: consentResult.consent_hash,
      scope: limitedScope,
      permissions: ['read'],
      expires_at: TOKEN_EXPIRES,
    }, { now: T_MINT });

    // Employer tries to access job-title (outside scope).
    const result = adapter.requestAccess({
      capability: capResult.capability,
      sdl_paths: ['work.position.title'],
      pack_hash: pack.pack_hash,
    }, { now: T_ACCESS });

    expect(result.policy.decision).toBe('DENY');
    expect(result.policy.reason_codes).toContain('SCOPE_ESCALATION');
  });
});

// ════════════════════════════════════════════════════════════════════
// 3. EXPIRY: expired capability → DENY
// ════════════════════════════════════════════════════════════════════

describe('HRKey capability expiry enforcement', () => {
  it('DENY when capability token has expired', () => {
    const adapter = createHRKeyAdapter();
    const pack = makeCandidatePack();

    adapter.registerPack({ pack, sdl_mappings: SDL_MAPPINGS });

    const consentResult = adapter.grantConsent({
      candidate: CANDIDATE,
      employer: EMPLOYER,
      scope: FULL_SCOPE,
      permissions: ['read'],
      expires_at: CONSENT_EXPIRES,
    }, { now: T_CONSENT });

    const shortExpiry = '2025-07-01T00:00:00Z';
    const capResult = adapter.mintCapability({
      consent_hash: consentResult.consent_hash,
      scope: FULL_SCOPE,
      permissions: ['read'],
      expires_at: shortExpiry,
    }, { now: T_MINT });

    // Access AFTER expiry.
    const result = adapter.requestAccess({
      capability: capResult.capability,
      sdl_paths: ['work.reference.score'],
      pack_hash: pack.pack_hash,
    }, { now: new Date('2025-08-01T00:00:00Z') });

    expect(result.policy.decision).toBe('DENY');
    expect(result.policy.reason_codes).toContain('EXPIRED');
  });
});

// ════════════════════════════════════════════════════════════════════
// 4. REVOCATION: revoked capability → DENY
// ════════════════════════════════════════════════════════════════════

describe('HRKey capability revocation', () => {
  it('DENY after capability is revoked', () => {
    const adapter = createHRKeyAdapter();
    const pack = makeCandidatePack();

    adapter.registerPack({ pack, sdl_mappings: SDL_MAPPINGS });

    const consentResult = adapter.grantConsent({
      candidate: CANDIDATE,
      employer: EMPLOYER,
      scope: FULL_SCOPE,
      permissions: ['read'],
      expires_at: CONSENT_EXPIRES,
    }, { now: T_CONSENT });

    const capResult = adapter.mintCapability({
      consent_hash: consentResult.consent_hash,
      scope: FULL_SCOPE,
      permissions: ['read'],
      expires_at: TOKEN_EXPIRES,
    }, { now: T_MINT });

    // Revoke.
    adapter.revokeCapability(capResult.capability_hash);

    // Access after revocation.
    const result = adapter.requestAccess({
      capability: capResult.capability,
      sdl_paths: ['work.reference.score'],
      pack_hash: pack.pack_hash,
    }, { now: T_ACCESS });

    expect(result.policy.decision).toBe('DENY');
    expect(result.policy.reason_codes).toContain('REVOKED');
  });
});

// ════════════════════════════════════════════════════════════════════
// 5. REPLAY: same token used twice → DENY
// ════════════════════════════════════════════════════════════════════

describe('HRKey replay protection', () => {
  it('DENY on second presentation of the same token', () => {
    const adapter = createHRKeyAdapter();
    const pack = makeCandidatePack();

    adapter.registerPack({ pack, sdl_mappings: SDL_MAPPINGS });

    const consentResult = adapter.grantConsent({
      candidate: CANDIDATE,
      employer: EMPLOYER,
      scope: FULL_SCOPE,
      permissions: ['read'],
      expires_at: CONSENT_EXPIRES,
    }, { now: T_CONSENT });

    const capResult = adapter.mintCapability({
      consent_hash: consentResult.consent_hash,
      scope: FULL_SCOPE,
      permissions: ['read'],
      expires_at: TOKEN_EXPIRES,
    }, { now: T_MINT });

    // First access — ALLOW.
    const r1 = adapter.requestAccess({
      capability: capResult.capability,
      sdl_paths: ['work.reference.score'],
      pack_hash: pack.pack_hash,
    }, { now: T_ACCESS });
    expect(r1.policy.decision).toBe('ALLOW');

    // Second access with same token — DENY (replay).
    const r2 = adapter.requestAccess({
      capability: capResult.capability,
      sdl_paths: ['work.reference.score'],
      pack_hash: pack.pack_hash,
    }, { now: new Date('2025-08-01T00:00:01Z') });
    expect(r2.policy.decision).toBe('DENY');
    expect(r2.policy.reason_codes).toContain('REPLAY');
  });
});

// ════════════════════════════════════════════════════════════════════
// 6. MIXED RESOLUTION: some paths resolve, some don't
// ════════════════════════════════════════════════════════════════════

describe('HRKey partial resolution', () => {
  it('ALLOW with both resolved and unresolved fields', () => {
    const adapter = createHRKeyAdapter();
    const pack = makeCandidatePack();

    adapter.registerPack({ pack, sdl_mappings: SDL_MAPPINGS });

    const consentResult = adapter.grantConsent({
      candidate: CANDIDATE,
      employer: EMPLOYER,
      scope: FULL_SCOPE,
      permissions: ['read'],
      expires_at: CONSENT_EXPIRES,
    }, { now: T_CONSENT });

    const capResult = adapter.mintCapability({
      consent_hash: consentResult.consent_hash,
      scope: FULL_SCOPE,
      permissions: ['read'],
      expires_at: TOKEN_EXPIRES,
    }, { now: T_MINT });

    // Request with one valid + one unmapped path.
    const result = adapter.requestAccess({
      capability: capResult.capability,
      sdl_paths: ['work.reference.score', 'work.skills.primary'],
      pack_hash: pack.pack_hash,
    }, { now: T_ACCESS });

    expect(result.policy.decision).toBe('ALLOW');
    expect(result.resolved_fields).toHaveLength(1);
    expect(result.resolved_fields[0].sdl_path).toBe('work.reference.score');
    expect(result.unresolved_fields).toHaveLength(1);
    expect(result.unresolved_fields[0].sdl_path).toBe('work.skills.primary');
    expect(result.unresolved_fields[0].error.code).toBe('UNRESOLVED_FIELD');
  });
});

// ════════════════════════════════════════════════════════════════════
// 7. ERROR: mint with unknown consent → CONSENT_NOT_FOUND
// ════════════════════════════════════════════════════════════════════

describe('HRKey error: unknown consent', () => {
  it('throws CONSENT_NOT_FOUND when minting with non-existent consent', () => {
    const adapter = createHRKeyAdapter();

    expect(() =>
      adapter.mintCapability({
        consent_hash: 'f'.repeat(64),
        scope: FULL_SCOPE,
        permissions: ['read'],
        expires_at: TOKEN_EXPIRES,
      }, { now: T_MINT }),
    ).toThrow('Consent not found');
  });
});
