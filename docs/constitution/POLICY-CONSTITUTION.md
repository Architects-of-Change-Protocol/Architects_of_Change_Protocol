# Policy Constitution

**Constitution Version:** v6.0

## Purpose

This Constitution governs the rules that constrain the exercise of constitutional capabilities. Capability authority answers whether an authority may act; policy authority answers the conditions under which that capability may be exercised. A capability without an applicable active policy is denied by default.

## Constitutional policy authority

A **Policy Authority** is a constitutional rule that constrains the exercise of one or more capabilities. Policy records are governance artifacts, not runtime authorization or decision-engine objects.

The constitutional chain is:

```text
Authority
↓
Capability
↓
Policy
↓
Action
```

## Policy ownership

Every policy has exactly one owner named in `POLICY-AUTHORITIES.md`. The owner must be a canonical constitutional authority. Ownership carries stewardship duties but does not permit unilateral creation, expansion, suspension, exception, revocation, or retirement.

## Policy classes

| Class | Purpose | Examples |
|---|---|---|
| Constitutional | Protect constitutional structure and amendment authority. | Amendment ratification, authority creation, capability governance |
| Governance | Constrain institutional governance powers. | Delegation, revocation, standing, governance decisions |
| Runtime | Constrain protocol-level capability exercise. | Claim evidence, verification, trust, consent |
| Operational | Constrain implementation operations. | Retention, observability, logging, persistence, execution |

## Policy authority rules

1. Every policy has a unique `POL-####` identifier and a ratified Type B or Type C creation amendment.
2. Constitutional policy creation, semantic expansion, class changes, priority changes, conflict rules, exceptions, and retirement require amendment governance.
3. Type B may change ownership, delegation, or application assignments without expanding policy semantics.
4. Type C is required to create or retire a policy, change policy meaning, weaken a constraint, alter hierarchy or conflict semantics, or modify exception authority.
5. Policies may narrow capability exercise; policies may never create capabilities or expand the authority granted by a capability.
6. Delegation transfers policy administration only when the catalog says `Delegable: Yes`. It never transfers amendment or exception power and may not weaken the policy.
7. Active capability exercise must be covered by at least one active applicable policy. Missing, ambiguous, revoked, suspended, or retired policy coverage fails closed.
8. This framework governs policy authority only. It does not implement a runtime policy, authorization, decision, standing, governance, execution, or federation engine.

## Policy evolution

Policy evolution is append-only and amendment-traceable. Replacement policies preserve historical identifiers and lifecycle records. A successor may be more restrictive through Type B when constitutional semantics remain unchanged; any weakening or semantic expansion requires Type C and explicit migration impact.
