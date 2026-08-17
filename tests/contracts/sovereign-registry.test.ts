import { mintSovereignAssetId, computeContentIdentity, contentIdentitiesEqual } from '@aoc/protocol/identity';
import {
  buildSovereignManifestV1,
  generateSovereignKeyPair,
  resolveSovereignAsset,
  resolveSovereignAssetVersion,
  signSovereignManifest,
  verifySovereignManifest,
} from '@aoc/protocol/manifest';
import { buildStoragePointer } from '../../storage/pointer';
import { InMemorySovereignAssetRegistry } from './fixtures/in-memory-sovereign-asset-registry';

function registerAsset(bytes: Uint8Array, registrant: string) {
  const sovereignAssetId = mintSovereignAssetId();
  const contentIdentity = computeContentIdentity(bytes);
  const { signingKey, privateKeyPem } = generateSovereignKeyPair();
  const manifest = buildSovereignManifestV1({ sovereignAssetId, contentIdentity, registrant });
  const signed = signSovereignManifest(manifest, privateKeyPem, signingKey);
  return { sovereignAssetId, contentIdentity, signed };
}

describe('Storage migration invariant (§10, §35) — identity survives a storage move', () => {
  it('keeps SovereignAssetId and contentDigest identical while the storage pointer changes', async () => {
    const bytes = new TextEncoder().encode('hello-sovereign-world');
    const registry = new InMemorySovereignAssetRegistry();
    const { sovereignAssetId, contentIdentity, signed } = registerAsset(bytes, 'principal:alice');
    registry.register(signed);

    // "store X in location/provider P1"
    const p1 = buildStoragePointer('pinata', contentIdentity.digest);
    const p1Verify = await verifySovereignManifest(signed, { contentBytes: bytes });
    expect(p1Verify.checks.contentDigest).toBe('valid');

    // "copy/move same X to P2"
    const p2 = buildStoragePointer('s3', contentIdentity.digest);
    const p2Verify = await verifySovereignManifest(signed, { contentBytes: bytes });
    expect(p2Verify.checks.contentDigest).toBe('valid');

    // The asset moved. The identity did not.
    expect(p1.hash).toBe(p2.hash);
    expect(p1.hash).toBe(contentIdentity.digest);
    expect(p1.uri).not.toBe(p2.uri);
    expect(p1.backend).not.toBe(p2.backend);

    const resolved = await resolveSovereignAsset(registry, sovereignAssetId);
    expect(resolved?.manifest.sovereignAssetId).toBe(sovereignAssetId);
    // `contentIdentity` is optional on the manifest (a sovereign subject
    // need not have byte-addressable content), so a byte-backed asset has
    // to be asserted present before its integrity material is compared.
    expect(resolved!.manifest.contentIdentity).toBeDefined();
    expect(contentIdentitiesEqual(resolved!.manifest.contentIdentity!, contentIdentity)).toBe(true);
  });
});

describe('Duplicate / competing content claims (§18, §19, §36) — content match without adjudication', () => {
  it('detects an exact content match across two independent registrants without declaring a winner', () => {
    const bytes = new TextEncoder().encode('the same underlying work');
    const registry = new InMemorySovereignAssetRegistry();

    const alice = registerAsset(bytes, 'principal:alice');
    registry.register(alice.signed);

    const bob = registerAsset(bytes, 'principal:bob');
    // Registering Bob's independent claim over the same bytes must succeed —
    // the Protocol never blocks a second registration merely because the
    // content digest matches an existing one.
    expect(() => registry.register(bob.signed)).not.toThrow();

    expect(alice.sovereignAssetId).not.toBe(bob.sovereignAssetId);

    const matches = registry.findByContentDigest(alice.contentIdentity);
    expect(matches).toHaveLength(2);
    expect(matches.map((m) => m.manifest.sovereignAssetId).sort()).toEqual(
      [alice.sovereignAssetId, bob.sovereignAssetId].sort(),
    );

    // Neither registration is invalidated, deleted, or marked fraudulent by
    // the mere existence of the other.
    expect(registry.resolve(alice.sovereignAssetId)?.manifest.registrant).toBe('principal:alice');
    expect(registry.resolve(bob.sovereignAssetId)?.manifest.registrant).toBe('principal:bob');
  });

  it('rejects a duplicate registration of the exact same SovereignAssetId (replay)', () => {
    const bytes = new TextEncoder().encode('replay target');
    const registry = new InMemorySovereignAssetRegistry();
    const { signed } = registerAsset(bytes, 'principal:alice');

    registry.register(signed);
    expect(() => registry.register(signed)).toThrow(/already registered/);
  });
});

describe('Manifest history', () => {
  it('preserves exact historical versions and resolves the latest version separately', async () => {
    const bytes = new TextEncoder().encode('versioned asset');
    const registry = new InMemorySovereignAssetRegistry();
    const sovereignAssetId = mintSovereignAssetId();
    const contentIdentity = computeContentIdentity(bytes);
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const v1 = signSovereignManifest(
      buildSovereignManifestV1({ sovereignAssetId, contentIdentity, registrant: 'principal:alice', manifestVersion: 1 }),
      privateKeyPem,
      signingKey,
    );
    const v2 = signSovereignManifest(
      buildSovereignManifestV1({ sovereignAssetId, contentIdentity, registrant: 'principal:alice', manifestVersion: 2 }),
      privateKeyPem,
      signingKey,
    );

    registry.register(v1);
    registry.register(v2);
    expect(await resolveSovereignAssetVersion(registry, sovereignAssetId, 1)).toEqual(v1);
    expect(await resolveSovereignAssetVersion(registry, sovereignAssetId, 2)).toEqual(v2);
    expect(await resolveSovereignAsset(registry, sovereignAssetId)).toEqual(v2);
    expect(await resolveSovereignAssetVersion(registry, sovereignAssetId, 99)).toBeNull();
    expect(() => registry.register(v1)).toThrow(/already registered/);
  });
});

describe('Copy vs authority (§38) — possession of a copy is not authority', () => {
  it('a copier holding identical bytes gains no authority record and no new claim', async () => {
    const bytes = new TextEncoder().encode('hello-sovereign-world');
    const registry = new InMemorySovereignAssetRegistry();
    const { sovereignAssetId, contentIdentity, signed } = registerAsset(bytes, 'principal:alice');
    registry.register(signed);

    // The copier takes the raw bytes into an unrelated context.
    const copiedBytes = new TextEncoder().encode('hello-sovereign-world');
    const copiedIdentity = computeContentIdentity(copiedBytes);

    // Possession is an observable fact: the content digest matches.
    expect(contentIdentitiesEqual(copiedIdentity, contentIdentity)).toBe(true);

    // But no new SovereignAssetId or authority claim exists for the copier
    // merely because they hold matching bytes.
    expect(registry.findByContentDigest(copiedIdentity)).toHaveLength(1);

    // The original asset's authority history is unaffected by the copy.
    const resolved = await resolveSovereignAsset(registry, sovereignAssetId);
    expect(resolved?.manifest.authorityClaims).toEqual([]);
    expect(resolved?.manifest.registrant).toBe('principal:alice');
    const verification = await verifySovereignManifest(resolved!, { contentBytes: bytes });
    expect(verification.valid).toBe(true);
  });
});
