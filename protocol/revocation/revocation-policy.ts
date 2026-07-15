import type {
  MaterialActionDecision,
  RevocableSubjectType,
  RevocationErrorCode,
  RevocationFailureCategory,
  RevocationStatus,
  RevokedStatus,
  UnknownRevocationStatus,
  VerifiedNotRevokedStatus,
} from './revocation-types';
import { REVOCATION_ERROR_CODES } from './revocation-types';

/**
 * The single fail-closed gate. Every material caller MUST route its allow/block decision
 * through this function instead of re-deriving it. Only `verified_not_revoked` allows.
 */
export function resolveMaterialActionDecision(status: RevocationStatus): MaterialActionDecision {
  return status.status === 'verified_not_revoked' ? 'allow' : 'block';
}

export function isRevocationBlocking(status: RevocationStatus): boolean {
  return resolveMaterialActionDecision(status) === 'block';
}

function nowIso(now?: Date): string {
  return (now ?? new Date()).toISOString();
}

export function verifiedNotRevokedStatus(input: {
  subjectId: string;
  subjectType: RevocableSubjectType;
  now?: Date;
  sourceVersion?: string;
}): VerifiedNotRevokedStatus {
  return {
    status: 'verified_not_revoked',
    subjectId: input.subjectId,
    subjectType: input.subjectType,
    checkedAt: nowIso(input.now),
    sourceVersion: input.sourceVersion ?? 'v1',
  };
}

export function revokedStatus(input: {
  subjectId: string;
  subjectType: RevocableSubjectType;
  revocationId: string;
  reasonCode: string;
  revokedAt: string;
  now?: Date;
}): RevokedStatus {
  return {
    status: 'revoked',
    subjectId: input.subjectId,
    subjectType: input.subjectType,
    revocationId: input.revocationId,
    reasonCode: input.reasonCode,
    revokedAt: input.revokedAt,
    checkedAt: nowIso(input.now),
  };
}

function unknownStatus(
  errorCode: RevocationErrorCode,
  category: RevocationFailureCategory,
  retryable: boolean,
  input?: { subjectId?: string; subjectType?: RevocableSubjectType; now?: Date }
): UnknownRevocationStatus {
  return {
    status: 'unknown',
    subjectId: input?.subjectId,
    subjectType: input?.subjectType,
    checkedAt: nowIso(input?.now),
    errorCode,
    category,
    retryable,
  };
}

/** No revocation check was ever wired for this call site. */
export function unavailableRevocationStatus(input?: {
  subjectId?: string;
  subjectType?: RevocableSubjectType;
  now?: Date;
}): UnknownRevocationStatus {
  return unknownStatus(REVOCATION_ERROR_CODES.REVOCATION_STATUS_UNAVAILABLE, 'not_checked', false, input);
}

/** The registry/adapter threw or returned a malformed response. */
export function revocationLookupFailedStatus(input?: {
  subjectId?: string;
  subjectType?: RevocableSubjectType;
  now?: Date;
}): UnknownRevocationStatus {
  return unknownStatus(REVOCATION_ERROR_CODES.REVOCATION_LOOKUP_FAILED, 'lookup_error', true, input);
}

/** The registry/adapter did not respond within the allotted budget. */
export function revocationLookupTimeoutStatus(input?: {
  subjectId?: string;
  subjectType?: RevocableSubjectType;
  now?: Date;
}): UnknownRevocationStatus {
  return unknownStatus(REVOCATION_ERROR_CODES.REVOCATION_LOOKUP_TIMEOUT, 'timeout', true, input);
}

export function revocationPermissionDeniedStatus(input?: {
  subjectId?: string;
  subjectType?: RevocableSubjectType;
  now?: Date;
}): UnknownRevocationStatus {
  return unknownStatus(REVOCATION_ERROR_CODES.REVOCATION_PERMISSION_DENIED, 'permission_denied', false, input);
}

export function revocationRecordMalformedStatus(input?: {
  subjectId?: string;
  subjectType?: RevocableSubjectType;
  now?: Date;
}): UnknownRevocationStatus {
  return unknownStatus(REVOCATION_ERROR_CODES.REVOCATION_RECORD_MALFORMED, 'malformed_record', false, input);
}

export function revocationAuthorityMismatchStatus(input?: {
  subjectId?: string;
  subjectType?: RevocableSubjectType;
  now?: Date;
}): UnknownRevocationStatus {
  return unknownStatus(REVOCATION_ERROR_CODES.REVOCATION_AUTHORITY_MISMATCH, 'authority_mismatch', false, input);
}

export function revocationTrustDomainMismatchStatus(input?: {
  subjectId?: string;
  subjectType?: RevocableSubjectType;
  now?: Date;
}): UnknownRevocationStatus {
  return unknownStatus(
    REVOCATION_ERROR_CODES.REVOCATION_TRUST_DOMAIN_MISMATCH,
    'trust_domain_mismatch',
    false,
    input
  );
}

export function revocationSubjectMismatchStatus(input?: {
  subjectId?: string;
  subjectType?: RevocableSubjectType;
  now?: Date;
}): UnknownRevocationStatus {
  return unknownStatus(REVOCATION_ERROR_CODES.REVOCATION_SUBJECT_MISMATCH, 'subject_mismatch', false, input);
}

export function revocationUnsupportedVersionStatus(input?: {
  subjectId?: string;
  subjectType?: RevocableSubjectType;
  now?: Date;
}): UnknownRevocationStatus {
  return unknownStatus(
    REVOCATION_ERROR_CODES.REVOCATION_UNSUPPORTED_VERSION,
    'unsupported_version',
    false,
    input
  );
}

const HTTP_STATUS_BY_ERROR_CODE: Record<RevocationErrorCode, number> = {
  REVOCATION_STATUS_UNAVAILABLE: 503,
  REVOCATION_LOOKUP_FAILED: 503,
  REVOCATION_LOOKUP_TIMEOUT: 503,
  REVOCATION_PERMISSION_DENIED: 403,
  REVOCATION_RECORD_MALFORMED: 503,
  REVOCATION_AUTHORITY_MISMATCH: 403,
  REVOCATION_TRUST_DOMAIN_MISMATCH: 403,
  REVOCATION_SUBJECT_MISMATCH: 403,
  REVOCATION_UNSUPPORTED_VERSION: 503,
};

/**
 * Documented HTTP mapping (sprint §36) for a future transport layer. No HTTP transport exists
 * in this repo today (`runtime/api/routes.ts` returns a transport-agnostic `ApiResponse`), so
 * this is forward-looking infrastructure, not a live integration.
 */
export function mapRevocationStatusToHttpStatus(status: RevocationStatus): number {
  if (status.status === 'verified_not_revoked') {
    return 200;
  }
  if (status.status === 'revoked') {
    return 403;
  }
  return HTTP_STATUS_BY_ERROR_CODE[status.errorCode];
}
