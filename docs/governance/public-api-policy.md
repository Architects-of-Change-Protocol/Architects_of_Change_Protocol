# Public API Policy and Export Surface Governance

## Purpose
This policy governs how core protocol and runtime capabilities are exposed to consumers, preserving stable integration surfaces and preventing internal coupling.

---

## Canonical Export Surface Philosophy
- Public APIs must represent intentional, stable platform contracts.
- Export surfaces prioritize deterministic semantics over convenience aggregation.
- Internal refactors must not force unnecessary consumer churn.
- API design must preserve clear separation between protocol primitives and orchestration workflows.

---

## Public vs Internal Modules

## Public (Supported) Surface
Public modules are:
- explicitly documented
- versioned under compatibility policy
- safe for cross-repository consumption

## Internal-Only Surface
Internal modules are:
- implementation details
- not covered by compatibility guarantees
- inaccessible through public barrels/package roots

Rule: Consumers in `AOC-Enterprise` and products/apps must use only documented public surfaces.

---

## Stable Package Boundary Rules
- Each package/module must have explicit boundary designation: `public` or `internal`.
- Public boundaries must avoid exposing transitive internal types where possible.
- Breaking shape changes at public boundaries require version and migration treatment.
- Internal symbols should use namespace/layout conventions to discourage accidental import.

---

## Barrel Governance
- Barrel files are allowed only for curated stable surfaces.
- “Export everything” barrels are forbidden.
- Barrels must not re-export internal or experimental modules.
- Barrel changes require API review when they alter consumer-visible surface.

---

## SDK Versioning Philosophy
- Semantic versioning governs public SDKs.
- Patch: fixes without public contract change.
- Minor: backward-compatible additions.
- Major: breaking public API changes or behavioral contract shifts.
- Deterministic semantic changes must be treated as contract-impacting, even if type signatures remain unchanged.

---

## Import Discipline
- Consumers must import from canonical package roots/public entrypoints only.
- Deep imports into internal paths are forbidden.
- Cross-layer imports that bypass designated APIs are forbidden.
- Enterprise and product repositories must not depend on undocumented core internals.

---

## Migration Governance for Public API Changes
- Every public breaking change requires:
  - architecture decision record (ADR) or equivalent rationale
  - migration notes and examples
  - deprecation period (unless emergency/security override)
  - compatibility test coverage for key consumer paths

---

## Examples and UI Isolation Rules
- Examples/reference apps may demonstrate API usage but never define API policy.
- UI helpers must remain outside core public API contracts unless explicitly promoted via governance process.
- No promotion of app-specific utilities into canonical public exports without multi-consumer justification.
