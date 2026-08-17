import type { CapabilityToken } from '@aoc/protocol';
import type { AuditEventEnvelope } from '@aoc/protocol/contracts';
import { ClaimType, StandingStatus } from '@aoc/protocol/claims';
import type { CanonicalClaim } from '@aoc/protocol/claims';
import type { ProtocolError } from '@aoc/protocol/errors';
import type { RevocationLookup } from '@aoc/protocol/adapters';
import { AdapterRegistry, AdapterTokens } from '@aoc/protocol/runtime-registry';
import {
  buildSovereigntyCapabilityInvocation,
  createIdentitySovereigntyCapabilityImplementation,
  createIntegritySovereigntyCapabilityImplementation,
  createProvenanceSovereigntyCapabilityImplementation,
  getSovereigntyCapability,
  getSovereigntyCapabilityByKey,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isValidSovereigntyCapabilityInvocationEvidence,
  listSovereigntyCapabilities,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  IdentitySovereigntyCapabilityInput,
  IntegritySovereigntyCapabilityInput,
  ProvenanceSovereigntyCapabilityInput,
  SovereigntyCapabilityId,
  SovereigntyCapabilityImplementation,
  SovereigntyCapabilityKey,
  SovereigntyCapabilityRef,
} from '@aoc/protocol/sovereignty-capabilities';
import type { AuditEventSink } from '@aoc/protocol/adapters';
import {
  buildSovereignExternalReference,
  computeContentIdentity,
  contentIdentitiesEqual,
  isValidSovereignSubjectRef,
  mintSovereignAssetId,
  sovereignExternalReferencesEqual,
} from '@aoc/protocol/identity';
import type { SovereignExternalReference, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  AuthorityClaimKind,
  DerivationRelationKind,
  buildSovereignManifestV1,
  computeManifestDigest,
  generateSovereignKeyPair,
  isValidDerivationClaim,
  signSovereignManifest,
  verifySovereignManifest,
} from '@aoc/protocol/manifest';
import type { DerivationClaim, SignedSovereignManifest } from '@aoc/protocol/manifest';
import { canonicalizeJSON } from '@aoc/protocol/canonical';

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

assertType<AuditEventEnvelope | undefined>(undefined);
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

const sovereigntyCapabilities = listSovereigntyCapabilities();
if (sovereigntyCapabilities.length !== 8) {
  throw new Error(`expected 8 sovereignty capabilities, got ${sovereigntyCapabilities.length}`);
}
assertType<readonly SovereigntyCapabilityKey[]>(sovereigntyCapabilities.map((capability) => capability.key));
if (
  sovereigntyCapabilities.map((capability) => capability.key).join(',') !==
  'identity,integrity,provenance,portability,interoperability,verifiability,licensing_terms,governance_compatibility'
) {
  throw new Error('sovereignty capability enumeration is not in canonical order');
}

const identityCapabilityId: SovereigntyCapabilityId = 'aoc:sovereignty-capability:identity';
const identityCapability = getSovereigntyCapability(identityCapabilityId);
if (!identityCapability || identityCapability.name !== 'Identity') {
  throw new Error('Identity lookup by canonical id failed');
}
if (!/^\d+\.\d+\.\d+$/.test(identityCapability.version)) {
  throw new Error('Identity has no explicit capability version');
}
if (getSovereigntyCapabilityByKey('governance_compatibility')?.id !== 'aoc:sovereignty-capability:governance-compatibility') {
  throw new Error('Governance Compatibility lookup failed');
}
if (getSovereigntyCapability('aoc:sovereignty-capability:wallet') !== undefined) {
  throw new Error('unknown sovereignty capability id resolved');
}

// A sovereign subject with no byte representation, from the packed tarball:
// identity + an opaque external reference, no fabricated content integrity.
const sovereignAssetId = mintSovereignAssetId();
const externalReference: SovereignExternalReference = buildSovereignExternalReference({
  namespace: 'alien-system-v47',
  id: 'alien-resource-92817',
  locator: 'future://provider/object/92817',
});
const subject: SovereignSubjectRef = { sovereignAssetId, externalReference };
if (!isValidSovereignSubjectRef(subject)) {
  throw new Error('subject reference rejected');
}

