import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { canonicalizeJSON } from '@aoc/protocol/canonical';
import {
  buildSovereignExternalReference,
  computeContentIdentity,
  mintSovereignAssetId,
  type ContentIdentity,
  type SovereignSubjectRef,
} from '@aoc/protocol/identity';
import { buildSovereignManifestV1, computeManifestDigest } from '@aoc/protocol/manifest';
import type { SovereignManifestV1 } from '@aoc/protocol/manifest';
import {
  INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  SOVEREIGNTY_CAPABILITY_IDS,
  SovereigntyCapabilityInvocationError,
  buildSovereigntyCapabilityInvocation,
  createIntegritySovereigntyCapabilityImplementation,
  getSovereigntyCapability,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isSovereigntyCapabilityInvocationError,
  isValidIntegritySovereigntyCapabilityInput,
  isValidSovereigntyCapabilityInvocationEvidence,
  validateIntegritySovereigntyCapabilityInput,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  ComputeContentIdentityIntegrityOutput,
  ComputeManifestDigestIntegrityOutput,
  IntegritySovereigntyCapabilityInput,
  IntegritySovereigntyCapabilityOutput,
  SovereigntyCapabilityImplementation,
  SovereigntyCapabilityRef,
  SovereigntyCapabilityResult,
  SovereigntyCapabilitySuccessResult,
  VerifyContentIdentityIntegrityOutput,
} from '@aoc/protocol/sovereignty-capabilities';

const INTEGRITY_REF = getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef;

const integrity = () => createIntegritySovereigntyCapabilityImplementation();

const BYTES_A = new TextEncoder().encode('hello sovereign world');
const BYTES_B = new TextEncoder().encode('hello sovereign world.');

const invokeIntegrity = async (
  input: unknown,
  extras: { subject?: SovereignSubjectRef; correlationId?: string } = {},
): Promise<SovereigntyCapabilityResult<IntegritySovereigntyCapabilityOutput>> =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: INTEGRITY_REF,
      input: input as IntegritySovereigntyCapabilityInput,
      ...(extras.subject === undefined ? {} : { subject: extras.subject }),
      ...(extras.correlationId === undefined ? {} : { correlationId: extras.correlationId }),
    }),
    integrity(),
  );

const succeed = (
  result: SovereigntyCapabilityResult<IntegritySovereigntyCapabilityOutput>,
): SovereigntyCapabilitySuccessResult<IntegritySovereigntyCapabilityOutput> => {
  if (result.status !== 'succeeded') {
    throw new Error(`expected success, got failure: ${result.reasonCodes.join(', ')}`);
  }
  return result;
};

const computed = (output: IntegritySovereigntyCapabilityOutput): ComputeContentIdentityIntegrityOutput => {
  if (output.operation !== 'compute-content-identity') throw new Error('wrong operation');
  return output;
};
const verified = (output: IntegritySovereigntyCapabilityOutput): VerifyContentIdentityIntegrityOutput => {
  if (output.operation !== 'verify-content-identity') throw new Error('wrong operation');
  return output;
};
const digested = (output: IntegritySovereigntyCapabilityOutput): ComputeManifestDigestIntegrityOutput => {
  if (output.operation !== 'compute-manifest-digest') throw new Error('wrong operation');
  return output;
};

const subjectWithLocator = (locator: string): SovereignSubjectRef => ({
  sovereignAssetId: mintSovereignAssetId(),
  externalReference: buildSovereignExternalReference({
    namespace: 'alien-system-v47',
    id: 'alien-resource-92817',
    locator,
  }),
});

