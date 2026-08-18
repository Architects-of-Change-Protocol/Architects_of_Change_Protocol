import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import type { CanonicalSemanticRef, CanonicalStanding } from '@aoc/protocol/claims';
import { mintSovereignAssetId, parseSovereignAssetId } from '@aoc/protocol/identity';
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
import { buildSovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import type {
  PortableSovereignClaimArtifact,
  PortableSovereignManifestArtifact,
} from '@aoc/protocol/portability';
import {
  INTEROPERABLE_CLAIM_TYPES,
  INTEROPERABLE_STANDING_STATUSES,
  SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS,
  SOVEREIGNTY_INTEROPERABILITY_COMPATIBILITY_STATUSES,
  SOVEREIGNTY_INTEROPERABILITY_REASON_CODES,
  SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION,
  SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION,
  assessSovereigntyInteroperabilityCompatibility,
  buildSovereigntyInteroperabilityConsumerSupportV1,
  buildSovereigntyInteroperabilityDescriptorV1,
  isValidSovereigntyInteroperabilityConsumerSupportV1,
  validateSovereigntyInteroperabilityConsumerSupportV1,
} from '@aoc/protocol/interoperability';
import type {
  SovereigntyInteroperabilityConsumerSupportV1,
  SovereigntyInteroperabilityDescriptorV1,
} from '@aoc/protocol/interoperability';

const ISSUER = 'principal:sm07-issuer';
const AT = '2026-04-01T09:00:00.000Z';
const CODES = SOVEREIGNTY_INTEROPERABILITY_REASON_CODES;

const { signingKey, privateKeyPem } = generateSovereignKeyPair();

interface Fixture {
  readonly id: SovereignAssetId;
  readonly subject: SovereignSubjectRef;
  readonly descriptor: SovereigntyInteroperabilityDescriptorV1;
}

const externalRef: CanonicalSemanticRef = {
  id: 'ref-a',
  namespace: 'example.external',
  termRef: 'example-term-1',
};

/**
 * The mandatory empirical bundle: an Origin claim, a Derivation claim and a
 * Contested standing over the origin, plus a manifest.
 */
const buildFixture = (options: { readonly semanticRefs?: readonly CanonicalSemanticRef[] } = {}): Fixture => {
  const id = parseSovereignAssetId(mintSovereignAssetId());
  const subject: SovereignSubjectRef = { sovereignAssetId: id };

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

  const claims: readonly PortableSovereignClaimArtifact[] = [
    {
      kind: 'claim',
      claim: options.semanticRefs === undefined ? origin : { ...origin, semanticRefs: options.semanticRefs },
    },
    { kind: 'claim', claim: derivation },
  ];
  const manifests: readonly PortableSovereignManifestArtifact[] = [
    { kind: 'manifest', manifest: buildSovereignManifestV1({ sovereignAssetId: id, registrant: ISSUER }) },
  ];
  const standings: readonly CanonicalStanding[] = [
    { id: 'standing:1', claimRef: origin.id, status: StandingStatus.Contested, effectiveAt: AT },
  ];

  return {
    id,
    subject,
    descriptor: buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({ subject, manifests, claims, standings }),
    ),
  };
};

/**
 * An AOC-native consumer that understands the whole current profile.
 *
 * A convenient canonical fixture, not a statement that every system supports
 * this. Real consumers declare exactly what they understand.
 */
