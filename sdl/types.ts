/**
 * SDL AST Types
 *
 * Minimal type definitions for Sovereign Data Language path parsing,
 * validation, and resolution.
 */

/** A single segment in a dot-separated SDL path. */
export type SDLScopeSegment = {
  /** The raw text of this segment (e.g. "person", "name", "legal"). */
  value: string;
  /** Zero-based position within the path. */
  index: number;
};

/** A fully parsed SDL path (the AST node). */
export type SDLPath = {
  /** The original raw input string (e.g. "person.name.legal.full"). */
  raw: string;
  /** Ordered array of parsed segments. */
  segments: SDLScopeSegment[];
  /** The domain segment (first segment, e.g. "person"). */
  domain: string;
  /** The attribute segment (last segment, e.g. "full"). */
  attribute: string;
};

/** A reference linking an SDL path to a field manifest field_id. */
export type SDLFieldRef = {
  /** The parsed SDL path. */
  path: SDLPath;
  /** The field_id this path maps to in the Field Manifest index. */
  field_id: string;
};

/** Result of parsing an SDL path string. */
export type SDLParseResult =
  | { ok: true; path: SDLPath }
  | { ok: false; error: SDLParseError };

/** Structured error from SDL parsing or validation. */
export type SDLParseError = {
  /** The raw input that failed to parse. */
  input: string;
  /** Machine-readable error code. */
  code: SDLErrorCode;
  /** Human-readable error message. */
  message: string;
};

/** Enumeration of deterministic SDL error codes. */
export type SDLErrorCode =
  | 'EMPTY_INPUT'
  | 'INVALID_SEGMENT'
  | 'EMPTY_SEGMENT'
  | 'TOO_FEW_SEGMENTS'
  | 'LEADING_DOT'
  | 'TRAILING_DOT'
  | 'INVALID_TYPE';

/** Result of SDL path validation. */
export type SDLValidationResult =
  | { valid: true; normalized: SDLPath }
  | { valid: false; errors: SDLParseError[] };
