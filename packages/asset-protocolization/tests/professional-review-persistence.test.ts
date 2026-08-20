import { AttestationType } from '@aoc/protocol/claims';

import {
  PROFESSIONAL_REVIEW_ERROR_CODES,
  ProfessionalReviewAction,
  buildProfessionalReviewPacket,
  createInMemoryProfessionalReviewDecisionRepository,
  createInMemoryProfessionalReviewRequestRepository,
  createProfessionalReviewRequest,
  recordProfessionalReviewDecision,
} from '@aoc/asset-protocolization';

import { TENANT_A } from './fixtures/test-cases';
import { TEST_CLAIM_ID, sync } from './fixtures/test-declarations';
import {
  TEST_ATTESTATION_EXTERNAL_SUBJECT,
  TEST_ATTESTATION_ID,
  TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  TEST_PROFESSIONAL_CREDENTIAL,
  TEST_REVIEWER_HUMAN,
  buildReviewableCase,
  createReviewContext,
  primaryScope,
  reviewedRefs,
} from './fixtures/test-attestation';

describe('professional review persistence', () => {
  it('stores requests and decisions tenant-scoped, validated and deeply frozen', async () => {
    const context = createReviewContext();
    const requests = createInMemoryProfessionalReviewRequestRepository();
    const decisions = createInMemoryProfessionalReviewDecisionRepository();
    const basis = await buildReviewableCase(context);

    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-store',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });
    requests.save(request);

    context.clock.advance(60);
    const { decision } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-store',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
      },
    );
    decisions.save(decision);

    const storedRequest = sync(requests.get(TENANT_A, 'review-request-store'))!;
    const storedDecision = sync(decisions.get(TENANT_A, 'review-decision-store'))!;
    expect(storedRequest).toEqual(request);
    expect(storedDecision).toEqual(decision);

    // Holding a reference to what was saved does not let a caller edit history.
    const mutableRequest = storedRequest as unknown as { reviewBasisRevision: number };
    const mutableDecision = storedDecision as unknown as { action: string };
    expect(() => {
      mutableRequest.reviewBasisRevision = 99;
    }).toThrow();
    expect(() => {
      mutableDecision.action = ProfessionalReviewAction.Reject;
    }).toThrow();
  });

  it('refuses to store a record it would have refused to produce', () => {
    const requests = createInMemoryProfessionalReviewRequestRepository();
    const decisions = createInMemoryProfessionalReviewDecisionRepository();

    expect(() => requests.save({ nonsense: true } as never)).toThrow(
      expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidRequestRecord }),
    );
    expect(() => decisions.save({ nonsense: true } as never)).toThrow(
      expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidDecision }),
    );
  });

  it('does not persist the packet, because it is reconstructible', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-projection',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });

    const first = buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
      evidenceReceipts: basis.receipts,
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });
    const second = buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
      evidenceReceipts: basis.receipts,
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });

    expect(second).toEqual(first);
    // There is deliberately no packet repository to import.
    const facade = await import('@aoc/asset-protocolization');
    expect(Object.keys(facade)).not.toContain('createInMemoryProfessionalReviewPacketRepository');
    expect(Object.keys(facade)).not.toContain('ProfessionalReviewPacketRepository');
    // Nor an attestation repository: Protocol records are not this vertical's
    // to take custody of.
    expect(Object.keys(facade)).not.toContain('createInMemoryCanonicalAttestationRepository');
  });

  it('returns a composable transition rather than pretending writes are atomic', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-atomicity',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });

    context.clock.advance(60);
    const transition = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-atomicity',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
        attestation: {
          attestationId: TEST_ATTESTATION_ID,
          claimRef: TEST_CLAIM_ID,
          statement: 'Test-only statement.',
          materialId: 'material-attestation-atomicity',
        },
      },
    );

    // Everything the composition layer must commit together, returned together
    // and stored by nothing.
    expect(Object.keys(transition).sort()).toEqual([
      'attestation',
      'attestationEvent',
      'caseEvent',
      'decision',
      'decisionEvent',
      'protocolizationCase',
    ]);
  });
});

describe('professional review over abstract subject shapes', () => {
  // ARCHITECTURE PROOF W — an abstract content subject
  it('reviews a subject that has bytes', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context, { caseId: 'case-subject-content' });

    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-subject-content',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });
    const packet = buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
      evidenceReceipts: basis.receipts,
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });

    expect(packet.subject.contentIdentity).toBeDefined();

    context.clock.advance(60);
    const { decision } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-subject-content',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
      },
    );
    expect(decision.scope!.subjectRef).toEqual(basis.protocolizationCase.subject.subjectRef);
  });

  // ARCHITECTURE PROOF X — an abstract external-reference subject
  it('reviews a subject named only inside an external namespace, through the same path', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context, {
      caseId: 'case-subject-external',
      subject: TEST_ATTESTATION_EXTERNAL_SUBJECT,
    });

    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-subject-external',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });
    const packet = buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
      evidenceReceipts: basis.receipts,
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });

    // No bytes at all, and the workflow neither noticed nor needed to.
    expect(packet.subject.contentIdentity).toBeUndefined();
    expect(packet.subject.subjectRef.externalReference).toEqual({
      namespace: 'test.namespace.external',
      id: 'test-entry-7001',
    });

    context.clock.advance(60);
    const { decision, attestation } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-subject-external',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
        attestation: {
          attestationId: TEST_ATTESTATION_ID,
          claimRef: TEST_CLAIM_ID,
          statement: 'Test-only statement about an externally named subject.',
          materialId: 'material-attestation-external',
        },
      },
    );

    expect(decision.scope!.subjectRef.externalReference).toBeDefined();
    expect(attestation!.claimRef).toBe(TEST_CLAIM_ID);
  });

  // §116 — subject binding
  it('refuses an attestation scoped to a different subject in the same tenant', async () => {
    const context = createReviewContext();
    const first = await buildReviewableCase(context, { caseId: 'case-subject-a' });
    const second = await buildReviewableCase(context, {
      caseId: 'case-subject-b',
      subject: TEST_ATTESTATION_EXTERNAL_SUBJECT,
    });

    context.clock.advance(60);
    expect(() =>
      createProfessionalReviewRequest(context, first.protocolizationCase, {
        reviewRequestId: 'review-request-wrong-subject',
        attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
        requestedAttestationType: AttestationType.Human,
        requestedScope: primaryScope(second.protocolizationCase),
      }),
    ).toThrow(expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidScope }));
  });
});
