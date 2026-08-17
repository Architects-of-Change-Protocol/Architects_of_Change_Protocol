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
  private readonly byId = new Map<SovereignAssetId, Map<number, SignedSovereignManifest>>();
  private readonly byContentDigest = new Map<string, SignedSovereignManifest[]>();

  register(signed: SignedSovereignManifest): void {
    const id = signed.manifest.sovereignAssetId;
    const versions = this.byId.get(id) ?? new Map<number, SignedSovereignManifest>();
    const version = signed.manifest.manifestVersion;
    if (versions.has(version)) {
      throw new Error(`Sovereign asset version already registered: ${id}@${version}`);
    }
    const latest = Math.max(0, ...versions.keys());
    if (version <= latest) {
      throw new Error(`Sovereign asset manifest version must increase: ${id}@${version}`);
    }
    versions.set(version, signed);
    this.byId.set(id, versions);

    // A manifest that declares no `contentIdentity` is never indexed for
    // content lookup: it made no integrity assertion, so it must not be
    // discoverable by one (and no stand-in digest is fabricated for it).
    const declaredContentIdentity = signed.manifest.contentIdentity;
    if (declaredContentIdentity) {
      const key = contentIdentityKey(declaredContentIdentity);
      const existing = this.byContentDigest.get(key) ?? [];
      existing.push(signed);
      this.byContentDigest.set(key, existing);
    }
  }

  resolve(sovereignAssetId: SovereignAssetId): SignedSovereignManifest | null {
    const versions = this.byId.get(sovereignAssetId);
    if (!versions) return null;
    return versions.get(Math.max(...versions.keys())) ?? null;
  }

  resolveVersion(sovereignAssetId: SovereignAssetId, manifestVersion: number): SignedSovereignManifest | null {
    return this.byId.get(sovereignAssetId)?.get(manifestVersion) ?? null;
  }

  findByContentDigest(contentIdentity: ContentIdentity): readonly SignedSovereignManifest[] {
    return this.byContentDigest.get(contentIdentityKey(contentIdentity)) ?? [];
  }
}
