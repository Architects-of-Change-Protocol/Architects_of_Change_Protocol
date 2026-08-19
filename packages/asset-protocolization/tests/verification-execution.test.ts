import {
  PROTOCOLIZATION_CASE_ERROR_CODES,
  PROTOCOLIZATION_VERIFICATION_EVENT_TYPES,
  PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION,
  ProtocolizationCaseState,
  VERIFICATION_ERROR_CODES,
  VerificationCheckOutcome,
  createProtocolizationCase,
  createVerificationCheckRegistry,
  executeProtocolizationVerificationCheck,
  listProtocolizationVerificationPlan,
  runProtocolizationVerification,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import { TENANT_A } from './fixtures/test-cases';
import {
  TEST_CHECK_ALPHA,
  TEST_CHECK_BETA,
  TEST_CHECK_FAIL,
  TEST_CHECK_GAMMA,
  TEST_CHECK_MANUAL_REVIEW,
  TEST_CHECK_PASS,
  TEST_CHECK_UNAVAILABLE,
  TEST_CHECK_UNREGISTERED,
  TEST_CHECK_WARNING,
  TEST_DIGESTIBLE_SUBJECT,
  TEST_VERIFICATION_ALL_PASS_SHAPE_V1,
  TEST_VERIFICATION_CHECKS,
  TEST_VERIFICATION_MIXED_SHAPE_V1,
  TEST_VERIFICATION_SHAPE_V1,
  TEST_VERIFICATION_SHAPE_V1_AT_2_0_0,
  TEST_VERIFICATION_UNREGISTERED_SHAPE_V1,
  createVerificationCatalog,
  createVerificationContext,
  testAsyncCheck,
  testMalformedOutcomeCheck,
  testThrowingCheck,
  testUnknownFieldCheck,
} from './fixtures/test-verification';
import type { VerificationTestContext } from './fixtures/test-verification';

function openCase(
  context: VerificationTestContext,
  profileId: string,
  profileVersion = '1.0.0',
  caseId = 'case-v001',
): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId,
    profile: { profileId, profileVersion },
    subject: TEST_DIGESTIBLE_SUBJECT,
  }).protocolizationCase;
}

