import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { ClaimType, StandingStatus } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  mintSovereignAssetId,
  parseSovereignAssetId,
} from '@aoc/protocol/identity';
import type { SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import { AuthorityClaimKind, buildAuthorityClaim } from '@aoc/protocol/manifest';
import {
  AOC_LICENSING_ACTION_TERM_IDS,
  AOC_LICENSING_DECLARATION_TERM_IDS,
  AOC_LICENSING_SEMANTIC_NAMESPACE,
  LICENSING_TERMS_REASON_CODES,
  SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
  SovereignLicenseTermsRuleEffect,
  buildLicenseTermsClaim,
} from '@aoc/protocol/licensing';
import type { LicenseTermsClaim, SovereignLicenseTermsRuleV1 } from '@aoc/protocol/licensing';
import {
  LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  SOVEREIGNTY_CAPABILITY_IDS,
  buildSovereigntyCapabilityInvocation,
  createLicensingTermsSovereigntyCapabilityImplementation,
  getSovereigntyCapability,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isValidLicensingTermsSovereigntyCapabilityInput,
  isValidSovereigntyCapabilityInvocationEvidence,
  validateLicensingTermsSovereigntyCapabilityInput,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  LicensingTermsSovereigntyCapabilityInput,
  LicensingTermsSovereigntyCapabilityOutput,
  SovereigntyCapabilityRef,
  SovereigntyCapabilityResult,
  SovereigntyCapabilitySuccessResult,
} from '@aoc/protocol/sovereignty-capabilities';

const LICENSING_REF = getSovereigntyCapabilityRefByKey('licensing_terms') as SovereigntyCapabilityRef;

const CODES = LICENSING_TERMS_REASON_CODES;
const ACTIONS = AOC_LICENSING_ACTION_TERM_IDS;
const ISSUER = 'principal:sm09-issuer';

const licensing = (clock?: () => Date) =>
  createLicensingTermsSovereigntyCapabilityImplementation(clock === undefined ? {} : { clock });

const fixedClock = (iso: string) => () => new Date(iso);

const subjectRef = (sovereignAssetId: SovereignAssetId = parseSovereignAssetId(mintSovereignAssetId())): SovereignSubjectRef => ({
  sovereignAssetId,
});

const rule = (
  id: string,
  effect: SovereignLicenseTermsRuleEffect,
  termRef: string,
  statement = `clause ${id}`,
  namespace = AOC_LICENSING_SEMANTIC_NAMESPACE,
): SovereignLicenseTermsRuleV1 => ({ id, effect, action: { namespace, termRef }, statement });

const RULES: readonly SovereignLicenseTermsRuleV1[] = [
  rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use, 'Use is permitted.'),
  rule('R2', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.reproduce, 'Reproduction is permitted.'),
  rule('R3', SovereignLicenseTermsRuleEffect.Restriction, ACTIONS.commercialUse, 'Commercial use is restricted.'),
  rule('R4', SovereignLicenseTermsRuleEffect.Obligation, ACTIONS.attribute, 'Attribution must be retained.'),
];

const declareInput = (overrides: Record<string, unknown> = {}) => ({
  operation: 'declare-license-terms' as const,
  claimId: 'claim:license:001',
  issuer: ISSUER,
  statement: 'Terms declared by the issuer over this subject.',
  audience: { kind: 'Public' as const },
  rules: RULES,
  ...overrides,
});

const invokeLicensing = async (
  input: unknown,
  extras: { subject?: SovereignSubjectRef; correlationId?: string } = { subject: subjectRef() },
  implementation = licensing(fixedClock('2026-08-18T09:00:00.000Z')),
): Promise<SovereigntyCapabilityResult<LicensingTermsSovereigntyCapabilityOutput>> =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability: LICENSING_REF,
      input: input as LicensingTermsSovereigntyCapabilityInput,
      ...(extras.subject === undefined ? {} : { subject: extras.subject }),
      ...(extras.correlationId === undefined ? {} : { correlationId: extras.correlationId }),
    }),
    implementation,
  );

