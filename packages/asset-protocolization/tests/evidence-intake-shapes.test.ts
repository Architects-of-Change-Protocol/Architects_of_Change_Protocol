import { EvidenceType, ReferenceSourceKind } from '@aoc/protocol/claims';

import {
  EVIDENCE_INTAKE_ERROR_CODES,
  EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION,
  EVIDENCE_INTAKE_VALIDATION_CODES,
  EvidenceIntakeError,
  EvidenceIntakePathway,
  createProtocolizationCase,
  intakeProtocolizationEvidence,
  isAdmissibleProtocolizationEvidenceSubmission,
  isEvidenceIntakePathway,
  isValidEvidenceIntakeCategoryId,
  isValidEvidenceIntakeId,
  isValidEvidenceIntakeReceipt,
  reconstituteEvidenceIntakeReceipt,
  validateEvidenceIntakeReceipt,
  validateProtocolizationEvidenceSubmission,
} from '@aoc/asset-protocolization';
import type { ProtocolizationEvidenceSubmission } from '@aoc/asset-protocolization';

import {
  TENANT_A,
  TEST_CONTENT_SUBJECT,
  createTestContext,
} from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1 } from './fixtures/test-profiles';
import {
  TEST_CATEGORY_DOCUMENT,
  TEST_DOCUMENT_SOURCE,
  TEST_EVIDENCE_ID,
  referencedSubmission,
  testCanonicalEvidence,
} from './fixtures/test-evidence';

/**
 * APV-05 structural shape and admission tests.
 *
 * Everything asserted here is about *form*. Not one assertion claims that any
 * evidence is authentic, current or true — the vocabulary of this slice is
 * `admitted`, and these tests are what pins that word to schema conformance.
 */

const CONTENT_PIN = { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: '1.0.0' };

function openCase(context = createTestContext()) {
  return createProtocolizationCase(context, {
    caseId: 'case-0001',
    profile: CONTENT_PIN,
    subject: TEST_CONTENT_SUBJECT,
  }).protocolizationCase;
}

describe('evidence intake identifiers', () => {
  it('accepts instance-shaped intake ids and rejects unsafe ones', () => {
    for (const value of [
      'intake-0001',
      '11111111-2222-4333-8444-555555555555',
      'aoc:evidence-intake:0001',
    ]) {
      expect(isValidEvidenceIntakeId(value)).toBe(true);
    }

    for (const value of ['', ' intake', 'intake 0001', 'intake\n0001', '-intake', 'a'.repeat(129), 42, null]) {
      expect(isValidEvidenceIntakeId(value)).toBe(false);
    }
  });

  it('accepts dotted-token category ids and rejects anything else', () => {
    for (const value of ['test.intake.uploaded-document', 'a', 'x.y.z']) {
      expect(isValidEvidenceIntakeCategoryId(value)).toBe(true);
    }

    for (const value of ['Test.Intake', 'test intake', 'test..intake', '.test', '', 7, undefined]) {
      expect(isValidEvidenceIntakeCategoryId(value)).toBe(false);
    }
  });

  it('keeps intake ids and material ids as separate identity layers', () => {
    const context = createTestContext();
    const { receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001', intakeId: 'intake-0001', materialId: 'material-0001' }),
    );

    // Two ids, two layers, recorded together so either can be followed to the
    // other. Neither is derived from the other.
    expect(receipt.intakeId).toBe('intake-0001');
    expect(receipt.materialId).toBe('material-0001');
  });
});

