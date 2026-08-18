import type { CapabilityToken } from '@aoc/protocol';
import type { AuditEventEnvelope } from '@aoc/protocol/contracts';
import { ClaimType, StandingStatus } from '@aoc/protocol/claims';
import type { CanonicalClaim } from '@aoc/protocol/claims';
import type { ProtocolError } from '@aoc/protocol/errors';
import type { RevocationLookup } from '@aoc/protocol/adapters';
import { AdapterRegistry, AdapterTokens } from '@aoc/protocol/runtime-registry';
import {
  SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
  parseSovereigntyPortabilityBundle,
  portableClaimOf,
  portableManifestOf,
  serializeSovereigntyPortabilityBundle,
} from '@aoc/protocol/portability';
import {
  AOC_LICENSING_ACTION_TERM_IDS,
  AOC_LICENSING_DECLARATION_TERM_IDS,
  AOC_LICENSING_SEMANTIC_NAMESPACE,
  SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
  SovereignLicenseTermsRuleEffect,
  isValidLicenseTermsClaim,
} from '@aoc/protocol/licensing';
import type { LicenseTermsClaim, SovereignLicenseTermsRuleV1 } from '@aoc/protocol/licensing';
import {
  buildSovereigntyCapabilityInvocation,
  createIdentitySovereigntyCapabilityImplementation,
  createIntegritySovereigntyCapabilityImplementation,
  createInteroperabilitySovereigntyCapabilityImplementation,
  createLicensingTermsSovereigntyCapabilityImplementation,
  createPortabilitySovereigntyCapabilityImplementation,
  createProvenanceSovereigntyCapabilityImplementation,
  createVerifiabilitySovereigntyCapabilityImplementation,
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
  InteroperabilitySovereigntyCapabilityInput,
  PortabilitySovereigntyCapabilityInput,
  ProvenanceSovereigntyCapabilityInput,
  SovereigntyCapabilityId,
  SovereigntyCapabilityImplementation,
  SovereigntyCapabilityKey,
  SovereigntyCapabilityRef,
  VerifiabilitySovereigntyCapabilityInput,
} from '@aoc/protocol/sovereignty-capabilities';
import type { AuditEventSink, VerificationKeyResolver } from '@aoc/protocol/adapters';
import {
  buildSovereignExternalReference,
  computeContentIdentity,
  contentIdentitiesEqual,
  isValidSovereignSubjectRef,
  mintSovereignAssetId,
  parseSovereignAssetId,
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
  signClaim,
  signSovereignManifest,
  signSovereignPayload,
  verifySovereignManifest,
} from '@aoc/protocol/manifest';
import type { DerivationClaim, SignedSovereignManifest } from '@aoc/protocol/manifest';
import { CANONICAL_JSON_PROFILE, canonicalizeJSON } from '@aoc/protocol/canonical';
import {
  AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY,
  AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE,
  INTEROPERABLE_CLAIM_TYPES,
  INTEROPERABLE_STANDING_STATUSES,
  SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS,
  buildSovereigntyInteroperabilityConsumerSupportV1,
} from '@aoc/protocol/interoperability';
import type { SovereigntyInteroperabilityConsumerSupportV1 } from '@aoc/protocol/interoperability';

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

// --- SM-06: the FOURTH production Sovereignty Mineral -----------------------
//
// APPLICATION A exports a real sovereign representation. APPLICATION B is
// handed the canonical JSON string and NOTHING else — no reference to A's
// objects, no registry, no database, no provider — and reconstructs the same
// subject, manifest and claim. Real Integrity over the wire string on both
// sides proves the two minerals compose without either doing the other's work.

const portabilityCapabilityRef = getSovereigntyCapabilityRefByKey('portability') as SovereigntyCapabilityRef;
const applicationAPortability = createPortabilitySovereigntyCapabilityImplementation();
const portabilityCorrelationId = 'sm06-esm-migration-001';

if (applicationAPortability.capability.id !== 'aoc:sovereignty-capability:portability') {
  throw new Error('production Portability capsule does not advertise the canonical id');
}
if (applicationAPortability.capability.version !== portabilityCapabilityRef.version) {
  throw new Error('production Portability capsule drifted from the canonical capability version');
}

const portabilityExport = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: portabilityCapabilityRef,
    subject: provenanceDerivedSubject,
    correlationId: portabilityCorrelationId,
    input: {
      operation: 'export-bundle',
      claims: [{ kind: 'claim', claim: consumerDerivationClaim }],
    } as PortabilitySovereigntyCapabilityInput,
  }),
  applicationAPortability,
);
if (portabilityExport.status !== 'succeeded' || portabilityExport.output.operation !== 'export-bundle') {
  throw new Error('production export-bundle did not execute');
}
if (portabilityExport.output.bundle.schemaVersion !== SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION) {
  throw new Error('the bundle does not carry the canonical portability schema version');
}
const portabilityWire: string = portabilityExport.output.serializedBundle;
if (portabilityWire !== serializeSovereigntyPortabilityBundle(portabilityExport.output.bundle)) {
  throw new Error('the capsule and the public serializer disagree');
}
if (portabilityWire !== canonicalizeJSON(portabilityExport.output.bundle)) {
  throw new Error('the wire form is not canonical JSON');
}

// Export requires an existing subject and never mints one.
const portabilityExportWithoutSubject = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: portabilityCapabilityRef,
    input: { operation: 'export-bundle' } as PortabilitySovereigntyCapabilityInput,
  }),
  applicationAPortability,
);
if (portabilityExportWithoutSubject.status !== 'failed'
  || portabilityExportWithoutSubject.reasonCodes[0] !== 'PORTABILITY_SUBJECT_REQUIRED') {
  throw new Error('Portability did not require an existing sovereign subject to export');
}

// Real Integrity over the wire string — explicit composition, before transport.
const bundleDigestBefore = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: integrityCapabilityRef,
    input: {
      operation: 'compute-content-identity',
      bytes: new TextEncoder().encode(portabilityWire),
    } as IntegritySovereigntyCapabilityInput,
  }),
  productionIntegrity,
);
if (bundleDigestBefore.status !== 'succeeded' || bundleDigestBefore.output.operation !== 'compute-content-identity') {
  throw new Error('real Integrity over the serialized bundle failed');
}

// ---- APPLICATION B: the string, and nothing else --------------------------
const applicationBPortability = createPortabilitySovereigntyCapabilityImplementation();
const portabilityImport = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: portabilityCapabilityRef,
    correlationId: portabilityCorrelationId,
    input: { operation: 'import-bundle', serializedBundle: portabilityWire } as PortabilitySovereigntyCapabilityInput,
  }),
  applicationBPortability,
);
if (portabilityImport.status !== 'succeeded' || portabilityImport.output.operation !== 'import-bundle') {
  throw new Error('production import-bundle did not execute without an invocation subject');
}
if (portabilityImport.subject?.sovereignAssetId !== provenanceDerivedSubject.sovereignAssetId) {
  throw new Error('subjectless import did not return the existing bundle subject');
}
if (portabilityImport.evidence.subject?.sovereignAssetId !== provenanceDerivedSubject.sovereignAssetId) {
  throw new Error('import evidence lost the imported subject');
}
const importedDerivationClaim = portableClaimOf(portabilityImport.output.bundle.claims[0]) as DerivationClaim;
if (importedDerivationClaim.id !== consumerDerivationClaim.id) throw new Error('the claim id was reminted');
if (canonicalizeJSON(importedDerivationClaim) !== canonicalizeJSON(consumerDerivationClaim)) {
  throw new Error('the derivation claim did not survive transport');
}
if (portabilityImport.output.serializedBundle !== portabilityWire) {
  throw new Error('the canonical serialization drifted across transport');
}

