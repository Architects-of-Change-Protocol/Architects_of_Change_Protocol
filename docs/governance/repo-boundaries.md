# Repository Boundaries Governance

## Purpose
This document formalizes canonical ownership boundaries between:
- `Architects_of_Change_Protocol` (core repository)
- `AOC-Enterprise` (enterprise orchestration repository)
- product/application repositories (solution-specific delivery)

Its goal is to prevent architectural drift, preserve deterministic behavior in core runtime surfaces, and avoid orchestration/product coupling contaminating protocol primitives.

---

## Canonical Ownership Model

### 1) `Architects_of_Change_Protocol` (Core)
This repository is the canonical home for:
- protocol primitive layer
- foundation runtime layer
- deterministic enforcement/runtime kernel

Core owns **portable, deterministic, sovereignty-grade primitives** that are reusable across enterprises and products without tenant-specific behavior.

### 2) `AOC-Enterprise` (Enterprise)
This repository is the canonical home for:
- control plane orchestration
- tenant/runtime negotiation
- governance treaty orchestration
- enterprise operational governance
- runtime coordination concerns

This includes extracted orchestration runtimes previously removed from core:
- `runtime/controlPlane`
- `runtime/runtime-negotiation`
- `runtime/governance-treaties`

### 3) Products / Apps (Delivery)
Product and application repositories own:
- UI/UX flows
- business vertical logic
- customer-specific workflows
- deployment composition and operational packaging

Products consume core and enterprise capabilities; they do not define protocol primitives or enterprise governance contracts.

---

## Boundary Definitions

## What Belongs in Core Protocol Repository
Allowed in core:
- canonical schemas, contracts, and invariants
- deterministic validation/enforcement engines
- runtime foundation abstractions needed by deterministic execution
- provider-neutral adapter interfaces
- cryptographic, policy-evaluation, and state-transition mechanisms that are deterministic
- test fixtures proving deterministic protocol behavior

Not allowed in core:
- tenant orchestration logic
- control plane coordination workflows
- governance treaty lifecycle orchestration
- environment-specific policy override stacks
- customer/product feature toggles
- UI/API gateway composition for app delivery

## What Belongs in `AOC-Enterprise`
Allowed in enterprise:
- tenant-aware orchestration
- runtime coordination plans and operational control loops
- treaty/governance process orchestration and lifecycle management
- enterprise integration workflows and topology-aware controllers
- policy rollout sequencing and fleet-level change control

Not allowed in enterprise:
- redefining protocol primitives already canonicalized in core
- embedding product UI/business domain logic
- bypassing core deterministic enforcement semantics

## What Belongs in Products/Apps
Allowed in products/apps:
- end-user journey implementation
- feature-specific orchestration using enterprise and core APIs
- presentation layer contracts and API composition for channels

Not allowed in products/apps:
- direct mutation of core canonical contracts
- ad-hoc orchestration embedded into protocol runtime internals
- bypasses around enterprise governance workflows where required by platform policy

---

## Runtime vs Orchestration Distinction

## Runtime (Core)
Runtime concerns are execution-time deterministic functions with invariant outcomes for equivalent inputs and protocol state.

## Orchestration (Enterprise)
Orchestration concerns are coordination-time decisions across tenants, environments, schedules, governance lifecycles, and operational state.

Rule: If behavior depends on tenant identity, rollout window, operational topology, or enterprise governance process, it belongs in `AOC-Enterprise`, not core.

---

## Forbidden Coupling Patterns
- Core importing orchestration modules from `AOC-Enterprise`
- Core importing UI/product code
- Core embedding tenant identifiers, enterprise policy routing, or environment rollout logic
- Enterprise rewriting core deterministic transitions inline instead of invoking canonical core APIs
- Products reaching into non-public internals of core or enterprise repositories

---

## Adapter Boundary Rules
- Adapters are declared as interfaces/contracts in core; concrete provider integrations may live in enterprise or product repos depending on scope.
- Core must not depend on provider SDK specifics.
- Enterprise can bind adapter interfaces to infrastructure/provider implementations.
- Product repos can add channel-facing adapters, but must not alter canonical adapter contracts without governance approval.

---

## Examples and UI Isolation Rules
- `examples/`, demo apps, and reference UIs are non-canonical and must not become dependency roots for core.
- UI artifacts must depend outward on public APIs only.
- No imports from UI or demo code into any deterministic core module.
- Example code may illustrate integration patterns but cannot define normative protocol behavior.

---

## Governance Enforcement
- Boundary violations block merge.
- Architectural review is required when introducing new top-level modules touching runtime/orchestration seams.
- Any new module must declare its layer and dependency intent in its local README or architecture note.
