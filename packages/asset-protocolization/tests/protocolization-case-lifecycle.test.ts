import {
  PROTOCOLIZATION_CASE_ERROR_CODES,
  PROTOCOLIZATION_CASE_EVENT_TYPES,
  ProtocolizationCaseError,
  ProtocolizationCaseState,
  ProtocolizationMaterialKind,
  activateProtocolizationCase,
  addProtocolizationCaseMaterial,
  associateProtocolizationCaseMaterial,
  cancelProtocolizationCase,
  createProtocolizationCase,
  isAllowedProtocolizationCaseTransition,
  isValidProtocolizationCase,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import { TEST_CONTENT_IDENTITY, TEST_CONTENT_SUBJECT, createTestContext } from './fixtures/test-cases';
import type { TestContext } from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1 } from './fixtures/test-profiles';

function draftCase(context: TestContext): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId: 'case-lifecycle',
    profile: { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: TEST_CONTENT_SHAPE_V1.version },
    subject: TEST_CONTENT_SUBJECT,
  }).protocolizationCase;
}

const contentMaterial = (materialId: string) => ({
  materialId,
  kind: ProtocolizationMaterialKind.ContentIdentity,
  requirementIds: ['identity.content.required'],
  contentIdentity: TEST_CONTENT_IDENTITY,
});

const codeOf = (run: () => unknown): string => {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ProtocolizationCaseError);
    return (error as ProtocolizationCaseError).code;
  }
  throw new Error('expected the operation to fail');
};

