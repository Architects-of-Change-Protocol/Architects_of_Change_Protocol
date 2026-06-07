# Legacy Runtime Sunset Plan

## Ownership statement

Enterprise Assurance is the canonical owner of audit, trust, verification, observability, Assurance runtime adapters, and runtime profiles. Legacy paths are temporary compatibility surfaces, not alternate architecture.

The Enterprise Assurance maintainers are the retirement owner for the Assurance wrappers. Removal decisions require coordination with the release owner and every inventoried consumer.

## Stage 1 — Current

- Legacy wrappers are retained.
- Enterprise is the canonical owner.
- Wrappers delegate to Enterprise.
- Deprecation markers and migration guidance are present.
- Architecture tests and `check:legacy-runtime-compatibility` enforce wrapper-only ownership.

## Stage 2 — Migration Window

- Consumers migrate to `@aoc/enterprise/assurance/*`.
- Legacy wrappers remain available and carry deprecation guidance in source declarations and package documentation.
- Consumer counts are updated in `legacy-runtime-migration-report.md` as migrations land.
- No runtime telemetry warning is emitted; migration messaging remains compile-time/documentation based.

## Stage 3 — Freeze

- No new features or behavior are accepted in legacy wrappers.
- Only security fixes and compatibility fixes are permitted.
- Boundary tests prevent Protocol-source imports, PMFreak application imports, or renewed implementation ownership.
- Any compatibility facade must continue delegating its state and behavior to Enterprise.

## Stage 4 — Removal

Remove a wrapper only after all of the following are true:

- the production and test consumer inventory for that path is zero;
- release notes announce the removal and affected package/version;
- a migration guide exists for every removed public path;
- the compatibility window defined by the release owner has completed;
- package export, TypeScript path, project-reference, lockfile, documentation, and test cleanup is included in the removal change;
- the Enterprise replacement has remained stable through the migration window.

PR-11 does not set a calendar removal date. Removal is evidence-gated to avoid breaking current consumers.

## Migration guide

| Legacy surface | Replacement |
|---|---|
| `packages/audit-runtime` / `@aoc-runtime/audit-runtime` | `@aoc/enterprise/assurance/audit` |
| `packages/trust-registry-runtime` / `@aoc-runtime/trust-registry-runtime` | `@aoc/enterprise/assurance/trust` |
| `runtime/audit` | `@aoc/enterprise/assurance/audit` |
| `runtime/trust` | `@aoc/enterprise/assurance/trust` |
| `runtime/observability` | `@aoc/enterprise/assurance/observability` |
| runtime adapter bootstrap | `@aoc/enterprise/assurance/runtime-adapters` |
| runtime profile | `@aoc/enterprise/assurance/runtime-profile` |

### Package import example

Before:

```ts
import { AuditRuntime } from '@aoc-runtime/audit-runtime';
import { TrustRegistryRuntime } from '@aoc-runtime/trust-registry-runtime';
```

After:

```ts
import { AuditRuntime } from '@aoc/enterprise/assurance/audit';
import { TrustRegistryRuntime } from '@aoc/enterprise/assurance/trust';
```

### Hosted bridge caveat

The root `runtime/audit` facade preserves a historical three-source constructor and historical audit method signatures. Consumers that rely on that facade should migrate composition, not merely rewrite an import. Instantiate the Enterprise `RuntimeAuditService` with its event-source collection and use Enterprise-owned legacy audit event/query types during the transition.

## Exit review

At each release review, the retirement owner should:

1. run the repository consumer search documented in `legacy-runtime-migration-report.md`;
2. record remaining production, test, and documentation consumers;
3. verify all wrapper checks and parity tests pass;
4. decide whether the migration window remains open, can enter freeze, or meets removal gates.
