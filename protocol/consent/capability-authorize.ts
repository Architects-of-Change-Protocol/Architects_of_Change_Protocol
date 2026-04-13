import { validateCapabilityToken } from './capability-validate';
import {
  CAPABILITY_REASON_CODES,
  type CapabilityAuthorizationRequest,
  type CapabilityAuthorizationResult,
  type CapabilityReasonCode,
  type CapabilityToken,
} from './capability-types';

function deny(reason_code: CapabilityReasonCode, capability_id: string | null): CapabilityAuthorizationResult {
  return {
    allowed: false,
    reason_code,
    evaluated_at: new Date().toISOString(),
    capability_id,
  };
}

export function authorizeWithCapability(
  request: CapabilityAuthorizationRequest,
  token: unknown,
  secret: string
): CapabilityAuthorizationResult {
  const validation = validateCapabilityToken(token, secret);

  if (!validation.valid || !token || typeof token !== 'object') {
    return deny(CAPABILITY_REASON_CODES.DENY_INVALID_CAPABILITY, null);
  }

  const capability = token as CapabilityToken;

  if (request.consent_id !== undefined && request.consent_id !== capability.consent_id) {
    return deny(CAPABILITY_REASON_CODES.CONSENT_MISMATCH, capability.capability_id);
  }

  if (request.subject_id !== capability.subject_id) {
    return deny(CAPABILITY_REASON_CODES.SUBJECT_MISMATCH, capability.capability_id);
  }

  if (request.requester_id !== capability.requester_id) {
    return deny(CAPABILITY_REASON_CODES.REQUESTER_MISMATCH, capability.capability_id);
  }

  if (request.resource !== capability.resource) {
    return deny(CAPABILITY_REASON_CODES.RESOURCE_MISMATCH, capability.capability_id);
  }

  if (request.action !== capability.action) {
    return deny(CAPABILITY_REASON_CODES.ACTION_MISMATCH, capability.capability_id);
  }

  return {
    allowed: true,
    reason_code: CAPABILITY_REASON_CODES.ALLOW,
    evaluated_at: new Date().toISOString(),
    capability_id: capability.capability_id,
  };
}
