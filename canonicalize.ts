/**
 * Compatibility re-export. The authoritative canonicalization
 * implementation and its versioned profile identifier now live in
 * ./crypto/canonicalize.ts (profile: aoc-canonical-json/1) so that the
 * crypto engine's hashing/signing paths and the root-level asset/content
 * layer (content, pack, field, storage, capability, consent) consume the
 * exact same implementation. Do not reintroduce logic here — this file
 * exists only so existing `from './canonicalize'` / `from '../canonicalize'`
 * imports across the repository keep working unchanged.
 */
export { canonicalizeJSON, CANONICAL_JSON_PROFILE } from './crypto/canonicalize';