const succeed = (
  result: SovereigntyCapabilityResult<LicensingTermsSovereigntyCapabilityOutput>,
): SovereigntyCapabilitySuccessResult<LicensingTermsSovereigntyCapabilityOutput> => {
  if (result.status !== 'succeeded') {
    throw new Error(`expected success, got failure: ${result.reasonCodes.join(', ')}`);
  }
  return result;
};

const failureCodes = (
  result: SovereigntyCapabilityResult<LicensingTermsSovereigntyCapabilityOutput>,
): readonly string[] => {
  if (result.status !== 'failed') throw new Error('expected a failed outcome');
  return result.reasonCodes;
};

const declaredClaim = (
  result: SovereigntyCapabilityResult<LicensingTermsSovereigntyCapabilityOutput>,
): LicenseTermsClaim => {
  const output = succeed(result).output;
  if (output.operation !== 'declare-license-terms') throw new Error('expected a declaration');
  return output.claim;
};

describe('SM-09 / AOC.LICENSING_TERMS capsule identity', () => {
  it('advertises the canonical SM-01 capability ref, resolved from the registry', () => {
    expect(licensing().capability).toEqual(LICENSING_REF);
    expect(licensing().capability.id).toBe(SOVEREIGNTY_CAPABILITY_IDS.licensing_terms);
    expect(licensing().capability.id).toBe('aoc:sovereignty-capability:licensing-terms');
    expect(licensing().capability.version).toBe('1.0.0');
    expect(getSovereigntyCapability(licensing().capability.id)?.name).toBe('Licensing & Terms');
  });

  it('supports exactly three operations, and no evaluation or enforcement operation', () => {
    expect([...LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS]).toEqual([
      'declare-license-terms',
      'validate-license-terms',
      'contest-license-terms-claim',
    ]);
    for (const forbidden of [
      'evaluate-license', 'is-action-permitted', 'is-action-restricted', 'authorize-use',
      'check-obligation', 'supersede-license-terms', 'resolve-current-terms', 'sign-license-terms',
    ]) {
      expect(LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS as readonly string[]).not.toContain(forbidden);
    }
  });

  it('the factory is import-time pure and the implementation is frozen', () => {
    const implementation = licensing();
    expect(Object.isFrozen(implementation)).toBe(true);
    expect(implementation.capability).toEqual(licensing().capability);
  });

  it('an unknown operation is reported rather than guessed at', async () => {
    expect(failureCodes(await invokeLicensing({ operation: 'evaluate-license' })))
      .toEqual([CODES.unsupportedOperation]);
    expect(failureCodes(await invokeLicensing({ operation: 'isAllowed' }))).toEqual([CODES.unsupportedOperation]);
    expect(failureCodes(await invokeLicensing('declare-license-terms'))).toEqual([CODES.invalidInput]);
  });
});

