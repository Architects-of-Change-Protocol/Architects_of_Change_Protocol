# PR-12 Constitutional Boundary Report

## Executive result

AOC now has an executable first Constitutional Enforcement Layer. Protocol purity, Enterprise/compatibility ownership, package exports, dependency direction, composition ownership, and registry resolution are represented as law IDs, scanners, tests, CI gates, and release prerequisites.

## Laws enforced

- LAW-001 Protocol Purity
- LAW-002 Enterprise Ownership
- LAW-003 Compatibility Ownership
- LAW-004 Public Export Governance
- LAW-005 Dependency Direction
- LAW-006 Composition Ownership
- LAW-007 Runtime Registry Usage
- LAW-008 Release Governance

## Scanners implemented

| Scanner | Result |
|---|---|
| `scripts/check-constitutional-boundaries.mjs` | Enforces Protocol, Enterprise-source, compatibility, and dependency-direction invariants |
| `scripts/check-ownership-boundaries.mjs` | Detects new implementation, registry, defaults, profile, and composition owners outside closed authorities |
| `scripts/check-public-export-governance.mjs` | Rejects deep/private/source imports and undeclared workspace package subpaths |
| `scripts/check-composition-boundaries.mjs` | Rejects runtime construction and registry resolution outside composition seams |

All scanners share fail-closed traversal, package, diagnostic, and law metadata in `scripts/constitutional-boundary-lib.mjs`.

## Tests implemented

The constitutional test suite uses isolated temporary repositories and invokes the production scanners through their CLI. It includes positive repository checks and negative fixtures for reverse dependencies, compatibility behavior, ownership drift, deep imports, undeclared exports, runtime construction, and registry resolution.

## Release gates implemented

- `check:aoc-boundaries` includes all four constitutional scanners and the pre-existing architecture checks.
- CI runs the aggregate boundary command independently of the test suite.
- `validate:release` runs the aggregate boundary command before typecheck, build, tests, publishability validation, and package creation.

## Violations detected and remediated during introduction

The initial export scan found 27 imports of workspace packages whose manifests relied on legacy `main`/`types` fields but had no explicit export map. Eleven affected workspace manifests now declare their root public export, eliminating implicit public surfaces without changing runtime implementation behavior.

The initial ownership inventory also exposed pre-extraction runtime roots. Because PR-12 explicitly excludes runtime extraction, those roots are now named as closed transitional authorities in policy and scanner configuration. This makes existing ownership visible and prevents new ownership roots from appearing silently. Extracted audit and trust packages remain compatibility-only and are not transitional implementation authorities.

Test-only construction was excluded from production scans and is covered by scanner fixtures instead. No business logic, Protocol contract, Enterprise implementation, runtime behavior, or compatibility wrapper was refactored.

## Current violations

No constitutional violations remain in the governed production source inventory at report generation time.
