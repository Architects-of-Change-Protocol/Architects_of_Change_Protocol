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
  buildOriginClaim,
  buildSovereignManifestV1,
  generateSovereignKeyPair,
  signClaim,
} from '@aoc/protocol/manifest';
import type { OriginClaim } from '@aoc/protocol/manifest';
import {
  SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
  serializeSovereigntyPortabilityBundle,
  buildSovereigntyPortabilityBundleV1,
} from '@aoc/protocol/portability';
import {
  PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES,
  SOVEREIGNTY_CAPABILITY_IDS,
  buildSovereigntyCapabilityInvocation,
  createPortabilitySovereigntyCapabilityImplementation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isValidPortabilitySovereigntyCapabilityInput,
  isValidSovereigntyCapabilityInvocationEvidence,
  validatePortabilitySovereigntyCapabilityInput,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  PortabilitySovereigntyCapabilityInput,
  PortabilitySovereigntyCapabilityOutput,
  SovereigntyCapabilityRef,
  SovereigntyCapabilityResult,
} from '@aoc/protocol/sovereignty-capabilities';

const CODES = PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES;
const PORTABILITY_REF = getSovereigntyCapabilityRefByKey('portability') as SovereigntyCapabilityRef;
const ISSUER = 'principal:sm06-issuer';
const AT = '2026-03-01T09:00:00.000Z';

const portability = createPortabilitySovereigntyCapabilityImplementation();

const subjectOf = (
  sovereignAssetId: SovereignAssetId,
  externalReference?: { namespace: string; id: string; locator?: string },
): SovereignSubjectRef => ({
  sovereignAssetId,
  ...(externalReference === undefined
    ? {}
    : { externalReference: buildSovereignExternalReference(externalReference) }),
});

const originFor = (sovereignAssetId: SovereignAssetId, id: string): OriginClaim =>
  buildOriginClaim({ id, sovereignAssetId, issuer: ISSUER, assertedOrigin: 'field-recording-2019', assertedAt: AT });

const standingFor = (id: string, claimRef: string): CanonicalStanding => ({
  id,
  claimRef,
  status: StandingStatus.Contested,
  reason: 'A third party disputes the assertion',
  effectiveAt: AT,
});

const invokePortability = async (
  input: PortabilitySovereigntyCapabilityInput,
  options: { subject?: SovereignSubjectRef; correlationId?: string } = {},
): Promise<SovereigntyCapabilityResult<PortabilitySovereigntyCapabilityOutput>> =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: PORTABILITY_REF,
      input,
      ...(options.subject === undefined ? {} : { subject: options.subject }),
      ...(options.correlationId === undefined ? {} : { correlationId: options.correlationId }),
    }),
    portability,
  );

const exportOrThrow = async (
  subject: SovereignSubjectRef,
  input: Omit<Extract<PortabilitySovereigntyCapabilityInput, { operation: 'export-bundle' }>, 'operation'> = {},
  correlationId?: string,
) => {
  const result = await invokePortability(
    { operation: 'export-bundle', ...input },
    { subject, ...(correlationId === undefined ? {} : { correlationId }) },
  );
  if (result.status !== 'succeeded' || result.output.operation !== 'export-bundle') {
    throw new Error(`export failed: ${result.status === 'failed' ? result.reasonCodes.join(', ') : 'wrong operation'}`);
  }
  return result as typeof result & { output: { operation: 'export-bundle' } };
};

