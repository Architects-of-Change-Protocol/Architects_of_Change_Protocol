import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import type { CanonicalStanding } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  mintSovereignAssetId,
  parseSovereignAssetId,
} from '@aoc/protocol/identity';
import type { SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  buildDerivationClaim,
  buildOriginClaim,
  buildSovereignManifestV1,
} from '@aoc/protocol/manifest';
import { buildSovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import type { SovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import {
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1,
  INTEROPERABLE_CLAIM_TYPES,
  INTEROPERABLE_STANDING_STATUSES,
  SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS,
  buildSovereigntyInteroperabilityConsumerSupportV1,
  buildSovereigntyInteroperabilityDescriptorV1,
} from '@aoc/protocol/interoperability';
import type {
  SovereigntyInteroperabilityConsumerSupportV1,
  SovereigntyInteroperabilityDescriptorV1,
} from '@aoc/protocol/interoperability';
import {
  INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES,
  SOVEREIGNTY_CAPABILITY_IDS,
  buildSovereigntyCapabilityInvocation,
  createInteroperabilitySovereigntyCapabilityImplementation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isValidInteroperabilitySovereigntyCapabilityInput,
  isValidSovereigntyCapabilityInvocationEvidence,
  validateInteroperabilitySovereigntyCapabilityInput,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  InteroperabilitySovereigntyCapabilityInput,
  InteroperabilitySovereigntyCapabilityOutput,
  SovereigntyCapabilityRef,
  SovereigntyCapabilityResult,
} from '@aoc/protocol/sovereignty-capabilities';

const CODES = INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES;
const INTEROPERABILITY_REF = getSovereigntyCapabilityRefByKey('interoperability') as SovereigntyCapabilityRef;
const ISSUER = 'principal:sm07-issuer';
const AT = '2026-04-01T09:00:00.000Z';

const interoperability = createInteroperabilitySovereigntyCapabilityImplementation();

const run = async (
  input: InteroperabilitySovereigntyCapabilityInput,
  options: { subject?: SovereignSubjectRef; correlationId?: string } = {},
): Promise<SovereigntyCapabilityResult<InteroperabilitySovereigntyCapabilityOutput>> =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: INTEROPERABILITY_REF,
      input,
      ...(options.subject === undefined ? {} : { subject: options.subject }),
      ...(options.correlationId === undefined ? {} : { correlationId: options.correlationId }),
    }),
    interoperability,
  );

/** The mandatory empirical bundle: manifest + Origin + Derivation + Contested. */
const buildBundle = (): { bundle: SovereigntyPortabilityBundleV1; id: SovereignAssetId } => {
  const id = parseSovereignAssetId(mintSovereignAssetId());
  const subject: SovereignSubjectRef = {
    sovereignAssetId: id,
    externalReference: buildSovereignExternalReference({
      namespace: 'alien-system-v47',
      id: 'alien-resource-92817',
      locator: 'future://provider-p1/object/92817',
    }),
  };
  const origin = buildOriginClaim({
    id: 'claim:origin:1',
    sovereignAssetId: id,
    issuer: ISSUER,
    assertedOrigin: 'sm07-origin',
    assertedAt: AT,
  });
  const derivation = buildDerivationClaim({
    id: 'claim:derivation:1',
    sovereignAssetId: id,
    issuer: ISSUER,
    sourceSovereignAssetIds: [parseSovereignAssetId(mintSovereignAssetId())],
    relation: 'DerivedFrom',
    issuedAt: AT,
  });
  const standings: readonly CanonicalStanding[] = [
    { id: 'standing:1', claimRef: origin.id, status: StandingStatus.Contested, effectiveAt: AT },
  ];

  return {
    id,
    bundle: buildSovereigntyPortabilityBundleV1({
      subject,
      manifests: [{ kind: 'manifest', manifest: buildSovereignManifestV1({ sovereignAssetId: id, registrant: ISSUER }) }],
      claims: [
        { kind: 'claim', claim: origin },
        { kind: 'claim', claim: derivation },
      ],
      standings,
    }),
  };
};

