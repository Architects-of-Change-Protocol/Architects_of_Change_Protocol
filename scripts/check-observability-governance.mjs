import fs from 'fs';

const docs = [
  'OBSERVABILITY_ARCHITECTURE.md',
  'TELEMETRY_EVENT_TAXONOMY.md',
  'AUDIT_VS_TELEMETRY_BOUNDARY.md',
  'RUNTIME_HEALTH_MODEL.md',
  'TRACE_CONTEXT_MODEL.md',
  'OBSERVABILITY_ADAPTER_GUIDANCE.md',
  'OPERATIONAL_METRICS_GOVERNANCE.md'
];

const requiredTelemetryTypes = [
  'RuntimeTelemetryEvent',
  'RuntimeTelemetryEventType',
  'RuntimeTelemetrySeverity',
  'RuntimeTelemetryCategory',
  'RuntimeMetricEvent',
  'RuntimeHealthSnapshot',
  'RuntimeTraceContext',
  'TelemetrySink',
  'RuntimeMetricsSink'
];

let failed = false;
for (const doc of docs) {
  if (!fs.existsSync(doc)) {
    console.error(`Missing observability governance doc: ${doc}`);
    failed = true;
  }
}

const source = fs.readFileSync('runtime/observability.ts', 'utf8');
for (const symbol of requiredTelemetryTypes) {
  if (!source.includes(symbol)) {
    console.error(`Missing observability symbol: ${symbol}`);
    failed = true;
  }
}

const forbiddenFields = ['apiKey', 'token', 'secret', 'privateKey', 'password'];
for (const field of forbiddenFields) {
  if (!source.includes(field)) {
    console.error(`Forbidden telemetry field policy missing entry: ${field}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('Observability governance checks passed.');
