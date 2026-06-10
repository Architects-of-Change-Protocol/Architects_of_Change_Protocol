# Decision Constitution

**Constitution Version:** v18.0

## Constitutional definition

A **Decision Authority** is a constitutionally valid conclusion reached through assigned capabilities operating under active policies and supported by sufficient, traceable, integrity-protected evidence. A decision is not an actor, permission, policy engine, or execution engine.

## Constitutional chain

```text
Authority
↓
Capability
↓
Policy
↓
Decision
↓
Action
```

Every governed action must be traceable to a decision. Every decision must be traceable to active policy coverage, used capabilities, the authority chain that holds those capabilities, and the evidence that supports the outcome. Missing traceability fails closed.

## Legitimacy conditions

A decision is legitimate only when all of the following are true:

1. its decision authority is canonical and constitutionally cataloged;
2. its owner is a recognized constitutional authority;
3. its capability and policy coverage are active and applicable;
4. required evidence satisfies declared minimums, sources, traceability, and integrity;
5. its lifecycle state and transitions are valid;
6. an approved outcome has a complete explanation record;
7. any appeal or revocation follows the applicable constitutional policy; and
8. creation, semantic change, retirement, lifecycle alteration, evidence weakening, appeal restriction, or revocation change is authorized by a Type B or Type C amendment as required.

## Decision classes

- **Constitutional:** changes or interprets supreme constitutional authority.
- **Governance:** administers governed authority, capability, policy, or delegation.
- **Runtime:** records a protocol conclusion that may authorize a runtime action.
- **Operational:** records an auditable operational or assurance conclusion.

## Constitutional rules

- Policy constrains capability; a valid decision authorizes action.
- Capability possession alone does not create a decision.
- Policy coverage alone does not create a decision.
- No decision may become `Approved` without required evidence and explainability.
- A rejected decision authorizes no action.
- Revoked and retired decisions authorize no new action and may never be reactivated.
- Decision records are immutable historical facts; correction occurs through appeal, revocation, superseding decision, or amendment, never silent mutation.
- Decision governance is deny-by-default.

## Evolution and versioning

Decision authority creation, retirement, class changes, legitimacy semantics, evidence minimum weakening, lifecycle semantics, explainability requirements, appeal rights, revocation causes, and enforcement obligations require Type C amendments. Non-semantic ownership or administrative changes may use Type B amendments. Clarifications that preserve meaning may use Type A amendments.

## Explicit non-goals

This Constitution does not implement a decision engine, policy engine, execution engine, standing engine, runtime authorization, runtime governance runtime, or AI decision runtime. It governs decision authority and constitutional records only.
