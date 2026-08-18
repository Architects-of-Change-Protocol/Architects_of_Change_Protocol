'use strict';

const { ClaimType } = require('@aoc/protocol/claims');
const { AdapterRegistry, AdapterTokens } = require('@aoc/protocol/runtime-registry');
const root = require('@aoc/protocol');
const contracts = require('@aoc/protocol/contracts');
const errors = require('@aoc/protocol/errors');
const adapters = require('@aoc/protocol/adapters');
const sovereigntyCapabilities = require('@aoc/protocol/sovereignty-capabilities');
const identity = require('@aoc/protocol/identity');
const manifestApi = require('@aoc/protocol/manifest');
const canonical = require('@aoc/protocol/canonical');
const portability = require('@aoc/protocol/portability');
const interoperability = require('@aoc/protocol/interoperability');
const licensing = require('@aoc/protocol/licensing');
const governanceCompatibility = require('@aoc/protocol/governance-compatibility');

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(typeof root === 'object' && root !== null, 'root import must resolve to a module object');
assert(typeof contracts === 'object' && contracts !== null, './contracts import must resolve');
assert(typeof errors === 'object' && errors !== null, './errors import must resolve');
assert(typeof adapters === 'object' && adapters !== null, './adapters import must resolve');
assert(
  typeof interoperability === 'object' && interoperability !== null,
  './interoperability import must resolve',
);
assert(typeof licensing === 'object' && licensing !== null, './licensing import must resolve');
assert(
  typeof governanceCompatibility === 'object' && governanceCompatibility !== null,
  './governance-compatibility import must resolve',
);
assert(ClaimType.Identity === 'Identity', 'ClaimType.Identity runtime value mismatch');
assert(typeof AdapterRegistry === 'function', 'AdapterRegistry must be a class/constructor');
assert(typeof AdapterTokens.AuditEventSink === 'object', 'AdapterTokens.AuditEventSink must resolve');

const capabilities = sovereigntyCapabilities.listSovereigntyCapabilities();
assert(capabilities.length === 8, 'expected exactly 8 canonical sovereignty capabilities');
assert(
  capabilities.map((capability) => capability.key).join(',') ===
    'identity,integrity,provenance,portability,interoperability,verifiability,licensing_terms,governance_compatibility',
  'sovereignty capability enumeration is not in canonical order',
);
const identityCapability = sovereigntyCapabilities.getSovereigntyCapability('aoc:sovereignty-capability:identity');
assert(identityCapability && identityCapability.name === 'Identity', 'Identity lookup by canonical id failed');
assert(
  sovereigntyCapabilities.isSovereigntyCapabilityVersion(identityCapability.version),
  'Identity has no explicit capability version',
);
assert(
  !sovereigntyCapabilities.isSovereigntyCapabilityVersion('1e2.0.0'),
  'malformed capability version accepted',
);
const governanceCapability = sovereigntyCapabilities.getSovereigntyCapabilityByKey('governance_compatibility');
assert(
  governanceCapability && governanceCapability.id === 'aoc:sovereignty-capability:governance-compatibility',
  'Governance Compatibility lookup failed',
);
assert(
  sovereigntyCapabilities.getSovereigntyCapability('aoc:sovereignty-capability:wallet') === undefined,
  'unknown sovereignty capability id resolved',
);
assert(typeof sovereigntyCapabilities.registerSovereigntyCapability === 'undefined', 'registry must be read-only');
assert(
  typeof sovereigntyCapabilities.registerSovereigntyCapabilityImplementation === 'undefined',
  'no global implementation registration surface may exist',
);
assert(
  typeof sovereigntyCapabilities.invokeSovereigntyCapability === 'function',
  'the common capability invoker must be part of the published surface',
);

// A plain-JavaScript external consumer implements the common capability
// contract and drives it through the public invoker. Demo code, not a real
// mineral: SM-04 owns the first production capsules.
const capabilityInvocationAcceptance = async () => {
  const capability = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('verifiability');
  assert(capability.id === 'aoc:sovereignty-capability:verifiability', 'derived ref lost the canonical id');
  assert(capability.version === '1.0.0', 'derived ref lost the explicit capability version');

  const delivered = [];
  const invocation = sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
    capability,
    correlationId: 'consumer-flow-js-001',
    input: { arbitrary: 'value' },
  });

  const result = await sovereigntyCapabilities.invokeSovereigntyCapability(
    invocation,
    {
      capability,
      invoke: async () => ({ status: 'succeeded', output: { testValue: true } }),
    },
    { evidenceSink: { recordAuditEvent: (event) => delivered.push(event) } },
  );

  assert(result.status === 'succeeded', 'consumer capability invocation did not succeed');
  assert(result.invocationId === invocation.invocationId, 'result invocation id drifted');
  assert(result.capability.id === capability.id, 'result capability drifted');
  assert(
    sovereigntyCapabilities.isValidSovereigntyCapabilityInvocationEvidence(result.evidence),
    'invocation evidence is not valid',
  );
  assert(
    result.evidence.capability.id === 'aoc:sovereignty-capability:verifiability' &&
      result.evidence.capability.version === '1.0.0',
    'evidence does not attribute Verifiability 1.0.0',
  );
  assert(result.evidence.correlationId === 'consumer-flow-js-001', 'evidence lost the correlation id');
  const serialized = JSON.stringify(result.evidence);
  assert(!serialized.includes('arbitrary'), 'evidence embedded the raw capability input');
  assert(!serialized.includes('testValue'), 'evidence embedded the raw capability output');
  assert(
    canonical.canonicalizeJSON(JSON.parse(serialized)) === canonical.canonicalizeJSON(result.evidence),
    'evidence did not survive a canonical round trip',
  );
  assert(delivered.length === 1, 'evidence sink did not receive exactly one record');
  assert(delivered[0].eventId === invocation.invocationId, 'delivered record identity drifted');

  let rejected = false;
  try {
    await sovereigntyCapabilities.invokeSovereigntyCapability(invocation, {
      capability: sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('identity'),
      invoke: async () => ({ status: 'succeeded', output: 1 }),
    });
  } catch (error) {
    rejected = sovereigntyCapabilities.isSovereigntyCapabilityInvocationError(error);
  }
  assert(rejected, 'a mismatched capability implementation was not rejected');

  return result.invocationId;
};

// SM-04: the two PRODUCTION Sovereignty Minerals, exercised by a plain
// CommonJS JavaScript consumer that installed nothing but the packed tarball.
// No fake implementation, no Enterprise package, no source import.
/**
 * SM-05: the THIRD production Sovereignty Mineral, consumed from the packed
 * tarball only. Real Identity creates two subjects; real Provenance records a
 * real derivation between them and traces the lineage. No fake implementation,
 * no source import, no Enterprise package, no database.
 */
const productionProvenanceAcceptance = async () => {
  const correlationId = 'sm05-derivative-onboarding-js-001';
  const identityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('identity');
  const provenanceRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('provenance');

  const productionIdentity = sovereigntyCapabilities.createIdentitySovereigntyCapabilityImplementation();
  const productionProvenance = sovereigntyCapabilities.createProvenanceSovereigntyCapabilityImplementation();
  assert(
    productionProvenance.capability.id === 'aoc:sovereignty-capability:provenance'
      && productionProvenance.capability.version === provenanceRef.version,
    'production Provenance capsule drifted from the canonical capability ref',
  );

  const createSubject = async (externalId) => {
    const created = await sovereigntyCapabilities.invokeSovereigntyCapability(
      sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
        capability: identityRef,
        correlationId,
        input: {
          registrant: 'principal:consumer',
          externalReference: identity.buildSovereignExternalReference({
            namespace: 'alien-system-v47',
            id: externalId,
          }),
        },
      }),
      productionIdentity,
    );
    assert(created.status === 'succeeded', 'real Identity invocation failed');
    return created.output.subject;
  };

  const sourceSubject = await createSubject('alien-resource-source');
  const derivedSubject = await createSubject('alien-resource-derived');
  assert(
    sourceSubject.sovereignAssetId !== derivedSubject.sovereignAssetId,
    'two Identity invocations produced one subject',
  );

  // Provenance requires an existing sovereign subject and mints none.
  const withoutSubject = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      input: {
        operation: 'declare-origin',
        claimId: 'claim:origin:consumer',
        issuer: 'principal:consumer',
        assertedOrigin: 'future-system-origin-42',
      },
    }),
    productionProvenance,
  );
  assert(
    withoutSubject.status === 'failed' && withoutSubject.reasonCodes[0] === 'PROVENANCE_SUBJECT_REQUIRED',
    'Provenance did not require an existing sovereign subject',
  );

  // A real OriginClaim — no bytes, no ContentIdentity, no dereference.
  const originResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: sourceSubject,
      correlationId,
      input: {
        operation: 'declare-origin',
        claimId: 'claim:origin:consumer',
        issuer: 'principal:consumer',
        assertedOrigin: 'future-system-origin-42',
      },
    }),
    productionProvenance,
  );
  assert(originResult.status === 'succeeded', 'production declare-origin did not execute');
  assert(originResult.output.claim.type === ClaimType.Origin, 'origin claim is not ClaimType.Origin');
  assert(
    originResult.output.claim.subject === sourceSubject.sovereignAssetId,
    'origin claim subject is not the invocation subject',
  );
  assert(!('proof' in originResult.output.claim), 'Provenance signed its own claim');

  // A real authorship assertion, fixed to the Authorship kind.
  const authorshipResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: sourceSubject,
      input: {
        operation: 'declare-authorship',
        claimId: 'claim:authorship:consumer',
        issuer: 'principal:consumer',
        statement: 'Authored by the consumer',
      },
    }),
    productionProvenance,
  );
  assert(authorshipResult.status === 'succeeded', 'production declare-authorship did not execute');
  assert(
    authorshipResult.output.claim.metadata.kind === manifestApi.AuthorityClaimKind.Authorship,
    'the authority kind is not fixed to Authorship',
  );

  // A real DerivationClaim: derived subject <- source subject.
  const derivationResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: derivedSubject,
      correlationId,
      input: {
        operation: 'record-derivation',
        claimId: 'claim:derivation:consumer',
        issuer: 'principal:consumer',
        sourceSovereignAssetIds: [sourceSubject.sovereignAssetId],
        relation: manifestApi.DerivationRelationKind.TransformedFrom,
        statement: 'Derived artifact produced by the consumer',
        occurredAt: '2026-01-01T00:00:00.000Z',
      },
    }),
    productionProvenance,
  );
  assert(derivationResult.status === 'succeeded', 'production record-derivation did not execute');
  const derivationClaim = derivationResult.output.claim;
  assert(derivationClaim.type === ClaimType.Derivation, 'not a ClaimType.Derivation');
  assert(
    derivationClaim.subject === derivedSubject.sovereignAssetId,
    'the derivation child is not the invocation subject',
  );
  assert(
    derivationClaim.metadata.sourceSovereignAssetIds.length === 1
      && derivationClaim.metadata.sourceSovereignAssetIds[0] === sourceSubject.sovereignAssetId,
    'the derivation source is not the source subject',
  );
  assert(derivationClaim.metadata.occurredAt !== derivationClaim.issuedAt, 'occurredAt collapsed into issuedAt');
  assert(manifestApi.isValidDerivationClaim(derivationClaim), 'the derivation claim is not structurally valid');

  const selfDerivation = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: derivedSubject,
      input: {
        operation: 'record-derivation',
        claimId: 'claim:derivation:self',
        issuer: 'principal:consumer',
        sourceSovereignAssetIds: [derivedSubject.sovereignAssetId],
        relation: manifestApi.DerivationRelationKind.DerivedFrom,
      },
    }),
    productionProvenance,
  );
  assert(
    selfDerivation.status === 'failed'
      && selfDerivation.reasonCodes[0] === 'PROVENANCE_DERIVATION_SELF_REFERENCE',
    'a self-referencing derivation was accepted',
  );

  // Real lineage traversal, both directions, from the one supplied claim.
  const lineageResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: derivedSubject,
      correlationId,
      input: { operation: 'trace-lineage', direction: 'ancestors', derivationClaims: [derivationClaim] },
    }),
    productionProvenance,
  );
  assert(lineageResult.status === 'succeeded', 'production trace-lineage did not execute');
  const trace = lineageResult.output.trace;
  assert(
    trace.nodes.some((node) => node.sovereignAssetId === sourceSubject.sovereignAssetId),
    'the source subject does not appear as an ancestor',
  );
  assert(
    trace.edges.length === 1 && trace.edges[0].claimId === derivationClaim.id,
    'the lineage edge lost its claim identity',
  );
  assert(
    trace.edges[0].relation === manifestApi.DerivationRelationKind.TransformedFrom,
    'the lineage edge lost its relation',
  );
  assert(!trace.cycleDetected && !trace.truncated, 'an acyclic complete trace was misreported');

  const descendantResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: sourceSubject,
      input: { operation: 'trace-lineage', direction: 'descendants', derivationClaims: [derivationClaim] },
    }),
    productionProvenance,
  );
  assert(descendantResult.status === 'succeeded', 'descendant trace did not execute');
  assert(
    descendantResult.output.trace.nodes[0]
      && descendantResult.output.trace.nodes[0].sovereignAssetId === derivedSubject.sovereignAssetId,
    'the derived subject does not appear as a descendant',
  );

  // Contestation records a challenge and preserves the claim.
  const contestResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: derivedSubject,
      input: {
        operation: 'contest-provenance-claim',
        standingId: 'standing:consumer:001',
        claim: derivationClaim,
        reason: 'Independent party disputes the asserted derivation relationship',
      },
    }),
    productionProvenance,
  );
  assert(contestResult.status === 'succeeded', 'production contest-provenance-claim did not execute');
  assert(contestResult.output.standing.status === 'Contested', 'contestation did not record Contested standing');
  assert(contestResult.output.claim === derivationClaim, 'contestation replaced the original claim');
  assert(manifestApi.isValidDerivationClaim(derivationClaim), 'contestation mutated the original claim');

  for (const evidence of [
    originResult.evidence,
    authorshipResult.evidence,
    derivationResult.evidence,
    lineageResult.evidence,
    contestResult.evidence,
  ]) {
    assert(
      sovereigntyCapabilities.isValidSovereigntyCapabilityInvocationEvidence(evidence),
      'invalid Provenance evidence',
    );
    assert(
      evidence.capability.id === 'aoc:sovereignty-capability:provenance'
        && evidence.capability.version === provenanceRef.version,
      'evidence does not attribute the canonical Provenance capability at its exact version',
    );
    assert(evidence.subject && evidence.subject.sovereignAssetId, 'evidence lost the invocation subject');
    const serialized = JSON.stringify(evidence);
    for (const leak of [
      'assertedOrigin', 'future-system-origin-42', 'sourceSovereignAssetIds', 'TransformedFrom',
      'nodes', 'edges', 'cycleDetected', 'issuer', 'principal:consumer', 'claim:derivation:consumer',
    ]) {
      assert(!serialized.includes(leak), `generic Provenance evidence leaked "${leak}"`);
    }
    assert(
      canonical.canonicalizeJSON(JSON.parse(serialized)) === canonical.canonicalizeJSON(evidence),
      'Provenance evidence did not survive a canonical round trip',
    );
  }
  assert(
    originResult.invocationId !== derivationResult.invocationId,
    'two Provenance invocations shared one invocation id',
  );

  return derivationClaim.id;
};

