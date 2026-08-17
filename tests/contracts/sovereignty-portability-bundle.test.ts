import { CANONICAL_JSON_PROFILE, canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import type { CanonicalStanding } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  computeContentIdentity,
  mintSovereignAssetId,
} from '@aoc/protocol/identity';
import type { SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  AuthorityClaimKind,
  DerivationRelationKind,
  buildAuthorityClaim,
  buildDerivationClaim,
  buildOriginClaim,
  buildSovereignManifestV1,
  generateSovereignKeyPair,
  signClaim,
  signSovereignManifest,
} from '@aoc/protocol/manifest';
import type { AuthorityClaim, DerivationClaim, OriginClaim } from '@aoc/protocol/manifest';
import {
  PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS,
  PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS,
  SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
  SOVEREIGNTY_PORTABILITY_REASON_CODES,
  buildSovereigntyPortabilityBundleV1,
  isValidSovereigntyPortabilityBundleV1,
  portableClaimOf,
  portableManifestOf,
  tryBuildSovereigntyPortabilityBundleV1,
  validateSovereigntyPortabilityBundleV1,
} from '@aoc/protocol/portability';
import type {
  PortableSovereignClaimArtifact,
  PortableUnsignedSovereignManifestArtifact,
} from '@aoc/protocol/portability';

const CODES = SOVEREIGNTY_PORTABILITY_REASON_CODES;
const ISSUER = 'principal:sm06-issuer';
const AT = '2026-03-01T09:00:00.000Z';

const subjectOf = (
  sovereignAssetId: SovereignAssetId,
  externalReference?: { namespace: string; id: string; locator?: string },
): SovereignSubjectRef => ({
  sovereignAssetId,
  ...(externalReference === undefined
    ? {}
    : { externalReference: buildSovereignExternalReference(externalReference) }),
});

const manifestFor = (
  sovereignAssetId: SovereignAssetId,
  options: { manifestVersion?: number; locator?: string } = {},
): PortableUnsignedSovereignManifestArtifact => ({
  kind: 'manifest',
  manifest: buildSovereignManifestV1({
    sovereignAssetId,
    manifestVersion: options.manifestVersion ?? 1,
    registrant: 'principal:sm06-registrant',
    ...(options.locator === undefined
      ? {}
      : {
          externalReference: buildSovereignExternalReference({
            namespace: 'alien-system-v47',
            id: 'alien-resource-92817',
            locator: options.locator,
          }),
        }),
    createdAt: AT,
  }),
});

const originFor = (sovereignAssetId: SovereignAssetId, id: string): OriginClaim =>
  buildOriginClaim({ id, sovereignAssetId, issuer: ISSUER, assertedOrigin: 'field-recording-2019', assertedAt: AT });

const authorityFor = (sovereignAssetId: SovereignAssetId, id: string): AuthorityClaim =>
  buildAuthorityClaim({
    id,
    sovereignAssetId,
    issuer: ISSUER,
    kind: AuthorityClaimKind.Authorship,
    statement: 'Authored by the issuer',
    issuedAt: AT,
  });

const derivationFor = (
  sovereignAssetId: SovereignAssetId,
  id: string,
  sources: readonly SovereignAssetId[],
): DerivationClaim =>
  buildDerivationClaim({
    id,
    sovereignAssetId,
    issuer: ISSUER,
    sourceSovereignAssetIds: sources,
    relation: DerivationRelationKind.CombinedFrom,
    issuedAt: AT,
  });

const claimArtifact = (
  claim: OriginClaim | AuthorityClaim | DerivationClaim,
): PortableSovereignClaimArtifact => ({ kind: 'claim', claim });

const standingFor = (id: string, claimRef: string): CanonicalStanding => ({
  id,
  claimRef,
  status: StandingStatus.Contested,
  reason: 'A third party disputes the assertion',
  effectiveAt: AT,
});

const reasonsFor = (input: Parameters<typeof tryBuildSovereigntyPortabilityBundleV1>[0]): readonly string[] => {
  const result = tryBuildSovereigntyPortabilityBundleV1(input);
  return result.valid ? [] : result.reasons;
};

