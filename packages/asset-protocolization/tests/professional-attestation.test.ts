import { AttestationType, ProofType } from '@aoc/protocol/claims';

import {
  PROFESSIONAL_REVIEW_ERROR_CODES,
  PROFESSIONAL_REVIEW_EVENT_TYPES,
  PROTOCOLIZATION_CASE_ERROR_CODES,
  PROTOCOLIZATION_CASE_EVENT_TYPES,
  ProfessionalReviewAction,
  ProtocolizationCaseState,
  ProtocolizationMaterialKind,
  ProtocolizationRequirementMaterialStatus,
  createProfessionalReviewRequest,
  prepareCanonicalAttestationFromReview,
  recordProfessionalReviewDecision,
} from '@aoc/asset-protocolization';
import type {
  ProfessionalAttestationInput,
  ProfessionalReviewRequest,
  RecordProfessionalReviewDecisionInput,
} from '@aoc/asset-protocolization';

import { TEST_CLAIM_ID, TEST_SECOND_CLAIM_ID } from './fixtures/test-declarations';
import {
  TEST_ATTESTATION_ID,
  TEST_CALLER_PROOF_REF,
  TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  TEST_PROFESSIONAL_CREDENTIAL,
  TEST_REVIEWER_HUMAN,
  buildReviewableCase,
  createFailingAttestationSigner,
  createReviewContext,
  createTestAttestationSigner,
  createUnusableProofAttestationSigner,
  primaryScope,
  reviewedRefs,
} from './fixtures/test-attestation';
import type { ReviewTestContext, ReviewableCase } from './fixtures/test-attestation';

async function openRequest(
  context: ReviewTestContext,
  requestId = 'review-request-attestation',
): Promise<{ readonly basis: ReviewableCase; readonly request: ProfessionalReviewRequest }> {
  const basis = await buildReviewableCase(context);
  context.clock.advance(60);
  const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
    reviewRequestId: requestId,
    attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
    requestedAttestationType: AttestationType.Human,
    requestedScope: primaryScope(basis.protocolizationCase),
  });
  return { basis, request };
}

function attestWith(
  basis: ReviewableCase,
  attestation: Partial<ProfessionalAttestationInput> = {},
  overrides: Partial<RecordProfessionalReviewDecisionInput> = {},
): RecordProfessionalReviewDecisionInput {
  return {
    decisionId: 'review-decision-attestation',
    reviewer: TEST_REVIEWER_HUMAN,
    reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
    action: ProfessionalReviewAction.Attest,
    scope: primaryScope(basis.protocolizationCase),
    reviewedRefs: reviewedRefs(basis) as never,
    attestation: {
      attestationId: TEST_ATTESTATION_ID,
      claimRef: TEST_CLAIM_ID,
      statement: 'Test-only: the reviewer states what they reviewed, in their own words.',
      materialId: 'material-attestation-0001',
      ...attestation,
    },
    ...overrides,
  } as RecordProfessionalReviewDecisionInput;
}