const productionMineralAcceptance = async () => {
  const correlationId = 'sm04-photo-onboarding-js-001';
  const bytes = new TextEncoder().encode('hello sovereign world');

  const integrityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('integrity');
  const identityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('identity');

  const productionIntegrity = sovereigntyCapabilities.createIntegritySovereigntyCapabilityImplementation();
  const productionIdentity = sovereigntyCapabilities.createIdentitySovereigntyCapabilityImplementation();
  assert(
    productionIntegrity.capability.id === 'aoc:sovereignty-capability:integrity'
      && productionIntegrity.capability.version === integrityRef.version,
    'production Integrity capsule drifted from the canonical capability ref',
  );
  assert(
    productionIdentity.capability.id === 'aoc:sovereignty-capability:identity'
      && productionIdentity.capability.version === identityRef.version,
    'production Identity capsule drifted from the canonical capability ref',
  );

  // FLOW B — bytes to a real ContentIdentity, with no sovereign identity at all.
  const integrityResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: integrityRef,
      correlationId,
      input: { operation: 'compute-content-identity', bytes },
    }),
    productionIntegrity,
  );
  assert(integrityResult.status === 'succeeded', 'production Integrity invocation failed');
  assert(
    identity.contentIdentitiesEqual(integrityResult.output.contentIdentity, identity.computeContentIdentity(bytes)),
    'capability ContentIdentity differs from the computeContentIdentity primitive',
  );
  assert(integrityResult.subject === undefined, 'Integrity invented a sovereign subject');
  const contentIdentity = integrityResult.output.contentIdentity;

  // A digest mismatch is a successful check with a negative result.
  const mismatch = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: integrityRef,
      input: {
        operation: 'verify-content-identity',
        bytes: new TextEncoder().encode('different bytes'),
        expected: contentIdentity,
      },
    }),
    productionIntegrity,
  );
  assert(mismatch.status === 'succeeded', 'a digest mismatch must not be an execution failure');
  assert(mismatch.output.check.valid === false, 'mismatching bytes reported as valid');
  assert(mismatch.output.check.reason === 'CONTENT_DIGEST_MISMATCH', 'mismatch reason was not preserved');
  assert(mismatch.evidence.outcome === 'succeeded', 'mismatch was recorded as a failed invocation');

  // FLOW C — a real sovereign identity binding that Integrity output.
  const identityResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: identityRef,
      correlationId,
      input: {
        registrant: 'principal:consumer',
        externalReference: identity.buildSovereignExternalReference({
          namespace: 'alien-system-v47',
          id: 'alien-resource-92817',
          locator: 'future://provider/object/92817',
        }),
        contentIdentity,
      },
    }),
    productionIdentity,
  );
  assert(identityResult.status === 'succeeded', 'production Identity invocation failed');
  const subject = identityResult.output.subject;
  const manifest = identityResult.output.manifest;
  assert(identity.isValidSovereignSubjectRef(subject), 'Identity produced an invalid subject reference');
  assert(subject.sovereignAssetId === manifest.sovereignAssetId, 'subject/manifest identity drift');
  assert(
    identity.contentIdentitiesEqual(manifest.contentIdentity, contentIdentity),
    'the Identity manifest does not carry the Integrity output',
  );
  assert(!('proof' in manifest) && !('manifestDigest' in manifest), 'Identity signed its own manifest');
  assert(manifest.authorityClaims.length === 0 && !('originClaim' in manifest), 'Identity fabricated a claim');
  assert(manifest.manifestVersion === 1 && manifest.state === 'active', 'unexpected initial manifest version/state');

  // FLOW A — Identity with no ContentIdentity at all.
  const identityOnly = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: identityRef,
      input: {
        registrant: 'principal:consumer',
        externalReference: identity.buildSovereignExternalReference({
          namespace: 'example:property-registry',
          id: 'property-442',
        }),
      },
    }),
    productionIdentity,
  );
  assert(identityOnly.status === 'succeeded', 'Identity must not require Integrity');
  assert(!('contentIdentity' in identityOnly.output.manifest), 'an absent contentIdentity was serialized');

  // A real manifest digest through the production Integrity capsule.
  const digestResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: integrityRef,
      input: { operation: 'compute-manifest-digest', manifest },
    }),
    productionIntegrity,
  );
  assert(digestResult.status === 'succeeded', 'production manifest digest did not execute');
  assert(
    digestResult.output.manifestDigest === manifestApi.computeManifestDigest(manifest),
    'capability manifest digest differs from the computeManifestDigest primitive',
  );

  // Attribution, correlation and evidence hygiene across both real minerals.
  assert(integrityResult.invocationId !== identityResult.invocationId, 'two minerals shared one invocation id');
  assert(
    integrityResult.evidence.correlationId === correlationId
      && identityResult.evidence.correlationId === correlationId,
    'the shared correlation id did not survive both invocations',
  );
  assert(!('subject' in integrityResult.evidence), 'Integrity evidence invented a subject');
  assert(
    identityResult.evidence.subject.sovereignAssetId === subject.sovereignAssetId,
    'Identity evidence does not carry the newly created subject',
  );
  for (const evidence of [integrityResult.evidence, identityResult.evidence]) {
    assert(
      sovereigntyCapabilities.isValidSovereigntyCapabilityInvocationEvidence(evidence),
      'invalid capability invocation evidence',
    );
    const serializedEvidence = JSON.stringify(evidence);
    for (const leak of ['hello sovereign world', contentIdentity.digest, 'manifest', 'registrant', 'bytes']) {
      assert(!serializedEvidence.includes(leak), `generic evidence leaked "${leak}"`);
    }
  }

  // Identity refuses to mint a second identity for an existing subject.
  const alreadyIdentified = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: identityRef,
      subject,
      input: { registrant: 'principal:consumer' },
    }),
    productionIdentity,
  );
  assert(
    alreadyIdentified.status === 'failed'
      && alreadyIdentified.reasonCodes[0] === 'IDENTITY_SUBJECT_ALREADY_EXISTS',
    'Identity minted a second identity for an existing subject',
  );

  return subject.sovereignAssetId;
};

// A sovereign subject with no bytes: identified, signed, serialized and
// verified from the packed tarball without fabricating content integrity.
const nonByteSubject = (() => {
  const sovereignAssetId = identity.mintSovereignAssetId();
  const externalReference = identity.buildSovereignExternalReference({
    namespace: 'alien-system-v47',
    id: 'alien-resource-92817',
    locator: 'future://provider/object/92817',
  });
  assert(identity.isValidSovereignSubjectRef({ sovereignAssetId, externalReference }), 'subject reference rejected');

  const manifest = manifestApi.buildSovereignManifestV1({
    sovereignAssetId,
    externalReference,
    registrant: 'principal:consumer',
  });
  assert(!('contentIdentity' in manifest), 'absent contentIdentity was serialized instead of omitted');
  assert(!canonical.canonicalizeJSON(manifest).includes('contentIdentity'), 'canonical payload leaked contentIdentity');

  const keys = manifestApi.generateSovereignKeyPair();
  const signed = manifestApi.signSovereignManifest(manifest, keys.privateKeyPem, keys.signingKey);
  const roundTripped = JSON.parse(JSON.stringify(signed));
  assert(
    identity.sovereignExternalReferencesEqual(roundTripped.manifest.externalReference, externalReference),
    'external reference did not survive serialization exactly',
  );
  assert(
    manifestApi.computeManifestDigest(roundTripped.manifest) === signed.manifestDigest,
    'manifest digest mismatch after round trip',
  );

  return { sovereignAssetId, roundTripped };
})();

for (const forbidden of ['@aoc/enterprise', 'aoc-enterprise', 'pmfreak']) {
  let resolved = false;
  try {
    require.resolve(forbidden);
    resolved = true;
  } catch (error) {
    resolved = false;
  }
  assert(!resolved, `consumer resolved forbidden module ${forbidden}`);
}

const registry = new AdapterRegistry();
registry.register(
  AdapterTokens.AuditEventSink,
  { recordAuditEvent: () => undefined },
  { implementation: 'noop', source: 'test-consumer', version: '0.0.0' },
);

