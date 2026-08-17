import { canonicalizeJSON } from '@aoc/protocol/canonical';
import {
  buildSovereignExternalReference,
  mintSovereignAssetId,
  type SovereignSubjectRef,
} from '@aoc/protocol/identity';
import {
  SOVEREIGNTY_CAPABILITY_IDS,
  SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES,
  SOVEREIGNTY_CAPABILITY_INVOCATION_EVENT_TYPE,
  SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION,
  SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION,
  SOVEREIGNTY_CAPABILITY_RESULT_SCHEMA_VERSION,
  SovereigntyCapabilityInvocationError,
  buildSovereigntyCapabilityInvocation,
  getSovereigntyCapabilityRef,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isSovereigntyCapabilityInvocationError,
  isValidSovereigntyCapabilityInvocation,
  isValidSovereigntyCapabilityInvocationEvidence,
  isValidSovereigntyCapabilityInvocationId,
  isValidSovereigntyCapabilityRef,
  listSovereigntyCapabilities,
  mintSovereigntyCapabilityInvocationId,
  sovereigntyCapabilityRefsEqual,
  toSovereigntyCapabilityInvocationAuditEvent,
  toSovereigntyCapabilityRef,
  validateSovereigntyCapabilityInvocation,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  SovereigntyCapabilityExecutionOutcome,
  SovereigntyCapabilityImplementation,
  SovereigntyCapabilityInvocation,
  SovereigntyCapabilityInvocationEvidenceV1,
  SovereigntyCapabilityRef,
} from '@aoc/protocol/sovereignty-capabilities';
import type { AuditEventEnvelope } from '@aoc/protocol/contracts';
import type { AuditEventSink } from '@aoc/protocol/adapters';

// ---------------------------------------------------------------------------
// Fixtures. Every implementation below is TEST-ONLY and is deliberately NOT a
// real mineral: SM-04 owns the first production Identity and Integrity
// capsules. These exist only to prove that the common socket can carry the
// shapes those capsules will need.
// ---------------------------------------------------------------------------

const IDENTITY_REF = getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef;
const INTEGRITY_REF = getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef;
const VERIFIABILITY_REF = getSovereigntyCapabilityRefByKey('verifiability') as SovereigntyCapabilityRef;
const PROVENANCE_REF = getSovereigntyCapabilityRefByKey('provenance') as SovereigntyCapabilityRef;

/** The SM-02 open-world subject: a namespace Protocol has never heard of. */
const alienSubject = (): SovereignSubjectRef => ({
  sovereignAssetId: mintSovereignAssetId(),
  externalReference: buildSovereignExternalReference({
    namespace: 'alien-system-v47',
    id: 'alien-resource-92817',
    locator: 'future://provider/object/92817',
  }),
});

const fixedClock = (isoTimes: readonly string[]) => {
  let index = 0;
  return () => new Date(isoTimes[Math.min(index++, isoTimes.length - 1)]);
};

interface RecordingImplementation<TInput, TOutput>
  extends SovereigntyCapabilityImplementation<TInput, TOutput> {
  readonly calls: SovereigntyCapabilityInvocation<TInput>[];
}

function testImplementation<TInput, TOutput>(
  capability: SovereigntyCapabilityRef,
  respond: (
    invocation: SovereigntyCapabilityInvocation<TInput>,
  ) => SovereigntyCapabilityExecutionOutcome<TOutput> | Promise<SovereigntyCapabilityExecutionOutcome<TOutput>>,
): RecordingImplementation<TInput, TOutput> {
  const calls: SovereigntyCapabilityInvocation<TInput>[] = [];
  return {
    capability,
    calls,
    async invoke(invocation) {
      calls.push(invocation);
      return respond(invocation);
    },
  };
}

/** TEST-ONLY, NOT the real Identity capsule: proves a capability can create a subject. */
function testOnlyIdentityShapedImplementation(created: SovereignSubjectRef) {
  return testImplementation<{ readonly externalReference: { namespace: string; id: string } }, { minted: true }>(
    IDENTITY_REF,
    () => ({ status: 'succeeded', output: { minted: true }, subject: created }),
  );
}

/** TEST-ONLY, NOT the real Integrity capsule: proves bytes survive as input. */
function testOnlyIntegrityShapedImplementation() {
  return testImplementation<Uint8Array, { byteLength: number; firstByte: number }>(
    INTEGRITY_REF,
    (invocation) => ({
      status: 'succeeded',
      output: { byteLength: invocation.input.byteLength, firstByte: invocation.input[0] },
    }),
  );
}

function collectingSink(): AuditEventSink & { readonly events: AuditEventEnvelope[] } {
  const events: AuditEventEnvelope[] = [];
  return {
    events,
    recordAuditEvent(event) {
      events.push(event);
    },
  };
}

const invocationFor = <TInput>(
  capability: SovereigntyCapabilityRef,
  input: TInput,
  extra: { correlationId?: string; subject?: SovereignSubjectRef } = {},
): SovereigntyCapabilityInvocation<TInput> =>
  buildSovereigntyCapabilityInvocation({ capability, input, ...extra });

// ---------------------------------------------------------------------------

