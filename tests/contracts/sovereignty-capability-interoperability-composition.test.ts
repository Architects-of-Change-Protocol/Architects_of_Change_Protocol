import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import { buildSovereignExternalReference } from '@aoc/protocol/identity';
import type { ContentIdentity, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  parseSovereigntyPortabilityBundle,
  serializeSovereigntyPortabilityBundle,
} from '@aoc/protocol/portability';
import type { SovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import {
  INTEROPERABLE_CLAIM_TYPES,
  INTEROPERABLE_STANDING_STATUSES,
  SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS,
  buildSovereigntyInteroperabilityConsumerSupportV1,
} from '@aoc/protocol/interoperability';
import type {
  SovereigntyInteroperabilityConsumerSupportV1,
  SovereigntyInteroperabilityDescriptorV1,
} from '@aoc/protocol/interoperability';
import {
  buildSovereigntyCapabilityInvocation,
  createIdentitySovereigntyCapabilityImplementation,
  createIntegritySovereigntyCapabilityImplementation,
  createInteroperabilitySovereigntyCapabilityImplementation,
  createPortabilitySovereigntyCapabilityImplementation,
  createProvenanceSovereigntyCapabilityImplementation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isValidSovereigntyCapabilityInvocationEvidence,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  IdentitySovereigntyCapabilityInput,
  IntegritySovereigntyCapabilityInput,
  InteroperabilitySovereigntyCapabilityInput,
  PortabilitySovereigntyCapabilityInput,
  ProvenanceSovereigntyCapabilityInput,
  SovereigntyCapabilityRef,
} from '@aoc/protocol/sovereignty-capabilities';

const integrityRef = getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef;
const identityRef = getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef;
const provenanceRef = getSovereigntyCapabilityRefByKey('provenance') as SovereigntyCapabilityRef;
const portabilityRef = getSovereigntyCapabilityRefByKey('portability') as SovereigntyCapabilityRef;
const interoperabilityRef = getSovereigntyCapabilityRefByKey('interoperability') as SovereigntyCapabilityRef;

const CORRELATION_ID = 'sm07-cross-system-negotiation-001';
const REGISTRANT = 'principal:sm07-composition';

/**
 * SM-07 / five production minerals composing, with no fake implementation
 * anywhere.
 *
 * bytes -> AOC.INTEGRITY -> ContentIdentity
 *       -> AOC.IDENTITY  -> Subject X + Manifest M
 *       -> AOC.PROVENANCE -> Origin + Derivation + Contested standing
 *       -> AOC.PORTABILITY -> canonical bundle -> transport (a string)
 *       -> AOC.PORTABILITY -> imported bundle
 *       -> AOC.INTEROPERABILITY -> profile + descriptor
 *       -> AOC.INTEROPERABILITY -> compatibility report
 *
 * The composition is performed by *this test*, which is the point: no capsule
 * invokes another, so every mineral consumed is visible in the caller's own
 * sequence of invocations and in five separate evidence records.
 */
interface CrossSystemFlow {
  readonly subject: SovereignSubjectRef;
  readonly contentIdentity: ContentIdentity;
  readonly wire: string;
  readonly importedBundle: SovereigntyPortabilityBundleV1;
  readonly descriptor: SovereigntyInteroperabilityDescriptorV1;
  readonly evidence: readonly unknown[];
  readonly invocationIds: readonly string[];
}

const runCrossSystemFlow = async (): Promise<CrossSystemFlow> => {
  const evidence: unknown[] = [];
  const invocationIds: string[] = [];

  // ---- APPLICATION A -------------------------------------------------------
  const integrity = createIntegritySovereigntyCapabilityImplementation();
  const identity = createIdentitySovereigntyCapabilityImplementation();
  const provenance = createProvenanceSovereigntyCapabilityImplementation();
  const portability = createPortabilitySovereigntyCapabilityImplementation();

  const record = <T extends { evidence: unknown; invocationId: string }>(result: T): T => {
    evidence.push(result.evidence);
    invocationIds.push(result.invocationId);
    return result;
  };

  // 1. Real AOC.INTEGRITY over deterministic bytes.
  const bytes = new TextEncoder().encode('sm07-five-mineral-composition-bytes');
  const integrityResult = record(
    await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: integrityRef,
        correlationId: CORRELATION_ID,
        input: { operation: 'compute-content-identity', bytes } as IntegritySovereigntyCapabilityInput,
      }),
      integrity,
    ),
  );
  if (integrityResult.status !== 'succeeded' || integrityResult.output.operation !== 'compute-content-identity') {
    throw new Error('real Integrity invocation failed');
  }
  const contentIdentity = integrityResult.output.contentIdentity;

  // 2. Real AOC.IDENTITY, binding that precomputed commitment.
  const identityResult = record(
    await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: identityRef,
        correlationId: CORRELATION_ID,
        input: {
          registrant: REGISTRANT,
          contentIdentity,
          externalReference: buildSovereignExternalReference({
            namespace: 'alien-system-v47',
            id: 'alien-resource-92817',
            locator: 'future://provider-p1/object/92817',
          }),
        } as IdentitySovereigntyCapabilityInput,
      }),
      identity,
    ),
  );
  if (identityResult.status !== 'succeeded') throw new Error('real Identity invocation failed');
  const subject = identityResult.output.subject;
  const manifest = identityResult.output.manifest;

  // A second real sovereign subject, so the derivation edge names a genuine
  // source rather than the child itself.
  const sourceIdentityResult = record(
    await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: identityRef,
        correlationId: CORRELATION_ID,
        input: { registrant: REGISTRANT } as IdentitySovereigntyCapabilityInput,
      }),
      identity,
    ),
  );
  if (sourceIdentityResult.status !== 'succeeded') throw new Error('real Identity invocation failed');
  const sourceSubject = sourceIdentityResult.output.subject;

  // 3. Real AOC.PROVENANCE: an origin assertion, a derivation assertion, and a
  //    contested standing over the origin.
  const originResult = record(
    await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: provenanceRef,
        subject,
        correlationId: CORRELATION_ID,
        input: {
          operation: 'declare-origin',
          claimId: 'claim:origin:sm07',
          issuer: REGISTRANT,
          assertedOrigin: 'future-system-origin-42',
        } as ProvenanceSovereigntyCapabilityInput,
      }),
      provenance,
    ),
  );
  if (originResult.status !== 'succeeded' || originResult.output.operation !== 'declare-origin') {
    throw new Error('real Provenance declare-origin failed');
  }
  const originClaim = originResult.output.claim;

  const derivationResult = record(
    await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: provenanceRef,
        subject,
        correlationId: CORRELATION_ID,
        input: {
          operation: 'record-derivation',
          claimId: 'claim:derivation:sm07',
          issuer: REGISTRANT,
          sourceSovereignAssetIds: [sourceSubject.sovereignAssetId],
          relation: 'DerivedFrom',
        } as ProvenanceSovereigntyCapabilityInput,
      }),
      provenance,
    ),
  );

  const contestResult = record(
    await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: provenanceRef,
        subject,
        correlationId: CORRELATION_ID,
        input: {
          operation: 'contest-provenance-claim',
          standingId: 'standing:sm07:001',
          claim: originClaim,
          reason: 'An independent party disputes the asserted origin',
        } as ProvenanceSovereigntyCapabilityInput,
      }),
      provenance,
    ),
  );
  if (contestResult.status !== 'succeeded' || contestResult.output.operation !== 'contest-provenance-claim') {
    throw new Error('real Provenance contestation failed');
  }
  const standing = contestResult.output.standing;

  if (derivationResult.status !== 'succeeded' || derivationResult.output.operation !== 'record-derivation') {
    throw new Error('real Provenance record-derivation failed');
  }
  const claims = [
    { kind: 'claim' as const, claim: originClaim },
    { kind: 'claim' as const, claim: derivationResult.output.claim },
  ];

  // 4. Real AOC.PORTABILITY export.
  const exportResult = record(
    await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: portabilityRef,
        subject,
        correlationId: CORRELATION_ID,
        input: {
          operation: 'export-bundle',
          manifests: [{ kind: 'manifest', manifest }],
          claims,
          standings: [standing],
        } as PortabilitySovereigntyCapabilityInput,
      }),
      portability,
    ),
  );
  if (exportResult.status !== 'succeeded' || exportResult.output.operation !== 'export-bundle') {
    throw new Error('real Portability export failed');
  }

  // ---- transport: APPLICATION B receives the STRING and nothing else -------
  const wire = exportResult.output.serializedBundle;

  // A second runtime that has never seen Application A's objects, has no
  // registry, no database and no access to provider-p1.
  const applicationBPortability = createPortabilitySovereigntyCapabilityImplementation();
  const applicationBInteroperability = createInteroperabilitySovereigntyCapabilityImplementation();

  // 5. Real AOC.PORTABILITY import, with no local subject record.
  const importResult = record(
    await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: portabilityRef,
        correlationId: CORRELATION_ID,
        input: { operation: 'import-bundle', serializedBundle: wire } as PortabilitySovereigntyCapabilityInput,
      }),
      applicationBPortability,
    ),
  );
  if (importResult.status !== 'succeeded' || importResult.output.operation !== 'import-bundle') {
    throw new Error('real Portability import failed');
  }
  const importedBundle = importResult.output.bundle;

  // 6. Real AOC.INTEROPERABILITY describe, also with no local subject record.
  const describeResult = record(
    await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: interoperabilityRef,
        correlationId: CORRELATION_ID,
        input: {
          operation: 'describe-bundle',
          bundle: importedBundle,
        } as InteroperabilitySovereigntyCapabilityInput,
      }),
      applicationBInteroperability,
    ),
  );
  if (describeResult.status !== 'succeeded' || describeResult.output.operation !== 'describe-bundle') {
    throw new Error('real Interoperability describe failed');
  }

  return {
    subject,
    contentIdentity,
    wire,
    importedBundle,
    descriptor: describeResult.output.descriptor,
    evidence,
    invocationIds,
  };
};