const nonByteManifest = buildSovereignManifestV1({
  sovereignAssetId,
  externalReference,
  registrant: 'principal:consumer',
  // deliberately NO contentIdentity
});
if ('contentIdentity' in nonByteManifest) {
  throw new Error('absent contentIdentity was serialized instead of omitted');
}
if (canonicalizeJSON(nonByteManifest).includes('contentIdentity')) {
  throw new Error('canonical payload leaked contentIdentity');
}

const { signingKey, privateKeyPem } = generateSovereignKeyPair();
const signedNonByteManifest = signSovereignManifest(nonByteManifest, privateKeyPem, signingKey);
const roundTripped = JSON.parse(JSON.stringify(signedNonByteManifest)) as SignedSovereignManifest;
if (
  !roundTripped.manifest.externalReference ||
  !sovereignExternalReferencesEqual(roundTripped.manifest.externalReference, externalReference)
) {
  throw new Error('external reference did not survive serialization exactly');
}

const verification = await verifySovereignManifest(roundTripped);
if (
  verification.checks.manifestStructure !== 'valid' ||
  verification.checks.manifestDigest !== 'valid' ||
  verification.checks.signature !== 'valid'
) {
  throw new Error('non-byte subject manifest failed cryptographic verification');
}
if (verification.checks.contentDigest !== 'not_performed') {
  throw new Error(`contentDigest must be not_performed, got ${verification.checks.contentDigest}`);
}
if (!verification.valid) {
  throw new Error('non-byte subject manifest failed verification');
}


// An external ESM consumer implements the public Sovereignty Capability
// interface and drives it through the public invoker, from the packed tarball
// only. Demo/test code — not a real mineral capsule.
const identityCapabilityRef = getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef;
const createdSubject: SovereignSubjectRef = {
  sovereignAssetId: mintSovereignAssetId(),
  externalReference: buildSovereignExternalReference({
    namespace: 'alien-system-v47',
    id: 'alien-resource-92817',
  }),
};

const consumerIdentityShapedImplementation: SovereigntyCapabilityImplementation<
  { externalReference: SovereignExternalReference },
  { minted: true }
> = {
  capability: identityCapabilityRef,
  async invoke() {
    return { status: 'succeeded', output: { minted: true }, subject: createdSubject };
  },
};

const consumerEvents: AuditEventEnvelope[] = [];
const consumerEvidenceSink: AuditEventSink = {
  recordAuditEvent(event) {
    consumerEvents.push(event);
  },
};

// Identity-shaped: no subject before, a subject after.
const identityInvocation = buildSovereigntyCapabilityInvocation({
  capability: identityCapabilityRef,
  correlationId: 'consumer-flow-esm-001',
  input: { externalReference },
});
if (identityInvocation.subject !== undefined) {
  throw new Error('common invocation required a subject it should not have');
}

const identityResult = await invokeSovereigntyCapability(identityInvocation, consumerIdentityShapedImplementation, {
  evidenceSink: consumerEvidenceSink,
});
if (identityResult.status !== 'succeeded') throw new Error('consumer capability invocation failed');
if (identityResult.subject?.sovereignAssetId !== createdSubject.sovereignAssetId) {
  throw new Error('the subject created by the capability did not reach the result');
}
if (!isValidSovereigntyCapabilityInvocationEvidence(identityResult.evidence)) {
  throw new Error('capability invocation evidence is not valid');
}
if (identityResult.evidence.capability.id !== 'aoc:sovereignty-capability:identity') {
  throw new Error('evidence does not attribute the canonical Identity capability');
}
if (identityResult.evidence.capability.version !== identityCapabilityRef.version) {
  throw new Error('evidence lost the exact capability version');
}
if (identityResult.evidence.invocationId !== identityInvocation.invocationId) {
  throw new Error('evidence lost the invocation id');
}
if (identityResult.evidence.correlationId !== 'consumer-flow-esm-001') {
  throw new Error('evidence lost the correlation id');
}
if (JSON.stringify(identityResult.evidence).includes('minted')) {
  throw new Error('evidence embedded the raw capability output');
}
if (
  canonicalizeJSON(JSON.parse(JSON.stringify(identityResult.evidence))) !==
  canonicalizeJSON(identityResult.evidence)
) {
  throw new Error('evidence did not survive a canonical round trip');
}
if (consumerEvents.length !== 1 || consumerEvents[0].eventId !== identityInvocation.invocationId) {
  throw new Error('evidence sink did not receive exactly one matching record');
}