describe('SM-03 / canonical capability reference (TESTS 1-4)', () => {
  it('TEST 1 — the canonical inventory is still exactly eight', () => {
    expect(listSovereigntyCapabilities()).toHaveLength(8);
  });

  it('TEST 2 — a ref can represent every canonical id at its exact registry version', () => {
    for (const definition of listSovereigntyCapabilities()) {
      const ref = toSovereigntyCapabilityRef(definition);
      expect(ref).toEqual({ id: definition.id, version: definition.version });
      expect(isValidSovereigntyCapabilityRef(ref)).toBe(true);
      expect(getSovereigntyCapabilityRef(definition.id)).toEqual(ref);
      expect(getSovereigntyCapabilityRefByKey(definition.key)).toEqual(ref);
      // Derived from the SM-01 registry, never a hand-typed pair.
      expect(ref.version).toBe(definition.version);
      expect(Object.isFrozen(ref)).toBe(true);
      // A ref carries identity only — no name, description, key or namespace.
      expect(Object.keys(ref).sort()).toEqual(['id', 'version']);
    }
  });

  it('TEST 3 — an unknown capability id can never become a ref', () => {
    for (const unknown of [
      'aoc:sovereignty-capability:revocation',
      'my-company.special-capability',
      'aoc:sovereign-asset:11111111-1111-4111-8111-111111111111',
      'identity',
      '',
      null,
      undefined,
      42,
    ]) {
      expect(getSovereigntyCapabilityRef(unknown)).toBeUndefined();
      expect(isValidSovereigntyCapabilityRef({ id: unknown, version: '1.0.0' })).toBe(false);
    }
    expect(getSovereigntyCapabilityRefByKey('wallet')).toBeUndefined();
  });

  it('TEST 4 — a ref version is explicit, structurally checked, and compared exactly', () => {
    expect(isValidSovereigntyCapabilityRef({ id: SOVEREIGNTY_CAPABILITY_IDS.identity })).toBe(false);
    for (const malformed of ['1.0', 'v1.0.0', '1.0.0-rc.1', '-1.0.0', '', null]) {
      expect(isValidSovereigntyCapabilityRef({ id: SOVEREIGNTY_CAPABILITY_IDS.identity, version: malformed })).toBe(false);
    }
    // A version the registry does not currently define is still well-formed:
    // evidence from another build has to remain describable.
    expect(isValidSovereigntyCapabilityRef({ id: SOVEREIGNTY_CAPABILITY_IDS.identity, version: '2.0.0' })).toBe(true);

    expect(sovereigntyCapabilityRefsEqual(IDENTITY_REF, { ...IDENTITY_REF })).toBe(true);
    expect(sovereigntyCapabilityRefsEqual(IDENTITY_REF, { ...IDENTITY_REF, version: '2.0.0' })).toBe(false);
    expect(sovereigntyCapabilityRefsEqual(IDENTITY_REF, INTEGRITY_REF)).toBe(false);
  });
});

describe('SM-03 / invocation identity and correlation (TESTS 5-8)', () => {
  it('TEST 5 — a minted invocation id is valid, namespaced, and stable for one invocation', () => {
    const id = mintSovereigntyCapabilityInvocationId();
    expect(id.startsWith('aoc:sovereignty-capability-invocation:')).toBe(true);
    expect(isValidSovereigntyCapabilityInvocationId(id)).toBe(true);

    const invocation = buildSovereigntyCapabilityInvocation({ capability: IDENTITY_REF, input: {}, invocationId: id });
    expect(invocation.invocationId).toBe(id);
    expect(invocation.invocationId).toBe(id);

    for (const malformed of [
      'aoc:sovereignty-capability-invocation:not-a-uuid',
      'aoc:sovereign-asset:11111111-1111-4111-8111-111111111111',
      SOVEREIGNTY_CAPABILITY_IDS.identity,
      '',
      null,
      undefined,
      7,
    ]) {
      expect(isValidSovereigntyCapabilityInvocationId(malformed)).toBe(false);
    }
  });

  it('TEST 6 — two minted invocation ids differ', () => {
    const ids = new Set(Array.from({ length: 64 }, () => mintSovereigntyCapabilityInvocationId()));
    expect(ids.size).toBe(64);
  });

  it('TEST 7 — correlationId is optional and structurally omitted when absent', () => {
    const invocation = invocationFor(IDENTITY_REF, {});
    expect(isValidSovereigntyCapabilityInvocation(invocation)).toBe(true);
    expect('correlationId' in invocation).toBe(false);
    expect(invocationFor(IDENTITY_REF, {}, { correlationId: 'test-flow-001' }).correlationId).toBe('test-flow-001');
  });

  it('TEST 8 — a present-but-blank correlationId is rejected', () => {
    for (const blank of ['', '   ', undefined, null, 5, {}]) {
      const result = validateSovereigntyCapabilityInvocation({
        ...invocationFor(IDENTITY_REF, {}),
        correlationId: blank,
      });
      expect(result.valid).toBe(false);
      expect(result.reasons).toContain('INVALID_INVOCATION_CORRELATION_ID');
    }
  });
});

