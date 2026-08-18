import {
  INITIAL_PROTOCOLIZATION_CASE_STATE,
  PROTOCOLIZATION_CASE_ERROR_CODES,
  PROTOCOLIZATION_CASE_EVENT_TYPES,
  PROTOCOLIZATION_CASE_SCHEMA_VERSION,
  PROTOCOLIZATION_CASE_VALIDATION_CODES,
  ProtocolizationCaseError,
  ProtocolizationCaseState,
  ProtocolizationRequirementMaterialStatus,
  createProtocolizationCase,
  isValidProtocolizationCase,
} from '@aoc/asset-protocolization';
import type { CreateProtocolizationCaseInput } from '@aoc/asset-protocolization';

import {
  TEST_BARE_SUBJECT,
  TEST_CONTENT_SUBJECT,
  TEST_EXTERNAL_SUBJECT,
  TEST_SOVEREIGN_ASSET_ID,
  createTestContext,
} from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1 } from './fixtures/test-profiles';

const validInput = (): CreateProtocolizationCaseInput => ({
  caseId: 'case-0001',
  profile: { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: TEST_CONTENT_SHAPE_V1.version },
  subject: TEST_CONTENT_SUBJECT,
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

describe('createProtocolizationCase', () => {
  it('creates a valid case deterministically from a tenant, an exact profile and a subject', () => {
    const context = createTestContext();
    const { protocolizationCase, event } = createProtocolizationCase(context, validInput());

    expect(isValidProtocolizationCase(protocolizationCase)).toBe(true);
    expect(protocolizationCase.schemaVersion).toBe(PROTOCOLIZATION_CASE_SCHEMA_VERSION);
    expect(protocolizationCase.caseId).toBe('case-0001');
    expect(protocolizationCase.tenantId).toBe('tenant-a');
    expect(protocolizationCase.state).toBe(INITIAL_PROTOCOLIZATION_CASE_STATE);
    expect(protocolizationCase.state).toBe(ProtocolizationCaseState.Draft);
    expect(protocolizationCase.revision).toBe(1);
    expect(protocolizationCase.materials).toEqual([]);
    expect(protocolizationCase.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(protocolizationCase.updatedAt).toBe(protocolizationCase.createdAt);
    expect(protocolizationCase.activatedAt).toBeUndefined();
    expect(protocolizationCase.cancelledAt).toBeUndefined();

    expect(event.eventType).toBe(PROTOCOLIZATION_CASE_EVENT_TYPES.created);
    expect(event.caseRevision).toBe(1);
    expect(event.occurredAt).toBe('2026-01-01T00:00:00.000Z');

    // Same inputs, same clock, byte-identical case — no minting, no hidden state.
    const second = createProtocolizationCase(createTestContext(), validInput());
    expect(second.protocolizationCase).toEqual(protocolizationCase);
  });

  it('projects every requirement of the pinned profile, in declaration order, as Pending', () => {
    const context = createTestContext();
    const { protocolizationCase } = createProtocolizationCase(context, validInput());

    expect(protocolizationCase.requirementStates.map((state) => state.requirementId)).toEqual(
      TEST_CONTENT_SHAPE_V1.requirements.map((requirement) => requirement.id),
    );
    for (const state of protocolizationCase.requirementStates) {
      expect(state.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.Pending);
      expect(state.materialIds).toEqual([]);
      expect(state.firstMaterialAt).toBeUndefined();
    }
  });

  it('projects NotRequired and Optional requirements too, rather than flattening the obligation vocabulary', () => {
    const context = createTestContext();
    const { protocolizationCase } = createProtocolizationCase(context, validInput());

    // The content shape declares an attestation requirement as `NotRequired`;
    // dropping it would erase a recorded decision from the case.
    expect(protocolizationCase.requirementStates.map((state) => state.requirementId)).toContain(
      'attestation.professional.not-required',
    );
  });

  it('pins exactly the two frozen profile-ref fields', () => {
    const context = createTestContext();
    const { protocolizationCase } = createProtocolizationCase(context, validInput());

    expect(protocolizationCase.profile).toEqual({
      profileId: TEST_CONTENT_SHAPE_V1.profileId,
      profileVersion: '1.0.0',
    });
    expect(Object.keys(protocolizationCase.profile)).toEqual(['profileId', 'profileVersion']);
  });

  it('rejects a pin carrying a field the frozen contract does not declare', () => {
    const context = createTestContext();
    try {
      createProtocolizationCase(context, {
        ...validInput(),
        profile: {
          profileId: TEST_CONTENT_SHAPE_V1.profileId,
          profileVersion: TEST_CONTENT_SHAPE_V1.version,
          assetCategory: 'smuggled',
        } as never,
      });
      throw new Error('expected the operation to fail');
    } catch (error) {
      expect((error as ProtocolizationCaseError).details.reasonCodes).toContain(
        PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidProfileRef,
      );
    }
  });

  it('rejects a missing tenant', () => {
    const context = { ...createTestContext(), tenantId: undefined as never };
    expect(codeOf(() => createProtocolizationCase(context, validInput()))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTenant,
    );
  });

  it('rejects an empty tenant', () => {
    expect(codeOf(() => createProtocolizationCase(createTestContext(''), validInput()))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTenant,
    );
  });

  it('rejects a blank tenant rather than trimming it into one', () => {
    expect(codeOf(() => createProtocolizationCase(createTestContext('   '), validInput()))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTenant,
    );
  });

  it('substitutes no default, system or public tenant for a missing one', () => {
    for (const tenant of [undefined, null, '', 0, {}]) {
      const context = { ...createTestContext(), tenantId: tenant as never };
      expect(codeOf(() => createProtocolizationCase(context, validInput()))).toBe(
        PROTOCOLIZATION_CASE_ERROR_CODES.invalidTenant,
      );
    }
  });

  it('rejects an unknown profile id', () => {
    const context = createTestContext();
    expect(
      codeOf(() =>
        createProtocolizationCase(context, {
          ...validInput(),
          profile: { profileId: 'test.absent.v1', profileVersion: '1.0.0' },
        }),
      ),
    ).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound);
  });

  it('rejects a known profile at an uncatalogued version, never falling back to a nearby one', () => {
    const context = createTestContext();
    expect(
      codeOf(() =>
        createProtocolizationCase(context, {
          ...validInput(),
          profile: { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: '9.9.9' },
        }),
      ),
    ).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound);
  });

  it('rejects a malformed profile version before consulting the catalogue', () => {
    const context = createTestContext();
    try {
      createProtocolizationCase(context, {
        ...validInput(),
        profile: { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: 'latest' },
      });
      throw new Error('expected the operation to fail');
    } catch (error) {
      expect((error as ProtocolizationCaseError).code).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase);
      expect((error as ProtocolizationCaseError).details.reasonCodes).toContain(
        PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidProfileRef,
      );
    }
  });

  it.each([
    ['empty', ''],
    ['whitespace', 'case 0001'],
    ['a newline', 'case\n0001'],
    ['a path separator', 'case/0001'],
    ['a non-string', 42],
  ])('rejects a case id containing %s', (_label, caseId) => {
    const context = createTestContext();
    try {
      createProtocolizationCase(context, { ...validInput(), caseId: caseId as string });
      throw new Error('expected the operation to fail');
    } catch (error) {
      expect((error as ProtocolizationCaseError).details.reasonCodes).toContain(
        PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCaseId,
      );
    }
  });

  it.each([
    ['an absent subject reference', {}],
    ['a malformed sovereign asset id', { subjectRef: { sovereignAssetId: 'not-an-id' } }],
    ['a blank external reference namespace', {
      subjectRef: { sovereignAssetId: TEST_SOVEREIGN_ASSET_ID, externalReference: { namespace: '', id: 'x' } },
    }],
    ['a present-but-undefined content identity', {
      subjectRef: { sovereignAssetId: TEST_SOVEREIGN_ASSET_ID },
      contentIdentity: undefined,
    }],
    ['a malformed content digest', {
      subjectRef: { sovereignAssetId: TEST_SOVEREIGN_ASSET_ID },
      contentIdentity: { algorithm: 'sha256', digest: 'short' },
    }],
    ['an unknown field', {
      subjectRef: { sovereignAssetId: TEST_SOVEREIGN_ASSET_ID },
      assetCategory: 'smuggled',
    }],
  ])('rejects %s as a subject binding', (_label, subject) => {
    const context = createTestContext();
    try {
      createProtocolizationCase(context, { ...validInput(), subject: subject as never });
      throw new Error('expected the operation to fail');
    } catch (error) {
      expect((error as ProtocolizationCaseError).details.reasonCodes).toContain(
        PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidSubject,
      );
    }
  });

  it('accepts a subject with no content identity and no external reference', () => {
    // Identity material may legitimately be incomplete at intake; the profile
    // decides what must eventually arrive, not the aggregate.
    const context = createTestContext();
    const { protocolizationCase } = createProtocolizationCase(context, {
      ...validInput(),
      subject: TEST_BARE_SUBJECT,
    });

    expect(protocolizationCase.subject.contentIdentity).toBeUndefined();
    expect(protocolizationCase.subject.subjectRef.externalReference).toBeUndefined();
  });

  it('accepts an externally referenced subject with no content identity', () => {
    const context = createTestContext();
    const { protocolizationCase } = createProtocolizationCase(context, {
      ...validInput(),
      subject: TEST_EXTERNAL_SUBJECT,
    });

    expect(protocolizationCase.subject.subjectRef.externalReference).toEqual({
      namespace: 'test.namespace.external',
      id: 'test-entry-0001',
    });
    expect(protocolizationCase.subject.contentIdentity).toBeUndefined();
  });

  it('rejects a clock that returns a non-canonical instant instead of repairing it', () => {
    const context = { ...createTestContext(), clock: { now: () => '2026-01-01T00:00:00+01:00' } };
    expect(codeOf(() => createProtocolizationCase(context, validInput()))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp,
    );
  });

  it('carries the correlation id onto the case and its event when one is supplied', () => {
    const context = createTestContext();
    const { protocolizationCase, event } = createProtocolizationCase(context, {
      ...validInput(),
      correlationId: 'correlation-0001',
    });

    expect(protocolizationCase.correlationId).toBe('correlation-0001');
    expect(event.correlationId).toBe('correlation-0001');
  });

  it('omits an absent correlation id structurally rather than emitting undefined', () => {
    const context = createTestContext();
    const { protocolizationCase } = createProtocolizationCase(context, validInput());

    expect(Object.prototype.hasOwnProperty.call(protocolizationCase, 'correlationId')).toBe(false);
  });
});
