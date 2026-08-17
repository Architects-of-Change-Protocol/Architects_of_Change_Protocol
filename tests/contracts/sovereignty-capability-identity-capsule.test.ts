import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { canonicalizeJSON } from '@aoc/protocol/canonical';
import {
  buildSovereignExternalReference,
  computeContentIdentity,
  isValidContentIdentity,
  isValidSovereignAssetId,
  isValidSovereignSubjectRef,
  mintSovereignAssetId,
  sovereignExternalReferencesEqual,
  type ContentIdentity,
  type SovereignExternalReference,
} from '@aoc/protocol/identity';
import { validateSovereignManifestV1 } from '@aoc/protocol/manifest';
import type { SovereignManifestV1 } from '@aoc/protocol/manifest';
import {
  IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES,
  SOVEREIGNTY_CAPABILITY_IDS,
  SovereigntyCapabilityInvocationError,
  buildSovereigntyCapabilityInvocation,
  createIdentitySovereigntyCapabilityImplementation,
  getSovereigntyCapability,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isSovereigntyCapabilityInvocationError,
  isValidIdentitySovereigntyCapabilityInput,
  isValidSovereigntyCapabilityInvocationEvidence,
  validateIdentitySovereigntyCapabilityInput,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  IdentitySovereigntyCapabilityInput,
  IdentitySovereigntyCapabilityOutput,
  SovereigntyCapabilityRef,
  SovereigntyCapabilityResult,
  SovereigntyCapabilitySuccessResult,
} from '@aoc/protocol/sovereignty-capabilities';

const IDENTITY_REF = getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef;

const REGISTRANT = 'principal:sm04-registrant';

const identity = () => createIdentitySovereigntyCapabilityImplementation();

/** A deterministic clock, so `createdAt` is a fact under test rather than wall time. */
const fixedClock = (iso: string) => () => new Date(iso);

const invokeIdentity = async (
  input: unknown,
  extras: { subject?: { sovereignAssetId: string }; correlationId?: string } = {},
  implementation = identity(),
): Promise<SovereigntyCapabilityResult<IdentitySovereigntyCapabilityOutput>> =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: IDENTITY_REF,
      input: input as IdentitySovereigntyCapabilityInput,
      ...(extras.subject === undefined ? {} : { subject: extras.subject }),
      ...(extras.correlationId === undefined ? {} : { correlationId: extras.correlationId }),
    }),
    implementation,
  );

const succeed = (
  result: SovereigntyCapabilityResult<IdentitySovereigntyCapabilityOutput>,
): SovereigntyCapabilitySuccessResult<IdentitySovereigntyCapabilityOutput> => {
  if (result.status !== 'succeeded') {
    throw new Error(`expected success, got failure: ${result.reasonCodes.join(', ')}`);
  }
  return result;
};

const alienReference = (): SovereignExternalReference =>
  buildSovereignExternalReference({
    namespace: 'alien-system-v47',
    id: 'alien-resource-92817',
    locator: 'future://provider/object/92817',
  });

const capsuleFile = (name: string): string =>
  readFileSync(
    join(__dirname, '..', '..', 'packages', 'protocol', 'src', 'sovereignty-capabilities', 'capsules', name),
    'utf8',
  );

/**
 * The capsule source with comments stripped. These are assertions about what
 * the capsule *does*, so prose that names a primitive in order to explain why
 * it is deliberately not called must not be mistaken for a call to it.
 */
const capsuleSource = (name: string): string =>
  capsuleFile(name)
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');

