# Internal vs Public Exports

## Public (SDK-safe)
- Explicit named exports from `runtime/index.ts` for server/client/auth/limits/logging/trust/usage/monetization and selected runtime domains.

## Internal-only (non-exported by runtime barrel)
- `runtime/controlPlane.ts` is consumed by `runtime/api/routes.ts` and intentionally excluded from `runtime/index.ts` to avoid premature API lock-in.

## Temporary Compatibility Shims
- `runtime/index.ts` keeps compatibility comments documenting deferred exports for modules not yet stabilized (`runtime-negotiation`, `governance-treaties`).

## Guardrails
- `npm run check:runtime-boundaries` now enforces that key runtime barrel/references do not drift into missing modules.
