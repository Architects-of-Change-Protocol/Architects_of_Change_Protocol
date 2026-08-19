import {
  DECLARATION_ERROR_CODES,
  PROTOCOLIZATION_CASE_ERROR_CODES,
  PROTOCOLIZATION_DECLARATION_EVENT_TYPES,
  ProtocolizationCaseState,
  activateProtocolizationCase,
  cancelProtocolizationCase,
  createInMemoryDeclarationRepository,
  createProtocolizationCase,
  recordProtocolizationDeclaration,
  reconstituteProtocolizationDeclarationRecord,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import { TENANT_A, TEST_CONTENT_SUBJECT, createTestContext } from './fixtures/test-cases';
import {
  TEST_DECLARATION_SHAPE_V1,
  TEST_DECLARATION_SOURCE,
  TEST_SECOND_CLAIM_ID,
  referencedDeclaration,
  sync,
} from './fixtures/test-declarations';

/**
 * Lifecycle, timestamps, events and immutability.
 */

const DECLARATION_PIN = { profileId: TEST_DECLARATION_SHAPE_V1.profileId, profileVersion: '1.0.0' };

function openCase(context = createTestContext(), caseId = 'case-0001'): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId,
    profile: DECLARATION_PIN,
    subject: TEST_CONTENT_SUBJECT,
  }).protocolizationCase;
}

describe('case lifecycle', () => {
  it('accepts a declaration into a Draft case', () => {
    const context = createTestContext();
    const before = openCase(context);
    expect(before.state).toBe(ProtocolizationCaseState.Draft);

    const { protocolizationCase } = recordProtocolizationDeclaration(
      context,
      before,
      referencedDeclaration({ caseId: 'case-0001' }),
    );
    expect(protocolizationCase.state).toBe(ProtocolizationCaseState.Draft);
  });

  it('accepts a declaration into an Active case', () => {
    const context = createTestContext();
    const active = activateProtocolizationCase(context, openCase(context)).protocolizationCase;

    context.clock.advance(60);
    const { protocolizationCase } = recordProtocolizationDeclaration(
      context,
      active,
      referencedDeclaration({ caseId: 'case-0001' }),
    );
    expect(protocolizationCase.state).toBe(ProtocolizationCaseState.Active);
    expect(protocolizationCase.revision).toBe(3);
  });

  it('refuses a declaration into a Cancelled case, and changes nothing', () => {
    const context = createTestContext();
    const cancelled = cancelProtocolizationCase(context, openCase(context)).protocolizationCase;

    context.clock.advance(60);
    expect(() =>
      recordProtocolizationDeclaration(
        context,
        cancelled,
        referencedDeclaration({ caseId: 'case-0001' }),
      ),
    ).toThrow(expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition }));

    expect(cancelled.materials).toEqual([]);
    expect(cancelled.revision).toBe(2);
  });

  it('adds no lifecycle state of its own', () => {
    expect(Object.keys(ProtocolizationCaseState).sort()).toEqual(['Active', 'Cancelled', 'Draft']);
  });
});

describe('timestamps', () => {
  it('records the clock instant as recordedAt and omits declaredAt when none was given', () => {
    const context = createTestContext();
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    expect(record.recordedAt).toBe('2026-01-01T00:00:00.000Z');
    // Never invented. "They declared it then" and "we recorded it now" are
    // different assertions and only the second one is ours to make.
    expect(record.declaredAt).toBeUndefined();
    expect(record).not.toHaveProperty('declaredAt');
  });

  it('keeps a supplied declaredAt distinct from recordedAt, verbatim', () => {
    const context = createTestContext();
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({
        caseId: 'case-0001',
        declaredAt: '2025-11-03T08:30:00.000Z',
      }),
    );

    expect(record.declaredAt).toBe('2025-11-03T08:30:00.000Z');
    expect(record.recordedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(record.declaredAt).not.toBe(record.recordedAt);
  });

  it('accepts a declaredAt later than the recording instant without judging it', () => {
    // Nothing here compares the two, because comparing them would be the start
    // of an evaluation: whether a claimed instant is plausible is a later
    // slice's question against the profile's own freshness rules.
    const context = createTestContext();
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001', declaredAt: '2030-01-01T00:00:00.000Z' }),
    );

    expect(record.declaredAt).toBe('2030-01-01T00:00:00.000Z');
    expect(record).not.toHaveProperty('declaredAtPlausible');
  });

  it('reads the clock once, so the record and the material agree', () => {
    const context = createTestContext();
    const { protocolizationCase, record, caseEvent, declarationEvent } =
      recordProtocolizationDeclaration(
        context,
        openCase(context),
        referencedDeclaration({ caseId: 'case-0001' }),
      );

    expect(protocolizationCase.materials[0].addedAt).toBe(record.recordedAt);
    expect(caseEvent.occurredAt).toBe(record.recordedAt);
    expect(declarationEvent.occurredAt).toBe(record.recordedAt);
    expect(protocolizationCase.updatedAt).toBe(record.recordedAt);
  });

  it('refuses a clock that moved backwards', () => {
    const context = createTestContext();
    const current = openCase(context);
    context.clock.set('2025-01-01T00:00:00.000Z');

    expect(() =>
      recordProtocolizationDeclaration(
        context,
        current,
        referencedDeclaration({ caseId: 'case-0001' }),
      ),
    ).toThrow(expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp }));
  });
});