const bundleDigestAfter = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: integrityCapabilityRef,
    input: {
      operation: 'compute-content-identity',
      bytes: new TextEncoder().encode(portabilityImport.output.serializedBundle),
    } as IntegritySovereigntyCapabilityInput,
  }),
  productionIntegrity,
);
if (bundleDigestAfter.status !== 'succeeded' || bundleDigestAfter.output.operation !== 'compute-content-identity') {
  throw new Error('real Integrity over the imported bundle failed');
}
if (!contentIdentitiesEqual(bundleDigestAfter.output.contentIdentity, bundleDigestBefore.output.contentIdentity)) {
  throw new Error('the bundle ContentIdentity changed across transport');
}

// The imported claim is still real lineage input for another mineral.
const importedLineage = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: provenanceCapabilityRef,
    subject: portabilityImport.output.bundle.subject,
    input: {
      operation: 'trace-lineage',
      direction: 'ancestors',
      derivationClaims: [importedDerivationClaim],
    } as ProvenanceSovereigntyCapabilityInput,
  }),
  productionProvenance,
);
if (importedLineage.status !== 'succeeded' || importedLineage.output.operation !== 'trace-lineage') {
  throw new Error('real Provenance could not trace lineage from the imported claim');
}
if (!importedLineage.output.trace.nodes.some(
  (node) => node.sovereignAssetId === provenanceSourceSubject.sovereignAssetId,
)) {
  throw new Error('the imported derivation lost its ancestor');
}

// The public parser reaches the same bundle from the same string.
const parsedBundle = parseSovereigntyPortabilityBundle(portabilityWire);
if (!parsedBundle.valid) throw new Error('the public parser rejected a canonical bundle');
if (serializeSovereigntyPortabilityBundle(parsedBundle.bundle) !== portabilityWire) {
  throw new Error('the parser round trip drifted');
}
if (portableManifestOf === undefined) throw new Error('portableManifestOf is not exported');

// Import fails closed on untrusted input.
const portabilityMalformed = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: portabilityCapabilityRef,
    input: { operation: 'import-bundle', serializedBundle: '{ not-json' } as PortabilitySovereigntyCapabilityInput,
  }),
  applicationBPortability,
);
if (portabilityMalformed.status !== 'failed' || portabilityMalformed.reasonCodes[0] !== 'PORTABILITY_INVALID_JSON') {
  throw new Error('malformed JSON was not rejected as an ordinary failed outcome');
}

const portabilityMismatch = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: portabilityCapabilityRef,
    subject: provenanceSourceSubject,
    input: { operation: 'import-bundle', serializedBundle: portabilityWire } as PortabilitySovereigntyCapabilityInput,
  }),
  applicationBPortability,
);
if (portabilityMismatch.status !== 'failed' || portabilityMismatch.reasonCodes[0] !== 'PORTABILITY_SUBJECT_MISMATCH') {
  throw new Error('an explicitly mismatched import subject was not rejected');
}

for (const evidence of [portabilityExport.evidence, portabilityImport.evidence]) {
  if (!isValidSovereigntyCapabilityInvocationEvidence(evidence)) throw new Error('invalid Portability evidence');
  if (evidence.capability.id !== 'aoc:sovereignty-capability:portability') {
    throw new Error('evidence does not attribute the canonical Portability capability');
  }
  if (evidence.correlationId !== portabilityCorrelationId) throw new Error('the correlation id did not survive');
  const serializedPortabilityEvidence = JSON.stringify(evidence);
  for (const leak of [
    'serializedBundle', 'aoc-sovereignty-portability-bundle/1', 'manifests', 'standings',
    'sourceSovereignAssetIds', 'claim:derivation:consumer', 'TransformedFrom',
  ]) {
    if (serializedPortabilityEvidence.includes(leak)) {
      throw new Error(`generic Portability evidence leaked "${leak}"`);
    }
  }
}
if (portabilityExport.invocationId === portabilityImport.invocationId) {
  throw new Error('two Portability invocations shared one invocation id');
}

// --- SM-07: AOC.INTEROPERABILITY over the representation that just arrived ---
//
// Application B holds `portabilityImport.output.bundle` and nothing else. It
// now works out what the representation is, and whether it can consume it.

const interoperabilityCapabilityRef =
  getSovereigntyCapabilityRefByKey('interoperability') as SovereigntyCapabilityRef;
const applicationBInteroperability = createInteroperabilitySovereigntyCapabilityImplementation();

if (applicationBInteroperability.capability.id !== 'aoc:sovereignty-capability:interoperability') {
  throw new Error('production Interoperability capsule does not advertise the canonical id');
}
if (applicationBInteroperability.capability.version !== interoperabilityCapabilityRef.version) {
  throw new Error('production Interoperability capsule drifted from the canonical capability version');
}

// Subjectless: this runtime has no local record of the arrived subject.
const interoperabilityDescribe = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: interoperabilityCapabilityRef,
    correlationId: portabilityCorrelationId,
    input: {
      operation: 'describe-bundle',
      bundle: portabilityImport.output.bundle,
    } as InteroperabilitySovereigntyCapabilityInput,
  }),
  applicationBInteroperability,
);
if (
  interoperabilityDescribe.status !== 'succeeded'
  || interoperabilityDescribe.output.operation !== 'describe-bundle'
) {
  throw new Error('production describe-bundle did not execute');
}
if (
  interoperabilityDescribe.subject?.sovereignAssetId
  !== portabilityImport.output.bundle.subject.sovereignAssetId
) {
  throw new Error('subjectless description did not return the bundle subject');
}

const interoperabilityProfile = interoperabilityDescribe.output.profile;
const interoperabilityDescriptor = interoperabilityDescribe.output.descriptor;

// The representation identifies itself, through public API only.
if (interoperabilityProfile.id !== 'aoc:interoperability-profile:sovereignty-portability') {
  throw new Error('the profile does not carry the canonical AOC interoperability profile id');
}
if (interoperabilityProfile.version !== '1.0.0') throw new Error('the profile version is not readable');
if (
  interoperabilityProfile.mediaType !== AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE
  || interoperabilityProfile.mediaType !== 'application/vnd.aoc.sovereignty-portability+json'
) {
  throw new Error('the canonical media type is not what an external system was told to expect');
}
if (interoperabilityProfile.representation.schemaVersion !== SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION) {
  throw new Error('the profile does not identify the SM-06 bundle schema');
}
if (interoperabilityProfile.representation.canonicalizationProfile !== CANONICAL_JSON_PROFILE) {
  throw new Error('the profile does not identify the canonical JSON profile');
}
for (const kind of ['claim', 'manifest', 'signed-claim', 'signed-manifest', 'standing'] as const) {
  if (!(interoperabilityProfile.artifactKinds as readonly string[]).includes(kind)) {
    throw new Error(`the profile does not advertise the '${kind}' artifact kind`);
  }
}
for (const claimType of ['Origin', 'Authorship', 'Derivation'] as const) {
  if (!(interoperabilityProfile.claimTypes as readonly string[]).includes(claimType)) {
    throw new Error(`the profile does not advertise ${claimType} claim semantics`);
  }
}

