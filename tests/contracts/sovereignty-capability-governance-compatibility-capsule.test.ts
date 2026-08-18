import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import type { CanonicalStanding } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  computeContentIdentity,
  mintSovereignAssetId,
  parseSovereignAssetId,
} from '@aoc/protocol/identity';
import type { SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  buildDerivationClaim,
  buildOriginClaim,
  buildSovereignManifestV1,
  generateSovereignKeyPair,
  signClaim,
} from '@aoc/protocol/manifest';
import type { SignedClaim, VerifiableSovereignClaim } from '@aoc/protocol/manifest';
import { buildSovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import type {
  PortableSovereignClaimArtifact,
  SovereigntyPortabilityBundleV1,
} from '@aoc/protocol/portability';
import { buildSovereigntyInteroperabilityDescriptorV1 } from '@aoc/protocol/interoperability';
import {
  AOC_LICENSING_ACTION_TERM_IDS,
  AOC_LICENSING_SEMANTIC_NAMESPACE,
  SovereignLicenseTermsRuleEffect,
  buildLicenseTermsClaim,
} from '@aoc/protocol/licensing';
import type { LicenseTermsClaim, SovereignLicenseTermsRuleV1 } from '@aoc/protocol/licensing';
import {
  SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES,
  buildSovereignGovernanceHandoffV1,
} from '@aoc/protocol/governance-compatibility';
import type { SovereignGovernanceHandoffV1 } from '@aoc/protocol/governance-compatibility';
import {
  GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES,
  SOVEREIGNTY_CAPABILITY_IDS,
  buildSovereigntyCapabilityInvocation,
  createGovernanceCompatibilitySovereigntyCapabilityImplementation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isValidGovernanceCompatibilitySovereigntyCapabilityInput,
  isValidSovereigntyCapabilityInvocationEvidence,
  validateGovernanceCompatibilitySovereigntyCapabilityInput,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  GovernanceCompatibilitySovereigntyCapabilityInput,
  GovernanceCompatibilitySovereigntyCapabilityOutput,
  PrepareGovernanceHandoffOutput,
  SovereigntyCapabilityRef,
  SovereigntyCapabilityResult,
  ValidateGovernanceHandoffOutput,
} from '@aoc/protocol/sovereignty-capabilities';

const CODES = GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES;
const GOVERNANCE_REF = getSovereigntyCapabilityRefByKey(
  'governance_compatibility',
) as SovereigntyCapabilityRef;
const ISSUER = 'principal:sm10-issuer';
const REGISTRANT = 'principal:sm10-registrant';
const AT = '2026-08-18T09:00:00.000Z';
const SIGNED_AT = new Date(AT);

/** TEST ONLY signing material — never production key management. */
const KEY_PAIR = generateSovereignKeyPair();

const governance = createGovernanceCompatibilitySovereigntyCapabilityImplementation();

/** A deterministically different signature — never accidentally the original. */
const tamperSignature = (signature: string): string =>
  `${signature.startsWith('A') ? 'B' : 'A'}${signature.slice(1)}`;

const newId = (): SovereignAssetId => parseSovereignAssetId(mintSovereignAssetId());

const subjectFor = (
  id: SovereignAssetId,
  reference?: { namespace: string; id: string; locator?: string },
): SovereignSubjectRef => ({
  sovereignAssetId: id,
  ...(reference === undefined ? {} : { externalReference: buildSovereignExternalReference(reference) }),
});

const run = async (
  input: GovernanceCompatibilitySovereigntyCapabilityInput,
  options: { subject?: SovereignSubjectRef; correlationId?: string } = {},
): Promise<SovereigntyCapabilityResult<GovernanceCompatibilitySovereigntyCapabilityOutput>> =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: GOVERNANCE_REF,
      input,
      ...(options.subject === undefined ? {} : { subject: options.subject }),
      ...(options.correlationId === undefined ? {} : { correlationId: options.correlationId }),
    }),
    governance,
  );

