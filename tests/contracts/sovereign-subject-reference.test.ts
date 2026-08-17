import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  buildSovereignExternalReference,
  computeContentIdentity,
  contentIdentitiesEqual,
  isValidSovereignExternalReference,
  isValidSovereignSubjectRef,
  mintSovereignAssetId,
  sovereignExternalReferencesEqual,
  toSovereignSubjectRef,
  validateSovereignExternalReference,
} from '@aoc/protocol/identity';
import type {
  SovereignExternalReference,
  SovereignSubjectRef,
} from '@aoc/protocol/identity';
import {
  buildSovereignManifestV1,
  computeManifestDigest,
  generateSovereignKeyPair,
  resolveSovereignAsset,
  resolveSovereignAssetVersion,
  signSovereignManifest,
  validateSovereignManifestV1,
  verifySovereignManifest,
} from '@aoc/protocol/manifest';
import type { SignedSovereignManifest, SovereignManifestV1 } from '@aoc/protocol/manifest';
import { canonicalizeJSON } from '@aoc/protocol/canonical';

import { InMemorySovereignAssetRegistry } from './fixtures/in-memory-sovereign-asset-registry';

const PHOTO_BYTES = new TextEncoder().encode('photo.jpg bytes — the actual content');

/**
 * Every subject below — a file, an AI agent, an external token, an API
 * resource, a building, and an object from a system that does not exist —
 * is registered through this one generic helper. There is deliberately no
 * per-domain builder, no domain profile, and no branch on `namespace`
 * anywhere in this file or in Protocol.
 */
function registerSubject(input: {
  readonly externalReference?: SovereignExternalReference;
  readonly contentBytes?: Uint8Array;
  readonly manifestVersion?: number;
  readonly sovereignAssetId?: string;
}): {
  readonly sovereignAssetId: string;
  readonly manifest: SovereignManifestV1;
  readonly signed: SignedSovereignManifest;
  readonly privateKeyPem: string;
  readonly signingKey: ReturnType<typeof generateSovereignKeyPair>['signingKey'];
} {
  const sovereignAssetId = input.sovereignAssetId ?? mintSovereignAssetId();
  const { signingKey, privateKeyPem } = generateSovereignKeyPair();
  const manifest = buildSovereignManifestV1({
    sovereignAssetId,
    registrant: 'principal:alice',
    ...(input.externalReference ? { externalReference: input.externalReference } : {}),
    ...(input.contentBytes ? { contentIdentity: computeContentIdentity(input.contentBytes) } : {}),
    ...(input.manifestVersion ? { manifestVersion: input.manifestVersion } : {}),
  });
  const signed = signSovereignManifest(manifest, privateKeyPem, signingKey);
  return { sovereignAssetId, manifest, signed, privateKeyPem, signingKey };
}

const ALIEN_REFERENCE: SovereignExternalReference = {
  namespace: 'alien-system-v47',
  id: 'alien-resource-92817',
  locator: 'future://provider/object/92817',
};