const validManifest = (): SovereignManifestV1 =>
  buildSovereignManifestV1({
    sovereignAssetId: mintSovereignAssetId(),
    registrant: 'principal:sm04-registrant',
    externalReference: buildSovereignExternalReference({
      namespace: 'example:property-registry',
      id: 'property-442',
    }),
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

describe('SM-04 / Integrity capsule identity and version (INTEGRITY TESTS 1-2)', () => {
  it('TEST 1 — advertises the canonical AOC.INTEGRITY ref', () => {
    expect(integrity().capability.id).toBe(SOVEREIGNTY_CAPABILITY_IDS.integrity);
    expect(integrity().capability.id).toBe('aoc:sovereignty-capability:integrity');
  });

  it('TEST 2 — takes its capability version from the canonical SM-01 registry', () => {
    const definition = getSovereigntyCapability(SOVEREIGNTY_CAPABILITY_IDS.integrity);
    expect(integrity().capability.version).toBe(definition?.version);
    expect(integrity().capability).toEqual(INTEGRITY_REF);
  });

  it('TEST 2b — no capability id or version literal is hand-written in the capsule source', () => {
    const source = capsuleSource('integrity.ts');
    expect(source).not.toMatch(/aoc:sovereignty-capability:integrity/);
    expect(source).not.toMatch(/version\s*:\s*['"]\d+\.\d+\.\d+['"]/);
    expect(source).toMatch(/requireSovereigntyCapabilityRef\('integrity'\)/);
  });

  it('TEST 2c — the supported operation set is closed for this capability version', () => {
    expect([...INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS]).toEqual([
      'compute-content-identity',
      'verify-content-identity',
      'compute-manifest-digest',
    ]);
  });
});

describe('SM-04 / Integrity computes content identity (INTEGRITY TESTS 3-7)', () => {
  it('TEST 3 — compute works with no subject at all', async () => {
    const result = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }));
    expect(result.subject).toBeUndefined();
    expect('subject' in result).toBe(false);
    expect(computed(result.output).contentIdentity.algorithm).toBe('sha256');
  });

  it('TEST 4 — compute works with a subject supplied as context', async () => {
    const subject = subjectWithLocator('future://provider/object/92817');
    const result = succeed(
      await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }, { subject }),
    );
    expect(result.subject?.sovereignAssetId).toBe(subject.sovereignAssetId);
    expect(computed(result.output).contentIdentity).toEqual(computeContentIdentity(BYTES_A));
  });

  it('TEST 5 — the capability output exactly equals the computeContentIdentity primitive', async () => {
    const direct = computeContentIdentity(BYTES_A);
    const result = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }));
    expect(computed(result.output).contentIdentity).toEqual(direct);
    expect(computed(result.output).contentIdentity.digest).toBe(direct.digest);
  });

  it('TEST 6 — the same bytes produce the same digest', async () => {
    const first = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }));
    const second = succeed(
      await invokeIntegrity({ operation: 'compute-content-identity', bytes: new TextEncoder().encode('hello sovereign world') }),
    );
    expect(computed(first.output).contentIdentity).toEqual(computed(second.output).contentIdentity);
    expect(first.invocationId).not.toBe(second.invocationId);
  });

  it('TEST 7 — different bytes produce different digests', async () => {
    const a = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }));
    const b = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_B }));
    expect(computed(a.output).contentIdentity.digest).not.toBe(computed(b.output).contentIdentity.digest);
  });
});

