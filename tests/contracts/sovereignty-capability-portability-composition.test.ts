import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import { buildSovereignExternalReference } from '@aoc/protocol/identity';
import type { ContentIdentity, SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  DerivationRelationKind,
  generateSovereignKeyPair,
  signClaim,
  signSovereignManifest,
  verifySignedClaim,
  verifySovereignManifest,
} from '@aoc/protocol/manifest';
import type { DerivationClaim, OriginClaim, SovereignManifestV1 } from '@aoc/protocol/manifest';
import { portableClaimOf, portableManifestOf } from '@aoc/protocol/portability';
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
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  IdentitySovereigntyCapabilityInput,
  IdentitySovereigntyCapabilityOutput,
  IntegritySovereigntyCapabilityInput,
  IntegritySovereigntyCapabilityOutput,
  PortabilitySovereigntyCapabilityInput,
  PortabilitySovereigntyCapabilityOutput,
  ProvenanceSovereigntyCapabilityInput,
  ProvenanceSovereigntyCapabilityOutput,
  SovereigntyCapabilityRef,
} from '@aoc/protocol/sovereignty-capabilities';

/**
 * Every subject, manifest, claim, standing, digest and bundle in this file comes
 * from a REAL production capsule through the REAL invoker. Nothing here is a
 * fake implementation, a stub or a hand-built object standing in for a mineral.
 */
const IDENTITY_REF = getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef;
const INTEGRITY_REF = getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef;
const PROVENANCE_REF = getSovereigntyCapabilityRefByKey('provenance') as SovereigntyCapabilityRef;
const PORTABILITY_REF = getSovereigntyCapabilityRefByKey('portability') as SovereigntyCapabilityRef;

const identity = createIdentitySovereigntyCapabilityImplementation();
const integrity = createIntegritySovereigntyCapabilityImplementation();
const provenance = createProvenanceSovereigntyCapabilityImplementation();
const portability = createPortabilitySovereigntyCapabilityImplementation();

const ISSUER = 'principal:sm06-issuer';

let claimSequence = 0;
const nextClaimId = (prefix: string): string => {
  claimSequence += 1;
  return `${prefix}:${String(claimSequence).padStart(4, '0')}`;
};

const createSubject = async (
  options: {
    externalReference?: { namespace: string; id: string; locator?: string };
    contentIdentity?: ContentIdentity;
    correlationId?: string;
  } = {},
): Promise<{ subject: SovereignSubjectRef; manifest: SovereignManifestV1 }> => {
  const input: IdentitySovereigntyCapabilityInput = {
    registrant: 'principal:sm06-registrant',
    ...(options.externalReference === undefined
      ? {}
      : { externalReference: buildSovereignExternalReference(options.externalReference) }),
    ...(options.contentIdentity === undefined ? {} : { contentIdentity: options.contentIdentity }),
  };
  const result = await invokeSovereigntyCapability<
    IdentitySovereigntyCapabilityInput,
    IdentitySovereigntyCapabilityOutput
  >(
    buildSovereigntyCapabilityInvocation({
      capability: IDENTITY_REF,
      input,
      ...(options.correlationId === undefined ? {} : { correlationId: options.correlationId }),
    }),
    identity,
  );
  if (result.status !== 'succeeded') throw new Error('real Identity invocation failed');
  return { subject: result.output.subject, manifest: result.output.manifest };
};

const invokeIntegrity = async (input: IntegritySovereigntyCapabilityInput) => {
  const result = await invokeSovereigntyCapability<
    IntegritySovereigntyCapabilityInput,
    IntegritySovereigntyCapabilityOutput
  >(buildSovereigntyCapabilityInvocation({ capability: INTEGRITY_REF, input }), integrity);
  if (result.status !== 'succeeded') throw new Error('real Integrity invocation failed');
  return result.output;
};

const contentIdentityOf = async (bytes: Uint8Array): Promise<ContentIdentity> => {
  const output = await invokeIntegrity({ operation: 'compute-content-identity', bytes });
  if (output.operation !== 'compute-content-identity') throw new Error('unreachable');
  return output.contentIdentity;
};

const invokeProvenance = async (
  subject: SovereignSubjectRef,
  input: ProvenanceSovereigntyCapabilityInput,
  correlationId?: string,
) => {
  const result = await invokeSovereigntyCapability<
    ProvenanceSovereigntyCapabilityInput,
    ProvenanceSovereigntyCapabilityOutput
  >(
    buildSovereigntyCapabilityInvocation({
      capability: PROVENANCE_REF,
      subject,
      input,
      ...(correlationId === undefined ? {} : { correlationId }),
    }),
    provenance,
  );
  if (result.status !== 'succeeded') throw new Error(`real Provenance invocation failed: ${result.reasonCodes}`);
  return result.output;
};