// Integrity-shaped: raw bytes, no subject, no sink at all.
const integrityCapabilityRef = getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef;
const bytesResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: integrityCapabilityRef,
    input: new Uint8Array([7, 8, 9]),
  }),
  {
    capability: integrityCapabilityRef,
    async invoke(invocation) {
      return { status: 'succeeded' as const, output: { byteLength: invocation.input.byteLength } };
    },
  },
);
if (bytesResult.status !== 'succeeded' || bytesResult.output.byteLength !== 3) {
  throw new Error('raw byte input did not survive the common invocation layer');
}
if (bytesResult.subject !== undefined) throw new Error('a subject was invented for a subject-less invocation');
if (!isValidSovereigntyCapabilityInvocationEvidence(bytesResult.evidence)) {
  throw new Error('evidence must exist even with no sink configured');
}

// ---------------------------------------------------------------------------
// SM-04: the two PRODUCTION Sovereignty Minerals, from the packed tarball only.
// No fake implementation, no test fixture, no Enterprise package, no source
// import — both capsules come from `@aoc/protocol/sovereignty-capabilities` and
// run through the same `invokeSovereigntyCapability` socket as any third-party
// implementation above.
// ---------------------------------------------------------------------------

const productionCorrelationId = 'sm04-photo-onboarding-001';
const productionBytes = new TextEncoder().encode('hello sovereign world');

const productionIntegrity = createIntegritySovereigntyCapabilityImplementation();
const productionIdentity = createIdentitySovereigntyCapabilityImplementation();

if (productionIntegrity.capability.id !== 'aoc:sovereignty-capability:integrity'
  || productionIntegrity.capability.version !== integrityCapabilityRef.version) {
  throw new Error('production Integrity capsule drifted from the canonical capability ref');
}
if (productionIdentity.capability.id !== 'aoc:sovereignty-capability:identity'
  || productionIdentity.capability.version !== identityCapabilityRef.version) {
  throw new Error('production Identity capsule drifted from the canonical capability ref');
}

// FLOW B — real AOC.INTEGRITY over bytes, with no sovereign identity at all.
const productionIntegrityResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: integrityCapabilityRef,
    correlationId: productionCorrelationId,
    input: { operation: 'compute-content-identity', bytes: productionBytes } as IntegritySovereigntyCapabilityInput,
  }),
  productionIntegrity,
);
if (productionIntegrityResult.status !== 'succeeded'
  || productionIntegrityResult.output.operation !== 'compute-content-identity') {
  throw new Error('production Integrity invocation failed');
}
const productionContentIdentity = productionIntegrityResult.output.contentIdentity;
if (!contentIdentitiesEqual(productionContentIdentity, computeContentIdentity(productionBytes))) {
  throw new Error('capability ContentIdentity differs from the computeContentIdentity primitive');
}
if (productionIntegrityResult.subject !== undefined) throw new Error('Integrity invented a sovereign subject');

// A digest mismatch is a successful check with a negative result.
const productionMismatch = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: integrityCapabilityRef,
    input: {
      operation: 'verify-content-identity',
      bytes: new TextEncoder().encode('different bytes'),
      expected: productionContentIdentity,
    } as IntegritySovereigntyCapabilityInput,
  }),
  productionIntegrity,
);
if (productionMismatch.status !== 'succeeded'
  || productionMismatch.output.operation !== 'verify-content-identity'
  || productionMismatch.output.check.valid
  || productionMismatch.output.check.reason !== 'CONTENT_DIGEST_MISMATCH'
  || productionMismatch.evidence.outcome !== 'succeeded') {
  throw new Error('a digest mismatch must be a successful check with a negative result');
}