describe('verification execution', () => {
  describe('architecture proof A — PASS', () => {
    it('executes a declared check and records exactly what it evaluated', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      const { result, event } = await executeProtocolizationVerificationCheck(
        context,
        protocolizationCase,
        {
          executionId: 'execution-0001',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_ALPHA,
          correlationId: 'request-0001',
        },
      );

      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
      expect(result.checkId).toBe(TEST_CHECK_ALPHA);
      expect(result.requirementId).toBe('verification.alpha');
      expect(result.profile).toEqual({
        profileId: TEST_VERIFICATION_SHAPE_V1.profileId,
        profileVersion: '1.0.0',
      });
      expect(result.evaluatedCaseRevision).toBe(protocolizationCase.revision);
      expect(result.tenantId).toBe(TENANT_A);
      expect(result.caseId).toBe(protocolizationCase.caseId);
      expect(result.executedAt).toBe('2026-01-01T00:00:00.000Z');
      expect(result.schemaVersion).toBe(PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION);
      expect(result.correlationId).toBe('request-0001');

      expect(event.eventType).toBe(PROTOCOLIZATION_VERIFICATION_EVENT_TYPES.checkExecuted);
      expect(event.occurredAt).toBe(result.executedAt);
      expect(event.evaluatedCaseRevision).toBe(result.evaluatedCaseRevision);
    });

    it('produces a deeply frozen result carrying no readiness, approval or attestation', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      const { result } = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
        executionId: 'execution-0001',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });

      expect(Object.isFrozen(result)).toBe(true);
      expect(() => {
        (result as { outcome: string }).outcome = VerificationCheckOutcome.Fail;
      }).toThrow();

      for (const forbidden of [
        'ready',
        'approved',
        'attested',
        'verified',
        'satisfied',
        'passed',
        'protocolized',
        'reviewer',
        'signature',
      ]) {
        expect(Object.keys(result)).not.toContain(forbidden);
      }
    });

    it('leaves the case byte-for-byte unchanged, at the same revision', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);
      const before = JSON.stringify(protocolizationCase);

      await executeProtocolizationVerificationCheck(context, protocolizationCase, {
        executionId: 'execution-0001',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });

      expect(JSON.stringify(protocolizationCase)).toBe(before);
      expect(protocolizationCase.revision).toBe(1);
      expect(protocolizationCase.state).toBe(ProtocolizationCaseState.Draft);
    });
  });

  describe('architecture proof B — FAIL', () => {
    it('records a failure without cancelling, rejecting or emptying the case', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);
      const before = JSON.stringify(protocolizationCase);

      const { result } = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
        executionId: 'execution-0002',
        requirementId: 'verification.suite',
        checkId: TEST_CHECK_FAIL,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Fail);
      expect(result.reasonCode).toBe('test.fail');
      expect(protocolizationCase.state).toBe(ProtocolizationCaseState.Draft);
      expect(protocolizationCase.cancelledAt).toBeUndefined();
      expect(JSON.stringify(protocolizationCase)).toBe(before);
    });

    it('is not an error — a Fail is a completed execution', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-0002',
          requirementId: 'verification.suite',
          checkId: TEST_CHECK_FAIL,
        }),
      ).resolves.toBeDefined();
    });
  });

  describe('architecture proof C — WARNING', () => {
    it('stays a Warning and is never rounded to Pass or Fail', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      const { result, event } = await executeProtocolizationVerificationCheck(
        context,
        protocolizationCase,
        {
          executionId: 'execution-0003',
          requirementId: 'verification.suite',
          checkId: TEST_CHECK_WARNING,
        },
      );

      expect(result.outcome).toBe(VerificationCheckOutcome.Warning);
      expect(result.outcome).not.toBe(VerificationCheckOutcome.Pass);
      expect(result.outcome).not.toBe(VerificationCheckOutcome.Fail);
      expect(event.outcome).toBe(VerificationCheckOutcome.Warning);
    });
  });

  describe('architecture proof D — MANUAL_REVIEW', () => {
    it('records the question without creating an attestation, approval or reviewer', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      const { result } = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
        executionId: 'execution-0004',
        requirementId: 'verification.suite',
        checkId: TEST_CHECK_MANUAL_REVIEW,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.ManualReview);

      const serialized = JSON.stringify(result).toLowerCase();
      for (const forbidden of ['attest', 'approv', 'reviewer', 'notar', 'signature', 'queue']) {
        expect(serialized).not.toContain(forbidden);
      }
      // The attestation requirement the profile declares is untouched.
      const attestation = protocolizationCase.requirementStates.find(
        (state) => state.requirementId === 'attestation.professional.required',
      );
      expect(attestation?.materialIds).toEqual([]);
    });
  });

  describe('architecture proof E — UNAVAILABLE', () => {
    it('is distinct from Fail when a dependency cannot be consulted', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      const { result } = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
        executionId: 'execution-0005',
        requirementId: 'verification.suite',
        checkId: TEST_CHECK_UNAVAILABLE,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Unavailable);
      expect(result.outcome).not.toBe(VerificationCheckOutcome.Fail);
      expect(result.reasonCode).toBe('dependency.unavailable');
    });
  });

  describe('architecture proof F — check not registered', () => {
    it('fails deterministically instead of fabricating an Unavailable result', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(
        context,
        TEST_VERIFICATION_UNREGISTERED_SHAPE_V1.profileId,
      );

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-0006',
          requirementId: 'verification.unregistered',
          checkId: TEST_CHECK_UNREGISTERED,
        }),
      ).rejects.toThrow(
        expect.objectContaining({ code: VERIFICATION_ERROR_CODES.checkNotRegistered }),
      );
    });

    it('fails the whole batch rather than silently skipping the missing check', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(
        context,
        TEST_VERIFICATION_UNREGISTERED_SHAPE_V1.profileId,
      );

      await expect(
        runProtocolizationVerification(context, protocolizationCase, {
          executionIds: ['execution-0006'],
        }),
      ).rejects.toThrow(
        expect.objectContaining({ code: VERIFICATION_ERROR_CODES.checkNotRegistered }),
      );
    });
  });

  describe('architecture proof G — undeclared check', () => {
    it('refuses a globally registered check the requirement does not declare', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      // `test.check.gamma` is registered and perfectly functional. Knowing that
      // is worth nothing: this requirement declares only `test.check.alpha`.
      expect(context.checks.has(TEST_CHECK_GAMMA)).toBe(true);

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-0007',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_GAMMA,
        }),
      ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.checkNotDeclared }));
    });

    it('refuses a check declared by a different requirement of the same profile', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      // `test.check.pass` is declared — by `verification.suite`, not by
      // `verification.alpha`. Correlation is to the requirement that asked.
      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-0008',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_PASS,
        }),
      ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.checkNotDeclared }));
    });

    it('rejects before executing anything', async () => {
      let executed = false;
      const registry = createVerificationCheckRegistry([
        ...TEST_VERIFICATION_CHECKS.filter((check) => check.checkId !== TEST_CHECK_GAMMA),
        {
          checkId: TEST_CHECK_GAMMA,
          execute: () => {
            executed = true;
            return { outcome: VerificationCheckOutcome.Pass };
          },
        },
      ]);
      const context = createVerificationContext({ checks: registry });
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-0009',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_GAMMA,
        }),
      ).rejects.toThrow();
      expect(executed).toBe(false);
    });
  });

  describe('architecture proof I — pinned profile version', () => {
    it('executes the pinned version’s checks even once a later version is catalogued', async () => {
      const catalog = createVerificationCatalog();
      catalog.register(TEST_VERIFICATION_SHAPE_V1_AT_2_0_0);
      const context = createVerificationContext({ catalog });
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId, '1.0.0');

      // 1.0.0 declares alpha for `verification.alpha`; 2.0.0 declares beta.
      const { result } = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
        executionId: 'execution-0010',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });
      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
      expect(result.profile.profileVersion).toBe('1.0.0');

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-0011',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_BETA,
        }),
      ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.checkNotDeclared }));
    });

    it('plans from the pinned version, never the latest', async () => {
      const catalog = createVerificationCatalog();
      catalog.register(TEST_VERIFICATION_SHAPE_V1_AT_2_0_0);
      const context = createVerificationContext({ catalog });

      const pinnedToV1 = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId, '1.0.0', 'case-v1');
      const pinnedToV2 = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId, '2.0.0', 'case-v2');

      expect(
        listProtocolizationVerificationPlan(context, pinnedToV1)
          .filter((entry) => entry.requirementId === 'verification.alpha')
          .map((entry) => entry.checkId),
      ).toEqual([TEST_CHECK_ALPHA]);
      expect(
        listProtocolizationVerificationPlan(context, pinnedToV2)
          .filter((entry) => entry.requirementId === 'verification.alpha')
          .map((entry) => entry.checkId),
      ).toEqual([TEST_CHECK_BETA]);
    });

    it('fails loudly when the pinned version has been withdrawn from the catalogue', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);
      const emptied = createVerificationContext({ catalog: createVerificationCatalog() });
      const withoutProfile = {
        ...emptied,
        catalog: {
          ...emptied.catalog,
          get: () => undefined,
        },
      } as VerificationTestContext;

      await expect(
        executeProtocolizationVerificationCheck(withoutProfile, protocolizationCase, {
          executionId: 'execution-0012',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_ALPHA,
        }),
      ).rejects.toThrow(
        expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound }),
      );
    });
  });

  describe('batch execution', () => {
    it('runs every declared check in profile order and stops at no failure', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);
      const plan = listProtocolizationVerificationPlan(context, protocolizationCase);

      const run = await runProtocolizationVerification(context, protocolizationCase, {
        executionIds: plan.map((_, index) => `execution-batch-${index}`),
      });

      expect(run.results).toHaveLength(6);
      expect(run.results.map((result) => result.outcome)).toEqual([
        VerificationCheckOutcome.Pass,
        VerificationCheckOutcome.Pass,
        VerificationCheckOutcome.Fail,
        VerificationCheckOutcome.Warning,
        VerificationCheckOutcome.ManualReview,
        VerificationCheckOutcome.Unavailable,
      ]);
      expect(run.evaluatedCaseRevision).toBe(protocolizationCase.revision);
      run.results.forEach((result) => {
        expect(result.evaluatedCaseRevision).toBe(run.evaluatedCaseRevision);
        expect(result.executedAt).toBe(run.executedAt);
      });
    });

    it('produces no aggregate verdict', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_ALL_PASS_SHAPE_V1.profileId);
      const plan = listProtocolizationVerificationPlan(context, protocolizationCase);

      const run = await runProtocolizationVerification(context, protocolizationCase, {
        executionIds: plan.map((_, index) => `execution-pass-${index}`),
      });

      expect(run.results.every((result) => result.outcome === VerificationCheckOutcome.Pass)).toBe(
        true,
      );
      expect(Object.keys(run).sort()).toEqual([
        'evaluatedCaseRevision',
        'events',
        'executedAt',
        'results',
      ]);
    });

    it('requires exactly one distinct execution id per plan entry', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      await expect(
        runProtocolizationVerification(context, protocolizationCase, {
          executionIds: ['only-one'],
        }),
      ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.invalidRequest }));

      await expect(
        runProtocolizationVerification(context, protocolizationCase, {
          executionIds: new Array(6).fill('same-id'),
        }),
      ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.invalidRequest }));
    });

    it('does not change the case, whatever the outcomes were', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);
      const before = JSON.stringify(protocolizationCase);
      const plan = listProtocolizationVerificationPlan(context, protocolizationCase);

      await runProtocolizationVerification(context, protocolizationCase, {
        executionIds: plan.map((_, index) => `execution-untouched-${index}`),
      });

      expect(JSON.stringify(protocolizationCase)).toBe(before);
      expect(protocolizationCase.revision).toBe(1);
    });
  });

  describe('executor contract', () => {
    it('accepts an asynchronous executor without the engine changing', async () => {
      const registry = createVerificationCheckRegistry([...TEST_VERIFICATION_CHECKS]);
      const catalog = createVerificationCatalog();
      const context = createVerificationContext({ catalog, checks: registry });
      const protocolizationCase = openCase(context, TEST_VERIFICATION_MIXED_SHAPE_V1.profileId);

      expect(registry.get(testAsyncCheck.checkId)).toBeDefined();
      const { result } = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
        executionId: 'execution-async',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });
      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
    });

    it('refuses an outcome outside the closed set', async () => {
      const registry = createVerificationCheckRegistry([...TEST_VERIFICATION_CHECKS]);
      registry.register({ ...testMalformedOutcomeCheck, checkId: TEST_CHECK_GAMMA + '.x' });
      const context = createVerificationContext({ checks: registry });
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      const swapped = createVerificationCheckRegistry([
        ...TEST_VERIFICATION_CHECKS.filter((check) => check.checkId !== TEST_CHECK_ALPHA),
        { ...testMalformedOutcomeCheck, checkId: TEST_CHECK_ALPHA },
      ]);
      const malformedContext = createVerificationContext({ checks: swapped });

      await expect(
        executeProtocolizationVerificationCheck(malformedContext, protocolizationCase, {
          executionId: 'execution-malformed',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_ALPHA,
        }),
      ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.invalidExecution }));
      expect(context.checks.has(TEST_CHECK_ALPHA)).toBe(true);
    });

    it('refuses an execution carrying a field the result model does not have', async () => {
      const swapped = createVerificationCheckRegistry([
        ...TEST_VERIFICATION_CHECKS.filter((check) => check.checkId !== TEST_CHECK_ALPHA),
        { ...testUnknownFieldCheck, checkId: TEST_CHECK_ALPHA },
      ]);
      const context = createVerificationContext({ checks: swapped });
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-unknown-field',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_ALPHA,
        }),
      ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.invalidExecution }));
    });

    it('lets a defective executor throw rather than laundering the bug into Unavailable', async () => {
      const swapped = createVerificationCheckRegistry([
        ...TEST_VERIFICATION_CHECKS.filter((check) => check.checkId !== TEST_CHECK_ALPHA),
        { ...testThrowingCheck, checkId: TEST_CHECK_ALPHA },
      ]);
      const context = createVerificationContext({ checks: swapped });
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-throws',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_ALPHA,
        }),
      ).rejects.toThrow(TypeError);
    });
  });

  describe('request admission', () => {
    it('refuses a malformed execution id, requirement id, check id or correlation id', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      const base = {
        executionId: 'execution-0100',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      };

      for (const override of [
        { executionId: '' },
        { executionId: 'has space' },
        { requirementId: 'Not.A.Dotted.Token' },
        { checkId: 'Not A Check' },
        { correlationId: '   ' },
      ]) {
        await expect(
          executeProtocolizationVerificationCheck(context, protocolizationCase, {
            ...base,
            ...override,
          } as never),
        ).rejects.toThrow(
          expect.objectContaining({ code: VERIFICATION_ERROR_CODES.invalidRequest }),
        );
      }
    });

    it('refuses a requirement id the pinned profile does not declare', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-0101',
          requirementId: 'verification.nonexistent',
          checkId: TEST_CHECK_ALPHA,
        }),
      ).rejects.toThrow(
        expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement }),
      );
    });

    it('refuses a clock earlier than the case it is verifying', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openCase(context, TEST_VERIFICATION_SHAPE_V1.profileId);
      context.clock.set('2025-01-01T00:00:00.000Z');

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-0102',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_ALPHA,
        }),
      ).rejects.toThrow(
        expect.objectContaining({ code: VERIFICATION_ERROR_CODES.invalidTimestamp }),
      );
    });
  });
});
