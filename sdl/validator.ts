import { parseSDLPath } from './parser';
import {
  SDLParseError,
  SDLPath,
  SDLValidationResult,
} from './types';

/**
 * Canonical SDL domains as defined in the SDL v0.1 specification.
 * Paths with non-canonical domains are still valid but may receive
 * warnings in future versions.
 */
export const CANONICAL_DOMAINS: ReadonlySet<string> = new Set([
  'person',
  'identity',
  'contact',
  'location',
  'work',
  'education',
  'health',
  'finance',
  'legal',
  'biometric',
  'device',
  'reputation',
  'credential',
  'preference',
  'consent',
]);

/**
 * Validate an already-parsed SDL path against grammar and normalization rules.
 *
 * Validation checks:
 * - Path has at least 2 segments (domain + attribute)
 * - All segments match the segment pattern [a-z][a-z0-9-]*
 * - No empty segments
 *
 * Normalization:
 * - Trims whitespace from raw path
 * - Segment ordering is positional (hierarchical) and preserved as-is
 *
 * @param path - A parsed SDLPath to validate
 * @returns SDLValidationResult with normalized path or error array
 */
export function validateSDLPath(path: SDLPath): SDLValidationResult {
  const errors: SDLParseError[] = [];

  if (!path.segments || path.segments.length < 2) {
    errors.push({
      input: path.raw,
      code: 'TOO_FEW_SEGMENTS',
      message: 'SDL path must contain at least two segments (domain + attribute).',
    });
  }

  for (const segment of path.segments) {
    if (segment.value === '') {
      errors.push({
        input: path.raw,
        code: 'EMPTY_SEGMENT',
        message: `SDL path contains an empty segment at position ${segment.index}.`,
      });
    } else if (!/^[a-z][a-z0-9-]*$/.test(segment.value)) {
      errors.push({
        input: path.raw,
        code: 'INVALID_SEGMENT',
        message: `SDL segment "${segment.value}" at position ${segment.index} is invalid.`,
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Normalize: rebuild with trimmed raw and canonical segment ordering
  const normalizedRaw = path.segments.map((s) => s.value).join('.');
  const normalized: SDLPath = {
    raw: normalizedRaw,
    segments: path.segments.map((s, i) => ({ value: s.value, index: i })),
    domain: path.segments[0].value,
    attribute: path.segments[path.segments.length - 1].value,
  };

  return { valid: true, normalized };
}

/**
 * Parse and validate an SDL path string in a single call.
 *
 * Convenience function that combines parseSDLPath + validateSDLPath.
 *
 * @param input - Raw SDL path string
 * @returns SDLValidationResult with normalized path or errors
 */
export function parseAndValidateSDLPath(input: string): SDLValidationResult {
  const parsed = parseSDLPath(input);

  if (!parsed.ok) {
    return {
      valid: false,
      errors: [parsed.error],
    };
  }

  return validateSDLPath(parsed.path);
}