describe('SovereignSubjectRef — canonical Protocol subject reference (SM-02 §9)', () => {
  it('TEST 1 — accepts a SovereignAssetId alone: identity needs no external reference and no integrity', () => {
    const subject: SovereignSubjectRef = { sovereignAssetId: mintSovereignAssetId() };
    expect(isValidSovereignSubjectRef(subject)).toBe(true);
    expect(Object.keys(subject)).toEqual(['sovereignAssetId']);
    // `contentIdentity` is not part of this contract at all — there is no
    // field to omit, which is the structural form of Identity != Integrity.
    expect('contentIdentity' in subject).toBe(false);
  });

  it('rejects a subject reference with a malformed or missing sovereign asset id', () => {
    expect(isValidSovereignSubjectRef({ sovereignAssetId: 'sha256:' + 'a'.repeat(64) })).toBe(false);
    expect(isValidSovereignSubjectRef({})).toBe(false);
    expect(isValidSovereignSubjectRef(null)).toBe(false);
    expect(isValidSovereignSubjectRef([mintSovereignAssetId()])).toBe(false);
  });

  it('rejects a present-but-undefined externalReference, which canonical JSON could never serialize', () => {
    expect(isValidSovereignSubjectRef({ sovereignAssetId: mintSovereignAssetId(), externalReference: undefined })).toBe(
      false,
    );
  });

  it('narrows a full sovereign manifest to a bare subject reference (the same type SM-03/SM-09 will carry)', () => {
    const { signed, sovereignAssetId } = registerSubject({ externalReference: ALIEN_REFERENCE });
    const subject = toSovereignSubjectRef(signed.manifest);

    expect(subject).toEqual({ sovereignAssetId, externalReference: ALIEN_REFERENCE });
    expect(isValidSovereignSubjectRef(subject)).toBe(true);
    // No integrity, claims, or manifest metadata rides along with the subject.
    expect(Object.keys(subject).sort()).toEqual(['externalReference', 'sovereignAssetId']);
  });

  it('omits externalReference structurally when narrowing an identity-only subject', () => {
    const { signed } = registerSubject({ contentBytes: PHOTO_BYTES });
    const subject = toSovereignSubjectRef(signed.manifest);
    expect(Object.keys(subject)).toEqual(['sovereignAssetId']);
    expect(() => canonicalizeJSON(subject)).not.toThrow();
  });
});

