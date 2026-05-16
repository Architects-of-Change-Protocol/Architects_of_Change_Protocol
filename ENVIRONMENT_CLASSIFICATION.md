# Environment Classification

Runtime classifies environment from:
1. `AOC_RUNTIME_ENV` (preferred)
2. `NODE_ENV` (fallback)

## Mapping
- `production`, `prod` -> `production`
- `staging`, `stage` -> `staging`
- `development`, `dev`, `local` -> `development`
- `test`, `ci` -> `test`
- anything else -> `unknown`

## Posture
- `production`/`staging`: strict safety gates, fail-fast.
- `development`/`test`: warn on soft-mode and defaults; do not block startup.
- `unknown`: treated like development for usability, but warning emitted.
