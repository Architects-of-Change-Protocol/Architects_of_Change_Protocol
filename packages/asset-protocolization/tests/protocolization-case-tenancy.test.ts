import {
  PROTOCOLIZATION_CASE_ERROR_CODES,
  ProtocolizationCaseError,
  ProtocolizationMaterialKind,
  activateProtocolizationCase,
  addProtocolizationCaseMaterial,
  associateProtocolizationCaseMaterial,
  cancelProtocolizationCase,
  createInMemoryProtocolizationCaseRepository,
  createProtocolizationCase,
} from '@aoc/asset-protocolization';
import type {
  AssetProfileCatalog,
  ProtocolizationCase,
  ProtocolizationCaseRepository,
} from '@aoc/asset-protocolization';

import {
  TENANT_A,
  TENANT_B,
  TEST_CONTENT_IDENTITY,
  TEST_CONTENT_SUBJECT,
  createTestCatalog,
  createTestClock,
  createTestContext,
} from './fixtures/test-cases';
import type { TestContext } from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1 } from './fixtures/test-profiles';

const PROFILE_PIN = {
  profileId: TEST_CONTENT_SHAPE_V1.profileId,
  profileVersion: TEST_CONTENT_SHAPE_V1.version,
};

const codeOf = (run: () => unknown): string => {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ProtocolizationCaseError);
    return (error as ProtocolizationCaseError).code;
  }
  throw new Error('expected the operation to fail');
};

describe('ProtocolizationCase tenant isolation', () => {
  let catalog: AssetProfileCatalog;
  let contextA: TestContext;
  let contextB: TestContext;
  let caseOfA: ProtocolizationCase;
  let repository: ProtocolizationCaseRepository;

  beforeEach(() => {
    catalog = createTestCatalog();
    const clock = createTestClock();
    contextA = createTestContext(TENANT_A, catalog, clock);
    contextB = createTestContext(TENANT_B, catalog, clock);
    caseOfA = createProtocolizationCase(contextA, {
      caseId: 'case-shared-id',
      profile: PROFILE_PIN,
      subject: TEST_CONTENT_SUBJECT,
    }).protocolizationCase;
    repository = createInMemoryProtocolizationCaseRepository();
    repository.save(caseOfA);
  });

  it('binds the case to the creating tenant, immutably', () => {
    expect(caseOfA.tenantId).toBe(TENANT_A);
    expect(() => {
      (caseOfA as { tenantId: string }).tenantId = TENANT_B;
    }).toThrow(TypeError);
    expect(caseOfA.tenantId).toBe(TENANT_A);
  });

  it('lets the owning tenant retrieve its own case', async () => {
    expect(await repository.get(TENANT_A, 'case-shared-id')).toEqual(caseOfA);
    expect(await repository.exists(TENANT_A, 'case-shared-id')).toBe(true);
  });

  it('does not let another tenant retrieve it, even knowing the case id', async () => {
    expect(await repository.get(TENANT_B, 'case-shared-id')).toBeUndefined();
    expect(await repository.exists(TENANT_B, 'case-shared-id')).toBe(false);
  });

  it('scopes case identity per tenant, so the same case id is two different cases', async () => {
    const caseOfB = createProtocolizationCase(contextB, {
      caseId: 'case-shared-id',
      profile: PROFILE_PIN,
      subject: TEST_CONTENT_SUBJECT,
    }).protocolizationCase;
    repository.save(caseOfB);

    expect((await repository.get(TENANT_A, 'case-shared-id'))?.tenantId).toBe(TENANT_A);
    expect((await repository.get(TENANT_B, 'case-shared-id'))?.tenantId).toBe(TENANT_B);
  });

  it('does not let another tenant activate it', () => {
    expect(codeOf(() => activateProtocolizationCase(contextB, caseOfA))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch,
    );
  });

  it('does not let another tenant attach material to it', () => {
    expect(
      codeOf(() =>
        addProtocolizationCaseMaterial(contextB, caseOfA, {
          materialId: 'material-0001',
          kind: ProtocolizationMaterialKind.ContentIdentity,
          requirementIds: ['identity.content.required'],
          contentIdentity: TEST_CONTENT_IDENTITY,
        }),
      ),
    ).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch);
  });

  it('does not let another tenant associate further requirements on its material', () => {
    const withMaterial = addProtocolizationCaseMaterial(contextA, caseOfA, {
      materialId: 'material-0001',
      kind: ProtocolizationMaterialKind.Evidence,
      requirementIds: ['evidence.provenance.minimum'],
      evidenceRef: 'evidence-0001',
    }).protocolizationCase;

    expect(
      codeOf(() =>
        associateProtocolizationCaseMaterial(contextB, withMaterial, {
          materialId: 'material-0001',
          requirementIds: ['declaration.authorship.required'],
        }),
      ),
    ).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch);
  });

  it('does not let another tenant cancel it', () => {
    expect(codeOf(() => cancelProtocolizationCase(contextB, caseOfA))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch,
    );
  });

  it('offers no repository lookup that omits the tenant', () => {
    // A `get(caseId)` overload would be a bypass waiting to be called; the
    // contract's method arity is the enforcement.
    expect(repository.get.length).toBe(2);
    expect(repository.exists.length).toBe(2);
  });

  it('rejects a blank tenant at the repository boundary as well as at the aggregate', () => {
    expect(codeOf(() => repository.get('', 'case-shared-id'))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTenant,
    );
    expect(codeOf(() => repository.exists(undefined as never, 'case-shared-id'))).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidTenant,
    );
  });
});
