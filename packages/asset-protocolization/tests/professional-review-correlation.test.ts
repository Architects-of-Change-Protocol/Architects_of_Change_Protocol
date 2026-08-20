import { AttestationType, CredentialType, PrincipalKind } from '@aoc/protocol/claims';

import {
  AssetRequirementKind,
  PROFESSIONAL_REVIEW_ERROR_CODES,
  ProfessionalReviewAction,
  ProtocolizationMaterialKind,
  createInMemoryProfessionalReviewDecisionRepository,
  createInMemoryProfessionalReviewRequestRepository,
  createProfessionalReviewRequest,
  getAssetProfileRequirement,
  recordProfessionalReviewDecision,
} from '@aoc/asset-protocolization';

import { TENANT_A } from './fixtures/test-cases';
import { TEST_CLAIM_ID, sync } from './fixtures/test-declarations';
import {
  TEST_ATTESTATION_ID,
  TEST_ATTESTATION_SHAPE_V1,
  TEST_ATTESTATION_SHAPE_V1_AT_2_0_0,
  TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  TEST_PROFESSIONAL_CREDENTIAL,
  TEST_REVIEWER_HUMAN,
  TEST_REVIEWER_SECOND_HUMAN,
  TEST_SECONDARY_ATTESTATION_REQUIREMENT,
  buildReviewableCase,
  createReviewContext,
  primaryScope,
  reviewedRefs,
  secondaryScope,
} from './fixtures/test-attestation';

/**
 * The requirement ids of every non-Attestation kind the fixture profile
 * declares, so the mixed-kind proofs name kinds that genuinely exist in APV-03
 * rather than invented ones.
 */
const NON_ATTESTATION_REQUIREMENTS: readonly (readonly [string, AssetRequirementKind])[] = [
  ['identity.content.required', AssetRequirementKind.Identity],
  ['declaration.authorship.required', AssetRequirementKind.Declaration],
  ['evidence.supporting.optional', AssetRequirementKind.Evidence],
  ['verification.review.outcomes', AssetRequirementKind.Verification],
];

