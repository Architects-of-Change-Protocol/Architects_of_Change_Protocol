export const RegistryType = {
  ClaimRegistry: 'ClaimRegistry',
  EvidenceRegistry: 'EvidenceRegistry',
  AttestationRegistry: 'AttestationRegistry',
  ProofRegistry: 'ProofRegistry',
  PrincipalRegistry: 'PrincipalRegistry',
  CredentialRegistry: 'CredentialRegistry',
  PolicyRegistry: 'PolicyRegistry',
  AuthorityRegistry: 'AuthorityRegistry',
  DecisionRegistry: 'DecisionRegistry',
  Custom: 'Custom',
} as const;
export type RegistryType = (typeof RegistryType)[keyof typeof RegistryType];

export const RegistryEntryType = {
  Claim: 'Claim',
  Evidence: 'Evidence',
  Assertion: 'Assertion',
  Attestation: 'Attestation',
  Verification: 'Verification',
  Standing: 'Standing',
  Capability: 'Capability',
  Authority: 'Authority',
  Decision: 'Decision',
  Principal: 'Principal',
  Proof: 'Proof',
  Credential: 'Credential',
  Policy: 'Policy',
  Custom: 'Custom',
} as const;
export type RegistryEntryType = (typeof RegistryEntryType)[keyof typeof RegistryEntryType];

export const RegistryAuthorityLevel = {
  SelfDeclared: 'SelfDeclared',
  OrganizationDeclared: 'OrganizationDeclared',
  GovernanceDeclared: 'GovernanceDeclared',
  ProtocolRecognized: 'ProtocolRecognized',
  Federated: 'Federated',
  External: 'External',
  Unknown: 'Unknown',
} as const;
export type RegistryAuthorityLevel = (typeof RegistryAuthorityLevel)[keyof typeof RegistryAuthorityLevel];

export const RegistryEntryStatus = {
  Active: 'Active',
  Deprecated: 'Deprecated',
  Revoked: 'Revoked',
  Superseded: 'Superseded',
  Archived: 'Archived',
  Unknown: 'Unknown',
} as const;
export type RegistryEntryStatus = (typeof RegistryEntryStatus)[keyof typeof RegistryEntryStatus];

export const RegistryLookupStatus = {
  Found: 'Found',
  NotFound: 'NotFound',
  Ambiguous: 'Ambiguous',
  Unavailable: 'Unavailable',
  Unauthorized: 'Unauthorized',
  Unknown: 'Unknown',
} as const;
export type RegistryLookupStatus = (typeof RegistryLookupStatus)[keyof typeof RegistryLookupStatus];