describe('ProtocolizationCase lifecycle', () => {
  it('permits exactly Draft -> Active, Draft -> Cancelled and Active -> Cancelled', () => {
    const states = Object.values(ProtocolizationCaseState);
    const allowed = states.flatMap((from) =>
      states.filter((to) => isAllowedProtocolizationCaseTransition(from, to)).map((to) => `${from}->${to}`),
    );

    expect(allowed.sort()).toEqual(['Active->Cancelled', 'Draft->Active', 'Draft->Cancelled']);
  });

  it('activates a draft case, stamping activatedAt and advancing the revision', () => {
    const context = createTestContext();
    const draft = draftCase(context);
    context.clock.advance(60);

    const { protocolizationCase, event } = activateProtocolizationCase(context, draft);

    expect(protocolizationCase.state).toBe(ProtocolizationCaseState.Active);
    expect(protocolizationCase.revision).toBe(2);
    expect(protocolizationCase.activatedAt).toBe('2026-01-01T00:01:00.000Z');
    expect(protocolizationCase.updatedAt).toBe('2026-01-01T00:01:00.000Z');
    expect(protocolizationCase.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(event.eventType).toBe(PROTOCOLIZATION_CASE_EVENT_TYPES.activated);
    expect(event.caseRevision).toBe(2);
    expect(isValidProtocolizationCase(protocolizationCase)).toBe(true);
  });

  it('leaves the case it was given untouched', () => {
    const context = createTestContext();
    const draft = draftCase(context);
    const snapshot = JSON.parse(JSON.stringify(draft));

    activateProtocolizationCase(context, draft);

    expect(JSON.parse(JSON.stringify(draft))).toEqual(snapshot);
    expect(draft.state).toBe(ProtocolizationCaseState.Draft);
    expect(draft.revision).toBe(1);
  });

  it('rejects activating an already active case', () => {
    const context = createTestContext();
    const active = activateProtocolizationCase(context, draftCase(context)).protocolizationCase;

    expect(codeOf(() => activateProtocolizationCase(context, active))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition,
    );
  });

  it('offers no path back from Active to Draft', () => {
    expect(
      isAllowedProtocolizationCaseTransition(ProtocolizationCaseState.Active, ProtocolizationCaseState.Draft),
    ).toBe(false);
  });

  it('cancels a draft case', () => {
    const context = createTestContext();
    const draft = draftCase(context);
    context.clock.advance(30);

    const { protocolizationCase, event } = cancelProtocolizationCase(context, draft, {
      reason: 'withdrawn by the applicant',
    });

    expect(protocolizationCase.state).toBe(ProtocolizationCaseState.Cancelled);
    expect(protocolizationCase.cancelledAt).toBe('2026-01-01T00:00:30.000Z');
    expect(protocolizationCase.cancellationReason).toBe('withdrawn by the applicant');
    expect(event.eventType).toBe(PROTOCOLIZATION_CASE_EVENT_TYPES.cancelled);
    expect(isValidProtocolizationCase(protocolizationCase)).toBe(true);
  });

  it('cancels an active case and keeps its activation on the record', () => {
    const context = createTestContext();
    const active = activateProtocolizationCase(context, draftCase(context)).protocolizationCase;
    context.clock.advance(120);

    const { protocolizationCase } = cancelProtocolizationCase(context, active);

    expect(protocolizationCase.state).toBe(ProtocolizationCaseState.Cancelled);
    expect(protocolizationCase.activatedAt).toBe(active.activatedAt);
    expect(protocolizationCase.revision).toBe(3);
  });

  it('retains the profile pin, subject, material and timestamps of a cancelled case', () => {
    const context = createTestContext();
    const withMaterial = addProtocolizationCaseMaterial(
      context,
      draftCase(context),
      contentMaterial('material-0001'),
    ).protocolizationCase;
    context.clock.advance(5);

    const { protocolizationCase } = cancelProtocolizationCase(context, withMaterial);

    expect(protocolizationCase.profile).toEqual(withMaterial.profile);
    expect(protocolizationCase.subject).toEqual(withMaterial.subject);
    expect(protocolizationCase.materials).toEqual(withMaterial.materials);
    expect(protocolizationCase.createdAt).toBe(withMaterial.createdAt);
    expect(protocolizationCase.requirementStates).toEqual(withMaterial.requirementStates);
  });

  it('rejects cancelling a cancelled case rather than succeeding a second time', () => {
    const context = createTestContext();
    const cancelled = cancelProtocolizationCase(context, draftCase(context)).protocolizationCase;

    expect(codeOf(() => cancelProtocolizationCase(context, cancelled))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition,
    );
  });

  it('rejects reactivating a cancelled case', () => {
    const context = createTestContext();
    const cancelled = cancelProtocolizationCase(context, draftCase(context)).protocolizationCase;

    expect(codeOf(() => activateProtocolizationCase(context, cancelled))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition,
    );
  });

  it('rejects adding material to a cancelled case', () => {
    const context = createTestContext();
    const cancelled = cancelProtocolizationCase(context, draftCase(context)).protocolizationCase;

    expect(codeOf(() => addProtocolizationCaseMaterial(context, cancelled, contentMaterial('material-x')))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition,
    );
  });

  it('rejects associating further requirements on a cancelled case', () => {
    const context = createTestContext();
    const withMaterial = addProtocolizationCaseMaterial(
      context,
      draftCase(context),
      contentMaterial('material-0001'),
    ).protocolizationCase;
    const cancelled = cancelProtocolizationCase(context, withMaterial).protocolizationCase;

    expect(
      codeOf(() =>
        associateProtocolizationCaseMaterial(context, cancelled, {
          materialId: 'material-0001',
          requirementIds: ['evidence.provenance.minimum'],
        }),
      ),
    ).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition);
  });

  it('accepts material in both Draft and Active', () => {
    const context = createTestContext();
    const draft = draftCase(context);
    expect(
      addProtocolizationCaseMaterial(context, draft, contentMaterial('material-draft')).protocolizationCase
        .materials,
    ).toHaveLength(1);

    const active = activateProtocolizationCase(context, draft).protocolizationCase;
    expect(
      addProtocolizationCaseMaterial(context, active, contentMaterial('material-active')).protocolizationCase
        .materials,
    ).toHaveLength(1);
  });

  it('advances the revision by exactly one per successful operation, ordering the events', () => {
    const context = createTestContext();
    const created = createProtocolizationCase(context, {
      caseId: 'case-revisions',
      profile: { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: TEST_CONTENT_SHAPE_V1.version },
      subject: TEST_CONTENT_SUBJECT,
    });
    context.clock.advance(1);
    const activated = activateProtocolizationCase(context, created.protocolizationCase);
    context.clock.advance(1);
    const added = addProtocolizationCaseMaterial(
      context,
      activated.protocolizationCase,
      contentMaterial('material-0001'),
    );
    context.clock.advance(1);
    const cancelled = cancelProtocolizationCase(context, added.protocolizationCase);

    expect([created, activated, added, cancelled].map((step) => step.protocolizationCase.revision)).toEqual([
      1, 2, 3, 4,
    ]);
    expect([created, activated, added, cancelled].map((step) => step.event.caseRevision)).toEqual([1, 2, 3, 4]);
    expect([created, activated, added, cancelled].map((step) => step.event.occurredAt)).toEqual([
      '2026-01-01T00:00:00.000Z',
      '2026-01-01T00:00:01.000Z',
      '2026-01-01T00:00:02.000Z',
      '2026-01-01T00:00:03.000Z',
    ]);
  });

  it('rejects a clock that moves backwards rather than recording an impossible history', () => {
    const context = createTestContext();
    const draft = draftCase(context);
    context.clock.set('2025-12-31T23:00:00.000Z');

    expect(codeOf(() => activateProtocolizationCase(context, draft))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp,
    );
  });

  it('rejects a blank cancellation reason rather than storing one', () => {
    const context = createTestContext();
    expect(codeOf(() => cancelProtocolizationCase(context, draftCase(context), { reason: '  ' }))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase,
    );
  });

  it('omits the cancellation reason structurally when none is supplied', () => {
    const context = createTestContext();
    const { protocolizationCase, event } = cancelProtocolizationCase(context, draftCase(context));

    expect(Object.prototype.hasOwnProperty.call(protocolizationCase, 'cancellationReason')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(event, 'reason')).toBe(false);
  });

  it('refuses to operate on a case whose invariants are already broken', () => {
    const context = createTestContext();
    const tampered = { ...draftCase(context), revision: 0 } as ProtocolizationCase;

    expect(codeOf(() => activateProtocolizationCase(context, tampered))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase,
    );
  });

  it('exposes no state that is reachable only by mutation', () => {
    const context = createTestContext();
    const draft = draftCase(context);

    // `readonly` is erased at runtime, so the aggregate is frozen: a caller
    // cannot reach past the operations by assigning to a field.
    expect(Object.isFrozen(draft)).toBe(true);
    expect(() => {
      (draft as { state: string }).state = ProtocolizationCaseState.Active;
    }).toThrow(TypeError);
    expect(draft.state).toBe(ProtocolizationCaseState.Draft);
  });
});
