import { AttestationType, CredentialStatus, CredentialType, PrincipalKind } from '@aoc/protocol/claims';

import {
  PROFESSIONAL_REVIEW_ERROR_CODES,
  ProfessionalReviewAction,
  createProfessionalReviewRequest,
  recordProfessionalReviewDecision,
} from '@aoc/asset-protocolization';
import type { ProfessionalReviewRequest } from '@aoc/asset-protocolization';

import { TENANT_A } from './fixtures/test-cases';
import {
  TEST_ACTIVE_PROFESSIONAL_CREDENTIAL,
  TEST_ATTESTATION_SHAPE_V1,
  TEST_ATTESTATION_OPEN_SHAPE_V1,
  TEST_ATTESTATION_STATUS_SHAPE_V1,
  TEST_IDENTITY_CREDENTIAL,
  TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  TEST_PROFESSIONAL_CREDENTIAL,
  TEST_REVIEWER_HUMAN,
  TEST_REVIEWER_ORGANIZATION,
  TEST_REVIEWER_SYSTEM,
  TEST_REVOKED_PROFESSIONAL_CREDENTIAL,
  buildReviewableCase,
  createReviewContext,
  primaryScope,
  reviewedRefs,
} from './fixtures/test-attestation';
import type { ReviewTestContext, ReviewableCase } from './fixtures/test-attestation';

async function openRequest(
  context: ReviewTestContext,
  options: {
    readonly requestId?: string;
    readonly profileId?: string;
    readonly caseId?: string;
  } = {},
): Promise<{ readonly basis: ReviewableCase; readonly request: ProfessionalReviewRequest }> {
  const basis = await buildReviewableCase(context, {
    ...(options.profileId === undefined ? {} : { profileId: options.profileId }),
    ...(options.caseId === undefined ? {} : { caseId: options.caseId }),
    // The narrower fixture profiles declare no verification requirement.
    runVerification: options.profileId === undefined,
  });
  context.clock.advance(60);
  const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
    reviewRequestId: options.requestId ?? 'review-request-reviewer',
    attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
    requestedAttestationType: AttestationType.Human,
    requestedScope: primaryScope(basis.protocolizationCase),
  });
  return { basis, request };
}

describe('reviewer identity and professional constraints', () => {
  it('keeps the reviewer distinct from the tenant, the subject and the declarant', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context);

    context.clock.advance(60);
    const { decision } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-identity',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
      },
    );

    expect(decision.reviewer.id).not.toBe(TENANT_A);
    expect(decision.reviewer.id).not.toBe(decision.tenantId);
    expect(decision.reviewer.id).not.toBe(
      basis.protocolizationCase.subject.subjectRef.sovereignAssetId,
    );
    expect(decision.reviewer.id).not.toBe(basis.declarations[0]!.declarant.id);
    // Protocol's own principal reference, reused rather than redefined.
    expect(Object.values(PrincipalKind)).toContain(decision.reviewer.kind);
  });

  it('enforces the principal kinds the pinned requirement mechanically states', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, { requestId: 'review-request-kind' });

    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
        decisionId: 'review-decision-wrong-kind',
        reviewer: TEST_REVIEWER_SYSTEM,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Reject,
        reasonCode: 'review.conflict',
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidReviewer });
  });

  it('requires a credential reference when the pinned requirement asks for one', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, {
      requestId: 'review-request-credential-missing',
    });

    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
        decisionId: 'review-decision-credential-missing',
        reviewer: TEST_REVIEWER_HUMAN,
        action: ProfessionalReviewAction.Abstain,
        reasonCode: 'review.conflict',
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.credentialRequired });
  });

  it('refuses a credential of a type the pinned requirement does not accept', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, {
      requestId: 'review-request-credential-type',
    });

    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
        decisionId: 'review-decision-credential-type',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_IDENTITY_CREDENTIAL],
        action: ProfessionalReviewAction.Abstain,
        reasonCode: 'review.conflict',
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleCredential });
  });

  it('enforces a declared status only where the profile names acceptable ones', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, {
      requestId: 'review-request-status',
      profileId: TEST_ATTESTATION_STATUS_SHAPE_V1.profileId,
      caseId: 'case-review-status',
    });

    // A credential that declares no status at all cannot satisfy a constraint
    // that names acceptable statuses — absence is never read as "acceptable".
    context.clock.advance(60);
    await expect(
      recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
        decisionId: 'review-decision-status-absent',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Abstain,
        reasonCode: 'review.conflict',
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleCredential });

    // A declared status the profile does not accept is refused too.
    await expect(
      recordProfessionalReviewDecision(context, basis.protocolizationCase, request, {
        decisionId: 'review-decision-status-revoked',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_REVOKED_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Abstain,
        reasonCode: 'review.conflict',
      }),
    ).rejects.toMatchObject({ code: PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleCredential });

    // And a declared, accepted status passes the *structural* check — which is
    // all it is. Nothing resolved the credential or checked revocation.
    const { decision } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-status-active',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_ACTIVE_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Abstain,
        reasonCode: 'review.conflict',
      },
    );
    expect(decision.reviewerCredentialRefs?.[0]?.status?.status).toBe(CredentialStatus.Active);
  });

  // HARD CREDENTIAL TEST
  it('never turns a credential reference into standing, validity or authority', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, {
      requestId: 'review-request-no-authority',
    });

    context.clock.advance(60);
    const { decision } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-no-authority',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
      },
    );

    for (const forbidden of [
      'authority',
      'authorized',
      'authorityVerified',
      'professionalStanding',
      'standing',
      'credentialValid',
      'verified',
      'licensed',
      'eligible',
    ]) {
      expect(Object.keys(decision)).not.toContain(forbidden);
    }
    // The reference is stored exactly as presented, nothing more.
    expect(decision.reviewerCredentialRefs).toEqual([TEST_PROFESSIONAL_CREDENTIAL]);
    expect(decision.reviewerCredentialRefs![0]!.status).toBeUndefined();
  });

  it('enforces nothing mechanical where the profile states nothing mechanical', async () => {
    const context = createReviewContext();
    const { basis, request } = await openRequest(context, {
      requestId: 'review-request-open',
      profileId: TEST_ATTESTATION_OPEN_SHAPE_V1.profileId,
      caseId: 'case-review-open',
    });

    context.clock.advance(60);
    const { decision } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-open',
        reviewer: TEST_REVIEWER_ORGANIZATION,
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
      },
    );

    expect(decision.reviewer.kind).toBe(PrincipalKind.Organization);
    expect(decision.reviewerCredentialRefs).toBeUndefined();
  });

  it('does not mechanically enforce the opaque role token, and does not pretend to', () => {
    const requirement = TEST_ATTESTATION_SHAPE_V1.requirements.find(
      (entry) => entry.id === TEST_PRIMARY_ATTESTATION_REQUIREMENT,
    );
    // The profile states a role. Protocol offers no structurally comparable
    // field on a principal reference, so APV-08 carries it to a human rather
    // than inventing a match — and `TEST_REVIEWER_HUMAN` carries no role at all.
    expect((requirement as { attester?: { acceptedRoles?: readonly string[] } }).attester
      ?.acceptedRoles).toEqual(['test.role.reviewer']);
    expect(Object.keys(TEST_REVIEWER_HUMAN)).not.toContain('role');
    expect(Object.values(CredentialType)).toContain(CredentialType.ProfessionalCredential);
  });
});
