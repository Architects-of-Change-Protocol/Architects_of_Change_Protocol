# Release Governance Model

## Canonical version primitives
All runtime and SDK compatibility decisions are governed by `runtime/versioning.ts`.

- `PLATFORM_VERSION`
- `CONTRACTS_VERSION`
- `RUNTIME_TRANSPORT_VERSION`
- `MINIMUM_SUPPORTED_TRANSPORT_VERSION`
- `SDK_COMPATIBILITY_VERSION`
- `COMPATIBILITY_WINDOW`

## Governance rules
1. Never hardcode handshake or metadata versions outside the canonical version module.
2. Runtime handshake MUST publish all compatibility metadata.
3. SDK MUST classify compatibility as `compatible`, `warn`, or `incompatible` before use.
4. Any MAJOR bump requires matrix update + governance docs update in same PR.

## Release metadata expectations
Each release must provide:
- package version(s)
- runtime transport version
- contracts version
- sdk compatibility window
- compatibility matrix row updates