describe('SM-04 / Identity capsule identity and version (IDENTITY TESTS 1-2)', () => {
  it('TEST 1 — advertises the canonical AOC.IDENTITY ref', () => {
    expect(identity().capability.id).toBe(SOVEREIGNTY_CAPABILITY_IDS.identity);
    expect(identity().capability.id).toBe('aoc:sovereignty-capability:identity');
  });

  it('TEST 2 — takes its capability version from the canonical SM-01 registry', () => {
    const definition = getSovereigntyCapability(SOVEREIGNTY_CAPABILITY_IDS.identity);
    expect(definition).toBeDefined();
    expect(identity().capability.version).toBe(definition?.version);
    expect(identity().capability).toEqual(IDENTITY_REF);
  });

  it('TEST 2b — no capability id or version literal is hand-written in the capsule source', () => {
    const source = capsuleSource('identity.ts');
    expect(source).not.toMatch(/aoc:sovereignty-capability:identity/);
    expect(source).not.toMatch(/version\s*:\s*['"]\d+\.\d+\.\d+['"]/);
    expect(source).toMatch(/requireSovereigntyCapabilityRef\('identity'\)/);
  });
});

describe('SM-04 / Identity creates a subject (IDENTITY TESTS 3-9)', () => {
  it('TEST 3 — an invocation with no subject succeeds', async () => {
    const result = await invokeIdentity({ registrant: REGISTRANT });
    expect(result.status).toBe('succeeded');
  });

  it('TEST 4 — an invocation that already names a subject is an expected failed outcome', async () => {
    const result = await invokeIdentity(
      { registrant: REGISTRANT },
      { subject: { sovereignAssetId: mintSovereignAssetId() } },
    );
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('unreachable');
    expect(result.reasonCodes).toEqual([IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES.subjectAlreadyExists]);
    expect(result.reasonCodes).toEqual(['IDENTITY_SUBJECT_ALREADY_EXISTS']);
    // Not an exception, and the pre-existing subject is neither replaced nor re-minted.
    expect(result.evidence.outcome).toBe('failed');
  });

  it('TEST 4b — the pre-existing subject is preserved, not superseded by a new mint', async () => {
    const existing = { sovereignAssetId: mintSovereignAssetId() };
    const result = await invokeIdentity({ registrant: REGISTRANT }, { subject: existing });
    expect(result.subject?.sovereignAssetId).toBe(existing.sovereignAssetId);
  });

  it('TEST 5 — a successful invocation mints a valid SovereignAssetId', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT }));
    expect(isValidSovereignAssetId(result.output.subject.sovereignAssetId)).toBe(true);
    expect(result.output.subject.sovereignAssetId).toMatch(/^aoc:sovereign-asset:/);
  });

  it('TEST 6 — two identical invocations mint distinct SovereignAssetIds', async () => {
    const input = { registrant: REGISTRANT, externalReference: alienReference() };
    const first = succeed(await invokeIdentity(input));
    const second = succeed(await invokeIdentity(input));
    expect(first.output.subject.sovereignAssetId).not.toBe(second.output.subject.sovereignAssetId);
    // Identity creation is not content-addressed and is never de-duplicated by
    // external reference, content identity or registrant.
    expect(first.output.manifest.externalReference).toEqual(second.output.manifest.externalReference);
  });

  it('TEST 7 — the output contains a valid SovereignSubjectRef', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference: alienReference() }));
    expect(isValidSovereignSubjectRef(result.output.subject)).toBe(true);
  });

  it('TEST 8 — the output contains a valid SovereignManifestV1', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT }));
    expect(validateSovereignManifestV1(result.output.manifest)).toEqual({ valid: true, reasons: [] });
    expect(result.output.manifest.schemaVersion).toBe('aoc-sovereign-manifest/1');
  });

  it('TEST 9 — the output subject id equals the manifest sovereignAssetId', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference: alienReference() }));
    expect(result.output.subject.sovereignAssetId).toBe(result.output.manifest.sovereignAssetId);
  });
});

