# CAPABILITY_RUNTIME_ARCHITECTURE

This document defines deterministic, fail-closed sovereign capability governance semantics for runtime execution.

## Canonical Model
- Capability primitives include identity, scope, constraints, obligations, delegation metadata, lineage metadata, revocation metadata, and evaluation traces.
- Capability categories: execution, data-access, payout, consent, governance, runtime, agent, delegation, transport, tenant, sdk.
- Capability states: active, expired, revoked, suspended, delegated, attenuated, derived, invalid.

## Deterministic Invariants
- Child authority is subset-only: scope, actions, and lifetime cannot exceed parent.
- Required obligations are inherited and cannot be removed by descendants.
- Revoked ancestors invalidate lineage descendants transitively.
- Attenuation is monotonic; removed authority cannot be reintroduced.

## Examples
- Delegated capability: parent `cap.root` delegates to `cap.child` with reduced scope and actions.
- Attenuated capability: write permission removed and expiry shortened.
- Lineage trace: origin `cap.root` -> delegated `cap.child` -> derived `cap.child.1`.
- Revocation propagation: revoking `cap.root` invalidates `cap.child` and descendants.
- Execution-bound capability: limits on purpose, action, and resource boundary.
- SDK-safe view: expose identifiers, effective constraints, and decision only.
- Audit-safe trace: include reason codes and lineage IDs, redact sensitive context.
- Future AI-agent delegated execution: bounded autonomous uses + required human-review flag.
- Enterprise delegation chain: tenant admin -> workload identity -> automation runner.

## Policy / Observability Alignment
- Capability deny/allow decisions emit canonical reason codes and audit events.
- Capability trace data maps to telemetry categories: capability, policy, execution, validation.
- Governance language compatibility preserved through explicit revocation and derivation semantics.

## Boundary Guidance
- Public stable: category, state, scope/action/lifetime constraints, decision outcomes.
- SDK-safe: evaluated constraints and redacted explainability summary.
- Audit-safe: lineage IDs and reason codes without secrets.
- Internal-only: detailed delegation paths, environment posture internals, enforcement strategy.
- Experimental: enterprise control-plane and federation-only forwarding metadata.

## Risks and Readiness
- Remaining risk: partial revocation granularity and distributed lineage cache consistency.
- AI-agent readiness: execution obligations + autonomous use boundaries enforced.
- Enterprise readiness: transitive delegation and inherited constraint checks are deterministic.
- Sovereign execution readiness: fail-closed lineage/revocation checks integrated before action.
