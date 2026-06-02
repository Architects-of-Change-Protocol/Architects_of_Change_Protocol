export declare const ClaimType: {
    readonly Identity: "Identity";
    readonly Capability: "Capability";
    readonly Authorization: "Authorization";
    readonly Certification: "Certification";
    readonly Role: "Role";
    readonly Credential: "Credential";
    readonly Governance: "Governance";
    readonly Custom: "Custom";
};
export type ClaimType = (typeof ClaimType)[keyof typeof ClaimType];
export declare const EvidenceType: {
    readonly Document: "Document";
    readonly Contract: "Contract";
    readonly Certification: "Certification";
    readonly BoardResolution: "BoardResolution";
    readonly AuditRecord: "AuditRecord";
    readonly Attestation: "Attestation";
    readonly AIOutput: "AIOutput";
    readonly SystemRecord: "SystemRecord";
    readonly Custom: "Custom";
};
export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];
export declare const AttestationType: {
    readonly Human: "Human";
    readonly Organization: "Organization";
    readonly System: "System";
    readonly AI: "AI";
    readonly Remote: "Remote";
    readonly Governance: "Governance";
};
export type AttestationType = (typeof AttestationType)[keyof typeof AttestationType];
export declare const VerificationStatus: {
    readonly Pending: "Pending";
    readonly Verified: "Verified";
    readonly Failed: "Failed";
};
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];
export declare const StandingStatus: {
    readonly Draft: "Draft";
    readonly Verified: "Verified";
    readonly Active: "Active";
    readonly Expired: "Expired";
    readonly Suspended: "Suspended";
    readonly Revoked: "Revoked";
    readonly Superseded: "Superseded";
    readonly Invalid: "Invalid";
    readonly NotYetActive: "NotYetActive";
};
export type StandingStatus = (typeof StandingStatus)[keyof typeof StandingStatus];
export declare const AuthorityStatus: {
    readonly Granted: "Granted";
    readonly Suspended: "Suspended";
    readonly Revoked: "Revoked";
    readonly Expired: "Expired";
};
export type AuthorityStatus = (typeof AuthorityStatus)[keyof typeof AuthorityStatus];
export declare const DecisionStatus: {
    readonly Proposed: "Proposed";
    readonly Approved: "Approved";
    readonly Rejected: "Rejected";
    readonly Executed: "Executed";
    readonly Cancelled: "Cancelled";
};
export type DecisionStatus = (typeof DecisionStatus)[keyof typeof DecisionStatus];
//# sourceMappingURL=claim-enums.d.ts.map