/**
 * SM-06: the FOURTH production Sovereignty Mineral, from the packed tarball
 * alone. Application A creates a real subject through real Identity, asserts a
 * real origin through real Provenance, and exports a real canonical bundle.
 * Application B receives the JSON string and nothing else, and reconstructs the
 * same subject, manifest and claim — with real Integrity proving the wire form
 * is byte-identical on both sides.
 */
const productionPortabilityAcceptance = async () => {
  const correlationId = 'sm06-migration-js-001';
  const integrityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('integrity');
  const identityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('identity');
  const provenanceRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('provenance');
  const portabilityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('portability');

  const productionIntegrity = sovereigntyCapabilities.createIntegritySovereigntyCapabilityImplementation();
  const productionIdentity = sovereigntyCapabilities.createIdentitySovereigntyCapabilityImplementation();
  const productionProvenance = sovereigntyCapabilities.createProvenanceSovereigntyCapabilityImplementation();
  const applicationAPortability = sovereigntyCapabilities.createPortabilitySovereigntyCapabilityImplementation();

  assert(
    applicationAPortability.capability.id === 'aoc:sovereignty-capability:portability',
    'production Portability capsule does not advertise the canonical id',
  );
  assert(
    applicationAPortability.capability.version === portabilityRef.version,
    'production Portability capsule drifted from the canonical capability version',
  );

  const digestOf = async (bytes) => {
    const result = await sovereigntyCapabilities.invokeSovereigntyCapability(
      sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
        capability: integrityRef,
        input: { operation: 'compute-content-identity', bytes },
      }),
      productionIntegrity,
    );
    assert(result.status === 'succeeded', 'real Integrity invocation failed');
    return result.output.contentIdentity;
  };

  // ---- APPLICATION A -----------------------------------------------------
  const assetBytes = new TextEncoder().encode('sm06-js-consumer-fixture-bytes');
  const contentIdentity = await digestOf(assetBytes);

  const identityResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: identityRef,
      correlationId,
      input: {
        registrant: 'principal:consumer',
        contentIdentity,
        externalReference: identity.buildSovereignExternalReference({
          namespace: 'alien-system-v47',
          id: 'alien-resource-92817',
          locator: 'future://provider-p1/object/92817',
        }),
      },
    }),
    productionIdentity,
  );
  assert(identityResult.status === 'succeeded', 'real Identity invocation failed');
  const subjectX = identityResult.output.subject;
  const manifestM = identityResult.output.manifest;

  const originResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: provenanceRef,
      subject: subjectX,
      correlationId,
      input: {
        operation: 'declare-origin',
        claimId: 'claim:origin:sm06-js-consumer',
        issuer: 'principal:consumer',
        assertedOrigin: 'future-system-origin-42',
      },
    }),
    productionProvenance,
  );
  assert(originResult.status === 'succeeded', 'real Provenance declare-origin failed');
  const claimP = originResult.output.claim;

  // Export requires an existing subject and never mints one.
  const exportWithoutSubject = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: portabilityRef,
      input: { operation: 'export-bundle' },
    }),
    applicationAPortability,
  );
  assert(
    exportWithoutSubject.status === 'failed'
      && exportWithoutSubject.reasonCodes[0] === 'PORTABILITY_SUBJECT_REQUIRED',
    'Portability did not require an existing sovereign subject to export',
  );

  const exportResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: portabilityRef,
      subject: subjectX,
      correlationId,
      input: {
        operation: 'export-bundle',
        manifests: [{ kind: 'manifest', manifest: manifestM }],
        claims: [{ kind: 'claim', claim: claimP }],
      },
    }),
    applicationAPortability,
  );
  assert(
    exportResult.status === 'succeeded' && exportResult.output.operation === 'export-bundle',
    'production export-bundle did not execute',
  );
  const bundleA = exportResult.output.bundle;
  assert(
    bundleA.schemaVersion === portability.SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
    'the bundle does not carry the canonical portability schema version',
  );
  assert(
    Object.keys(bundleA).sort().join(',')
      === 'canonicalizationProfile,claims,manifests,schemaVersion,standings,subject',
    'the portability envelope grew unexpected fields',
  );

  const s1 = exportResult.output.serializedBundle;
  assert(
    s1 === portability.serializeSovereigntyPortabilityBundle(bundleA),
    'the capsule and the public serializer disagree',
  );
  assert(s1 === canonical.canonicalizeJSON(bundleA), 'the wire form is not canonical JSON');
  assert(!s1.includes('sm06-js-consumer-fixture-bytes'), 'the bundle embedded the content bytes');
  const b1 = await digestOf(new TextEncoder().encode(s1));

  // ---- APPLICATION B: the string, and nothing else ------------------------
  const applicationBPortability = sovereigntyCapabilities.createPortabilitySovereigntyCapabilityImplementation();
  const importResult = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: portabilityRef,
      correlationId,
      input: { operation: 'import-bundle', serializedBundle: s1 },
    }),
    applicationBPortability,
  );
  assert(
    importResult.status === 'succeeded' && importResult.output.operation === 'import-bundle',
    'production import-bundle did not execute without an invocation subject',
  );
  assert(
    importResult.subject.sovereignAssetId === subjectX.sovereignAssetId,
    'subjectless import did not return the existing bundle subject',
  );
  assert(
    importResult.evidence.subject.sovereignAssetId === subjectX.sovereignAssetId,
    'import evidence lost the imported subject',
  );

  const bundleB = importResult.output.bundle;
  assert(
    bundleB.subject.externalReference.locator === 'future://provider-p1/object/92817',
    'the opaque locator did not survive transport exactly',
  );
  const importedManifest = portability.portableManifestOf(bundleB.manifests[0]);
  assert(
    canonical.canonicalizeJSON(importedManifest) === canonical.canonicalizeJSON(manifestM),
    'the manifest did not survive transport',
  );
  assert(
    importedManifest.contentIdentity.digest === contentIdentity.digest,
    'the manifest lost its ContentIdentity',
  );
  const importedClaim = portability.portableClaimOf(bundleB.claims[0]);
  assert(importedClaim.id === claimP.id, 'the claim id was reminted');
  assert(
    canonical.canonicalizeJSON(importedClaim) === canonical.canonicalizeJSON(claimP),
    'the origin claim did not survive transport',
  );

  const s2 = importResult.output.serializedBundle;
  assert(s2 === s1, 'the canonical serialization drifted across transport');
  const b2 = await digestOf(new TextEncoder().encode(s2));
  assert(b2.digest === b1.digest, 'the bundle ContentIdentity changed across transport');

  const parsed = portability.parseSovereigntyPortabilityBundle(s1);
  assert(parsed.valid, 'the public parser rejected a canonical bundle');
  assert(
    portability.serializeSovereigntyPortabilityBundle(parsed.bundle) === s1,
    'the parser round trip drifted',
  );

  // ---- Import fails closed on untrusted or unsupported input --------------
  const malformed = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: portabilityRef,
      input: { operation: 'import-bundle', serializedBundle: '{ not-json' },
    }),
    applicationBPortability,
  );
  assert(
    malformed.status === 'failed' && malformed.reasonCodes[0] === 'PORTABILITY_INVALID_JSON',
    'malformed JSON was not rejected as an ordinary failed outcome',
  );

  const future = JSON.stringify({
    ...JSON.parse(s1),
    schemaVersion: 'aoc-sovereignty-portability-bundle/999',
  });
  const unsupported = await sovereigntyCapabilities.invokeSovereigntyCapability(
    sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
      capability: portabilityRef,
      input: { operation: 'import-bundle', serializedBundle: future },
    }),
    applicationBPortability,
  );
  assert(
    unsupported.status === 'failed' && unsupported.reasonCodes[0] === 'PORTABILITY_UNSUPPORTED_BUNDLE_SCHEMA',
    'a future bundle version was not rejected fail-closed',
  );

  for (const result of [exportResult, importResult]) {
    assert(
      sovereigntyCapabilities.isValidSovereigntyCapabilityInvocationEvidence(result.evidence),
      'invalid Portability evidence',
    );
    assert(
      result.evidence.capability.id === 'aoc:sovereignty-capability:portability',
      'evidence does not attribute the canonical Portability capability',
    );
    assert(result.evidence.correlationId === correlationId, 'the correlation id did not survive');
    const serializedEvidence = JSON.stringify(result.evidence);
    for (const leak of [
      'serializedBundle', 'aoc-sovereignty-portability-bundle/1', 'manifests', 'standings',
      'assertedOrigin', 'future-system-origin-42', 'claim:origin:sm06-js-consumer', contentIdentity.digest,
    ]) {
      assert(!serializedEvidence.includes(leak), `generic Portability evidence leaked "${leak}"`);
    }
  }
  assert(
    exportResult.invocationId !== importResult.invocationId,
    'two Portability invocations shared one invocation id',
  );

  return bundleB.subject.sovereignAssetId;
};


/**
 * SM-07 — the fifth production mineral from the installed tarball: an external
 * system receives a canonical AOC representation, describes it, and determines
 * whether it can consume it. Full, partial and incompatible are all exercised.
 */
