import {
  DECLARATION_ERROR_CODES,
  DeclarationError,
  PROTOCOLIZATION_CASE_ERROR_CODES,
  createInMemoryDeclarationRepository,
  createProtocolizationCase,
  recordProtocolizationDeclaration,
} from '@aoc/asset-protocolization';
import type {
  DeclarationRepository,
  ProtocolizationCase,
  ProtocolizationDeclarationRecord,
} from '@aoc/asset-protocolization';

import {
  TENANT_A,
  TENANT_B,
  TEST_CONTENT_SUBJECT,
  createTestCatalog,
  createTestClock,
  createTestContext,
} from './fixtures/test-cases';
import {
  TEST_DECLARATION_SHAPE_V1,
  referencedDeclaration,
  sync,
} from './fixtures/test-declarations';

/**
 * Tenant isolation across the declaration layer.
 *
 * The tenant is the workflow isolation boundary and nothing else. It is not the
 * declarant, no participant identity is ever derived from it, and knowing
 * another tenant's identifiers must be worth nothing.
 */

const DECLARATION_PIN = { profileId: TEST_DECLARATION_SHAPE_V1.profileId, profileVersion: '1.0.0' };

function openCase(
  context: ReturnType<typeof createTestContext>,
  caseId: string,
): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId,
    profile: DECLARATION_PIN,
    subject: TEST_CONTENT_SUBJECT,
  }).protocolizationCase;
}

describe('domain tenant gate', () => {
  it('records a declaration for the tenant that owns the case', () => {
    const context = createTestContext(TENANT_A);
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context, 'case-a'),
      referencedDeclaration({ caseId: 'case-a' }),
    );

    expect(record.tenantId).toBe(TENANT_A);
  });

  it('refuses a declaration into another tenant’s case', () => {
    const catalog = createTestCatalog();
    const clock = createTestClock();
    const tenantA = createTestContext(TENANT_A, catalog, clock);
    const tenantB = createTestContext(TENANT_B, catalog, clock);
    const caseA = openCase(tenantA, 'case-a');

    expect(() =>
      recordProtocolizationDeclaration(
        tenantB,
        caseA,
        referencedDeclaration({ caseId: 'case-a' }),
      ),
    ).toThrow(expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch }));

    // And it left the case exactly as it was.
    expect(caseA.revision).toBe(1);
    expect(caseA.materials).toEqual([]);
  });

  it('checks the tenant before anything else, so nothing about the case leaks', () => {
    const catalog = createTestCatalog();
    const clock = createTestClock();
    const tenantA = createTestContext(TENANT_A, catalog, clock);
    const tenantB = createTestContext(TENANT_B, catalog, clock);
    const caseA = openCase(tenantA, 'case-a');

    // A submission that is *also* structurally hopeless still fails on the
    // tenant, so a cross-tenant caller cannot use the error code to learn
    // whether their guesses about the case were right.
    try {
      recordProtocolizationDeclaration(tenantB, caseA, {
        pathway: 'Reference',
      } as never);
      throw new Error('expected the declaration to fail');
    } catch (error) {
      expect(error).toMatchObject({ code: PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch });
    }
  });

  it.each([
    ['a blank tenant', ''],
    ['whitespace', '   '],
    ['a non-string', 42],
  ])('refuses %s as the acting tenant', (_label, tenantId) => {
    const context = createTestContext(TENANT_A);
    const caseA = openCase(context, 'case-a');
    const blankContext = { ...context, tenantId: tenantId as string };

    expect(() =>
      recordProtocolizationDeclaration(
        blankContext,
        caseA,
        referencedDeclaration({ caseId: 'case-a' }),
      ),
    ).toThrow(DeclarationError);
  });
});

describe('repository tenant scoping', () => {
  let repository: DeclarationRepository;
  let record: ProtocolizationDeclarationRecord;

  beforeEach(() => {
    repository = createInMemoryDeclarationRepository();
    const context = createTestContext(TENANT_A);
    record = recordProtocolizationDeclaration(
      context,
      openCase(context, 'case-a'),
      referencedDeclaration({ caseId: 'case-a' }),
    ).record;
    repository.save(record);
  });

  it('returns the record to its own tenant', () => {
    expect(repository.get(TENANT_A, 'declaration-0001')).toEqual(record);
    expect(repository.exists(TENANT_A, 'declaration-0001')).toBe(true);
  });

  it('hides it from every other tenant, even with the exact id', () => {
    expect(repository.get(TENANT_B, 'declaration-0001')).toBeUndefined();
    expect(repository.exists(TENANT_B, 'declaration-0001')).toBe(false);
  });

  it('hides it from another tenant’s enumeration, even with the exact case id', () => {
    expect(sync(repository.listByCase(TENANT_A, 'case-a'))).toEqual([record]);
    // Indistinguishable, on purpose, from a case with no declarations.
    expect(sync(repository.listByCase(TENANT_B, 'case-a'))).toEqual([]);
  });

  it('requires a tenant on every read path', () => {
    for (const method of ['get', 'exists', 'listByCase'] as const) {
      expect(() => repository[method]('' as string, 'declaration-0001')).toThrow(
        expect.objectContaining({ code: DECLARATION_ERROR_CODES.invalidTenant }),
      );
    }
  });

  it('lets two tenants hold the same declaration id without either observing the other', () => {
    const tenantB = createTestContext(TENANT_B);
    const other = recordProtocolizationDeclaration(
      tenantB,
      openCase(tenantB, 'case-b'),
      referencedDeclaration({ caseId: 'case-b' }),
    ).record;

    // Same `declarationId`, same `claimRef`, different tenant. Identity is
    // `(tenantId, declarationId)`: a global constraint would leak one tenant's
    // choice of identifier into another's failures.
    expect(other.declarationId).toBe(record.declarationId);
    expect(() => repository.save(other)).not.toThrow();

    expect(repository.get(TENANT_A, 'declaration-0001')).toEqual(record);
    expect(repository.get(TENANT_B, 'declaration-0001')).toEqual(other);
    expect(sync(repository.listByCase(TENANT_A, 'case-b'))).toEqual([]);
  });

  it('does not leak duplicate existence across a tenant boundary', () => {
    const tenantB = createTestContext(TENANT_B);
    const other = recordProtocolizationDeclaration(
      tenantB,
      openCase(tenantB, 'case-b'),
      referencedDeclaration({ caseId: 'case-b' }),
    ).record;
    repository.save(other);

    // Tenant A re-saving its own record still fails; tenant B's identical id
    // was irrelevant to that outcome, and tenant B never learned A's existed.
    expect(() => repository.save(record)).toThrow(
      expect.objectContaining({ code: DECLARATION_ERROR_CODES.duplicateDeclaration }),
    );
  });

  it('exposes no cross-tenant surface at all', () => {
    expect(Object.keys(repository).sort()).toEqual(['exists', 'get', 'listByCase', 'save']);
  });
});

describe('the tenant is not the declarant', () => {
  it('never derives the declarant from the tenant', () => {
    const context = createTestContext(TENANT_A);
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context, 'case-a'),
      referencedDeclaration({ caseId: 'case-a' }),
    );

    expect(record.tenantId).toBe(TENANT_A);
    expect(record.declarant.id).not.toBe(TENANT_A);
    expect(record.declarant.id).not.toContain(TENANT_A);
  });
});
