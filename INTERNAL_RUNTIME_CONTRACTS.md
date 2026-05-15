# Internal Runtime Contracts

Internal-only runtime shapes remain local to runtime packages (e.g., policy engine traces, provider metadata, explainability payload internals).

Boundary rule:
- Anything intended for SDK/public consumption must be promoted into `packages/shared-types/src/contracts.ts`.
- Runtime package-local helper types stay local unless they become cross-package dependencies.
