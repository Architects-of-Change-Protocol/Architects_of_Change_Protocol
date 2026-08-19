import { AttestationType } from '@aoc/protocol/claims';

import {
  PROFESSIONAL_REVIEW_ACTIONS,
  PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION,
  PROFESSIONAL_REVIEW_ERROR_CODES,
  PROFESSIONAL_REVIEW_EVENT_TYPES,
  ProfessionalReviewAction,
  ProfessionalReviewBasisKind,
  ProtocolizationCaseState,
  ProtocolizationMaterialKind,
  ProtocolizationRequirementMaterialStatus,
  createProfessionalReviewRequest,
  recordProfessionalReviewDecision,
} from '@aoc/asset-protocolization';
import type {
  ProfessionalReviewRequest,
  RecordProfessionalReviewDecisionInput,
} from '@aoc/asset-protocolization';

import { TEST_CATEGORY_PROFESSIONAL } from './fixtures/test-evidence';
import {
  TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  TEST_PROFESSIONAL_CREDENTIAL,
  TEST_REVIEWER_HUMAN,
  buildReviewableCase,
  createReviewContext,
  primaryScope,
  reviewedRefs,
} from './fixtures/test-attestation';
import type { ReviewTestContext, ReviewableCase } from './fixtures/test-attestation';