const declareOrigin = async (subject: SovereignSubjectRef, correlationId?: string): Promise<OriginClaim> => {
  const output = await invokeProvenance(
    subject,
    {
      operation: 'declare-origin',
      claimId: nextClaimId('claim:origin'),
      issuer: ISSUER,
      assertedOrigin: 'field-recording-2019',
      evidenceRefs: ['evidence:zzz-external', 'evidence:aaa-external'],
    },
    correlationId,
  );
  if (output.operation !== 'declare-origin') throw new Error('unreachable');
  return output.claim;
};

const recordDerivation = async (
  child: SovereignSubjectRef,
  sources: readonly SovereignAssetId[],
): Promise<DerivationClaim> => {
  const output = await invokeProvenance(child, {
    operation: 'record-derivation',
    claimId: nextClaimId('claim:derivation'),
    issuer: ISSUER,
    sourceSovereignAssetIds: sources,
    relation: DerivationRelationKind.CombinedFrom,
  });
  if (output.operation !== 'record-derivation') throw new Error('unreachable');
  return output.claim;
};

const exportBundle = async (
  subject: SovereignSubjectRef,
  artifacts: {
    manifests?: readonly PortableSovereignManifestArtifact[];
    claims?: readonly PortableSovereignClaimArtifact[];
    standings?: readonly import('@aoc/protocol/claims').CanonicalStanding[];
  } = {},
  correlationId?: string,
): Promise<{ bundle: SovereigntyPortabilityBundleV1; serializedBundle: string; invocationId: string }> => {
  const result = await invokeSovereigntyCapability<
    PortabilitySovereigntyCapabilityInput,
    PortabilitySovereigntyCapabilityOutput
  >(
    buildSovereigntyCapabilityInvocation({
      capability: PORTABILITY_REF,
      subject,
      input: { operation: 'export-bundle', ...artifacts },
      ...(correlationId === undefined ? {} : { correlationId }),
    }),
    portability,
  );
  if (result.status !== 'succeeded' || result.output.operation !== 'export-bundle') {
    throw new Error('real Portability export failed');
  }
  return { ...result.output, invocationId: result.invocationId };
};

/**
 * The destination runtime. It is handed a string and nothing else: no reference
 * to the exporting objects, no registry, no provider, no database.
 */
const importBundle = async (
  serializedBundle: string,
  options: { subject?: SovereignSubjectRef; correlationId?: string } = {},
) => {
  const result = await invokeSovereigntyCapability<
    PortabilitySovereigntyCapabilityInput,
    PortabilitySovereigntyCapabilityOutput
  >(
    buildSovereigntyCapabilityInvocation({
      capability: PORTABILITY_REF,
      input: { operation: 'import-bundle', serializedBundle },
      ...(options.subject === undefined ? {} : { subject: options.subject }),
      ...(options.correlationId === undefined ? {} : { correlationId: options.correlationId }),
    }),
    portability,
  );
  if (result.status !== 'succeeded' || result.output.operation !== 'import-bundle') {
    throw new Error('real Portability import failed');
  }
  return { ...result.output, subject: result.subject, evidence: result.evidence, invocationId: result.invocationId };
};

describe('SM-06 / real Identity → Portability (COMPOSITION TESTS 1-2)', () => {
  it('COMPOSITION TEST 1 — a real subject survives export, transport and import as the same subject', async () => {
    const { subject } = await createSubject({
      externalReference: {
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'future://provider/object/92817',
      },
    });

    const exported = await exportBundle(subject);
    // Transport: only the string crosses the boundary.
    const wire: string = exported.serializedBundle;
    const imported = await importBundle(wire);

    expect(imported.bundle.subject.sovereignAssetId).toBe(subject.sovereignAssetId);
    expect(imported.bundle.subject).toEqual(subject);
    expect(imported.bundle.subject.externalReference).toEqual({
      namespace: 'alien-system-v47',
      id: 'alien-resource-92817',
      locator: 'future://provider/object/92817',
    });
    expect(imported.serializedBundle).toBe(wire);
    expect(canonicalizeJSON(imported.bundle)).toBe(canonicalizeJSON(exported.bundle));
  });

  it('COMPOSITION TEST 2 — a real unsigned Identity manifest survives the round trip untouched', async () => {
    const { subject, manifest } = await createSubject({
      externalReference: { namespace: 'example:property-registry', id: 'lot-42' },
    });

    const exported = await exportBundle(subject, { manifests: [{ kind: 'manifest', manifest }] });
    const imported = await importBundle(exported.serializedBundle);

    expect(portableManifestOf(imported.bundle.manifests[0]!)).toEqual(manifest);
    expect(imported.bundle.manifests[0]!.kind).toBe('manifest');
    // Never signed on the way through.
    expect(imported.bundle.manifests[0]).not.toHaveProperty('signedManifest');
  });
});

