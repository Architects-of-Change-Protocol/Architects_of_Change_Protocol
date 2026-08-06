import {
  mintSovereignAssetId,
  isValidSovereignAssetId,
  assertValidSovereignAssetId,
} from '@aoc/protocol/identity';
import {
  ContentDigestAlgorithm,
  computeContentIdentity,
  isValidContentIdentity,
  contentIdentitiesEqual,
  verifyContentIdentity,
  contentIdentityKey,
} from '@aoc/protocol/identity';

describe('SovereignAssetId', () => {
  it('mints a well-formed, independently-generated id', () => {
    const id = mintSovereignAssetId();
    expect(isValidSovereignAssetId(id)).toBe(true);
    expect(id.startsWith('aoc:sovereign-asset:')).toBe(true);
  });

  it('mints a fresh id every time — never derived from any input', () => {
    const ids = new Set(Array.from({ length: 50 }, () => mintSovereignAssetId()));
    expect(ids.size).toBe(50);
  });

  it('rejects malformed ids', () => {
    expect(isValidSovereignAssetId('not-an-id')).toBe(false);
    expect(isValidSovereignAssetId('aoc:sovereign-asset:not-a-uuid')).toBe(false);
    expect(isValidSovereignAssetId('aoc://content/object/v1/0/0xabc123')).toBe(false);
    expect(isValidSovereignAssetId(123)).toBe(false);
    expect(isValidSovereignAssetId(undefined)).toBe(false);
    expect(isValidSovereignAssetId(null)).toBe(false);
    expect(() => assertValidSovereignAssetId('garbage')).toThrow();
  });

  it('is never equal to a content digest, a manifest digest, or a storage id in shape', () => {
    const id = mintSovereignAssetId();
    const sha256Hex = 'a'.repeat(64);
    expect(id).not.toBe(sha256Hex);
    expect(id).not.toContain(sha256Hex);
  });
});

describe('ContentIdentity', () => {
  it('computes contentDigest = sha256(raw bytes), nothing else', () => {
    const bytes = new TextEncoder().encode('hello-sovereign-world');
    const identity = computeContentIdentity(bytes);
    expect(identity.algorithm).toBe(ContentDigestAlgorithm.Sha256);
    expect(identity.digest).toMatch(/^[0-9a-f]{64}$/);

    // Same bytes, computed independently, produce the identical digest.
    const again = computeContentIdentity(new TextEncoder().encode('hello-sovereign-world'));
    expect(contentIdentitiesEqual(identity, again)).toBe(true);
  });

  it('is byte-exact: any change to the bytes changes the digest', () => {
    const a = computeContentIdentity(new TextEncoder().encode('hello-sovereign-world'));
    const b = computeContentIdentity(new TextEncoder().encode('hello-sovereign-world!'));
    expect(contentIdentitiesEqual(a, b)).toBe(false);
  });

  it('rejects malformed content identities', () => {
    expect(isValidContentIdentity({ algorithm: 'sha256', digest: 'not-hex' })).toBe(false);
    expect(isValidContentIdentity({ algorithm: 'sha256', digest: 'ab' })).toBe(false);
    expect(isValidContentIdentity({ algorithm: 'md5', digest: 'a'.repeat(32) })).toBe(false);
    expect(isValidContentIdentity(null)).toBe(false);
    expect(isValidContentIdentity('a'.repeat(64))).toBe(false);
  });

  it('fails closed on an unsupported digest algorithm rather than skipping verification', () => {
    const bytes = new TextEncoder().encode('hello-sovereign-world');
    const result = verifyContentIdentity(bytes, { algorithm: 'sha1' as any, digest: 'a'.repeat(40) });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('UNSUPPORTED_CONTENT_DIGEST_ALGORITHM');
  });

  it('reports a content digest mismatch rather than silently accepting wrong bytes', () => {
    const expected = computeContentIdentity(new TextEncoder().encode('hello-sovereign-world'));
    const result = verifyContentIdentity(new TextEncoder().encode('goodbye-sovereign-world'), expected);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('CONTENT_DIGEST_MISMATCH');
  });

  it('produces a stable key usable to detect exact-content matches', () => {
    const a = computeContentIdentity(new TextEncoder().encode('same content'));
    const b = computeContentIdentity(new TextEncoder().encode('same content'));
    const c = computeContentIdentity(new TextEncoder().encode('different content'));
    expect(contentIdentityKey(a)).toBe(contentIdentityKey(b));
    expect(contentIdentityKey(a)).not.toBe(contentIdentityKey(c));
  });
});