describe('SM-06 / production AOC.PORTABILITY capsule identity (CAPSULE TESTS 1-2)', () => {
  it('CAPSULE TEST 1 — advertises the exact canonical AOC.PORTABILITY ref', () => {
    expect(portability.capability.id).toBe(SOVEREIGNTY_CAPABILITY_IDS.portability);
    expect(portability.capability.id).toBe('aoc:sovereignty-capability:portability');
  });

  it('CAPSULE TEST 2 — derives its version from the SM-01 registry rather than a literal', () => {
    expect(portability.capability).toEqual(PORTABILITY_REF);
    expect(portability.capability.version).toBe(PORTABILITY_REF.version);
    expect(PORTABILITY_REF.version).toBe('1.0.0');
  });

  it('supports exactly two operations, and reports an unrecognized one', async () => {
    expect(PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS).toEqual(['export-bundle', 'import-bundle']);

    const result = await invokePortability(
      { operation: 'sync-bundle' } as unknown as PortabilitySovereigntyCapabilityInput,
      { subject: subjectOf(mintSovereignAssetId()) },
    );
    expect(result).toMatchObject({ status: 'failed', reasonCodes: [CODES.unsupportedOperation] });
  });

  it('validates its capability-specific input as an operation envelope', () => {
    expect(isValidPortabilitySovereigntyCapabilityInput({ operation: 'export-bundle' })).toBe(true);
    expect(isValidPortabilitySovereigntyCapabilityInput({ operation: 'import-bundle', serializedBundle: '{}' }))
      .toBe(true);
    expect(validatePortabilitySovereigntyCapabilityInput({ operation: 'import-bundle', serializedBundle: '  ' }))
      .toEqual({ valid: false, reasons: [CODES.invalidInput] });
    expect(validatePortabilitySovereigntyCapabilityInput({ operation: 'export-bundle', claims: 'nope' }))
      .toEqual({ valid: false, reasons: [CODES.invalidInput] });
    expect(validatePortabilitySovereigntyCapabilityInput(null))
      .toEqual({ valid: false, reasons: [CODES.invalidInput] });
  });
});

describe('SM-06 / export-bundle (CAPSULE TESTS 3-6)', () => {
  it('CAPSULE TEST 3 — export requires a subject and never mints one to have something to export', async () => {
    const result = await invokePortability({ operation: 'export-bundle' });
    expect(result).toMatchObject({ status: 'failed', reasonCodes: [CODES.subjectRequired] });
    expect(result.subject).toBeUndefined();
    expect(result.evidence.subject).toBeUndefined();
  });

  it('CAPSULE TEST 4 — export builds a real canonical bundle from the supplied artifacts', async () => {
    const id = mintSovereignAssetId();
    const subject = subjectOf(id, { namespace: 'example:property-registry', id: 'lot-42' });
    const claim = originFor(id, 'claim:origin:001');

    const result = await exportOrThrow(subject, {
      manifests: [
        {
          kind: 'manifest',
          manifest: buildSovereignManifestV1({
            sovereignAssetId: id,
            registrant: 'principal:sm06-registrant',
            createdAt: AT,
          }),
        },
      ],
      claims: [{ kind: 'claim', claim }],
      standings: [standingFor('standing:001', claim.id)],
    });

    expect(result.output.bundle.schemaVersion).toBe(SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION);
    expect(result.output.bundle.subject).toEqual(subject);
    expect(result.output.bundle.manifests).toHaveLength(1);
    expect(result.output.bundle.claims).toHaveLength(1);
    expect(result.output.bundle.standings).toHaveLength(1);
    expect(result.subject).toEqual(subject);
  });

  it('CAPSULE TEST 5 — export returns the canonical serialized bundle from the one Protocol serializer', async () => {
    const id = mintSovereignAssetId();
    const result = await exportOrThrow(subjectOf(id));

    expect(result.output.serializedBundle).toBe(serializeSovereigntyPortabilityBundle(result.output.bundle));
    expect(result.output.serializedBundle).toBe(canonicalizeJSON(result.output.bundle));
  });

  it('CAPSULE TEST 6 — export never mints identity: the exported id is the subject it was given', async () => {
    const id = mintSovereignAssetId();
    const subject = subjectOf(id);

    const first = await exportOrThrow(subject);
    const second = await exportOrThrow(subject);

    expect(first.output.bundle.subject.sovereignAssetId).toBe(id);
    expect(second.output.bundle.subject.sovereignAssetId).toBe(id);
    expect(parseSovereignAssetId(first.output.bundle.subject.sovereignAssetId)).toEqual(parseSovereignAssetId(id));
    // Two exports of one subject produce one identical wire representation.
    expect(second.output.serializedBundle).toBe(first.output.serializedBundle);
  });

  it('reports the real bundle validator reasons verbatim rather than a generic input failure', async () => {
    const subject = subjectOf(mintSovereignAssetId());
    const foreign = originFor(mintSovereignAssetId(), 'claim:origin:foreign');

    const result = await invokePortability(
      { operation: 'export-bundle', claims: [{ kind: 'claim', claim: foreign }] },
      { subject },
    );
    expect(result).toMatchObject({ status: 'failed', reasonCodes: [CODES.claimSubjectMismatch] });
  });
});

