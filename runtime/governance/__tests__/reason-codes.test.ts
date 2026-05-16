import { classifyReasonCode, getReasonCode, isAuditSafeReasonCode, isSdkSafeReasonCode, normalizeReasonCode } from '../reason-codes';

describe('reason code registry', () => {
  it('performs deterministic lookup and normalization', () => {
    expect(getReasonCode('POLICY_DENY_OVERRIDES')?.code).toBe('POLICY_DENY_OVERRIDES');
    expect(normalizeReasonCode('POLICY_DENIED')).toBe('POLICY_DENY_OVERRIDES');
  });

  it('supports sdk/audit safety filtering', () => {
    expect(isSdkSafeReasonCode('ACCESS_ALLOWED')).toBe(true);
    expect(isSdkSafeReasonCode('INTERNAL_EVALUATION_ERROR')).toBe(false);
    expect(isAuditSafeReasonCode('ACCESS_ALLOWED')).toBe(true);
  });

  it('classifies unknown reason code as unknown', () => {
    expect(classifyReasonCode('DOES_NOT_EXIST')).toBe('unknown');
  });
});
