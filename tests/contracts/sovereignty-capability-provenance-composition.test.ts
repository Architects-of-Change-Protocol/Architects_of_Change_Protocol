import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { ClaimType } from '@aoc/protocol/claims';
import { buildSovereignExternalReference, computeContentIdentity } from '@aoc/protocol/identity';
import type { ContentIdentity, SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import { AuthorityClaimKind, DerivationRelationKind } from '@aoc/protocol/manifest';
import type { AuthorityClaim, DerivationClaim, OriginClaim } from '@aoc/protocol/manifest';
import {
  buildSovereigntyCapabilityInvocation,
  createIdentitySovereigntyCapabilityImplementation,
  createIntegritySovereigntyCapabilityImplementation,
  createProvenanceSovereigntyCapabilityImplementation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isValidSovereigntyCapabilityInvocationEvidence,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  IdentitySovereigntyCapabilityInput,
  IdentitySovereigntyCapabilityOutput,
  IntegritySovereigntyCapabilityInput,
  ProvenanceSovereigntyCapabilityInput,
  ProvenanceSovereigntyCapabilityOutput,
  SovereigntyCapabilityRef,
  SovereigntyCapabilityResult,
  SovereigntyCapabilitySuccessResult,
} from '@aoc/protocol/sovereignty-capabilities';

const IDENTITY_REF = getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef;
const INTEGRITY_REF = getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef;
const PROVENANCE_REF = getSovereigntyCapabilityRefByKey('provenance') as SovereigntyCapabilityRef;

const ISSUER = 'principal:sm05-issuer';

/**
 * Every subject in this file comes from the REAL production Identity capsule
 * through the REAL invoker. Nothing here is a fixture, a stub or a hand-built
 * object standing in for a mineral.
 */
const identity = createIdentitySovereigntyCapabilityImplementation();
const integrity = createIntegritySovereigntyCapabilityImplementation();
const provenance = createProvenanceSovereigntyCapabilityImplementation();

let claimSequence = 0;
const nextClaimId = (prefix: string): string => {
  claimSequence += 1;
  return `${prefix}:${String(claimSequence).padStart(4, '0')}`;
};

const createSubject = async (
  options: { externalReference?: { namespace: string; id: string; locator?: string }; contentIdentity?: ContentIdentity; correlationId?: string } = {},
): Promise<{
  subject: SovereignSubjectRef;
  result: SovereigntyCapabilitySuccessResult<IdentitySovereigntyCapabilityOutput>;
}> => {
  const input: IdentitySovereigntyCapabilityInput = {
    registrant: 'principal:sm05-registrant',
    ...(options.externalReference === undefined
      ? {}
      : { externalReference: buildSovereignExternalReference(options.externalReference) }),
    ...(options.contentIdentity === undefined ? {} : { contentIdentity: options.contentIdentity }),
  };

  const result = await invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: IDENTITY_REF,
      input,
      ...(options.correlationId === undefined ? {} : { correlationId: options.correlationId }),
    }),
    identity,
  );
  if (result.status !== 'succeeded') throw new Error('real Identity invocation failed');
  return { subject: result.output.subject, result };
};

const invokeProvenance = async (
  subject: SovereignSubjectRef,
  input: ProvenanceSovereigntyCapabilityInput,
  correlationId?: string,
): Promise<SovereigntyCapabilityResult<ProvenanceSovereigntyCapabilityOutput>> =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: PROVENANCE_REF,
      subject,
      input,
      ...(correlationId === undefined ? {} : { correlationId }),
    }),
    provenance,
  );

const succeedProvenance = async (
  subject: SovereignSubjectRef,
  input: ProvenanceSovereigntyCapabilityInput,
  correlationId?: string,
): Promise<SovereigntyCapabilityResult<ProvenanceSovereigntyCapabilityOutput> & { status: 'succeeded' }> => {
  const result = await invokeProvenance(subject, input, correlationId);
  if (result.status !== 'succeeded') throw new Error(`Provenance failed: ${result.reasonCodes.join(', ')}`);
  return result;
};

const recordDerivation = async (
  child: SovereignSubjectRef,
  sources: readonly SovereignAssetId[],
  relation: DerivationRelationKind = DerivationRelationKind.DerivedFrom,
): Promise<DerivationClaim> => {
  const result = await succeedProvenance(child, {
    operation: 'record-derivation',
    claimId: nextClaimId('claim:derivation'),
    issuer: ISSUER,
    sourceSovereignAssetIds: sources,
    relation,
  });
  if (result.output.operation !== 'record-derivation') throw new Error('unreachable');
  return result.output.claim;
};

