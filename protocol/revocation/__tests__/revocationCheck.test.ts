import { createRegistryRevocationCheck, createStaticRevocationCheck, withRevocationTimeout, ALWAYS_UNKNOWN_REVOCATION_CHECK } from '../revocation-check';
import { verifiedNotRevokedStatus } from '../revocation-policy';
import { resolveMaterialActionDecision } from '../revocation-policy';
import { REVOCATION_TELEMETRY_EVENTS } from '../revocation-telemetry';

const SUBJECT = { subjectId: 'agent:aoc:test-1', subjectType: 'agent_identity' as const };

describe('createRegistryRevocationCheck', () => {
  it('returns verified_not_revoked when the registry says false', () => {
    const registry = { isRevoked: () => false };
    const check = createRegistryRevocationCheck(registry);
    const status = check(SUBJECT);
    expect(status.status).toBe('verified_not_revoked');
    expect(resolveMaterialActionDecision(status)).toBe('allow');
  });

  it('returns revoked when the registry says true', () => {
    const registry = { isRevoked: () => true };
    const check = createRegistryRevocationCheck(registry);
    const status = check(SUBJECT);
    expect(status.status).toBe('revoked');
    expect(resolveMaterialActionDecision(status)).toBe('block');
  });

  it('FAIL-CLOSED REGRESSION: a registry that throws never becomes "not revoked"', () => {
    // This is the exact anti-pattern the sprint calls out, made concrete: the naive
    // implementation `try { return registry.isRevoked(id) } catch { return false }` (or
    // `data?.reason ?? null` on a DB client) treats an error as "clean". This adapter must not.
    const throwingRegistry = {
      isRevoked: () => {
        throw new Error('connection reset by peer');
      },
    };
    const check = createRegistryRevocationCheck(throwingRegistry);
    const status = check(SUBJECT);

    expect(status.status).toBe('unknown');
    if (status.status === 'unknown') {
      expect(status.errorCode).toBe('REVOCATION_LOOKUP_FAILED');
      expect(status.retryable).toBe(true);
    }
    expect(resolveMaterialActionDecision(status)).toBe('block');
  });

  it('FAIL-CLOSED REGRESSION: a malformed (non-boolean) registry response blocks, not passes', () => {
    const malformedRegistry = { isRevoked: () => undefined as unknown as boolean };
    const check = createRegistryRevocationCheck(malformedRegistry);
    const status = check(SUBJECT);

    expect(status.status).toBe('unknown');
    expect(resolveMaterialActionDecision(status)).toBe('block');
  });

  it('emits check.started + check.not_revoked / check.revoked / check.failed telemetry without secrets', () => {
    const events: Array<{ event: string; payload: Record<string, unknown> }> = [];
    const telemetry = (event: string, payload: Record<string, unknown>) => events.push({ event, payload });

    createRegistryRevocationCheck({ isRevoked: () => false }, { telemetry })(SUBJECT);
    createRegistryRevocationCheck({ isRevoked: () => true }, { telemetry })(SUBJECT);
    createRegistryRevocationCheck(
      {
        isRevoked: () => {
          throw new Error('boom');
        },
      },
      { telemetry }
    )(SUBJECT);

    const eventTypes = events.map((e) => e.event);
    expect(eventTypes.filter((e) => e === REVOCATION_TELEMETRY_EVENTS.CHECK_STARTED)).toHaveLength(3);
    expect(eventTypes).toContain(REVOCATION_TELEMETRY_EVENTS.CHECK_NOT_REVOKED);
    expect(eventTypes).toContain(REVOCATION_TELEMETRY_EVENTS.CHECK_REVOKED);
    expect(eventTypes).toContain(REVOCATION_TELEMETRY_EVENTS.CHECK_FAILED);
    for (const { payload } of events) {
      expect(JSON.stringify(payload)).not.toMatch(/secret|privateKey|password/i);
    }
  });
});

describe('createStaticRevocationCheck', () => {
  it('always returns the provided status regardless of subject asked', () => {
    const status = verifiedNotRevokedStatus(SUBJECT);
    const check = createStaticRevocationCheck(status);
    expect(check({ subjectId: 'anything-else', subjectType: 'credential' })).toBe(status);
  });
});

describe('ALWAYS_UNKNOWN_REVOCATION_CHECK', () => {
  it('always blocks — a safe explicit default for unwired call sites', () => {
    const status = ALWAYS_UNKNOWN_REVOCATION_CHECK(SUBJECT);
    expect(resolveMaterialActionDecision(status)).toBe('block');
  });
});

describe('withRevocationTimeout', () => {
  it('resolves normally when the check completes within the budget', async () => {
    const fastCheck = async () => verifiedNotRevokedStatus(SUBJECT);
    const wrapped = withRevocationTimeout(fastCheck, 50);
    const status = await wrapped(SUBJECT);
    expect(status.status).toBe('verified_not_revoked');
  });

  it('FAIL-CLOSED REGRESSION: a check that never resolves times out to unknown, not clean', async () => {
    const hangingCheck = () => new Promise<never>(() => {});
    const wrapped = withRevocationTimeout(hangingCheck, 20);
    const status = await wrapped(SUBJECT);

    expect(status.status).toBe('unknown');
    if (status.status === 'unknown') {
      expect(status.errorCode).toBe('REVOCATION_LOOKUP_TIMEOUT');
      expect(status.retryable).toBe(true);
    }
    expect(resolveMaterialActionDecision(status)).toBe('block');
  });

  it('FAIL-CLOSED REGRESSION: a rejected promise becomes unknown, not an uncaught exception treated as clean', async () => {
    const rejectingCheck = async (): Promise<never> => {
      throw new Error('network unreachable');
    };
    const wrapped = withRevocationTimeout(rejectingCheck, 50);
    const status = await wrapped(SUBJECT);

    expect(status.status).toBe('unknown');
    expect(resolveMaterialActionDecision(status)).toBe('block');
  });
});
