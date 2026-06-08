# AOC Architectural Laws

**Authority:** Repository constitutional policy

**Enforcement status:** Executable

**Effective layer:** source, package, CI, and release validation

These laws replace architecture-by-memory with repository-enforced invariants. A violation is a build failure, not a review suggestion. Exceptions must be represented as narrow, named, reviewable authorities in the enforcement code and this policy; undocumented exceptions are violations.

## LAW-001 — Protocol Purity

Protocol owns contracts, claims, errors, adapter contracts, tokens, registry abstractions, bootstrap contracts, composition contracts, and profile contracts.

Protocol must not own or import Enterprise implementations, runtime implementations, infrastructure, persistence, databases, SDK integrations, application logic, or concrete observability, audit, and trust implementations. Protocol construction of concrete Enterprise or default runtime services is forbidden.

**Violation:** `LAW-001 Violation`

## LAW-002 — Enterprise Ownership

Enterprise owns extracted runtime implementations, assurance implementations, profiles, composition roots, defaults, and typed resolvers. Enterprise must consume Protocol through declared Protocol exports and must not redefine Protocol semantics, claims, contracts, registry contracts, or bootstrap contracts.

Pre-extraction runtime packages named in the constitutional policy remain explicit transitional owners. Their authority is closed: a new ownership domain requires a constitutional change.

**Violation:** `LAW-002 Violation`

## LAW-003 — Compatibility Ownership

Compatibility layers may re-export, delegate, and translate signatures. They must not own behavior, state, registries, defaults, or implementations. A stateful class is permitted only when it is an explicitly deprecated delegating facade with a canonical Enterprise implementation.

**Violation:** `LAW-003 Violation`

## LAW-004 — Public Export Governance

Only package export-map surfaces are public. Cross-package imports containing `src`, `internal`, or `private` segments are forbidden. A workspace package subpath may be consumed only when its `package.json` declares that exact subpath (or a matching export pattern).

`@aoc-runtime/crypto` is a named virtual TypeScript module governed by `tsconfig.base.json`; it is not a publishable package surface and receives no subpath authority.

**Violation:** `LAW-004 Violation`

## LAW-005 — Dependency Direction

The allowed canonical direction is:

```text
Enterprise → Protocol
```

Protocol-to-Enterprise, Protocol-to-runtime, and Protocol-to-infrastructure dependencies are forbidden.

**Violation:** `LAW-005 Violation`

## LAW-006 — Composition Ownership

Composition roots may construct implementations, register adapters, apply defaults, and apply overrides. Domain services and business workflows must receive dependencies and must not construct `*Runtime`, `*Adapter`, or `*Provider` implementations.

Authorized composition modules are explicit in `scripts/constitutional-boundary-lib.mjs`; convention-based authorization is limited to filenames containing `composition-root`, `bootstrap`, `container`, or `wiring`.

**Violation:** `LAW-006 Violation`

## LAW-007 — Runtime Registry Usage

Registry resolution belongs to composition roots and typed resolver modules. Domain services must receive resolved dependencies through injection and must not call `registry.resolve()`.

**Violation:** `LAW-007 Violation`

## LAW-008 — Release Governance

No release may proceed unless the constitutional, ownership, public-export, and composition scanners all pass. `validate:release` invokes the aggregate `check:aoc-boundaries` gate before compilation, tests, publishability checks, or package creation.

**Violation:** `LAW-008 Violation`