describe('evidence submission admission', () => {
  const base = referencedSubmission({ caseId: 'case-0001' });

  /** The `Canonical` pathway's submission: an evidence document, no `evidenceRef`. */
  const canonicalSubmission = (evidence: unknown = testCanonicalEvidence()): unknown => ({
    intakeId: base.intakeId,
    caseId: base.caseId,
    materialId: base.materialId,
    categoryId: base.categoryId,
    requirementIds: base.requirementIds,
    pathway: EvidenceIntakePathway.Canonical,
    evidence,
  });

  it('admits a well-formed reference submission', () => {
    expect(validateProtocolizationEvidenceSubmission(base)).toEqual({ admitted: true, reasons: [] });
    expect(isAdmissibleProtocolizationEvidenceSubmission(base)).toBe(true);
  });

  it('admits a well-formed canonical-evidence submission', () => {
    expect(validateProtocolizationEvidenceSubmission(canonicalSubmission()).admitted).toBe(true);
  });

  it.each([
    ['a non-object', 42, EVIDENCE_INTAKE_VALIDATION_CODES.notAnObject],
    ['an unknown pathway', { ...base, pathway: 'Guess' }, EVIDENCE_INTAKE_VALIDATION_CODES.invalidPathway],
    ['a malformed intake id', { ...base, intakeId: 'bad id' }, EVIDENCE_INTAKE_VALIDATION_CODES.invalidIntakeId],
    ['a malformed case id', { ...base, caseId: '' }, EVIDENCE_INTAKE_VALIDATION_CODES.invalidCaseId],
    ['a malformed material id', { ...base, materialId: ' ' }, EVIDENCE_INTAKE_VALIDATION_CODES.invalidMaterialId],
    ['a malformed category', { ...base, categoryId: 'Not A Token' }, EVIDENCE_INTAKE_VALIDATION_CODES.invalidCategoryId],
    ['a blank evidence reference', { ...base, evidenceRef: '   ' }, EVIDENCE_INTAKE_VALIDATION_CODES.invalidEvidenceRef],
    ['no requirement ids', { ...base, requirementIds: [] }, EVIDENCE_INTAKE_VALIDATION_CODES.invalidRequirementIds],
    [
      'duplicate requirement ids',
      { ...base, requirementIds: ['evidence.provenance.minimum', 'evidence.provenance.minimum'] },
      EVIDENCE_INTAKE_VALIDATION_CODES.invalidRequirementIds,
    ],
    [
      'a malformed requirement id',
      { ...base, requirementIds: ['Evidence Provenance'] },
      EVIDENCE_INTAKE_VALIDATION_CODES.invalidRequirementIds,
    ],
    [
      'a non-canonical observedAt',
      { ...base, observedAt: '2026-01-01T00:00:00+01:00' },
      EVIDENCE_INTAKE_VALIDATION_CODES.invalidObservedAt,
    ],
    [
      'an impossible observedAt',
      { ...base, observedAt: '2026-02-31T00:00:00.000Z' },
      EVIDENCE_INTAKE_VALIDATION_CODES.invalidObservedAt,
    ],
    [
      'a present-but-undefined observedAt',
      { ...base, observedAt: undefined },
      EVIDENCE_INTAKE_VALIDATION_CODES.invalidObservedAt,
    ],
    [
      'a source with no Protocol source kind',
      { ...base, sourceRef: { kind: 'Telepathy', value: 'x' } },
      EVIDENCE_INTAKE_VALIDATION_CODES.invalidSourceRef,
    ],
    [
      'a source with a blank locator',
      { ...base, sourceRef: { kind: ReferenceSourceKind.Registry, value: '  ' } },
      EVIDENCE_INTAKE_VALIDATION_CODES.invalidSourceRef,
    ],
    ['a blank correlation id', { ...base, correlationId: '' }, EVIDENCE_INTAKE_VALIDATION_CODES.invalidCorrelationId],
    ['an unknown field', { ...base, verified: true }, EVIDENCE_INTAKE_VALIDATION_CODES.unknownField],
  ])('refuses %s', (_label, submission, code) => {
    const result = validateProtocolizationEvidenceSubmission(submission);
    expect(result.admitted).toBe(false);
    expect(result.reasons).toContain(code);
  });

  it.each([
    ['a missing id', { type: EvidenceType.Document, createdAt: '2025-06-01T00:00:00.000Z' }],
    ['an unknown EvidenceType', testCanonicalEvidence({ type: 'Vibes' as EvidenceType })],
    ['a non-canonical createdAt', testCanonicalEvidence({ createdAt: '2025-06-01' })],
  ])('refuses a canonical-evidence document with %s', (_label, evidence) => {
    const result = validateProtocolizationEvidenceSubmission(canonicalSubmission(evidence));
    expect(result.admitted).toBe(false);
    expect(result.reasons).toContain(EVIDENCE_INTAKE_VALIDATION_CODES.invalidEvidenceDocument);
  });

  it('rejects a payload belonging to the other pathway as an unknown field', () => {
    const result = validateProtocolizationEvidenceSubmission({
      ...base,
      pathway: EvidenceIntakePathway.Canonical,
      evidence: testCanonicalEvidence(),
    });

    expect(result.reasons).toContain(EVIDENCE_INTAKE_VALIDATION_CODES.unknownField);
  });

  it('recognises exactly two pathways', () => {
    expect(Object.values(EvidenceIntakePathway).sort()).toEqual(['Canonical', 'Reference']);
    expect(isEvidenceIntakePathway('Reference')).toBe(true);
    expect(isEvidenceIntakePathway('Verified')).toBe(false);
  });
});