describe('SM-06 / real Provenance → Portability (COMPOSITION TESTS 3-5)', () => {
  it('COMPOSITION TEST 3 — a real OriginClaim survives the round trip field for field', async () => {
    const { subject } = await createSubject();
    const claim = await declareOrigin(subject);

    const exported = await exportBundle(subject, { claims: [{ kind: 'claim', claim }] });
    const imported = await importBundle(exported.serializedBundle);

    const after = portableClaimOf(imported.bundle.claims[0]!) as OriginClaim;
    expect(after).toEqual(claim);
    expect(after.id).toBe(claim.id);
    expect(after.subject).toBe(subject.sovereignAssetId);
    expect(after.issuer).toBe(claim.issuer);
    expect(after.issuedAt).toBe(claim.issuedAt);
    expect(after.metadata.assertedOrigin).toBe('field-recording-2019');
    // Preserved in the issuer's order, never sorted by the envelope.
    expect(after.evidenceRefs).toEqual(['evidence:zzz-external', 'evidence:aaa-external']);
  });

  it('COMPOSITION TEST 4 — a real DerivationClaim survives with its source ids intact', async () => {
    const { subject: a } = await createSubject();
    const { subject: b } = await createSubject();
    const { subject: c } = await createSubject();
    const derivation = await recordDerivation(c, [a.sovereignAssetId, b.sovereignAssetId]);

    const exported = await exportBundle(c, { claims: [{ kind: 'claim', claim: derivation }] });
    const imported = await importBundle(exported.serializedBundle);

    const after = portableClaimOf(imported.bundle.claims[0]!) as DerivationClaim;
    expect(after).toEqual(derivation);
    expect(after.metadata.sourceSovereignAssetIds).toEqual([a.sovereignAssetId, b.sovereignAssetId]);
    // A and B are referenced, not recursively bundled.
    expect(imported.bundle.manifests).toEqual([]);
    expect(imported.bundle.subject.sovereignAssetId).toBe(c.sovereignAssetId);
  });

  it('COMPOSITION TEST 5 — an imported DerivationClaim is still usable by real Provenance trace-lineage', async () => {
    const { subject: a } = await createSubject();
    const { subject: b } = await createSubject();
    const { subject: c } = await createSubject();
    const derivation = await recordDerivation(c, [a.sovereignAssetId, b.sovereignAssetId]);

    const exported = await exportBundle(c, { claims: [{ kind: 'claim', claim: derivation }] });
    const imported = await importBundle(exported.serializedBundle);
    const importedClaim = portableClaimOf(imported.bundle.claims[0]!) as DerivationClaim;

    // Another mineral, invoked on the imported artifacts alone.
    const output = await invokeProvenance(imported.bundle.subject, {
      operation: 'trace-lineage',
      direction: 'ancestors',
      derivationClaims: [importedClaim],
    });
    if (output.operation !== 'trace-lineage') throw new Error('unreachable');

    const ancestors = output.trace.nodes.map((node) => node.sovereignAssetId);
    expect(ancestors).toContain(a.sovereignAssetId);
    expect(ancestors).toContain(b.sovereignAssetId);
    expect(output.trace.cycleDetected).toBe(false);
    expect(output.trace.truncated).toBe(false);
  });

  it('preserves a contested standing beside its claim, without adjudicating it', async () => {
    const { subject } = await createSubject();
    const claim = await declareOrigin(subject);
    const contested = await invokeProvenance(subject, {
      operation: 'contest-provenance-claim',
      standingId: 'standing:sm06:001',
      claim,
      reason: 'An independent party disputes the asserted origin',
    });
    if (contested.operation !== 'contest-provenance-claim') throw new Error('unreachable');

    const exported = await exportBundle(subject, {
      claims: [{ kind: 'claim', claim }],
      standings: [contested.standing],
    });
    const imported = await importBundle(exported.serializedBundle);

    expect(imported.bundle.standings[0]).toEqual(contested.standing);
    expect(imported.bundle.standings[0]!.status).toBe(StandingStatus.Contested);
    expect(imported.bundle.standings[0]!.claimRef).toBe(claim.id);
    expect(portableClaimOf(imported.bundle.claims[0]!)).toEqual(claim);
  });
});

