import { FieldManifestV1 } from '../../field/types';
import { parseSDLPath } from '../../sdl/parser';
import { SDLPath } from '../../sdl/types';
import { FieldManifestIndex, resolveSDLToFields } from '../resolve';

function mustParse(raw: string): SDLPath {
  const parsed = parseSDLPath(raw);
  if (!parsed.ok) {
    throw new Error(`Expected valid SDL path: ${raw}`);
  }
  return parsed.path;
}

function makeManifest(field_id: string): FieldManifestV1 {
  return {
    version: 1,
    field_id,
    data_type: 'string',
    semantics: `Semantic description for ${field_id}`,
    created_at: '2025-01-01T00:00:00.000Z',
    field_hash: `hash_${field_id}`,
  };
}

function expectExactKeys(obj: Record<string, unknown>, keys: string[]): void {
  expect(Object.keys(obj).sort()).toEqual([...keys].sort());
}

describe('resolver contract invariants', () => {
  it('resolved_fields ordering is stable regardless of input order', () => {
    const index: FieldManifestIndex = new Map([
      ['person.name', makeManifest('person.name')],
      ['contact.email', makeManifest('contact.email')],
      ['work.title', makeManifest('work.title')],
    ]);

    const pathsA = [mustParse('work.title'), mustParse('person.name'), mustParse('contact.email')];
    const pathsB = [mustParse('contact.email'), mustParse('work.title'), mustParse('person.name')];

    const resultA = resolveSDLToFields(pathsA, index);
    const resultB = resolveSDLToFields(pathsB, index);

    expect(resultA.resolved_fields.map((x) => x.ref.path.raw)).toEqual([
      'contact.email',
      'person.name',
      'work.title',
    ]);
    expect(resultA.resolved_fields).toEqual(resultB.resolved_fields);
  });

  it('unresolved_fields ordering is stable regardless of input order', () => {
    const index: FieldManifestIndex = new Map();

    const pathsA = [mustParse('zeta.field'), mustParse('alpha.field'), mustParse('middle.field')];
    const pathsB = [mustParse('middle.field'), mustParse('zeta.field'), mustParse('alpha.field')];

    const resultA = resolveSDLToFields(pathsA, index);
    const resultB = resolveSDLToFields(pathsB, index);

    expect(resultA.unresolved_fields.map((x) => x.path.raw)).toEqual([
      'alpha.field',
      'middle.field',
      'zeta.field',
    ]);
    expect(resultA.unresolved_fields).toEqual(resultB.unresolved_fields);
  });

  it('unresolved error objects are exactly { code, message, path? } and deterministic', () => {
    const index: FieldManifestIndex = new Map();

    const resultA = resolveSDLToFields([mustParse('unknown.field')], index);
    const resultB = resolveSDLToFields([mustParse('unknown.field')], index);

    expect(resultA.unresolved_fields).toHaveLength(1);
    const err = resultA.unresolved_fields[0];

    expectExactKeys(err as unknown as Record<string, unknown>, ['code', 'message', 'path']);
    expect(err.code).toBe('FIELD_NOT_FOUND');
    expect(err.message).toContain('unknown.field');
    expect(err.path.raw).toBe('unknown.field');

    expect(resultA.unresolved_fields).toEqual(resultB.unresolved_fields);
  });

  it('mixed resolved and unresolved outputs are stable across input orderings', () => {
    const index: FieldManifestIndex = new Map([
      ['person.name', makeManifest('person.name')],
      ['contact.email', makeManifest('contact.email')],
    ]);

    const pathsA = [
      mustParse('missing.alpha'),
      mustParse('person.name'),
      mustParse('missing.zeta'),
      mustParse('contact.email'),
    ];
    const pathsB = [
      mustParse('contact.email'),
      mustParse('missing.zeta'),
      mustParse('person.name'),
      mustParse('missing.alpha'),
    ];

    const resultA = resolveSDLToFields(pathsA, index);
    const resultB = resolveSDLToFields(pathsB, index);

    expect(resultA.resolved_fields.map((x) => x.ref.path.raw)).toEqual(['contact.email', 'person.name']);
    expect(resultA.unresolved_fields.map((x) => x.path.raw)).toEqual(['missing.alpha', 'missing.zeta']);
    expect(resultA).toEqual(resultB);
  });
});