describe('SM-06 / canonical portability bundle — envelope contract (BUNDLE TESTS 1-7)', () => {
  it('BUNDLE TEST 1 — carries the exact v1 schema version', () => {
    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(mintSovereignAssetId()) });
    expect(SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION).toBe('aoc-sovereignty-portability-bundle/1');
    expect(bundle.schemaVersion).toBe(SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION);
  });

  it('BUNDLE TEST 2 — declares the existing canonicalization profile and introduces no new one', () => {
    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(mintSovereignAssetId()) });
    expect(bundle.canonicalizationProfile).toBe(CANONICAL_JSON_PROFILE);
    expect(bundle.canonicalizationProfile).toBe('aoc-canonical-json/1');
  });

  it('BUNDLE TEST 3 — a subject-only bundle is valid: identity needs no bytes, manifest, provenance or standing', () => {
    const subject = subjectOf(mintSovereignAssetId());
    const bundle = buildSovereigntyPortabilityBundleV1({ subject });

    expect(isValidSovereigntyPortabilityBundleV1(bundle)).toBe(true);
    expect(bundle.subject).toEqual(subject);
    expect(bundle.manifests).toEqual([]);
    expect(bundle.claims).toEqual([]);
    expect(bundle.standings).toEqual([]);
  });

  it('BUNDLE TEST 4 — an invalid subject is rejected, never repaired', () => {
    expect(reasonsFor({ subject: { sovereignAssetId: 'not-a-sovereign-asset-id' } as SovereignSubjectRef }))
      .toEqual([CODES.invalidSubject]);
    expect(reasonsFor({ subject: undefined as unknown as SovereignSubjectRef })).toEqual([CODES.invalidSubject]);
    expect(() => buildSovereigntyPortabilityBundleV1({ subject: {} as SovereignSubjectRef })).toThrow(
      /PORTABILITY_INVALID_SUBJECT/,
    );
  });

  it('BUNDLE TEST 5 — no bundleId is minted: the bundle is not a new sovereign object', () => {
    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(mintSovereignAssetId()) });
    const serialized = canonicalizeJSON(bundle);
    for (const field of ['bundleId', 'id', 'portabilityId', 'exportId']) {
      expect(Object.prototype.hasOwnProperty.call(bundle, field)).toBe(false);
      expect(serialized).not.toContain(`"${field}"`);
    }
  });

  it('BUNDLE TEST 6 — no exportedAt: the same sovereign state serializes identically at any wall-clock time', () => {
    const subject = subjectOf(mintSovereignAssetId());
    const first = buildSovereigntyPortabilityBundleV1({ subject });
    const second = buildSovereigntyPortabilityBundleV1({ subject });

    for (const field of ['exportedAt', 'createdAt', 'timestamp', 'generatedAt', 'importedAt']) {
      expect(Object.prototype.hasOwnProperty.call(first, field)).toBe(false);
    }
    expect(canonicalizeJSON(first)).toBe(canonicalizeJSON(second));
  });

  it('BUNDLE TEST 7 — no provider, storage, tenant, ownership, licence or governance envelope fields', () => {
    const bundle = buildSovereigntyPortabilityBundleV1({
      subject: subjectOf(mintSovereignAssetId(), {
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'future://provider/object/92817',
      }),
    });

    expect(Object.keys(bundle).sort()).toEqual([
      'canonicalizationProfile',
      'claims',
      'manifests',
      'schemaVersion',
      'standings',
      'subject',
    ]);
    const serialized = canonicalizeJSON(bundle);
    for (const forbidden of [
      'provider', 'backend', 'bucket', 'region', 'tenantId', 'storageUri', 'storagePointer', 'cid',
      'contentBytes', 'sourceApplication', 'destinationApplication', 'owner', 'ownership', 'custody',
      'license', 'terms', 'policy', 'governanceContext', 'digest', 'hash', 'checksum', 'bundleSignature',
      'complete', 'containsFullHistory',
    ]) {
      expect(serialized).not.toContain(`"${forbidden}"`);
    }
  });
});

