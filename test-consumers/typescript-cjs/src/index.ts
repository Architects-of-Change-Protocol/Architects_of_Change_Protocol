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
  createIdentitySovereigntyCapabilityImplementation,
  createIntegritySovereigntyCapabilityImplementation,
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
  IdentitySovereigntyCapabilityInput,
  IntegritySovereigntyCapabilityInput,
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

/**
 * SM-04: the two PRODUCTION Sovereignty Minerals, consumed end-to-end by an
 * external developer who has installed nothing but the packed @aoc/protocol
 * tarball. No fake implementation, no test fixture, no Enterprise package, no
 * source import — the capsules come from the public
 * `@aoc/protocol/sovereignty-capabilities` subpath and execute through the
 * same `invokeSovereigntyCapability` socket a third-party implementation uses.
 */
async function productionSovereigntyMineralAcceptance(): Promise<string> {
  const correlationId = 'sm04-photo-onboarding-001';
  const bytes = new TextEncoder().encode('hello sovereign world');

  const integrityRef = getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef;
  const identityRef = getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef;

  // ---- FLOW B: real AOC.INTEGRITY over bytes, with no sovereign identity ----
  const integrityImplementation = createIntegritySovereigntyCapabilityImplementation();
  if (integrityImplementation.capability.id !== 'aoc:sovereignty-capability:integrity') {
    throw new Error('production Integrity capsule does not advertise the canonical id');
  }
  if (integrityImplementation.capability.version !== integrityRef.version) {
    throw new Error('production Integrity capsule drifted from the canonical capability version');
  }

  const integrityInput: IntegritySovereigntyCapabilityInput = { operation: 'compute-content-identity', bytes };
  const integrityResult = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({ capability: integrityRef, correlationId, input: integrityInput }),
    integrityImplementation,
  );
  if (integrityResult.status !== 'succeeded') throw new Error('production Integrity invocation failed');
  if (integrityResult.output.operation !== 'compute-content-identity') throw new Error('wrong Integrity operation');
  const contentIdentity = integrityResult.output.contentIdentity;

  // Independent equivalence against the public primitive.
  if (!contentIdentitiesEqual(contentIdentity, computeContentIdentity(bytes))) {
    throw new Error('capability ContentIdentity differs from the computeContentIdentity primitive');
  }
  if (integrityResult.subject !== undefined) throw new Error('Integrity invented a sovereign subject');

  // A real verification, and a real negative check that is NOT an execution failure.
  const verifyOk = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: integrityRef,
      input: { operation: 'verify-content-identity', bytes, expected: contentIdentity } as IntegritySovereigntyCapabilityInput,
    }),
    integrityImplementation,
  );
  if (verifyOk.status !== 'succeeded' || verifyOk.output.operation !== 'verify-content-identity') {
    throw new Error('production Integrity verification did not execute');
  }
  if (!verifyOk.output.check.valid) throw new Error('matching bytes reported as invalid');

  const verifyMismatch = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: integrityRef,
      input: {
        operation: 'verify-content-identity',
        bytes: new TextEncoder().encode('different bytes'),
        expected: contentIdentity,
      } as IntegritySovereigntyCapabilityInput,
    }),
    integrityImplementation,
  );
  if (verifyMismatch.status !== 'succeeded') {
    throw new Error('a digest mismatch must be a successful check with a negative result, not a failed execution');
  }
  if (verifyMismatch.output.operation !== 'verify-content-identity') throw new Error('wrong Integrity operation');
  if (verifyMismatch.output.check.valid || verifyMismatch.output.check.reason !== 'CONTENT_DIGEST_MISMATCH') {
    throw new Error('mismatch result was not preserved');
  }
  if (verifyMismatch.evidence.outcome !== 'succeeded') throw new Error('mismatch was recorded as a failed invocation');

  // ---- FLOW A/C: real AOC.IDENTITY, binding the Integrity output ----
  const identityImplementation = createIdentitySovereigntyCapabilityImplementation();
  if (identityImplementation.capability.id !== 'aoc:sovereignty-capability:identity') {
    throw new Error('production Identity capsule does not advertise the canonical id');
  }
  if (identityImplementation.capability.version !== identityRef.version) {
    throw new Error('production Identity capsule drifted from the canonical capability version');
  }

  const identityInput: IdentitySovereigntyCapabilityInput = {
    registrant: 'principal:consumer',
    externalReference: buildSovereignExternalReference({
      namespace: 'alien-system-v47',
      id: 'alien-resource-92817',
      locator: 'future://provider/object/92817',
    }),
    contentIdentity,
  };
  const identityResult = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({ capability: identityRef, correlationId, input: identityInput }),
    identityImplementation,
  );
  if (identityResult.status !== 'succeeded') throw new Error('production Identity invocation failed');

  const { subject, manifest } = identityResult.output;
  if (!isValidSovereignSubjectRef(subject)) throw new Error('Identity produced an invalid subject reference');
  if (subject.sovereignAssetId !== manifest.sovereignAssetId) throw new Error('subject/manifest identity drift');
  if (!manifest.contentIdentity || !contentIdentitiesEqual(manifest.contentIdentity, contentIdentity)) {
    throw new Error('the Identity manifest does not carry the Integrity output');
  }
  if ('proof' in manifest || 'manifestDigest' in manifest) throw new Error('Identity signed its own manifest');
  if (manifest.authorityClaims.length !== 0 || 'originClaim' in manifest) {
    throw new Error('Identity fabricated a provenance claim');
  }
  if (manifest.externalReference?.locator !== 'future://provider/object/92817') {
    throw new Error('the open-world locator did not survive');
  }
  if (identityResult.subject?.sovereignAssetId !== subject.sovereignAssetId) {
    throw new Error('the common result subject is not the newly created subject');
  }

  // Identity with NO ContentIdentity at all stays independently consumable.
  const identityOnly = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: identityRef,
      input: {
        registrant: 'principal:consumer',
        externalReference: buildSovereignExternalReference({
          namespace: 'example:property-registry',
          id: 'folio-92817',
        }),
      } as IdentitySovereigntyCapabilityInput,
    }),
    identityImplementation,
  );
  if (identityOnly.status !== 'succeeded') throw new Error('Identity requires Integrity — it must not');
  if ('contentIdentity' in identityOnly.output.manifest) {
    throw new Error('an absent contentIdentity was serialized rather than omitted');
  }
  if (canonicalizeJSON(identityOnly.output.manifest).includes('contentIdentity')) {
    throw new Error('canonical payload leaked a fabricated contentIdentity');
  }

  // ---- Composition, attribution and evidence hygiene ----
  if (integrityResult.evidence.capability.id !== 'aoc:sovereignty-capability:integrity') {
    throw new Error('Integrity evidence lost its canonical attribution');
  }
  if (identityResult.evidence.capability.id !== 'aoc:sovereignty-capability:identity') {
    throw new Error('Identity evidence lost its canonical attribution');
  }
  if (integrityResult.evidence.capability.version !== integrityRef.version
    || identityResult.evidence.capability.version !== identityRef.version) {
    throw new Error('evidence lost an exact capability version');
  }
  if (integrityResult.invocationId === identityResult.invocationId) {
    throw new Error('two separate mineral invocations shared one invocation id');
  }
  if (integrityResult.evidence.correlationId !== correlationId
    || identityResult.evidence.correlationId !== correlationId) {
    throw new Error('the shared correlation id did not survive both invocations');
  }
  if ('subject' in integrityResult.evidence) throw new Error('Integrity evidence invented a subject');
  if (identityResult.evidence.subject?.sovereignAssetId !== subject.sovereignAssetId) {
    throw new Error('Identity evidence does not carry the newly created subject');
  }
  for (const evidence of [integrityResult.evidence, identityResult.evidence]) {
    if (!isValidSovereigntyCapabilityInvocationEvidence(evidence)) throw new Error('invalid capability evidence');
    const serialized = JSON.stringify(evidence);
    for (const leak of ['hello sovereign world', contentIdentity.digest, 'manifest', 'registrant', 'bytes']) {
      if (serialized.includes(leak)) throw new Error(`generic evidence leaked "${leak}"`);
    }
    if (canonicalizeJSON(JSON.parse(serialized)) !== canonicalizeJSON(evidence)) {
      throw new Error('capability evidence did not survive a canonical round trip');
    }
  }

  // A real manifest digest through the production Integrity capsule, checked
  // against the public primitive.
  const digestResult = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: integrityRef,
      input: { operation: 'compute-manifest-digest', manifest } as IntegritySovereigntyCapabilityInput,
    }),
    integrityImplementation,
  );
  if (digestResult.status !== 'succeeded' || digestResult.output.operation !== 'compute-manifest-digest') {
    throw new Error('production manifest digest did not execute');
  }
  if (digestResult.output.manifestDigest !== computeManifestDigest(manifest)) {
    throw new Error('capability manifest digest differs from the computeManifestDigest primitive');
  }

  // Identity refuses to mint a second identity for an existing subject.
  const alreadyIdentified = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: identityRef,
      subject,
      input: { registrant: 'principal:consumer' } as IdentitySovereigntyCapabilityInput,
    }),
    identityImplementation,
  );
  if (alreadyIdentified.status !== 'failed'
    || alreadyIdentified.reasonCodes[0] !== 'IDENTITY_SUBJECT_ALREADY_EXISTS') {
    throw new Error('Identity minted a second identity for an existing subject');
  }

  return subject.sovereignAssetId;
}

const sovereigntyCapabilityCount = sovereigntyCapabilityAcceptance();

void (async (): Promise<void> => {
  await sovereignAssetAcceptance();
  const nonByteSubjectId = await nonByteSubjectAcceptance();
  console.log(`typescript-cjs non-byte sovereign subject OK: ${nonByteSubjectId}`);
  const invocationId = await sovereigntyCapabilityInvocationAcceptance();
  console.log(`typescript-cjs sovereignty capability invocation OK: ${invocationId}`);
  const productionSubjectId = await productionSovereigntyMineralAcceptance();
  console.log(`typescript-cjs production Identity + Integrity minerals OK: ${productionSubjectId}`);
})().catch((error) => {
  throw error;
});

console.log(
  `typescript-cjs consumer OK: token=${token.tokenId} claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${sovereigntyCapabilityCount}`,
);
