import type { RuntimeEndpoint, RuntimeMode } from './api-types';

export const RUNTIME_TRANSPORT_VERSION = '1.0.0' as const;
export const RUNTIME_HANDSHAKE_PATH = '/runtime/handshake' as const;

export type RuntimeTransportMetadata = {
  transportVersion: string;
  runtimeVersion: string;
  mode: RuntimeMode;
  endpoint?: RuntimeEndpoint | typeof RUNTIME_HANDSHAKE_PATH;
  requestId: string;
  correlationId: string;
  traceId?: string;
  timestamp: string;
};

export type RuntimeRequestEnvelope<TPayload> = {
  metadata: RuntimeTransportMetadata;
  payload: TPayload;
};

export type RuntimeErrorCode =
  | 'TRANSPORT_FAILURE'
  | 'RUNTIME_FAILURE'
  | 'CAPABILITY_DENIED'
  | 'CONSENT_DENIED'
  | 'VALIDATION_FAILURE'
  | 'COMPATIBILITY_FAILURE'
  | 'STARTUP_RUNTIME_MISMATCH'
  | 'AUTH_FAILURE'
  | 'RATE_LIMITED'
  | 'UNKNOWN_API_ERROR';

export type RuntimeErrorEnvelope = {
  code: RuntimeErrorCode | string;
  message: string;
  retryable: boolean;
  category: 'transport' | 'runtime' | 'capability' | 'consent' | 'validation' | 'compatibility' | 'auth' | 'unknown';
};

export type RuntimeResponseEnvelope<TPayload> =
  | { success: true; metadata: RuntimeTransportMetadata; data: TPayload }
  | { success: false; metadata: RuntimeTransportMetadata; error: RuntimeErrorEnvelope };

export type RuntimeHandshakeEnvelope = {
  transportVersion: string;
  runtimeVersion: string;
  supportedModes: RuntimeMode[];
  supportedEndpoints: string[];
};

export function buildMetadata(input: {
  mode: RuntimeMode;
  requestId: string;
  correlationId: string;
  endpoint?: RuntimeEndpoint | typeof RUNTIME_HANDSHAKE_PATH;
  traceId?: string;
}): RuntimeTransportMetadata {
  return {
    transportVersion: RUNTIME_TRANSPORT_VERSION,
    runtimeVersion: '1.0.0',
    mode: input.mode,
    endpoint: input.endpoint,
    requestId: input.requestId,
    correlationId: input.correlationId,
    traceId: input.traceId,
    timestamp: new Date().toISOString(),
  };
}

export function toErrorEnvelope(code: string, message: string): RuntimeErrorEnvelope {
  if (code.startsWith('AUTH_')) return { code, message, retryable: false, category: 'auth' };
  if (code === 'RATE_LIMIT_EXCEEDED') return { code: 'RATE_LIMITED', message, retryable: true, category: 'auth' };
  if (code.includes('CAPABILITY')) return { code: 'CAPABILITY_DENIED', message, retryable: false, category: 'capability' };
  if (code.includes('CONSENT')) return { code: 'CONSENT_DENIED', message, retryable: false, category: 'consent' };
  if (code.includes('INVALID') || code.includes('REQUEST_PARSE')) return { code: 'VALIDATION_FAILURE', message, retryable: false, category: 'validation' };
  return { code: 'RUNTIME_FAILURE', message, retryable: false, category: 'runtime' };
}
