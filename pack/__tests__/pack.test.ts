import { buildPackId } from '../packId';
import { buildPackManifest } from '../packManifest';
import { canonicalizePackManifestPayload } from '../canonical';
import { FieldReference } from '../types';
import { StoragePointer } from '../../storage/types';

const baseStorage = (hash: string = 'a'.repeat(64)): StoragePointer => ({
  backend: 'local',
  hash,
  uri: `aoc://storage/local/0x${hash}`
});

const baseFieldRef = (field_id: string, contentHash: string = 'b'.repeat(64)): FieldReference => ({
  field_id,
  content_id: contentHash,
  storage: baseStorage(),
  bytes: 128
});

describe('pack manifest', () => {
  it('produces deterministic pack hashes for identical inputs', () => {
    const fields = [baseFieldRef('email'), baseFieldRef('name')];
    const manifestA = buildPackManifest('did:aoc:test123', fields, {
      now: new Date('2024-01-01T00:00:00Z')
    });
    const manifestB = buildPackManifest('did:aoc:test123', fields, {
      now: new Date('2024-01-01T00:00:00Z')
    });

    expect(manifestA.pack_hash).toBe(manifestB.pack_hash);
  });

  it('produces identical hashes regardless of field order (determinism)', () => {
    const fieldsAB = [baseFieldRef('alpha'), baseFieldRef('beta')];
    const fieldsBA = [baseFieldRef('beta'), baseFieldRef('alpha')];

    const manifestAB = buildPackManifest('did:aoc:test123', fieldsAB, {
      now: new Date('2024-01-01T00:00:00Z')
    });
    const manifestBA = buildPackManifest('did:aoc:test123', fieldsBA, {
      now: new Date('2024-01-01T00:00:00Z')
    });

    expect(manifestAB.pack_hash).toBe(manifestBA.pack_hash);
  });

  it('changes pack hash when inputs change', () => {
    const fields = [baseFieldRef('email')];
    const base = buildPackManifest('did:aoc:test123', fields, {
      now: new Date('2024-01-01T00:00:00Z')
    });

    const subjectChanged = buildPackManifest('did:aoc:changed', fields, {
      now: new Date('2024-01-01T00:00:00Z')
    });

    const fieldsChanged = buildPackManifest(
      'did:aoc:test123',
      [baseFieldRef('name')],
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    const timestampChanged = buildPackManifest('did:aoc:test123', fields, {
      now: new Date('2024-01-01T01:00:00Z')
    });

    expect(base.pack_hash).not.toBe(subjectChanged.pack_hash);
    expect(base.pack_hash).not.toBe(fieldsChanged.pack_hash);
    expect(base.pack_hash).not.toBe(timestampChanged.pack_hash);
  });

  it('sets version to 1.0', () => {
    const manifest = buildPackManifest('did:aoc:test123', [baseFieldRef('email')], {
      now: new Date('2024-01-01T00:00:00Z')
    });

    expect(manifest.version).toBe('1.0');
  });

  it('sets created_at as Unix timestamp', () => {
    const manifest = buildPackManifest('did:aoc:test123', [baseFieldRef('email')], {
      now: new Date('2024-01-01T00:00:00Z')
    });

    expect(manifest.created_at).toBe(1704067200);
    expect(Number.isInteger(manifest.created_at)).toBe(true);
  });

  it('produces 64 lowercase hex pack_hash', () => {
    const manifest = buildPackManifest('did:aoc:test123', [baseFieldRef('email')], {
      now: new Date('2024-01-01T00:00:00Z')
    });

    expect(manifest.pack_hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('pack manifest validation', () => {
  it('rejects empty subject', () => {
    expect(() =>
      buildPackManifest('', [baseFieldRef('email')], { now: new Date('2024-01-01T00:00:00Z') })
    ).toThrow('Pack subject must be non-empty.');
  });

  it('rejects whitespace-only subject', () => {
    expect(() =>
      buildPackManifest('   ', [baseFieldRef('email')], { now: new Date('2024-01-01T00:00:00Z') })
    ).toThrow('Pack subject must be non-empty.');
  });

  it('rejects empty fields array', () => {
    expect(() =>
      buildPackManifest('did:aoc:test', [], { now: new Date('2024-01-01T00:00:00Z') })
    ).toThrow('Pack fields must be a non-empty array.');
  });

  it('rejects duplicate field_ids', () => {
    const fields = [baseFieldRef('email'), baseFieldRef('email')];
    expect(() =>
      buildPackManifest('did:aoc:test', fields, { now: new Date('2024-01-01T00:00:00Z') })
    ).toThrow('Pack fields contain duplicate field_id: email.');
  });

  it('rejects invalid field_id pattern', () => {
    const fields = [{
      ...baseFieldRef('email'),
      field_id: 'Invalid_Id'
    }];
    expect(() =>
      buildPackManifest('did:aoc:test', fields, { now: new Date('2024-01-01T00:00:00Z') })
    ).toThrow('field_id must match pattern');
  });

  it('rejects field_id starting with digit', () => {
    const fields = [{
      ...baseFieldRef('email'),
      field_id: '1invalid'
    }];
    expect(() =>
      buildPackManifest('did:aoc:test', fields, { now: new Date('2024-01-01T00:00:00Z') })
    ).toThrow('field_id must match pattern');
  });

  it('rejects field_id exceeding 128 characters', () => {
    const fields = [{
      ...baseFieldRef('email'),
      field_id: 'a'.repeat(129)
    }];
    expect(() =>
      buildPackManifest('did:aoc:test', fields, { now: new Date('2024-01-01T00:00:00Z') })
    ).toThrow('field_id must be at most 128 characters');
  });

  it('rejects invalid content_id format', () => {
    const fields = [{
      ...baseFieldRef('email'),
      content_id: 'INVALID'
    }];
    expect(() =>
      buildPackManifest('did:aoc:test', fields, { now: new Date('2024-01-01T00:00:00Z') })
    ).toThrow('content_id must be 64 lowercase hex characters');
  });

  it('rejects non-positive bytes', () => {
    const fields = [{
      ...baseFieldRef('email'),
      bytes: 0
    }];
    expect(() =>
      buildPackManifest('did:aoc:test', fields, { now: new Date('2024-01-01T00:00:00Z') })
    ).toThrow('bytes must be a positive integer');
  });

  it('rejects mismatched storage uri', () => {
    const fields = [{
      ...baseFieldRef('email'),
      storage: {
        backend: 'local',
        hash: 'a'.repeat(64),
        uri: `aoc://storage/local/0x${'b'.repeat(64)}`
      }
    }];
    expect(() =>
      buildPackManifest('did:aoc:test', fields, { now: new Date('2024-01-01T00:00:00Z') })
    ).toThrow('storage uri must match backend and hash');
  });

  it('accepts valid field_id patterns', () => {
    const validIds = ['email', 'full-name', 'medical_record', 'field123', 'a-b-c', 'a_b_c', 'a1-b2_c3'];
    for (const id of validIds) {
      const fields = [baseFieldRef(id)];
      expect(() =>
        buildPackManifest('did:aoc:test', fields, { now: new Date('2024-01-01T00:00:00Z') })
      ).not.toThrow();
    }
  });

  it('accepts field_id at max length (128 chars)', () => {
    const fields = [{
      ...baseFieldRef('email'),
      field_id: 'a'.repeat(128)
    }];
    expect(() =>
      buildPackManifest('did:aoc:test', fields, { now: new Date('2024-01-01T00:00:00Z') })
    ).not.toThrow();
  });
});

describe('canonical encoding', () => {
  it('sorts fields by field_id in canonical form', () => {
    const fields = [baseFieldRef('zebra'), baseFieldRef('alpha'), baseFieldRef('middle')];
    const bytes = canonicalizePackManifestPayload({
      version: '1.0',
      subject: 'did:aoc:test',
      created_at: 1704067200,
      fields
    });
    const json = Buffer.from(bytes).toString();

    // Fields should appear in order: alpha, middle, zebra
    const alphaPos = json.indexOf('"alpha"');
    const middlePos = json.indexOf('"middle"');
    const zebraPos = json.indexOf('"zebra"');

    expect(alphaPos).toBeLessThan(middlePos);
    expect(middlePos).toBeLessThan(zebraPos);
  });

  it('produces canonical JSON with no whitespace', () => {
    const fields = [baseFieldRef('email')];
    const bytes = canonicalizePackManifestPayload({
      version: '1.0',
      subject: 'did:aoc:test',
      created_at: 1704067200,
      fields
    });
    const json = Buffer.from(bytes).toString();

    expect(json).not.toContain(' ');
    expect(json).not.toContain('\n');
    expect(json).not.toContain('\t');
  });

  it('has top-level keys in alphabetical order', () => {
    const fields = [baseFieldRef('email')];
    const bytes = canonicalizePackManifestPayload({
      version: '1.0',
      subject: 'did:aoc:test',
      created_at: 1704067200,
      fields
    });
    const json = Buffer.from(bytes).toString();

    // Order should be: created_at, fields, subject, version
    const createdAtPos = json.indexOf('"created_at"');
    const fieldsPos = json.indexOf('"fields"');
    const subjectPos = json.indexOf('"subject"');
    const versionPos = json.indexOf('"version"');

    expect(createdAtPos).toBeLessThan(fieldsPos);
    expect(fieldsPos).toBeLessThan(subjectPos);
    expect(subjectPos).toBeLessThan(versionPos);
  });

  it('excludes pack_hash from canonical payload', () => {
    const fields = [baseFieldRef('email')];
    const bytes = canonicalizePackManifestPayload({
      version: '1.0',
      subject: 'did:aoc:test',
      created_at: 1704067200,
      fields
    });
    const json = Buffer.from(bytes).toString();

    expect(json).not.toContain('pack_hash');
  });

  it('has field reference keys in alphabetical order', () => {
    const fields = [baseFieldRef('email')];
    const bytes = canonicalizePackManifestPayload({
      version: '1.0',
      subject: 'did:aoc:test',
      created_at: 1704067200,
      fields
    });
    const json = Buffer.from(bytes).toString();

    // Order: bytes, content_id, field_id, storage
    const bytesPos = json.indexOf('"bytes"');
    const contentIdPos = json.indexOf('"content_id"');
    const fieldIdPos = json.indexOf('"field_id"');
    const storagePos = json.indexOf('"storage"');

    expect(bytesPos).toBeLessThan(contentIdPos);
    expect(contentIdPos).toBeLessThan(fieldIdPos);
    expect(fieldIdPos).toBeLessThan(storagePos);
  });

  it('has storage pointer keys in alphabetical order', () => {
    const fields = [baseFieldRef('email')];
    const bytes = canonicalizePackManifestPayload({
      version: '1.0',
      subject: 'did:aoc:test',
      created_at: 1704067200,
      fields
    });
    const json = Buffer.from(bytes).toString();

    // Order: backend, hash, uri
    const backendPos = json.indexOf('"backend"');
    const hashPos = json.indexOf('"hash"');
    const uriPos = json.indexOf('"uri"');

    expect(backendPos).toBeLessThan(hashPos);
    expect(hashPos).toBeLessThan(uriPos);
  });
});

describe('pack id', () => {
  it('builds a valid pack id', () => {
    const manifest = buildPackManifest('did:aoc:test123', [baseFieldRef('email')], {
      now: new Date('2024-01-01T00:00:00Z')
    });

    const packId = buildPackId(manifest);
    expect(packId).toMatch(/^aoc:\/\/pack\/object\/v1\/0\/0x[0-9a-f]{64}$/);
  });

  it('rejects invalid pack hash', () => {
    const manifest = buildPackManifest('did:aoc:test123', [baseFieldRef('email')], {
      now: new Date('2024-01-01T00:00:00Z')
    });
    manifest.pack_hash = 'INVALID';

    expect(() => buildPackId(manifest)).toThrow(
      'Pack hash must be 64 lowercase hex characters.'
    );
  });

  it('rejects empty subject', () => {
    const manifest = buildPackManifest('did:aoc:test123', [baseFieldRef('email')], {
      now: new Date('2024-01-01T00:00:00Z')
    });
    manifest.subject = '';

    expect(() => buildPackId(manifest)).toThrow('Pack subject must be non-empty.');
  });

  it('rejects empty fields', () => {
    const manifest = buildPackManifest('did:aoc:test123', [baseFieldRef('email')], {
      now: new Date('2024-01-01T00:00:00Z')
    });
    manifest.fields = [];

    expect(() => buildPackId(manifest)).toThrow('Pack fields must be a non-empty array.');
  });
});

describe('cross-object consistency', () => {
  it('pack hash is consistent with canonical encoding', () => {
    const fields = [baseFieldRef('email'), baseFieldRef('name')];
    const manifest = buildPackManifest('did:aoc:test123', fields, {
      now: new Date('2024-01-01T00:00:00Z')
    });

    // Manually compute hash from canonical payload
    const { sha256Hex } = require('../../storage/hash');
    const payloadBytes = canonicalizePackManifestPayload({
      version: manifest.version,
      subject: manifest.subject,
      created_at: manifest.created_at,
      fields: manifest.fields
    });
    const expectedHash = sha256Hex(payloadBytes);

    expect(manifest.pack_hash).toBe(expectedHash);
  });

  it('pack id incorporates all manifest fields', () => {
    const fields = [baseFieldRef('email')];
    const manifestA = buildPackManifest('did:aoc:test123', fields, {
      now: new Date('2024-01-01T00:00:00Z')
    });
    const manifestB = buildPackManifest('did:aoc:test456', fields, {
      now: new Date('2024-01-01T00:00:00Z')
    });

    const packIdA = buildPackId(manifestA);
    const packIdB = buildPackId(manifestB);

    // Different subjects should produce different pack IDs
    expect(packIdA).not.toBe(packIdB);
  });
});

describe('multi-field pack examples from spec', () => {
  it('handles single field pack', () => {
    const fields = [{
      field_id: 'profile_photo',
      content_id: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      storage: {
        backend: 's3',
        hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
        uri: 'aoc://storage/s3/0xca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
      },
      bytes: 524288
    }];

    const manifest = buildPackManifest('did:aoc:9kLmNpQrStUvWxYz1234AB', fields, {
      now: new Date('2024-01-31T00:00:00Z')
    });

    expect(manifest.version).toBe('1.0');
    expect(manifest.fields).toHaveLength(1);
    expect(manifest.pack_hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('handles multi-field medical record pack', () => {
    const fields = [
      {
        field_id: 'allergies',
        content_id: 'f7846f55cf23e14eebeab5b4e1550cad5b509e3348fbc4efa3a1413d393cb650',
        storage: {
          backend: 'local',
          hash: '252f10c83610ebca1a059c0bae8255eba2f95be4d1d7bcfa89d7248a82d9f111',
          uri: 'aoc://storage/local/0x252f10c83610ebca1a059c0bae8255eba2f95be4d1d7bcfa89d7248a82d9f111'
        },
        bytes: 1024
      },
      {
        field_id: 'blood_type',
        content_id: 'd2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2',
        storage: {
          backend: 'local',
          hash: 'e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3',
          uri: 'aoc://storage/local/0xe3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3'
        },
        bytes: 64
      },
      {
        field_id: 'medications',
        content_id: 'a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4',
        storage: {
          backend: 'local',
          hash: 'b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5',
          uri: 'aoc://storage/local/0xb5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5'
        },
        bytes: 2048
      },
      {
        field_id: 'primary_physician',
        content_id: 'c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6',
        storage: {
          backend: 'local',
          hash: 'd7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7',
          uri: 'aoc://storage/local/0xd7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7'
        },
        bytes: 512
      }
    ];

    const manifest = buildPackManifest('did:aoc:2DrjgbN7v5TJfQkX9BCXP4', fields, {
      now: new Date('2024-02-03T00:00:00Z')
    });

    expect(manifest.fields).toHaveLength(4);
    expect(manifest.pack_hash).toMatch(/^[a-f0-9]{64}$/);

    // Verify total bytes calculation
    const totalBytes = manifest.fields.reduce((sum, f) => sum + f.bytes, 0);
    expect(totalBytes).toBe(1024 + 64 + 2048 + 512);
  });
});
