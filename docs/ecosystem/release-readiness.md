# Release Readiness

## Package Manager Standard
- Package manager is **npm** (pinned via root `packageManager`).
- Local clean install: `npm ci`.
- CI install command: `npm ci` on Node 20.

## Workspace Dependency Policy
- Internal package dependencies must be npm-compatible and deterministic.
- Use `file:` specifiers for local workspace links when npm workspace protocol compatibility is unreliable in target environments.
- Do not use `workspace:*` unless toolchain and CI are explicitly standardized for that protocol.

## Validation Commands
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `npm test`
- `npm run lint:semantic-ownership`
- `npm run validate:publishability`
- `npm pack ./packages/protocol`
- `npm run validate:release`

## TS Project Reference Rules
- Every referenced project must be `composite: true`.
- Referenced projects must be emit-capable for `tsc -b`.
- Cross-package imports must use package entrypoints/path aliases, not deep relative source traversal.

## Troubleshooting
- `EUNSUPPORTEDPROTOCOL workspace:*`: replace internal dependency declarations with npm-compatible local links (for example `file:../protocol`) and regenerate `package-lock.json`.
- `TS6059/TS6307`: indicates source leakage outside package `rootDir`; replace deep relative imports with referenced package alias.
- `TS6310`: avoid `tsc -b --noEmit`; run project build typecheck via `npm run typecheck`.
- Node crypto typing errors: ensure `types: ["node"]` and use `node:crypto` imports.

## Non-release Packages
- None currently excluded from the root release validation chain.