describe('SM-06 / manifest artifacts (BUNDLE TESTS 8-14)', () => {
  it('BUNDLE TEST 8 — an unsigned SovereignManifestV1 is portable, with no signing required', () => {
    const id = mintSovereignAssetId();
    const artifact = manifestFor(id);
    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(id), manifests: [artifact] });

    expect(bundle.manifests).toHaveLength(1);
    expect(bundle.manifests[0]).toEqual(artifact);
    expect(portableManifestOf(bundle.manifests[0]!)).toBe(artifact.manifest);
  });

  it('BUNDLE TEST 9 — a SignedSovereignManifest is accepted and preserved whole, never flattened or re-signed', () => {
    const id = mintSovereignAssetId();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const manifest = buildSovereignManifestV1({
      sovereignAssetId: id,
      registrant: 'principal:sm06-registrant',
      createdAt: AT,
    });
    const signedManifest = signSovereignManifest(manifest, privateKeyPem, signingKey);

    const bundle = buildSovereigntyPortabilityBundleV1({
      subject: subjectOf(id),
      manifests: [{ kind: 'signed-manifest', signedManifest }],
    });

    const artifact = bundle.manifests[0]!;
    expect(artifact.kind).toBe('signed-manifest');
    if (artifact.kind !== 'signed-manifest') throw new Error('unreachable');
    expect(artifact.signedManifest).toBe(signedManifest);
    expect(artifact.signedManifest.manifestDigest).toBe(signedManifest.manifestDigest);
    expect(artifact.signedManifest.proof).toEqual(signedManifest.proof);
  });

  it('BUNDLE TEST 10 — a manifest about a different subject is rejected, never rewritten to agree', () => {
    const subjectId = mintSovereignAssetId();
    const otherId = mintSovereignAssetId();
    const artifact = manifestFor(otherId);

    expect(reasonsFor({ subject: subjectOf(subjectId), manifests: [artifact] })).toEqual([
      CODES.manifestSubjectMismatch,
    ]);
    expect(artifact.manifest.sovereignAssetId).toBe(otherId);
  });

  it('BUNDLE TEST 11 — several historical manifest versions for one SovereignAssetId are all portable', () => {
    const id = mintSovereignAssetId();
    const bundle = buildSovereigntyPortabilityBundleV1({
      subject: subjectOf(id),
      manifests: [manifestFor(id, { manifestVersion: 1 }), manifestFor(id, { manifestVersion: 2 }), manifestFor(id, { manifestVersion: 3 })],
    });

    expect(bundle.manifests.map((artifact) => portableManifestOf(artifact).manifestVersion)).toEqual([1, 2, 3]);
  });

  it('BUNDLE TEST 12 — the same manifestVersion twice is rejected, across signed and unsigned wrappers alike', () => {
    const id = mintSovereignAssetId();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const artifact = manifestFor(id, { manifestVersion: 2 });
    if (artifact.kind !== 'manifest') throw new Error('unreachable');

    expect(reasonsFor({ subject: subjectOf(id), manifests: [artifact, manifestFor(id, { manifestVersion: 2 })] }))
      .toEqual([CODES.duplicateManifestVersion]);

    expect(
      reasonsFor({
        subject: subjectOf(id),
        manifests: [
          artifact,
          { kind: 'signed-manifest', signedManifest: signSovereignManifest(artifact.manifest, privateKeyPem, signingKey) },
        ],
      }),
    ).toEqual([CODES.duplicateManifestVersion]);
  });

  it('BUNDLE TEST 13 — manifests are sorted by manifestVersion ascending, and the caller array is not mutated', () => {
    const id = mintSovereignAssetId();
    const supplied = [manifestFor(id, { manifestVersion: 3 }), manifestFor(id, { manifestVersion: 1 }), manifestFor(id, { manifestVersion: 2 })];
    const snapshot = [...supplied];

    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(id), manifests: supplied });

    expect(bundle.manifests.map((artifact) => portableManifestOf(artifact).manifestVersion)).toEqual([1, 2, 3]);
    expect(supplied).toEqual(snapshot);
    expect(supplied.map((artifact) => portableManifestOf(artifact).manifestVersion)).toEqual([3, 1, 2]);
  });

  it('BUNDLE TEST 14 — historical externalReference differences are preserved, not reconciled with the bundle subject', () => {
    const id = mintSovereignAssetId();
    const v1 = manifestFor(id, { manifestVersion: 1, locator: 'provider-a://object/1' });
    const v2 = manifestFor(id, { manifestVersion: 2, locator: 'provider-b://object/1' });

    const bundle = buildSovereigntyPortabilityBundleV1({
      subject: subjectOf(id, {
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'provider-b://object/1',
      }),
      manifests: [v1, v2],
    });

    expect(portableManifestOf(bundle.manifests[0]!).externalReference?.locator).toBe('provider-a://object/1');
    expect(portableManifestOf(bundle.manifests[1]!).externalReference?.locator).toBe('provider-b://object/1');
  });
});

