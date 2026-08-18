import {
  PROTOCOLIZATION_CASE_ERROR_CODES,
  PROTOCOLIZATION_CASE_VALIDATION_CODES,
  ProtocolizationCaseError,
  ProtocolizationCaseState,
  ProtocolizationMaterialKind,
  ProtocolizationRequirementMaterialStatus,
  activateProtocolizationCase,
  addProtocolizationCaseMaterial,
  cancelProtocolizationCase,
  createInMemoryProtocolizationCaseRepository,
  createProtocolizationCase,
  isValidProtocolizationCase,
  reconstituteProtocolizationCase,
  validateProtocolizationCase,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import { TEST_CONTENT_IDENTITY, TEST_CONTENT_SUBJECT, createTestContext } from './fixtures/test-cases';
import type { TestContext } from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1 } from './fixtures/test-profiles';

const PIN = {
  profileId: TEST_CONTENT_SHAPE_V1.profileId,
  profileVersion: TEST_CONTENT_SHAPE_V1.version,
};

function draftCase(context: TestContext, caseId = 'case-persistence'): ProtocolizationCase {
  return createProtocolizationCase(context, { caseId, profile: PIN, subject: TEST_CONTENT_SUBJECT })
    .protocolizationCase;
}

function caseWithMaterial(context: TestContext): ProtocolizationCase {
  return addProtocolizationCaseMaterial(context, draftCase(context), {
    materialId: 'material-0001',
    kind: ProtocolizationMaterialKind.ContentIdentity,
    requirementIds: ['identity.content.required'],
    contentIdentity: TEST_CONTENT_IDENTITY,
  }).protocolizationCase;
}

const codeOf = (run: () => unknown): string => {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ProtocolizationCaseError);
    return (error as ProtocolizationCaseError).code;
  }
  throw new Error('expected the operation to fail');
};

const reasonsFor = (value: unknown, profile?: Parameters<typeof validateProtocolizationCase>[1]) =>
  validateProtocolizationCase(value, profile).reasons;