describe('SM-09 / declare-license-terms (REQUIRED TESTS)', () => {
  it('requires an existing sovereign subject and never mints one', async () => {
    expect(failureCodes(await invokeLicensing(declareInput(), {}))).toEqual([CODES.subjectRequired]);
  });

  it('takes the claim subject from the invocation, and accepts no second asset id', async () => {
    const subject = subjectRef();
    const claim = declaredClaim(await invokeLicensing(declareInput(), { subject }));
    expect(claim.subject).toBe(subject.sovereignAssetId);
    // There is no `sovereignAssetId` field to conflict with the invocation.
    const other = parseSovereignAssetId(mintSovereignAssetId());
    const claim2 = declaredClaim(
      await invokeLicensing(declareInput({ sovereignAssetId: other } as Record<string, unknown>), { subject }),
    );
    expect(claim2.subject).toBe(subject.sovereignAssetId);
  });

  it('preserves the full invocation subject on the result and its evidence', async () => {
    const subject: SovereignSubjectRef = {
      sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()),
      externalReference: buildSovereignExternalReference({
        namespace: 'example.registry',
        id: 'parcel-77',
        locator: 'https://registry.example/parcel-77',
      }),
    };
    const result = succeed(await invokeLicensing(declareInput(), { subject }));
    expect(result.subject).toEqual(subject);
    expect(result.evidence.subject).toEqual(subject);
  });

  it('produces the expected canonical claim shape', async () => {
    const subject = subjectRef();
    const claim = declaredClaim(await invokeLicensing(declareInput({ issuedAt: '2026-08-18T00:00:00.000Z' }), { subject }));
    expect(claim).toEqual({
      id: 'claim:license:001',
      type: ClaimType.Authorship,
      subject: subject.sovereignAssetId,
      issuer: ISSUER,
      assertionRef: 'claim:license:001:assertion',
      evidenceRefs: [],
      attestationRefs: [],
      semanticRefs: expect.any(Array),
      issuedAt: '2026-08-18T00:00:00.000Z',
      metadata: {
        kind: AuthorityClaimKind.License,
        statement: 'Terms declared by the issuer over this subject.',
        terms: {
          schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
          audience: { kind: 'Public' },
          rules: RULES,
        },
      },
    });
  });

  it('emits no signature, standing, grant, credential or decision', async () => {
    const output = succeed(await invokeLicensing(declareInput())).output;
    expect(Object.keys(output).sort()).toEqual(['claim', 'operation']);
    const serialized = canonicalizeJSON(output).toLowerCase();
    for (const forbidden of [
      'signature', 'proof', 'digest', 'standing', 'grant', 'token', 'credential',
      'authorization', 'decision', 'allow', 'deny', 'approved', 'privatekey',
    ]) {
      expect(serialized).not.toContain(`"${forbidden}"`);
    }
  });

  it.each([
    ['Public', { kind: 'Public' }],
    ['Principal (string)', { kind: 'Principal', principal: 'principal:acme' }],
    ['Principal (ref)', { kind: 'Principal', principal: { id: 'principal:acme', kind: 'Organization' } }],
    ['Custom', { kind: 'Custom', namespace: 'example:membership', id: 'premium-members' }],
  ])('accepts a %s audience', async (_label, audience) => {
    const claim = declaredClaim(await invokeLicensing(declareInput({ audience })));
    expect(claim.metadata.terms.audience).toEqual(audience);
  });

  it('a malformed declare request is an execution failure with no partial claim', async () => {
    expect(failureCodes(await invokeLicensing(declareInput({ rules: undefined }))))
      .toEqual([CODES.rulesRequired]);
    expect(failureCodes(await invokeLicensing(declareInput({ rules: [] })))).toEqual([CODES.rulesRequired]);
    expect(failureCodes(await invokeLicensing(declareInput({ issuer: '' })))).toEqual([CODES.invalidIssuer]);
    expect(failureCodes(await invokeLicensing(declareInput({ claimId: '   ' })))).toEqual([CODES.invalidClaimId]);
    expect(failureCodes(await invokeLicensing(declareInput({ statement: '' })))).toEqual([CODES.invalidStatement]);
    expect(failureCodes(await invokeLicensing(declareInput({ audience: { kind: 'Everyone' } }))))
      .toEqual([CODES.invalidAudience]);
    expect(failureCodes(await invokeLicensing(declareInput({ evidenceRefs: [''] }))))
      .toEqual([CODES.invalidEvidenceRefs]);
    expect(failureCodes(await invokeLicensing(declareInput({ evidenceRefs: new Array(1) }))))
      .toEqual([CODES.invalidEvidenceRefs]);
  });

  it('an invalid rule fails the declaration', async () => {
    expect(failureCodes(await invokeLicensing(declareInput({
      rules: [{ id: 'R1', effect: 'Allow', action: { namespace: 'x', termRef: 'x:y' }, statement: 's' }],
    })))).toEqual([CODES.invalidRuleEffect]);
    expect(failureCodes(await invokeLicensing(declareInput({
      rules: [rule('R1', SovereignLicenseTermsRuleEffect.Permission, 'aoc.licensing:teleport')],
    })))).toEqual([CODES.unknownAocAction]);
    expect(failureCodes(await invokeLicensing(declareInput({
      rules: [
        rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use),
        rule('R1', SovereignLicenseTermsRuleEffect.Restriction, ACTIONS.use),
      ],
    })))).toEqual([CODES.duplicateRuleId]);
  });

  it('accumulates every reason rather than reporting only the first', async () => {
    const codes = failureCodes(await invokeLicensing(declareInput({ claimId: '', issuer: '', statement: '' })));
    expect(codes).toEqual([CODES.invalidClaimId, CODES.invalidIssuer, CODES.invalidStatement]);
  });

  it('supplied issuedAt is preserved; omitted issuedAt comes from the injected clock', async () => {
    const supplied = declaredClaim(
      await invokeLicensing(declareInput({ issuedAt: '2019-04-01T12:30:00.000Z' })),
    );
    expect(supplied.issuedAt).toBe('2019-04-01T12:30:00.000Z');

    const fallback = declaredClaim(
      await invokeLicensing(declareInput(), { subject: subjectRef() }, licensing(fixedClock('2026-08-18T09:00:00.000Z'))),
    );
    expect(fallback.issuedAt).toBe('2026-08-18T09:00:00.000Z');
  });

  it('effectiveAt is never defaulted, and never compared to the clock', async () => {
    const withoutEffective = declaredClaim(await invokeLicensing(declareInput()));
    expect(Object.prototype.hasOwnProperty.call(withoutEffective.metadata.terms, 'effectiveAt')).toBe(false);

    const future = declaredClaim(await invokeLicensing(declareInput({ effectiveAt: '2099-01-01T00:00:00.000Z' })));
    expect(future.metadata.terms.effectiveAt).toBe('2099-01-01T00:00:00.000Z');
    // No `isActive`, `isCurrentlyEffective` or derived state appears anywhere.
    const serialized = canonicalizeJSON(future).toLowerCase();
    for (const forbidden of ['isactive', 'currentlyeffective', 'isexpired', 'notyeteffective', 'status']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('an expired declaration is produced and stays valid data', async () => {
    const claim = declaredClaim(await invokeLicensing(declareInput({
      issuedAt: '2001-01-01T00:00:00.000Z',
      expiresAt: '2002-01-01T00:00:00.000Z',
    })));
    expect(claim.expiresAt).toBe('2002-01-01T00:00:00.000Z');
    expect(Object.prototype.hasOwnProperty.call(claim.metadata.terms, 'expiresAt')).toBe(false);
  });

  it('no standing is created by a declaration', async () => {
    const result = succeed(await invokeLicensing(declareInput({ expiresAt: '2002-01-01T00:00:00.000Z' })));
    expect(canonicalizeJSON(result.output)).not.toContain('Expired');
    expect(canonicalizeJSON(result.output)).not.toContain('Active');
    expect(canonicalizeJSON(result.output)).not.toContain('standing');
  });

  it('is deterministic: same subject, input and clock produce the same claim', async () => {
    const subject = subjectRef();
    const a = declaredClaim(await invokeLicensing(declareInput(), { subject }));
    const b = declaredClaim(await invokeLicensing(declareInput(), { subject }));
    expect(canonicalizeJSON(a)).toBe(canonicalizeJSON(b));
  });

  it('creates exactly one claim — no origin, authorship or derivation claim appears', async () => {
    const output = succeed(await invokeLicensing(declareInput())).output;
    const serialized = canonicalizeJSON(output);
    expect(serialized).not.toContain(ClaimType.Origin);
    expect(serialized).not.toContain(ClaimType.Derivation);
    expect(serialized).not.toContain('assertedOrigin');
    expect(serialized).not.toContain('sourceSovereignAssetIds');
  });

  it('the manifest registrant is never consulted as the licensing issuer', async () => {
    // The issuer is always the caller's, even when a subject came from a
    // manifest registered by somebody else. There is no registrant field in the
    // input at all.
    const claim = declaredClaim(await invokeLicensing(declareInput({ issuer: 'principal:licensor' })));
    expect(claim.issuer).toBe('principal:licensor');
    expect(canonicalizeJSON(claim)).not.toContain('registrant');
  });
});

describe('SM-09 / validate-license-terms (REQUIRED TESTS)', () => {
  const subject = subjectRef();
  const validClaim = buildLicenseTermsClaim({
    id: 'claim:license:valid',
    sovereignAssetId: subject.sovereignAssetId,
    issuer: ISSUER,
    statement: 'Terms.',
    audience: { kind: 'Public' },
    rules: RULES,
    issuedAt: '2026-08-18T00:00:00.000Z',
  });

  const validation = (result: SovereigntyCapabilityResult<LicensingTermsSovereigntyCapabilityOutput>) => {
    const output = succeed(result).output;
    if (output.operation !== 'validate-license-terms') throw new Error('expected a validation');
    return output.validation;
  };

  it('reports a valid claim as valid', async () => {
    const result = await invokeLicensing({ operation: 'validate-license-terms', claim: validClaim }, { subject });
    expect(validation(result)).toEqual({ valid: true, reasons: [] });
  });

  it('an invalid validation target is a SUCCESSFUL execution reporting an invalid document', async () => {
    const result = await invokeLicensing({ operation: 'validate-license-terms', claim: {} }, {});
    expect(result.status).toBe('succeeded');
    expect(validation(result).valid).toBe(false);
    expect(result.evidence.outcome).toBe('succeeded');
  });

  it.each([
    ['a generic Authorship claim', buildAuthorityClaim({
      id: 'claim:authorship', sovereignAssetId: subject.sovereignAssetId, issuer: ISSUER,
      kind: AuthorityClaimKind.Authorship, statement: 'I wrote it.', issuedAt: '2026-08-18T00:00:00.000Z',
    })],
    ['a Rights AuthorityClaim', buildAuthorityClaim({
      id: 'claim:rights', sovereignAssetId: subject.sovereignAssetId, issuer: ISSUER,
      kind: AuthorityClaimKind.Rights, statement: 'I hold rights.', issuedAt: '2026-08-18T00:00:00.000Z',
    })],
    ['a free-text License AuthorityClaim with no terms', buildAuthorityClaim({
      id: 'claim:license:free', sovereignAssetId: subject.sovereignAssetId, issuer: ISSUER,
      kind: AuthorityClaimKind.License, statement: 'Standard agreement.', issuedAt: '2026-08-18T00:00:00.000Z',
    })],
  ])('%s is reported invalid', async (_label, claim) => {
    const result = await invokeLicensing({ operation: 'validate-license-terms', claim }, { subject });
    expect(validation(result).valid).toBe(false);
  });

  const mutate = (terms: Record<string, unknown>) => ({
    ...validClaim,
    metadata: { ...validClaim.metadata, terms: { ...validClaim.metadata.terms, ...terms } },
  });

  it.each([
    ['an unsupported schema', mutate({ schemaVersion: 'aoc-sovereign-license-terms/2' }), CODES.unsupportedSchema],
    ['empty rules', mutate({ rules: [] }), CODES.rulesRequired],
    ['a bad action', mutate({ rules: [rule('R1', SovereignLicenseTermsRuleEffect.Permission, 'aoc.licensing:nope')] }), CODES.unknownAocAction],
    ['a duplicate rule id', mutate({
      rules: [
        rule('R1', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use),
        rule('R1', SovereignLicenseTermsRuleEffect.Restriction, ACTIONS.use),
      ],
    }), CODES.duplicateRuleId],
    ['an unknown terms field', mutate({ automaticRoyaltyRate: 0.15 }), CODES.invalidInput],
  ])('%s is reported invalid with a stable reason', async (_label, claim, code) => {
    const result = await invokeLicensing({ operation: 'validate-license-terms', claim }, { subject });
    const report = validation(result);
    expect(report.valid).toBe(false);
    expect(report.reasons).toContain(code);
  });

  it('works with no invocation subject at all, and attributes the document\'s own subject', async () => {
    const result = succeed(await invokeLicensing({ operation: 'validate-license-terms', claim: validClaim }, {}));
    expect(result.subject).toEqual({ sovereignAssetId: subject.sovereignAssetId });
    expect(result.evidence.subject).toEqual({ sovereignAssetId: subject.sovereignAssetId });
  });

  it('an invalid candidate never has a subject fabricated for it', async () => {
    const result = succeed(await invokeLicensing({ operation: 'validate-license-terms', claim: {} }, {}));
    expect(result.subject).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(result.evidence, 'subject')).toBe(false);
  });

  it('an explicitly mismatching subject is an execution failure', async () => {
    const other = subjectRef();
    expect(failureCodes(await invokeLicensing(
      { operation: 'validate-license-terms', claim: validClaim },
      { subject: other },
    ))).toEqual([CODES.claimSubjectMismatch]);
  });

  it('a request with no candidate at all cannot be read', async () => {
    expect(failureCodes(await invokeLicensing({ operation: 'validate-license-terms' }, { subject })))
      .toEqual([CODES.invalidInput]);
  });

  it('null, 0 and false are legitimate things to be asked about', async () => {
    for (const candidate of [null, 0, false, '']) {
      const result = await invokeLicensing({ operation: 'validate-license-terms', claim: candidate }, {});
      expect(result.status).toBe('succeeded');
      expect(validation(result).valid).toBe(false);
    }
  });

  it('validation reaches no verdict about permission, ownership or legality', async () => {
    const result = succeed(await invokeLicensing({ operation: 'validate-license-terms', claim: validClaim }, { subject }));
    expect(Object.keys(succeed(result).output).sort()).toEqual(['operation', 'validation']);
    const serialized = canonicalizeJSON(result.output).toLowerCase();
    for (const forbidden of ['allowed', 'denied', 'owner', 'enforceable', 'lawful', 'grant', 'score']) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});

describe('SM-09 / contest-license-terms-claim (REQUIRED TESTS)', () => {
  const subject = subjectRef();
  const claim = buildLicenseTermsClaim({
    id: 'claim:license:contested',
    sovereignAssetId: subject.sovereignAssetId,
    issuer: ISSUER,
    statement: 'Terms.',
    audience: { kind: 'Public' },
    rules: RULES,
    issuedAt: '2026-08-18T00:00:00.000Z',
  });

  const contestInput = (overrides: Record<string, unknown> = {}) => ({
    operation: 'contest-license-terms-claim' as const,
    standingId: 'standing:001',
    claim,
    reason: 'A competing party disputes the declared terms.',
    ...overrides,
  });

  const contested = (result: SovereigntyCapabilityResult<LicensingTermsSovereigntyCapabilityOutput>) => {
    const output = succeed(result).output;
    if (output.operation !== 'contest-license-terms-claim') throw new Error('expected a contestation');
    return output;
  };

  it('records a Contested standing against a caller-owned standing id', async () => {
    const output = contested(await invokeLicensing(contestInput(), { subject }));
    expect(output.standing).toEqual({
      id: 'standing:001',
      claimRef: 'claim:license:contested',
      status: StandingStatus.Contested,
      reason: 'A competing party disputes the declared terms.',
      effectiveAt: '2026-08-18T09:00:00.000Z',
    });
  });

  it('returns the original claim byte-identical and by reference', async () => {
    const output = contested(await invokeLicensing(contestInput(), { subject }));
    expect(output.claim).toBe(claim);
    expect(canonicalizeJSON(output.claim)).toBe(canonicalizeJSON(claim));
  });

  it('requires a subject, a reason and a standing id', async () => {
    expect(failureCodes(await invokeLicensing(contestInput(), {}))).toEqual([CODES.subjectRequired]);
    expect(failureCodes(await invokeLicensing(contestInput({ reason: '' }), { subject })))
      .toEqual([CODES.invalidContestationReason]);
    expect(failureCodes(await invokeLicensing(contestInput({ standingId: '' }), { subject })))
      .toEqual([CODES.invalidStandingId]);
  });

  it('rejects contesting a claim about a different subject', async () => {
    expect(failureCodes(await invokeLicensing(contestInput(), { subject: subjectRef() })))
      .toEqual([CODES.claimSubjectMismatch]);
  });

  it('rejects contesting something that is not a licensing declaration', async () => {
    expect(failureCodes(await invokeLicensing(contestInput({ claim: {} }), { subject })))
      .toEqual([CODES.invalidClaim]);
  });

  it('adjudicates nothing and concludes nothing about ownership or legality', async () => {
    const output = contested(await invokeLicensing(contestInput(), { subject }));
    const serialized = canonicalizeJSON(output).toLowerCase();
    for (const forbidden of ['winner', 'upheld', 'rejected', 'invalidated', 'owner', 'verdict', 'ruling']) {
      expect(serialized).not.toContain(forbidden);
    }
    // The claim is preserved, not revoked or superseded.
    expect(output.standing.status).toBe(StandingStatus.Contested);
    expect(output.standing.status).not.toBe(StandingStatus.Revoked);
    expect(output.standing.status).not.toBe(StandingStatus.Superseded);
  });

  it('a caller-supplied contestation effectiveAt is preserved', async () => {
    const output = contested(await invokeLicensing(
      contestInput({ effectiveAt: '2026-10-01T00:00:00.000Z' }),
      { subject },
    ));
    expect(output.standing.effectiveAt).toBe('2026-10-01T00:00:00.000Z');
  });
});

describe('SM-09 / SM-03 evidence (REQUIRED TESTS)', () => {
  it('evidence is valid, capability-attributed and payload-free', async () => {
    const subject = subjectRef();
    const result = succeed(await invokeLicensing(
      declareInput({
        rules: [rule('R1', SovereignLicenseTermsRuleEffect.Restriction, ACTIONS.commercialUse, 'Confidential clause text.')],
        statement: 'Commercially sensitive statement.',
        audience: { kind: 'Principal', principal: 'principal:confidential-licensee' },
      }),
      { subject, correlationId: 'corr-sm09' },
    ));

    expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
    expect(result.evidence.capability.id).toBe('aoc:sovereignty-capability:licensing-terms');
    expect(result.evidence.correlationId).toBe('corr-sm09');
    expect(Object.keys(result.evidence).sort()).toEqual([
      'capability', 'completedAt', 'correlationId', 'invocationId', 'outcome', 'requestedAt',
      'schemaVersion', 'subject',
    ]);

    // Terms are frequently confidential. The evidence spine stays payload-free:
    // no rule, statement, audience, claim, semantic ref or legal text.
    const serialized = JSON.stringify(result.evidence);
    for (const leak of [
      'Confidential clause text.', 'Commercially sensitive statement.', 'principal:confidential-licensee',
      'Restriction', 'commercial-use', 'aoc.licensing', 'claim:license:001',
      // ...and no structural key from the declaration either. The capability id
      // legitimately contains the word "licensing-terms"; a payload key would
      // appear as a JSON key, which is what is checked.
      '"terms"', '"rules"', '"audience"', '"statement"', '"semanticRefs"', '"claim"', '"metadata"',
    ]) {
      expect(serialized).not.toContain(leak);
    }
    expect(canonicalizeJSON(JSON.parse(serialized))).toBe(canonicalizeJSON(result.evidence));
  });

  it('a negative validation still records a succeeded evidence outcome', async () => {
    const result = await invokeLicensing({ operation: 'validate-license-terms', claim: { nope: true } }, {});
    expect(result.status).toBe('succeeded');
    expect(result.evidence.outcome).toBe('succeeded');
    expect(Object.prototype.hasOwnProperty.call(result.evidence, 'reasonCodes')).toBe(false);
  });

  it('a failed declaration records the failure codes verbatim', async () => {
    const result = await invokeLicensing(declareInput({ rules: [] }));
    if (result.status !== 'failed') throw new Error('expected failure');
    expect(result.evidence.outcome).toBe('failed');
    expect(result.evidence.reasonCodes).toEqual([CODES.rulesRequired]);
  });

  it('two invocations never share an invocation id', async () => {
    const subject = subjectRef();
    const a = await invokeLicensing(declareInput(), { subject });
    const b = await invokeLicensing(declareInput(), { subject });
    expect(a.invocationId).not.toBe(b.invocationId);
  });
});

describe('SM-09 / input validator', () => {
  it('is exported and agrees with the capsule', () => {
    expect(isValidLicensingTermsSovereigntyCapabilityInput(declareInput())).toBe(true);
    expect(isValidLicensingTermsSovereigntyCapabilityInput({ operation: 'nope' })).toBe(false);
    expect(validateLicensingTermsSovereigntyCapabilityInput(null))
      .toEqual({ valid: false, reasons: [CODES.invalidInput] });
  });

  it('never mutates the input it was given', () => {
    const rules = [
      rule('Z', SovereignLicenseTermsRuleEffect.Obligation, ACTIONS.attribute),
      rule('A', SovereignLicenseTermsRuleEffect.Permission, ACTIONS.use),
    ];
    const input = declareInput({ rules });
    validateLicensingTermsSovereigntyCapabilityInput(input);
    expect(rules.map((r) => r.id)).toEqual(['Z', 'A']);
    expect(Object.isFrozen(rules)).toBe(false);
  });
});
