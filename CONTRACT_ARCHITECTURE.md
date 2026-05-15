# Contract Architecture

## Canonical Source of Truth
- Canonical runtime/public contract vocabulary lives in `packages/shared-types/src/contracts.ts`.
- `packages/shared-types/src/index.ts` re-exports contracts for SDK/runtime consumers.

## Scope
- Centralized reason-code unions and failed-stage vocabulary.
- Centralized generic evaluation envelope (`ContractEvaluationEnvelope`).
- Centralized stable contract version marker (`RUNTIME_CONTRACTS_VERSION`).

## Runtime Adoption
- `capability-runtime` imports canonical `CapabilityDecisionReason`.
- `consent-runtime` imports canonical `ConsentDecisionReason`.
- `authorization-runtime` imports canonical failed stage and envelope types.

## Drift Guardrails
- `scripts/check-contract-drift.mjs` blocks reintroduction of duplicated local unions.
