# Release Readiness

## Validation Commands
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `npm test`
- `npm run lint:semantic-ownership`
- `npm run validate:publishability`
- `npm run validate:release`
- `npm pack ./packages/protocol`

## Package Graph Expectations
- `@aoc/protocol` is canonical contract owner.
- Compatibility facades must re-export from `@aoc/protocol/contracts`.
- Runtime packages consume facades/protocol and do not depend on apps.

## TS Project Reference Rules
- Every referenced project must be `composite: true`.
- Referenced projects must be emit-capable for `tsc -b`.
- Cross-package imports must use package entrypoints/path aliases, not deep relative source traversal.

## Troubleshooting
- `TS6059/TS6307`: indicates source leakage outside package `rootDir`; replace deep relative imports with referenced package alias.
- `TS6310`: avoid `tsc -b --noEmit`; run project build typecheck via `npm run typecheck`.
- Node crypto typing errors: ensure `types: ["node"]` and use `node:crypto` imports.

## Non-release Packages
- None currently excluded from the root release validation chain.
