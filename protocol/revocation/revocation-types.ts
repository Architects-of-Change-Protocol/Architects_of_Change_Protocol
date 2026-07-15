/**
 * Canonical revocation status contract for AOC Protocol Core.
 *
 * Implements ADR docs/architecture/adr-agent-identity-passport-trust.md §12: revocation is
 * canonical and fail-closed. A failure to prove that a subject is not revoked must never be
 * interpreted as proof that it is valid. Only `verified_not_revoked` may permit a material
 * operation; every other status — including the absence of a check — blocks.
 */

export type RevocableSubjectType =
  | 'agent_identity'
  | 'agent_passport'
  | 'public_key'
  | 'credential'
  | 'consent_grant'
  | 'delegation'
  | 'capability_grant'
  | 'execution_grant'
  | 'service_identity'
  | 'issuer_authority'
  | 'trust_domain_membership';

export const REVOCATION_ERROR_CODES = {
  REVOCATION_STATUS_UNAVAILABLE: 'REVOCATION_STATUS_UNAVAILABLE',
  REVOCATION_LOOKUP_FAILED: 'REVOCATION_LOOKUP_FAILED',
  REVOCATION_LOOKUP_TIMEOUT: 'REVOCATION_LOOKUP_TIMEOUT',
  REVOCATION_PERMISSION_DENIED: 'REVOCATION_PERMISSION_DENIED',
  REVOCATION_RECORD_MALFORMED: 'REVOCATION_RECORD_MALFORMED',
  REVOCATION_AUTHORITY_MISMATCH: 'REVOCATION_AUTHORITY_MISMATCH',
  REVOCATION_TRUST_DOMAIN_MISMATCH: 'REVOCATION_TRUST_DOMAIN_MISMATCH',
  REVOCATION_SUBJECT_MISMATCH: 'REVOCATION_SUBJECT_MISMATCH',
  REVOCATION_UNSUPPORTED_VERSION: 'REVOCATION_UNSUPPORTED_VERSION',
} as const;

export type RevocationErrorCode = (typeof REVOCATION_ERROR_CODES)[keyof typeof REVOCATION_ERROR_CODES];

export type RevocationFailureCategory =
  | 'not_checked'
  | 'lookup_error'
  | 'timeout'
  | 'permission_denied'
  | 'malformed_record'
  | 'unsupported_version'
  | 'authority_mismatch'
  | 'trust_domain_mismatch'
  | 'subject_mismatch'
  | 'unavailable';

export type VerifiedNotRevokedStatus = {
  status: 'verified_not_revoked';
  subjectId: string;
  subjectType: RevocableSubjectType;
  checkedAt: string;
  sourceVersion: string;
};

export type RevokedStatus = {
  status: 'revoked';
  subjectId: string;
  subjectType: RevocableSubjectType;
  revocationId: string;
  reasonCode: string;
  revokedAt: string;
  checkedAt: string;
};

export type UnknownRevocationStatus = {
  status: 'unknown';
  subjectId?: string;
  subjectType?: RevocableSubjectType;
  checkedAt: string;
  errorCode: RevocationErrorCode;
  category: RevocationFailureCategory;
  retryable: boolean;
};

/**
 * Canonical tri-state revocation result. There is no fourth "not revoked because we didn't
 * check" state — omission collapses into `unknown`, which blocks material operations exactly
 * like `revoked` does.
 */
export type RevocationStatus = VerifiedNotRevokedStatus | RevokedStatus | UnknownRevocationStatus;

export type MaterialActionDecision = 'allow' | 'block';
