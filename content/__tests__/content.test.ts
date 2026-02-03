import { buildContentId } from '../contentId';
import { buildContentManifest } from '../contentManifest';
import { StoragePointer } from '../../storage/types';

const baseStorage = (): StoragePointer => ({
  backend: 'local',
  hash: 'a'.repeat(64),
  uri: `aoc://storage/local/0x${'a'.repeat(64)}`
});

describe('content manifest', () => {

  it('produces deterministic content hashes for identical inputs', () => {
    const manifestA = buildContentManifest(
      'subject',
      'text/plain',
      baseStorage(),
      128,
      { now: new Date('2024-01-01T00:00:00Z') }
    );
    const manifestB = buildContentManifest(
      'subject',
      'text/plain',
      baseStorage(),
      128,
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    expect(manifestA.content_hash).toBe(manifestB.content_hash);
  });

  it('changes content hash when inputs change', () => {
    const base = buildContentManifest(
      'subject',
      'text/plain',
      baseStorage(),
      128,
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    const bytesChanged = buildContentManifest(
      'subject',
      'text/plain',
      baseStorage(),
      256,
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    const typeChanged = buildContentManifest(
      'subject',
      'application/json',
      baseStorage(),
      128,
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    const storageChanged = buildContentManifest(
      'subject',
      'text/plain',
      {
        backend: 'local',
        hash: 'b'.repeat(64),
        uri: `aoc://storage/local/0x${'b'.repeat(64)}`
      },
      128,
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    expect(base.content_hash).not.toBe(bytesChanged.content_hash);
    expect(base.content_hash).not.toBe(typeChanged.content_hash);
    expect(base.content_hash).not.toBe(storageChanged.content_hash);
  });

  it('rejects invalid inputs', () => {
    expect(() =>
      buildContentManifest('', 'text/plain', baseStorage(), 128)
    ).toThrow('Content subject must be non-empty.');

    expect(() =>
      buildContentManifest('subject', '', baseStorage(), 128)
    ).toThrow('Content content_type must be non-empty.');

    expect(() =>
      buildContentManifest('subject', 'text/plain', {
        backend: 'local',
        hash: 'INVALID',
        uri: 'aoc://storage/local/0xINVALID'
      }, 128)
    ).toThrow('Content storage hash must be 64 lowercase hex characters.');

    expect(() =>
      buildContentManifest('subject', 'text/plain', baseStorage(), 0)
    ).toThrow('Content bytes must be a positive integer.');
  });

  it('rejects mismatched storage uri', () => {
    const storage = baseStorage();
    storage.uri = `aoc://storage/${storage.backend}/0x${'b'.repeat(64)}`;

    expect(() =>
      buildContentManifest('subject', 'text/plain', storage, 128)
    ).toThrow('Content storage uri must match backend and hash.');
  });
});

describe('content id', () => {
  it('builds a valid content id', () => {
    const manifest = buildContentManifest(
      'subject',
      'text/plain',
      {
        backend: 'local',
        hash: 'a'.repeat(64),
        uri: `aoc://storage/local/0x${'a'.repeat(64)}`
      },
      128,
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    const contentId = buildContentId(manifest);
    expect(contentId).toMatch(/^aoc:\/\/content\/blob\/v1\/0\/0x[0-9a-f]{64}$/);
  });

  it('rejects invalid content hash', () => {
    const manifest = buildContentManifest(
      'subject',
      'text/plain',
      baseStorage(),
      128,
      { now: new Date('2024-01-01T00:00:00Z') }
    );
    manifest.content_hash = 'INVALID';

    expect(() => buildContentId(manifest)).toThrow(
      'Content hash must be 64 lowercase hex characters.'
    );
  });
});
