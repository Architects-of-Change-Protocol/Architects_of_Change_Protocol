import { PLATFORM_VERSION, RUNTIME_TRANSPORT_VERSION } from '../versioning';
export const RUNTIME_HANDSHAKE_PATH = '/runtime/handshake';
export function buildMetadata(input) {
    return {
        transportVersion: RUNTIME_TRANSPORT_VERSION,
        runtimeVersion: PLATFORM_VERSION,
        mode: input.mode,
        endpoint: input.endpoint,
        requestId: input.requestId,
        correlationId: input.correlationId,
        traceId: input.traceId,
        timestamp: new Date().toISOString(),
    };
}
export function toErrorEnvelope(code, message) {
    if (code.startsWith('AUTH_'))
        return { code, message, retryable: false, category: 'auth' };
    if (code === 'RATE_LIMIT_EXCEEDED')
        return { code: 'RATE_LIMITED', message, retryable: true, category: 'auth' };
    if (code.includes('CAPABILITY'))
        return { code: 'CAPABILITY_DENIED', message, retryable: false, category: 'capability' };
    if (code.includes('CONSENT'))
        return { code: 'CONSENT_DENIED', message, retryable: false, category: 'consent' };
    if (code.includes('INVALID') || code.includes('REQUEST_PARSE'))
        return { code: 'VALIDATION_FAILURE', message, retryable: false, category: 'validation' };
    return { code: 'RUNTIME_FAILURE', message, retryable: false, category: 'runtime' };
}