const fullSupportFor = (
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

describe('SM-07 / the production capsule advertises the canonical capability (CAPSULE TESTS 1-2)', () => {
  it('CAPSULE TEST 1 — advertises the canonical AOC.INTEROPERABILITY id', () => {
    expect(interoperability.capability.id).toBe(SOVEREIGNTY_CAPABILITY_IDS.interoperability);
    expect(interoperability.capability.id).toBe('aoc:sovereignty-capability:interoperability');
  });

  it('CAPSULE TEST 2 — takes its version from the SM-01 registry, never a literal', () => {
    expect(interoperability.capability.version).toBe(INTEROPERABILITY_REF.version);
    expect(interoperability.capability).toEqual(INTEROPERABILITY_REF);
    expect(interoperability.capability.version).toBe('1.0.0');
  });

  it('exposes exactly two operations, and no translation operation', () => {
    expect([...INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS]).toEqual([
      'describe-bundle',
      'assess-compatibility',
    ]);
  });

  it('validates its operation envelope and rejects an unsupported operation', () => {
    const { bundle } = buildBundle();
    expect(isValidInteroperabilitySovereigntyCapabilityInput({ operation: 'describe-bundle', bundle })).toBe(true);

    for (const bad of [null, 'nope', {}, { operation: 'translate-bundle' }]) {
      const result = validateInteroperabilitySovereigntyCapabilityInput(bad);
      expect(result.valid).toBe(false);
    }
    expect(validateInteroperabilitySovereigntyCapabilityInput({ operation: 'translate-bundle' }).reasons)
      .toEqual([CODES.unsupportedOperation]);
  });
});

describe('SM-07 / describe-bundle (CAPSULE TESTS 3-9)', () => {
  it('CAPSULE TEST 3 — works with no invocation subject at all', async () => {
    const { bundle } = buildBundle();

    const result = await run({ operation: 'describe-bundle', bundle });

    expect(result.status).toBe('succeeded');
  });

  it('CAPSULE TEST 4 — a subjectless description returns the bundle’s existing subject', async () => {
    const { bundle } = buildBundle();

    const result = await run({ operation: 'describe-bundle', bundle });
    if (result.status !== 'succeeded') throw new Error('expected success');

    // Returned, not minted: the same SovereignAssetId the bundle arrived with.
    expect(result.subject).toEqual(bundle.subject);
    expect(result.subject?.sovereignAssetId).toBe(bundle.subject.sovereignAssetId);
  });

  it('CAPSULE TEST 5 — the evidence subject is the bundle subject', async () => {
    const { bundle } = buildBundle();

    const result = await run({ operation: 'describe-bundle', bundle });

    expect(result.evidence.subject).toEqual(bundle.subject);
  });

  it('CAPSULE TEST 6 — an explicit invocation subject that matches succeeds', async () => {
    const { bundle } = buildBundle();

    const result = await run({ operation: 'describe-bundle', bundle }, { subject: bundle.subject });

    expect(result.status).toBe('succeeded');
    expect(result.subject).toEqual(bundle.subject);
  });

  it('CAPSULE TEST 7 — a mismatching invocation subject fails, and produces no descriptor', async () => {
    const { bundle } = buildBundle();
    const other: SovereignSubjectRef = {
      sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()),
    };

    const result = await run({ operation: 'describe-bundle', bundle }, { subject: other });

    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('expected failure');
    expect(result.reasonCodes).toEqual([CODES.subjectMismatch]);
    expect(result).not.toHaveProperty('output');

    // The same SovereignAssetId under a *different* external reference is also
    // a mismatch: nothing is reconciled and no winner is picked.
    const reReferenced: SovereignSubjectRef = {
      sovereignAssetId: bundle.subject.sovereignAssetId,
      externalReference: buildSovereignExternalReference({
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'future://provider-p2/object/92817',
      }),
    };
    const reReferencedResult = await run(
      { operation: 'describe-bundle', bundle },
      { subject: reReferenced },
    );
    expect(reReferencedResult.status).toBe('failed');
  });

  it('CAPSULE TEST 8 — the output includes the bundle-specific descriptor', async () => {
    const { bundle } = buildBundle();

    const result = await run({ operation: 'describe-bundle', bundle });
    if (result.status !== 'succeeded' || result.output.operation !== 'describe-bundle') {
      throw new Error('expected describe-bundle success');
    }

    expect(result.output.descriptor).toEqual(buildSovereigntyInteroperabilityDescriptorV1(bundle));
    expect([...result.output.descriptor.present.claimTypes]).toEqual(['Derivation', 'Origin']);
    expect([...result.output.descriptor.present.standingStatuses]).toEqual(['Contested']);
    expect([...result.output.descriptor.present.manifestArtifactKinds]).toEqual(['manifest']);

    // The descriptor describes; it does not duplicate the payload.
    const wire = canonicalizeJSON(result.output.descriptor);
    for (const leak of ['sm07-origin', 'claim:origin:1', 'claim:derivation:1', 'standing:1', ISSUER]) {
      expect(wire).not.toContain(leak);
    }
  });

  it('CAPSULE TEST 9 — the output includes the versioned, self-describing profile', async () => {
    const { bundle } = buildBundle();

    const result = await run({ operation: 'describe-bundle', bundle });
    if (result.status !== 'succeeded' || result.output.operation !== 'describe-bundle') {
      throw new Error('expected describe-bundle success');
    }

    // A consumer holding only this result can read every negotiable fact.
    expect(result.output.profile).toBe(AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1);
    expect(result.output.profile.id).toBe('aoc:interoperability-profile:sovereignty-portability');
    expect(result.output.profile.version).toBe('1.0.0');
    expect(result.output.profile.mediaType).toBe('application/vnd.aoc.sovereignty-portability+json');
    expect(result.output.profile.representation.schemaVersion).toBe('aoc-sovereignty-portability-bundle/1');
    expect(result.output.profile.representation.canonicalizationProfile).toBe('aoc-canonical-json/1');
    expect(result.output.profile.semanticVocabulary.categories.length).toBeGreaterThan(0);

    // And the descriptor still carries the versioned reference on its own, so
    // the two can never be separated and leave the descriptor ambiguous.
    expect(result.output.descriptor.profile).toEqual({
      id: result.output.profile.id,
      version: result.output.profile.version,
    });
  });

  it('fails an invalid bundle as an ordinary failed outcome, not an exception', async () => {
    const result = await run({
      operation: 'describe-bundle',
      bundle: { schemaVersion: 'aoc-sovereignty-portability-bundle/999' } as unknown as SovereigntyPortabilityBundleV1,
    });

    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('expected failure');
    expect(result.reasonCodes).toEqual([CODES.invalidBundle]);
  });
});

