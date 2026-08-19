import {
  ProtocolizationMaterialKind,
  VerificationCheckOutcome,
  addProtocolizationCaseMaterial,
  countVerificationOutcomes,
  createProtocolizationCase,
  createVerificationCheckRegistry,
  executeProtocolizationVerificationCheck,
  isVerificationResultCurrentForRevision,
  listLatestVerificationResults,
  listProtocolizationVerificationPlan,
  listVerificationResultsForRevision,
  runProtocolizationVerification,
} from '@aoc/asset-protocolization';
import type {
  AssetVerificationCheck,
  ProtocolizationCase,
  ProtocolizationVerificationResult,
} from '@aoc/asset-protocolization';

import { TEST_CONTENT_IDENTITY } from './fixtures/test-cases';
import { TEST_EVIDENCE_ID, TEST_SECOND_EVIDENCE_ID } from './fixtures/test-evidence';
import {
  TEST_CHECK_ALPHA,
  TEST_DIGESTIBLE_SUBJECT,
  TEST_VERIFICATION_CHECKS,
  TEST_VERIFICATION_SHAPE_V1,
  createVerificationContext,
} from './fixtures/test-verification';
import type { VerificationTestContext } from './fixtures/test-verification';

/** A check whose outcome the test decides, so re-execution can legitimately differ. */
function switchableCheck(state: { outcome: VerificationCheckOutcome }): AssetVerificationCheck {
  return { checkId: TEST_CHECK_ALPHA, execute: () => ({ outcome: state.outcome }) };
}

function openCase(context: VerificationTestContext): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId: 'case-history-001',
    profile: { profileId: TEST_VERIFICATION_SHAPE_V1.profileId, profileVersion: '1.0.0' },
    subject: TEST_DIGESTIBLE_SUBJECT,
  }).protocolizationCase;
}