describe('SM-03 / optional subject and generic input at the common layer (TESTS 9-12)', () => {
  it('TEST 9 — the common invocation does not require a SovereignSubjectRef', () => {
    const invocation = invocationFor(INTEGRITY_REF, new Uint8Array([1, 2, 3]));
    expect(isValidSovereigntyCapabilityInvocation(invocation)).toBe(true);
    expect('subject' in invocation).toBe(false);
    expect(invocation.subject).toBeUndefined();
  });

  it('TEST 10 — a valid subject is accepted and carried verbatim', () => {
    const subject = alienSubject();
    const invocation = invocationFor(VERIFIABILITY_REF, {}, { subject });
    expect(isValidSovereigntyCapabilityInvocation(invocation)).toBe(true);
    expect(invocation.subject).toEqual(subject);
  });

  it('TEST 11 — an invalid subject is rejected', () => {
    for (const invalid of [
      {},
      { sovereignAssetId: 'not-an-aoc-id' },
      { sovereignAssetId: mintSovereignAssetId(), externalReference: { namespace: '', id: 'x' } },
      null,
      'subject',
      undefined,
    ]) {
      const result = validateSovereigntyCapabilityInvocation({ ...invocationFor(IDENTITY_REF, {}), subject: invalid });
      expect(result.valid).toBe(false);
      expect(result.reasons).toContain('INVALID_INVOCATION_SUBJECT');
    }
  });

  it('TEST 12 — raw Uint8Array input is accepted, unmodified, without common canonicalization', () => {
    const bytes = new Uint8Array([0, 255, 128, 7]);
    const invocation = invocationFor(INTEGRITY_REF, bytes);
    expect(isValidSovereigntyCapabilityInvocation(invocation)).toBe(true);
    // Same reference, not a copy, not canonicalized, not hashed, not frozen.
    expect(invocation.input).toBe(bytes);
    expect(Object.isFrozen(invocation.input)).toBe(false);
    // Proof that requiring canonical JSON at this layer would have broken it.
    expect(() => canonicalizeJSON(bytes)).not.toThrow();
    const notCanonicalizable = { fn: () => 1 };
    expect(() => canonicalizeJSON(notCanonicalizable)).toThrow();
    expect(isValidSovereigntyCapabilityInvocation(invocationFor(INTEGRITY_REF, notCanonicalizable))).toBe(true);
    // `input` must nonetheless be present.
    const { input: _dropped, ...withoutInput } = invocationFor(INTEGRITY_REF, bytes);
    expect(validateSovereigntyCapabilityInvocation(withoutInput).reasons).toContain('MISSING_INVOCATION_INPUT');
  });
});

describe('SM-03 / capability matching before execution (TESTS 13-15)', () => {
  it('TEST 13 — the implementation capability id must match the invocation', async () => {
    const implementation = testImplementation(INTEGRITY_REF, () => ({ status: 'succeeded' as const, output: 1 }));
    const invocation = invocationFor(IDENTITY_REF, {});

    const error = await invokeSovereigntyCapability(invocation, implementation).catch((e: unknown) => e);
    expect(isSovereigntyCapabilityInvocationError(error)).toBe(true);
    expect((error as SovereigntyCapabilityInvocationError).code).toBe(
      SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES.rejected,
    );
    expect((error as SovereigntyCapabilityInvocationError).details.reasonCodes).toContain('CAPABILITY_ID_MISMATCH');
    expect(implementation.calls).toHaveLength(0);
  });

  it('TEST 14 — the implementation capability version must match the invocation', async () => {
    const implementation = testImplementation({ ...IDENTITY_REF, version: '2.0.0' }, () => ({
      status: 'succeeded' as const,
      output: 1,
    }));
    const invocation = invocationFor(IDENTITY_REF, {});

    const error = await invokeSovereigntyCapability(invocation, implementation).catch((e: unknown) => e);
    expect((error as SovereigntyCapabilityInvocationError).details.reasonCodes).toContain('CAPABILITY_VERSION_MISMATCH');
    // The requested ref is reported back unchanged — never rewritten to "latest".
    expect((error as SovereigntyCapabilityInvocationError).details.capability).toEqual(IDENTITY_REF);
    expect(implementation.calls).toHaveLength(0);
  });

  it('TEST 15 — every mismatch and every unknown capability is rejected before the handler runs', async () => {
    const implementation = testImplementation(IDENTITY_REF, () => ({ status: 'succeeded' as const, output: 1 }));

    const cases: ReadonlyArray<readonly [unknown, string]> = [
      [{ id: 'aoc:sovereignty-capability:revocation', version: '1.0.0' }, 'SOVEREIGNTY_CAPABILITY_NOT_CANONICAL'],
      [{ id: 'my-company.special-capability', version: '1.0.0' }, 'SOVEREIGNTY_CAPABILITY_NOT_CANONICAL'],
      [{ id: SOVEREIGNTY_CAPABILITY_IDS.identity, version: 'latest' }, 'INVALID_INVOCATION_CAPABILITY_REF'],
    ];

    for (const [capability, expectedReason] of cases) {
      const invocation = {
        ...invocationFor(IDENTITY_REF, {}),
        capability,
      } as unknown as SovereigntyCapabilityInvocation<unknown>;
      const error = await invokeSovereigntyCapability(invocation, implementation).catch((e: unknown) => e);
      expect(isSovereigntyCapabilityInvocationError(error)).toBe(true);
      expect((error as SovereigntyCapabilityInvocationError).details.reasonCodes).toContain(expectedReason);
    }

    // A structurally broken envelope is rejected too, and the implementation is
    // never consulted in any of these paths.
    const broken = await invokeSovereigntyCapability(
      { ...invocationFor(IDENTITY_REF, {}), schemaVersion: 'nope' } as unknown as SovereigntyCapabilityInvocation<unknown>,
      implementation,
    ).catch((e: unknown) => e);
    expect((broken as SovereigntyCapabilityInvocationError).details.reasonCodes).toContain(
      'INVALID_INVOCATION_SCHEMA_VERSION',
    );
    expect(implementation.calls).toHaveLength(0);

    // A rejected invocation was never accepted, so it produces no evidence.
    expect((broken as SovereigntyCapabilityInvocationError).evidence).toBeUndefined();
  });

  it('a malformed call from an untyped consumer is rejected, not thrown from inside validation', async () => {
    const implementation = testImplementation(IDENTITY_REF, () => ({ status: 'succeeded' as const, output: 1 }));
    for (const bogus of [null, undefined, 'invocation', 42, []]) {
      const error = await invokeSovereigntyCapability(
        bogus as unknown as SovereigntyCapabilityInvocation<unknown>,
        implementation,
      ).catch((e: unknown) => e);
      expect(isSovereigntyCapabilityInvocationError(error)).toBe(true);
      expect((error as SovereigntyCapabilityInvocationError).code).toBe(
        SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES.rejected,
      );
      expect((error as SovereigntyCapabilityInvocationError).details.reasonCodes).toContain(
        'INVALID_INVOCATION_STRUCTURE',
      );
    }
    // A null implementation is likewise a rejection, not a crash.
    const noImplementation = await invokeSovereigntyCapability(
      invocationFor(IDENTITY_REF, {}),
      null as unknown as SovereigntyCapabilityImplementation<unknown, unknown>,
    ).catch((e: unknown) => e);
    expect((noImplementation as SovereigntyCapabilityInvocationError).details.reasonCodes).toContain(
      'INVALID_IMPLEMENTATION_CAPABILITY_REF',
    );
    expect(implementation.calls).toHaveLength(0);
  });
});