describe('SM-07 / assess-compatibility (CAPSULE TESTS 10-15)', () => {
  it('CAPSULE TEST 10 — a valid descriptor and full support declaration succeed', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const result = await run({
      operation: 'assess-compatibility',
      descriptor,
      consumerSupport: fullSupportFor(descriptor),
    });

    expect(result.status).toBe('succeeded');
    expect(result.subject).toEqual(descriptor.subject);
  });

  it('CAPSULE TEST 11 — a compatible report is produced', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const result = await run({
      operation: 'assess-compatibility',
      descriptor,
      consumerSupport: fullSupportFor(descriptor),
    });
    if (result.status !== 'succeeded' || result.output.operation !== 'assess-compatibility') {
      throw new Error('expected assess-compatibility success');
    }

    expect(result.output.report.status).toBe('compatible');
    expect(result.output.report.reasonCodes).toEqual([]);
  });

  it('CAPSULE TEST 12 — a partial report is still a successful execution', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const result = await run({
      operation: 'assess-compatibility',
      descriptor,
      consumerSupport: fullSupportFor(descriptor, { claimTypes: ['Authorship', 'Origin'] }),
    });
    if (result.status !== 'succeeded' || result.output.operation !== 'assess-compatibility') {
      throw new Error('expected assess-compatibility success');
    }

    expect(result.status).toBe('succeeded');
    expect(result.output.report.status).toBe('partially-compatible');
    expect([...result.output.report.unsupportedClaimTypes]).toEqual(['Derivation']);
    // Nothing was dropped: the bundle and its descriptor are untouched.
    expect(buildSovereigntyInteroperabilityDescriptorV1(bundle)).toEqual(descriptor);
    expect(descriptor.present.claimTypes).toContain('Derivation');
  });

  it('CAPSULE TEST 13 — an incompatible report is still a successful execution', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const result = await run({
      operation: 'assess-compatibility',
      descriptor,
      consumerSupport: fullSupportFor(descriptor, {
        representationSchemaVersions: ['some-other-representation/1'],
      }),
    });
    if (result.status !== 'succeeded' || result.output.operation !== 'assess-compatibility') {
      throw new Error('expected assess-compatibility success');
    }

    // The caller asked whether this consumer can consume this representation;
    // Interoperability determined the answer. "No" is a successful assessment.
    expect(result.status).toBe('succeeded');
    expect(result.evidence.outcome).toBe('succeeded');
    expect(result.output.report.status).toBe('incompatible');
    expect(result.output.report.core.representationSchema).toBe(false);
    expect(result.output.report.reasonCodes).toContain(
      'INTEROPERABILITY_UNSUPPORTED_REPRESENTATION_SCHEMA',
    );
  });

  it('CAPSULE TEST 14 — a malformed descriptor is a failed capability execution', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const result = await run({
      operation: 'assess-compatibility',
      descriptor: {
        ...descriptor,
        schemaVersion: 'aoc-sovereignty-interoperability-descriptor/2',
      } as unknown as SovereigntyInteroperabilityDescriptorV1,
      consumerSupport: fullSupportFor(descriptor),
    });

    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('expected failure');
    expect(result.reasonCodes).toEqual([CODES.invalidDescriptor]);
    // A question that cannot be answered is not the answer "incompatible".
    expect(result).not.toHaveProperty('output');
  });

  it('CAPSULE TEST 15 — a malformed consumer support declaration is a failed execution', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const result = await run({
      operation: 'assess-compatibility',
      descriptor,
      consumerSupport: {
        ...fullSupportFor(descriptor),
        claimTypes: ['Origin', 'Origin'],
      } as unknown as SovereigntyInteroperabilityConsumerSupportV1,
    });

    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('expected failure');
    expect(result.reasonCodes).toEqual([CODES.invalidConsumerSupport]);
  });

  it('rejects an explicit invocation subject that is not the descriptor’s subject', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const matching = await run(
      { operation: 'assess-compatibility', descriptor, consumerSupport: fullSupportFor(descriptor) },
      { subject: descriptor.subject },
    );
    expect(matching.status).toBe('succeeded');

    const mismatched = await run(
      { operation: 'assess-compatibility', descriptor, consumerSupport: fullSupportFor(descriptor) },
      { subject: { sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()) } },
    );
    expect(mismatched.status).toBe('failed');
    if (mismatched.status !== 'failed') throw new Error('expected failure');
    expect(mismatched.reasonCodes).toEqual([CODES.subjectMismatch]);
  });
});