describe('SM-06 / claim artifacts (BUNDLE TESTS 15-21)', () => {
  it('BUNDLE TEST 15 — an OriginClaim is portable', () => {
    const id = mintSovereignAssetId();
    const claim = originFor(id, 'claim:origin:001');
    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(id), claims: [claimArtifact(claim)] });
    expect(portableClaimOf(bundle.claims[0]!)).toBe(claim);
  });

  it('BUNDLE TEST 16 — an AuthorityClaim is portable', () => {
    const id = mintSovereignAssetId();
    const claim = authorityFor(id, 'claim:authority:001');
    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(id), claims: [claimArtifact(claim)] });
    expect(portableClaimOf(bundle.claims[0]!)).toBe(claim);
  });

  it('BUNDLE TEST 17 — a DerivationClaim is portable, and its sources need not be bundled', () => {
    const child = mintSovereignAssetId();
    const sourceA = mintSovereignAssetId();
    const sourceB = mintSovereignAssetId();
    const claim = derivationFor(child, 'claim:derivation:001', [sourceA, sourceB]);

    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(child), claims: [claimArtifact(claim)] });

    expect(portableClaimOf(bundle.claims[0]!)).toBe(claim);
    // Exporting C never recursively expands into exporting A and B.
    expect(bundle.manifests).toEqual([]);
    expect((portableClaimOf(bundle.claims[0]!) as DerivationClaim).metadata.sourceSovereignAssetIds)
      .toEqual([sourceA, sourceB]);
  });

  it('BUNDLE TEST 18 — a SignedClaim is accepted and its proof material preserved exactly', () => {
    const id = mintSovereignAssetId();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const signedClaim = signClaim(originFor(id, 'claim:origin:signed'), privateKeyPem, signingKey);

    const bundle = buildSovereigntyPortabilityBundleV1({
      subject: subjectOf(id),
      claims: [{ kind: 'signed-claim', signedClaim }],
    });

    const artifact = bundle.claims[0]!;
    if (artifact.kind !== 'signed-claim') throw new Error('unreachable');
    expect(artifact.signedClaim).toBe(signedClaim);
    expect(artifact.signedClaim.digest).toBe(signedClaim.digest);
    expect(artifact.signedClaim.proof.signature).toBe(signedClaim.proof.signature);
  });

  it('BUNDLE TEST 19 — a claim about a different subject is rejected', () => {
    const id = mintSovereignAssetId();
    const claim = originFor(mintSovereignAssetId(), 'claim:origin:other');
    expect(reasonsFor({ subject: subjectOf(id), claims: [claimArtifact(claim)] })).toEqual([
      CODES.claimSubjectMismatch,
    ]);
  });

  it('BUNDLE TEST 20 — a duplicate claim id is rejected across wrappers and never silently deduplicated', () => {
    const id = mintSovereignAssetId();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const claim = originFor(id, 'claim:origin:dup');

    expect(reasonsFor({ subject: subjectOf(id), claims: [claimArtifact(claim), claimArtifact(claim)] }))
      .toEqual([CODES.duplicateClaimId]);
    expect(
      reasonsFor({
        subject: subjectOf(id),
        claims: [claimArtifact(claim), { kind: 'signed-claim', signedClaim: signClaim(claim, privateKeyPem, signingKey) }],
      }),
    ).toEqual([CODES.duplicateClaimId]);
  });

  it('BUNDLE TEST 21 — claims are sorted by underlying claim id, and the caller array is not mutated', () => {
    const id = mintSovereignAssetId();
    const supplied = [
      claimArtifact(originFor(id, 'claim:c')),
      claimArtifact(authorityFor(id, 'claim:a')),
      claimArtifact(derivationFor(id, 'claim:b', [mintSovereignAssetId()])),
    ];
    const snapshot = [...supplied];

    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(id), claims: supplied });

    expect(bundle.claims.map((artifact) => portableClaimOf(artifact).id)).toEqual(['claim:a', 'claim:b', 'claim:c']);
    expect(supplied).toEqual(snapshot);
  });
});

