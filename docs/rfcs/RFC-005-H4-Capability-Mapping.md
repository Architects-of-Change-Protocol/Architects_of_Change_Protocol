# RFC-005-H4 — Capability Mapping

| Field | Value |
|---|---|
| RFC Number | 005-H4 |
| Title | Capability Mapping |
| Status | Draft |
| Category | Core Protocol Extension |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-03 |
| Supersedes | — |
| Related | RFC-004 Evidence Layer v1.0, RFC-005 AOC Claims Framework, RFC-005-H1 Standing Traceability, RFC-005-H2 Standing Engine |

---

## Abstract

This document defines Capability Mapping for the AOC Protocol. Capability Mapping specifies how standing is consumed by a Capability Engine to produce bounded, policy-governed, traceable, and revocable capability decisions. It extends RFC-004, RFC-005, RFC-005-H1, and RFC-005-H2 by establishing Capability as the layer between Standing and Authority in the canonical constitutional chain.

Capability Mapping does not define a runtime engine, database schema, API shape, credential format, user interface, or scoring product. It defines the protocol requirements that any conformant capability implementation must satisfy.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Capability Definition](#3-capability-definition)
4. [Capability Mapping Model](#4-capability-mapping-model)
5. [Capability Types](#5-capability-types)
6. [Capability Subject](#6-capability-subject)
7. [Capability Scope](#7-capability-scope)
8. [Capability Constraints](#8-capability-constraints)
9. [Capability Lifecycle](#9-capability-lifecycle)
10. [Capability Eligibility](#10-capability-eligibility)
11. [Capability Evaluation Engine](#11-capability-evaluation-engine)
12. [Capability Traceability](#12-capability-traceability)
13. [Capability Dependency Graph](#13-capability-dependency-graph)
14. [Capability Delegation](#14-capability-delegation)
15. [Capability Revocation](#15-capability-revocation)
16. [Capability Simulation](#16-capability-simulation)
17. [Authority Relationship](#17-authority-relationship)
18. [Decision Relationship](#18-decision-relationship)
19. [Capability Guarantees](#19-capability-guarantees)
20. [Security Implications](#20-security-implications)
21. [Implementation Guidance](#21-implementation-guidance)
22. [Future RFC Dependencies](#22-future-rfc-dependencies)
23. [Acceptance Criteria](#23-acceptance-criteria)

---

## 1. Executive Summary

Capability Mapping defines the Capability Layer that sits between Standing and Authority in the AOC constitutional chain.

The AOC constitutional chain is:

```text
Evidence
  ↓
Assertion
  ↓
Claim
  ↓
Attestation
  ↓
Verification
  ↓
Standing
  ↓
Capability        ← This RFC
  ↓
Authority
  ↓
Decision
```

Each layer answers a distinct protocol question:

| Layer | Primary question |
|---|---|
| Evidence | What facts, artifacts, observations, events, or proofs exist? |
| Assertion | What is asserted about a subject? |
| Claim | What formal propositions are supported by evidence? |
| Attestation | Who has endorsed the claim and on what basis? |
| Verification | Has the claim been evaluated and confirmed current? |
| Standing | What is the current protocol state of the subject in this context? |
| Capability | What may this subject do under policy in this scope? |
| Authority | What decisions are recognized by governance? |
| Decision | What consequential action has been taken under authority? |

Standing answers: *What is true about this subject?*

Capability answers: *What may this subject do?*

Authority answers: *What decisions are recognized?*

Capabilities are the bridge between standing and authority. Standing is evidence-derived interpretation. Capability is policy-governed permission. Authority is governance recognition. These are separate concepts and MUST be treated as separate layers.

Standing MUST NOT directly grant capability. Capability MUST NOT directly grant authority. A conformant implementation MUST require capability decisions to be produced through a policy-governed evaluation that consumes standing, and MUST require authority recognition to consume capability.

---

## 2. Problem Statement

Standing produces an interpretable protocol state. Verified Professional, Trusted Vendor, Trusted AI Agent, and Healthy Project are examples of standing interpretations that correctly summarize evidence-derived knowledge about a subject.

However, standing alone is insufficient to determine what a subject may do.

### 2.1 Interpretation is not permission

Verified Professional is an interpretation. It does not specify which professional actions are permitted, in which organizations, for which contract classes, up to which monetary or risk thresholds, or under which governance constraints. A system that directly converts a standing state into permissions conflates interpretation with authorization policy.

### 2.2 Standing is contextual; permissions require further scoping

Standing is produced under a StandingContext that includes domain, jurisdiction, risk tier, and purpose. Permissions require additional scoping: the specific resource, operation, organizational scope, time window, monetary limit, or governance process to which the permission applies. Standing context and capability scope are related but distinct.

### 2.3 Multiple capability outcomes are possible from identical standing

Two subjects with identical Trusted Vendor standing may receive different capabilities if their organizational scope, contract class, jurisdiction, insurance standing, or risk tier differs. Standing establishes eligibility. Capability decisions apply policy to that eligibility within a specific scope.

### 2.4 Permissions must be governed independently

Standing governance defines who may define algorithms, approve policies, and review challenges affecting standing computation. Capability governance defines who may grant, restrict, suspend, revoke, or delegate capabilities. These governance responsibilities are distinct and must not be collapsed.

### 2.5 Standing manipulation must not produce automatic capability escalation

If standing directly granted capability, manipulating or inflating standing would directly escalate permissions. A separate capability layer with its own policy evaluation, scoping, constraints, and traceability prevents standing manipulation from automatically producing privilege escalation.

### 2.6 Standing degradation must affect capabilities through a defined process

When standing degrades, expires, or is revoked, dependent capabilities must be reevaluated or revoked. The capability layer must define how standing changes propagate to capability state, rather than leaving this relationship implicit.

---

## 3. Capability Definition

A Capability is a bounded permission, action surface, privilege, role, authority precursor, or operational entitlement derived through policy by a Capability Engine consuming standing, context, and applicable policy constraints.

Capabilities are:

- **Contextual** — A capability applies to a specific subject in a specific scope. The same standing may produce different capabilities in different contexts.
- **Scoped** — A capability is bounded to a defined operational scope such as an organization, project, workspace, jurisdiction, contract class, or workflow.
- **Bounded** — A capability has limits: monetary, temporal, risk, jurisdictional, role, or policy-defined bounds constrain what the capability permits.
- **Revocable** — A capability may be revoked when standing changes, policy changes, governance action occurs, or the original conditions no longer hold.
- **Auditable** — Every capability MUST be traceable to the standing, policy, context, and governance decisions that produced it.

Capabilities are NOT:

- **Evidence** — Capabilities do not record facts, artifacts, observations, or events. Evidence is the foundation of standing. Standing is the foundation of capability eligibility.
- **Claims** — Capabilities do not assert propositions about the world. Claims are formal statements supported by evidence.
- **Standing** — Capabilities are not derived protocol state. They are policy-governed permissions derived partly from standing.
- **Authority** — Capabilities are authority precursors. Authority is the recognition by governance that a decision made under a capability is valid.
- **Decisions** — Capabilities do not constitute decisions. A decision is a consequential action taken under recognized authority.

The boundary between standing and capability MUST be preserved. A standing state is not equivalent to a permission. Converting standing states directly to permissions without a policy-governed capability layer is not conformant.

---

## 4. Capability Mapping Model

Capability Mapping is the process by which a Capability Engine transforms standing, policy, and context into capability decisions.

The formal model is:

```text
Capability = f(
  Standing,
  Policy,
  Context
)
```

Where:

- `Standing` is the current standing state of the CapabilitySubject, as produced by a conformant Standing Engine under RFC-005-H2. Standing is an input to capability derivation, not the result. A high-standing subject may receive no capabilities in an inapplicable context. A subject with limited standing may receive restricted capabilities if policy provides for them.
- `Policy` is the versioned capability policy that defines eligibility rules, standing thresholds, required evidence or claim categories, scope rules, constraint definitions, delegation rules, revocation triggers, and output mapping. Policy is mandatory. A capability derived without policy is not conformant.
- `Context` is the explicit operational context in which the capability is evaluated. Context includes the capability type being requested, the organizational or project scope, jurisdiction, risk tier, temporal parameters, requestor identity, purpose, and any additional situational constraints.

The function is deterministic. Given the same standing inputs, policy version, and context, a conformant Capability Engine MUST produce the same capability decision and the same explanation.

### 4.1 Standing as input, not result

Standing answers what is currently true about a subject under evidence and policy. Capability derivation answers what a subject may do under a separate policy evaluation. The directional flow is:

```text
Evidence → Claims → Standing → [Capability Engine] → Capability
```

Standing informs the Capability Engine. It does not determine capability output on its own. The Capability Engine must also evaluate policy rules, scope constraints, temporal validity, risk limits, subject eligibility, and delegation state.

### 4.2 Policy as authorization layer

Capability Policy is the authoritative rule set that translates standing eligibility into permissioned capability. Policy defines:

- which standing types and standing states qualify a subject for consideration;
- minimum confidence or assurance requirements;
- scope and boundary conditions;
- temporal and recency requirements;
- jurisdictional constraints;
- risk tier requirements;
- monetary or resource limits;
- delegation rules;
- revocation triggers;
- escalation paths.

A Capability Policy MUST be versioned and traceable. Policy changes MUST be auditable events.

---

## 5. Capability Types

The following canonical Capability Types are defined. Implementations MAY introduce domain-specific types. Domain types MUST preserve the protocol semantics defined in this RFC and MUST NOT redefine a canonical type in a conflicting way.

| Capability Type | Definition |
|---|---|
| Claim Issuance Capability | Authority precursor permitting a subject to issue formal claims within a defined scope, claim type, and issuer authority context. |
| Verification Capability | Authority precursor permitting a subject to perform claim or evidence verification for a defined subject type, claim type, or evidentiary domain. |
| Attestation Capability | Authority precursor permitting a subject to provide formal attestations in support of claims, credentials, or evidence within a defined scope and authority context. |
| Review Capability | Authority precursor permitting a subject to perform formal reviews of evidence, claims, standing interpretations, capability decisions, or governance outputs within a defined scope. |
| Governance Capability | Authority precursor permitting a subject to participate in governance processes such as policy definition, algorithm approval, standing type registration, challenge review, or protocol amendment. |
| Delegation Capability | Authority precursor permitting a subject to delegate defined capabilities to other subjects within bounded, policy-governed, and traceable delegation parameters. |
| Execution Capability | Authority precursor permitting a subject to execute defined operational actions, workflows, transactions, or processes within a defined operational scope and risk boundary. |
| AI Agent Capability | Authority precursor permitting an AI agent to perform defined autonomous, semi-autonomous, or supervised actions within a bounded runtime scope, risk tier, and supervision policy. |
| Administrative Capability | Authority precursor permitting a subject to perform administrative functions such as user management, configuration, policy application, or operational controls within a defined organizational scope. |
| Voting Capability | Authority precursor permitting a subject to cast votes in governance processes, quorum decisions, elections, or policy ratifications within a defined governance scope. |
| Approval Capability | Authority precursor permitting a subject to grant or deny formal approvals for requests, proposals, transactions, or decisions within a defined approval domain and authority scope. |
| Financial Capability | Authority precursor permitting a subject to authorize, commit, or execute financial operations within defined monetary limits, currency scope, risk tier, and governance constraints. |
| Operational Capability | Authority precursor permitting a subject to execute operational management functions such as deployment, configuration, incident response, or resource allocation within a defined operational domain. |

Future capability types are extensible. Extensions MUST define capability subject, capability scope, capability constraints, eligibility requirements, standing type mappings, and revocation triggers.

---

## 6. Capability Subject

A CapabilitySubject is the protocol-recognized entity that holds or requests a capability.

A capability is always owned by and scoped to a subject. A capability without a CapabilitySubject is not meaningful and is not conformant.

Canonical CapabilitySubject types include:

| Subject Type | Description |
|---|---|
| Person | A natural person recognized by the protocol with identity evidence and claims. |
| Organization | A legal or protocol-recognized organizational entity such as a company, agency, or institution. |
| Vendor | An organization or person engaged in a commercial or services relationship under a procurement policy context. |
| Team | A defined group of persons operating within an organizational scope with shared governance, roles, or project responsibilities. |
| Project | A bounded operational unit with defined scope, timeline, delivery obligations, and governance context. |
| Agent | An AI agent, software agent, automated system, or other non-human actor recognized by the protocol as a subject capable of holding capabilities. |
| Service | A protocol-recognized software service, API endpoint, or runtime system that may hold operational capabilities. |
| Smart Contract | A protocol-recognized on-chain or verifiable executable agreement that may hold execution or governance capabilities. |

CapabilitySubject MUST be identified with a stable, traceable subject reference. The subject reference MUST support traceability to identity evidence, standing records, capability grants, revocation events, and audit history.

CapabilitySubject MUST NOT be confused with the capability grantor, capability reviewer, policy author, or governance authority unless those roles are explicitly the same subject under the relevant governance context.

### 6.1 Capability ownership

A capability is held by the CapabilitySubject to which it was granted. Ownership does not imply unlimited use. Ownership means the capability applies to the subject within its defined scope and constraints. Ownership is revocable. Ownership does not transfer unless explicit delegation or succession is defined and authorized by policy.

---

## 7. Capability Scope

CapabilityScope is the bounded operational domain within which a capability is valid and may be exercised. Capability scope is mandatory. A capability without scope is not bounded and is not conformant.

Capability scope is not global. A capability is never a universal permission. It applies to a defined operational surface.

Examples of capability scope:

| Capability | Scope |
|---|---|
| Can Approve Budget | Project X, fiscal year 2026, up to USD 50,000 |
| Can Issue Professional Credential | Organization Y, credential type: PMO Certification, jurisdiction: US |
| Can Execute AI Action | Workspace Z, action type: document analysis, supervised mode |
| Can Vote | Governance body: Protocol Working Group, proposal type: policy amendment |
| Can Review Vendor | Procurement program: Infrastructure Vendors, risk tier: moderate |

CapabilityScope SHOULD identify:

- the organizational, project, workspace, or governance domain;
- the resource type, artifact type, operation type, or action class;
- the applicable jurisdiction or regulatory context;
- the risk tier or classification level;
- the temporal bounds during which the scope is valid;
- the monetary or resource limits, when applicable;
- the interaction modality (autonomous, supervised, review-required, or approval-required).

A capability granted in one scope MUST NOT be treated as valid in another scope without an explicit policy allowing scope extension or delegation. Scope laundering — the use of a capability in a context outside its defined scope — is a protocol violation.

---

## 8. Capability Constraints

Capability constraints are the bounded conditions that further restrict the exercise of a capability within its defined scope.

Constraints are additive. A capability may have multiple constraints that must all be satisfied for the capability to be exercisable in a given situation.

### 8.1 Time constraints

A capability MUST NOT be exercisable outside its defined temporal validity window. Temporal constraints include:

- grant effective date: the earliest timestamp at which the capability is valid;
- grant expiry date: the latest timestamp at which the capability remains valid;
- temporal session limits: per-session, per-day, per-month, or other periodic use restrictions;
- recency requirements: restrictions based on the recency of the underlying standing evidence.

### 8.2 Jurisdiction constraints

A capability MAY be restricted to defined jurisdictions, regulatory environments, or geographic or legal domains. Capability Engines MUST evaluate jurisdiction constraints against the operational context at evaluation time.

### 8.3 Monetary constraints

Financial and approval capabilities MUST define monetary limits. Monetary constraints include:

- per-transaction limits;
- cumulative period limits;
- currency scope;
- risk-tier-based limits;
- escalation thresholds requiring additional approval.

### 8.4 Risk constraints

Capabilities MAY be restricted by risk tier. A subject qualified for moderate-risk actions may not hold the same capability for high-risk actions. Risk tier must be explicitly matched between capability grant conditions and the operational context at execution time.

### 8.5 Role constraints

A capability MAY require the subject to hold or perform a specific role within an organizational or governance context. Role requirements must be traceable to identity, employment, or governance evidence.

### 8.6 Policy constraints

A capability is governed by the versioned policy under which it was granted. Policy constraints define eligibility, scope, limits, delegation rules, revocation conditions, and escalation paths. If the governing policy changes materially, capability revalidation MAY be required.

### 8.7 Standing constraints

A capability may impose minimum standing state or confidence requirements as conditions for exercising the capability at a given time. If the subject's current standing falls below the required threshold after capability grant, the capability MUST be restricted, suspended, or revoked according to policy.

---

## 9. Capability Lifecycle

A capability exists in one of the following lifecycle states. Transitions between states MUST be governed by policy, traceable as events, and explainable in the audit record.

| State | Meaning |
|---|---|
| Requested | A subject or authorized requestor has submitted a capability request that has not yet been evaluated. |
| Granted | A Capability Engine or authorized governance process has evaluated the request and determined the capability may be issued under applicable policy and standing. |
| Active | The capability is valid, within scope, within constraints, and may be exercised by the CapabilitySubject. |
| Restricted | The capability exists but policy, standing, risk, challenge, or governance conditions restrict its exercise. Specific actions may be suspended or require escalation. |
| Suspended | The capability is temporarily disabled pending review, standing recomputation, evidence resolution, governance process, appeal, or remediation. |
| Expired | The capability is no longer valid because its temporal validity window has passed, the underlying policy has changed, or the supporting standing has expired. |
| Revoked | The capability has been permanently withdrawn due to standing degradation, policy violation, governance action, fraud, evidence invalidation, or other revocation trigger. Revocation is not expiry; it is a deliberate termination event. |
| Delegated | The capability has been formally delegated to another CapabilitySubject under policy-defined delegation rules. The delegating subject may retain constrained exercise rights. |
| Superseded | The capability has been replaced by a new grant with modified scope, constraints, or terms. The superseded capability is retired and must not be exercised. |

### 9.1 State transitions

State transitions MUST be traceable events. Examples:

- `Requested → Granted`: Capability Engine evaluation completes successfully.
- `Requested → Denied`: Capability Engine evaluation finds insufficient standing, policy ineligibility, or scope mismatch.
- `Granted → Active`: Temporal validity window opens.
- `Active → Restricted`: Standing falls below minimum threshold or challenge is raised.
- `Active → Suspended`: Governance process or policy trigger suspends the capability pending review.
- `Active → Expired`: Temporal validity window closes.
- `Active → Revoked`: Revocation event is received from authorized governance or policy trigger.
- `Restricted → Active`: Restriction condition is resolved, standing is restored, or challenge is closed.
- `Suspended → Active`: Review completes without finding cause for revocation.
- `Suspended → Revoked`: Review finds cause for revocation.
- `Active → Delegated`: Delegation event is issued under authorized delegation policy.
- `Active → Superseded`: New capability grant replaces the existing grant.

---

## 10. Capability Eligibility

Capability eligibility is the determination of whether a CapabilitySubject's current standing satisfies the preconditions defined by policy for a capability to be considered for grant.

Eligibility is distinct from granting. Eligibility means the subject meets the standing-based preconditions that permit the Capability Engine to evaluate whether a capability should be granted. Granting occurs when the full capability evaluation — including standing, policy, scope, context, constraints, governance rules, and any required review or approval — is completed and the capability is formally issued.

A subject may be eligible but not granted a capability because:

- scope conditions are not met;
- additional evidence or approval is required;
- a conflict of interest or exclusion rule applies;
- a governance hold is in effect;
- a delegation limit prevents further issuance;
- the risk tier requires additional review.

A subject may hold a capability without continuous eligibility if the capability has already been granted and remains Active under its defined constraints. When standing subsequently degrades below required thresholds, the capability MUST be restricted, suspended, or revoked per policy.

### 10.1 Eligibility examples

The following examples illustrate standing-based eligibility. These are mappings, not automatic grants.

| Standing | Standing Type | Standing State | Eligible Capability |
|---|---|---|---|
| Professional Standing | Active, Verified | Minimum Confidence Met | Claim Issuance Capability |
| Vendor Standing | Trusted | Within Policy Scope | Procurement / Execution Capability |
| AI Agent Standing | Trusted, Supervised | Within Risk Tier | AI Agent Capability |
| Governance Standing | Active | Quorum-Qualified | Voting Capability |
| Compliance Standing | Verified | Current | Approval Capability within Jurisdiction |

These examples express eligibility. The Capability Engine must still evaluate policy, scope, constraints, and any required approvals before issuing a grant.

---

## 11. Capability Evaluation Engine

The Capability Engine is the policy-governed evaluation system that consumes standing outputs and produces capability decisions.

A conformant Capability Engine MUST evaluate capabilities as a function of explicit inputs:

```text
CapabilityDecision = f(
  CapabilityRequest,
  Standing,
  Policy,
  Context
)
```

Where:

- `CapabilityRequest` identifies the requested capability type, the CapabilitySubject, the requested scope, and any contextual parameters relevant to the evaluation.
- `Standing` is the current standing output produced by a conformant Standing Engine for the CapabilitySubject under the relevant StandingType and StandingContext. Standing MUST be consumed as a StandingSnapshot with traceable provenance per RFC-005-H1 and RFC-005-H2.
- `Policy` is the versioned capability policy governing the requested capability type, subject type, and scope.
- `Context` is the operational context at evaluation time, including organizational scope, jurisdiction, risk tier, temporal parameters, and purpose.

### 11.1 Evaluation stages

A conformant Capability Engine SHOULD perform the following stages:

| Stage | Required behavior |
|---|---|
| Resolve Standing | Obtain current StandingSnapshot for the CapabilitySubject under the relevant StandingType. Validate that the snapshot is current, non-expired, and traceable per RFC-005-H1. |
| Evaluate Eligibility | Determine whether the subject's standing state and confidence satisfy the minimum preconditions defined by policy for the requested capability. |
| Evaluate Policy | Apply versioned capability policy rules to the standing inputs, capability type, scope, constraints, jurisdiction, risk tier, and any delegation conditions. |
| Evaluate Context | Validate that the operational context at request time is within the scope defined by the requested capability and the applicable policy. |
| Evaluate Constraints | Confirm that time, monetary, risk, role, jurisdiction, and policy constraints are satisfied at evaluation time. |
| Evaluate Conflicts | Check for conflict-of-interest rules, exclusion policies, delegation limits, simultaneous grant limits, or governance holds. |
| Produce Decision | Emit the capability decision: Grant, Deny, Restrict, Escalate, or Defer. Record decision with full traceability references. |
| Generate Explanation | Produce human-readable, machine-readable, and audit-ready explanation for the capability decision. |
| Persist Grant or Denial | Persist the CapabilityGrant or CapabilityDenial record with references to standing snapshot, policy version, context, constraints, and decision basis. |

### 11.2 Decision outcomes

| Decision | Meaning |
|---|---|
| Grant | Capability is issued to the subject under the defined scope and constraints. |
| Deny | Capability is not issued. The subject does not meet eligibility or policy requirements. |
| Restrict | Capability is issued with reduced scope, additional constraints, or conditional limits. |
| Escalate | Evaluation cannot be completed without additional approval, review, or evidence. Request is forwarded to a governance process or authorized reviewer. |
| Defer | Evaluation is postponed pending additional standing inputs, policy resolution, or governance decision. |

---

## 12. Capability Traceability

Every capability MUST be fully traceable. This requirement extends RFC-005-H1 Standing Traceability to the Capability Layer.

A conformant capability implementation MUST answer the following audit questions:

| Audit Question | Required Record |
|---|---|
| Why was this capability granted? | CapabilityGrant record referencing StandingSnapshot, PolicyVersion, CapabilityContext, and decision basis. |
| Why was this capability denied? | CapabilityDenial record referencing StandingSnapshot, PolicyVersion, eligibility gap, and denial reason. |
| What standing supported this capability? | Reference to StandingSnapshot, StandingType, StandingState, StandingConfidence, and AlgorithmVersion. |
| What policy authorized this capability? | Reference to PolicyVersion, PolicyId, capability type, subject type, and scope definition. |
| Who approved this capability? | Reference to authorizing governance process, reviewer identity, or Capability Engine decision with governance traceability. |
| When was this capability granted? | CapabilityGrant timestamp. |
| When was this capability revoked? | CapabilityRevocation timestamp and revocation trigger. |
| What constraints apply? | CapabilityConstraint record including temporal, monetary, risk, role, jurisdiction, and policy constraints. |
| What scope applies? | CapabilityScope record defining organizational, project, operational, and purpose bounds. |
| What changes have occurred? | CapabilityLifecycleEvent record for each state transition, including trigger, prior state, new state, and explanation. |

Capability traceability MUST support both forward and reverse directions:

**Reverse traceability** answers: *Which standing, policy, and context produced this capability?*

**Forward traceability** answers: *Which capabilities, authority determinations, or decisions were influenced by this standing snapshot or policy version?*

A CapabilityGrant without a reference to a traceable StandingSnapshot is not conformant for consequential use.

---

## 13. Capability Dependency Graph

The Capability Dependency Graph extends the Standing Dependency Graph defined in RFC-005-H2 by adding the Capability Layer.

A conformant capability implementation SHOULD represent explicit dependencies among the following nodes:

```text
[Evidence]
    | supports
    v
[Claim]
    | evaluated_for
    v
[Standing Snapshot]
    | produced_by
    v
[Algorithm Version]         [Policy Context]
    |                             |
    +---------> [Capability Engine] <---------+
                      |
                      | produces
                      v
              [Capability Decision]
                      |
               +------+------+
               |             |
               v             v
        [Capability     [Capability
           Grant]          Denial]
               |
               | consumed_by
               v
         [Authority]
               |
               | enables
               v
          [Decision]
               |
               | may trigger
               v
          [Challenge]
```

Full dependency graph with governance nodes:

```text
[Evidence] → [Claim] → [Standing Snapshot]
    ↓              ↓          ↓
[Authority]   [Policy]   [Algorithm Version]
                  ↓
           [Capability Policy]
                  ↓
          [Capability Engine]
                  ↓
        [Capability Decision] → [Capability Grant]
                                         ↓
                               [Authority Recognition]
                                         ↓
                                    [Decision]
                                         ↓
                                    [Challenge]
                                         ↓
                                    [Policy Review]
```

A CapabilityGrant without graph edges to StandingSnapshot, PolicyVersion, CapabilityScope, and CapabilityConstraint is an orphan capability and is not conformant.

---

## 14. Capability Delegation

Capabilities MAY be delegated. Delegation is the formal transfer or extension of a capability from a CapabilitySubject to another subject under policy-defined delegation rules.

This section introduces the delegation concept. Complete delegation semantics, including delegation chains, constrained delegation, sub-delegation limits, and delegation revocation, are reserved for RFC-005-H5 Delegated Standing.

### 14.1 Distinction from standing delegation

Capability delegation is distinct from standing delegation.

Standing is not generally delegable. Standing is an evidence-derived interpretation of a specific subject. The facts about one subject do not become facts about another subject merely because a delegation relationship exists. A Trusted Vendor standing state belongs to the vendor; it does not transfer to a subcontractor merely because the vendor delegates a capability.

Capability delegation transfers bounded permission, not standing. A delegating subject grants another subject the right to exercise a specific capability within a constrained scope. The receiving subject must typically hold its own qualifying standing for the delegated capability to be exercised.

### 14.2 Delegation requirements

A conformant delegation MUST:

- be authorized by a policy that explicitly permits delegation for the capability type;
- define the scope of the delegated capability (which MUST NOT exceed the delegating subject's own capability scope);
- define temporal bounds for the delegation;
- be traceable to the original CapabilityGrant;
- define revocation conditions;
- prohibit further sub-delegation unless explicitly permitted by policy.

---

## 15. Capability Revocation

Capability revocation is the termination of a CapabilityGrant before its scheduled expiry.

Revocation is mandatory when conditions that justified the grant no longer hold. A conformant implementation MUST define revocation triggers and MUST propagate revocation events to dependent authority and decision processes.

### 15.1 Revocation triggers

| Trigger | Description |
|---|---|
| Evidence Invalidation | Evidence contributing to the standing that supported the capability has been invalidated, revoked, or corrected in a way that changes standing below required thresholds. |
| Standing Degradation | The CapabilitySubject's standing falls below the minimum state or confidence threshold required by capability policy. |
| Policy Change | A material policy change removes eligibility for the capability type or scope. |
| Governance Action | An authorized governance body, reviewer, or administrator issues a revocation through a recognized governance process. |
| Fraud or Violation | Evidence of policy violation, fraudulent claim, unauthorized use, or protocol breach triggers mandatory revocation. |
| Delegation Revocation | A delegated capability is revoked when the originating capability is revoked, the delegation period expires, or the delegation terms are violated. |
| Expiry Cascade | The expiry of a dependent standing or upstream capability triggers revocation of downstream dependent capabilities. |

### 15.2 Revocation propagation

When a capability is revoked, the revocation MUST propagate to:

- active delegations of the revoked capability;
- authority recognitions that depend on the revoked capability;
- pending decisions that require the revoked capability;
- capability simulation states that reference the revoked grant.

Revocation propagation MUST be traceable. A CapabilityRevocationEvent MUST record the revocation trigger, prior state, new state, propagation targets, and timestamp.

### 15.3 Revocation is not erasure

Revocation terminates a capability's Active or Delegated state. It does not erase the historical record that the capability was granted. Prior CapabilityGrant records MUST remain available for audit, impact analysis, and standing history review.

---

## 16. Capability Simulation

CapabilitySimulation is a non-canonical what-if analysis that evaluates hypothetical capability decisions under altered standing, policy, scope, constraints, or context.

CapabilitySimulation extends the StandingSimulation concept defined in RFC-005-H2 to the Capability Layer.

Examples of capability simulation:

- Remove a standing snapshot: what capabilities would remain?
- Change the applicable policy version: which capabilities would be affected?
- Simulate future standing decay: which capabilities would expire or be restricted?
- Change the operational context: would the capability scope still apply?
- Simulate delegation chain: what capabilities would a delegatee receive?

### 16.1 Simulation constraints

Simulation MUST NOT affect canonical state. A simulation MUST NOT:

- modify CapabilityGrant, CapabilityDenial, or CapabilityRevocationEvent records;
- modify StandingSnapshots or StandingDeltas;
- modify evidence lifecycle state;
- modify claim state;
- be used as an authorization decision for consequential actions.

A CapabilitySimulation MUST be clearly labeled as simulation. It SHOULD identify the hypothetical inputs, the baseline CapabilityGrant or capability state from which it diverges, the simulated output decision, and the explanation of differences from the canonical state.

### 16.2 Simulation uses

Simulation MAY support:

- impact analysis before policy changes;
- pre-grant eligibility checks for audit purposes;
- standing decay and capability expiry forecasting;
- delegation chain analysis;
- challenge scenario modeling;
- security and privilege escalation analysis.

---

## 17. Authority Relationship

Capability is not authority. Authority is the governance recognition that a decision made under a capability is valid within the protocol.

The relationship is directional:

```text
Capability → Authority → Decision
```

A capability is an authority precursor. It establishes that a subject is eligible to act in a defined scope. Authority is the formal recognition by a governance body, protocol process, or institutional actor that an action taken under the capability is a valid exercise of power within the protocol.

### 17.1 Examples

| Capability | Authority |
|---|---|
| Review Capability (Can Review) | Review formally accepted and recorded by the governance process. |
| Voting Capability (Can Vote) | Vote counted and recognized toward quorum or outcome. |
| Approval Capability (Can Approve) | Approval formally recognized as valid authorization for the dependent action. |
| Claim Issuance Capability (Can Issue Credential) | Credential recognized as valid by the credential registry or governance authority. |
| Financial Capability (Can Authorize Payment) | Payment authorization recognized as valid by the financial governance process. |
| AI Agent Capability (Can Execute) | Execution recognized as authorized and traceable to a recognized agent with valid delegated authority. |
| Signing Capability (Can Sign) | Signature recognized as binding under the applicable policy and governance context. |

In each example:

- The **capability** establishes that the subject is permitted to perform the action within the defined scope and constraints.
- The **authority** establishes that the action, when performed, is recognized as a legitimate exercise of protocol power.

A subject holding a capability but without recognized authority cannot make decisions that bind the protocol. A subject exercising authority without a traceable capability is not conformant.

### 17.2 Authority does not flow backward

Authority recognition does not retroactively create capability. If a subject performed an action without a valid capability grant, that action lacks protocol legitimacy regardless of whether governance subsequently recognized it. Conformant implementations MUST validate capability before recognizing authority.

---

## 18. Decision Relationship

Authority enables decisions. A decision is the final consequential output of the protocol chain.

The complete chain is:

```text
Evidence
  ↓
Assertion
  ↓
Claim
  ↓
Attestation
  ↓
Verification
  ↓
Standing
  ↓
Capability
  ↓
Authority
  ↓
Decision
```

A decision is a consequential action taken under recognized authority that was derived from capability that was granted based on eligible standing that was computed from verified evidence.

Every layer is required. Omitting or collapsing layers creates protocol vulnerabilities:

- Skipping standing → capability decisions are not evidence-grounded.
- Skipping capability → authority is not policy-governed.
- Skipping authority → decisions are not governance-recognized.

### 18.1 Decision traceability

A decision that cannot be traced back through the capability, standing, and evidence chain is not a conformant AOC decision. Decision traceability is the culmination of Standing Traceability (RFC-005-H1), Standing Engine provenance (RFC-005-H2), and Capability Traceability (this RFC).

---

## 19. Capability Guarantees

The following guarantees are normative for conformant capability implementations.

| Guarantee | Requirement |
|---|---|
| No capability without standing | A capability MUST NOT be granted unless the CapabilitySubject's current standing satisfies the eligibility preconditions defined by policy. |
| No capability without policy | A capability MUST NOT be granted without a versioned, traceable capability policy that defines eligibility, scope, constraints, and revocation conditions. |
| No capability without scope | A capability MUST be bounded to a defined CapabilityScope. Unbounded, global, or scope-free capabilities are not conformant. |
| No capability without traceability | Every CapabilityGrant, CapabilityDenial, and CapabilityRevocationEvent MUST reference traceable standing, policy, context, and decision basis records. |
| No hidden capabilities | Capabilities MUST NOT be created, activated, modified, or revoked without producing a traceable event. Silent privilege grants are not conformant. |
| No orphan capabilities | A CapabilityGrant that cannot be traced to a valid StandingSnapshot and PolicyVersion is an orphan capability and MUST NOT be used to support authority or decisions. |
| No authority without capability | Authority recognition MUST reference a valid, traceable CapabilityGrant. Authority recognized without a traceable capability is not conformant. |
| No capability that survives standing revocation | When standing falls below required thresholds or is revoked, dependent capabilities MUST be revalidated, restricted, suspended, or revoked per policy. |

---

## 20. Security Implications

Conformant implementations MUST address the following capability-layer security risks.

### 20.1 Privilege escalation

An attacker or insider may attempt to obtain capabilities beyond their standing eligibility by submitting false evidence, manipulating standing computation, abusing policy gaps, or exploiting scope definitions. Capability Engines MUST validate standing against current, traceable snapshots and MUST reject requests where standing does not satisfy policy preconditions.

### 20.2 Capability laundering

A subject may obtain a capability in one scope and attempt to exercise it in another scope. CapabilityScope MUST be validated at exercise time, not only at grant time. Scope laundering MUST be detected and rejected.

### 20.3 Standing manipulation

If standing computation can be manipulated — through fabricated evidence, authority inflation, Sybil attacks, or standing override — dependent capabilities may be improperly granted. The Standing Engine guarantees defined in RFC-005-H2 and the traceability requirements of RFC-005-H1 are the primary defenses. Capability Engines MUST consume only traceable, current StandingSnapshots.

### 20.4 Delegation abuse

A subject with a delegated capability may attempt to sub-delegate beyond policy limits, exercise capabilities in scope beyond what was delegated, or delegate to an unauthorized subject. Delegation chains MUST be validated against policy delegation rules at each delegation step.

### 20.5 Scope abuse

Capabilities that define overly broad scopes create large attack surfaces. Capability policies SHOULD apply the principle of least privilege: scopes SHOULD be as narrow as the operational purpose requires.

### 20.6 Policy abuse

Policy authors or administrators may insert policies that grant excessive capabilities, remove eligibility requirements, or bypass standing thresholds. Capability policies MUST be versioned, authorized, and subject to governance review. Material policy changes SHOULD trigger impact analysis.

### 20.7 Zombie permissions

Capabilities that have been granted but not revoked after standing degradation or evidence invalidation create zombie permissions — grants that persist beyond their legitimate basis. Standing constraint monitoring, decay-triggered revalidation, and evidence lifecycle event propagation MUST prevent zombie permissions.

### 20.8 Orphan authorities

Authority recognized from a capability that has since been revoked creates an orphan authority — a decision basis that is no longer supported. Authority consumers MUST validate that the underlying CapabilityGrant remains Active at the time authority is exercised.

### 20.9 AI overreach

AI agents holding AI Agent Capabilities may attempt to perform actions beyond their defined scope, risk tier, or supervision policy. Capability constraints MUST be validated by the runtime environment at execution time. AI Agent Capabilities MUST define supervision requirements as non-negotiable constraints.

---

## 21. Implementation Guidance

This section introduces canonical capability concepts for implementation. This RFC is implementation-neutral and does not prescribe a database, API, runtime engine, serialization format, or user interface.

| Concept | Definition |
|---|---|
| Capability | A bounded, scoped, policy-governed permission or operational entitlement derived from standing by a Capability Engine. |
| CapabilityType | The canonical classification of a capability such as Claim Issuance, Verification, Execution, Voting, or AI Agent. |
| CapabilitySubject | The protocol-recognized entity that holds or requests a capability. |
| CapabilityScope | The mandatory bounded operational domain within which a capability is valid. |
| CapabilityConstraint | The set of time, monetary, risk, role, jurisdiction, policy, and standing conditions that further restrict exercise of a capability within its scope. |
| CapabilityDecision | The output of Capability Engine evaluation, including Grant, Deny, Restrict, Escalate, or Defer. |
| CapabilityGrant | The immutable record of a capability grant, including subject, type, scope, constraints, standing reference, policy reference, context, and effective period. |
| CapabilityRevocation | The event record of a capability revocation, including subject, capability, revocation trigger, prior state, propagation targets, and timestamp. |
| CapabilitySimulation | A non-canonical what-if analysis of hypothetical capability outcomes under altered inputs. Must not affect canonical state. |
| CapabilityEngine | The policy-governed evaluation system that consumes standing and produces capability decisions. |
| CapabilityLifecycleEvent | Any traceable state transition event in the capability lifecycle, including grant, activation, restriction, suspension, revocation, delegation, expiry, and supersession. |

### 21.1 Implementation notes

1. Capability grants SHOULD be immutable records. State changes SHOULD be represented as new lifecycle events referencing the original grant.
2. Capability Engines SHOULD consume current StandingSnapshots, not raw standing fields.
3. Capability policies MUST be versioned and MUST be referenced in every CapabilityGrant.
4. Capability scope MUST be validated at exercise time, not only at grant time.
5. Standing constraint violations MUST trigger capability revalidation, restriction, or revocation per policy.
6. Delegation chains MUST be bounded by explicit policy rules and MUST NOT be constructible without traceable authorization.
7. Capability simulations MUST be clearly labeled and isolated from canonical records.
8. Revocation events MUST propagate to dependent delegations, authority consumers, and pending decisions.
9. Capability Engines SHOULD fail closed when required standing inputs are missing, non-current, or non-traceable.
10. Implementations SHOULD support capability impact analysis when policy or standing changes occur.
11. Implementations MUST preserve compatibility with RFC-004 evidence portability, RFC-005 trust-chain boundaries, RFC-005-H1 traceability requirements, and RFC-005-H2 Standing Engine semantics.

---

## 22. Future RFC Dependencies

RFC-005-H4 creates the following future RFC dependencies:

| Future RFC | Scope |
|---|---|
| RFC-005-H3 Standing Governance | Defines governance roles, algorithm approval, policy approval, standing type registration, challenge review, and standing oversight. The governance structures defined in RFC-005-H3 directly inform the authorized governance processes that capability policies reference. |
| RFC-005-H5 Delegated Standing | Defines how standing may be delegated, inherited, constrained, scoped, and revoked. RFC-005-H5 provides the standing delegation semantics that underlie the Delegation Capability and the rules for delegated capability subjects holding qualifying standing. |
| RFC-005-H6 Standing Algorithms | Defines algorithm requirements, versioning, decay functions, and aggregation models that produce the StandingSnapshots consumed by the Capability Engine. |
| RFC-005-H7 Capability Engine (proposed) | Would define the Capability Engine specification in full: evaluation stages, decision algorithms, policy language, constraint validation, delegation chains, and runtime requirements. |
| RFC-005-H8 Authority Model (proposed) | Would define how authority is recognized from capabilities, how authority chains are formed, how governance bodies recognize authority, and how authority is consumed by decisions. |
| RFC-005-H9 Decision Framework (proposed) | Would define the Decision layer: how decisions are made under recognized authority, how decisions are recorded, audited, and challenged, and how decisions bind protocol participants. |

---

## 23. Acceptance Criteria

A complete implementation or document alignment for RFC-005-H4 satisfies the following checklist:

- [ ] RFC-005-H4 exists in the correct repo location.
- [ ] It follows existing RFC formatting and metadata conventions.
- [ ] It defines Capability clearly and distinguishes it from evidence, claims, standing, and authority.
- [ ] It defines the Capability Mapping model: `Capability = f(Standing, Policy, Context)`.
- [ ] It establishes that standing is an input to capability derivation, not the result.
- [ ] It defines canonical CapabilityTypes.
- [ ] It defines CapabilitySubject with canonical subject types.
- [ ] It defines CapabilityScope as mandatory and bounded.
- [ ] It defines CapabilityConstraint categories: time, jurisdiction, monetary, risk, role, policy, and standing constraints.
- [ ] It defines the capability lifecycle and canonical state transitions.
- [ ] It defines capability eligibility as distinct from granting.
- [ ] It defines the Capability Evaluation Engine and the CapabilityDecision formula.
- [ ] It defines Capability Traceability requirements and mandatory audit questions.
- [ ] It defines the Capability Dependency Graph expanding the RFC-005-H2 StandingGraph.
- [ ] It introduces delegation as a concept and defers full semantics to RFC-005-H5.
- [ ] It defines capability revocation triggers and propagation requirements.
- [ ] It defines CapabilitySimulation and prohibits simulation from affecting canonical state.
- [ ] It defines the Authority relationship: capability is consumed by authority, not equivalent to authority.
- [ ] It defines the Decision relationship and the complete constitutional chain.
- [ ] It defines protocol guarantees for the Capability Layer.
- [ ] It covers security implications: privilege escalation, capability laundering, standing manipulation, delegation abuse, scope abuse, policy abuse, zombie permissions, orphan authorities, and AI overreach.
- [ ] It introduces canonical implementation concepts.
- [ ] It identifies future RFC dependencies including RFC-005-H7, H8, and H9.

---

## Conclusion

RFC-005-H4 establishes Capability Mapping as a required layer in the AOC constitutional chain. The chain cannot be correctly implemented without it.

Evidence records observed facts. Claims formalize assertions. Standing interprets evidence and claims under context and policy. Capability translates standing eligibility into bounded, scoped, policy-governed permissions. Authority recognizes those permissions as the basis for legitimate decisions.

Each layer is necessary. Collapsing standing and capability conflates interpretation with authorization. Collapsing capability and authority removes the governance step between permission and recognition. Collapsing any layer produces a system where decisions cannot be fully justified, cannot be fully audited, and cannot be safely challenged.

Standing MUST NOT grant capability.
Capability MUST NOT grant authority.
Authority MUST NOT exist without capability.
Capability MUST NOT exist without standing.
Standing MUST NOT exist without evidence.

Capability = Function(Standing, Policy, Context).
