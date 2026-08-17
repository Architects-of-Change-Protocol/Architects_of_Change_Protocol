import type { CapabilityToken, ConsentGrant, AuditEventEnvelope, ScopedAccessRequest } from '@aoc/protocol';
import type { AuditEventEnvelope as ContractsAuditEventEnvelope } from '@aoc/protocol/contracts';
import { ClaimType, StandingStatus } from '@aoc/protocol/claims';
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
  AuthorityClaimKind,
  DerivationRelationKind,
  buildSovereignManifestV1,
  computeManifestDigest,
  generateSovereignKeyPair,
  isValidDerivationClaim,
  resolveSovereignAsset,
  resolveSovereignAssetVersion,
  signSovereignManifest,
  verifySovereignManifest,
} from '@aoc/protocol/manifest';
import type { DerivationClaim, SignedSovereignManifest, SovereignAssetRegistry } from '@aoc/protocol/manifest';
import type {
  SovereignAssetId,
  ContentIdentity,
  SovereignExternalReference,
  SovereignSubjectRef,
} from '@aoc/protocol/identity';
import {
  SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
  parseSovereigntyPortabilityBundle,
  portableClaimOf,
  portableManifestOf,
  serializeSovereigntyPortabilityBundle,
} from '@aoc/protocol/portability';
import type {
  PortableSovereignClaimArtifact,
  PortableSovereignManifestArtifact,
  SovereigntyPortabilityBundleV1,
} from '@aoc/protocol/portability';
import {
  buildSovereigntyCapabilityInvocation,
  createIdentitySovereigntyCapabilityImplementation,
  createIntegritySovereigntyCapabilityImplementation,
  createPortabilitySovereigntyCapabilityImplementation,
  createProvenanceSovereigntyCapabilityImplementation,
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
  PortabilitySovereigntyCapabilityInput,
  PortabilitySovereigntyCapabilityOutput,
  ProvenanceSovereigntyCapabilityInput,
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

/**
 * SM-05: the THIRD production Sovereignty Mineral, consumed end-to-end by an
 * external developer who has installed nothing but the packed @aoc/protocol
 * tarball. Real Identity creates two subjects, real Provenance records a real
 * derivation between them and traces the resulting lineage — no fake
 * implementation, no source import, no Enterprise package, no database.
 */
async function productionProvenanceMineralAcceptance(): Promise<string> {
  const correlationId = 'sm05-derivative-onboarding-001';
  const identityRef = getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef;
  const provenanceRef = getSovereigntyCapabilityRefByKey('provenance') as SovereigntyCapabilityRef;

  const identity = createIdentitySovereigntyCapabilityImplementation();
  const provenance = createProvenanceSovereigntyCapabilityImplementation();

  if (provenance.capability.id !== 'aoc:sovereignty-capability:provenance') {
    throw new Error('production Provenance capsule does not advertise the canonical id');
  }
  if (provenance.capability.version !== provenanceRef.version) {
    throw new Error('production Provenance capsule drifted from the canonical capability version');
  }

  // ---- Two real sovereign subjects, both through the real Identity capsule --
  const createSubject = async (externalId: string): Promise<SovereignSubjectRef> => {
    const result = await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: identityRef,
        correlationId,
        input: {
          registrant: 'principal:consumer',
          externalReference: buildSovereignExternalReference({
            namespace: 'alien-system-v47',
            id: externalId,
          }),
        } as IdentitySovereigntyCapabilityInput,
      }),
      identity,
    );
    if (result.status !== 'succeeded') throw new Error('real Identity invocation failed');
    return result.output.subject;
  };

  const subjectA = await createSubject('alien-resource-source');
  const subjectB = await createSubject('alien-resource-derived');
  if (subjectA.sovereignAssetId === subjectB.sovereignAssetId) {
    throw new Error('two Identity invocations produced one subject');
  }

  // ---- Provenance requires an existing subject --------------------------
  const noSubject = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      input: {
        operation: 'declare-origin',
        claimId: 'claim:origin:consumer',
        issuer: 'principal:consumer',
        assertedOrigin: 'future-system-origin-42',
      } as ProvenanceSovereigntyCapabilityInput,
    }),
    provenance,
  );
  if (noSubject.status !== 'failed' || noSubject.reasonCodes[0] !== 'PROVENANCE_SUBJECT_REQUIRED') {
    throw new Error('Provenance did not require an existing sovereign subject');
  }

  // ---- A real OriginClaim over subject A ---------------------------------
  const origin = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: subjectA,
      correlationId,
      input: {
        operation: 'declare-origin',
        claimId: 'claim:origin:consumer',
        issuer: 'principal:consumer',
        assertedOrigin: 'future-system-origin-42',
      } as ProvenanceSovereigntyCapabilityInput,
    }),
    provenance,
  );
  if (origin.status !== 'succeeded' || origin.output.operation !== 'declare-origin') {
    throw new Error('production declare-origin did not execute');
  }
  if (origin.output.claim.type !== ClaimType.Origin) throw new Error('origin claim is not a ClaimType.Origin');
  if (origin.output.claim.subject !== subjectA.sovereignAssetId) {
    throw new Error('origin claim subject is not the invocation subject');
  }
  if (origin.output.claim.metadata.assertedOrigin !== 'future-system-origin-42') {
    throw new Error('the asserted origin did not survive');
  }
  if ('proof' in origin.output.claim || 'digest' in origin.output.claim) {
    throw new Error('Provenance signed its own claim');
  }

  // ---- A real authorship assertion, with no ownership conclusion ---------
  const authorship = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: subjectA,
      input: {
        operation: 'declare-authorship',
        claimId: 'claim:authorship:consumer',
        issuer: 'principal:consumer',
        statement: 'Authored by the consumer',
      } as ProvenanceSovereigntyCapabilityInput,
    }),
    provenance,
  );
  if (authorship.status !== 'succeeded' || authorship.output.operation !== 'declare-authorship') {
    throw new Error('production declare-authorship did not execute');
  }
  if (authorship.output.claim.metadata.kind !== AuthorityClaimKind.Authorship) {
    throw new Error('the authority kind is not fixed to Authorship');
  }

  // ---- A real DerivationClaim: B derives from A -------------------------
  const derivation = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: subjectB,
      correlationId,
      input: {
        operation: 'record-derivation',
        claimId: 'claim:derivation:consumer',
        issuer: 'principal:consumer',
        sourceSovereignAssetIds: [subjectA.sovereignAssetId],
        relation: DerivationRelationKind.TransformedFrom,
        statement: 'Derived artifact produced by the consumer',
        occurredAt: '2026-01-01T00:00:00.000Z',
      } as ProvenanceSovereigntyCapabilityInput,
    }),
    provenance,
  );
  if (derivation.status !== 'succeeded' || derivation.output.operation !== 'record-derivation') {
    throw new Error('production record-derivation did not execute');
  }
  const derivationClaim: DerivationClaim = derivation.output.claim;
  if (derivationClaim.type !== ClaimType.Derivation) throw new Error('derivation claim is not ClaimType.Derivation');
  if (derivationClaim.subject !== subjectB.sovereignAssetId) {
    throw new Error('the derivation child is not the invocation subject');
  }
  if (derivationClaim.metadata.sourceSovereignAssetIds.length !== 1
    || derivationClaim.metadata.sourceSovereignAssetIds[0] !== subjectA.sovereignAssetId) {
    throw new Error('the derivation source is not subject A');
  }
  // occurredAt (asserted history) and issuedAt (when recorded) stay distinct.
  if (derivationClaim.metadata.occurredAt === derivationClaim.issuedAt) {
    throw new Error('occurredAt collapsed into issuedAt');
  }
  if (!isValidDerivationClaim(derivationClaim)) throw new Error('the derivation claim is not structurally valid');

  // Direct self-derivation is refused.
  const selfDerivation = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: subjectB,
      input: {
        operation: 'record-derivation',
        claimId: 'claim:derivation:self',
        issuer: 'principal:consumer',
        sourceSovereignAssetIds: [subjectB.sovereignAssetId],
        relation: DerivationRelationKind.DerivedFrom,
      } as ProvenanceSovereigntyCapabilityInput,
    }),
    provenance,
  );
  if (selfDerivation.status !== 'failed'
    || selfDerivation.reasonCodes[0] !== 'PROVENANCE_DERIVATION_SELF_REFERENCE') {
    throw new Error('a self-referencing derivation was accepted');
  }

  // ---- Real lineage traversal: A is an ancestor of B --------------------
  const lineage = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: subjectB,
      correlationId,
      input: {
        operation: 'trace-lineage',
        direction: 'ancestors',
        derivationClaims: [derivationClaim],
      } as ProvenanceSovereigntyCapabilityInput,
    }),
    provenance,
  );
  if (lineage.status !== 'succeeded' || lineage.output.operation !== 'trace-lineage') {
    throw new Error('production trace-lineage did not execute');
  }
  const trace = lineage.output.trace;
  if (trace.rootSovereignAssetId !== subjectB.sovereignAssetId) throw new Error('lineage root drifted');
  if (!trace.nodes.some((node) => node.sovereignAssetId === subjectA.sovereignAssetId)) {
    throw new Error('A does not appear as an ancestor of B');
  }
  if (trace.edges.length !== 1 || trace.edges[0].claimId !== derivationClaim.id) {
    throw new Error('the lineage edge lost its claim identity');
  }
  if (trace.edges[0].relation !== DerivationRelationKind.TransformedFrom) {
    throw new Error('the lineage edge lost its relation');
  }
  if (trace.cycleDetected || trace.truncated) throw new Error('an acyclic complete trace was misreported');

  // The inverse direction is answered from the same single claim.
  const descendants = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: subjectA,
      input: {
        operation: 'trace-lineage',
        direction: 'descendants',
        derivationClaims: [derivationClaim],
      } as ProvenanceSovereigntyCapabilityInput,
    }),
    provenance,
  );
  if (descendants.status !== 'succeeded' || descendants.output.operation !== 'trace-lineage') {
    throw new Error('descendant trace did not execute');
  }
  if (descendants.output.trace.nodes[0]?.sovereignAssetId !== subjectB.sovereignAssetId) {
    throw new Error('B does not appear as a descendant of A');
  }

  // ---- Contestation preserves the claim ---------------------------------
  const contested = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: subjectB,
      input: {
        operation: 'contest-provenance-claim',
        standingId: 'standing:consumer:001',
        claim: derivationClaim,
        reason: 'Independent party disputes the asserted derivation relationship',
      } as ProvenanceSovereigntyCapabilityInput,
    }),
    provenance,
  );
  if (contested.status !== 'succeeded' || contested.output.operation !== 'contest-provenance-claim') {
    throw new Error('production contest-provenance-claim did not execute');
  }
  if (contested.output.standing.status !== StandingStatus.Contested) {
    throw new Error('contestation did not record Contested standing');
  }
  if (contested.output.standing.claimRef !== derivationClaim.id) throw new Error('standing lost its claim reference');
  if (contested.output.claim !== derivationClaim) throw new Error('contestation replaced the original claim');
  if (!isValidDerivationClaim(derivationClaim)) throw new Error('contestation mutated the original claim');

  // ---- Evidence hygiene --------------------------------------------------
  for (const result of [origin, authorship, derivation, lineage, contested]) {
    const evidence = result.evidence;
    if (!isValidSovereigntyCapabilityInvocationEvidence(evidence)) throw new Error('invalid Provenance evidence');
    if (evidence.capability.id !== 'aoc:sovereignty-capability:provenance') {
      throw new Error('evidence does not attribute the canonical Provenance capability');
    }
    if (evidence.capability.version !== provenanceRef.version) throw new Error('evidence lost the capability version');
    if (evidence.subject?.sovereignAssetId === undefined) throw new Error('evidence lost the invocation subject');

    const serialized = JSON.stringify(evidence);
    for (const leak of [
      'assertedOrigin', 'future-system-origin-42', 'sourceSovereignAssetIds', 'TransformedFrom',
      'nodes', 'edges', 'cycleDetected', 'Derived artifact produced', 'issuer', 'principal:consumer',
      'claim:derivation:consumer',
    ]) {
      if (serialized.includes(leak)) throw new Error(`generic Provenance evidence leaked "${leak}"`);
    }
    if (canonicalizeJSON(JSON.parse(serialized)) !== canonicalizeJSON(evidence)) {
      throw new Error('Provenance evidence did not survive a canonical round trip');
    }
  }
  if (origin.invocationId === derivation.invocationId) {
    throw new Error('two Provenance invocations shared one invocation id');
  }
  if (origin.evidence.correlationId !== correlationId || derivation.evidence.correlationId !== correlationId) {
    throw new Error('the shared correlation id did not survive');
  }

  return derivationClaim.id;
}