const fullSupportFor = (
  descriptor: SovereigntyInteroperabilityDescriptorV1,
  overrides: Partial<{
    profileId: string;
    acceptedVersions: readonly string[];
    mediaTypes: readonly string[];
    representationSchemaVersions: readonly string[];
    canonicalizationProfiles: readonly string[];
    artifactKinds: readonly (typeof SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS)[number][];
    claimTypes: readonly (typeof INTEROPERABLE_CLAIM_TYPES)[number][];
    standingStatuses: readonly StandingStatus[];
    semanticTerms: readonly { namespace: string; termRef: string }[];
  }> = {},
): SovereigntyInteroperabilityConsumerSupportV1 =>
  buildSovereigntyInteroperabilityConsumerSupportV1({
    profile: {
      id: overrides.profileId ?? descriptor.profile.id,
      acceptedVersions: overrides.acceptedVersions ?? [descriptor.profile.version],
    },
    mediaTypes: overrides.mediaTypes ?? [descriptor.mediaType],
    representationSchemaVersions:
      overrides.representationSchemaVersions ?? [descriptor.representation.schemaVersion],
    canonicalizationProfiles:
      overrides.canonicalizationProfiles ?? [descriptor.representation.canonicalizationProfile],
    artifactKinds: overrides.artifactKinds ?? [...SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS],
    claimTypes: overrides.claimTypes ?? [...INTEROPERABLE_CLAIM_TYPES],
    standingStatuses: overrides.standingStatuses ?? [...INTEROPERABLE_STANDING_STATUSES],
    semanticTerms: overrides.semanticTerms ?? [...descriptor.present.semanticRequirements],
  });

