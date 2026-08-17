import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { ClaimType, StandingStatus } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  computeContentIdentity,
  mintSovereignAssetId,
} from '@aoc/protocol/identity';
import type { SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  AuthorityClaimKind,
  DerivationRelationKind,
  buildDerivationClaim,
  buildSovereignManifestV1,
  isValidAuthorityClaim,
  isValidDerivationClaim,
  isValidOriginClaim,
} from '@aoc/protocol/manifest';
import type { AuthorityClaim, DerivationClaim, OriginClaim } from '@aoc/protocol/manifest';
import {
  PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES,
  SOVEREIGNTY_CAPABILITY_IDS,
  SovereigntyCapabilityInvocationError,
  buildSovereigntyCapabilityInvocation,
  createProvenanceSovereigntyCapabilityImplementation,
  getSovereigntyCapability,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isSovereigntyCapabilityInvocationError,
  isValidProvenanceSovereigntyCapabilityInput,
  isValidSovereigntyCapabilityInvocationEvidence,
  validateProvenanceSovereigntyCapabilityInput,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  ProvenanceSovereigntyCapabilityInput,
  ProvenanceSovereigntyCapabilityOutput,
  SovereigntyCapabilityRef,
  SovereigntyCapabilityResult,
  SovereigntyCapabilitySuccessResult,
} from '@aoc/protocol/sovereignty-capabilities';

const PROVENANCE_REF = getSovereigntyCapabilityRefByKey('provenance') as SovereigntyCapabilityRef;

const CODES = PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES;
const ISSUER = 'principal:sm05-issuer';

const provenance = () => createProvenanceSovereigntyCapabilityImplementation();

/** A deterministic clock, so `issuedAt` is a fact under test rather than wall time. */
const fixedClock = (iso: string) => () => new Date(iso);

const subjectRef = (sovereignAssetId: SovereignAssetId = mintSovereignAssetId()): SovereignSubjectRef => ({
  sovereignAssetId,
});

const invokeProvenance = async (
  input: unknown,
  extras: { subject?: SovereignSubjectRef; correlationId?: string } = { subject: subjectRef() },
  implementation = provenance(),
): Promise<SovereigntyCapabilityResult<ProvenanceSovereigntyCapabilityOutput>> =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: PROVENANCE_REF,
      input: input as ProvenanceSovereigntyCapabilityInput,
      ...(extras.subject === undefined ? {} : { subject: extras.subject }),
      ...(extras.correlationId === undefined ? {} : { correlationId: extras.correlationId }),
    }),
    implementation,
  );

const succeed = (
  result: SovereigntyCapabilityResult<ProvenanceSovereigntyCapabilityOutput>,
): SovereigntyCapabilitySuccessResult<ProvenanceSovereigntyCapabilityOutput> => {
  if (result.status !== 'succeeded') {
    throw new Error(`expected success, got failure: ${result.reasonCodes.join(', ')}`);
  }
  return result;
};

const failureCodes = (result: SovereigntyCapabilityResult<ProvenanceSovereigntyCapabilityOutput>): readonly string[] => {
  if (result.status !== 'failed') throw new Error('expected a failed outcome');
  return result.reasonCodes;
};

const originInput = (overrides: Record<string, unknown> = {}) => ({
  operation: 'declare-origin' as const,
  claimId: 'claim:origin:001',
  issuer: ISSUER,
  assertedOrigin: 'captured by field team, Reykjavik, 2019',
  ...overrides,
});

const authorshipInput = (overrides: Record<string, unknown> = {}) => ({
  operation: 'declare-authorship' as const,
  claimId: 'claim:authorship:001',
  issuer: ISSUER,
  statement: 'I authored this work',
  ...overrides,
});

const derivationInput = (sources: readonly SovereignAssetId[], overrides: Record<string, unknown> = {}) => ({
  operation: 'record-derivation' as const,
  claimId: 'claim:derivation:001',
  issuer: ISSUER,
  sourceSovereignAssetIds: sources,
  relation: DerivationRelationKind.DerivedFrom,
  ...overrides,
});

const capsuleSource = (name: string): string =>
  readFileSync(
    join(__dirname, '..', '..', 'packages', 'protocol', 'src', 'sovereignty-capabilities', 'capsules', name),
    'utf8',
  )
    // Prose that names a primitive in order to explain why it is deliberately
    // NOT called must not be mistaken for a call to it.
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');

/**
 * Redacts sovereign asset ids before a vocabulary scan.
 *
 * A `SovereignAssetId` ends in a random UUID, and hex digits spell real words:
 * a raw scan for the licensing token `fee` over output containing
 * `…3bfee4a7…` "finds" it about 1% of the time, which made this suite flaky
 * rather than wrong. These ids are opaque Protocol-generated identifiers and
 * can never be licensing, ownership or authorization vocabulary, so removing
 * them keeps the assertion strict — the alternative, dropping the token, would
 * quietly stop testing the thing it exists to catch.
 */
const withoutOpaqueIds = (value: string): string =>
  value.replace(/aoc:sovereign-asset:[0-9a-f-]+/g, 'aoc:sovereign-asset:<id>');