// FLOW C — real AOC.IDENTITY, binding the Integrity output without recomputing it.
const productionIdentityResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: identityCapabilityRef,
    correlationId: productionCorrelationId,
    input: {
      registrant: 'principal:consumer',
      externalReference: buildSovereignExternalReference({
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'future://provider/object/92817',
      }),
      contentIdentity: productionContentIdentity,
    } as IdentitySovereigntyCapabilityInput,
  }),
  productionIdentity,
);
if (productionIdentityResult.status !== 'succeeded') throw new Error('production Identity invocation failed');

const productionSubject = productionIdentityResult.output.subject;
const productionManifest = productionIdentityResult.output.manifest;
if (!isValidSovereignSubjectRef(productionSubject)) throw new Error('Identity produced an invalid subject');
if (productionSubject.sovereignAssetId !== productionManifest.sovereignAssetId) {
  throw new Error('subject/manifest identity drift');
}
if (!productionManifest.contentIdentity
  || !contentIdentitiesEqual(productionManifest.contentIdentity, productionContentIdentity)) {
  throw new Error('the Identity manifest does not carry the Integrity output');
}
if ('proof' in productionManifest || 'manifestDigest' in productionManifest) {
  throw new Error('Identity signed its own manifest');
}
if (productionManifest.authorityClaims.length !== 0 || 'originClaim' in productionManifest) {
  throw new Error('Identity fabricated a provenance claim');
}

// FLOW A — Identity with no ContentIdentity at all stays independently usable.
const productionIdentityOnly = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: identityCapabilityRef,
    input: {
      registrant: 'principal:consumer',
      externalReference: buildSovereignExternalReference({
        namespace: 'example:external-token-system',
        id: 'external-token-92817',
      }),
    } as IdentitySovereigntyCapabilityInput,
  }),
  productionIdentity,
);
if (productionIdentityOnly.status !== 'succeeded') throw new Error('Identity must not require Integrity');
if ('contentIdentity' in productionIdentityOnly.output.manifest) {
  throw new Error('an absent contentIdentity was serialized rather than omitted');
}
if (canonicalizeJSON(productionIdentityOnly.output.manifest).includes('contentIdentity')) {
  throw new Error('canonical payload leaked a fabricated contentIdentity');
}

// A real manifest digest through the production Integrity capsule.
const productionDigest = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: integrityCapabilityRef,
    input: { operation: 'compute-manifest-digest', manifest: productionManifest } as IntegritySovereigntyCapabilityInput,
  }),
  productionIntegrity,
);
if (productionDigest.status !== 'succeeded'
  || productionDigest.output.operation !== 'compute-manifest-digest'
  || productionDigest.output.manifestDigest !== computeManifestDigest(productionManifest)) {
  throw new Error('capability manifest digest differs from the computeManifestDigest primitive');
}

// Attribution, correlation and evidence hygiene across both real minerals.
if (productionIntegrityResult.invocationId === productionIdentityResult.invocationId) {
  throw new Error('two separate mineral invocations shared one invocation id');
}
if (productionIntegrityResult.evidence.correlationId !== productionCorrelationId
  || productionIdentityResult.evidence.correlationId !== productionCorrelationId) {
  throw new Error('the shared correlation id did not survive both invocations');
}
if (productionIntegrityResult.evidence.capability.id !== 'aoc:sovereignty-capability:integrity'
  || productionIdentityResult.evidence.capability.id !== 'aoc:sovereignty-capability:identity') {
  throw new Error('evidence lost its canonical mineral attribution');
}
if ('subject' in productionIntegrityResult.evidence) throw new Error('Integrity evidence invented a subject');
if (productionIdentityResult.evidence.subject?.sovereignAssetId !== productionSubject.sovereignAssetId) {
  throw new Error('Identity evidence does not carry the newly created subject');
}
for (const evidence of [productionIntegrityResult.evidence, productionIdentityResult.evidence]) {
  if (!isValidSovereigntyCapabilityInvocationEvidence(evidence)) throw new Error('invalid capability evidence');
  const serializedEvidence = JSON.stringify(evidence);
  for (const leak of ['hello sovereign world', productionContentIdentity.digest, 'manifest', 'registrant', 'bytes']) {
    if (serializedEvidence.includes(leak)) throw new Error(`generic evidence leaked "${leak}"`);
  }
}