describe('SM-04 / Identity external reference and content identity (IDENTITY TESTS 10-14)', () => {
  it('TEST 10 — an external reference is preserved exactly', async () => {
    const externalReference = alienReference();
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference }));
    expect(result.output.manifest.externalReference).toEqual(externalReference);
    expect(result.output.subject.externalReference).toEqual(result.output.manifest.externalReference);
    expect(
      sovereignExternalReferencesEqual(result.output.manifest.externalReference!, externalReference),
    ).toBe(true);
    expect(result.output.manifest.externalReference?.locator).toBe('future://provider/object/92817');
  });

  it('TEST 11 — no external reference stays structurally absent', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT }));
    expect('externalReference' in result.output.manifest).toBe(false);
    expect('externalReference' in result.output.subject).toBe(false);
    expect(canonicalizeJSON(result.output.manifest)).not.toContain('externalReference');
  });

  it('TEST 12 — no ContentIdentity stays structurally absent (never `undefined`)', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference: alienReference() }));
    expect('contentIdentity' in result.output.manifest).toBe(false);
    expect(canonicalizeJSON(result.output.manifest)).not.toContain('contentIdentity');
  });

  it('TEST 13 — a supplied valid ContentIdentity is bound unchanged', async () => {
    const bytes = new TextEncoder().encode('hello sovereign world');
    const contentIdentity = computeContentIdentity(bytes);
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, contentIdentity }));
    expect(result.output.manifest.contentIdentity).toEqual(contentIdentity);
    expect(result.output.manifest.contentIdentity?.digest).toBe(contentIdentity.digest);
    expect(isValidContentIdentity(result.output.manifest.contentIdentity)).toBe(true);
  });

  it('TEST 14 — Identity does not compute a ContentIdentity, and never fabricates one', async () => {
    // Whatever the caller declares is what is bound: a digest of *different*
    // bytes travels through untouched, which is only possible if nothing here
    // hashes anything.
    const declared = computeContentIdentity(new TextEncoder().encode('some other bytes entirely'));
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, contentIdentity: declared }));
    expect(result.output.manifest.contentIdentity).toEqual(declared);

    const source = capsuleSource('identity.ts');
    expect(source).not.toMatch(/computeContentIdentity/);
    expect(source).not.toMatch(/verifyContentIdentity/);
    expect(source).not.toMatch(/createHash|sha256/);
  });
});

describe('SM-04 / Identity open-world subjects (IDENTITY TESTS 15-19)', () => {
  it('TEST 15 — an identity-only manifest (no external reference, no content identity) works', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT }));
    expect(validateSovereignManifestV1(result.output.manifest).valid).toBe(true);
    expect('externalReference' in result.output.manifest).toBe(false);
    expect('contentIdentity' in result.output.manifest).toBe(false);
  });

  it('TEST 16 — a physical property-registry reference works, claiming no title', async () => {
    const externalReference = buildSovereignExternalReference({
      namespace: 'example:property-registry',
      id: 'property-442',
    });
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference }));
    expect(result.output.manifest.externalReference).toEqual(externalReference);
    // The record says "this AOC subject references this external identifier"
    // and nothing about ownership or legal title.
    const serialized = canonicalizeJSON(result.output.manifest);
    for (const term of ['owner', 'legalOwner', 'title', 'deed']) {
      expect(serialized).not.toContain(term);
    }
  });

  it('TEST 16b — a folio-style property reference works without any domain code', async () => {
    const externalReference = buildSovereignExternalReference({
      namespace: 'example:property-registry',
      id: 'folio-92817',
    });
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference }));
    expect(result.output.manifest.externalReference?.id).toBe('folio-92817');
    expect('contentIdentity' in result.output.manifest).toBe(false);
  });

  it('TEST 17 — an external token reference works, without minting or validating any token', async () => {
    const externalReference = buildSovereignExternalReference({
      namespace: 'example:external-token-system',
      id: 'external-token-92817',
    });
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference }));
    expect(result.output.manifest.externalReference).toEqual(externalReference);
    expect(isValidSovereignAssetId(result.output.manifest.sovereignAssetId)).toBe(true);
    // The AOC identity is independent of the external token's identifier.
    expect(result.output.manifest.sovereignAssetId).not.toContain('external-token-92817');
  });

  it('TEST 18 — an alien future namespace works with no Protocol change', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference: alienReference() }));
    expect(result.output.manifest.externalReference?.namespace).toBe('alien-system-v47');
    expect(result.output.manifest.externalReference?.id).toBe('alien-resource-92817');
  });

  it('TEST 19 — a `future://` locator survives without ever being dereferenced', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference: alienReference() }));
    expect(result.output.manifest.externalReference?.locator).toBe('future://provider/object/92817');

    const source = capsuleSource('identity.ts');
    for (const term of ['fetch(', 'http', 'XMLHttpRequest', 'node:https', 'node:http', 'node:net', 'node:fs']) {
      expect(source).not.toContain(term);
    }
  });
});

