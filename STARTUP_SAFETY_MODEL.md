# Startup Safety Model

## Objective
Runtime startup now enforces an explicit safety posture before the HTTP server accepts requests.

## Assertions
- Environment is classified (`production`, `staging`, `development`, `test`, `unknown`).
- `production`/`staging` are **strict-mode environments**.
- Strict-mode requires:
  - `ENFORCEMENT_MODE=strict`
  - non-default `AOC_CAPABILITY_SECRET`
  - capability secret length >= 24
  - no seeded/default dev API keys

## Behavior
- Strict-mode violations throw at startup (fail-fast).
- Development/test/unknown modes remain usable and emit warnings for risky posture (e.g., soft enforcement).

## Operational Result
Unsafe states become explicit and observable instead of silently accepted.