const productionInteroperabilityAcceptance = async () => {
  const correlationId = 'sm07-negotiation-js-001';
  const integrityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('integrity');
  const identityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('identity');
  const provenanceRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('provenance');
  const portabilityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('portability');
  const interoperabilityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('interoperability');

  const integrity = sovereigntyCapabilities.createIntegritySovereigntyCapabilityImplementation();
  const identityCapsule = sovereigntyCapabilities.createIdentitySovereigntyCapabilityImplementation();
  const provenance = sovereigntyCapabilities.createProvenanceSovereigntyCapabilityImplementation();
  const portabilityCapsule = sovereigntyCapabilities.createPortabilitySovereigntyCapabilityImplementation();

  const capsule = sovereigntyCapabilities.createInteroperabilitySovereigntyCapabilityImplementation();
  assert(
    capsule.capability.id === 'aoc:sovereignty-capability:interoperability',
    'production Interoperability capsule does not advertise the canonical id',
  );
  assert(
    capsule.capability.version === interoperabilityRef.version,
    'production Interoperability capsule drifted from the canonical capability version',
  );

  const invoke = async (capability, input, options = {}) =>
    sovereigntyCapabilities.invokeSovereigntyCapability(
      sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
        capability,
        correlationId,
        ...options,
        input,
      }),
      options.implementation ?? capsule,
    );

  // ---- APPLICATION A ------------------------------------------------------
  const integrityResult = await invoke(
    integrityRef,
    { operation: 'compute-content-identity', bytes: new TextEncoder().encode('sm07-js-consumer-fixture-bytes') },
    { implementation: integrity },
  );
  assert(integrityResult.status === 'succeeded', 'real Integrity invocation failed');
  const contentIdentity = integrityResult.output.contentIdentity;

  const identityResult = await invoke(
    identityRef,
    {
      registrant: 'principal:js-consumer',
      contentIdentity,
      externalReference: identity.buildSovereignExternalReference({
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'future://provider-p1/object/92817',
      }),
    },
    { implementation: identityCapsule },
  );
  assert(identityResult.status === 'succeeded', 'real Identity invocation failed');
  const subjectX = identityResult.output.subject;

  const sourceResult = await invoke(
    identityRef,
    { registrant: 'principal:js-consumer' },
    { implementation: identityCapsule },
  );
  assert(sourceResult.status === 'succeeded', 'real Identity invocation failed');

  const originResult = await invoke(
    provenanceRef,
    {
      operation: 'declare-origin',
      claimId: 'claim:origin:sm07-js-consumer',
      issuer: 'principal:js-consumer',
      assertedOrigin: 'future-system-origin-42',
    },
    { implementation: provenance, subject: subjectX },
  );
  assert(originResult.status === 'succeeded', 'real Provenance declare-origin failed');

  const derivationResult = await invoke(
    provenanceRef,
    {
      operation: 'record-derivation',
      claimId: 'claim:derivation:sm07-js-consumer',
      issuer: 'principal:js-consumer',
      sourceSovereignAssetIds: [sourceResult.output.subject.sovereignAssetId],
      relation: 'TransformedFrom',
    },
    { implementation: provenance, subject: subjectX },
  );
  assert(derivationResult.status === 'succeeded', 'real Provenance record-derivation failed');

  const contestResult = await invoke(
    provenanceRef,
    {
      operation: 'contest-provenance-claim',
      standingId: 'standing:sm07-js-consumer:001',
      claim: originResult.output.claim,
      reason: 'An independent party disputes the asserted origin',
    },
    { implementation: provenance, subject: subjectX },
  );
  assert(contestResult.status === 'succeeded', 'real Provenance contestation failed');

  const exportResult = await invoke(
    portabilityRef,
    {
      operation: 'export-bundle',
      manifests: [{ kind: 'manifest', manifest: identityResult.output.manifest }],
      claims: [
        { kind: 'claim', claim: originResult.output.claim },
        { kind: 'claim', claim: derivationResult.output.claim },
      ],
      standings: [contestResult.output.standing],
    },
    { implementation: portabilityCapsule, subject: subjectX },
  );
  assert(exportResult.status === 'succeeded', 'real Portability export failed');
  const wire = exportResult.output.serializedBundle;

  // ---- APPLICATION B: the string, and nothing else ------------------------
  const importResult = await invoke(
    portabilityRef,
    { operation: 'import-bundle', serializedBundle: wire },
    { implementation: sovereigntyCapabilities.createPortabilitySovereigntyCapabilityImplementation() },
  );
  assert(importResult.status === 'succeeded', 'real Portability import failed');
  const importedBundle = importResult.output.bundle;

  // Subjectless description: Application B has no local record of the subject.
  const describeResult = await invoke(interoperabilityRef, {
    operation: 'describe-bundle',
    bundle: importedBundle,
  });
  assert(
    describeResult.status === 'succeeded' && describeResult.output.operation === 'describe-bundle',
    'real Interoperability describe-bundle failed',
  );
  assert(
    describeResult.subject.sovereignAssetId === subjectX.sovereignAssetId,
    'subjectless description did not return the bundle subject',
  );

  const { profile, descriptor } = describeResult.output;

  // ---- the representation describes itself through public API only --------
  assert(
    profile.id === 'aoc:interoperability-profile:sovereignty-portability',
    'the profile does not carry the canonical AOC interoperability profile id',
  );
  assert(profile.version === '1.0.0', 'the profile version is not readable');
  assert(
    profile.mediaType === interoperability.AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE
      && profile.mediaType === 'application/vnd.aoc.sovereignty-portability+json',
    'the canonical media type is not what an external system was told to expect',
  );
  assert(
    profile.representation.schemaVersion === portability.SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
    'the profile does not identify the SM-06 bundle schema',
  );
  assert(
    profile.representation.canonicalizationProfile === canonical.CANONICAL_JSON_PROFILE,
    'the profile does not identify the canonical JSON profile',
  );
  for (const kind of ['claim', 'manifest', 'signed-claim', 'signed-manifest', 'standing']) {
    assert(profile.artifactKinds.includes(kind), `the profile does not advertise the '${kind}' artifact kind`);
  }
  for (const claimType of ['Origin', 'Authorship', 'Derivation']) {
    assert(profile.claimTypes.includes(claimType), `the profile does not advertise ${claimType} semantics`);
  }

  // The semantic layer is readable data, not documentation.
  const vocabularyTerms = interoperability.AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY.categories
    .flatMap((category) => [...category.termRefs]);
  for (const termRef of [
    'aoc.sovereignty:sovereign-asset-identity',
    'aoc.sovereignty:content-identity',
    'aoc.sovereignty:derivation-assertion',
    'aoc.sovereignty:portable-sovereign-representation',
  ]) {
    assert(vocabularyTerms.includes(termRef), `the canonical sovereignty vocabulary does not define ${termRef}`);
  }

  assert(
    JSON.stringify([...descriptor.present.claimTypes]) === JSON.stringify(['Derivation', 'Origin']),
    'the descriptor did not detect the Origin and Derivation semantics',
  );
  assert(
    JSON.stringify([...descriptor.present.standingStatuses]) === JSON.stringify(['Contested']),
    'the descriptor did not detect the contested standing',
  );
  for (const leak of ['future-system-origin-42', 'principal:js-consumer', contentIdentity.digest]) {
    assert(!JSON.stringify(descriptor).includes(leak), `the descriptor duplicated "${leak}"`);
  }

  const supportFor = (overrides = {}) =>
    interoperability.buildSovereigntyInteroperabilityConsumerSupportV1({
      profile: { id: descriptor.profile.id, acceptedVersions: [descriptor.profile.version] },
      mediaTypes: [descriptor.mediaType],
      representationSchemaVersions:
        overrides.representationSchemaVersions ?? [descriptor.representation.schemaVersion],
      canonicalizationProfiles: [descriptor.representation.canonicalizationProfile],
      artifactKinds: [...interoperability.SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS],
      claimTypes: overrides.claimTypes ?? [...interoperability.INTEROPERABLE_CLAIM_TYPES],
      standingStatuses: [...interoperability.INTEROPERABLE_STANDING_STATUSES],
      semanticTerms: [...descriptor.present.semanticRequirements],
    });

  const assess = async (consumerSupport) =>
    invoke(interoperabilityRef, { operation: 'assess-compatibility', descriptor, consumerSupport });

  // ---- FULL ---------------------------------------------------------------
  const full = await assess(supportFor());
  assert(full.status === 'succeeded', 'a full assessment did not execute');
  assert(full.output.report.status === 'compatible', 'expected a compatible report');
  assert(full.output.report.reasonCodes.length === 0, 'a compatible report carried reason codes');

  // ---- PARTIAL ------------------------------------------------------------
  const partial = await assess(supportFor({ claimTypes: ['Authorship', 'Origin'] }));
  assert(partial.status === 'succeeded', 'a partial assessment was reported as an execution failure');
  assert(partial.output.report.status === 'partially-compatible', 'expected a partial report');
  assert(
    JSON.stringify([...partial.output.report.unsupportedClaimTypes]) === JSON.stringify(['Derivation']),
    'the partial report did not name Derivation as the unsupported claim type',
  );
  // Partial never means data loss.
  assert(
    portability.serializeSovereigntyPortabilityBundle(importedBundle) === wire,
    'the representation changed as a result of a partial compatibility result',
  );
  assert(importedBundle.claims.length === 2, 'an unsupported claim was dropped');

  // ---- INCOMPATIBLE -------------------------------------------------------
  const incompatible = await assess(supportFor({ representationSchemaVersions: ['some-other-representation/1'] }));
  assert(incompatible.status === 'succeeded', 'an incompatibility was reported as an execution failure');
  assert(incompatible.output.report.status === 'incompatible', 'expected an incompatible report');
  assert(
    incompatible.output.report.reasonCodes.includes('INTEROPERABILITY_UNSUPPORTED_REPRESENTATION_SCHEMA'),
    'the incompatible report did not carry the unsupported-schema reason code',
  );
  assert(incompatible.evidence.outcome === 'succeeded', 'an ordinary incompatibility was recorded as failed');

  // ---- evidence hygiene ---------------------------------------------------
  for (const result of [describeResult, full, partial, incompatible]) {
    assert(
      sovereigntyCapabilities.isValidSovereigntyCapabilityInvocationEvidence(result.evidence),
      'invalid Interoperability evidence',
    );
    assert(
      result.evidence.capability.id === 'aoc:sovereignty-capability:interoperability',
      'evidence does not attribute the canonical Interoperability capability',
    );
    assert(result.evidence.correlationId === correlationId, 'the correlation id did not survive');
    const serializedEvidence = JSON.stringify(result.evidence);
    for (const leak of [
      'aoc-sovereignty-interoperability-descriptor/1', 'aoc-sovereignty-interoperability-report/1',
      'aoc:interoperability-profile:sovereignty-portability', 'partially-compatible',
      'unsupportedClaimTypes', 'Contested', 'Derivation', contentIdentity.digest,
    ]) {
      assert(!serializedEvidence.includes(leak), `generic Interoperability evidence leaked "${leak}"`);
    }
  }

  return descriptor.subject.sovereignAssetId;
};

/**
 * SM-08 — the SIXTH production Sovereignty Mineral, AOC.VERIFIABILITY.
 *
 * The key pair below is TEST ONLY fixture material: it exists so there is
 * something signed to verify. The Verifiability capsule never receives it —
 * it verifies and never signs, and the signing here goes through the
 * pre-existing public low-level primitives.
 */