describe('SM-04 / Identity mineral boundaries (IDENTITY TESTS 20-23)', () => {
  it('TEST 20 — the registrant stays a registrant and no owner field is introduced', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT }));
    expect(result.output.manifest.registrant).toBe(REGISTRANT);
    expect('owner' in result.output.manifest).toBe(false);
    expect('legalOwner' in result.output.manifest).toBe(false);
    expect('beneficialOwner' in result.output.manifest).toBe(false);

    const source = capsuleSource('identity.ts');
    expect(source).not.toMatch(/\bowner\s*:/);
  });

  it('TEST 21 — no provenance claim is auto-created', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference: alienReference() }));
    expect(result.output.manifest.authorityClaims).toEqual([]);
    expect('originClaim' in result.output.manifest).toBe(false);

    const source = capsuleSource('identity.ts');
    for (const term of ['OriginClaim', 'AuthorityClaim', 'derivedFrom', 'parentId', 'lineage', 'contestClaim']) {
      expect(source).not.toContain(`${term}(`);
    }
    expect(source).not.toMatch(/originClaim\s*:/);
  });

  it('TEST 22 — no signing key is generated and no signing primitive is reachable', () => {
    const source = capsuleSource('identity.ts');
    for (const term of [
      'generateSovereignKeyPair',
      'signSovereignManifest',
      'signSovereignPayload',
      'verifySovereignSignature',
      'verifySovereignManifest',
      'privateKey',
      'secretKey',
      'seedPhrase',
      'walletSecret',
    ]) {
      expect(source).not.toContain(term);
    }
  });

  it('TEST 23 — the output manifest is unsigned', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT }));
    const manifest: SovereignManifestV1 = result.output.manifest;
    expect('proof' in manifest).toBe(false);
    expect('manifestDigest' in manifest).toBe(false);
    expect('signature' in manifest).toBe(false);
    expect('proof' in result.output).toBe(false);
    expect(Object.keys(result.output).sort()).toEqual(['manifest', 'subject']);
  });

  it('TEST 23b — no licensing, governance or policy semantics enter input or output', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT }));
    const serialized = canonicalizeJSON(result.output.manifest);
    for (const term of ['permissions', 'restrictions', 'terms', 'pricing', 'grant', 'policy', 'approval']) {
      expect(serialized).not.toContain(term);
    }
  });
});

describe('SM-04 / Identity common result and evidence (IDENTITY TESTS 24-27)', () => {
  it('TEST 24 — the common result subject is the newly created subject', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference: alienReference() }));
    expect(result.subject).toEqual(result.output.subject);
    expect(result.subject?.sovereignAssetId).toBe(result.output.manifest.sovereignAssetId);
  });

  it('TEST 25 — the common evidence subject is the newly created subject', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT, externalReference: alienReference() }));
    expect(result.evidence.subject?.sovereignAssetId).toBe(result.output.subject.sovereignAssetId);
    expect(result.evidence.subject?.externalReference?.id).toBe('alien-resource-92817');
    expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
  });

  it('TEST 26 — the common evidence carries the exact canonical Identity id and version', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT }));
    expect(result.evidence.capability).toEqual(IDENTITY_REF);
    expect(result.evidence.capability.id).toBe('aoc:sovereignty-capability:identity');
    expect(result.evidence.capability.version).toBe(
      getSovereigntyCapability(SOVEREIGNTY_CAPABILITY_IDS.identity)?.version,
    );
    expect(result.evidence.outcome).toBe('succeeded');
    expect(result.evidence.invocationId).toBe(result.invocationId);
  });

  it('TEST 27 — the common evidence excludes the manifest, the registrant payload and the input', async () => {
    const contentIdentity = computeContentIdentity(new TextEncoder().encode('hello sovereign world'));
    const result = succeed(
      await invokeIdentity({ registrant: REGISTRANT, externalReference: alienReference(), contentIdentity }),
    );
    const serialized = JSON.stringify(result.evidence);
    for (const term of [
      'manifest',
      'registrant',
      'contentIdentity',
      contentIdentity.digest,
      REGISTRANT,
      'authorityClaims',
      'createdAt',
      'schemaVersion":"aoc-sovereign-manifest',
    ]) {
      expect(serialized).not.toContain(term);
    }
    expect('evidenceRefs' in result.evidence).toBe(false);
    // Portable: the record round-trips through canonical JSON unchanged.
    expect(canonicalizeJSON(JSON.parse(serialized))).toBe(canonicalizeJSON(result.evidence));
  });
});

