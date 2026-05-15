export type EncryptedObject = {
    version: 1;
    algorithm: 'AES-256-GCM';
    nonce: string;
    ciphertext: string;
    auth_tag: string;
};
export interface RuntimeAuthorityIdentity {
    authorityId: string;
    issuerId: string;
    runtimeId: string;
    algorithm: 'ed25519';
    publicKey: string;
    keyId: string;
}
export interface GovernanceSignature {
    algorithm: 'ed25519';
    keyId: string;
    signer: RuntimeAuthorityIdentity;
    signature: string;
    signedAt: string;
    payloadHash: string;
    provenance: {
        runtimeSource: string;
        timestamp: string;
        chainPosition?: number;
        previousHash?: string;
    };
}
export interface SignedAuthorizationDecision<TDecision = Record<string, unknown>> {
    decision: TDecision;
    decisionHash: string;
    evaluationHash: string;
    signature: GovernanceSignature;
}
export interface SignedAuditEvent<TEvent = Record<string, unknown>> {
    event: TEvent;
    eventHash: string;
    previousEventHash?: string;
    chainPosition: number;
    chainId: string;
    signature: GovernanceSignature;
}
export interface SignedConsentGrant<TGrant = Record<string, unknown>> {
    grant: TGrant;
    grantHash: string;
    issuerSignature: GovernanceSignature;
    delegatedSignature?: GovernanceSignature;
    revocationSignature?: GovernanceSignature;
}
export interface PortableCognitionIntegrity {
    packageHash: string;
    governanceSnapshotHash: string;
    auditContinuityHash: string;
    topologyHash: string;
    provenanceHash: string;
}
//# sourceMappingURL=types.d.ts.map