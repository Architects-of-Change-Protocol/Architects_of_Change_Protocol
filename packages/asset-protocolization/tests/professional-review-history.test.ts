import { AttestationType } from '@aoc/protocol/claims';

import {
  EvidenceIntakePathway,
  PROFESSIONAL_REVIEW_ERROR_CODES,
  ProfessionalReviewAction,
  buildProfessionalReviewPacket,
  createInMemoryProfessionalReviewDecisionRepository,
  createInMemoryProfessionalReviewRequestRepository,
  createProfessionalReviewRequest,
  intakeProtocolizationEvidence,
  recordProfessionalReviewDecision,
} from '@aoc/asset-protocolization';

import { TENANT_A } from './fixtures/test-cases';
import { TEST_CLAIM_ID, sync } from './fixtures/test-declarations';
import { TEST_CATEGORY_DOCUMENT, TEST_SECOND_EVIDENCE_ID } from './fixtures/test-evidence';
import {
  TEST_ATTESTATION_ID,
  TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  TEST_PROFESSIONAL_CREDENTIAL,
  TEST_REVIEWER_HUMAN,
  buildReviewableCase,
  createReviewContext,
  primaryScope,
  reviewedRefs,
} from './fixtures/test-attestation';

describe('progressive professional review', () => {
  // ARCHITECTURE PROOF E — follow-up review after RequestMoreEvidence
  it('runs the full intended history: R1 asks for more, new evidence arrives, R2 attests', async () => {
    const context = createReviewContext();
    const requests = createInMemoryProfessionalReviewRequestRepository();
    const decisions = createInMemoryProfessionalReviewDecisionRepository();

    const basis = await buildReviewableCase(context);
    const atFirstBasis = basis.protocolizationCase;

    // --- R1, bound to the first basis -------------------------------------
    context.clock.advance(60);
    const firstRequest = createProfessionalReviewRequest(context, atFirstBasis, {
      reviewRequestId: 'review-request-r1',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(atFirstBasis),
    }).request;
    requests.save(firstRequest);

    const firstPacket = buildProfessionalReviewPacket(context, atFirstBasis, firstRequest, {
      evidenceReceipts: basis.receipts,
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });
    const firstPacketJson = JSON.stringify(firstPacket);

    context.clock.advance(60);
    const firstDecision = (
      await recordProfessionalReviewDecision(context, atFirstBasis, firstRequest, {
        decisionId: 'review-decision-r1',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.RequestMoreEvidence,
        reasonCode: 'review.insufficient-evidence',
        requestedMaterial: [
          {
            requirementId: 'evidence.supporting.optional',
            evidenceCategoryId: TEST_CATEGORY_DOCUMENT,
            reasonCode: 'review.material.missing',
          },
        ],
      })
    ).decision;
    decisions.save(firstDecision);

    // --- new evidence arrives through APV-05 ------------------------------
    context.clock.advance(60);
    const intake = intakeProtocolizationEvidence(context, atFirstBasis, {
      intakeId: 'intake-follow-up',
      caseId: atFirstBasis.caseId,
      materialId: 'material-evidence-follow-up',
      categoryId: TEST_CATEGORY_DOCUMENT,
      pathway: EvidenceIntakePathway.Reference,
      evidenceRef: TEST_SECOND_EVIDENCE_ID,
      requirementIds: ['evidence.supporting.optional'],
    } as never);
    const atSecondBasis = intake.protocolizationCase;
    expect(atSecondBasis.revision).toBe(atFirstBasis.revision + 1);

    // --- R2, bound to the new basis ---------------------------------------
    context.clock.advance(60);
    const secondRequest = createProfessionalReviewRequest(context, atSecondBasis, {
      reviewRequestId: 'review-request-r2',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(atSecondBasis),
    }).request;
    requests.save(secondRequest);

    const secondPacket = buildProfessionalReviewPacket(context, atSecondBasis, secondRequest, {
      evidenceReceipts: [...basis.receipts, intake.receipt],
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });

    context.clock.advance(60);
    const secondTransition = await recordProfessionalReviewDecision(
      context,
      atSecondBasis,
      secondRequest,
      {
        decisionId: 'review-decision-r2',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(atSecondBasis),
        reviewedRefs: reviewedRefs(basis) as never,
        attestation: {
          attestationId: TEST_ATTESTATION_ID,
          claimRef: TEST_CLAIM_ID,
          statement: 'Test-only: reviewed again on the newer basis.',
          materialId: 'material-attestation-r2',
        },
      },
    );
    decisions.save(secondTransition.decision);

    // R1 stayed exactly where it was.
    expect(firstRequest.reviewBasisRevision).toBe(atFirstBasis.revision);
    expect(firstDecision.reviewBasisRevision).toBe(atFirstBasis.revision);
    expect(JSON.stringify(firstPacket)).toBe(firstPacketJson);
    expect(firstPacket.evidence).toHaveLength(1);

    // R2 sees the newer basis.
    expect(secondRequest.reviewBasisRevision).toBe(atSecondBasis.revision);
    expect(secondPacket.evidence).toHaveLength(2);
    expect(secondTransition.decision.reviewBasisRevision).toBe(atSecondBasis.revision);
    expect(secondTransition.decision.resultingCaseRevision).toBe(atSecondBasis.revision + 1);

    // Both remain, in order, each addressable.
    const storedRequests = sync(requests.listByCase(TENANT_A, atFirstBasis.caseId));
    const storedDecisions = sync(decisions.listByCase(TENANT_A, atFirstBasis.caseId));
    expect(storedRequests.map((entry) => entry.reviewRequestId)).toEqual([
      'review-request-r1',
      'review-request-r2',
    ]);
    expect(storedDecisions.map((entry) => entry.action)).toEqual([
      ProfessionalReviewAction.RequestMoreEvidence,
      ProfessionalReviewAction.Attest,
    ]);
  });

  // HARD HISTORY TEST
  it('is append-only: a request and a decision can never be overwritten', async () => {
    const context = createReviewContext();
    const requests = createInMemoryProfessionalReviewRequestRepository();
    const decisions = createInMemoryProfessionalReviewDecisionRepository();
    const basis = await buildReviewableCase(context);

    context.clock.advance(60);
    const request = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-append-only',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    }).request;
    requests.save(request);

    expect(() => requests.save(request)).toThrow(
      expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.duplicateRequest }),
    );
    expect(() =>
      requests.save({ ...request, correlationId: 'aoc:correlation:edited' }),
    ).toThrow(expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.duplicateRequest }));
    // A request whose basis was edited is refused before the store even looks
    // for a duplicate: the scope would no longer agree with the revision.
    expect(() => requests.save({ ...request, reviewBasisRevision: 99 })).toThrow(
      expect.objectContaining({
        code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidRequestRecord,
      }),
    );

    context.clock.advance(60);
    const decision = (
      await recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
        decisionId: 'review-decision-append-only',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Reject,
        reasonCode: 'review.conflict',
      })
    ).decision;
    decisions.save(decision);

    expect(() => decisions.save(decision)).toThrow(
      expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.duplicateDecision }),
    );
    // A second, different decision for the same request is refused too: one
    // terminal decision per request.
    expect(() =>
      decisions.save({
        ...decision,
        decisionId: 'review-decision-second-position',
        action: ProfessionalReviewAction.Abstain,
      }),
    ).toThrow(expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.alreadyDecided }));

    // The original survives untouched.
    expect(sync(decisions.getByRequest(TENANT_A, request.reviewRequestId))?.action).toBe(
      ProfessionalReviewAction.Reject,
    );

    // And there is no update or delete on either port to reach for.
    for (const method of ['update', 'delete', 'remove', 'replace', 'retract']) {
      expect(method in requests).toBe(false);
      expect(method in decisions).toBe(false);
    }
  });

  // ARCHITECTURE PROOF Q / HARD REVISION TEST
  it('never lets an old review silently cover material added later', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    const atBasis = basis.protocolizationCase;

    context.clock.advance(60);
    const request = createProfessionalReviewRequest(context, atBasis, {
      reviewRequestId: 'review-request-fixed-basis',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(atBasis),
    }).request;

    context.clock.advance(60);
    const attested = await recordProfessionalReviewDecision(context, atBasis, request, {
      decisionId: 'review-decision-fixed-basis',
      reviewer: TEST_REVIEWER_HUMAN,
      reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
      action: ProfessionalReviewAction.Attest,
      scope: primaryScope(atBasis),
      reviewedRefs: reviewedRefs(basis) as never,
      attestation: {
        attestationId: TEST_ATTESTATION_ID,
        claimRef: TEST_CLAIM_ID,
        statement: 'Test-only: attested on this basis and no other.',
        materialId: 'material-attestation-fixed',
      },
    });

    // The attestation's own case now moves on, twice.
    context.clock.advance(60);
    const later = intakeProtocolizationEvidence(context, attested.protocolizationCase!, {
      intakeId: 'intake-after-attestation',
      caseId: atBasis.caseId,
      materialId: 'material-evidence-after',
      categoryId: TEST_CATEGORY_DOCUMENT,
      pathway: EvidenceIntakePathway.Reference,
      evidenceRef: TEST_SECOND_EVIDENCE_ID,
      requirementIds: ['evidence.supporting.optional'],
    } as never);

    // The decision still says what it always said.
    expect(attested.decision.reviewBasisRevision).toBe(atBasis.revision);
    expect(attested.decision.resultingCaseRevision).toBe(atBasis.revision + 1);
    expect(later.protocolizationCase.revision).toBe(atBasis.revision + 2);
    expect(attested.decision.scope!.caseRevision).toBe(atBasis.revision);

    // And the old request cannot be re-reviewed against the moved-on case.
    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(context, later.protocolizationCase, request, {
        decisionId: 'review-decision-restale',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Reject,
        reasonCode: 'review.conflict',
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidBasisRevision });
  });

  it('keeps a request and a decision ordered by instant with a stable tie-break', async () => {
    const context = createReviewContext();
    const requests = createInMemoryProfessionalReviewRequestRepository();
    const basis = await buildReviewableCase(context);

    context.clock.advance(60);
    // Two requests at the same instant: the tie-break is the identifier, not
    // insertion order.
    const second = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-zzz',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    }).request;
    const first = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-aaa',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    }).request;
    requests.save(second);
    requests.save(first);

    expect(first.requestedAt).toBe(second.requestedAt);
    expect(
      sync(requests.listByCase(TENANT_A, basis.protocolizationCase.caseId)).map(
        (entry) => entry.reviewRequestId,
      ),
    ).toEqual(['review-request-aaa', 'review-request-zzz']);
  });
});