describe('canonical attestation from professional review', () => {
  it('constructs a structurally legitimate CanonicalAttestation and associates it to the case', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);
    const reviewedRevision = basis.protocolizationCase.revision;

    context.clock.advance(60);
    const transition = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      attestWith(basis),
    );

    const attestation = transition.attestation;
    expect(attestation).toBeDefined();
    // Every mandatory Protocol field, established from something that existed.
    expect(attestation!.id).toBe(TEST_ATTESTATION_ID);
    expect(attestation!.type).toBe(AttestationType.Human);
    expect(attestation!.attester).toEqual(TEST_REVIEWER_HUMAN);
    expect(attestation!.claimRef).toBe(TEST_CLAIM_ID);
    expect(attestation!.statement).toContain('Test-only');
    expect(attestation!.issuedAt).toBe(transition.decision.decidedAt);
    expect(attestation!.credentialRefs).toEqual([TEST_PROFESSIONAL_CREDENTIAL]);

    // The decision references it; it is never the decision's own identity.
    expect(transition.decision.canonicalAttestationRef).toBe(TEST_ATTESTATION_ID);
    expect(transition.decision.canonicalAttestationRef).not.toBe(transition.decision.decisionId);

    // ARCHITECTURE PROOF R — the two revisions are explicit and different.
    expect(transition.decision.reviewBasisRevision).toBe(reviewedRevision);
    expect(transition.decision.resultingCaseRevision).toBe(reviewedRevision + 1);
    expect(transition.protocolizationCase!.revision).toBe(reviewedRevision + 1);

    // APV-04's own material pathway did the association, and its own event
    // comes back unchanged.
    expect(transition.caseEvent!.eventType).toBe(PROTOCOLIZATION_CASE_EVENT_TYPES.materialAdded);
    const material = transition.protocolizationCase!.materials.find(
      (entry) => entry.materialId === 'material-attestation-0001',
    );
    expect(material?.kind).toBe(ProtocolizationMaterialKind.Attestation);
    expect(material?.requirementIds).toEqual([TEST_PRIMARY_ATTESTATION_REQUIREMENT]);

    expect(transition.attestationEvent!.eventType).toBe(
      PROFESSIONAL_REVIEW_EVENT_TYPES.attestationRecorded,
    );
    expect(transition.attestationEvent!.reviewBasisRevision).toBe(reviewedRevision);
    expect(transition.attestationEvent!.resultingCaseRevision).toBe(reviewedRevision + 1);
  });

  // ARCHITECTURE PROOF K / §91 / §92
  it('moves the attestation requirement to MaterialPresent and no further', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    context.clock.advance(60);
    const { protocolizationCase } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      attestWith(basis),
    );

    const state = protocolizationCase!.requirementStates.find(
      (entry) => entry.requirementId === TEST_PRIMARY_ATTESTATION_REQUIREMENT,
    );
    expect(state?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);

    // There is no Satisfied, no Ready, no Approved and no Protocolized to reach.
    expect(Object.values(ProtocolizationRequirementMaterialStatus)).toEqual([
      'Pending',
      'MaterialPresent',
    ]);
    expect(Object.values(ProtocolizationCaseState)).toEqual(['Draft', 'Active', 'Cancelled']);
    expect(protocolizationCase!.state).toBe(ProtocolizationCaseState.Draft);
  });

  it('refuses to attest a claim the case does not hold', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(
        context,
        basis.protocolizationCase,
        request,
        attestWith(basis, { claimRef: TEST_SECOND_CLAIM_ID }),
      ),
    ).rejects.toMatchObject({
      code: PROFESSIONAL_REVIEW_ERROR_CODES.attestationCannotBeConstructed,
    });

    // Nothing was written on the way to the refusal.
    expect(
      basis.protocolizationCase.materials.some(
        (material) => material.kind === ProtocolizationMaterialKind.Attestation,
      ),
    ).toBe(false);
  });

  // (a) The already-supported workflow, and it needs no signer and no proof:
  // nothing is being produced that anyone could later be asked to audit.
  it('records an Attest without a Protocol artifact when none was asked for', async () => {
    const context = createReviewContext({ withoutSigner: true });
    const { basis, request } = await openRequest(context);

    context.clock.advance(60);
    const transition = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      attestWith(basis, {}, { attestation: undefined, decisionId: 'review-decision-no-artifact' }),
    );

    // A professional position without a canonical artifact is an honest
    // outcome; a fabricated artifact would not be.
    expect(transition.decision.action).toBe(ProfessionalReviewAction.Attest);
    expect(transition.decision.canonicalAttestationRef).toBeUndefined();
    expect(transition.decision.attestationMaterialId).toBeUndefined();
    expect(transition.decision.resultingCaseRevision).toBeUndefined();
    expect(transition.attestation).toBeUndefined();
    expect(transition.protocolizationCase).toBeUndefined();
    expect(transition.attestationEvent).toBeUndefined();

    // (f) No proof was involved anywhere, so no Attestation material exists.
    expect(
      basis.protocolizationCase.materials.some(
        (material) => material.kind === ProtocolizationMaterialKind.Attestation,
      ),
    ).toBe(false);
  });

  it('never produces an attestation for Reject, RequestMoreEvidence or Abstain', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);

    for (const [index, action] of [
      ProfessionalReviewAction.Reject,
      ProfessionalReviewAction.RequestMoreEvidence,
      ProfessionalReviewAction.Abstain,
    ].entries()) {
      context.clock.advance(60);
      const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
        reviewRequestId: `review-request-no-artifact-${index}`,
        attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
        requestedAttestationType: AttestationType.Human,
        requestedScope: primaryScope(basis.protocolizationCase),
      });

      // Even offering one is refused: the field belongs to Attest alone.
      await expect(
        recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
          decisionId: `review-decision-no-artifact-${index}`,
          reviewer: TEST_REVIEWER_HUMAN,
          reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
          action,
          reasonCode: 'review.conflict',
          ...(action === ProfessionalReviewAction.RequestMoreEvidence
            ? {
                requestedMaterial: [
                  {
                    requirementId: 'evidence.supporting.optional',
                    reasonCode: 'review.material.missing',
                  },
                ],
              }
            : {}),
          attestation: {
            attestationId: TEST_ATTESTATION_ID,
            claimRef: TEST_CLAIM_ID,
            statement: 'Should never be reachable.',
            materialId: 'material-should-not-exist',
          },
        }),
      ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.unexpectedActionField });
    }

    expect(
      basis.protocolizationCase.materials.some(
        (material) => material.kind === ProtocolizationMaterialKind.Attestation,
      ),
    ).toBe(false);
  });

  // (d) The first legitimate source: a configured signer's own reference.
  it('attaches a signer’s proof reference and invents none of its own', async () => {
    const signer = createTestAttestationSigner();
    const context = createReviewContext({ signer });
    const { basis, request } = await openRequest(context, 'review-request-signed');

    context.clock.advance(60);
    const { attestation } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      attestWith(basis),
    );

    expect(signer.calls).toHaveLength(1);
    expect(signer.calls[0]!.attestationId).toBe(TEST_ATTESTATION_ID);
    expect(signer.calls[0]!.claimRef).toBe(TEST_CLAIM_ID);
    expect(attestation!.proofRefs).toHaveLength(1);
    expect(attestation!.proofRefs![0]!.type).toBe(ProofType.SignatureProof);
  });

  /**
   * (b) The case this hardening exists for.
   *
   * Protocol permits a `CanonicalAttestation` with no `proofRefs`. APV-08 does
   * not produce one: a professional attestation associated to a case as
   * `ProtocolizationMaterialKind.Attestation` is auditable, or it is not
   * produced. With no signer configured and no caller-held reference, there is
   * nothing legitimate to attach, so the operation refuses.
   */
  it('refuses a requested CanonicalAttestation with neither a signer nor a proof reference', async () => {
    const context = createReviewContext({ withoutSigner: true });
    const { basis, request } = await openRequest(context, 'review-request-no-proof');
    const revisionBefore = basis.protocolizationCase.revision;

    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(
        context,
        basis.protocolizationCase,
        request,
        attestWith(basis),
      ),
    ).rejects.toMatchObject({
      code: PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable,
      details: { reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable] },
    });

    // (8) Atomic: no case mutation, no revision increment, no material.
    expect(basis.protocolizationCase.revision).toBe(revisionBefore);
    expect(
      basis.protocolizationCase.materials.some(
        (material) => material.kind === ProtocolizationMaterialKind.Attestation,
      ),
    ).toBe(false);
  });

  // An empty array is the same absence, spelled differently.
  it('treats an empty proofRefs array as no proof reference at all', async () => {
    const context = createReviewContext({ withoutSigner: true });
    const { basis, request } = await openRequest(context, 'review-request-empty-proofs');

    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(
        context,
        basis.protocolizationCase,
        request,
        attestWith(basis, { proofRefs: [] }),
      ),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable });
  });

  /**
   * (c) The second legitimate source.
   *
   * A caller who already holds a reference needs no signer. What travels onto
   * the attestation is exactly what they supplied — this package resolves it,
   * verifies it and rewrites it precisely never.
   */
  it('accepts a caller-supplied proof reference with no signer configured', async () => {
    const context = createReviewContext({ withoutSigner: true });
    const { basis, request } = await openRequest(context, 'review-request-caller-proof');

    context.clock.advance(60);
    const { attestation, protocolizationCase } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      attestWith(basis, { proofRefs: [TEST_CALLER_PROOF_REF] }),
    );

    expect(attestation!.proofRefs).toEqual([TEST_CALLER_PROOF_REF]);
    expect(
      protocolizationCase!.materials.some(
        (material) => material.kind === ProtocolizationMaterialKind.Attestation,
      ),
    ).toBe(true);
  });

  /**
   * (e) A signer that cannot sign produces nothing whatsoever.
   *
   * Not a decision, not an artifact, not an event, and not a case mutation: the
   * caller asked for an artifact they cannot legitimately have, and gets an
   * error rather than a silently downgraded success.
   */
  it('fails the whole decision when a configured signer cannot sign', async () => {
    const context = createReviewContext({ signer: createFailingAttestationSigner() });
    const { basis, request } = await openRequest(context, 'review-request-signer-down');
    const revisionBefore = basis.protocolizationCase.revision;
    const caseBefore = JSON.stringify(basis.protocolizationCase);

    context.clock.advance(60);
    const outcome = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      attestWith(basis),
    ).then(
      (transition) => ({ threw: false, transition }) as const,
      (error: unknown) => ({ threw: true, error }) as const,
    );

    expect(outcome.threw).toBe(true);
    expect(outcome).toMatchObject({
      error: { code: PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable },
    });
    // No decision came back at all — there is no partial result to inspect.
    expect(outcome).not.toHaveProperty('transition');

    expect(basis.protocolizationCase.revision).toBe(revisionBefore);
    expect(JSON.stringify(basis.protocolizationCase)).toBe(caseBefore);
    expect(
      basis.protocolizationCase.materials.some(
        (material) => material.kind === ProtocolizationMaterialKind.Attestation,
      ),
    ).toBe(false);
  });

  // A misbehaving port is refused, not attached and called signed.
  it('refuses what a signer returns when it is not a usable proof reference', async () => {
    const context = createReviewContext({ signer: createUnusableProofAttestationSigner() });
    const { basis, request } = await openRequest(context, 'review-request-bad-proof');

    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(
        context,
        basis.protocolizationCase,
        request,
        attestWith(basis),
      ),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable });

    expect(
      basis.protocolizationCase.materials.some(
        (material) => material.kind === ProtocolizationMaterialKind.Attestation,
      ),
    ).toBe(false);
  });

  /**
   * (f) and (8), swept over every way a proof can be missing.
   *
   * One assertion matters above the rest: no path here leaves an
   * `Attestation` material on the case. A refused artifact must not show up
   * later as evidence that a professional attested to anything.
   */
  it('creates no Attestation material, and mutates nothing, on any proof-absent path', async () => {
    const cases = [
      { id: 'sweep-none', options: { withoutSigner: true } as const, proofRefs: undefined },
      { id: 'sweep-empty', options: { withoutSigner: true } as const, proofRefs: [] },
      {
        id: 'sweep-signer-down',
        options: { signer: createFailingAttestationSigner() } as const,
        proofRefs: undefined,
      },
      {
        id: 'sweep-signer-unusable',
        options: { signer: createUnusableProofAttestationSigner() } as const,
        proofRefs: undefined,
      },
    ];

    for (const [index, entry] of cases.entries()) {
      const context = createReviewContext(entry.options);
      const { basis, request } = await openRequest(context, `review-request-${entry.id}`);
      const before = JSON.stringify(basis.protocolizationCase);
      const revisionBefore = basis.protocolizationCase.revision;

      context.clock.advance(60);
      await expect(
        recordProfessionalReviewDecision(
          context,
          basis.protocolizationCase,
          request,
          attestWith(
            basis,
            entry.proofRefs === undefined ? {} : { proofRefs: entry.proofRefs },
            { decisionId: `review-decision-${index}` },
          ),
        ),
      ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable });

      expect(
        basis.protocolizationCase.materials.some(
          (material) => material.kind === ProtocolizationMaterialKind.Attestation,
        ),
      ).toBe(false);
      expect(basis.protocolizationCase.revision).toBe(revisionBefore);
      expect(JSON.stringify(basis.protocolizationCase)).toBe(before);
    }
  });

  it('constructs or fails: prepareCanonicalAttestationFromReview never repairs', () => {
    const good = {
      attestationId: TEST_ATTESTATION_ID,
      attestationType: AttestationType.Human,
      attester: TEST_REVIEWER_HUMAN,
      claimRef: TEST_CLAIM_ID,
      statement: 'Test-only statement.',
      issuedAt: '2026-01-01T00:00:00.000Z',
      proofRefs: [TEST_CALLER_PROOF_REF],
    };
    expect(prepareCanonicalAttestationFromReview(good).id).toBe(TEST_ATTESTATION_ID);

    for (const broken of [
      { ...good, attestationId: '   ' },
      { ...good, claimRef: '' },
      { ...good, statement: '' },
      { ...good, issuedAt: '2026-01-01T00:00:00+02:00' },
      { ...good, proofRefs: [{ id: 'p', type: 'NotAProofType', source: 'x' }] },
    ]) {
      expect(() => prepareCanonicalAttestationFromReview(broken as never)).toThrow(
        expect.objectContaining({
          code: PROFESSIONAL_REVIEW_ERROR_CODES.attestationCannotBeConstructed,
        }),
      );
    }
  });

  /**
   * (b), at the construction layer.
   *
   * The rule is not enforced only in the operation: the exported constructor
   * itself will not hand anyone a professional attestation carrying no proof
   * reference, so there is no second door into an unauditable artifact.
   */
  it('refuses to construct a professional attestation carrying no proof reference', () => {
    const base = {
      attestationId: TEST_ATTESTATION_ID,
      attestationType: AttestationType.Human,
      attester: TEST_REVIEWER_HUMAN,
      claimRef: TEST_CLAIM_ID,
      statement: 'Test-only statement.',
      issuedAt: '2026-01-01T00:00:00.000Z',
    };

    for (const proofRefs of [undefined, [], 'not-an-array']) {
      expect(() =>
        prepareCanonicalAttestationFromReview({ ...base, proofRefs } as never),
      ).toThrow(
        expect.objectContaining({
          code: PROFESSIONAL_REVIEW_ERROR_CODES.attestationCannotBeConstructed,
          details: expect.objectContaining({
            reasonCodes: expect.arrayContaining(['ATTESTATION_PROOF_REFS_REQUIRED']),
          }),
        }),
      );
    }
  });

  it('omits optional Protocol fields rather than setting them to undefined', () => {
    const attestation = prepareCanonicalAttestationFromReview({
      attestationId: TEST_ATTESTATION_ID,
      attestationType: AttestationType.Human,
      attester: TEST_REVIEWER_HUMAN,
      claimRef: TEST_CLAIM_ID,
      statement: 'Test-only statement.',
      issuedAt: '2026-01-01T00:00:00.000Z',
      proofRefs: [TEST_CALLER_PROOF_REF],
    });

    // `credentialRefs` is absent rather than undefined; `proofRefs` is present,
    // because this vertical produces no attestation without one.
    expect(Object.keys(attestation).sort()).toEqual([
      'attester',
      'claimRef',
      'id',
      'issuedAt',
      'proofRefs',
      'statement',
      'type',
    ]);
  });

  it('rewrites no declaration, evidence receipt or verification result', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, 'review-request-no-rewrite');
    const before = {
      declarations: JSON.stringify(basis.declarations),
      receipts: JSON.stringify(basis.receipts),
      results: JSON.stringify(basis.verificationResults),
    };

    context.clock.advance(60);
    await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      attestWith(basis),
    );

    expect(JSON.stringify(basis.declarations)).toBe(before.declarations);
    expect(JSON.stringify(basis.receipts)).toBe(before.receipts);
    expect(JSON.stringify(basis.verificationResults)).toBe(before.results);
    // The declarant's claim is still the declarant's.
    expect(basis.declarations[0]!.declarant.id).not.toBe(TEST_REVIEWER_HUMAN.id);
  });

  it('refuses to reuse a material id the case already carries', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, 'review-request-duplicate-material');

    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(
        context,
        basis.protocolizationCase,
        request,
        attestWith(basis, { materialId: 'material-declaration-0001' }),
      ),
    ).rejects.toMatchObject({ code: PROTOCOLIZATION_CASE_ERROR_CODES.duplicateMaterial });
  });
});
