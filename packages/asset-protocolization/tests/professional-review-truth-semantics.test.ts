import { AttestationType, VerificationStatus } from '@aoc/protocol/claims';

import {
  PROFESSIONAL_REVIEW_ACTIONS,
  PROFESSIONAL_REVIEW_EVENT_TYPES,
  ProfessionalReviewAction,
  ProtocolizationCaseState,
  ProtocolizationMaterialKind,
  ProtocolizationRequirementMaterialStatus,
  VERIFICATION_CHECK_OUTCOMES,
  VerificationCheckOutcome,
  buildProfessionalReviewPacket,
  createProfessionalReviewRequest,
  recordProfessionalReviewDecision,
} from '@aoc/asset-protocolization';

import { TEST_CLAIM_ID } from './fixtures/test-declarations';
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
import type { ReviewTestContext, ReviewableCase } from './fixtures/test-attestation';

async function openRequest(context: ReviewTestContext, id: string) {
  const basis = await buildReviewableCase(context);
  context.clock.advance(60);
  const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
    reviewRequestId: id,
    attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
    requestedAttestationType: AttestationType.Human,
    requestedScope: primaryScope(basis.protocolizationCase),
  });
  return { basis, request } as { basis: ReviewableCase; request: typeof request };
}

describe('professional review truth semantics', () => {
  // ARCHITECTURE PROOF K / HARD STATE-MACHINE BOUNDARY TEST
  it('Attest adds no READY and no protocolization anywhere', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, 'review-request-not-ready');

    context.clock.advance(60);
    const transition = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-not-ready',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
        attestation: {
          attestationId: TEST_ATTESTATION_ID,
          claimRef: TEST_CLAIM_ID,
          statement: 'Test-only statement.',
          materialId: 'material-attestation-not-ready',
        },
      },
    );

    const after = transition.protocolizationCase!;
    expect(after.state).toBe(ProtocolizationCaseState.Draft);
    expect(Object.values(ProtocolizationCaseState)).toEqual(['Draft', 'Active', 'Cancelled']);
    for (const forbidden of [
      'Ready',
      'READY',
      'Rejected',
      'MoreEvidenceRequired',
      'EvidencePending',
      'VerificationPending',
      'ReviewPending',
      'Protocolizing',
      'Protocolized',
      'Suspended',
      'Superseded',
      'Archived',
    ]) {
      expect(Object.values<string>(ProtocolizationCaseState)).not.toContain(forbidden);
    }
    for (const forbidden of ['ready', 'readiness', 'protocolized', 'approved', 'satisfied']) {
      expect(Object.keys(after)).not.toContain(forbidden);
      expect(Object.keys(transition.decision)).not.toContain(forbidden);
    }
    // Material present is not requirement satisfied.
    expect(Object.values(ProtocolizationRequirementMaterialStatus)).toEqual([
      'Pending',
      'MaterialPresent',
    ]);
  });

  // ARCHITECTURE PROOFS L and M
  it('Reject adds no Rejected state and RequestMoreEvidence adds no MoreEvidenceRequired', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, 'review-request-no-state');

    context.clock.advance(60);
    const rejected = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-no-state',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Reject,
        reasonCode: 'review.unresolved-warning',
      },
    );

    expect(rejected.protocolizationCase).toBeUndefined();
    expect(basis.protocolizationCase.state).toBe(ProtocolizationCaseState.Draft);
    expect(Object.values<string>(ProtocolizationCaseState)).not.toContain('Rejected');
    expect(Object.values<string>(ProtocolizationCaseState)).not.toContain('MoreEvidenceRequired');
  });

  // HARD CANONICAL-ATTESTATION TEST
  it('keeps a review decision structurally distinct from a CanonicalAttestation', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, 'review-request-distinct');

    context.clock.advance(60);
    const { decision, attestation } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-distinct',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
        attestation: {
          attestationId: TEST_ATTESTATION_ID,
          claimRef: TEST_CLAIM_ID,
          statement: 'Test-only statement.',
          materialId: 'material-attestation-distinct',
        },
      },
    );

    // Different identities, different shapes, different owners.
    expect(decision.decisionId).not.toBe(attestation!.id);
    expect(Object.keys(decision)).not.toContain('claimRef');
    expect(Object.keys(decision)).not.toContain('attester');
    expect(Object.keys(attestation!)).not.toContain('action');
    expect(Object.keys(attestation!)).not.toContain('reviewBasisRevision');
    expect(Object.keys(attestation!)).not.toContain('decisionId');
    // The case carries Protocol's identifier, never the vertical one.
    const material = decision.attestationMaterialId;
    expect(material).toBe('material-attestation-distinct');
    expect(decision.canonicalAttestationRef).toBe(attestation!.id);
  });

  it('leaves Protocol’s VerificationStatus and the APV-07 outcomes untouched', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, 'review-request-untouched');

    const packet = buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
      evidenceReceipts: basis.receipts,
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });

    // Protocol's own enum is unchanged and holds no review vocabulary.
    expect(Object.values(VerificationStatus)).toEqual(['Pending', 'Verified', 'Failed']);
    for (const action of PROFESSIONAL_REVIEW_ACTIONS) {
      expect(Object.values<string>(VerificationStatus)).not.toContain(action);
      expect(Object.values<string>(AttestationType)).not.toContain(action);
      expect(Object.values<string>(VerificationCheckOutcome)).not.toContain(action);
    }
    // And the APV-07 vocabulary is still exactly five members, all visible.
    expect(VERIFICATION_CHECK_OUTCOMES).toHaveLength(5);
    expect(new Set(packet.automatedChecks.map((entry) => entry.outcome)).size).toBe(5);
  });

  // ARCHITECTURE PROOFS G, H, I, J
  it('shows Warning, ManualReview, Unavailable and Fail without blocking or reinterpreting', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, 'review-request-visibility');

    const packet = buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
      evidenceReceipts: basis.receipts,
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });

    const byOutcome = (outcome: VerificationCheckOutcome) =>
      packet.automatedChecks.filter((entry) => entry.outcome === outcome);

    // Present, each as itself.
    expect(byOutcome(VerificationCheckOutcome.Warning)).toHaveLength(1);
    expect(byOutcome(VerificationCheckOutcome.ManualReview)).toHaveLength(1);
    expect(byOutcome(VerificationCheckOutcome.Unavailable)).toHaveLength(1);
    expect(byOutcome(VerificationCheckOutcome.Fail)).toHaveLength(1);
    expect(byOutcome(VerificationCheckOutcome.Pass)).toHaveLength(1);

    // A ManualReview did not block packet construction — that is what it asks
    // for — and an Unavailable was not reinterpreted as a Fail.
    expect(packet.exceptions.manualReviewCheckExecutionIds).toHaveLength(1);
    expect(packet.exceptions.unavailableCheckExecutionIds).toHaveLength(1);
    expect(packet.exceptions.failedCheckExecutionIds).toHaveLength(1);
    expect(packet.exceptions.unavailableCheckExecutionIds[0]).not.toBe(
      packet.exceptions.failedCheckExecutionIds[0],
    );

    // A Fail did not force a rejection: the professional still decides.
    context.clock.advance(60);
    const { decision } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-visibility',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
      },
    );
    expect(decision.action).toBe(ProfessionalReviewAction.Attest);
  });

  // §111 — a professional decision does not retroactively change APV-07
  it('never rewrites a Fail because a professional attested', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, 'review-request-no-retro');
    const failing = basis.verificationResults.find(
      (result) => result.outcome === VerificationCheckOutcome.Fail,
    );
    expect(failing).toBeDefined();

    context.clock.advance(60);
    await recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
      decisionId: 'review-decision-no-retro',
      reviewer: TEST_REVIEWER_HUMAN,
      reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
      action: ProfessionalReviewAction.Attest,
      scope: primaryScope(basis.protocolizationCase),
      reviewedRefs: reviewedRefs(basis) as never,
    });

    // Both facts stand: the automated check failed, and a professional
    // attested within a narrower scope. That tension is information.
    expect(failing!.outcome).toBe(VerificationCheckOutcome.Fail);
  });

  it('emits only APV-08 workflow events, and none that name a conclusion', () => {
    expect(Object.values(PROFESSIONAL_REVIEW_EVENT_TYPES)).toEqual([
      'ProfessionalReviewRequested',
      'ProfessionalReviewDecisionRecorded',
      'ProfessionalAttestationRecorded',
    ]);
    for (const forbidden of [
      'CaseApproved',
      'CaseReady',
      'AssetVerified',
      'AssetProtocolized',
      'RequirementSatisfied',
      'OwnershipVerified',
      'ProfessionalApproved',
    ]) {
      expect(Object.values<string>(PROFESSIONAL_REVIEW_EVENT_TYPES)).not.toContain(forbidden);
    }
  });

  it('keeps reviewer notes, scope prose and credentials out of every event payload', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, 'review-request-event-payload');

    context.clock.advance(60);
    const transition = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-event-payload',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
        note: 'Sensitive test-only note that must not fan out.',
        attestation: {
          attestationId: TEST_ATTESTATION_ID,
          claimRef: TEST_CLAIM_ID,
          statement: 'Test-only statement.',
          materialId: 'material-attestation-event',
        },
      },
    );

    for (const event of [
      transition.decisionEvent,
      transition.attestationEvent!,
    ] as unknown as readonly Record<string, unknown>[]) {
      const serialized = JSON.stringify(event);
      expect(serialized).not.toContain('Sensitive test-only note');
      expect(serialized).not.toContain('Test-only statement.');
      expect(Object.keys(event)).not.toContain('note');
      expect(Object.keys(event)).not.toContain('scope');
      expect(Object.keys(event)).not.toContain('reviewerCredentialRefs');
      expect(Object.keys(event)).not.toContain('statement');
      expect(Object.keys(event)).not.toContain('reviewedRefs');
    }
  });

  it('adds no attestation material for any non-attesting action', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);

    for (const [index, action] of [
      ProfessionalReviewAction.Reject,
      ProfessionalReviewAction.RequestMoreEvidence,
      ProfessionalReviewAction.Abstain,
    ].entries()) {
      context.clock.advance(60);
      const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
        reviewRequestId: `review-request-no-material-${index}`,
        attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
        requestedAttestationType: AttestationType.Human,
        requestedScope: primaryScope(basis.protocolizationCase),
      });

      const transition = await recordProfessionalReviewDecision(
        context,
        basis.protocolizationCase,
        request,
        {
          decisionId: `review-decision-no-material-${index}`,
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
        },
      );

      expect(transition.protocolizationCase).toBeUndefined();
      expect(transition.caseEvent).toBeUndefined();
      expect(transition.attestation).toBeUndefined();
      expect(transition.attestationEvent).toBeUndefined();
      expect(transition.decision.attestationMaterialId).toBeUndefined();
    }

    expect(
      basis.protocolizationCase.materials.some(
        (material) => material.kind === ProtocolizationMaterialKind.Attestation,
      ),
    ).toBe(false);
  });
});