// The semantic layer is readable data an external system can act on.
const sovereigntyVocabularyTerms = AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY.categories.flatMap(
  (category) => [...category.termRefs],
);
for (const termRef of [
  'aoc.sovereignty:sovereign-asset-identity',
  'aoc.sovereignty:content-identity',
  'aoc.sovereignty:derivation-assertion',
  'aoc.sovereignty:portable-sovereign-representation',
]) {
  if (!sovereigntyVocabularyTerms.includes(termRef)) {
    throw new Error(`the canonical sovereignty vocabulary does not define ${termRef}`);
  }
}

// What is actually present in THIS representation.
if (JSON.stringify([...interoperabilityDescriptor.present.claimTypes]) !== JSON.stringify(['Derivation'])) {
  throw new Error('the descriptor did not detect the Derivation semantics that travelled');
}
if (JSON.stringify([...interoperabilityDescriptor.present.claimArtifactKinds]) !== JSON.stringify(['claim'])) {
  throw new Error('the descriptor did not detect the unsigned claim wrapper');
}
for (const leak of ['sourceSovereignAssetIds', 'TransformedFrom', 'claim:derivation:consumer']) {
  if (JSON.stringify(interoperabilityDescriptor).includes(leak)) {
    throw new Error(`the descriptor duplicated "${leak}"`);
  }
}

const consumerSupportFor = (
  overrides: {
    claimTypes?: readonly (typeof INTEROPERABLE_CLAIM_TYPES)[number][];
    representationSchemaVersions?: readonly string[];
  } = {},
): SovereigntyInteroperabilityConsumerSupportV1 =>
  buildSovereigntyInteroperabilityConsumerSupportV1({
    profile: {
      id: interoperabilityDescriptor.profile.id,
      acceptedVersions: [interoperabilityDescriptor.profile.version],
    },
    mediaTypes: [interoperabilityDescriptor.mediaType],
    representationSchemaVersions:
      overrides.representationSchemaVersions ?? [interoperabilityDescriptor.representation.schemaVersion],
    canonicalizationProfiles: [interoperabilityDescriptor.representation.canonicalizationProfile],
    artifactKinds: [...SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS],
    claimTypes: overrides.claimTypes ?? [...INTEROPERABLE_CLAIM_TYPES],
    standingStatuses: [...INTEROPERABLE_STANDING_STATUSES],
    semanticTerms: [...interoperabilityDescriptor.present.semanticRequirements],
  });

const assessCompatibility = async (
  consumerSupport: SovereigntyInteroperabilityConsumerSupportV1,
) =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: interoperabilityCapabilityRef,
      correlationId: portabilityCorrelationId,
      input: {
        operation: 'assess-compatibility',
        descriptor: interoperabilityDescriptor,
        consumerSupport,
      } as InteroperabilitySovereigntyCapabilityInput,
    }),
    applicationBInteroperability,
  );

// FULL
const fullCompatibility = await assessCompatibility(consumerSupportFor());
if (
  fullCompatibility.status !== 'succeeded'
  || fullCompatibility.output.operation !== 'assess-compatibility'
) {
  throw new Error('production assess-compatibility did not execute');
}
if (fullCompatibility.output.report.status !== 'compatible') {
  throw new Error(`expected a compatible report, got ${fullCompatibility.output.report.status}`);
}

// PARTIAL — and an incompatibility of understanding never means data loss.
const wireBeforeAssessment = portabilityImport.output.serializedBundle;
const partialCompatibility = await assessCompatibility(
  consumerSupportFor({ claimTypes: ['Authorship', 'Origin'] }),
);
if (
  partialCompatibility.status !== 'succeeded'
  || partialCompatibility.output.operation !== 'assess-compatibility'
) {
  throw new Error('a partial assessment was reported as an execution failure');
}
if (partialCompatibility.output.report.status !== 'partially-compatible') {
  throw new Error(`expected a partial report, got ${partialCompatibility.output.report.status}`);
}
if (
  JSON.stringify([...partialCompatibility.output.report.unsupportedClaimTypes])
  !== JSON.stringify(['Derivation'])
) {
  throw new Error('the partial report did not name Derivation as the unsupported claim type');
}
if (serializeSovereigntyPortabilityBundle(portabilityImport.output.bundle) !== wireBeforeAssessment) {
  throw new Error('the representation changed as a result of a partial compatibility result');
}
if (portabilityImport.output.bundle.claims.length !== 1) throw new Error('an unsupported claim was dropped');

// INCOMPATIBLE — still an ordinary successful execution.
const incompatible = await assessCompatibility(
  consumerSupportFor({ representationSchemaVersions: ['some-other-representation/1'] }),
);
if (incompatible.status !== 'succeeded' || incompatible.output.operation !== 'assess-compatibility') {
  throw new Error('an incompatibility was reported as an execution failure');
}
if (incompatible.output.report.status !== 'incompatible') {
  throw new Error(`expected an incompatible report, got ${incompatible.output.report.status}`);
}
if (
  !incompatible.output.report.reasonCodes.includes('INTEROPERABILITY_UNSUPPORTED_REPRESENTATION_SCHEMA')
) {
  throw new Error('the incompatible report did not carry the unsupported-schema reason code');
}
if (incompatible.evidence.outcome !== 'succeeded') {
  throw new Error('an ordinary incompatibility was recorded as a failed invocation');
}

for (const result of [interoperabilityDescribe, fullCompatibility, partialCompatibility, incompatible]) {
  const evidence = result.evidence;
  if (!isValidSovereigntyCapabilityInvocationEvidence(evidence)) {
    throw new Error('invalid Interoperability evidence');
  }
  if (evidence.capability.id !== 'aoc:sovereignty-capability:interoperability') {
    throw new Error('evidence does not attribute the canonical Interoperability capability');
  }
  if (evidence.correlationId !== portabilityCorrelationId) {
    throw new Error('the correlation id did not survive');
  }
  const serializedInteroperabilityEvidence = JSON.stringify(evidence);
  for (const leak of [
    'aoc-sovereignty-interoperability-descriptor/1', 'aoc-sovereignty-interoperability-report/1',
    'aoc:interoperability-profile:sovereignty-portability', 'partially-compatible',
    'unsupportedClaimTypes', 'Derivation', 'semanticVocabulary',
  ]) {
    if (serializedInteroperabilityEvidence.includes(leak)) {
      throw new Error(`generic Interoperability evidence leaked "${leak}"`);
    }
  }
}

// --- SM-08: AOC.VERIFIABILITY, the SIXTH production Sovereignty Mineral ------
//
// The key pair below is TEST ONLY fixture material: it exists so there is
// something signed to verify. The capsule never receives it — Verifiability
// verifies and never signs, and signing goes through the pre-existing public
// low-level primitives, exactly as a real issuer with its own key management
// would do it.

const verifiabilityCorrelationId = 'sm08-esm-six-mineral-001';
const verifiabilityRef = getSovereigntyCapabilityRefByKey('verifiability') as SovereigntyCapabilityRef;
const verifiabilityCapsule = createVerifiabilitySovereigntyCapabilityImplementation();
if (verifiabilityCapsule.capability.id !== 'aoc:sovereignty-capability:verifiability') {
  throw new Error('production Verifiability capsule does not advertise the canonical id');
}
if (verifiabilityCapsule.capability.version !== verifiabilityRef.version) {
  throw new Error('production Verifiability capsule drifted from the canonical capability version');
}