describe('SM-06 / real Integrity composition (COMPOSITION TESTS 6-7)', () => {
  it('COMPOSITION TEST 6 — real Integrity over the serialized bundle yields the same ContentIdentity before and after transport', async () => {
    const bytes = new TextEncoder().encode('deterministic-sm06-fixture-bytes');
    const contentIdentity = await contentIdentityOf(bytes);
    const { subject, manifest } = await createSubject({ contentIdentity });
    const claim = await declareOrigin(subject);

    // 1. AOC.PORTABILITY → S1
    const exported = await exportBundle(subject, {
      manifests: [{ kind: 'manifest', manifest }],
      claims: [{ kind: 'claim', claim }],
    });
    const s1 = exported.serializedBundle;

    // 2-3. UTF-8 encode S1, then AOC.INTEGRITY → H1
    const h1 = await contentIdentityOf(new TextEncoder().encode(s1));

    // 4-5. transport/import, re-serialize → S2
    const imported = await importBundle(s1);
    const s2 = imported.serializedBundle;

    // 6. AOC.INTEGRITY over UTF8(S2) → H2
    const h2 = await contentIdentityOf(new TextEncoder().encode(s2));

    expect(s2).toBe(s1);
    expect(h2).toEqual(h1);
    // Portability did not perform Integrity; the two composed.
    expect(portableManifestOf(imported.bundle.manifests[0]!).contentIdentity).toEqual(contentIdentity);
    expect(s1).not.toContain('deterministic-sm06-fixture-bytes');
  });

  it('COMPOSITION TEST 7 — Portability itself never invokes Integrity: the digest only exists because a caller asked for it', async () => {
    const { subject } = await createSubject();
    const exported = await exportBundle(subject);

    // The bundle and its output carry no digest of any kind.
    expect(Object.keys(exported.bundle).sort()).toEqual([
      'canonicalizationProfile', 'claims', 'manifests', 'schemaVersion', 'standings', 'subject',
    ]);
    expect(exported.serializedBundle).not.toContain('"digest"');

    // The digest is produced only by an explicit, separate AOC.INTEGRITY
    // invocation, whose verification is likewise explicit.
    const digest = await contentIdentityOf(new TextEncoder().encode(exported.serializedBundle));
    const verified = await invokeIntegrity({
      operation: 'verify-content-identity',
      bytes: new TextEncoder().encode(exported.serializedBundle),
      expected: digest,
    });
    if (verified.operation !== 'verify-content-identity') throw new Error('unreachable');
    expect(verified.check).toEqual({ valid: true });
  });
});

describe('SM-06 / the first four-mineral flow (COMPOSITION TESTS 8-10)', () => {
  it('COMPOSITION TEST 8 — Integrity → Identity → Provenance → Portability composes under one correlation id', async () => {
    const correlationId = 'sm06-four-mineral-001';
    const bytes = new TextEncoder().encode('four-mineral-fixture');

    const contentIdentity = await contentIdentityOf(bytes);
    const { subject, manifest } = await createSubject({ contentIdentity, correlationId });
    const claim = await declareOrigin(subject, correlationId);

    const exported = await exportBundle(
      subject,
      { manifests: [{ kind: 'manifest', manifest }], claims: [{ kind: 'claim', claim }] },
      correlationId,
    );
    const imported = await importBundle(exported.serializedBundle, { correlationId });

    expect(imported.subject).toEqual(subject);
    expect(portableManifestOf(imported.bundle.manifests[0]!)).toEqual(manifest);
    expect(portableClaimOf(imported.bundle.claims[0]!)).toEqual(claim);
    expect(imported.evidence.correlationId).toBe(correlationId);
    expect(imported.invocationId).not.toBe(exported.invocationId);
  });

  it('COMPOSITION TEST 9 — signed artifacts are preserved by Portability and verified outside it', async () => {
    const { subject, manifest } = await createSubject();
    const claim = await declareOrigin(subject);
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();

    // Signing happens in TEST code, using the public low-level primitives.
    const signedManifest = signSovereignManifest(manifest, privateKeyPem, signingKey);
    const signedClaim = signClaim(claim, privateKeyPem, signingKey);

    const exported = await exportBundle(subject, {
      manifests: [{ kind: 'signed-manifest', signedManifest }],
      claims: [{ kind: 'signed-claim', signedClaim }],
    });
    const imported = await importBundle(exported.serializedBundle);

    const manifestArtifact = imported.bundle.manifests[0]!;
    const claimArtifact = imported.bundle.claims[0]!;
    if (manifestArtifact.kind !== 'signed-manifest' || claimArtifact.kind !== 'signed-claim') {
      throw new Error('unreachable');
    }
    expect(manifestArtifact.signedManifest).toEqual(signedManifest);
    expect(claimArtifact.signedClaim).toEqual(signedClaim);

    // Verification, invoked by the test and never by Portability, agrees on both sides.
    await expect(verifySovereignManifest(manifestArtifact.signedManifest)).resolves.toMatchObject({ valid: true });
    expect(verifySignedClaim(claimArtifact.signedClaim)).toEqual(verifySignedClaim(signedClaim));
    expect(verifySignedClaim(claimArtifact.signedClaim).valid).toBe(true);
  });

  it('COMPOSITION TEST 10 — every capsule in this flow is the real production implementation', () => {
    expect(identity.capability).toEqual(IDENTITY_REF);
    expect(integrity.capability).toEqual(INTEGRITY_REF);
    expect(provenance.capability).toEqual(PROVENANCE_REF);
    expect(portability.capability).toEqual(PORTABILITY_REF);
    expect([identity, integrity, provenance, portability].map((capsule) => capsule.capability.id)).toEqual([
      'aoc:sovereignty-capability:identity',
      'aoc:sovereignty-capability:integrity',
      'aoc:sovereignty-capability:provenance',
      'aoc:sovereignty-capability:portability',
    ]);
  });
});

