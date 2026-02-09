import { parseSDLPath } from '../parser';
import { validateSDLPath, parseAndValidateSDLPath, CANONICAL_DOMAINS } from '../validator';
import { SDLPath } from '../types';

describe('SDL parser', () => {
  describe('valid path parsing', () => {
    it('parses a two-segment path (domain + attribute)', () => {
      const result = parseSDLPath('person.name');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.path.raw).toBe('person.name');
      expect(result.path.domain).toBe('person');
      expect(result.path.attribute).toBe('name');
      expect(result.path.segments).toHaveLength(2);
      expect(result.path.segments[0]).toEqual({ value: 'person', index: 0 });
      expect(result.path.segments[1]).toEqual({ value: 'name', index: 1 });
    });

    it('parses a four-segment SDL path', () => {
      const result = parseSDLPath('person.name.legal.full');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.path.raw).toBe('person.name.legal.full');
      expect(result.path.domain).toBe('person');
      expect(result.path.attribute).toBe('full');
      expect(result.path.segments).toHaveLength(4);
    });

    it('parses paths with hyphens in segments', () => {
      const result = parseSDLPath('work.skill.front-end.years');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.path.segments[2].value).toBe('front-end');
    });

    it('parses paths with digits in segments', () => {
      const result = parseSDLPath('credential.iso27001.status');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.path.segments[1].value).toBe('iso27001');
    });

    it('trims leading and trailing whitespace', () => {
      const result = parseSDLPath('  person.name  ');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.path.raw).toBe('person.name');
    });

    it('produces deterministic output for identical inputs', () => {
      const a = parseSDLPath('person.name.legal.full');
      const b = parseSDLPath('person.name.legal.full');
      expect(a).toEqual(b);
    });

    it('parses all canonical domains', () => {
      for (const domain of CANONICAL_DOMAINS) {
        const result = parseSDLPath(`${domain}.attribute`);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.path.domain).toBe(domain);
        }
      }
    });

    it('parses a deeply nested path', () => {
      const result = parseSDLPath('health.allergy.drug.penicillin.severity');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.path.segments).toHaveLength(5);
      expect(result.path.domain).toBe('health');
      expect(result.path.attribute).toBe('severity');
    });
  });

  describe('invalid path rejection', () => {
    it('rejects empty string', () => {
      const result = parseSDLPath('');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('EMPTY_INPUT');
      expect(result.error.input).toBe('');
    });

    it('rejects whitespace-only string', () => {
      const result = parseSDLPath('   ');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('EMPTY_INPUT');
    });

    it('rejects single segment (no dot)', () => {
      const result = parseSDLPath('person');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('TOO_FEW_SEGMENTS');
    });

    it('rejects leading dot', () => {
      const result = parseSDLPath('.person.name');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('LEADING_DOT');
    });

    it('rejects trailing dot', () => {
      const result = parseSDLPath('person.name.');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('TRAILING_DOT');
    });

    it('rejects consecutive dots (empty segment)', () => {
      const result = parseSDLPath('person..name');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('EMPTY_SEGMENT');
    });

    it('rejects segment starting with a digit', () => {
      const result = parseSDLPath('person.1name');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('INVALID_SEGMENT');
      expect(result.error.message).toContain('1name');
      expect(result.error.message).toContain('position 1');
    });

    it('rejects segment with uppercase letters', () => {
      const result = parseSDLPath('person.Name');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('INVALID_SEGMENT');
    });

    it('rejects segment with underscores', () => {
      const result = parseSDLPath('person.full_name');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('INVALID_SEGMENT');
    });

    it('rejects segment with special characters', () => {
      const result = parseSDLPath('person.na@me');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('INVALID_SEGMENT');
    });

    it('rejects segment with spaces', () => {
      const result = parseSDLPath('person.full name');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('INVALID_SEGMENT');
    });

    it('returns deterministic error structure', () => {
      const a = parseSDLPath('INVALID');
      const b = parseSDLPath('INVALID');
      expect(a).toEqual(b);
    });

    it('error objects contain input, code, and message', () => {
      const result = parseSDLPath('');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error).toHaveProperty('input');
      expect(result.error).toHaveProperty('code');
      expect(result.error).toHaveProperty('message');
      expect(typeof result.error.input).toBe('string');
      expect(typeof result.error.code).toBe('string');
      expect(typeof result.error.message).toBe('string');
    });
  });
});

