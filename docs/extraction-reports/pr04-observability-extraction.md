# PR-04 Observability Extraction

## Extracted components

- Runtime telemetry event, metric, trace, and health implementations moved from `runtime/observability.ts` to `enterprise/src/assurance/observability/runtime-observability.ts`.
- Structured JSON logging moved from `runtime/logging/logger.ts` to `enterprise/src/assurance/observability/runtime-logger.ts`.
- `InMemoryAssuranceEventSink` provides one Enterprise implementation of `AuditEventSink`, `SecurityEventSink`, `ProtocolEventSink`, and `ObservabilityEventSink`.

## Compatibility shims

- `runtime/observability.ts` re-exports the Enterprise implementation.
- `runtime/logging/logger.ts` re-exports the Enterprise logger.
- `runtime/index.ts` remains unchanged, preserving all existing public exports.

## Parity details

- Telemetry category, severity, event, metadata, metric, trace, health, and forbidden-field types/values are unchanged.
- Trace IDs, timestamps, environment detection, warning degradation, strict-mode reporting, and version metadata remain behaviorally identical.
- Runtime endpoint vocabulary was copied structurally into Enterprise to avoid an Enterprise-to-runtime implementation dependency. The old public `RuntimeEndpoint` remains available from its historical runtime type path.
- Structured logger output remains `console.log(JSON.stringify(entry))`.

## Risks

1. Version defaults are currently the same literal `1.0.0` values used by the historical runtime module. A future version-source extraction should centralize runtime release metadata without introducing a Protocol dependency.
2. Existing telemetry sinks are synchronous. The Protocol adapter interfaces allow promises, but PR-04 preserves synchronous behavior.
3. The new unified event sink is in-memory and intended as an adapter implementation/reference, not durable telemetry storage.
