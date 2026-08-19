import { AttestationType } from '@aoc/protocol/claims';

import {
  PROFESSIONAL_REVIEW_ERROR_CODES,
  PROFESSIONAL_REVIEW_PACKET_SCHEMA_VERSION,
  ProfessionalReviewParticipantRole,
  VERIFICATION_CHECK_OUTCOMES,
  VerificationCheckOutcome,
  buildProfessionalReviewPacket,
  createProfessionalReviewRequest,
  intakeProtocolizationEvidence,
} from '@aoc/asset-protocolization';
import type { ProfessionalReviewPacket } from '@aoc/asset-protocolization';

import { EvidenceIntakePathway } from '@aoc/asset-protocolization';

import { TENANT_B } from './fixtures/test-cases';
import { TEST_CATEGORY_DOCUMENT, TEST_SECOND_EVIDENCE_ID } from './fixtures/test-evidence';
import {
  TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  TEST_REVIEW_VERIFICATION_REQUIREMENT,
  TEST_SECONDARY_ATTESTATION_REQUIREMENT,
  buildReviewableCase,
  createReviewContext,
  primaryScope,
} from './fixtures/test-attestation';
import type { ReviewTestContext, ReviewableCase } from './fixtures/test-attestation';

async function openReview(
  context: ReviewTestContext,
  options: { readonly requestId?: string; readonly caseId?: string } = {},
): Promise<{ readonly basis: ReviewableCase; readonly packet: ProfessionalReviewPacket }> {
  const basis = await buildReviewableCase(context, {
    ...(options.caseId === undefined ? {} : { caseId: options.caseId }),
  });
  context.clock.advance(60);
  const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
    reviewRequestId: options.requestId ?? 'review-request-packet',
    attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
    requestedAttestationType: AttestationType.Human,
    requestedScope: primaryScope(basis.protocolizationCase),
  });
  const packet = buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
    evidenceReceipts: basis.receipts,
    declarations: basis.declarations,
    verificationResults: basis.verificationResults,
  });
  return { basis, packet };
}