async function openRequest(
  context: ReviewTestContext,
  requestId = 'review-request-decision',
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

function baseDecision(
  basis: ReviewableCase,
  overrides: Partial<RecordProfessionalReviewDecisionInput> = {},
): RecordProfessionalReviewDecisionInput {
  return {
    decisionId: 'review-decision-0001',
    reviewer: TEST_REVIEWER_HUMAN,
    reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
    action: ProfessionalReviewAction.Attest,
    scope: primaryScope(basis.protocolizationCase),
    reviewedRefs: reviewedRefs(basis) as never,
    ...overrides,
  } as RecordProfessionalReviewDecisionInput;
}

describe('professional review decisions', () => {
  it('exposes exactly the four frozen actions, and none of them is a boolean', () => {
    expect(PROFESSIONAL_REVIEW_ACTIONS).toEqual([
      ProfessionalReviewAction.Attest,
      ProfessionalReviewAction.Reject,
      ProfessionalReviewAction.RequestMoreEvidence,
      ProfessionalReviewAction.Abstain,
    ]);
    expect(new Set(PROFESSIONAL_REVIEW_ACTIONS).size).toBe(4);
    for (const action of PROFESSIONAL_REVIEW_ACTIONS) {
      expect(typeof action).toBe('string');
      expect(typeof action).not.toBe('boolean');
    }
  });

  // ARCHITECTURE PROOF B — Attest
  it('records an Attest with a reviewer, a scope and the reviewed basis', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    context.clock.advance(60);
    const { decision, decisionEvent, protocolizationCase, attestation } =
      await recordProfessionalReviewDecision(
        context,
        basis.protocolizationCase,
        request,
        baseDecision(basis),
      );

    expect(decision.schemaVersion).toBe(PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION);
    expect(decision.action).toBe(ProfessionalReviewAction.Attest);
    expect(decision.reviewer).toEqual(TEST_REVIEWER_HUMAN);
    expect(decision.reviewerCredentialRefs).toEqual([TEST_PROFESSIONAL_CREDENTIAL]);
    expect(decision.scope?.requirementId).toBe(TEST_PRIMARY_ATTESTATION_REQUIREMENT);
    expect(decision.reviewBasisRevision).toBe(request.reviewBasisRevision);
    expect(decision.reviewedRefs?.length).toBeGreaterThan(0);
    expect(decisionEvent.eventType).toBe(PROFESSIONAL_REVIEW_EVENT_TYPES.decisionRecorded);

    // No attestation was asked for, so none was fabricated — and the case did
    // not move.
    expect(attestation).toBeUndefined();
    expect(decision.canonicalAttestationRef).toBeUndefined();
    expect(protocolizationCase).toBeUndefined();
  });

  // ARCHITECTURE PROOF P / HARD SCOPE TEST
  it('cannot record an unscoped Attest', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(
        context,
        basis.protocolizationCase,
        request,
        baseDecision(basis, { scope: undefined }),
      ),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.scopeRequired });
  });

  it('refuses an Attest whose scope widens beyond the request', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);
    context.clock.advance(60);

    for (const scope of [
      primaryScope(basis.protocolizationCase, { attestationType: AttestationType.Organization }),
      primaryScope(basis.protocolizationCase, {
        caseRevision: basis.protocolizationCase.revision + 1,
      }),
      primaryScope(basis.protocolizationCase, { propositionRefs: [] }),
    ]) {
      await expect(
        recordProfessionalReviewDecision(
          context,
          basis.protocolizationCase,
          request,
          baseDecision(basis, { scope }),
        ),
      ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidScope });
    }
  });

  it('requires an Attest to record what was reviewed', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(
        context,
        basis.protocolizationCase,
        request,
        baseDecision(basis, { reviewedRefs: undefined }),
      ),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.unexpectedActionField });
  });

  // ARCHITECTURE PROOF C — Reject
  it('records a Reject with no attestation, no state change and no rewriting', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);
    const caseBefore = JSON.stringify(basis.protocolizationCase);
    const declarationsBefore = JSON.stringify(basis.declarations);
    const receiptsBefore = JSON.stringify(basis.receipts);
    const resultsBefore = JSON.stringify(basis.verificationResults);

    context.clock.advance(60);
    const transition = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-reject',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Reject,
        reasonCode: 'review.insufficient-evidence',
        note: 'Test-only reviewer note.',
      },
    );

    expect(transition.decision.action).toBe(ProfessionalReviewAction.Reject);
    expect(transition.decision.reasonCode).toBe('review.insufficient-evidence');
    expect(transition.decision.canonicalAttestationRef).toBeUndefined();
    expect(transition.attestation).toBeUndefined();
    expect(transition.protocolizationCase).toBeUndefined();

    // Nothing anywhere was rewritten, and no `Rejected` state exists to reach.
    expect(JSON.stringify(basis.protocolizationCase)).toBe(caseBefore);
    expect(JSON.stringify(basis.declarations)).toBe(declarationsBefore);
    expect(JSON.stringify(basis.receipts)).toBe(receiptsBefore);
    expect(JSON.stringify(basis.verificationResults)).toBe(resultsBefore);
    expect(basis.protocolizationCase.state).toBe(ProtocolizationCaseState.Draft);
    expect(Object.values(ProtocolizationCaseState)).not.toContain('Rejected');
  });

  it('requires a machine-readable reason for Reject, RequestMoreEvidence and Abstain', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);
    context.clock.advance(60);

    for (const action of [
      ProfessionalReviewAction.Reject,
      ProfessionalReviewAction.RequestMoreEvidence,
      ProfessionalReviewAction.Abstain,
    ]) {
      await expect(
        recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
          decisionId: 'review-decision-no-reason',
          reviewer: TEST_REVIEWER_HUMAN,
          reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
          action,
        }),
      ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.reasonCodeRequired });
    }
  });

  // ARCHITECTURE PROOF D — RequestMoreEvidence
  it('records a RequestMoreEvidence carrying machine-readable needs, and changes no state', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    context.clock.advance(60);
    const transition = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-more',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.RequestMoreEvidence,
        reasonCode: 'review.insufficient-evidence',
        requestedMaterial: [
          {
            requirementId: 'evidence.supporting.optional',
            evidenceCategoryId: TEST_CATEGORY_PROFESSIONAL,
            reasonCode: 'review.material.missing',
            note: 'Test-only detail.',
          },
        ],
      },
    );

    expect(transition.decision.action).toBe(ProfessionalReviewAction.RequestMoreEvidence);
    expect(transition.decision.requestedMaterial).toHaveLength(1);
    expect(transition.decision.requestedMaterial?.[0]?.requirementId).toBe(
      'evidence.supporting.optional',
    );
    expect(transition.decision.canonicalAttestationRef).toBeUndefined();
    expect(transition.protocolizationCase).toBeUndefined();

    // Nothing was deleted, and no `MoreEvidenceRequired` state exists.
    expect(basis.protocolizationCase.materials.length).toBeGreaterThan(0);
    expect(basis.verificationResults.length).toBeGreaterThan(0);
    expect(Object.values(ProtocolizationCaseState)).not.toContain('MoreEvidenceRequired');
  });

  it('refuses a RequestMoreEvidence that asks for nothing routable', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);
    context.clock.advance(60);

    await expect(
      recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
        decisionId: 'review-decision-empty',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.RequestMoreEvidence,
        reasonCode: 'review.insufficient-evidence',
        requestedMaterial: [],
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.emptyMaterialRequest });

    // Prose alone is not a machine-readable need.
    await expect(
      recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
        decisionId: 'review-decision-prose',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.RequestMoreEvidence,
        reasonCode: 'review.insufficient-evidence',
        requestedMaterial: [{ reasonCode: 'review.material.missing', note: 'more please' } as never],
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidDecision });
  });

  // ARCHITECTURE PROOF F — Abstain
  it('records an Abstain, which is neither a failure nor a rejection', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    context.clock.advance(60);
    const transition = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-abstain',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Abstain,
        reasonCode: 'review.scope-outside-competence',
      },
    );

    expect(transition.decision.action).toBe(ProfessionalReviewAction.Abstain);
    expect(transition.decision.action).not.toBe(ProfessionalReviewAction.Reject);
    expect(transition.decision.canonicalAttestationRef).toBeUndefined();
    expect(transition.protocolizationCase).toBeUndefined();
    // There is no failure vocabulary on a decision at all.
    expect(Object.keys(transition.decision)).not.toContain('failed');
    expect(Object.keys(transition.decision)).not.toContain('outcome');
  });

  it('refuses fields an action does not carry', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);
    context.clock.advance(60);

    // A scope on a non-attesting action would let a refusal read as a scoped
    // attestation that happened to say no.
    await expect(
      recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
        decisionId: 'review-decision-scoped-reject',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Reject,
        reasonCode: 'review.conflict',
        scope: primaryScope(basis.protocolizationCase),
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.unexpectedActionField });

    // Material requests belong only to RequestMoreEvidence.
    await expect(
      recordProfessionalReviewDecision(
        context,
        basis.protocolizationCase,
        request,
        baseDecision(basis, {
          decisionId: 'review-decision-attest-material',
          requestedMaterial: [
            { requirementId: 'evidence.supporting.optional', reasonCode: 'review.material.missing' },
          ],
        }),
      ),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.unexpectedActionField });
  });

  it('refuses an action outside the closed set', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);
    context.clock.advance(60);

    await expect(
      recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
        decisionId: 'review-decision-bogus',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: 'Approve' as never,
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidAction });

    // ...and no spelling of a state name gets through either.
    await expect(
      recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
        decisionId: 'review-decision-bogus-2',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: 'READY' as never,
        reasonCode: 'review.conflict',
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidAction });
  });

  it('never branches on an automated outcome: an Attest over a Fail is recorded as given', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    // The basis genuinely contains a Fail, a Warning, a ManualReview and an
    // Unavailable. None of them decides for the professional.
    const outcomes = basis.verificationResults.map((result) => result.outcome);
    expect(outcomes).toContain('Fail');

    context.clock.advance(60);
    const { decision } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      baseDecision(basis, { decisionId: 'review-decision-over-fail' }),
    );

    expect(decision.action).toBe(ProfessionalReviewAction.Attest);
    // And the Fail is still a Fail.
    expect(basis.verificationResults.map((result) => result.outcome)).toEqual(outcomes);
  });

  it('does not move any attestation requirement to MaterialPresent without an attestation', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    context.clock.advance(60);
    await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      baseDecision(basis, { decisionId: 'review-decision-no-material' }),
    );

    const state = basis.protocolizationCase.requirementStates.find(
      (entry) => entry.requirementId === TEST_PRIMARY_ATTESTATION_REQUIREMENT,
    );
    expect(state?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.Pending);
    expect(
      basis.protocolizationCase.materials.some(
        (material) => material.kind === ProtocolizationMaterialKind.Attestation,
      ),
    ).toBe(false);
  });

  it('returns a deeply frozen decision', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    context.clock.advance(60);
    const { decision } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      baseDecision(basis, { decisionId: 'review-decision-frozen' }),
    );

    const mutable = decision as unknown as {
      action: string;
      reviewer: { id: string };
      reviewedRefs: unknown[];
      scope: { propositionRefs: unknown[] };
    };
    expect(() => {
      mutable.action = ProfessionalReviewAction.Reject;
    }).toThrow();
    expect(() => {
      mutable.reviewer.id = 'someone-else';
    }).toThrow();
    expect(() => mutable.reviewedRefs.push({ kind: ProfessionalReviewBasisKind.Subject, ref: 'x' })).toThrow();
    expect(() =>
      mutable.scope.propositionRefs.push({ kind: ProfessionalReviewBasisKind.Subject, ref: 'x' }),
    ).toThrow();
    expect(decision.action).toBe(ProfessionalReviewAction.Attest);
  });

  it('refuses a decision on a Cancelled case while leaving earlier review readable', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    const { cancelProtocolizationCase } = await import('@aoc/asset-protocolization');
    context.clock.advance(60);
    const cancelled = cancelProtocolizationCase(context, basis.protocolizationCase, {
      reason: 'Test-only cancellation.',
    }).protocolizationCase;

    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(context, cancelled, request, baseDecision(basis)),
    ).rejects.toMatchObject({
      // The cancellation moved the case one revision past the request's basis,
      // and the basis check is the first thing that notices.
      code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidBasisRevision,
    });

    // The request itself remains readable and unchanged.
    expect(request.reviewBasisRevision).toBe(basis.protocolizationCase.revision);
  });
});
