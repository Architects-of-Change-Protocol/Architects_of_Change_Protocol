import type { ConsentRecord, ConsentRequest } from './types';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidIsoDateString(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

export function isValidConsentRequest(request: unknown): request is ConsentRequest {
  if (!request || typeof request !== 'object') {
    return false;
  }

  const candidate = request as Partial<ConsentRequest>;

  return (
    isNonEmptyString(candidate.subject_id) &&
    isNonEmptyString(candidate.requester_id) &&
    isNonEmptyString(candidate.resource) &&
    isNonEmptyString(candidate.action) &&
    isValidIsoDateString(candidate.requested_at)
  );
}

export function isValidConsentRecord(consent: unknown): consent is ConsentRecord {
  if (!consent || typeof consent !== 'object') {
    return false;
  }

  const candidate = consent as Partial<ConsentRecord>;

  if (
    !isNonEmptyString(candidate.consent_id) ||
    !isNonEmptyString(candidate.subject_id) ||
    !isNonEmptyString(candidate.requester_id) ||
    !isNonEmptyString(candidate.resource) ||
    typeof candidate.granted !== 'boolean' ||
    !isValidIsoDateString(candidate.created_at)
  ) {
    return false;
  }

  if (
    !Array.isArray(candidate.actions) ||
    candidate.actions.length === 0 ||
    candidate.actions.some((action) => !isNonEmptyString(action))
  ) {
    return false;
  }

  if (candidate.expires_at !== null && !isValidIsoDateString(candidate.expires_at)) {
    return false;
  }

  if (candidate.revoked_at !== null && !isValidIsoDateString(candidate.revoked_at)) {
    return false;
  }

  if (candidate.consent_hash !== null && !isNonEmptyString(candidate.consent_hash)) {
    return false;
  }

  if (
    candidate.metadata !== undefined &&
    (candidate.metadata === null || typeof candidate.metadata !== 'object' || Array.isArray(candidate.metadata))
  ) {
    return false;
  }

  return true;
}