describe('professional review packet', () => {
  it('projects every frozen section of the review basis', async () => {
    const context = createReviewContext();
    const { basis, packet } = await openReview(context);

    expect(packet.schemaVersion).toBe(PROFESSIONAL_REVIEW_PACKET_SCHEMA_VERSION);
    expect(packet.reviewBasisRevision).toBe(basis.protocolizationCase.revision);

    // SUBJECT — the case's own binding, never the reviewer's and never the
    // declarant's.
    expect(packet.subject.subjectRef).toEqual(basis.protocolizationCase.subject.subjectRef);
    expect(packet.subject.caseState).toBe(basis.protocolizationCase.state);

    // PARTICIPANTS — only what the workflow genuinely observed.
    expect(packet.participants).toHaveLength(1);
    expect(packet.participants[0]!.roles).toEqual([ProfessionalReviewParticipantRole.Declarant]);
    expect(packet.participants[0]!.principal).toEqual(basis.declarations[0]!.declarant);

    // DECLARATIONS — APV-06 records, reused.
    expect(packet.declarations.map((entry) => entry.declarationId)).toEqual(
      basis.declarations.map((record) => record.declarationId),
    );
    expect(packet.declarations[0]!.claimRef).toBe(basis.declarations[0]!.claimRef);

    // EVIDENCE — APV-05 receipts, reused.
    expect(packet.evidence.map((entry) => entry.intakeId)).toEqual(
      basis.receipts.map((receipt) => receipt.intakeId),
    );

    // AUTOMATED CHECKS — APV-07 results, reused.
    expect(packet.automatedChecks).toHaveLength(basis.verificationResults.length);

    // EXCEPTIONS — a projection over the above.
    expect(packet.exceptions.failedCheckExecutionIds.length).toBeGreaterThan(0);

    // ATTESTATION REQUESTED and SCOPE — explicit, never "approve the case".
    expect(packet.attestationRequested.requirementId).toBe(TEST_PRIMARY_ATTESTATION_REQUIREMENT);
    expect(packet.attestationRequested.requestedAttestationType).toBe(AttestationType.Human);
    expect(packet.scope.requirementId).toBe(TEST_PRIMARY_ATTESTATION_REQUIREMENT);
    expect(packet.scope.propositionRefs.length).toBeGreaterThan(0);
  });

  it('carries the profile’s attester constraint verbatim, uninterpreted', async () => {
    const context = createReviewContext();
    const { packet } = await openReview(context);

    // The opaque role token travels to the human who can read it. Nothing in
    // production code branches on it.
    expect(packet.attestationRequested.attester?.acceptedRoles).toEqual(['test.role.reviewer']);
    expect(packet.attestationRequested.jurisdictions).toEqual([{ code: 'GLOBAL' }]);
    expect(packet.attestationRequested.attester?.jurisdictions).toEqual([{ code: 'GLOBAL' }]);
    expect(packet.attestationRequested.attester?.credential?.acceptedTypes).toEqual([
      'ProfessionalCredential',
    ]);
  });

  it('is deterministic: rebuilding the same basis produces the same packet', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-deterministic',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });

    const first = buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
      evidenceReceipts: basis.receipts,
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });

    // The clock moves a long way between the two builds. A packet carrying an
    // instant of its own would differ here; this one must not.
    context.clock.advance(86_400);
    const second = buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
      evidenceReceipts: [...basis.receipts].reverse(),
      declarations: [...basis.declarations].reverse(),
      verificationResults: [...basis.verificationResults].reverse(),
    });

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(Object.keys(first)).not.toContain('builtAt');
  });

  it('is deeply frozen, and mutating it changes no stored record', async () => {
    const context = createReviewContext();
    const { basis, packet } = await openReview(context);

    const mutable = packet as unknown as {
      declarations: unknown[];
      automatedChecks: { outcome: string }[];
      exceptions: { failedCheckExecutionIds: string[] };
    };
    expect(() => mutable.declarations.push({})).toThrow();
    expect(() => {
      mutable.automatedChecks[0]!.outcome = VerificationCheckOutcome.Pass;
    }).toThrow();
    expect(() => mutable.exceptions.failedCheckExecutionIds.push('smuggled')).toThrow();

    expect(basis.declarations[0]!.statement).toBe('Test-only declaration statement.');
    expect(packet.declarations).toHaveLength(1);
  });

  it('shows every APV-07 outcome, unreduced and uncollapsed', async () => {
    const context = createReviewContext();
    const { packet } = await openReview(context);

    const outcomes = packet.automatedChecks.map((entry) => entry.outcome);
    for (const outcome of VERIFICATION_CHECK_OUTCOMES) {
      expect(outcomes).toContain(outcome);
    }

    // No aggregate, no score, no verdict, no recommendation anywhere.
    for (const forbidden of [
      'verdict',
      'score',
      'passed',
      'recommendation',
      'readiness',
      'eligible',
      'suggestedAction',
    ]) {
      expect(Object.keys(packet)).not.toContain(forbidden);
    }
  });

  it('projects exceptions from the outcomes rather than re-deciding them', async () => {
    const context = createReviewContext();
    const { packet } = await openReview(context);

    const idsWith = (outcome: VerificationCheckOutcome): readonly string[] =>
      packet.automatedChecks.filter((entry) => entry.outcome === outcome).map((e) => e.executionId);

    expect(packet.exceptions.failedCheckExecutionIds).toEqual(
      idsWith(VerificationCheckOutcome.Fail),
    );
    expect(packet.exceptions.warningCheckExecutionIds).toEqual(
      idsWith(VerificationCheckOutcome.Warning),
    );
    expect(packet.exceptions.manualReviewCheckExecutionIds).toEqual(
      idsWith(VerificationCheckOutcome.ManualReview),
    );
    expect(packet.exceptions.unavailableCheckExecutionIds).toEqual(
      idsWith(VerificationCheckOutcome.Unavailable),
    );
    // Every declared check ran, so nothing is outstanding.
    expect(packet.exceptions.unexecutedChecks).toEqual([]);
  });

  it('reports the attestation requirements as still pending material', async () => {
    const context = createReviewContext();
    const { packet } = await openReview(context);

    // Both attestation requirements are pending: professional review has been
    // requested, not performed, and requesting it satisfies nothing.
    expect(packet.exceptions.pendingMaterialRequirementIds).toContain(
      TEST_PRIMARY_ATTESTATION_REQUIREMENT,
    );
    expect(packet.exceptions.pendingMaterialRequirementIds).toContain(
      TEST_SECONDARY_ATTESTATION_REQUIREMENT,
    );
  });

  it('does not absorb material added after the review basis revision', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    const atBasis = basis.protocolizationCase;

    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, atBasis, {
      reviewRequestId: 'review-request-frozen-basis',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(atBasis),
    });

    // Later evidence, on the same case, after the request was raised.
    context.clock.advance(60);
    const later = intakeProtocolizationEvidence(context, atBasis, {
      intakeId: 'intake-review-late',
      caseId: atBasis.caseId,
      materialId: 'material-evidence-late',
      categoryId: TEST_CATEGORY_DOCUMENT,
      pathway: EvidenceIntakePathway.Reference,
      evidenceRef: TEST_SECOND_EVIDENCE_ID,
      requirementIds: ['evidence.supporting.optional'],
    } as never);

    expect(later.protocolizationCase.revision).toBe(atBasis.revision + 1);

    // Handed both receipts, the packet for the old basis keeps only the one
    // that was part of it.
    const packet = buildProfessionalReviewPacket(context, atBasis, request, {
      evidenceReceipts: [...basis.receipts, later.receipt],
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });
    expect(packet.evidence.map((entry) => entry.intakeId)).toEqual(['intake-review-0001']);

    // And the packet cannot be rebuilt against the moved-on case at all: the
    // basis is fixed, so silently projecting a later state is not available.
    expect(() =>
      buildProfessionalReviewPacket(context, later.protocolizationCase, request, {
        evidenceReceipts: [...basis.receipts, later.receipt],
      }),
    ).toThrow(
      expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidBasisRevision }),
    );
  });

  it('marks a result that evaluated an older revision as not current, and keeps it', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    const atBasis = basis.protocolizationCase;

    context.clock.advance(60);
    const later = intakeProtocolizationEvidence(context, atBasis, {
      intakeId: 'intake-review-stale',
      caseId: atBasis.caseId,
      materialId: 'material-evidence-stale',
      categoryId: TEST_CATEGORY_DOCUMENT,
      pathway: EvidenceIntakePathway.Reference,
      evidenceRef: TEST_SECOND_EVIDENCE_ID,
      requirementIds: ['evidence.supporting.optional'],
    } as never);

    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, later.protocolizationCase, {
      reviewRequestId: 'review-request-stale-results',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(later.protocolizationCase),
    });

    const packet = buildProfessionalReviewPacket(context, later.protocolizationCase, request, {
      evidenceReceipts: [...basis.receipts, later.receipt],
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });

    // The results all evaluated the earlier revision. They stay visible, and
    // the professional can see both numbers.
    expect(packet.automatedChecks).toHaveLength(basis.verificationResults.length);
    for (const entry of packet.automatedChecks) {
      expect(entry.evaluatedCaseRevision).toBe(atBasis.revision);
      expect(entry.currentForReviewBasis).toBe(false);
    }
    expect(packet.reviewBasisRevision).toBe(atBasis.revision + 1);
    expect(packet.exceptions.staleCheckExecutionIds).toEqual(
      packet.automatedChecks.map((entry) => entry.executionId),
    );
  });

  it('selects the latest result at or before the basis for each requirement/check pair', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    const results = basis.verificationResults;
    const first = results[0]!;

    // A re-run of the same check, recorded against a *later* revision than the
    // basis. It must not appear in the basis packet.
    const future = {
      ...first,
      executionId: 'execution-review-future',
      evaluatedCaseRevision: first.evaluatedCaseRevision + 5,
      outcome: VerificationCheckOutcome.Pass,
    };

    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-latest-rule',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });

    const packet = buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
      evidenceReceipts: basis.receipts,
      declarations: basis.declarations,
      verificationResults: [...results, future],
    });

    expect(packet.automatedChecks.map((entry) => entry.executionId)).not.toContain(
      'execution-review-future',
    );
    expect(packet.automatedChecks).toHaveLength(results.length);
    expect(
      packet.automatedChecks.find((entry) => entry.checkId === first.checkId)?.executionId,
    ).toBe(first.executionId);
    expect(packet.automatedChecks[0]!.requirementId).toBe(TEST_REVIEW_VERIFICATION_REQUIREMENT);
  });

  it('mutates nothing it reads', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context);
    const before = {
      protocolizationCase: JSON.stringify(basis.protocolizationCase),
      receipts: JSON.stringify(basis.receipts),
      declarations: JSON.stringify(basis.declarations),
      results: JSON.stringify(basis.verificationResults),
    };

    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-readonly',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });
    buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
      evidenceReceipts: basis.receipts,
      declarations: basis.declarations,
      verificationResults: basis.verificationResults,
    });

    expect(JSON.stringify(basis.protocolizationCase)).toBe(before.protocolizationCase);
    expect(JSON.stringify(basis.receipts)).toBe(before.receipts);
    expect(JSON.stringify(basis.declarations)).toBe(before.declarations);
    expect(JSON.stringify(basis.verificationResults)).toBe(before.results);
  });

  it('refuses inputs belonging to another tenant or another case', async () => {
    const context = createReviewContext();
    const basis = await buildReviewableCase(context, { caseId: 'case-packet-a' });
    const other = await buildReviewableCase(context, { caseId: 'case-packet-b' });

    context.clock.advance(60);
    const { request } = createProfessionalReviewRequest(context, basis.protocolizationCase, {
      reviewRequestId: 'review-request-foreign-inputs',
      attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      requestedAttestationType: AttestationType.Human,
      requestedScope: primaryScope(basis.protocolizationCase),
    });

    expect(() =>
      buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
        declarations: other.declarations,
      }),
    ).toThrow(expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidInputs }));

    const foreign = basis.declarations.map((record) => ({ ...record, tenantId: TENANT_B }));
    expect(() =>
      buildProfessionalReviewPacket(context, basis.protocolizationCase, request, {
        declarations: foreign,
      }),
    ).toThrow(expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.tenantMismatch }));
  });
});