describe('SM-06 / import-bundle (CAPSULE TESTS 7-14)', () => {
  const exportedFor = async (
    subject: SovereignSubjectRef,
    claims: readonly OriginClaim[] = [],
  ): Promise<string> => {
    const result = await exportOrThrow(subject, {
      claims: claims.map((claim) => ({ kind: 'claim' as const, claim })),
    });
    return result.output.serializedBundle;
  };

  it('CAPSULE TEST 7 — import succeeds with no invocation subject at all', async () => {
    const id = mintSovereignAssetId();
    const serializedBundle = await exportedFor(subjectOf(id));

    const result = await invokePortability({ operation: 'import-bundle', serializedBundle });
    expect(result.status).toBe('succeeded');
  });

  it('CAPSULE TEST 8 — a subjectless import returns the EXISTING bundle subject, minting nothing', async () => {
    const id = mintSovereignAssetId();
    const subject = subjectOf(id, {
      namespace: 'alien-system-v47',
      id: 'alien-resource-92817',
      locator: 'future://provider/object/92817',
    });
    const serializedBundle = await exportedFor(subject);

    const result = await invokePortability({ operation: 'import-bundle', serializedBundle });
    if (result.status !== 'succeeded' || result.output.operation !== 'import-bundle') {
      throw new Error('import failed');
    }

    expect(result.subject).toEqual(subject);
    expect(result.subject?.sovereignAssetId).toBe(id);
    expect(result.output.bundle.subject).toEqual(subject);
    // No new SovereignAssetId anywhere in the result.
    expect(result.output.serializedBundle).toBe(serializedBundle);
  });

  it('CAPSULE TEST 9 — the evidence subject of a subjectless import is the bundle subject', async () => {
    const id = mintSovereignAssetId();
    const serializedBundle = await exportedFor(subjectOf(id));

    const result = await invokePortability({ operation: 'import-bundle', serializedBundle });
    expect(result.evidence.subject?.sovereignAssetId).toBe(id);
    expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
  });

  it('CAPSULE TEST 10 — an import naming the exact same subject succeeds', async () => {
    const id = mintSovereignAssetId();
    const subject = subjectOf(id, { namespace: 'alien-system-v47', id: 'alien-resource-92817' });
    const serializedBundle = await exportedFor(subject);

    const result = await invokePortability({ operation: 'import-bundle', serializedBundle }, { subject });
    expect(result.status).toBe('succeeded');
    expect(result.subject).toEqual(subject);
  });

  it('CAPSULE TEST 11 — an import naming a different subject fails closed, merging nothing', async () => {
    const id = mintSovereignAssetId();
    const serializedBundle = await exportedFor(
      subjectOf(id, { namespace: 'alien-system-v47', id: 'alien-resource-92817', locator: 'provider-a://object/1' }),
    );

    // A different SovereignAssetId.
    await expect(
      invokePortability({ operation: 'import-bundle', serializedBundle }, { subject: subjectOf(mintSovereignAssetId()) }),
    ).resolves.toMatchObject({ status: 'failed', reasonCodes: [CODES.subjectMismatch] });

    // The same id, but a different locator: never silently reconciled.
    await expect(
      invokePortability(
        { operation: 'import-bundle', serializedBundle },
        {
          subject: subjectOf(id, {
            namespace: 'alien-system-v47',
            id: 'alien-resource-92817',
            locator: 'provider-b://object/1',
          }),
        },
      ),
    ).resolves.toMatchObject({ status: 'failed', reasonCodes: [CODES.subjectMismatch] });

    // The same id, but no external reference at all: still not the same reference.
    await expect(
      invokePortability({ operation: 'import-bundle', serializedBundle }, { subject: subjectOf(id) }),
    ).resolves.toMatchObject({ status: 'failed', reasonCodes: [CODES.subjectMismatch] });
  });

  it('CAPSULE TEST 12 — import persists and registers nothing', async () => {
    const id = mintSovereignAssetId();
    const serializedBundle = await exportedFor(subjectOf(id));

    const result = await invokePortability({ operation: 'import-bundle', serializedBundle });
    if (result.status !== 'succeeded' || result.output.operation !== 'import-bundle') throw new Error('import failed');

    // The output is data. No registry, database, filesystem or provider handle
    // is returned or required, and nothing was stored anywhere for a second
    // import to find.
    expect(Object.keys(result.output).sort()).toEqual(['bundle', 'operation', 'serializedBundle']);
    const second = await invokePortability({ operation: 'import-bundle', serializedBundle });
    expect(second.status).toBe('succeeded');
    expect(createPortabilitySovereigntyCapabilityImplementation.length).toBe(0);
  });

  it('CAPSULE TEST 13 — import does not verify signatures: broken proof material still imports', async () => {
    const id = mintSovereignAssetId();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const signedClaim = signClaim(originFor(id, 'claim:origin:tampered'), privateKeyPem, signingKey);
    const tampered = { ...signedClaim, proof: { ...signedClaim.proof, signature: 'AAAA' } };

    const serializedBundle = serializeSovereigntyPortabilityBundle(
      buildSovereigntyPortabilityBundleV1({
        subject: subjectOf(id),
        claims: [{ kind: 'signed-claim', signedClaim: tampered }],
      }),
    );

    const result = await invokePortability({ operation: 'import-bundle', serializedBundle });
    if (result.status !== 'succeeded' || result.output.operation !== 'import-bundle') throw new Error('import failed');

    const artifact = result.output.bundle.claims[0]!;
    if (artifact.kind !== 'signed-claim') throw new Error('unreachable');
    expect(artifact.signedClaim.proof.signature).toBe('AAAA');
  });

  it('CAPSULE TEST 14 — import does not dereference a locator or resolve an evidence ref', async () => {
    const id = mintSovereignAssetId();
    const claim = buildOriginClaim({
      id: 'claim:origin:unresolvable',
      sovereignAssetId: id,
      issuer: ISSUER,
      assertedOrigin: 'https://example.invalid/origin-document',
      assertedAt: AT,
      evidenceRefs: ['evidence:never-resolvable:001'],
    });
    const serializedBundle = serializeSovereigntyPortabilityBundle(
      buildSovereigntyPortabilityBundleV1({
        subject: subjectOf(id, {
          namespace: 'alien-system-v47',
          id: 'alien-resource-92817',
          locator: 'https://unreachable.invalid/object/92817',
        }),
        claims: [{ kind: 'claim', claim }],
      }),
    );

    const result = await invokePortability({ operation: 'import-bundle', serializedBundle });
    if (result.status !== 'succeeded' || result.output.operation !== 'import-bundle') throw new Error('import failed');

    expect(result.output.bundle.subject.externalReference?.locator).toBe('https://unreachable.invalid/object/92817');
    expect(result.output.bundle.claims[0]!.kind).toBe('claim');
  });
});