describe('SM-03 / result attribution and subject precedence (TESTS 16-24)', () => {
  it('TESTS 16-19 — a successful implementation yields an attributed success result', async () => {
    const implementation = testImplementation(VERIFIABILITY_REF, () => ({
      status: 'succeeded' as const,
      output: { testValue: true },
    }));
    const invocation = invocationFor(VERIFIABILITY_REF, { arbitrary: 'value' }, { correlationId: 'test-flow-001' });

    const result = await invokeSovereigntyCapability(invocation, implementation);

    expect(result.status).toBe('succeeded');
    expect(result.schemaVersion).toBe(SOVEREIGNTY_CAPABILITY_RESULT_SCHEMA_VERSION);
    expect(result.invocationId).toBe(invocation.invocationId);
    expect(result.capability).toEqual(VERIFIABILITY_REF);
    expect(result.correlationId).toBe('test-flow-001');
    if (result.status !== 'succeeded') throw new Error('expected success');
    expect(result.output).toEqual({ testValue: true });
    expect(implementation.calls).toHaveLength(1);
  });

  it('TEST 20 — the invocation subject survives when the implementation returns none', async () => {
    const subject = alienSubject();
    const implementation = testImplementation(PROVENANCE_REF, () => ({ status: 'succeeded' as const, output: 1 }));
    const result = await invokeSovereigntyCapability(invocationFor(PROVENANCE_REF, {}, { subject }), implementation);

    expect(result.subject).toEqual(subject);
    expect(result.evidence.subject).toEqual(subject);
  });

  it('TEST 21 — an implementation-provided subject takes precedence over the invocation subject', async () => {
    const requested = alienSubject();
    const produced = alienSubject();
    const implementation = testImplementation(PROVENANCE_REF, () => ({
      status: 'succeeded' as const,
      output: 1,
      subject: produced,
    }));

    const result = await invokeSovereigntyCapability(
      invocationFor(PROVENANCE_REF, {}, { subject: requested }),
      implementation,
    );

    expect(result.subject?.sovereignAssetId).toBe(produced.sovereignAssetId);
    expect(result.subject?.sovereignAssetId).not.toBe(requested.sovereignAssetId);
    expect(result.evidence.subject?.sovereignAssetId).toBe(produced.sovereignAssetId);
  });

  it('TEST 22 — no subject anywhere means no subject in the result or the evidence', async () => {
    const implementation = testImplementation(INTEGRITY_REF, () => ({ status: 'succeeded' as const, output: 1 }));
    const result = await invokeSovereigntyCapability(invocationFor(INTEGRITY_REF, new Uint8Array([1])), implementation);

    expect(result.subject).toBeUndefined();
    expect('subject' in result).toBe(false);
    expect('subject' in result.evidence).toBe(false);
  });

  it('TEST 23 / CASE A — TEST-ONLY Identity-shaped flow starts with no subject and returns one', async () => {
    const created: SovereignSubjectRef = {
      sovereignAssetId: mintSovereignAssetId(),
      externalReference: buildSovereignExternalReference({ namespace: 'alien-system-v47', id: 'alien-resource-92817' }),
    };
    const implementation = testOnlyIdentityShapedImplementation(created);
    const invocation = invocationFor(IDENTITY_REF, {
      externalReference: { namespace: 'alien-system-v47', id: 'alien-resource-92817' },
    });

    // subject BEFORE: absent.
    expect(invocation.subject).toBeUndefined();

    const result = await invokeSovereigntyCapability(invocation, implementation);

    // subject AFTER: present, and it is the one the capability created.
    expect(result.status).toBe('succeeded');
    expect(result.subject).toEqual(created);
    expect(result.evidence.subject).toEqual(created);
    expect(result.evidence.capability).toEqual(IDENTITY_REF);
    expect(result.evidence.invocationId).toBe(invocation.invocationId);
    expect(implementation.calls[0].subject).toBeUndefined();
  });

  it('TEST 24 / CASE B — TEST-ONLY Integrity-shaped flow consumes bytes with no subject', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);
    const implementation = testOnlyIntegrityShapedImplementation();
    const invocation = invocationFor(INTEGRITY_REF, bytes);

    const result = await invokeSovereigntyCapability(invocation, implementation);

    // The implementation received the very same bytes, unmodified.
    expect(implementation.calls[0].input).toBe(bytes);
    expect(Array.from(implementation.calls[0].input)).toEqual([1, 2, 3, 4, 5]);
    if (result.status !== 'succeeded') throw new Error('expected success');
    expect(result.output).toEqual({ byteLength: 5, firstByte: 1 });
    expect(result.subject).toBeUndefined();
    // Bytes never reach the portable record.
    expect(JSON.stringify(result.evidence)).not.toContain('255');
    expect(Object.values(result.evidence).some((value) => value instanceof Uint8Array)).toBe(false);
  });
});