describe('SovereignExternalReference — open-world reference contract (SM-02 §10–§12)', () => {
  it('TEST 2 — namespace + id alone is valid', () => {
    const reference = buildSovereignExternalReference({ namespace: 'example:file-catalog', id: 'asset-92817' });
    expect(isValidSovereignExternalReference(reference)).toBe(true);
    expect(Object.keys(reference)).toEqual(['namespace', 'id']);
    expect('locator' in reference).toBe(false);
  });

  it('TEST 3 — an optional future:// locator is valid, and is never resolved', () => {
    const reference = buildSovereignExternalReference(ALIEN_REFERENCE);
    expect(isValidSovereignExternalReference(reference)).toBe(true);
    expect(reference.locator).toBe('future://provider/object/92817');
  });

  it('TEST 4 — an empty namespace is rejected', () => {
    expect(validateSovereignExternalReference({ namespace: '', id: 'x' }).reasons).toContain(
      'INVALID_EXTERNAL_REFERENCE_NAMESPACE',
    );
    expect(() => buildSovereignExternalReference({ namespace: '   ', id: 'x' })).toThrow(
      /INVALID_EXTERNAL_REFERENCE_NAMESPACE/,
    );
    expect(isValidSovereignExternalReference({ id: 'x' })).toBe(false);
  });

  it('TEST 5 — an empty id is rejected', () => {
    expect(validateSovereignExternalReference({ namespace: 'example:api', id: '' }).reasons).toContain(
      'INVALID_EXTERNAL_REFERENCE_ID',
    );
    expect(() => buildSovereignExternalReference({ namespace: 'example:api', id: '  ' })).toThrow(
      /INVALID_EXTERNAL_REFERENCE_ID/,
    );
    expect(isValidSovereignExternalReference({ namespace: 'example:api' })).toBe(false);
  });

  it('TEST 6 — an empty locator is rejected when the field is present', () => {
    expect(validateSovereignExternalReference({ namespace: 'example:api', id: 'r-1', locator: '' }).reasons).toContain(
      'INVALID_EXTERNAL_REFERENCE_LOCATOR',
    );
    // Present-but-undefined is rejected too: canonical JSON refuses to
    // serialize `undefined`, so absence must be structural omission.
    expect(isValidSovereignExternalReference({ namespace: 'example:api', id: 'r-1', locator: undefined })).toBe(false);
  });

  it('reports non-object and array input as a structural defect rather than throwing', () => {
    expect(validateSovereignExternalReference('example:api/r-1').reasons).toEqual([
      'INVALID_EXTERNAL_REFERENCE_STRUCTURE',
    ]);
    expect(validateSovereignExternalReference(null).valid).toBe(false);
    expect(validateSovereignExternalReference(['example:api', 'r-1']).valid).toBe(false);
  });

  it('TEST 7 — unknown and future namespaces are accepted with no Protocol registration', () => {
    for (const namespace of [
      'example:file-catalog',
      'future:agent-network',
      'example:blockchain-token',
      'example:property-registry',
      'alien-system-v47',
      'namespace-nobody-has-invented-yet',
    ]) {
      expect(isValidSovereignExternalReference({ namespace, id: 'unknown-object-92817' })).toBe(true);
    }
  });

  it('TEST 8 — the external id is opaque: never parsed, normalized, trimmed, or rewritten', () => {
    const awkwardIds = [
      ' padded-id ',
      'UPPER/lower/../%20',
      'token-0xABC-42',
      'urn:not:parsed:by:aoc',
      '{"looks":"like json"}',
      'folio 77881',
    ];
    for (const id of awkwardIds) {
      const reference = buildSovereignExternalReference({ namespace: 'example:opaque', id });
      expect(reference.id).toBe(id);
      const { signed } = registerSubject({ externalReference: reference });
      expect(signed.manifest.externalReference?.id).toBe(id);
      expect(JSON.parse(JSON.stringify(signed)).manifest.externalReference.id).toBe(id);
    }
  });

  it('TEST 9 — no closed subject-kind or reference-kind enum exists anywhere in the contract', () => {
    const identityModule = require('@aoc/protocol/identity') as Record<string, unknown>;
    const kindLikeExports = Object.keys(identityModule).filter((name) => /Kind|Type$|Category/.test(name));
    expect(kindLikeExports).toEqual([]);

    // The reference source itself must contain no domain vocabulary in its
    // executable code — the doc comments name example domains, the code
    // never branches on one.
    const source = readFileSync(
      resolve(__dirname, '../../packages/protocol/src/identity/subject-reference.ts'),
      'utf8',
    );
    const code = stripComments(source);
    expect(code).not.toMatch(/\benum\b/);
    expect(code).not.toMatch(/\bswitch\b/);
    for (const domainWord of ['token', 'agent', 'building', 'wallet', 'photo', 'blockchain', 'http']) {
      expect(code.toLowerCase()).not.toContain(domainWord);
    }
  });

  it('compares references exactly: same namespace/id at a different locator is not the same reference', () => {
    const a = buildSovereignExternalReference({ namespace: 'future:object-system', id: '92817' });
    const b = buildSovereignExternalReference({ namespace: 'future:object-system', id: '92817' });
    const moved = buildSovereignExternalReference({
      namespace: 'future:object-system',
      id: '92817',
      locator: 'future://provider-b/object/92817',
    });
    expect(sovereignExternalReferencesEqual(a, b)).toBe(true);
    expect(sovereignExternalReferencesEqual(a, moved)).toBe(false);
  });
});

