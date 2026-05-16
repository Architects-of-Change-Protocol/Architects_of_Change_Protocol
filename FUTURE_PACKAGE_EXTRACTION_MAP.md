# Future Package Extraction Map

This map defines likely extraction boundaries without performing a split now.

## Candidate Packages
- `@aoc/runtime-governance` ← `runtime/governance/*`
- `@aoc/runtime-distributed` ← `runtime/distributed/*`
- `@aoc/runtime-capabilities` ← `runtime/capabilities/*`
- `@aoc/runtime-attestations` ← `runtime/attestations/*`
- `@aoc/runtime-execution-fabric` ← `runtime/execution-fabric/*`
- `@aoc/runtime-sovereign` (experimental) ← `runtime/sovereign-runtime/*`
- `@aoc/runtime-marketplace` (experimental) ← `runtime/marketplace/*`

## Promotion Criteria
- API contract docs complete.
- Semver ownership defined.
- Export leakage checks green.
- External-consumer fixture import tests green.