describe('SM-03 / portable invocation evidence (TESTS 25-35)', () => {
  const runVerifiability = async (extra: { correlationId?: string; subject?: SovereignSubjectRef } = {}) => {
    const implementation = testImplementation(VERIFIABILITY_REF, () => ({
      status: 'succeeded' as const,
      output: { secretOutput: 'do-not-log-me' },
    }));
    const invocation = invocationFor(VERIFIABILITY_REF, { secretInput: 'do-not-log-me-either' }, extra);
    const result = await invokeSovereigntyCapability(invocation, implementation, {
      clock: fixedClock(['2026-08-17T12:00:01.000Z']),
    });
    return { invocation, result };
  };

  it('TESTS 25-29 — evidence exists and attributes the exact capability, version and invocation', async () => {
    const subject = alienSubject();
    const { invocation, result } = await runVerifiability({ correlationId: 'test-flow-001', subject });
    const evidence = result.evidence;

    expect(isValidSovereigntyCapabilityInvocationEvidence(evidence)).toBe(true);
    expect(evidence.schemaVersion).toBe(SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION);
    expect(evidence.outcome).toBe('succeeded');
    // TEST 26/27 — attribution readable from the record alone.
    expect(evidence.capability).toEqual({ id: 'aoc:sovereignty-capability:verifiability', version: '1.0.0' });
    // TEST 28
    expect(evidence.invocationId).toBe(invocation.invocationId);
    // TEST 29
    expect(evidence.correlationId).toBe('test-flow-001');
    expect(evidence.requestedAt).toBe(invocation.requestedAt);
    expect(evidence.completedAt).toBe('2026-08-17T12:00:01.000Z');
  });

  it('TEST 30 — evidence subject follows the result-subject precedence rule', async () => {
    const invocationSubject = alienSubject();
    const producedSubject = alienSubject();

    const noSubject = testImplementation(PROVENANCE_REF, () => ({ status: 'succeeded' as const, output: 1 }));
    const producing = testImplementation(PROVENANCE_REF, () => ({
      status: 'succeeded' as const,
      output: 1,
      subject: producedSubject,
    }));

    const withNone = await invokeSovereigntyCapability(invocationFor(PROVENANCE_REF, {}), noSubject);
    expect(withNone.evidence.subject).toBeUndefined();

    const withInvocation = await invokeSovereigntyCapability(
      invocationFor(PROVENANCE_REF, {}, { subject: invocationSubject }),
      noSubject,
    );
    expect(withInvocation.evidence.subject).toEqual(invocationSubject);

    const withProduced = await invokeSovereigntyCapability(
      invocationFor(PROVENANCE_REF, {}, { subject: invocationSubject }),
      producing,
    );
    expect(withProduced.evidence.subject).toEqual(producedSubject);
  });

  it('TESTS 31-33 — evidence embeds no raw input, no raw output and no stack trace', async () => {
    const { result } = await runVerifiability({ correlationId: 'test-flow-001' });
    const serialized = JSON.stringify(result.evidence);

    expect(serialized).not.toContain('do-not-log-me');
    expect(serialized).not.toContain('secretInput');
    expect(serialized).not.toContain('secretOutput');
    expect(serialized.toLowerCase()).not.toContain('stack');
    expect(serialized.toLowerCase()).not.toContain('at object');
    expect(Object.keys(result.evidence)).not.toContain('input');
    expect(Object.keys(result.evidence)).not.toContain('output');
    // Only the documented fields are ever present.
    expect(Object.keys(result.evidence).sort()).toEqual([
      'capability',
      'completedAt',
      'correlationId',
      'invocationId',
      'outcome',
      'requestedAt',
      'schemaVersion',
    ]);
  });

  it('TEST 34 — evidence survives a JSON and canonical-JSON round trip unchanged', async () => {
    const subject = alienSubject();
    const { result } = await runVerifiability({ correlationId: 'test-flow-001', subject });
    const evidence = result.evidence;

    const roundTripped = JSON.parse(JSON.stringify(evidence)) as SovereigntyCapabilityInvocationEvidenceV1;
    expect(roundTripped).toEqual(evidence);
    expect(isValidSovereigntyCapabilityInvocationEvidence(roundTripped)).toBe(true);
    expect(roundTripped.capability.id).toBe(evidence.capability.id);
    expect(roundTripped.capability.version).toBe(evidence.capability.version);
    expect(roundTripped.invocationId).toBe(evidence.invocationId);
    expect(roundTripped.requestedAt).toBe(evidence.requestedAt);
    expect(roundTripped.completedAt).toBe(evidence.completedAt);
    expect(roundTripped.correlationId).toBe(evidence.correlationId);
    expect(roundTripped.subject).toEqual(evidence.subject);
    expect(roundTripped.outcome).toBe(evidence.outcome);

    // Canonicalization is deterministic and stable across the round trip.
    expect(canonicalizeJSON(roundTripped)).toBe(canonicalizeJSON(evidence));
  });

  it('TEST 35 — absent optional fields are omitted structurally, never serialized as undefined', async () => {
    const implementation = testImplementation(INTEGRITY_REF, () => ({ status: 'succeeded' as const, output: 1 }));
    const evidence = (await invokeSovereigntyCapability(invocationFor(INTEGRITY_REF, new Uint8Array()), implementation))
      .evidence;

    for (const optional of ['correlationId', 'subject', 'reasonCodes', 'evidenceRefs']) {
      expect(optional in evidence).toBe(false);
    }
    // `aoc-canonical-json/1` refuses `undefined`, so this is the load-bearing proof.
    expect(() => canonicalizeJSON(evidence)).not.toThrow();
    expect(JSON.stringify(evidence)).not.toContain('undefined');
  });
});

