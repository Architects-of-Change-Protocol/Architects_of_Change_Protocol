import { mintSovereignAssetId, computeContentIdentity } from '@aoc/protocol/identity';
import {
  SOVEREIGN_MANIFEST_SCHEMA_VERSION,
  SovereignAssetState,
  buildSovereignManifestV1,
  signSovereignManifest,
  verifySovereignManifest,
  generateSovereignKeyPair,
  validateSovereignManifestV1,
  computeManifestDigest,
} from '@aoc/protocol/manifest';
import { CANONICAL_JSON_PROFILE } from '@aoc/protocol/canonical';
import type { VerificationKeyResolver } from '@aoc/protocol/adapters';

const HELLO_BYTES = new TextEncoder().encode('hello-sovereign-world');

function registerHelloAsset() {
  const sovereignAssetId = mintSovereignAssetId();
  const contentIdentity = computeContentIdentity(HELLO_BYTES);
  const { signingKey, privateKeyPem } = generateSovereignKeyPair();

  const manifest = buildSovereignManifestV1({
    sovereignAssetId,
    contentIdentity,
    registrant: 'principal:alice',
  });

  const signed = signSovereignManifest(manifest, privateKeyPem, signingKey);
  return { sovereignAssetId, contentIdentity, signingKey, privateKeyPem, manifest, signed };
}

describe('Sovereign Asset — basic registration and independent verification (§32)', () => {
  it('registers hello-sovereign-world and verifies independently', async () => {
    const { sovereignAssetId, signed } = registerHelloAsset();

    expect(signed.manifest.sovereignAssetId).toBe(sovereignAssetId);
    expect(signed.manifest.manifestVersion).toBe(1);
    expect(signed.manifest.state).toBe(SovereignAssetState.Active);
    expect(signed.manifest.registrant).toBe('principal:alice');
    expect(signed.manifest.schemaVersion).toBe(SOVEREIGN_MANIFEST_SCHEMA_VERSION);
    expect(signed.manifest.canonicalizationProfile).toBe(CANONICAL_JSON_PROFILE);

    const result = await verifySovereignManifest(signed, { contentBytes: HELLO_BYTES });
    expect(result.valid).toBe(true);
    expect(result.checks).toEqual({
      manifestStructure: 'valid',
      manifestDigest: 'valid',
      signature: 'valid',
      contentDigest: 'valid',
      issuerBinding: 'not_performed',
    });
    expect(result.reasons).toEqual([]);
  });

  it('honestly reports content verification as not performed when no bytes are supplied, without pretending it passed', async () => {
    const { signed } = registerHelloAsset();
    const result = await verifySovereignManifest(signed);
    expect(result.checks.contentDigest).toBe('not_performed');
    expect(result.valid).toBe(true); // crypto checks alone can still pass
  });
});

describe('Sovereign Asset — issuer binding (§16) — signatureValid ≠ issuerIdentityVerified', () => {
  it('reports issuerBinding as not_performed when no resolver is supplied', async () => {
    const { signed } = registerHelloAsset();
    const result = await verifySovereignManifest(signed);
    expect(result.checks.signature).toBe('valid');
    expect(result.checks.issuerBinding).toBe('not_performed');
  });

  it('reports issuerBinding as verified only when the resolver returns a matching key binding', async () => {
    const { signed, signingKey } = registerHelloAsset();
    const resolver: VerificationKeyResolver = {
      resolveVerificationKey: async (issuer) =>
        issuer === 'principal:alice' ? { keyId: signingKey.keyId, issuer } : undefined,
    };

    const result = await verifySovereignManifest(signed, { verificationKeyResolver: resolver });
    expect(result.checks.signature).toBe('valid');
    expect(result.checks.issuerBinding).toBe('verified');
    expect(result.valid).toBe(true);
  });

  it('reports issuerBinding as unverified — and fails overall — when the resolver has no binding for the issuer', async () => {
    const { signed } = registerHelloAsset();
    const resolver: VerificationKeyResolver = {
      resolveVerificationKey: async () => undefined,
    };

    const result = await verifySovereignManifest(signed, { verificationKeyResolver: resolver });
    expect(result.checks.signature).toBe('valid'); // the signature itself is still cryptographically valid
    expect(result.checks.issuerBinding).toBe('unverified');
    expect(result.reasons).toContain('ISSUER_BINDING_UNVERIFIED');
    expect(result.valid).toBe(false); // but overall verification fails when binding was attempted and failed
  });

  it('reports issuerBinding as unverified when the resolver returns a key bound to a different keyId', async () => {
    const { signed } = registerHelloAsset();
    const resolver: VerificationKeyResolver = {
      resolveVerificationKey: async (issuer) => ({ keyId: 'some-other-key-id', issuer }),
    };

    const result = await verifySovereignManifest(signed, { verificationKeyResolver: resolver });
    expect(result.checks.issuerBinding).toBe('unverified');
    expect(result.valid).toBe(false);
  });
});

