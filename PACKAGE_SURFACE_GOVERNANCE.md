# Package Surface Governance

## Objective
Formalize export governance so only intended runtime surfaces are visible to SDK/public consumers.

## Entrypoint Classes
- **Stable public:** `./runtime` (`runtime/index.ts`)
- **Internal-only:** `./runtime/internal` (`runtime/internal.ts`)
- **Experimental:** `./runtime/experimental` (`runtime/experimental.ts`)
- **Compatibility-only:** legacy root `index.ts` remains, but runtime-internal modules are no longer re-exported through `runtime/index.ts`.

## Package Export Map Governance
`package.json` now declares explicit `exports` keys for:
- `.`
- `./runtime`
- `./runtime/internal`
- `./runtime/experimental`

No additional subpath exports should be added without governance review.

## Guardrails
- Automated check: `npm run check:runtime-exports`
- Rule: stable `runtime/index.ts` must not re-export internal/experimental modules.
- Rule: `package.json` must preserve required runtime export keys.

## Change Control
Any new runtime module must be classified as stable/internal/experimental before export.
