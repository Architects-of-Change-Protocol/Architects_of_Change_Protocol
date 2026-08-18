import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import type { CanonicalSemanticRef, CanonicalStanding } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  mintSovereignAssetId,
  parseSovereignAssetId,
} from '@aoc/protocol/identity';
import type { SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  buildAuthorityClaim,
  buildDerivationClaim,
  buildOriginClaim,
  buildSovereignManifestV1,
  generateSovereignKeyPair,
  signClaim,
  signSovereignManifest,
} from '@aoc/protocol/manifest';
import type { AuthorityClaim, DerivationClaim, OriginClaim } from '@aoc/protocol/manifest';
import { buildSovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import type { SovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import {
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1,
  SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION,
  SOVEREIGNTY_INTEROPERABILITY_REASON_CODES,
  buildSovereigntyInteroperabilityDescriptorV1,
  isValidSovereigntyInteroperabilityDescriptorV1,
  presentInteroperabilityArtifactKinds,
  tryBuildSovereigntyInteroperabilityDescriptorV1,
} from '@aoc/protocol/interoperability';

const ISSUER = 'principal:sm07-issuer';
const AT = '2026-04-01T09:00:00.000Z';

const subjectOf = (sovereignAssetId: SovereignAssetId): SovereignSubjectRef => ({ sovereignAssetId });

const newSubject = (): { id: SovereignAssetId; subject: SovereignSubjectRef } => {
  const id = parseSovereignAssetId(mintSovereignAssetId());
  return { id, subject: subjectOf(id) };
};

const originClaimFor = (
  id: SovereignAssetId,
  claimId = 'claim:origin:1',
  semanticRefs?: readonly CanonicalSemanticRef[],
): OriginClaim => {
  const claim = buildOriginClaim({
    id: claimId,
    sovereignAssetId: id,
    issuer: ISSUER,
    assertedOrigin: 'sm07-origin',
    assertedAt: AT,
  });
  return semanticRefs === undefined ? claim : { ...claim, semanticRefs };
};

const authorityClaimFor = (id: SovereignAssetId, claimId = 'claim:authorship:1'): AuthorityClaim =>
  buildAuthorityClaim({
    id: claimId,
    sovereignAssetId: id,
    issuer: ISSUER,
    kind: 'Authorship',
    statement: 'issuer asserts authorship',
    issuedAt: AT,
  });

const derivationClaimFor = (
  id: SovereignAssetId,
  claimId = 'claim:derivation:1',
  semanticRefs?: readonly CanonicalSemanticRef[],
): DerivationClaim => {
  const claim = buildDerivationClaim({
    id: claimId,
    sovereignAssetId: id,
    issuer: ISSUER,
    sourceSovereignAssetIds: [parseSovereignAssetId(mintSovereignAssetId())],
    relation: 'DerivedFrom',
    issuedAt: AT,
  });
  return semanticRefs === undefined ? claim : { ...claim, semanticRefs };
};

const contestedStandingFor = (claimRef: string, id = 'standing:1'): CanonicalStanding => ({
  id,
  claimRef,
  status: StandingStatus.Contested,
  effectiveAt: AT,
});

/**
 * SM-07 / the representation descriptor.
 *
 * A profile describes what representations in this family *may* contain; a
 * descriptor describes what one actual bundle *does* contain. These tests hold
 * that line: everything asserted here is presence in a concrete bundle, and
 * nothing is inherited from the profile's range.
 */
describe('SM-07 / describing a representation (DESCRIPTOR TESTS 1-4)', () => {
  it('DESCRIPTOR TEST 1 — a subject-only bundle is describable', () => {
    const { subject } = newSubject();
    const bundle = buildSovereigntyPortabilityBundleV1({ subject });

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    // A subject with no manifests, claims or standings is a real sovereign
    // representation, and a receiving system still learns exactly what it is.
    expect(descriptor.schemaVersion).toBe('aoc-sovereignty-interoperability-descriptor/1');
    expect(descriptor.schemaVersion).toBe(SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION);
    expect(descriptor.profile).toEqual({
      id: AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1.id,
      version: AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1.version,
    });
    expect(descriptor.mediaType).toBe('application/vnd.aoc.sovereignty-portability+json');
    expect(descriptor.representation).toEqual({
      schemaVersion: 'aoc-sovereignty-portability-bundle/1',
      canonicalizationProfile: 'aoc-canonical-json/1',
    });
    expect(descriptor.present).toEqual({
      manifestArtifactKinds: [],
      manifestVersions: [],
      claimArtifactKinds: [],
      claimTypes: [],
      standingStatuses: [],
      semanticRequirements: [],
    });
  });

  it('DESCRIPTOR TEST 2 — the subject is preserved exactly, including its external reference', () => {
    const id = parseSovereignAssetId(mintSovereignAssetId());
    const subject: SovereignSubjectRef = {
      sovereignAssetId: id,
      externalReference: buildSovereignExternalReference({
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'future://provider-p1/object/92817',
      }),
    };
    const bundle = buildSovereigntyPortabilityBundleV1({ subject });

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    expect(descriptor.subject).toEqual(bundle.subject);
    expect(descriptor.subject.sovereignAssetId).toBe(id);
    // The locator travels verbatim and is never dereferenced or normalized.
    expect(descriptor.subject.externalReference?.locator).toBe('future://provider-p1/object/92817');
  });

  it('DESCRIPTOR TEST 3 — has no descriptorId: it describes, it is not a new sovereign object', () => {
    const { subject } = newSubject();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({ subject }),
    );

    expect(Object.keys(descriptor).sort()).toEqual([
      'mediaType',
      'present',
      'profile',
      'representation',
      'schemaVersion',
      'subject',
    ]);
    for (const field of ['descriptorId', 'id', 'bundleId', 'uuid']) {
      expect(descriptor).not.toHaveProperty(field);
    }
  });

  it('DESCRIPTOR TEST 4 — has no generated timestamp, so the same bundle always describes alike', () => {
    const { id, subject } = newSubject();
    const bundle = buildSovereigntyPortabilityBundleV1({
      subject,
      claims: [{ kind: 'claim', claim: originClaimFor(id) }],
    });

    const first = buildSovereigntyInteroperabilityDescriptorV1(bundle);
    const second = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    expect(canonicalizeJSON(first)).toBe(canonicalizeJSON(second));
    for (const field of ['describedAt', 'generatedAt', 'assessedAt', 'createdAt', 'timestamp']) {
      expect(canonicalizeJSON(first)).not.toContain(`"${field}"`);
    }
  });
});

describe('SM-07 / manifest semantics (DESCRIPTOR TESTS 5-7)', () => {
  it('DESCRIPTOR TEST 5 — an unsigned manifest is detected', () => {
    const { id, subject } = newSubject();
    const manifest = buildSovereignManifestV1({ sovereignAssetId: id, registrant: ISSUER });
    const bundle = buildSovereigntyPortabilityBundleV1({
      subject,
      manifests: [{ kind: 'manifest', manifest }],
    });

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(bundle);

    expect([...descriptor.present.manifestArtifactKinds]).toEqual(['manifest']);
    expect([...descriptor.present.claimArtifactKinds]).toEqual([]);
  });

  it('DESCRIPTOR TEST 6 — a signed manifest is detected, without any signature being checked', () => {
    const { id, subject } = newSubject();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const manifest = buildSovereignManifestV1({ sovereignAssetId: id, registrant: ISSUER });
    const signedManifest = signSovereignManifest(manifest, privateKeyPem, signingKey);

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        manifests: [{ kind: 'signed-manifest', signedManifest }],
      }),
    );

    expect([...descriptor.present.manifestArtifactKinds]).toEqual(['signed-manifest']);
    // "A signed manifest is present" is an interoperability fact. "The
    // signature is valid" would be a Verifiability one, and appears nowhere.
    const wire = canonicalizeJSON(descriptor);
    for (const forbidden of ['verified', 'signatureValid', 'proof', 'publicKey', 'signature']) {
      expect(wire).not.toContain(forbidden);
    }
  });

  it('DESCRIPTOR TEST 7 — historical manifest versions are reported, deduplicated and ascending', () => {
    const { id, subject } = newSubject();
    const manifests = [3, 1, 2].map((manifestVersion) => ({
      kind: 'manifest' as const,
      manifest: buildSovereignManifestV1({ sovereignAssetId: id, registrant: ISSUER, manifestVersion }),
    }));

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({ subject, manifests }),
    );

    expect([...descriptor.present.manifestVersions]).toEqual([1, 2, 3]);
    // These are the subject's historical record versions — not the manifest
    // schema version, the bundle schema version or the profile version, each of
    // which is a single value elsewhere in the document.
    expect(descriptor.representation.schemaVersion).toBe('aoc-sovereignty-portability-bundle/1');
    expect(descriptor.profile.version).toBe('1.0.0');
  });

  it('does not extract a manifest’s embedded claims as separate claim artifacts', () => {
    const { id, subject } = newSubject();
    const manifest = buildSovereignManifestV1({
      sovereignAssetId: id,
      registrant: ISSUER,
      originClaim: originClaimFor(id, 'claim:origin:embedded'),
      authorityClaims: [authorityClaimFor(id, 'claim:authorship:embedded')],
    });

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({ subject, manifests: [{ kind: 'manifest', manifest }] }),
    );

    // The manifest is present; the assertions inside it belong to it and are
    // not reported as separately presented claim artifacts.
    expect([...descriptor.present.manifestArtifactKinds]).toEqual(['manifest']);
    expect([...descriptor.present.claimArtifactKinds]).toEqual([]);
    expect([...descriptor.present.claimTypes]).toEqual([]);
  });
});

