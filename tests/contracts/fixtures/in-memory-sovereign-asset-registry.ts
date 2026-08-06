import type { SignedSovereignManifest, SovereignAssetRegistry } from '@aoc/protocol/manifest';
import type { ContentIdentity, SovereignAssetId } from '@aoc/protocol/identity';
import { contentIdentityKey } from '@aoc/protocol/identity';

/**
 * Reference in-memory `SovereignAssetRegistry`, for this repository's own
 * test suite only. It is explicitly NOT production-durable: no
 * persistence, no concurrency control, no indexing beyond plain `Map`s,
 * and no replication. It deliberately does not ship as part of the
 * published `@aoc/protocol` package (see `packages/protocol/src/manifest/
 * registry.ts`) — Protocol owns the port, not implementations. A
 * production implementation must supply its own durable, storage-neutral
 * registry behind the same `SovereignAssetRegistry` interface.
 */
export class InMemorySovereignAssetRegistry implements SovereignAssetRegistry {
  private readonly byId = new Map<SovereignAssetId, SignedSovereignManifest>();
  private readonly byContentDigest = new Map<string, SignedSovereignManifest[]>();

  register(signed: SignedSovereignManifest): void {
    const id = signed.manifest.sovereignAssetId;
    if (this.byId.has(id)) {
      throw new Error(`Sovereign asset already registered: ${id}`);
    }

    this.byId.set(id, signed);

    const key = contentIdentityKey(signed.manifest.contentIdentity);
    const existing = this.byContentDigest.get(key) ?? [];
    existing.push(signed);
    this.byContentDigest.set(key, existing);
  }

  resolve(sovereignAssetId: SovereignAssetId): SignedSovereignManifest | null {
    return this.byId.get(sovereignAssetId) ?? null;
  }

  findByContentDigest(contentIdentity: ContentIdentity): readonly SignedSovereignManifest[] {
    return this.byContentDigest.get(contentIdentityKey(contentIdentity)) ?? [];
  }
}
