# Package Surface Map

## Stable Public Surface (current)
- Root package entry: `index.ts` (protocol/runtime aggregate).
- Runtime stable entry: `runtime/index.ts`.
- Package workspace stable entries: `packages/*/src/index.ts` where present.

## Internal Surface (not for external SDK contracts)
- `runtime/controlPlane.ts` (route orchestration internals).
- `runtime/api/*` request routing internals.
- in-memory adapters/services that are wiring details rather than protocol contracts.

## Unstable / Experimental Surface
- Runtime negotiation and governance treaties modules are intentionally not exported from `runtime/index.ts` until stabilized and physically present.

## Future Extraction Candidates
- `runtime/controlPlane.ts` -> `@aoc/control-plane-runtime` (if API matures).
- `runtime/marketplace/*` -> dedicated marketplace package.
- `runtime/distributed/*` and `runtime/sovereign-runtime/*` -> federation package split.