describe('SM-05 / Provenance capsule identity and version (PROVENANCE TESTS 1-2)', () => {
  it('TEST 1 — advertises the exact canonical AOC.PROVENANCE ref', () => {
    expect(provenance().capability.id).toBe(SOVEREIGNTY_CAPABILITY_IDS.provenance);
    expect(provenance().capability.id).toBe('aoc:sovereignty-capability:provenance');
  });

  it('TEST 2 — takes its capability version from the canonical SM-01 registry', () => {
    const definition = getSovereigntyCapability(SOVEREIGNTY_CAPABILITY_IDS.provenance);
    expect(definition).toBeDefined();
    expect(provenance().capability.version).toBe(definition?.version);
    expect(provenance().capability).toEqual(PROVENANCE_REF);
    // SM-04 kept Identity/Integrity at 1.0.0; shipping an implementation is
    // not a capability-contract change.
    expect(definition?.version).toBe('1.0.0');
  });

  it('TEST 2b — no capability id or version literal is hand-written in the capsule source', () => {
    const source = capsuleSource('provenance.ts');
    expect(source).not.toMatch(/aoc:sovereignty-capability:provenance/);
    expect(source).not.toMatch(/version\s*:\s*['"]\d+\.\d+\.\d+['"]/);
    expect(source).toMatch(/requireSovereigntyCapabilityRef\('provenance'\)/);
  });

  it('TEST 2c — the operation set is closed and unrecognized operations are reported', async () => {
    expect(PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS).toEqual([
      'declare-origin',
      'declare-authorship',
      'record-derivation',
      'contest-provenance-claim',
      'trace-lineage',
    ]);
    const result = await invokeProvenance({ operation: 'declare-license' });
    expect(failureCodes(result)).toEqual([CODES.unsupportedOperation]);
  });
});

describe('SM-05 / Provenance requires an existing subject (PROVENANCE TEST 3)', () => {
  it('TEST 3 — an invocation with no subject is an expected failed outcome', async () => {
    const result = await invokeProvenance(originInput(), {});
    expect(result.status).toBe('failed');
    expect(failureCodes(result)).toEqual([CODES.subjectRequired]);
    expect(CODES.subjectRequired).toBe('PROVENANCE_SUBJECT_REQUIRED');
  });

  it('TEST 3b — it does not mint a subject to have one, and never calls Identity', () => {
    const source = capsuleSource('provenance.ts');
    expect(source).not.toContain('mintSovereignAssetId');
    expect(source).not.toContain('buildSovereignManifestV1');
    expect(source).not.toContain('createIdentitySovereigntyCapabilityImplementation');
  });
});

describe('SM-05 / declare-origin (PROVENANCE TESTS 4-8)', () => {
  it('TEST 4 — succeeds and returns an OriginClaim', async () => {
    const result = succeed(await invokeProvenance(originInput()));
    expect(result.output.operation).toBe('declare-origin');
    if (result.output.operation !== 'declare-origin') throw new Error('unreachable');
    expect(isValidOriginClaim(result.output.claim)).toBe(true);
    expect(result.output.claim.type).toBe(ClaimType.Origin);
  });

  it('TEST 5 — the claim subject is exactly the invocation subject', async () => {
    const subject = subjectRef();
    const result = succeed(await invokeProvenance(originInput(), { subject }));
    if (result.output.operation !== 'declare-origin') throw new Error('unreachable');
    expect(result.output.claim.subject).toBe(subject.sovereignAssetId);
  });

  it('TEST 6 — it uses the real buildOriginClaim primitive rather than a parallel shape', async () => {
    const result = succeed(await invokeProvenance(originInput({ claimId: 'claim:origin:xyz' })));
    if (result.output.operation !== 'declare-origin') throw new Error('unreachable');
    const claim: OriginClaim = result.output.claim;

    expect(claim.assertionRef).toBe('claim:origin:xyz:assertion');
    expect(claim.attestationRefs).toEqual([]);
    expect(claim.evidenceRefs).toEqual([]);
    expect(claim.metadata.assertedOrigin).toBe('captured by field team, Reykjavik, 2019');
    expect(capsuleSource('provenance.ts')).toContain('buildOriginClaim(');
  });

  it('TEST 7 — no ContentIdentity, bytes or manifest digest is required', async () => {
    // A subject with no byte representation at all — a building, an agent, a
    // legal entity — receives provenance exactly like a file does.
    const result = succeed(await invokeProvenance(originInput(), { subject: subjectRef() }));
    expect(result.status).toBe('succeeded');
    const source = capsuleSource('provenance.ts');
    for (const forbidden of ['computeContentIdentity', 'verifyContentIdentity', 'computeManifestDigest']) {
      expect(source).not.toContain(forbidden);
    }
  });

  it('TEST 8 — a URL-shaped assertedOrigin is stored as data and never dereferenced', async () => {
    const assertedOrigin = 'https://example.invalid/definitely-not-fetched';
    const result = succeed(await invokeProvenance(originInput({ assertedOrigin })));
    if (result.output.operation !== 'declare-origin') throw new Error('unreachable');

    expect(result.output.claim.metadata.assertedOrigin).toBe(assertedOrigin);
    const source = capsuleSource('provenance.ts');
    for (const forbidden of ['fetch(', 'XMLHttpRequest', 'node:http', 'node:https', 'node:net', 'node:dns', 'node:fs']) {
      expect(source).not.toContain(forbidden);
    }
  });

  it('TEST 8b — issuedAt is preserved when supplied and clocked when omitted', async () => {
    const supplied = succeed(await invokeProvenance(originInput({ issuedAt: '2019-06-01T09:30:00.000Z' })));
    if (supplied.output.operation !== 'declare-origin') throw new Error('unreachable');
    expect(supplied.output.claim.issuedAt).toBe('2019-06-01T09:30:00.000Z');

    const clocked = succeed(await invokeProvenance(
      originInput(),
      { subject: subjectRef() },
      createProvenanceSovereigntyCapabilityImplementation({ clock: fixedClock('2026-08-17T12:00:00.000Z') }),
    ));
    if (clocked.output.operation !== 'declare-origin') throw new Error('unreachable');
    expect(clocked.output.claim.issuedAt).toBe('2026-08-17T12:00:00.000Z');
  });
});

describe('SM-05 / declare-authorship (PROVENANCE TESTS 9-12)', () => {
  it('TEST 9 — succeeds and returns an AuthorityClaim', async () => {
    const result = succeed(await invokeProvenance(authorshipInput()));
    expect(result.output.operation).toBe('declare-authorship');
    if (result.output.operation !== 'declare-authorship') throw new Error('unreachable');
    expect(isValidAuthorityClaim(result.output.claim)).toBe(true);
    expect(result.output.claim.type).toBe(ClaimType.Authorship);
  });

  it('TEST 10 — the claim subject is exactly the invocation subject', async () => {
    const subject = subjectRef();
    const result = succeed(await invokeProvenance(authorshipInput(), { subject }));
    if (result.output.operation !== 'declare-authorship') throw new Error('unreachable');
    expect(result.output.claim.subject).toBe(subject.sovereignAssetId);
  });

  it('TEST 11 — the authority kind is hardcoded to Authorship', async () => {
    const claim = (succeed(await invokeProvenance(authorshipInput({ kind: AuthorityClaimKind.License })))
      .output as { claim: AuthorityClaim }).claim;
    // A `kind` smuggled into the input is ignored: it is not part of the contract.
    expect(claim.metadata.kind).toBe(AuthorityClaimKind.Authorship);
    expect(capsuleSource('provenance.ts')).toContain('AuthorityClaimKind.Authorship');
  });

  it('TEST 12 — the formal capsule exposes no License, Rights or Custom authority operation', () => {
    const source = capsuleSource('provenance.ts');
    for (const forbidden of [
      'AuthorityClaimKind.License',
      'AuthorityClaimKind.Rights',
      'AuthorityClaimKind.Custom',
      'declare-license',
      'declare-rights',
      'declare-authority',
    ]) {
      expect(source).not.toContain(forbidden);
    }
    expect(PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS).not.toContain('declare-license');
  });

  it('TEST 12b — declaring authorship asserts no ownership', async () => {
    const result = succeed(await invokeProvenance(authorshipInput()));
    const serialized = withoutOpaqueIds(canonicalizeJSON(result.output));
    for (const forbidden of [
      'owner', 'legalOwner', 'beneficialOwner', 'titleHolder', 'copyrightOwnerVerified', 'title',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});

describe('SM-05 / record-derivation (PROVENANCE TESTS 13-18)', () => {
  it('TEST 13 — succeeds and returns a first-class DerivationClaim', async () => {
    const parent = mintSovereignAssetId();
    const result = succeed(await invokeProvenance(derivationInput([parent])));
    expect(result.output.operation).toBe('record-derivation');
    if (result.output.operation !== 'record-derivation') throw new Error('unreachable');

    expect(isValidDerivationClaim(result.output.claim)).toBe(true);
    expect(result.output.claim.type).toBe(ClaimType.Derivation);
    expect(result.output.claim.metadata.sourceSovereignAssetIds).toEqual([parent]);
  });

  it('TEST 14 — the child comes only from the invocation subject, never from the input', async () => {
    const subject = subjectRef();
    const impostor = mintSovereignAssetId();
    const result = succeed(await invokeProvenance(
      derivationInput([mintSovereignAssetId()], { sovereignAssetId: impostor, subject: impostor, child: impostor }),
      { subject },
    ));
    if (result.output.operation !== 'record-derivation') throw new Error('unreachable');

    expect(result.output.claim.subject).toBe(subject.sovereignAssetId);
    expect(result.output.claim.subject).not.toBe(impostor);
  });

  it('TEST 15 — multi-parent derivation succeeds as ONE claim', async () => {
    const a = mintSovereignAssetId();
    const b = mintSovereignAssetId();
    const subject = subjectRef();
    const result = succeed(await invokeProvenance(
      derivationInput([a, b], { relation: DerivationRelationKind.CombinedFrom, statement: 'Composite derived artifact' }),
      { subject },
    ));
    if (result.output.operation !== 'record-derivation') throw new Error('unreachable');
    const claim: DerivationClaim = result.output.claim;

    expect(claim.metadata.sourceSovereignAssetIds).toEqual([a, b]);
    expect(claim.metadata.relation).toBe(DerivationRelationKind.CombinedFrom);
    expect(claim.metadata.statement).toBe('Composite derived artifact');
    expect(claim.subject).toBe(subject.sovereignAssetId);
  });

  it('TEST 16 — no SovereignAssetId is minted anywhere in the flow', async () => {
    const parent = mintSovereignAssetId();
    const subject = subjectRef();
    const result = succeed(await invokeProvenance(derivationInput([parent]), { subject }));
    if (result.output.operation !== 'record-derivation') throw new Error('unreachable');

    // Every id in the output was already in the input or the invocation.
    const known = new Set([parent, subject.sovereignAssetId]);
    for (const id of [result.output.claim.subject, ...result.output.claim.metadata.sourceSovereignAssetIds]) {
      expect(known.has(id as SovereignAssetId)).toBe(true);
    }
    expect(result.subject?.sovereignAssetId).toBe(subject.sovereignAssetId);
  });

  it('TEST 17 — no ContentIdentity is computed, and lineage does not depend on one', async () => {
    const bytes = new TextEncoder().encode('parent bytes');
    const contentIdentity = computeContentIdentity(bytes);
    const parent = mintSovereignAssetId();
    const result = succeed(await invokeProvenance(derivationInput([parent])));

    expect(canonicalizeJSON(result.output)).not.toContain(contentIdentity.digest);
    expect(canonicalizeJSON(result.output)).not.toContain('contentIdentity');
  });

  it('TEST 18 — no manifest is created, read or mutated', async () => {
    const parent = mintSovereignAssetId();
    const manifest = buildSovereignManifestV1(
      { sovereignAssetId: parent, registrant: 'principal:registrant', authorityClaims: [] },
      new Date('2026-01-01T00:00:00.000Z'),
    );
    const before = canonicalizeJSON(manifest);

    const result = succeed(await invokeProvenance(derivationInput([parent])));

    expect(canonicalizeJSON(manifest)).toBe(before);
    expect(manifest.authorityClaims).toEqual([]);
    expect('originClaim' in manifest).toBe(false);
    // The claim is returned for the caller to persist as it sees fit.
    expect(Object.keys(result.output).sort()).toEqual(['claim', 'operation']);
  });

  it('TEST 18b — a self-referencing derivation is an expected failure', async () => {
    const subject = subjectRef();
    const result = await invokeProvenance(
      derivationInput([subject.sovereignAssetId]),
      { subject },
    );
    expect(failureCodes(result)).toEqual([CODES.derivationSelfReference]);
    expect(CODES.derivationSelfReference).toBe('PROVENANCE_DERIVATION_SELF_REFERENCE');

    // Also when the child is merely among several sources.
    const mixed = await invokeProvenance(
      derivationInput([mintSovereignAssetId(), subject.sovereignAssetId]),
      { subject },
    );
    expect(failureCodes(mixed)).toEqual([CODES.derivationSelfReference]);
  });

  it('TEST 18c — occurredAt and issuedAt stay distinct facts', async () => {
    const result = succeed(await invokeProvenance(derivationInput([mintSovereignAssetId()], {
      occurredAt: '2026-01-01T00:00:00.000Z',
      issuedAt: '2026-08-17T12:00:00.000Z',
    })));
    if (result.output.operation !== 'record-derivation') throw new Error('unreachable');
    expect(result.output.claim.metadata.occurredAt).toBe('2026-01-01T00:00:00.000Z');
    expect(result.output.claim.issuedAt).toBe('2026-08-17T12:00:00.000Z');
  });

  it('TEST 18d — the caller\'s source array is not mutated', async () => {
    const sources = [mintSovereignAssetId(), mintSovereignAssetId()];
    const snapshot = [...sources];
    await invokeProvenance(derivationInput(sources));
    expect(sources).toEqual(snapshot);
    expect(Object.isFrozen(sources)).toBe(false);
  });
});

describe('SM-05 / Provenance never signs (PROVENANCE TESTS 19-20)', () => {
  it('TEST 19 — no provenance claim is automatically signed', async () => {
    for (const input of [originInput(), authorshipInput(), derivationInput([mintSovereignAssetId()])]) {
      const result = succeed(await invokeProvenance(input));
      const output = result.output as { claim?: Record<string, unknown> };
      expect(output.claim).toBeDefined();
      for (const forbidden of ['proof', 'digest', 'signature', 'publicKey']) {
        expect(forbidden in (output.claim ?? {})).toBe(false);
      }
      expect(canonicalizeJSON(result.output)).not.toContain('proof');
    }

    const source = capsuleSource('provenance.ts');
    for (const forbidden of [
      'signClaim', 'verifySignedClaim', 'signSovereignPayload', 'verifySovereignSignature',
      'signSovereignManifest', 'verifySovereignManifest', 'generateSovereignKeyPair',
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });

  it('TEST 20 — no key material of any kind is accepted or referenced', () => {
    const source = capsuleSource('provenance.ts');
    for (const forbidden of [
      'privateKey', 'secretKey', 'walletSecret', 'seedPhrase', 'passphrase', 'credential',
      'password', 'apiKey', 'token',
    ]) {
      expect(source.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it('TEST 20b — the existing signing primitives remain public and unweakened', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const manifest = require('@aoc/protocol/manifest') as Record<string, unknown>;
    for (const preserved of ['signClaim', 'verifySignedClaim', 'signSovereignManifest', 'generateSovereignKeyPair']) {
      expect(typeof manifest[preserved]).toBe('function');
    }
  });
});

describe('SM-05 / common result and evidence (PROVENANCE TESTS 21-25)', () => {
  it('TEST 21 — the common result preserves the invocation subject and creates none', async () => {
    const subject = subjectRef();
    const result = succeed(await invokeProvenance(originInput(), { subject }));

    expect(result.subject?.sovereignAssetId).toBe(subject.sovereignAssetId);
    expect(result.evidence.subject?.sovereignAssetId).toBe(subject.sovereignAssetId);
  });

  it('TEST 21b — an open-world external reference on the subject survives untouched', async () => {
    const subject: SovereignSubjectRef = {
      sovereignAssetId: mintSovereignAssetId(),
      externalReference: buildSovereignExternalReference({
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'future://provider/object/92817',
      }),
    };
    const result = succeed(await invokeProvenance(originInput({ assertedOrigin: 'future-system-origin-42' }), { subject }));

    expect(result.evidence.subject?.externalReference?.locator).toBe('future://provider/object/92817');
    if (result.output.operation !== 'declare-origin') throw new Error('unreachable');
    expect(result.output.claim.subject).toBe(subject.sovereignAssetId);
    expect(result.output.claim.metadata.assertedOrigin).toBe('future-system-origin-42');
  });

  it('TEST 22 — the evidence carries the exact canonical AOC.PROVENANCE id and version', async () => {
    const result = succeed(await invokeProvenance(originInput(), { subject: subjectRef(), correlationId: 'flow-1' }));

    expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
    expect(result.evidence.capability.id).toBe('aoc:sovereignty-capability:provenance');
    expect(result.evidence.capability.version).toBe(PROVENANCE_REF.version);
    expect(result.evidence.invocationId).toBe(result.invocationId);
    expect(result.evidence.correlationId).toBe('flow-1');
    expect(result.evidence.outcome).toBe('succeeded');
  });

  it('TEST 23 — the generic evidence excludes the raw claim output', async () => {
    const result = succeed(await invokeProvenance(originInput({
      assertedOrigin: 'captured by field team, Reykjavik, 2019',
    })));
    const serialized = JSON.stringify(result.evidence);

    for (const leak of ['assertedOrigin', 'Reykjavik', 'claim:origin:001', 'metadata', 'assertionRef']) {
      expect(serialized).not.toContain(leak);
    }
  });

  it('TEST 24 — the generic evidence excludes the lineage graph output', async () => {
    const g = { a: mintSovereignAssetId(), b: mintSovereignAssetId() };
    const claim = buildDerivationClaim({
      id: 'claim:derivation:lineage',
      sovereignAssetId: g.b,
      issuer: ISSUER,
      sourceSovereignAssetIds: [g.a],
      relation: DerivationRelationKind.DerivedFrom,
      issuedAt: '2026-08-17T12:00:00.000Z',
    });
    const result = succeed(await invokeProvenance(
      { operation: 'trace-lineage', direction: 'ancestors', derivationClaims: [claim] },
      { subject: subjectRef(g.b) },
    ));
    const serialized = JSON.stringify(result.evidence);

    for (const leak of ['nodes', 'edges', 'cycleDetected', 'truncated', 'claim:derivation:lineage', g.a]) {
      expect(serialized).not.toContain(leak);
    }
  });

  it('TEST 25 — the generic evidence excludes the issuer payload and evidence documents', async () => {
    const result = succeed(await invokeProvenance(authorshipInput({
      issuer: { id: 'principal:studio-42', kind: 'Organization', displayName: 'Studio Fortytwo' },
      statement: 'Authored in-house by the studio',
      evidenceRefs: ['evidence:employment-contract-7'],
    })));
    const serialized = JSON.stringify(result.evidence);

    for (const leak of [
      'principal:studio-42', 'Studio Fortytwo', 'Organization', 'Authored in-house',
      'evidence:employment-contract-7', 'issuer',
    ]) {
      expect(serialized).not.toContain(leak);
    }
    // The capsule populates no evidenceRefs: a claim is not automatically a
    // stored evidence artifact.
    expect('evidenceRefs' in result.evidence).toBe(false);
  });

  it('TEST 25b — evidence stays portable and canonicalizable', async () => {
    const result = succeed(await invokeProvenance(originInput()));
    expect(canonicalizeJSON(JSON.parse(JSON.stringify(result.evidence)))).toBe(canonicalizeJSON(result.evidence));
  });
});

describe('SM-05 / malformed input is an expected failure (PROVENANCE TESTS 26-28)', () => {
  it('TEST 26 — malformed origin input', async () => {
    expect(failureCodes(await invokeProvenance(originInput({ assertedOrigin: '   ' })))).toContain(CODES.invalidOrigin);
    expect(failureCodes(await invokeProvenance(originInput({ claimId: '' })))).toContain(CODES.invalidClaimId);
    expect(failureCodes(await invokeProvenance(originInput({ issuer: { id: '', kind: '' } })))).toContain(CODES.invalidIssuer);
    expect(failureCodes(await invokeProvenance(originInput({ issuedAt: '2019-06-01' })))).toContain(CODES.invalidTimestamp);
    expect(failureCodes(await invokeProvenance(originInput({ evidenceRefs: ['  '] })))).toContain(CODES.invalidEvidenceRefs);
  });

  it('TEST 27 — malformed authorship input', async () => {
    expect(failureCodes(await invokeProvenance(authorshipInput({ statement: '' }))))
      .toContain(CODES.invalidAuthorshipStatement);
  });

  it('TEST 28 — malformed derivation input', async () => {
    expect(failureCodes(await invokeProvenance(derivationInput([])))).toContain(CODES.derivationSourcesRequired);
    expect(failureCodes(await invokeProvenance(derivationInput(['not-a-subject' as SovereignAssetId]))))
      .toContain(CODES.invalidSourceSubject);

    const duplicate = mintSovereignAssetId();
    expect(failureCodes(await invokeProvenance(derivationInput([duplicate, duplicate]))))
      .toContain(CODES.duplicateDerivationSource);

    expect(failureCodes(await invokeProvenance(derivationInput([mintSovereignAssetId()], { relation: 'PlagiarizedFrom' }))))
      .toContain(CODES.invalidDerivationRelation);
    expect(failureCodes(await invokeProvenance(derivationInput([mintSovereignAssetId()], { statement: ' ' }))))
      .toContain(CODES.invalidStatement);
    expect(failureCodes(await invokeProvenance(derivationInput([mintSovereignAssetId()], { occurredAt: 'yesterday' }))))
      .toContain(CODES.invalidTimestamp);
  });

  it('TEST 28b — malformed lineage input', async () => {
    const subject = subjectRef();
    expect(failureCodes(await invokeProvenance(
      { operation: 'trace-lineage', direction: 'sideways', derivationClaims: [] },
      { subject },
    ))).toContain(CODES.invalidLineageDirection);

    expect(failureCodes(await invokeProvenance(
      { operation: 'trace-lineage', direction: 'ancestors', derivationClaims: [{ nonsense: true }] },
      { subject },
    ))).toContain(CODES.invalidLineageData);

    expect(failureCodes(await invokeProvenance(
      { operation: 'trace-lineage', direction: 'ancestors', derivationClaims: [], maxDepth: 0 },
      { subject },
    ))).toContain(CODES.invalidMaxDepth);
  });

  it('TEST 28c — a disputable but well-formed assertion SUCCEEDS', async () => {
    // "I authored this" may be false. Protocol cannot know that from the
    // invocation, and refusing to record it would be a claim Protocol has no
    // basis for. Disagreement is expressed by contesting the claim.
    const result = await invokeProvenance(authorshipInput({
      statement: 'I personally authored every part of this work, alone',
      issuer: 'principal:possibly-lying',
    }));
    expect(result.status).toBe('succeeded');
  });

  it('TEST 28d — the input validator is exported, total and non-mutating', () => {
    const sources = [mintSovereignAssetId(), mintSovereignAssetId()];
    const snapshot = [...sources];
    const input = derivationInput(sources);

    expect(isValidProvenanceSovereigntyCapabilityInput(input)).toBe(true);
    expect(validateProvenanceSovereigntyCapabilityInput(input).valid).toBe(true);
    expect(sources).toEqual(snapshot);

    for (const value of [null, undefined, 'origin', 42, [], {}]) {
      expect(isValidProvenanceSovereigntyCapabilityInput(value)).toBe(false);
    }
  });
});

describe('SM-05 / unexpected faults follow SM-03 semantics (PROVENANCE TESTS 29-30)', () => {
  const explodingClock = () => {
    throw new Error('clock exploded');
  };

  it('TEST 29 — an unexpected primitive fault surfaces as a typed implementation fault', async () => {
    const implementation = createProvenanceSovereigntyCapabilityImplementation({ clock: explodingClock });
    let caught: unknown;
    try {
      await invokeProvenance(originInput(), { subject: subjectRef() }, implementation);
    } catch (error) {
      caught = error;
    }

    expect(isSovereigntyCapabilityInvocationError(caught)).toBe(true);
    const error = caught as SovereigntyCapabilityInvocationError;
    expect(error.details.reasonCodes).toContain('SOVEREIGNTY_CAPABILITY_IMPLEMENTATION_ERROR');
    // Sanitized: no exception text reaches the portable record.
    expect(JSON.stringify(error.evidence)).not.toContain('clock exploded');
    expect(error.evidence?.outcome).toBe('failed');
  });

  it('TEST 30 — a faulting implementation is invoked exactly once and never retried', async () => {
    let invocations = 0;
    const counting = createProvenanceSovereigntyCapabilityImplementation({
      clock: () => {
        invocations += 1;
        throw new Error('clock exploded');
      },
    });

    await invokeProvenance(originInput(), { subject: subjectRef() }, counting).catch(() => undefined);
    expect(invocations).toBe(1);
  });
});

describe('SM-05 / contestation (CONTEST TESTS 1-10)', () => {
  const contestInput = (claim: unknown, overrides: Record<string, unknown> = {}) => ({
    operation: 'contest-provenance-claim' as const,
    standingId: 'standing:001',
    claim,
    reason: 'Independent party disputes the asserted derivation relationship',
    ...overrides,
  });

  const makeClaims = async (subject: SovereignSubjectRef) => {
    const origin = (succeed(await invokeProvenance(originInput(), { subject })).output as { claim: OriginClaim }).claim;
    const authorship = (succeed(await invokeProvenance(authorshipInput(), { subject })).output as {
      claim: AuthorityClaim;
    }).claim;
    const derivation = (succeed(await invokeProvenance(derivationInput([mintSovereignAssetId()]), { subject })).output as {
      claim: DerivationClaim;
    }).claim;
    return { origin, authorship, derivation };
  };

  it('TEST 1 — a valid OriginClaim can be contested', async () => {
    const subject = subjectRef();
    const { origin } = await makeClaims(subject);
    const result = succeed(await invokeProvenance(contestInput(origin), { subject }));

    if (result.output.operation !== 'contest-provenance-claim') throw new Error('unreachable');
    expect(result.output.standing.claimRef).toBe(origin.id);
  });

  it('TEST 2 — a valid Authorship claim can be contested', async () => {
    const subject = subjectRef();
    const { authorship } = await makeClaims(subject);
    const result = succeed(await invokeProvenance(contestInput(authorship), { subject }));
    if (result.output.operation !== 'contest-provenance-claim') throw new Error('unreachable');
    expect(result.output.standing.claimRef).toBe(authorship.id);
  });

  it('TEST 3 — a valid DerivationClaim can be contested', async () => {
    const subject = subjectRef();
    const { derivation } = await makeClaims(subject);
    const result = succeed(await invokeProvenance(contestInput(derivation), { subject }));
    if (result.output.operation !== 'contest-provenance-claim') throw new Error('unreachable');
    expect(result.output.standing.claimRef).toBe(derivation.id);
  });

  it('TEST 4 — the standing status is Contested', async () => {
    const subject = subjectRef();
    const { derivation } = await makeClaims(subject);
    const result = succeed(await invokeProvenance(contestInput(derivation), { subject }));
    if (result.output.operation !== 'contest-provenance-claim') throw new Error('unreachable');

    expect(result.output.standing.status).toBe(StandingStatus.Contested);
    expect(result.output.standing.status).toBe('Contested');
    expect(result.output.standing.reason).toBe('Independent party disputes the asserted derivation relationship');
  });

  it('TEST 5 — the original claim is returned unchanged and unmutated', async () => {
    const subject = subjectRef();
    const { derivation } = await makeClaims(subject);
    const before = canonicalizeJSON(derivation);

    const result = succeed(await invokeProvenance(contestInput(derivation), { subject }));
    if (result.output.operation !== 'contest-provenance-claim') throw new Error('unreachable');

    expect(canonicalizeJSON(derivation)).toBe(before);
    expect(result.output.claim).toBe(derivation);
    expect(isValidDerivationClaim(derivation)).toBe(true);
    // Contestation does not delete, supersede or rewrite the claim.
    expect(result.output.claim.id).toBe(derivation.id);
  });

  it('TEST 6 — a claim about a different subject is rejected', async () => {
    const subject = subjectRef();
    const { derivation } = await makeClaims(subject);
    const result = await invokeProvenance(contestInput(derivation), { subject: subjectRef() });

    expect(failureCodes(result)).toEqual([CODES.claimSubjectMismatch]);
    expect(CODES.claimSubjectMismatch).toBe('PROVENANCE_CLAIM_SUBJECT_MISMATCH');
  });

  it('TEST 7 — a blank reason is rejected, as is a malformed standing id or claim', async () => {
    const subject = subjectRef();
    const { origin } = await makeClaims(subject);

    expect(failureCodes(await invokeProvenance(contestInput(origin, { reason: '   ' }), { subject })))
      .toContain(CODES.invalidContestationReason);
    expect(failureCodes(await invokeProvenance(contestInput(origin, { standingId: '' }), { subject })))
      .toContain(CODES.invalidStandingId);
    expect(failureCodes(await invokeProvenance(contestInput({ not: 'a claim' }), { subject })))
      .toContain(CODES.invalidProvenanceClaim);
  });

  it('TEST 8 — effectiveAt uses a canonical timestamp, supplied or clocked', async () => {
    const subject = subjectRef();
    const { origin } = await makeClaims(subject);

    const supplied = succeed(await invokeProvenance(
      contestInput(origin, { effectiveAt: '2026-09-01T00:00:00.000Z' }),
      { subject },
    ));
    if (supplied.output.operation !== 'contest-provenance-claim') throw new Error('unreachable');
    expect(supplied.output.standing.effectiveAt).toBe('2026-09-01T00:00:00.000Z');

    const clocked = succeed(await invokeProvenance(
      contestInput(origin),
      { subject },
      createProvenanceSovereigntyCapabilityImplementation({ clock: fixedClock('2026-08-17T12:00:00.000Z') }),
    ));
    if (clocked.output.operation !== 'contest-provenance-claim') throw new Error('unreachable');
    expect(clocked.output.standing.effectiveAt).toBe('2026-08-17T12:00:00.000Z');

    expect(failureCodes(await invokeProvenance(contestInput(origin, { effectiveAt: 'soon' }), { subject })))
      .toContain(CODES.invalidTimestamp);
  });

  it('TEST 9 — contestation records a challenge and adjudicates no winner', async () => {
    const subject = subjectRef();
    const { derivation } = await makeClaims(subject);
    const result = succeed(await invokeProvenance(contestInput(derivation), { subject }));
    if (result.output.operation !== 'contest-provenance-claim') throw new Error('unreachable');

    const serialized = canonicalizeJSON(result.output.standing);
    for (const forbidden of [
      'winner', 'resolved', 'upheld', 'rejected', 'verdict', 'decision', 'approval',
      'policy', 'governance', 'enforcement',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
    expect(Object.keys(result.output.standing).sort()).toEqual(['claimRef', 'effectiveAt', 'id', 'reason', 'status']);
  });

  it('TEST 10 — contestation does not mutate any manifest state', async () => {
    const subject = subjectRef();
    const manifest = buildSovereignManifestV1(
      { sovereignAssetId: subject.sovereignAssetId, registrant: 'principal:registrant', authorityClaims: [] },
      new Date('2026-01-01T00:00:00.000Z'),
    );
    const before = canonicalizeJSON(manifest);
    const { derivation } = await makeClaims(subject);

    succeed(await invokeProvenance(contestInput(derivation), { subject }));

    expect(canonicalizeJSON(manifest)).toBe(before);
    expect(manifest.state).toBe('active');
    expect(capsuleSource('provenance.ts')).not.toContain('SovereignAssetState');
  });

  it('TEST 10b — a contested claim still appears in a lineage trace', async () => {
    const subject = subjectRef();
    const { derivation } = await makeClaims(subject);
    succeed(await invokeProvenance(contestInput(derivation), { subject }));

    const traced = succeed(await invokeProvenance(
      { operation: 'trace-lineage', direction: 'ancestors', derivationClaims: [derivation] },
      { subject },
    ));
    if (traced.output.operation !== 'trace-lineage') throw new Error('unreachable');

    // History is preserved, not hidden: a consumer decides what to show.
    expect(traced.output.trace.edges.map((edge) => edge.claimId)).toEqual([derivation.id]);
    expect(traced.output.trace.nodes).toHaveLength(1);
  });
});

describe('SM-05 / mineral separation (BOUNDARY TESTS 1-10)', () => {
  const parentWithClaims = async () => {
    const parent = subjectRef();
    const licence = (succeed(await invokeProvenance(authorshipInput({ claimId: 'claim:parent:authorship' }), {
      subject: parent,
    })).output as { claim: AuthorityClaim }).claim;
    const origin = (succeed(await invokeProvenance(originInput({
      claimId: 'claim:parent:origin',
      evidenceRefs: ['evidence:parent-provenance-file'],
    }), { subject: parent })).output as { claim: OriginClaim }).claim;
    return { parent, licence, origin };
  };

  it('TEST 1 — derivation copies no AuthorityClaim from source to child', async () => {
    const { parent, licence } = await parentWithClaims();
    const child = subjectRef();
    const result = succeed(await invokeProvenance(derivationInput([parent.sovereignAssetId]), { subject: child }));

    const serialized = canonicalizeJSON(result.output);
    expect(serialized).not.toContain(licence.id);
    expect(serialized).not.toContain('Authorship');
    expect(serialized).not.toContain(licence.metadata.statement);
  });

  it('TEST 2 — derivation copies no licence, rights, terms or obligations', async () => {
    const { parent } = await parentWithClaims();
    const result = succeed(await invokeProvenance(derivationInput([parent.sovereignAssetId])));
    const serialized = withoutOpaqueIds(canonicalizeJSON(result.output));

    for (const forbidden of [
      'license', 'licence', 'terms', 'royalty', 'commercialUseAllowed', 'allowedDerivative',
      'restrictions', 'obligations', 'permissions', 'expiration', 'fee',
    ]) {
      expect(serialized.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it('TEST 3 — derivation copies no evidenceRefs from source claims', async () => {
    const { parent, origin } = await parentWithClaims();
    expect(origin.evidenceRefs).toEqual(['evidence:parent-provenance-file']);

    const result = succeed(await invokeProvenance(derivationInput([parent.sovereignAssetId])));
    if (result.output.operation !== 'record-derivation') throw new Error('unreachable');

    expect(result.output.claim.evidenceRefs).toEqual([]);
    expect(canonicalizeJSON(result.output)).not.toContain('evidence:parent-provenance-file');
  });

  it('TEST 4 — derivation implies no ownership', async () => {
    const result = succeed(await invokeProvenance(derivationInput([mintSovereignAssetId()])));
    const serialized = withoutOpaqueIds(canonicalizeJSON(result.output));
    for (const forbidden of ['owner', 'legalOwner', 'beneficialOwner', 'titleHolder', 'copyright']) {
      expect(serialized.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it('TEST 5 — derivation implies no authorization to derive', async () => {
    const result = succeed(await invokeProvenance(derivationInput([mintSovereignAssetId()])));
    const serialized = withoutOpaqueIds(canonicalizeJSON(result.output));
    for (const forbidden of ['authorized', 'permitted', 'approval', 'grant', 'consent', 'allowed']) {
      expect(serialized.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it('TEST 6 — derivation implies no equal ContentIdentity', async () => {
    const parentBytes = new TextEncoder().encode('parent bytes');
    const childBytes = new TextEncoder().encode('child bytes, transformed');
    const parentIdentity = computeContentIdentity(parentBytes);
    const childIdentity = computeContentIdentity(childBytes);
    expect(parentIdentity.digest).not.toBe(childIdentity.digest);

    // A transformation normally changes the bytes; the derivation is still valid.
    const result = succeed(await invokeProvenance(
      derivationInput([mintSovereignAssetId()], { relation: DerivationRelationKind.TransformedFrom }),
    ));
    expect(result.status).toBe('succeeded');
    expect(canonicalizeJSON(result.output)).not.toContain(parentIdentity.digest);
  });

  it('TEST 7 — equal ContentIdentity does not create a DerivationClaim', async () => {
    const bytes = new TextEncoder().encode('identical bytes');
    const first = computeContentIdentity(bytes);
    const second = computeContentIdentity(bytes);
    expect(first.digest).toBe(second.digest);

    // Two subjects with identical bytes remain unrelated: only an explicit
    // assertion creates lineage.
    const a = subjectRef();
    const b = subjectRef();
    const traced = succeed(await invokeProvenance(
      { operation: 'trace-lineage', direction: 'ancestors', derivationClaims: [] },
      { subject: b },
    ));
    if (traced.output.operation !== 'trace-lineage') throw new Error('unreachable');
    expect(traced.output.trace.nodes).toEqual([]);
    expect(traced.output.trace.edges).toEqual([]);
    expect(a.sovereignAssetId).not.toBe(b.sovereignAssetId);
  });

  it('TEST 8 — Provenance does not call signClaim', () => {
    expect(capsuleSource('provenance.ts')).not.toContain('signClaim');
  });

  it('TEST 9 — Provenance does not call verifySignedClaim', () => {
    expect(capsuleSource('provenance.ts')).not.toContain('verifySignedClaim');
  });

  it('TEST 10 — Provenance imports no Enterprise, runtime, provider or storage code', () => {
    const raw = readFileSync(
      join(__dirname, '..', '..', 'packages', 'protocol', 'src', 'sovereignty-capabilities', 'capsules', 'provenance.ts'),
      'utf8',
    );
    for (const match of raw.matchAll(/from\s+'([^']+)'/g)) {
      const specifier = match[1];
      expect(specifier).not.toMatch(/enterprise|pmfreak|@aoc\/sdk|provider|runtime|storage|supabase|governance/i);
      // Only relative Protocol siblings — this capsule needs no node builtin at all.
      expect(specifier.startsWith('.')).toBe(true);
    }
  });

  it('TEST 2-regression — the vocabulary scan survives a subject id that spells a forbidden token', () => {
    // A real id observed in CI: `…-3bfee4a707b8` contains "fee". Before the
    // redaction, BOUNDARY TEST 2 failed on roughly 1% of runs for reasons that
    // had nothing to do with licensing leaking into a derivation claim. This
    // pins the fix deterministically rather than trusting a green run.
    const poisoned = JSON.stringify({
      claim: { subject: 'aoc:sovereign-asset:1ca42904-f074-45f5-89c4-3bfee4a707b8' },
    });
    expect(poisoned.toLowerCase()).toContain('fee');
    expect(withoutOpaqueIds(poisoned).toLowerCase()).not.toContain('fee');
    // The placeholder must not itself smuggle in a token the scans look for.
    for (const forbidden of ['license', 'licence', 'terms', 'fee', 'owner', 'grant', 'consent', 'allowed']) {
      expect('aoc:sovereign-asset:<id>').not.toContain(forbidden);
    }
  });

  it('TEST 10b — no import-time side effect: importing registers and mutates nothing', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const surface = require('@aoc/protocol/sovereignty-capabilities') as Record<string, unknown>;
    for (const [name, value] of Object.entries(surface)) {
      if (typeof value === 'object' && value !== null && 'capability' in value && 'invoke' in value) {
        throw new Error(`export ${name} is a shipped implementation instance`);
      }
    }
    expect(typeof surface.createProvenanceSovereigntyCapabilityImplementation).toBe('function');
    for (const registrationApi of ['registerSovereigntyCapabilityImplementation', 'setProvenanceImplementation']) {
      expect(surface[registrationApi]).toBeUndefined();
    }
  });
});
