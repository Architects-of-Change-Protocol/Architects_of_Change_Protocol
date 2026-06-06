# PR-04 Audit Extraction

## Extracted components

| Component | Enterprise owner | Previous path | Result |
|---|---|---|---|
| Signed audit chain runtime | `enterprise/src/assurance/audit/signed-audit-runtime.ts` | `packages/audit-runtime/src/index.ts` | Implementation copied without changing hashing, signing, chain-position, provenance, or verification behavior |
| In-memory legacy audit persistence | `enterprise/src/assurance/audit/in-memory-audit.ts` | `runtime/audit/service.ts` | Retention, cloning, filtering, ordering, and date-window behavior preserved |
| Hosted audit aggregation | `enterprise/src/assurance/audit/in-memory-audit.ts` | `runtime/audit/service.ts` | Generalized to injected `AuditEventSource` implementations while the old constructor remains intact through a facade |
| Canonical Protocol audit sink | `enterprise/src/assurance/audit/in-memory-audit.ts` | New Enterprise implementation | Implements `AuditEventSink` without changing `AuditEventEnvelope` |

## Compatibility

- `packages/audit-runtime/src/index.ts` re-exports the Enterprise signed-audit implementation.
- `runtime/audit/service.ts` preserves `InMemoryAuditService`, `RuntimeAuditService`, `RuntimeAuditEvent`, and `ListAuditEventsInput` at the old path.
- `runtime/audit/index.ts` and the root runtime barrels remain unchanged and continue exporting the historical API.

## Dependencies and seams

- Protocol-owned `AuditEventEnvelope` is consumed from `@aoc/protocol/contracts`.
- `AuditEventSink` is consumed from `@aoc/protocol/adapters`.
- Existing signed audit compatibility types remain sourced from `@aoc-runtime/shared-types`.
- Existing cryptographic behavior remains sourced from `@aoc-runtime/crypto`; cryptographic primitives were not relocated.

## Risks

1. The legacy `protocol/audit` barrel exposes overlapping current and legacy audit vocabulary. The old facade therefore retains its historical compile-time signatures and performs an internal compatibility cast into the relocated implementation.
2. Hosted audit sources expose different event unions. Enterprise aggregation uses a structural source interface, while the old three-argument constructor remains a typed compatibility facade.
3. Persistent/external audit storage does not exist in the inventoried source; only in-memory persistence and signed-chain processing were available to extract.
