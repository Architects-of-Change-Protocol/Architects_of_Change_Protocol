import { createHash, randomUUID } from 'crypto';
import { normalizeReasonCode } from '../governance/reason-codes';
const DEFAULT_TOKEN_TTL_MS = 5 * 60 * 1000;
const TRUST_REASON_TO_ACCESS_REASON = {
    VERIFIED: 'ACCESS_ALLOWED',
    NOT_FOUND: 'ACCESS_DENIED_NOT_FOUND',
    ISSUER_INACTIVE: 'ACCESS_DENIED_ISSUER_INACTIVE',
    EXPIRED: 'ACCESS_DENIED_EXPIRED',
    REVOKED: 'ACCESS_DENIED_REVOKED',
    CONSENT_REQUIRED: 'ACCESS_DENIED_CONSENT_REQUIRED',
};
export class DataAccessService {
    trustService;
    tokenTtlMs;
    auditEvents = [];
    tokens = new Map();
    constructor(trustService, tokenTtlMs = DEFAULT_TOKEN_TTL_MS) {
        this.trustService = trustService;
        this.tokenTtlMs = tokenTtlMs;
    }
    requestAccess(input) {
        const now = input.now ?? new Date();
        const requestedAt = now.toISOString();
        const requestRef = randomUUID();
        this.auditEvents.push({
            event_type: 'DATA_ACCESS_REQUESTED',
            at: requestedAt,
            subject_hash: input.subject_hash,
            consumer_id: input.consumer_id,
            dataset_id: input.dataset_id,
            reason_code: 'ACCESS_REQUEST_RECEIVED',
            audit_ref: requestRef,
        });
        const verification = this.trustService.verifyIdentity({
            subject_hash: input.subject_hash,
            consumer_id: input.consumer_id,
            now,
        });
        const reasonCode = normalizeReasonCode(TRUST_REASON_TO_ACCESS_REASON[verification.reason_code] ?? 'ACCESS_DENIED_NOT_FOUND');
        if (!verification.valid) {
            const deniedRef = randomUUID();
            this.auditEvents.push({
                event_type: 'DATA_ACCESS_DENIED',
                at: requestedAt,
                subject_hash: input.subject_hash,
                consumer_id: input.consumer_id,
                dataset_id: input.dataset_id,
                reason_code: reasonCode,
                audit_ref: deniedRef,
            });
            return {
                allowed: false,
                reason_code: reasonCode,
                audit_ref: deniedRef,
            };
        }
        const auditRef = randomUUID();
        const expiresAt = new Date(now.getTime() + this.tokenTtlMs).toISOString();
        const token = this.generateToken(auditRef, input, requestedAt, expiresAt);
        this.tokens.set(token, {
            token,
            audit_ref: auditRef,
            subject_hash: input.subject_hash,
            consumer_id: input.consumer_id,
            dataset_id: input.dataset_id,
            purpose: input.purpose,
            requested_scope: input.requested_scope ?? [],
            issued_at: requestedAt,
            expires_at: expiresAt,
        });
        this.auditEvents.push({
            event_type: 'DATA_ACCESS_ALLOWED',
            at: requestedAt,
            subject_hash: input.subject_hash,
            consumer_id: input.consumer_id,
            dataset_id: input.dataset_id,
            reason_code: 'ACCESS_ALLOWED',
            audit_ref: auditRef,
        });
        return {
            allowed: true,
            reason_code: 'ACCESS_ALLOWED',
            access_token: token,
            expires_at: expiresAt,
            audit_ref: auditRef,
        };
    }
    getAuditEvents() {
        return [...this.auditEvents];
    }
    generateToken(auditRef, input, issuedAt, expiresAt) {
        const digest = createHash('sha256')
            .update(`${auditRef}:${input.subject_hash}:${input.consumer_id}:${input.dataset_id}:${issuedAt}:${expiresAt}`)
            .digest('base64url');
        return `aoc_access_${digest}`;
    }
}
