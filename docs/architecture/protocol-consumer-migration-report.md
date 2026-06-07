# Protocol Consumer Migration Report

## Scope

PR-06 Phase 1 rewrites consumer imports only. Protocol implementations, file locations, runtime behavior, ownership, and legacy compatibility exports remain unchanged.

The repository contains `docs/architecture/protocol-symbol-parity-report.md`, which confirms canonical export readiness. The two other named PR-04 inputs, `protocol-consumer-inventory.md` and `protocol-deep-import-report.md`, were not present in this checkout, so the migration baseline was reconstructed from TypeScript import declarations that resolve to the audited legacy surfaces or directly into `packages/protocol/src`.

## Migration metrics

| Metric | Result |
|---|---:|
| Consumers migrated | 7 |
| Imports rewritten | 16 |
| Violations removed | 16 |
| Violations remaining | 0 |
| Compilation failures | 0 |
| Boundary violations | 0 |

`Imports rewritten` counts each previous import declaration. The six legacy re-exports in `src/sdk/types.ts` were consolidated into one canonical type re-export after migration.

## Consumer migrations

| Consumer | Previous import | New import | Migration status | Compilation status | Risk level |
|---|---|---|---|---|---|
| `src/agents/types.ts` | `../capabilities/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — type-only structural parity |
| `src/policies/types.ts` | `../capabilities/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — type-only structural parity |
| `src/delegations/types.ts` | `../capabilities/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — type-only structural parity |
| `src/adapters/interfaces.ts` | `../agents/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — type-only structural parity |
| `src/adapters/interfaces.ts` | `../audit/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — type-only structural parity |
| `src/adapters/interfaces.ts` | `../capabilities/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — type-only structural parity |
| `src/adapters/interfaces.ts` | `../delegations/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — type-only structural parity |
| `src/adapters/interfaces.ts` | `../decisions/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — type-only structural parity |
| `src/sdk/types.ts` | `../capabilities/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — compatibility export retained |
| `src/sdk/types.ts` | `../agents/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — compatibility export retained |
| `src/sdk/types.ts` | `../policies/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — compatibility export retained |
| `src/sdk/types.ts` | `../decisions/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — compatibility export retained |
| `src/sdk/types.ts` | `../delegations/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — compatibility export retained |
| `src/sdk/types.ts` | `../audit/types` | `@aoc/protocol/contracts` | Migrated | Pass | Low — compatibility export retained |
| `__tests__/contracts/contract-fixtures.ts` | `../../src/contracts/capability-claims` | `@aoc/protocol/claims` | Migrated | Pass | Low — canonical symbol parity verified |
| `tests/contracts/symbol-parity.test.ts` | `../../packages/protocol/src/contracts` | `@aoc/protocol/contracts` | Migrated | Pass | Low — test-only type import |

## Enforcement

`tests/contracts/consumer-import-enforcement.test.ts` audits static imports, re-exports, dynamic imports, and `require` calls outside the Protocol package. The root `src/index.ts` compatibility barrel is excluded because retaining legacy exports is an explicit non-goal of this phase. It inventories:

- non-approved `@aoc/protocol/*` subpaths;
- textual or resolved imports into `packages/protocol/src`;
- relative imports of the audited legacy Protocol implementation files.

Phase 1 is intentionally report-only: findings are emitted as warnings and do not fail the build. The current inventory is zero. A future Phase 2 change can replace the report-mode assertion with a zero-violation assertion.

## Validation

- `npm run check:aoc-boundaries`: pass
- `npm run check:symbol-parity`: pass; report-only parity remains 100%
- `npm run typecheck`: pass
- `npm run build`: pass
- `npm test`: pass

No Protocol implementation was moved or redesigned, and no legacy export was removed.