const productionVerifiabilityAcceptance = async () => {
  const correlationId = 'sm08-six-mineral-js-001';
  const integrityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('integrity');
  const identityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('identity');
  const provenanceRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('provenance');
  const portabilityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('portability');
  const interoperabilityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('interoperability');
  const verifiabilityRef = sovereigntyCapabilities.getSovereigntyCapabilityRefByKey('verifiability');

  const integrity = sovereigntyCapabilities.createIntegritySovereigntyCapabilityImplementation();
  const identityCapsule = sovereigntyCapabilities.createIdentitySovereigntyCapabilityImplementation();
  const provenance = sovereigntyCapabilities.createProvenanceSovereigntyCapabilityImplementation();
  const portabilityCapsule = sovereigntyCapabilities.createPortabilitySovereigntyCapabilityImplementation();
  const interoperabilityCapsule = sovereigntyCapabilities.createInteroperabilitySovereigntyCapabilityImplementation();

  const capsule = sovereigntyCapabilities.createVerifiabilitySovereigntyCapabilityImplementation();
  assert(
    capsule.capability.id === 'aoc:sovereignty-capability:verifiability',
    'production Verifiability capsule does not advertise the canonical id',
  );
  assert(
    capsule.capability.version === verifiabilityRef.version,
    'production Verifiability capsule drifted from the canonical capability version',
  );

  const invoke = async (capability, input, options = {}) =>
    sovereigntyCapabilities.invokeSovereigntyCapability(
      sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
        capability,
        correlationId,
        ...options,
        input,
      }),
      options.implementation ?? capsule,
    );

  // 1 — REAL AOC.INTEGRITY.
  const integrityResult = await invoke(
    integrityRef,
    { operation: 'compute-content-identity', bytes: new TextEncoder().encode('sm08-js-consumer-fixture-bytes') },
    { implementation: integrity },
  );
  assert(integrityResult.status === 'succeeded', 'real Integrity invocation failed');
  const contentIdentity = integrityResult.output.contentIdentity;

  // 2 — REAL AOC.IDENTITY.
  const identityResult = await invoke(
    identityRef,
    {
      registrant: 'principal:sm08-js-issuer',
      contentIdentity,
      externalReference: identity.buildSovereignExternalReference({
        namespace: 'example:external-token-system',
        id: 'token-4471',
        locator: 'ledger://chain-x/token/4471',
      }),
    },
    { implementation: identityCapsule },
  );
  assert(identityResult.status === 'succeeded', 'real Identity invocation failed');
  const subjectX = identityResult.output.subject;

  // 3 — TEST-ONLY issuer signs the manifest with the existing public primitive.
  const testKeyPair = manifestApi.generateSovereignKeyPair();
  const otherTestKeyPair = manifestApi.generateSovereignKeyPair();
  const signedManifest = manifestApi.signSovereignManifest(
    identityResult.output.manifest,
    testKeyPair.privateKeyPem,
    testKeyPair.signingKey,
    new Date('2026-04-01T09:00:00.000Z'),
  );

  // 4 — REAL AOC.PROVENANCE, then sign the claim.
  const sourceIdentityResult = await invoke(
    identityRef,
    { registrant: 'principal:sm08-js-issuer' },
    { implementation: identityCapsule },
  );
  assert(sourceIdentityResult.status === 'succeeded', 'real Identity invocation failed');
  const derivationResult = await invoke(
    provenanceRef,
    {
      operation: 'record-derivation',
      claimId: 'claim:derivation:sm08-js-consumer',
      issuer: 'principal:sm08-js-issuer',
      issuedAt: '2026-04-01T09:00:00.000Z',
      sourceSovereignAssetIds: [sourceIdentityResult.output.subject.sovereignAssetId],
      relation: manifestApi.DerivationRelationKind.TransformedFrom,
    },
    { implementation: provenance, subject: subjectX },
  );
  assert(derivationResult.status === 'succeeded', 'real Provenance invocation failed');
  const signedClaim = manifestApi.signClaim(
    derivationResult.output.claim,
    testKeyPair.privateKeyPem,
    testKeyPair.signingKey,
    new Date('2026-04-01T09:00:00.000Z'),
  );

  // 5 — REAL AOC.PORTABILITY: export, transport, import.
  const exportResult = await invoke(
    portabilityRef,
    {
      operation: 'export-bundle',
      manifests: [{ kind: 'signed-manifest', signedManifest }],
      claims: [{ kind: 'signed-claim', signedClaim }],
    },
    { implementation: portabilityCapsule, subject: subjectX },
  );
  assert(exportResult.status === 'succeeded', 'real Portability export failed');
  const wire = exportResult.output.serializedBundle;

  const importResult = await invoke(
    portabilityRef,
    { operation: 'import-bundle', serializedBundle: wire },
    { implementation: portabilityCapsule },
  );
  assert(importResult.status === 'succeeded', 'real Portability import failed');
  const importedManifestArtifact = importResult.output.bundle.manifests[0];
  const importedClaimArtifact = importResult.output.bundle.claims[0];
  assert(importedManifestArtifact.kind === 'signed-manifest', 'the signed manifest did not survive transport');
  assert(importedClaimArtifact.kind === 'signed-claim', 'the signed claim did not survive transport');
  assert(
    canonical.canonicalizeJSON(importedManifestArtifact.signedManifest)
      === canonical.canonicalizeJSON(signedManifest),
    'Portability altered the signed manifest in transit',
  );

  // 6 — REAL AOC.INTEROPERABILITY describes what arrived.
  const describeResult = await invoke(
    interoperabilityRef,
    { operation: 'describe-bundle', bundle: importResult.output.bundle },
    { implementation: interoperabilityCapsule },
  );
  assert(describeResult.status === 'succeeded', 'real Interoperability describe failed');
  assert(
    describeResult.output.descriptor.present.manifestArtifactKinds.includes('signed-manifest'),
    'the descriptor did not detect the signed manifest',
  );
  assert(
    describeResult.output.descriptor.present.claimArtifactKinds.includes('signed-claim'),
    'the descriptor did not detect the signed claim',
  );

  // 7 — REAL AOC.VERIFIABILITY: positive manifest case.
  const manifestResult = await invoke(verifiabilityRef, {
    operation: 'verify-signed-manifest',
    signedManifest: importedManifestArtifact.signedManifest,
  });
  assert(manifestResult.status === 'succeeded', 'real Verifiability manifest verification failed to execute');
  const manifestChecks = manifestResult.output.verification.checks;
  assert(manifestResult.output.verification.valid, 'a valid signed manifest did not verify');
  assert(manifestChecks.manifestStructure === 'valid', 'manifest structure check missing');
  assert(manifestChecks.manifestDigest === 'valid', 'manifest digest check missing');
  assert(manifestChecks.signature === 'valid', 'manifest signature check missing');
  assert(
    manifestChecks.contentDigest === 'not_performed',
    `Verifiability performed a hidden content check: ${manifestChecks.contentDigest}`,
  );
  assert(manifestChecks.issuerBinding === 'not_performed', 'an issuer binding was reported without a resolver');
  assert(
    manifestResult.subject.sovereignAssetId === subjectX.sovereignAssetId,
    'Verifiability did not attribute the artifact subject',
  );

  // 8 — positive claim case.
  const claimResult = await invoke(verifiabilityRef, {
    operation: 'verify-signed-claim',
    signedClaim: importedClaimArtifact.signedClaim,
  });
  assert(claimResult.status === 'succeeded', 'real Verifiability claim verification failed to execute');
  assert(claimResult.output.verification.valid, 'a valid signed claim did not verify');
  assert(claimResult.output.verification.checks.claimStructure === 'valid', 'claim structure check missing');

  // 9 — generic sovereign proof, subjectless.
  const genericPayload = { resultType: 'example-protocol-result', value: 42 };
  const genericProof = manifestApi.signSovereignPayload(
    genericPayload,
    testKeyPair.privateKeyPem,
    testKeyPair.signingKey,
    new Date('2026-04-01T09:00:00.000Z'),
  );
  const proofResult = await invoke(verifiabilityRef, {
    operation: 'verify-sovereign-proof',
    payload: genericPayload,
    proof: genericProof,
  });
  assert(proofResult.status === 'succeeded', 'generic proof verification failed to execute');
  assert(proofResult.output.verification.valid, 'a valid generic sovereign proof did not verify');
  assert(proofResult.subject === undefined, 'the generic proof operation invented a subject');

  // 10 — TEST-ONLY resolver proves the optional issuer/key binding.
  const boundCapsule = sovereigntyCapabilities.createVerifiabilitySovereigntyCapabilityImplementation({
    verificationKeyResolver: {
      resolveVerificationKey: (issuer) =>
        issuer === 'principal:sm08-js-issuer' ? { keyId: testKeyPair.signingKey.keyId, issuer } : undefined,
    },
  });
  const boundResult = await invoke(
    verifiabilityRef,
    { operation: 'verify-signed-manifest', signedManifest: importedManifestArtifact.signedManifest },
    { implementation: boundCapsule },
  );
  assert(boundResult.status === 'succeeded', 'the bound Verifiability invocation failed to execute');
  assert(
    boundResult.output.verification.checks.issuerBinding === 'verified',
    'a correctly bound issuer key was not reported as verified',
  );

  const wrongBoundCapsule = sovereigntyCapabilities.createVerifiabilitySovereigntyCapabilityImplementation({
    verificationKeyResolver: {
      resolveVerificationKey: (issuer) => ({ keyId: otherTestKeyPair.signingKey.keyId, issuer }),
    },
  });
  const wrongBindingResult = await invoke(
    verifiabilityRef,
    { operation: 'verify-signed-manifest', signedManifest: importedManifestArtifact.signedManifest },
    { implementation: wrongBoundCapsule },
  );
  assert(wrongBindingResult.status === 'succeeded', 'a wrong binding was reported as an execution failure');
  assert(
    wrongBindingResult.output.verification.checks.signature === 'valid',
    'a wrong binding invalidated the signature check',
  );
  assert(
    wrongBindingResult.output.verification.checks.issuerBinding === 'unverified',
    'a wrong issuer binding was not reported as unverified',
  );
  assert(!wrongBindingResult.output.verification.valid, 'a wrong issuer binding still verified overall');

  // 11 — NEGATIVE: tamper a transported signed manifest after signing.
  const tamperedTransport = JSON.parse(wire);
  tamperedTransport.manifests[0].signedManifest.manifest.registrant = 'principal:someone-else-entirely';
  const tamperedImport = await invoke(
    portabilityRef,
    { operation: 'import-bundle', serializedBundle: JSON.stringify(tamperedTransport) },
    { implementation: portabilityCapsule },
  );
  assert(tamperedImport.status === 'succeeded', 'the tampered bundle could not be imported');
  const tamperedResult = await invoke(verifiabilityRef, {
    operation: 'verify-signed-manifest',
    signedManifest: tamperedImport.output.bundle.manifests[0].signedManifest,
  });
  assert(tamperedResult.status === 'succeeded', 'a tampered artifact was reported as an execution failure');
  assert(!tamperedResult.output.verification.valid, 'a tampered signed manifest verified');
  assert(
    tamperedResult.output.verification.reasons.includes('MANIFEST_DIGEST_MISMATCH'),
    'the tampered manifest carried no digest reason',
  );
  assert(
    tamperedResult.output.verification.reasons.includes('SIGNATURE_INVALID'),
    'the tampered manifest carried no signature reason',
  );
  assert(tamperedResult.evidence.outcome === 'succeeded', 'a fail-closed verification was recorded as failed');

  // 12 — malformed invocation IS an execution failure.
  const malformed = await invoke(verifiabilityRef, { operation: 'sign-claim' });
  assert(
    malformed.status === 'failed' && malformed.reasonCodes[0] === 'VERIFIABILITY_UNSUPPORTED_OPERATION',
    'an unsupported (signing) operation was not rejected',
  );

  // 13 — evidence hygiene.
  for (const result of [manifestResult, claimResult, proofResult, boundResult, tamperedResult, malformed]) {
    assert(
      sovereigntyCapabilities.isValidSovereigntyCapabilityInvocationEvidence(result.evidence),
      'invalid Verifiability evidence',
    );
    const serialized = JSON.stringify(result.evidence);
    for (const leak of [
      testKeyPair.privateKeyPem,
      testKeyPair.signingKey.publicKey,
      testKeyPair.signingKey.keyId,
      signedManifest.proof.signature,
      signedManifest.manifestDigest,
      contentIdentity.digest,
      'BEGIN PRIVATE KEY',
      'issuerBinding',
      'contentDigest',
    ]) {
      assert(!serialized.includes(leak), `generic Verifiability evidence leaked "${leak.slice(0, 24)}"`);
    }
  }

  return subjectX.sovereignAssetId;
};

/**
 * SM-09: the real production AOC.LICENSING_TERMS capsule, from the installed
 * tarball, composed with the other six into a seven-mineral flow.
 *
 * Nothing here is a fake, a stub or a re-implementation: every capability is the
 * factory the published package exports, and the only signing uses the existing
 * public low-level primitives with TEST-ONLY key material.
 */
