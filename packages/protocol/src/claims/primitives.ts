import type { CanonicalId, UtcDateTime } from '../contracts';

export type CanonicalClaimId = CanonicalId;
export type CanonicalEvidenceId = CanonicalId;
export type CanonicalAssertionId = CanonicalId;
export type CanonicalAttestationId = CanonicalId;
export type CanonicalVerificationId = CanonicalId;
export type CanonicalStandingId = CanonicalId;
export type CanonicalCapabilityId = CanonicalId;
export type CanonicalAuthorityId = CanonicalId;
export type CanonicalDecisionId = CanonicalId;

export type CanonicalTimestamp = UtcDateTime;

export type CanonicalMetadata = Readonly<Record<string, unknown>>;

export type CanonicalSubject = string;
export type CanonicalIssuer = string;
export type CanonicalSource = string;
export type CanonicalAttester = string;
export type CanonicalVerifier = string;
export type CanonicalDecisionMaker = string;

export type CanonicalScope = Readonly<Record<string, unknown>>;
