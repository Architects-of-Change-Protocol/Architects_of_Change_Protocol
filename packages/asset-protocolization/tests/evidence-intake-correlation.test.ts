import {
  PROTOCOLIZATION_CASE_ERROR_CODES,
  ProtocolizationCaseError,
  ProtocolizationMaterialKind,
  ProtocolizationRequirementConditionStatus,
  ProtocolizationRequirementMaterialStatus,
  associateProtocolizationCaseMaterial,
  createProtocolizationCase,
  getProtocolizationCaseRequirementProgress,
  intakeProtocolizationEvidence,
  listProtocolizationCasePendingMaterialRequirements,
  listProtocolizationCaseRequirementProgress,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import {
  TEST_CONDITIONAL_SHAPE_V1,
  TEST_CONTENT_SUBJECT,
  TEST_PROFILE_V1_AT_2_0_0,
  createTestContext,
} from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1, TEST_PROFILE_V1 } from './fixtures/test-profiles';
import {
  TEST_EVIDENCE_ID,
  TEST_SECOND_EVIDENCE_ID,
  referencedSubmission,
} from './fixtures/test-evidence';

/**
 * How intake correlates evidence to the requirements of the case's **pinned**
 * profile version — and what that correlation does and does not mean.
 */

const CONTENT_PIN = { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: '1.0.0' };

function openCase(
  context = createTestContext(),
  profile = CONTENT_PIN,
  caseId = 'case-0001',
): ProtocolizationCase {
  return createProtocolizationCase(context, { caseId, profile, subject: TEST_CONTENT_SUBJECT })
    .protocolizationCase;
}