describe('Sovereign Asset — manifest tampering (§33)', () => {
  const mutationCases: Array<[string, (signed: ReturnType<typeof registerHelloAsset>['signed']) => any]> = [
    ['registrant', (signed) => ({ ...signed, manifest: { ...signed.manifest, registrant: 'principal:mallory' } })],
    [
      'contentDigest',
      (signed) => ({
        ...signed,
        manifest: { ...signed.manifest, contentIdentity: { ...signed.manifest.contentIdentity, digest: 'f'.repeat(64) } },
      }),
    ],
    ['state', (signed) => ({ ...signed, manifest: { ...signed.manifest, state: SovereignAssetState.Withdrawn } })],
    ['sovereignAssetId', (signed) => ({ ...signed, manifest: { ...signed.manifest, sovereignAssetId: mintSovereignAssetId() } })],
    ['timestamp', (signed) => ({ ...signed, manifest: { ...signed.manifest, createdAt: new Date(0).toISOString() } })],
  ];

  it.each(mutationCases)('invalidates verification when %s is mutated after signing', async (_label, mutate) => {
    const { signed } = registerHelloAsset();
    const tampered = mutate(signed);

    const result = await verifySovereignManifest(tampered);
    expect(result.valid).toBe(false);
    expect(result.checks.manifestDigest).toBe('invalid');
    expect(result.reasons).toContain('MANIFEST_DIGEST_MISMATCH');
  });
});

describe('Sovereign Asset — wrong content supplied (§34)', () => {
  it('signature/manifest integrity remain valid while content verification fails independently', async () => {
    const { signed } = registerHelloAsset();
    const wrongBytes = new TextEncoder().encode('this is not the right content');

    const result = await verifySovereignManifest(signed, { contentBytes: wrongBytes });

    expect(result.checks.signature).toBe('valid');
    expect(result.checks.manifestDigest).toBe('valid');
    expect(result.checks.contentDigest).toBe('invalid');
    expect(result.reasons).toContain('CONTENT_DIGEST_MISMATCH');
    expect(result.valid).toBe(false);
  });
});

