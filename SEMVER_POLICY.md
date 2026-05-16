# SemVer Policy

## Stable surfaces
SemVer guarantees apply to:
- SDK public surface (`packages/aoc-sdk/src/index.ts`)
- Runtime public hosted envelope/handshake
- Canonical contract packages

## Change classification
- **MAJOR**: breaking API, breaking transport shape, breaking contract schema, lowering compatibility window.
- **MINOR**: additive fields/endpoints/contracts preserving backwards compatibility.
- **PATCH**: bug fixes, docs, internal implementation changes without behavior or signature break.

## Exemptions
- `runtime/experimental.ts` and explicitly experimental exports are exempt from stability guarantees.
- Internal runtime modules are not semver-stable unless promoted to public exports.