const productionLicensingTermsAcceptance = async () => {
  const correlationId = 'sm09-seven-mineral-js-001';
  const refOf = (key) => sovereigntyCapabilities.getSovereigntyCapabilityRefByKey(key);
  const integrityRef = refOf('integrity');
  const identityRef = refOf('identity');
  const provenanceRef = refOf('provenance');
  const licensingRef = refOf('licensing_terms');
  const portabilityRef = refOf('portability');
  const interoperabilityRef = refOf('interoperability');
  const verifiabilityRef = refOf('verifiability');

  const integrity = sovereigntyCapabilities.createIntegritySovereigntyCapabilityImplementation();
  const identityCapsule = sovereigntyCapabilities.createIdentitySovereigntyCapabilityImplementation();
  const provenance = sovereigntyCapabilities.createProvenanceSovereigntyCapabilityImplementation();
  const portabilityCapsule = sovereigntyCapabilities.createPortabilitySovereigntyCapabilityImplementation();
  const interoperabilityCapsule = sovereigntyCapabilities.createInteroperabilitySovereigntyCapabilityImplementation();
  const verifiability = sovereigntyCapabilities.createVerifiabilitySovereigntyCapabilityImplementation();

  const licensingCapsule = sovereigntyCapabilities.createLicensingTermsSovereigntyCapabilityImplementation();
  assert(
    licensingCapsule.capability.id === 'aoc:sovereignty-capability:licensing-terms',
    'production Licensing & Terms capsule does not advertise the canonical id',
  );
  assert(
    licensingCapsule.capability.version === licensingRef.version,
    'production Licensing & Terms capsule drifted from the canonical capability version',
  );

  const run = async (capability, implementation, input, subject) =>
    sovereigntyCapabilities.invokeSovereigntyCapability(
      sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
        capability,
        correlationId,
        input,
        ...(subject === undefined ? {} : { subject }),
      }),
      implementation,
    );

  // 1 — REAL AOC.INTEGRITY.
  const integrityResult = await run(integrityRef, integrity, {
    operation: 'compute-content-identity',
    bytes: new TextEncoder().encode('sm09-js-consumer-fixture-bytes'),
  });
  assert(integrityResult.status === 'succeeded', 'real Integrity invocation failed');

  // 2 — REAL AOC.IDENTITY.
  const identityResult = await run(identityRef, identityCapsule, {
    registrant: 'principal:sm09-js-registrant',
    contentIdentity: integrityResult.output.contentIdentity,
    externalReference: identity.buildSovereignExternalReference({
      namespace: 'example:external-token-system',
      id: 'token-4471',
      locator: 'ledger://chain-x/token/4471',
    }),
  });
  assert(identityResult.status === 'succeeded', 'real Identity invocation failed');
  const subjectX = identityResult.output.subject;
  const manifestM = identityResult.output.manifest;

  // 3 — REAL AOC.PROVENANCE.
  const provenanceResult = await run(
    provenanceRef,
    provenance,
    {
      operation: 'record-derivation',
      claimId: 'claim:sm09-js-derivation',
      issuer: 'principal:sm09-js-issuer',
      issuedAt: '2026-08-18T09:00:00.000Z',
      sourceSovereignAssetIds: [identity.parseSovereignAssetId(identity.mintSovereignAssetId())],
      relation: manifestApi.DerivationRelationKind.TransformedFrom,
      statement: 'asserted, never established',
    },
    subjectX,
  );
  assert(provenanceResult.status === 'succeeded', 'real Provenance invocation failed');
  const derivationClaim = provenanceResult.output.claim;

  // 4 — REAL AOC.LICENSING_TERMS. Fixture data only: one issuer's declaration in
  // one test, claiming no legal universality.
  const ns = licensing.AOC_LICENSING_SEMANTIC_NAMESPACE;
  const actions = licensing.AOC_LICENSING_ACTION_TERM_IDS;
  const effects = licensing.SovereignLicenseTermsRuleEffect;
  const licenseRules = [
    { id: 'R1', effect: effects.Permission, action: { namespace: ns, termRef: actions.use }, statement: 'Use is permitted.' },
    { id: 'R2', effect: effects.Permission, action: { namespace: ns, termRef: actions.reproduce }, statement: 'Reproduction is permitted.' },
    { id: 'R3', effect: effects.Restriction, action: { namespace: ns, termRef: actions.commercialUse }, statement: 'Commercial use is restricted.' },
    { id: 'R4', effect: effects.Obligation, action: { namespace: ns, termRef: actions.attribute }, statement: 'Attribution must be retained.' },
    { id: 'R5', effect: effects.Permission, action: { namespace: 'example.domain', termRef: 'example.domain:special-use' }, statement: 'Special use permitted per Agreement A-17.' },
  ];

  const declareResult = await run(
    licensingRef,
    licensingCapsule,
    {
      operation: 'declare-license-terms',
      claimId: 'claim:sm09-js-license',
      issuer: 'principal:sm09-js-issuer',
      statement: 'Terms declared by the issuer over this subject.',
      audience: { kind: 'Public' },
      rules: licenseRules,
      issuedAt: '2026-08-18T09:00:00.000Z',
      effectiveAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2027-09-01T00:00:00.000Z',
      evidenceRefs: ['evidence:contract:A-17'],
    },
    subjectX,
  );
  assert(declareResult.status === 'succeeded', 'real Licensing & Terms declaration failed');
  const licenseClaim = declareResult.output.claim;
  assert(licenseClaim.subject === subjectX.sovereignAssetId, 'terms were declared over the wrong subject');
  assert(licenseClaim.type === ClaimType.Authorship, 'the licensing claim left the AuthorityClaim family');
  assert(licenseClaim.metadata.kind === 'License', 'the licensing claim lost its License kind');
  assert(
    licenseClaim.metadata.terms.schemaVersion === licensing.SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
    'the terms schema version drifted',
  );
  assert(
    licenseClaim.metadata.terms.rules.map((rule) => rule.id).join(',') === 'R1,R2,R3,R4,R5',
    'caller-authored rule order was not preserved',
  );
  assert(licenseClaim.metadata.terms.effectiveAt === '2026-09-01T00:00:00.000Z', 'effectiveAt was lost');
  assert(licenseClaim.expiresAt === '2027-09-01T00:00:00.000Z', 'expiresAt was lost');
  assert(licensing.isValidLicenseTermsClaim(licenseClaim), 'the declared claim failed its own validator');
  assert(
    licenseClaim.issuer !== manifestM.registrant,
    'the licensing issuer collapsed into the manifest registrant',
  );
  const declaredJson = canonical.canonicalizeJSON(declareResult.output);
  for (const forbidden of ['"signature"', '"proof"', '"grant"', '"token"', '"credential"', '"standing"']) {
    assert(!declaredJson.includes(forbidden), `a declaration produced ${forbidden}`);
  }

  // 5 — REAL validation, positive and negative.
  const validResult = await run(
    licensingRef,
    licensingCapsule,
    { operation: 'validate-license-terms', claim: licenseClaim },
    subjectX,
  );
  assert(validResult.status === 'succeeded', 'real Licensing & Terms validation failed');
  assert(validResult.output.validation.valid, 'a valid licensing claim was reported invalid');

  const invalidResult = await run(licensingRef, licensingCapsule, {
    operation: 'validate-license-terms',
    claim: {},
  });
  assert(invalidResult.status === 'succeeded', 'an invalid validation target was an execution failure');
  assert(!invalidResult.output.validation.valid, 'an empty object validated as licensing terms');
  assert(invalidResult.evidence.outcome === 'succeeded', 'a negative validation was recorded as failed');

  const malformedDeclare = await run(
    licensingRef,
    licensingCapsule,
    {
      operation: 'declare-license-terms',
      claimId: 'claim:sm09-js-bad',
      issuer: 'principal:sm09-js-issuer',
      statement: 'no clauses',
      audience: { kind: 'Public' },
      rules: [],
    },
    subjectX,
  );
  assert(malformedDeclare.status === 'failed', 'a declaration with no rules was not rejected');
  assert(
    malformedDeclare.reasonCodes[0] === 'LICENSING_TERMS_RULES_REQUIRED',
    'the empty-rules declaration reported the wrong reason',
  );

  // 6 — TEST-ONLY issuer signs, via the existing public primitives.
  const licenseKeyPair = manifestApi.generateSovereignKeyPair();
  const signedLicenseClaim = manifestApi.signClaim(
    licenseClaim,
    licenseKeyPair.privateKeyPem,
    licenseKeyPair.signingKey,
    new Date('2026-08-18T09:00:00.000Z'),
  );

  // 7 — REAL AOC.PORTABILITY round trip.
  const exportResult = await run(
    portabilityRef,
    portabilityCapsule,
    {
      operation: 'export-bundle',
      manifests: [{ kind: 'manifest', manifest: manifestM }],
      claims: [
        { kind: 'claim', claim: derivationClaim },
        { kind: 'signed-claim', signedClaim: signedLicenseClaim },
      ],
    },
    subjectX,
  );
  assert(exportResult.status === 'succeeded', 'real Portability export failed');

  const importResult = await run(portabilityRef, portabilityCapsule, {
    operation: 'import-bundle',
    serializedBundle: exportResult.output.serializedBundle,
  });
  assert(importResult.status === 'succeeded', 'real Portability import failed');
  const importedBundle = importResult.output.bundle;
  assert(Object.keys(importedBundle).length === 6, 'the portability envelope gained a field');

  const importedArtifact = importedBundle.claims.find((artifact) => artifact.kind === 'signed-claim');
  assert(importedArtifact !== undefined, 'the signed licensing claim did not survive transport');
  const importedLicenseClaim = portability.portableClaimOf(importedArtifact);
  assert(
    canonical.canonicalizeJSON(importedLicenseClaim) === canonical.canonicalizeJSON(licenseClaim),
    'the licensing claim did not round-trip exactly',
  );
  assert(licensing.isValidLicenseTermsClaim(importedLicenseClaim), 'the imported claim failed its own validator');

  // 8 — REAL AOC.INTEROPERABILITY discovers the licensing semantics.
  const describeResult = await run(interoperabilityRef, interoperabilityCapsule, {
    operation: 'describe-bundle',
    bundle: importedBundle,
  });
  assert(describeResult.status === 'succeeded', 'real Interoperability describe failed');
  const descriptor = describeResult.output.descriptor;
  const requirementKeys = new Set(
    descriptor.present.semanticRequirements.map((requirement) => `${requirement.namespace}|${requirement.termRef}`),
  );
  for (const required of [
    `${ns}|${licensing.AOC_LICENSING_DECLARATION_TERM_IDS.licenseTermsDeclaration}`,
    `${ns}|${licensing.AOC_LICENSING_DECLARATION_TERM_IDS.permissionRule}`,
    `${ns}|${licensing.AOC_LICENSING_DECLARATION_TERM_IDS.restrictionRule}`,
    `${ns}|${licensing.AOC_LICENSING_DECLARATION_TERM_IDS.obligationRule}`,
    `${ns}|${actions.commercialUse}`,
    'example.domain|example.domain:special-use',
  ]) {
    assert(requirementKeys.has(required), `the descriptor did not surface ${required}`);
  }
  assert(
    descriptor.schemaVersion === 'aoc-sovereignty-interoperability-descriptor/1',
    'the Interoperability descriptor schema changed',
  );

  const supportFor = (semanticTerms) =>
    interoperability.buildSovereigntyInteroperabilityConsumerSupportV1({
      profile: { id: descriptor.profile.id, acceptedVersions: [descriptor.profile.version] },
      mediaTypes: [descriptor.mediaType],
      representationSchemaVersions: [descriptor.representation.schemaVersion],
      canonicalizationProfiles: [descriptor.representation.canonicalizationProfile],
      artifactKinds: [...interoperability.SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS],
      claimTypes: [...interoperability.INTEROPERABLE_CLAIM_TYPES],
      standingStatuses: [...interoperability.INTEROPERABLE_STANDING_STATUSES],
      semanticTerms,
    });

  const compatible = await run(interoperabilityRef, interoperabilityCapsule, {
    operation: 'assess-compatibility',
    descriptor,
    consumerSupport: supportFor([...descriptor.present.semanticRequirements]),
  });
  assert(compatible.status === 'succeeded', 'real compatibility assessment failed');
  assert(compatible.output.report.status === 'compatible', 'a fully supporting consumer was not compatible');

  const partial = await run(interoperabilityRef, interoperabilityCapsule, {
    operation: 'assess-compatibility',
    descriptor,
    consumerSupport: supportFor(
      descriptor.present.semanticRequirements.filter(
        (requirement) => requirement.termRef !== 'example.domain:special-use',
      ),
    ),
  });
  assert(partial.status === 'succeeded', 'the partial compatibility assessment failed');
  assert(
    partial.output.report.status === 'partially-compatible',
    'a consumer missing one licensing concept was not partially compatible',
  );
  assert(importedBundle.claims.length === 2, 'partial compatibility dropped an artifact');

  // 9 — REAL AOC.VERIFIABILITY over the transported signed terms.
  const verified = await run(verifiabilityRef, verifiability, {
    operation: 'verify-signed-claim',
    signedClaim: importedArtifact.signedClaim,
  });
  assert(verified.status === 'succeeded', 'real Verifiability could not check the signed terms');
  assert(verified.output.verification.valid, 'a genuinely signed licensing claim did not verify');

  // 10 — tampered terms are detected and never repaired.
  const tamperedClaim = {
    ...licenseClaim,
    metadata: {
      ...licenseClaim.metadata,
      terms: {
        ...licenseClaim.metadata.terms,
        rules: licenseClaim.metadata.terms.rules.map((rule, index) =>
          index === 2 ? { ...rule, effect: effects.Permission } : rule),
      },
    },
  };
  const tamperedVerification = await run(verifiabilityRef, verifiability, {
    operation: 'verify-signed-claim',
    signedClaim: { ...signedLicenseClaim, claim: tamperedClaim },
  });
  assert(tamperedVerification.status === 'succeeded', 'a tampered artifact was an execution failure');
  assert(!tamperedVerification.output.verification.valid, 'tampered terms verified');

  // 11 — crypto valid, terms invalid: both true at once.
  const malformedTerms = {
    ...licenseClaim,
    metadata: {
      ...licenseClaim.metadata,
      terms: {
        schemaVersion: licensing.SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
        audience: { kind: 'Public' },
        rules: [],
      },
    },
  };
  const signedMalformed = manifestApi.signClaim(
    malformedTerms,
    licenseKeyPair.privateKeyPem,
    licenseKeyPair.signingKey,
    new Date('2026-08-18T09:00:00.000Z'),
  );
  const malformedVerification = await run(verifiabilityRef, verifiability, {
    operation: 'verify-signed-claim',
    signedClaim: signedMalformed,
  });
  assert(malformedVerification.status === 'succeeded', 'the malformed-but-signed case failed to run');
  assert(
    malformedVerification.output.verification.valid,
    'a genuinely signed malformed document did not verify cryptographically',
  );
  const malformedValidation = await run(
    licensingRef,
    licensingCapsule,
    { operation: 'validate-license-terms', claim: malformedTerms },
    subjectX,
  );
  assert(malformedValidation.status === 'succeeded', 'the malformed terms could not be validated');
  assert(!malformedValidation.output.validation.valid, 'empty terms validated');
  assert(
    malformedValidation.output.validation.reasons.includes('LICENSING_TERMS_RULES_REQUIRED'),
    'the malformed terms carried no rules reason',
  );

  // 12 — contestation: cryptographically valid AND Contested.
  const contested = await run(
    licensingRef,
    licensingCapsule,
    {
      operation: 'contest-license-terms-claim',
      standingId: 'standing:sm09-js-001',
      claim: licenseClaim,
      reason: 'A competing party disputes the declared terms.',
      effectiveAt: '2026-08-19T09:00:00.000Z',
    },
    subjectX,
  );
  assert(contested.status === 'succeeded', 'real Licensing & Terms contestation failed');
  assert(contested.output.standing.status === 'Contested', 'contestation did not record a Contested standing');
  assert(
    canonical.canonicalizeJSON(contested.output.claim) === canonical.canonicalizeJSON(licenseClaim),
    'contestation modified the claim',
  );
  const reverified = await run(verifiabilityRef, verifiability, {
    operation: 'verify-signed-claim',
    signedClaim: signedLicenseClaim,
  });
  assert(reverified.status === 'succeeded', 're-verification after contestation failed');
  assert(reverified.output.verification.valid, 'contesting a claim invalidated its signature');

  // 13 — evidence hygiene.
  for (const result of [declareResult, validResult, invalidResult, contested]) {
    assert(
      sovereigntyCapabilities.isValidSovereigntyCapabilityInvocationEvidence(result.evidence),
      'invalid Licensing & Terms evidence',
    );
    assert(
      result.evidence.capability.id === 'aoc:sovereignty-capability:licensing-terms',
      'evidence does not attribute the canonical Licensing & Terms capability',
    );
    const serialized = JSON.stringify(result.evidence);
    for (const leak of [
      'Commercial use is restricted.', 'Attribution must be retained.', 'Agreement A-17',
      'aoc.licensing', 'commercial-use', '"terms"', '"rules"', '"audience"', '"claim"', '"statement"',
      licenseKeyPair.privateKeyPem, signedLicenseClaim.digest,
    ]) {
      assert(!serialized.includes(leak), `Licensing & Terms evidence leaked "${leak.slice(0, 24)}"`);
    }
  }

  // 14 — seven distinct capabilities under one correlation id.
  const sevenMineralResults = [
    integrityResult, identityResult, provenanceResult, declareResult,
    exportResult, describeResult, verified,
  ];
  const attributed = new Set(sevenMineralResults.map((result) => result.evidence.capability.id));
  assert(attributed.size === 7, 'the seven-mineral flow did not attribute seven canonical capabilities');
  for (const result of sevenMineralResults) {
    assert(result.evidence.correlationId === correlationId, 'the shared correlation id did not survive');
  }
  const invocationIds = new Set(sevenMineralResults.map((result) => result.invocationId));
  assert(invocationIds.size === 7, 'two seven-mineral invocations shared one invocation id');

  return licenseClaim.id;
};

