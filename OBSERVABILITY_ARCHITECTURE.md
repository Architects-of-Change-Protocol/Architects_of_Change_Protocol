# Observability Architecture

This runtime now separates operational telemetry from business audit. Telemetry events are emitted through `TelemetrySink`, metrics through `RuntimeMetricsSink`, and health through `RuntimeHealthReporter`.

## Core model
- Canonical primitives live in `runtime/observability.ts`.
- Runtime request lifecycle emits compact event taxonomy.
- `/runtime/health` exposes posture without secrets.

## Sensitive-data guardrails
Forbidden telemetry fields include secrets, tokens, API keys, passwords, raw payloads, and private keys.
