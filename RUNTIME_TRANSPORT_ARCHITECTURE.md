# Runtime Transport Architecture

- Canonical transport contracts live in `runtime/types/transport.ts`.
- Hosted runtime emits `RuntimeResponseEnvelope` for every route.
- Handshake endpoint (`/runtime/handshake`) returns compatibility/version metadata.
- Request tracing is deterministic through requestId + correlationId metadata.
