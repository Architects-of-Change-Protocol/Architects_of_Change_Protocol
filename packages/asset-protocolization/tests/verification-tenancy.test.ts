import {
  EvidenceIntakePathway,
  ProtocolizationMaterialKind,
  VERIFICATION_ERROR_CODES,
  addProtocolizationCaseMaterial,
  VerificationCheckOutcome,
  createInMemoryVerificationResultRepository,
  createProtocolizationCase,
  createVerificationCheckRegistry,
  executeProtocolizationVerificationCheck,
  intakeProtocolizationEvidence,
  listProtocolizationVerificationPlan,
  recordProtocolizationDeclaration,
  runProtocolizationVerification,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import { TENANT_A, TENANT_B } from './fixtures/test-cases';
import { TEST_CATEGORY_DOCUMENT, TEST_EVIDENCE_ID } from './fixtures/test-evidence';
import { TEST_CLAIM_ID, TEST_DECLARANT_A, sync } from './fixtures/test-declarations';
import {
  TEST_CHECK_ALPHA,
  TEST_DIGESTIBLE_SUBJECT,
  TEST_VERIFICATION_SHAPE_V1,
  createVerificationContext,
} from './fixtures/test-verification';
import type { VerificationTestContext } from './fixtures/test-verification';
import { ClaimType } from '@aoc/protocol/claims';
import { DeclarationPathway } from '@aoc/asset-protocolization';

function openCase(context: VerificationTestContext, caseId: string): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId,
    profile: { profileId: TEST_VERIFICATION_SHAPE_V1.profileId, profileVersion: '1.0.0' },
    subject: TEST_DIGESTIBLE_SUBJECT,
  }).protocolizationCase;
}

