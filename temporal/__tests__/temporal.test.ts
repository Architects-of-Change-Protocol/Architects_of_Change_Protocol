import { computeAccessScopeHash, verifyAccessScopeHash } from '../scopeHash';
import type { ScopeEntry } from '../../consent/types';

const HASH_HEX_PATTERN = /^[a-f0-9]{64}$/;

const SCOPE_A: ScopeEntry[] = [
  { type: 'content', ref: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
  { type: 'pack',    ref: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
];

describe('computeAccessScopeHash', () => {
  it('produces a 64-character lowercase hex string', () => {
    const hash = computeAccessScopeHash({
      scope: SCOPE_A,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    expect(HASH_HEX_PATTERN.test(hash)).toBe(true);
  });

  it('is deterministic: same inputs produce same output', () => {
    const h1 = computeAccessScopeHash({
      scope: SCOPE_A,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    const h2 = computeAccessScopeHash({
      scope: [...SCOPE_A],
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    expect(h1).toBe(h2);
  });

  it('is order-independent: scope sorted before hashing', () => {
    const reversed: ScopeEntry[] = [...SCOPE_A].reverse();
    const h1 = computeAccessScopeHash({
      scope: SCOPE_A,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    const h2 = computeAccessScopeHash({
      scope: reversed,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    expect(h1).toBe(h2);
  });

  it('changes when access_start_timestamp changes', () => {
    const h1 = computeAccessScopeHash({
      scope: SCOPE_A,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    const h2 = computeAccessScopeHash({
      scope: SCOPE_A,
      access_start_timestamp: '2025-06-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    expect(h1).not.toBe(h2);
  });

  it('changes when access_expiration_timestamp changes', () => {
    const h1 = computeAccessScopeHash({
      scope: SCOPE_A,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    const h2 = computeAccessScopeHash({
      scope: SCOPE_A,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2027-01-01T00:00:00Z',
    });
    expect(h1).not.toBe(h2);
  });

  it('changes when scope changes', () => {
    const modified: ScopeEntry[] = [
      { type: 'field', ref: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc' },
    ];
    const h1 = computeAccessScopeHash({
      scope: SCOPE_A,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    const h2 = computeAccessScopeHash({
      scope: modified,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    expect(h1).not.toBe(h2);
  });
});

describe('verifyAccessScopeHash', () => {
  it('passes when hash matches recomputed value', () => {
    const hash = computeAccessScopeHash({
      scope: SCOPE_A,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    expect(() =>
      verifyAccessScopeHash(hash, {
        scope: SCOPE_A,
        access_start_timestamp: '2025-01-01T00:00:00Z',
        access_expiration_timestamp: '2026-01-01T00:00:00Z',
      })
    ).not.toThrow();
  });

  it('throws when scope has been tampered with', () => {
    const hash = computeAccessScopeHash({
      scope: SCOPE_A,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    const tampered: ScopeEntry[] = [
      { type: 'field', ref: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc' },
    ];
    expect(() =>
      verifyAccessScopeHash(hash, {
        scope: tampered,
        access_start_timestamp: '2025-01-01T00:00:00Z',
        access_expiration_timestamp: '2026-01-01T00:00:00Z',
      })
    ).toThrow('access_scope_hash does not match');
  });

  it('throws when expiration has been tampered with', () => {
    const hash = computeAccessScopeHash({
      scope: SCOPE_A,
      access_start_timestamp: '2025-01-01T00:00:00Z',
      access_expiration_timestamp: '2026-01-01T00:00:00Z',
    });
    expect(() =>
      verifyAccessScopeHash(hash, {
        scope: SCOPE_A,
        access_start_timestamp: '2025-01-01T00:00:00Z',
        access_expiration_timestamp: '2099-01-01T00:00:00Z', // tampered
      })
    ).toThrow('access_scope_hash does not match');
  });
});
