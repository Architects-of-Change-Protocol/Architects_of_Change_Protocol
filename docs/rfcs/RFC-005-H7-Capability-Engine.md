# RFC-005-H7 — Capability Engine

| Field | Value |
|---|---|
| RFC Number | 005-H7 |
| Title | Capability Engine |
| Status | Draft |
| Category | Core Protocol Extension |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-03 |
| Supersedes | — |
| Related | RFC-004 Evidence Layer v1.0, RFC-005 AOC Claims Framework, RFC-005-H1 Standing Traceability, RFC-005-H2 Standing Engine, RFC-005-H3 Standing Governance, RFC-005-H4 Capability Mapping, RFC-005-H5 Delegated Standing, RFC-005-H8 Authority Model, RFC-005-H9 Decision Framework |

---

## Abstract

This document defines the Capability Engine for the AOC Protocol. The Capability Engine is the deterministic policy-governed evaluation function that consumes Standing, Policy, Delegation, and Context and produces Capability Decisions.

The Capability Engine answers the core protocol question: **How does a protocol determine whether a capability should exist?**

The Capability Engine does not define a database schema, API, runtime service, user interface, blockchain design, credential format, access-control product, or implementation-specific algorithm. It defines the constitutional protocol requirements that any conformant capability evaluation implementation MUST satisfy.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Capability Engine Definition](#3-capability-engine-definition)
4. [Capability Engine Responsibilities](#4-capability-engine-responsibilities)
5. [Capability Engine Non-Responsibilities](#5-capability-engine-non-responsibilities)
6. [Capability Inputs](#6-capability-inputs)
7. [Capability Evaluation Pipeline](#7-capability-evaluation-pipeline)
8. [Capability Decision Model](#8-capability-decision-model)
9. [Capability Eligibility Engine](#9-capability-eligibility-engine)
10. [Capability Constraint Engine](#10-capability-constraint-engine)
11. [Capability Scope Engine](#11-capability-scope-engine)
12. [Capability Delegation Engine](#12-capability-delegation-engine)
13. [Capability Risk Engine](#13-capability-risk-engine)
14. [Capability Governance Engine](#14-capability-governance-engine)
15. [Capability Challenge Engine](#15-capability-challenge-engine)
16. [Capability Revocation Engine](#16-capability-revocation-engine)
17. [Capability Simulation Engine](#17-capability-simulation-engine)
18. [Capability Traceability](#18-capability-traceability)
19. [Capability Dependency Graph](#19-capability-dependency-graph)
20. [Capability Auditability](#20-capability-auditability)
21. [Capability Determinism](#21-capability-determinism)
22. [Capability Explainability](#22-capability-explainability)
23. [Capability Guarantees](#23-capability-guarantees)
24. [Security Implications](#24-security-implications)
25. [Canonical Concepts](#25-canonical-concepts)
26. [Implementation Guidance](#26-implementation-guidance)
27. [Future Dependencies](#27-future-dependencies)
28. [Acceptance Criteria](#28-acceptance-criteria)

---

## 1. Executive Summary

The Capability Engine is the protocol mechanism that determines whether a Capability should exist for a CapabilitySubject in a defined CapabilityScope under applicable CapabilityConstraints.

The canonical chain for this RFC is:

```text
Evidence
  ↓
Claims
  ↓
Standing
  ↓
Capability Engine
  ↓
Capability
  ↓
Authority
  ↓
Decision
```

The Capability Engine exists between Standing and Capability. It consumes upstream standing and governance inputs, evaluates those inputs against policy and context, and emits a CapabilityDecision. A CapabilityDecision may grant, deny, restrict, suspend, revoke, or supersede a CapabilityGrant.

The Capability Engine MUST preserve the separation of protocol layers:

- Evidence records facts, artifacts, observations, events, or proofs.
- Claims express formal statements supported by evidence.
- Standing is the current validity state or current interpretable state derived from evidence and claims.
- Delegation is a bounded authorization relationship that may modify eligibility without rewriting standing.
- Capability is a bounded, scoped, policy-governed action surface or permission precursor.
- Authority is recognized legitimacy under policy, scope, constraints, governance, and traceability.
- Decision is a protocol-recognized outcome produced under recognized authority.

The Capability Engine MUST NOT treat standing as permission. The Capability Engine MUST NOT treat delegation as authority. The Capability Engine MUST NOT treat capability as a decision. The Capability Engine MUST produce an explainable, auditable, deterministic CapabilityDecision from traceable inputs.

This RFC explicitly answers:

| Question | Protocol answer |
|---|---|
| How is capability granted? | A capability is granted when the Capability Engine determines that standing, policy, delegation when applicable, scope, constraints, risk, governance, and context satisfy the requirements for the requested CapabilityType. |
| How is capability denied? | A capability is denied when eligibility, standing, policy, delegation, scope, constraints, risk, governance, or context fails a mandatory requirement or cannot be proven. |
| How is capability restricted? | A capability is restricted when policy permits a narrower capability than requested or when standing, risk, challenge, governance, delegation, or context requires reduced scope or additional constraints. |
| How is capability revoked? | A capability is revoked when a revocation trigger terminates the CapabilityGrant before expiry, including standing degradation, policy change, governance action, delegation revocation, evidence invalidation, claim revocation, challenge outcome, risk escalation, fraud, or protocol violation. |
| How does delegation affect capability? | Delegation may modify eligibility, scope, constraints, or exercise path, but MUST NOT rewrite standing, bypass policy, or create authority by itself. |
| How does standing affect capability? | Standing provides eligibility basis, threshold satisfaction, confidence basis, and lifecycle triggers, but standing NEVER directly grants capability. |
| How does policy affect capability? | Policy defines eligible subjects, required standing, permitted scopes, constraints, delegation rules, risk thresholds, governance approvals, lifecycle transitions, and revocation triggers. |
| How does governance affect capability? | Governance recognizes and maintains policies, CapabilityTypes, challenge processes, review procedures, delegation frameworks, and high-risk approvals. Governance actions may trigger grant, denial, restriction, suspension, revocation, or supersession only through recognized processes. |
| How is traceability preserved? | Every CapabilityDecision MUST reference the StandingSnapshot, PolicyVersion, DelegationContext when applicable, RiskContext, OperationalContext, GovernanceContext, evaluation results, lifecycle state, and explanation basis that produced it. |
| How is explainability preserved? | Every CapabilityDecision MUST explain why the result occurred, which requirements passed or failed, which inputs were decisive, and how scope, constraints, delegation, risk, policy, and governance affected the result. |

---

## 2. Problem Statement

Standing produces interpretable protocol state. Capability Mapping defines that a Capability is a bounded, scoped, policy-governed action surface or permission precursor. Delegated Standing defines how delegation may extend limited standing-derived influence or capability eligibility. Authority Model defines recognized legitimacy. Decision Framework defines protocol-recognized outcomes.

A protocol still requires a canonical mechanism for determining whether a capability should exist.

Without a Capability Engine, implementations may create capabilities through direct administrative assignment, informal role mapping, opaque entitlement logic, ungoverned policy interpretation, or automatic standing-to-permission conversion. These patterns create constitutional failures.

### 2.1 Standing-to-permission collapse

If a standing state such as Trusted Vendor or Verified Professional automatically becomes a permission, standing is improperly treated as operational capability. This bypasses policy, scope, constraints, delegation review, risk review, and governance.

### 2.2 Hidden capability creation

If capabilities can be created by system access, administrator preference, vendor configuration, or undocumented workflow, the protocol cannot reconstruct why the capability exists. Hidden capability creation produces orphan capabilities and undermines authority and decision legitimacy.

### 2.3 Inconsistent policy application

If different implementations evaluate capability eligibility differently from identical StandingSnapshot, PolicyVersion, DelegationContext, RiskContext, OperationalContext, and GovernanceContext inputs, capability outcomes become arbitrary. Arbitrary capability MUST NOT participate in authority.

### 2.4 Delegation abuse

Delegation may be misused to extend standing-derived influence beyond policy, launder scope, bypass eligibility, hide accountability, or create downstream capabilities after the delegator loses standing or capability. The Capability Engine must evaluate delegation explicitly and preserve delegation lineage.

### 2.5 Stale and zombie capabilities

Capabilities may remain active after standing expires, claims are revoked, evidence is invalidated, delegation is revoked, policy changes, governance suspends the grant, or risk escalates. A capability that survives after its basis no longer holds is a zombie capability.

### 2.6 Missing explanations

A subject, auditor, authority recognizer, or governance body cannot challenge or trust a CapabilityDecision unless the decision explains why it was granted, denied, restricted, suspended, revoked, or superseded.

---

## 3. Capability Engine Definition

A **CapabilityEngine** is the deterministic policy-governed evaluation function that consumes Standing, Policy, Delegation, and Context to produce CapabilityDecisions.

A CapabilityEngine evaluates whether a requested, existing, delegated, challenged, suspended, or dependent capability should exist, continue to exist, exist with restrictions, be denied, be suspended, be revoked, or be superseded.

At minimum, a CapabilityEngine consumes:

```text
StandingSnapshot
PolicyVersion
DelegationContext
RiskContext
OperationalContext
GovernanceContext
```

and produces:

```text
CapabilityDecision
```

The CapabilityEngine MUST operate on traceable inputs. If a required input cannot be identified, verified, or reconstructed, the CapabilityEngine MUST fail closed by denying, restricting, suspending, revoking, superseding, or withholding grant according to policy.

The CapabilityEngine is not merely an entitlement mapper. It is the constitutional evaluation layer that prevents standing, delegation, policy, and governance from being collapsed into untraceable permission.

---

## 4. Capability Engine Responsibilities

A conformant CapabilityEngine MUST perform the following responsibilities.

| Responsibility | Requirement |
|---|---|
| Consume standing | Evaluate StandingSnapshot, StandingType, StandingState, StandingConfidence, StandingContext, AlgorithmVersion, challenge effects, and lineage relevant to the requested capability. |
| Apply policy | Apply the applicable PolicyVersion governing CapabilityType, eligibility, scope, constraints, delegation, risk, lifecycle, challenge, and revocation. |
| Evaluate delegation | Determine whether DelegationContext modifies eligibility, scope, constraints, or exercise path without rewriting standing or exceeding delegation boundaries. |
| Evaluate context | Evaluate OperationalContext, RiskContext, and GovernanceContext at the time relevant to the CapabilityDecision. |
| Determine eligibility | Determine whether the CapabilitySubject satisfies all mandatory preconditions for the requested CapabilityType. |
| Determine scope | Establish whether requested CapabilityScope is permitted, narrowed, denied, or requires governance review. |
| Determine constraints | Establish the CapabilityConstraints that MUST apply to any granted or restricted capability. |
| Evaluate lifecycle | Determine whether a CapabilityGrant should be granted, remain active, become restricted, be suspended, be revoked, expire, or be superseded. |
| Produce decision | Emit a CapabilityDecision with result, basis, scope, constraints, lifecycle effect, and explanation. |
| Preserve traceability | Preserve reverse and forward traceability to standing, claims, evidence, policy, governance, delegation, authority, decisions, challenges, and lifecycle events. |
| Preserve explainability | Explain the outcome in human, machine, and audit forms sufficient for review, challenge, and deterministic reconstruction. |

---

## 5. Capability Engine Non-Responsibilities

The CapabilityEngine MUST NOT assume responsibilities assigned to other protocol layers.

The CapabilityEngine MUST NOT:

- create evidence;
- rewrite evidence;
- assert claims;
- attest claims;
- verify claims except as required to reference current standing inputs;
- compute StandingSnapshot as a substitute for the Standing Engine;
- directly edit standing;
- transfer standing from one subject to another;
- recognize authority;
- produce Recognized Decisions under RFC-005-H9;
- execute operational actions;
- provision access in an implementation system;
- bypass governance because an actor has administrative control;
- create capabilities without policy;
- grant global, unbounded, or unscoped capabilities;
- treat simulation as canonical capability state;
- erase historical CapabilityDecisions, CapabilityGrants, CapabilityDenials, CapabilityRestrictions, CapabilityRevocations, or CapabilityChallenges.

The CapabilityEngine MAY consume outputs from other layers. It MUST NOT replace those layers.

---

## 6. Capability Inputs

Capability evaluation requires explicit inputs. Missing, stale, challenged, unrecognized, or non-reconstructable inputs MUST affect the CapabilityDecision according to policy and MUST be explained.

### 6.1 StandingSnapshot

A **StandingSnapshot** is the standing basis consumed by the CapabilityEngine. It MUST be traceable to evidence, claims, policy context, algorithm version, challenge state, and standing explanation.

The CapabilityEngine MUST evaluate whether the StandingSnapshot:

- applies to the CapabilitySubject;
- applies to the requested CapabilityType and CapabilityScope;
- is current for the requested evaluation time;
- satisfies required StandingType, StandingState, and StandingConfidence thresholds;
- is not expired, revoked, superseded, invalidated, or suspended in a way that blocks the capability;
- carries challenge state that requires restriction, suspension, review, or denial;
- was produced under a policy and AlgorithmVersion acceptable to the applicable Capability Policy.

Standing affects capability by establishing or weakening eligibility. Standing MUST NOT grant capability by itself.

### 6.2 PolicyVersion

A **PolicyVersion** is the governance-approved policy basis that governs capability evaluation. It MUST define or reference eligibility, required standing, permitted subjects, CapabilityType, CapabilityScope, CapabilityConstraints, delegation rules, risk thresholds, governance requirements, lifecycle transitions, challenge handling, revocation triggers, and supersession rules.

The CapabilityEngine MUST apply the PolicyVersion effective for the evaluation context. When multiple policies appear applicable, the CapabilityEngine MUST resolve precedence according to governance-approved policy rules or deny, restrict, suspend, or withhold grant until policy conflict is resolved.

Policy affects capability by defining what may be granted, denied, restricted, suspended, revoked, or superseded. Policy MUST be versioned and governance-recognized.

### 6.3 DelegationContext

A **DelegationContext** is the traceable delegation basis, if any, that may affect eligibility, scope, constraints, or exercise path. DelegationContext includes the delegator, delegatee, delegation type, delegation scope, temporal bounds, constraints, lifecycle state, challenge state, policy basis, and upstream standing, capability, or authority basis where applicable.

The CapabilityEngine MUST evaluate whether delegation:

- is permitted by policy;
- was created by an eligible delegator;
- was received by an eligible delegatee;
- remains active, in scope, and within temporal bounds;
- does not exceed the delegator's own scope and constraints;
- does not exceed the delegatee's qualifying standing when policy requires delegatee standing;
- has not been revoked, expired, suspended, restricted, superseded, or successfully challenged;
- permits sub-delegation only when policy explicitly authorizes it.

Delegation affects capability by modifying eligibility, scope, constraints, or permitted exercise path. Delegation MUST NOT rewrite standing, bypass policy, or create authority by itself.

### 6.4 RiskContext

A **RiskContext** is the risk-relevant context for the requested or existing capability. It MAY include risk tier, operational criticality, financial exposure, safety impact, compliance exposure, AI autonomy level, jurisdictional sensitivity, challenge status, conflict of interest, and other policy-defined risk factors.

The CapabilityEngine MUST compare RiskContext to the risk thresholds and constraints in the applicable PolicyVersion and CapabilityGrant. Risk elevation MAY require denial, restriction, suspension, governance review, or revocation.

### 6.5 OperationalContext

An **OperationalContext** is the concrete context in which a capability is requested, evaluated, maintained, or exercised. It MAY include organization, project, workspace, workflow, resource type, action class, monetary amount, time, location, jurisdiction, purpose, interaction modality, and requested duration.

The CapabilityEngine MUST evaluate OperationalContext against CapabilityScope and CapabilityConstraints. A capability valid in one OperationalContext MUST NOT be treated as valid in another unless policy permits scope extension and the extension is traceable.

### 6.6 GovernanceContext

A **GovernanceContext** is the governance basis governing capability evaluation. It identifies recognized governance authority, applicable governance body, review process, challenge process, quorum or approval requirements when applicable, policy approval lineage, and governance lifecycle state.

The CapabilityEngine MUST evaluate whether governance requirements are satisfied before producing a grant, restriction, suspension, revocation, or supersession that requires governance involvement. Governance affects capability by defining who may approve policies, define CapabilityTypes, authorize high-risk grants, review challenges, suspend grants, revoke grants, or supersede grants.

---

## 7. Capability Evaluation Pipeline

A CapabilityEngine MUST evaluate capability through a traceable pipeline. The pipeline MAY be represented differently by implementations, but the constitutional evaluation order and recorded results MUST be preserved.

### 7.1 Request

A **CapabilityRequest** identifies the CapabilitySubject, requested CapabilityType, requested CapabilityScope, requested duration, OperationalContext, RiskContext, DelegationContext if any, and applicable PolicyVersion or policy selection basis.

A request MUST NOT create a capability. A request is an input to evaluation.

### 7.2 Eligibility

The CapabilityEngine MUST determine whether the subject is eligible for consideration. Eligibility evaluates subject recognition, required StandingSnapshot, required claims or standing-derived preconditions, delegation prerequisites, policy eligibility, and baseline governance conditions.

Eligibility alone MUST NOT be treated as an active capability.

### 7.3 Constraint Evaluation

The CapabilityEngine MUST evaluate all mandatory CapabilityConstraints, including temporal, monetary, risk, role, jurisdiction, policy, standing, delegation, and governance constraints.

A failed mandatory constraint MUST produce denial, restriction, suspension, revocation, supersession, or required governance review according to policy.

### 7.4 Scope Evaluation

The CapabilityEngine MUST compare requested scope with policy-permitted scope, standing context, delegation scope, operational context, and governance scope.

If requested scope exceeds permissible scope, the CapabilityEngine MUST deny or restrict the capability. It MUST NOT silently grant overbroad scope.

### 7.5 Delegation Evaluation

The CapabilityEngine MUST evaluate DelegationContext when the capability depends on delegated standing-derived influence, delegated capability, delegated authority eligibility, or any delegated operational path.

If delegation is invalid, expired, revoked, suspended, challenged in a blocking way, or out of scope, dependent capability MUST be denied, restricted, suspended, revoked, or superseded according to policy.

### 7.6 Risk Evaluation

The CapabilityEngine MUST compare RiskContext and OperationalContext to policy risk thresholds. High-risk, AI, financial, rights-affecting, cross-jurisdictional, autonomous, or governance-sensitive capabilities MAY require restriction, additional review, governance approval, or denial.

### 7.7 Policy Evaluation

The CapabilityEngine MUST apply the effective PolicyVersion. Policy evaluation MUST determine whether the requested CapabilityType may be granted, under what conditions, with what scope, with what constraints, subject to what lifecycle rules, and with what challenge and revocation paths.

If policy is missing, unrecognized, retired, conflicting, or outside governance scope, the CapabilityEngine MUST fail closed.

### 7.8 Governance Evaluation

The CapabilityEngine MUST evaluate GovernanceContext for required approvals, review procedures, challenge effects, policy recognition, CapabilityType recognition, delegation framework recognition, and high-risk controls.

Governance evaluation MUST NOT be replaced by administrator access or informal organizational seniority.

### 7.9 Decision

The CapabilityEngine MUST produce a CapabilityDecision. The decision MUST identify the result, subject, CapabilityType, scope, constraints, standing basis, policy basis, delegation basis when applicable, risk basis, governance basis, lifecycle effect, timestamp or evaluation time, explanation, and traceability references.

---

## 8. Capability Decision Model

A **CapabilityDecision** is the output of the CapabilityEngine. It determines whether a CapabilityGrant should be created, denied, narrowed, paused, terminated, or replaced.

CapabilityDecision outcomes are canonical.

### 8.1 Grant

A **Grant** means the CapabilityEngine has determined that the CapabilitySubject may hold the requested CapabilityType within defined CapabilityScope and CapabilityConstraints under the applicable PolicyVersion and GovernanceContext.

A grant MUST produce or reference a CapabilityGrant. A grant MUST record the standing basis, policy basis, scope, constraints, delegation basis when applicable, risk basis, governance basis, lifecycle state, effective period, challenge handling, revocation rules, and explanation.

A grant MUST NOT be global, unbounded, unexplained, or detached from StandingSnapshot and PolicyVersion.

### 8.2 Deny

A **Deny** means the CapabilityEngine has determined that the capability MUST NOT be granted because one or more mandatory requirements failed or could not be proven.

A denial MUST be recorded as a first-class result. It MUST explain the failed eligibility, standing, policy, delegation, scope, constraint, risk, governance, evidence, claim, or context requirement.

Absence of a grant is not sufficient denial traceability.

### 8.3 Restrict

A **Restrict** means the CapabilityEngine permits a narrower capability than requested or narrows an existing CapabilityGrant. Restriction MAY reduce scope, shorten duration, lower monetary limits, require supervision, require additional review, prohibit autonomous action, impose jurisdictional limits, or add challenge or risk conditions.

Restriction MUST identify the restriction basis and MUST preserve the unrestricted request or prior grant for audit.

### 8.4 Suspend

A **Suspend** means the CapabilityEngine temporarily disables capability exercise pending review, standing recomputation, challenge resolution, risk remediation, policy clarification, governance process, or lifecycle event.

Suspension MUST preserve historical capability state. Suspension is not revocation and MUST NOT erase the CapabilityGrant.

### 8.5 Revoke

A **Revoke** means the CapabilityEngine terminates a CapabilityGrant before scheduled expiry because the conditions that justified the grant no longer hold or because policy or governance requires termination.

Revocation MUST record the revocation trigger, prior state, new state, affected delegations, affected authority recognitions, affected pending decisions, policy basis, governance basis when applicable, propagation requirements, and explanation.

### 8.6 Supersede

A **Supersede** means the CapabilityEngine replaces an existing CapabilityGrant with a new grant, restriction, denial, suspension, or revocation state under updated scope, constraints, policy, standing, delegation, risk, or governance context.

Supersession MUST preserve both the superseded record and the superseding record. Supersession MUST NOT rewrite history.

---

## 9. Capability Eligibility Engine

The **CapabilityEligibility** function determines whether a CapabilitySubject satisfies baseline requirements for the requested CapabilityType before grant, restriction, or denial is finalized.

Eligibility evaluation MUST consider:

- recognized identity or subject status;
- required StandingSnapshot and StandingContext;
- required StandingType, StandingState, and StandingConfidence;
- relevant claims and claim standing when policy requires them;
- policy eligibility for the subject type;
- delegation eligibility when delegation is involved;
- governance eligibility when review or approval is required;
- challenge state affecting subject, standing, delegation, policy, or requested capability;
- temporal eligibility at the evaluation time.

Eligibility is necessary but not sufficient. A subject may be eligible yet receive denial or restriction because scope, constraints, risk, delegation, policy, or governance requirements fail.

---

## 10. Capability Constraint Engine

The **CapabilityConstraint** function evaluates the conditions that restrict capability existence or exercise.

CapabilityConstraints MUST be explicit, traceable, and policy-governed. They MAY include:

- temporal constraints;
- jurisdiction constraints;
- monetary constraints;
- risk constraints;
- role constraints;
- policy constraints;
- standing constraints;
- delegation constraints;
- governance constraints;
- challenge constraints;
- operational constraints;
- AI autonomy or supervision constraints.

The CapabilityEngine MUST evaluate constraints both at grant time and whenever policy requires revalidation. A constraint failure MUST result in denial, restriction, suspension, revocation, supersession, or governance review according to policy.

---

## 11. Capability Scope Engine

The **CapabilityScope** function determines the bounded operational domain within which a capability may exist and be exercised.

CapabilityScope MUST be mandatory. A capability without scope is not conformant.

The CapabilityScope function MUST evaluate:

- organizational, project, workspace, or governance domain;
- resource type, artifact type, operation type, or action class;
- jurisdiction or regulatory context;
- temporal bounds;
- risk tier;
- monetary or resource limits;
- purpose and operational context;
- delegation scope when applicable;
- governance scope when governance approval is required.

If requested scope exceeds policy, standing context, delegation scope, or governance scope, the CapabilityEngine MUST deny or restrict the capability. Scope laundering is a protocol violation.

---

## 12. Capability Delegation Engine

The **CapabilityDelegation** function evaluates whether delegation affects capability eligibility, scope, constraints, lifecycle, or exercise path.

The CapabilityDelegation function MUST preserve RFC-005-H5 semantics:

- delegation is bounded;
- delegation is traceable;
- delegation is revocable;
- delegation does not rewrite evidence;
- delegation does not rewrite standing;
- delegation does not bypass policy;
- delegation does not create authority by itself;
- delegation must remain within delegator and delegatee limits.

When a capability depends on delegation, the CapabilityEngine MUST apply the narrowest applicable boundary among:

- the delegator's standing-derived influence, capability, or authority basis;
- the delegatee's own required standing;
- the DelegationContext;
- the CapabilityScope;
- the CapabilityConstraints;
- the applicable PolicyVersion;
- the GovernanceContext;
- the RiskContext.

Delegation revocation, expiration, suspension, restriction, supersession, or successful challenge MUST trigger capability re-evaluation and MAY require restriction, suspension, revocation, supersession, or denial.

---

## 13. Capability Risk Engine

The **CapabilityRisk** function evaluates whether risk conditions permit the requested or existing capability to exist as requested.

Risk evaluation MUST be policy-governed and context-specific. It SHOULD consider:

- operational risk;
- security risk;
- compliance risk;
- financial risk;
- jurisdictional risk;
- AI autonomy risk;
- safety risk;
- rights-affecting risk;
- conflict-of-interest risk;
- delegation chain risk;
- challenge and dispute risk;
- governance abuse risk.

Risk may affect capability by requiring denial, restriction, additional constraints, suspension, revocation, supersession, governance approval, or periodic revalidation.

Risk evaluation MUST be explainable. A risk label without traceable policy basis and context is not sufficient for consequential capability decisions.

---

## 14. Capability Governance Engine

The **CapabilityGovernance** function evaluates the governance conditions required for a CapabilityDecision.

Capability governance MUST determine:

- whether the CapabilityType is governance-recognized;
- whether the applicable PolicyVersion is governance-approved and effective;
- whether required review, quorum, approval, or oversight has occurred;
- whether challenge processes affect the requested or existing capability;
- whether high-risk capability requires governance action;
- whether governance actors hold Recognized Authority for the relevant scope;
- whether governance actions are traceable and within governance scope;
- whether policy conflicts or supersession rules affect the result.

Capability Governance MUST NOT permit hidden capability creation. It MUST NOT permit unbounded capability grants. It MUST NOT permit administrative control to substitute for Recognized Authority.

---

## 15. Capability Challenge Engine

The **CapabilityChallenge** function evaluates challenges to capability requests, grants, denials, restrictions, suspensions, revocations, supersessions, scope, constraints, delegation basis, policy basis, governance basis, or exercise attempts.

A CapabilityChallenge MUST be traceable and MUST identify:

- the challenged capability object or evaluation result;
- the challenger or authorized challenge process;
- challenge reason;
- supporting evidence, claims, standing, policy, delegation, governance, or risk references when applicable;
- challenge state;
- effect on capability lifecycle;
- review process;
- outcome;
- appeal path when policy permits.

While a challenge is pending, policy MUST define whether the capability remains active, becomes restricted, becomes suspended, requires review, or is revoked. A challenge outcome MUST be capable of confirming, restricting, suspending, revoking, correcting, or superseding the challenged capability result.

---

## 16. Capability Revocation Engine

The **CapabilityRevocation** function determines when a CapabilityGrant MUST be terminated before scheduled expiry.

Revocation triggers include:

| Trigger | Capability effect |
|---|---|
| Evidence invalidation | Supporting standing may no longer satisfy eligibility, requiring re-evaluation and possible revocation. |
| Claim revocation | A claim supporting standing, eligibility, delegation, policy, or scope may no longer be usable. |
| Standing degradation | Required StandingState or StandingConfidence falls below policy threshold. |
| Policy change | A material PolicyVersion change removes eligibility, changes constraints, or requires revalidation. |
| Governance action | A recognized governance body or process suspends or revokes the capability. |
| Delegation revocation | The delegation basis for a dependent capability is revoked, expired, suspended, restricted, or superseded. |
| Challenge outcome | A successful challenge invalidates basis, scope, constraints, delegation, policy, or governance. |
| Risk escalation | Risk exceeds permitted thresholds. |
| Fraud or violation | Fraud, unauthorized use, policy violation, or protocol breach requires termination. |
| Expiry cascade | Upstream standing, policy, delegation, or capability basis expires. |

CapabilityRevocation MUST preserve historical records. Revocation MUST NOT erase the original grant. Revocation MUST propagate to dependent delegations, authority recognitions, pending decisions, simulations, and audit views according to policy.

---

## 17. Capability Simulation Engine

A **CapabilitySimulation** is a non-canonical what-if evaluation of capability under hypothetical standing, policy, delegation, risk, operational, governance, or time conditions.

CapabilitySimulation MAY support audit, impact analysis, policy design, migration planning, challenge review, risk review, and governance planning.

Simulation MUST NOT create, modify, revoke, suspend, restrict, supersede, or activate canonical capability state. A simulation output MUST be clearly labeled as simulation and MUST NOT be consumed as a CapabilityGrant, CapabilityDenial, CapabilityRestriction, CapabilityRevocation, Recognized Authority, or Recognized Decision.

A CapabilitySimulation SHOULD identify:

- baseline CapabilityDecision or CapabilityGrant when applicable;
- hypothetical inputs;
- changed StandingSnapshot, PolicyVersion, DelegationContext, RiskContext, OperationalContext, or GovernanceContext;
- simulated evaluation time;
- simulated CapabilityDecision;
- explanation of differences from canonical capability state.

---

## 18. Capability Traceability

Every CapabilityDecision MUST be fully traceable.

Capability Traceability extends Standing Traceability to the Capability Engine. A conformant CapabilityEngine MUST preserve enough lineage, dependency, and explanation data to prove why a capability was granted, denied, restricted, suspended, revoked, or superseded at any historical timestamp.

A CapabilityDecision MUST answer:

- Who was the CapabilitySubject?
- What CapabilityType was evaluated?
- What CapabilityScope was requested and what scope was granted, denied, restricted, suspended, revoked, or superseded?
- What CapabilityConstraints applied?
- What StandingSnapshot supported or failed to support the result?
- What PolicyVersion governed the result?
- What DelegationContext affected the result, if any?
- What RiskContext affected the result?
- What OperationalContext was evaluated?
- What GovernanceContext governed the result?
- What challenge state affected the result?
- What lifecycle state changed?
- What downstream authority recognitions, decisions, or delegations depend on the result?

Reverse traceability answers: *Which standing, policy, delegation, risk, operational, and governance inputs produced this CapabilityDecision?*

Forward traceability answers: *Which capabilities, authority recognitions, decisions, delegations, reviews, challenges, and lifecycle events depend on this CapabilityDecision?*

---

## 19. Capability Dependency Graph

The Capability Dependency Graph represents all relationships necessary to evaluate, explain, audit, challenge, propagate, and reconstruct CapabilityDecisions.

The canonical dependency graph is:

```text
Evidence
  ↓
Claims
  ↓
StandingSnapshot
  ↓
CapabilityEngine ← PolicyVersion
  ↑        ↑        ↑
  |        |        |
DelegationContext  RiskContext
  |        |        |
  v        v        v
OperationalContext GovernanceContext
  ↓
CapabilityDecision
  ↓
CapabilityGrant / CapabilityDenial / CapabilityRestriction / CapabilityRevocation
  ↓
Authority
  ↓
Decision
```

A complete Capability Dependency Graph SHOULD include:

- evidence records;
- claims, attestations, and verification results where applicable;
- StandingSnapshot, StandingDelta, StandingContext, StandingConfidence, and AlgorithmVersion;
- PolicyVersion and policy approval lineage;
- DelegationContext and delegation lifecycle events where applicable;
- RiskContext;
- OperationalContext;
- GovernanceContext;
- CapabilityRequest;
- CapabilityEvaluation;
- CapabilityDecision;
- CapabilityGrant, CapabilityDenial, CapabilityRestriction, CapabilityRevocation, suspension, and supersession records;
- CapabilityChallenge and challenge outcomes;
- dependent authority recognitions;
- dependent Recognized Decisions;
- audit and review records.

A capability node without traceable edges to StandingSnapshot, PolicyVersion, CapabilityScope, CapabilityConstraints, and GovernanceContext is an orphan capability and is not conformant. If delegation is involved, absence of DelegationContext lineage is also non-conformant.

---

## 20. Capability Auditability

Capability Auditability is the ability of authorized audit parties to reconstruct and review the basis, lifecycle, and consequences of CapabilityDecisions.

A conformant CapabilityEngine MUST support audit of:

- granted capabilities;
- denied capability requests;
- restricted capabilities;
- suspended capabilities;
- revoked capabilities;
- superseded capabilities;
- challenged capabilities;
- delegated capability effects;
- policy changes affecting capabilities;
- standing changes affecting capabilities;
- governance actions affecting capabilities;
- dependent authority and decision outcomes.

Audit records MUST preserve historical capability state. Amendments MUST produce new records or lifecycle events rather than overwriting prior records. Capability auditability MUST support challenge, appeal, review, compliance, invalidation propagation, revocation propagation, and historical reconstruction.

---

## 21. Capability Determinism

Capability determination MUST be deterministic.

Critical rule:

```text
Same inputs
  → Same outputs
```

For a given CapabilityRequest, StandingSnapshot, PolicyVersion, DelegationContext, RiskContext, OperationalContext, GovernanceContext, evaluation time, challenge state, and canonical evaluation rules, the CapabilityEngine MUST produce the same CapabilityDecision.

Determinism does not require different policy versions to produce the same result. Determinism requires that the policy version, standing basis, delegation basis, context, evaluation time, and evaluation rules be explicit and traceable.

A CapabilityEngine MUST NOT rely on hidden administrative discretion, unversioned policy, undisclosed model behavior, mutable configuration, vendor-specific entitlement state, or undocumented overrides to produce consequential capability decisions.

If a governance actor affects capability, that effect MUST occur through a recognized policy, governance, challenge, review, lifecycle, evidence, claim, standing, delegation, risk, or authority event that becomes part of the traceable input set.

---

## 22. Capability Explainability

Every CapabilityDecision MUST be explainable.

A conformant CapabilityEngine MUST explain:

- why granted;
- why denied;
- why restricted;
- why suspended;
- why revoked;
- why superseded.

Capability explanation MUST identify:

- decisive standing inputs;
- decisive policy requirements;
- decisive delegation effects;
- decisive scope findings;
- decisive constraint findings;
- decisive risk findings;
- decisive governance findings;
- decisive challenge effects;
- lifecycle consequences;
- downstream propagation requirements.

Capability explanation MUST exist in human, machine, and audit forms.

| Explanation form | Purpose |
|---|---|
| Human explanation | Allows subjects, reviewers, governance participants, and affected parties to understand the reason for the CapabilityDecision. |
| Machine explanation | Provides structured references to inputs, rule results, lifecycle effects, dependency graph edges, and propagation requirements. |
| Audit explanation | Provides sufficient lineage and reconstruction data for audit, challenge, appeal, invalidation propagation, historical reconstruction, and authority review. |

An unexplained CapabilityDecision is not conformant. A capability whose reason cannot be reconstructed MUST NOT be consumed by Authority.

---

## 23. Capability Guarantees

A conformant CapabilityEngine provides the following guarantees:

- no capability without StandingSnapshot lineage;
- no capability without PolicyVersion lineage;
- no capability without scope;
- no capability without constraints when constraints are required by policy;
- no delegated capability effect without DelegationContext lineage;
- no high-risk capability without required governance evaluation;
- no direct standing-to-permission conversion;
- no hidden administrative capability creation;
- no unbounded global capability;
- no untraceable revocation;
- no erased denials;
- no erased restrictions;
- no erased challenges;
- no simulation treated as canonical state;
- no authority consumption of unexplained capability;
- same inputs produce same outputs.

---

## 24. Security Implications

Capability errors are security errors. A malformed CapabilityEngine can create unauthorized access, illegitimate authority, invalid decisions, and protocol state corruption.

### 24.1 Capability Escalation

Capability Escalation occurs when a subject obtains a capability beyond what standing, policy, delegation, scope, constraints, risk, or governance permits. The CapabilityEngine MUST prevent escalation by enforcing narrowest applicable scope and mandatory constraints.

### 24.2 Zombie Capabilities

Zombie Capabilities are capabilities that remain active after their standing, policy, delegation, governance, or risk basis no longer supports them. The CapabilityEngine MUST re-evaluate and revoke, restrict, suspend, or supersede capabilities when upstream basis changes.

### 24.3 Orphan Capabilities

Orphan Capabilities are capabilities without traceable lineage to StandingSnapshot, PolicyVersion, CapabilityScope, CapabilityConstraints, and GovernanceContext. Orphan capabilities MUST NOT be treated as conformant and MUST NOT be consumed by Authority.

### 24.4 Delegation Abuse

Delegation Abuse occurs when delegation is used to bypass eligibility, transfer standing, launder scope, hide accountability, evade revocation, or create authority. The CapabilityEngine MUST evaluate delegation explicitly and enforce delegation boundaries.

### 24.5 Policy Drift

Policy Drift occurs when capability outcomes continue under obsolete, retired, conflicting, or unrecognized policies. The CapabilityEngine MUST bind decisions to PolicyVersion and MUST apply policy revalidation when required.

### 24.6 Governance Abuse

Governance Abuse occurs when governance powers are exercised outside Recognized Authority, without scope, without traceability, or through self-approval. The CapabilityEngine MUST require GovernanceContext and MUST NOT treat administrative control as governance legitimacy.

---

## 25. Canonical Concepts

The following concepts are canonical for the Capability Engine.

### 25.1 CapabilityEngine

A deterministic policy-governed evaluation function that consumes Standing, Policy, Delegation, and Context and produces CapabilityDecisions.

### 25.2 CapabilityDecision

The output of the CapabilityEngine determining whether a capability is granted, denied, restricted, suspended, revoked, or superseded.

### 25.3 CapabilityEvaluation

The traceable evaluation process by which the CapabilityEngine evaluates request, eligibility, constraints, scope, delegation, risk, policy, governance, and challenge state.

### 25.4 CapabilityEligibility

The finding that a CapabilitySubject satisfies or fails baseline standing, policy, subject, delegation, and governance preconditions for a requested CapabilityType.

### 25.5 CapabilityConstraint

A policy-governed condition that limits capability existence or exercise, including temporal, monetary, risk, jurisdictional, role, policy, standing, delegation, governance, challenge, or operational constraints.

### 25.6 CapabilityScope

The bounded operational domain within which a capability may exist and be exercised.

### 25.7 CapabilityGrant

A traceable record that a CapabilitySubject holds a bounded capability under defined scope, constraints, standing basis, policy basis, delegation basis when applicable, governance basis, lifecycle state, and revocation rules.

### 25.8 CapabilityDenial

A traceable record that a requested capability was not granted because required eligibility, standing, policy, scope, constraints, delegation, risk, governance, challenge, evidence, claim, or context requirements failed or could not be proven.

### 25.9 CapabilityRestriction

A traceable narrowing of a requested or existing capability through reduced scope, additional constraints, supervision requirements, shorter duration, lower thresholds, or other policy-governed limits.

### 25.10 CapabilityRevocation

A traceable termination of a CapabilityGrant before scheduled expiry due to standing degradation, policy change, governance action, delegation revocation, evidence invalidation, claim revocation, successful challenge, risk escalation, fraud, violation, or expiry cascade.

### 25.11 CapabilitySupersession

A traceable replacement of an existing CapabilityGrant with a superseding grant, restriction, denial, suspension, or revocation state under updated scope, constraints, policy, standing, delegation, risk, or governance context. Supersession preserves both the superseded record and the superseding record.

### 25.12 CapabilitySuspension

A traceable lifecycle event that temporarily disables exercise of an existing CapabilityGrant pending review, standing recomputation, challenge resolution, risk remediation, policy clarification, governance process, or other policy-governed lifecycle event. Suspension preserves historical capability state and is not revocation.

---

## 26. Implementation Guidance

This RFC is constitutional and implementation-neutral.

A conformant implementation SHOULD:

- treat the CapabilityEngine as a protocol evaluation layer, not as an access-control shortcut;
- preserve explicit references to StandingSnapshot, PolicyVersion, DelegationContext, RiskContext, OperationalContext, and GovernanceContext;
- preserve both grants and denials;
- preserve restrictions, suspensions, revocations, supersessions, and challenges as lifecycle events;
- re-evaluate dependent capabilities when upstream standing, policy, delegation, risk, governance, evidence, claim, or challenge state changes;
- fail closed when required capability basis cannot be proven;
- support deterministic historical reconstruction;
- support human, machine, and audit explanations;
- maintain separation between CapabilityDecision, Authority recognition, and Recognized Decision.

A conformant implementation MUST NOT:

- expose capability as an ungoverned administrative toggle;
- silently create capabilities from standing labels;
- silently expand scope;
- use unversioned policy for consequential capability decisions;
- allow hidden overrides to affect capability state;
- consume simulation output as canonical capability state;
- allow authority or decisions to consume orphan or unexplained capabilities.

---

## 27. Future Dependencies

The Capability Engine depends on and anticipates further definition in related RFCs.

### 27.1 Standing Algorithms

Standing Algorithms define how StandingSnapshots are computed. The CapabilityEngine consumes StandingSnapshots but MUST NOT replace the Standing Engine or standing algorithms.

### 27.2 Authority Model

The Authority Model consumes CapabilityGrants and determines recognized legitimacy. Capability enables action; authority legitimizes action. The CapabilityEngine MUST preserve sufficient traceability for Authority recognition.

### 27.3 Decision Framework

The Decision Framework consumes recognized authority and produces protocol-recognized outcomes. CapabilityDecision is not a Recognized Decision unless separately produced under recognized authority according to the Decision Framework.

### 27.4 Appeals Framework

A future Appeals Framework SHOULD define appeal paths for CapabilityDenial, CapabilityRestriction, CapabilitySuspension, CapabilityRevocation, CapabilitySupersession, and challenge outcomes.

### 27.5 Governance Actions

Future governance specifications SHOULD define canonical governance actions affecting CapabilityTypes, PolicyVersions, review procedures, challenge processes, revocation procedures, and high-risk capability approvals.

---

## 28. Acceptance Criteria

A Capability Engine implementation conforms to this RFC only if it satisfies all of the following criteria:

1. It consumes StandingSnapshot, PolicyVersion, DelegationContext when applicable, RiskContext, OperationalContext, and GovernanceContext.
2. It produces CapabilityDecisions using the canonical outcomes Grant, Deny, Restrict, Suspend, Revoke, and Supersede.
3. It preserves the distinction between standing, delegation, capability, authority, and decision.
4. It never directly converts standing into capability without policy-governed evaluation.
5. It never treats delegation as standing transfer or authority creation.
6. It never grants unscoped or unbounded capability.
7. It records or references CapabilityScope and CapabilityConstraints for every grant and restriction.
8. It records CapabilityDenial as a first-class explainable result.
9. It records CapabilityRevocation as a first-class lifecycle event and preserves history.
10. It evaluates policy using a traceable PolicyVersion.
11. It evaluates governance using recognized GovernanceContext.
12. It evaluates risk when policy requires risk evaluation.
13. It evaluates delegation boundaries when delegation affects capability.
14. It supports capability challenge handling according to policy.
15. It supports revocation propagation to dependent delegations, authority recognitions, pending decisions, simulations, and audit views according to policy.
16. It supports reverse traceability from CapabilityDecision to standing, claims, evidence, policy, delegation, risk, operational context, and governance.
17. It supports forward traceability from CapabilityDecision to capabilities, authority recognitions, decisions, delegations, challenges, reviews, and lifecycle events.
18. It provides human, machine, and audit explanations for grants, denials, restrictions, suspensions, revocations, and supersessions.
19. It satisfies the deterministic rule: same inputs produce same outputs.
20. It treats orphan, unexplained, hidden, unbounded, or ungoverned capabilities as non-conformant and unavailable for Authority consumption.
