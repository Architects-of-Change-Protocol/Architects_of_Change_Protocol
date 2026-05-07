# Sovereign Runtime Layer (AOC Core)

Sovereign runtimes are first-class governance actors: each runtime has identity, trust posture, policy envelope, capability boundaries, isolation guarantees, and AI execution governance. This closes the gap where runtimes were merely opaque IDs.

## Core philosophy
- Runtime identity is distinct from actor identity: an actor owns a runtime, but runtime governance state is independently mutable and revocable.
- Runtime policy envelopes scope what policies, attestations, audit events, and delegation limits are valid.
- Runtime trust posture tracks evidence, risk flags, degradation/recovery signals, and review recency.
- Runtime capability domains establish allowed/blocked capabilities, TTL constraints, and revocation semantics.
- Runtime isolation profiles define federation limits, blocked counterpart runtime types, egress restrictions, and AI execution restrictions.
- Runtime AI governance profiles constrain AI actor types, blocked scopes, human-review gates, autonomy ceilings, and escalation hooks.

## Integration seams
This layer adds helper seams (without rewriting distributed governance or execution fabric):
- trust-domain compatibility checks
- federation compatibility checks
- execution-fabric eligibility checks
- attestation requirement extraction
- remote capability validation checks

## Current limitations
- In-memory registries only (no persistence).
- Ref existence validation is syntactic (non-empty refs), not globally resolved.
- Trust eligibility heuristics are conservative but static.
- Federation/isolation compatibility is intentionally lightweight and should be tightened as cross-runtime protocols mature.
