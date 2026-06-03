export const CredentialType = {
  IdentityCredential: 'IdentityCredential',
  CapabilityCredential: 'CapabilityCredential',
  CertificationCredential: 'CertificationCredential',
  AuthorizationCredential: 'AuthorizationCredential',
  RoleCredential: 'RoleCredential',
  GovernanceCredential: 'GovernanceCredential',
  ProfessionalCredential: 'ProfessionalCredential',
  OrganizationCredential: 'OrganizationCredential',
  SystemCredential: 'SystemCredential',
  Custom: 'Custom',
} as const;
export type CredentialType = (typeof CredentialType)[keyof typeof CredentialType];

export const CredentialFormat = {
  JSON: 'JSON',
  JWT: 'JWT',
  VC: 'VC',
  LinkedData: 'LinkedData',
  Document: 'Document',
  RegistryEntry: 'RegistryEntry',
  Custom: 'Custom',
} as const;
export type CredentialFormat = (typeof CredentialFormat)[keyof typeof CredentialFormat];

export const CredentialStatus = {
  Draft: 'Draft',
  Issued: 'Issued',
  Active: 'Active',
  Suspended: 'Suspended',
  Revoked: 'Revoked',
  Expired: 'Expired',
  Superseded: 'Superseded',
  Archived: 'Archived',
  Unknown: 'Unknown',
} as const;
export type CredentialStatus = (typeof CredentialStatus)[keyof typeof CredentialStatus];

export const CredentialSubjectKind = {
  Principal: 'Principal',
  Organization: 'Organization',
  System: 'System',
  AI: 'AI',
  Runtime: 'Runtime',
  GovernanceBody: 'GovernanceBody',
  CredentialIssuer: 'CredentialIssuer',
  Custom: 'Custom',
} as const;
export type CredentialSubjectKind = (typeof CredentialSubjectKind)[keyof typeof CredentialSubjectKind];

export const CredentialIssuerKind = {
  Human: 'Human',
  Organization: 'Organization',
  System: 'System',
  GovernanceBody: 'GovernanceBody',
  CredentialIssuer: 'CredentialIssuer',
  Protocol: 'Protocol',
  External: 'External',
  Custom: 'Custom',
} as const;
export type CredentialIssuerKind = (typeof CredentialIssuerKind)[keyof typeof CredentialIssuerKind];
