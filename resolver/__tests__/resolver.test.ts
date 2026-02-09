import { parseSDLPath } from '../../sdl/parser';
import { SDLPath } from '../../sdl/types';
import { FieldManifestV1 } from '../../field/types';
import { resolveSDLToFields, FieldManifestIndex } from '../resolve';

/** Helper: parse an SDL path string, asserting success. */
function mustParse(input: string): SDLPath {
  const result = parseSDLPath(input);
  if (!result.ok) {
    throw new Error(`Failed to parse SDL path "${input}": ${result.error.message}`);
  }
  return result.path;
}

/** Helper: create a minimal FieldManifestV1 stub with deterministic values. */
function makeManifest(field_id: string): FieldManifestV1 {
  return {
    version: 1,
    field_id,
    data_type: 'string',
    semantics: `Semantic description for ${field_id}`,
    created_at: '2024-01-01T00:00:00.000Z',
    field_hash: 'a'.repeat(64),
  };
}

describe('SDL resolver', () => {
  describe('basic resolution', () => {
    it('resolves a single SDL path to a field manifest', () => {
      const paths = [mustParse('person.name')];
      const index: FieldManifestIndex = new Map([
        ['person.name', makeManifest('person.name')],
      ]);

      const result = resolveSDLToFields(paths, index);

      expect(result.resolved_fields).toHaveLength(1);
      expect(result.unresolved_fields).toHaveLength(0);
      expect(result.resolved_fields[0].ref.path.raw).toBe('person.name');
      expect(result.resolved_fields[0].ref.field_id).toBe('person.name');
      expect(result.resolved_fields[0].manifest.field_id).toBe('person.name');
    });

    it('resolves multiple SDL paths', () => {
      const paths = [
        mustParse('person.name'),
        mustParse('contact.email'),
        mustParse('work.title'),
      ];
      const index: FieldManifestIndex = new Map([
        ['person.name', makeManifest('person.name')],
        ['contact.email', makeManifest('contact.email')],
        ['work.title', makeManifest('work.title')],
      ]);

      const result = resolveSDLToFields(paths, index);

      expect(result.resolved_fields).toHaveLength(3);
      expect(result.unresolved_fields).toHaveLength(0);
    });

    it('reports unresolved paths when field_id is not in the index', () => {
      const paths = [mustParse('person.name'), mustParse('unknown.field')];
      const index: FieldManifestIndex = new Map([
        ['person.name', makeManifest('person.name')],
      ]);

      const result = resolveSDLToFields(paths, index);

      expect(result.resolved_fields).toHaveLength(1);
      expect(result.unresolved_fields).toHaveLength(1);
      expect(result.unresolved_fields[0].path.raw).toBe('unknown.field');
      expect(result.unresolved_fields[0].code).toBe('FIELD_NOT_FOUND');
    });

    it('returns all unresolved when index is empty', () => {
      const paths = [mustParse('person.name'), mustParse('contact.email')];
      const index: FieldManifestIndex = new Map();

      const result = resolveSDLToFields(paths, index);

      expect(result.resolved_fields).toHaveLength(0);
      expect(result.unresolved_fields).toHaveLength(2);
    });

    it('returns empty arrays when no paths are provided', () => {
      const index: FieldManifestIndex = new Map([
        ['person.name', makeManifest('person.name')],
      ]);

      const result = resolveSDLToFields([], index);

      expect(result.resolved_fields).toHaveLength(0);
      expect(result.unresolved_fields).toHaveLength(0);
    });
  });

  describe('deterministic resolution ordering', () => {
    it('sorts resolved fields alphabetically by raw path', () => {
      // Provide paths in non-alphabetical order
      const paths = [
        mustParse('work.title'),
        mustParse('contact.email'),
        mustParse('person.name'),
      ];
      const index: FieldManifestIndex = new Map([
        ['work.title', makeManifest('work.title')],
        ['contact.email', makeManifest('contact.email')],
        ['person.name', makeManifest('person.name')],
      ]);

      const result = resolveSDLToFields(paths, index);

      expect(result.resolved_fields.map((r) => r.ref.path.raw)).toEqual([
        'contact.email',
        'person.name',
        'work.title',
      ]);
    });

    it('sorts unresolved fields alphabetically by raw path', () => {
      const paths = [
        mustParse('z.field'),
        mustParse('a.field'),
        mustParse('m.field'),
      ];
      const index: FieldManifestIndex = new Map();

      const result = resolveSDLToFields(paths, index);

      expect(result.unresolved_fields.map((u) => u.path.raw)).toEqual([
        'a.field',
        'm.field',
        'z.field',
      ]);
    });

    it('produces identical output for identical inputs regardless of input order', () => {
      const index: FieldManifestIndex = new Map([
        ['person.name', makeManifest('person.name')],
        ['work.title', makeManifest('work.title')],
      ]);

      const orderA = resolveSDLToFields(
        [mustParse('work.title'), mustParse('person.name'), mustParse('unknown.field')],
        index
      );
      const orderB = resolveSDLToFields(
        [mustParse('person.name'), mustParse('unknown.field'), mustParse('work.title')],
        index
      );

      expect(orderA.resolved_fields.map((r) => r.ref.path.raw)).toEqual(
        orderB.resolved_fields.map((r) => r.ref.path.raw)
      );
      expect(orderA.unresolved_fields.map((u) => u.path.raw)).toEqual(
        orderB.unresolved_fields.map((u) => u.path.raw)
      );
    });

    it('maintains deterministic ordering with deeply nested paths', () => {
      const paths = [
        mustParse('health.allergy.drug.penicillin.severity'),
        mustParse('education.degree.level'),
        mustParse('person.name.legal.full'),
      ];
      const index: FieldManifestIndex = new Map([
        ['health.allergy.drug.penicillin.severity', makeManifest('health.allergy.drug.penicillin.severity')],
        ['education.degree.level', makeManifest('education.degree.level')],
        ['person.name.legal.full', makeManifest('person.name.legal.full')],
      ]);

      const result = resolveSDLToFields(paths, index);

      expect(result.resolved_fields.map((r) => r.ref.path.raw)).toEqual([
        'education.degree.level',
        'health.allergy.drug.penicillin.severity',
        'person.name.legal.full',
      ]);
    });
  });

  describe('unresolved field error structure', () => {
    it('error contains path, code, and message', () => {
      const paths = [mustParse('unknown.field')];
      const index: FieldManifestIndex = new Map();

      const result = resolveSDLToFields(paths, index);

      expect(result.unresolved_fields).toHaveLength(1);
      const err = result.unresolved_fields[0];
      expect(err).toHaveProperty('path');
      expect(err).toHaveProperty('code');
      expect(err).toHaveProperty('message');
      expect(err.code).toBe('FIELD_NOT_FOUND');
      expect(err.message).toContain('unknown.field');
    });

    it('error path preserves the full SDL AST', () => {
      const paths = [mustParse('person.name.legal.full')];
      const index: FieldManifestIndex = new Map();

      const result = resolveSDLToFields(paths, index);

      const err = result.unresolved_fields[0];
      expect(err.path.raw).toBe('person.name.legal.full');
      expect(err.path.domain).toBe('person');
      expect(err.path.attribute).toBe('full');
      expect(err.path.segments).toHaveLength(4);
    });

    it('produces deterministic error output', () => {
      const paths = [mustParse('missing.field')];
      const index: FieldManifestIndex = new Map();

      const a = resolveSDLToFields(paths, index);
      const b = resolveSDLToFields(paths, index);

      expect(a.unresolved_fields).toEqual(b.unresolved_fields);
    });
  });

  describe('mixed resolution', () => {
    it('handles a realistic schematic bundle with partial resolution', () => {
      // Simulating an employment.application.v1 schematic
      const paths = [
        mustParse('person.name.legal.full'),
        mustParse('contact.email.primary'),
        mustParse('work.skill.javascript.years'),
        mustParse('education.degree.level'),
        mustParse('reputation.score.overall'),  // not in index
      ];

      const index: FieldManifestIndex = new Map([
        ['person.name.legal.full', makeManifest('person.name.legal.full')],
        ['contact.email.primary', makeManifest('contact.email.primary')],
        ['work.skill.javascript.years', makeManifest('work.skill.javascript.years')],
        ['education.degree.level', makeManifest('education.degree.level')],
      ]);

      const result = resolveSDLToFields(paths, index);

      expect(result.resolved_fields).toHaveLength(4);
      expect(result.unresolved_fields).toHaveLength(1);
      expect(result.unresolved_fields[0].path.raw).toBe('reputation.score.overall');
      expect(result.unresolved_fields[0].code).toBe('FIELD_NOT_FOUND');

      // Verify deterministic ordering
      const resolvedPaths = result.resolved_fields.map((r) => r.ref.path.raw);
      expect(resolvedPaths).toEqual([...resolvedPaths].sort());
    });
  });
});
