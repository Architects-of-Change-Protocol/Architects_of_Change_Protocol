# Do Not Import Internals

Do not import:
- `aoc-runtime/runtime/internal`
- `aoc-runtime/runtime/experimental`
- any `runtime/*` paths not exported by package export maps
- governance/distributed/marketplace/sovereign internal modules

Use `@aoc/sdk` only for external developer integrations.
