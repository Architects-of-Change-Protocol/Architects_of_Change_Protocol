import { randomUUID } from 'node:crypto';

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

const SOVEREIGN_ASSET_ID_PREFIX = 'aoc:sovereign-asset:';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const SOVEREIGN_ASSET_ID_PATTERN = new RegExp(
  `^${SOVEREIGN_ASSET_ID_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${UUID_PATTERN.source.slice(1, -1)}$`,
);

/**
 * Mints a brand new, independent SovereignAssetId. Never call this more
 * than once for the same asset — a fresh id always means a fresh asset.
 */
export function mintSovereignAssetId(): SovereignAssetId {
  return `${SOVEREIGN_ASSET_ID_PREFIX}${randomUUID()}`;
}

/**
 * Structural validation only — confirms the value is well-formed. It does
 * not confirm the id is registered, resolvable, or was minted by this
 * runtime.
 */
export function isValidSovereignAssetId(value: unknown): value is SovereignAssetId {
  return typeof value === 'string' && SOVEREIGN_ASSET_ID_PATTERN.test(value);
}

export function assertValidSovereignAssetId(value: unknown): asserts value is SovereignAssetId {
  if (!isValidSovereignAssetId(value)) {
    throw new Error(`Malformed SovereignAssetId: ${JSON.stringify(value)}`);
  }
}