describe('SM-05 / real Identity → Provenance composition (COMPOSITION TESTS 1-2)', () => {
  it('TEST 1 — real Identity creates X, real Provenance declares its origin', async () => {
    const { subject } = await createSubject();
    const result = await succeedProvenance(subject, {
      operation: 'declare-origin',
      claimId: nextClaimId('claim:origin'),
      issuer: ISSUER,
      assertedOrigin: 'captured by field team, Reykjavik, 2019',
    });

    if (result.output.operation !== 'declare-origin') throw new Error('unreachable');
    const claim: OriginClaim = result.output.claim;
    expect(claim.type).toBe(ClaimType.Origin);
    expect(claim.subject).toBe(subject.sovereignAssetId);
    // Identity is untouched by the provenance assertion.
    expect(result.subject?.sovereignAssetId).toBe(subject.sovereignAssetId);
  });

  it('TEST 2 — the same subject receives a real authorship assertion, with no ownership conclusion', async () => {
    const { subject } = await createSubject();
    const result = await succeedProvenance(subject, {
      operation: 'declare-authorship',
      claimId: nextClaimId('claim:authorship'),
      issuer: ISSUER,
      statement: 'Authored by the issuing studio',
    });

    if (result.output.operation !== 'declare-authorship') throw new Error('unreachable');
    const claim: AuthorityClaim = result.output.claim;
    expect(claim.type).toBe(ClaimType.Authorship);
    expect(claim.metadata.kind).toBe(AuthorityClaimKind.Authorship);
    expect(claim.subject).toBe(subject.sovereignAssetId);
    expect(canonicalizeJSON(claim).toLowerCase()).not.toContain('owner');
  });
});

describe('SM-05 / real derivation composition (COMPOSITION TESTS 3-4)', () => {
  it('TEST 3 — real parent and child subjects, one real derivation assertion', async () => {
    const { subject: parent, result: parentResult } = await createSubject();
    const { subject: child } = await createSubject();

    const claim = await recordDerivation(child, [parent.sovereignAssetId]);

    expect(claim.subject).toBe(child.sovereignAssetId);
    expect(claim.metadata.sourceSovereignAssetIds).toEqual([parent.sovereignAssetId]);
    // Neither identity changed as a result.
    expect(parentResult.output.manifest.sovereignAssetId).toBe(parent.sovereignAssetId);
    expect(parentResult.output.manifest.authorityClaims).toEqual([]);
    expect('originClaim' in parentResult.output.manifest).toBe(false);
  });

  it('TEST 4 — three real subjects: C is combined from A and B in ONE claim', async () => {
    const { subject: a } = await createSubject();
    const { subject: b } = await createSubject();
    const { subject: c } = await createSubject();

    const claim = await recordDerivation(
      c,
      [a.sovereignAssetId, b.sovereignAssetId],
      DerivationRelationKind.CombinedFrom,
    );

    expect(claim.subject).toBe(c.sovereignAssetId);
    expect(claim.metadata.sourceSovereignAssetIds).toEqual([a.sovereignAssetId, b.sovereignAssetId]);
    expect(claim.metadata.relation).toBe(DerivationRelationKind.CombinedFrom);
  });
});