/**
 * SM-10 — AOC.GOVERNANCE_COMPATIBILITY, the eighth and last canonical mineral,
 * exercised from plain CommonJS JavaScript against the installed tarball.
 *
 * Runs the whole eight-mineral flow under one correlation id, then reads the
 * resulting handoff the way an external governance integration would: it knows
 * the public contract and nothing about AOC's internals. It reads; it does not
 * decide.
 */
const productionGovernanceCompatibilityAcceptance = async () => {
  const correlationId = 'sm10-eight-mineral-js-001';
  const refOf = (key) => sovereigntyCapabilities.getSovereigntyCapabilityRefByKey(key);
  const governanceRef = refOf('governance_compatibility');

  const integrity = sovereigntyCapabilities.createIntegritySovereigntyCapabilityImplementation();
  const identityCapsule = sovereigntyCapabilities.createIdentitySovereigntyCapabilityImplementation();
  const provenance = sovereigntyCapabilities.createProvenanceSovereigntyCapabilityImplementation();
  const licensingCapsule = sovereigntyCapabilities.createLicensingTermsSovereigntyCapabilityImplementation();
  const portabilityCapsule = sovereigntyCapabilities.createPortabilitySovereigntyCapabilityImplementation();
  const interoperabilityCapsule = sovereigntyCapabilities.createInteroperabilitySovereigntyCapabilityImplementation();
  const verifiability = sovereigntyCapabilities.createVerifiabilitySovereigntyCapabilityImplementation();

  const governance = sovereigntyCapabilities.createGovernanceCompatibilitySovereigntyCapabilityImplementation();
  assert(
    governance.capability.id === 'aoc:sovereignty-capability:governance-compatibility',
    'production Governance Compatibility capsule does not advertise the canonical id',
  );
  assert(
    governance.capability.version === governanceRef.version && governance.capability.version === '1.0.0',
    'production Governance Compatibility capsule drifted from the canonical capability version',
  );
  assert(
    sovereigntyCapabilities.GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS.join(',')
      === 'prepare-governance-handoff,validate-governance-handoff',
    'the Governance Compatibility operation set changed',
  );

  const run = async (capability, implementation, input, subject) =>
    sovereigntyCapabilities.invokeSovereigntyCapability(
      sovereigntyCapabilities.buildSovereigntyCapabilityInvocation({
        capability,
        correlationId,
        input,
        ...(subject === undefined ? {} : { subject }),
      }),
      implementation,
    );

  // 1 — REAL AOC.INTEGRITY.
  const integrityResult = await run(refOf('integrity'), integrity, {
    operation: 'compute-content-identity',
    bytes: new TextEncoder().encode('sm10-js-consumer-fixture-bytes'),
  });
  assert(integrityResult.status === 'succeeded', 'real Integrity invocation failed');

  // 2 — REAL AOC.IDENTITY.
  const identityResult = await run(refOf('identity'), identityCapsule, {
    registrant: 'principal:sm10-js-registrant',
    contentIdentity: integrityResult.output.contentIdentity,
    externalReference: identity.buildSovereignExternalReference({
      namespace: 'alien-system-v47',
      id: 'alien-resource-92817',
      locator: 'future://provider-p1/object/92817',
    }),
  });
  assert(identityResult.status === 'succeeded', 'real Identity invocation failed');
  const subjectX = identityResult.output.subject;
  const manifestM = identityResult.output.manifest;

  // 3 — REAL AOC.PROVENANCE.
  const provenanceResult = await run(
    refOf('provenance'),
    provenance,
    {
      operation: 'record-derivation',
      claimId: 'claim:sm10-js-derivation',
      issuer: 'principal:sm10-js-issuer',
      issuedAt: '2026-08-18T09:00:00.000Z',
      sourceSovereignAssetIds: [identity.parseSovereignAssetId(identity.mintSovereignAssetId())],
      relation: manifestApi.DerivationRelationKind.TransformedFrom,
      statement: 'asserted, never established',
    },
    subjectX,
  );
  assert(provenanceResult.status === 'succeeded', 'real Provenance invocation failed');
  const derivationClaim = provenanceResult.output.claim;

  // 4 — REAL AOC.LICENSING_TERMS. Deliberately contradictory, and carrying one
  // action from a semantic system the Protocol has never heard of.
  const licenseResult = await run(
    refOf('licensing_terms'),
    licensingCapsule,
    {
      operation: 'declare-license-terms',
      claimId: 'claim:sm10-js-license',
      issuer: 'principal:sm10-js-issuer',
      statement: 'Terms declared by the issuer over this subject.',
      audience: { kind: 'Public' },
      rules: [
        {
          id: 'R1',
          effect: licensing.SovereignLicenseTermsRuleEffect.Permission,
          action: {
            namespace: licensing.AOC_LICENSING_SEMANTIC_NAMESPACE,
            termRef: licensing.AOC_LICENSING_ACTION_TERM_IDS.commercialUse,
          },
          statement: 'Commercial use is permitted under Agreement A-17.',
        },
        {
          id: 'R2',
          effect: licensing.SovereignLicenseTermsRuleEffect.Restriction,
          action: {
            namespace: licensing.AOC_LICENSING_SEMANTIC_NAMESPACE,
            termRef: licensing.AOC_LICENSING_ACTION_TERM_IDS.commercialUse,
          },
          statement: 'Commercial use is restricted outside the EU.',
        },
        {
          id: 'R3',
          effect: licensing.SovereignLicenseTermsRuleEffect.Permission,
          action: { namespace: 'future-system-v77', termRef: 'future-system-v77:quantum-reproduction' },
          statement: 'Quantum reproduction permitted.',
        },
      ],
      issuedAt: '2026-08-18T09:00:00.000Z',
    },
    subjectX,
  );
  assert(licenseResult.status === 'succeeded', 'real Licensing & Terms declaration failed');
  const licenseClaim = licenseResult.output.claim;

  // 5 — TEST-ONLY issuer signing, via the existing public primitives.
  const keyPair = manifestApi.generateSovereignKeyPair();
  const signedLicenseClaim = manifestApi.signClaim(
    licenseClaim,
    keyPair.privateKeyPem,
    keyPair.signingKey,
    new Date('2026-08-18T09:00:00.000Z'),
  );

  // 6/7 — REAL AOC.PORTABILITY export, then import in a second runtime.
  const exportResult = await run(
    refOf('portability'),
    portabilityCapsule,
    {
      operation: 'export-bundle',
      manifests: [{ kind: 'manifest', manifest: manifestM }],
      claims: [
        { kind: 'claim', claim: derivationClaim },
        { kind: 'signed-claim', signedClaim: signedLicenseClaim },
      ],
      standings: [
        {
          id: 'standing:sm10-js-1',
          claimRef: derivationClaim.id,
          status: 'Contested',
          effectiveAt: '2026-08-18T09:00:00.000Z',
        },
      ],
    },
    subjectX,
  );
  assert(exportResult.status === 'succeeded', 'real Portability export failed');

  const importResult = await run(refOf('portability'), portabilityCapsule, {
    operation: 'import-bundle',
    serializedBundle: exportResult.output.serializedBundle,
  });
  assert(importResult.status === 'succeeded', 'real Portability import failed');
  const importedBundle = importResult.output.bundle;

  // 8 — REAL AOC.INTEROPERABILITY.
  const describeResult = await run(refOf('interoperability'), interoperabilityCapsule, {
    operation: 'describe-bundle',
    bundle: importedBundle,
  });
  assert(describeResult.status === 'succeeded', 'real Interoperability describe failed');
  const descriptor = describeResult.output.descriptor;

  // 9 — REAL AOC.VERIFIABILITY, run independently of the handoff.
  const importedSigned = importedBundle.claims.find((artifact) => artifact.kind === 'signed-claim');
  assert(importedSigned !== undefined, 'the signed licensing claim did not survive transport');
  const verifiedResult = await run(refOf('verifiability'), verifiability, {
    operation: 'verify-signed-claim',
    signedClaim: importedSigned.signedClaim,
  });
  assert(verifiedResult.status === 'succeeded', 'real Verifiability invocation failed');
  assert(verifiedResult.output.verification.valid, 'a genuine signature did not verify');

  // 10 — REAL AOC.GOVERNANCE_COMPATIBILITY.
  const prepared = await run(governanceRef, governance, {
    operation: 'prepare-governance-handoff',
    representation: importedBundle,
    tenantId: 'tenant-alpha',
  });
  assert(prepared.status === 'succeeded', 'real Governance Compatibility prepare failed');
  const handoff = prepared.output.handoff;

  assert(Object.keys(handoff).length === 6, 'the governance handoff envelope gained a field');
  assert(
    handoff.schemaVersion === governanceCompatibility.SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION
      && handoff.schemaVersion === 'aoc-sovereign-governance-handoff/1',
    'the governance handoff schema drifted',
  );
  assert(
    handoff.canonicalizationProfile === canonical.CANONICAL_JSON_PROFILE,
    'the handoff left the canonical profile',
  );
  assert(
    handoff.resource.kind === governanceCompatibility.SOVEREIGN_GOVERNED_RESOURCE_KIND
      && handoff.resource.kind === 'aoc:sovereign-asset',
    'the generic sovereign resource kind changed',
  );
  assert(handoff.resource.id === subjectX.sovereignAssetId, 'the governance resource is not the sovereign subject');
  assert(handoff.resource.tenantId === 'tenant-alpha', 'the explicit tenant was not preserved');
  assert(
    !Object.prototype.hasOwnProperty.call(handoff.resource, 'attributes'),
    'the governance resource carries attributes in v1',
  );
  assert(
    canonical.canonicalizeJSON(handoff.subject) === canonical.canonicalizeJSON(subjectX),
    'the handoff subject drifted',
  );
  assert(
    canonical.canonicalizeJSON(handoff.representation) === canonical.canonicalizeJSON(importedBundle),
    'the handoff representation is not the bundle that arrived',
  );
  assert(
    canonical.canonicalizeJSON(handoff.semantics) === canonical.canonicalizeJSON(descriptor),
    'the handoff semantics are not the descriptor Interoperability produced',
  );
  assert(
    handoff.semantics.present.standingStatuses.includes('Contested'),
    'the contested standing did not reach governance',
  );

  // A tenant-free handoff omits the key entirely, and is deterministic.
  const untenanted = await run(governanceRef, governance, {
    operation: 'prepare-governance-handoff',
    representation: importedBundle,
  });
  assert(untenanted.status === 'succeeded', 'a tenant-free governance prepare failed');
  assert(
    !Object.prototype.hasOwnProperty.call(untenanted.output.handoff.resource, 'tenantId'),
    'a tenant was invented for a handoff that was given none',
  );
  assert(
    canonical.canonicalizeJSON(untenanted.output.handoff)
      === canonical.canonicalizeJSON(
        governanceCompatibility.buildSovereignGovernanceHandoffV1({ representation: importedBundle }),
      ),
    'the governance handoff is not deterministic',
  );
  assert(
    canonical.canonicalizeJSON(
      governanceCompatibility.buildSovereignGovernanceResourceRef(subjectX, { tenantId: 'tenant-alpha' }),
    ) === canonical.canonicalizeJSON(handoff.resource),
    'the standalone resource projection disagrees with the capsule',
  );

  // 11 — REAL validation, across a wire round trip and under tampering.
  const wireHandoff = JSON.parse(JSON.stringify(handoff));
  const validated = await run(governanceRef, governance, {
    operation: 'validate-governance-handoff',
    handoff: wireHandoff,
  });
  assert(validated.status === 'succeeded', 'real Governance Compatibility validation failed');
  assert(validated.output.validation.valid, 'a handoff that crossed a wire failed validation');
  assert(
    governanceCompatibility.isValidSovereignGovernanceHandoffV1(wireHandoff),
    'the standalone handoff validator disagrees with the capsule',
  );
  const standalone = governanceCompatibility.validateSovereignGovernanceHandoffV1(wireHandoff);
  assert(
    standalone.valid && standalone.reasons.length === 0,
    'the standalone handoff validator reported reasons for a valid handoff',
  );

  const resourceTamper = JSON.parse(JSON.stringify(handoff));
  resourceTamper.resource.id = identity.parseSovereignAssetId(identity.mintSovereignAssetId());
  const resourceTampered = await run(governanceRef, governance, {
    operation: 'validate-governance-handoff',
    handoff: resourceTamper,
  });
  assert(resourceTampered.status === 'succeeded', 'a tampered handoff was reported as an execution failure');
  assert(!resourceTampered.output.validation.valid, 'a re-pointed governance resource validated');
  assert(
    resourceTampered.output.validation.reasons.includes('GOVERNANCE_COMPATIBILITY_RESOURCE_ID_MISMATCH'),
    'a re-pointed governance resource produced the wrong reason code',
  );

  const semanticsTamper = JSON.parse(JSON.stringify(handoff));
  semanticsTamper.semantics.present.semanticRequirements =
    semanticsTamper.semantics.present.semanticRequirements.slice(1);
  const semanticsTampered = await run(governanceRef, governance, {
    operation: 'validate-governance-handoff',
    handoff: semanticsTamper,
  });
  assert(semanticsTampered.status === 'succeeded', 'a tampered descriptor was reported as an execution failure');
  assert(!semanticsTampered.output.validation.valid, 'a descriptor missing a requirement validated');
  assert(
    semanticsTampered.output.validation.reasons.includes('GOVERNANCE_COMPATIBILITY_SEMANTICS_MISMATCH'),
    'a mismatching descriptor produced the wrong reason code',
  );

  const emptyTarget = await run(governanceRef, governance, {
    operation: 'validate-governance-handoff',
    handoff: {},
  });
  assert(emptyTarget.status === 'succeeded', 'an empty validation target was reported as an execution failure');
  assert(!emptyTarget.output.validation.valid, 'an empty object validated as a governance handoff');
  assert(
    emptyTarget.evidence.outcome === 'succeeded',
    'a negative governance validation was recorded as a failed invocation',
  );

  // 12 — an external governance consumer reads it, and decides nothing.
  const externalRead = {
    resourceKind: handoff.resource.kind,
    resourceId: handoff.resource.id,
    semanticRequirements: handoff.semantics.present.semanticRequirements,
    claimCount: handoff.representation.claims.length,
  };
  assert(externalRead.resourceId === subjectX.sovereignAssetId, 'the external consumer read the wrong resource');
  assert(externalRead.claimCount === 2, 'the external consumer did not see both claims');
  assert(
    externalRead.semanticRequirements.some(
      (requirement) => requirement.termRef === 'future-system-v77:quantum-reproduction',
    ),
    'an external semantic concept did not reach the governance consumer',
  );

  // 13 — no policy, decision, grant, authority or enforcement in what SM-10
  // owns. The nested representation still legitimately carries a
  // `proof.signature`; that is SM-06's transport doing its job.
  const ownedSurface = canonical
    .canonicalizeJSON({
      schemaVersion: handoff.schemaVersion,
      canonicalizationProfile: handoff.canonicalizationProfile,
      subject: handoff.subject,
      resource: handoff.resource,
      envelopeKeys: Object.keys(handoff).sort(),
      preparedKeys: Object.keys(prepared.output).sort(),
      validation: validated.output.validation,
    })
    .toLowerCase();
  for (const forbidden of [
    'allow', 'deny', 'grant', 'authority', 'decision', 'approval', 'enforce',
    'policy', 'owner', 'scope', 'ready', 'complete', 'handoffid', 'generatedat',
    'handoffdigest', 'signature', 'attributes',
  ]) {
    assert(!ownedSurface.includes(forbidden), `the governance handoff surface contains ${forbidden}`);
  }
  assert(
    canonical.canonicalizeJSON(handoff.representation.claims)
      === canonical.canonicalizeJSON(importedBundle.claims),
    'the handoff altered the artifacts it carried',
  );

  // 14 — evidence hygiene.
  for (const result of [prepared, untenanted, validated, resourceTampered, semanticsTampered, emptyTarget]) {
    assert(
      sovereigntyCapabilities.isValidSovereigntyCapabilityInvocationEvidence(result.evidence),
      'invalid Governance Compatibility evidence',
    );
    assert(
      result.evidence.capability.id === 'aoc:sovereignty-capability:governance-compatibility',
      'evidence does not attribute the canonical Governance Compatibility capability',
    );
    const serializedEvidence = JSON.stringify(result.evidence);
    for (const leak of [
      'tenant-alpha', 'aoc-sovereign-governance-handoff/1', '"resource"', '"representation"',
      '"semantics"', '"handoff"', '"terms"', '"claims"', '"standings"',
      keyPair.privateKeyPem, signedLicenseClaim.digest,
    ]) {
      assert(!serializedEvidence.includes(leak), `Governance Compatibility evidence leaked "${leak.slice(0, 24)}"`);
    }
  }

  // 15 — eight distinct capabilities under one correlation id.
  const eightMineralResults = [
    integrityResult, identityResult, provenanceResult, licenseResult,
    exportResult, describeResult, verifiedResult, prepared,
  ];
  const attributed = new Set(eightMineralResults.map((result) => result.evidence.capability.id));
  assert(attributed.size === 8, 'the eight-mineral flow did not attribute eight canonical capabilities');
  for (const result of eightMineralResults) {
    assert(result.evidence.correlationId === correlationId, 'the shared eight-mineral correlation id did not survive');
  }
  const invocationIds = new Set(eightMineralResults.map((result) => result.invocationId));
  assert(invocationIds.size === 8, 'two eight-mineral invocations shared one invocation id');

  return handoff.resource.id;
};

