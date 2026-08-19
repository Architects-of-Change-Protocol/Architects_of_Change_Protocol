import {
  ProtocolizationCaseState,
  VERIFICATION_ERROR_CODES,
  VerificationCheckOutcome,
  ProtocolizationMaterialKind,
  activateProtocolizationCase,
  addProtocolizationCaseMaterial,
  cancelProtocolizationCase,
  createInMemoryVerificationResultRepository,
  createProtocolizationCase,
  executeProtocolizationVerificationCheck,
  listProtocolizationVerificationPlan,
  runProtocolizationVerification,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import { sync } from './fixtures/test-declarations';
import {
  TEST_CHECK_ALPHA,
  TEST_CHECK_FAIL,
  TEST_CONTENT_IDENTITY_FOR_BYTES,
  TEST_DIGESTIBLE_SUBJECT,
  TEST_VERIFICATION_OPTIONAL_SHAPE_V1,
  TEST_VERIFICATION_SHAPE_V1,
  createVerificationContext,
} from './fixtures/test-verification';
import type { VerificationTestContext } from './fixtures/test-verification';

function openCase(
  context: VerificationTestContext,
  profileId: string = TEST_VERIFICATION_SHAPE_V1.profileId,
): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId: 'case-lifecycle-001',
    profile: { profileId, profileVersion: '1.0.0' },
    subject: TEST_DIGESTIBLE_SUBJECT,
  }).protocolizationCase;
}