describe('ProtocolizationCase validation on reconstruction', () => {
  it('accepts a case that round-trips through JSON', () => {
    const context = createTestContext();
    const original = caseWithMaterial(context);
    const revived = reconstituteProtocolizationCase(JSON.parse(JSON.stringify(original)));

    expect(revived).toEqual(original);
    expect(Object.isFrozen(revived)).toBe(true);
  });

  it('checks projected requirements against the exact pinned profile when one is supplied', () => {
    const context = createTestContext();
    const original = caseWithMaterial(context);
    const profile = context.catalog.get(TEST_CONTENT_SHAPE_V1.profileId, '1.0.0');

    expect(isValidProtocolizationCase(original, { profile })).toBe(true);
    expect(reasonsFor(original, { profile: context.catalog.get(TEST_EXTERNAL_SHAPE_V1.profileId, '1.0.0') })).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.profileRefMismatch,
    );
  });

  it.each([
    ['a non-object', 'not-a-case', PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidStructure],
    ['an unsupported schema version', { schemaVersion: 'aoc-protocolization-case/99' }, PROTOCOLIZATION_CASE_VALIDATION_CODES.unsupportedSchemaVersion],
  ])('rejects %s', (_label, value, code) => {
    expect(reasonsFor(value)).toContain(code);
  });

  it.each([
    ['a missing caseId', { caseId: undefined }, PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCaseId],
    ['a missing tenantId', { tenantId: undefined }, PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidTenantId],
    ['a missing profile pin', { profile: undefined }, PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidProfileRef],
    ['a missing profile version', { profile: { profileId: 'test.content.v1' } }, PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidProfileRef],
    ['a malformed subject binding', { subject: { subjectRef: {} } }, PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidSubject],
    ['an unknown lifecycle state', { state: 'Ready' }, PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidState],
    ['a zero revision', { revision: 0 }, PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidRevision],
    ['a non-canonical createdAt', { createdAt: '2026-01-01' }, PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCreatedAt],
    ['an unknown field', { smuggled: true }, PROTOCOLIZATION_CASE_VALIDATION_CODES.unknownCaseField],
  ])('rejects %s in persisted state', (_label, overrides, code) => {
    const context = createTestContext();
    expect(reasonsFor({ ...draftCase(context), ...overrides })).toContain(code);
  });

  it('rejects updatedAt before createdAt', () => {
    const context = createTestContext();
    expect(reasonsFor({ ...draftCase(context), updatedAt: '2025-01-01T00:00:00.000Z' })).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.updatedBeforeCreated,
    );
  });

  it('rejects an Active case with no activatedAt, and a Draft case that has one', () => {
    const context = createTestContext();
    const draft = draftCase(context);

    expect(reasonsFor({ ...draft, state: ProtocolizationCaseState.Active })).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidActivatedAt,
    );
    expect(reasonsFor({ ...draft, activatedAt: draft.createdAt })).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.unexpectedActivatedAt,
    );
  });

  it('rejects a Cancelled case with no cancelledAt, and a live case that has one', () => {
    const context = createTestContext();
    const draft = draftCase(context);

    expect(reasonsFor({ ...draft, state: ProtocolizationCaseState.Cancelled })).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.missingCancelledAt,
    );
    expect(reasonsFor({ ...draft, cancelledAt: draft.createdAt })).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.unexpectedCancelledAt,
    );
  });

  it('rejects a cancellation reason on a case that was not cancelled', () => {
    const context = createTestContext();
    expect(reasonsFor({ ...draftCase(context), cancellationReason: 'abandoned' })).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.unexpectedCancellationReason,
    );
  });

  it('rejects duplicate requirement-state ids', () => {
    const context = createTestContext();
    const draft = draftCase(context);
    const [first] = draft.requirementStates;

    expect(reasonsFor({ ...draft, requirementStates: [first, first] })).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.duplicateRequirementStateId,
    );
  });

  it('rejects duplicate material ids', () => {
    const context = createTestContext();
    const withMaterial = caseWithMaterial(context);

    expect(
      reasonsFor({ ...withMaterial, materials: [...withMaterial.materials, ...withMaterial.materials] }),
    ).toContain(PROTOCOLIZATION_CASE_VALIDATION_CODES.duplicateMaterialId);
  });

  it('rejects a requirement status that disagrees with its own material list', () => {
    const context = createTestContext();
    const draft = draftCase(context);
    const tampered = draft.requirementStates.map((state, index) =>
      index === 0
        ? { ...state, materialStatus: ProtocolizationRequirementMaterialStatus.MaterialPresent }
        : state,
    );

    expect(reasonsFor({ ...draft, requirementStates: tampered })).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.requirementStatusMismatch,
    );
  });

  it('rejects a requirement state naming a material the case does not hold', () => {
    const context = createTestContext();
    const draft = draftCase(context);
    const tampered = draft.requirementStates.map((state, index) =>
      index === 0
        ? {
            ...state,
            materialStatus: ProtocolizationRequirementMaterialStatus.MaterialPresent,
            materialIds: ['material-absent'],
            firstMaterialAt: draft.createdAt,
          }
        : state,
    );

    expect(reasonsFor({ ...draft, requirementStates: tampered })).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.requirementStateMaterialUnknown,
    );
  });

  it('rejects a material whose requirement is not projected on the case', () => {
    const context = createTestContext();
    const withMaterial = caseWithMaterial(context);
    const tampered = {
      ...withMaterial,
      materials: withMaterial.materials.map((material) => ({
        ...material,
        requirementIds: ['requirement.absent'],
      })),
    };

    expect(reasonsFor(tampered)).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.materialRequirementNotProjected,
    );
  });

  it('rejects a projected requirement the pinned profile does not declare', () => {
    const context = createTestContext();
    const draft = draftCase(context);
    const profile = context.catalog.get(TEST_CONTENT_SHAPE_V1.profileId, '1.0.0');
    const tampered = {
      ...draft,
      requirementStates: [
        ...draft.requirementStates,
        {
          requirementId: 'requirement.invented',
          materialStatus: ProtocolizationRequirementMaterialStatus.Pending,
          materialIds: [],
          updatedAt: draft.createdAt,
        },
      ],
    };

    expect(reasonsFor(tampered, { profile })).toContain(
      PROTOCOLIZATION_CASE_VALIDATION_CODES.requirementNotInProfile,
    );
  });

  it('refuses to reconstitute anything it would refuse to validate', () => {
    const context = createTestContext();
    expect(codeOf(() => reconstituteProtocolizationCase({ ...draftCase(context), revision: -1 }))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase,
    );
  });
});

