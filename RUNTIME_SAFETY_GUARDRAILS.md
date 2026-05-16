# Runtime Safety Guardrails

## Guardrails added
- Startup assertion layer in `runtime/startupSafety.ts`.
- Constructor-time validation in `createRuntimeServer`.
- Startup posture logging with deterministic reason code format:
  - `SAFETY_POSTURE_<ENV>_<MODE>`
- Warning log emissions for non-fatal unsafe posture in non-strict environments.

## Unsafe fallback visibility
Soft enforcement is now explicitly logged as a warning in non-strict environments.

## Developer usability
Local development remains compatible with seeded API keys and default secret, but warnings make risk visible.