describe('SM-07 / the consumer support declaration (SUPPORT TESTS 1-12)', () => {
  const { descriptor } = buildFixture();
  const valid = fullSupportFor(descriptor);

  it('SUPPORT TEST 1 — a valid full support document is accepted', () => {
    expect(isValidSovereigntyInteroperabilityConsumerSupportV1(valid)).toBe(true);
    expect(valid.schemaVersion).toBe('aoc-sovereignty-interoperability-support/1');
    expect(valid.schemaVersion).toBe(SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION);
    // No consumer identity is required, or even accepted.
    expect(Object.keys(valid).sort()).toEqual([
      'artifactKinds',
      'canonicalizationProfiles',
      'claimTypes',
      'mediaTypes',
      'profile',
      'representationSchemaVersions',
      'schemaVersion',
      'semanticTerms',
      'standingStatuses',
    ]);
    for (const field of ['consumerId', 'application', 'tenant', 'company', 'user', 'userAgent']) {
      expect(valid).not.toHaveProperty(field);
    }
  });

  const rejects = (broken: unknown): void => {
    const result = validateSovereigntyInteroperabilityConsumerSupportV1(broken);
    expect(result.valid).toBe(false);
    expect(result.reasons).toEqual([CODES.invalidConsumerSupport]);
  };

  it('SUPPORT TEST 2 — an unknown schema version is rejected, never best-effort read', () => {
    rejects({ ...valid, schemaVersion: 'aoc-sovereignty-interoperability-support/2' });
    rejects({ ...valid, schemaVersion: undefined });
    rejects(null);
    rejects('not an object');
    rejects({ ...valid, extra: true });
  });

  it('SUPPORT TEST 3 — a blank profile id is rejected', () => {
    rejects({ ...valid, profile: { ...valid.profile, id: '' } });
    rejects({ ...valid, profile: { ...valid.profile, id: '   ' } });
    rejects({ ...valid, profile: { acceptedVersions: valid.profile.acceptedVersions } });
  });

  it('SUPPORT TEST 4 — malformed accepted versions are rejected', () => {
    rejects({ ...valid, profile: { ...valid.profile, acceptedVersions: [] } });
    rejects({ ...valid, profile: { ...valid.profile, acceptedVersions: '1.0.0' } });
    rejects({ ...valid, profile: { ...valid.profile, acceptedVersions: ['1.0.0', ''] } });
    rejects({ ...valid, profile: { ...valid.profile, acceptedVersions: [1] } });
  });

  it('SUPPORT TEST 5 — an invalid media type entry is rejected', () => {
    rejects({ ...valid, mediaTypes: [''] });
    rejects({ ...valid, mediaTypes: 'application/json' });
    rejects({ ...valid, mediaTypes: [null] });
  });

  it('SUPPORT TEST 6 — an unknown artifact kind is rejected, not ignored', () => {
    rejects({ ...valid, artifactKinds: ['manifest', 'sealed-manifest'] });
    rejects({ ...valid, artifactKinds: ['Manifest'] });
  });

  it('SUPPORT TEST 7 — an unknown claim type is rejected', () => {
    // A real `ClaimType` that this profile version cannot describe is still not
    // declarable: the two parties would disagree about the vocabulary.
    rejects({ ...valid, claimTypes: ['Governance'] });
    rejects({ ...valid, claimTypes: ['Custom'] });
    rejects({ ...valid, claimTypes: ['origin'] });
  });

  it('SUPPORT TEST 8 — an unknown standing status is rejected', () => {
    rejects({ ...valid, standingStatuses: ['Disputed'] });
    rejects({ ...valid, standingStatuses: ['contested'] });
  });

  it('SUPPORT TEST 9 — a malformed semantic requirement is rejected', () => {
    rejects({ ...valid, semanticTerms: [{ namespace: 'x' }] });
    rejects({ ...valid, semanticTerms: [{ namespace: 'x', termRef: '' }] });
    // A `CanonicalSemanticRef` is not a requirement: the occurrence id has no
    // place in a statement about which concepts are understood.
    rejects({ ...valid, semanticTerms: [{ id: 'ref-a', namespace: 'x', termRef: 't' }] });
    rejects({ ...valid, semanticTerms: [null] });
  });

  it('SUPPORT TEST 10 — validating does not mutate the declaration', () => {
    const supplied = {
      ...valid,
      artifactKinds: ['standing', 'manifest', 'claim'],
      claimTypes: ['Origin'],
    };
    const before = JSON.stringify(supplied);

    validateSovereigntyInteroperabilityConsumerSupportV1(supplied);

    // Not sorted in place, not deduplicated in place, nothing inserted.
    expect(JSON.stringify(supplied)).toBe(before);
    expect(supplied.artifactKinds).toEqual(['standing', 'manifest', 'claim']);
  });

  it('SUPPORT TEST 11 — sparse arrays are rejected', () => {
    const sparseKinds = ['manifest'];
    sparseKinds[3] = 'claim';
    rejects({ ...valid, artifactKinds: sparseKinds });

    const sparseMediaTypes = [];
    sparseMediaTypes[2] = 'application/vnd.aoc.sovereignty-portability+json';
    rejects({ ...valid, mediaTypes: sparseMediaTypes });
  });

  it('SUPPORT TEST 12 — duplicate declarations are rejected, per the documented contract', () => {
    // Ambiguous input fails closed rather than being silently deduplicated: a
    // repeated entry usually means two lists were concatenated, and Protocol
    // cannot tell which one the author meant.
    rejects({ ...valid, artifactKinds: ['claim', 'claim'] });
    rejects({ ...valid, claimTypes: ['Origin', 'Origin'] });
    rejects({ ...valid, standingStatuses: ['Contested', 'Contested'] });
    rejects({ ...valid, mediaTypes: [valid.mediaTypes[0], valid.mediaTypes[0]] });
    rejects({ ...valid, profile: { ...valid.profile, acceptedVersions: ['1.0.0', '1.0.0'] } });
    rejects({
      ...valid,
      semanticTerms: [
        { namespace: 'x', termRef: 't' },
        { namespace: 'x', termRef: 't' },
      ],
    });

    // The builder is where a caller normalizes their *own* input, before it
    // becomes a contract.
    const built = buildSovereigntyInteroperabilityConsumerSupportV1({
      profile: { id: descriptor.profile.id, acceptedVersions: ['1.0.0', '1.0.0'] },
      mediaTypes: [descriptor.mediaType, descriptor.mediaType],
      representationSchemaVersions: [descriptor.representation.schemaVersion],
      canonicalizationProfiles: [descriptor.representation.canonicalizationProfile],
      artifactKinds: ['standing', 'claim', 'claim'],
      claimTypes: ['Origin', 'Origin'],
      standingStatuses: [StandingStatus.Contested],
    });
    expect([...built.artifactKinds]).toEqual(['claim', 'standing']);
    expect([...built.profile.acceptedVersions]).toEqual(['1.0.0']);
    expect(isValidSovereigntyInteroperabilityConsumerSupportV1(built)).toBe(true);
  });

  it('does not fetch, discover or infer support from anything', () => {
    // Support is caller input. There is no argument by which a URL, a DID, a
    // header or a package name could enter this contract.
    expect(Object.keys(valid)).not.toContain('discoveryUrl');
    expect(Object.keys(valid)).not.toContain('wellKnown');
    expect(canonicalizeJSON(valid)).not.toContain('http');
  });
});