describe('Sovereign manifest — Identity / Integrity decoupling (SM-02 §16–§19)', () => {
  it('TEST 10 — builds a valid manifest from sovereignAssetId + externalReference with NO contentIdentity', () => {
    const { signed, sovereignAssetId } = registerSubject({ externalReference: ALIEN_REFERENCE });

    expect(validateSovereignManifestV1(signed.manifest).valid).toBe(true);
    expect(signed.manifest.sovereignAssetId).toBe(sovereignAssetId);
    expect(signed.manifest.externalReference).toEqual(ALIEN_REFERENCE);
    expect(signed.manifest.contentIdentity).toBeUndefined();
    expect('contentIdentity' in signed.manifest).toBe(false);
  });

  it('TEST 11 — the pre-SM-02 byte-backed manifest still builds, signs and verifies unchanged', async () => {
    const { signed } = registerSubject({ contentBytes: PHOTO_BYTES });

    expect(signed.manifest.contentIdentity).toEqual(computeContentIdentity(PHOTO_BYTES));
    expect('externalReference' in signed.manifest).toBe(false);

    const result = await verifySovereignManifest(signed, { contentBytes: PHOTO_BYTES });
    expect(result.valid).toBe(true);
    expect(result.checks).toEqual({
      manifestStructure: 'valid',
      manifestDigest: 'valid',
      signature: 'valid',
      contentDigest: 'valid',
      issuerBinding: 'not_performed',
    });
    expect(result.reasons).toEqual([]);
  });

  it('TEST 12 — a manifest may carry BOTH externalReference and contentIdentity', async () => {
    const reference = buildSovereignExternalReference({
      namespace: 'example:dataset-catalog',
      id: 'dataset-92817',
      locator: 'future://provider/dataset/92817',
    });
    const { signed } = registerSubject({ externalReference: reference, contentBytes: PHOTO_BYTES });

    expect(signed.manifest.externalReference).toEqual(reference);
    expect(contentIdentitiesEqual(signed.manifest.contentIdentity!, computeContentIdentity(PHOTO_BYTES))).toBe(true);

    const result = await verifySovereignManifest(signed, { contentBytes: PHOTO_BYTES });
    expect(result.valid).toBe(true);
    expect(result.checks.contentDigest).toBe('valid');
  });

  it('allows an identity-only manifest: decoupling leaves neither optional field mandatory', () => {
    const { signed } = registerSubject({});
    expect(validateSovereignManifestV1(signed.manifest).valid).toBe(true);
    expect('externalReference' in signed.manifest).toBe(false);
    expect('contentIdentity' in signed.manifest).toBe(false);
  });

  it('TEST 13 — an absent contentIdentity is structurally omitted from the canonical payload', () => {
    const { signed } = registerSubject({ externalReference: ALIEN_REFERENCE });
    const canonical = canonicalizeJSON(signed.manifest);

    expect(canonical).not.toContain('contentIdentity');
    expect(canonical).not.toContain('undefined');
    expect(() => canonicalizeJSON(signed.manifest)).not.toThrow();
  });

  it('TEST 14 — an absent externalReference is structurally omitted from the canonical payload', () => {
    const { signed } = registerSubject({ contentBytes: PHOTO_BYTES });
    const canonical = canonicalizeJSON(signed.manifest);

    expect(canonical).not.toContain('externalReference');
    expect(canonical).not.toContain('undefined');
  });

  it('rejects a present-but-undefined optional field instead of producing unsignable canonical material', () => {
    const { manifest } = registerSubject({ externalReference: ALIEN_REFERENCE });

    const withUndefinedContent = { ...manifest, contentIdentity: undefined } as SovereignManifestV1;
    expect(validateSovereignManifestV1(withUndefinedContent).reasons).toContain('INVALID_CONTENT_IDENTITY');

    const withUndefinedReference = { ...manifest, externalReference: undefined } as SovereignManifestV1;
    expect(validateSovereignManifestV1(withUndefinedReference).reasons).toContain('INVALID_EXTERNAL_REFERENCE');
  });

  it('rejects a malformed externalReference at manifest-build time', () => {
    expect(() =>
      buildSovereignManifestV1({
        sovereignAssetId: mintSovereignAssetId(),
        registrant: 'principal:alice',
        externalReference: { namespace: '', id: 'x' },
      }),
    ).toThrow(/INVALID_EXTERNAL_REFERENCE/);
  });

  it('TEST 15 — the external reference survives a JSON round trip byte-exactly', () => {
    const { signed } = registerSubject({ externalReference: ALIEN_REFERENCE });

    const parsed = JSON.parse(JSON.stringify(signed)) as SignedSovereignManifest;
    expect(parsed.manifest.externalReference).toEqual(ALIEN_REFERENCE);
    expect(sovereignExternalReferencesEqual(parsed.manifest.externalReference!, ALIEN_REFERENCE)).toBe(true);
    expect(canonicalizeJSON(parsed.manifest)).toBe(canonicalizeJSON(signed.manifest));
    expect(computeManifestDigest(parsed.manifest)).toBe(signed.manifestDigest);
  });
});

