"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIdentity = normalizeIdentity;
function normalizeIdentity(input) {
    return {
        subject_principal_id: input.subject_id ?? input.subject_hash ?? '',
        requester_principal_id: input.requester_id,
        consumer_principal_id: input.consumer_id,
        tenant_id: input.tenant_id,
    };
}
