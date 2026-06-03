# RFC-005-H5 — Delegated Standing

| Field | Value |
|---|---|
| RFC Number | 005-H5 |
| Title | Delegated Standing |
| Status | Draft |
| Category | Core Protocol Extension |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-03 |
| Supersedes | — |
| Related | RFC-004 Evidence Layer v1.0, RFC-005 AOC Claims Framework, RFC-005-H1 Standing Traceability, RFC-005-H2 Standing Engine, RFC-005-H3 Standing Governance, RFC-005-H4 Capability Mapping |

---

## Abstract

This document defines Delegated Standing for the AOC Protocol. Delegated Standing specifies how one subject may extend limited standing-derived influence, capability eligibility, or policy-permitted authority to another subject without transferring ownership of standing, rewriting evidence, obscuring accountability, or bypassing governance.

Delegation is a bounded authorization relationship. It is not an ownership transfer, reputation transfer, evidence rewrite, hidden privilege grant, or unrestricted authority inheritance. A conformant delegation MUST preserve traceability, accountability, revocability, governance, scope, policy conformance, and explainability.

Delegated Standing extends RFC-004, RFC-005, RFC-005-H1, RFC-005-H2, RFC-005-H3, and RFC-005-H4 by placing Delegation between Standing and Capabilities in the constitutional chain:

```text
Evidence → Claims → Standing → Delegation → Capabilities → Authority → Decisions
```

