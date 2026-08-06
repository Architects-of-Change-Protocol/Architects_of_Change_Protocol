/**
 * Thin re-export. The authoritative `aoc-canonical-json/1` implementation
 * now lives in `@aoc/protocol/canonical` (see that module's header comment
 * for the full contract and the AOC Protocol Slice 1 rationale for this
 * relocation). This file exists so every existing `from './canonicalize'` /
 * `from '../canonicalize'` import in this package (and, transitively, the
 * root `canonicalize.ts` re-export used across `content/`, `pack/`,
 * `field/`, `storage/`, `capability/`, `consent/`, and `aocId.ts`) keeps
 * working unchanged.
 */
export { canonicalizeJSON, CANONICAL_JSON_PROFILE } from '@aoc/protocol/canonical';
