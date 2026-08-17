import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import type { CanonicalStanding } from '@aoc/protocol/claims';
import { buildSovereignExternalReference, mintSovereignAssetId } from '@aoc/protocol/identity';
import type { SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  DerivationRelationKind,
  buildDerivationClaim,
  buildOriginClaim,
  buildSovereignManifestV1,
  generateSovereignKeyPair,
  signClaim,
  signSovereignManifest,
  verifySignedClaim,
  verifySovereignManifest,
} from '@aoc/protocol/manifest';
import type { OriginClaim } from '@aoc/protocol/manifest';
import {
  SOVEREIGNTY_PORTABILITY_REASON_CODES,
  buildSovereigntyPortabilityBundleV1,
  parseSovereigntyPortabilityBundle,
  portableClaimOf,
  portableManifestOf,
  serializeSovereigntyPortabilityBundle,
} from '@aoc/protocol/portability';
import type { SovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';

const CODES = SOVEREIGNTY_PORTABILITY_REASON_CODES;
const ISSUER = 'principal:sm06-issuer';
const AT = '2026-03-01T09:00:00.000Z';

const ALIEN_REFERENCE = {
  namespace: 'alien-system-v47',
  id: 'alien-resource-92817',
  locator: 'future://provider/object/92817',
} as const;

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
  buildOriginClaim({
    id,
    sovereignAssetId,
    issuer: ISSUER,
    assertedOrigin: 'field-recording-2019',
    assertedAt: AT,
    evidenceRefs: ['evidence:zzz-stored-elsewhere', 'evidence:aaa-never-bundled'],
  });

const standingFor = (id: string, claimRef: string): CanonicalStanding => ({
  id,
  claimRef,
  status: StandingStatus.Contested,
  reason: 'A third party disputes the assertion',
  effectiveAt: AT,
});

const parseOrThrow = (serialized: string): SovereigntyPortabilityBundleV1 => {
  const result = parseSovereigntyPortabilityBundle(serialized);
  if (!result.valid) throw new Error(`parse failed: ${result.reasons.join(', ')}`);
  return result.bundle;
};

const richBundle = (): SovereigntyPortabilityBundleV1 => {
  const id = mintSovereignAssetId();
  const { signingKey, privateKeyPem } = generateSovereignKeyPair();
  const manifestV1 = buildSovereignManifestV1({
    sovereignAssetId: id,
    manifestVersion: 1,
    registrant: 'principal:sm06-registrant',
    externalReference: buildSovereignExternalReference(ALIEN_REFERENCE),
    createdAt: AT,
  });
  const manifestV2 = buildSovereignManifestV1({
    sovereignAssetId: id,
    manifestVersion: 2,
    registrant: 'principal:sm06-registrant',
    createdAt: AT,
  });
  const origin = originFor(id, 'claim:origin:001');
  const derivation = buildDerivationClaim({
    id: 'claim:derivation:002',
    sovereignAssetId: id,
    issuer: ISSUER,
    sourceSovereignAssetIds: [mintSovereignAssetId(), mintSovereignAssetId()],
    relation: DerivationRelationKind.TransformedFrom,
    statement: '  spacing   and CASE preserved exactly  ',
    occurredAt: '2019-07-04T12:34:56.789Z',
    issuedAt: AT,
  });

  return buildSovereigntyPortabilityBundleV1({
    subject: subjectOf(id, ALIEN_REFERENCE),
    manifests: [
      { kind: 'manifest', manifest: manifestV2 },
      { kind: 'signed-manifest', signedManifest: signSovereignManifest(manifestV1, privateKeyPem, signingKey) },
    ],
    claims: [
      { kind: 'signed-claim', signedClaim: signClaim(derivation, privateKeyPem, signingKey) },
      { kind: 'claim', claim: origin },
    ],
    standings: [standingFor('standing:001', origin.id)],
  });
};

describe('SM-06 / canonical serialization (SERIAL TESTS 1-2, 12)', () => {
  it('SERIAL TEST 1 — the serializer emits exactly canonicalizeJSON(bundle), with no pretty-printing', () => {
    const bundle = richBundle();
    const serialized = serializeSovereigntyPortabilityBundle(bundle);

    expect(serialized).toBe(canonicalizeJSON(bundle));
    expect(serialized).not.toContain('\n');
    expect(serialized).not.toContain(': ');
  });

  it('SERIAL TEST 2 — a JSON-string transport round trip preserves the subject exactly', () => {
    const bundle = richBundle();
    const imported = parseOrThrow(serializeSovereigntyPortabilityBundle(bundle));

    expect(imported.subject).toEqual(bundle.subject);
    expect(imported.subject.sovereignAssetId).toBe(bundle.subject.sovereignAssetId);
  });

  it('SERIAL TEST 12 — no timestamp appears in the envelope, and two serializations of one state are identical', () => {
    const id = mintSovereignAssetId();
    const subject = subjectOf(id);
    const first = serializeSovereigntyPortabilityBundle(buildSovereigntyPortabilityBundleV1({ subject }));
    const second = serializeSovereigntyPortabilityBundle(buildSovereigntyPortabilityBundleV1({ subject }));

    expect(second).toBe(first);
    expect(first).toBe(
      `{"canonicalizationProfile":"aoc-canonical-json/1","claims":[],"manifests":[],`
      + `"schemaVersion":"aoc-sovereignty-portability-bundle/1","standings":[],`
      + `"subject":{"sovereignAssetId":"${id}"}}`,
    );
  });

  it('refuses to emit a wire representation of an unimportable bundle', () => {
    const bundle = richBundle();
    expect(() =>
      serializeSovereigntyPortabilityBundle({ ...bundle, standings: [standingFor('standing:x', 'claim:absent')] }),
    ).toThrow(/PORTABILITY_DANGLING_STANDING_CLAIM_REF/);
  });
});

describe('SM-06 / round-trip preservation (SERIAL TESTS 3-7, 10-11)', () => {
  it('SERIAL TEST 3 — manifests survive the round trip, signed and unsigned, in canonical version order', async () => {
    const bundle = richBundle();
    const imported = parseOrThrow(serializeSovereigntyPortabilityBundle(bundle));

    expect(imported.manifests).toEqual(bundle.manifests);
    expect(imported.manifests.map((artifact) => portableManifestOf(artifact).manifestVersion)).toEqual([1, 2]);
    expect(imported.manifests.map((artifact) => artifact.kind)).toEqual(['signed-manifest', 'manifest']);

    // Verified OUTSIDE Portability: the transported proof still holds, which is
    // a Verifiability result about a preserved artifact, not a portability one.
    const signed = imported.manifests[0]!;
    if (signed.kind !== 'signed-manifest') throw new Error('unreachable');
    await expect(verifySovereignManifest(signed.signedManifest)).resolves.toMatchObject({ valid: true });
  });

  it('SERIAL TEST 4 — claims survive the round trip with ids, issuer, timestamps and evidence refs unchanged', () => {
    const bundle = richBundle();
    const imported = parseOrThrow(serializeSovereigntyPortabilityBundle(bundle));

    expect(imported.claims).toEqual(bundle.claims);
    expect(imported.claims.map((artifact) => portableClaimOf(artifact).id)).toEqual([
      'claim:derivation:002',
      'claim:origin:001',
    ]);

    const origin = portableClaimOf(imported.claims[1]!);
    const before = portableClaimOf(bundle.claims[1]!);
    expect(origin.id).toBe(before.id);
    expect(origin.subject).toBe(before.subject);
    expect(origin.issuer).toBe(before.issuer);
    expect(origin.issuedAt).toBe(before.issuedAt);
    expect(origin.assertionRef).toBe(before.assertionRef);
    // Preserved in the issuer's order, not sorted into the envelope's.
    expect(origin.evidenceRefs).toEqual(['evidence:zzz-stored-elsewhere', 'evidence:aaa-never-bundled']);
  });

  it('SERIAL TEST 5 — standings survive the round trip with status and reason unchanged, never adjudicated', () => {
    const bundle = richBundle();
    const imported = parseOrThrow(serializeSovereigntyPortabilityBundle(bundle));

    expect(imported.standings).toEqual(bundle.standings);
    expect(imported.standings[0]!.status).toBe(StandingStatus.Contested);
    expect(imported.standings[0]!.reason).toBe('A third party disputes the assertion');
  });

  it('SERIAL TEST 6 — signed proof material survives byte for byte, and is never re-signed or re-timestamped', () => {
    const bundle = richBundle();
    const imported = parseOrThrow(serializeSovereigntyPortabilityBundle(bundle));

    const before = bundle.claims.find((artifact) => artifact.kind === 'signed-claim');
    const after = imported.claims.find((artifact) => artifact.kind === 'signed-claim');
    if (before?.kind !== 'signed-claim' || after?.kind !== 'signed-claim') throw new Error('unreachable');

    expect(after.signedClaim.digest).toBe(before.signedClaim.digest);
    expect(after.signedClaim.proof.signature).toBe(before.signedClaim.proof.signature);
    expect(after.signedClaim.proof.publicKey).toBe(before.signedClaim.proof.publicKey);
    expect(after.signedClaim.proof.payloadHash).toBe(before.signedClaim.proof.payloadHash);
    expect(after.signedClaim.proof.signedAt).toBe(before.signedClaim.proof.signedAt);
    expect(after.signedClaim.proof.keyId).toBe(before.signedClaim.proof.keyId);

    // Again verified outside Portability, on both sides of the transport.
    expect(verifySignedClaim(before.signedClaim)).toEqual(verifySignedClaim(after.signedClaim));
    expect(verifySignedClaim(after.signedClaim).valid).toBe(true);
  });

  it('SERIAL TEST 7 — a second transport cycle produces an identical canonical serialization, with no drift', () => {
    const bundle = richBundle();
    const s1 = serializeSovereigntyPortabilityBundle(bundle);
    const b2 = parseOrThrow(s1);
    const s2 = serializeSovereigntyPortabilityBundle(b2);
    const b3 = parseOrThrow(s2);
    const s3 = serializeSovereigntyPortabilityBundle(b3);

    expect(s2).toBe(s1);
    expect(s3).toBe(s1);
    expect(canonicalizeJSON(b3)).toBe(canonicalizeJSON(bundle));
    expect(b3).toEqual(bundle);
  });

  it('SERIAL TEST 10 — optional nested fields stay structurally absent or present exactly as supplied', () => {
    const bundle = richBundle();
    const imported = parseOrThrow(serializeSovereigntyPortabilityBundle(bundle));

    const withReference = portableManifestOf(imported.manifests[0]!);
    const withoutReference = portableManifestOf(imported.manifests[1]!);
    expect(Object.prototype.hasOwnProperty.call(withReference, 'externalReference')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(withoutReference, 'externalReference')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(withoutReference, 'contentIdentity')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(imported.standings[0]!, 'expiresAt')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(imported.standings[0]!, 'reason')).toBe(true);
  });

  it('SERIAL TEST 11 — opaque external-reference strings survive exactly, untrimmed and unparsed', () => {
    const id = mintSovereignAssetId();
    const bundle = buildSovereigntyPortabilityBundleV1({ subject: subjectOf(id, ALIEN_REFERENCE) });
    const imported = parseOrThrow(serializeSovereigntyPortabilityBundle(bundle));

    expect(imported.subject.externalReference).toEqual({
      namespace: 'alien-system-v47',
      id: 'alien-resource-92817',
      locator: 'future://provider/object/92817',
    });
  });

  it('preserves opaque statement whitespace and casing across repeated cycles', () => {
    const bundle = richBundle();
    const imported = parseOrThrow(serializeSovereigntyPortabilityBundle(
      parseOrThrow(serializeSovereigntyPortabilityBundle(bundle)),
    ));
    const derivation = imported.claims.find((artifact) => portableClaimOf(artifact).id === 'claim:derivation:002');
    const claim = portableClaimOf(derivation!) as { metadata: { statement?: string; occurredAt?: string } };

    expect(claim.metadata.statement).toBe('  spacing   and CASE preserved exactly  ');
    expect(claim.metadata.occurredAt).toBe('2019-07-04T12:34:56.789Z');
  });
});

describe('SM-06 / the parser fails closed (SERIAL TESTS 8-9)', () => {
  it('SERIAL TEST 8 — malformed JSON is rejected gracefully, never as a leaked exception', () => {
    for (const malformed of ['{ not-json', '', '   ', 'undefined', '{"a":']) {
      expect(parseSovereigntyPortabilityBundle(malformed)).toEqual({
        valid: false,
        reasons: [CODES.invalidJson],
      });
    }
    expect(parseSovereigntyPortabilityBundle(undefined as unknown as string)).toEqual({
      valid: false,
      reasons: [CODES.invalidJson],
    });
  });

  it('SERIAL TEST 9 — an unknown artifact kind is rejected explicitly, never silently dropped', () => {
    const bundle = richBundle();
    const parsed = JSON.parse(serializeSovereigntyPortabilityBundle(bundle));

    expect(
      parseSovereigntyPortabilityBundle(
        JSON.stringify({ ...parsed, manifests: [...parsed.manifests, { kind: 'teleporter-proof' }] }),
      ),
    ).toEqual({ valid: false, reasons: [CODES.unsupportedArtifactKind] });

    expect(
      parseSovereigntyPortabilityBundle(
        JSON.stringify({ ...parsed, claims: [...parsed.claims, { kind: 'future-super-artifact', payload: 1 }] }),
      ),
    ).toEqual({ valid: false, reasons: [CODES.unsupportedArtifactKind] });
  });

  it('rejects an unsupported future bundle version rather than attempting a best-effort import', () => {
    const parsed = JSON.parse(serializeSovereigntyPortabilityBundle(richBundle()));

    for (const version of ['aoc-sovereignty-portability-bundle/2', 'aoc-sovereignty-portability-bundle/999']) {
      expect(parseSovereigntyPortabilityBundle(JSON.stringify({ ...parsed, schemaVersion: version }))).toEqual({
        valid: false,
        reasons: [CODES.unsupportedBundleSchema],
      });
    }
  });

  it('rejects an unsupported canonicalization profile and a non-object payload', () => {
    const parsed = JSON.parse(serializeSovereigntyPortabilityBundle(richBundle()));

    expect(
      parseSovereigntyPortabilityBundle(JSON.stringify({ ...parsed, canonicalizationProfile: 'json-stable/3' })),
    ).toEqual({ valid: false, reasons: [CODES.unsupportedCanonicalizationProfile] });
    expect(parseSovereigntyPortabilityBundle('[]')).toEqual({ valid: false, reasons: [CODES.invalidBundle] });
    expect(parseSovereigntyPortabilityBundle('null')).toEqual({ valid: false, reasons: [CODES.invalidBundle] });
    expect(parseSovereigntyPortabilityBundle('42')).toEqual({ valid: false, reasons: [CODES.invalidBundle] });
  });

  it('normalizes only the envelope order of a non-canonical producer, never the artifacts inside it', () => {
    const bundle = richBundle();
    const canonical = serializeSovereigntyPortabilityBundle(bundle);
    const parsed = JSON.parse(canonical);

    const shuffled = JSON.stringify({
      standings: parsed.standings,
      subject: parsed.subject,
      claims: [...parsed.claims].reverse(),
      schemaVersion: parsed.schemaVersion,
      manifests: [...parsed.manifests].reverse(),
      canonicalizationProfile: parsed.canonicalizationProfile,
    });

    const imported = parseOrThrow(shuffled);
    expect(serializeSovereigntyPortabilityBundle(imported)).toBe(canonical);
    expect(imported.claims).toEqual(bundle.claims);
    expect(imported.manifests).toEqual(bundle.manifests);
  });

  it('transports structurally representable but cryptographically broken proof material without claiming it verified', () => {
    const id = mintSovereignAssetId();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const signedClaim = signClaim(originFor(id, 'claim:origin:tampered'), privateKeyPem, signingKey);
    const tampered = {
      ...signedClaim,
      proof: { ...signedClaim.proof, signature: signedClaim.proof.signature.replace(/^./, 'A') },
    };

    const bundle = buildSovereigntyPortabilityBundleV1({
      subject: subjectOf(id),
      claims: [{ kind: 'signed-claim', signedClaim: tampered }],
    });
    const imported = parseOrThrow(serializeSovereigntyPortabilityBundle(bundle));

    const artifact = imported.claims[0]!;
    if (artifact.kind !== 'signed-claim') throw new Error('unreachable');
    // Portability succeeded: it faithfully transported the material it was given.
    expect(artifact.signedClaim.proof.signature).toBe(tampered.proof.signature);
    // Verifiability, invoked separately and outside Portability, reports the truth.
    expect(verifySignedClaim(artifact.signedClaim).valid).toBe(false);
  });

  it('preserves a supplied manifestDigest verbatim instead of recomputing or repairing it', () => {
    const id = mintSovereignAssetId();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const manifest = buildSovereignManifestV1({
      sovereignAssetId: id,
      registrant: 'principal:sm06-registrant',
      createdAt: AT,
    });
    const signedManifest = signSovereignManifest(manifest, privateKeyPem, signingKey);
    const wrongDigest = { ...signedManifest, manifestDigest: 'f'.repeat(64) };

    const imported = parseOrThrow(
      serializeSovereigntyPortabilityBundle(
        buildSovereigntyPortabilityBundleV1({
          subject: subjectOf(id),
          manifests: [{ kind: 'signed-manifest', signedManifest: wrongDigest }],
        }),
      ),
    );

    const artifact = imported.manifests[0]!;
    if (artifact.kind !== 'signed-manifest') throw new Error('unreachable');
    expect(artifact.signedManifest.manifestDigest).toBe('f'.repeat(64));
  });
});