describe('SM-04 / Integrity is independent of subject and location (INTEGRITY TESTS 8-11)', () => {
  it('TEST 8 — the same bytes under different subjects produce the same digest', async () => {
    const subjectA = subjectWithLocator('future://provider/object/1');
    const subjectB = subjectWithLocator('future://provider/object/2');
    const a = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }, { subject: subjectA }));
    const b = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }, { subject: subjectB }));

    expect(computed(a.output).contentIdentity).toEqual(computed(b.output).contentIdentity);
    expect(a.invocationId).not.toBe(b.invocationId);
    expect(a.evidence.subject?.sovereignAssetId).not.toBe(b.evidence.subject?.sovereignAssetId);
    expect(a.evidence.subject?.sovereignAssetId).toBe(subjectA.sovereignAssetId);
  });

  it('TEST 9 — changing only the locator does not change the content digest', async () => {
    const base = mintSovereignAssetId();
    const at = (locator: string): SovereignSubjectRef => ({
      sovereignAssetId: base,
      externalReference: buildSovereignExternalReference({
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator,
      }),
    });
    const here = succeed(
      await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }, { subject: at('future://a/1') }),
    );
    const there = succeed(
      await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }, { subject: at('future://b/2') }),
    );
    expect(computed(here.output).contentIdentity).toEqual(computed(there.output).contentIdentity);
  });

  it('TEST 10 — the caller bytes are not mutated', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);
    const before = Array.from(bytes);
    await invokeIntegrity({ operation: 'compute-content-identity', bytes });
    expect(Array.from(bytes)).toEqual(before);
    expect(Object.isFrozen(bytes)).toBe(false);
    expect(bytes.byteLength).toBe(5);
  });

  it('TEST 11 — the common layer does not canonicalize, copy or re-encode the bytes', async () => {
    const bytes = new Uint8Array([0xff, 0x00, 0xfe, 0x80]);
    let seen: Uint8Array | undefined;
    const spy: SovereigntyCapabilityImplementation<
      IntegritySovereigntyCapabilityInput,
      IntegritySovereigntyCapabilityOutput
    > = {
      capability: INTEGRITY_REF,
      async invoke(invocation) {
        const input = invocation.input;
        if (input.operation !== 'compute-content-identity') throw new Error('wrong operation');
        seen = input.bytes;
        return {
          status: 'succeeded',
          output: { operation: 'compute-content-identity', contentIdentity: computeContentIdentity(input.bytes) },
        };
      },
    };
    const spyInput: IntegritySovereigntyCapabilityInput = { operation: 'compute-content-identity', bytes };
    await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({ capability: INTEGRITY_REF, input: spyInput }),
      spy,
    );
    // Reference identity, not merely structural equality: nothing copied it.
    expect(seen).toBe(bytes);

    // And non-UTF-8 bytes hash to the same value through the capsule.
    const result = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes }));
    expect(computed(result.output).contentIdentity).toEqual(computeContentIdentity(bytes));
  });
});

describe('SM-04 / Integrity verification (INTEGRITY TESTS 12-16)', () => {
  it('TEST 12 — matching bytes: execution succeeded, check valid', async () => {
    const expected = computeContentIdentity(BYTES_A);
    const result = succeed(await invokeIntegrity({ operation: 'verify-content-identity', bytes: BYTES_A, expected }));
    expect(result.status).toBe('succeeded');
    expect(verified(result.output).check.valid).toBe(true);
    expect('reason' in verified(result.output).check).toBe(false);
  });

  it('TEST 13 — mismatching bytes: execution succeeded, check invalid', async () => {
    const expected = computeContentIdentity(BYTES_A);
    const result = await invokeIntegrity({ operation: 'verify-content-identity', bytes: BYTES_B, expected });
    expect(result.status).toBe('succeeded');
    expect(verified(succeed(result).output).check.valid).toBe(false);
  });

  it('TEST 14 — the mismatch reason is preserved as CONTENT_DIGEST_MISMATCH', async () => {
    const expected = computeContentIdentity(BYTES_A);
    const result = succeed(await invokeIntegrity({ operation: 'verify-content-identity', bytes: BYTES_B, expected }));
    expect(verified(result.output).check.reason).toBe('CONTENT_DIGEST_MISMATCH');
  });

  it('TEST 15 — a mismatch is NOT a common capability failure', async () => {
    const expected = computeContentIdentity(BYTES_A);
    const result = await invokeIntegrity({ operation: 'verify-content-identity', bytes: BYTES_B, expected });
    // The capability executed correctly; the integrity assertion did not hold.
    // Those are two different facts and must stay distinguishable.
    expect(result.status).toBe('succeeded');
    expect(result.evidence.outcome).toBe('succeeded');
    expect('reasonCodes' in result.evidence).toBe(false);
    expect(JSON.stringify(result.evidence)).not.toContain('CONTENT_DIGEST_MISMATCH');
  });

  it('TEST 16 — a malformed expected ContentIdentity is an expected failed outcome', async () => {
    const result = await invokeIntegrity({
      operation: 'verify-content-identity',
      bytes: BYTES_A,
      expected: { algorithm: 'md5', digest: 'abc' } as unknown as ContentIdentity,
    });
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('unreachable');
    expect(result.reasonCodes).toEqual(['INTEGRITY_INVALID_EXPECTED_CONTENT_IDENTITY']);
    expect(result.evidence.outcome).toBe('failed');
  });
});

