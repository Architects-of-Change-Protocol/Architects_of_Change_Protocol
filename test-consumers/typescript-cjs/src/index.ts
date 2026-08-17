import type { CapabilityToken, ConsentGrant, AuditEventEnvelope, ScopedAccessRequest } from '@aoc/protocol';
import type { AuditEventEnvelope as ContractsAuditEventEnvelope } from '@aoc/protocol/contracts';
import { ClaimType } from '@aoc/protocol/claims';
import type { CanonicalClaim } from '@aoc/protocol/claims';
import type { ProtocolError } from '@aoc/protocol/errors';
import type { RevocationLookup } from '@aoc/protocol/adapters';
import { AdapterRegistry, AdapterTokens } from '@aoc/protocol/runtime-registry';
import { CANONICAL_JSON_PROFILE, canonicalizeJSON } from '@aoc/protocol/canonical';
import {
  computeContentIdentity,
  contentIdentitiesEqual,
  mintSovereignAssetId,
  parseSovereignAssetId,
} from '@aoc/protocol/identity';
import {
  buildSovereignManifestV1,
  computeManifestDigest,
  generateSovereignKeyPair,
  resolveSovereignAsset,
  resolveSovereignAssetVersion,
  signSovereignManifest,
  verifySovereignManifest,
} from '@aoc/protocol/manifest';
import type { SignedSovereignManifest, SovereignAssetRegistry } from '@aoc/protocol/manifest';
import type { SovereignAssetId, ContentIdentity } from '@aoc/protocol/identity';
import {
  SOVEREIGNTY_CAPABILITY_IDS,
  getSovereigntyCapability,
  getSovereigntyCapabilityByKey,
  isSovereigntyCapabilityId,
  listSovereigntyCapabilities,
} from '@aoc/protocol/sovereignty-capabilities';
import type { SovereigntyCapabilityDefinition } from '@aoc/protocol/sovereignty-capabilities';

const assertType = <T>(_value: T): void => undefined;

const token: CapabilityToken = {
  schemaVersion: '1.0.0',
  tokenId: 'tok-1',
  issuer: 'issuer-1',
  subject: 'subject-1',
  resource: { kind: 'document', id: 'doc-1' },
  scope: ['read'],
  expiresAt: new Date().toISOString(),
  proof: { proofType: 'jwt', issuedAt: new Date().toISOString() },
};

assertType<ConsentGrant | undefined>(undefined);
assertType<AuditEventEnvelope | undefined>(undefined);
assertType<ContractsAuditEventEnvelope | undefined>(undefined);
assertType<ScopedAccessRequest | undefined>(undefined);
assertType<CanonicalClaim | undefined>(undefined);
assertType<ProtocolError | undefined>(undefined);
assertType<RevocationLookup | undefined>(undefined);

const registry = new AdapterRegistry();
registry.register(
  AdapterTokens.AuditEventSink,
  { recordAuditEvent: () => undefined },
  { implementation: 'noop', source: 'test-consumer', version: '0.0.0' },
);

if (ClaimType.Identity !== 'Identity') {
  throw new Error('ClaimType.Identity runtime value mismatch');
}

class ConsumerRegistry implements SovereignAssetRegistry {
  private readonly records = new Map<SovereignAssetId, Map<number, SignedSovereignManifest>>();
  register(signed: SignedSovereignManifest): void {
    const id = signed.manifest.sovereignAssetId;
    const versions = this.records.get(id) ?? new Map<number, SignedSovereignManifest>();
    if (versions.has(signed.manifest.manifestVersion)) throw new Error('historical substitution rejected');
    versions.set(signed.manifest.manifestVersion, signed);
    this.records.set(id, versions);
  }
  resolve(id: SovereignAssetId): SignedSovereignManifest | null {
    const versions = this.records.get(id);
    return versions ? versions.get(Math.max(...versions.keys())) ?? null : null;
  }
  resolveVersion(id: SovereignAssetId, version: number): SignedSovereignManifest | null {
    return this.records.get(id)?.get(version) ?? null;
  }
  findByContentDigest(identity: ContentIdentity): readonly SignedSovereignManifest[] {
    return [...this.records.values()].flatMap((versions) => [...versions.values()])
      .filter((signed) => contentIdentitiesEqual(signed.manifest.contentIdentity, identity));
  }
}

