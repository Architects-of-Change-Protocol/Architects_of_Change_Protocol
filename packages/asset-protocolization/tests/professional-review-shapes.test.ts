import { AttestationType, PrincipalKind } from '@aoc/protocol/claims';

import {
  PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION,
  PROFESSIONAL_REVIEW_ERROR_CODES,
  PROFESSIONAL_REVIEW_VALIDATION_CODES,
  ProfessionalReviewAction,
  ProfessionalReviewBasisKind,
  ProfessionalReviewParticipantRole,
  isProfessionalReviewAction,
  isProfessionalReviewBasisKind,
  isValidProfessionalReviewDecision,
  isValidProfessionalReviewDecisionId,
  isValidProfessionalReviewReasonCode,
  isValidProfessionalReviewRequestId,
  isValidProfessionalReviewScope,
  reconstituteProfessionalReviewDecision,
  validateProfessionalReviewDecision,
  validateProfessionalReviewScope,
} from '@aoc/asset-protocolization';
import type { ProfessionalReviewDecision } from '@aoc/asset-protocolization';

import {
  TEST_ATTESTATION_ID,
  TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  TEST_PROFESSIONAL_CREDENTIAL,
  TEST_REVIEWER_HUMAN,
} from './fixtures/test-attestation';

const SUBJECT_REF = { sovereignAssetId: 'aoc:sovereign-asset:11111111-2222-4333-8444-555555555555' };

const SCOPE = {
  requirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  attestationType: AttestationType.Human,
  subjectRef: SUBJECT_REF,
  caseRevision: 4,
  propositionRefs: [
    { kind: ProfessionalReviewBasisKind.ClaimRecord, ref: 'aoc:claim:0001' },
  ],
};

const DECISION: ProfessionalReviewDecision = {
  schemaVersion: PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION,
  decisionId: 'review-decision-shape',
  reviewRequestId: 'review-request-shape',
  tenantId: 'tenant-a',
  caseId: 'case-shape',
  profile: { profileId: 'test.attestation.v1', profileVersion: '1.0.0' },
  attestationRequirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
  reviewer: TEST_REVIEWER_HUMAN,
  reviewerCredentialRefs: [TEST_PROFESSIONAL_CREDENTIAL],
  action: ProfessionalReviewAction.Attest,
  scope: SCOPE,
  reviewBasisRevision: 4,
  reviewedRefs: [{ kind: ProfessionalReviewBasisKind.DeclarationRecord, ref: 'declaration-0001' }],
  decidedAt: '2026-01-01T00:00:00.000Z',
} as ProfessionalReviewDecision;

