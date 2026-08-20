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
  TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  TEST_PROFESSIONAL_CREDENTIAL,
  TEST_REVIEWER_HUMAN,
  buildReviewableCase,
  createFailingAttestationSigner,
  createReviewContext,
  createTestAttestationSigner,
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

  it('records an Attest without a Protocol artifact when none was asked for', async () => {
    const context = createReviewContext();
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

  it('produces an unsigned attestation when no signer is configured', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, 'review-request-unsigned');

    context.clock.advance(60);
    const { attestation } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      attestWith(basis),
    );

    // Protocol makes `proofRefs` optional. An honestly unsigned attestation is
    // worth more than a fabricated signature.
    expect(attestation!.proofRefs).toBeUndefined();
  });

  it('fails the whole decision when a configured signer cannot sign', async () => {
    const context = createReviewContext({ signer: createFailingAttestationSigner() });
    const { basis, request } = await openRequest(context, 'review-request-signer-down');

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

  it('constructs or fails: prepareCanonicalAttestationFromReview never repairs', () => {
    const good = {
      attestationId: TEST_ATTESTATION_ID,
      attestationType: AttestationType.Human,
      attester: TEST_REVIEWER_HUMAN,
      claimRef: TEST_CLAIM_ID,
      statement: 'Test-only statement.',
      issuedAt: '2026-01-01T00:00:00.000Z',
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

  it('omits optional Protocol fields rather than setting them to undefined', () => {
    const attestation = prepareCanonicalAttestationFromReview({
      attestationId: TEST_ATTESTATION_ID,
      attestationType: AttestationType.Human,
      attester: TEST_REVIEWER_HUMAN,
      claimRef: TEST_CLAIM_ID,
      statement: 'Test-only statement.',
      issuedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(Object.keys(attestation).sort()).toEqual([
      'attester',
      'claimRef',
      'id',
      'issuedAt',
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