const bundleFor = (subject: SovereignSubjectRef): SovereigntyPortabilityBundleV1 => {
  const id = subject.sovereignAssetId;
  const origin = buildOriginClaim({
    id: 'claim:origin:1',
    sovereignAssetId: id,
    issuer: ISSUER,
    assertedOrigin: 'sm10-origin',
    assertedAt: AT,
  });
  const derivation = buildDerivationClaim({
    id: 'claim:derivation:1',
    sovereignAssetId: id,
    issuer: ISSUER,
    sourceSovereignAssetIds: [newId()],
    relation: 'DerivedFrom',
    issuedAt: AT,
  });
  const standings: readonly CanonicalStanding[] = [
    { id: 'standing:1', claimRef: origin.id, status: StandingStatus.Contested, effectiveAt: AT },
  ];
  return buildSovereigntyPortabilityBundleV1({
    subject,
    manifests: [
      {
        kind: 'manifest',
        manifest: buildSovereignManifestV1({
          sovereignAssetId: id,
          registrant: REGISTRANT,
          contentIdentity: computeContentIdentity(new TextEncoder().encode('sm10 bytes')),
        }),
      },
    ],
    claims: [
      { kind: 'claim', claim: origin },
      { kind: 'claim', claim: derivation },
    ],
    standings,
  });
};

const rule = (
  id: string,
  effect: SovereignLicenseTermsRuleEffect,
  termRef: string,
  statement: string,
): SovereignLicenseTermsRuleV1 => ({
  id,
  effect,
  action: { namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef },
  statement,
});

/** A structurally valid declaration that permits and restricts the *same* action. */
const contradictoryLicenseClaim = (id: SovereignAssetId): LicenseTermsClaim =>
  buildLicenseTermsClaim({
    id: 'claim:license:1',
    sovereignAssetId: id,
    issuer: ISSUER,
    statement: 'Terms declared by the issuer over this subject.',
    audience: { kind: 'Public' },
    rules: [
      rule(
        'R1',
        SovereignLicenseTermsRuleEffect.Permission,
        AOC_LICENSING_ACTION_TERM_IDS.commercialUse,
        'Commercial use is permitted.',
      ),
      rule(
        'R2',
        SovereignLicenseTermsRuleEffect.Restriction,
        AOC_LICENSING_ACTION_TERM_IDS.commercialUse,
        'Commercial use is restricted.',
      ),
    ],
    issuedAt: AT,
  });

const succeeded = (
  result: SovereigntyCapabilityResult<GovernanceCompatibilitySovereigntyCapabilityOutput>,
): GovernanceCompatibilitySovereigntyCapabilityOutput => {
  if (result.status !== 'succeeded') {
    throw new Error(`expected success, got: ${JSON.stringify(result.reasonCodes)}`);
  }
  return result.output;
};

describe('SM-10 / the production capsule advertises the canonical capability (CAPSULE TESTS 1-5)', () => {
  it('CAPSULE TEST 1 — advertises the canonical AOC.GOVERNANCE_COMPATIBILITY id', () => {
    expect(governance.capability.id).toBe(SOVEREIGNTY_CAPABILITY_IDS.governance_compatibility);
    expect(governance.capability.id).toBe('aoc:sovereignty-capability:governance-compatibility');
  });

  it('CAPSULE TEST 2 — takes its version from the SM-01 registry, never a literal', () => {
    expect(governance.capability.version).toBe(GOVERNANCE_REF.version);
    expect(governance.capability).toEqual(GOVERNANCE_REF);
    expect(governance.capability.version).toBe('1.0.0');
  });

  it('CAPSULE TESTS 3-4 — exactly two operations, and no governance act among them', () => {
    expect([...GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS]).toEqual([
      'prepare-governance-handoff',
      'validate-governance-handoff',
    ]);
    for (const forbidden of ['evaluate', 'authorize', 'decide', 'approve', 'grant', 'enforce', 'revoke']) {
      expect(
        GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS.some((operation) =>
          operation.includes(forbidden),
        ),
      ).toBe(false);
    }
  });

  it('CAPSULE TEST 5 — an unknown or missing operation fails with a stable reason', async () => {
    for (const input of [
      { operation: 'evaluate-policy' },
      { operation: 'grant-access' },
      { operation: '' },
      {},
      'prepare-governance-handoff',
      null,
    ]) {
      const result = await run(input as never);
      expect(result.status).toBe('failed');
    }
    expect(validateGovernanceCompatibilitySovereigntyCapabilityInput({ operation: 'decide' })).toEqual({
      valid: false,
      reasons: [CODES.unsupportedOperation],
    });
    expect(validateGovernanceCompatibilitySovereigntyCapabilityInput(null)).toEqual({
      valid: false,
      reasons: [CODES.invalidInput],
    });
    expect(
      isValidGovernanceCompatibilitySovereigntyCapabilityInput({
        operation: 'prepare-governance-handoff',
        representation: bundleFor(subjectFor(newId())),
      }),
    ).toBe(true);
  });
});

