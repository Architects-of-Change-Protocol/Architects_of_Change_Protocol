# Hosted Runtime (Optional Infrastructure Layer)

This `runtime/` package is the **optional hosted infrastructure layer** for AOC.

- The protocol core remains permissionless and can be used directly.
- The hosted runtime adds an API layer, API keys, basic rate limits, and structured logs.
- This is a first functional hosted runtime foundation for future monetization.

## Scope of this version

Included now:
- API-first runtime with 3 endpoints:
  - `POST /enforcement/evaluate`
  - `POST /execution/authorize`
  - `POST /capability/mint`
- API key auth via `x-api-key` (in-memory key store).
- Per-key in-memory rate limiting:
  - `free`: 100 req/min
  - `pro`: 1000 req/min
- JSON structured logs with:
  - `requestId`
  - `endpoint`
  - `decision` (`allow`/`deny`)
  - `reason_code`
- SDK thin wrapper supporting:
  - **remote mode** (HTTP API)
  - **local mode** (direct protocol core calls)

Not included yet:
- real billing and invoicing (only hooks/foundation)
- dashboards
- multi-region infra
- complex async/queue execution
- real adapter execution runtime
- distributed persistence

## Separation: protocol vs infrastructure

- `protocol/*` and core modules keep canonical business logic.
- `runtime/api/*` only parses requests, validates auth/rate limits, routes to core, and wraps responses.
- No business rule duplication in API handlers.

## Unified response format

All endpoints return:

```json
{
  "success": true,
  "data": {}
}
```

or on failure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

## Fail-closed behavior

- missing/invalid API key => deny
- rate limit exceeded => deny
- JSON parsing errors => deny
- protocol errors => deny

The runtime never defaults to allow on error paths.
