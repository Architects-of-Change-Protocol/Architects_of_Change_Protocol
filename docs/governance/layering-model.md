# Layering Model Governance

## Purpose
This model defines mandatory layering for the sovereign infrastructure ecosystem and enforces allowed dependency flow to prevent upward leakage and architecture erosion.

---

## Canonical Layer Stack

- **L0 = Canonical contracts/specs**
  - Schemas, invariants, protocol contracts, formal semantics.

- **L1 = Deterministic engines**
  - Deterministic evaluators, validators, enforcement and transition kernels.

- **L2 = Runtime foundation services**
  - Core runtime services supporting deterministic execution (state services, runtime utilities, foundational service abstractions).

- **L3 = Adapters/provider interfaces**
  - Provider-neutral adapter interfaces and integration seams; infrastructure bindings through governed contracts.

- **L4 = Enterprise orchestration**
  - Control plane orchestration, runtime negotiation, governance treaty lifecycle coordination, operational governance.

- **L5 = Products/apps/UI**
  - User-facing products, application workflows, UX, channel/API composition.

---

## Dependency Direction Rules

### General Rule
Dependencies may flow **downward only toward lower canonical layers**.

Allowed directional examples:
- L5 -> L4/L3/L2/L1/L0
- L4 -> L3/L2/L1/L0
- L3 -> L2/L1/L0 (and platform/provider SDKs as implementation detail outside core contracts)
- L2 -> L1/L0
- L1 -> L0
- L0 -> none

### Forbidden Upward Dependencies
- L0/L1/L2/L3 importing L4 orchestration logic is forbidden.
- L0/L1/L2/L3/L4 importing L5 product/UI code is forbidden.
- L1 deterministic kernels depending on tenant orchestration policy is forbidden.

---

## Leakage Prohibitions

## Forbidden Product Leakage into Protocol
- No L5 business-domain entities in L0-L2 contracts.
- No product roadmap features as protocol flags in L0/L1.
- No UI-driven state model decisions embedded in deterministic engines.

## Forbidden Orchestration Leakage into Protocol
- No control-plane lifecycle state in deterministic protocol contracts.
- No treaty orchestration state machines in L0-L2.
- No tenant rollout logic in deterministic runtime kernel.

---

## Adapter Boundary Model (L3)
- L3 defines stable abstraction boundaries between runtime foundation and external systems.
- Core defines adapter contracts; enterprise/product layers provide binding implementations.
- Adapter contracts must be coarse enough to prevent infrastructure-specific leakage upward.
- Provider-specific behavior must be normalized before crossing into L2/L1 pathways.

---

## Anti-Spaghetti Structural Rules
- No cyclic dependencies across layers.
- No cross-layer “shortcut imports” that bypass public boundaries.
- No “god modules” combining L1 deterministic logic with L4 orchestration concerns.
- No mixed ownership modules spanning core and enterprise responsibilities.

---

## Enforcement Practices
- Each module must declare its layer (`L0`-`L5`) in architecture metadata/readme.
- CI/static checks should enforce dependency direction.
- PR reviews must reject ambiguous layer ownership.
- Exception requests require architecture board approval and time-bounded remediation plan.
