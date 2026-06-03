"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryLookupStatus = exports.RegistryEntryStatus = exports.RegistryAuthorityLevel = exports.RegistryEntryType = exports.RegistryType = void 0;
exports.RegistryType = {
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
};
exports.RegistryEntryType = {
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
};
exports.RegistryAuthorityLevel = {
    SelfDeclared: 'SelfDeclared',
    OrganizationDeclared: 'OrganizationDeclared',
    GovernanceDeclared: 'GovernanceDeclared',
    ProtocolRecognized: 'ProtocolRecognized',
    Federated: 'Federated',
    External: 'External',
    Unknown: 'Unknown',
};
exports.RegistryEntryStatus = {
    Active: 'Active',
    Deprecated: 'Deprecated',
    Revoked: 'Revoked',
    Superseded: 'Superseded',
    Archived: 'Archived',
    Unknown: 'Unknown',
};
exports.RegistryLookupStatus = {
    Found: 'Found',
    NotFound: 'NotFound',
    Ambiguous: 'Ambiguous',
    Unavailable: 'Unavailable',
    Unauthorized: 'Unauthorized',
    Unknown: 'Unknown',
};