describe('SM-03 / expected failure vs unexpected implementation fault (TESTS 36-39)', () => {
  it('TESTS 36-37 — an expected capability failure is an ordinary failed result with its reason codes', async () => {
    const implementation = testImplementation(PROVENANCE_REF, () => ({
      status: 'failed' as const,
      reasonCodes: ['TEST_CAPABILITY_PRECONDITION_FAILED'],
    }));
    const invocation = invocationFor(PROVENANCE_REF, { secretInput: 'do-not-log-me' }, { correlationId: 'flow-2' });

    const result = await invokeSovereigntyCapability(invocation, implementation);

    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('expected failure');
    expect(result.reasonCodes).toEqual(['TEST_CAPABILITY_PRECONDITION_FAILED']);
    expect(result.invocationId).toBe(invocation.invocationId);
    expect(result.capability).toEqual(PROVENANCE_REF);
    expect(result.evidence.outcome).toBe('failed');
    expect(result.evidence.reasonCodes).toEqual(['TEST_CAPABILITY_PRECONDITION_FAILED']);
    expect(JSON.stringify(result.evidence)).not.toContain('do-not-log-me');
    expect(JSON.stringify(result.evidence).toLowerCase()).not.toContain('stack');
  });

  it('TESTS 38-39 — an unexpected throw never becomes a success and never reruns the handler', async () => {
    let calls = 0;
    const implementation = {
      capability: PROVENANCE_REF,
      async invoke(): Promise<never> {
        calls += 1;
        throw new Error('boom: internal detail with a stack trace');
      },
    };
    const invocation = invocationFor(PROVENANCE_REF, {});

    const error = await invokeSovereigntyCapability(invocation, implementation).catch((e: unknown) => e);

    expect(calls).toBe(1);
    expect(isSovereigntyCapabilityInvocationError(error)).toBe(true);
    const typed = error as SovereigntyCapabilityInvocationError;
    expect(typed.code).toBe(SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES.implementationError);
    expect(typed.details.reasonCodes).toEqual(['SOVEREIGNTY_CAPABILITY_IMPLEMENTATION_ERROR']);
    // Sanitized evidence exists, and carries none of the exception's internals.
    expect(typed.evidence?.outcome).toBe('failed');
    expect(typed.evidence?.invocationId).toBe(invocation.invocationId);
    expect(JSON.stringify(typed.evidence)).not.toContain('boom');
    expect(JSON.stringify(typed.evidence).toLowerCase()).not.toContain('stack');
    // The original stays reachable for local debugging only, never as evidence.
    expect((typed as { cause?: unknown }).cause).toBeInstanceOf(Error);
  });

  it('an outcome that is not a valid execution outcome is a fault, not a result', async () => {
    let calls = 0;
    const implementation = {
      capability: PROVENANCE_REF,
      async invoke() {
        calls += 1;
        return { ok: true } as unknown as SovereigntyCapabilityExecutionOutcome<number>;
      },
    };
    const error = await invokeSovereigntyCapability(invocationFor(PROVENANCE_REF, {}), implementation).catch(
      (e: unknown) => e,
    );
    expect(calls).toBe(1);
    expect((error as SovereigntyCapabilityInvocationError).details.reasonCodes).toEqual([
      'SOVEREIGNTY_CAPABILITY_INVALID_OUTCOME',
    ]);
  });
});

describe('SM-03 / evidence sink (TESTS 40-44)', () => {
  it('TEST 40 — with no sink configured the invocation still returns portable evidence', async () => {
    const implementation = testImplementation(INTEGRITY_REF, () => ({ status: 'succeeded' as const, output: 1 }));
    const result = await invokeSovereigntyCapability(invocationFor(INTEGRITY_REF, new Uint8Array([9])), implementation);

    expect(result.evidence).toBeDefined();
    expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
    expect(canonicalizeJSON(JSON.parse(JSON.stringify(result.evidence)))).toBe(canonicalizeJSON(result.evidence));
  });

  it('TESTS 41-42 — a configured sink receives exactly one record matching the returned evidence', async () => {
    const subject = alienSubject();
    const sink = collectingSink();
    const implementation = testImplementation(VERIFIABILITY_REF, () => ({ status: 'succeeded' as const, output: 1 }));
    const invocation = invocationFor(VERIFIABILITY_REF, {}, { correlationId: 'test-flow-001', subject });

    const result = await invokeSovereigntyCapability(invocation, implementation, { evidenceSink: sink });

    expect(sink.events).toHaveLength(1);
    const [event] = sink.events;
    expect(event.eventType).toBe(SOVEREIGNTY_CAPABILITY_INVOCATION_EVENT_TYPE);
    expect(event.eventId).toBe(invocation.invocationId);
    expect(event.correlationId).toBe('test-flow-001');
    expect(event.subject).toEqual({ kind: 'aoc:sovereign-asset', id: subject.sovereignAssetId });
    expect(event.payload.evidence).toEqual(result.evidence);
    expect((event.payload.evidence as SovereigntyCapabilityInvocationEvidenceV1).capability).toEqual(VERIFIABILITY_REF);
    expect(event).toEqual(toSovereigntyCapabilityInvocationAuditEvent(result.evidence));
  });

  it('TESTS 43-44 — sink failure is surfaced and never reruns the implementation', async () => {
    let calls = 0;
    const implementation = {
      capability: VERIFIABILITY_REF,
      async invoke() {
        calls += 1;
        return { status: 'succeeded' as const, output: 1 };
      },
    };
    const failingSink: AuditEventSink = {
      recordAuditEvent() {
        return Promise.reject(new Error('sink unavailable'));
      },
    };

    const error = await invokeSovereigntyCapability(invocationFor(VERIFIABILITY_REF, {}), implementation, {
      evidenceSink: failingSink,
    }).catch((e: unknown) => e);

    expect(calls).toBe(1);
    expect(isSovereigntyCapabilityInvocationError(error)).toBe(true);
    const typed = error as SovereigntyCapabilityInvocationError;
    expect(typed.code).toBe(SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES.evidenceDeliveryFailed);
    expect(typed.details.evidenceDelivered).toBe(false);
    // Evidence was constructed before delivery was attempted, and is handed back.
    expect(isValidSovereigntyCapabilityInvocationEvidence(typed.evidence)).toBe(true);
    expect(typed.evidence?.outcome).toBe('succeeded');
  });

  it('a synchronously throwing sink is surfaced identically, with the implementation still run once', async () => {
    let calls = 0;
    const implementation = {
      capability: VERIFIABILITY_REF,
      async invoke() {
        calls += 1;
        return { status: 'succeeded' as const, output: 1 };
      },
    };
    const throwingSink: AuditEventSink = {
      recordAuditEvent(): void {
        throw new Error('sink exploded');
      },
    };

    const error = await invokeSovereigntyCapability(invocationFor(VERIFIABILITY_REF, {}), implementation, {
      evidenceSink: throwingSink,
    }).catch((e: unknown) => e);

    expect(calls).toBe(1);
    expect((error as SovereigntyCapabilityInvocationError).code).toBe(
      SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES.evidenceDeliveryFailed,
    );
  });
});

