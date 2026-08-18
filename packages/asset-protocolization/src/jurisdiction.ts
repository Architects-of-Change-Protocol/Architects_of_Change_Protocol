/**
 * Jurisdiction context for the profile framework.
 *
 * This is deliberately the smallest structure that lets a later profile say
 * "this requirement applies within jurisdiction X". It is **not** a legal-rules
 * engine, not an ontology, and not a claim that anything is lawful anywhere:
 * the code is an opaque token this package validates structurally and never
 * interprets, resolves, or reasons about. Legal requirements are established
 * only in the later, citation-bearing work packages, never here.
 */

/**
 * Uppercase, hyphen-separated token — `CR`, `US-CA`, `EU`, `GLOBAL`, `NONE`.
 *
 * The grammar is a superset of ISO-3166 alpha-2 and alpha-2 + subdivision, but
 * conformance to any external standard is *not* checked: an unknown or future
 * jurisdiction token must remain expressible without a code change, exactly as
 * `SovereignExternalReference.namespace` keeps external namespaces open-world.
 */
const JURISDICTION_CODE_PATTERN = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/;

const JURISDICTION_CODE_MAX_LENGTH = 32;

/**
 * The conventional wildcard: a profile scoped to `GLOBAL` places no
 * jurisdictional restriction on its requirements.
 *
 * This constant exists so the one place that needs the convention —
 * profile/requirement scope consistency in `profile-validation.ts` — can name
 * it instead of hard-coding a string. Nothing else in the framework branches on
 * a jurisdiction value.
 */
export const GLOBAL_JURISDICTION_CODE = 'GLOBAL';

/**
 * Names a jurisdiction without asserting anything about it.
 *
 * `label` is presentation-only (see `metadata.ts`): no machine semantics of this
 * framework may depend on it.
 */
export interface JurisdictionRef {
  readonly code: string;
  readonly label?: string;
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

export function isValidJurisdictionCode(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= JURISDICTION_CODE_MAX_LENGTH &&
    JURISDICTION_CODE_PATTERN.test(value)
  );
}

/**
 * Structural check only. A present-but-`undefined` `label` is invalid rather
 * than absent, matching the canonical contracts: `aoc-canonical-json/1` refuses
 * `undefined`, so an absent optional must be structurally omitted.
 */
export function isValidJurisdictionRef(value: unknown): value is JurisdictionRef {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<JurisdictionRef>;
  for (const key of Object.keys(candidate)) {
    if (key !== 'code' && key !== 'label') return false;
  }
  if (!isValidJurisdictionCode(candidate.code)) return false;
  if (hasOwn(candidate, 'label') && (typeof candidate.label !== 'string' || candidate.label.trim() === '')) {
    return false;
  }
  return true;
}

export function jurisdictionRefsEqual(left: JurisdictionRef, right: JurisdictionRef): boolean {
  return left.code === right.code;
}
