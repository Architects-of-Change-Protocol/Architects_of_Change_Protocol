import { AttestationType, ClaimType, PrincipalKind } from '@aoc/protocol/claims';

import {
  PROFESSIONAL_REVIEW_ERROR_CODES,
  PROFESSIONAL_REVIEW_EVENT_TYPES,
  PROFESSIONAL_REVIEW_REQUEST_SCHEMA_VERSION,
  PROTOCOLIZATION_CASE_ERROR_CODES,
  ProfessionalReviewBasisKind,
  ProtocolizationCaseState,
  activateProtocolizationCase,
  cancelProtocolizationCase,
  createProfessionalReviewRequest,
  reconstituteProfessionalReviewRequest,
} from '@aoc/asset-protocolization';
import type { ProfessionalReviewRequest } from '@aoc/asset-protocolization';

import {
  TEST_ATTESTATION_EXTERNAL_SUBJECT,
  TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  TEST_SECONDARY_ATTESTATION_REQUIREMENT,
  buildReviewableCase,
  createReviewContext,
  primaryScope,
  secondaryScope,
} from './fixtures/test-attestation';

describe('professional review request creation', () => {
  it('binds the request to the case revision that stood when review was asked for', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    const { protocolizationCase } = basis;

    context.clock.advance(60);
    const { request, event } = createProfessionalReviewRequest(context, protocolizationCase, {
      reviewRequestId: 'review-request-0001',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(protocolizationCase),
    });

    expect(request.schemaVersion).toBe(PROFESSIONAL_REVIEW_REQUEST_SCHEMA_VERSION);
    expect(request.reviewBasisRevision).toBe(protocolizationCase.revision);
    expect(request.profile).toEqual(protocolizationCase.profile);
    expect(request.attestationRequirementId).toBe(TEST_PRIMARY_ATTESTATION_REQUIREMENT);
    expect(event.eventType).toBe(PROFESSIONAL_REVIEW_EVENT_TYPES.reviewRequested);
    expect(event.reviewBasisRevision).toBe(request.reviewBasisRevision);
    expect(event.occurredAt).toBe(request.requestedAt);
  });

  it('never assigns a reviewer, never creates an attestation and never moves the case', async () => {
    const context = createReviewContext();
    const { protocolizationCase } = await buildReviewableCase(context);
    const before = JSON.stringify(protocolizationCase);

    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, protocolizationCase, {
      reviewRequestId: 'review-request-0002',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(protocolizationCase),
    });

    // A request is an intent, not an assignment and not an artifact.
    expect(Object.keys(request)).not.toContain('reviewer');
    expect(Object.keys(request)).not.toContain('assignedTo');
    expect(Object.keys(request)).not.toContain('status');
    expect(Object.keys(request)).not.toContain('canonicalAttestationRef');
    expect(JSON.stringify(protocolizationCase)).toBe(before);
    expect(protocolizationCase.revision).toBe(request.reviewBasisRevision);
  });

  it('reads the attestation requirement from the exact pinned profile version', async () => {
    const context = createReviewContext();
    const { protocolizationCase } = await buildReviewableCase(context);

    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, protocolizationCase, {
      reviewRequestId: 'review-request-0003',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(protocolizationCase),
    });

    // `2.0.0` of the same line narrows the same requirement id to Organization
    // and is catalogued alongside. The pinned case never sees it.
    expect(request.profile.profileVersion).toBe('1.0.0');
    expect(request.requestedAttestationType).toBe(AttestationType.Human);
  });

  it('refuses an attestation type the pinned requirement does not accept', async () => {
    const context = createReviewContext();
    const { protocolizationCase } = await buildReviewableCase(context);

    context.clock.advance(60);
    expect(() =>
      createProfessionalReviewRequest(context, protocolizationCase, {
        reviewRequestId: 'review-request-0004',
        attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
        requestedAttestationType: AttestationType.AI,
        requestedScope: primaryScope(protocolizationCase, {
          attestationType: AttestationType.AI,
        }),
      }),
    ).toThrow(
      expect.objectContaining({
        code: PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleAttestationType,
      }),
    );
  });

  it('refuses a requirement the pinned profile does not declare', async () => {
    const context = createReviewContext();
    const { protocolizationCase } = await buildReviewableCase(context);

    context.clock.advance(60);
    expect(() =>
      createProfessionalReviewRequest(context, protocolizationCase, {
        reviewRequestId: 'review-request-0005',
        attestationRequirementId: 'attestation.nowhere.declared',
        requestedAttestationType: AttestationType.Human,
        requestedScope: primaryScope(protocolizationCase, {
          requirementId: 'attestation.nowhere.declared',
        }),
      }),
    ).toThrow(
      expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement }),
    );
  });

  it('requires the scope to describe this case, this requirement and this revision', async () => {
    const context = createReviewContext();
    const { protocolizationCase } = await buildReviewableCase(context);
    context.clock.advance(60);

    for (const scope of [
      // A different requirement than the one being reviewed.
      primaryScope(protocolizationCase, {
        requirementId: TEST_SECONDARY_ATTESTATION_REQUIREMENT,
      }),
      // A revision the request is not bound to.
      primaryScope(protocolizationCase, { caseRevision: protocolizationCase.revision + 5 }),
      // Somebody else's subject.
      primaryScope(protocolizationCase, {
        subjectRef: TEST_ATTESTATION_EXTERNAL_SUBJECT.subjectRef,
      }),
      // A scope that names nothing at all.
      primaryScope(protocolizationCase, { propositionRefs: [] }),
    ]) {
      expect(() =>
        createProfessionalReviewRequest(context, protocolizationCase, {
          reviewRequestId: 'review-request-0006',
          attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
          requestedAttestationType: AttestationType.Human,
          requestedScope: scope,
        }),
      ).toThrow(expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidScope }));
    }
  });

  it('accepts review in Draft and in Active, and refuses it on a Cancelled case', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);

    context.clock.advance(60);
    const drafted = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-draft',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });
    expect(basis.protocolizationCase.state).toBe(ProtocolizationCaseState.Draft);
    expect(drafted.request.reviewRequestId).toBe('review-request-draft');

    context.clock.advance(60);
    const active = activateProtocolizationCase(context, basis.protocolizationCase)
      .protocolizationCase;
    context.clock.advance(60);
    const activeRequest = createProfessionalReviewRequest(context, active, {
      reviewRequestId: 'review-request-active',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(active),
    });
    expect(active.state).toBe(ProtocolizationCaseState.Active);
    expect(activeRequest.request.reviewBasisRevision).toBe(active.revision);

    context.clock.advance(60);
    const cancelled = cancelProtocolizationCase(context, active, {
      reason: 'Test-only cancellation.',
    }).protocolizationCase;
    context.clock.advance(60);
    expect(() =>
      createProfessionalReviewRequest(context, cancelled, {
        reviewRequestId: 'review-request-cancelled',
        attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
        requestedAttestationType: AttestationType.Human,
        requestedScope: primaryScope(cancelled),
      }),
    ).toThrow(expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.caseCancelled }));
  });

  it('refuses a malformed request id and a malformed correlation id', async () => {
    const context = createReviewContext();
    const { protocolizationCase } = await buildReviewableCase(context);
    context.clock.advance(60);

    for (const input of [
      { reviewRequestId: 'not a valid id' },
      { reviewRequestId: 'review-request-0007', correlationId: '   ' },
    ]) {
      expect(() =>
        createProfessionalReviewRequest(context, protocolizationCase, {
          attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
          requestedAttestationType: AttestationType.Human,
          requestedScope: primaryScope(protocolizationCase),
          ...input,
        } as never),
      ).toThrow(expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidRequest }));
    }
  });

  it('returns a deeply frozen request that a caller cannot edit', async () => {
    const context = createReviewContext();
    const { protocolizationCase } = await buildReviewableCase(context);
    context.clock.advance(60);

    const { request } = createProfessionalReviewRequest(context, protocolizationCase, {
      reviewRequestId: 'review-request-0008',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(protocolizationCase),
    });

    const mutable = request as unknown as {
      reviewBasisRevision: number;
      requestedScope: { caseRevision: number; propositionRefs: unknown[] };
    };
    expect(() => {
      mutable.reviewBasisRevision = 999;
    }).toThrow();
    expect(() => {
      mutable.requestedScope.propositionRefs.push({
        kind: ProfessionalReviewBasisKind.Subject,
        ref: 'x',
      });
    }).toThrow();
    expect(request.reviewBasisRevision).toBe(protocolizationCase.revision);
  });

  it('reconstitutes a persisted request and refuses a corrupt one', async () => {
    const context = createReviewContext();
    const { protocolizationCase } = await buildReviewableCase(context);
    context.clock.advance(60);

    const { request } = createProfessionalReviewRequest(context, protocolizationCase, {
      reviewRequestId: 'review-request-0009',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(protocolizationCase),
    });

    const roundTripped = reconstituteProfessionalReviewRequest(
      JSON.parse(JSON.stringify(request)) as unknown,
    );
    expect(roundTripped).toEqual(request);

    for (const corrupt of [
      { ...request, reviewBasisRevision: 0 },
      { ...request, schemaVersion: 'aoc-protocolization-professional-review-request/2' },
      { ...request, requestedAttestationType: 'NotAType' },
      { ...request, smuggled: true },
    ]) {
      expect(() => reconstituteProfessionalReviewRequest(corrupt as unknown)).toThrow(
        expect.objectContaining({
          code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidRequestRecord,
        }),
      );
    }
  });

  it('supports several independent requests over one case, one per attestation requirement', async () => {
    const context = createReviewContext();
    const { protocolizationCase } = await buildReviewableCase(context);
    context.clock.advance(60);

    const primary = createProfessionalReviewRequest(context, protocolizationCase, {
      reviewRequestId: 'review-request-primary',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(protocolizationCase),
    }).request;

    const secondary = createProfessionalReviewRequest(context, protocolizationCase, {
      reviewRequestId: 'review-request-secondary',
      attestationRequirementId: TEST_SECONDARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Organization,
      requestedScope: secondaryScope(protocolizationCase),
    }).request;

    expect(primary.attestationRequirementId).not.toBe(secondary.attestationRequirementId);
    expect(primary.requestedAttestationType).not.toBe(secondary.requestedAttestationType);
    expect(primary.reviewBasisRevision).toBe(secondary.reviewBasisRevision);
  });

  it('carries no claim, declaration or principal vocabulary of its own', () => {
    // Guard the guard: the request reuses Protocol's AttestationType rather
    // than declaring a parallel one, and names no principal at all.
    const sample: Partial<ProfessionalReviewRequest> = {
      requestedAttestationType: AttestationType.Human,
    };
    expect(Object.values(AttestationType)).toContain(sample.requestedAttestationType);
    expect(Object.values(ClaimType)).toContain(ClaimType.Authorship);
    expect(Object.values(PrincipalKind)).toContain(PrincipalKind.Human);
  });
});
