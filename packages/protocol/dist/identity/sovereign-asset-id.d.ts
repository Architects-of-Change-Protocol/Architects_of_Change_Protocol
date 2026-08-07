/**
 * SovereignAssetId — a persistent, independently-minted identity for a
 * Sovereign Digital Asset.
 *
 * This identity is deliberately NOT derived from content bytes, storage
 * location, manifest contents, registrant, or timestamp. Minting is a
 * one-time, non-reversible act — moving, copying, re-hosting, or even
 * re-signing the asset's manifest never changes this value. See
 * `docs/architecture/sovereign-asset-core.md` for the full invariant:
 *
 *   SovereignAssetId != contentDigest
 *   SovereignAssetId != manifestDigest
 *   SovereignAssetId != storageId
 *   SovereignAssetId != providerId
 *
 * Format: `aoc:sovereign-asset:<uuid>` where `<uuid>` is a lowercase
 * RFC 4122 UUID minted via `node:crypto`'s `randomUUID()` — the smallest
 * mature identifier scheme already available in this runtime (no new
 * dependency introduced). The `aoc:sovereign-asset:` prefix namespaces
 * this identity away from other AOC identifier schemes (e.g. the legacy
 * `aoc://content/...` content-manifest ids, which remain unrelated and
 * unchanged — see `content/contentId.ts`).
 */
export type SovereignAssetId = string;
/**
 * Mints a brand new, independent SovereignAssetId. Never call this more
 * than once for the same asset — a fresh id always means a fresh asset.
 */
export declare function mintSovereignAssetId(): SovereignAssetId;
/**
 * Structural validation only — confirms the value is well-formed. It does
 * not confirm the id is registered, resolvable, or was minted by this
 * runtime.
 */
export declare function isValidSovereignAssetId(value: unknown): value is SovereignAssetId;
export declare function assertValidSovereignAssetId(value: unknown): asserts value is SovereignAssetId;
/**
 * Parses an untrusted value as its canonical SovereignAssetId string.
 * Sovereign asset identifiers have no alternate spellings, so parsing never
 * rewrites, hashes, or derives an identity from the supplied value.
 */
export declare function parseSovereignAssetId(value: unknown): SovereignAssetId;
//# sourceMappingURL=sovereign-asset-id.d.ts.map