describe('evidence intake receipt', () => {
  it('records the intake and nothing that resembles a verdict', () => {
    const context = createTestContext();
    const submission = referencedSubmission({
      caseId: 'case-0001',
      observedAt: '2025-06-01T00:00:00.000Z',
      sourceRef: TEST_DOCUMENT_SOURCE,
      correlationId: 'request-0001',
    });

    const { receipt } = intakeProtocolizationEvidence(context, openCase(context), submission);

    expect(receipt).toEqual({
      schemaVersion: EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION,
      intakeId: 'intake-0001',
      tenantId: TENANT_A,
      caseId: 'case-0001',
      profile: CONTENT_PIN,
      categoryId: TEST_CATEGORY_DOCUMENT,
      evidenceRef: TEST_EVIDENCE_ID,
      materialId: 'material-0001',
      requirementIds: ['evidence.provenance.minimum'],
      receivedAt: '2026-01-01T00:00:00.000Z',
      observedAt: '2025-06-01T00:00:00.000Z',
      sourceRef: TEST_DOCUMENT_SOURCE,
      caseRevision: 2,
      correlationId: 'request-0001',
    });
  });

  it('omits optionals that were not supplied rather than defaulting them', () => {
    const context = createTestContext();
    const { receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001' }),
    );

    // Notably `observedAt`: the vertical never invents a source observation
    // instant it was not given.
    expect(Object.prototype.hasOwnProperty.call(receipt, 'observedAt')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(receipt, 'sourceRef')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(receipt, 'correlationId')).toBe(false);
  });

  it('is deeply frozen, so nothing can rewrite what was recorded', () => {
    const context = createTestContext();
    const { receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001', sourceRef: TEST_DOCUMENT_SOURCE }),
    );

    expect(Object.isFrozen(receipt)).toBe(true);
    expect(Object.isFrozen(receipt.requirementIds)).toBe(true);
    expect(Object.isFrozen(receipt.profile)).toBe(true);
    expect(Object.isFrozen(receipt.sourceRef)).toBe(true);

    expect(() => {
      (receipt as { receivedAt: string }).receivedAt = '2030-01-01T00:00:00.000Z';
    }).toThrow(TypeError);
    expect(() => {
      (receipt.requirementIds as string[]).push('identity.content.required');
    }).toThrow(TypeError);
  });

  it('validates and reconstitutes a persisted receipt, and refuses a broken one', () => {
    const context = createTestContext();
    const { receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001' }),
    );

    const roundTripped = JSON.parse(JSON.stringify(receipt));
    expect(isValidEvidenceIntakeReceipt(roundTripped)).toBe(true);
    expect(reconstituteEvidenceIntakeReceipt(roundTripped)).toEqual(receipt);
    expect(Object.isFrozen(reconstituteEvidenceIntakeReceipt(roundTripped))).toBe(true);

    expect(() => reconstituteEvidenceIntakeReceipt({ ...roundTripped, caseRevision: 0 })).toThrow(
      EvidenceIntakeError,
    );
    expect(
      validateEvidenceIntakeReceipt({ ...roundTripped, schemaVersion: 'something-else' }).reasons,
    ).toContain(EVIDENCE_INTAKE_VALIDATION_CODES.invalidSchemaVersion);
    expect(validateEvidenceIntakeReceipt({ ...roundTripped, isVerified: true }).reasons).toContain(
      EVIDENCE_INTAKE_VALIDATION_CODES.unknownField,
    );
  });

  it('reports a malformed submission through a stable error code and reason codes', () => {
    const context = createTestContext();
    try {
      intakeProtocolizationEvidence(
        context,
        openCase(context),
        referencedSubmission({ caseId: 'case-0001', categoryId: 'Not A Token' }),
      );
      throw new Error('expected intake to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(EvidenceIntakeError);
      const intakeError = error as EvidenceIntakeError;
      expect(intakeError.code).toBe(EVIDENCE_INTAKE_ERROR_CODES.invalidSubmission);
      expect(intakeError.details.reasonCodes).toContain(
        EVIDENCE_INTAKE_VALIDATION_CODES.invalidCategoryId,
      );
    }
  });
});