describe('SM-06 / standings (BUNDLE TESTS 22-25)', () => {
  it('BUNDLE TEST 22 — a CanonicalStanding is a first-class bundle artifact, preserved field for field', () => {
    const id = mintSovereignAssetId();
    const claim = originFor(id, 'claim:origin:contested');
    const standing = standingFor('standing:001', claim.id);

    const bundle = buildSovereigntyPortabilityBundleV1({
      subject: subjectOf(id),
      claims: [claimArtifact(claim)],
      standings: [standing],
    });

    expect(bundle.standings[0]).toBe(standing);
    expect(bundle.standings[0]).toEqual({
      id: 'standing:001',
      claimRef: claim.id,
      status: StandingStatus.Contested,
      reason: 'A third party disputes the assertion',
      effectiveAt: AT,
    });
  });

  it('BUNDLE TEST 23 — a standing whose claim is not in the bundle is rejected, never dropped or resolved externally', () => {
    const id = mintSovereignAssetId();
    expect(reasonsFor({ subject: subjectOf(id), claims: [], standings: [standingFor('standing:001', 'claim:absent')] }))
      .toEqual([CODES.danglingStandingClaimRef]);
  });

  it('BUNDLE TEST 24 — standings are sorted by id, duplicates rejected, caller array not mutated', () => {
    const id = mintSovereignAssetId();
    const claims = ['claim:x', 'claim:y', 'claim:z'].map((claimId) => claimArtifact(originFor(id, claimId)));
    const supplied = [
      standingFor('standing:c', 'claim:z'),
      standingFor('standing:a', 'claim:x'),
      standingFor('standing:b', 'claim:y'),
    ];
    const snapshot = [...supplied];

    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(id), claims, standings: supplied });

    expect(bundle.standings.map((standing) => standing.id)).toEqual(['standing:a', 'standing:b', 'standing:c']);
    expect(supplied).toEqual(snapshot);

    expect(
      reasonsFor({
        subject: subjectOf(id),
        claims,
        standings: [standingFor('standing:a', 'claim:x'), standingFor('standing:a', 'claim:y')],
      }),
    ).toEqual([CODES.duplicateStandingId]);
  });

  it('BUNDLE TEST 25 — an invalid standing is reported rather than accepted', () => {
    const id = mintSovereignAssetId();
    const claim = originFor(id, 'claim:origin:001');
    expect(
      reasonsFor({
        subject: subjectOf(id),
        claims: [claimArtifact(claim)],
        standings: [{ ...standingFor('standing:001', claim.id), status: 'Teleported' as CanonicalStanding['status'] }],
      }),
    ).toEqual([CODES.invalidStanding]);
  });
});