describe('SM-07 / claim and standing semantics (DESCRIPTOR TESTS 8-14)', () => {
  it('DESCRIPTOR TEST 8 — an unsigned claim wrapper is detected', () => {
    const { id, subject } = newSubject();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        claims: [{ kind: 'claim', claim: originClaimFor(id) }],
      }),
    );

    expect([...descriptor.present.claimArtifactKinds]).toEqual(['claim']);
  });

  it('DESCRIPTOR TEST 9 — a signed claim wrapper is detected, with its underlying type read', () => {
    const { id, subject } = newSubject();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const signedClaim = signClaim(derivationClaimFor(id), privateKeyPem, signingKey);

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({ subject, claims: [{ kind: 'signed-claim', signedClaim }] }),
    );

    // Wrapper kind and semantic type are independent facts, and both are
    // reported. Nothing states that the proof holds.
    expect([...descriptor.present.claimArtifactKinds]).toEqual(['signed-claim']);
    expect([...descriptor.present.claimTypes]).toEqual(['Derivation']);
  });

  it('DESCRIPTOR TEST 10 — Origin claim semantics are detected', () => {
    const { id, subject } = newSubject();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        claims: [{ kind: 'claim', claim: originClaimFor(id) }],
      }),
    );
    expect(descriptor.present.claimTypes).toContain('Origin');
  });

  it('DESCRIPTOR TEST 11 — Authorship claim semantics are detected', () => {
    const { id, subject } = newSubject();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        claims: [{ kind: 'claim', claim: authorityClaimFor(id) }],
      }),
    );
    expect(descriptor.present.claimTypes).toContain('Authorship');
  });

  it('DESCRIPTOR TEST 12 — Derivation claim semantics are detected', () => {
    const { id, subject } = newSubject();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        claims: [{ kind: 'claim', claim: derivationClaimFor(id) }],
      }),
    );
    expect(descriptor.present.claimTypes).toContain('Derivation');
  });

  it('DESCRIPTOR TEST 13 — a Contested standing status is detected, and not adjudicated', () => {
    const { id, subject } = newSubject();
    const claim = originClaimFor(id);
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        claims: [{ kind: 'claim', claim }],
        standings: [contestedStandingFor(claim.id)],
      }),
    );

    expect([...descriptor.present.standingStatuses]).toEqual(['Contested']);
    // Reported verbatim: nothing decides whether the contest is justified, and
    // no winner, weight or resolution appears.
    const wire = canonicalizeJSON(descriptor);
    for (const forbidden of ['upheld', 'rejected', 'resolved', 'winner', 'justified']) {
      expect(wire).not.toContain(forbidden);
    }
  });

  it('DESCRIPTOR TEST 14 — repeated presence collapses to one entry per feature', () => {
    const { id, subject } = newSubject();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const originA = originClaimFor(id, 'claim:origin:a');
    const originB = originClaimFor(id, 'claim:origin:b');
    const derivation = derivationClaimFor(id, 'claim:derivation:a');

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        manifests: [
          { kind: 'manifest', manifest: buildSovereignManifestV1({ sovereignAssetId: id, registrant: ISSUER }) },
          {
            kind: 'signed-manifest',
            signedManifest: signSovereignManifest(
              buildSovereignManifestV1({ sovereignAssetId: id, registrant: ISSUER, manifestVersion: 2 }),
              privateKeyPem,
              signingKey,
            ),
          },
        ],
        claims: [
          { kind: 'claim', claim: originA },
          { kind: 'claim', claim: originB },
          { kind: 'claim', claim: derivation },
        ],
        standings: [
          contestedStandingFor(originA.id, 'standing:a'),
          contestedStandingFor(originB.id, 'standing:b'),
        ],
      }),
    );

    expect([...descriptor.present.manifestArtifactKinds]).toEqual(['manifest', 'signed-manifest']);
    expect([...descriptor.present.claimArtifactKinds]).toEqual(['claim']);
    expect([...descriptor.present.claimTypes]).toEqual(['Derivation', 'Origin']);
    expect([...descriptor.present.standingStatuses]).toEqual(['Contested']);
    expect([...descriptor.present.manifestVersions]).toEqual([1, 2]);
  });

  it('reports a claim wrapper independently of the semantics it wraps', () => {
    const { id, subject } = newSubject();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        claims: [
          { kind: 'claim', claim: originClaimFor(id, 'claim:origin:unsigned') },
          {
            kind: 'signed-claim',
            signedClaim: signClaim(
              derivationClaimFor(id, 'claim:derivation:signed'),
              privateKeyPem,
              signingKey,
            ),
          },
        ],
      }),
    );

    expect([...descriptor.present.claimArtifactKinds]).toEqual(['claim', 'signed-claim']);
    expect([...descriptor.present.claimTypes]).toEqual(['Derivation', 'Origin']);
  });

  it('derives the complete present artifact-kind set, adding standing only when present', () => {
    const { id, subject } = newSubject();
    const claim = originClaimFor(id);

    const withStanding = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        manifests: [{ kind: 'manifest', manifest: buildSovereignManifestV1({ sovereignAssetId: id, registrant: ISSUER }) }],
        claims: [{ kind: 'claim', claim }],
        standings: [contestedStandingFor(claim.id)],
      }),
    );
    expect([...presentInteroperabilityArtifactKinds(withStanding)]).toEqual(['claim', 'manifest', 'standing']);

    const withoutStanding = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({ subject, claims: [{ kind: 'claim', claim }] }),
    );
    expect([...presentInteroperabilityArtifactKinds(withoutStanding)]).toEqual(['claim']);
  });
});

