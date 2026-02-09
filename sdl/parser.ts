import {
  SDLParseError,
  SDLParseResult,
  SDLPath,
  SDLScopeSegment,
} from './types';

/**
 * Pattern for a valid SDL segment: lowercase letters, digits, hyphens.
 * Must start with a lowercase letter.
 */
const SEGMENT_PATTERN = /^[a-z][a-z0-9-]*$/;

/**
 * Parse a raw SDL path string into a structured AST.
 *
 * SDL paths follow the form: domain.category[.subcategory...].attribute
 * Each segment must match [a-z][a-z0-9-]* and there must be at least
 * two segments (domain + attribute).
 *
 * @param input - Raw SDL path string (e.g. "person.name.legal.full")
 * @returns SDLParseResult — either { ok: true, path } or { ok: false, error }
 */
export function parseSDLPath(input: string): SDLParseResult {
  if (typeof input !== 'string' || input.trim() === '') {
    return fail(input ?? '', 'EMPTY_INPUT', 'SDL path must be a non-empty string.');
  }

  const trimmed = input.trim();

  if (trimmed.startsWith('.')) {
    return fail(trimmed, 'LEADING_DOT', 'SDL path must not start with a dot.');
  }

  if (trimmed.endsWith('.')) {
    return fail(trimmed, 'TRAILING_DOT', 'SDL path must not end with a dot.');
  }

  const rawSegments = trimmed.split('.');

  // Check for empty segments (consecutive dots)
  for (let i = 0; i < rawSegments.length; i++) {
    if (rawSegments[i] === '') {
      return fail(trimmed, 'EMPTY_SEGMENT', `SDL path contains an empty segment at position ${i}.`);
    }
  }

  if (rawSegments.length < 2) {
    return fail(
      trimmed,
      'TOO_FEW_SEGMENTS',
      'SDL path must contain at least two segments (domain + attribute).'
    );
  }

  // Validate each segment against the pattern
  for (let i = 0; i < rawSegments.length; i++) {
    if (!SEGMENT_PATTERN.test(rawSegments[i])) {
      return fail(
        trimmed,
        'INVALID_SEGMENT',
        `SDL segment "${rawSegments[i]}" at position ${i} is invalid. Segments must start with a lowercase letter and contain only lowercase letters, digits, or hyphens.`
      );
    }
  }

  const segments: SDLScopeSegment[] = rawSegments.map((value, index) => ({
    value,
    index,
  }));

  const path: SDLPath = {
    raw: trimmed,
    segments,
    domain: segments[0].value,
    attribute: segments[segments.length - 1].value,
  };

  return { ok: true, path };
}

function fail(input: string, code: SDLParseError['code'], message: string): SDLParseResult {
  return {
    ok: false,
    error: { input, code, message },
  };
}