describe('events', () => {
  it('emits one case event and one declaration event, sharing instant and revision', () => {
    const context = createTestContext();
    const { caseEvent, declarationEvent } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001', correlationId: 'request-0001' }),
    );

    expect(caseEvent.eventType).toBe('ProtocolizationMaterialAdded');
    expect(declarationEvent.eventType).toBe(PROTOCOLIZATION_DECLARATION_EVENT_TYPES.recorded);
    expect(declarationEvent.occurredAt).toBe(caseEvent.occurredAt);
    expect(declarationEvent.caseRevision).toBe(caseEvent.caseRevision);
    expect(declarationEvent.correlationId).toBe('request-0001');
  });

  it('keeps the human statement off the event', () => {
    const context = createTestContext();
    const { declarationEvent, record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({
        caseId: 'case-0001',
        statement: 'Free text a participant typed.',
        sourceRef: TEST_DECLARATION_SOURCE,
      }),
    );

    expect(record.statement).toBe('Free text a participant typed.');
    // An event fans out to subscribers who may have no business reading it,
    // and nothing may derive machine meaning from it anyway.
    expect(declarationEvent).not.toHaveProperty('statement');
    expect(declarationEvent).not.toHaveProperty('sourceRef');
  });

  it('carries the declarant and the machine semantics', () => {
    const context = createTestContext();
    const { declarationEvent } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    expect(declarationEvent.declarant.id).toBe('test-principal-0001');
    expect(declarationEvent.claimType).toBe('Authorship');
    expect(declarationEvent.requirementIds).toEqual(['declaration.authorship.required']);
  });
});

describe('immutability', () => {
  it('deeply freezes the record, so mutation cannot rewrite history', () => {
    const context = createTestContext();
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({
        caseId: 'case-0001',
        statement: 'I created this work.',
        declaredAt: '2025-11-03T08:30:00.000Z',
        sourceRef: TEST_DECLARATION_SOURCE,
      }),
    );

    const mutable = record as unknown as Record<string, unknown>;
    for (const [field, value] of [
      ['declarationId', 'declaration-tampered'],
      ['tenantId', 'tenant-b'],
      ['caseId', 'case-other'],
      ['claimRef', 'aoc:claim:tampered'],
      ['claimType', 'Identity'],
      ['statement', 'I did not create this work.'],
      ['declaredAt', '1999-01-01T00:00:00.000Z'],
      ['recordedAt', '1999-01-01T00:00:00.000Z'],
      ['caseRevision', 99],
    ] as const) {
      expect(() => {
        mutable[field] = value;
      }).toThrow(TypeError);
    }

    expect(record.declarationId).toBe('declaration-0001');
    expect(record.statement).toBe('I created this work.');
    expect(record.recordedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('freezes nested arrays and objects too', () => {
    const context = createTestContext();
    const { record, declarationEvent } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({
        caseId: 'case-0001',
        requirementIds: ['declaration.authorship.required', 'declaration.authorship.secondary'],
        sourceRef: TEST_DECLARATION_SOURCE,
      }),
    );

    expect(() => (record.requirementIds as string[]).push('declaration.smuggled')).toThrow(TypeError);
    expect(() => {
      (record.declarant as unknown as Record<string, unknown>).id = 'test-principal-tampered';
    }).toThrow(TypeError);
    expect(() => {
      (record.profile as unknown as Record<string, unknown>).profileVersion = '2.0.0';
    }).toThrow(TypeError);
    expect(() => {
      (record.sourceRef as unknown as Record<string, unknown>).value = 'test://tampered';
    }).toThrow(TypeError);
    expect(() =>
      (declarationEvent.requirementIds as string[]).push('declaration.smuggled'),
    ).toThrow(TypeError);

    expect(record.requirementIds).toEqual([
      'declaration.authorship.required',
      'declaration.authorship.secondary',
    ]);
  });

  it('copies the submitted arrays rather than aliasing them onto the record', () => {
    const context = createTestContext();
    const requirementIds = ['declaration.authorship.required'];
    const submission = referencedDeclaration({ caseId: 'case-0001', requirementIds });
    const { record } = recordProtocolizationDeclaration(context, openCase(context), submission);

    // A distinct array, so the record cannot be reached through the value the
    // caller still holds — and frozen either way, because APV-04 seals what it
    // was given when it seals the case.
    expect(record.requirementIds).not.toBe(requirementIds);
    expect(record.requirementIds).toEqual(['declaration.authorship.required']);
    expect(() => requirementIds.push('identity.content.required')).toThrow(TypeError);
  });

  it('freezes what the repository stores and what it hands back', () => {
    const context = createTestContext();
    const repository = createInMemoryDeclarationRepository();
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );
    repository.save(record);

    const stored = sync(repository.get(TENANT_A, 'declaration-0001')) as unknown as Record<
      string,
      unknown
    >;
    expect(() => {
      stored.statement = 'tampered';
    }).toThrow(TypeError);
    expect(sync(repository.listByCase(TENANT_A, 'case-0001'))[0]).toEqual(record);
  });
});

