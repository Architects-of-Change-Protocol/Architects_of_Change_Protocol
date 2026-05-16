# Observability Adapter Guidance

Current runtime contracts are vendor-neutral (`TelemetrySink`, `RuntimeMetricsSink`, `RuntimeHealthReporter`, `TraceContextProvider`).

Future adapters can map these contracts to OpenTelemetry, Datadog, SIEM, or enterprise observability systems without runtime semantic drift.

Rules:
- Preserve taxonomy and severity mapping.
- Apply redaction before export.
- Avoid transforming audit records into telemetry events.
