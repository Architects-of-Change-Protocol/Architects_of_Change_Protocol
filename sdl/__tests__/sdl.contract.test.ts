import { parseSDLPath } from '../parser';
import { parseAndValidateSDLPath, validateSDLPath } from '../validator';
import { SDLPath } from '../types';

function expectExactKeys(obj: Record<string, unknown>, keys: string[]): void {
  expect(Object.keys(obj).sort()).toEqual([...keys].sort());
}

describe('SDL contract invariants', () => {
  describe('error shape contract', () => {
    it('parser error shape is exactly { input, code, message } with no extra keys', () => {
      const raw = 'person..name';
      const result = parseSDLPath(raw);
      expect(result.ok).toBe(false);
      if (result.ok) return;

      expectExactKeys(result.error as unknown as Record<string, unknown>, ['input', 'code', 'message']);
      expect(result.error.input).toBe(raw);
      expect(result.error.code).toBe('EMPTY_SEGMENT');
      expect(result.error.message).toContain('empty segment');
    });

    it('validator error shape is exactly { input, code, message } with no extra keys', () => {
      const malformed: SDLPath = {
        raw: 'person.Name',
        segments: [
          { value: 'person', index: 0 },
          { value: 'Name', index: 1 },
        ],
        domain: 'person',
        attribute: 'Name',
      };

      const result = validateSDLPath(malformed);
      expect(result.valid).toBe(false);
      if (result.valid) return;

      expect(result.errors.length).toBeGreaterThan(0);
      for (const err of result.errors) {
        expectExactKeys(err as unknown as Record<string, unknown>, ['input', 'code', 'message']);
        expect(err.input).toBe(malformed.raw);
      }
    });

    it('parseAndValidate returns errors with the same contract shape', () => {
      const raw = '.person.name';
      const result = parseAndValidateSDLPath(raw);
      expect(result.valid).toBe(false);
      if (result.valid) return;

      expect(result.errors.length).toBeGreaterThan(0);
      for (const err of result.errors) {
        expectExactKeys(err as unknown as Record<string, unknown>, ['input', 'code', 'message']);
        expect(err.input).toBe(raw);
      }
    });
  });

  describe('canonical parse DOM contract', () => {
    it('produces canonical DOM for deeply nested path', () => {
      const result = parseSDLPath(' person.name.legal.full ');
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.path).toEqual({
        raw: 'person.name.legal.full',
        domain: 'person',
        attribute: 'full',
        segments: [
          { value: 'person', index: 0 },
          { value: 'name', index: 1 },
          { value: 'legal', index: 2 },
          { value: 'full', index: 3 },
        ],
      });
    });

    it('parse+validate canonical form is deterministic for equivalent inputs', () => {
      const a = parseAndValidateSDLPath('person.name.legal.full');
      const b = parseAndValidateSDLPath(' person.name.legal.full ');
      expect(a).toEqual(b);
    });

    it('parse canonical form is equivalent for extra surrounding whitespace', () => {
      const canonical = parseSDLPath('person.name');
      const padded = parseSDLPath('\n\t  person.name  \t\n');

      expect(padded).toEqual(canonical);
    });
  });
});