/**
 * SM-06: the FOURTH production Sovereignty Mineral, and the first flow in which
 * all four compose end-to-end for an external developer who has installed
 * nothing but the packed @aoc/protocol tarball.
 *
 *   AOC.INTEGRITY   bytes                → ContentIdentity
 *   AOC.IDENTITY    ContentIdentity      → Subject X + Manifest M
 *   AOC.PROVENANCE  Subject X            → OriginClaim P (+ a contested standing)
 *   AOC.PORTABILITY X, M, P              → canonical bundle + wire string S1
 *   AOC.INTEGRITY   UTF8(S1)             → bundle digest B1
 *                   ── transport: the STRING and nothing else ──
 *   AOC.PORTABILITY S1                   → the same X, M, P, re-serialized as S2
 *   AOC.INTEGRITY   UTF8(S2)             → B2
 *
 * S1 === S2 and B1 === B2, with no fake implementation, no source import, no
 * Enterprise package, no database, no registry and no provider.
 */
async function productionPortabilityMineralAcceptance(): Promise<string> {
  const correlationId = 'sm06-application-migration-001';
  const integrityRef = getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef;
  const identityRef = getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef;
  const provenanceRef = getSovereigntyCapabilityRefByKey('provenance') as SovereigntyCapabilityRef;
  const portabilityRef = getSovereigntyCapabilityRefByKey('portability') as SovereigntyCapabilityRef;

  // ---- APPLICATION A -----------------------------------------------------
  const integrity = createIntegritySovereigntyCapabilityImplementation();
  const identity = createIdentitySovereigntyCapabilityImplementation();
  const provenance = createProvenanceSovereigntyCapabilityImplementation();
  const portability = createPortabilitySovereigntyCapabilityImplementation();

  if (portability.capability.id !== 'aoc:sovereignty-capability:portability') {
    throw new Error('production Portability capsule does not advertise the canonical id');
  }
  if (portability.capability.version !== portabilityRef.version) {
    throw new Error('production Portability capsule drifted from the canonical capability version');
  }

  const digestOf = async (bytes: Uint8Array): Promise<ContentIdentity> => {
    const result = await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: integrityRef,
        input: { operation: 'compute-content-identity', bytes } as IntegritySovereigntyCapabilityInput,
      }),
      integrity,
    );
    if (result.status !== 'succeeded' || result.output.operation !== 'compute-content-identity') {
      throw new Error('real Integrity invocation failed');
    }
    return result.output.contentIdentity;
  };

  // 1. Real Integrity over deterministic bytes.
  const assetBytes = new TextEncoder().encode('sm06-packed-consumer-fixture-bytes');
  const contentIdentity = await digestOf(assetBytes);

  // 2. Real Identity, binding that precomputed commitment.
  const identityResult = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: identityRef,
      correlationId,
      input: {
        registrant: 'principal:consumer',
        contentIdentity,
        externalReference: buildSovereignExternalReference({
          namespace: 'alien-system-v47',
          id: 'alien-resource-92817',
          locator: 'future://provider-p1/object/92817',
        }),
      } as IdentitySovereigntyCapabilityInput,
    }),
    identity,
  );
  if (identityResult.status !== 'succeeded') throw new Error('real Identity invocation failed');
  const subjectX = identityResult.output.subject;
  const manifestM = identityResult.output.manifest;

  // 3. Real Provenance: an origin assertion, and a contested standing over it.
  const originResult = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: subjectX,
      correlationId,
      input: {
        operation: 'declare-origin',
        claimId: 'claim:origin:sm06-consumer',
        issuer: 'principal:consumer',
        assertedOrigin: 'future-system-origin-42',
        evidenceRefs: ['evidence:zzz-held-elsewhere', 'evidence:aaa-held-elsewhere'],
      } as ProvenanceSovereigntyCapabilityInput,
    }),
    provenance,
  );
  if (originResult.status !== 'succeeded' || originResult.output.operation !== 'declare-origin') {
    throw new Error('real Provenance declare-origin failed');
  }
  const claimP = originResult.output.claim;

  const contestResult = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: subjectX,
      input: {
        operation: 'contest-provenance-claim',
        standingId: 'standing:sm06-consumer:001',
        claim: claimP,
        reason: 'An independent party disputes the asserted origin',
      } as ProvenanceSovereigntyCapabilityInput,
    }),
    provenance,
  );
  if (contestResult.status !== 'succeeded' || contestResult.output.operation !== 'contest-provenance-claim') {
    throw new Error('real Provenance contestation failed');
  }
  const standingS = contestResult.output.standing;

  // ---- Portability requires an existing subject to export ----------------
  const exportWithoutSubject = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: portabilityRef,
      input: { operation: 'export-bundle' } as PortabilitySovereigntyCapabilityInput,
    }),
    portability,
  );
  if (exportWithoutSubject.status !== 'failed' || exportWithoutSubject.reasonCodes[0] !== 'PORTABILITY_SUBJECT_REQUIRED') {
    throw new Error('Portability did not require an existing sovereign subject to export');
  }

  // 4. Real Portability export.
  const manifestArtifacts: readonly PortableSovereignManifestArtifact[] = [{ kind: 'manifest', manifest: manifestM }];
  const claimArtifacts: readonly PortableSovereignClaimArtifact[] = [{ kind: 'claim', claim: claimP }];

  const exportResult = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: portabilityRef,
      subject: subjectX,
      correlationId,
      input: {
        operation: 'export-bundle',
        manifests: manifestArtifacts,
        claims: claimArtifacts,
        standings: [standingS],
      } as PortabilitySovereigntyCapabilityInput,
    }),
    portability,
  );
  if (exportResult.status !== 'succeeded' || exportResult.output.operation !== 'export-bundle') {
    throw new Error('production export-bundle did not execute');
  }
  const bundleA: SovereigntyPortabilityBundleV1 = exportResult.output.bundle;
  if (bundleA.schemaVersion !== SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION) {
    throw new Error('the bundle does not carry the canonical portability schema version');
  }
  if (bundleA.canonicalizationProfile !== CANONICAL_JSON_PROFILE) {
    throw new Error('the bundle introduced a second canonicalization profile');
  }

  // 5. Real Integrity over the serialized bundle — explicit composition, never
  //    a digest Portability produced for itself.
  const s1: string = exportResult.output.serializedBundle;
  if (s1 !== serializeSovereigntyPortabilityBundle(bundleA)) {
    throw new Error('the capsule and the public serializer disagree');
  }
  if (s1 !== canonicalizeJSON(bundleA)) throw new Error('the wire form is not canonical JSON');
  const b1 = await digestOf(new TextEncoder().encode(s1));

  // The envelope has exactly six fields: no bundleId, no exportedAt, no bundle
  // digest or signature, no provider, ownership, licence or governance state.
  const envelopeKeys = Object.keys(bundleA).sort().join(',');
  if (envelopeKeys !== 'canonicalizationProfile,claims,manifests,schemaVersion,standings,subject') {
    throw new Error(`the portability envelope grew unexpected fields: ${envelopeKeys}`);
  }
  // The bundle carries the sovereign representation, never the content bytes,
  // and never a provider, storage pointer, ownership, licence or policy field.
  // `"digest"` is deliberately absent from this list: the *manifest's* nested
  // ContentIdentity legitimately carries one, and it is preserved — what must
  // not exist is a digest of the envelope, which the key check above proves.
  for (const forbidden of [
    'sm06-packed-consumer-fixture-bytes', '"provider"', '"storagePointer"', '"bucket"', '"tenantId"',
    '"contentBytes"', '"owner"', '"license"', '"terms"', '"policy"', '"exportedAt"', '"bundleId"',
    '"checksum"', '"bundleSignature"', '"sourceApplication"',
  ]) {
    if (s1.includes(forbidden)) throw new Error(`the portability bundle leaked ${forbidden}`);
  }

  // ---- transport: APPLICATION B receives the STRING and nothing else -----
  const wire: string = s1;
  const applicationBSubjectRecord: SovereignSubjectRef | undefined = undefined;

  // A fresh capsule in a runtime that has never seen Application A's objects,
  // has no registry, no database and no access to provider-p1.
  const applicationBPortability = createPortabilitySovereigntyCapabilityImplementation();

  // 6-7. Subjectless import: Application B has no local subject record yet.
  const importResult = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: portabilityRef,
      correlationId,
      ...(applicationBSubjectRecord === undefined ? {} : { subject: applicationBSubjectRecord }),
      input: { operation: 'import-bundle', serializedBundle: wire } as PortabilitySovereigntyCapabilityInput,
    }),
    applicationBPortability,
  );
  if (importResult.status !== 'succeeded' || importResult.output.operation !== 'import-bundle') {
    throw new Error('production import-bundle did not execute without an invocation subject');
  }
  const bundleB = importResult.output.bundle;

  // The EXISTING subject arrived; nothing was minted.
  if (importResult.subject?.sovereignAssetId !== subjectX.sovereignAssetId) {
    throw new Error('subjectless import did not return the existing bundle subject');
  }
  if (importResult.evidence.subject?.sovereignAssetId !== subjectX.sovereignAssetId) {
    throw new Error('import evidence lost the imported subject');
  }
  if (bundleB.subject.externalReference?.namespace !== 'alien-system-v47'
    || bundleB.subject.externalReference.id !== 'alien-resource-92817'
    || bundleB.subject.externalReference.locator !== 'future://provider-p1/object/92817') {
    throw new Error('the opaque external reference did not survive transport exactly');
  }

  // Manifest, claim and standing all reconstructed from the string alone.
  const importedManifest = portableManifestOf(bundleB.manifests[0]);
  if (canonicalizeJSON(importedManifest) !== canonicalizeJSON(manifestM)) {
    throw new Error('the manifest did not survive transport');
  }
  if (importedManifest.contentIdentity?.digest !== contentIdentity.digest) {
    throw new Error('the manifest lost its ContentIdentity');
  }
  const importedClaim = portableClaimOf(bundleB.claims[0]);
  if (canonicalizeJSON(importedClaim) !== canonicalizeJSON(claimP)) {
    throw new Error('the origin claim did not survive transport');
  }
  if (importedClaim.id !== claimP.id) throw new Error('the claim id was reminted');
  if (JSON.stringify(importedClaim.evidenceRefs) !== JSON.stringify(claimP.evidenceRefs)) {
    throw new Error('the evidence refs were reordered or resolved');
  }
  if (bundleB.standings[0]?.status !== StandingStatus.Contested) {
    throw new Error('the contested standing was adjudicated during transport');
  }
  if (bundleB.standings[0].claimRef !== claimP.id) throw new Error('the standing lost its claim reference');

  // 8-9. Re-serialize and re-digest: no drift on either side of the boundary.
  const s2: string = importResult.output.serializedBundle;
  if (s2 !== s1) throw new Error('the canonical serialization drifted across transport');
  const b2 = await digestOf(new TextEncoder().encode(s2));
  if (b2.digest !== b1.digest || b2.algorithm !== b1.algorithm) {
    throw new Error('the bundle ContentIdentity changed across transport');
  }

  // The public parser reaches the same bundle from the same string.
  const parsed = parseSovereigntyPortabilityBundle(wire);
  if (!parsed.valid) throw new Error(`the public parser rejected a canonical bundle: ${parsed.reasons.join(', ')}`);
  if (serializeSovereigntyPortabilityBundle(parsed.bundle) !== s1) throw new Error('parser round trip drifted');

  // ---- Import fails closed on untrusted or unsupported input -------------
  const malformed = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: portabilityRef,
      input: { operation: 'import-bundle', serializedBundle: '{ not-json' } as PortabilitySovereigntyCapabilityInput,
    }),
    applicationBPortability,
  );
  if (malformed.status !== 'failed' || malformed.reasonCodes[0] !== 'PORTABILITY_INVALID_JSON') {
    throw new Error('malformed JSON was not rejected as an ordinary failed outcome');
  }

  const futureVersion = JSON.stringify({
    ...JSON.parse(wire),
    schemaVersion: 'aoc-sovereignty-portability-bundle/999',
  });
  const unsupported = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: portabilityRef,
      input: { operation: 'import-bundle', serializedBundle: futureVersion } as PortabilitySovereigntyCapabilityInput,
    }),
    applicationBPortability,
  );
  if (unsupported.status !== 'failed' || unsupported.reasonCodes[0] !== 'PORTABILITY_UNSUPPORTED_BUNDLE_SCHEMA') {
    throw new Error('a future bundle version was not rejected fail-closed');
  }

  const mismatched = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: portabilityRef,
      subject: toSovereignSubjectRef({ sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()) }),
      input: { operation: 'import-bundle', serializedBundle: wire } as PortabilitySovereigntyCapabilityInput,
    }),
    applicationBPortability,
  );
  if (mismatched.status !== 'failed' || mismatched.reasonCodes[0] !== 'PORTABILITY_SUBJECT_MISMATCH') {
    throw new Error('an explicitly mismatched import subject was not rejected');
  }

  // ---- The imported provenance is still usable by another mineral --------
  const lineage = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: bundleB.subject,
      input: {
        operation: 'contest-provenance-claim',
        standingId: 'standing:sm06-consumer:002',
        claim: importedClaim,
        reason: 'Application B records its own challenge against the imported claim',
      } as ProvenanceSovereigntyCapabilityInput,
    }),
    provenance,
  );
  if (lineage.status !== 'succeeded') {
    throw new Error('real Provenance could not consume the imported claim');
  }

  // ---- Evidence hygiene ---------------------------------------------------
  for (const result of [exportResult, importResult, malformed, unsupported, mismatched]) {
    const evidence = result.evidence;
    if (!isValidSovereigntyCapabilityInvocationEvidence(evidence)) throw new Error('invalid Portability evidence');
    if (evidence.capability.id !== 'aoc:sovereignty-capability:portability') {
      throw new Error('evidence does not attribute the canonical Portability capability');
    }
    if (evidence.capability.version !== portabilityRef.version) throw new Error('evidence lost the capability version');

    const serializedEvidence = JSON.stringify(evidence);
    for (const leak of [
      'serializedBundle', 'aoc-sovereignty-portability-bundle/1', 'manifests', 'standings',
      'assertedOrigin', 'future-system-origin-42', 'registrant', 'principal:consumer',
      'claim:origin:sm06-consumer', 'standing:sm06-consumer', 'Contested', contentIdentity.digest,
    ]) {
      if (serializedEvidence.includes(leak)) throw new Error(`generic Portability evidence leaked "${leak}"`);
    }
    if (canonicalizeJSON(JSON.parse(serializedEvidence)) !== canonicalizeJSON(evidence)) {
      throw new Error('Portability evidence did not survive a canonical round trip');
    }
  }
  if (exportResult.invocationId === importResult.invocationId) {
    throw new Error('two Portability invocations shared one invocation id');
  }
  if (exportResult.evidence.correlationId !== correlationId || importResult.evidence.correlationId !== correlationId) {
    throw new Error('the shared migration correlation id did not survive');
  }

  return bundleB.subject.sovereignAssetId;
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
  const derivationClaimId = await productionProvenanceMineralAcceptance();
  console.log(`typescript-cjs production Provenance mineral + lineage OK: ${derivationClaimId}`);
  const portableSubjectId = await productionPortabilityMineralAcceptance();
  console.log(`typescript-cjs production Portability mineral + four-mineral composition OK: ${portableSubjectId}`);
})().catch((error) => {
  throw error;
});

console.log(
  `typescript-cjs consumer OK: token=${token.tokenId} claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${sovereigntyCapabilityCount}`,
);