describe('persistence is append-only', () => {
  it('exposes no update and no delete', () => {
    const repository = createInMemoryDeclarationRepository();
    expect(Object.keys(repository).sort()).toEqual(['exists', 'get', 'listByCase', 'save']);
    for (const method of ['update', 'delete', 'remove', 'retract', 'supersede', 'clear']) {
      expect(repository).not.toHaveProperty(method);
    }
  });

  it('refuses a second save under the same (tenantId, declarationId)', () => {
    const context = createTestContext();
    const repository = createInMemoryDeclarationRepository();
    const first = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );
    repository.save(first.record);

    context.clock.advance(60);
    const second = recordProtocolizationDeclaration(
      context,
      first.protocolizationCase,
      referencedDeclaration({
        caseId: 'case-0001',
        materialId: 'material-d002',
        claimRef: TEST_SECOND_CLAIM_ID,
      }),
    );

    // A different declaration reusing an id already recorded. Overwriting
    // would erase the first one's history.
    expect(() => repository.save(second.record)).toThrow(
      expect.objectContaining({ code: DECLARATION_ERROR_CODES.duplicateDeclaration }),
    );
    expect(sync(repository.listByCase(TENANT_A, 'case-0001'))).toEqual([first.record]);
  });

  it('refuses to store a malformed record', () => {
    const repository = createInMemoryDeclarationRepository();
    expect(() => repository.save({ declarationId: 'd1' } as never)).toThrow(
      expect.objectContaining({ code: DECLARATION_ERROR_CODES.invalidRecord }),
    );
  });

  it('reconstitutes a stored record and refuses an invalid one', () => {
    const context = createTestContext();
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    const roundTripped = reconstituteProtocolizationDeclarationRecord(
      JSON.parse(JSON.stringify(record)),
    );
    expect(roundTripped).toEqual(record);
    expect(Object.isFrozen(roundTripped)).toBe(true);

    expect(() =>
      reconstituteProtocolizationDeclarationRecord({ ...record, isVerified: true }),
    ).toThrow(expect.objectContaining({ code: DECLARATION_ERROR_CODES.invalidRecord }));
  });
});

describe('the operation persists nothing itself', () => {
  it('returns the case and the record for a composition layer to commit together', () => {
    const context = createTestContext();
    const transition = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    // Two writes to two stores. A pure operation hands both results back
    // rather than pretending they are transactionally atomic here.
    expect(Object.keys(transition).sort()).toEqual([
      'caseEvent',
      'declarationEvent',
      'protocolizationCase',
      'record',
    ]);

    const repository = createInMemoryDeclarationRepository();
    expect(sync(repository.listByCase(TENANT_A, 'case-0001'))).toEqual([]);
  });
});
