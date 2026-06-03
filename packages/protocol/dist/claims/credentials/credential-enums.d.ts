export declare const CredentialType: {
    readonly IdentityCredential: "IdentityCredential";
    readonly CapabilityCredential: "CapabilityCredential";
    readonly CertificationCredential: "CertificationCredential";
    readonly AuthorizationCredential: "AuthorizationCredential";
    readonly RoleCredential: "RoleCredential";
    readonly GovernanceCredential: "GovernanceCredential";
    readonly ProfessionalCredential: "ProfessionalCredential";
    readonly OrganizationCredential: "OrganizationCredential";
    readonly SystemCredential: "SystemCredential";
    readonly Custom: "Custom";
};
export type CredentialType = (typeof CredentialType)[keyof typeof CredentialType];
export declare const CredentialFormat: {
    readonly JSON: "JSON";
    readonly JWT: "JWT";
    readonly VC: "VC";
    readonly LinkedData: "LinkedData";
    readonly Document: "Document";
    readonly RegistryEntry: "RegistryEntry";
    readonly Custom: "Custom";
};
export type CredentialFormat = (typeof CredentialFormat)[keyof typeof CredentialFormat];
export declare const CredentialStatus: {
    readonly Draft: "Draft";
    readonly Issued: "Issued";
    readonly Active: "Active";
    readonly Suspended: "Suspended";
    readonly Revoked: "Revoked";
    readonly Expired: "Expired";
    readonly Superseded: "Superseded";
    readonly Archived: "Archived";
    readonly Unknown: "Unknown";
};
export type CredentialStatus = (typeof CredentialStatus)[keyof typeof CredentialStatus];
export declare const CredentialSubjectKind: {
    readonly Principal: "Principal";
    readonly Organization: "Organization";
    readonly System: "System";
    readonly AI: "AI";
    readonly Runtime: "Runtime";
    readonly GovernanceBody: "GovernanceBody";
    readonly CredentialIssuer: "CredentialIssuer";
    readonly Custom: "Custom";
};
export type CredentialSubjectKind = (typeof CredentialSubjectKind)[keyof typeof CredentialSubjectKind];
export declare const CredentialIssuerKind: {
    readonly Human: "Human";
    readonly Organization: "Organization";
    readonly System: "System";
    readonly GovernanceBody: "GovernanceBody";
    readonly CredentialIssuer: "CredentialIssuer";
    readonly Protocol: "Protocol";
    readonly External: "External";
    readonly Custom: "Custom";
};
export type CredentialIssuerKind = (typeof CredentialIssuerKind)[keyof typeof CredentialIssuerKind];
//# sourceMappingURL=credential-enums.d.ts.map