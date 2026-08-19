import {
  PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION,
  VERIFICATION_ERROR_CODES,
  VERIFICATION_VALIDATION_CODES,
  VerificationCheckOutcome,
  VerificationInputKind,
  createInMemoryVerificationResultRepository,
  isValidProtocolizationVerificationResult,
  reconstituteProtocolizationVerificationResult,
  validateProtocolizationVerificationResult,
  validateVerificationCheckExecution,
} from '@aoc/asset-protocolization';
import type { ProtocolizationVerificationResult } from '@aoc/asset-protocolization';

import { TENANT_A, TENANT_B } from './fixtures/test-cases';
import { sync } from './fixtures/test-declarations';

function testResult(
  overrides: Partial<ProtocolizationVerificationResult> = {},
): ProtocolizationVerificationResult {
  return {
    schemaVersion: PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION,
    executionId: 'execution-0001',
    tenantId: TENANT_A,
    caseId: 'case-0001',
    profile: { profileId: 'test.verification.v1', profileVersion: '1.0.0' },
    requirementId: 'verification.alpha',
    checkId: 'test.check.alpha',
    evaluatedCaseRevision: 1,
    outcome: VerificationCheckOutcome.Pass,
    executedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('verification result validation', () => {
  it('admits a well-formed result', () => {
    expect(validateProtocolizationVerificationResult(testResult())).toEqual({
      admitted: true,
      reasons: [],
    });
    expect(isValidProtocolizationVerificationResult(testResult())).toBe(true);
  });

  it('rejects a non-object', () => {
    for (const value of [undefined, null, 'result', 7, []]) {
      expect(validateProtocolizationVerificationResult(value).reasons).toEqual([
        VERIFICATION_VALIDATION_CODES.notAnObject,
      ]);
    }
  });

  it('rejects an unknown field rather than ignoring it', () => {
    const result = { ...testResult(), verdict: 'READY' };

    expect(validateProtocolizationVerificationResult(result).reasons).toContain(
      VERIFICATION_VALIDATION_CODES.unknownField,
    );
  });

  it('rejects an outcome outside the closed set', () => {
    for (const outcome of ['Verified', 'Failed', 'Pending', 'PASS', 'Excellent', true, 1]) {
      expect(
        validateProtocolizationVerificationResult(
          testResult({ outcome } as unknown as Partial<ProtocolizationVerificationResult>),
        ).reasons,
      ).toContain(VERIFICATION_VALIDATION_CODES.invalidOutcome);
    }
  });

  it('rejects a case revision that cannot exist', () => {
    for (const evaluatedCaseRevision of [0, -1, 1.5, Number.NaN, '1' as unknown as number]) {
      expect(
        validateProtocolizationVerificationResult(testResult({ evaluatedCaseRevision })).reasons,
      ).toContain(VERIFICATION_VALIDATION_CODES.invalidCaseRevision);
    }
  });

  it('rejects a non-canonical execution instant', () => {
    for (const executedAt of ['2026-01-01', '2026-01-01T00:00:00+02:00', '2026-02-31T00:00:00Z', '']) {
      expect(validateProtocolizationVerificationResult(testResult({ executedAt })).reasons).toContain(
        VERIFICATION_VALIDATION_CODES.invalidExecutedAt,
      );
    }
  });

  it('rejects a malformed reason code, summary and input ref', () => {
    expect(
      validateProtocolizationVerificationResult(testResult({ reasonCode: 'Not A Token' })).reasons,
    ).toContain(VERIFICATION_VALIDATION_CODES.invalidReasonCode);
    expect(
      validateProtocolizationVerificationResult(testResult({ summary: '   ' })).reasons,
    ).toContain(VERIFICATION_VALIDATION_CODES.invalidSummary);
    expect(
      validateProtocolizationVerificationResult(testResult({ summary: 'x'.repeat(2000) })).reasons,
    ).toContain(VERIFICATION_VALIDATION_CODES.invalidSummary);
    expect(
      validateProtocolizationVerificationResult(
        testResult({ inputRefs: [{ kind: 'Whatever', ref: 'x' }] as never }),
      ).reasons,
    ).toContain(VERIFICATION_VALIDATION_CODES.invalidInputRefs);
    expect(
      validateProtocolizationVerificationResult(
        testResult({ inputRefs: [{ kind: VerificationInputKind.Material, ref: '' }] }),
      ).reasons,
    ).toContain(VERIFICATION_VALIDATION_CODES.invalidInputRefs);
  });

  it('treats a present-but-undefined optional as invalid rather than absent', () => {
    expect(
      validateProtocolizationVerificationResult({ ...testResult(), reasonCode: undefined }).admitted,
    ).toBe(false);
    expect(
      validateProtocolizationVerificationResult({ ...testResult(), correlationId: undefined })
        .admitted,
    ).toBe(false);
  });

  it('validates an executor’s return value before it can become history', () => {
    expect(
      validateVerificationCheckExecution({ outcome: VerificationCheckOutcome.Pass }).admitted,
    ).toBe(true);
    expect(validateVerificationCheckExecution({ outcome: 'Excellent' }).reasons).toContain(
      VERIFICATION_VALIDATION_CODES.invalidOutcome,
    );
    expect(
      validateVerificationCheckExecution({
        outcome: VerificationCheckOutcome.Pass,
        ready: true,
      }).reasons,
    ).toContain(VERIFICATION_VALIDATION_CODES.unknownField);
  });

  it('reconstitutes a valid result, frozen, and refuses an invalid one', () => {
    const restored = reconstituteProtocolizationVerificationResult(
      JSON.parse(JSON.stringify(testResult())),
    );

    expect(restored.outcome).toBe(VerificationCheckOutcome.Pass);
    expect(Object.isFrozen(restored)).toBe(true);

    expect(() =>
      reconstituteProtocolizationVerificationResult({ ...testResult(), outcome: 'Verified' }),
    ).toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.invalidResult }));
  });
});