describe('SM-04 / Integrity manifest digest (INTEGRITY TESTS 17-20)', () => {
  it('TEST 17 — the manifest digest operation works', async () => {
    const manifest = validManifest();
    const result = succeed(await invokeIntegrity({ operation: 'compute-manifest-digest', manifest }));
    expect(digested(result.output).manifestDigest).toMatch(/^[0-9a-f]{64}$/);
  });

  it('TEST 18 — the digest exactly equals the computeManifestDigest primitive', async () => {
    const manifest = validManifest();
    const result = succeed(await invokeIntegrity({ operation: 'compute-manifest-digest', manifest }));
    expect(digested(result.output).manifestDigest).toBe(computeManifestDigest(manifest));
  });

  it('TEST 19 — changing manifest material changes the digest', async () => {
    const manifest = validManifest();
    const changed: SovereignManifestV1 = { ...manifest, registrant: 'principal:someone-else' };
    const a = succeed(await invokeIntegrity({ operation: 'compute-manifest-digest', manifest }));
    const b = succeed(await invokeIntegrity({ operation: 'compute-manifest-digest', manifest: changed }));
    expect(digested(a.output).manifestDigest).not.toBe(digested(b.output).manifestDigest);
    expect(digested(b.output).manifestDigest).toBe(computeManifestDigest(changed));
  });

  it('TEST 20 — an invalid manifest is an expected failed outcome, not a thrown validator', async () => {
    const invalid = { ...validManifest(), sovereignAssetId: 'not-a-sovereign-asset-id' };
    const result = await invokeIntegrity({ operation: 'compute-manifest-digest', manifest: invalid });
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('unreachable');
    expect(result.reasonCodes).toEqual(['INTEGRITY_INVALID_MANIFEST']);

    // A manifest missing `authorityClaims` entirely would make the canonical
    // validator throw; it must be reported, not crash the capsule.
    const shapeless = await invokeIntegrity({ operation: 'compute-manifest-digest', manifest: { hello: 'world' } });
    expect(shapeless.status).toBe('failed');
  });
});

describe('SM-04 / Integrity creates no identity (INTEGRITY TESTS 21-23)', () => {
  it('TEST 21 — the capsule never mints a SovereignAssetId', async () => {
    const result = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }));
    expect(JSON.stringify(result.output)).not.toContain('aoc:sovereign-asset:');

    const source = capsuleSource('integrity.ts');
    expect(source).not.toContain('mintSovereignAssetId');
    expect(source).not.toContain('buildSovereignManifestV1');
    expect(source).not.toContain('toSovereignSubjectRef');
  });

  it('TEST 22 — an absent subject stays absent', async () => {
    const result = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }));
    expect('subject' in result).toBe(false);
    expect('subject' in result.evidence).toBe(false);
  });

  it('TEST 23 — a present subject is preserved by the common result', async () => {
    const subject = subjectWithLocator('future://provider/object/92817');
    const result = succeed(
      await invokeIntegrity({ operation: 'compute-manifest-digest', manifest: validManifest() }, { subject }),
    );
    expect(result.subject).toEqual(subject);
    expect(result.evidence.subject?.externalReference?.locator).toBe('future://provider/object/92817');
  });
});

