import {
  AssetRequirementKind,
  PROTOCOLIZATION_CASE_ERROR_CODES,
  ProtocolizationMaterialKind,
  ProtocolizationRequirementMaterialStatus,
  VERIFICATION_ERROR_CODES,
  VerificationCheckOutcome,
  addProtocolizationCaseMaterial,
  createProtocolizationCase,
  createVerificationCheckRegistry,
  executeProtocolizationVerificationCheck,
  listProtocolizationVerificationPlan,
  runProtocolizationVerification,
} from '@aoc/asset-protocolization';
import type {
  AssetProfileCatalog,
  ProtocolizationCase,
  ProtocolizationVerificationContext,
} from '@aoc/asset-protocolization';

import { TEST_CONTENT_IDENTITY } from './fixtures/test-cases';
import {
  TEST_CHECK_ALPHA,
  TEST_CHECK_BETA,
  TEST_CHECK_GAMMA,
  TEST_DIGESTIBLE_SUBJECT,
  TEST_VERIFICATION_CHECKS,
  TEST_VERIFICATION_DUPLICATE_SHAPE_V1,
  TEST_VERIFICATION_MIXED_SHAPE_V1,
  createVerificationCatalog,
  createVerificationContext,
} from './fixtures/test-verification';
import type { VerificationTestContext } from './fixtures/test-verification';

function openMixedCase(context: VerificationTestContext): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId: 'case-mixed-001',
    profile: { profileId: TEST_VERIFICATION_MIXED_SHAPE_V1.profileId, profileVersion: '1.0.0' },
    subject: TEST_DIGESTIBLE_SUBJECT,
  }).protocolizationCase;
}

/**
 * The requirement-kind compatibility regression suite.
 *
 * APV-06's targeted audit found that APV-04's `correlate` is kind-blind: it
 * moves *every* requirement id it is handed to `MaterialPresent`, so a
 * declaration offered against `[declarationRequirement, evidenceRequirement]`
 * left the case reporting evidence material that did not exist. This suite
 * proves APV-07 cannot reproduce that defect, and it is mandatory rather than
 * incidental.
 */
