# Execution Orchestration Semantics

Deterministic multi-step orchestration semantics only (no scheduler/control plane).

- Staged and chained execution.
- Delegated execution with ancestry.
- Dependency and ordering constraints.
- Rollback posture: fail closed; no lineage rewrite.
- Boundaries: capability, policy, transport, tenant, environment, compatibility, stage.