Delegation modifies eligibility. Delegation does not rewrite evidence.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Delegation Definition](#3-delegation-definition)
4. [Delegation Principles](#4-delegation-principles)
5. [Delegation Types](#5-delegation-types)
6. [Delegation Subject Model](#6-delegation-subject-model)
7. [Delegation Scope](#7-delegation-scope)
8. [Delegation Constraints](#8-delegation-constraints)
9. [Delegation Eligibility](#9-delegation-eligibility)
10. [Delegation Lifecycle](#10-delegation-lifecycle)
11. [Delegation Traceability](#11-delegation-traceability)
12. [Delegation Dependency Graph](#12-delegation-dependency-graph)
13. [Standing Delegation](#13-standing-delegation)
14. [Capability Delegation](#14-capability-delegation)
15. [Authority Delegation](#15-authority-delegation)
16. [AI Delegation](#16-ai-delegation)
17. [Delegation Revocation](#17-delegation-revocation)
18. [Delegation Challenges](#18-delegation-challenges)
19. [Delegation Governance](#19-delegation-governance)
20. [Delegation Guarantees](#20-delegation-guarantees)
21. [Security Implications](#21-security-implications)
22. [Implementation Guidance](#22-implementation-guidance)
23. [Future RFC Dependencies](#23-future-rfc-dependencies)
24. [Acceptance Criteria](#24-acceptance-criteria)

---

## 1. Executive Summary

Delegated Standing allows one subject to extend limited standing-derived influence to another subject under policy. It exists because consequential systems often require a subject that has earned standing, received capability, or obtained authority to empower another subject to act within a narrower operational context.

Delegation MUST remain:

- **Bounded** — limited by scope, time, purpose, policy, risk, and authority;
- **Traceable** — linked to the delegator, delegatee, standing, capability, authority, policy, evidence lineage, and lifecycle events;
- **Auditable** — reconstructable through a complete dependency graph and historical record;
- **Revocable** — terminable by expiration, governance action, policy change, challenge, risk escalation, or upstream degradation;
- **Explainable** — capable of answering why the delegation exists and why a delegated action was allowed, denied, restricted, suspended, or revoked.

The constitutional position of delegation is:

```text
Evidence
  ↓
Claims
  ↓
Standing
  ↓
Delegation        ← This RFC
  ↓
Capabilities
  ↓
Authority
  ↓
Decisions
```

Delegation exists between Standing and Capabilities because delegation may alter whether a subject is eligible to receive or exercise a capability. Delegation MUST NOT rewrite evidence, claims, attestations, verification results, standing snapshots, standing deltas, or standing lineage. Delegation may extend influence; it does not make the delegatee the subject who earned the original standing.

This RFC explicitly answers:

| Question | Protocol answer |
|---|---|
| What is delegation? | A bounded transfer of standing-derived influence under policy. |
| Why does delegation exist? | To allow practical, governed extension of standing-derived eligibility, capabilities, or authority without erasing accountability. |
| Can standing be delegated? | Standing itself is generally not transferred; limited standing influence MAY be delegated under policy. |
| Can capability be delegated? | Yes, when capability policy permits, and only within bounded scope. |
| Can authority be delegated? | Yes, when governance and authority policy permit, and only with explicit boundaries and revocation. |
| Who may delegate? | Only subjects that satisfy delegation eligibility requirements. |
| Who may receive delegation? | Policy-recognized subjects that satisfy recipient eligibility, consent, and scope constraints. |
| How is delegation constrained? | By temporal, monetary, policy, risk, standing, governance, jurisdictional, and scope constraints. |
| How is delegation revoked? | Through expiration, delegator action, governance action, challenge outcome, policy change, upstream revocation, or risk escalation. |
| How is delegation traced? | Through mandatory linkage to delegator, delegatee, scope, policy, authority basis, lifecycle, expiration, and upstream standing/capability/authority. |
| How is delegation governed? | Through policy-recognized governance processes that approve delegation frameworks, types, eligibility rules, challenges, and revocations. |

---

## 2. Problem Statement

Many real-world systems require delegation. A constitutional protocol that does not support delegation forces every consequential action to be performed only by the subject that originally earned standing, received a capability, or held authority. That model is often impractical.

Examples include:

- a manager delegates limited approval authority to a deputy during a defined period;
- an organization delegates operational authority to a vendor for a specific project;
- a professional delegates limited review or execution rights to a supervised associate;
- an AI supervisor delegates execution rights to an agent within a bounded task, budget, and risk tier;
- a governance body delegates review authority to a committee for a defined challenge class.

Without delegation, systems become impractical. Work queues block on unavailable principals, organizations cannot operate through teams, and supervised execution models cannot scale.

Without controls, systems become dangerous. Delegation can be abused to launder authority, bypass standing requirements, escalate privilege, hide accountability, preserve expired access, or obscure who was responsible for a consequential decision.

The protocol problem is therefore not whether delegation should exist. Delegation exists because complex systems require it. The protocol problem is how delegation can exist without breaking the AOC trust and authority chain.

Delegated Standing solves this problem by requiring delegation to be explicit, bounded, traceable, accountable, revocable, policy-conformant, and governance-aware.

---

## 3. Delegation Definition

**Delegation** is a bounded transfer of standing-derived influence under policy.

Delegation is not evidence. Delegation is not a claim. Delegation is not standing. Delegation is not capability by itself. Delegation is not authority by itself. Delegation is a policy-governed relationship that may modify eligibility for capabilities, authority recognition, review participation, execution, or governance action.

A delegation relationship MUST identify the following canonical roles and boundaries.

| Concept | Definition |
|---|---|
| Delegator | The subject that extends limited standing-derived influence, capability eligibility, capability exercise, or authority-recognized action to another subject. |
| Delegatee | The subject that receives the delegated influence, eligibility, capability, or authority-bound action surface. |
| Delegation Context | The operational, organizational, jurisdictional, temporal, risk, purpose, policy, and authority setting in which delegation is evaluated. |
| Delegation Scope | The explicit boundary of what is delegated, where it applies, for whom it applies, and under what limits it may be exercised. |
| Delegation Constraints | The temporal, monetary, policy, risk, standing, governance, jurisdictional, consent, and revocation conditions that restrict the delegation. |

A conformant delegation MUST NOT be implicit. A system MUST NOT infer delegation solely from employment, relationship, role title, group membership, credential possession, identity provider membership, or prior access unless a policy-recognized delegation record exists and is traceable.

### 3.1 Standing transfer vs. standing delegation

**Standing Transfer** means treating standing earned by one subject as if it became the standing of another subject. Standing Transfer is not the preferred protocol model and SHOULD be avoided except where a future RFC explicitly defines a lawful succession, merger, inheritance, or identity-continuity process.

**Standing Delegation** means allowing another subject to exercise limited standing-derived influence under policy while preserving the original standing owner, delegator, delegatee, scope, constraints, and accountability record.

These are not the same thing. The protocol strongly prefers Delegation over Transfer because delegation preserves lineage, accountability, revocation, and explainability. A delegatee MUST NOT be represented as having earned the delegator's standing merely because a delegation exists.

---

## 4. Delegation Principles

Delegation is constitutional only when it preserves the following principles.

| Principle | Requirement |
|---|---|
| Traceability | Every delegation MUST identify who earned the relevant standing, who delegated, who received, what was delegated, why delegation exists, when it was created, when it expires, and under what authority and policy it operates. |
| Accountability | Delegation MUST preserve accountability for both delegator and delegatee. The delegator remains accountable for issuing the delegation. The delegatee is accountable for actions taken under the delegation. |
| Revocability | Delegation MUST be revocable. A delegation that cannot expire, be suspended, be restricted, or be revoked is not conformant. |
| Bounded Scope | Delegation MUST define explicit boundaries. Delegation MUST NOT be global, unlimited, or silently broader than the delegator's own standing-derived eligibility, capability, or authority. |
| Explicit Consent | Delegation SHOULD require explicit acceptance by the delegatee when the delegation imposes duties, obligations, liability, review responsibility, governance responsibility, or operational risk. Policy MAY define exceptional emergency delegation models, but they MUST remain traceable and reviewable. |
| Policy Conformance | Delegation MUST be permitted by applicable policy. A delegation created outside policy MUST NOT be used to grant capability, authority, governance power, or decision validity. |
| Non-Repudiation | Delegation lifecycle events MUST be attributable. A delegator MUST NOT be able to deny a valid delegation event, and a delegatee MUST NOT be able to deny valid acceptance or exercise events, subject to challenge and correction processes. |

Delegation MUST preserve traceability. Delegation MUST preserve accountability. Delegation MUST preserve revocability. Delegation MUST preserve governance.

---

## 5. Delegation Types

The following canonical Delegation Types are defined. Implementations MAY introduce additional delegation types. Domain-specific types MUST preserve these semantics and MUST NOT redefine canonical types in a conflicting way.

| Delegation Type | Definition |
|---|---|
| Standing Delegation | Delegation of limited standing-derived influence without transferring standing ownership or rewriting evidence. |
| Capability Delegation | Delegation of a policy-permitted capability or capability eligibility within the delegator's scope and constraints. |
| Authority Delegation | Delegation of authority-recognized action eligibility only when governance and authority policy permit. |
| Review Delegation | Delegation of review responsibility for claims, standing, capability, challenges, governance actions, or decision records. |
| Governance Delegation | Delegation of governance participation, committee action, approval, escalation, or oversight responsibility under a governance framework. |
| Execution Delegation | Delegation of execution rights for a bounded task, process, workflow, agent action, or operational function. |
| AI Delegation | Delegation involving an AI system as delegator, delegatee, supervisor, executor, reviewer, or policy-governed agent. |
| Operational Delegation | Delegation of operational authority or responsibility to a team, vendor, service, project, or other operational subject. |

Future delegation types are extensible. A new type MUST define its subject model, scope rules, constraints, lifecycle, traceability requirements, revocation triggers, challenge process, and governance authority.

---

## 6. Delegation Subject Model

Delegation applies to protocol subjects. A subject MAY delegate only when policy recognizes that subject as eligible to delegate in the applicable context. A subject MAY receive delegation only when policy recognizes that subject as eligible to receive and exercise the delegated relationship.

Potential delegators and delegatees include:

- Person;
- Organization;
- Team;
- Vendor;
- Agent;
- Service;
- Project.

Additional subject types MAY be recognized by future RFCs or domain policy, provided they preserve identity, accountability, traceability, and governance requirements.

A Delegator MUST satisfy delegation eligibility. A Delegatee MUST satisfy recipient eligibility. Recipient eligibility MAY require identity assurance, standing thresholds, capability prerequisites, authority recognition, governance approval, consent, training status, conflict-of-interest review, or risk-tier review.

Delegation MUST NOT erase subject boundaries. If an organization delegates operational authority to a vendor, the vendor does not become the organization. If a professional delegates review rights to an associate, the associate does not inherit the professional's standing. If a human delegates execution to an AI agent, the AI agent does not become the human principal.

---

## 7. Delegation Scope

Delegation is never global.

Every delegation MUST define an explicit DelegationScope. A delegation without scope is not conformant. The scope MUST be narrow enough to permit enforcement, audit, explanation, challenge, and revocation.

Delegation scope MAY include:

| Scope Type | Description |
|---|---|
| Project-specific | Applies only to a named project, program, workflow, initiative, or bounded operational unit. |
| Time-bound | Applies only during a defined start and end period, or until a specific event occurs. |
| Capability-bound | Applies only to one or more explicitly identified capabilities, capability types, or capability grants. |
| Jurisdiction-bound | Applies only within specified legal, regulatory, organizational, or protocol jurisdictions. |
| Monetary-bound | Applies only below a monetary, budget, transaction, exposure, or resource threshold. |
| Risk-bound | Applies only within defined risk tiers, risk classes, safety envelopes, or escalation thresholds. |
| Organization-bound | Applies only inside a specified organization, unit, consortium, governance body, or relationship graph. |

A delegatee MUST NOT exercise delegated influence outside the DelegationScope. A capability or authority derived from delegation MUST NOT exceed the scope of the underlying delegation or the delegator's own scope.

---

## 8. Delegation Constraints

Delegation constraints are enforceable limitations on a delegation relationship. A conformant delegation MUST record and evaluate applicable constraints before delegated influence can affect capability, authority, governance, review, execution, or decisions.

| Constraint Type | Requirement |
|---|---|
| Temporal constraints | Delegation MUST define validity time, expiration, renewal rules, and conditions for suspension or early revocation. |
| Monetary constraints | Delegation MAY define spending, approval, liability, transaction, value-at-risk, or resource thresholds. |
| Policy constraints | Delegation MUST identify applicable policy versions and MUST fail closed when required policy is missing, expired, superseded, or invalid. |
| Risk constraints | Delegation MUST define risk tiers or escalation thresholds when the delegated action affects rights, resources, safety, compliance, governance, or autonomous execution. |
| Standing constraints | Delegation MAY require minimum standing states, confidence levels, recency, challenge state, or standing history for the delegator, delegatee, or both. |
| Governance constraints | Delegation MAY require approval, review, quorum, registry inclusion, committee action, oversight, or audit by policy-recognized governance bodies. |
| Jurisdiction constraints | Delegation MAY be limited by legal, regulatory, organizational, contractual, geographic, or protocol jurisdiction. |

A delegation MUST NOT be treated as valid merely because it exists. It must remain valid under current constraints.

---

## 9. Delegation Eligibility

Not everyone with standing can delegate.

Delegation eligibility defines who may delegate, what they may delegate, to whom they may delegate, and under what conditions. Eligibility MUST be determined by policy, standing state, capability state, authority state, governance rules, and context.

Requirements MAY include:

- Standing thresholds for the delegator;
- Standing thresholds for the delegatee;
- Capability requirements for the delegator;
- Capability requirements for the delegatee;
- Authority requirements for the delegator;
- Governance approval for the delegation type, scope, or risk tier;
- Conflict-of-interest review;
- consent or acceptance by the delegatee;
- recency requirements for evidence, claims, verification, or standing;
- absence of active challenges, suspensions, restrictions, or revocations;
- policy recognition that the relevant delegation type is permitted.

A subject MAY delegate only what policy permits that subject to delegate. A delegator MUST NOT delegate broader standing-derived influence, capability, or authority than the delegator currently holds or is permitted to extend. A delegation MUST fail closed if delegator eligibility cannot be proven.

A delegatee MAY receive delegation only when policy permits that delegatee to receive it. A delegation MUST fail closed if delegatee eligibility cannot be proven.

---

## 10. Delegation Lifecycle

Delegation has a lifecycle. A conformant implementation MUST represent delegation lifecycle state explicitly and MUST preserve historical lifecycle events for audit.

| State | Definition |
|---|---|
| Proposed | A delegation has been requested or drafted but is not yet eligible for exercise. |
| Pending Acceptance | A delegation has been authorized by the delegator or governance process but requires delegatee acceptance before activation. |
| Active | A delegation is currently valid, within scope, within constraints, accepted if required, and eligible for use. |
| Restricted | A delegation remains valid only under narrower constraints, reduced scope, heightened review, or temporary limitation. |
| Suspended | A delegation is temporarily unavailable for exercise pending review, challenge, policy update, or risk resolution. |
| Expired | A delegation ended because its time window, event condition, or validity period elapsed. |
| Revoked | A delegation was terminated before scheduled expiry by an authorized revocation path. |
| Superseded | A delegation was replaced by a newer delegation, policy, authority decision, or governance action. |

Lifecycle transitions MUST be traceable. A lifecycle transition MUST identify the prior state, new state, triggering event, actor or authority responsible for the transition, policy basis, timestamp, and downstream effects.

---

## 11. Delegation Traceability

Delegation traceability extends RFC-005-H1 Standing Traceability. Every delegation MUST answer:

- Who delegated?
- Who received?
- What was delegated?
- Why was it delegated?
- When was it created?
- When did it become active?
- Under what authority was it created?
- Under what policy was it created?
- What standing, capability, or authority supports the delegation?
- What evidence, claims, attestations, verification results, and standing lineage support the delegator's eligibility?
- What recipient eligibility supports the delegatee?
- What constraints apply?
- What scope applies?
- When does it expire?
- How may it be challenged?
- How may it be revoked?
- What decisions, capabilities, authority recognitions, or governance actions depend on it?

Delegation traceability MUST preserve the distinction between:

- the subject that earned standing;
- the subject that delegated standing-derived influence;
- the subject that received delegated influence;
- the policy that permitted delegation;
- the authority or governance process that recognized delegation;
- the downstream decisions taken under delegation.

No delegated standing relationship may obscure who earned standing, who delegated standing-derived influence, who received it, why delegation exists, or when delegation expires.

---

## 12. Delegation Dependency Graph

A delegation dependency graph MUST make upstream and downstream dependencies inspectable.

The expanded constitutional graph is:

```text
Evidence
  ↓
Claims
  ↓
Standing
  ↓
Delegation
  ↓
Capabilities
  ↓
Authority
  ↓
Decisions
```

Delegation also depends on and interacts with:

```text
Policies ───────┐
Governance ─────┤
Challenges ─────┤
Evidence ───────┤
Claims ─────────┤
Standing ───────┼→ Delegation → Capabilities → Authority → Decisions
Capabilities ───┤
Authority ──────┘
```

A conformant Delegation Dependency Graph SHOULD include:

| Dependency | Required trace |
|---|---|
| Evidence | Evidence supporting standing, capability, authority, eligibility, policy, consent, acceptance, revocation, and challenge records. |
| Claims | Claims supporting standing or delegated eligibility. |
| Standing | Standing snapshots, deltas, confidence, states, contexts, challenges, and lineage relevant to delegator and delegatee. |
| Delegation | Delegation record, type, scope, constraints, lifecycle state, acceptance, and revocation terms. |
| Capabilities | Capability grants, denials, restrictions, simulations, revocations, and delegated capability outputs that depend on delegation. |
| Authority | Authority recognition, authority boundary, governance basis, and authority revocation tied to delegation. |
| Decisions | Consequential actions taken under delegated capability or authority. |
| Challenges | Active, resolved, rejected, or escalated challenges affecting delegator, delegatee, delegation, capability, authority, or decision. |
| Policies | Versioned policies permitting or constraining delegation. |
| Governance | Governance approvals, review bodies, registry entries, oversight actions, and emergency interventions. |

A downstream capability, authority recognition, or decision MUST be able to identify whether it depended on delegation.

---

## 13. Standing Delegation

Standing itself is generally not transferred.

Standing is an evidence-derived, policy-evaluated interpretation of a subject. The evidence about one subject does not become evidence about another subject because the first subject delegates influence. Therefore, a delegation MUST NOT rewrite standing lineage, clone standing snapshots, assign the delegator's standing to the delegatee, or represent the delegatee as having earned the delegator's standing.

Standing Delegation means that limited standing-derived influence MAY be used to support the delegatee's eligibility within a defined scope. It may allow the delegatee to perform a task, represent a principal, receive a capability, participate in review, or exercise supervised authority, but only under policy.

Examples include:

- **Mentorship** — a high-standing professional sponsors a trainee for limited supervised review within a defined domain;
- **Professional sponsorship** — a credentialed subject supports another subject's eligibility for bounded participation while preserving the sponsor's accountability;
- **Representative authority** — an organization permits a representative to act on its behalf within a specific transaction class;
- **Trusted operator model** — a trusted operator delegates limited operational execution to another subject while retaining delegator accountability and governance visibility.

Standing Delegation MUST be explainable as delegation, not transfer. A decision record MUST NOT say that the delegatee had the delegator's standing. It MUST say that the delegatee acted under a specific delegation rooted in the delegator's standing-derived eligibility and permitted by policy.

---

## 14. Capability Delegation

Capabilities are more naturally delegated than standing because capabilities are bounded permissions or action surfaces. RFC-005-H4 defines Capability Mapping as the policy-governed process by which standing, policy, and context produce capabilities. This RFC extends that model by defining delegation constraints that apply before delegated capabilities can be exercised.

Capability Delegation MAY include:

- approval rights;
- execution rights;
- review rights;
- operational rights;
- claim issuance capability;
- verification capability;
- attestation capability;
- governance participation capability.

A Capability Delegation MUST:

- be permitted by capability policy;
- identify the originating CapabilityGrant or capability eligibility basis;
- remain within the delegator's own capability scope;
- define temporal, scope, risk, and revocation constraints;
- identify whether sub-delegation is prohibited or permitted;
- preserve traceability to standing and policy inputs;
- be revoked or restricted when the originating capability is revoked, restricted, suspended, expired, or superseded.

Capability Delegation MUST NOT grant authority by itself. Authority recognition remains a distinct layer.

---

## 15. Authority Delegation

Authority may be delegated only when policy permits.

Authority Delegation is the policy-governed extension of recognized authority eligibility from a delegator to a delegatee within explicit boundaries. It is valid only when the applicable governance framework, authority policy, and delegation policy permit the delegator to delegate authority and permit the delegatee to receive it.

Authority Delegation MUST define:

- the authority basis of the delegator;
- the authority boundary being delegated;
- the decisions or decision classes covered;
- the applicable governance approval or authority recognition process;
- temporal limits;
- monetary, risk, jurisdictional, organizational, or operational limits;
- revocation rules;
- escalation paths;
- audit and challenge rules.

### 15.1 Authority inheritance

Authority inheritance MUST NOT be assumed. A delegatee does not inherit all authority held by the delegator. A delegatee MAY exercise only the authority boundary explicitly delegated and recognized under policy.

### 15.2 Authority boundaries

Authority boundaries MUST be narrower than or equal to the delegator's authority. A delegator MUST NOT delegate authority that the delegator does not hold, that policy does not permit to be delegated, or that governance has restricted.

### 15.3 Authority revocation

Authority Delegation MUST be revocable. Revocation of the delegator's underlying authority MUST trigger review, suspension, restriction, or revocation of dependent delegated authority. Revocation MUST propagate to dependent capabilities and pending decisions where required by policy.

---

## 16. AI Delegation

AI Delegation covers delegation relationships in which an AI system acts as delegatee, delegator, supervisor, executor, reviewer, or participant in a delegated action path.

AI Delegation MUST preserve the same constitutional requirements as human and organizational delegation, and SHOULD apply heightened safety controls where autonomous execution, resource access, external effects, or rights-affecting decisions are involved.

### 16.1 Human-to-AI delegation

A human or organization MAY delegate execution, analysis, review support, drafting, monitoring, or operational tasks to an AI system only when policy permits. The delegation MUST define the AI system identity, task scope, constraints, supervision requirements, escalation triggers, logging requirements, and revocation path.

Human-to-AI delegation MUST NOT obscure the responsible human, organization, governance body, or authority chain.

### 16.2 AI-to-AI delegation

AI-to-AI delegation MAY be permitted only when policy explicitly authorizes sub-delegation or agent coordination. AI-to-AI delegation MUST identify the originating delegator, intermediary AI system, receiving AI system, task scope, model or agent identity where applicable, constraints, and governance basis.

AI-to-AI delegation MUST NOT create an unbounded delegation chain. Further delegation MUST be prohibited unless explicitly permitted by policy.

### 16.3 Supervised delegation

Supervised delegation requires a policy-recognized supervisor. The supervisor may be a person, organization, governance body, or higher-assurance agent process recognized by policy. Supervision requirements MAY include pre-approval, human-in-the-loop review, post-action audit, rate limits, risk thresholds, or mandatory escalation.

### 16.4 Autonomous delegation

Autonomous delegation is delegation that allows an AI system to exercise delegated capability or authority without case-by-case human approval. Autonomous delegation MUST be narrowly scoped, risk-bounded, time-bounded, observable, revocable, and governed by explicit policy. Rights-affecting, high-risk, financial, safety-critical, or governance-critical autonomous delegation SHOULD require heightened review or prior governance approval.

### 16.5 AI safety requirements

AI Delegation MUST address:

- identity and accountability for the AI system;
- provenance of delegated task instructions;
- limits on tools, data, resources, and external actions;
- prevention of prompt-based or instruction-based scope expansion;
- audit logs sufficient to reconstruct delegated action paths;
- challenge and override mechanisms;
- revocation propagation to active agent sessions, tasks, capabilities, and pending decisions;
- prohibition of hidden or self-created authority.

An AI system MUST NOT self-delegate standing-derived influence, capability, or authority unless a policy-recognized delegation framework explicitly permits autonomous delegation and records the event.

---

## 17. Delegation Revocation

Delegation must always be revocable.

Delegation Revocation is the termination of a delegation before scheduled expiry or the formal recognition that the delegation is no longer valid. Revocation MUST preserve historical records. Revocation is not erasure.

Revocation triggers include:

| Trigger | Description |
|---|---|
| Standing degradation | Delegator or delegatee standing falls below required thresholds, enters a restricted state, loses confidence, becomes stale, or becomes materially challenged. |
| Capability loss | The originating capability is revoked, restricted, suspended, expired, superseded, or no longer satisfies policy. |
| Policy change | Applicable policy changes so that the delegation type, scope, delegatee, delegator, or authority basis is no longer permitted. |
| Governance action | A policy-recognized governance body, reviewer, authority, administrator, or oversight process revokes, restricts, or suspends the delegation. |
| Expiration | The delegation reaches its end time, event boundary, task completion, renewal deadline, or validity limit. |
| Challenge | A delegation challenge results in revocation, restriction, or suspension. |
| Risk escalation | Risk conditions exceed delegated limits or trigger mandatory escalation. |

A DelegationRevocationEvent MUST record:

- delegation identifier;
- revocation trigger;
- actor or authority initiating revocation;
- policy basis;
- timestamp;
- prior lifecycle state;
- new lifecycle state;
- affected capabilities;
- affected authority recognitions;
- affected decisions or pending decisions;
- propagation requirements;
- appeal or challenge path if policy permits.

Revocation MUST propagate to dependent capabilities, authority recognitions, active execution rights, AI sessions, governance assignments, and pending decisions where required by policy.

---

## 18. Delegation Challenges

A Delegation Challenge is a formal challenge to the legitimacy, scope, constraints, policy compliance, lifecycle state, authority basis, or exercise of a delegation.

Policy MUST define who may challenge delegation. Eligible challengers MAY include:

- delegator;
- delegatee;
- affected subject;
- affected party;
- auditor;
- governance body;
- authority holder;
- issuer;
- verifier;
- reviewer;
- compliance officer;
- policy-recognized agent or monitor.

A Delegation Challenge MAY challenge:

| Challenge target | Example question |
|---|---|
| Delegator legitimacy | Was the delegator eligible to delegate? |
| Delegatee legitimacy | Was the delegatee eligible to receive or exercise delegation? |
| Scope | Did the delegation exceed its permitted project, time, capability, jurisdiction, monetary, risk, or organization boundary? |
| Policy compliance | Was the delegation permitted by applicable policy at creation and at exercise time? |
| Authority basis | Did the delegator hold delegable authority? |
| Consent | Was required delegatee acceptance obtained? |
| Lifecycle state | Was the delegation active, restricted, suspended, expired, revoked, or superseded at the relevant time? |
| Exercise | Did a delegated action remain within scope and constraints? |

Delegation challenges MUST be traceable. While a challenge is pending, policy MAY require delegation suspension, restriction, heightened review, or continued operation with risk notation. Challenge outcomes MUST identify whether the delegation is confirmed, restricted, suspended, revoked, corrected, or superseded.

---

## 19. Delegation Governance

Delegation Governance defines who may define, approve, modify, challenge, review, suspend, revoke, or retire delegation frameworks, delegation types, policies, registries, and high-risk delegation relationships.

Delegation Governance extends the governance expectations of RFC-005-H3 Standing Governance and the standing governance requirements introduced by RFC-005-H2. Governance actions that affect delegation MUST be represented as evidence, claim, policy, challenge, review, lifecycle, registry, or authority events with provenance and auditability.

A conformant governance model MUST define:

| Governance question | Requirement |
|---|---|
| Who governs delegation? | Policy-recognized governance bodies, protocol maintainers, delegated standards bodies, domain authorities, enterprise authorities, jurisdictional authorities, or authorized review processes. |
| Who approves delegation frameworks? | Framework approval MUST be performed by governance actors with authority over the affected domain, risk tier, organization, jurisdiction, or protocol scope. |
| Who approves delegation types? | DelegationType definitions MUST be approved by protocol governance or domain governance and MUST preserve canonical semantics. |
| Who approves high-risk delegation? | High-risk, AI, autonomous, financial, rights-affecting, governance, or cross-jurisdictional delegation SHOULD require explicit governance approval. |
| Who reviews challenges? | Challenge review MUST be performed by policy-recognized reviewers, governance bodies, authorities, auditors, or delegated review processes with explicit authority. |
| Who may revoke delegation? | Revocation authority MUST be defined by policy and MAY include delegator, governance body, authority holder, auditor, compliance body, or automated policy process. |

Delegation Governance MUST NOT permit hidden delegation. Governance MUST NOT permit unbounded delegation. Governance MUST NOT permit delegation frameworks that erase accountability or make revocation impossible.

---

## 20. Delegation Guarantees

Conformant delegation guarantees the following protocol properties:

- no hidden delegation;
- no delegation without traceability;
- no delegation without accountability;
- no delegation without revocation;
- no delegation without scope;
- no delegation without policy;
- no orphan delegation;
- no delegation that rewrites evidence;
- no delegation that transfers standing ownership by implication;
- no delegation that silently expands capability;
- no delegation that silently grants authority;
- no delegation that obscures who earned standing;
- no delegation that obscures who delegated;
- no delegation that obscures who received;
- no delegation that obscures why delegation exists;
- no delegation that obscures when delegation expires.

An orphan delegation is a delegation that cannot be traced to a valid delegator, delegatee, scope, policy, lifecycle state, and authority basis. Orphan delegation MUST NOT be used to derive capability, authority, governance power, or decision validity.

---

## 21. Security Implications

Delegation introduces security risks that MUST be addressed by protocol design and governance.

### 21.1 Delegation laundering

Delegation laundering occurs when a subject attempts to convert another subject's standing-derived influence into its own apparent standing. Systems MUST preserve lineage and MUST NOT represent delegated standing influence as earned standing.

### 21.2 Authority laundering

Authority laundering occurs when delegated capability or standing-derived influence is used to imply recognized authority without governance approval. Systems MUST preserve the distinction between delegation, capability, authority, and decision.

### 21.3 Privilege escalation

A delegatee may attempt to exercise broader rights than delegated. Delegation scope and constraints MUST be enforced, and delegated rights MUST NOT exceed the delegator's eligible scope.

### 21.4 Scope abuse

Scope abuse occurs when a delegation valid in one project, time, jurisdiction, risk tier, monetary threshold, or organization is used elsewhere. Delegated exercise MUST evaluate current scope and context.

### 21.5 Zombie delegation

Zombie delegation occurs when expired, revoked, suspended, superseded, or upstream-invalid delegation continues to be honored. Systems MUST evaluate lifecycle state and revocation propagation before accepting delegated action.

### 21.6 AI abuse

AI delegation can amplify errors, execute out-of-scope actions, bypass human review, or create opaque agent chains. AI Delegation MUST be observable, bounded, revocable, challengeable, and governed by explicit policy.

### 21.7 Fake delegation

Fake delegation occurs when a subject asserts delegation without a valid delegation record or authority basis. Systems MUST fail closed when delegation provenance cannot be verified.

### 21.8 Governance bypass

Governance bypass occurs when delegation is used to avoid required approval, quorum, challenge, review, risk escalation, or authority recognition. Delegation policy MUST identify governance requirements and MUST reject nonconforming delegation.

### 21.9 Policy bypass

Policy bypass occurs when delegation is created or exercised outside applicable policy. A delegation MUST identify the policy version that permitted it and MUST be reevaluated when policy changes materially affect its validity.

---

## 22. Implementation Guidance

The following guidance is implementation-neutral. It defines canonical concepts that future implementations SHOULD represent in whatever storage, runtime, graph, event, credential, or policy model they adopt.

| Concept | Guidance |
|---|---|
| Delegation | A traceable lifecycle relationship connecting delegator, delegatee, scope, constraints, policy, authority basis, standing/capability/authority dependencies, and downstream effects. |
| DelegationType | A canonical or domain-specific type defining the semantics of the delegated relationship. |
| Delegator | The subject extending standing-derived influence, capability, or authority-recognized action eligibility. |
| Delegatee | The subject receiving and potentially exercising the delegated relationship. |
| DelegationScope | The explicit project, time, capability, jurisdiction, monetary, risk, organization, purpose, or operational boundary. |
| DelegationConstraint | Enforceable temporal, monetary, policy, risk, standing, governance, jurisdictional, consent, or revocation limitation. |
| DelegationLifecycle | The state model covering Proposed, Pending Acceptance, Active, Restricted, Suspended, Expired, Revoked, and Superseded. |
| DelegationChallenge | A formal challenge to delegation legitimacy, scope, constraints, policy compliance, authority basis, lifecycle state, or exercise. |
| DelegationRevocation | A lifecycle termination event that preserves history and propagates effects to dependent capabilities, authority recognitions, and decisions. |
| DelegationRegistry | A policy-governed registry of delegation records, delegation types, framework approvals, lifecycle state, challenge state, revocation state, and dependency references. |

Implementation guidance:

1. Delegation records should be immutable after creation except through explicit lifecycle events.
2. Delegation lifecycle events should be append-only and auditable.
3. Delegation evaluation should fail closed when policy, scope, lifecycle state, authority basis, or eligibility cannot be verified.
4. Delegation should be represented distinctly from standing, capability, authority, and decision records.
5. Delegation outputs should be explainable both in human-readable form and machine-readable dependency form.
6. Delegation registries should preserve historical records after expiration or revocation.
7. Delegation registries should support reverse traceability from decisions back to delegation and from delegation back to standing, claims, and evidence.
8. Delegation registries should distinguish proposed, accepted, active, restricted, suspended, expired, revoked, and superseded delegation.
9. Delegation records should include explicit sub-delegation permissions or prohibitions.
10. AI Delegation records should include supervisor, safety, risk, and revocation metadata sufficient to reconstruct agent behavior.
11. Governance actions should be recorded as first-class dependency events rather than hidden administrative edits.
12. Simulated delegation outputs should be visibly distinct from active delegation records.
13. Delegation should preserve compatibility with RFC-004 evidence portability, RFC-005 trust-chain boundaries, RFC-005-H1 standing traceability, RFC-005-H2 standing engine outputs, and RFC-005-H4 capability mapping.

This RFC does not require a specific database, API, credential format, graph engine, user interface, or platform-specific delegation model.

---

## 23. Future RFC Dependencies

Delegated Standing depends on and informs future work.

Required or expected future RFCs include:

| Future RFC | Dependency |
|---|---|
| RFC-005-H6 Standing Algorithms | SHOULD define how delegation affects standing computation inputs, standing eligibility checks, confidence impacts, and simulation behavior without rewriting evidence. |
| RFC-005-H8 Authority Model | SHOULD define authority recognition, authority boundaries, authority inheritance limits, authority revocation, and authority delegation semantics in greater detail. |
| RFC-005-H9 Decision Framework | SHOULD define how decisions record delegated capability or authority dependencies and how revocation or challenge affects pending and historical decisions. |

Potential future RFCs include:

| Potential RFC | Purpose |
|---|---|
| RFC-005-H10 Governance Registry | Define registries for governance bodies, delegation frameworks, approval authorities, and policy-recognized reviewers. |
| RFC-005-H11 Governance Challenges | Define challenge workflows for governance actions, delegation approvals, revocations, and registry decisions. |
| RFC-005-H12 Governance Delegation | Define specialized governance delegation semantics, quorum delegation, committee delegation, emergency delegation, and oversight delegation. |
| RFC-005-H13 Delegation Chains | Define constrained delegation chains, sub-delegation limits, chain depth, chain revocation, transitive constraints, and chain explainability. |

Until future RFCs are finalized, implementations MUST treat delegation chains, broad authority delegation, and autonomous AI delegation as high-risk and SHOULD require explicit governance approval.

---

## 24. Acceptance Criteria

A complete implementation or document alignment for RFC-005-H5 satisfies the following checklist:

- [x] RFC-005-H5 exists in the correct repo location.
- [x] It follows existing RFC formatting.
- [x] It defines Delegated Standing clearly.
- [x] It defines delegation as a bounded transfer of standing-derived influence under policy.
- [x] It distinguishes Standing Transfer from Standing Delegation.
- [x] It establishes that standing is generally not transferred.
- [x] It establishes that standing-derived influence MAY be delegated under policy.
- [x] It establishes that capability MAY be delegated under policy.
- [x] It establishes that authority MAY be delegated only when policy and governance permit.
- [x] It defines Delegator, Delegatee, Delegation Context, Delegation Scope, and Delegation Constraints.
- [x] It defines delegation principles: traceability, accountability, revocability, bounded scope, explicit consent, policy conformance, and non-repudiation.
- [x] It defines delegation types.
- [x] It defines delegation subject eligibility.
- [x] It defines delegation scope and constraints.
- [x] It defines delegation lifecycle states.
- [x] It defines delegation traceability requirements.
- [x] It defines a delegation dependency graph.
- [x] It defines Standing Delegation, Capability Delegation, Authority Delegation, and AI Delegation.
- [x] It defines revocation triggers and propagation expectations.
- [x] It defines delegation challenges.
- [x] It defines delegation governance requirements.
- [x] It defines delegation guarantees.
- [x] It identifies security implications.
- [x] It provides implementation-neutral canonical concepts.
- [x] It identifies future RFC dependencies.

---

## Conclusion

Delegation is necessary, but it is constitutionally dangerous unless constrained. The AOC Protocol permits delegation only as a bounded, traceable, accountable, revocable, explainable, and governance-aware relationship.

Standing is usually earned. Standing is not automatically transferable. Delegation is not ownership transfer. Delegation is a bounded authorization relationship.

A conformant system MUST always be able to answer who earned standing, who delegated standing-derived influence, who received it, why delegation exists, under what policy and authority it exists, what scope and constraints apply, when it expires, how it may be challenged, and how it may be revoked.