describe('SM-07 / the capsule performs no other mineral’s work (CAPSULE TESTS 16-20)', () => {
  it('CAPSULE TEST 16 — mints no identity on either operation', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const described = await run({ operation: 'describe-bundle', bundle });
    const assessed = await run({
      operation: 'assess-compatibility',
      descriptor,
      consumerSupport: fullSupportFor(descriptor),
    });

    // Exactly one SovereignAssetId is in play across both invocations: the one
    // that already existed.
    expect(described.subject?.sovereignAssetId).toBe(bundle.subject.sovereignAssetId);
    expect(assessed.subject?.sovereignAssetId).toBe(bundle.subject.sovereignAssetId);
    const ids = new Set(
      [described, assessed].map((result) => result.subject?.sovereignAssetId),
    );
    expect(ids.size).toBe(1);
  });

  it('CAPSULE TEST 17 — computes no digest and reports no integrity result', async () => {
    const { bundle } = buildBundle();
    const result = await run({ operation: 'describe-bundle', bundle });
    if (result.status !== 'succeeded' || result.output.operation !== 'describe-bundle') {
      throw new Error('expected describe-bundle success');
    }

    const wire = canonicalizeJSON(result.output.descriptor);
    for (const forbidden of ['digest', 'sha256', 'checksum', 'contentIdentity', 'manifestDigest']) {
      expect(wire).not.toContain(forbidden);
    }
    // But the canonicalization profile — integrity *metadata* about the wire
    // form — is legitimately described.
    expect(result.output.descriptor.representation.canonicalizationProfile).toBe('aoc-canonical-json/1');
  });

  it('CAPSULE TEST 18 — reports no verification result, even for signed artifacts', async () => {
    const { bundle } = buildBundle();
    const result = await run({ operation: 'describe-bundle', bundle });
    if (result.status !== 'succeeded' || result.output.operation !== 'describe-bundle') {
      throw new Error('expected describe-bundle success');
    }

    const wire = canonicalizeJSON(result.output);
    for (const forbidden of ['verified', 'signatureValid', 'valid":true', 'proof', 'publicKey']) {
      expect(wire).not.toContain(forbidden);
    }
  });

  it('CAPSULE TEST 19 — invokes no other capsule, so its evidence attributes only itself', async () => {
    const { bundle } = buildBundle();

    const result = await run({ operation: 'describe-bundle', bundle });

    // If AOC.PORTABILITY had been invoked internally, a second evidence record
    // would exist and the caller could not see it. Exactly one invocation
    // happened, attributed to exactly one capability.
    expect(result.evidence.capability).toEqual(INTEROPERABILITY_REF);
    expect(canonicalizeJSON(result.evidence)).not.toContain('portability');
  });

  it('CAPSULE TEST 20 — every outcome carries exact capability attribution', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const outcomes = [
      await run({ operation: 'describe-bundle', bundle }),
      await run({ operation: 'describe-bundle', bundle }, { subject: { sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()) } }),
      await run({ operation: 'assess-compatibility', descriptor, consumerSupport: fullSupportFor(descriptor) }),
      await run({
        operation: 'assess-compatibility',
        descriptor,
        consumerSupport: fullSupportFor(descriptor, { claimTypes: ['Origin'] }),
      }),
    ];

    for (const result of outcomes) {
      expect(result.evidence.capability.id).toBe('aoc:sovereignty-capability:interoperability');
      expect(result.evidence.capability.version).toBe(INTEROPERABILITY_REF.version);
      expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
    }
  });
});