describe('SM-06 / common SM-03 evidence (CAPSULE TESTS 15-18)', () => {
  const richExport = async () => {
    const id = mintSovereignAssetId();
    const claim = originFor(id, 'claim:origin:evidence-check');
    const subject = subjectOf(id, { namespace: 'alien-system-v47', id: 'alien-resource-92817' });
    const exported = await exportOrThrow(
      subject,
      {
        manifests: [
          {
            kind: 'manifest',
            manifest: buildSovereignManifestV1({
              sovereignAssetId: id,
              registrant: 'principal:sm06-registrant',
              createdAt: AT,
            }),
          },
        ],
        claims: [{ kind: 'claim', claim }],
        standings: [standingFor('standing:001', claim.id)],
      },
      'sm06-migration-001',
    );
    const imported = await invokePortability(
      { operation: 'import-bundle', serializedBundle: exported.output.serializedBundle },
      { correlationId: 'sm06-migration-001' },
    );
    return { exported, imported, subject, claim };
  };

  it('CAPSULE TEST 15 — evidence carries the exact canonical Portability id and version', async () => {
    const { exported, imported } = await richExport();
    for (const result of [exported, imported]) {
      expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
      expect(result.evidence.capability).toEqual({
        id: 'aoc:sovereignty-capability:portability',
        version: PORTABILITY_REF.version,
      });
      expect(result.evidence.outcome).toBe('succeeded');
    }
  });

  it('CAPSULE TESTS 16-18 — evidence carries no bundle, no serialized bundle, and no artifact payload', async () => {
    const { exported, imported, claim } = await richExport();

    for (const result of [exported, imported]) {
      const serialized = JSON.stringify(result.evidence);
      for (const leak of [
        'serializedBundle', 'bundle', 'manifests', 'claims', 'standings', 'schemaVersion:aoc-sovereignty-portability',
        'aoc-sovereignty-portability-bundle/1', 'signed-manifest', 'signed-claim', 'proof', 'signature',
        'manifestDigest', 'registrant', 'assertedOrigin', 'field-recording-2019', claim.id, 'standing:001',
        'Contested', ISSUER,
      ]) {
        expect(serialized).not.toContain(leak);
      }
      expect(Object.keys(result.evidence).sort()).toEqual([
        'capability', 'completedAt', 'correlationId', 'invocationId', 'outcome', 'requestedAt', 'schemaVersion', 'subject',
      ]);
      expect(canonicalizeJSON(JSON.parse(serialized))).toBe(canonicalizeJSON(result.evidence));
    }
  });

  it('shares one correlation id across export and import while keeping distinct invocation ids', async () => {
    const { exported, imported } = await richExport();

    expect(exported.evidence.correlationId).toBe('sm06-migration-001');
    expect(imported.evidence.correlationId).toBe('sm06-migration-001');
    expect(exported.invocationId).not.toBe(imported.invocationId);
    expect(exported.evidence.invocationId).toBe(exported.invocationId);
    expect(imported.evidence.invocationId).toBe(imported.invocationId);
  });
});

