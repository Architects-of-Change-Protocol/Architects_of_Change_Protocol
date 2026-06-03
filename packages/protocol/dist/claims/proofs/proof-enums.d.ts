export declare const ProofType: {
    readonly HashProof: "HashProof";
    readonly SignatureProof: "SignatureProof";
    readonly AttestationProof: "AttestationProof";
    readonly IntegrityProof: "IntegrityProof";
    readonly ChainProof: "ChainProof";
    readonly CredentialProof: "CredentialProof";
    readonly AuditProof: "AuditProof";
    readonly TraceProof: "TraceProof";
    readonly Custom: "Custom";
};
export type ProofType = (typeof ProofType)[keyof typeof ProofType];
export declare const ProofFormat: {
    readonly JSON: "JSON";
    readonly JWT: "JWT";
    readonly JWS: "JWS";
    readonly VC: "VC";
    readonly Hash: "Hash";
    readonly URI: "URI";
    readonly Custom: "Custom";
};
export type ProofFormat = (typeof ProofFormat)[keyof typeof ProofFormat];
export declare const ProofStatus: {
    readonly Declared: "Declared";
    readonly Observed: "Observed";
    readonly Verified: "Verified";
    readonly Invalid: "Invalid";
    readonly Unknown: "Unknown";
};
export type ProofStatus = (typeof ProofStatus)[keyof typeof ProofStatus];
//# sourceMappingURL=proof-enums.d.ts.map