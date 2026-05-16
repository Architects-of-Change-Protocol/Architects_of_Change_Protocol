# Security Startup Assertions

## Hard assertions (fail startup in production/staging)
1. `ENFORCEMENT_MODE` must equal `strict`.
2. `AOC_CAPABILITY_SECRET` must not be the built-in default.
3. `AOC_CAPABILITY_SECRET` length must be at least 24 chars.
4. Default development API keys must not be present.

## Soft assertions (warn only outside strict mode)
1. Runtime environment cannot be classified (`unknown`).
2. Enforcement mode is `soft`.

## Automated checks
- `runtime/__tests__/startupSafety.test.ts` validates:
  - strict-mode fail-fast
  - default-secret detection
  - default API key detection in production
  - safe production startup with explicit secret/key/mode