describe('SM-04 / Identity expected failures (IDENTITY TESTS 28-29)', () => {
  it('TEST 28 — a malformed external reference is an expected failed outcome', async () => {
    const result = await invokeIdentity({ registrant: REGISTRANT, externalReference: { namespace: '  ', id: '' } });
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('unreachable');
    expect(result.reasonCodes).toEqual(['IDENTITY_INVALID_EXTERNAL_REFERENCE']);
    expect(result.evidence.reasonCodes).toEqual(['IDENTITY_INVALID_EXTERNAL_REFERENCE']);
  });

  it('TEST 29 — a malformed ContentIdentity is an expected failed outcome', async () => {
    const result = await invokeIdentity({
      registrant: REGISTRANT,
      contentIdentity: { algorithm: 'sha256', digest: 'not-a-digest' } as unknown as ContentIdentity,
    });
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('unreachable');
    expect(result.reasonCodes).toEqual(['IDENTITY_INVALID_CONTENT_IDENTITY']);
  });

  it('TEST 29b — a present-but-undefined optional is rejected, never treated as absent', async () => {
    const result = await invokeIdentity({ registrant: REGISTRANT, contentIdentity: undefined });
    expect(result.status).toBe('failed');
  });

  it('TEST 29c — a malformed registrant is an expected failed outcome, and reasons accumulate', async () => {
    const blank = await invokeIdentity({ registrant: '   ' });
    expect(blank.status).toBe('failed');
    if (blank.status !== 'failed') throw new Error('unreachable');
    expect(blank.reasonCodes).toEqual(['IDENTITY_INVALID_REGISTRANT']);

    const both = await invokeIdentity({ registrant: 42, externalReference: { namespace: '', id: '' } });
    if (both.status !== 'failed') throw new Error('unreachable');
    expect([...both.reasonCodes].sort()).toEqual([
      'IDENTITY_INVALID_EXTERNAL_REFERENCE',
      'IDENTITY_INVALID_REGISTRANT',
    ]);
  });

  it('TEST 29d — a non-object input is reported as invalid input, not thrown', async () => {
    const result = await invokeIdentity('not an object');
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('unreachable');
    expect(result.reasonCodes).toEqual(['IDENTITY_INVALID_INPUT']);
  });
});

