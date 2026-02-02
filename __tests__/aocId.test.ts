import { canonicalizeJSON } from '../canonicalize';
import { computeContentHash, buildAOCId } from '../aocId';

describe('canonicalizeJSON', () => {
  it('produces the same canonical string for identical objects', () => {
    const obj = { name: 'Ada', age: 30, tags: ['engineer', 'mathematician'] };
    expect(canonicalizeJSON(obj)).toBe(canonicalizeJSON(obj));
  });

  it('sorts object keys lexicographically', () => {
    const objA = { b: 2, a: 1 };
    const objB = { a: 1, b: 2 };
    expect(canonicalizeJSON(objA)).toBe(canonicalizeJSON(objB));
  });
});

describe('content hash and AOC-ID', () => {
  it('produces the same hash for the same object', () => {
    const obj = { title: 'Record', count: 1, ratio: 1.5 };
    expect(computeContentHash(obj)).toBe(computeContentHash(obj));
  });

  it('builds an AOC-ID in the expected format', () => {
    const obj = { id: 42 };
    const aocId = buildAOCId('employment', 'history', 'v1', '0', obj);
    expect(aocId).toMatch(/^aoc:\/\/employment\/history\/v1\/0\/0x[0-9a-f]{64}$/);
  });

  it('matches the snapshot for a fixed object', () => {
    const obj = {
      person: {
        name: 'Ada Lovelace',
        score: 99.5,
        active: true,
        tags: ['science', 'math']
      },
      createdAt: '2024-01-01T00:00:00Z'
    };

    expect(buildAOCId('identity', 'profile', 'v2', '1', obj)).toMatchSnapshot();
  });
});
