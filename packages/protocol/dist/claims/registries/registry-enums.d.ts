export declare const RegistryType: {
    readonly ClaimRegistry: "ClaimRegistry";
    readonly EvidenceRegistry: "EvidenceRegistry";
    readonly AttestationRegistry: "AttestationRegistry";
    readonly ProofRegistry: "ProofRegistry";
    readonly PrincipalRegistry: "PrincipalRegistry";
    readonly CredentialRegistry: "CredentialRegistry";
    readonly PolicyRegistry: "PolicyRegistry";
    readonly AuthorityRegistry: "AuthorityRegistry";
    readonly DecisionRegistry: "DecisionRegistry";
    readonly Custom: "Custom";
};
export type RegistryType = (typeof RegistryType)[keyof typeof RegistryType];
export declare const RegistryEntryType: {
    readonly Claim: "Claim";
    readonly Evidence: "Evidence";
    readonly Assertion: "Assertion";
    readonly Attestation: "Attestation";
    readonly Verification: "Verification";
    readonly Standing: "Standing";
    readonly Capability: "Capability";
    readonly Authority: "Authority";
    readonly Decision: "Decision";
    readonly Principal: "Principal";
    readonly Proof: "Proof";
    readonly Credential: "Credential";
    readonly Policy: "Policy";
    readonly Custom: "Custom";
};
export type RegistryEntryType = (typeof RegistryEntryType)[keyof typeof RegistryEntryType];
export declare const RegistryAuthorityLevel: {
    readonly SelfDeclared: "SelfDeclared";
    readonly OrganizationDeclared: "OrganizationDeclared";
    readonly GovernanceDeclared: "GovernanceDeclared";
    readonly ProtocolRecognized: "ProtocolRecognized";
    readonly Federated: "Federated";
    readonly External: "External";
    readonly Unknown: "Unknown";
};
export type RegistryAuthorityLevel = (typeof RegistryAuthorityLevel)[keyof typeof RegistryAuthorityLevel];
export declare const RegistryEntryStatus: {
    readonly Active: "Active";
    readonly Deprecated: "Deprecated";
    readonly Revoked: "Revoked";
    readonly Superseded: "Superseded";
    readonly Archived: "Archived";
    readonly Unknown: "Unknown";
};
export type RegistryEntryStatus = (typeof RegistryEntryStatus)[keyof typeof RegistryEntryStatus];
export declare const RegistryLookupStatus: {
    readonly Found: "Found";
    readonly NotFound: "NotFound";
    readonly Ambiguous: "Ambiguous";
    readonly Unavailable: "Unavailable";
    readonly Unauthorized: "Unauthorized";
    readonly Unknown: "Unknown";
};
export type RegistryLookupStatus = (typeof RegistryLookupStatus)[keyof typeof RegistryLookupStatus];
//# sourceMappingURL=registry-enums.d.ts.map