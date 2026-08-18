import {
  EVIDENCE_INTAKE_ERROR_CODES,
  EvidenceIntakeError,
  PROTOCOLIZATION_CASE_ERROR_CODES,
  ProtocolizationCaseState,
  activateProtocolizationCase,
  cancelProtocolizationCase,
  createProtocolizationCase,
  intakeProtocolizationEvidence,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import { TEST_CONTENT_SUBJECT, createTestContext } from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1 } from './fixtures/test-profiles';
import {
  TEST_EVIDENCE_ID,
  TEST_SECOND_EVIDENCE_ID,
  referencedSubmission,
} from './fixtures/test-evidence';

/**
 * Lifecycle, revision and duplicate behaviour.
 *
 * APV-05 adds no state to APV-04's lifecycle and no second revision counter. It
 * works inside the contract it was given, and these tests are what hold it
 * there.
 */

const CONTENT_PIN = { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: '1.0.0' };

function openCase(context = createTestContext(), caseId = 'case-0001'): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId,
    profile: CONTENT_PIN,
    subject: TEST_CONTENT_SUBJECT,
  }).protocolizationCase;
}

describe('case lifecycle restrictions', () => {
  it('accepts evidence into a Draft case', () => {
    const context = createTestContext();
    const draft = openCase(context);
    expect(draft.state).toBe(ProtocolizationCaseState.Draft);

    const { protocolizationCase } = intakeProtocolizationEvidence(
      context,
      draft,
      referencedSubmission({ caseId: 'case-0001' }),
    );

    expect(protocolizationCase.state).toBe(ProtocolizationCaseState.Draft);
    expect(protocolizationCase.materials).toHaveLength(1);
  });

  it('accepts evidence into an Active case', () => {
    const context = createTestContext();
    const active = activateProtocolizationCase(context, openCase(context)).protocolizationCase;

    context.clock.advance(60);
    const { protocolizationCase } = intakeProtocolizationEvidence(
      context,
      active,
      referencedSubmission({ caseId: 'case-0001' }),
    );

    expect(protocolizationCase.state).toBe(ProtocolizationCaseState.Active);
    expect(protocolizationCase.materials).toHaveLength(1);
  });

  it('refuses evidence into a Cancelled case, and adds no new state to try', () => {
    const context = createTestContext();
    const cancelled = cancelProtocolizationCase(context, openCase(context)).protocolizationCase;

    expect(() =>
      intakeProtocolizationEvidence(context, cancelled, referencedSubmission({ caseId: 'case-0001' })),
    ).toThrow(
      expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition }),
    );

    // APV-05 introduces no lifecycle state of its own. APV-09 owns the fuller
    // machine; this slice works with exactly the three states it was given.
    expect(Object.values(ProtocolizationCaseState).sort()).toEqual([
      'Active',
      'Cancelled',
      'Draft',
    ]);
  });

  it('leaves the case byte-for-byte unchanged when intake fails', () => {
    const context = createTestContext();
    const before = openCase(context);
    const snapshot = JSON.parse(JSON.stringify(before));

    for (const submission of [
      referencedSubmission({ caseId: 'case-0001', categoryId: 'NOT A TOKEN' }),
      referencedSubmission({ caseId: 'case-0001', requirementIds: ['evidence.nonexistent'] }),
      referencedSubmission({ caseId: 'case-other' }),
    ]) {
      expect(() => intakeProtocolizationEvidence(context, before, submission)).toThrow();
    }

    expect(JSON.parse(JSON.stringify(before))).toEqual(snapshot);
    expect(before.revision).toBe(1);
    expect(before.materials).toEqual([]);
  });
});

