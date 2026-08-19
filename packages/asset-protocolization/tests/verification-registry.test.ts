import { VERIFICATION_ERROR_CODES, createVerificationCheckRegistry } from '@aoc/asset-protocolization';
import type { AssetVerificationCheck, VerificationCheckExecution } from '@aoc/asset-protocolization';
import { VerificationCheckOutcome } from '@aoc/asset-protocolization';

import {
  TEST_CHECK_ALPHA,
  TEST_CHECK_BETA,
  TEST_CHECK_FUTURE_SOURCE,
  TEST_VERIFICATION_CHECKS,
  createFutureSourceCheck,
  testAlphaCheck,
  testBetaCheck,
} from './fixtures/test-verification';

const otherAlpha: AssetVerificationCheck = {
  checkId: TEST_CHECK_ALPHA,
  execute: (): VerificationCheckExecution => ({ outcome: VerificationCheckOutcome.Fail }),
};

describe('verification check registry', () => {
  it('resolves an exact check id to its implementation', () => {
    const registry = createVerificationCheckRegistry([testAlphaCheck, testBetaCheck]);

    expect(registry.get(TEST_CHECK_ALPHA)).toBe(testAlphaCheck);
    expect(registry.get(TEST_CHECK_BETA)).toBe(testBetaCheck);
    expect(registry.has(TEST_CHECK_ALPHA)).toBe(true);
  });

  it('matches ids exactly — no prefix, suffix, substring or case folding', () => {
    const registry = createVerificationCheckRegistry([testAlphaCheck]);

    for (const near of [
      'test.check',
      'test.check.alph',
      'test.check.alphaa',
      'check.alpha',
      'TEST.CHECK.ALPHA',
      'Test.Check.Alpha',
      ' test.check.alpha',
      'test.check.alpha ',
    ]) {
      expect(registry.get(near)).toBeUndefined();
      expect(registry.has(near)).toBe(false);
    }
  });

  it('resolves nothing for a non-string key', () => {
    const registry = createVerificationCheckRegistry([testAlphaCheck]);

    for (const key of [undefined, null, 1, {}, []] as unknown[]) {
      expect(registry.get(key as string)).toBeUndefined();
      expect(registry.has(key as string)).toBe(false);
    }
  });

  it('refuses a second registration under the same id rather than replacing it', () => {
    const registry = createVerificationCheckRegistry([testAlphaCheck]);

    expect(() => registry.register(otherAlpha)).toThrow(
      expect.objectContaining({ code: VERIFICATION_ERROR_CODES.checkRegistrationInvalid }),
    );
    // The original implementation is still the one that answers.
    expect(registry.get(TEST_CHECK_ALPHA)).toBe(testAlphaCheck);
  });

  it('refuses a malformed check id', () => {
    const registry = createVerificationCheckRegistry();

    for (const checkId of ['', 'Test.Check', 'test check', 'test/check', 'test..check', 'a'.repeat(200)]) {
      expect(() =>
        registry.register({ checkId, execute: () => ({ outcome: VerificationCheckOutcome.Pass }) }),
      ).toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.checkRegistrationInvalid }));
    }
  });

  it('refuses an implementation that does not implement execute()', () => {
    const registry = createVerificationCheckRegistry();

    expect(() =>
      registry.register({ checkId: 'test.check.broken' } as unknown as AssetVerificationCheck),
    ).toThrow(expect.objectContaining({ code: VERIFICATION_ERROR_CODES.checkRegistrationInvalid }));
  });

  it('fails at construction rather than at first execution', () => {
    expect(() => createVerificationCheckRegistry([testAlphaCheck, otherAlpha])).toThrow(
      expect.objectContaining({ code: VERIFICATION_ERROR_CODES.checkRegistrationInvalid }),
    );
  });

  it('enumerates registrations deterministically, independent of registration order', () => {
    const forwards = createVerificationCheckRegistry([...TEST_VERIFICATION_CHECKS]);
    const backwards = createVerificationCheckRegistry([...TEST_VERIFICATION_CHECKS].reverse());

    expect(forwards.registeredCheckIds()).toEqual(backwards.registeredCheckIds());
    expect([...forwards.registeredCheckIds()]).toEqual([...forwards.registeredCheckIds()].sort());
  });

  it('accepts a check nobody anticipated, with no engine change', () => {
    // The extensibility property, exercised directly: a check written after the
    // engine, consulting a port the engine knows nothing about, registered by a
    // caller. No Protocol change, no case-core change, no new branch anywhere.
    const registry = createVerificationCheckRegistry([...TEST_VERIFICATION_CHECKS]);
    registry.register(createFutureSourceCheck(true));

    expect(registry.has(TEST_CHECK_FUTURE_SOURCE)).toBe(true);
    expect(registry.registeredCheckIds()).toContain(TEST_CHECK_FUTURE_SOURCE);
  });

  it('carries no tenant, no case and no profile', () => {
    // The registry is system/configuration-level, exactly like the profile
    // catalogue. Everything tenant-bound lives on the results the engine
    // produces, never here.
    const registry = createVerificationCheckRegistry([testAlphaCheck]);
    expect(Object.keys(registry).sort()).toEqual(['get', 'has', 'register', 'registeredCheckIds']);
  });

  it('freezes what it stores, so a caller cannot swap an executor after the fact', () => {
    const registry = createVerificationCheckRegistry([testAlphaCheck]);
    const held = registry.get(TEST_CHECK_ALPHA) as AssetVerificationCheck;

    expect(Object.isFrozen(held)).toBe(true);
  });
});