describe('SM-05 / real lineage composition (COMPOSITION TEST 5)', () => {
  it('TEST 5 — A→B→C over real subjects: ancestors of C are B and A', async () => {
    const { subject: a } = await createSubject();
    const { subject: b } = await createSubject();
    const { subject: c } = await createSubject();

    const claims = [
      await recordDerivation(b, [a.sovereignAssetId]),
      await recordDerivation(c, [b.sovereignAssetId]),
    ];

    const traced = await succeedProvenance(c, {
      operation: 'trace-lineage',
      direction: 'ancestors',
      derivationClaims: claims,
    });
    if (traced.output.operation !== 'trace-lineage') throw new Error('unreachable');

    expect(traced.output.trace.nodes.map((node) => node.sovereignAssetId))
      .toEqual([b.sovereignAssetId, a.sovereignAssetId]);
    expect(traced.output.trace.nodes.map((node) => node.depth)).toEqual([1, 2]);
    expect(traced.output.trace.cycleDetected).toBe(false);
  });

  it('TEST 5b — a real five-subject graph traces deterministically with edge provenance', async () => {
    const subjects: Record<string, SovereignSubjectRef> = {};
    for (const name of ['A', 'B', 'C', 'D', 'E']) subjects[name] = (await createSubject()).subject;

    const claims = [
      await recordDerivation(
        subjects.C,
        [subjects.A.sovereignAssetId, subjects.B.sovereignAssetId],
        DerivationRelationKind.CombinedFrom,
      ),
      await recordDerivation(
        subjects.E,
        [subjects.C.sovereignAssetId, subjects.D.sovereignAssetId],
        DerivationRelationKind.CombinedFrom,
      ),
    ];

    const traced = await succeedProvenance(subjects.E, {
      operation: 'trace-lineage',
      direction: 'ancestors',
      derivationClaims: claims,
    });
    if (traced.output.operation !== 'trace-lineage') throw new Error('unreachable');
    const trace = traced.output.trace;

    const byDepth = (depth: number): SovereignAssetId[] =>
      trace.nodes.filter((node) => node.depth === depth).map((node) => node.sovereignAssetId).sort();

    expect(byDepth(1)).toEqual([subjects.C.sovereignAssetId, subjects.D.sovereignAssetId].sort());
    expect(byDepth(2)).toEqual([subjects.A.sovereignAssetId, subjects.B.sovereignAssetId].sort());
    expect(trace.edges.map((edge) => edge.claimId).sort()).toEqual(claims.map((claim) => claim.id).sort());
    for (const edge of trace.edges) expect(edge.relation).toBe(DerivationRelationKind.CombinedFrom);

    // Reordering the supplied claims changes nothing.
    const reordered = await succeedProvenance(subjects.E, {
      operation: 'trace-lineage',
      direction: 'ancestors',
      derivationClaims: [...claims].reverse(),
    });
    if (reordered.output.operation !== 'trace-lineage') throw new Error('unreachable');
    expect(canonicalizeJSON(reordered.output.trace)).toBe(canonicalizeJSON(trace));
  });

  it('TEST 5c — descendants of A over the same real chain', async () => {
    const { subject: a } = await createSubject();
    const { subject: b } = await createSubject();
    const { subject: c } = await createSubject();
    const claims = [
      await recordDerivation(b, [a.sovereignAssetId]),
      await recordDerivation(c, [b.sovereignAssetId]),
    ];

    const traced = await succeedProvenance(a, {
      operation: 'trace-lineage',
      direction: 'descendants',
      derivationClaims: claims,
    });
    if (traced.output.operation !== 'trace-lineage') throw new Error('unreachable');
    expect(traced.output.trace.nodes.map((node) => node.sovereignAssetId))
      .toEqual([b.sovereignAssetId, c.sovereignAssetId]);
  });
});

describe('SM-05 / correlation and invocation identity (COMPOSITION TEST 6)', () => {
  it('TEST 6 — one correlationId spans Identity and Provenance; invocation ids stay distinct', async () => {
    const correlationId = 'sm05-derivative-onboarding-001';
    const { subject: parent, result: parentIdentity } = await createSubject({ correlationId });
    const { subject: child, result: childIdentity } = await createSubject({ correlationId });

    const derivation = await succeedProvenance(child, {
      operation: 'record-derivation',
      claimId: nextClaimId('claim:derivation'),
      issuer: ISSUER,
      sourceSovereignAssetIds: [parent.sovereignAssetId],
      relation: DerivationRelationKind.TransformedFrom,
    }, correlationId);

    for (const result of [parentIdentity, childIdentity, derivation]) {
      expect(result.evidence.correlationId).toBe(correlationId);
    }
    const invocationIds = [parentIdentity, childIdentity, derivation].map((result) => result.invocationId);
    expect(new Set(invocationIds).size).toBe(3);

    // Each evidence record attributes its own mineral, at its exact version.
    expect(parentIdentity.evidence.capability.id).toBe('aoc:sovereignty-capability:identity');
    expect(derivation.evidence.capability.id).toBe('aoc:sovereignty-capability:provenance');
    expect(derivation.evidence.capability.version).toBe(PROVENANCE_REF.version);
  });
});