manifestApi
  .verifySovereignManifest(nonByteSubject.roundTripped)
  .then((verification) => {
    assert(verification.checks.manifestStructure === 'valid', 'manifestStructure not valid');
    assert(verification.checks.manifestDigest === 'valid', 'manifestDigest not valid');
    assert(verification.checks.signature === 'valid', 'signature not valid');
    assert(
      verification.checks.contentDigest === 'not_performed',
      `contentDigest must be not_performed, got ${verification.checks.contentDigest}`,
    );
    assert(verification.valid, 'non-byte subject manifest failed verification');

    return capabilityInvocationAcceptance();
  })
  .then(async (capabilityInvocationId) => {
    const productionSubjectId = await productionMineralAcceptance();
    const provenanceDerivationId = await productionProvenanceAcceptance();
    const portableSubjectId = await productionPortabilityAcceptance();
    const describedSubjectId = await productionInteroperabilityAcceptance();
    const verifiedSubjectId = await productionVerifiabilityAcceptance();
    const licenseClaimId = await productionLicensingTermsAcceptance();
    const governedResourceId = await productionGovernanceCompatibilityAcceptance();
    console.log(
      `javascript-cjs consumer OK: claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${capabilities.length} nonByteSubject=${nonByteSubject.sovereignAssetId} capabilityInvocation=${capabilityInvocationId} productionMinerals=${productionSubjectId} provenanceDerivation=${provenanceDerivationId} portableSubject=${portableSubjectId} describedSubject=${describedSubjectId} verifiedSubject=${verifiedSubjectId} licenseTerms=${licenseClaimId} governedResource=${governedResourceId}`,
    );
  })
  .catch((error) => {
    process.exitCode = 1;
    throw error;
  });
