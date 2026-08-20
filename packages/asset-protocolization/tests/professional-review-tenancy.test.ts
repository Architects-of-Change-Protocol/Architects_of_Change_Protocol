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

import { TENANT_A, TENANT_B } from './fixtures/test-cases';
import { sync } from './fixtures/test-declarations';
import {
  TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  TEST_PROFESSIONAL_CREDENTIAL,
  TEST_REVIEWER_HUMAN,
  buildReviewableCase,
  createReviewContext,
  primaryScope,
  reviewedRefs,
} from './fixtures/test-attestation';

describe('professional review tenant isolation', () => {
  it('lets the owning tenant request review and refuses every other tenant', async () => {
    const owner = createReviewContext({ tenantId: TENANT_A });
    const basis = await buildReviewableCase(owner);
    owner.clock.advance(60);

    const { request } = createProfessionalReviewRequest(owner, basis.protocolizationCase, {
      reviewRequestId: 'review-request-tenancy',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });
    expect(request.tenantId).toBe(TENANT_A);

    const intruder = createReviewContext({ tenantId: TENANT_B, clock: owner.clock });
    expect(() =>
      createProfessionalReviewRequest(intruder, basis.protocolizationCase, {
        reviewRequestId: 'review-request-intruder',
        attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
        requestedAttestationType: AttestationType.Human,
        requestedScope: primaryScope(basis.protocolizationCase),
      }),
    ).toThrow(expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.tenantMismatch }));
  });

  it('refuses to build another tenant’s packet', async () => {
    const owner = createReviewContext({ tenantId: TENANT_A });
    const basis = await buildReviewableCase(owner);
    owner.clock.advance(60);
    const { request } = createProfessionalReviewRequest(owner, basis.protocolizationCase, {
      reviewRequestId: 'review-request-packet-tenancy',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });

    const intruder = createReviewContext({ tenantId: TENANT_B, clock: owner.clock });
    expect(() =>
      buildProfessionalReviewPacket(intruder, basis.protocolizationCase, request, {
        declarations: basis.declarations,
      }),
    ).toThrow(expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.tenantMismatch }));
  });

  it('refuses to record another tenant’s decision', async () => {
    const owner = createReviewContext({ tenantId: TENANT_A });
    const basis = await buildReviewableCase(owner);
    owner.clock.advance(60);
    const { request } = createProfessionalReviewRequest(owner, basis.protocolizationCase, {
      reviewRequestId: 'review-request-decision-tenancy',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });

    const intruder = createReviewContext({ tenantId: TENANT_B, clock: owner.clock });
    await expect(
      recordProfessionalReviewDecision(intruder, basis.protocolizationCase, request, {
        decisionId: 'review-decision-intruder',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Reject,
        reasonCode: 'review.conflict',
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.tenantMismatch });
  });

  it('refuses a request whose tenant does not match the acting tenant, even on its own case', async () => {
    const owner = createReviewContext({ tenantId: TENANT_A });
    const basis = await buildReviewableCase(owner);
    owner.clock.advance(60);
    const { request } = createProfessionalReviewRequest(owner, basis.protocolizationCase, {
      reviewRequestId: 'review-request-mismatched',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });

    const forged = { ...request, tenantId: TENANT_B };
    expect(() =>
      buildProfessionalReviewPacket(owner, basis.protocolizationCase, forged, {}),
    ).toThrow(expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.tenantMismatch }));
  });

  it('hides another tenant’s requests and decisions behind an indistinguishable empty answer', async () => {
    const owner = createReviewContext({ tenantId: TENANT_A });
    const basis = await buildReviewableCase(owner);
    const requests = createInMemoryProfessionalReviewRequestRepository();
    const decisions = createInMemoryProfessionalReviewDecisionRepository();

    owner.clock.advance(60);
    const { request } = createProfessionalReviewRequest(owner, basis.protocolizationCase, {
      reviewRequestId: 'review-request-hidden',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });
    requests.save(request);

    owner.clock.advance(60);
    const { decision } = await recordProfessionalReviewDecision(
      owner,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-hidden',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
      },
    );
    decisions.save(decision);

    // The owner sees everything.
    expect(sync(requests.get(TENANT_A, request.reviewRequestId))).toEqual(request);
    expect(sync(decisions.get(TENANT_A, decision.decisionId))).toEqual(decision);
    expect(sync(decisions.getByRequest(TENANT_A, request.reviewRequestId))).toEqual(decision);

    // Another tenant, holding the exact ids, learns nothing — and cannot tell a
    // hidden record from a missing one.
    expect(sync(requests.get(TENANT_B, request.reviewRequestId))).toBeUndefined();
    expect(sync(requests.exists(TENANT_B, request.reviewRequestId))).toBe(false);
    expect(sync(decisions.get(TENANT_B, decision.decisionId))).toBeUndefined();
    expect(sync(decisions.exists(TENANT_B, decision.decisionId))).toBe(false);
    expect(sync(decisions.getByRequest(TENANT_B, request.reviewRequestId))).toBeUndefined();
    expect(sync(requests.listByCase(TENANT_B, basis.protocolizationCase.caseId))).toEqual([]);
    expect(sync(decisions.listByCase(TENANT_B, basis.protocolizationCase.caseId))).toEqual([]);
    expect(sync(requests.get(TENANT_B, 'never-existed'))).toBeUndefined();
  });

  it('lets one tenant reuse another tenant’s identifiers without collision', async () => {
    const first = createReviewContext({ tenantId: TENANT_A });
    const second = createReviewContext({ tenantId: TENANT_B, clock: first.clock });
    const requests = createInMemoryProfessionalReviewRequestRepository();

    const firstBasis = await buildReviewableCase(first, { caseId: 'case-shared-id' });
    const secondBasis = await buildReviewableCase(second, { caseId: 'case-shared-id' });

    first.clock.advance(60);
    requests.save(
      createProfessionalReviewRequest(first, firstBasis.protocolizationCase, {
        reviewRequestId: 'review-request-shared-id',
        attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
        requestedAttestationType: AttestationType.Human,
        requestedScope: primaryScope(firstBasis.protocolizationCase),
      }).request,
    );
    requests.save(
      createProfessionalReviewRequest(second, secondBasis.protocolizationCase, {
        reviewRequestId: 'review-request-shared-id',
        attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
        requestedAttestationType: AttestationType.Human,
        requestedScope: primaryScope(secondBasis.protocolizationCase),
      }).request,
    );

    expect(sync(requests.get(TENANT_A, 'review-request-shared-id'))?.tenantId).toBe(TENANT_A);
    expect(sync(requests.get(TENANT_B, 'review-request-shared-id'))?.tenantId).toBe(TENANT_B);
  });

  it('requires a tenant to address the repositories at all', () => {
    const requests = createInMemoryProfessionalReviewRequestRepository();
    const decisions = createInMemoryProfessionalReviewDecisionRepository();

    for (const blank of ['', '   ', 'has whitespace']) {
      expect(() => requests.get(blank, 'anything')).toThrow(
        expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidTenant }),
      );
      expect(() => decisions.listByCase(blank, 'anything')).toThrow(
        expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidTenant }),
      );
    }
  });
});