describe('SM-03 / correlation across invocations (TESTS 45-46)', () => {
  it('TESTS 45-46 — two invocations share a correlation id while keeping distinct invocation ids', async () => {
    const correlationId = 'test-flow-001';
    const identity = testOnlyIdentityShapedImplementation(alienSubject());
    const integrity = testOnlyIntegrityShapedImplementation();

    const invocationA = invocationFor(
      IDENTITY_REF,
      { externalReference: { namespace: 'alien-system-v47', id: 'alien-resource-92817' } },
      { correlationId },
    );
    const invocationB = invocationFor(INTEGRITY_REF, new Uint8Array([1, 2]), { correlationId });

    const resultA = await invokeSovereigntyCapability(invocationA, identity);
    const resultB = await invokeSovereigntyCapability(invocationB, integrity);

    expect(resultA.evidence.correlationId).toBe(correlationId);
    expect(resultB.evidence.correlationId).toBe(correlationId);
    expect(resultA.evidence.invocationId).not.toBe(resultB.evidence.invocationId);
    expect(resultA.evidence.invocationId).toBe(invocationA.invocationId);
    expect(resultB.evidence.invocationId).toBe(invocationB.invocationId);
    // Correlation implies no ordering, dependency or capability relationship.
    expect(resultA.evidence.capability).toEqual(IDENTITY_REF);
    expect(resultB.evidence.capability).toEqual(INTEGRITY_REF);
  });
});

describe('SM-03 / CASE C — an SM-02 alien subject through the socket (TESTS 47-48)', () => {
  it('TEST 47 — the alien subject travels through invocation, result and evidence unchanged', async () => {
    const subject: SovereignSubjectRef = {
      sovereignAssetId: mintSovereignAssetId(),
      externalReference: buildSovereignExternalReference({
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'future://provider/object/92817',
      }),
    };
    const implementation = testImplementation(VERIFIABILITY_REF, () => ({ status: 'succeeded' as const, output: 1 }));
    const invocation = invocationFor(VERIFIABILITY_REF, { arbitrary: 'value' }, { subject });

    const result = await invokeSovereigntyCapability(invocation, implementation);

    expect(implementation.calls[0].subject).toEqual(subject);
    expect(result.subject).toEqual(subject);
    expect(result.evidence.subject).toEqual(subject);
    expect(result.evidence.subject?.externalReference).toEqual({
      namespace: 'alien-system-v47',
      id: 'alien-resource-92817',
      locator: 'future://provider/object/92817',
    });
    // Evidence is an independent, frozen copy — not the caller's object.
    expect(result.evidence.subject).not.toBe(subject);
    expect(Object.isFrozen(result.evidence.subject)).toBe(true);
    expect(canonicalizeJSON(JSON.parse(JSON.stringify(result.evidence)))).toBe(canonicalizeJSON(result.evidence));
  });

  it('TEST 48 — the common invocation layer performs no provider or network resolution', () => {
    const invokeSource = [
      require('fs').readFileSync(
        require('path').join(__dirname, '../../packages/protocol/src/sovereignty-capabilities/invoke.ts'),
        'utf8',
      ),
      require('fs').readFileSync(
        require('path').join(__dirname, '../../packages/protocol/src/sovereignty-capabilities/evidence.ts'),
        'utf8',
      ),
      require('fs').readFileSync(
        require('path').join(__dirname, '../../packages/protocol/src/sovereignty-capabilities/invocation.ts'),
        'utf8',
      ),
    ].join('\n');

    for (const forbidden of ['fetch(', 'XMLHttpRequest', 'node:http', 'node:https', 'node:net', 'node:dns', 'node:fs', 'locator']) {
      expect(invokeSource).not.toContain(forbidden);
    }
  });
});

