# Export Boundary Report

## Scope
Runtime export/import integrity pass focused on structural publishability hardening without changing business logic.

## Findings and Reconciliation
- Fixed runtime export drift by removing dead re-exports from `runtime/index.ts` that referenced non-existent modules (`./controlPlane`, `./runtime-negotiation`, `./governance-treaties`).
- Reconciled `runtime/api/routes.ts` topology mismatch by introducing the missing internal `runtime/controlPlane.ts` module used by route handlers.
- Added explicit compatibility comments in `runtime/index.ts` where exports are intentionally withheld pending API stabilization.
- Added `scripts/check-runtime-boundaries.mjs` and npm script `check:runtime-boundaries` to fail CI on:
  - dead runtime re-exports,
  - missing runtime relative imports in key boundary files.

## Risk Status
### Resolved
- Dead runtime barrel references causing package surface drift.
- Missing runtime module import for control-plane flows.

### Remaining
- Broader monorepo type/build issues outside boundary hardening scope (e.g., Node crypto typing and cross-package rootDir constraints).
- Cross-package public/internal annotation is still convention-based in some packages and should be encoded in per-package `exports` maps.
