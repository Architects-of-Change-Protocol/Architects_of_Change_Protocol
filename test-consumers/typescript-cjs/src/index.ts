import type { CapabilityToken, ConsentGrant, AuditEventEnvelope, ScopedAccessRequest } from '@aoc/protocol';
import type { AuditEventEnvelope as ContractsAuditEventEnvelope } from '@aoc/protocol/contracts';
import { ClaimType } from '@aoc/protocol/claims';
import type { CanonicalClaim } from '@aoc/protocol/claims';
import type { ProtocolError } from '@aoc/protocol/errors';
import type { RevocationLookup } from '@aoc/protocol/adapters';
import { AdapterRegistry, AdapterTokens } from '@aoc/protocol/runtime-registry';
import { CANONICAL_JSON_PROFILE, canonicalizeJSON } from '@aoc/protocol/canonical';
import {
  buildSovereignExternalReference,
  computeContentIdentity,
  contentIdentitiesEqual,
  isValidSovereignSubjectRef,
  mintSovereignAssetId,
  parseSovereignAssetId,
  sovereignExternalReferencesEqual,
  toSovereignSubjectRef,
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
import type {
  SovereignAssetId,
  ContentIdentity,
  SovereignExternalReference,
  SovereignSubjectRef,
} from '@aoc/protocol/identity';
import {
  buildSovereigntyCapabilityInvocation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isValidSovereigntyCapabilityInvocationEvidence,
  SOVEREIGNTY_CAPABILITY_IDS,
  getSovereigntyCapability,
  getSovereigntyCapabilityByKey,
  isSovereigntyCapabilityId,
  isSovereigntyCapabilityVersion,
  listSovereigntyCapabilities,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  SovereigntyCapabilityImplementation,
  SovereigntyCapabilityDefinition,
  SovereigntyCapabilityRef,
} from '@aoc/protocol/sovereignty-capabilities';
import type { AuditEventSink } from '@aoc/protocol/adapters';

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
    // A manifest that declares no contentIdentity asserted no integrity and
    // must never match a content lookup.
    return [...this.records.values()].flatMap((versions) => [...versions.values()])
      .filter((signed) => signed.manifest.contentIdentity !== undefined
        && contentIdentitiesEqual(signed.manifest.contentIdentity, identity));
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
  if (!resolved.manifest.contentIdentity || !contentIdentitiesEqual(resolved.manifest.contentIdentity, contentIdentity)) {
    throw new Error('byte-backed manifest lost its content identity');
  }
  if (!verification.valid) {
    throw new Error('verification failed');
  }
  const tampered = { ...resolved, manifest: { ...resolved.manifest, registrant: 'principal:attacker' } };
  if ((await verifySovereignManifest(tampered)).valid) throw new Error('tampering accepted');
  if ('storage' in manifest || 'url' in manifest || 'cid' in manifest) throw new Error('storage leaked into identity');
}

/**
 * A sovereign subject with no byte representation at all: an object in a
 * namespace @aoc/protocol has never heard of, identified, signed, serialized
 * and verified without fabricating any content integrity material.
 */