describe('in-memory ProtocolizationCase repository', () => {
  it('stores and returns a case', async () => {
    const context = createTestContext();
    const repository = createInMemoryProtocolizationCaseRepository();
    const draft = draftCase(context);

    repository.save(draft);

    expect(await repository.get('tenant-a', 'case-persistence')).toEqual(draft);
    expect(await repository.get('tenant-a', 'case-absent')).toBeUndefined();
  });

  it('rejects a duplicate case at the same (tenantId, caseId)', () => {
    const context = createTestContext();
    const repository = createInMemoryProtocolizationCaseRepository();
    repository.save(draftCase(context));

    expect(codeOf(() => repository.save(draftCase(context)))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.duplicateCase,
    );
  });

  it('rejects an update whose revision skips the stored one', () => {
    const context = createTestContext();
    const repository = createInMemoryProtocolizationCaseRepository();
    const draft = draftCase(context);
    repository.save(draft);

    context.clock.advance(1);
    const activated = activateProtocolizationCase(context, draft).protocolizationCase;
    context.clock.advance(1);
    const cancelled = { ...activated, revision: 9 } as ProtocolizationCase;

    expect(codeOf(() => repository.save(cancelled))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.revisionConflict,
    );
    repository.save(activated);
  });

  it('detects a lost update between two writers holding the same revision', () => {
    const context = createTestContext();
    const repository = createInMemoryProtocolizationCaseRepository();
    const draft = draftCase(context);
    repository.save(draft);

    context.clock.advance(1);
    const writerOne = activateProtocolizationCase(context, draft).protocolizationCase;
    const writerTwo = cancelProtocolizationCase(context, draft).protocolizationCase;

    repository.save(writerOne);
    expect(codeOf(() => repository.save(writerTwo))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.revisionConflict,
    );
  });

  it('rejects an update to a case that was never stored', () => {
    const context = createTestContext();
    const repository = createInMemoryProtocolizationCaseRepository();
    const draft = draftCase(context);
    context.clock.advance(1);

    expect(codeOf(() => repository.save(activateProtocolizationCase(context, draft).protocolizationCase))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.caseNotFound,
    );
  });

  it('refuses to store a malformed case', () => {
    const context = createTestContext();
    const repository = createInMemoryProtocolizationCaseRepository();

    expect(codeOf(() => repository.save({ ...draftCase(context), state: 'Ready' } as never))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase,
    );
  });

  it('does not let a caller mutate stored state through a returned reference', async () => {
    const context = createTestContext();
    const repository = createInMemoryProtocolizationCaseRepository();
    const draft = draftCase(context);
    repository.save(draft);
    repository.save(
      addProtocolizationCaseMaterial(context, draft, {
        materialId: 'material-0001',
        kind: ProtocolizationMaterialKind.ContentIdentity,
        requirementIds: ['identity.content.required'],
        contentIdentity: TEST_CONTENT_IDENTITY,
      }).protocolizationCase,
    );

    const retrieved = (await repository.get('tenant-a', 'case-persistence'))!;
    expect(Object.isFrozen(retrieved)).toBe(true);
    expect(Object.isFrozen(retrieved.materials)).toBe(true);
    expect(Object.isFrozen(retrieved.materials[0])).toBe(true);
    expect(() => {
      (retrieved.materials as ProtocolizationCase['materials'][number][]).push(retrieved.materials[0]);
    }).toThrow(TypeError);

    expect((await repository.get('tenant-a', 'case-persistence'))!.materials).toHaveLength(1);
  });
});
