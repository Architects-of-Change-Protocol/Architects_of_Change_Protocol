import type { ConsentEvaluationOptions, ConsentStateResult, ProtocolConsent } from './consent-types';
import { validateConsent } from './consent-validator';

export function evaluateConsentState(
  consent: ProtocolConsent,
  opts: ConsentEvaluationOptions = {}
): ConsentStateResult {
  if (consent.action !== 'grant' && consent.action !== 'revoke') {
    return { state: 'invalid', reasons: ['Consent action is invalid.'] };
  }

  const validation = validateConsent(consent);
  if (!validation.valid) {
    return { state: 'invalid', reasons: validation.errors };
  }

  if (consent.action !== 'grant') {
    return { state: 'invalid', reasons: ['Consent action must be grant for active evaluation.'] };
  }

  if (opts.isRevoked?.(consent) === true) {
    return { state: 'revoked', reasons: ['Consent was revoked by registry hook.'] };
  }

  const now = opts.now ?? new Date();
  const issuedAt = Date.parse(consent.issued_at);

  if (!Number.isFinite(issuedAt)) {
    return { state: 'invalid', reasons: ['Consent issued_at is not parseable.'] };
  }

  if (now.getTime() < issuedAt) {
    return {
      state: 'inactive',
      reasons: ['Consent issued_at is in the future for evaluation time.'],
    };
  }

  if (consent.expires_at !== null) {
    const expiresAt = Date.parse(consent.expires_at);

    if (!Number.isFinite(expiresAt)) {
      return { state: 'invalid', reasons: ['Consent expires_at is not parseable.'] };
    }

    if (now.getTime() >= expiresAt) {
      return { state: 'expired', reasons: ['Consent is expired.'] };
    }
  }

  return { state: 'active', reasons: [] };
}

export function isConsentActive(consent: ProtocolConsent, opts: ConsentEvaluationOptions = {}): boolean {
  return evaluateConsentState(consent, opts).state === 'active';
}

export function isConsentRevoked(consent: ProtocolConsent, opts: ConsentEvaluationOptions = {}): boolean {
  return evaluateConsentState(consent, opts).state === 'revoked';
}