describe('Sovereign Asset — security / negative-test matrix (§39)', () => {
  it('rejects a malformed SovereignAssetId at manifest-build time', () => {
    const contentIdentity = computeContentIdentity(HELLO_BYTES);
    expect(() =>
      buildSovereignManifestV1({
        sovereignAssetId: 'not-a-valid-id',
        contentIdentity,
        registrant: 'principal:alice',
      }),
    ).toThrow(/INVALID_SOVEREIGN_ASSET_ID/);
  });

  it('rejects a malformed content digest at manifest-build time', () => {
    expect(() =>
      buildSovereignManifestV1({
        sovereignAssetId: mintSovereignAssetId(),
        contentIdentity: { algorithm: 'sha256' as any, digest: 'not-hex' },
        registrant: 'principal:alice',
      }),
    ).toThrow(/INVALID_CONTENT_IDENTITY/);
  });

  it('rejects an unsupported digest algorithm at manifest-build time', () => {
    expect(() =>
      buildSovereignManifestV1({
        sovereignAssetId: mintSovereignAssetId(),
        contentIdentity: { algorithm: 'sha1' as any, digest: 'a'.repeat(40) },
        registrant: 'principal:alice',
      }),
    ).toThrow(/INVALID_CONTENT_IDENTITY/);
  });

  it('rejects a malformed state at manifest-build time', () => {
    const contentIdentity = computeContentIdentity(HELLO_BYTES);
    expect(() =>
      buildSovereignManifestV1({
        sovereignAssetId: mintSovereignAssetId(),
        contentIdentity,
        registrant: 'principal:alice',
        state: 'revoked-access' as any,
      }),
    ).toThrow(/INVALID_STATE/);
  });

  it('rejects an invalid timestamp at manifest-build time', () => {
    const contentIdentity = computeContentIdentity(HELLO_BYTES);
    expect(() =>
      buildSovereignManifestV1({
        sovereignAssetId: mintSovereignAssetId(),
        contentIdentity,
        registrant: 'principal:alice',
        createdAt: 'not-a-timestamp',
      }),
    ).toThrow(/INVALID_TIMESTAMP/);
  });

  it('fails closed on an unknown/unsupported manifest schema version', async () => {
    const { signed } = registerHelloAsset();
    const tampered = {
      ...signed,
      manifest: { ...signed.manifest, schemaVersion: 'aoc-sovereign-manifest/2' as any },
    };
    const result = await verifySovereignManifest(tampered);
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('UNSUPPORTED_SCHEMA_VERSION');
  });

  it('fails closed on an unsupported canonicalization profile', async () => {
    const { signed } = registerHelloAsset();
    const tampered = {
      ...signed,
      manifest: { ...signed.manifest, canonicalizationProfile: 'jcs/rfc8785' as any },
    };
    const result = await verifySovereignManifest(tampered);
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('UNSUPPORTED_CANONICALIZATION_PROFILE');
  });

  it('rejects an invalid (non-positive, non-integer) manifestVersion', () => {
    const contentIdentity = computeContentIdentity(HELLO_BYTES);
    expect(() =>
      buildSovereignManifestV1({
        sovereignAssetId: mintSovereignAssetId(),
        contentIdentity,
        registrant: 'principal:alice',
        manifestVersion: 0,
      }),
    ).toThrow(/INVALID_MANIFEST_VERSION/);

    expect(() =>
      buildSovereignManifestV1({
        sovereignAssetId: mintSovereignAssetId(),
        contentIdentity,
        registrant: 'principal:alice',
        manifestVersion: 1.5,
      }),
    ).toThrow(/INVALID_MANIFEST_VERSION/);
  });

  it('fails closed when the signature is mutated', async () => {
    const { signed } = registerHelloAsset();
    const tampered = { ...signed, proof: { ...signed.proof, signature: signed.proof.signature.slice(0, -4) + 'abcd' } };
    const result = await verifySovereignManifest(tampered);
    expect(result.checks.signature).toBe('invalid');
    expect(result.valid).toBe(false);
  });

  it('fails closed when verified against the wrong public key', async () => {
    const { signed } = registerHelloAsset();
    const otherKeyPair = generateSovereignKeyPair();
    const tampered = { ...signed, proof: { ...signed.proof, publicKey: otherKeyPair.signingKey.publicKey } };
    const result = await verifySovereignManifest(tampered);
    expect(result.checks.signature).toBe('invalid');
    expect(result.valid).toBe(false);
  });

  it('detects a corrupted manifestDigest even when the signature field is untouched', async () => {
    const { signed } = registerHelloAsset();
    const tampered = { ...signed, manifestDigest: '0'.repeat(64) };
    const result = await verifySovereignManifest(tampered);
    expect(result.checks.manifestDigest).toBe('invalid');
    expect(result.reasons).toContain('MANIFEST_DIGEST_MISMATCH');
    expect(result.valid).toBe(false);
  });

  it('computeManifestDigest and the proof payloadHash always agree for an untampered manifest', () => {
    const { signed, manifest } = registerHelloAsset();
    expect(computeManifestDigest(manifest)).toBe(signed.manifestDigest);
    expect(signed.proof.payloadHash).toBe(signed.manifestDigest);
  });

  it('validateSovereignManifestV1 reports every structural defect, not just the first', () => {
    const invalid = {
      schemaVersion: 'wrong' as any,
      canonicalizationProfile: 'wrong' as any,
      sovereignAssetId: 'garbage',
      manifestVersion: -1,
      contentIdentity: { algorithm: 'sha256' as any, digest: 'not-hex' },
      registrant: 'principal:alice',
      authorityClaims: [],
      state: 'garbage' as any,
      createdAt: 'garbage',
    };
    const result = validateSovereignManifestV1(invalid);
    expect(result.valid).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        'UNSUPPORTED_SCHEMA_VERSION',
        'UNSUPPORTED_CANONICALIZATION_PROFILE',
        'INVALID_SOVEREIGN_ASSET_ID',
        'INVALID_MANIFEST_VERSION',
        'INVALID_CONTENT_IDENTITY',
        'INVALID_STATE',
        'INVALID_TIMESTAMP',
      ]),
    );
  });
});