describe('SM-06 / preservation and determinism (BUNDLE TESTS 26-30)', () => {
  it('BUNDLE TEST 26 — evidenceRefs are preserved verbatim and are never required to resolve inside the bundle', () => {
    const id = mintSovereignAssetId();
    const claim = buildOriginClaim({
      id: 'claim:origin:evidence',
      sovereignAssetId: id,
      issuer: ISSUER,
      assertedOrigin: 'field-recording-2019',
      assertedAt: AT,
      evidenceRefs: ['evidence:stored-elsewhere:001', 'evidence:never-bundled:002'],
    });

    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(id), claims: [claimArtifact(claim)] });

    expect(portableClaimOf(bundle.claims[0]!).evidenceRefs).toEqual([
      'evidence:stored-elsewhere:001',
      'evidence:never-bundled:002',
    ]);
    expect(isValidSovereigntyPortabilityBundleV1(bundle)).toBe(true);
  });

  it('BUNDLE TEST 27 — nested artifacts are never rewritten: evidence refs, authority claims and metadata are untouched', () => {
    const id = mintSovereignAssetId();
    const embeddedOrigin = originFor(id, 'claim:embedded-origin');
    const embeddedAuthority = [authorityFor(id, 'claim:embedded-z'), authorityFor(id, 'claim:embedded-a')];
    const manifest = buildSovereignManifestV1({
      sovereignAssetId: id,
      registrant: 'principal:sm06-registrant',
      originClaim: embeddedOrigin,
      authorityClaims: embeddedAuthority,
      createdAt: AT,
    });
    const derivation = buildDerivationClaim({
      id: 'claim:derivation:unsorted',
      sovereignAssetId: id,
      issuer: ISSUER,
      sourceSovereignAssetIds: [mintSovereignAssetId(), mintSovereignAssetId()],
      relation: DerivationRelationKind.CombinedFrom,
      issuedAt: AT,
      evidenceRefs: ['evidence:zzz', 'evidence:aaa'],
    });
    const sources = [...derivation.metadata.sourceSovereignAssetIds];

    const bundle = buildSovereigntyPortabilityBundleV1({
      subject: subjectOf(id),
      manifests: [{ kind: 'manifest', manifest }],
      claims: [claimArtifact(derivation)],
    });

    const carriedManifest = portableManifestOf(bundle.manifests[0]!);
    expect(carriedManifest).toBe(manifest);
    // Embedded manifest claims are NOT extracted, promoted or deduplicated
    // against the bundle's own claim list.
    expect(carriedManifest.originClaim).toBe(embeddedOrigin);
    expect(carriedManifest.authorityClaims.map((claim) => claim.id)).toEqual([
      'claim:embedded-z',
      'claim:embedded-a',
    ]);
    const carriedDerivation = portableClaimOf(bundle.claims[0]!) as DerivationClaim;
    expect(carriedDerivation.evidenceRefs).toEqual(['evidence:zzz', 'evidence:aaa']);
    expect(carriedDerivation.metadata.sourceSovereignAssetIds).toEqual(sources);
  });

  it('BUNDLE TEST 28 — a built bundle canonicalizes under aoc-canonical-json/1', () => {
    const id = mintSovereignAssetId();
    const claim = originFor(id, 'claim:origin:001');
    const bundle = buildSovereigntyPortabilityBundleV1({
      subject: subjectOf(id, { namespace: 'example:property-registry', id: 'lot-42' }),
      manifests: [manifestFor(id)],
      claims: [claimArtifact(claim)],
      standings: [standingFor('standing:001', claim.id)],
    });

    const serialized = canonicalizeJSON(bundle);
    expect(typeof serialized).toBe('string');
    expect(JSON.parse(serialized)).toEqual(JSON.parse(JSON.stringify(bundle)));
  });

  it('BUNDLE TEST 29 — the same artifact set in any input order produces one canonical serialization', () => {
    const id = mintSovereignAssetId();
    const manifests = [manifestFor(id, { manifestVersion: 1 }), manifestFor(id, { manifestVersion: 2 })];
    const claims = [claimArtifact(originFor(id, 'claim:a')), claimArtifact(authorityFor(id, 'claim:b'))];
    const standings = [standingFor('standing:a', 'claim:a'), standingFor('standing:b', 'claim:b')];
    const subject = subjectOf(id);

    const forward = buildSovereigntyPortabilityBundleV1({ subject, manifests, claims, standings });
    const reversed = buildSovereigntyPortabilityBundleV1({
      subject,
      manifests: [...manifests].reverse(),
      claims: [...claims].reverse(),
      standings: [...standings].reverse(),
    });

    expect(canonicalizeJSON(reversed)).toBe(canonicalizeJSON(forward));
  });

  it('BUNDLE TEST 30 — an unsupported bundle schema, profile, artifact kind or envelope field is rejected', () => {
    const id = mintSovereignAssetId();
    const base = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(id) });

    expect(validateSovereigntyPortabilityBundleV1({ ...base, schemaVersion: 'aoc-sovereignty-portability-bundle/2' }))
      .toEqual({ valid: false, reasons: [CODES.unsupportedBundleSchema] });
    expect(validateSovereigntyPortabilityBundleV1({ ...base, canonicalizationProfile: 'some-other-json/9' }))
      .toEqual({ valid: false, reasons: [CODES.unsupportedCanonicalizationProfile] });
    expect(validateSovereigntyPortabilityBundleV1({ ...base, manifests: [{ kind: 'teleporter-proof' }] }))
      .toEqual({ valid: false, reasons: [CODES.unsupportedArtifactKind] });
    expect(validateSovereigntyPortabilityBundleV1({ ...base, claims: [{ kind: 'future-super-artifact' }] }))
      .toEqual({ valid: false, reasons: [CODES.unsupportedArtifactKind] });
    // An unrecognized envelope field is reported rather than silently dropped
    // during canonical envelope reconstruction.
    expect(validateSovereigntyPortabilityBundleV1({ ...base, provider: 'pinata' }))
      .toEqual({ valid: false, reasons: [CODES.invalidBundle] });
    expect(validateSovereigntyPortabilityBundleV1('not a bundle'))
      .toEqual({ valid: false, reasons: [CODES.invalidBundle] });
  });

  it('reports a value the canonical profile refuses rather than inventing a serialization for it', () => {
    const id = mintSovereignAssetId();
    const withUndefined = {
      ...originFor(id, 'claim:origin:undefined-metadata'),
      metadata: { assertedOrigin: 'field-recording-2019', recordedBy: undefined },
    } as unknown as OriginClaim;
    const withBigInt = {
      ...originFor(id, 'claim:origin:bigint-metadata'),
      metadata: { assertedOrigin: 'field-recording-2019', sequence: BigInt(7) },
    } as unknown as OriginClaim;

    // `aoc-canonical-json/1` refuses both outright, and SM-06 does not invent a
    // second serialization for values Protocol's one canonicalizer rejects.
    for (const claim of [withUndefined, withBigInt]) {
      expect(reasonsFor({ subject: subjectOf(id), claims: [claimArtifact(claim)] }))
        .toEqual([CODES.canonicalizationFailed]);
    }
  });

  it('exposes the closed artifact-kind vocabularies this bundle version understands', () => {
    expect(PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS).toEqual(['manifest', 'signed-manifest']);
    expect(PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS).toEqual(['claim', 'signed-claim']);
  });

  it('keeps a byte-backed subject portable without ever embedding the bytes', () => {
    const bytes = new TextEncoder().encode('hello-portable-world');
    const contentIdentity = computeContentIdentity(bytes);
    const id = mintSovereignAssetId();
    const manifest = buildSovereignManifestV1({
      sovereignAssetId: id,
      contentIdentity,
      registrant: 'principal:sm06-registrant',
      createdAt: AT,
    });

    const bundle = buildSovereigntyPortabilityBundleV1({
      subject: subjectOf(id),
      manifests: [{ kind: 'manifest', manifest }],
    });

    expect(portableManifestOf(bundle.manifests[0]!).contentIdentity).toEqual(contentIdentity);
    expect(canonicalizeJSON(bundle)).not.toContain('hello-portable-world');
  });
});
