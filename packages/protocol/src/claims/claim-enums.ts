export const ClaimType = {
  Identity: 'Identity',
  Capability: 'Capability',
  Authorization: 'Authorization',
  Certification: 'Certification',
  Role: 'Role',
  Credential: 'Credential',
  Governance: 'Governance',
  /**
   * A declaration of where/how a subject (typically a SovereignAssetId)
   * came to exist. Origin claims are epistemically honest by construction:
   * a valid signature proves the issuer asserted the claim, not that the
   * asserted origin is historically or legally true. See
   * `@aoc/protocol/manifest`'s `OriginClaim`.
   */
  Origin: 'Origin',
  /**
   * A declaration of authorship, rights, or other non-governance authority
   * over a subject (typically a SovereignAssetId) — e.g. "issuer asserts
   * they authored this asset" or "issuer asserts they hold distribution
   * rights". Distinct from `Authorization` (which is about permission to
   * perform an action) and from legal ownership, which this claim type
   * never establishes on its own. See `@aoc/protocol/manifest`'s
   * `AuthorityClaim` and `AuthorityClaimKind`.
   */
  Authorship: 'Authorship',
  Custom: 'Custom',
} as const;
export type ClaimType = (typeof ClaimType)[keyof typeof ClaimType];

export const EvidenceType = {
  Document: 'Document',
  Contract: 'Contract',
  Certification: 'Certification',
  BoardResolution: 'BoardResolution',
  AuditRecord: 'AuditRecord',
  Attestation: 'Attestation',
  AIOutput: 'AIOutput',
  SystemRecord: 'SystemRecord',
  Custom: 'Custom',
} as const;
export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];

export const AttestationType = {
  Human: 'Human',
  Organization: 'Organization',
  System: 'System',
  AI: 'AI',
  Remote: 'Remote',
  Governance: 'Governance',
} as const;
export type AttestationType = (typeof AttestationType)[keyof typeof AttestationType];

export const VerificationStatus = {
  Pending: 'Pending',
  Verified: 'Verified',
  Failed: 'Failed',
} as const;
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const StandingStatus = {
  Draft: 'Draft',
  Verified: 'Verified',
  Active: 'Active',
  Expired: 'Expired',
  Suspended: 'Suspended',
  Revoked: 'Revoked',
  Superseded: 'Superseded',
  Invalid: 'Invalid',
  NotYetActive: 'NotYetActive',
  /**
   * A competing or challenging assertion exists against the referenced
   * claim. Contested standing preserves the claim and its evidence as
   * history — it neither deletes the claim nor picks a winner. Protocol
   * records the dispute; adjudication (legal or institutional) is external.
   */
  Contested: 'Contested',
} as const;
export type StandingStatus = (typeof StandingStatus)[keyof typeof StandingStatus];

export const AuthorityStatus = {
  Granted: 'Granted',
  Suspended: 'Suspended',
  Revoked: 'Revoked',
  Expired: 'Expired',
} as const;
export type AuthorityStatus = (typeof AuthorityStatus)[keyof typeof AuthorityStatus];

export const DecisionStatus = {
  Proposed: 'Proposed',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Executed: 'Executed',
  Cancelled: 'Cancelled',
} as const;
export type DecisionStatus = (typeof DecisionStatus)[keyof typeof DecisionStatus];