const supportFor = (
  descriptor: SovereigntyInteroperabilityDescriptorV1,
  overrides: Partial<{
    claimTypes: readonly (typeof INTEROPERABLE_CLAIM_TYPES)[number][];
    representationSchemaVersions: readonly string[];
  }> = {},
): SovereigntyInteroperabilityConsumerSupportV1 =>
  buildSovereigntyInteroperabilityConsumerSupportV1({
    profile: { id: descriptor.profile.id, acceptedVersions: [descriptor.profile.version] },
    mediaTypes: [descriptor.mediaType],
    representationSchemaVersions:
      overrides.representationSchemaVersions ?? [descriptor.representation.schemaVersion],
    canonicalizationProfiles: [descriptor.representation.canonicalizationProfile],
    artifactKinds: [...SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS],
    claimTypes: overrides.claimTypes ?? [...INTEROPERABLE_CLAIM_TYPES],
    standingStatuses: [...INTEROPERABLE_STANDING_STATUSES],
    semanticTerms: [...descriptor.present.semanticRequirements],
  });

const assess = async (
  descriptor: SovereigntyInteroperabilityDescriptorV1,
  consumerSupport: SovereigntyInteroperabilityConsumerSupportV1,
) => {
  const result = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: interoperabilityRef,
      correlationId: CORRELATION_ID,
      input: {
        operation: 'assess-compatibility',
        descriptor,
        consumerSupport,
      } as InteroperabilitySovereigntyCapabilityInput,
    }),
    createInteroperabilitySovereigntyCapabilityImplementation(),
  );
  if (result.status !== 'succeeded' || result.output.operation !== 'assess-compatibility') {
    throw new Error(`expected a successful assessment, got ${result.status}`);
  }
  return result;
};