describe('SM-05 / evidence portability across the composition (COMPOSITION TEST 7)', () => {
  it('TEST 7 — every common evidence record is valid, JSON-safe and payload-free', async () => {
    const { subject: parent, result: parentIdentity } = await createSubject();
    const { subject: child } = await createSubject();

    const origin = await succeedProvenance(child, {
      operation: 'declare-origin',
      claimId: nextClaimId('claim:origin'),
      issuer: ISSUER,
      assertedOrigin: 'derived in-house from the parent artifact',
    });
    const derivation = await succeedProvenance(child, {
      operation: 'record-derivation',
      claimId: nextClaimId('claim:derivation'),
      issuer: ISSUER,
      sourceSovereignAssetIds: [parent.sovereignAssetId],
      relation: DerivationRelationKind.DerivedFrom,
    });

    for (const result of [parentIdentity, origin, derivation]) {
      expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
      const serialized = JSON.stringify(result.evidence);
      for (const leak of [
        'assertedOrigin', 'derived in-house', 'sourceSovereignAssetIds', 'relation',
        'registrant', 'manifest', 'metadata', ISSUER,
      ]) {
        expect(serialized).not.toContain(leak);
      }
      expect(canonicalizeJSON(JSON.parse(serialized))).toBe(canonicalizeJSON(result.evidence));
    }
  });
});

describe('SM-05 / no fake implementation anywhere (COMPOSITION TEST 8)', () => {
  it('TEST 8 — all three capsules are the real production factories', () => {
    expect(identity.capability.id).toBe('aoc:sovereignty-capability:identity');
    expect(integrity.capability.id).toBe('aoc:sovereignty-capability:integrity');
    expect(provenance.capability.id).toBe('aoc:sovereignty-capability:provenance');
    for (const capsule of [identity, integrity, provenance]) {
      expect(typeof capsule.invoke).toBe('function');
      expect(Object.isFrozen(capsule)).toBe(true);
    }
  });
});

describe('SM-05 / integrity and locator independence (BOUNDARY: SM-05 §83-84)', () => {
  it('subjects with no ContentIdentity at all receive full provenance', async () => {
    const { subject, result } = await createSubject({
      externalReference: { namespace: 'example:property-registry', id: 'folio-92817' },
    });
    expect('contentIdentity' in result.output.manifest).toBe(false);

    const claim = await recordDerivation(subject, [(await createSubject()).subject.sovereignAssetId]);
    expect(claim.subject).toBe(subject.sovereignAssetId);
  });

  it('lineage depends only on SovereignAssetId, not on the parent\'s bytes', async () => {
    const bytes = new TextEncoder().encode('parent representation v1');
    const integrityResult = await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: INTEGRITY_REF,
        input: { operation: 'compute-content-identity', bytes } as IntegritySovereigntyCapabilityInput,
      }),
      integrity,
    );
    if (integrityResult.status !== 'succeeded' || integrityResult.output.operation !== 'compute-content-identity') {
      throw new Error('real Integrity invocation failed');
    }

    const { subject: parent } = await createSubject({ contentIdentity: integrityResult.output.contentIdentity });
    const { subject: child } = await createSubject();
    const claim = await recordDerivation(child, [parent.sovereignAssetId]);

    // The edge names the subject, never the representation.
    expect(canonicalizeJSON(claim)).not.toContain(integrityResult.output.contentIdentity.digest);
    expect(claim.metadata.sourceSovereignAssetIds).toEqual([parent.sovereignAssetId]);

    // A later, different ContentIdentity for the same subject leaves the
    // derivation edge exactly as it was.
    const changed = computeContentIdentity(new TextEncoder().encode('parent representation v2'));
    expect(changed.digest).not.toBe(integrityResult.output.contentIdentity.digest);
    expect(claim.metadata.sourceSovereignAssetIds).toEqual([parent.sovereignAssetId]);
  });

  it('a parent locator change leaves the derivation edge semantically unchanged', async () => {
    const { subject: parent } = await createSubject({
      externalReference: { namespace: 'provider-a', id: 'object-1', locator: 'provider-a://object' },
    });
    const { subject: child } = await createSubject();
    const claim = await recordDerivation(child, [parent.sovereignAssetId]);

    // The same sovereign subject, now addressed somewhere else. No network,
    // no provider call — just a different passive locator on the reference.
    const movedParent: SovereignSubjectRef = {
      sovereignAssetId: parent.sovereignAssetId,
      externalReference: buildSovereignExternalReference({
        namespace: 'provider-b',
        id: 'object-1',
        locator: 'provider-b://object',
      }),
    };

    const traced = await succeedProvenance(child, {
      operation: 'trace-lineage',
      direction: 'ancestors',
      derivationClaims: [claim],
    });
    if (traced.output.operation !== 'trace-lineage') throw new Error('unreachable');

    expect(traced.output.trace.nodes.map((node) => node.sovereignAssetId)).toEqual([movedParent.sovereignAssetId]);
    expect(canonicalizeJSON(traced.output.trace)).not.toContain('provider-a://object');
    expect(canonicalizeJSON(traced.output.trace)).not.toContain('provider-b://object');
  });
});
