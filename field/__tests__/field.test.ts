import { buildFieldId } from '../fieldId';
import { buildFieldManifest } from '../fieldManifest';

describe('field manifest', () => {
  it('produces deterministic field hashes for identical inputs', () => {
    const manifestA = buildFieldManifest(
      'field-id',
      'string',
      'user display name',
      { now: new Date('2024-01-01T00:00:00Z') }
    );
    const manifestB = buildFieldManifest(
      'field-id',
      'string',
      'user display name',
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    expect(manifestA.field_hash).toBe(manifestB.field_hash);
  });

  it('changes field hash when inputs change', () => {
    const base = buildFieldManifest(
      'field-id',
      'string',
      'user display name',
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    const idChanged = buildFieldManifest(
      'field-id-v2',
      'string',
      'user display name',
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    const typeChanged = buildFieldManifest(
      'field-id',
      'number',
      'user display name',
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    const semanticsChanged = buildFieldManifest(
      'field-id',
      'string',
      'user age',
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    expect(base.field_hash).not.toBe(idChanged.field_hash);
    expect(base.field_hash).not.toBe(typeChanged.field_hash);
    expect(base.field_hash).not.toBe(semanticsChanged.field_hash);
  });

  it('rejects invalid inputs', () => {
    expect(() => buildFieldManifest('', 'string', 'semantics')).toThrow(
      'Field field_id must be non-empty.'
    );

    expect(() => buildFieldManifest('field-id', '', 'semantics')).toThrow(
      'Field data_type must be non-empty.'
    );

    expect(() => buildFieldManifest('field-id', 'string', '')).toThrow(
      'Field semantics must be non-empty.'
    );
  });
});

describe('field id', () => {
  it('builds a valid field id', () => {
    const manifest = buildFieldManifest(
      'field-id',
      'string',
      'user display name',
      { now: new Date('2024-01-01T00:00:00Z') }
    );

    const fieldId = buildFieldId(manifest);
    expect(fieldId).toMatch(/^aoc:\/\/field\/definition\/v1\/0\/0x[0-9a-f]{64}$/);
  });

  it('rejects invalid field hash', () => {
    const manifest = buildFieldManifest(
      'field-id',
      'string',
      'user display name',
      { now: new Date('2024-01-01T00:00:00Z') }
    );
    manifest.field_hash = 'INVALID';

    expect(() => buildFieldId(manifest)).toThrow(
      'Field hash must be 64 lowercase hex characters.'
    );
  });
});
