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

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(typeof root === 'object' && root !== null, 'root import must resolve to a module object');
assert(typeof contracts === 'object' && contracts !== null, './contracts import must resolve');
assert(typeof errors === 'object' && errors !== null, './errors import must resolve');
assert(typeof adapters === 'object' && adapters !== null, './adapters import must resolve');
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
    console.log(
      `javascript-cjs consumer OK: claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${capabilities.length} nonByteSubject=${nonByteSubject.sovereignAssetId} capabilityInvocation=${capabilityInvocationId} productionMinerals=${productionSubjectId}`,
    );
  })
  .catch((error) => {
    process.exitCode = 1;
    throw error;
  });