describe('professional review requirement correlation', () => {
  // ARCHITECTURE PROOF N — mixed kind
  it('refuses every non-Attestation requirement, before touching anything', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    const requests = createInMemoryProfessionalReviewRequestRepository();
    const decisions = createInMemoryProfessionalReviewDecisionRepository();
    const caseBefore = JSON.stringify(basis.protocolizationCase);

    for (const [requirementId, kind] of NON_ATTESTATION_REQUIREMENTS) {
      // The fixture profile really does declare this id, at this kind.
      expect(
        getAssetProfileRequirement(TEST_ATTESTATION_SHAPE_V1, requirementId)?.kind,
      ).toBe(kind);

      context.clock.advance(60);
      expect(() =>
        createProfessionalReviewRequest(context, basis.protocolizationCase, {
          reviewRequestId: `review-request-mixed-${requirementId}`,
          attestationRequirementId: requirementId,
          requestedAttestationType: AttestationType.Human,
          requestedScope: primaryScope(basis.protocolizationCase, { requirementId }),
        }),
      ).toThrow(
        expect.objectContaining({
          code: PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleRequirement,
        }),
      );
    }

    // Case unchanged, revision unchanged, both repositories empty, no
    // attestation material anywhere.
    expect(JSON.stringify(basis.protocolizationCase)).toBe(caseBefore);
    expect(sync(requests.listByCase(TENANT_A, basis.protocolizationCase.caseId))).toEqual([]);
    expect(sync(decisions.listByCase(TENANT_A, basis.protocolizationCase.caseId))).toEqual([]);
    expect(
      basis.protocolizationCase.materials.some(
        (material) => material.kind === ProtocolizationMaterialKind.Attestation,
      ),
    ).toBe(false);
  });

  it('names exactly one requirement, so a mixture of kinds is not representable', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    context.clock.advance(60);

    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-single-requirement',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });

    // A single id, not a list — there is no array to smuggle a second kind into.
    expect(Array.isArray(request.attestationRequirementId)).toBe(false);
    expect(typeof request.attestationRequirementId).toBe('string');
  });

  it('correlates the resulting attestation material to that one requirement only', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-single-correlation',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });

    context.clock.advance(60);
    const { protocolizationCase } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-single-correlation',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
        attestation: {
          attestationId: TEST_ATTESTATION_ID,
          claimRef: TEST_CLAIM_ID,
          statement: 'Test-only statement.',
          materialId: 'material-attestation-single',
        },
      },
    );

    // Only the attestation requirement moved. The evidence, declaration,
    // identity and verification requirements are untouched by an attestation.
    const attestationMaterial = protocolizationCase!.materials.find(
      (material) => material.kind === ProtocolizationMaterialKind.Attestation,
    );
    expect(attestationMaterial!.requirementIds).toEqual([TEST_PRIMARY_ATTESTATION_REQUIREMENT]);
    for (const [requirementId] of NON_ATTESTATION_REQUIREMENTS) {
      expect(attestationMaterial!.requirementIds).not.toContain(requirementId);
    }
  });

  // ARCHITECTURE PROOF O — exact profile version
  it('governs review by the exact pinned version while a later version is catalogued', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);

    // `2.0.0` narrows the same requirement id to Organization, an Organization
    // attester and a CertificationCredential.
    const v2 = getAssetProfileRequirement(
      TEST_ATTESTATION_SHAPE_V1_AT_2_0_0,
      TEST_PRIMARY_ATTESTATION_REQUIREMENT,
    );
    expect(v2).toBeDefined();
    expect(context.catalog.get(TEST_ATTESTATION_SHAPE_V1.profileId, '2.0.0')).toBeDefined();

    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-pinned',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });
    expect(request.profile.profileVersion).toBe('1.0.0');

    // A Human reviewer with a ProfessionalCredential — accepted by `1.0.0`,
    // and rejected by `2.0.0`, which the pinned case never consults.
    context.clock.advance(60);
    const { decision } = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      request,
      {
        decisionId: 'review-decision-pinned',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
      },
    );

    expect(decision.profile.profileVersion).toBe('1.0.0');
    expect(decision.reviewer.kind).toBe(PrincipalKind.Human);
    expect(decision.reviewerCredentialRefs?.[0]?.type).toBe(CredentialType.ProfessionalCredential);
  });

  // ARCHITECTURE PROOF T — multiple attestation requirements
  it('reviews two attestation requirements of one case independently', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    const decisions = createInMemoryProfessionalReviewDecisionRepository();

    context.clock.advance(60);
    const primary = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-multi-primary',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    }).request;

    const secondary = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-multi-secondary',
      attestationRequirementId: TEST_SECONDARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Organization,
      requestedScope: secondaryScope(basis.protocolizationCase),
    }).request;

    context.clock.advance(60);
    const attested = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      primary,
      {
        decisionId: 'review-decision-multi-primary',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
      },
    );

    // The secondary requirement has no attester constraint at all, so an
    // Organization reviewer with no credential is structurally acceptable there
    // and would not be on the primary one.
    context.clock.advance(60);
    const abstained = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      secondary,
      {
        decisionId: 'review-decision-multi-secondary',
        reviewer: TEST_REVIEWER_SECOND_HUMAN,
        action: ProfessionalReviewAction.Abstain,
        reasonCode: 'review.scope-outside-competence',
      },
    );

    decisions.save(attested.decision);
    decisions.save(abstained.decision);

    const stored = sync(decisions.listByCase(TENANT_A, basis.protocolizationCase.caseId));
    expect(stored).toHaveLength(2);
    expect(new Set(stored.map((entry) => entry.attestationRequirementId))).toEqual(
      new Set([TEST_PRIMARY_ATTESTATION_REQUIREMENT, TEST_SECONDARY_ATTESTATION_REQUIREMENT]),
    );
    expect(new Set(stored.map((entry) => entry.action))).toEqual(
      new Set([ProfessionalReviewAction.Attest, ProfessionalReviewAction.Abstain]),
    );
    // There is no case-global professional flag to find.
    expect(Object.keys(basis.protocolizationCase)).not.toContain('professionalReviewed');
    expect(Object.keys(basis.protocolizationCase)).not.toContain('attested');
  });

  // ARCHITECTURE PROOF U — conflicting professionals
  it('preserves conflicting decisions from two reviewers and picks no winner', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    const decisions = createInMemoryProfessionalReviewDecisionRepository();

    context.clock.advance(60);
    const first = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-conflict-a',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    }).request;
    const second = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-conflict-b',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    }).request;

    context.clock.advance(60);
    const attestation = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      first,
      {
        decisionId: 'review-decision-conflict-a',
        reviewer: TEST_REVIEWER_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Attest,
        scope: primaryScope(basis.protocolizationCase),
        reviewedRefs: reviewedRefs(basis) as never,
      },
    );

    context.clock.advance(60);
    const rejection = await recordProfessionalReviewDecision(
      context,
      basis.protocolizationCase,
      second,
      {
        decisionId: 'review-decision-conflict-b',
        reviewer: TEST_REVIEWER_SECOND_HUMAN,
        reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
        action: ProfessionalReviewAction.Reject,
        reasonCode: 'review.unresolved-warning',
      },
    );

    decisions.save(attestation.decision);
    decisions.save(rejection.decision);

    const stored = sync(decisions.listByCase(TENANT_A, basis.protocolizationCase.caseId));
    expect(stored.map((entry) => entry.action)).toEqual([
      ProfessionalReviewAction.Attest,
      ProfessionalReviewAction.Reject,
    ]);
    // Both survive, both are addressable, and nothing anywhere resolves them.
    expect(stored[0]!.reviewer.id).not.toBe(stored[1]!.reviewer.id);
    expect(Object.keys(stored[0]!)).not.toContain('supersededBy');
    expect(Object.keys(stored[1]!)).not.toContain('supersedes');
  });
});