const sm08TestKeyPair = generateSovereignKeyPair();
const sm08OtherTestKeyPair = generateSovereignKeyPair();

const sm08IntegrityResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef,
    correlationId: verifiabilityCorrelationId,
    input: {
      operation: 'compute-content-identity',
      bytes: new TextEncoder().encode('sm08-esm-consumer-fixture-bytes'),
    } as IntegritySovereigntyCapabilityInput,
  }),
  createIntegritySovereigntyCapabilityImplementation(),
);
if (sm08IntegrityResult.status !== 'succeeded' || sm08IntegrityResult.output.operation !== 'compute-content-identity') {
  throw new Error('real Integrity invocation failed');
}

const sm08IdentityResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef,
    correlationId: verifiabilityCorrelationId,
    input: {
      registrant: 'principal:sm08-esm-issuer',
      contentIdentity: sm08IntegrityResult.output.contentIdentity,
      externalReference: buildSovereignExternalReference({
        namespace: 'example:property-registry',
        id: 'parcel-88-201-B',
        locator: 'registry://county/parcel/88-201-B',
      }),
    } as IdentitySovereigntyCapabilityInput,
  }),
  createIdentitySovereigntyCapabilityImplementation(),
);
if (sm08IdentityResult.status !== 'succeeded') throw new Error('real Identity invocation failed');
const sm08Subject: SovereignSubjectRef = sm08IdentityResult.output.subject;

const sm08SignedManifest: SignedSovereignManifest = signSovereignManifest(
  sm08IdentityResult.output.manifest,
  sm08TestKeyPair.privateKeyPem,
  sm08TestKeyPair.signingKey,
  new Date('2026-04-01T09:00:00.000Z'),
);

const sm08SourceIdentityResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef,
    correlationId: verifiabilityCorrelationId,
    input: { registrant: 'principal:sm08-esm-issuer' } as IdentitySovereigntyCapabilityInput,
  }),
  createIdentitySovereigntyCapabilityImplementation(),
);
if (sm08SourceIdentityResult.status !== 'succeeded') throw new Error('real Identity invocation failed');

const sm08DerivationResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('provenance') as SovereigntyCapabilityRef,
    subject: sm08Subject,
    correlationId: verifiabilityCorrelationId,
    input: {
      operation: 'record-derivation',
      claimId: 'claim:derivation:sm08-esm-consumer',
      issuer: 'principal:sm08-esm-issuer',
      issuedAt: '2026-04-01T09:00:00.000Z',
      sourceSovereignAssetIds: [sm08SourceIdentityResult.output.subject.sovereignAssetId],
      relation: DerivationRelationKind.TransformedFrom,
    } as ProvenanceSovereigntyCapabilityInput,
  }),
  createProvenanceSovereigntyCapabilityImplementation(),
);
if (sm08DerivationResult.status !== 'succeeded' || sm08DerivationResult.output.operation !== 'record-derivation') {
  throw new Error('real Provenance invocation failed');
}
const sm08SignedClaim = signClaim(
  sm08DerivationResult.output.claim,
  sm08TestKeyPair.privateKeyPem,
  sm08TestKeyPair.signingKey,
  new Date('2026-04-01T09:00:00.000Z'),
);

const sm08Portability = createPortabilitySovereigntyCapabilityImplementation();
const sm08Export = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('portability') as SovereigntyCapabilityRef,
    subject: sm08Subject,
    correlationId: verifiabilityCorrelationId,
    input: {
      operation: 'export-bundle',
      manifests: [{ kind: 'signed-manifest', signedManifest: sm08SignedManifest }],
      claims: [{ kind: 'signed-claim', signedClaim: sm08SignedClaim }],
    } as PortabilitySovereigntyCapabilityInput,
  }),
  sm08Portability,
);
if (sm08Export.status !== 'succeeded' || sm08Export.output.operation !== 'export-bundle') {
  throw new Error('real Portability export failed');
}
const sm08Wire = sm08Export.output.serializedBundle;

const sm08Import = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('portability') as SovereigntyCapabilityRef,
    correlationId: verifiabilityCorrelationId,
    input: { operation: 'import-bundle', serializedBundle: sm08Wire } as PortabilitySovereigntyCapabilityInput,
  }),
  sm08Portability,
);
if (sm08Import.status !== 'succeeded' || sm08Import.output.operation !== 'import-bundle') {
  throw new Error('real Portability import failed');
}
const sm08ImportedManifestArtifact = sm08Import.output.bundle.manifests[0];
const sm08ImportedClaimArtifact = sm08Import.output.bundle.claims[0];
if (sm08ImportedManifestArtifact?.kind !== 'signed-manifest') {
  throw new Error('the signed manifest did not survive transport');
}
if (sm08ImportedClaimArtifact?.kind !== 'signed-claim') {
  throw new Error('the signed claim did not survive transport');
}
if (canonicalizeJSON(sm08ImportedManifestArtifact.signedManifest) !== canonicalizeJSON(sm08SignedManifest)) {
  throw new Error('Portability altered the signed manifest in transit');
}

const sm08Describe = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('interoperability') as SovereigntyCapabilityRef,
    correlationId: verifiabilityCorrelationId,
    input: {
      operation: 'describe-bundle',
      bundle: sm08Import.output.bundle,
    } as InteroperabilitySovereigntyCapabilityInput,
  }),
  createInteroperabilitySovereigntyCapabilityImplementation(),
);
if (sm08Describe.status !== 'succeeded' || sm08Describe.output.operation !== 'describe-bundle') {
  throw new Error('real Interoperability describe failed');
}
if (!sm08Describe.output.descriptor.present.manifestArtifactKinds.includes('signed-manifest')) {
  throw new Error('the descriptor did not detect the signed manifest');
}
if (!sm08Describe.output.descriptor.present.claimArtifactKinds.includes('signed-claim')) {
  throw new Error('the descriptor did not detect the signed claim');
}

const verifySm08 = async (
  input: VerifiabilitySovereigntyCapabilityInput,
  options: { subject?: SovereignSubjectRef; resolver?: VerificationKeyResolver } = {},
) =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: verifiabilityRef,
      correlationId: verifiabilityCorrelationId,
      input,
      ...(options.subject === undefined ? {} : { subject: options.subject }),
    }),
    options.resolver === undefined
      ? verifiabilityCapsule
      : createVerifiabilitySovereigntyCapabilityImplementation({ verificationKeyResolver: options.resolver }),
  );

const sm08ManifestVerification = await verifySm08({
  operation: 'verify-signed-manifest',
  signedManifest: sm08ImportedManifestArtifact.signedManifest,
});
if (sm08ManifestVerification.status !== 'succeeded' || sm08ManifestVerification.output.operation !== 'verify-signed-manifest') {
  throw new Error('real Verifiability manifest verification failed to execute');
}
if (!sm08ManifestVerification.output.verification.valid) throw new Error('a valid signed manifest did not verify');
if (sm08ManifestVerification.output.verification.checks.signature !== 'valid') throw new Error('signature check missing');
if (sm08ManifestVerification.output.verification.checks.manifestDigest !== 'valid') throw new Error('digest check missing');
if (sm08ManifestVerification.output.verification.checks.contentDigest !== 'not_performed') {
  throw new Error('Verifiability secretly performed a content-integrity check');
}
if (sm08ManifestVerification.output.verification.checks.issuerBinding !== 'not_performed') {
  throw new Error('an issuer binding was reported without a resolver');
}
if (sm08ManifestVerification.subject?.sovereignAssetId !== sm08Subject.sovereignAssetId) {
  throw new Error('Verifiability did not attribute the artifact subject');
}