describe('professional review shapes', () => {
  it('validates identifiers under the grammars they belong to', () => {
    // Instance identifiers: APV-04's grammar.
    expect(isValidProfessionalReviewRequestId('review-request-0001')).toBe(true);
    expect(isValidProfessionalReviewDecisionId('aoc:review-decision:0001')).toBe(true);
    expect(isValidProfessionalReviewRequestId('has whitespace')).toBe(false);
    expect(isValidProfessionalReviewDecisionId('')).toBe(false);

    // Reason codes: APV-03's dotted-token grammar.
    expect(isValidProfessionalReviewReasonCode('review.insufficient-evidence')).toBe(true);
    expect(isValidProfessionalReviewReasonCode('Review.Insufficient')).toBe(false);
    expect(isValidProfessionalReviewReasonCode('a sentence about the evidence')).toBe(false);
  });

  it('recognizes only the four actions and the eight basis kinds', () => {
    for (const action of Object.values(ProfessionalReviewAction)) {
      expect(isProfessionalReviewAction(action)).toBe(true);
    }
    for (const bogus of ['Approve', 'READY', 'Pass', 'true', '', 1, null, undefined]) {
      expect(isProfessionalReviewAction(bogus)).toBe(false);
    }
    for (const kind of Object.values(ProfessionalReviewBasisKind)) {
      expect(isProfessionalReviewBasisKind(kind)).toBe(true);
    }
    expect(isProfessionalReviewBasisKind('Observation')).toBe(false);
    expect(Object.values(ProfessionalReviewParticipantRole)).toEqual(['Declarant']);
  });

  it('refuses a scope that constrains nothing', () => {
    expect(isValidProfessionalReviewScope(SCOPE)).toBe(true);
    for (const broken of [
      { ...SCOPE, propositionRefs: [] },
      { ...SCOPE, caseRevision: 0 },
      { ...SCOPE, attestationType: 'NotAType' },
      { ...SCOPE, requirementId: 'Not A Token' },
      { ...SCOPE, subjectRef: {} },
      { ...SCOPE, scopeStatement: '' },
      { ...SCOPE, limitations: [] },
      { ...SCOPE, smuggled: true },
    ]) {
      expect(isValidProfessionalReviewScope(broken)).toBe(false);
    }
    expect(validateProfessionalReviewScope('not an object').reasons).toEqual([
      PROFESSIONAL_REVIEW_VALIDATION_CODES.notAnObject,
    ]);
  });

  it('treats a present-but-undefined optional as invalid rather than absent', () => {
    expect(isValidProfessionalReviewDecision({ ...DECISION, note: undefined })).toBe(false);
    expect(isValidProfessionalReviewDecision({ ...DECISION, reasonCode: undefined })).toBe(false);
    expect(isValidProfessionalReviewDecision(DECISION)).toBe(true);
  });

  it('enforces the action-conditioned shape of a persisted decision', () => {
    // Attest without a scope.
    const { scope, ...unscoped } = DECISION;
    expect(validateProfessionalReviewDecision(unscoped).reasons).toContain(
      PROFESSIONAL_REVIEW_VALIDATION_CODES.actionFieldMissing,
    );
    expect(scope).toBeDefined();

    // Reject carrying a scope, or an attestation reference.
    const rejected = {
      ...DECISION,
      decisionId: 'review-decision-rejected',
      action: ProfessionalReviewAction.Reject,
      reasonCode: 'review.conflict',
    };
    expect(validateProfessionalReviewDecision(rejected).reasons).toContain(
      PROFESSIONAL_REVIEW_VALIDATION_CODES.actionFieldUnexpected,
    );

    const { scope: _dropped, reviewedRefs: _also, ...bare } = DECISION;
    const cleanReject = { ...bare, action: ProfessionalReviewAction.Reject, reasonCode: 'review.conflict' };
    expect(isValidProfessionalReviewDecision(cleanReject)).toBe(true);
    expect(
      isValidProfessionalReviewDecision({
        ...cleanReject,
        canonicalAttestationRef: TEST_ATTESTATION_ID,
      }),
    ).toBe(false);

    // RequestMoreEvidence with nothing routable.
    expect(
      isValidProfessionalReviewDecision({
        ...bare,
        action: ProfessionalReviewAction.RequestMoreEvidence,
        reasonCode: 'review.insufficient-evidence',
        requestedMaterial: [{ reasonCode: 'review.material.missing' }],
      }),
    ).toBe(false);
    expect(
      isValidProfessionalReviewDecision({
        ...bare,
        action: ProfessionalReviewAction.RequestMoreEvidence,
        reasonCode: 'review.insufficient-evidence',
        requestedMaterial: [
          { requirementId: 'evidence.supporting.optional', reasonCode: 'review.material.missing' },
        ],
      }),
    ).toBe(true);
  });

  it('requires an attestation reference, its material and the resulting revision to travel together', () => {
    const withAttestation = {
      ...DECISION,
      canonicalAttestationRef: TEST_ATTESTATION_ID,
      attestationMaterialId: 'material-attestation-shape',
      resultingCaseRevision: 5,
    };
    expect(isValidProfessionalReviewDecision(withAttestation)).toBe(true);

    // Any one of the three alone describes half an event.
    expect(
      isValidProfessionalReviewDecision({
        ...DECISION,
        canonicalAttestationRef: TEST_ATTESTATION_ID,
      }),
    ).toBe(false);
    expect(
      isValidProfessionalReviewDecision({
        ...withAttestation,
        resultingCaseRevision: DECISION.reviewBasisRevision,
      }),
    ).toBe(false);
    expect(
      isValidProfessionalReviewDecision({
        ...withAttestation,
        resultingCaseRevision: DECISION.reviewBasisRevision - 1,
      }),
    ).toBe(false);
  });

  it('requires a reviewer that is a Protocol principal reference', () => {
    for (const broken of [
      { ...DECISION, reviewer: { id: 'x' } },
      { ...DECISION, reviewer: { id: '', kind: PrincipalKind.Human } },
      { ...DECISION, reviewer: { id: 'x', kind: 'Notary' } },
      { ...DECISION, reviewer: 'a person' },
    ]) {
      expect(isValidProfessionalReviewDecision(broken)).toBe(false);
    }
    expect(
      isValidProfessionalReviewDecision({
        ...DECISION,
        reviewer: { id: 'aoc:principal:x', kind: PrincipalKind.Organization },
      }),
    ).toBe(true);
  });

  it('rejects an unknown field rather than absorbing it', () => {
    expect(validateProfessionalReviewDecision({ ...DECISION, smuggled: 1 }).reasons).toContain(
      PROFESSIONAL_REVIEW_VALIDATION_CODES.unknownField,
    );
  });

  it('reconstitutes a decision and refuses a corrupt one', () => {
    expect(reconstituteProfessionalReviewDecision(JSON.parse(JSON.stringify(DECISION)))).toEqual(
      DECISION,
    );
    for (const corrupt of [
      { ...DECISION, action: 'Approve' },
      { ...DECISION, reviewBasisRevision: 0 },
      { ...DECISION, schemaVersion: 'aoc-protocolization-professional-review-decision/2' },
      { ...DECISION, decidedAt: '2026-01-01T00:00:00+01:00' },
    ]) {
      expect(() => reconstituteProfessionalReviewDecision(corrupt)).toThrow(
        expect.objectContaining({ code: PROFESSIONAL_REVIEW_ERROR_CODES.invalidDecision }),
      );
    }
  });

  it('freezes what it reconstitutes', () => {
    const restored = reconstituteProfessionalReviewDecision(JSON.parse(JSON.stringify(DECISION)));
    const mutable = restored as unknown as { action: string; reviewedRefs: unknown[] };
    expect(() => {
      mutable.action = ProfessionalReviewAction.Reject;
    }).toThrow();
    expect(() => mutable.reviewedRefs.push({})).toThrow();
  });
});
