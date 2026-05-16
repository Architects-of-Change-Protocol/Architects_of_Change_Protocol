# Request Lifecycle Model

1. SDK creates correlation id and sends `x-correlation-id`.
2. Runtime authenticates (`x-api-key`) and creates request id.
3. Runtime validates payload and endpoint semantics.
4. Runtime executes canonical route behavior.
5. Runtime emits canonical `RuntimeResponseEnvelope` with metadata.
6. SDK returns typed result or typed transport/runtime error.

Applies to capability evaluation, authorization, consent/access, audit, and usage.
