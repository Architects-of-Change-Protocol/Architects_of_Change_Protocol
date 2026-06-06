"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORBIDDEN_TELEMETRY_FIELDS = exports.DefaultRuntimeHealthReporter = exports.DefaultTraceContextProvider = exports.InMemoryRuntimeMetricsSink = exports.InMemoryTelemetrySink = exports.NoopRuntimeMetricsSink = exports.NoopTelemetrySink = void 0;
const PLATFORM_VERSION = '1.0.0';
const CONTRACTS_VERSION = '1.0.0';
const RUNTIME_TRANSPORT_VERSION = '1.0.0';
const SDK_COMPATIBILITY_VERSION = '1.0.0';
class NoopTelemetrySink {
    emit() { }
}
exports.NoopTelemetrySink = NoopTelemetrySink;
class NoopRuntimeMetricsSink {
    emitMetric() { }
}
exports.NoopRuntimeMetricsSink = NoopRuntimeMetricsSink;
class InMemoryTelemetrySink {
    constructor() {
        this.events = [];
    }
    emit(event) { this.events.push(event); }
}
exports.InMemoryTelemetrySink = InMemoryTelemetrySink;
class InMemoryRuntimeMetricsSink {
    constructor() {
        this.events = [];
    }
    emitMetric(event) { this.events.push(event); }
}
exports.InMemoryRuntimeMetricsSink = InMemoryRuntimeMetricsSink;
class DefaultTraceContextProvider {
    create(input) {
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
exports.DefaultTraceContextProvider = DefaultTraceContextProvider;
class DefaultRuntimeHealthReporter {
    constructor(enforcementMode, warningCount = 0) {
        this.enforcementMode = enforcementMode;
        this.warningCount = warningCount;
    }
    snapshot() {
        const env = process.env.NODE_ENV;
        const environment = env === 'development' || env === 'test' || env === 'production' ? env : 'unknown';
        const status = this.warningCount > 0 ? 'degraded' : 'healthy';
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
exports.DefaultRuntimeHealthReporter = DefaultRuntimeHealthReporter;
exports.FORBIDDEN_TELEMETRY_FIELDS = [
    'apiKey', 'authorization', 'token', 'secret', 'capabilityToken', 'privateKey', 'seedPhrase', 'password', 'rawPayload'
];