describe('revision semantics', () => {
  it('increments the case revision exactly once per accepted intake', () => {
    const context = createTestContext();
    let current = openCase(context);
    expect(current.revision).toBe(1);

    for (const [index, evidenceRef] of [TEST_EVIDENCE_ID, TEST_SECOND_EVIDENCE_ID].entries()) {
      context.clock.advance(60);
      const transition = intakeProtocolizationEvidence(
        context,
        current,
        referencedSubmission({
          caseId: 'case-0001',
          intakeId: `intake-000${index + 1}`,
          materialId: `material-000${index + 1}`,
          evidenceRef,
        }),
      );
      current = transition.protocolizationCase;

      expect(current.revision).toBe(index + 2);
      expect(transition.receipt.caseRevision).toBe(current.revision);
      expect(transition.caseEvent.caseRevision).toBe(current.revision);
      expect(transition.intakeEvent.caseRevision).toBe(current.revision);
    }
  });

  it('stamps the receipt, the material and both events with one instant', () => {
    const context = createTestContext();
    const transition = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001' }),
    );

    const instant = transition.receipt.receivedAt;
    expect(transition.protocolizationCase.materials[0].addedAt).toBe(instant);
    expect(transition.caseEvent.occurredAt).toBe(instant);
    expect(transition.intakeEvent.occurredAt).toBe(instant);
    expect(transition.protocolizationCase.updatedAt).toBe(instant);
  });

  it('refuses a clock that moved backwards', () => {
    const context = createTestContext();
    const current = openCase(context);
    context.clock.set('2025-01-01T00:00:00.000Z');

    expect(() =>
      intakeProtocolizationEvidence(context, current, referencedSubmission({ caseId: 'case-0001' })),
    ).toThrow(expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp }));
  });
});

describe('duplicate and idempotency behaviour', () => {
  it('refuses a second intake of the same canonical evidence into the same case', () => {
    const context = createTestContext();
    const first = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001' }),
    );

    context.clock.advance(60);
    try {
      intakeProtocolizationEvidence(
        context,
        first.protocolizationCase,
        referencedSubmission({
          caseId: 'case-0001',
          intakeId: 'intake-0002',
          materialId: 'material-0002',
        }),
      );
      throw new Error('expected intake to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(EvidenceIntakeError);
      const intakeError = error as EvidenceIntakeError;
      expect(intakeError.code).toBe(EVIDENCE_INTAKE_ERROR_CODES.duplicateEvidence);
      expect(intakeError.details.materialId).toBe('material-0001');
      expect(intakeError.details.evidenceRef).toBe(TEST_EVIDENCE_ID);
    }
  });

  it('refuses a replayed material id', () => {
    const context = createTestContext();
    const first = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001' }),
    );

    context.clock.advance(60);
    expect(() =>
      intakeProtocolizationEvidence(
        context,
        first.protocolizationCase,
        referencedSubmission({
          caseId: 'case-0001',
          intakeId: 'intake-0002',
          evidenceRef: TEST_SECOND_EVIDENCE_ID,
        }),
      ),
    ).toThrow(
      expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.duplicateMaterial }),
    );
  });

  it('allows the same canonical evidence in a different case of the same tenant', () => {
    const context = createTestContext();
    const first = intakeProtocolizationEvidence(
      context,
      openCase(context, 'case-0001'),
      referencedSubmission({ caseId: 'case-0001' }),
    );

    context.clock.advance(60);
    const second = intakeProtocolizationEvidence(
      context,
      openCase(context, 'case-0002'),
      referencedSubmission({
        caseId: 'case-0002',
        intakeId: 'intake-0002',
        materialId: 'material-0002',
      }),
    );

    // One Protocol evidence record, two independent case associations. The
    // vertical does not force a caller to duplicate a Protocol record to work
    // around a workflow rule.
    expect(first.receipt.evidenceRef).toBe(second.receipt.evidenceRef);
    expect(first.receipt.caseId).not.toBe(second.receipt.caseId);
  });

  it('refuses a submission that names a different case than the one being operated on', () => {
    const context = createTestContext();
    expect(() =>
      intakeProtocolizationEvidence(
        context,
        openCase(context, 'case-0001'),
        referencedSubmission({ caseId: 'case-0002' }),
      ),
    ).toThrow(expect.objectContaining({ code: EVIDENCE_INTAKE_ERROR_CODES.caseMismatch }));
  });
});