describe('verification result history', () => {
  describe('architecture proof J — result basis', () => {
    it('binds a result to the revision it evaluated, and never re-points it', async () => {
      const context = createVerificationContext();
      const opened = openCase(context);

      const first = await executeProtocolizationVerificationCheck(context, opened, {
        executionId: 'execution-rev-1',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });
      expect(first.result.evaluatedCaseRevision).toBe(1);

      // The case moves on: new evidence arrives, producing revision 2.
      context.clock.advance(3600);
      const advanced = addProtocolizationCaseMaterial(context, opened, {
        materialId: 'material-e001',
        kind: ProtocolizationMaterialKind.Evidence,
        requirementIds: ['evidence.provenance.minimum'],
        evidenceRef: TEST_EVIDENCE_ID,
      }).protocolizationCase;
      expect(advanced.revision).toBe(2);

      // The old result is untouched, and still describes revision 1.
      expect(first.result.evaluatedCaseRevision).toBe(1);
      expect(isVerificationResultCurrentForRevision(first.result, advanced.revision)).toBe(false);
      expect(isVerificationResultCurrentForRevision(first.result, 1)).toBe(true);

      // Re-running binds to the new revision.
      const second = await executeProtocolizationVerificationCheck(context, advanced, {
        executionId: 'execution-rev-2',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });
      expect(second.result.evaluatedCaseRevision).toBe(2);
      expect(isVerificationResultCurrentForRevision(second.result, advanced.revision)).toBe(true);
    });

    it('exposes enough basis to say which contract and which state it evaluated', async () => {
      const context = createVerificationContext();
      const opened = openCase(context);

      const { result } = await executeProtocolizationVerificationCheck(context, opened, {
        executionId: 'execution-basis',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });

      // The check contract: exact profile version, requirement, check id.
      expect(result.profile.profileId).toBe(TEST_VERIFICATION_SHAPE_V1.profileId);
      expect(result.profile.profileVersion).toBe('1.0.0');
      expect(result.requirementId).toBe('verification.alpha');
      expect(result.checkId).toBe(TEST_CHECK_ALPHA);
      // The state: revision and instant.
      expect(typeof result.evaluatedCaseRevision).toBe('number');
      expect(result.executedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('records the material a check actually read, as references rather than copies', async () => {
      const context = createVerificationContext();
      const opened = openCase(context);
      context.clock.advance(60);
      const withEvidence = addProtocolizationCaseMaterial(context, opened, {
        materialId: 'material-e001',
        kind: ProtocolizationMaterialKind.Evidence,
        requirementIds: ['evidence.provenance.minimum'],
        evidenceRef: TEST_EVIDENCE_ID,
      }).protocolizationCase;

      const registry = createVerificationCheckRegistry([
        ...TEST_VERIFICATION_CHECKS.filter((check) => check.checkId !== TEST_CHECK_ALPHA),
        {
          checkId: TEST_CHECK_ALPHA,
          execute: (checkContext) => ({
            outcome: VerificationCheckOutcome.Pass,
            inputRefs: checkContext.materials.map((material) => ({
              kind: 'Material' as const,
              ref: material.materialId,
            })),
          }),
        },
      ]);
      const citing = createVerificationContext({ checks: registry, clock: context.clock });

      const { result } = await executeProtocolizationVerificationCheck(citing, withEvidence, {
        executionId: 'execution-refs',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });

      expect(result.inputRefs).toEqual([{ kind: 'Material', ref: 'material-e001' }]);
      // References, not payload: no evidence document is anywhere in the result.
      expect(JSON.stringify(result)).not.toContain('description');
    });
  });

  describe('architecture proof K — re-execution history', () => {
    it('keeps a Pass from yesterday beside a Fail from today', async () => {
      const outcome: { outcome: VerificationCheckOutcome } = {
        outcome: VerificationCheckOutcome.Pass,
      };
      const registry = createVerificationCheckRegistry([
        ...TEST_VERIFICATION_CHECKS.filter((check) => check.checkId !== TEST_CHECK_ALPHA),
        switchableCheck(outcome),
      ]);
      const context = createVerificationContext({ checks: registry });
      const opened = openCase(context);

      const passed = await executeProtocolizationVerificationCheck(context, opened, {
        executionId: 'execution-t1',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });

      context.clock.advance(86400);
      const advanced = addProtocolizationCaseMaterial(context, opened, {
        materialId: 'material-e002',
        kind: ProtocolizationMaterialKind.Evidence,
        requirementIds: ['evidence.provenance.minimum'],
        evidenceRef: TEST_SECOND_EVIDENCE_ID,
      }).protocolizationCase;

      outcome.outcome = VerificationCheckOutcome.Fail;
      const failed = await executeProtocolizationVerificationCheck(context, advanced, {
        executionId: 'execution-t2',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });

      // Two immutable facts, neither overwriting the other.
      expect(passed.result.outcome).toBe(VerificationCheckOutcome.Pass);
      expect(passed.result.evaluatedCaseRevision).toBe(1);
      expect(passed.result.executedAt).toBe('2026-01-01T00:00:00.000Z');

      expect(failed.result.outcome).toBe(VerificationCheckOutcome.Fail);
      expect(failed.result.evaluatedCaseRevision).toBe(2);
      expect(failed.result.executedAt).toBe('2026-01-02T00:00:00.000Z');

      expect(passed.result.executionId).not.toBe(failed.result.executionId);
    });

    it('offers no way to mutate a result after the fact', async () => {
      const context = createVerificationContext();
      const opened = openCase(context);
      const { result } = await executeProtocolizationVerificationCheck(context, opened, {
        executionId: 'execution-frozen',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });

      expect(Object.isFrozen(result)).toBe(true);
      for (const field of ['outcome', 'evaluatedCaseRevision', 'executedAt', 'checkId'] as const) {
        expect(() => {
          (result as unknown as Record<string, unknown>)[field] = 'tampered';
        }).toThrow();
      }
    });
  });

  describe('projections', () => {
    async function twoRounds(): Promise<readonly ProtocolizationVerificationResult[]> {
      const outcome: { outcome: VerificationCheckOutcome } = {
        outcome: VerificationCheckOutcome.Pass,
      };
      const registry = createVerificationCheckRegistry([
        ...TEST_VERIFICATION_CHECKS.filter((check) => check.checkId !== TEST_CHECK_ALPHA),
        switchableCheck(outcome),
      ]);
      const context = createVerificationContext({ checks: registry });
      const opened = openCase(context);

      const first = await executeProtocolizationVerificationCheck(context, opened, {
        executionId: 'execution-p1',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });

      context.clock.advance(3600);
      const advanced = addProtocolizationCaseMaterial(context, opened, {
        materialId: 'material-e003',
        kind: ProtocolizationMaterialKind.Evidence,
        requirementIds: ['evidence.provenance.minimum'],
        evidenceRef: TEST_EVIDENCE_ID,
      }).protocolizationCase;

      outcome.outcome = VerificationCheckOutcome.Fail;
      const second = await executeProtocolizationVerificationCheck(context, advanced, {
        executionId: 'execution-p2',
        requirementId: 'verification.alpha',
        checkId: TEST_CHECK_ALPHA,
      });

      return [first.result, second.result];
    }

    it('selects the results that evaluated one exact revision', async () => {
      const results = await twoRounds();

      expect(listVerificationResultsForRevision(results, 1).map((r) => r.executionId)).toEqual([
        'execution-p1',
      ]);
      expect(listVerificationResultsForRevision(results, 2).map((r) => r.executionId)).toEqual([
        'execution-p2',
      ]);
      expect(listVerificationResultsForRevision(results, 3)).toEqual([]);
    });

    it('projects a latest view without touching the history it reads', async () => {
      const results = await twoRounds();
      const before = JSON.stringify(results);

      const latest = listLatestVerificationResults(results);

      expect(latest).toHaveLength(1);
      expect(latest[0].executionId).toBe('execution-p2');
      expect(latest[0].outcome).toBe(VerificationCheckOutcome.Fail);
      // The earlier Pass is still there, unchanged.
      expect(JSON.stringify(results)).toBe(before);
      expect(results[0].outcome).toBe(VerificationCheckOutcome.Pass);
    });

    it('keys the latest view by (requirementId, checkId), not by check alone', async () => {
      const results = await twoRounds();
      const borrowed: ProtocolizationVerificationResult = {
        ...results[0],
        executionId: 'execution-other-requirement',
        requirementId: 'verification.suite',
      };

      expect(listLatestVerificationResults([...results, borrowed])).toHaveLength(2);
    });

    it('counts outcomes without collapsing any of them', async () => {
      const context = createVerificationContext();
      const opened = openCase(context);
      const plan = listProtocolizationVerificationPlan(context, opened);
      const run = await runProtocolizationVerification(context, opened, {
        executionIds: plan.map((_, index) => `execution-count-${index}`),
      });

      const counts = countVerificationOutcomes(run.results);

      expect(counts).toEqual({
        Pass: 2,
        Fail: 1,
        Warning: 1,
        ManualReview: 1,
        Unavailable: 1,
      });
      // Every member is reported separately: a single Warning is still visible
      // beside the passes rather than averaged away.
      expect(counts.Warning).toBe(1);
      expect(counts.ManualReview).toBe(1);
      expect(counts.Unavailable).toBe(1);
    });

    it('reports zero counts rather than omitting an outcome', () => {
      expect(countVerificationOutcomes([])).toEqual({
        Pass: 0,
        Fail: 0,
        Warning: 0,
        ManualReview: 0,
        Unavailable: 0,
      });
    });

    it('returns a frozen tally carrying no verdict, score or percentage', async () => {
      const results = await twoRounds();
      const counts = countVerificationOutcomes(results);

      expect(Object.isFrozen(counts)).toBe(true);
      expect(Object.keys(counts).sort()).toEqual([
        'Fail',
        'ManualReview',
        'Pass',
        'Unavailable',
        'Warning',
      ]);
    });
  });
});
