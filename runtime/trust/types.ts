/**
 * Compatibility bridge for Enterprise Assurance trust runtime types.
 *
 * @deprecated Use `@aoc/enterprise/assurance/trust` instead.
 * Migrate to Enterprise Assurance; no contract ownership lives here.
 */
export type {
  AocIdentityConsentRecord,
  AocIdentityCredentialRecord,
  AocIdentityIssuerRecord,
  IdentityIssuer,
  IdentityVerificationResult,
  KycLevel,
  RlusdWithdrawalRequest,
  SubjectPrincipalId,
  TrustAuditEvent,
} from '../../enterprise/src/assurance/trust/types';