describe('SM-07 / semantic requirements (DESCRIPTOR TESTS 15-17)', () => {
  const refOf = (id: string, namespace: string, termRef: string): CanonicalSemanticRef => ({
    id,
    namespace,
    termRef,
  });

  it('DESCRIPTOR TEST 15 — semantic refs become namespace + termRef requirements', () => {
    const { id, subject } = newSubject();
    const claim = originClaimFor(id, 'claim:origin:1', [
      refOf('ref-a', 'example.external', 'example-term-1'),
    ]);

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({ subject, claims: [{ kind: 'claim', claim }] }),
    );

    expect([...descriptor.present.semanticRequirements]).toEqual([
      { namespace: 'example.external', termRef: 'example-term-1' },
    ]);
    // The occurrence id identifies the reference, not the concept, so it is not
    // carried into the requirement.
    expect(canonicalizeJSON(descriptor)).not.toContain('ref-a');
  });

  it('DESCRIPTOR TEST 16 — differently-identified refs to one concept deduplicate to one requirement', () => {
    const { id, subject } = newSubject();
    const refs = [
      refOf('ref-a', 'x', 't'),
      refOf('ref-b', 'x', 't'),
    ];
    const claim = originClaimFor(id, 'claim:origin:1', refs);

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({ subject, claims: [{ kind: 'claim', claim }] }),
    );

    expect([...descriptor.present.semanticRequirements]).toEqual([{ namespace: 'x', termRef: 't' }]);
    // The originals are untouched — nothing was deduplicated in place.
    expect(refs.map((ref) => ref.id)).toEqual(['ref-a', 'ref-b']);
    expect(claim.semanticRefs).toHaveLength(2);
  });

  it('DESCRIPTOR TEST 17 — requirements union across artifacts in a deterministic order', () => {
    const { id, subject } = newSubject();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();

    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        manifests: [
          {
            kind: 'manifest',
            manifest: buildSovereignManifestV1({
              sovereignAssetId: id,
              registrant: ISSUER,
              // Embedded manifest assertions contribute their concepts too:
              // understanding the manifest requires understanding them.
              originClaim: originClaimFor(id, 'claim:origin:embedded', [
                refOf('ref-embedded', 'zeta.namespace', 'embedded-term'),
              ]),
            }),
          },
        ],
        claims: [
          {
            kind: 'claim',
            claim: originClaimFor(id, 'claim:origin:1', [
              refOf('ref-1', 'beta.namespace', 'b-term'),
              refOf('ref-2', 'alpha.namespace', 'z-term'),
            ]),
          },
          {
            kind: 'signed-claim',
            signedClaim: signClaim(
              derivationClaimFor(id, 'claim:derivation:1', [
                refOf('ref-3', 'alpha.namespace', 'a-term'),
                // A duplicate of a concept already required by another claim.
                refOf('ref-4', 'beta.namespace', 'b-term'),
              ]),
              privateKeyPem,
              signingKey,
            ),
          },
        ],
      }),
    );

    // Namespace first, then term. Union, not concatenation.
    expect([...descriptor.present.semanticRequirements]).toEqual([
      { namespace: 'alpha.namespace', termRef: 'a-term' },
      { namespace: 'alpha.namespace', termRef: 'z-term' },
      { namespace: 'beta.namespace', termRef: 'b-term' },
      { namespace: 'zeta.namespace', termRef: 'embedded-term' },
    ]);
  });

  it('invents no requirement when a representation carries no semantic refs', () => {
    const { id, subject } = newSubject();
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        claims: [{ kind: 'claim', claim: originClaimFor(id) }],
      }),
    );
    expect([...descriptor.present.semanticRequirements]).toEqual([]);
  });
});

