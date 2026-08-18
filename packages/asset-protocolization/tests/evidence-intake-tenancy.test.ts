import {
  EVIDENCE_INTAKE_ERROR_CODES,
  EvidenceIntakeError,
  PROTOCOLIZATION_CASE_ERROR_CODES,
  createInMemoryEvidenceIntakeRepository,
  createProtocolizationCase,
  intakeProtocolizationEvidence,
} from '@aoc/asset-protocolization';
import type {
  EvidenceIntakeReceipt,
  EvidenceIntakeRepository,
  ProtocolizationCase,
} from '@aoc/asset-protocolization';

import {
  TENANT_A,
  TENANT_B,
  TEST_CONTENT_SUBJECT,
  createTestCatalog,
  createTestClock,
  createTestContext,
} from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1 } from './fixtures/test-profiles';
import { TEST_SECOND_EVIDENCE_ID, referencedSubmission } from './fixtures/test-evidence';

/**
 * Tenant isolation for the intake layer.
 *
 * Intake is tenant-bound in the domain and in the repository contract, not by
 * a caller remembering to filter. Knowing another tenant's case id, intake id
 * or evidence reference must be worth exactly nothing.
 */

const CONTENT_PIN = { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: '1.0.0' };

/** Two tenants, one catalogue, one clock — so instants are comparable across both. */
function twoTenants() {
  const catalog = createTestCatalog();
  const clock = createTestClock();
  return {
    clock,
    a: createTestContext(TENANT_A, catalog, clock),
    b: createTestContext(TENANT_B, catalog, clock),
  };
}

function openCase(context: ReturnType<typeof createTestContext>, caseId: string): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId,
    profile: CONTENT_PIN,
    subject: TEST_CONTENT_SUBJECT,
  }).protocolizationCase;
}

function store(): { repository: EvidenceIntakeRepository; save: (receipt: EvidenceIntakeReceipt) => void } {
  const repository = createInMemoryEvidenceIntakeRepository();
  return { repository, save: (receipt) => repository.save(receipt) as void };
}

describe('intake tenant isolation', () => {
  it('lets a tenant intake evidence into its own case', () => {
    const { a } = twoTenants();
    const { receipt } = intakeProtocolizationEvidence(
      a,
      openCase(a, 'case-a'),
      referencedSubmission({ caseId: 'case-a' }),
    );

    expect(receipt.tenantId).toBe(TENANT_A);
  });

  it('refuses a cross-tenant intake', () => {
    const { a, b } = twoTenants();
    const tenantACase = openCase(a, 'case-a');

    expect(() =>
      intakeProtocolizationEvidence(b, tenantACase, referencedSubmission({ caseId: 'case-a' })),
    ).toThrow(expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch }));
  });

  it('refuses a blank or malformed acting tenant', () => {
    const catalog = createTestCatalog();
    const clock = createTestClock();
    const valid = createTestContext(TENANT_A, catalog, clock);
    const tenantACase = openCase(valid, 'case-a');

    for (const tenantId of ['', '   \t', 'tenant a', 'tenant\nb']) {
      const context = { catalog, clock, tenantId };
      expect(() =>
        intakeProtocolizationEvidence(context, tenantACase, referencedSubmission({ caseId: 'case-a' })),
      ).toThrow(EvidenceIntakeError);
    }
  });

  it('rejects a cross-tenant call before reading anything off the case', () => {
    const { a, b } = twoTenants();
    const tenantACase = intakeProtocolizationEvidence(
      a,
      openCase(a, 'case-a'),
      referencedSubmission({ caseId: 'case-a' }),
    ).protocolizationCase;

    // Tenant B replays tenant A's evidence reference. The tenant gate fires
    // first, so B never learns whether that reference is already in the case —
    // the duplicate-evidence code would have told it.
    try {
      intakeProtocolizationEvidence(
        b,
        tenantACase,
        referencedSubmission({ caseId: 'case-a', intakeId: 'intake-0002', materialId: 'material-0002' }),
      );
      throw new Error('expected intake to fail');
    } catch (error) {
      expect((error as { code: string }).code).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch);
      expect((error as { code: string }).code).not.toBe(
        EVIDENCE_INTAKE_ERROR_CODES.duplicateEvidence,
      );
    }
  });
});

