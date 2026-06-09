import { createHash } from 'crypto';
function canonicalizeCapabilityPayload(payload) {
    return JSON.stringify([
        payload.consent_id,
        payload.subject_id,
        payload.requester_id,
        payload.resource,
        payload.action,
        payload.issued_at,
        payload.expires_at,
        payload.nonce,
    ]);
}
export function buildCanonicalCapabilityPayload(token) {
    return {
        consent_id: token.consent_id,
        subject_id: token.subject_id,
        requester_id: token.requester_id,
        resource: token.resource,
        action: token.action,
        issued_at: token.issued_at,
        expires_at: token.expires_at,
        nonce: token.nonce,
    };
}
export function hashCapabilityPayload(payload) {
    return createHash('sha256').update(canonicalizeCapabilityPayload(payload)).digest('hex');
}
