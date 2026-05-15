# @aoc/protocol Versioning and Stability

## Stable contracts
The canonical stable surface is `@aoc/protocol/contracts` for cross-ecosystem type contracts.

## Semver intent
- Patch: non-breaking declaration clarifications.
- Minor: additive contract fields/types that preserve backwards compatibility.
- Major: breaking structural changes to exported protocol contracts.

## Compatibility guarantees
- No `src/*` public exports.
- Only explicit subpath exports (`contracts`, `errors`, `claims`).
- Declarations must resolve for external TypeScript consumers using normal package installs.

## Deprecation
Deprecated symbols are retained for at least one minor cycle before removal in a major release.