describe('Sovereign manifest — honest verification without integrity material (SM-02 §21–§23)', () => {
  it('TEST 16 / TEST 17 — a signed external-reference-only manifest verifies, with contentDigest not_performed', async () => {
    const { signed } = registerSubject({ externalReference: ALIEN_REFERENCE });

    const result = await verifySovereignManifest(signed);
    expect(result.checks).toEqual({
      manifestStructure: 'valid',
      manifestDigest: 'valid',
      signature: 'valid',
      contentDigest: 'not_performed',
      issuerBinding: 'not_performed',
    });
    expect(result.valid).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it('TEST 18 — supplying contentBytes for a manifest with no contentIdentity fabricates nothing', async () => {
    const { signed } = registerSubject({ externalReference: ALIEN_REFERENCE });
    const unrelatedBytes = new TextEncoder().encode('bytes the verifier happens to be holding');

    const result = await verifySovereignManifest(signed, { contentBytes: unrelatedBytes });

    expect(result.checks.contentDigest).toBe('not_performed');
    expect(result.checks.contentDigest).not.toBe('valid');
    expect(result.checks.contentDigest).not.toBe('invalid');
    // Absence of an integrity assertion is not an integrity failure.
    expect(result.valid).toBe(true);
    expect(result.reasons).toEqual(['CONTENT_DIGEST_NOT_PERFORMED_NO_CONTENT_IDENTITY']);
    // The manifest is not mutated or back-filled by verification.
    expect('contentIdentity' in signed.manifest).toBe(false);
  });

  it('TEST 19 — wrong bytes against a declared contentIdentity still fail', async () => {
    const { signed } = registerSubject({ externalReference: ALIEN_REFERENCE, contentBytes: PHOTO_BYTES });
    const result = await verifySovereignManifest(signed, {
      contentBytes: new TextEncoder().encode('not the right content'),
    });

    expect(result.checks.contentDigest).toBe('invalid');
    expect(result.reasons).toContain('CONTENT_DIGEST_MISMATCH');
    expect(result.valid).toBe(false);
  });

  it('TEST 20 — correct bytes against a declared contentIdentity still pass', async () => {
    const { signed } = registerSubject({ externalReference: ALIEN_REFERENCE, contentBytes: PHOTO_BYTES });
    const result = await verifySovereignManifest(signed, { contentBytes: PHOTO_BYTES });

    expect(result.checks.contentDigest).toBe('valid');
    expect(result.valid).toBe(true);
  });

  it('still fails closed on an unsupported declared digest algorithm', async () => {
    const { signed } = registerSubject({ contentBytes: PHOTO_BYTES });
    const tampered = {
      ...signed,
      manifest: { ...signed.manifest, contentIdentity: { algorithm: 'sha1' as any, digest: 'a'.repeat(40) } },
    };
    const result = await verifySovereignManifest(tampered, { contentBytes: PHOTO_BYTES });
    expect(result.checks.manifestStructure).toBe('invalid');
    expect(result.reasons).toContain('INVALID_CONTENT_IDENTITY');
    expect(result.valid).toBe(false);
  });
});

describe('Sovereign manifest — the external reference is signed material (SM-02 §20)', () => {
  const tamperCases: Array<[string, (manifest: SovereignManifestV1) => SovereignManifestV1]> = [
    [
      'TEST 21 — externalReference.id',
      (manifest) => ({
        ...manifest,
        externalReference: { ...manifest.externalReference!, id: 'alien-resource-00000' },
      }),
    ],
    [
      'TEST 22 — externalReference.locator',
      (manifest) => ({
        ...manifest,
        externalReference: { ...manifest.externalReference!, locator: 'future://attacker/object/92817' },
      }),
    ],
    [
      'externalReference.namespace',
      (manifest) => ({ ...manifest, externalReference: { ...manifest.externalReference!, namespace: 'alien-system-v48' } }),
    ],
    [
      'externalReference removal',
      (manifest) => {
        const { externalReference: _removed, ...rest } = manifest;
        return rest as SovereignManifestV1;
      },
    ],
  ];

  it.each(tamperCases)('invalidates the manifest digest and signature when %s is mutated after signing', async (
    _label,
    mutate,
  ) => {
    const { signed } = registerSubject({ externalReference: ALIEN_REFERENCE });
    const tampered = { ...signed, manifest: mutate(signed.manifest) };

    const result = await verifySovereignManifest(tampered);
    expect(result.checks.manifestDigest).toBe('invalid');
    expect(result.checks.signature).toBe('invalid');
    expect(result.reasons).toContain('MANIFEST_DIGEST_MISMATCH');
    expect(result.valid).toBe(false);
  });

  it('proves signature scope honestly: a valid signature binds the reference, and claims nothing more', async () => {
    const { signed } = registerSubject({ externalReference: ALIEN_REFERENCE });
    const result = await verifySovereignManifest(signed);

    // What is proven: the signer signed this subject/reference binding.
    expect(result.checks.signature).toBe('valid');
    // What is NOT proven: who the signer is, that the external object
    // exists, that it is reachable, or that anyone owns it.
    expect(result.checks.issuerBinding).toBe('not_performed');
    expect(signed.manifest.registrant).toBe('principal:alice');
    expect(Object.keys(signed.manifest)).not.toContain('owner');
    expect(Object.keys(signed.manifest)).not.toContain('legalOwner');
    expect(signed.manifest.authorityClaims).toEqual([]);
  });
});

describe('Sovereign identity stability across location and integrity change (SM-02 §26, §27)', () => {
  it('TEST 23 — changing the locator in a new manifest version does NOT change the SovereignAssetId', async () => {
    const registry = new InMemorySovereignAssetRegistry();
    const sovereignAssetId = mintSovereignAssetId();
    const baseReference = { namespace: 'future:object-system', id: '92817' } as const;

    const v1 = registerSubject({
      sovereignAssetId,
      externalReference: { ...baseReference, locator: 'future://provider-a/object/92817' },
      manifestVersion: 1,
    });
    const v2 = registerSubject({
      sovereignAssetId,
      externalReference: { ...baseReference, locator: 'future://provider-b/object/92817' },
      manifestVersion: 2,
    });
    registry.register(v1.signed);
    registry.register(v2.signed);

    // Same sovereign identity, same external namespace/id — new address only.
    expect(v2.signed.manifest.sovereignAssetId).toBe(v1.signed.manifest.sovereignAssetId);
    expect(v2.signed.manifest.externalReference?.namespace).toBe(v1.signed.manifest.externalReference?.namespace);
    expect(v2.signed.manifest.externalReference?.id).toBe(v1.signed.manifest.externalReference?.id);
    expect(v2.signed.manifest.externalReference?.locator).not.toBe(v1.signed.manifest.externalReference?.locator);
    expect(v2.signed.manifestDigest).not.toBe(v1.signed.manifestDigest);

    // History is preserved, not rewritten: both versions independently verify.
    const historicalV1 = await resolveSovereignAssetVersion(registry, sovereignAssetId, 1);
    const historicalV2 = await resolveSovereignAssetVersion(registry, sovereignAssetId, 2);
    expect(historicalV1?.manifest.externalReference?.locator).toBe('future://provider-a/object/92817');
    expect(historicalV2?.manifest.externalReference?.locator).toBe('future://provider-b/object/92817');
    expect((await verifySovereignManifest(historicalV1!)).valid).toBe(true);
    expect((await verifySovereignManifest(historicalV2!)).valid).toBe(true);
    expect((await resolveSovereignAsset(registry, sovereignAssetId))?.manifest.manifestVersion).toBe(2);
  });

  it('TEST 24 — adding contentIdentity in a later manifest version does NOT change the SovereignAssetId', async () => {
    const registry = new InMemorySovereignAssetRegistry();
    const sovereignAssetId = mintSovereignAssetId();
    const reference = buildSovereignExternalReference({ namespace: 'example:dataset-catalog', id: 'dataset-92817' });

    const v1 = registerSubject({ sovereignAssetId, externalReference: reference, manifestVersion: 1 });
    const v2 = registerSubject({
      sovereignAssetId,
      externalReference: reference,
      contentBytes: PHOTO_BYTES,
      manifestVersion: 2,
    });
    registry.register(v1.signed);
    registry.register(v2.signed);

    expect(v1.signed.manifest.contentIdentity).toBeUndefined();
    expect(v2.signed.manifest.contentIdentity).toEqual(computeContentIdentity(PHOTO_BYTES));
    expect(v2.signed.manifest.sovereignAssetId).toBe(sovereignAssetId);
    expect(v2.signed.manifestDigest).not.toBe(v1.signed.manifestDigest);

    // Version 1 was not mutated into version 2, and only version 2 is
    // discoverable by content — version 1 asserted no integrity at all.
    const historicalV1 = await resolveSovereignAssetVersion(registry, sovereignAssetId, 1);
    expect(historicalV1?.manifest.contentIdentity).toBeUndefined();
    expect((await verifySovereignManifest(historicalV1!)).checks.contentDigest).toBe('not_performed');
    const contentMatches = registry.findByContentDigest(computeContentIdentity(PHOTO_BYTES));
    expect(contentMatches).toHaveLength(1);
    expect(contentMatches[0]?.manifest.manifestVersion).toBe(2);
  });
});

describe('Universal subject matrix — one generic model, six kinds of thing (SM-02 §28)', () => {
  const subjects: Array<[string, SovereignExternalReference | undefined, Uint8Array | undefined]> = [
    ['SUBJECT A — photo.jpg', undefined, PHOTO_BYTES],
    [
      'TEST 28 / SUBJECT B — AI agent',
      { namespace: 'example:agent-system', id: 'agent-92817', locator: 'agent://runtime/92817' },
      undefined,
    ],
    ['TEST 27 / SUBJECT C — external token', { namespace: 'example:token-network', id: 'token-0xabc-42' }, undefined],
    [
      'TEST 29 / SUBJECT D — API resource',
      { namespace: 'example:api', id: 'customer-resource-92817', locator: 'https://example.invalid/api/resource/92817' },
      undefined,
    ],
    ['TEST 30 / SUBJECT E — building reference', { namespace: 'example:property-registry', id: 'folio-92817' }, undefined],
    ['TEST 26 / SUBJECT F — alien future object', ALIEN_REFERENCE, undefined],
  ];

  it.each(subjects)('%s produces a valid, verifiable sovereign manifest through the same generic model', async (
    _label,
    externalReference,
    contentBytes,
  ) => {
    const { signed, sovereignAssetId } = registerSubject({
      ...(externalReference ? { externalReference } : {}),
      ...(contentBytes ? { contentBytes } : {}),
    });

    const parsed = JSON.parse(JSON.stringify(signed)) as SignedSovereignManifest;
    const result = await verifySovereignManifest(parsed, ...(contentBytes ? [{ contentBytes }] : []));

    expect(result.valid).toBe(true);
    expect(result.checks.manifestStructure).toBe('valid');
    expect(result.checks.manifestDigest).toBe('valid');
    expect(result.checks.signature).toBe('valid');
    expect(result.checks.contentDigest).toBe(contentBytes ? 'valid' : 'not_performed');
    expect(parsed.manifest.sovereignAssetId).toBe(sovereignAssetId);
    if (externalReference) {
      expect(parsed.manifest.externalReference).toEqual(externalReference);
      expect(parsed.manifest.contentIdentity).toBeUndefined();
    }
  });

  it('TEST 26 — the alien object works with zero Protocol modification, end to end', async () => {
    const sovereignAssetId = mintSovereignAssetId();
    const externalReference = buildSovereignExternalReference({
      namespace: 'alien-system-v47',
      id: 'alien-resource-92817',
      locator: 'future://provider/object/92817',
    });
    const manifest = buildSovereignManifestV1({
      sovereignAssetId,
      externalReference,
      registrant: 'principal:alice',
      // deliberately NO contentIdentity
    });
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const signed = signSovereignManifest(manifest, privateKeyPem, signingKey);

    const roundTripped = JSON.parse(JSON.stringify(signed)) as SignedSovereignManifest;
    const result = await verifySovereignManifest(roundTripped);

    expect(roundTripped.manifest.sovereignAssetId).toBe(sovereignAssetId);
    expect(roundTripped.manifest.externalReference).toEqual({
      namespace: 'alien-system-v47',
      id: 'alien-resource-92817',
      locator: 'future://provider/object/92817',
    });
    expect(roundTripped.manifest.contentIdentity).toBeUndefined();
    expect(result.checks).toEqual({
      manifestStructure: 'valid',
      manifestDigest: 'valid',
      signature: 'valid',
      contentDigest: 'not_performed',
      issuerBinding: 'not_performed',
    });
    expect(result.valid).toBe(true);
  });
});

describe('Token / building architectural test — two independent identities, no relationship asserted (SM-02 §48)', () => {
  it('identifies an external token and a physical building separately, tokenizing neither', () => {
    const token = registerSubject({
      externalReference: { namespace: 'example:external-token-system', id: 'external-token-92817' },
    });
    const building = registerSubject({
      externalReference: { namespace: 'example:property-registry', id: 'property-442' },
    });

    // X and Y are separate sovereign identities.
    expect(token.sovereignAssetId).not.toBe(building.sovereignAssetId);
    expect(validateSovereignManifestV1(token.manifest).valid).toBe(true);
    expect(validateSovereignManifestV1(building.manifest).valid).toBe(true);

    // Nothing in either manifest asserts that one represents the other:
    // there is no relationship field, and no claim was made.
    const canonicalToken = canonicalizeJSON(token.manifest);
    expect(canonicalToken).not.toContain(building.sovereignAssetId);
    expect(canonicalizeJSON(building.manifest)).not.toContain(token.sovereignAssetId);
    expect(token.manifest.authorityClaims).toEqual([]);
    expect(building.manifest.authorityClaims).toEqual([]);
    for (const field of ['represents', 'backedBy', 'derivedFrom', 'parentId', 'ownedBy', 'transferredFrom']) {
      expect(Object.keys(token.manifest)).not.toContain(field);
      expect(Object.keys(building.manifest)).not.toContain(field);
    }
  });
});

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function protocolSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return protocolSourceFiles(path);
    return entry.endsWith('.ts') ? [path] : [];
  });
}

