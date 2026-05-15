# Public API Contracts

Publicly consumable runtime contract symbols are exported through:
- `@aoc-runtime/shared-types` -> `packages/shared-types/src/index.ts`

Canonical public contracts:
- `CapabilityDecisionReason`
- `ConsentDecisionReason`
- `AuthorizationFailedStage`
- `ContractEvaluationEnvelope<TReason>`
- `AuthorizationDecisionEnvelope`
- `RUNTIME_CONTRACTS_VERSION`

These are safe for SDK consumption and future external package extraction.
