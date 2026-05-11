# AOC Runtime

Standalone TypeScript runtime substrate for sovereign organizational cognition.

## Monorepo structure

- `packages/shared-types`: substrate-wide core contracts.
- `packages/provider-interfaces`: infrastructure provider boundaries.
- `packages/capability-runtime`: scoped capability evaluation.
- `packages/governance-runtime`: policy evaluation and actor resolution.
- `packages/consent-runtime`: consent lifecycle primitives.
- `packages/audit-runtime`: explainable audit contracts.
- `packages/portable-cognition`: export/import package seams.
- `packages/vault-runtime`: namespace-to-vault topology runtime.
- `examples/pmfreak-adapter`: PMFreak application-layer integration example.

## Design boundaries

AOC Runtime is infrastructure-oriented, app-agnostic, and provider-driven. It avoids UI coupling and framework lock-in.

## Next

Use the PMFreak adapter as a migration seam while extracting existing PMFreak governance, consent, and audit flows into provider implementations.