const sm08ClaimVerification = await verifySm08({
  operation: 'verify-signed-claim',
  signedClaim: sm08ImportedClaimArtifact.signedClaim,
});
if (sm08ClaimVerification.status !== 'succeeded' || sm08ClaimVerification.output.operation !== 'verify-signed-claim') {
  throw new Error('real Verifiability claim verification failed to execute');
}
if (!sm08ClaimVerification.output.verification.valid) throw new Error('a valid signed claim did not verify');

const sm08GenericPayload = { resultType: 'example-protocol-result', value: 42 };
const sm08GenericProof = signSovereignPayload(
  sm08GenericPayload,
  sm08TestKeyPair.privateKeyPem,
  sm08TestKeyPair.signingKey,
  new Date('2026-04-01T09:00:00.000Z'),
);
const sm08ProofVerification = await verifySm08({
  operation: 'verify-sovereign-proof',
  payload: sm08GenericPayload,
  proof: sm08GenericProof,
});
if (sm08ProofVerification.status !== 'succeeded' || sm08ProofVerification.output.operation !== 'verify-sovereign-proof') {
  throw new Error('generic proof verification failed to execute');
}
if (!sm08ProofVerification.output.verification.valid) throw new Error('a valid generic sovereign proof did not verify');
if (sm08ProofVerification.subject !== undefined) throw new Error('the generic proof operation invented a subject');

const sm08BoundVerification = await verifySm08(
  { operation: 'verify-signed-manifest', signedManifest: sm08ImportedManifestArtifact.signedManifest },
  {
    resolver: {
      resolveVerificationKey: (issuer) =>
        issuer === 'principal:sm08-esm-issuer' ? { keyId: sm08TestKeyPair.signingKey.keyId, issuer } : undefined,
    },
  },
);
if (sm08BoundVerification.status !== 'succeeded' || sm08BoundVerification.output.operation !== 'verify-signed-manifest') {
  throw new Error('the bound Verifiability invocation failed to execute');
}
if (sm08BoundVerification.output.verification.checks.issuerBinding !== 'verified') {
  throw new Error('a correctly bound issuer key was not reported as verified');
}

const sm08WrongBinding = await verifySm08(
  { operation: 'verify-signed-manifest', signedManifest: sm08ImportedManifestArtifact.signedManifest },
  { resolver: { resolveVerificationKey: (issuer) => ({ keyId: sm08OtherTestKeyPair.signingKey.keyId, issuer }) } },
);
if (sm08WrongBinding.status !== 'succeeded' || sm08WrongBinding.output.operation !== 'verify-signed-manifest') {
  throw new Error('a wrong binding was reported as an execution failure');
}
if (sm08WrongBinding.output.verification.checks.signature !== 'valid') {
  throw new Error('a wrong binding invalidated the signature check');
}
if (sm08WrongBinding.output.verification.checks.issuerBinding !== 'unverified') {
  throw new Error('a wrong issuer binding was not reported as unverified');
}
if (sm08WrongBinding.output.verification.valid) throw new Error('a wrong issuer binding still verified overall');

// NEGATIVE: tamper a transported signed claim after signing.
const sm08TamperedTransport = JSON.parse(sm08Wire) as {
  claims: { signedClaim: { claim: { metadata: Record<string, unknown> } } }[];
};
sm08TamperedTransport.claims[0].signedClaim.claim.metadata.relation = 'CombinedFrom';
const sm08TamperedImport = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('portability') as SovereigntyCapabilityRef,
    correlationId: verifiabilityCorrelationId,
    input: {
      operation: 'import-bundle',
      serializedBundle: JSON.stringify(sm08TamperedTransport),
    } as PortabilitySovereigntyCapabilityInput,
  }),
  sm08Portability,
);
if (sm08TamperedImport.status !== 'succeeded' || sm08TamperedImport.output.operation !== 'import-bundle') {
  throw new Error('the tampered bundle could not be imported');
}
const sm08TamperedArtifact = sm08TamperedImport.output.bundle.claims[0];
if (sm08TamperedArtifact?.kind !== 'signed-claim') throw new Error('the tampered signed claim did not survive import');
const sm08TamperedVerification = await verifySm08({
  operation: 'verify-signed-claim',
  signedClaim: sm08TamperedArtifact.signedClaim,
});
if (sm08TamperedVerification.status !== 'succeeded' || sm08TamperedVerification.output.operation !== 'verify-signed-claim') {
  throw new Error('a tampered artifact was reported as an execution failure');
}
if (sm08TamperedVerification.output.verification.valid) throw new Error('a tampered signed claim verified');
if (!sm08TamperedVerification.output.verification.reasons.includes('CLAIM_SIGNATURE_INVALID')) {
  throw new Error('the tampered claim carried no signature reason');
}
if (sm08TamperedVerification.evidence.outcome !== 'succeeded') {
  throw new Error('a fail-closed verification was recorded as a failed invocation');
}

// A malformed / signing-shaped invocation IS an execution failure.
const sm08Malformed = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: verifiabilityRef,
    input: { operation: 'sign-payload' } as unknown as VerifiabilitySovereigntyCapabilityInput,
  }),
  verifiabilityCapsule,
);
if (sm08Malformed.status !== 'failed' || sm08Malformed.reasonCodes[0] !== 'VERIFIABILITY_UNSUPPORTED_OPERATION') {
  throw new Error('an unsupported (signing) operation was not rejected');
}
const sm08Mismatched = await verifySm08(
  { operation: 'verify-signed-manifest', signedManifest: sm08ImportedManifestArtifact.signedManifest },
  { subject: { sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()) } },
);
if (sm08Mismatched.status !== 'failed' || sm08Mismatched.reasonCodes[0] !== 'VERIFIABILITY_SUBJECT_MISMATCH') {
  throw new Error('an explicitly mismatched verification subject was not rejected');
}

for (const result of [
  sm08ManifestVerification,
  sm08ClaimVerification,
  sm08ProofVerification,
  sm08BoundVerification,
  sm08TamperedVerification,
]) {
  if (!isValidSovereigntyCapabilityInvocationEvidence(result.evidence)) {
    throw new Error('invalid Verifiability evidence');
  }
  if (result.evidence.capability.id !== 'aoc:sovereignty-capability:verifiability') {
    throw new Error('evidence does not attribute the canonical Verifiability capability');
  }
  const serialized = JSON.stringify(result.evidence);
  for (const leak of [
    sm08TestKeyPair.privateKeyPem,
    sm08TestKeyPair.signingKey.publicKey,
    sm08TestKeyPair.signingKey.keyId,
    sm08SignedManifest.proof.signature,
    sm08SignedManifest.manifestDigest,
    'BEGIN PRIVATE KEY',
    'issuerBinding',
    'contentDigest',
  ]) {
    if (serialized.includes(leak)) {
      throw new Error(`generic Verifiability evidence leaked "${leak.slice(0, 24)}"`);
    }
  }
}

// --- SM-09: the REAL production AOC.LICENSING_TERMS capsule ------------------
// Composed with the other six into a seven-mineral flow, all from the installed
// tarball. Nothing here is a fake, a stub or a re-implementation, and the only
// signing uses the existing public low-level primitives with TEST-ONLY keys.