describe('SM-06 / provider neutrality and open-world subjects (PROVIDER TESTS 1-7)', () => {
  /**
   * A storage pointer that stays firmly OUTSIDE the bundle, exactly as an
   * application would hold one. Application A's pointer names provider P1;
   * Application B's names P2. Neither ever enters the sovereign representation.
   */
  interface ExternalStoragePointer {
    readonly provider: string;
    readonly key: string;
  }

  it('PROVIDER TESTS 1-2 — the bundle schema carries neither a provider nor a storage pointer', async () => {
    const { subject } = await createSubject();
    const pointerP1: ExternalStoragePointer = { provider: 'provider-p1', key: 'objects/92817' };

    const exported = await exportBundle(subject);

    expect(exported.serializedBundle).not.toContain(pointerP1.provider);
    expect(exported.serializedBundle).not.toContain(pointerP1.key);
    expect(exported.serializedBundle).not.toContain('"provider"');
    expect(exported.serializedBundle).not.toContain('"storagePointer"');
  });

  it('PROVIDER TESTS 3-6 — the locator is preserved but never dereferenced, and the subject stays usable with a new provider', async () => {
    const { subject } = await createSubject({
      externalReference: {
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'provider-p1://object/92817',
      },
    });
    const exported = await exportBundle(subject);

    // Application B knows only the string. Provider P1 is unavailable to it, and
    // nothing in the import needs P1 to exist.
    const imported = await importBundle(exported.serializedBundle);

    expect(imported.bundle.subject.externalReference?.locator).toBe('provider-p1://object/92817');
    expect(imported.bundle.subject.sovereignAssetId).toBe(subject.sovereignAssetId);

    // The destination attaches its OWN provider pointer, outside the bundle. The
    // sovereign identity is unchanged by that, which is the whole invariant.
    const pointerP2: ExternalStoragePointer = { provider: 'provider-p2', key: 'migrated/92817' };
    const reExported = await exportBundle(imported.bundle.subject);
    expect(reExported.serializedBundle).toBe(exported.serializedBundle);
    expect(reExported.serializedBundle).not.toContain(pointerP2.provider);
  });

  it('PROVIDER TEST 7 — no namespace is branched on: alien, property, token and API subjects behave identically', async () => {
    const references = [
      { namespace: 'alien-system-v47', id: 'alien-resource-92817', locator: 'future://provider/object/92817' },
      { namespace: 'example:property-registry', id: 'title-deed-lot-42' },
      { namespace: 'example:external-token-system', id: 'token-9001' },
      { namespace: 'example:agent-network', id: 'agent-orion-7' },
      { namespace: 'example:api-catalog', id: 'api://payments/v3' },
    ] as const;

    for (const externalReference of references) {
      const { subject } = await createSubject({ externalReference });
      const exported = await exportBundle(subject);
      const imported = await importBundle(exported.serializedBundle);

      expect(imported.bundle.subject.sovereignAssetId).toBe(subject.sovereignAssetId);
      expect(imported.bundle.subject.externalReference).toEqual(externalReference);
      expect(imported.serializedBundle).toBe(exported.serializedBundle);
      // No ContentIdentity anywhere: none of these subjects has bytes.
      expect(exported.serializedBundle).not.toContain('contentIdentity');
    }
  });
});
