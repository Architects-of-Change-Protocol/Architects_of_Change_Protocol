# Runtime Federation Architecture

## Scope
Governance semantics for sovereign runtime interoperability; no consensus, mesh, scheduler, or infra topology assumptions.

## Core Components
1. Federation primitives (`runtime/distributed/types.ts`).
2. Federation decision helpers (`runtime/distributed/federation-semantics.ts`).
3. Governance checks (`scripts/check-federation-governance.mjs`).

## Determinism Rules
- Decisions normalize sorted unique reasons.
- Deny conditions are explicit and reason-coded.
- Compatibility and trust are independent checks composed into final decision.