describe('SM-04 / Integrity common evidence (INTEGRITY TESTS 24-27)', () => {
  it('TEST 24 — the evidence carries the exact canonical Integrity id and version', async () => {
    const result = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }));
    expect(result.evidence.capability).toEqual(INTEGRITY_REF);
    expect(result.evidence.capability.id).toBe('aoc:sovereignty-capability:integrity');
    expect(result.evidence.capability.version).toBe(
      getSovereigntyCapability(SOVEREIGNTY_CAPABILITY_IDS.integrity)?.version,
    );
    expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
  });

  it('TEST 25 — the evidence contains no raw bytes', async () => {
    const bytes = new TextEncoder().encode('supersecret sovereign payload');
    const result = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes }));
    const serialized = JSON.stringify(result.evidence);
    expect(serialized).not.toContain('supersecret');
    expect(serialized).not.toContain('bytes');
    expect(serialized).not.toContain('115'); // a byte value from the payload
  });

  it('TEST 26 — the evidence does not contain the ContentIdentity output', async () => {
    const result = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: BYTES_A }));
    const serialized = JSON.stringify(result.evidence);
    expect(serialized).not.toContain(computed(result.output).contentIdentity.digest);
    expect(serialized).not.toContain('contentIdentity');
    expect(serialized).not.toContain('sha256');
    expect('evidenceRefs' in result.evidence).toBe(false);
  });

  it('TEST 27 — the evidence does not contain the manifest or its digest', async () => {
    const manifest = validManifest();
    const result = succeed(await invokeIntegrity({ operation: 'compute-manifest-digest', manifest }));
    const serialized = JSON.stringify(result.evidence);
    expect(serialized).not.toContain(digested(result.output).manifestDigest);
    expect(serialized).not.toContain('manifestDigest');
    expect(serialized).not.toContain(manifest.sovereignAssetId);
    expect(canonicalizeJSON(JSON.parse(serialized))).toBe(canonicalizeJSON(result.evidence));
  });
});

describe('SM-04 / Integrity mineral boundaries (INTEGRITY TESTS 28-29)', () => {
  it('TEST 28 — no signature or proof semantics are performed', () => {
    const source = capsuleSource('integrity.ts');
    for (const term of [
      'verifySovereignSignature',
      'verifySovereignManifest',
      'signSovereignManifest',
      'signSovereignPayload',
      'generateSovereignKeyPair',
      'payloadHash',
      'publicKey',
      'privateKey',
      'issuer',
    ]) {
      expect(source).not.toContain(term);
    }
  });

  it('TEST 28b — generic canonicalization is not exposed as an Integrity operation', () => {
    const source = capsuleSource('integrity.ts');
    expect(source).not.toContain('canonicalizeJSON');
    expect([...INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS]).not.toContain('canonicalize-json');
  });

  it('TEST 28c — no provenance, licensing or governance semantics are introduced', () => {
    const source = capsuleSource('integrity.ts');
    for (const term of ['OriginClaim', 'AuthorityClaim', 'derivedFrom', 'lineage', 'permissions', 'restrictions', 'policy', 'grant']) {
      expect(source).not.toContain(term);
    }
  });

  it('TEST 29 — no provider, network or storage operation occurs', () => {
    const source = capsuleSource('integrity.ts');
    for (const term of ['fetch(', 'http', 'XMLHttpRequest', 'node:https', 'node:http', 'node:net', 'node:fs', 'provider', 'storage']) {
      expect(source).not.toContain(term);
    }
  });

  it('TEST 29b — has no import-time side effects and registers nothing globally', () => {
    const source = capsuleSource('integrity.ts');
    for (const term of ['registerImplementation', 'globalThis', 'process.env', 'registerIntegrityCapability']) {
      expect(source).not.toContain(term);
    }
  });
});

