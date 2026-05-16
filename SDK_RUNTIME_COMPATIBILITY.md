# SDK Runtime Compatibility

The SDK reads `/runtime/handshake` and validates runtime transport via `classifyTransportCompatibility`.

- `compatible`: proceed.
- `warn`: proceed with warning for runtime-forward minor skew.
- `incompatible`: fail fast with `COMPATIBILITY_FAILURE`.

This keeps compatibility behavior deterministic and centralized.
