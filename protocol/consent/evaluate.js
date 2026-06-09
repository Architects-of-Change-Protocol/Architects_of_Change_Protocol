import { CONSENT_DECISION_REASON_CODES, } from './types';
import { isValidConsentRecord, isValidConsentRequest } from './validate';
const FALLBACK_EVALUATED_AT = '1970-01-01T00:00:00.000Z';
function toTimeMs(value) {
    return new Date(value).getTime();
}
function toDecision(allowed, reason_code, evaluated_at, consent_id) {
    return {
        allowed,
        reason_code,
        evaluated_at,
        consent_id,
    };
}
function resolveEvaluatedAt(request) {
    if (request && typeof request === 'object') {
        const requestedAt = request.requested_at;
        if (typeof requestedAt === 'string' && Number.isFinite(Date.parse(requestedAt))) {
            return new Date(requestedAt).toISOString();
        }
    }
    return FALLBACK_EVALUATED_AT;
}
function resolveConsentId(consent) {
    if (consent && typeof consent === 'object') {
        const consentId = consent.consent_id;
        if (typeof consentId === 'string' && consentId.trim().length > 0) {
            return consentId;
        }
    }
    return null;
}
export function evaluateConsent(request, consent) {
    const evaluatedAt = resolveEvaluatedAt(request);
    const consentId = resolveConsentId(consent);
    if (!isValidConsentRequest(request)) {
        return toDecision(false, CONSENT_DECISION_REASON_CODES.DENY_INVALID_INPUT, evaluatedAt, consentId);
    }
    if (consent == null) {
        return toDecision(false, CONSENT_DECISION_REASON_CODES.DENY_NO_CONSENT, evaluatedAt, null);
    }
    if (!isValidConsentRecord(consent)) {
        return toDecision(false, CONSENT_DECISION_REASON_CODES.DENY_INVALID_INPUT, evaluatedAt, consentId);
    }
    if (request.subject_id !== consent.subject_id) {
        return toDecision(false, CONSENT_DECISION_REASON_CODES.DENY_SUBJECT_MISMATCH, evaluatedAt, consent.consent_id);
    }
    if (request.requester_id !== consent.requester_id) {
        return toDecision(false, CONSENT_DECISION_REASON_CODES.DENY_REQUESTER_MISMATCH, evaluatedAt, consent.consent_id);
    }
    if (request.resource !== consent.resource) {
        return toDecision(false, CONSENT_DECISION_REASON_CODES.DENY_RESOURCE_MISMATCH, evaluatedAt, consent.consent_id);
    }
    if (!consent.granted) {
        return toDecision(false, CONSENT_DECISION_REASON_CODES.DENY_NOT_GRANTED, evaluatedAt, consent.consent_id);
    }
    if (!consent.actions.includes(request.action)) {
        return toDecision(false, CONSENT_DECISION_REASON_CODES.DENY_ACTION_NOT_GRANTED, evaluatedAt, consent.consent_id);
    }
    const requestedAtMs = toTimeMs(request.requested_at);
    const createdAtMs = toTimeMs(consent.created_at);
    // Fail closed when a request predates consent issuance. A consent cannot authorize
    // access that was requested before the consent itself existed.
    if (requestedAtMs < createdAtMs) {
        return toDecision(false, CONSENT_DECISION_REASON_CODES.DENY_INVALID_INPUT, evaluatedAt, consent.consent_id);
    }
    // Revocation takes effect at the exact timestamp (`>=`) and afterwards.
    if (consent.revoked_at !== null && requestedAtMs >= toTimeMs(consent.revoked_at)) {
        return toDecision(false, CONSENT_DECISION_REASON_CODES.DENY_REVOKED, evaluatedAt, consent.consent_id);
    }
    // Expiration is inclusive (`>=`) to match revocation semantics and keep
    // time-bound policy checks deterministic at exact boundary instants.
    if (consent.expires_at !== null && requestedAtMs >= toTimeMs(consent.expires_at)) {
        return toDecision(false, CONSENT_DECISION_REASON_CODES.DENY_EXPIRED, evaluatedAt, consent.consent_id);
    }
    return toDecision(true, CONSENT_DECISION_REASON_CODES.ALLOW, evaluatedAt, consent.consent_id);
}