const sm09CorrelationId = 'sm09-esm-seven-mineral-001';
const sm09LicensingRef = getSovereigntyCapabilityRefByKey('licensing_terms') as SovereigntyCapabilityRef;
const sm09Licensing = createLicensingTermsSovereigntyCapabilityImplementation();
if (sm09Licensing.capability.id !== 'aoc:sovereignty-capability:licensing-terms') {
  throw new Error('production Licensing & Terms capsule does not advertise the canonical id');
}
if (sm09Licensing.capability.version !== sm09LicensingRef.version) {
  throw new Error('production Licensing & Terms capsule drifted from the canonical capability version');
}

const sm09Run = async <TOutput>(
  capability: SovereigntyCapabilityRef,
  implementation: SovereigntyCapabilityImplementation<never, TOutput>,
  input: unknown,
  subject?: SovereignSubjectRef,
) =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability,
      correlationId: sm09CorrelationId,
      input: input as never,
      ...(subject === undefined ? {} : { subject }),
    }),
    implementation,
  );

const sm09Integrity = await sm09Run(
  getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef,
  createIntegritySovereigntyCapabilityImplementation() as never,
  { operation: 'compute-content-identity', bytes: new TextEncoder().encode('sm09-esm-consumer-fixture-bytes') },
);
if (sm09Integrity.status !== 'succeeded') throw new Error('real Integrity invocation failed');
const sm09ContentIdentity = (sm09Integrity.output as { contentIdentity: unknown }).contentIdentity;

const sm09Identity = await sm09Run(
  getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef,
  createIdentitySovereigntyCapabilityImplementation() as never,
  {
    registrant: 'principal:sm09-esm-registrant',
    contentIdentity: sm09ContentIdentity,
    externalReference: buildSovereignExternalReference({
      namespace: 'example.real-estate',
      id: 'parcel-77',
      locator: 'registry://land/parcel-77',
    }),
  },
);
if (sm09Identity.status !== 'succeeded') throw new Error('real Identity invocation failed');
const sm09Subject = (sm09Identity.output as { subject: SovereignSubjectRef }).subject;
const sm09Manifest = (sm09Identity.output as { manifest: { registrant: unknown } }).manifest;

const sm09Provenance = await sm09Run(
  getSovereigntyCapabilityRefByKey('provenance') as SovereigntyCapabilityRef,
  createProvenanceSovereigntyCapabilityImplementation() as never,
  {
    operation: 'record-derivation',
    claimId: 'claim:sm09-esm-derivation',
    issuer: 'principal:sm09-esm-issuer',
    issuedAt: '2026-08-18T09:00:00.000Z',
    sourceSovereignAssetIds: [parseSovereignAssetId(mintSovereignAssetId())],
    relation: DerivationRelationKind.TransformedFrom,
    statement: 'asserted, never established',
  },
  sm09Subject,
);
if (sm09Provenance.status !== 'succeeded') throw new Error('real Provenance invocation failed');
const sm09DerivationClaim = (sm09Provenance.output as { claim: DerivationClaim }).claim;

// Fixture data only: one issuer's declaration in one test, claiming no legal
// universality, and Protocol draws no conclusion from it.
const sm09Rules: readonly SovereignLicenseTermsRuleV1[] = [
  {
    id: 'R1',
    effect: SovereignLicenseTermsRuleEffect.Permission,
    action: { namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef: AOC_LICENSING_ACTION_TERM_IDS.use },
    statement: 'Use is permitted.',
  },
  {
    id: 'R2',
    effect: SovereignLicenseTermsRuleEffect.Permission,
    action: { namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef: AOC_LICENSING_ACTION_TERM_IDS.reproduce },
    statement: 'Reproduction is permitted.',
  },
  {
    id: 'R3',
    effect: SovereignLicenseTermsRuleEffect.Restriction,
    action: { namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef: AOC_LICENSING_ACTION_TERM_IDS.commercialUse },
    statement: 'Commercial use is restricted.',
  },
  {
    id: 'R4',
    effect: SovereignLicenseTermsRuleEffect.Obligation,
    action: { namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef: AOC_LICENSING_ACTION_TERM_IDS.attribute },
    statement: 'Attribution must be retained.',
  },
  {
    id: 'R5',
    effect: SovereignLicenseTermsRuleEffect.Permission,
    action: { namespace: 'example.domain', termRef: 'example.domain:special-use' },
    statement: 'Special use permitted per Agreement A-17.',
  },
];

const sm09Declare = await sm09Run(
  sm09LicensingRef,
  sm09Licensing as never,
  {
    operation: 'declare-license-terms',
    claimId: 'claim:sm09-esm-license',
    issuer: 'principal:sm09-esm-issuer',
    statement: 'Terms declared by the issuer over this subject.',
    audience: { kind: 'Public' },
    rules: sm09Rules,
    issuedAt: '2026-08-18T09:00:00.000Z',
    effectiveAt: '2026-09-01T00:00:00.000Z',
    expiresAt: '2027-09-01T00:00:00.000Z',
    evidenceRefs: ['evidence:contract:A-17'],
  },
  sm09Subject,
);
if (sm09Declare.status !== 'succeeded') throw new Error('real Licensing & Terms declaration failed');
const sm09LicenseClaim = (sm09Declare.output as { claim: LicenseTermsClaim }).claim;

if (sm09LicenseClaim.subject !== sm09Subject.sovereignAssetId) {
  throw new Error('terms were declared over the wrong subject');
}
if (sm09LicenseClaim.type !== ClaimType.Authorship) {
  throw new Error('the licensing claim left the AuthorityClaim family');
}
if (sm09LicenseClaim.metadata.kind !== AuthorityClaimKind.License) {
  throw new Error('the licensing claim lost its License kind');
}
if (sm09LicenseClaim.metadata.terms.schemaVersion !== SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION) {
  throw new Error('the terms schema version drifted');
}
if (sm09LicenseClaim.metadata.terms.rules.map((rule) => rule.id).join(',') !== 'R1,R2,R3,R4,R5') {
  throw new Error('caller-authored rule order was not preserved');
}
if (sm09LicenseClaim.metadata.terms.effectiveAt !== '2026-09-01T00:00:00.000Z') {
  throw new Error('effectiveAt was lost');
}
if (sm09LicenseClaim.expiresAt !== '2027-09-01T00:00:00.000Z') throw new Error('expiresAt was lost');
if (!isValidLicenseTermsClaim(sm09LicenseClaim)) {
  throw new Error('the declared claim does not satisfy its own validator');
}
if (sm09LicenseClaim.issuer === sm09Manifest.registrant) {
  throw new Error('the licensing issuer collapsed into the manifest registrant');
}

const sm09ValidPositive = await sm09Run(
  sm09LicensingRef,
  sm09Licensing as never,
  { operation: 'validate-license-terms', claim: sm09LicenseClaim },
  sm09Subject,
);
if (sm09ValidPositive.status !== 'succeeded') throw new Error('real Licensing & Terms validation failed');
if (!(sm09ValidPositive.output as { validation: { valid: boolean } }).validation.valid) {
  throw new Error('a valid licensing claim was reported invalid');
}

