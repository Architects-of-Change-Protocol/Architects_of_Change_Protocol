// Canonical identity note: runtime APIs preserve legacy wire fields while mapping to principal semantics.
export type AccessRequestStatus = 'pending' | 'approved' | 'denied';

export type AccessRequest = {
  request_id: string;
  subject_id: string;
  requester_id: string;
  dataset_id: string;
  purpose: string;
  requested_scope: string[];
  status: AccessRequestStatus;
  created_at: string;
  updated_at: string;
};

export type ConsentDecision = {
  decision: 'approve' | 'deny';
  reason_code: string;
  notes?: string;
};

export type GrantedAccess = {
  grant_id: string;
  request_id: string;
  subject_id: string;
  requester_id: string;
  dataset_id: string;
  scope: string[];
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

export class ControlPlaneService {
  private readonly requests = new Map<string, AccessRequest>();
  private readonly grants = new Map<string, GrantedAccess>();

  createAccessRequest(input: Omit<AccessRequest, 'request_id' | 'status' | 'created_at' | 'updated_at'>): AccessRequest {
    const request_id = `ar_${this.requests.size + 1}`;
    const created = nowIso();
    const request: AccessRequest = { ...input, request_id, status: 'pending', created_at: created, updated_at: created };
    this.requests.set(request_id, request);
    return request;
  }

  listRequestsBySubject(input: { subject_id: string; status?: AccessRequestStatus }): AccessRequest[] {
    return [...this.requests.values()].filter(
      (request) => request.subject_id === input.subject_id && (!input.status || request.status === input.status)
    );
  }

  decideAccessRequest(input: { request_id: string; decision: ConsentDecision }): { request: AccessRequest; decision: ConsentDecision; grant?: GrantedAccess } {
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

    const grant: GrantedAccess = {
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

  listActiveGrants(input: { subject_id?: string; requester_id?: string }): GrantedAccess[] {
    return [...this.grants.values()].filter(
      (grant) =>
        !grant.revoked_at &&
        (!input.subject_id || grant.subject_id === input.subject_id) &&
        (!input.requester_id || grant.requester_id === input.requester_id)
    );
  }

  revokeGrant(input: { grant_id: string; reason?: string }): GrantedAccess {
    const grant = this.grants.get(input.grant_id);
    if (!grant) {
      throw new Error(`ACCESS_GRANT_NOT_FOUND:${input.grant_id}`);
    }
    grant.revoked_at = nowIso();
    this.grants.set(grant.grant_id, grant);
    return grant;
  }
}