describe('SM-10 / prepare-governance-handoff and the subject (CAPSULE TESTS 6-10)', () => {
  it('CAPSULE TESTS 6-7 — a subjectless prepare succeeds, and the result subject comes from the representation', async () => {
    const subject = subjectFor(newId(), { namespace: 'land-registry', id: 'ES-28-0114-77' });
    const result = await run({
      operation: 'prepare-governance-handoff',
      representation: bundleFor(subject),
    });

    expect(result.status).toBe('succeeded');
    expect(result.subject).toEqual(subject);
    const output = succeeded(result) as PrepareGovernanceHandoffOutput;
    expect(output.operation).toBe('prepare-governance-handoff');
    expect(output.handoff.subject).toEqual(subject);
    expect(output.handoff.resource.id).toBe(subject.sovereignAssetId);
  });

  it('CAPSULE TEST 8 — the SM-03 evidence subject derives from the representation too', async () => {
    const subject = subjectFor(newId());
    const result = await run({
      operation: 'prepare-governance-handoff',
      representation: bundleFor(subject),
    });
    expect(result.evidence.subject).toEqual(subject);
    expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
  });

  it('CAPSULE TEST 9 — an explicitly supplied matching subject succeeds', async () => {
    const subject = subjectFor(newId(), { namespace: 'ethereum', id: '0xabc/17' });
    const result = await run(
      { operation: 'prepare-governance-handoff', representation: bundleFor(subject) },
      { subject },
    );
    expect(result.status).toBe('succeeded');
    expect(result.subject).toEqual(subject);
  });

  it('CAPSULE TEST 10 — an explicitly supplied mismatching subject fails, and no handoff is produced', async () => {
    const subject = subjectFor(newId());
    const other = subjectFor(newId());
    const result = await run(
      { operation: 'prepare-governance-handoff', representation: bundleFor(subject) },
      { subject: other },
    );
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') throw new Error('unreachable');
    expect(result.reasonCodes).toEqual([CODES.subjectMismatch]);
    expect(canonicalizeJSON(result)).not.toContain('aoc-sovereign-governance-handoff/1');
  });

  it('a same-id subject under a different external reference is a mismatch, not a reconciliation', async () => {
    const id = newId();
    const result = await run(
      {
        operation: 'prepare-governance-handoff',
        representation: bundleFor(subjectFor(id, { namespace: 'p1', id: 'o-1', locator: 'p1://old/1' })),
      },
      { subject: subjectFor(id, { namespace: 'p1', id: 'o-1', locator: 'p1://new/1' }) },
    );
    expect(result.status).toBe('failed');
  });
});

