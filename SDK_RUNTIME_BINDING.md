# SDK Runtime Binding

- `HostedRuntimeClient` now performs stable transport binding via canonical envelopes.
- Remote calls use typed envelope parsing and deterministic error propagation.
- SDK can validate compatibility at initialization through lightweight handshake.
- Local mode is preserved and bypasses transport entirely.
