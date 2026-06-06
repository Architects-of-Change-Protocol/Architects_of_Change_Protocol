export type RuntimeEndpoint =
  | '/enforcement/evaluate'
  | '/execution/authorize'
  | '/capability/mint'
  | '/access/request'
  | '/access/requests'
  | '/access/request/decision'
  | '/access/grants/active'
  | '/access/grant/revoke'
  | '/payout/execute'
  | '/payout/callback'
  | '/trust/credential/register'
  | '/trust/verify'
  | '/trust/consent/grant'
  | '/data/access'
  | '/audit/events'
  | '/usage/summary';

const PLATFORM_VERSION = '1.0.0';
const CONTRACTS_VERSION = '1.0.0';
const RUNTIME_TRANSPORT_VERSION = '1.0.0';
const SDK_COMPATIBILITY_VERSION = '1.0.0';

export type RuntimeTelemetrySeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type RuntimeTelemetryCategory =
  | 'startup'
  | 'request'
  | 'transport'
  | 'auth'
  | 'capability'
  | 'consent'
  | 'audit'
  | 'usage'
  | 'metering'
  | 'compatibility'
  | 'storage'
  | 'sdk'
  | 'system';

export type RuntimeTelemetryEventType =
  | 'startup.completed'
  | 'request.received'
  | 'request.auth.allowed'
  | 'request.auth.denied'
  | 'request.payload_validation.failed'
  | 'request.capability.denied'
  | 'request.route.allowed'
  | 'request.route.denied'
  | 'transport.response.emitted'
  | 'metering.recorded'
  | 'metering.failed'
  | 'compatibility.warning'
  | 'compatibility.failure';

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

export interface TelemetrySink { emit(event: RuntimeTelemetryEvent): void; }
export interface RuntimeMetricsSink { emitMetric(event: RuntimeMetricEvent): void; }
export interface RuntimeHealthReporter { snapshot(): RuntimeHealthSnapshot; }
export interface TraceContextProvider {
  create(input: { requestId: string; correlationId?: string; endpoint: RuntimeTraceContext['endpoint'] }): RuntimeTraceContext;
}

export class NoopTelemetrySink implements TelemetrySink { emit(): void {} }
export class NoopRuntimeMetricsSink implements RuntimeMetricsSink { emitMetric(): void {} }

export class InMemoryTelemetrySink implements TelemetrySink {
  readonly events: RuntimeTelemetryEvent[] = [];
  emit(event: RuntimeTelemetryEvent): void { this.events.push(event); }
}

export class InMemoryRuntimeMetricsSink implements RuntimeMetricsSink {
  readonly events: RuntimeMetricEvent[] = [];
  emitMetric(event: RuntimeMetricEvent): void { this.events.push(event); }
}

export class DefaultTraceContextProvider implements TraceContextProvider {
  create(input: { requestId: string; correlationId?: string; endpoint: RuntimeTraceContext['endpoint'] }): RuntimeTraceContext {
    const correlationId = input.correlationId && input.correlationId.trim() !== '' ? input.correlationId : input.requestId;
    return {
      requestId: input.requestId,
      correlationId,
      traceId: `${input.requestId}:${Date.now()}`,
      endpoint: input.endpoint,
      runtimeVersion: PLATFORM_VERSION,
      transportVersion: RUNTIME_TRANSPORT_VERSION,
      timestamp: new Date().toISOString(),
    };
  }
}

export class DefaultRuntimeHealthReporter implements RuntimeHealthReporter {
  constructor(private readonly enforcementMode: 'soft' | 'strict', private readonly warningCount = 0) {}
  snapshot(): RuntimeHealthSnapshot {
    const env = process.env.NODE_ENV;
    const environment = env === 'development' || env === 'test' || env === 'production' ? env : 'unknown';
    const status: RuntimeHealthStatus = this.warningCount > 0 ? 'degraded' : 'healthy';
    return {
      status,
      startupPosture: status === 'healthy' ? 'ready' : 'degraded',
      environment,
      transportVersion: RUNTIME_TRANSPORT_VERSION,
      contractsVersion: CONTRACTS_VERSION,
      sdkCompatibilityVersion: SDK_COMPATIBILITY_VERSION,
      storageMode: 'memory',
      enforcementMode: this.enforcementMode,
      warningCount: this.warningCount,
      degraded: status !== 'healthy',
      strictMode: this.enforcementMode === 'strict',
      generatedAt: new Date().toISOString(),
    };
  }
}

export const FORBIDDEN_TELEMETRY_FIELDS = [
  'apiKey', 'authorization', 'token', 'secret', 'capabilityToken', 'privateKey', 'seedPhrase', 'password', 'rawPayload'
] as const;
