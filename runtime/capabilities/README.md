# Capability Runtime Layer (AOC Core)

The capability runtime converts capability primitives into **executable authority artifacts**. A runtime capability is not just a token-like descriptor; it is a live authority object that participates in governance state, obligation satisfaction, revocation, and audit emission.

## Authority chain

A runtime capability is issued only after governance confirms:
1. Relationship context exists (`relationshipId`).
2. PDP traceability exists (`policyTraceId`).
3. Governance session is approved/completed.
4. Obligations are not pending or failed.

This enforces a chain: **consent + relationship + PDP evidence + governance completion => executable capability**.

## Lifecycle awareness

Capabilities are lifecycle-aware states (`issued`, `active`, `suspended`, `revoked`, `expired`) with strict transitions:
- revoked/expired cannot reactivate.
- `notBefore` and `expiresAt` are enforced at evaluation time.
- suspended is non-executable until a future explicit restore path is introduced.

## Revocation philosophy

Revocation is authoritative and immediate in local semantics:
- revocation record is canonical (`CapabilityRevocation`).
- apply step marks runtime capability revoked.
- local query can enumerate revoked capabilities.

Distributed propagation is intentionally out of scope in this phase.

## Capability use and PDP seam

Capability use is sessionized (`CapabilitySession`) and evaluated via layered checks:
1. capability validity/lifecycle window,
2. actor/action/scope checks,
3. optional PDP adapter decision.

The PDP seam is adapter-based to avoid coupling to any single PDP runtime implementation.

## AI-bounded capabilities

Optional constraints:
- `aiActorId`
- `allowedPurposes`
- `blockedScopes`
- `requiresHumanReview`
- `maxAutonomousUses`

These are **boundary constraints only**, not orchestration. Denials are explicit when constraints are violated.

## Audit hooks

Composable audit hooks emit canonical runtime events:
- `capability_issued`
- `capability_activated`
- `capability_suspended`
- `capability_revoked`
- `capability_expired`
- `capability_use_evaluated`
- `capability_denied`

## Current limitations

- No persistence layer (in-memory semantics only).
- No distributed revocation fan-out.
- No restore-from-suspended workflow yet.
- No obligation execution engine in this module (it consumes governance outcomes).
- No AI autonomy counter mutation service; boundary checks read current counter.