describe('requirement correlation', () => {
  it('records the evidence as APV-04 case material, reusing the Evidence pathway', () => {
    const context = createTestContext();
    const { protocolizationCase, caseEvent } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001' }),
    );

    // There is exactly one material list on a case. Intake does not add a
    // second, parallel evidence list.
    expect(protocolizationCase.materials).toHaveLength(1);
    expect(protocolizationCase.materials[0]).toMatchObject({
      materialId: 'material-0001',
      kind: ProtocolizationMaterialKind.Evidence,
      evidenceRef: TEST_EVIDENCE_ID,
      requirementIds: ['evidence.provenance.minimum'],
      addedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(caseEvent.eventType).toBe('ProtocolizationMaterialAdded');
  });

  it('moves the correlated requirement from Pending to MaterialPresent, and nothing further', () => {
    const context = createTestContext();
    const before = openCase(context);

    expect(
      getProtocolizationCaseRequirementProgress(
        before,
        TEST_CONTENT_SHAPE_V1,
        'evidence.provenance.minimum',
      )?.materialStatus,
    ).toBe(ProtocolizationRequirementMaterialStatus.Pending);

    const { protocolizationCase } = intakeProtocolizationEvidence(
      context,
      before,
      referencedSubmission({ caseId: 'case-0001' }),
    );

    const progress = getProtocolizationCaseRequirementProgress(
      protocolizationCase,
      TEST_CONTENT_SHAPE_V1,
      'evidence.provenance.minimum',
    );

    expect(progress?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
    expect(progress?.materialIds).toEqual(['material-0001']);
    expect(progress?.firstMaterialAt).toBe('2026-01-01T00:00:00.000Z');

    // The only status this projection has ever had two of. There is no
    // `Verified`, `Satisfied`, `Approved`, `Complete` or `Ready` to reach.
    expect(Object.values(ProtocolizationRequirementMaterialStatus).sort()).toEqual([
      'MaterialPresent',
      'Pending',
    ]);
  });

  it('leaves every other requirement untouched', () => {
    const context = createTestContext();
    const { protocolizationCase } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001' }),
    );

    const pending = listProtocolizationCaseRequirementProgress(
      protocolizationCase,
      TEST_CONTENT_SHAPE_V1,
      { materialStatus: ProtocolizationRequirementMaterialStatus.Pending },
    ).map((progress) => progress.requirementId);

    expect(pending).toEqual([
      'identity.content.required',
      'declaration.authorship.required',
      'verification.content.integrity',
      'attestation.professional.not-required',
    ]);
  });

  it('correlates one evidence item with several requirements at once', () => {
    const context = createTestContext();
    const { protocolizationCase, receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({
        caseId: 'case-0001',
        requirementIds: ['evidence.provenance.minimum', 'identity.content.required'],
      }),
    );

    // One canonical evidence record, one material, two correlations. The
    // evidence is not duplicated to answer two requirements.
    expect(protocolizationCase.materials).toHaveLength(1);
    expect(receipt.requirementIds).toEqual([
      'evidence.provenance.minimum',
      'identity.content.required',
    ]);

    for (const requirementId of receipt.requirementIds) {
      expect(
        getProtocolizationCaseRequirementProgress(protocolizationCase, TEST_CONTENT_SHAPE_V1, requirementId)
          ?.materialIds,
      ).toEqual(['material-0001']);
    }
  });

  it('lets several evidence items support one requirement', () => {
    const context = createTestContext();
    const first = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001' }),
    );
    context.clock.advance(60);
    const second = intakeProtocolizationEvidence(
      context,
      first.protocolizationCase,
      referencedSubmission({
        caseId: 'case-0001',
        intakeId: 'intake-0002',
        materialId: 'material-0002',
        evidenceRef: TEST_SECOND_EVIDENCE_ID,
      }),
    );

    const progress = getProtocolizationCaseRequirementProgress(
      second.protocolizationCase,
      TEST_CONTENT_SHAPE_V1,
      'evidence.provenance.minimum',
    );

    expect(progress?.materialIds).toEqual(['material-0001', 'material-0002']);
    // Two items is still structurally the same statement as one: material is
    // present. Whether two is *enough* is a profile `minimumCount` question
    // that only a later evaluator answers.
    expect(progress?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
    expect(progress?.firstMaterialAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('widens an existing correlation through APV-04, not through a second intake', () => {
    const context = createTestContext();
    const { protocolizationCase, receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001' }),
    );

    context.clock.advance(60);
    const widened = associateProtocolizationCaseMaterial(context, protocolizationCase, {
      materialId: receipt.materialId,
      requirementIds: ['identity.content.required'],
    });

    expect(widened.protocolizationCase.materials[0].requirementIds).toEqual([
      'evidence.provenance.minimum',
      'identity.content.required',
    ]);
    // The receipt is a historical fact about one intake, not a live view of
    // the material's current correlations. It does not change.
    expect(receipt.requirementIds).toEqual(['evidence.provenance.minimum']);
  });

  it.each([
    ['an unknown requirement id', ['evidence.nonexistent']],
    ['a requirement id from a different profile', ['identity.external-registry.required']],
  ])('refuses %s', (_label, requirementIds) => {
    const context = createTestContext();
    expect(() =>
      intakeProtocolizationEvidence(
        context,
        openCase(context),
        referencedSubmission({ caseId: 'case-0001', requirementIds }),
      ),
    ).toThrow(
      expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement }),
    );
  });
});

describe('pinned profile version governs correlation', () => {
  it('refuses a requirement that exists only in a newer version of the same line', () => {
    const context = createTestContext();
    const pinned = openCase(
      context,
      { profileId: TEST_PROFILE_V1.profileId, profileVersion: '1.0.0' },
      'case-pinned',
    );

    // `2.0.0` of the same line is catalogued and declares this requirement.
    expect(TEST_PROFILE_V1_AT_2_0_0.requirements.map((requirement) => requirement.id)).toContain(
      'identity.external.optional',
    );
    expect(TEST_PROFILE_V1.requirements.map((requirement) => requirement.id)).not.toContain(
      'identity.external.optional',
    );

    try {
      intakeProtocolizationEvidence(
        context,
        pinned,
        referencedSubmission({
          caseId: 'case-pinned',
          requirementIds: ['identity.external.optional'],
        }),
      );
      throw new Error('expected intake to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(ProtocolizationCaseError);
      const caseError = error as ProtocolizationCaseError;
      expect(caseError.code).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement);
      expect(caseError.details.profile).toEqual({
        profileId: TEST_PROFILE_V1.profileId,
        profileVersion: '1.0.0',
      });
    }
  });

  it('records the pin the correlation was checked against on the receipt', () => {
    const context = createTestContext();
    const { receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context, { profileId: TEST_PROFILE_V1.profileId, profileVersion: '1.0.0' }, 'case-pin'),
      referencedSubmission({ caseId: 'case-pin', requirementIds: ['identity.content.required'] }),
    );

    expect(receipt.profile).toEqual({ profileId: TEST_PROFILE_V1.profileId, profileVersion: '1.0.0' });
  });

  it('never changes the case pin or subject, whatever arrives', () => {
    const context = createTestContext();
    const before = openCase(context);
    const { protocolizationCase } = intakeProtocolizationEvidence(
      context,
      before,
      referencedSubmission({ caseId: 'case-0001' }),
    );

    expect(protocolizationCase.profile).toEqual(before.profile);
    expect(protocolizationCase.subject).toEqual(before.subject);
    expect(protocolizationCase.tenantId).toBe(before.tenantId);
  });
});

describe('obligations are respected, not reinterpreted', () => {
  it('leaves a Conditional requirement Unresolved after evidence arrives', () => {
    const context = createTestContext();
    const conditional = openCase(
      context,
      { profileId: TEST_CONDITIONAL_SHAPE_V1.profileId, profileVersion: '1.0.0' },
      'case-conditional',
    );

    const { protocolizationCase } = intakeProtocolizationEvidence(
      context,
      conditional,
      referencedSubmission({
        caseId: 'case-conditional',
        requirementIds: ['evidence.supplementary.conditional'],
      }),
    );

    const progress = getProtocolizationCaseRequirementProgress(
      protocolizationCase,
      TEST_CONDITIONAL_SHAPE_V1,
      'evidence.supplementary.conditional',
    );

    expect(progress?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
    // Evidence arriving does not resolve whether the requirement even applies.
    expect(progress?.conditionStatus).toBe(ProtocolizationRequirementConditionStatus.Unresolved);
    expect(
      listProtocolizationCasePendingMaterialRequirements(protocolizationCase, TEST_CONDITIONAL_SHAPE_V1).map(
        (entry) => entry.requirementId,
      ),
    ).toEqual(['identity.content.required']);
  });

  it('accepts evidence offered against a NotRequired requirement without inventing a prohibition', () => {
    const context = createTestContext();
    const { protocolizationCase } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({
        caseId: 'case-0001',
        requirementIds: ['attestation.professional.not-required'],
      }),
    );

    const progress = getProtocolizationCaseRequirementProgress(
      protocolizationCase,
      TEST_CONTENT_SHAPE_V1,
      'attestation.professional.not-required',
    );

    // Recording it is honest: something was supplied. It is not evidence that
    // the profile changed its mind, and the obligation is reported as declared.
    expect(progress?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
    expect(progress?.obligation).toBe('NotRequired');
  });
});