describe('SM-07 / common invocation evidence (EVIDENCE TESTS 1-10)', () => {
  it('EVIDENCE TEST 1 — attributes the exact canonical capability id and version', async () => {
    const { bundle } = buildBundle();
    const result = await run({ operation: 'describe-bundle', bundle });

    expect(result.evidence.capability.id).toBe(SOVEREIGNTY_CAPABILITY_IDS.interoperability);
    expect(result.evidence.capability.version).toBe(INTEROPERABILITY_REF.version);
    expect(result.evidence.schemaVersion).toBe('aoc-sovereignty-capability-invocation-evidence/1');
  });

  it('EVIDENCE TEST 2 — preserves the invocation id, distinct per invocation', async () => {
    const { bundle } = buildBundle();

    const first = await run({ operation: 'describe-bundle', bundle });
    const second = await run({ operation: 'describe-bundle', bundle });

    expect(first.evidence.invocationId).toBe(first.invocationId);
    expect(second.evidence.invocationId).toBe(second.invocationId);
    expect(first.invocationId).not.toBe(second.invocationId);
  });

  it('EVIDENCE TEST 3 — preserves a caller correlation id across invocations', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);
    const correlationId = 'sm07-negotiation-001';

    const described = await run({ operation: 'describe-bundle', bundle }, { correlationId });
    const assessed = await run(
      { operation: 'assess-compatibility', descriptor, consumerSupport: fullSupportFor(descriptor) },
      { correlationId },
    );

    expect(described.evidence.correlationId).toBe(correlationId);
    expect(assessed.evidence.correlationId).toBe(correlationId);
    // Correlating two invocations infers no workflow: each keeps its own id.
    expect(described.invocationId).not.toBe(assessed.invocationId);
  });

  it('EVIDENCE TEST 4 — carries the subject that came from the bundle', async () => {
    const { bundle } = buildBundle();
    const result = await run({ operation: 'describe-bundle', bundle });

    expect(result.evidence.subject).toEqual(bundle.subject);
    expect(result.evidence.subject?.externalReference?.namespace).toBe('alien-system-v47');
  });

  it('EVIDENCE TEST 5 — records `succeeded` for a compatible report', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const result = await run({
      operation: 'assess-compatibility',
      descriptor,
      consumerSupport: fullSupportFor(descriptor),
    });

    expect(result.evidence.outcome).toBe('succeeded');
    expect(result.evidence.reasonCodes).toBeUndefined();
  });

  it('EVIDENCE TEST 6 — records `succeeded` for a partial report', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const result = await run({
      operation: 'assess-compatibility',
      descriptor,
      consumerSupport: fullSupportFor(descriptor, { claimTypes: ['Origin'] }),
    });

    expect(result.evidence.outcome).toBe('succeeded');
  });

  it('EVIDENCE TEST 7 — records `succeeded` for an incompatible report', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    const result = await run({
      operation: 'assess-compatibility',
      descriptor,
      consumerSupport: fullSupportFor(descriptor, { representationSchemaVersions: ['other/1'] }),
    });

    // The distinction SM-07 turns on: an incompatibility is a determination,
    // not an execution failure.
    expect(result.evidence.outcome).toBe('succeeded');
    expect(result.evidence.reasonCodes).toBeUndefined();
  });

  it('EVIDENCE TEST 8 — the generic evidence excludes the profile and its vocabulary', async () => {
    const { bundle } = buildBundle();
    const result = await run({ operation: 'describe-bundle', bundle });
    const wire = canonicalizeJSON(result.evidence);

    for (const leak of [
      'aoc:interoperability-profile:sovereignty-portability',
      'application/vnd.aoc.sovereignty-portability+json',
      'aoc.sovereignty:sovereign-asset-identity',
      'semanticVocabulary',
      'Sovereign Asset Identity',
    ]) {
      expect(wire).not.toContain(leak);
    }
  });

  it('EVIDENCE TEST 9 — the generic evidence excludes the descriptor', async () => {
    const { bundle } = buildBundle();
    const result = await run({ operation: 'describe-bundle', bundle });
    const wire = canonicalizeJSON(result.evidence);

    for (const leak of [
      'aoc-sovereignty-interoperability-descriptor/1',
      'aoc-sovereignty-portability-bundle/1',
      'manifestArtifactKinds',
      'claimTypes',
      'Contested',
      'Derivation',
    ]) {
      expect(wire).not.toContain(leak);
    }
    // The subject is present, and is exactly what evidence is entitled to carry.
    expect(result.evidence.subject).toBeDefined();
  });

  it('EVIDENCE TEST 10 — the generic evidence excludes the support declaration and the report', async () => {
    const { bundle } = buildBundle();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    for (const consumerSupport of [
      fullSupportFor(descriptor),
      fullSupportFor(descriptor, { claimTypes: ['Origin'] }),
      fullSupportFor(descriptor, { representationSchemaVersions: ['other/1'] }),
    ]) {
      const result = await run({ operation: 'assess-compatibility', descriptor, consumerSupport });
      const wire = canonicalizeJSON(result.evidence);

      for (const leak of [
        'aoc-sovereignty-interoperability-support/1',
        'aoc-sovereignty-interoperability-report/1',
        'compatible',
        'unsupportedClaimTypes',
        'acceptedVersions',
        'INTEROPERABILITY_UNSUPPORTED',
      ]) {
        expect(wire).not.toContain(leak);
      }
      // Evidence stays small enough and safe enough to hand to someone who is
      // not entitled to the payload.
      expect(Object.keys(result.evidence).sort()).toEqual([
        'capability',
        'completedAt',
        'invocationId',
        'outcome',
        'requestedAt',
        'schemaVersion',
        'subject',
      ]);
      expect(canonicalizeJSON(JSON.parse(wire))).toBe(wire);
    }
  });
});
