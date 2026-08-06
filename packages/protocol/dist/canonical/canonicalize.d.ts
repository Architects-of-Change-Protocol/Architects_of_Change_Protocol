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
 * single import every canonicalization-relevant consumer must use — the
 * `@aoc/protocol` sovereign asset/manifest/claim contracts, the crypto
 * engine's signing/hashing primitives (via `crypto/canonicalize.ts`, which
 * re-exports this module), and the root-level legacy asset/content layer
 * (content, pack, field, storage, capability, consent canonical payload
 * builders, via the root `canonicalize.ts` re-export). Do not reimplement
 * canonicalization elsewhere — import `canonicalizeJSON` from here.
 *
 * Ownership note (AOC Protocol Slice 1 / SAP-GAP-001..004,006,009): this
 * implementation moved here from `crypto/canonicalize.ts` (its Slice 0
 * home) with byte-identical behavior — no algorithm change, no output
 * change for any previously-valid input. It had to move because `@aoc/
 * protocol` must have zero runtime-package dependencies (see
 * `docs/release/RELEASE_CANDIDATE_READINESS.md` and the `role === 'protocol'`
 * rule in `scripts/check-version-graph.mjs`, which forbids `@aoc/protocol`
 * from depending on any `@aoc-runtime/*` package), while the new
 * `SovereignManifestV1` contract defined in `@aoc/protocol/manifest` is
 * required to canonicalize under `aoc-canonical-json/1`. Since `@aoc-
 * runtime/crypto` is a runtime package, it is architecturally free to
 * depend on `@aoc/protocol` (runtime → protocol is an allowed edge; the
 * reverse is not), so `crypto/canonicalize.ts` now re-exports this module
 * instead of the other way around. See
 * `docs/architecture/sovereign-asset-core.md` §"Canonicalization ownership".
 */
export declare const CANONICAL_JSON_PROFILE: "aoc-canonical-json/1";
export declare function canonicalizeJSON(value: any): string;
//# sourceMappingURL=canonicalize.d.ts.map