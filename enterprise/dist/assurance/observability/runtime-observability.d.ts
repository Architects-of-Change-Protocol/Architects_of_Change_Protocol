export type RuntimeEndpoint = '/enforcement/evaluate' | '/execution/authorize' | '/capability/mint' | '/access/request' | '/access/requests' | '/access/request/decision' | '/access/grants/active' | '/access/grant/revoke' | '/payout/execute' | '/payout/callback' | '/trust/credential/register' | '/trust/verify' | '/trust/consent/grant' | '/data/access' | '/audit/events' | '/usage/summary';
export type RuntimeTelemetrySeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type RuntimeTelemetryCategory = 'startup' | 'request' | 'transport' | 'auth' | 'capability' | 'consent' | 'audit' | 'usage' | 'metering' | 'compatibility' | 'storage' | 'sdk' | 'system';
export type RuntimeTelemetryEventType = 'startup.completed' | 'request.received' | 'request.auth.allowed' | 'request.auth.denied' | 'request.payload_validation.failed' | 'request.capability.denied' | 'request.route.allowed' | 'request.route.denied' | 'transport.response.emitted' | 'metering.recorded' | 'metering.failed' | 'compatibility.warning' | 'compatibility.failure';
export type RuntimeTelemetryMetadata = Record<string, string | number | boolean | null | undefined>;
export type RuntimeTraceContext = {
    requestId: string;
    correlationId: string;
    traceId: string;
    endpoint: RuntimeEndpoint | '/runtime/handshake' | '/runtime/health' | 'unknown';
    runtimeVersion: string;
    transportVersion: string;
    timestamp: string;
};
export type RuntimeTelemetryEvent = {
    eventType: RuntimeTelemetryEventType;
    category: RuntimeTelemetryCategory;
    severity: RuntimeTelemetrySeverity;
    message: string;
    trace: RuntimeTraceContext;
    metadata?: RuntimeTelemetryMetadata;
};
export type RuntimeMetricEvent = {
    metric: string;
    value: number;
    unit: 'count' | 'ms';
    category: RuntimeTelemetryCategory;
    trace?: RuntimeTraceContext;
    tags?: Record<string, string>;
};
export type RuntimeHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
export type RuntimeHealthSnapshot = {
    status: RuntimeHealthStatus;
    startupPosture: 'ready' | 'degraded' | 'failed';
    environment: 'development' | 'test' | 'production' | 'unknown';
    transportVersion: string;
    contractsVersion: string;
    sdkCompatibilityVersion: string;
    storageMode: 'memory' | 'external' | 'unknown';
    enforcementMode: 'soft' | 'strict';
    warningCount: number;
    degraded: boolean;
    strictMode: boolean;
    generatedAt: string;
};
export interface TelemetrySink {
    emit(event: RuntimeTelemetryEvent): void;
}
export interface RuntimeMetricsSink {
    emitMetric(event: RuntimeMetricEvent): void;
}
export interface RuntimeHealthReporter {
    snapshot(): RuntimeHealthSnapshot;
}
export interface TraceContextProvider {
    create(input: {
        requestId: string;
        correlationId?: string;
        endpoint: RuntimeTraceContext['endpoint'];
    }): RuntimeTraceContext;
}
export declare class NoopTelemetrySink implements TelemetrySink {
    emit(): void;
}
export declare class NoopRuntimeMetricsSink implements RuntimeMetricsSink {
    emitMetric(): void;
}
export declare class InMemoryTelemetrySink implements TelemetrySink {
    readonly events: RuntimeTelemetryEvent[];
    emit(event: RuntimeTelemetryEvent): void;
}
export declare class InMemoryRuntimeMetricsSink implements RuntimeMetricsSink {
    readonly events: RuntimeMetricEvent[];
    emitMetric(event: RuntimeMetricEvent): void;
}
export declare class DefaultTraceContextProvider implements TraceContextProvider {
    create(input: {
        requestId: string;
        correlationId?: string;
        endpoint: RuntimeTraceContext['endpoint'];
    }): RuntimeTraceContext;
}
export declare class DefaultRuntimeHealthReporter implements RuntimeHealthReporter {
    private readonly enforcementMode;
    private readonly warningCount;
    constructor(enforcementMode: 'soft' | 'strict', warningCount?: number);
    snapshot(): RuntimeHealthSnapshot;
}
export declare const FORBIDDEN_TELEMETRY_FIELDS: readonly ["apiKey", "authorization", "token", "secret", "capabilityToken", "privateKey", "seedPhrase", "password", "rawPayload"];
//# sourceMappingURL=runtime-observability.d.ts.map