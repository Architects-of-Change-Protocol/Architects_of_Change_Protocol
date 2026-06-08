# Constitutional Boundary Violation Catalog

## LAW-001 — Protocol Purity Violation

- **Severity:** Critical
- **Detected by:** `check-constitutional-boundaries`
- **Detection:** Protocol imports runtime, Enterprise, or infrastructure modules, or constructs a concrete implementation.
- **Remediation:** Move implementation behavior to Enterprise or an already authorized runtime owner; retain only contracts and composition abstractions in Protocol.
- **Owner:** Protocol maintainers

## LAW-002 — Enterprise Ownership Violation

- **Severity:** Critical
- **Detected by:** `check-ownership-boundaries`, supported by `check-constitutional-boundaries`
- **Detection:** A runtime, adapter, provider, registry, profile, defaults object, or composition-root owner is declared outside an authorized domain.
- **Remediation:** Move the owner to Enterprise, use an existing owner through injection, or pursue a documented constitutional amendment.
- **Owner:** Enterprise architecture maintainers

## LAW-003 — Compatibility Ownership Violation

- **Severity:** Critical
- **Detected by:** `check-constitutional-boundaries`, `check-ownership-boundaries`
- **Detection:** A compatibility surface defines behavior, state, registry/bootstrap ownership, defaults, or a non-delegating implementation class.
- **Remediation:** Replace behavior with a re-export, signature translation, or explicitly deprecated delegating facade.
- **Owner:** Compatibility and sunset maintainers

## LAW-004 — Public Export Governance Violation

- **Severity:** High
- **Detected by:** `check-public-export-governance`, supported by `check-constitutional-boundaries`
- **Detection:** Cross-package deep import, `src`/`internal`/`private` import, unknown AOC package, or undeclared package subpath.
- **Remediation:** Import a declared public export or deliberately add a reviewed export-map entry owned by the target package.
- **Owner:** Package surface maintainers

## LAW-005 — Dependency Direction Violation

- **Severity:** Critical
- **Detected by:** `check-constitutional-boundaries`
- **Detection:** Protocol depends on Enterprise, runtime, or infrastructure.
- **Remediation:** Invert the dependency through a Protocol-owned contract and inject the Enterprise implementation at composition.
- **Owner:** Protocol and Enterprise architecture maintainers

## LAW-006 — Composition Ownership Violation

- **Severity:** High
- **Detected by:** `check-composition-boundaries`
- **Detection:** A non-composition module constructs a class ending in `Runtime`, `Adapter`, or `Provider`.
- **Remediation:** Construct the implementation in an authorized composition root and inject its contract into the consumer.
- **Owner:** Runtime composition maintainers

## LAW-007 — Runtime Registry Usage Violation

- **Severity:** High
- **Detected by:** `check-composition-boundaries`
- **Detection:** A non-composition module calls `registry.resolve()`.
- **Remediation:** Resolve once in a composition root or typed resolver, then inject the resolved dependency.
- **Owner:** Runtime composition maintainers

## LAW-008 — Release Governance Violation

- **Severity:** Blocking
- **Detected by:** `validate:release` and CI workflow gates
- **Detection:** Any constitutional scanner is absent, bypassed, or exits non-zero before publication validation.
- **Remediation:** Restore the aggregate boundary gate and remediate all reported law violations before release.
- **Owner:** Release engineering
