import { GovernanceSignature, RuntimeFederation, TrustBoundaryScope } from "@aoc-runtime/shared-types";
export interface TrustedSignerRecord {
    signerKeyId: string;
    runtimeId: string;
    organizationId: string;
    scopes: TrustBoundaryScope[];
    delegatedFromKeyId?: string;
    registeredAt: string;
    expiresAt?: string;
    revokedAt?: string;
}
export interface FederatedTrustEvaluation {
    trusted: boolean;
    trustedAuthorityPath: string[];
    rejectedAuthorityPath: string[];
    revokedIntermediaries: string[];
    trustScopeReasoning: string[];
    federationBoundaryReasoning: string[];
}
export declare class TrustRegistryRuntime {
    private readonly federation;
    private readonly signers;
    constructor(federation: RuntimeFederation);
    registerSigner(record: TrustedSignerRecord): void;
    revokeSigner(signerKeyId: string, revokedAt?: string): void;
    evaluateSignatureTrust(signature: GovernanceSignature, scope?: TrustBoundaryScope, at?: string): FederatedTrustEvaluation;
    private resolveTrustChain;
    private edgeActive;
    private scopeAllowed;
}
//# sourceMappingURL=index.d.ts.map