describe('SM-07 / core compatibility (COMPAT TESTS 1-5)', () => {
  const { descriptor } = buildFixture();

  it('COMPAT TEST 1 — a consumer supporting everything present is compatible', () => {
    const report = assessSovereigntyInteroperabilityCompatibility(descriptor, fullSupportFor(descriptor));

    expect(report.schemaVersion).toBe('aoc-sovereignty-interoperability-report/1');
    expect(report.schemaVersion).toBe(SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION);
    expect(report.status).toBe('compatible');
    expect(report.core).toEqual({
      profile: true,
      mediaType: true,
      representationSchema: true,
      canonicalizationProfile: true,
    });
    expect(report.reasonCodes).toEqual([]);
  });

  it('COMPAT TEST 2 — an unsupported profile is core incompatible, with no closest version chosen', () => {
    const wrongId = assessSovereigntyInteroperabilityCompatibility(
      descriptor,
      fullSupportFor(descriptor, { profileId: 'aoc:interoperability-profile:something-else' }),
    );
    expect(wrongId.status).toBe('incompatible');
    expect(wrongId.core.profile).toBe(false);
    expect(wrongId.reasonCodes).toContain(CODES.unsupportedProfile);

    // COMPAT: a consumer that speaks 2.0.0 is not assumed to speak 1.0.0.
    const wrongVersion = assessSovereigntyInteroperabilityCompatibility(
      descriptor,
      fullSupportFor(descriptor, { acceptedVersions: ['2.0.0'] }),
    );
    expect(wrongVersion.status).toBe('incompatible');
    expect(wrongVersion.core.profile).toBe(false);
    expect(wrongVersion.reasonCodes).toContain(CODES.unsupportedProfile);
  });

  it('COMPAT TEST 3 — an unsupported media type is core incompatible', () => {
    // Generic JSON support is never read as semantic support.
    const report = assessSovereigntyInteroperabilityCompatibility(
      descriptor,
      fullSupportFor(descriptor, { mediaTypes: ['application/json'] }),
    );

    expect(report.status).toBe('incompatible');
    expect(report.core.mediaType).toBe(false);
    expect(report.reasonCodes).toContain(CODES.unsupportedMediaType);
  });

  it('COMPAT TEST 4 — an unsupported bundle schema is core incompatible', () => {
    const report = assessSovereigntyInteroperabilityCompatibility(
      descriptor,
      fullSupportFor(descriptor, {
        representationSchemaVersions: ['aoc-sovereignty-portability-bundle/2'],
      }),
    );

    expect(report.status).toBe('incompatible');
    expect(report.core.representationSchema).toBe(false);
    expect(report.reasonCodes).toContain(CODES.unsupportedRepresentationSchema);
  });

  it('COMPAT TEST 5 — an unsupported canonicalization profile is core incompatible', () => {
    const report = assessSovereigntyInteroperabilityCompatibility(
      descriptor,
      fullSupportFor(descriptor, { canonicalizationProfiles: ['rfc8785-jcs'] }),
    );

    expect(report.status).toBe('incompatible');
    expect(report.core.canonicalizationProfile).toBe(false);
    expect(report.reasonCodes).toContain(CODES.unsupportedCanonicalizationProfile);
  });

  it('still explains the feature gaps of a core-incompatible representation', () => {
    const report = assessSovereigntyInteroperabilityCompatibility(
      descriptor,
      fullSupportFor(descriptor, { mediaTypes: ['application/json'], claimTypes: ['Origin'] }),
    );

    expect(report.status).toBe('incompatible');
    expect([...report.unsupportedClaimTypes]).toEqual(['Derivation']);
    expect(report.reasonCodes).toContain(CODES.unsupportedMediaType);
    expect(report.reasonCodes).toContain(CODES.unsupportedClaimType);
  });
});