describe('SM-03 / Protocol purity and non-goals (TESTS 49-51)', () => {
  const surface = () =>
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@aoc/protocol/sovereignty-capabilities') as Record<string, unknown>;

  it('TEST 49 — the sovereignty-capability module graph imports no Enterprise, runtime or provider code', () => {
    const { readdirSync, readFileSync } = require('fs') as typeof import('fs');
    const { join } = require('path') as typeof import('path');
    const dir = join(__dirname, '../../packages/protocol/src/sovereignty-capabilities');

    for (const file of readdirSync(dir).filter((name) => name.endsWith('.ts'))) {
      const source = readFileSync(join(dir, file), 'utf8');
      for (const match of source.matchAll(/from\s+'([^']+)'/g)) {
        const specifier = match[1];
        expect(specifier).not.toMatch(/enterprise|pmfreak|@aoc\/sdk|provider|runtime|storage|supabase|governance/i);
        // Only relative Protocol siblings and node builtins are permitted.
        expect(specifier.startsWith('.') || specifier.startsWith('node:')).toBe(true);
      }
    }
  });

  it('TEST 50 — no production mineral implementation is exported', () => {
    for (const forbidden of [
      'IdentityCapabilityImplementation',
      'IntegrityCapabilityImplementation',
      'ProvenanceCapabilityImplementation',
      'identityCapability',
      'integrityCapability',
      'noopSovereigntyCapability',
      'defaultSovereigntyCapabilityImplementation',
    ]) {
      expect(surface()[forbidden]).toBeUndefined();
    }
    // Nothing exported is a ready-made implementation object.
    for (const [name, value] of Object.entries(surface())) {
      if (typeof value === 'object' && value !== null && 'capability' in value && 'invoke' in value) {
        throw new Error(`export ${name} looks like a shipped capability implementation`);
      }
    }
  });

  it('TEST 51 — no mutable capability or implementation registration surface is introduced', () => {
    for (const forbidden of [
      'register',
      'registerSovereigntyCapability',
      'registerCapabilityImplementation',
      'registerSovereigntyCapabilityImplementation',
      'defineSovereigntyCapability',
      'addCanonicalCapability',
      'removeSovereigntyCapability',
      'setSovereigntyCapabilityImplementation',
    ]) {
      expect(surface()[forbidden]).toBeUndefined();
    }
    expect(typeof surface().invokeSovereigntyCapability).toBe('function');
    expect(listSovereigntyCapabilities()).toHaveLength(8);
  });

  it('introduces no Enterprise governance concept into the invocation contract', () => {
    const invocation = invocationFor(VERIFIABILITY_REF, {}, { correlationId: 'flow', subject: alienSubject() });
    for (const forbidden of ['policy', 'grant', 'token', 'authorization', 'tenant', 'price', 'quota', 'actor']) {
      expect(Object.keys(invocation)).not.toContain(forbidden);
    }
    expect(Object.keys(invocation).sort()).toEqual([
      'capability',
      'correlationId',
      'input',
      'invocationId',
      'requestedAt',
      'schemaVersion',
      'subject',
    ]);
  });
});

describe('SM-03 / the empirical socket test (§69-70)', () => {
  it('an external-style implementation plugs in and yields an attributed result and evidence', async () => {
    const subject = alienSubject();
    const capability = VERIFIABILITY_REF;

    const implementation: SovereigntyCapabilityImplementation<{ arbitrary: string }, { testValue: boolean }> = {
      capability,
      async invoke() {
        return { status: 'succeeded', output: { testValue: true } };
      },
    };

    const invocation = buildSovereigntyCapabilityInvocation({
      capability,
      requestedAt: '2026-08-17T12:00:00.000Z',
      correlationId: 'test-flow-001',
      subject,
      input: { arbitrary: 'value' },
    });

    const result = await invokeSovereigntyCapability(invocation, implementation);

    expect(result.status).toBe('succeeded');
    expect(result.invocationId).toBe(invocation.invocationId);
    expect(result.capability).toEqual({ id: 'aoc:sovereignty-capability:verifiability', version: '1.0.0' });
    expect(result.subject).toEqual(subject);
    expect(result.evidence.capability).toEqual({ id: 'aoc:sovereignty-capability:verifiability', version: '1.0.0' });
    expect(result.evidence.invocationId).toBe(invocation.invocationId);
    expect(result.evidence.correlationId).toBe('test-flow-001');
    expect(JSON.stringify(result.evidence)).not.toContain('arbitrary');
    expect(JSON.stringify(result.evidence)).not.toContain('testValue');

    // §70 — the statement that was impossible before SM-03, now readable from
    // the record alone.
    expect(JSON.parse(JSON.stringify(result.evidence)).capability).toEqual({
      id: 'aoc:sovereignty-capability:verifiability',
      version: '1.0.0',
    });
  });

  it('the invocation schema version is distinct from the capability version', () => {
    expect(SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION).toBe('aoc-sovereignty-capability-invocation/1');
    expect(SOVEREIGNTY_CAPABILITY_RESULT_SCHEMA_VERSION).toBe('aoc-sovereignty-capability-result/1');
    expect(SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION).toBe(
      'aoc-sovereignty-capability-invocation-evidence/1',
    );
    expect(VERIFIABILITY_REF.version).toBe('1.0.0');
    expect(SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION).not.toBe(VERIFIABILITY_REF.version);
  });

  it('rejects a locally-formatted timestamp in favour of the canonical UTC convention', () => {
    const result = validateSovereigntyCapabilityInvocation({
      ...invocationFor(IDENTITY_REF, {}),
      requestedAt: '2026-08-17T14:00:00+02:00',
    });
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('INVALID_INVOCATION_REQUESTED_AT');
  });

  it('SovereigntyCapabilityInvocationError is structurally a ProtocolError', () => {
    const error = new SovereigntyCapabilityInvocationError(
      SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES.rejected,
      { reasonCodes: ['CAPABILITY_ID_MISMATCH'] },
    );
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('SOVEREIGNTY_CAPABILITY_INVOCATION_REJECTED');
    expect(typeof error.message).toBe('string');
    expect(error.details.reasonCodes).toEqual(['CAPABILITY_ID_MISMATCH']);
    expect(Object.isFrozen(error.details)).toBe(true);
  });
});
