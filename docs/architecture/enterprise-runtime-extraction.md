# Enterprise Runtime Extraction

## Decision

`@aoc/protocol` is the semantic and bootstrap-contract package. `@aoc/enterprise` is the Assurance runtime implementation package.

Protocol may specify adapter contracts, tokens, registry behavior, runtime profiles, bootstrap behavior, and composition result shapes. Enterprise owns concrete Assurance implementations, default construction, runtime profiles, typed adapter resolution, and composition roots.

## Package direction

```text
@aoc/enterprise
  -> @aoc/protocol/adapters
  -> @aoc/protocol/claims
  -> @aoc/protocol/contracts
  -> @aoc/protocol/runtime-registry

@aoc/protocol
  -X-> @aoc/enterprise
  -X-> runtime implementations
  -X-> infrastructure
```

Enterprise source uses Protocol package subpaths only. It does not use Protocol source paths, repository application aliases, legacy runtime paths, or test fixtures.

## Intentional Enterprise public surfaces

| Import | Purpose |
|---|---|
| `@aoc/enterprise` | Aggregate Enterprise surface |
| `@aoc/enterprise/assurance` | Aggregate Assurance implementation surface |
| `@aoc/enterprise/assurance/audit` | Audit implementations |
| `@aoc/enterprise/assurance/verification` | Verification implementations |
| `@aoc/enterprise/assurance/trust` | Trust implementations |
| `@aoc/enterprise/assurance/observability` | Event sinks, logging, and observability implementations |
| `@aoc/enterprise/assurance/runtime-adapters` | Composition root, bootstrap helpers, and typed resolution |
| `@aoc/enterprise/assurance/runtime-profile` | Enterprise Assurance runtime profile |

The `runtime-adapters` subpath has a dedicated index so consumers do not need to know the internal bootstrap/resolver filenames. The profile has its own package export so hosts can inspect requirements without importing the aggregate Assurance surface.

## Enforcement

PR-10 adds three complementary controls:

1. `scripts/check-enterprise-package-boundary.mjs` scans Enterprise source module specifiers and required package exports.
2. `enterprise-runtime-extraction.test.ts` validates public surfaces, ownership location, composition through the Protocol registry, and Enterprise dependency direction.
3. `protocol-enterprise-boundary.test.ts` validates that Protocol does not reverse-depend on Enterprise, legacy runtimes, infrastructure, or concrete in-memory implementations.

The Enterprise scanner is included in `npm run check:aoc-boundaries` and is also available inside the Enterprise package as `npm --prefix enterprise run check:boundary`.

## Runtime behavior

No runtime behavior changes in this extraction sprint. The existing Enterprise composition root still:

- creates `InMemoryAssuranceEventSink` and `InMemoryCanonicalTrustRegistry` defaults;
- applies caller adapter overrides;
- delegates registry/bootstrap mechanics to Protocol's `RuntimeBootstrapEngine`; and
- resolves the same typed Assurance adapter context after successful bootstrap.

Compatibility wrappers remain in place and are classified in the boundary report rather than deleted.

## Extraction rule

A future standalone extraction should copy the Enterprise package and resolve its declared package imports. It must not copy Protocol source, repository application code, or legacy compatibility packages. Packaging the repository-level crypto project as a separately installable dependency remains release engineering work outside this Assurance ownership extraction.
