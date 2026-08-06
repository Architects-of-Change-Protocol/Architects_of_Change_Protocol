/**
 * AOC Canonical JSON — the single authoritative deterministic serialization
 * contract for cryptographic material (hashing, signing) across the AOC
 * Protocol runtime.
 *
 * Profile: aoc-canonical-json/1
 *
 * Any conforming implementation (in any language) MUST reproduce these
 * rules exactly, byte for byte:
 *
 * - Object keys are sorted by ASCII/UTF-16 code unit ordering and rendered
 *   as `"key":value` pairs joined by `,`, wrapped in `{}`.
 * - Arrays preserve input order and are rendered as comma-joined elements
 *   wrapped in `[]`.
 * - Strings are rendered via JSON string-escaping (`JSON.stringify`).
 * - Integers render via `Number.prototype.toString()` (no leading zeros,
 *   no trailing decimal point).
 * - Non-integer finite numbers render via `Number.prototype.toString()`
 *   with trailing fractional zeros stripped.
 * - `true`, `false`, and `null` render as the literals `true`, `false`,
 *   `null`.
 * - No insignificant whitespace is ever emitted.
 *
 * Deliberately unsupported — canonicalization MUST throw rather than
 * silently produce ambiguous cryptographic material:
 * - `undefined`, at the top level, as an array element, or as an object
 *   property value (no property-dropping, unlike `JSON.stringify`).
 * - Non-finite numbers (`NaN`, `Infinity`, `-Infinity`).
 * - Any other type not representable in JSON (functions, symbols,
 *   bigints, etc).
 *
 * This module has no dependency on the rest of the AOC runtime and is the
 * single import both the crypto engine (signing/hashing) and the
 * root-level asset/content layer (content, pack, field, storage,
 * capability, consent canonical payload builders) must use. Do not
 * reimplement canonicalization elsewhere — import `canonicalizeJSON` from
 * here (directly within this package, or via the root `canonicalize.ts`
 * re-export used throughout the repository).
 */
export declare const CANONICAL_JSON_PROFILE: "aoc-canonical-json/1";
export declare function canonicalizeJSON(value: any): string;
//# sourceMappingURL=canonicalize.d.ts.map