const sm09ValidNegative = await sm09Run(sm09LicensingRef, sm09Licensing as never, {
  operation: 'validate-license-terms',
  claim: {},
});
if (sm09ValidNegative.status !== 'succeeded') {
  throw new Error('an invalid validation target was reported as an execution failure');
}
if ((sm09ValidNegative.output as { validation: { valid: boolean } }).validation.valid) {
  throw new Error('an empty object validated as licensing terms');
}
if (sm09ValidNegative.evidence.outcome !== 'succeeded') {
  throw new Error('a negative validation was recorded as a failed invocation');
}

const sm09MalformedDeclare = await sm09Run(
  sm09LicensingRef,
  sm09Licensing as never,
  {
    operation: 'declare-license-terms',
    claimId: 'claim:sm09-esm-bad',
    issuer: 'principal:sm09-esm-issuer',
    statement: 'no clauses',
    audience: { kind: 'Public' },
    rules: [],
  },
  sm09Subject,
);
if (sm09MalformedDeclare.status !== 'failed'
  || sm09MalformedDeclare.reasonCodes[0] !== 'LICENSING_TERMS_RULES_REQUIRED') {
  throw new Error('a declaration with no rules was not rejected');
}

// TEST-ONLY issuer signing, via the existing public primitives.
const sm09KeyPair = generateSovereignKeyPair();
const sm09SignedLicense = signClaim(
  sm09LicenseClaim as never,
  sm09KeyPair.privateKeyPem,
  sm09KeyPair.signingKey,
  new Date('2026-08-18T09:00:00.000Z'),
);

const sm09Export = await sm09Run(
  getSovereigntyCapabilityRefByKey('portability') as SovereigntyCapabilityRef,
  createPortabilitySovereigntyCapabilityImplementation() as never,
  {
    operation: 'export-bundle',
    manifests: [{ kind: 'manifest', manifest: sm09Manifest }],
    claims: [
      { kind: 'claim', claim: sm09DerivationClaim },
      { kind: 'signed-claim', signedClaim: sm09SignedLicense },
    ],
  },
  sm09Subject,
);
if (sm09Export.status !== 'succeeded') throw new Error('real Portability export failed');

const sm09Import = await sm09Run(
  getSovereigntyCapabilityRefByKey('portability') as SovereigntyCapabilityRef,
  createPortabilitySovereigntyCapabilityImplementation() as never,
  {
    operation: 'import-bundle',
    serializedBundle: (sm09Export.output as { serializedBundle: string }).serializedBundle,
  },
);
if (sm09Import.status !== 'succeeded') throw new Error('real Portability import failed');
const sm09Bundle = (sm09Import.output as { bundle: { claims: readonly { kind: string }[] } }).bundle;
if (Object.keys(sm09Bundle).length !== 6) throw new Error('the portability envelope gained a field');

const sm09ImportedArtifact = sm09Bundle.claims.find((artifact) => artifact.kind === 'signed-claim');
if (sm09ImportedArtifact === undefined) throw new Error('the signed licensing claim did not survive transport');
const sm09ImportedClaim = portableClaimOf(sm09ImportedArtifact as never);
if (canonicalizeJSON(sm09ImportedClaim) !== canonicalizeJSON(sm09LicenseClaim)) {
  throw new Error('the licensing claim did not round-trip exactly');
}
if (!isValidLicenseTermsClaim(sm09ImportedClaim)) {
  throw new Error('the imported licensing claim failed its own validator');
}

const sm09Describe = await sm09Run(
  getSovereigntyCapabilityRefByKey('interoperability') as SovereigntyCapabilityRef,
  createInteroperabilitySovereigntyCapabilityImplementation() as never,
  { operation: 'describe-bundle', bundle: sm09Bundle },
);
if (sm09Describe.status !== 'succeeded') throw new Error('real Interoperability describe failed');
const sm09Descriptor = (sm09Describe.output as {
  descriptor: {
    schemaVersion: string;
    profile: { id: string; version: string };
    mediaType: string;
    representation: { schemaVersion: string; canonicalizationProfile: string };
    present: { semanticRequirements: readonly { namespace: string; termRef: string }[] };
  };
}).descriptor;
if (sm09Descriptor.schemaVersion !== 'aoc-sovereignty-interoperability-descriptor/1') {
  throw new Error('the Interoperability descriptor schema changed');
}
const sm09RequirementKeys = new Set(
  sm09Descriptor.present.semanticRequirements.map((requirement) => `${requirement.namespace}|${requirement.termRef}`),
);
for (const required of [
  `${AOC_LICENSING_SEMANTIC_NAMESPACE}|${AOC_LICENSING_DECLARATION_TERM_IDS.licenseTermsDeclaration}`,
  `${AOC_LICENSING_SEMANTIC_NAMESPACE}|${AOC_LICENSING_DECLARATION_TERM_IDS.permissionRule}`,
  `${AOC_LICENSING_SEMANTIC_NAMESPACE}|${AOC_LICENSING_DECLARATION_TERM_IDS.restrictionRule}`,
  `${AOC_LICENSING_SEMANTIC_NAMESPACE}|${AOC_LICENSING_DECLARATION_TERM_IDS.obligationRule}`,
  `${AOC_LICENSING_SEMANTIC_NAMESPACE}|${AOC_LICENSING_ACTION_TERM_IDS.commercialUse}`,
  'example.domain|example.domain:special-use',
]) {
  if (!sm09RequirementKeys.has(required)) throw new Error(`the descriptor did not surface ${required}`);
}

const sm09SupportFor = (
  semanticTerms: readonly { namespace: string; termRef: string }[],
): SovereigntyInteroperabilityConsumerSupportV1 =>
  buildSovereigntyInteroperabilityConsumerSupportV1({
    profile: { id: sm09Descriptor.profile.id, acceptedVersions: [sm09Descriptor.profile.version] },
    mediaTypes: [sm09Descriptor.mediaType],
    representationSchemaVersions: [sm09Descriptor.representation.schemaVersion],
    canonicalizationProfiles: [sm09Descriptor.representation.canonicalizationProfile],
    artifactKinds: [...SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS],
    claimTypes: [...INTEROPERABLE_CLAIM_TYPES],
    standingStatuses: [...INTEROPERABLE_STANDING_STATUSES],
    semanticTerms,
  });

const sm09Compatible = await sm09Run(
  getSovereigntyCapabilityRefByKey('interoperability') as SovereigntyCapabilityRef,
  createInteroperabilitySovereigntyCapabilityImplementation() as never,
  {
    operation: 'assess-compatibility',
    descriptor: sm09Descriptor,
    consumerSupport: sm09SupportFor([...sm09Descriptor.present.semanticRequirements]),
  },
);
if (sm09Compatible.status !== 'succeeded') throw new Error('real compatibility assessment failed');
if ((sm09Compatible.output as { report: { status: string } }).report.status !== 'compatible') {
  throw new Error('a fully supporting consumer was not reported compatible');
}

const sm09Partial = await sm09Run(
  getSovereigntyCapabilityRefByKey('interoperability') as SovereigntyCapabilityRef,
  createInteroperabilitySovereigntyCapabilityImplementation() as never,
  {
    operation: 'assess-compatibility',
    descriptor: sm09Descriptor,
    consumerSupport: sm09SupportFor(
      sm09Descriptor.present.semanticRequirements.filter(
        (requirement) => requirement.termRef !== 'example.domain:special-use',
      ),
    ),
  },
);
if (sm09Partial.status !== 'succeeded') throw new Error('the partial compatibility assessment failed');
if ((sm09Partial.output as { report: { status: string } }).report.status !== 'partially-compatible') {
  throw new Error('a consumer missing one licensing concept was not reported partially compatible');
}
if (sm09Bundle.claims.length !== 2) throw new Error('partial compatibility dropped an artifact');

