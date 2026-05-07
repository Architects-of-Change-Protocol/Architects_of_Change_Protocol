# Distributed Governance Foundations (Phase 1)

This module introduces semantic building blocks for governance across multiple runtimes and trust domains.

## Why distributed governance matters

AOC already models identity, policy, capability, and audit semantics. The missing layer was explicit multi-runtime and multi-domain authority boundaries. This module adds those boundaries without introducing network or infrastructure coupling.

## Trust-domain philosophy

`TrustDomain` is the root isolation primitive. Every federation and remote authority flow is bounded by:

- domain type
- trust level
- explicit allowed federation modes
- policy namespace references

Suspension is first-class, so runtime participation can be paused immediately.

## Federation semantics

`RuntimeFederation` is an explicit contract between domains. Compatibility validation checks:

- source/target mode allow-lists
- trust restrictions (for example, strict + reciprocal denial)
- delegation policy boundaries
- capability transfer constraints (for example, no capabilities in `audit_only`)

## Remote governance reasoning

`RemoteGovernanceDecision` is a transport-neutral representation of cross-runtime policy outcomes. It captures trace references, obligations, and remote audit references, so decisions can be replayed and verified later.

## Distributed capability semantics

`DistributedCapabilityReference` allows capability usage across runtime boundaries while enforcing that federated capabilities map to active federation contracts.

## Revocation propagation philosophy

`DistributedRevocationReference` tracks propagation state transitions (`pending` -> `propagated`/`acknowledged`/`failed`) independently from transport implementation.

## Governance isolation model

Isolation helpers enforce that:

- isolated domains do not delegate,
- audit-only federations never carry authority,
- AI runtime federation remains restricted by mode constraints.

## Current limitations

- No networking or remote transport.
- No signature verification.
- No distributed state reconciliation.
- No consensus or ordering guarantees across runtimes.
- In-memory registries only.

## Future vision

These semantics are designed so future transport, cryptographic attestation, and federation synchronization layers can be added without changing governance meaning or authority boundaries.
