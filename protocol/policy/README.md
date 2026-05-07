# Policy Decision Point (PDP) Foundation

## Why this module exists

Authorization in AOC is currently distributed across enforcement engines, capability checks, adapter policies, and runtime request guards. This module introduces a **single policy evaluation entry point** so future access decisions can converge into one pathway.

Current objective:
- centralize decision evaluation contract (`PolicyEvaluationInput`)
- return normalized decisions (`PolicyDecision`)
- produce traceable outcomes (`PolicyDecisionTrace`)
- avoid breaking existing modules while migration is staged

## Current scope (phase-1 foundation)

The PDP currently performs lightweight baseline checks:
- permission expiration
- allowed action matching
- category matching
- basic brand alignment
- basic actor/resource ownership alignment

This is intentionally minimal and not yet a full policy engine.

## Current limitations

- No persistence for traces (in-memory only).
- No distributed policy storage.
- No external policy language/DSL.
- No native rate-limit/frequency counters (returned as obligations).
- Existing enforcement paths are **not yet routed** through PDP.

## Future architecture direction

Expected migration path:
1. Keep existing enforcement behavior stable.
2. Add adapter wrappers that call `evaluateAccess(...)` before legacy checks.
3. Gradually move duplicated authorization logic into PDP policy evaluators.
4. Standardize reason codes and obligations across protocol/runtime.
5. Attach PDP trace IDs to audit logs.

## Where integrations should happen next

Candidate modules to adopt PDP entrypoints:
- `protocol/enforcement/*`
- `runtime/enforcement/*`
- `runtime/access/*` (if present in runtime topology)
- capability authorization paths
- adapter-level authorization checks
- API request validation gates

## Role boundaries

- **PDP (Policy Decision Point):** evaluates policy input and returns allow/deny + reason + trace metadata.
- **PEP (Policy Enforcement Point):** intercepts requests and enforces PDP decisions at runtime boundaries.
- **Consent:** records subject intent/permissions over time.
- **Capability:** cryptographically portable authorization artifact.
- **Relationship:** trust/business context between actors.
- **Audit:** immutable event trail and compliance evidence.

PDP should evaluate policy using these inputs, but should not replace domain ownership of consent, capability, relationship, or audit.
