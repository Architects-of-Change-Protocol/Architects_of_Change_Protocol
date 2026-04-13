export type DataAccessRequestInput = {
  subject_hash: string;
  consumer_id: string;
  dataset_id: string;
  purpose: string;
  requested_scope?: string[];
  now?: Date;
};

export type DataAccessDecision = {
  allowed: boolean;
  reason_code:
    | 'ACCESS_ALLOWED'
    | 'ACCESS_DENIED_NOT_FOUND'
    | 'ACCESS_DENIED_ISSUER_INACTIVE'
    | 'ACCESS_DENIED_EXPIRED'
    | 'ACCESS_DENIED_REVOKED'
    | 'ACCESS_DENIED_CONSENT_REQUIRED';
  access_token?: string;
  expires_at?: string;
  audit_ref: string;
};

export type DataAccessAuditEvent = {
  event_type: 'DATA_ACCESS_REQUESTED' | 'DATA_ACCESS_ALLOWED' | 'DATA_ACCESS_DENIED';
  at: string;
  subject_hash: string;
  consumer_id: string;
  dataset_id: string;
  reason_code: string;
  audit_ref: string;
};

export type AccessTokenRecord = {
  token: string;
  audit_ref: string;
  subject_hash: string;
  consumer_id: string;
  dataset_id: string;
  purpose: string;
  requested_scope: string[];
  issued_at: string;
  expires_at: string;
};
