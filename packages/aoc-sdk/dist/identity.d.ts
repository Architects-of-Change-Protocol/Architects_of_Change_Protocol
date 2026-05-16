export type SdkIdentityInput = {
    subject_id?: string;
    subject_hash?: string;
    requester_id?: string;
    consumer_id?: string;
    tenant_id?: string;
};
export type SdkCanonicalIdentity = {
    subject_principal_id: string;
    requester_principal_id?: string;
    consumer_principal_id?: string;
    tenant_id?: string;
};
export declare function normalizeIdentity(input: SdkIdentityInput): SdkCanonicalIdentity;
//# sourceMappingURL=identity.d.ts.map