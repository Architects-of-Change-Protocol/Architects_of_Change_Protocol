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
    console.log(
      `javascript-cjs consumer OK: claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${capabilities.length} nonByteSubject=${nonByteSubject.sovereignAssetId} capabilityInvocation=${capabilityInvocationId} productionMinerals=${productionSubjectId} provenanceDerivation=${provenanceDerivationId} portableSubject=${portableSubjectId} describedSubject=${describedSubjectId}`,
    );
  })
  .catch((error) => {
    process.exitCode = 1;
    throw error;
  });