describe('SM-04 / Identity unexpected faults (IDENTITY TEST 30)', () => {
  it('TEST 30 — a primitive fault after validation follows SM-03 fault semantics, with no retry', async () => {
    let clockCalls = 0;
    const implementation = createIdentitySovereigntyCapabilityImplementation({
      clock: () => {
        clockCalls += 1;
        throw new Error('simulated primitive fault');
      },
    });

    const invocation = buildSovereigntyCapabilityInvocation({
      capability: IDENTITY_REF,
      input: { registrant: REGISTRANT } as IdentitySovereigntyCapabilityInput,
    });

    await expect(invokeSovereigntyCapability(invocation, implementation)).rejects.toThrow(
      SovereigntyCapabilityInvocationError,
    );

    // Exactly one execution: the fault is never retried into a second mint.
    expect(clockCalls).toBe(1);

    try {
      await invokeSovereigntyCapability(invocation, implementation);
      throw new Error('expected a typed invocation fault');
    } catch (error) {
      expect(isSovereigntyCapabilityInvocationError(error)).toBe(true);
      if (!isSovereigntyCapabilityInvocationError(error)) throw error;
      expect(error.code).toBe('SOVEREIGNTY_CAPABILITY_IMPLEMENTATION_ERROR');
      expect(error.details.reasonCodes).toContain('SOVEREIGNTY_CAPABILITY_IMPLEMENTATION_ERROR');
      // The fault is not laundered into an ordinary Identity failure.
      expect(error.details.reasonCodes).not.toContain('IDENTITY_INVALID_INPUT');
      expect(JSON.stringify(error.evidence)).not.toContain('simulated primitive fault');
    }
  });
});

describe('SM-04 / Identity contract surface and determinism', () => {
  it('exposes a public input validator that reuses the nested Protocol validators', () => {
    expect(isValidIdentitySovereigntyCapabilityInput({ registrant: REGISTRANT })).toBe(true);
    expect(isValidIdentitySovereigntyCapabilityInput({ registrant: { id: 'p:1', kind: 'Organization' } })).toBe(true);
    expect(isValidIdentitySovereigntyCapabilityInput({})).toBe(false);
    expect(validateIdentitySovereigntyCapabilityInput(null)).toEqual({
      valid: false,
      reasons: ['IDENTITY_INVALID_INPUT'],
    });
  });

  it('uses the injected clock for createdAt rather than the caller-supplied requestedAt', async () => {
    const implementation = createIdentitySovereigntyCapabilityImplementation({
      clock: fixedClock('2031-05-04T00:00:00.000Z'),
    });
    const result = succeed(
      await invokeSovereigntyCapability(
        buildSovereigntyCapabilityInvocation({
          capability: IDENTITY_REF,
          requestedAt: '2020-01-01T00:00:00.000Z',
          input: { registrant: REGISTRANT } as IdentitySovereigntyCapabilityInput,
        }),
        implementation,
      ),
    );
    expect(result.output.manifest.createdAt).toBe('2031-05-04T00:00:00.000Z');
    expect(result.output.manifest.createdAt).not.toBe(result.evidence.requestedAt);
  });

  it('starts a new identity at the canonical initial manifest version and state', async () => {
    const result = succeed(await invokeIdentity({ registrant: REGISTRANT }));
    expect(result.output.manifest.manifestVersion).toBe(1);
    expect(result.output.manifest.state).toBe('active');
  });

  it('does not accept a caller-supplied sovereignAssetId, manifestVersion or state as identity', async () => {
    const attempted = mintSovereignAssetId();
    const result = succeed(
      await invokeIdentity({
        registrant: REGISTRANT,
        sovereignAssetId: attempted,
        manifestVersion: 47,
        state: 'withdrawn',
      }),
    );
    expect(result.output.manifest.sovereignAssetId).not.toBe(attempted);
    expect(result.output.manifest.manifestVersion).toBe(1);
    expect(result.output.manifest.state).toBe('active');
  });

  it('does not mutate the caller input object', async () => {
    const externalReference = alienReference();
    const input = { registrant: REGISTRANT, externalReference };
    const snapshot = JSON.stringify(input);
    await invokeIdentity(input);
    expect(JSON.stringify(input)).toBe(snapshot);
    expect(Object.isFrozen(externalReference)).toBe(false);
  });

  it('has no import-time side effects and registers nothing globally', () => {
    const source = capsuleSource('identity.ts');
    for (const term of ['registerImplementation', 'globalThis', 'process.env', 'registerIdentityCapability']) {
      expect(source).not.toContain(term);
    }
    // The capsule exposes no execution path that bypasses the common invoker.
    expect(source).not.toMatch(/\bexport function execute/);
  });
});