async function sovereignAssetAcceptance(): Promise<void> {
  const bytes = new TextEncoder().encode('external consumer sovereign bytes');
  const sovereignAssetId = parseSovereignAssetId(mintSovereignAssetId());
  const contentIdentity = computeContentIdentity(bytes);
  const manifest = buildSovereignManifestV1({ sovereignAssetId, contentIdentity, registrant: 'principal:consumer' });
  if (canonicalizeJSON(manifest) !== canonicalizeJSON({ ...manifest })) throw new Error('canonicalization mismatch');
  if (manifest.canonicalizationProfile !== CANONICAL_JSON_PROFILE) throw new Error('profile mismatch');
  const { signingKey, privateKeyPem } = generateSovereignKeyPair();
  const signed = signSovereignManifest(manifest, privateKeyPem, signingKey);
  if (computeManifestDigest(manifest) !== signed.manifestDigest) throw new Error('digest mismatch');
  const sovereignRegistry = new ConsumerRegistry();
  sovereignRegistry.register(signed);
  const resolved = await resolveSovereignAsset(sovereignRegistry, sovereignAssetId);
  const historical = await resolveSovereignAssetVersion(sovereignRegistry, sovereignAssetId, 1);
  if (!resolved || historical !== resolved || resolved.manifest.sovereignAssetId !== sovereignAssetId) {
    throw new Error('registry resolution mismatch');
  }
  const verification = await verifySovereignManifest(resolved, { contentBytes: bytes });
  if (!verification.valid || !contentIdentitiesEqual(resolved.manifest.contentIdentity, contentIdentity)) {
    throw new Error('verification failed');
  }
  const tampered = { ...resolved, manifest: { ...resolved.manifest, registrant: 'principal:attacker' } };
  if ((await verifySovereignManifest(tampered)).valid) throw new Error('tampering accepted');
  if ('storage' in manifest || 'url' in manifest || 'cid' in manifest) throw new Error('storage leaked into identity');
}

function sovereigntyCapabilityAcceptance(): number {
  const capabilities: readonly SovereigntyCapabilityDefinition[] = listSovereigntyCapabilities();
  if (capabilities.length !== 8) throw new Error(`expected 8 sovereignty capabilities, got ${capabilities.length}`);

  const canonicalOrder = [
    'identity',
    'integrity',
    'provenance',
    'portability',
    'interoperability',
    'verifiability',
    'licensing_terms',
    'governance_compatibility',
  ];
  if (capabilities.map((capability) => capability.key).join(',') !== canonicalOrder.join(',')) {
    throw new Error('sovereignty capability enumeration is not in canonical order');
  }

  const identity = getSovereigntyCapability(SOVEREIGNTY_CAPABILITY_IDS.identity);
  if (!identity || identity.name !== 'Identity' || identity.id !== 'aoc:sovereignty-capability:identity') {
    throw new Error('Identity lookup by canonical id failed');
  }
  if (!/^\d+\.\d+\.\d+$/.test(identity.version)) throw new Error('Identity has no explicit capability version');

  const governance = getSovereigntyCapabilityByKey('governance_compatibility');
  if (!governance || governance.id !== 'aoc:sovereignty-capability:governance-compatibility') {
    throw new Error('Governance Compatibility lookup failed');
  }

  if (getSovereigntyCapability('aoc:sovereignty-capability:wallet') !== undefined) {
    throw new Error('unknown sovereignty capability id resolved');
  }
  if (isSovereigntyCapabilityId('my-company.special-capability')) {
    throw new Error('third-party id accepted as canonical');
  }

  return capabilities.length;
}

const sovereigntyCapabilityCount = sovereigntyCapabilityAcceptance();

void sovereignAssetAcceptance().catch((error) => {
  throw error;
});

console.log(
  `typescript-cjs consumer OK: token=${token.tokenId} claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${sovereigntyCapabilityCount}`,
);
