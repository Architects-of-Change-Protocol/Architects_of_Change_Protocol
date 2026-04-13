import { buildCanonicalCapabilityPayload, hashCapabilityPayload } from './capability-hash';
import { signCapabilityHash } from './capability-sign';
import {
  CAPABILITY_REASON_CODES,
  type CapabilityToken,
  type CapabilityValidationResult,
} from './capability-types';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidIsoDateString(value: unknown): value is string {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function hasValidMetadata(value: unknown): boolean {
  return value === undefined || (value !== null && typeof value === 'object' && !Array.isArray(value));
}

function isCapabilityTokenShape(token: unknown): token is CapabilityToken {
  if (!token || typeof token !== 'object') {
    return false;
  }

  const candidate = token as Partial<CapabilityToken>;

  return (
    isNonEmptyString(candidate.capability_id) &&
    isNonEmptyString(candidate.consent_id) &&
    isNonEmptyString(candidate.subject_id) &&
    isNonEmptyString(candidate.requester_id) &&
    isNonEmptyString(candidate.resource) &&
    isNonEmptyString(candidate.action) &&
    isValidIsoDateString(candidate.issued_at) &&
    (candidate.expires_at === null || isValidIsoDateString(candidate.expires_at)) &&
    isNonEmptyString(candidate.nonce) &&
    isNonEmptyString(candidate.capability_hash) &&
    isNonEmptyString(candidate.signature) &&
    hasValidMetadata(candidate.metadata)
  );
}

export function validateCapabilityToken(token: unknown, secret: string): CapabilityValidationResult {
  if (!isCapabilityTokenShape(token) || !isNonEmptyString(secret)) {
    return { valid: false, reason_code: CAPABILITY_REASON_CODES.INVALID_INPUT };
  }

  const payload = buildCanonicalCapabilityPayload(token);
  const expectedHash = hashCapabilityPayload(payload);

  if (expectedHash !== token.capability_hash) {
    return { valid: false, reason_code: CAPABILITY_REASON_CODES.INVALID_HASH };
  }

  const expectedSignature = signCapabilityHash(expectedHash, secret);
  if (expectedSignature !== token.signature) {
    return { valid: false, reason_code: CAPABILITY_REASON_CODES.INVALID_SIGNATURE };
  }

  if (token.expires_at !== null && Date.now() >= new Date(token.expires_at).getTime()) {
    return { valid: false, reason_code: CAPABILITY_REASON_CODES.EXPIRED };
  }

  return { valid: true, reason_code: CAPABILITY_REASON_CODES.VALID };
}
