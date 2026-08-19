import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { VerificationStatus } from '@aoc/protocol/claims';

import {
  VERIFICATION_CHECK_OUTCOMES,
  VerificationCheckOutcome,
  isVerificationCheckOutcome,
} from '@aoc/asset-protocolization';

/**
 * The outcome model, and its separation from Protocol's `VerificationStatus`.
 *
 * This suite exists because the single most expensive mistake available in
 * APV-07 is collapsing two vocabularies that look similar and mean different
 * things. Every assertion below is about keeping them apart.
 */
describe('APV verification outcomes', () => {
  it('has exactly the five frozen members', () => {
    expect(Object.values(VerificationCheckOutcome).sort()).toEqual([
      'Fail',
      'ManualReview',
      'Pass',
      'Unavailable',
      'Warning',
    ]);
    expect(VERIFICATION_CHECK_OUTCOMES).toHaveLength(5);
    expect(new Set(VERIFICATION_CHECK_OUTCOMES).size).toBe(5);
  });

  it('recognizes its own members and nothing else', () => {
    for (const outcome of VERIFICATION_CHECK_OUTCOMES) {
      expect(isVerificationCheckOutcome(outcome)).toBe(true);
    }
    for (const impostor of [
      'Verified',
      'Failed',
      'Pending',
      'PASS',
      'pass',
      'Excellent',
      'READY',
      'Approved',
      true,
      1,
      null,
      undefined,
      {},
    ]) {
      expect(isVerificationCheckOutcome(impostor)).toBe(false);
    }
  });

  it('is not Protocol’s VerificationStatus, in either direction', () => {
    // Protocol's enum describes a `CanonicalVerification` record. APV's
    // describes the execution of one profile-declared check. Neither is a
    // superset, a subset, or a rename of the other.
    expect(Object.values(VerificationStatus)).toEqual(['Pending', 'Verified', 'Failed']);

    const apv = new Set<string>(Object.values(VerificationCheckOutcome));
    for (const status of Object.values(VerificationStatus)) {
      expect(apv.has(status)).toBe(false);
    }

    const protocol = new Set<string>(Object.values(VerificationStatus));
    for (const outcome of Object.values(VerificationCheckOutcome)) {
      expect(protocol.has(outcome)).toBe(false);
    }
  });

  it('leaves Protocol’s VerificationStatus exactly as it was frozen', () => {
    // A hard architectural assertion, read from Protocol's own source rather
    // than from its exported value, so that adding a member — or renaming one —
    // fails here rather than surfacing as a subtle behaviour change downstream.
    const enumsSource = readFileSync(
      join(__dirname, '..', '..', 'protocol', 'src', 'claims', 'claim-enums.ts'),
      'utf8',
    );
    const block = /export const VerificationStatus = \{([\s\S]*?)\} as const;/.exec(enumsSource);
    expect(block).not.toBeNull();

    const members = [...(block as RegExpExecArray)[1].matchAll(/^\s*(\w+):/gm)].map(
      (match) => match[1],
    );
    expect(members).toEqual(['Pending', 'Verified', 'Failed']);

    for (const forbidden of ['Pass', 'Warning', 'ManualReview', 'Unavailable']) {
      expect(members).not.toContain(forbidden);
    }
  });

  it('is owned exclusively by the Asset Protocolization Vertical', () => {
    const protocolClaims = readFileSync(
      join(__dirname, '..', '..', 'protocol', 'src', 'claims', 'claim-enums.ts'),
      'utf8',
    );
    expect(protocolClaims).not.toContain('VerificationCheckOutcome');
    expect(protocolClaims).not.toContain('ManualReview');
  });

  it('exposes no boolean spelling of itself', () => {
    // Neither `outcome === Pass` nor `outcome !== Fail` is offered as an API,
    // because both erase members: the first cannot distinguish a real failure
    // from a check that could not run, and the second promotes Warning,
    // ManualReview and Unavailable into success.
    const facade = readFileSync(join(__dirname, '..', 'src', 'index.ts'), 'utf8');
    for (const forbidden of [
      'isPassing',
      'isPassed',
      'hasPassed',
      'verificationPassed',
      'isVerified',
      'toBoolean',
      'outcomeToBoolean',
    ]) {
      expect(facade).not.toContain(forbidden);
    }
  });

  it('offers no ranking, score or aggregate verdict', () => {
    const verificationSource = readFileSync(
      join(__dirname, '..', 'src', 'verification', 'verification-projections.ts'),
      'utf8',
    );
    for (const forbidden of ['confidence', 'score', 'percentage', 'weight', 'verdict']) {
      // Mentioned only in prose explaining why each is absent; never as an
      // identifier in code.
      expect(new RegExp(`(?:const|let|function|readonly)\\s+\\w*${forbidden}`, 'i').test(verificationSource)).toBe(
        false,
      );
    }
  });

  it('orders its members for reporting without implying precedence', () => {
    // The exported order is presentational. Nothing in the package reduces a set
    // of outcomes to a single "worst" one, and this list is not a severity scale.
    expect([...VERIFICATION_CHECK_OUTCOMES]).toEqual([
      VerificationCheckOutcome.Pass,
      VerificationCheckOutcome.Fail,
      VerificationCheckOutcome.Warning,
      VerificationCheckOutcome.ManualReview,
      VerificationCheckOutcome.Unavailable,
    ]);
  });
});
