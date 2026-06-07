# Enterprise Runtime Boundary Report

## Audit scope

The audit covers `enterprise/src`, the Protocol runtime-registry contracts consumed by Enterprise, package exports, TypeScript project references, architecture tests, and retained runtime compatibility paths.

## Ownership classification

| File or surface | Classification | Ownership | Status |
|---|---|---|---|
| `enterprise/src/index.ts` | Enterprise package aggregate | Enterprise | Valid |
| `enterprise/src/assurance/index.ts` | Assurance aggregate | Enterprise | Valid |
| `enterprise/src/assurance/audit/*` | Enterprise implementation | Enterprise | Valid |
| `enterprise/src/assurance/verification/*` | Enterprise implementation | Enterprise | Valid |
| `enterprise/src/assurance/trust/*` | Enterprise implementation | Enterprise | Valid |
| `enterprise/src/assurance/observability/*` | Enterprise implementation | Enterprise | Valid |
| `enterprise/src/assurance/runtime-profile.ts` | Enterprise profile | Enterprise | Valid |
| `enterprise/src/assurance/runtime-adapter-resolver.ts` | Enterprise resolver | Enterprise | Valid |
| `enterprise/src/assurance/runtime-adapter-bootstrap.ts` | Enterprise composition root | Enterprise | Valid |
| `enterprise/src/assurance/runtime-adapters/index.ts` | Intentional public composition surface | Enterprise | Valid |
| `enterprise/src/assurance/{attestation,evidence,explainability,lineage,proofs}/*` | Reserved Assurance namespace | Enterprise | Valid; no runtime implementation exported today |
| `packages/protocol/src/adapters/*` | Adapter contracts and tokens' value types | Protocol | Valid dependency |
| `packages/protocol/src/{claims,contracts,errors}/*` | Semantic contracts | Protocol | Valid dependency |
| `packages/protocol/src/runtime-registry/*` | Registry and bootstrap contracts/primitives | Protocol | Valid dependency |
| `__tests__/architecture/enterprise-runtime-extraction.test.ts` | Boundary test | Test fixture | Valid |
| `__tests__/architecture/protocol-enterprise-boundary.test.ts` | Reverse-dependency test | Test fixture | Valid |

No boundary violations were found in Enterprise source imports. All Protocol imports use public `@aoc/protocol/*` subpaths.

## Dependency audit

### Protocol contract dependencies

Enterprise imports these Protocol public surfaces:

- `@aoc/protocol/adapters` for Assurance adapter interfaces;
- `@aoc/protocol/claims` for canonical verification claim types;
- `@aoc/protocol/contracts` for canonical audit/event envelopes; and
- `@aoc/protocol/runtime-registry` for tokens, registry, profile, bootstrap, and composition contracts.

### Other implementation dependencies

The signed audit implementation consumes `@aoc-runtime/shared-types` and `@aoc-runtime/crypto`. These are implementation dependencies, not Protocol dependencies. They do not create a Protocol-to-Enterprise reverse edge.

### Prohibited dependency results

| Prohibited form | Audit result |
|---|---|
| `packages/protocol/src/*` | None |
| `../../packages/protocol/src/*` | None |
| `@aoc/protocol/src/*` | None |
| `@/aoc/protocol/*` | None |
| `@/lib/*`, `src/app/*`, or `src/lib/*` | None |
| relative `../runtime` or `../../runtime` | None |
| `packages/*-runtime/*` source paths | None |
| test/fixture imports from Enterprise production source | None |

## Public export audit

All eight required Enterprise surfaces are explicit in `enterprise/package.json`. Internal filenames such as `runtime-adapter-bootstrap` and `runtime-adapter-resolver` are not package export keys; they are intentionally grouped behind `assurance/runtime-adapters`.

## Legacy Runtime Compatibility Surfaces

| Surface | Classification | Status | Rationale |
|---|---|---|---|
| `packages/audit-runtime` | Retained compatibility wrapper | Migration candidate | Re-exports Enterprise audit ownership for existing consumers. |
| `packages/trust-registry-runtime` | Retained compatibility wrapper | Migration candidate | Re-exports Enterprise trust ownership for existing consumers. |
| `runtime/audit` | Legacy runtime bridge | Retirement candidate | Kept for behavior/parity coverage; consumers should move to Enterprise. |
| `runtime/trust` | Legacy runtime bridge | Retirement candidate | Kept for behavior/parity coverage; consumers should move to Enterprise. |
| `runtime/observability.ts` | Legacy runtime bridge | Retirement candidate | Kept for parity and compatibility; Enterprise owns the target implementation surface. |
| Other `runtime/*` domains | Legacy runtime implementation | Out of scope | Governance, execution, transport, and application runtime extraction are explicit non-goals. |
| Other `packages/*-runtime` packages | Runtime packages | Out of scope | Their extraction and dependency migration require domain-specific PRs. |

No compatibility wrapper is deleted by PR-10.
