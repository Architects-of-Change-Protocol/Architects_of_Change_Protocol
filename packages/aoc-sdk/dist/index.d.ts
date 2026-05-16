export type RuntimeMode = 'local' | 'remote';
export type HostedRuntimeClientOptions = {
    apiKey?: string;
    baseUrl?: string;
    mode?: RuntimeMode;
    fetchImpl?: typeof fetch;
};
export type HostedRuntimeSdk = {
    evaluateEnforcement(input: Record<string, unknown>): Promise<Record<string, unknown>>;
    authorizeExecution(input: Record<string, unknown>): Promise<Record<string, unknown>>;
    mintCapability(input: Record<string, unknown>): Promise<Record<string, unknown>>;
    createAccessRequest(input: Record<string, unknown>): Promise<Record<string, unknown>>;
    decideAccessRequest(input: Record<string, unknown>): Promise<Record<string, unknown>>;
    listAuditEvents(input?: Record<string, string>): Promise<Record<string, unknown>[]>;
    getUsageSummary(input: Record<string, string>): Promise<Record<string, unknown>>;
};
export type SdkResult<TData, TCode extends string = string> = {
    ok: true;
    data: TData;
} | {
    ok: false;
    error: {
        code: TCode;
        message: string;
    };
};
export declare function createRuntimeClient<TClient extends HostedRuntimeSdk>(client: TClient): TClient;
export declare function createSafeRuntimeClient<TClient extends HostedRuntimeSdk>(client: TClient, options: HostedRuntimeClientOptions): SdkResult<TClient, 'SDK_CONFIG_ERROR'>;
export { normalizeIdentity, type SdkIdentityInput, type SdkCanonicalIdentity } from './identity';
export * from './contracts';
//# sourceMappingURL=index.d.ts.map