describe('verification tenant isolation', () => {
  it('lets a tenant execute against its own case', async () => {
    const context = createVerificationContext({ tenantId: TENANT_A });
    const owned = openCase(context, 'case-a-001');

    const { result } = await executeProtocolizationVerificationCheck(context, owned, {
      executionId: 'execution-a-001',
      requirementId: 'verification.alpha',
      checkId: TEST_CHECK_ALPHA,
    });

    expect(result.tenantId).toBe(TENANT_A);
  });

  it('refuses a tenant executing against another tenant’s case', async () => {
    const ownerContext = createVerificationContext({ tenantId: TENANT_A });
    const owned = openCase(ownerContext, 'case-a-001');
    const intruder = createVerificationContext({
      tenantId: TENANT_B,
      catalog: ownerContext.catalog,
      clock: ownerContext.clock,
      checks: ownerContext.checks,
    });

    await expect(
      executeProtocolizationVerificationCheck(intruder, owned, {
        executionId: 'execution-b-001',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      }),
    ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.tenantMismatch }));
  });

  it('gates on the tenant before inspecting anything about the case', async () => {
    const ownerContext = createVerificationContext({ tenantId: TENANT_A });
    const owned = openCase(ownerContext, 'case-a-001');
    const intruder = createVerificationContext({
      tenantId: TENANT_B,
      catalog: ownerContext.catalog,
      clock: ownerContext.clock,
      checks: ownerContext.checks,
    });

    // A nonexistent requirement *and* a foreign tenant: the tenant refusal wins,
    // so a caller cannot probe another tenant's profile shape through error
    // differences.
    await expect(
      executeProtocolizationVerificationCheck(intruder, owned, {
        executionId: 'execution-b-002',
        requirementId: 'verification.does-not-exist',
        checkId: TEST_CHECK_ALPHA,
      }),
    ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.tenantMismatch }));

    expect(() => listProtocolizationVerificationPlan(intruder, owned)).toThrow(
      expect.objectContaining({ code: VERIFICATION_ERROR_CODES.tenantMismatch }),
    );
  });

  it('refuses a batch run across a tenant boundary', async () => {
    const ownerContext = createVerificationContext({ tenantId: TENANT_A });
    const owned = openCase(ownerContext, 'case-a-001');
    const intruder = createVerificationContext({
      tenantId: TENANT_B,
      catalog: ownerContext.catalog,
      clock: ownerContext.clock,
      checks: ownerContext.checks,
    });

    await expect(
      runProtocolizationVerification(intruder, owned, { executionIds: [] }),
    ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.tenantMismatch }));
  });

  it('refuses an acting tenant that is missing or blank', async () => {
    const context = createVerificationContext({ tenantId: TENANT_A });
    const owned = openCase(context, 'case-a-001');
    const blank = { ...context, tenantId: '' } as VerificationTestContext;

    await expect(
      executeProtocolizationVerificationCheck(blank, owned, {
        executionId: 'execution-blank',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      }),
    ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.invalidTenant }));
  });

  it('refuses supplied inputs belonging to another tenant', async () => {
    // Without this gate, cross-tenant isolation would be advisory: a caller
    // could hand the engine another tenant's receipts under cover of a case it
    // does own.
    const contextA = createVerificationContext({ tenantId: TENANT_A });
    const caseA = openCase(contextA, 'case-a-001');

    const contextB = createVerificationContext({
      tenantId: TENANT_B,
      catalog: contextA.catalog,
      clock: contextA.clock,
      checks: contextA.checks,
    });
    const caseB = openCase(contextB, 'case-b-001');
    contextB.clock.advance(60);
    const intake = intakeProtocolizationEvidence(contextB, caseB, {
      intakeId: 'intake-b-001',
      caseId: caseB.caseId,
      materialId: 'material-b-001',
      categoryId: TEST_CATEGORY_DOCUMENT,
      pathway: EvidenceIntakePathway.Reference,
      evidenceRef: TEST_EVIDENCE_ID,
      requirementIds: ['evidence.provenance.minimum'],
    });

    await expect(
      executeProtocolizationVerificationCheck(contextA, caseA, {
        executionId: 'execution-a-002',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
        evidenceReceipts: [intake.receipt],
      }),
    ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.tenantMismatch }));
  });

  it('refuses supplied declarations belonging to another tenant', async () => {
    const contextA = createVerificationContext({ tenantId: TENANT_A });
    const caseA = openCase(contextA, 'case-a-001');

    const contextB = createVerificationContext({
      tenantId: TENANT_B,
      catalog: contextA.catalog,
      clock: contextA.clock,
      checks: contextA.checks,
    });
    const caseB = openCase(contextB, 'case-b-001');
    contextB.clock.advance(60);
    const declared = recordProtocolizationDeclaration(contextB, caseB, {
      declarationId: 'declaration-b-001',
      caseId: caseB.caseId,
      materialId: 'material-bd-001',
      declarant: TEST_DECLARANT_A,
      pathway: DeclarationPathway.Reference,
      claimRef: TEST_CLAIM_ID,
      claimType: ClaimType.Authorship,
      requirementIds: ['declaration.authorship.required'],
    });

    await expect(
      executeProtocolizationVerificationCheck(contextA, caseA, {
        executionId: 'execution-a-003',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
        declarations: [declared.record],
      }),
    ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.tenantMismatch }));
  });

  it('refuses supplied inputs belonging to another case of the same tenant', async () => {
    const context = createVerificationContext({ tenantId: TENANT_A });
    const first = openCase(context, 'case-a-001');
    const second = openCase(context, 'case-a-002');
    context.clock.advance(60);
    const intake = intakeProtocolizationEvidence(context, second, {
      intakeId: 'intake-a-002',
      caseId: second.caseId,
      materialId: 'material-a-002',
      categoryId: TEST_CATEGORY_DOCUMENT,
      pathway: EvidenceIntakePathway.Reference,
      evidenceRef: TEST_EVIDENCE_ID,
      requirementIds: ['evidence.provenance.minimum'],
    });

    await expect(
      executeProtocolizationVerificationCheck(context, first, {
        executionId: 'execution-a-004',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
        evidenceReceipts: [intake.receipt],
      }),
    ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.caseMismatch }));
  });

  it('keeps one tenant’s results unreadable and unenumerable by another', async () => {
    const repository = createInMemoryVerificationResultRepository();
    const contextA = createVerificationContext({ tenantId: TENANT_A });
    const caseA = openCase(contextA, 'case-a-001');

    const { result } = await executeProtocolizationVerificationCheck(contextA, caseA, {
      executionId: 'execution-a-005',
      requirementId: 'verification.alpha',
      checkId: TEST_CHECK_ALPHA,
    });
    repository.save(result);

    // Knowing tenant A's execution id and case id is worth nothing to tenant B.
    expect(sync(repository.get(TENANT_B, 'execution-a-005'))).toBeUndefined();
    expect(sync(repository.exists(TENANT_B, 'execution-a-005'))).toBe(false);
    expect(sync(repository.listByCase(TENANT_B, 'case-a-001'))).toEqual([]);
    expect(
      sync(
        repository.listByRequirementCheck(
          TENANT_B,
          'case-a-001',
          'verification.alpha',
          TEST_CHECK_ALPHA,
        ),
      ),
    ).toEqual([]);
  });

  it('makes a foreign case indistinguishable from a case with no executions', () => {
    const repository = createInMemoryVerificationResultRepository();

    expect(sync(repository.listByCase(TENANT_B, 'case-a-001'))).toEqual(
      sync(repository.listByCase(TENANT_B, 'case-that-never-existed')),
    );
  });

  it('hands a check one tenant and one case, and no way to reach a second of either', async () => {
    const context = createVerificationContext({ tenantId: TENANT_A });
    const owned = openCase(context, 'case-a-001');
    context.clock.advance(60);
    const withMaterial = addProtocolizationCaseMaterial(context, owned, {
      materialId: 'material-a-010',
      kind: ProtocolizationMaterialKind.Evidence,
      requirementIds: ['evidence.provenance.minimum'],
      evidenceRef: TEST_EVIDENCE_ID,
    }).protocolizationCase;

    let observed: Record<string, unknown> | undefined;
    const registry = createVerificationCheckRegistry([
      {
        checkId: TEST_CHECK_ALPHA,
        execute: (checkContext) => {
          observed = checkContext as unknown as Record<string, unknown>;
          return { outcome: VerificationCheckOutcome.Pass };
        },
      },
    ]);
    const observing = createVerificationContext({
      tenantId: TENANT_A,
      catalog: context.catalog,
      clock: context.clock,
      checks: registry,
    });

    await executeProtocolizationVerificationCheck(observing, withMaterial, {
      executionId: 'execution-a-011',
      requirementId: 'verification.alpha',
      checkId: TEST_CHECK_ALPHA,
      evidenceReceipts: [],
      declarations: [],
    });

    expect(observed?.tenantId).toBe(TENANT_A);
    expect(observed?.caseId).toBe('case-a-001');
    // No repository, no catalogue, no clock port, no second case, no tenant
    // registry: the whole surface a check can reach is this list.
    expect(Object.keys(observed ?? {}).sort()).toEqual([
      'assetProfile',
      'caseId',
      'caseRevision',
      'caseState',
      'checkId',
      'declarations',
      'evidenceReceipts',
      'materials',
      'now',
      'profile',
      'requirement',
      'requirementId',
      'requirementProgress',
      'resolvers',
      'subject',
      'tenantId',
    ]);
    // And it is frozen, so a check cannot edit the case's material list.
    expect(Object.isFrozen(observed)).toBe(true);
    expect(Object.isFrozen(observed?.materials)).toBe(true);
  });
});
