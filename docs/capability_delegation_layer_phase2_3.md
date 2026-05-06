# Phase 2.3 — Capability Delegation Layer (Infrastructure Spec)

This module defines programmable relationship governance through delegated capabilities, built as trust infrastructure rather than CRM/IAM abstractions.

## Module Surfaces

1. **Capability Delegation Console**
   - Projection source: `toDelegationConsoleRows`.
   - Visual chain: `Entity -> Capability Token -> Organization/AI Agent -> Scoped Access`.
   - Includes expiration window, revocability, trust state, and inherited scopes.

2. **Active Capability Tokens Panel**
   - Source: `capabilityTokens`.
   - Required runtime statuses covered: `active`, `expiring`, `suspended`, `revoked`.
   - Includes trust verification and signed runtime verification flags.

3. **Scoped Access Visualization**
   - Source: `CapabilityScope` fields.
   - Captures `scope key`, `inheritedFrom`, `restrictions`, and `minimizationRule`.
   - Supports policy-bounded access disclosure in UI.

4. **AI Agent Governance Panel**
   - Projection source: `toAgentGovernanceSignals`.
   - Signals: delegated capabilities, trust state, autonomous revocation flags, policy drift detection, attestation result.

5. **Capability Timeline**
   - Source: `capabilityTimeline`.
   - Lifecycle events modeled: issued, delegated, consumed, renewed, restricted, expired, revoked.

6. **Relationship Governance Graph**
   - Sources: `governanceGraphNodes`, `governanceGraphEdges`.
   - Graph narrative: User ↔ Relationship ↔ Capability ↔ Organization ↔ AI Agent ↔ Policy Runtime.

## Extensibility Hooks

- Marketplace connector insertion point:
  - capability recipient expansion (`delegatedTo`) to partner runtimes.
  - graph edge relationship extension (e.g. `brokers`, `resells`, `subdelegates`).
- Policy engines can attach attestation proofs to capability lifecycle events.
- Delegation constraints can be bound to jurisdictional and model-risk policies.

## Implementation Notes

- Interfaces are typed for reuse in Next.js App Router UI components.
- Runtime data is mock-safe for design and UX integration.
- Projection functions isolate view-model shaping from backend state.