describe('verification result repository', () => {
  it('stores and retrieves by (tenantId, executionId)', () => {
    const repository = createInMemoryVerificationResultRepository();
    const result = testResult();

    repository.save(result);

    expect(sync(repository.get(TENANT_A, 'execution-0001'))).toEqual(result);
    expect(sync(repository.exists(TENANT_A, 'execution-0001'))).toBe(true);
    expect(sync(repository.get(TENANT_A, 'execution-nope'))).toBeUndefined();
  });

  it('is append-only: a duplicate identity is rejected, never overwritten', () => {
    const repository = createInMemoryVerificationResultRepository();
    repository.save(testResult({ outcome: VerificationCheckOutcome.Pass }));

    expect(() => repository.save(testResult({ outcome: VerificationCheckOutcome.Fail }))).toThrow(
      expect.objectContaining({ code: VERIFICATION_ERROR_CODES.duplicateResult }),
    );
    expect(sync(repository.get(TENANT_A, 'execution-0001'))?.outcome).toBe(
      VerificationCheckOutcome.Pass,
    );
  });

  it('offers no update and no delete', () => {
    const repository = createInMemoryVerificationResultRepository();

    expect(Object.keys(repository).sort()).toEqual([
      'exists',
      'get',
      'listByCase',
      'listByRequirementCheck',
      'save',
    ]);
  });

  it('refuses to store a malformed result', () => {
    const repository = createInMemoryVerificationResultRepository();

    expect(() =>
      repository.save(testResult({ outcome: 'Verified' as never })),
    ).toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.invalidResult }));
  });

  it('freezes what it stores, so a caller cannot rewrite history through a held reference', () => {
    const repository = createInMemoryVerificationResultRepository();
    const result = testResult();
    repository.save(result);

    const stored = sync(repository.get(TENANT_A, 'execution-0001')) as ProtocolizationVerificationResult;
    expect(Object.isFrozen(stored)).toBe(true);
    expect(() => {
      (stored as unknown as Record<string, unknown>).outcome = VerificationCheckOutcome.Fail;
    }).toThrow();
  });

  it('orders listings by execution instant, then by execution id', () => {
    const repository = createInMemoryVerificationResultRepository();
    // Saved out of order, and two share an instant — which is what one batch
    // produces, so the tie-break is load-bearing rather than cosmetic.
    repository.save(testResult({ executionId: 'e-c', executedAt: '2026-01-03T00:00:00.000Z' }));
    repository.save(testResult({ executionId: 'e-b', executedAt: '2026-01-01T00:00:00.000Z' }));
    repository.save(testResult({ executionId: 'e-a', executedAt: '2026-01-01T00:00:00.000Z' }));

    expect(sync(repository.listByCase(TENANT_A, 'case-0001')).map((r) => r.executionId)).toEqual([
      'e-a',
      'e-b',
      'e-c',
    ]);
  });

  it('lists one check’s re-execution history by (requirementId, checkId)', () => {
    const repository = createInMemoryVerificationResultRepository();
    repository.save(testResult({ executionId: 'e-1', executedAt: '2026-01-01T00:00:00.000Z' }));
    repository.save(
      testResult({
        executionId: 'e-2',
        executedAt: '2026-01-02T00:00:00.000Z',
        outcome: VerificationCheckOutcome.Fail,
      }),
    );
    repository.save(
      testResult({
        executionId: 'e-3',
        requirementId: 'verification.suite',
        executedAt: '2026-01-03T00:00:00.000Z',
      }),
    );

    const history = sync(
      repository.listByRequirementCheck(TENANT_A, 'case-0001', 'verification.alpha', 'test.check.alpha'),
    );

    expect(history.map((r) => r.executionId)).toEqual(['e-1', 'e-2']);
    expect(history.map((r) => r.outcome)).toEqual([
      VerificationCheckOutcome.Pass,
      VerificationCheckOutcome.Fail,
    ]);
  });

  it('requires a tenant on every method', () => {
    const repository = createInMemoryVerificationResultRepository();

    for (const call of [
      () => repository.get('', 'execution-0001'),
      () => repository.exists('', 'execution-0001'),
      () => repository.listByCase('', 'case-0001'),
      () => repository.listByRequirementCheck('', 'case-0001', 'verification.alpha', 'test.check.alpha'),
    ]) {
      expect(call).toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.invalidTenant }));
    }
  });

  it('scopes identity to the tenant, so two tenants may use the same execution id', () => {
    const repository = createInMemoryVerificationResultRepository();

    repository.save(testResult({ tenantId: TENANT_A }));
    expect(() => repository.save(testResult({ tenantId: TENANT_B }))).not.toThrow();

    expect(sync(repository.get(TENANT_A, 'execution-0001'))?.tenantId).toBe(TENANT_A);
    expect(sync(repository.get(TENANT_B, 'execution-0001'))?.tenantId).toBe(TENANT_B);
  });
});