describe('verification requirement-kind compatibility', () => {
  describe('architecture proof H — mixed requirement kinds', () => {
    const incompatible: readonly { readonly requirementId: string; readonly kind: string }[] = [
      { requirementId: 'identity.content.required', kind: AssetRequirementKind.Identity },
      { requirementId: 'declaration.authorship.required', kind: AssetRequirementKind.Declaration },
      { requirementId: 'evidence.supporting.optional', kind: AssetRequirementKind.Evidence },
      { requirementId: 'attestation.review.optional', kind: AssetRequirementKind.Attestation },
    ];

    it.each(incompatible)(
      'refuses to execute a verification check against a $kind requirement',
      async ({ requirementId }) => {
        const context = createVerificationContext();
        const protocolizationCase = openMixedCase(context);

        await expect(
          executeProtocolizationVerificationCheck(context, protocolizationCase, {
            executionId: 'execution-mixed',
            requirementId,
            checkId: TEST_CHECK_ALPHA,
          }),
        ).rejects.toThrow(
          expect.objectContaining({ code: VERIFICATION_ERROR_CODES.incompatibleRequirement }),
        );
      },
    );

    it.each(incompatible)(
      'leaves a $kind requirement byte-for-byte unchanged after the refusal',
      async ({ requirementId }) => {
        const context = createVerificationContext();
        const protocolizationCase = openMixedCase(context);
        const before = JSON.stringify(protocolizationCase);

        await expect(
          executeProtocolizationVerificationCheck(context, protocolizationCase, {
            executionId: 'execution-mixed',
            requirementId,
            checkId: TEST_CHECK_ALPHA,
          }),
        ).rejects.toThrow();

        expect(JSON.stringify(protocolizationCase)).toBe(before);
        expect(protocolizationCase.revision).toBe(1);

        const state = protocolizationCase.requirementStates.find(
          (candidate) => candidate.requirementId === requirementId,
        );
        expect(state?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.Pending);
        expect(state?.materialIds).toEqual([]);
      },
    );

    it('rejects before the executor runs, so a refusal has no side effect at all', async () => {
      let executed = 0;
      const registry = createVerificationCheckRegistry([
        ...TEST_VERIFICATION_CHECKS.filter((check) => check.checkId !== TEST_CHECK_ALPHA),
        {
          checkId: TEST_CHECK_ALPHA,
          execute: () => {
            executed += 1;
            return { outcome: VerificationCheckOutcome.Pass };
          },
        },
      ]);
      const context = createVerificationContext({ checks: registry });
      const protocolizationCase = openMixedCase(context);

      for (const { requirementId } of incompatible) {
        await expect(
          executeProtocolizationVerificationCheck(context, protocolizationCase, {
            executionId: 'execution-mixed',
            requirementId,
            checkId: TEST_CHECK_ALPHA,
          }),
        ).rejects.toThrow();
      }
      expect(executed).toBe(0);
    });

    it('cannot express a mixture of requirement kinds at all', async () => {
      // The structural half of the answer: an execution names *one* requirement,
      // never a list, so `[verification, evidence]` is not a request this API
      // can carry. A caller that tries gets a malformed-request refusal.
      const context = createVerificationContext();
      const protocolizationCase = openMixedCase(context);

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-mixed-list',
          requirementId: ['verification.alpha', 'evidence.supporting.optional'],
          checkId: TEST_CHECK_ALPHA,
        } as never),
      ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.invalidRequest }));
    });

    it('never writes verification material into the case, so contamination is impossible', async () => {
      // The constructive half: even a successful execution writes nothing to the
      // case. There is no code path by which a verification result can mark any
      // requirement — of any kind — as `MaterialPresent`.
      const context = createVerificationContext();
      const protocolizationCase = openMixedCase(context);
      const plan = listProtocolizationVerificationPlan(context, protocolizationCase);

      const run = await runProtocolizationVerification(context, protocolizationCase, {
        executionIds: plan.map((_, index) => `execution-clean-${index}`),
      });

      expect(run.results.length).toBeGreaterThan(0);
      expect(protocolizationCase.materials).toEqual([]);
      for (const state of protocolizationCase.requirementStates) {
        expect(state.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.Pending);
      }
    });

    it('leaves genuinely present material of other kinds exactly as it was', async () => {
      const context = createVerificationContext();
      const opened = openMixedCase(context);
      context.clock.advance(60);
      const withIdentity = addProtocolizationCaseMaterial(context, opened, {
        materialId: 'material-identity-001',
        kind: ProtocolizationMaterialKind.ContentIdentity,
        requirementIds: ['identity.content.required'],
        contentIdentity: TEST_CONTENT_IDENTITY,
      }).protocolizationCase;
      const before = JSON.stringify(withIdentity);

      await executeProtocolizationVerificationCheck(context, withIdentity, {
        executionId: 'execution-untouched',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });

      expect(JSON.stringify(withIdentity)).toBe(before);
      const identity = withIdentity.requirementStates.find(
        (state) => state.requirementId === 'identity.content.required',
      );
      expect(identity?.materialIds).toEqual(['material-identity-001']);
    });
  });

  describe('check-id compatibility within verification requirements', () => {
    it('permits every check the requirement declares, as distinct results', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openMixedCase(context);

      const alpha = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
        executionId: 'execution-multi-1',
        requirementId: 'verification.secondary',
        checkId: TEST_CHECK_ALPHA,
      });
      const beta = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
        executionId: 'execution-multi-2',
        requirementId: 'verification.secondary',
        checkId: TEST_CHECK_BETA,
      });

      expect(alpha.result.executionId).not.toBe(beta.result.executionId);
      expect(alpha.result.checkId).toBe(TEST_CHECK_ALPHA);
      expect(beta.result.checkId).toBe(TEST_CHECK_BETA);
      expect(alpha.result.reasonCode).toBe('test.alpha.satisfied');
      expect(beta.result.reasonCode).toBe('test.beta.satisfied');
    });

    it('refuses a check the requirement does not declare, even a registered one', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openMixedCase(context);

      // `verification.alpha` declares only alpha; `verification.secondary`
      // declares alpha and beta. Gamma is registered and declared by neither.
      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-gamma',
          requirementId: 'verification.secondary',
          checkId: TEST_CHECK_GAMMA,
        }),
      ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.checkNotDeclared }));

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-beta-wrong-requirement',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_BETA,
        }),
      ).rejects.toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.checkNotDeclared }));
    });

    it('keeps results for one check id on two requirements unambiguous', async () => {
      // `test.check.alpha` is legitimately declared by both `verification.alpha`
      // and `verification.secondary`. Results are correlated by the pair, so one
      // requirement's finding can never stand in for the other's.
      const context = createVerificationContext();
      const protocolizationCase = openMixedCase(context);

      const first = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
        executionId: 'execution-pair-1',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });
      const second = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
        executionId: 'execution-pair-2',
        requirementId: 'verification.secondary',
        checkId: TEST_CHECK_ALPHA,
      });

      expect(first.result.checkId).toBe(second.result.checkId);
      expect(first.result.requirementId).not.toBe(second.result.requirementId);
    });
  });

  describe('duplicate declared check ids', () => {
    /**
     * `validateAssetProfile` rejects a requirement listing one check twice, so
     * this shape can only arrive from a reconstructed or corrupted document.
     * The catalogue is stubbed to hand it over precisely so the engine's own
     * refusal is exercised rather than the catalogue's.
     */
    function corruptedContext(): {
      readonly context: ProtocolizationVerificationContext;
      readonly protocolizationCase: ProtocolizationCase;
    } {
      const healthy = createVerificationContext();
      const protocolizationCase = createProtocolizationCase(healthy, {
        caseId: 'case-duplicate-001',
        profile: { profileId: TEST_VERIFICATION_MIXED_SHAPE_V1.profileId, profileVersion: '1.0.0' },
        subject: TEST_DIGESTIBLE_SUBJECT,
      }).protocolizationCase;

      const catalog: AssetProfileCatalog = {
        ...createVerificationCatalog(),
        get: () => ({
          ...TEST_VERIFICATION_DUPLICATE_SHAPE_V1,
          profileId: TEST_VERIFICATION_MIXED_SHAPE_V1.profileId,
          requirements: [
            ...TEST_VERIFICATION_MIXED_SHAPE_V1.requirements.filter(
              (requirement) => requirement.id !== 'verification.alpha',
            ),
            {
              id: 'verification.alpha',
              kind: AssetRequirementKind.Verification,
              obligation: 'Required',
              checkIds: [TEST_CHECK_ALPHA, TEST_CHECK_ALPHA],
              satisfaction: 'All',
            },
          ],
        }),
      } as unknown as AssetProfileCatalog;

      return { context: { ...healthy, catalog }, protocolizationCase };
    }

    it('fails loudly rather than executing the duplicate silently', async () => {
      const { context, protocolizationCase } = corruptedContext();

      await expect(
        executeProtocolizationVerificationCheck(context, protocolizationCase, {
          executionId: 'execution-duplicate',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_ALPHA,
        }),
      ).rejects.toThrow(
        expect.objectContaining({ code: VERIFICATION_ERROR_CODES.duplicateDeclaredCheck }),
      );
    });

    it('refuses to build a plan from a corrupted profile', () => {
      const { context, protocolizationCase } = corruptedContext();

      expect(() => listProtocolizationVerificationPlan(context, protocolizationCase)).toThrow(
        expect.objectContaining({ code: VERIFICATION_ERROR_CODES.duplicateDeclaredCheck }),
      );
    });
  });

  describe('case validity', () => {
    it('refuses to verify an aggregate whose own invariants are broken', async () => {
      const context = createVerificationContext();
      const protocolizationCase = openMixedCase(context);
      const broken = { ...protocolizationCase, revision: 0 } as ProtocolizationCase;

      await expect(
        executeProtocolizationVerificationCheck(context, broken, {
          executionId: 'execution-broken',
          requirementId: 'verification.alpha',
          checkId: TEST_CHECK_ALPHA,
        }),
      ).rejects.toThrow(
        expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase }),
      );
    });
  });
});