describe('SM-07 / feature compatibility (COMPAT TESTS 6-14)', () => {
  const { id, subject } = ((): { id: SovereignAssetId; subject: SovereignSubjectRef } => {
    const assetId = parseSovereignAssetId(mintSovereignAssetId());
    return { id: assetId, subject: { sovereignAssetId: assetId } };
  })();

  const origin = buildOriginClaim({
    id: 'claim:origin:1',
    sovereignAssetId: id,
    issuer: ISSUER,
    assertedOrigin: 'sm07-origin',
    assertedAt: AT,
  });
  const authorship = buildAuthorityClaim({
    id: 'claim:authorship:1',
    sovereignAssetId: id,
    issuer: ISSUER,
    kind: 'Authorship',
    statement: 'issuer asserts authorship',
    issuedAt: AT,
  });
  const derivation = buildDerivationClaim({
    id: 'claim:derivation:1',
    sovereignAssetId: id,
    issuer: ISSUER,
    sourceSovereignAssetIds: [parseSovereignAssetId(mintSovereignAssetId())],
    relation: 'DerivedFrom',
    issuedAt: AT,
  });

  const everythingDescriptor = buildSovereigntyInteroperabilityDescriptorV1(
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
        { kind: 'claim', claim: { ...origin, semanticRefs: [externalRef] } },
        { kind: 'claim', claim: authorship },
        { kind: 'signed-claim', signedClaim: signClaim(derivation, privateKeyPem, signingKey) },
      ],
      standings: [
        { id: 'standing:1', claimRef: origin.id, status: StandingStatus.Contested, effectiveAt: AT },
      ],
    }),
  );

  const partialWith = (
    overrides: Parameters<typeof fullSupportFor>[1],
  ): ReturnType<typeof assessSovereigntyInteroperabilityCompatibility> =>
    assessSovereigntyInteroperabilityCompatibility(
      everythingDescriptor,
      fullSupportFor(everythingDescriptor, overrides),
    );

  it('COMPAT TEST 6 — missing unsigned-manifest support is a feature gap, not core failure', () => {
    const report = partialWith({
      artifactKinds: ['claim', 'signed-claim', 'signed-manifest', 'standing'],
    });

    expect(report.status).toBe('partially-compatible');
    expect([...report.unsupportedArtifactKinds]).toEqual(['manifest']);
    expect(report.core).toEqual({
      profile: true,
      mediaType: true,
      representationSchema: true,
      canonicalizationProfile: true,
    });
  });

  it('COMPAT TEST 7 — missing signed-manifest support is partial, and says nothing about validity', () => {
    const report = partialWith({ artifactKinds: ['claim', 'manifest', 'signed-claim', 'standing'] });

    expect(report.status).toBe('partially-compatible');
    expect([...report.unsupportedArtifactKinds]).toEqual(['signed-manifest']);
    // "I do not understand that wrapper" is not "that signature is invalid".
    expect(canonicalizeJSON(report)).not.toContain('invalid');
  });

  it('COMPAT TEST 8 — missing unsigned-claim support is partial', () => {
    const report = partialWith({
      artifactKinds: ['manifest', 'signed-claim', 'signed-manifest', 'standing'],
    });
    expect(report.status).toBe('partially-compatible');
    expect([...report.unsupportedArtifactKinds]).toEqual(['claim']);
  });

  it('COMPAT TEST 9 — missing signed-claim support is partial', () => {
    const report = partialWith({ artifactKinds: ['claim', 'manifest', 'signed-manifest', 'standing'] });
    expect(report.status).toBe('partially-compatible');
    expect([...report.unsupportedArtifactKinds]).toEqual(['signed-claim']);
  });

  it('COMPAT TEST 10 — missing Origin support is partial', () => {
    const report = partialWith({ claimTypes: ['Authorship', 'Derivation'] });
    expect(report.status).toBe('partially-compatible');
    expect([...report.unsupportedClaimTypes]).toEqual(['Origin']);
    expect(report.reasonCodes).toContain(CODES.unsupportedClaimType);
  });

  it('COMPAT TEST 11 — missing Authorship support is partial', () => {
    const report = partialWith({ claimTypes: ['Derivation', 'Origin'] });
    expect(report.status).toBe('partially-compatible');
    expect([...report.unsupportedClaimTypes]).toEqual(['Authorship']);
  });

  it('COMPAT TEST 12 — missing Derivation support is partial, and Derivation is not translated away', () => {
    const report = partialWith({ claimTypes: ['Authorship', 'Origin'] });

    expect(report.status).toBe('partially-compatible');
    expect([...report.unsupportedClaimTypes]).toEqual(['Derivation']);
    // Never rewritten into `Custom`, and never discarded.
    expect(canonicalizeJSON(report)).not.toContain('Custom');
    expect(everythingDescriptor.present.claimTypes).toContain('Derivation');
  });

  it('COMPAT TEST 13 — missing standing-status support is partial, with no status translation', () => {
    const report = partialWith({
      standingStatuses: INTEROPERABLE_STANDING_STATUSES.filter(
        (status) => status !== StandingStatus.Contested,
      ),
    });

    expect(report.status).toBe('partially-compatible');
    expect([...report.unsupportedStandingStatuses]).toEqual(['Contested']);
    expect(report.reasonCodes).toContain(CODES.unsupportedStandingStatus);
    // The consumer understands standing records in general, so `standing` is
    // not also reported as an unsupported artifact kind.
    expect([...report.unsupportedArtifactKinds]).toEqual([]);
  });

  it('COMPAT TEST 14 — a missing semantic concept is partial, and the bundle is not rejected', () => {
    const report = partialWith({ semanticTerms: [] });

    expect(report.status).toBe('partially-compatible');
    expect([...report.unsupportedSemanticTerms]).toEqual([
      { namespace: 'example.external', termRef: 'example-term-1' },
    ]);
    expect(report.reasonCodes).toContain(CODES.unsupportedSemanticTerm);

    // Concept identity, not occurrence identity: a consumer declaring the same
    // concept under a different ref id is fully supported.
    const byConcept = partialWith({
      semanticTerms: [{ namespace: 'example.external', termRef: 'example-term-1' }],
    });
    expect(byConcept.status).toBe('compatible');
  });

  it('reports a consumer that understands no standing records at all at the artifact level', () => {
    const report = partialWith({
      artifactKinds: ['claim', 'manifest', 'signed-claim', 'signed-manifest'],
      standingStatuses: [],
    });

    expect(report.status).toBe('partially-compatible');
    expect([...report.unsupportedArtifactKinds]).toEqual(['standing']);
    expect([...report.unsupportedStandingStatuses]).toEqual(['Contested']);
  });

  it('satisfies the semantic dimension when a representation requires no concepts', () => {
    const bare = buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({ subject, claims: [{ kind: 'claim', claim: origin }] }),
    );
    const report = assessSovereigntyInteroperabilityCompatibility(
      bare,
      fullSupportFor(bare, { semanticTerms: [] }),
    );

    expect(bare.present.semanticRequirements).toEqual([]);
    expect(report.status).toBe('compatible');
    expect(report.unsupportedSemanticTerms).toEqual([]);
  });
});