describe('verification and the case lifecycle', () => {
  it('verifies a Draft case', async () => {
    const context = createVerificationContext();
    const drafted = openCase(context);
    expect(drafted.state).toBe(ProtocolizationCaseState.Draft);

    const { result } = await executeProtocolizationVerificationCheck(context, drafted, {
      executionId: 'execution-draft',
      requirementId: 'verification.alpha',
      checkId: TEST_CHECK_ALPHA,
    });

    expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
  });

  it('verifies an Active case', async () => {
    const context = createVerificationContext();
    const drafted = openCase(context);
    context.clock.advance(60);
    const active = activateProtocolizationCase(context, drafted).protocolizationCase;

    const { result } = await executeProtocolizationVerificationCheck(context, active, {
      executionId: 'execution-active',
      requirementId: 'verification.alpha',
      checkId: TEST_CHECK_ALPHA,
    });

    expect(active.state).toBe(ProtocolizationCaseState.Active);
    expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
    expect(result.evaluatedCaseRevision).toBe(active.revision);
  });

  it('refuses a new execution against a Cancelled case', async () => {
    const context = createVerificationContext();
    const drafted = openCase(context);
    context.clock.advance(60);
    const cancelled = cancelProtocolizationCase(context, drafted, {
      reason: 'Test-only cancellation.',
    }).protocolizationCase;

    await expect(
      executeProtocolizationVerificationCheck(context, cancelled, {
        executionId: 'execution-cancelled',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      }),
    ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.caseCancelled }));

    await expect(
      runProtocolizationVerification(context, cancelled, { executionIds: [] }),
    ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.caseCancelled }));
  });

  it('keeps results recorded before cancellation readable and auditable', async () => {
    const repository = createInMemoryVerificationResultRepository();
    const context = createVerificationContext();
    const drafted = openCase(context);

    const { result } = await executeProtocolizationVerificationCheck(context, drafted, {
      executionId: 'execution-before-cancel',
      requirementId: 'verification.alpha',
      checkId: TEST_CHECK_ALPHA,
    });
    repository.save(result);

    context.clock.advance(60);
    const cancelled = cancelProtocolizationCase(context, drafted).protocolizationCase;
    expect(cancelled.state).toBe(ProtocolizationCaseState.Cancelled);

    // Refusing new executions is not hiding old ones.
    expect(sync(repository.get(result.tenantId, 'execution-before-cancel'))).toEqual(result);
    expect(sync(repository.listByCase(result.tenantId, result.caseId))).toHaveLength(1);
  });

  it('adds no lifecycle state of its own', () => {
    // APV-09 owns the full state machine. APV-07 introduces no EVIDENCE_PENDING,
    // VERIFICATION_PENDING, REVIEW_PENDING, READY, PROTOCOLIZING, PROTOCOLIZED,
    // REJECTED, SUSPENDED, SUPERSEDED or ARCHIVED.
    expect(Object.values(ProtocolizationCaseState).sort()).toEqual([
      'Active',
      'Cancelled',
      'Draft',
    ]);
  });

  describe('architecture proof — FAIL does not transition the case', () => {
    it('leaves a Draft case Draft', async () => {
      const context = createVerificationContext();
      const drafted = openCase(context);

      const { result } = await executeProtocolizationVerificationCheck(context, drafted, {
        executionId: 'execution-fail-draft',
        requirementId: 'verification.suite',
        checkId: TEST_CHECK_FAIL,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Fail);
      expect(drafted.state).toBe(ProtocolizationCaseState.Draft);
      expect(drafted.cancelledAt).toBeUndefined();
      expect(drafted.cancellationReason).toBeUndefined();
    });

    it('leaves an Active case Active', async () => {
      const context = createVerificationContext();
      const drafted = openCase(context);
      context.clock.advance(60);
      const active = activateProtocolizationCase(context, drafted).protocolizationCase;
      const before = JSON.stringify(active);

      await executeProtocolizationVerificationCheck(context, active, {
        executionId: 'execution-fail-active',
        requirementId: 'verification.suite',
        checkId: TEST_CHECK_FAIL,
      });

      expect(active.state).toBe(ProtocolizationCaseState.Active);
      expect(JSON.stringify(active)).toBe(before);
    });

    it('leaves a whole failing batch with the case untouched', async () => {
      const context = createVerificationContext();
      const drafted = openCase(context);
      const before = JSON.stringify(drafted);
      const plan = listProtocolizationVerificationPlan(context, drafted);

      const run = await runProtocolizationVerification(context, drafted, {
        executionIds: plan.map((_, index) => `execution-batch-fail-${index}`),
      });

      expect(
        run.results.some((result) => result.outcome === VerificationCheckOutcome.Fail),
      ).toBe(true);
      expect(JSON.stringify(drafted)).toBe(before);
      expect(drafted.state).toBe(ProtocolizationCaseState.Draft);
    });
  });

  describe('obligation semantics', () => {
    it('does not reject anything when an Optional verification check fails', async () => {
      const context = createVerificationContext();
      const drafted = openCase(context, TEST_VERIFICATION_OPTIONAL_SHAPE_V1.profileId);

      const { result } = await executeProtocolizationVerificationCheck(context, drafted, {
        executionId: 'execution-optional-fail',
        requirementId: 'verification.optional',
        checkId: TEST_CHECK_FAIL,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Fail);
      expect(drafted.state).toBe(ProtocolizationCaseState.Draft);
      // The result carries no obligation-derived conclusion of its own: the
      // profile's obligation stays in the profile, where exactly one copy lives.
      expect(Object.keys(result)).not.toContain('obligation');
      expect(Object.keys(result)).not.toContain('required');
    });

    it('reports an unresolved condition rather than silently passing it', async () => {
      const context = createVerificationContext();
      const drafted = openCase(context, TEST_VERIFICATION_OPTIONAL_SHAPE_V1.profileId);
      context.clock.advance(60);
      const withIdentity = addProtocolizationCaseMaterial(context, drafted, {
        materialId: 'material-identity-001',
        kind: ProtocolizationMaterialKind.ContentIdentity,
        requirementIds: ['identity.content.required'],
        contentIdentity: TEST_CONTENT_IDENTITY_FOR_BYTES,
      }).protocolizationCase;

      const { result } = await executeProtocolizationVerificationCheck(context, withIdentity, {
        executionId: 'execution-conditional',
        requirementId: 'verification.present',
        checkId: 'check.material.present',
      });

      // Every `Required` requirement now has material, so nothing has failed.
      // What is left is a conditional evidence requirement with no material and
      // no evaluated condition — which might be irrelevant to this case or a
      // genuine gap, and nothing available can tell the two apart.
      expect(result.outcome).toBe(VerificationCheckOutcome.ManualReview);
      expect(result.reasonCode).toBe('condition.unresolved');
      expect(result.outcome).not.toBe(VerificationCheckOutcome.Pass);
      expect(result.inputRefs).toEqual([
        { kind: 'Requirement', ref: 'evidence.supplementary.conditional' },
      ]);
    });
  });
});