describe('evidence intake repository tenancy', () => {
  it('does not expose another tenant’s receipt, even by exact intake id', () => {
    const { a, b } = twoTenants();
    const { repository, save } = store();

    const { receipt } = intakeProtocolizationEvidence(
      a,
      openCase(a, 'case-a'),
      referencedSubmission({ caseId: 'case-a' }),
    );
    save(receipt);

    expect(repository.get(TENANT_A, receipt.intakeId)).toEqual(receipt);
    expect(repository.get(TENANT_B, receipt.intakeId)).toBeUndefined();
    expect(repository.exists(TENANT_A, receipt.intakeId)).toBe(true);
    expect(repository.exists(TENANT_B, receipt.intakeId)).toBe(false);
    expect(b.tenantId).toBe(TENANT_B);
  });

  it('does not enumerate another tenant’s case, even by exact case id', () => {
    const { a } = twoTenants();
    const { repository, save } = store();

    const { receipt } = intakeProtocolizationEvidence(
      a,
      openCase(a, 'case-a'),
      referencedSubmission({ caseId: 'case-a' }),
    );
    save(receipt);

    expect(repository.listByCase(TENANT_A, 'case-a')).toEqual([receipt]);
    // Indistinguishable, on purpose, from a case that simply has no intakes.
    expect(repository.listByCase(TENANT_B, 'case-a')).toEqual([]);
  });

  it('requires a tenant on every retrieval', () => {
    const { repository } = store();

    for (const method of ['get', 'exists', 'listByCase'] as const) {
      expect(() => repository[method]('', 'anything')).toThrow(
        expect.objectContaining({ code: EVIDENCE_INTAKE_ERROR_CODES.invalidTenant }),
      );
    }
  });

  it('lets two tenants use the same intake id without colliding', () => {
    const { a, b } = twoTenants();
    const { repository, save } = store();

    const first = intakeProtocolizationEvidence(
      a,
      openCase(a, 'case-a'),
      referencedSubmission({ caseId: 'case-a' }),
    );
    const second = intakeProtocolizationEvidence(
      b,
      openCase(b, 'case-b'),
      referencedSubmission({ caseId: 'case-b', evidenceRef: TEST_SECOND_EVIDENCE_ID }),
    );

    expect(first.receipt.intakeId).toBe(second.receipt.intakeId);
    save(first.receipt);
    save(second.receipt);

    expect(repository.get(TENANT_A, 'intake-0001')).toEqual(first.receipt);
    expect(repository.get(TENANT_B, 'intake-0001')).toEqual(second.receipt);
  });
});

describe('evidence intake repository is append-only', () => {
  it('refuses a duplicate (tenantId, intakeId) rather than overwriting', () => {
    const { a } = twoTenants();
    const { repository, save } = store();

    const { receipt } = intakeProtocolizationEvidence(
      a,
      openCase(a, 'case-a'),
      referencedSubmission({ caseId: 'case-a' }),
    );
    save(receipt);

    expect(() => save(receipt)).toThrow(
      expect.objectContaining({ code: EVIDENCE_INTAKE_ERROR_CODES.duplicateIntake }),
    );
    expect(repository.get(TENANT_A, receipt.intakeId)).toEqual(receipt);
  });

  it('offers no update and no delete', () => {
    const { repository } = store();
    expect(Object.keys(repository).sort()).toEqual(['exists', 'get', 'listByCase', 'save']);
  });

  it('refuses to store a malformed receipt', () => {
    const { a } = twoTenants();
    const { repository, save } = store();

    const { receipt } = intakeProtocolizationEvidence(
      a,
      openCase(a, 'case-a'),
      referencedSubmission({ caseId: 'case-a' }),
    );

    expect(() => save({ ...receipt, tenantId: '' } as EvidenceIntakeReceipt)).toThrow(
      expect.objectContaining({ code: EVIDENCE_INTAKE_ERROR_CODES.invalidReceipt }),
    );
    expect(repository.listByCase(TENANT_A, 'case-a')).toEqual([]);
  });

  it('freezes what it stores', () => {
    const { a } = twoTenants();
    const { repository, save } = store();

    const { receipt } = intakeProtocolizationEvidence(
      a,
      openCase(a, 'case-a'),
      referencedSubmission({ caseId: 'case-a' }),
    );
    save(receipt);

    const stored = repository.get(TENANT_A, receipt.intakeId) as EvidenceIntakeReceipt;
    expect(Object.isFrozen(stored)).toBe(true);
  });
});