describe('SM-06 / expected capability failures (CAPSULE TESTS 19-20)', () => {
  it('CAPSULE TEST 19 — malformed JSON is an ordinary failed outcome, not a crash', async () => {
    const result = await invokePortability({ operation: 'import-bundle', serializedBundle: '{ not-json' });

    expect(result).toMatchObject({ status: 'failed', reasonCodes: [CODES.invalidJson] });
    expect(result.evidence.outcome).toBe('failed');
    expect(result.evidence.reasonCodes).toEqual([CODES.invalidJson]);
  });

  it('CAPSULE TEST 20 — an unsupported bundle version is an ordinary failed outcome, with no best-effort import', async () => {
    const id = mintSovereignAssetId();
    const canonical = serializeSovereigntyPortabilityBundle(
      buildSovereigntyPortabilityBundleV1({ subject: subjectOf(id) }),
    );
    const future = JSON.stringify({
      ...JSON.parse(canonical),
      schemaVersion: 'aoc-sovereignty-portability-bundle/999',
    });

    const result = await invokePortability({ operation: 'import-bundle', serializedBundle: future });
    expect(result).toMatchObject({ status: 'failed', reasonCodes: [CODES.unsupportedBundleSchema] });
    expect(result.subject).toBeUndefined();
  });

  it('re-exports an imported bundle without drift', async () => {
    const id = mintSovereignAssetId();
    const claim = originFor(id, 'claim:origin:reexport');
    const subject = subjectOf(id, { namespace: 'example:external-token-system', id: 'token-9001' });

    const exported = await exportOrThrow(subject, { claims: [{ kind: 'claim', claim }] });
    const imported = await invokePortability({
      operation: 'import-bundle',
      serializedBundle: exported.output.serializedBundle,
    });
    if (imported.status !== 'succeeded' || imported.output.operation !== 'import-bundle') throw new Error('import failed');

    // Portability output becomes Portability input, through the capsule again.
    const reExported = await exportOrThrow(imported.output.bundle.subject, {
      manifests: imported.output.bundle.manifests,
      claims: imported.output.bundle.claims,
      standings: imported.output.bundle.standings,
    });

    expect(reExported.output.serializedBundle).toBe(exported.output.serializedBundle);
  });
});
