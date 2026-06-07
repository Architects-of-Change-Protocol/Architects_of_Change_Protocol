# Legacy Runtime Inventory

## Purpose and scope

This inventory classifies the runtime surfaces that remain after Enterprise Assurance extraction. It covers Assurance compatibility paths first, then records other `runtime/*` and `packages/*-runtime` domains without changing their ownership in PR-11.

The canonical ownership rule is:

- `@aoc/protocol` owns semantic contracts, claims, errors, adapter contracts/tokens, registry, and bootstrap primitives.
- `@aoc/enterprise` owns Assurance implementations, defaults, profiles, typed resolvers, and composition roots.
- legacy Assurance runtime paths exist only to preserve compatibility while consumers migrate.

## Surface classification

| Surface | Classification | Current owner | Target owner | Status |
|---|---|---|---|---|
| `enterprise/src/assurance/audit` | Canonical Enterprise implementation | Enterprise Assurance | Enterprise Assurance | Canonical |
| `enterprise/src/assurance/trust` | Canonical Enterprise implementation | Enterprise Assurance | Enterprise Assurance | Canonical |
| `enterprise/src/assurance/observability` | Canonical Enterprise implementation | Enterprise Assurance | Enterprise Assurance | Canonical |
| `packages/audit-runtime` | Compatibility wrapper | Legacy runtime package | Enterprise Assurance | Retain temporarily |
| `packages/trust-registry-runtime` | Compatibility wrapper | Legacy runtime package | Enterprise Assurance | Retain temporarily |
| `runtime/audit` | Legacy bridge | Root hosted runtime | Enterprise Assurance | Retirement candidate |
| `runtime/trust` | Legacy bridge | Root hosted runtime | Enterprise Assurance | Retirement candidate |
| `runtime/observability.ts` | Legacy bridge | Root hosted runtime | Enterprise Assurance | Retirement candidate |
| `packages/authorization-runtime` | Runtime package and legacy-package consumer | Authorization runtime | Domain-specific future owner | Out of scope |
| `packages/capability-runtime` | Runtime package | Capability runtime | Domain-specific future owner | Out of scope |
| `packages/consent-runtime` | Runtime package | Consent runtime | Domain-specific future owner | Out of scope |
| `packages/governance-runtime` | Runtime package | Governance runtime | Governance runtime | Out of scope |
| `packages/vault-runtime` | Runtime package | Vault runtime | Domain-specific future owner | Out of scope |
| `runtime/governance`, `runtime/capabilities`, `runtime/policy` | Runtime implementation | Root hosted runtime | Future Governance extraction | Out of scope |
| `runtime/execution-fabric`, `runtime/distributed`, `runtime/sovereign-runtime` | Runtime implementation | Root hosted runtime | Future domain extraction | Out of scope |
| `runtime/api`, `runtime/sdk`, `runtime/access`, `runtime/payout`, `runtime/usage`, `runtime/monetization` | Hosted application runtime | Root hosted runtime | Hosted runtime | Out of scope |
| `__tests__/architecture/assurance-extraction-parity.test.ts` | Test fixture | Architecture tests | Architecture tests | Retain during migration |
| `__tests__/architecture/legacy-runtime-compatibility.test.ts` | Compatibility test fixture | Architecture tests | Architecture tests | Active guardrail |

No Assurance boundary violation remains in the governed wrappers: package wrappers re-export Enterprise public subpaths, hosted trust and observability bridges re-export Enterprise code, and the hosted audit facade delegates state and behavior to Enterprise.

## Consumer Usage

The source scan excludes generated `dist` output and lockfile workspace metadata. Generated declarations mirror the source relationships and are not independent consumers.

| Consumer | Import | Classification | Migration recommendation |
|---|---|---|---|
| `examples/pmfreak-adapter/src/index.ts` | `@aoc-runtime/audit-runtime` | Production example / migration candidate | Move to `@aoc/enterprise/assurance/audit` |
| `packages/authorization-runtime/src/index.ts` | `@aoc-runtime/audit-runtime` | Production consumer / migration candidate | Move to `@aoc/enterprise/assurance/audit` in a domain-specific migration |
| `packages/authorization-runtime/src/index.ts` | `@aoc-runtime/trust-registry-runtime` | Production consumer / migration candidate | Move to `@aoc/enterprise/assurance/trust` in a domain-specific migration |
| `packages/audit-runtime/src/index.ts` | `@aoc/enterprise/assurance/audit` | Compatibility wrapper | Keep temporarily; do not add behavior |
| `packages/trust-registry-runtime/src/index.ts` | `@aoc/enterprise/assurance/trust` | Compatibility wrapper | Keep temporarily; do not add behavior |
| `runtime/audit/service.ts` | Enterprise Assurance audit | Legacy wrapper | Keep only the historical constructor/signature facade |
| `runtime/trust/service.ts`, `runtime/trust/types.ts` | Enterprise Assurance trust | Legacy wrapper | Replace hosted-runtime imports with Enterprise as consumers permit |
| `runtime/observability.ts` | Enterprise Assurance observability | Legacy wrapper | Replace hosted-runtime imports with Enterprise as consumers permit |
| `runtime/api/routes.ts`, `runtime/access/service.ts`, `runtime/payout/*` | `runtime/trust/*` and `runtime/audit/*` | Production hosted-runtime consumers | Migrate to Enterprise during hosted-runtime composition cleanup |
| `runtime/api/server.ts` | `runtime/observability` | Production hosted-runtime consumer | Migrate to Enterprise observability during hosted-runtime cleanup |
| `runtime/sdk/client.ts` | legacy audit/trust types | Production SDK bridge | Preserve until hosted SDK types have an Enterprise-owned import path |
| `runtime/__tests__/*` | legacy audit/trust paths | Test consumers | Retain as compatibility coverage, then migrate with their production subjects |
| `__tests__/architecture/assurance-extraction-parity.test.ts` | package and root legacy surfaces | Test fixture | Keep until superseded by compatibility-window exit tests |
| `__tests__/architecture/legacy-runtime-compatibility.test.ts` | package and root legacy surfaces | Test fixture | Retain until wrapper removal |
| extraction reports and architecture documents | legacy path references | Documentation reference | Preserve historical references; use the sunset plan for current guidance |

## Import and export findings

- The package aliases `@aoc-runtime/audit-runtime` and `@aoc-runtime/trust-registry-runtime` remain in `tsconfig.base.json` for source compatibility.
- Both package entrypoints export only their canonical Enterprise Assurance owner.
- `runtime/audit` preserves old hosted signatures through delegation; it does not own event storage/filtering behavior.
- `runtime/trust` and `runtime/observability.ts` are direct re-export bridges.
- Other `packages/*-runtime` and `runtime/*` domains are recorded but intentionally unchanged because Governance and Execution extraction are non-goals for PR-11.
