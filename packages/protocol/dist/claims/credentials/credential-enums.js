"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialIssuerKind = exports.CredentialSubjectKind = exports.CredentialStatus = exports.CredentialFormat = exports.CredentialType = void 0;
exports.CredentialType = {
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
};
exports.CredentialFormat = {
    JSON: 'JSON',
    JWT: 'JWT',
    VC: 'VC',
    LinkedData: 'LinkedData',
    Document: 'Document',
    RegistryEntry: 'RegistryEntry',
    Custom: 'Custom',
};
exports.CredentialStatus = {
    Draft: 'Draft',
    Issued: 'Issued',
    Active: 'Active',
    Suspended: 'Suspended',
    Revoked: 'Revoked',
    Expired: 'Expired',
    Superseded: 'Superseded',
    Archived: 'Archived',
    Unknown: 'Unknown',
};
exports.CredentialSubjectKind = {
    Principal: 'Principal',
    Organization: 'Organization',
    System: 'System',
    AI: 'AI',
    Runtime: 'Runtime',
    GovernanceBody: 'GovernanceBody',
    CredentialIssuer: 'CredentialIssuer',
    Custom: 'Custom',
};
exports.CredentialIssuerKind = {
    Human: 'Human',
    Organization: 'Organization',
    System: 'System',
    GovernanceBody: 'GovernanceBody',
    CredentialIssuer: 'CredentialIssuer',
    Protocol: 'Protocol',
    External: 'External',
    Custom: 'Custom',
};