async function nonByteSubjectAcceptance(): Promise<string> {
  const sovereignAssetId = parseSovereignAssetId(mintSovereignAssetId());
  const externalReference: SovereignExternalReference = buildSovereignExternalReference({
    namespace: 'alien-system-v47',
    id: 'alien-resource-92817',
    locator: 'future://provider/object/92817',
  });

  const subject: SovereignSubjectRef = { sovereignAssetId, externalReference };
  if (!isValidSovereignSubjectRef(subject)) throw new Error('subject reference rejected');

  const manifest = buildSovereignManifestV1({
    sovereignAssetId,
    externalReference,
    registrant: 'principal:consumer',
    // deliberately NO contentIdentity
  });
  if ('contentIdentity' in manifest) throw new Error('absent contentIdentity was serialized, not omitted');
  if (canonicalizeJSON(manifest).includes('contentIdentity')) throw new Error('canonical payload leaked contentIdentity');

  const { signingKey, privateKeyPem } = generateSovereignKeyPair();
  const signed = signSovereignManifest(manifest, privateKeyPem, signingKey);

  const roundTripped = JSON.parse(JSON.stringify(signed)) as SignedSovereignManifest;
  if (!roundTripped.manifest.externalReference
    || !sovereignExternalReferencesEqual(roundTripped.manifest.externalReference, externalReference)) {
    throw new Error('external reference did not survive serialization exactly');
  }
  if (roundTripped.manifest.externalReference.locator !== 'future://provider/object/92817') {
    throw new Error('locator did not survive serialization');
  }
  if (computeManifestDigest(roundTripped.manifest) !== signed.manifestDigest) throw new Error('digest mismatch');

  const verification = await verifySovereignManifest(roundTripped);
  if (verification.checks.manifestStructure !== 'valid') throw new Error('manifestStructure not valid');
  if (verification.checks.manifestDigest !== 'valid') throw new Error('manifestDigest not valid');
  if (verification.checks.signature !== 'valid') throw new Error('signature not valid');
  if (verification.checks.contentDigest !== 'not_performed') {
    throw new Error(`contentDigest must be not_performed, got ${verification.checks.contentDigest}`);
  }
  if (!verification.valid) throw new Error('non-byte subject manifest failed verification');

  // Supplying unrelated bytes must not fabricate a comparison target.
  const withBytes = await verifySovereignManifest(roundTripped, {
    contentBytes: new TextEncoder().encode('unrelated bytes'),
  });
  if (withBytes.checks.contentDigest !== 'not_performed') throw new Error('content check was fabricated');

  // Tampering the signed reference must be detected.
  const tampered = {
    ...roundTripped,
    manifest: {
      ...roundTripped.manifest,
      externalReference: { ...roundTripped.manifest.externalReference, id: 'alien-resource-00000' },
    },
  };
  if ((await verifySovereignManifest(tampered)).valid) throw new Error('tampered external reference accepted');

  if (toSovereignSubjectRef(roundTripped.manifest).sovereignAssetId !== sovereignAssetId) {
    throw new Error('subject narrowing lost the sovereign identity');
  }

  // This whole flow imports nothing but `@aoc/protocol` subpaths — no
  // Enterprise, runtime, provider or storage package is installed in the
  // fixture at all. The runtime proof that those modules cannot even be
  // resolved lives in the javascript-cjs fixture (which has `require`
  // available untyped), alongside the packed-package forbidden-term check
  // in scripts/validate-protocol-consumer.mjs.

  return sovereignAssetId;
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
  if (!isSovereigntyCapabilityVersion(identity.version)) {
    throw new Error('Identity has no explicit capability version');
  }
  if (isSovereigntyCapabilityVersion('1e2.0.0') || isSovereigntyCapabilityVersion('-1.2.3')) {
    throw new Error('malformed capability version accepted');
  }

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


/**
 * An EXTERNAL developer, importing only the packed tarball, implements the
 * public `SovereigntyCapabilityImplementation` interface and runs it through
 * the public invoker. This is demo/test code, not a real mineral: SM-04 owns
 * the first production Identity and Integrity capsules.
 */
async function sovereigntyCapabilityInvocationAcceptance(): Promise<string> {
  const definition = getSovereigntyCapability(SOVEREIGNTY_CAPABILITY_IDS.integrity);
  if (!definition) throw new Error('canonical Integrity definition not found');

  // (3) derive an exact ref from the canonical registry entry.
  const capability = getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef;
  if (capability.id !== definition.id || capability.version !== definition.version) {
    throw new Error('derived capability ref drifted from the canonical definition');
  }

  // (5) a consumer-defined implementation conforming to the public interface.
  const consumerImplementation: SovereigntyCapabilityImplementation<Uint8Array, { byteLength: number }> = {
    capability,
    async invoke(invocation) {
      if (!(invocation.input instanceof Uint8Array)) {
        throw new Error('raw byte input did not survive the common invocation layer');
      }
      return { status: 'succeeded', output: { byteLength: invocation.input.byteLength } };
    },
  };

  const deliveredEvents: ContractsAuditEventEnvelope[] = [];
  const consumerSink: AuditEventSink = {
    recordAuditEvent(event) {
      deliveredEvents.push(event);
    },
  };

  // (4) construct a valid invocation — no subject at all, raw bytes as input.
  const invocation = buildSovereigntyCapabilityInvocation({
    capability,
    correlationId: 'consumer-flow-001',
    input: new Uint8Array([1, 2, 3, 4]),
  });
  if (invocation.subject !== undefined) throw new Error('common invocation invented a subject');

  // (6/7) invoke through the common invoker and receive a result.
  const result = await invokeSovereigntyCapability(invocation, consumerImplementation, {
    evidenceSink: consumerSink,
  });
  if (result.status !== 'succeeded') throw new Error('consumer capability invocation did not succeed');
  if (result.output.byteLength !== 4) throw new Error('capability output did not survive the result');
  if (result.invocationId !== invocation.invocationId) throw new Error('result invocation id drifted');

  // (8) capability-attributed evidence.
  const evidence = result.evidence;
  if (!isValidSovereigntyCapabilityInvocationEvidence(evidence)) throw new Error('evidence is not valid');
  if (evidence.capability.id !== 'aoc:sovereignty-capability:integrity') {
    throw new Error('evidence does not attribute the canonical Integrity capability');
  }
  if (evidence.capability.version !== definition.version) throw new Error('evidence lost the capability version');
  if (evidence.correlationId !== 'consumer-flow-001') throw new Error('evidence lost the correlation id');
  if ('subject' in evidence) throw new Error('evidence invented a subject');
  const serializedEvidence = JSON.stringify(evidence);
  if (serializedEvidence.includes('byteLength') || serializedEvidence.includes('input')) {
    throw new Error('evidence embedded a raw capability payload');
  }
  if (canonicalizeJSON(JSON.parse(serializedEvidence)) !== canonicalizeJSON(evidence)) {
    throw new Error('evidence did not survive a canonical round trip');
  }
  if (deliveredEvents.length !== 1) throw new Error('evidence sink did not receive exactly one record');
  if (deliveredEvents[0].eventId !== invocation.invocationId) throw new Error('delivered record identity drifted');

  // An existing SM-02 subject travels through the same socket unchanged.
  const subject: SovereignSubjectRef = {
    sovereignAssetId: mintSovereignAssetId(),
    externalReference: buildSovereignExternalReference({
      namespace: 'alien-system-v47',
      id: 'alien-resource-92817',
      locator: 'future://provider/object/92817',
    }),
  };
  const verifiability = getSovereigntyCapabilityRefByKey('verifiability') as SovereigntyCapabilityRef;
  const withSubject = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({ capability: verifiability, subject, input: { arbitrary: 'value' } }),
    {
      capability: verifiability,
      async invoke() {
        return { status: 'succeeded' as const, output: { testValue: true } };
      },
    },
  );
  if (withSubject.subject?.sovereignAssetId !== subject.sovereignAssetId) {
    throw new Error('alien subject did not survive the invocation');
  }
  if (withSubject.evidence.subject?.externalReference?.id !== 'alien-resource-92817') {
    throw new Error('alien external reference did not survive into evidence');
  }

  // A mismatched implementation is rejected before it can run.
  let rejected = false;
  try {
    await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({ capability, input: new Uint8Array() }),
      { capability: verifiability, async invoke() { return { status: 'succeeded' as const, output: 1 }; } },
    );
  } catch {
    rejected = true;
  }
  if (!rejected) throw new Error('capability mismatch was not rejected');

  // (9) no Enterprise package is imported anywhere in this fixture.
  return evidence.invocationId;
}

const sovereigntyCapabilityCount = sovereigntyCapabilityAcceptance();

void (async (): Promise<void> => {
  await sovereignAssetAcceptance();
  const nonByteSubjectId = await nonByteSubjectAcceptance();
  console.log(`typescript-cjs non-byte sovereign subject OK: ${nonByteSubjectId}`);
  const invocationId = await sovereigntyCapabilityInvocationAcceptance();
  console.log(`typescript-cjs sovereignty capability invocation OK: ${invocationId}`);
})().catch((error) => {
  throw error;
});

console.log(
  `typescript-cjs consumer OK: token=${token.tokenId} claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${sovereigntyCapabilityCount}`,
);
