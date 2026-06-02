export const ClaimType = {
  Identity: 'Identity',
  Capability: 'Capability',
  Authorization: 'Authorization',
  Certification: 'Certification',
  Role: 'Role',
  Credential: 'Credential',
  Governance: 'Governance',
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