describe('SM-07 / report determinism and non-interference (COMPAT TESTS 15-20)', () => {
  const { descriptor } = buildFixture({ semanticRefs: [externalRef] });

  it('COMPAT TEST 15 — every missing-feature array is deterministically ordered', () => {
    const report = assessSovereigntyInteroperabilityCompatibility(
      descriptor,
      fullSupportFor(descriptor, {
        artifactKinds: [],
        claimTypes: [],
        standingStatuses: [],
        semanticTerms: [],
        mediaTypes: ['application/json'],
      }),
    );

    expect([...report.unsupportedArtifactKinds]).toEqual(['claim', 'manifest', 'standing']);
    expect([...report.unsupportedClaimTypes]).toEqual(['Derivation', 'Origin']);
    expect([...report.unsupportedStandingStatuses]).toEqual(['Contested']);
    // Reason codes are explicitly sorted, never left to Set iteration order.
    expect([...report.reasonCodes]).toEqual([...report.reasonCodes].sort());
    expect([...report.reasonCodes]).toEqual([
      CODES.unsupportedArtifactKind,
      CODES.unsupportedClaimType,
      CODES.unsupportedMediaType,
      CODES.unsupportedSemanticTerm,
      CODES.unsupportedStandingStatus,
    ].sort());
  });

  it('COMPAT TEST 16 — a fully supported representation yields empty arrays, not omitted fields', () => {
    const report = assessSovereigntyInteroperabilityCompatibility(descriptor, fullSupportFor(descriptor));

    expect(report.status).toBe('compatible');
    expect(report.unsupportedArtifactKinds).toEqual([]);
    expect(report.unsupportedClaimTypes).toEqual([]);
    expect(report.unsupportedStandingStatuses).toEqual([]);
    expect(report.unsupportedSemanticTerms).toEqual([]);
    expect(report.reasonCodes).toEqual([]);
  });

  it('COMPAT TEST 17 — the same descriptor and support always produce the same report', () => {
    const support = fullSupportFor(descriptor, { claimTypes: ['Origin'] });

    const first = assessSovereigntyInteroperabilityCompatibility(descriptor, support);
    const second = assessSovereigntyInteroperabilityCompatibility(descriptor, support);

    expect(canonicalizeJSON(first)).toBe(canonicalizeJSON(second));
    const wire = canonicalizeJSON(first);
    for (const field of ['reportId', 'assessedAt', 'generatedAt', 'timestamp', 'score', 'confidence']) {
      expect(wire).not.toContain(`"${field}"`);
    }
    expect(wire).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
  });

  it('COMPAT TEST 18 — the descriptor is unchanged by an assessment', () => {
    const before = canonicalizeJSON(descriptor);
    assessSovereigntyInteroperabilityCompatibility(descriptor, fullSupportFor(descriptor, { claimTypes: [] }));
    expect(canonicalizeJSON(descriptor)).toBe(before);
  });

  it('COMPAT TEST 19 — the support declaration is unchanged by an assessment', () => {
    const support = fullSupportFor(descriptor, { claimTypes: ['Origin'] });
    const before = canonicalizeJSON(support);
    assessSovereigntyInteroperabilityCompatibility(descriptor, support);
    expect(canonicalizeJSON(support)).toBe(before);
  });

  it('COMPAT TEST 20 — no projection, downgrade or reduced representation is produced', () => {
    const report = assessSovereigntyInteroperabilityCompatibility(
      descriptor,
      fullSupportFor(descriptor, { claimTypes: ['Origin'] }),
    );

    expect(report.status).toBe('partially-compatible');
    // The report carries an explanation and nothing that resembles a bundle.
    expect(Object.keys(report).sort()).toEqual([
      'core',
      'reasonCodes',
      'schemaVersion',
      'status',
      'unsupportedArtifactKinds',
      'unsupportedClaimTypes',
      'unsupportedSemanticTerms',
      'unsupportedStandingStatuses',
    ]);
    for (const field of [
      'projectedBundle', 'reducedBundle', 'supportedSubset', 'downgraded', 'bundle', 'manifests', 'claims',
      'standings', 'dropped', 'removed',
    ]) {
      expect(report).not.toHaveProperty(field);
      expect(canonicalizeJSON(report)).not.toContain(`"${field}"`);
    }
  });

  it('exposes exactly three enumerated statuses, and never a score', () => {
    expect([...SOVEREIGNTY_INTEROPERABILITY_COMPATIBILITY_STATUSES]).toEqual([
      'compatible',
      'partially-compatible',
      'incompatible',
    ]);
    const report = assessSovereigntyInteroperabilityCompatibility(descriptor, fullSupportFor(descriptor));
    expect(SOVEREIGNTY_INTEROPERABILITY_COMPATIBILITY_STATUSES).toContain(report.status);
    // No allow/deny language: a compatibility result is not an authorization
    // outcome and not a trust judgement.
    const wire = canonicalizeJSON(report);
    for (const banned of ['allow', 'deny', 'approve', 'reject', 'grant', 'enforce', 'trust', 'reputation']) {
      expect(wire.toLowerCase()).not.toContain(banned);
    }
  });

  it('is JSON-safe and canonicalizes without a Map or Set in the wire shape', () => {
    const report = assessSovereigntyInteroperabilityCompatibility(
      descriptor,
      fullSupportFor(descriptor, { claimTypes: ['Origin'] }),
    );
    const wire = canonicalizeJSON(report);
    expect(JSON.parse(wire)).toEqual(JSON.parse(JSON.stringify(report)));
    expect(canonicalizeJSON(JSON.parse(wire))).toBe(wire);
  });
});
