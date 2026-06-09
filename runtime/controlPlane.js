function nowIso() {
    return new Date().toISOString();
}
export class ControlPlaneService {
    requests = new Map();
    grants = new Map();
    createAccessRequest(input) {
        const request_id = `ar_${this.requests.size + 1}`;
        const created = nowIso();
        const request = { ...input, request_id, status: 'pending', created_at: created, updated_at: created };
        this.requests.set(request_id, request);
        return request;
    }
    listRequestsBySubject(input) {
        return [...this.requests.values()].filter((request) => request.subject_id === input.subject_id && (!input.status || request.status === input.status));
    }
    decideAccessRequest(input) {
        const request = this.requests.get(input.request_id);
        if (!request) {
            throw new Error(`ACCESS_REQUEST_NOT_FOUND:${input.request_id}`);
        }
        request.status = input.decision.decision === 'approve' ? 'approved' : 'denied';
        request.updated_at = nowIso();
        this.requests.set(request.request_id, request);
        if (input.decision.decision === 'deny') {
            return { request, decision: input.decision };
        }
        const grant = {
            grant_id: `ga_${this.grants.size + 1}`,
            request_id: request.request_id,
            subject_id: request.subject_id,
            requester_id: request.requester_id,
            dataset_id: request.dataset_id,
            scope: request.requested_scope,
            granted_at: nowIso(),
        };
        this.grants.set(grant.grant_id, grant);
        return { request, decision: input.decision, grant };
    }
    listActiveGrants(input) {
        return [...this.grants.values()].filter((grant) => !grant.revoked_at &&
            (!input.subject_id || grant.subject_id === input.subject_id) &&
            (!input.requester_id || grant.requester_id === input.requester_id));
    }
    revokeGrant(input) {
        const grant = this.grants.get(input.grant_id);
        if (!grant) {
            throw new Error(`ACCESS_GRANT_NOT_FOUND:${input.grant_id}`);
        }
        grant.revoked_at = nowIso();
        this.grants.set(grant.grant_id, grant);
        return grant;
    }
}
