# Public Runtime Surface

Stable public runtime entrypoint: `runtime/index.ts`.

## Stable Exports
- Runtime server/client bootstrap and SDK-facing client types.
- Auth/rate limiting/logging/trust services.
- Identity normalization/types.
- Usage and monetization stable service/types.
- Audit service/types.
- Enforcement API.

## Stability Contract
- Public runtime exports are semver-governed.
- No wildcard re-exports of internal control-plane/distributed/governance domains.
- Experimental and internal modules are isolated into dedicated entrypoints.