const sm09Verifiability = createVerifiabilitySovereigntyCapabilityImplementation();
const sm09Verified = await sm09Run(
  getSovereigntyCapabilityRefByKey('verifiability') as SovereigntyCapabilityRef,
  sm09Verifiability as never,
  {
    operation: 'verify-signed-claim',
    signedClaim: (sm09ImportedArtifact as unknown as { signedClaim: unknown }).signedClaim,
  },
);
if (sm09Verified.status !== 'succeeded') throw new Error('real Verifiability could not check the signed terms');
if (!(sm09Verified.output as { verification: { valid: boolean } }).verification.valid) {
  throw new Error('a genuinely signed licensing claim did not verify');
}

// Tampered terms are detected, and never repaired.
const sm09Tampered = {
  ...sm09LicenseClaim,
  metadata: {
    ...sm09LicenseClaim.metadata,
    terms: {
      ...sm09LicenseClaim.metadata.terms,
      rules: sm09LicenseClaim.metadata.terms.rules.map((rule, index) =>
        index === 2 ? { ...rule, effect: SovereignLicenseTermsRuleEffect.Permission } : rule),
    },
  },
};
const sm09TamperedVerification = await sm09Run(
  getSovereigntyCapabilityRefByKey('verifiability') as SovereigntyCapabilityRef,
  sm09Verifiability as never,
  { operation: 'verify-signed-claim', signedClaim: { ...sm09SignedLicense, claim: sm09Tampered } },
);
if (sm09TamperedVerification.status !== 'succeeded') {
  throw new Error('a tampered artifact was reported as an execution failure');
}
if ((sm09TamperedVerification.output as { verification: { valid: boolean } }).verification.valid) {
  throw new Error('tampered terms verified');
}

// Cryptographically valid AND semantically invalid — both true at once.
const sm09Malformed = {
  ...sm09LicenseClaim,
  metadata: {
    ...sm09LicenseClaim.metadata,
    terms: {
      schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
      audience: { kind: 'Public' as const },
      rules: [],
    },
  },
};
const sm09SignedMalformed = signClaim(
  sm09Malformed as never,
  sm09KeyPair.privateKeyPem,
  sm09KeyPair.signingKey,
  new Date('2026-08-18T09:00:00.000Z'),
);
const sm09MalformedVerification = await sm09Run(
  getSovereigntyCapabilityRefByKey('verifiability') as SovereigntyCapabilityRef,
  sm09Verifiability as never,
  { operation: 'verify-signed-claim', signedClaim: sm09SignedMalformed },
);
if (sm09MalformedVerification.status !== 'succeeded'
  || !(sm09MalformedVerification.output as { verification: { valid: boolean } }).verification.valid) {
  throw new Error('a genuinely signed malformed document did not verify cryptographically');
}
const sm09MalformedValidation = await sm09Run(
  sm09LicensingRef,
  sm09Licensing as never,
  { operation: 'validate-license-terms', claim: sm09Malformed },
  sm09Subject,
);
if (sm09MalformedValidation.status !== 'succeeded') throw new Error('the malformed terms could not be validated');
const sm09MalformedReport = (sm09MalformedValidation.output as {
  validation: { valid: boolean; reasons: readonly string[] };
}).validation;
if (sm09MalformedReport.valid) throw new Error('empty terms validated');
if (!sm09MalformedReport.reasons.includes('LICENSING_TERMS_RULES_REQUIRED')) {
  throw new Error('the malformed terms carried no rules reason');
}

// Contestation: cryptographically valid AND Contested.
const sm09Contested = await sm09Run(
  sm09LicensingRef,
  sm09Licensing as never,
  {
    operation: 'contest-license-terms-claim',
    standingId: 'standing:sm09-esm-001',
    claim: sm09LicenseClaim,
    reason: 'A competing party disputes the declared terms.',
    effectiveAt: '2026-08-19T09:00:00.000Z',
  },
  sm09Subject,
);
if (sm09Contested.status !== 'succeeded') throw new Error('real Licensing & Terms contestation failed');
const sm09Standing = (sm09Contested.output as { claim: unknown; standing: { status: string } });
if (sm09Standing.standing.status !== StandingStatus.Contested) {
  throw new Error('contestation did not record a Contested standing');
}
if (canonicalizeJSON(sm09Standing.claim) !== canonicalizeJSON(sm09LicenseClaim)) {
  throw new Error('contestation modified the claim');
}
const sm09Reverified = await sm09Run(
  getSovereigntyCapabilityRefByKey('verifiability') as SovereigntyCapabilityRef,
  sm09Verifiability as never,
  { operation: 'verify-signed-claim', signedClaim: sm09SignedLicense },
);
if (sm09Reverified.status !== 'succeeded'
  || !(sm09Reverified.output as { verification: { valid: boolean } }).verification.valid) {
  throw new Error('contesting a claim invalidated its signature');
}

// Evidence hygiene: capability-attributed, and free of every terms payload.
for (const result of [sm09Declare, sm09ValidPositive, sm09ValidNegative, sm09Contested]) {
  if (!isValidSovereigntyCapabilityInvocationEvidence(result.evidence)) {
    throw new Error('invalid Licensing & Terms evidence');
  }
  if (result.evidence.capability.id !== 'aoc:sovereignty-capability:licensing-terms') {
    throw new Error('evidence does not attribute the canonical Licensing & Terms capability');
  }
  const serialized = JSON.stringify(result.evidence);
  for (const leak of [
    'Commercial use is restricted.', 'Attribution must be retained.', 'Agreement A-17',
    'aoc.licensing', 'commercial-use', '"terms"', '"rules"', '"audience"', '"claim"', '"statement"',
    sm09KeyPair.privateKeyPem, sm09SignedLicense.digest,
  ]) {
    if (serialized.includes(leak)) {
      throw new Error(`Licensing & Terms evidence leaked "${leak.slice(0, 24)}"`);
    }
  }
}

// Seven distinct capabilities under one correlation id.
const sm09FlowResults = [
  sm09Integrity, sm09Identity, sm09Provenance, sm09Declare, sm09Export, sm09Describe, sm09Verified,
];
if (new Set(sm09FlowResults.map((result) => result.evidence.capability.id)).size !== 7) {
  throw new Error('the seven-mineral flow did not attribute seven canonical capabilities');
}
for (const result of sm09FlowResults) {
  if (result.evidence.correlationId !== sm09CorrelationId) {
    throw new Error('the shared seven-mineral correlation id did not survive');
  }
}
if (new Set(sm09FlowResults.map((result) => result.invocationId)).size !== 7) {
  throw new Error('two seven-mineral invocations shared one invocation id');
}

console.log(
  `typescript-esm consumer OK: token=${token.tokenId} claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${sovereigntyCapabilities.length} nonByteSubject=${sovereignAssetId} capabilityInvocation=${identityResult.invocationId} productionMinerals=${productionSubject.sovereignAssetId} provenanceDerivation=${consumerDerivationClaim.id} portableSubject=${portabilityImport.output.bundle.subject.sovereignAssetId} describedSubject=${interoperabilityDescriptor.subject.sovereignAssetId} verifiedSubject=${sm08Subject.sovereignAssetId} licenseTerms=${sm09LicenseClaim.id}`,
);
