export type RuntimeMode = 'local' | 'remote';

export type RuntimeTransportMetadata = {
  transportVersion: string;
  runtimeVersion: string;
  mode: RuntimeMode;
  requestId: string;
  correlationId: string;
  endpoint?: string;
  traceId?: string;
  timestamp: string;
};

export type RuntimeErrorEnvelope = {
  code: string;
  message: string;
  retryable: boolean;
  category: 'transport' | 'runtime' | 'capability' | 'consent' | 'validation' | 'compatibility' | 'auth' | 'unknown';
};

export type RuntimeResponseEnvelope<T> =
  | { success: true; metadata: RuntimeTransportMetadata; data: T }
  | { success: false; metadata: RuntimeTransportMetadata; error: RuntimeErrorEnvelope };

export type HostedRuntimeClientOptions = { apiKey?: string; baseUrl?: string; mode?: RuntimeMode; fetchImpl?: typeof fetch };

export type HostedRuntimeSdk = {
  evaluateEnforcement(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  authorizeExecution(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  mintCapability(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  createAccessRequest(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  decideAccessRequest(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  listAuditEvents(input?: Record<string, string>): Promise<Record<string, unknown>[]>;
  getUsageSummary(input: Record<string, string>): Promise<Record<string, unknown>>;
};

export interface HostedRuntimeTransportAdapter {
  execute<TReq extends Record<string, unknown>, TRes>(input: { endpoint: string; method: 'GET' | 'POST'; payload?: TReq }): Promise<RuntimeResponseEnvelope<TRes>>;
}

export type SdkResult<TData, TCode extends string = string> =
  | { ok: true; data: TData }
  | { ok: false; error: { code: TCode; message: string } };

export function createRuntimeClient<TClient extends HostedRuntimeSdk>(client: TClient): TClient { return client; }

export function createSafeRuntimeClient<TClient extends HostedRuntimeSdk>(client: TClient, options: HostedRuntimeClientOptions): SdkResult<TClient, 'SDK_CONFIG_ERROR'> {
  if ((options.mode ?? 'remote') !== 'local' && (!options.apiKey || options.apiKey.trim() === '')) {
    return { ok: false, error: { code: 'SDK_CONFIG_ERROR', message: 'Remote mode requires a non-empty apiKey.' } };
  }
  return { ok: true, data: client };
}

export { normalizeIdentity, type SdkIdentityInput, type SdkCanonicalIdentity } from './identity';
export * from './contracts';