describe('SDL validator', () => {
  function makePath(raw: string, segments: string[]): SDLPath {
    return {
      raw,
      segments: segments.map((value, index) => ({ value, index })),
      domain: segments[0],
      attribute: segments[segments.length - 1],
    };
  }

  describe('valid path validation', () => {
    it('validates a well-formed path', () => {
      const path = makePath('person.name.legal.full', ['person', 'name', 'legal', 'full']);
      const result = validateSDLPath(path);
      expect(result.valid).toBe(true);
      if (!result.valid) return;
      expect(result.normalized.raw).toBe('person.name.legal.full');
    });

    it('normalizes the raw field from segments', () => {
      // raw has extra spacing, but segments are clean
      const path: SDLPath = {
        raw: 'person.name',
        segments: [
          { value: 'person', index: 0 },
          { value: 'name', index: 1 },
        ],
        domain: 'person',
        attribute: 'name',
      };
      const result = validateSDLPath(path);
      expect(result.valid).toBe(true);
      if (!result.valid) return;
      expect(result.normalized.raw).toBe('person.name');
      expect(result.normalized.domain).toBe('person');
      expect(result.normalized.attribute).toBe('name');
    });

    it('preserves segment ordering (hierarchical)', () => {
      const path = makePath('work.skill.javascript.years', ['work', 'skill', 'javascript', 'years']);
      const result = validateSDLPath(path);
      expect(result.valid).toBe(true);
      if (!result.valid) return;
      expect(result.normalized.segments.map((s) => s.value)).toEqual([
        'work',
        'skill',
        'javascript',
        'years',
      ]);
    });
  });

  describe('invalid path validation', () => {
    it('rejects path with too few segments', () => {
      const path: SDLPath = {
        raw: 'person',
        segments: [{ value: 'person', index: 0 }],
        domain: 'person',
        attribute: 'person',
      };
      const result = validateSDLPath(path);
      expect(result.valid).toBe(false);
      if (result.valid) return;
      expect(result.errors[0].code).toBe('TOO_FEW_SEGMENTS');
    });

    it('rejects path with empty segment', () => {
      const path = makePath('person..name', ['person', '', 'name']);
      const result = validateSDLPath(path);
      expect(result.valid).toBe(false);
      if (result.valid) return;
      expect(result.errors.some((e) => e.code === 'EMPTY_SEGMENT')).toBe(true);
    });

    it('rejects path with invalid segment characters', () => {
      const path = makePath('person.Name', ['person', 'Name']);
      const result = validateSDLPath(path);
      expect(result.valid).toBe(false);
      if (result.valid) return;
      expect(result.errors.some((e) => e.code === 'INVALID_SEGMENT')).toBe(true);
    });

    it('collects multiple errors', () => {
      const path: SDLPath = {
        raw: 'P..Q',
        segments: [
          { value: 'P', index: 0 },
          { value: '', index: 1 },
          { value: 'Q', index: 2 },
        ],
        domain: 'P',
        attribute: 'Q',
      };
      const result = validateSDLPath(path);
      expect(result.valid).toBe(false);
      if (result.valid) return;
      // Should have errors for both invalid segments and the empty segment
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('parseAndValidateSDLPath', () => {
  it('returns a valid normalized path for good input', () => {
    const result = parseAndValidateSDLPath('person.name.legal.full');
    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.normalized.raw).toBe('person.name.legal.full');
    expect(result.normalized.segments).toHaveLength(4);
  });

  it('returns errors for invalid input', () => {
    const result = parseAndValidateSDLPath('');
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('EMPTY_INPUT');
  });

  it('returns errors for structurally invalid parsed path', () => {
    const result = parseAndValidateSDLPath('person.Name');
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors[0].code).toBe('INVALID_SEGMENT');
  });
});
