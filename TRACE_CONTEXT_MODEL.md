# Trace Context Model

`RuntimeTraceContext` fields:
- requestId
- correlationId
- traceId
- endpoint
- runtimeVersion
- transportVersion
- timestamp

Request lifecycle telemetry uses this trace context for all runtime operational events.
