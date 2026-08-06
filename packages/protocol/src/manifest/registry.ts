import type { ContentIdentity } from '../identity/content-identity';
import type { SovereignAssetId } from '../identity/sovereign-asset-id';
import type { SignedSovereignManifest } from './manifest';

/**
 * Storage-neutral, provider-neutral registry port for resolving Sovereign
 * Assets. This is a minimum resolution contract — it does not require a
 * graph database, a blockchain, or any specific vendor, and it must never
 * be asked to authorize access, issue grants, or evaluate Enterprise
 * policy (see `resolveSovereignAsset`).
 *
 * `findByContentDigest` surfaces exact-content matches across otherwise
 * unrelated `SovereignAssetId`s honestly: more than one result means a
 * content match exists, not that fraud, a legal dispute, or a resolved
 * "true owner" exists. See
 * `docs/architecture/sovereign-asset-core.md` § "Content match ≠
 * ownership conflict".
 *
 * This module intentionally declares the port only. `@aoc/protocol` owns
 * contracts, not implementations (see
 * `docs/architecture/protocol-adapter-contracts.md`) — a reference
 * in-memory implementation used by this slice's own test suite lives at
 * `tests/contracts/fixtures/in-memory-sovereign-asset-registry.ts` and is
 * not part of the published `@aoc/protocol` surface. Production
 * implementations belong to Enterprise or another runtime, behind this
 * same interface.
 */
export interface SovereignAssetRegistry {
  register(signed: SignedSovereignManifest): void | Promise<void>;
  resolve(sovereignAssetId: SovereignAssetId): SignedSovereignManifest | null | Promise<SignedSovereignManifest | null>;
  findByContentDigest(
    contentIdentity: ContentIdentity,
  ): readonly SignedSovereignManifest[] | Promise<readonly SignedSovereignManifest[]>;
}

/**
 * Resolves sovereign semantics only: given an id, return the signed
 * manifest currently on record for it (or `null`). This function must
 * never authorize access, issue grants, evaluate Enterprise policy, or
 * call Enterprise — it is a pure lookup.
 */
export function resolveSovereignAsset(
  sovereignAssetRegistry: SovereignAssetRegistry,
  sovereignAssetId: SovereignAssetId,
): SignedSovereignManifest | null | Promise<SignedSovereignManifest | null> {
  return sovereignAssetRegistry.resolve(sovereignAssetId);
}