describe('SM-10 / what prepare refuses, and what it deliberately does not (CAPSULE TESTS 11-14)', () => {
  it('CAPSULE TEST 11 — a malformed representation fails, with no partial handoff', async () => {
    for (const representation of [{}, { schemaVersion: 'aoc-sovereignty-portability-bundle/2' }, []]) {
      const result = await run({
        operation: 'prepare-governance-handoff',
        representation: representation as never,
      });
      expect(result.status).toBe('failed');
      if (result.status !== 'failed') throw new Error('unreachable');
      expect(result.reasonCodes.every((code) => code.startsWith('GOVERNANCE_COMPATIBILITY_'))).toBe(true);
      // A stable code, never a stack trace or an exception message.
      expect(canonicalizeJSON(result.reasonCodes)).not.toMatch(/at |Error:/);
    }
  });

  it('CAPSULE TEST 12 — a representation with a tampered cryptographic proof still prepares', async () => {
    const id = newId();
    const subject = subjectFor(id);
    const origin = buildOriginClaim({
      id: 'claim:origin:1',
      sovereignAssetId: id,
      issuer: ISSUER,
      assertedOrigin: 'sm10-origin',
      assertedAt: AT,
    });
    const signed = signClaim(
      origin as unknown as VerifiableSovereignClaim,
      KEY_PAIR.privateKeyPem,
      KEY_PAIR.signingKey,
      SIGNED_AT,
    ) as unknown as SignedClaim<typeof origin>;
    // Structurally intact, cryptographically worthless: one leading base64
    // character is replaced by a deterministically different one, so the proof
    // stays representable and the tamper can never accidentally be a no-op.
    const tampered: PortableSovereignClaimArtifact = {
      kind: 'signed-claim',
      signedClaim: {
        ...signed,
        proof: { ...signed.proof, signature: tamperSignature(signed.proof.signature) },
      },
    };

    const result = await run({
      operation: 'prepare-governance-handoff',
      representation: buildSovereigntyPortabilityBundleV1({ subject, claims: [tampered] }),
    });

    expect(result.status).toBe('succeeded');
    const output = succeeded(result) as PrepareGovernanceHandoffOutput;
    expect(output.handoff.semantics.present.claimArtifactKinds).toEqual(['signed-claim']);
    // The proof travelled through byte-exact; nothing repaired it and nothing
    // checked it.
    expect(output.handoff.representation.claims[0]).toEqual(tampered);
  });

  it('CAPSULE TEST 13 — a Contested representation prepares, with no warning verdict', async () => {
    const subject = subjectFor(newId());
    const result = await run({
      operation: 'prepare-governance-handoff',
      representation: bundleFor(subject),
    });
    expect(result.status).toBe('succeeded');
    const output = succeeded(result) as PrepareGovernanceHandoffOutput;
    expect(output.handoff.representation.standings[0].status).toBe(StandingStatus.Contested);
    expect(Object.keys(output)).toEqual(['operation', 'handoff']);
  });

  it('CAPSULE TEST 14 — contradictory declared terms prepare, with no winner', async () => {
    const id = newId();
    const subject = subjectFor(id);
    const claim = contradictoryLicenseClaim(id);
    const result = await run({
      operation: 'prepare-governance-handoff',
      representation: buildSovereigntyPortabilityBundleV1({
        subject,
        claims: [{ kind: 'claim', claim }],
      }),
    });

    expect(result.status).toBe('succeeded');
    const output = succeeded(result) as PrepareGovernanceHandoffOutput;
    const carried = output.handoff.representation.claims[0];
    const terms = (carried as unknown as { readonly claim: LicenseTermsClaim }).claim.metadata.terms;
    expect(terms.rules.map((entry) => entry.effect)).toEqual(['Permission', 'Restriction']);
    expect(terms.rules.map((entry) => entry.action.termRef)).toEqual([
      AOC_LICENSING_ACTION_TERM_IDS.commercialUse,
      AOC_LICENSING_ACTION_TERM_IDS.commercialUse,
    ]);

    const serialized = canonicalizeJSON(output);
    for (const forbidden of ['"allow"', '"deny"', 'winner', 'precedence', 'resolvedTerms', 'decision']) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});

describe('SM-10 / validate-governance-handoff (CAPSULE TEST 15)', () => {
  it('CAPSULE TEST 15 — an invalid validation target is a successful execution with a negative report', async () => {
    for (const handoff of [{}, null, 'not a handoff', { schemaVersion: 'aoc-sovereign-governance-handoff/2' }]) {
      const result = await run({ operation: 'validate-governance-handoff', handoff });
      expect(result.status).toBe('succeeded');
      expect(result.evidence.outcome).toBe('succeeded');
      const output = succeeded(result) as ValidateGovernanceHandoffOutput;
      expect(output.validation.valid).toBe(false);
      expect(output.validation.reasons.length).toBeGreaterThan(0);
      // No subject is fabricated from a document that just failed validation.
      expect(result.subject).toBeUndefined();
    }
  });

  it('a valid handoff validates, and the reported result carries no policy verdict', async () => {
    const subject = subjectFor(newId());
    const handoff = buildSovereignGovernanceHandoffV1({ representation: bundleFor(subject) });
    const result = await run({ operation: 'validate-governance-handoff', handoff });

    expect(result.status).toBe('succeeded');
    const output = succeeded(result) as ValidateGovernanceHandoffOutput;
    expect(output.validation).toEqual({ valid: true, reasons: [] });
    expect(Object.keys(output)).toEqual(['operation', 'validation']);
    expect(Object.keys(output.validation).sort()).toEqual(['reasons', 'valid']);
    expect(result.subject).toEqual(subject);
  });

  it('an explicit subject matching a valid handoff succeeds, and a mismatching one fails as attribution', async () => {
    const subject = subjectFor(newId());
    const handoff = buildSovereignGovernanceHandoffV1({ representation: bundleFor(subject) });

    const matching = await run({ operation: 'validate-governance-handoff', handoff }, { subject });
    expect(matching.status).toBe('succeeded');

    const mismatching = await run(
      { operation: 'validate-governance-handoff', handoff },
      { subject: subjectFor(newId()) },
    );
    expect(mismatching.status).toBe('failed');
    if (mismatching.status !== 'failed') throw new Error('unreachable');
    expect(mismatching.reasonCodes).toEqual([CODES.subjectMismatch]);
  });

  it('a malformed candidate keeps only the explicit invocation subject, and infers none', async () => {
    const subject = subjectFor(newId());
    const withSubject = await run({ operation: 'validate-governance-handoff', handoff: {} }, { subject });
    expect(withSubject.status).toBe('succeeded');
    expect(withSubject.subject).toEqual(subject);
    expect(withSubject.evidence.subject).toEqual(subject);

    const withoutSubject = await run({ operation: 'validate-governance-handoff', handoff: {} });
    expect(withoutSubject.subject).toBeUndefined();
    expect(withoutSubject.evidence.subject).toBeUndefined();
  });

  it('detects a tampered resource, descriptor or subject on a candidate that arrived from outside', async () => {
    const subject = subjectFor(newId());
    const handoff = buildSovereignGovernanceHandoffV1({ representation: bundleFor(subject) });
    const wire = JSON.parse(JSON.stringify(handoff)) as SovereignGovernanceHandoffV1;

    const cases: readonly [string, unknown, string][] = [
      [
        'resource id',
        { ...wire, resource: { ...wire.resource, id: newId() } },
        SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES.resourceIdMismatch,
      ],
      [
        'resource kind',
        { ...wire, resource: { ...wire.resource, kind: 'real-estate' } },
        SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES.resourceKindMismatch,
      ],
      [
        'resource attributes',
        { ...wire, resource: { ...wire.resource, attributes: { jurisdiction: 'ES' } } },
        SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES.resourceAttributesNotSupported,
      ],
      [
        'semantics',
        {
          ...wire,
          semantics: buildSovereigntyInteroperabilityDescriptorV1(
            buildSovereigntyPortabilityBundleV1({ subject }),
          ),
        },
        SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES.semanticsMismatch,
      ],
      [
        'top-level subject',
        { ...wire, subject: subjectFor(newId()) },
        SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES.subjectMismatch,
      ],
    ];

    for (const [label, handoffCandidate, expectedCode] of cases) {
      const result = await run({ operation: 'validate-governance-handoff', handoff: handoffCandidate });
      expect({ label, status: result.status }).toEqual({ label, status: 'succeeded' });
      const output = succeeded(result) as ValidateGovernanceHandoffOutput;
      expect({ label, valid: output.validation.valid }).toEqual({ label, valid: false });
      expect(output.validation.reasons).toContain(expectedCode);
    }
  });
});

describe('SM-10 / the common SM-03 evidence spine (CAPSULE TEST 16)', () => {
  it('CAPSULE TEST 16 — evidence carries the generic key set and no handoff payload', async () => {
    const subject = subjectFor(newId());
    const result = await run(
      {
        operation: 'prepare-governance-handoff',
        representation: bundleFor(subject),
        tenantId: 'tenant-alpha',
      },
      { correlationId: 'sm10-external-consumer-001' },
    );

    expect(result.status).toBe('succeeded');
    expect(Object.keys(result.evidence).sort()).toEqual([
      'capability',
      'completedAt',
      'correlationId',
      'invocationId',
      'outcome',
      'requestedAt',
      'schemaVersion',
      'subject',
    ]);
    expect(result.evidence.capability).toEqual(GOVERNANCE_REF);
    expect(result.evidence.outcome).toBe('succeeded');

    const serialized = canonicalizeJSON(result.evidence);
    for (const forbidden of [
      'handoff',
      'resource',
      'representation',
      'semantics',
      'policy',
      'authority',
      'decision',
      'grant',
      'terms',
      'claims',
      'standings',
      'tenant-alpha',
      // The governance resource projection itself: no `kind`/`id` pair, and no
      // handoff schema version, ever reaches the common evidence record. The
      // subject's own `SovereignAssetId` shares the `aoc:sovereign-asset`
      // prefix by design, so the resource is excluded by its key, not by that
      // string.
      '"kind"',
      'aoc-sovereign-governance-handoff/1',
    ]) {
      expect({ forbidden, present: serialized.includes(forbidden) }).toEqual({ forbidden, present: false });
    }
  });

  it('a negative validation still records a succeeded outcome, matching every other mineral', async () => {
    const result = await run({ operation: 'validate-governance-handoff', handoff: {} });
    expect(result.evidence.outcome).toBe('succeeded');
    expect(result.evidence.reasonCodes).toBeUndefined();
  });

  it('a failed prepare records failed evidence carrying only stable reason codes', async () => {
    const result = await run({ operation: 'prepare-governance-handoff', representation: {} as never });
    expect(result.status).toBe('failed');
    expect(result.evidence.outcome).toBe('failed');
    expect(result.evidence.reasonCodes).toEqual([
      SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES.invalidRepresentation,
    ]);
  });

  it('the capsule reads no clock of its own — two prepares of one representation are byte-identical', async () => {
    const representation = bundleFor(subjectFor(newId()));
    const first = succeeded(
      await run({ operation: 'prepare-governance-handoff', representation }),
    ) as PrepareGovernanceHandoffOutput;
    const second = succeeded(
      await run({ operation: 'prepare-governance-handoff', representation }),
    ) as PrepareGovernanceHandoffOutput;
    expect(canonicalizeJSON(second.handoff)).toBe(canonicalizeJSON(first.handoff));
  });

  it('distinct invocations get distinct invocation ids under one correlation id', async () => {
    const representation = bundleFor(subjectFor(newId()));
    const correlationId = 'sm10-correlated';
    const a = await run({ operation: 'prepare-governance-handoff', representation }, { correlationId });
    const b = await run({ operation: 'prepare-governance-handoff', representation }, { correlationId });
    expect(a.invocationId).not.toBe(b.invocationId);
    expect(a.correlationId).toBe(correlationId);
    expect(b.correlationId).toBe(correlationId);
  });
});