// Identity refuses to mint a second identity for an existing subject.
const productionAlreadyIdentified = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: identityCapabilityRef,
    subject: productionSubject,
    input: { registrant: 'principal:consumer' } as IdentitySovereigntyCapabilityInput,
  }),
  productionIdentity,
);
if (productionAlreadyIdentified.status !== 'failed'
  || productionAlreadyIdentified.reasonCodes[0] !== 'IDENTITY_SUBJECT_ALREADY_EXISTS') {
  throw new Error('Identity minted a second identity for an existing subject');
}


// SM-05: the THIRD production Sovereignty Mineral, from the packed tarball only.
// Real Identity creates two subjects; real Provenance records a real derivation
// between them and traces the lineage. No fake implementation, no source
// import, no Enterprise package, no database.
const provenanceCapabilityRef = getSovereigntyCapabilityRefByKey('provenance') as SovereigntyCapabilityRef;
const productionProvenance = createProvenanceSovereigntyCapabilityImplementation();
if (productionProvenance.capability.id !== 'aoc:sovereignty-capability:provenance') {
  throw new Error('production Provenance capsule does not advertise the canonical id');
}
if (productionProvenance.capability.version !== provenanceCapabilityRef.version) {
  throw new Error('production Provenance capsule drifted from the canonical capability version');
}

const createProvenanceSubject = async (externalId: string): Promise<SovereignSubjectRef> => {
  const created = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: identityCapabilityRef,
      correlationId: 'sm05-derivative-onboarding-001',
      input: {
        registrant: 'principal:consumer',
        externalReference: buildSovereignExternalReference({ namespace: 'alien-system-v47', id: externalId }),
      } as IdentitySovereigntyCapabilityInput,
    }),
    productionIdentity,
  );
  if (created.status !== 'succeeded') throw new Error('real Identity invocation failed');
  return created.output.subject;
};

const provenanceSourceSubject = await createProvenanceSubject('alien-resource-source');
const provenanceDerivedSubject = await createProvenanceSubject('alien-resource-derived');
if (provenanceSourceSubject.sovereignAssetId === provenanceDerivedSubject.sovereignAssetId) {
  throw new Error('two Identity invocations produced one subject');
}

// Provenance requires an existing sovereign subject.
const provenanceWithoutSubject = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: provenanceCapabilityRef,
    input: {
      operation: 'declare-origin',
      claimId: 'claim:origin:consumer',
      issuer: 'principal:consumer',
      assertedOrigin: 'future-system-origin-42',
    } as ProvenanceSovereigntyCapabilityInput,
  }),
  productionProvenance,
);
if (provenanceWithoutSubject.status !== 'failed'
  || provenanceWithoutSubject.reasonCodes[0] !== 'PROVENANCE_SUBJECT_REQUIRED') {
  throw new Error('Provenance did not require an existing sovereign subject');
}

const originResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: provenanceCapabilityRef,
    subject: provenanceSourceSubject,
    correlationId: 'sm05-derivative-onboarding-001',
    input: {
      operation: 'declare-origin',
      claimId: 'claim:origin:consumer',
      issuer: 'principal:consumer',
      assertedOrigin: 'future-system-origin-42',
    } as ProvenanceSovereigntyCapabilityInput,
  }),
  productionProvenance,
);
if (originResult.status !== 'succeeded' || originResult.output.operation !== 'declare-origin') {
  throw new Error('production declare-origin did not execute');
}
if (originResult.output.claim.type !== ClaimType.Origin) throw new Error('origin claim is not ClaimType.Origin');
if (originResult.output.claim.subject !== provenanceSourceSubject.sovereignAssetId) {
  throw new Error('origin claim subject is not the invocation subject');
}
if ('proof' in originResult.output.claim) throw new Error('Provenance signed its own claim');

const authorshipResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: provenanceCapabilityRef,
    subject: provenanceSourceSubject,
    input: {
      operation: 'declare-authorship',
      claimId: 'claim:authorship:consumer',
      issuer: 'principal:consumer',
      statement: 'Authored by the consumer',
    } as ProvenanceSovereigntyCapabilityInput,
  }),
  productionProvenance,
);
if (authorshipResult.status !== 'succeeded' || authorshipResult.output.operation !== 'declare-authorship') {
  throw new Error('production declare-authorship did not execute');
}
if (authorshipResult.output.claim.metadata.kind !== AuthorityClaimKind.Authorship) {
  throw new Error('the authority kind is not fixed to Authorship');
}

const derivationResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: provenanceCapabilityRef,
    subject: provenanceDerivedSubject,
    correlationId: 'sm05-derivative-onboarding-001',
    input: {
      operation: 'record-derivation',
      claimId: 'claim:derivation:consumer',
      issuer: 'principal:consumer',
      sourceSovereignAssetIds: [provenanceSourceSubject.sovereignAssetId],
      relation: DerivationRelationKind.TransformedFrom,
      statement: 'Derived artifact produced by the consumer',
      occurredAt: '2026-01-01T00:00:00.000Z',
    } as ProvenanceSovereigntyCapabilityInput,
  }),
  productionProvenance,
);
if (derivationResult.status !== 'succeeded' || derivationResult.output.operation !== 'record-derivation') {
  throw new Error('production record-derivation did not execute');
}
const consumerDerivationClaim: DerivationClaim = derivationResult.output.claim;
if (consumerDerivationClaim.type !== ClaimType.Derivation) throw new Error('not a ClaimType.Derivation');
if (consumerDerivationClaim.subject !== provenanceDerivedSubject.sovereignAssetId) {
  throw new Error('the derivation child is not the invocation subject');
}
if (consumerDerivationClaim.metadata.sourceSovereignAssetIds[0] !== provenanceSourceSubject.sovereignAssetId) {
  throw new Error('the derivation source is not the source subject');
}
if (consumerDerivationClaim.metadata.occurredAt === consumerDerivationClaim.issuedAt) {
  throw new Error('occurredAt collapsed into issuedAt');
}
if (!isValidDerivationClaim(consumerDerivationClaim)) throw new Error('the derivation claim is not valid');

const selfDerivationResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: provenanceCapabilityRef,
    subject: provenanceDerivedSubject,
    input: {
      operation: 'record-derivation',
      claimId: 'claim:derivation:self',
      issuer: 'principal:consumer',
      sourceSovereignAssetIds: [provenanceDerivedSubject.sovereignAssetId],
      relation: DerivationRelationKind.DerivedFrom,
    } as ProvenanceSovereigntyCapabilityInput,
  }),
  productionProvenance,
);
if (selfDerivationResult.status !== 'failed'
  || selfDerivationResult.reasonCodes[0] !== 'PROVENANCE_DERIVATION_SELF_REFERENCE') {
  throw new Error('a self-referencing derivation was accepted');
}

const lineageResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: provenanceCapabilityRef,
    subject: provenanceDerivedSubject,
    correlationId: 'sm05-derivative-onboarding-001',
    input: {
      operation: 'trace-lineage',
      direction: 'ancestors',
      derivationClaims: [consumerDerivationClaim],
    } as ProvenanceSovereigntyCapabilityInput,
  }),
  productionProvenance,
);
if (lineageResult.status !== 'succeeded' || lineageResult.output.operation !== 'trace-lineage') {
  throw new Error('production trace-lineage did not execute');
}
const consumerTrace = lineageResult.output.trace;
if (!consumerTrace.nodes.some((node) => node.sovereignAssetId === provenanceSourceSubject.sovereignAssetId)) {
  throw new Error('the source subject does not appear as an ancestor');
}
if (consumerTrace.edges.length !== 1 || consumerTrace.edges[0].claimId !== consumerDerivationClaim.id) {
  throw new Error('the lineage edge lost its claim identity');
}
if (consumerTrace.edges[0].relation !== DerivationRelationKind.TransformedFrom) {
  throw new Error('the lineage edge lost its relation');
}
if (consumerTrace.cycleDetected || consumerTrace.truncated) throw new Error('acyclic complete trace misreported');

const descendantResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: provenanceCapabilityRef,
    subject: provenanceSourceSubject,
    input: {
      operation: 'trace-lineage',
      direction: 'descendants',
      derivationClaims: [consumerDerivationClaim],
    } as ProvenanceSovereigntyCapabilityInput,
  }),
  productionProvenance,
);
if (descendantResult.status !== 'succeeded' || descendantResult.output.operation !== 'trace-lineage') {
  throw new Error('descendant trace did not execute');
}
if (descendantResult.output.trace.nodes[0]?.sovereignAssetId !== provenanceDerivedSubject.sovereignAssetId) {
  throw new Error('the derived subject does not appear as a descendant');
}

const contestResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: provenanceCapabilityRef,
    subject: provenanceDerivedSubject,
    input: {
      operation: 'contest-provenance-claim',
      standingId: 'standing:consumer:001',
      claim: consumerDerivationClaim,
      reason: 'Independent party disputes the asserted derivation relationship',
    } as ProvenanceSovereigntyCapabilityInput,
  }),
  productionProvenance,
);
if (contestResult.status !== 'succeeded' || contestResult.output.operation !== 'contest-provenance-claim') {
  throw new Error('production contest-provenance-claim did not execute');
}
if (contestResult.output.standing.status !== StandingStatus.Contested) {
  throw new Error('contestation did not record Contested standing');
}
if (contestResult.output.claim !== consumerDerivationClaim) throw new Error('contestation replaced the claim');
if (!isValidDerivationClaim(consumerDerivationClaim)) throw new Error('contestation mutated the original claim');

for (const evidence of [
  originResult.evidence,
  authorshipResult.evidence,
  derivationResult.evidence,
  lineageResult.evidence,
  contestResult.evidence,
]) {
  if (!isValidSovereigntyCapabilityInvocationEvidence(evidence)) throw new Error('invalid Provenance evidence');
  if (evidence.capability.id !== 'aoc:sovereignty-capability:provenance') {
    throw new Error('evidence does not attribute the canonical Provenance capability');
  }
  if (evidence.capability.version !== provenanceCapabilityRef.version) {
    throw new Error('evidence lost the capability version');
  }
  if (evidence.subject?.sovereignAssetId === undefined) throw new Error('evidence lost the invocation subject');
  const serializedProvenanceEvidence = JSON.stringify(evidence);
  for (const leak of [
    'assertedOrigin', 'future-system-origin-42', 'sourceSovereignAssetIds', 'TransformedFrom',
    'nodes', 'edges', 'cycleDetected', 'issuer', 'principal:consumer', 'claim:derivation:consumer',
  ]) {
    if (serializedProvenanceEvidence.includes(leak)) throw new Error(`generic evidence leaked "${leak}"`);
  }
  if (canonicalizeJSON(JSON.parse(serializedProvenanceEvidence)) !== canonicalizeJSON(evidence)) {
    throw new Error('Provenance evidence did not survive a canonical round trip');
  }
}
if (originResult.invocationId === derivationResult.invocationId) {
  throw new Error('two Provenance invocations shared one invocation id');
}

console.log(
  `typescript-esm consumer OK: token=${token.tokenId} claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${sovereigntyCapabilities.length} nonByteSubject=${sovereignAssetId} capabilityInvocation=${identityResult.invocationId} productionMinerals=${productionSubject.sovereignAssetId} provenanceDerivation=${consumerDerivationClaim.id}`,
);