describe('SM-04 / Integrity unexpected faults (INTEGRITY TEST 30)', () => {
  it('TEST 30 — an unexpected fault follows SM-03 fault semantics, with no retry', async () => {
    const real = new Uint8Array([1, 2, 3]);
    let reads = 0;
    // Valid on the read that validation performs, and detonating on the read
    // the primitive performs: a genuine runtime fault *after* the capsule has
    // already accepted the input as well-formed.
    const hostileInput = {
      operation: 'compute-content-identity',
      get bytes(): Uint8Array {
        reads += 1;
        if (reads > 1) throw new Error('simulated primitive fault');
        return real;
      },
    } as unknown as IntegritySovereigntyCapabilityInput;

    const invocation = buildSovereigntyCapabilityInvocation({
      capability: INTEGRITY_REF,
      input: hostileInput,
    });

    try {
      await invokeSovereigntyCapability(invocation, integrity());
      throw new Error('expected a typed invocation fault');
    } catch (error) {
      expect(isSovereigntyCapabilityInvocationError(error)).toBe(true);
      if (!isSovereigntyCapabilityInvocationError(error)) throw error;
      expect(error).toBeInstanceOf(SovereigntyCapabilityInvocationError);
      expect(error.code).toBe('SOVEREIGNTY_CAPABILITY_IMPLEMENTATION_ERROR');
      // Never laundered into an ordinary Integrity capability failure.
      expect(error.details.reasonCodes).not.toContain('INTEGRITY_INVALID_BYTES');
      expect(error.details.reasonCodes).toContain('SOVEREIGNTY_CAPABILITY_IMPLEMENTATION_ERROR');
      // Sanitized evidence: no exception text, no stack, no bytes.
      expect(JSON.stringify(error.evidence)).not.toContain('simulated primitive fault');
      expect(error.evidence?.outcome).toBe('failed');
    }

    // Exactly one validation read plus one primitive read: the fault is not
    // retried, and the capability is not executed a second time.
    expect(reads).toBe(2);
  });
});

describe('SM-04 / Integrity expected failure taxonomy', () => {
  it('reports an unsupported operation rather than guessing one', async () => {
    const result = await invokeIntegrity({ operation: 'canonicalize-any-json', value: {} });
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('unreachable');
    expect(result.reasonCodes).toEqual(['INTEGRITY_UNSUPPORTED_OPERATION']);
  });

  it('reports invalid bytes for anything that is not a Uint8Array', async () => {
    for (const bytes of ['hello', [1, 2, 3], new ArrayBuffer(4), null, undefined]) {
      const result = await invokeIntegrity({ operation: 'compute-content-identity', bytes });
      expect(result.status).toBe('failed');
      if (result.status !== 'failed') throw new Error('unreachable');
      expect(result.reasonCodes).toEqual(['INTEGRITY_INVALID_BYTES']);
    }
  });

  it('accepts a Node Buffer, which is a Uint8Array subclass', async () => {
    const buffer = Buffer.from('hello sovereign world', 'utf8');
    const result = succeed(await invokeIntegrity({ operation: 'compute-content-identity', bytes: buffer }));
    expect(computed(result.output).contentIdentity).toEqual(computeContentIdentity(BYTES_A));
  });

  it('reports a non-object input as invalid input', async () => {
    const result = await invokeIntegrity(42);
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('unreachable');
    expect(result.reasonCodes).toEqual(['INTEGRITY_INVALID_INPUT']);
  });

  it('exposes a public input validator', () => {
    expect(isValidIntegritySovereigntyCapabilityInput({ operation: 'compute-content-identity', bytes: BYTES_A })).toBe(true);
    expect(isValidIntegritySovereigntyCapabilityInput({ operation: 'nope' })).toBe(false);
    expect(validateIntegritySovereigntyCapabilityInput({ operation: 'verify-content-identity', bytes: 1, expected: 2 })).toEqual({
      valid: false,
      reasons: ['INTEGRITY_INVALID_BYTES', 'INTEGRITY_INVALID_EXPECTED_CONTENT_IDENTITY'],
    });
  });
});