describe('SM-07 / descriptor integrity of process (DESCRIPTOR TESTS 18-20)', () => {
  const richBundle = (): SovereigntyPortabilityBundleV1 => {
    const { id, subject } = newSubject();
    const claim = originClaimFor(id, 'claim:origin:1', [
      { id: 'ref-a', namespace: 'example.external', termRef: 'example-term-1' },
    ]);
    return buildSovereigntyPortabilityBundleV1({
      subject,
      manifests: [{ kind: 'manifest', manifest: buildSovereignManifestV1({ sovereignAssetId: id, registrant: ISSUER }) }],
      claims: [
        { kind: 'claim', claim },
        { kind: 'claim', claim: derivationClaimFor(id) },
      ],
      standings: [contestedStandingFor(claim.id)],
    });
  };

  it('DESCRIPTOR TEST 18 — the input bundle is not mutated', () => {
    const bundle = richBundle();
    const before = canonicalizeJSON(bundle);

    buildSovereigntyInteroperabilityDescriptorV1(bundle);
    buildSovereigntyInteroperabilityDescriptorV1(bundle);

    expect(canonicalizeJSON(bundle)).toBe(before);
  });

  it('DESCRIPTOR TEST 19 — the descriptor is JSON-safe and canonicalizable', () => {
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(richBundle());
    const wire = canonicalizeJSON(descriptor);

    expect(JSON.parse(wire)).toEqual(JSON.parse(JSON.stringify(descriptor)));
    expect(canonicalizeJSON(JSON.parse(wire))).toBe(wire);
    expect(isValidSovereigntyInteroperabilityDescriptorV1(JSON.parse(wire))).toBe(true);
  });

  it('DESCRIPTOR TEST 20 — an invalid bundle is rejected rather than partially described', () => {
    const { subject } = newSubject();
    const valid = buildSovereigntyPortabilityBundleV1({ subject });

    for (const broken of [
      null,
      {},
      { ...valid, schemaVersion: 'aoc-sovereignty-portability-bundle/999' },
      { ...valid, canonicalizationProfile: 'other-json/1' },
      { ...valid, subject: { sovereignAssetId: 'not-a-sovereign-asset-id' } },
      { ...valid, manifests: [{ kind: 'unknown-kind', manifest: {} }] },
    ]) {
      const result = tryBuildSovereigntyInteroperabilityDescriptorV1(
        broken as unknown as SovereigntyPortabilityBundleV1,
      );
      expect(result.valid).toBe(false);
      expect(result.valid === false && result.reasons).toEqual([
        SOVEREIGNTY_INTEROPERABILITY_REASON_CODES.invalidBundle,
      ]);
    }

    expect(() =>
      buildSovereigntyInteroperabilityDescriptorV1(null as unknown as SovereigntyPortabilityBundleV1),
    ).toThrow(/INTEROPERABILITY_INVALID_BUNDLE/);
  });

  it('rejects a malformed descriptor at the external boundary rather than trusting a cast', () => {
    const descriptor = buildSovereigntyInteroperabilityDescriptorV1(richBundle());
    expect(isValidSovereigntyInteroperabilityDescriptorV1(descriptor)).toBe(true);

    for (const broken of [
      null,
      'not an object',
      { ...descriptor, schemaVersion: 'aoc-sovereignty-interoperability-descriptor/2' },
      { ...descriptor, profile: { id: descriptor.profile.id } },
      { ...descriptor, mediaType: '   ' },
      { ...descriptor, subject: { sovereignAssetId: 'nope' } },
      { ...descriptor, extra: true },
      { ...descriptor, present: { ...descriptor.present, claimTypes: ['Governance'] } },
      { ...descriptor, present: { ...descriptor.present, claimTypes: ['Origin', 'Origin'] } },
      { ...descriptor, present: { ...descriptor.present, standingStatuses: ['NotAStatus'] } },
      { ...descriptor, present: { ...descriptor.present, manifestVersions: [1.5] } },
      {
        ...descriptor,
        present: {
          ...descriptor.present,
          semanticRequirements: [{ namespace: 'x', termRef: 't', id: 'ref-a' }],
        },
      },
      {
        ...descriptor,
        present: {
          ...descriptor.present,
          semanticRequirements: [
            { namespace: 'x', termRef: 't' },
            { namespace: 'x', termRef: 't' },
          ],
        },
      },
    ]) {
      expect(isValidSovereigntyInteroperabilityDescriptorV1(broken)).toBe(false);
    }
  });
});
