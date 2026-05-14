# Extraction Policy and Migration Governance

## Purpose
This policy defines when and how functionality is extracted from `Architects_of_Change_Protocol` into `AOC-Enterprise`, with explicit risk handling, migration sequencing, and compatibility discipline.

---

## Extraction Criteria

Extraction to `AOC-Enterprise` is required when one or more conditions are true:
- behavior is tenant-aware or organization-aware
- logic coordinates multiple runtimes/environments
- lifecycle includes governance process orchestration
- behavior requires control-plane state and operational scheduling
- implementation depends on enterprise integrations not required for deterministic protocol execution

Functionality must remain in core when:
- it defines canonical protocol semantics
- it is deterministic and invariant-preserving
- it is required as a stable primitive across all adopters

---

## Candidate Risk Classification

## Low-Risk Extraction Candidates
Typically safe to extract:
- orchestration workflows that call core APIs without redefining semantics
- operational rollout coordinators
- tenant/runtime negotiation policies and sequencing logic
- treaty/governance lifecycle orchestrators
- monitoring/control loops that consume core events

## High-Risk Extraction Candidates
Require deeper design and staged rollout:
- modules co-mingling deterministic engines with orchestration glue
- components that currently expose mixed public APIs consumed by products
- flows where product code imports core internals through orchestration pathways
- stateful services whose data model encodes protocol invariants
- modules with transitive dependency cycles across core and orchestration boundaries

---

## Migration Sequencing Philosophy
1. **Contract first**: define stable core-facing contract and enterprise-facing orchestrator contract.
2. **Semantics lock**: document and freeze deterministic behavior expected from core.
3. **Strangler path**: route new orchestration flows to `AOC-Enterprise` while preserving old entry points temporarily.
4. **Parity validation**: verify enterprise path produces operational parity without semantic drift.
5. **Traffic cutover**: move consumers in controlled cohorts.
6. **Deprecation and removal**: remove legacy core orchestration code after deprecation window closes.

Rule: Do not extract by copy-and-fork; extract by contract and ownership transfer with explicit compatibility plan.

---

## Compatibility Shim Strategy
- Use thin compatibility shims at old call sites during migration.
- Shims may translate interfaces, not redefine semantics.
- Shims must have explicit expiry dates and owners.
- Shims are temporary and tracked in a deprecation registry.
- New consumers must target canonical destination APIs directly (no new dependencies on shim surfaces).

---

## Deprecation Guidance
- Every extracted surface must publish:
  - deprecation notice date
  - replacement API path
  - minimum overlap window
  - removal target release
- Deprecation windows should align with SDK/release cadence and enterprise upgrade constraints.
- Breaking removals require migration evidence for critical consumers.

---

## Anti-Spaghetti Migration Rules
- No bidirectional dependency creation during extraction.
- No temporary hacks that introduce hidden protocol/orchestration coupling.
- No consumer-specific branches in core for enterprise cutovers.
- No runtime behavior forks by environment flags inside deterministic kernel.

---

## Review and Approval Gates
Extraction PRs must include:
- boundary classification (core vs enterprise)
- dependency direction impact
- compatibility shim plan (if needed)
- deprecation timeline
- rollback strategy
- owner sign-off from both core and enterprise maintainers