describe('TEST 25 — locators are passive data: Protocol performs no external I/O (SM-02 §13)', () => {
  it('contains no network, fetch, or resolution primitive anywhere in the Protocol source', () => {
    const offenders: string[] = [];
    for (const file of protocolSourceFiles(resolve(__dirname, '../../packages/protocol/src'))) {
      const code = stripComments(readFileSync(file, 'utf8'));
      if (
        /\bfetch\s*\(|XMLHttpRequest|\bnode:(?:http|https|net|dns|tls|dgram)\b|require\(\s*['"](?:http|https|net|dns|tls|undici|axios|node-fetch)['"]|from\s+['"](?:http|https|net|dns|tls|undici|axios|node-fetch)['"]/.test(
          code,
        )
      ) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('never dereferences a locator while building, signing, serializing or verifying', async () => {
    const originalFetch = globalThis.fetch;
    const fetchSpy = jest.fn(() => {
      throw new Error('Protocol must never dereference a locator');
    });
    (globalThis as { fetch?: unknown }).fetch = fetchSpy;
    try {
      const { signed } = registerSubject({ externalReference: ALIEN_REFERENCE });
      const parsed = JSON.parse(JSON.stringify(signed)) as SignedSovereignManifest;
      const result = await verifySovereignManifest(parsed, { contentBytes: PHOTO_BYTES });
      expect(result.checks.signature).toBe('valid');
      // The locator was carried and signed, never contacted, and its
      // unreachability never affected the verification outcome.
      expect(result.checks.contentDigest).toBe('not_performed');
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });
});