describe('SM-07 / five production minerals compose across a system boundary', () => {
  it('carries a sovereign representation from bytes to a compatibility report', async () => {
    const flow = await runCrossSystemFlow();

    // Application B reconstructed the SAME sovereign representation, with no
    // reminting anywhere in the chain.
    expect(flow.importedBundle.subject.sovereignAssetId).toBe(flow.subject.sovereignAssetId);
    expect(flow.descriptor.subject).toEqual(flow.subject);

    // And can now say exactly what it is holding.
    expect(flow.descriptor.profile).toEqual({
      id: 'aoc:interoperability-profile:sovereignty-portability',
      version: '1.0.0',
    });
    expect(flow.descriptor.representation).toEqual({
      schemaVersion: 'aoc-sovereignty-portability-bundle/1',
      canonicalizationProfile: 'aoc-canonical-json/1',
    });
    expect([...flow.descriptor.present.manifestArtifactKinds]).toEqual(['manifest']);
    expect([...flow.descriptor.present.claimArtifactKinds]).toEqual(['claim']);
    expect([...flow.descriptor.present.claimTypes]).toEqual(['Derivation', 'Origin']);
    expect([...flow.descriptor.present.standingStatuses]).toEqual(['Contested']);

    // Six invocations, six distinct invocation ids, one shared correlation id.
    expect(new Set(flow.invocationIds).size).toBe(flow.invocationIds.length);
    for (const record of flow.evidence) {
      expect(isValidSovereigntyCapabilityInvocationEvidence(record)).toBe(true);
      expect((record as { correlationId?: string }).correlationId).toBe(CORRELATION_ID);
    }
  });

  it('produces a full compatibility report for an AOC-native consumer', async () => {
    const flow = await runCrossSystemFlow();

    const result = await assess(flow.descriptor, supportFor(flow.descriptor));
    if (result.output.operation !== 'assess-compatibility') throw new Error('unreachable');

    expect(result.status).toBe('succeeded');
    expect(result.output.report).toEqual({
      schemaVersion: 'aoc-sovereignty-interoperability-report/1',
      status: 'compatible',
      core: {
        profile: true,
        mediaType: true,
        representationSchema: true,
        canonicalizationProfile: true,
      },
      unsupportedArtifactKinds: [],
      unsupportedClaimTypes: [],
      unsupportedStandingStatuses: [],
      unsupportedSemanticTerms: [],
      reasonCodes: [],
    });
  });

  it('produces a partial report for a consumer that does not understand Derivation', async () => {
    const flow = await runCrossSystemFlow();
    const before = canonicalizeJSON(flow.importedBundle);

    const result = await assess(
      flow.descriptor,
      supportFor(flow.descriptor, { claimTypes: ['Authorship', 'Origin'] }),
    );
    if (result.output.operation !== 'assess-compatibility') throw new Error('unreachable');

    expect(result.status).toBe('succeeded');
    expect(result.evidence.outcome).toBe('succeeded');
    expect(result.output.report.status).toBe('partially-compatible');
    expect([...result.output.report.unsupportedClaimTypes]).toEqual(['Derivation']);

    // Partial never means data loss: the bundle, its wire form and the
    // descriptor are exactly as they were, and no reduced bundle was emitted.
    expect(canonicalizeJSON(flow.importedBundle)).toBe(before);
    expect(serializeSovereigntyPortabilityBundle(flow.importedBundle)).toBe(flow.wire);
    expect(flow.descriptor.present.claimTypes).toContain('Derivation');
    expect(Object.keys(result.output)).toEqual(['operation', 'report']);
  });

  it('produces an incompatible report — still a successful execution — for a foreign schema', async () => {
    const flow = await runCrossSystemFlow();

    const result = await assess(
      flow.descriptor,
      supportFor(flow.descriptor, { representationSchemaVersions: ['some-other-representation/1'] }),
    );
    if (result.output.operation !== 'assess-compatibility') throw new Error('unreachable');

    expect(result.status).toBe('succeeded');
    expect(result.evidence.outcome).toBe('succeeded');
    expect(result.output.report.status).toBe('incompatible');
    expect(result.output.report.core.representationSchema).toBe(false);
    expect(result.output.report.reasonCodes).toEqual([
      'INTEROPERABILITY_UNSUPPORTED_REPRESENTATION_SCHEMA',
    ]);

    // The representation is still intact and still importable elsewhere.
    const reparsed = parseSovereigntyPortabilityBundle(flow.wire);
    expect(reparsed.valid).toBe(true);
  });

  it('keeps the described representation usable by the other minerals afterwards', async () => {
    const flow = await runCrossSystemFlow();

    await assess(flow.descriptor, supportFor(flow.descriptor, { claimTypes: ['Origin'] }));

    // Real Provenance can still consume the imported claim: describing and
    // assessing changed nothing about the sovereign data.
    const importedClaim = flow.importedBundle.claims[0];
    if (importedClaim === undefined || importedClaim.kind !== 'claim') {
      throw new Error('expected an unsigned claim artifact');
    }

    const contested = await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: provenanceRef,
        subject: flow.importedBundle.subject,
        input: {
          operation: 'contest-provenance-claim',
          standingId: 'standing:sm07:002',
          claim: importedClaim.claim,
          reason: 'Application B records its own challenge after understanding the representation',
        } as ProvenanceSovereigntyCapabilityInput,
      }),
      createProvenanceSovereigntyCapabilityImplementation(),
    );

    expect(contested.status).toBe('succeeded');
    if (contested.status !== 'succeeded' || contested.output.operation !== 'contest-provenance-claim') {
      throw new Error('expected a contestation');
    }
    expect(contested.output.standing.status).toBe(StandingStatus.Contested);
  });

  it('keeps every mineral’s evidence separate, so composition stays visible to the caller', async () => {
    const flow = await runCrossSystemFlow();

    const attributed = flow.evidence.map(
      (record) => (record as { capability: { id: string } }).capability.id,
    );

    // Five distinct capabilities were consumed, and the caller performed every
    // one of those invocations itself. No capsule hid a call to another.
    expect(new Set(attributed)).toEqual(
      new Set([
        'aoc:sovereignty-capability:integrity',
        'aoc:sovereignty-capability:identity',
        'aoc:sovereignty-capability:provenance',
        'aoc:sovereignty-capability:portability',
        'aoc:sovereignty-capability:interoperability',
      ]),
    );

    // And the Interoperability evidence carries no payload from any of them.
    const interoperabilityEvidence = flow.evidence.filter(
      (record) =>
        (record as { capability: { id: string } }).capability.id
        === 'aoc:sovereignty-capability:interoperability',
    );
    expect(interoperabilityEvidence.length).toBeGreaterThan(0);
    for (const record of interoperabilityEvidence) {
      const wire = canonicalizeJSON(record as Record<string, unknown>);
      for (const leak of [
        'aoc-sovereignty-interoperability-descriptor/1',
        'aoc-sovereignty-portability-bundle/1',
        'future-system-origin-42',
        'Contested',
        'Derivation',
        flow.contentIdentity.digest,
      ]) {
        expect(wire).not.toContain(leak);
      }
    }
  });
});
