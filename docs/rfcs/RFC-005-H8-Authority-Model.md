# RFC-005-H8 — Authority Model

| Field | Value |
|---|---|
| RFC Number | 005-H8 |
| Title | Authority Model |
| Status | Draft |
| Category | Core Protocol Extension |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-03 |
| Supersedes | — |
| Related | RFC-004 Evidence Layer v1.0, RFC-005 AOC Claims Framework, RFC-005-H1 Standing Traceability, RFC-005-H2 Standing Engine, RFC-005-H3 Standing Governance, RFC-005-H4 Capability Mapping, RFC-005-H5 Delegated Standing, RFC-005-H6 Standing Algorithms, RFC-005-H9 Decision Framework |

---

## Abstract

This document defines the Authority Model for the AOC Protocol. Authority is the policy-recognized legitimacy to perform, validate, approve, issue, review, govern, or influence protocol-recognized outcomes. It extends RFC-004, RFC-005, RFC-005-H1, RFC-005-H2, RFC-005-H3, RFC-005-H4, and RFC-005-H5 by establishing Authority as the constitutional layer between Capabilities and Decisions.

Authority is not power. Authority is not capability. Authority is not standing. Authority is not ownership. Authority is recognized legitimacy under policy, scope, constraints, governance, and traceability.

This RFC is concept-first and implementation-neutral. It does not define a database schema, API, runtime engine, storage model, credential format, user interface, or platform-specific authority model. It defines the protocol requirements that any conformant authority implementation must satisfy.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Authority Definition](#3-authority-definition)
4. [Authority Principles](#4-authority-principles)
5. [Authority Types](#5-authority-types)
6. [Authority Subject Model](#6-authority-subject-model)
7. [Recognized Authority](#7-recognized-authority)
8. [Authority Scope](#8-authority-scope)
9. [Authority Constraints](#9-authority-constraints)
10. [Authority Eligibility](#10-authority-eligibility)
11. [Authority Lifecycle](#11-authority-lifecycle)
12. [Authority Traceability](#12-authority-traceability)
13. [Authority Dependency Graph](#13-authority-dependency-graph)
14. [Authority Recognition Process](#14-authority-recognition-process)
15. [Authority Delegation](#15-authority-delegation)
16. [Authority Challenges](#16-authority-challenges)
17. [Authority Governance](#17-authority-governance)
18. [Authority Registry](#18-authority-registry)
19. [Authority Guarantees](#19-authority-guarantees)
20. [Security Implications](#20-security-implications)
21. [Authority vs Capability](#21-authority-vs-capability)
22. [Authority vs Standing](#22-authority-vs-standing)
23. [Authority and Decisions](#23-authority-and-decisions)
24. [Implementation Guidance](#24-implementation-guidance)
25. [Future RFC Dependencies](#25-future-rfc-dependencies)
26. [Acceptance Criteria](#26-acceptance-criteria)

---

## 1. Executive Summary

Authority is the protocol layer that determines whether an action, review, approval, issuance, validation, governance action, or decision is recognized as legitimate by the AOC Protocol.

Authority is not merely the ability to act. A subject may possess the technical ability, operational permission, or practical opportunity to act and still lack protocol authority. If the action is not recognized under applicable policy, governance, scope, and traceability requirements, the action MUST NOT be treated as authoritative.

Authority is recognized legitimacy.

The canonical constitutional chain is:

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
Authority        ← This RFC
  ↓
Decisions
```

The expanded RFC-005 trust and authority chain remains compatible with this model:

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
Delegation
  ↓
Capability
  ↓
Authority
  ↓
Decision
```

Authority exists between Capability and Decision.

Capabilities enable action. Authority legitimizes action. Without capability, action cannot occur in a conformant system. Without authority, action is not recognized by the protocol. Authority consumes capability. Decision consumes authority.

This RFC explicitly answers:

| Question | Protocol answer |
|---|---|
| What is authority? | Policy-recognized legitimacy to perform, validate, approve, issue, review, govern, or influence protocol-recognized outcomes. |
| Why does authority exist? | To distinguish ability to act from legitimacy of action and to ensure consequential outcomes are recognized only through governed authority. |
| How is authority different from capability? | Capability answers what a subject may do; authority answers whether the action counts as legitimate and recognized. |
| How is authority different from standing? | Standing is current validity state derived from evidence and claims; authority is recognition that a subject may affect outcomes within scope. |
| Who may hold authority? | A policy-eligible AuthoritySubject that satisfies standing, capability, governance, recognition, delegation, review, and compliance requirements. |
| Who recognizes authority? | A policy-recognized governance authority, recognition authority, or authority framework with traceable recognition lineage. |
| How is authority constrained? | By scope, time, policy, risk, governance, capability, standing, jurisdiction, monetary limits, delegation boundaries, and challenge state. |
| How is authority delegated? | Only when policy permits, within explicit boundaries, with traceable delegation lineage and revocation propagation. |
| How is authority revoked? | Through expiration, governance action, recognition revocation, challenge outcome, policy change, upstream standing/capability/delegation change, or risk escalation. |
| How is authority challenged? | Through Authority Challenges against recognition, scope, legitimacy, policy compliance, delegation basis, or governance basis. |
| How is authority traced? | Through mandatory lineage to holder, recognizer, policy, governance, scope, constraints, evidence, claims, standing, capabilities, delegation, and lifecycle events. |
| How does authority influence decisions? | Only Recognized Authority may be consumed by decision processes; without authority a decision MUST NOT be protocol-recognized. |

---

## 2. Problem Statement

Many systems confuse capability with authority.

A person may be capable of approving a request because a user interface exposes an approval button, a workflow permits submission, or an access control rule grants a role. That does not mean the approval is recognized by governance, valid under policy, or acceptable for audit.

An AI system may be capable of issuing claims, producing reviews, validating documents, initiating workflows, or approving operational actions. That does not mean the claims, reviews, validations, workflows, or approvals are authoritative.

A service may be capable of executing a transaction. That does not mean the transaction was legitimate.

A team may be capable of deploying infrastructure. That does not mean the deployment was authorized.

A vendor may be capable of managing an operational process. That does not mean its actions are recognized outside the delegated operational boundary.

Without a separate Authority Layer, protocols collapse distinct questions into a single implementation-specific permission model:

| Confused concept | Resulting failure |
|---|---|
| Identity equals authority | A known subject is treated as legitimate in every context. |
| Role equals authority | A title or group membership silently substitutes for governed recognition. |
| Capability equals authority | Ability to perform an operation is treated as legitimacy of the outcome. |
| Standing equals authority | A subject's trusted state is treated as permission to affect decisions. |
| Ownership equals authority | Control over a resource is treated as legitimacy to alter protocol-recognized outcomes. |
| Administrative access equals authority | System operators acquire de facto constitutional power without recognition. |
| AI competence equals authority | Model capability is mistaken for legitimate agency. |

These failures create authority laundering, fake approvals, unreviewable decisions, zombie authority, governance capture, and policy bypass.

AOC therefore requires an Authority Layer. The Authority Layer MUST determine whether a subject's use of capability is recognized as legitimate under policy, governance, scope, constraints, and traceable lineage.

---

## 3. Authority Definition

Authority is policy-recognized legitimacy to perform, validate, approve, issue, review, govern, or influence protocol-recognized outcomes.

An Authority MUST identify:

- the AuthoritySubject that holds it;
- the AuthorityType being recognized;
- the AuthorityScope within which it applies;
- the AuthorityConstraints that limit its exercise;
- the Capability or capability eligibility consumed by recognition;
- the Standing, Claims, and Evidence that support eligibility;
- any Delegation basis, if authority is delegated;
- the policy under which recognition occurred;
- the governance authority or recognition authority that recognized it;
- the lifecycle state of the authority;
- the challenge and revocation status of the authority.

Authority is not:

| Concept | Why it is not authority |
|---|---|
| Evidence | Evidence supports interpretations but does not itself legitimize action. |
| Claims | Claims assert protocol propositions but do not by themselves confer legitimacy. |
| Standing | Standing indicates current usability of claims but does not itself authorize outcomes. |
| Capability | Capability enables or permits action but does not determine whether the action is recognized as legitimate. |
| Decision | Decision is an outcome produced under authority; it is not the authority itself. |

Authority is its own layer. A conformant implementation MUST NOT collapse Authority into evidence, claims, standing, capabilities, delegation, governance roles, resource ownership, system permissions, credentials, or decisions.

---

## 4. Authority Principles

Authority in AOC is governed by the following canonical principles.

| Principle | Requirement |
|---|---|
| Legitimacy | Authority MUST express legitimacy recognized by policy and governance. Mere power, access, ownership, capability, or practical ability MUST NOT be treated as authority. |
| Recognition | Authority MUST exist because it has been recognized by a valid recognition process. Claimed Authority MUST NOT influence decisions unless converted into Recognized Authority. |
| Traceability | Authority MUST be traceable to its holder, recognizer, policy, governance basis, scope, constraints, capability basis, standing basis, delegation basis where applicable, and lifecycle events. |
| Bounded Authority | Authority MUST be limited by explicit scope and constraints. Authority MUST NOT be global, unlimited, silent, or implied beyond its recognized boundary. |
| Revocability | Authority MUST be capable of restriction, suspension, expiration, revocation, or supersession. Authority that cannot be revoked is not conformant. |
| Governance | Authority MUST operate under governance-recognized rules. Governance MUST define authority types, recognition requirements, review procedures, challenge procedures, and revocation paths. |
| Accountability | Authority MUST preserve accountability for the authority holder, recognizer, delegator where applicable, reviewer, and governance body. Exercise of authority MUST be attributable and reviewable. |

These principles are constitutional. Implementations MAY add controls, metadata, registries, or enforcement mechanisms, but MUST NOT weaken these principles.

---

## 5. Authority Types

The following canonical Authority Types are defined. Implementations MAY introduce additional authority types. Domain-specific types MUST preserve these semantics and MUST NOT redefine canonical types in a conflicting way.

| Authority Type | Definition |
|---|---|
| Review Authority | Recognized legitimacy to review evidence, claims, standing outputs, capability decisions, delegations, authority recognitions, challenges, or decisions within a defined scope. |
| Approval Authority | Recognized legitimacy to approve, deny, condition, escalate, or return protocol-relevant requests, proposals, actions, transactions, or outcomes. |
| Issuance Authority | Recognized legitimacy to issue claims, attestations, credentials, evidence records, recognition records, or other protocol-recognized artifacts. |
| Verification Authority | Recognized legitimacy to verify evidence, claims, attestations, credentials, standing states, capability grants, authority records, or decision records. |
| Governance Authority | Recognized legitimacy to define, approve, amend, retire, or review policies, authority types, recognition frameworks, challenge procedures, or governance objects. |
| Delegation Authority | Recognized legitimacy to delegate standing-derived influence, capability, authority eligibility, review responsibility, governance participation, or operational responsibility when policy permits. |
| Operational Authority | Recognized legitimacy to perform operational actions such as deployment, configuration, incident response, process execution, resource allocation, or service operation. |
| AI Authority | Recognized legitimacy for an AI system to perform, validate, review, recommend, execute, or influence protocol-recognized outcomes within a supervised or autonomous scope. |
| Regulatory Authority | Recognized legitimacy derived from a regulatory, statutory, supervisory, compliance, or jurisdictional framework to validate, require, prohibit, review, or enforce outcomes. |
| Financial Authority | Recognized legitimacy to authorize, commit, approve, release, move, spend, allocate, or reconcile financial resources within monetary, risk, organizational, and policy boundaries. |

Future authority types are extensible. A new AuthorityType MUST define subject eligibility, scope model, constraints, recognition requirements, lifecycle, traceability requirements, delegation rules, challenge process, governance basis, and revocation semantics.

---

## 6. Authority Subject Model

An AuthoritySubject is a protocol subject eligible to hold authority under policy.

Potential AuthoritySubjects include:

- Person;
- Organization;
- Team;
- Vendor;
- Agent;
- Service;
- Project;
- Governance Body.

Additional subject types MAY be recognized by future RFCs or domain policy, provided they preserve identity, accountability, traceability, governance, and challengeability requirements.

An AuthoritySubject MUST NOT be confused with:

- the subject of evidence;
- the subject of a claim;
- the holder of standing;
- the holder of a capability;
- a delegator;
- a delegatee;
- a governance body;
- a resource owner;
- an operator with administrative access.

The same real-world entity MAY occupy multiple roles only when each role is independently supported and traceable. For example, an organization may be both an AuthoritySubject and a governance body if policy recognizes it as both. A person may hold a capability but lack authority. An AI agent may execute an operation but lack AI Authority to make the output recognized.

---

## 7. Recognized Authority

Recognized Authority is a first-class protocol concept.

Authority does not exist because it is claimed. Authority exists because it is recognized.

Claimed Authority is an assertion by a subject, system, credential, role, title, document, workflow, or operator that authority exists. Claimed Authority MAY be evaluated as evidence or as a claim, but it MUST NOT influence protocol-recognized decisions unless and until it becomes Recognized Authority.

Recognized Authority is authority that has passed a policy-recognized process and is recorded with sufficient traceability to prove its legitimacy, scope, constraints, lifecycle, and governance basis.

| Concept | Protocol status |
|---|---|
| Claimed Authority | A statement, assertion, title, role, credential, or representation that MAY support evaluation but MUST NOT by itself influence decisions. |
| Recognized Authority | A protocol-recognized authority state that MAY influence decisions within its scope and constraints. |

### 7.1 Recognition Requirements

Recognition Requirements MUST define what is necessary for Claimed Authority to become Recognized Authority. Requirements MAY include:

- verified identity of the AuthoritySubject;
- sufficient standing under an applicable StandingContext;
- one or more capability grants or capability eligibility findings;
- governance approval;
- delegated authority basis, if applicable;
- evidence and claim support;
- verification of issuer, attester, reviewer, or recognizer authority;
- policy conformance;
- conflict-of-interest review;
- jurisdictional validity;
- risk-tier review;
- temporal validity;
- registry entry;
- challenge window or challenge status.

Recognition MUST be explicit. Recognition MUST NOT be inferred solely from possession of a credential, role assignment, system access, employment status, ownership, administrative permission, or AI competence.

### 7.2 Recognition Revocation

Recognition Revocation is the removal, termination, or invalidation of recognized legitimacy. Recognition Revocation MUST update the authority lifecycle and MUST preserve revocation history.

Recognition Revocation MAY be triggered by:

- expiration;
- governance action;
- challenge outcome;
- policy change;
- evidence invalidation;
- claim revocation;
- standing degradation;
- capability suspension or revocation;
- delegation revocation;
- jurisdictional change;
- risk escalation;
- conflict-of-interest finding;
- fraud, compromise, or abuse.

Revoked recognition MUST NOT influence new decisions. Policy MUST define whether prior decisions remain valid, become suspended, require review, or become voidable.

### 7.3 Recognition Challenges

Recognition Challenges are protocol processes for contesting whether Recognized Authority was properly granted, remains valid, or is being exercised within its recognized boundary.

A Recognition Challenge MAY contest:

- the recognition basis;
- the authority holder;
- the recognizer;
- the policy applied;
- the governance basis;
- the scope;
- the constraints;
- the standing or capability prerequisites;
- the delegation chain;
- the evidence or claims supporting recognition;
- the lifecycle state.

A pending challenge MAY require no effect, warning, restriction, suspension, escalation, or emergency revocation depending on policy and risk tier.

### 7.4 Recognition Lineage

Recognition Lineage is the traceable chain proving why authority is recognized. Recognition Lineage MUST include:

- the Recognition Request;
- supporting evidence and claims;
- standing and capability prerequisites;
- delegation basis where applicable;
- recognition reviewers;
- approval outcome;
- recognizing governance authority;
- policy version;
- scope and constraints;
- lifecycle events;
- registry entry;
- challenges and outcomes;
- revocation or supersession records.

Recognition Lineage MUST be preserved even after authority expires, is revoked, or is superseded.

---

## 8. Authority Scope

Authority is never global.

Every Authority MUST define an AuthorityScope. An authority without scope is not conformant. The scope MUST be narrow enough to permit enforcement, audit, explanation, challenge, and revocation.

AuthorityScope MAY include:

| Scope Type | Description |
|---|---|
| Project-specific | Applies only to a named project, program, workflow, initiative, decision class, or bounded operational unit. |
| Jurisdiction-specific | Applies only within specified legal, regulatory, organizational, contractual, protocol, or geographic jurisdictions. |
| Capability-specific | Applies only to one or more identified capabilities, capability grants, capability classes, or action surfaces. |
| Monetary-specific | Applies only below, within, or above defined monetary, budget, transaction, exposure, liability, or resource thresholds. |
| Risk-specific | Applies only within defined risk tiers, risk classes, safety envelopes, assurance levels, or escalation thresholds. |
| Time-specific | Applies only during a defined start and end period, during a defined event window, or until an explicit lifecycle event. |
| Organization-specific | Applies only inside a specified organization, unit, consortium, governance body, vendor relationship, tenant, or relationship graph. |

An AuthoritySubject MUST NOT exercise authority outside AuthorityScope. A Decision MUST NOT consume authority outside AuthorityScope. A delegated authority MUST NOT exceed the scope of the delegator's authority or the delegation scope.

---

## 9. Authority Constraints

AuthorityConstraints are policy-governed limits that restrict when, how, by whom, for whom, and under what conditions authority may be exercised.

AuthorityConstraints MAY include:

| Constraint Type | Requirement |
|---|---|
| Temporal constraints | Authority MAY be limited by start time, end time, expiration, renewal period, waiting period, review interval, emergency duration, or event trigger. |
| Policy constraints | Authority MUST comply with applicable policy versions, eligibility rules, recognition criteria, conflict rules, escalation rules, and revocation rules. |
| Risk constraints | Authority MAY be limited by risk tier, safety class, criticality, exposure, impact, confidence threshold, assurance level, or required review. |
| Governance constraints | Authority MAY require governance approval, governance review, separation of duties, quorum, appeal availability, public notice, or registry inclusion. |
| Capability constraints | Authority MUST NOT exceed the capabilities or capability eligibility consumed by recognition. Capability degradation SHOULD trigger authority review. |
| Standing constraints | Authority MAY require standing thresholds, standing types, current standing snapshots, absence of negative standing, or standing freshness. |
| Jurisdiction constraints | Authority MAY be limited by legal, regulatory, organizational, contractual, market, federation, or protocol jurisdiction. |

Constraints MUST be explicit, traceable, and enforceable. Hidden constraints are not constitutional because subjects cannot understand, satisfy, audit, or challenge them. Hidden exemptions are likewise not constitutional because they permit authority laundering and policy bypass.

---

## 10. Authority Eligibility

Authority Eligibility defines who may hold authority.

A subject MAY hold authority only when policy recognizes that subject as eligible for the AuthorityType, AuthorityScope, and AuthorityConstraints at issue.

Eligibility requirements MAY include:

| Requirement | Description |
|---|---|
| Standing requirements | The subject MUST hold required standing states, standing thresholds, standing freshness, or standing history under applicable StandingContext. |
| Capability requirements | The subject MUST hold required capabilities or capability eligibility, and those capabilities MUST be current, scoped, and unconstrained for the requested authority. |
| Governance approval | A recognized governance authority MAY be required to approve authority eligibility or recognition. |
| Recognition process | The subject MUST complete the recognition process defined by authority policy. |
| Delegation approval | If authority is delegated, the delegation MUST be policy-permitted, bounded, accepted where required, and recognized. |
| Review approval | Independent review MAY be required for high-risk, rights-affecting, financial, regulatory, AI, or governance authority. |
| Policy compliance | The subject MUST comply with applicable policy, conflict-of-interest rules, jurisdictional rules, risk controls, and lifecycle obligations. |

Eligibility is not authority. Eligibility is a prerequisite. A subject that satisfies eligibility MAY be recognized, but MUST NOT be treated as authoritative until recognition occurs.

---

## 11. Authority Lifecycle

Authority MUST have a lifecycle. Lifecycle state determines whether authority may be used by decision processes.

The canonical AuthorityLifecycle states are:

| State | Meaning |
|---|---|
| Proposed | Authority has been requested, claimed, suggested, or prepared but has not entered recognition review. It MUST NOT influence decisions. |
| Pending Recognition | Authority is under recognition review. It MUST NOT influence decisions unless policy explicitly permits provisional restricted use. |
| Recognized | Authority has been recognized and MAY influence decisions within scope and constraints. |
| Restricted | Authority remains recognized but is narrowed by temporary or permanent constraints. It MAY influence decisions only within the restricted boundary. |
| Suspended | Authority is temporarily disabled pending review, challenge, risk resolution, policy update, or governance action. It MUST NOT influence decisions unless policy defines emergency exceptions. |
| Expired | Authority has passed its temporal validity or renewal requirement. It MUST NOT influence new decisions. |
| Revoked | Authority recognition has been terminated. It MUST NOT influence new decisions. |
| Superseded | Authority has been replaced by a newer authority record, policy version, recognition decision, or governance framework. Decision use MUST follow supersession policy. |

Lifecycle transitions MUST be attributable, traceable, policy-governed, and challengeable where policy permits. Lifecycle history MUST NOT be overwritten.

---

## 12. Authority Traceability

Authority Traceability extends RFC-005-H1 Standing Traceability to the Authority Layer.

Every authority MUST answer:

- Who holds it?
- Why does the holder have it?
- Who recognized it?
- Under what policy was it recognized?
- Under what governance framework was it recognized?
- When was it proposed, reviewed, recognized, restricted, suspended, expired, revoked, or superseded?
- What scope applies?
- What constraints apply?
- What capability or capability eligibility does it consume?
- What standing states support the capability or eligibility?
- What claims and evidence support those standing states?
- What delegation basis exists, if any?
- What challenges have been filed and resolved?
- What decisions have consumed this authority?

A conformant implementation MUST preserve enough lineage, dependency, and explanation data to prove why authority existed at any historical timestamp. Authority MUST NOT be implemented as a mutable field that can be edited without evidence, policy, lifecycle event, and governance traceability.

---

## 13. Authority Dependency Graph

Authority depends on upstream trust, governance, and policy inputs and is consumed by downstream decisions.

The canonical dependency graph is:

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

Authority also depends on governance, policies, and challenges:

```text
Governance
  ↓
Policies
  ↓
Recognition Frameworks
  ↓
Authority
  ↑
Challenges
```

A complete Authority Dependency Graph SHOULD include:

- Evidence records;
- Claims;
- Attestations and verification results where applicable;
- Standing snapshots, deltas, and lineage;
- Delegation records and delegation chains where applicable;
- Capability grants, capability eligibility, and capability constraints;
- Authority recognition records;
- Authority scope and constraints;
- Governance bodies, governance authorities, and governance decisions;
- Policy versions and recognition frameworks;
- Challenges, appeals, and outcomes;
- Decisions that consumed the authority.

If any upstream dependency is invalidated, suspended, revoked, expired, challenged, or superseded, policy MUST define whether dependent authority remains recognized, becomes restricted, becomes suspended, requires review, expires, is revoked, or is superseded.

---

## 14. Authority Recognition Process

Authority Recognition is the process by which Claimed Authority or authority eligibility becomes Recognized Authority.

A conformant Authority Recognition Process MUST include the following concepts.

| Process Concept | Requirement |
|---|---|
| Recognition Request | A traceable request identifying the AuthoritySubject, AuthorityType, AuthorityScope, AuthorityConstraints, capability basis, standing basis, evidence and claim support, delegation basis where applicable, requested duration, and applicable policy. |
| Recognition Review | A policy-governed review that evaluates eligibility, capability basis, standing basis, governance basis, conflicts, risk, jurisdiction, constraints, delegation, and evidence sufficiency. |
| Recognition Approval | A governance-recognized decision that approves, denies, restricts, escalates, or returns the request. Approval MUST identify the recognizing authority and policy basis. |
| Recognition Registry | A registry entry that records recognized authority, lifecycle state, scope, constraints, lineage, review outcome, recognizing authority, and revocation status. |
| Recognition Lifecycle | The state model governing proposed, pending, recognized, restricted, suspended, expired, revoked, and superseded authority. |
| Recognition Revocation | A policy-governed process that terminates, restricts, suspends, or supersedes recognition and records revocation lineage. |

Recognition MUST fail closed. If the recognition basis cannot be proven, the protocol MUST NOT treat the authority as recognized.

---

## 15. Authority Delegation

Authority MAY be delegable only when policy permits.

Authority Delegation is the policy-governed extension of recognized authority eligibility from a delegator to a delegatee within explicit boundaries. It is valid only when the applicable governance framework, authority policy, and delegation policy permit the delegator to delegate authority and permit the delegatee to receive it.

Authority Delegation MUST conform to RFC-005-H5 Delegated Standing and MUST preserve the separation between standing, capability, authority, and decision.

### 15.1 Authority Delegation

An Authority Delegation MUST identify:

- the delegator;
- the delegatee;
- the delegator's Recognized Authority;
- the AuthorityType being delegated;
- the decisions or decision classes covered;
- the DelegationScope and AuthorityScope;
- temporal, monetary, risk, jurisdictional, organizational, operational, and policy constraints;
- whether sub-delegation is prohibited or permitted;
- whether acceptance is required;
- the governance approval or recognition process;
- revocation rules;
- challenge rules;
- audit requirements.

### 15.2 Authority Inheritance

Authority inheritance MUST NOT be assumed. A delegatee does not inherit all authority held by the delegator. A delegatee MAY exercise only the authority boundary explicitly delegated and recognized under policy.

Authority inheritance MUST be narrower than or equal to the delegator's recognized authority. A delegator MUST NOT delegate authority that the delegator does not hold, that policy does not permit to be delegated, or that governance has restricted.

### 15.3 Authority Boundaries

Authority Boundaries define the outer limits of delegated authority. Boundaries MUST include scope, constraints, lifecycle state, delegation chain, policy basis, and revocation propagation.

A delegated authority MUST NOT exceed:

- the delegator's authority;
- the delegator's capability basis;
- the delegator's standing-derived eligibility;
- the delegation policy;
- the authority policy;
- the governance framework;
- the recognized scope and constraints.

### 15.4 Authority Revocation Propagation

Revocation of an upstream authority, delegation, capability, standing state, claim, evidence record, governance recognition, or policy basis MUST trigger review of dependent delegated authority.

Policy MUST define whether propagation causes immediate revocation, suspension, restriction, expiration, warning, escalation, or review. High-risk, rights-affecting, financial, regulatory, safety-critical, AI, or governance authority SHOULD use conservative propagation rules.

---

## 16. Authority Challenges

Authority Challenges are protocol processes for contesting authority recognition, scope, legitimacy, policy compliance, delegation basis, governance basis, lifecycle state, or exercise.

An Authority Challenge MAY challenge:

| Challenge Target | Description |
|---|---|
| Recognition | Whether the authority was properly recognized, remains recognized, or was recognized by a valid authority. |
| Scope | Whether the authority applies to the project, jurisdiction, capability, monetary amount, risk tier, time period, organization, or decision class. |
| Legitimacy | Whether the authority is legitimate under policy, governance, evidence, standing, capability, delegation, or conflict rules. |
| Policy Compliance | Whether recognition or exercise complied with applicable policy versions and constraints. |
| Delegation Basis | Whether delegated authority was permitted, accepted where required, properly bounded, and within the delegator's authority. |
| Governance Basis | Whether the governance authority, recognition framework, review body, or registry entry is valid and traceable. |

Authority Challenge outcomes MAY include:

- no change;
- correction;
- additional evidence required;
- scope restriction;
- temporary suspension;
- revocation;
- supersession;
- decision review;
- downstream decision invalidation or remediation where policy requires;
- governance escalation;
- policy amendment recommendation.

Challenges MUST be traceable, reviewable, and governed. A subject MUST NOT need the challenged authority in order to challenge that authority unless policy defines a narrow, justified standing or eligibility requirement for abuse prevention.

---

## 17. Authority Governance

Authority Governance defines who governs authority.

Authority Governance MUST be performed by Recognized Authority acting within governance scope. Administrative access, product ownership, operational control, organizational seniority, or market dominance MUST NOT substitute for governance authority.

Authority Governance MUST define:

- who may create AuthorityTypes;
- who may approve AuthorityTypes;
- who may retire AuthorityTypes;
- who may approve recognition frameworks;
- who may recognize authority;
- who may review authority recognition requests;
- who may adjudicate authority challenges;
- who may suspend or revoke authority;
- who may define authority registries;
- who may audit authority records;
- who may approve delegation frameworks;
- who may resolve conflicts between governance bodies.

Authority Governance builds on RFC-005-H3 Standing Governance. RFC-005-H3 establishes Recognized Authority as the central concept of governance legitimacy. This RFC applies and generalizes that concept to protocol-recognized authority across review, approval, issuance, verification, governance, delegation, operational, AI, regulatory, and financial contexts.

---

## 18. Authority Registry

The Authority Registry is the canonical record of Recognized Authority.

An Authority Registry MUST store recognized authorities or references sufficient to reconstruct recognized authorities. It MUST preserve lineage, revocation history, governance provenance, and lifecycle events.

The Authority Registry SHOULD record:

- Authority identifier;
- AuthoritySubject;
- AuthorityType;
- AuthorityScope;
- AuthorityConstraints;
- lifecycle state;
- recognition request;
- recognition review;
- recognition approval;
- recognizing authority;
- governance framework;
- policy version;
- capability basis;
- standing basis;
- evidence and claim lineage references;
- delegation basis where applicable;
- effective period;
- challenge history;
- revocation history;
- supersession history;
- decisions that consumed the authority, where policy permits recording such linkage.

An authority not present in the applicable Authority Registry, or not reconstructable from the registry and its lineage references, MUST NOT be treated as Recognized Authority unless policy defines an emergency recognition model. Emergency recognition MUST be time-bounded, traceable, reviewable, and registry-recorded after the fact.

---

## 19. Authority Guarantees

The Authority Model provides the following protocol guarantees.

| Guarantee | Requirement |
|---|---|
| No authority without recognition | Claimed Authority MUST NOT influence decisions unless recognized. |
| No authority without traceability | Authority MUST be traceable to holder, recognizer, policy, governance, scope, constraints, upstream dependencies, and lifecycle. |
| No authority without governance | Authority MUST operate under governance-recognized rules and review processes. |
| No authority without scope | Authority MUST have explicit scope. Global or silent authority is not conformant. |
| No authority without policy | Authority MUST be recognized, constrained, exercised, challenged, and revoked under policy. |
| No hidden authority | Authority MUST be visible to the processes that evaluate, audit, challenge, or consume it. Hidden authority MUST NOT legitimize decisions. |
| No orphan authority | Authority MUST have a living or historical recognition lineage. Authority without recognizer, policy, governance basis, or upstream dependency MUST NOT be recognized. |

These guarantees protect the protocol from confusing power with legitimacy.

---

## 20. Security Implications

Authority is a high-value protocol layer. Compromise or confusion at this layer can convert technical ability into illegitimate decisions.

### 20.1 Authority laundering

Authority laundering occurs when a subject attempts to convert role, access, ownership, capability, standing, delegation, or administrative control into recognized authority without a valid recognition process.

Protocol response: Authority MUST require recognition, traceability, scope, policy, governance, and registry lineage. Capability MUST NOT directly grant authority.

### 20.2 Fake authority

Fake authority occurs when a subject asserts authority through title, document, credential, interface state, AI output, or organizational claim without recognized legitimacy.

Protocol response: Claimed Authority MUST NOT influence decisions. Only Recognized Authority MAY influence decisions.

### 20.3 Recognition abuse

Recognition abuse occurs when a recognizer grants authority outside policy, outside scope, with conflicts of interest, without sufficient evidence, or to favored subjects.

Protocol response: Recognition MUST be challengeable, governed, traceable, and auditable. High-risk recognition SHOULD require independent review or separation of duties.

### 20.4 Governance capture

Governance capture occurs when a governance body, vendor, market participant, or administrative operator controls authority rules for self-benefit.

Protocol response: Authority Governance MUST be based on Recognized Authority, transparent rules, challenge processes, auditability, and conflict controls.

### 20.5 Authority escalation

Authority escalation occurs when a subject exercises authority beyond scope, beyond constraints, beyond capability, beyond delegation, or beyond policy.

Protocol response: AuthorityScope and AuthorityConstraints MUST be enforced. Decision processes MUST verify authority at the point of decision.

### 20.6 Authority inheritance abuse

Authority inheritance abuse occurs when delegated authority is treated as if the delegatee inherited all authority of the delegator.

Protocol response: Authority inheritance MUST NOT be assumed. Delegated authority MUST be explicit, bounded, traceable, and narrower than or equal to the delegator's authority.

### 20.7 AI authority abuse

AI authority abuse occurs when AI competence, tool access, output confidence, prompt instruction, or autonomous execution is treated as authority.

Protocol response: AI Authority MUST be recognized, scoped, supervised where required, traceable, revocable, and constrained. An AI system MUST NOT self-create authority.

### 20.8 Zombie authority

Zombie authority occurs when expired, revoked, superseded, suspended, or upstream-invalid authority continues to influence decisions.

Protocol response: Decision processes MUST check lifecycle state and upstream dependency state. Revocation propagation MUST be defined by policy.

### 20.9 Policy bypass

Policy bypass occurs when authority is recognized or exercised outside required policy, through emergency exceptions, administrative override, unregistered delegation, or hidden exemptions.

Protocol response: Policy basis MUST be recorded. Emergency exceptions MUST be time-bounded, traceable, reviewable, and challengeable.

---

## 21. Authority vs Capability

Capability is not authority.

Capability answers: **What may this subject do under policy in this scope?**

Authority answers: **Does the protocol recognize this subject's action or validation as legitimate for this outcome?**

Capabilities enable action. Authority legitimizes action.

Without capability, action cannot occur in a conformant system. Without authority, action is not recognized.

| Capability | Authority |
|---|---|
| Can Review | Review Counts |
| Can Vote | Vote Recognized |
| Can Issue Claim | Claim Accepted |
| Can Approve | Approval Recognized |
| Can Execute Transaction | Transaction Legitimate |
| Can Deploy Service | Deployment Authorized |
| Can Validate Evidence | Validation Accepted |
| Can Recommend | Recommendation May Influence Decision |

A subject may have Review Capability but lack Review Authority for a specific claim type. In that case the subject may perform a review activity, but the review MUST NOT count as an authoritative review for decision purposes.

A subject may have Voting Capability but lack recognized Governance Authority for a specific governance process. In that case the subject may cast a vote in a system, but the vote MUST NOT be counted as protocol-recognized unless authority exists.

An AI system may have Claim Issuance Capability but lack Issuance Authority. In that case the AI system may produce a claim-like artifact, but the claim MUST NOT be accepted as authoritative.

Capability MUST NOT directly grant authority. Authority recognition MUST consume capability and apply recognition, governance, scope, constraints, and policy.

---

## 22. Authority vs Standing

Standing is not authority.

Standing answers: **What is the current protocol state of this subject in this context?**

Authority answers: **What outcome-affecting legitimacy has been recognized for this subject in this scope?**

Standing is an evidence-derived interpretation. Authority is policy-recognized legitimacy.

High Standing does not necessarily create authority. A subject may be a Verified Professional, Trusted Vendor, Trusted AI Agent, or Healthy Project and still lack authority to approve, issue, validate, govern, or decide in a specific context.

Authority may exist with limited standing when policy permits. For example, a narrowly scoped operational authority may be recognized for a service account or project with limited standing if governance has approved the authority, required controls are satisfied, the capability basis exists, and the scope is constrained.

| Standing scenario | Authority result |
|---|---|
| High Standing, No Authority | The subject is trusted or valid in some context but cannot produce recognized outcomes for the requested action. |
| Authority, Limited Standing | The subject may hold narrow authority if policy permits and compensating constraints, governance approval, or delegation basis exist. |
| Degraded Standing | Authority may become restricted, suspended, revoked, or subject to review depending on policy. |
| Expired Standing | Authority relying on that standing MUST be reviewed and may become invalid. |

Standing MUST NOT directly grant authority. Authority recognition MAY require standing, but standing remains an upstream dependency rather than the authority itself.

---

## 23. Authority and Decisions

A Decision is an outcome recognized through authority.

A Decision may approve, deny, issue, validate, revoke, suspend, deploy, grant, escalate, allocate, commit, or otherwise alter protocol-recognized state or organizational state. A Decision is legitimate only when produced under Recognized Authority within scope and constraints.

Authority is consumed by decision processes.

A decision process MUST verify:

- the AuthoritySubject;
- the AuthorityType;
- the AuthorityScope;
- the AuthorityConstraints;
- the lifecycle state;
- the recognition lineage;
- the capability basis;
- the standing basis where required;
- the delegation basis where applicable;
- the policy basis;
- the governance basis;
- the challenge state;
- the revocation state;
- the decision class being produced.

Without authority, a decision is not recognized. It may be an attempted action, a draft outcome, a system event, an operational record, or evidence of unauthorized activity, but it MUST NOT be treated as a protocol-recognized decision.

Decision processes MUST consume only Recognized Authority. Claimed Authority MUST NOT be consumed except as evidence for evaluating whether recognition should occur.

---

## 24. Implementation Guidance

This RFC introduces the following canonical concepts. These concepts are protocol concepts, not required class names, schema names, API resources, or product objects.

| Concept | Protocol meaning |
|---|---|
| Authority | Policy-recognized legitimacy to perform, validate, approve, issue, review, govern, or influence protocol-recognized outcomes. |
| AuthorityType | A canonical or domain-specific class of authority such as Review Authority, Approval Authority, Issuance Authority, Verification Authority, Governance Authority, Delegation Authority, Operational Authority, AI Authority, Regulatory Authority, or Financial Authority. |
| AuthoritySubject | A person, organization, team, vendor, agent, service, project, governance body, or other policy-recognized subject eligible to hold authority. |
| RecognizedAuthority | Authority that has passed a policy-recognized process and is traceably recorded as legitimate within scope and constraints. |
| AuthorityScope | The explicit project, jurisdiction, capability, monetary, risk, time, organization, or other boundary within which authority applies. |
| AuthorityConstraint | A temporal, policy, risk, governance, capability, standing, jurisdictional, delegation, monetary, operational, or other limit on authority. |
| AuthorityLifecycle | The state model for proposed, pending recognition, recognized, restricted, suspended, expired, revoked, and superseded authority. |
| AuthorityChallenge | A governed challenge contesting recognition, scope, legitimacy, policy compliance, delegation basis, governance basis, lifecycle, or exercise. |
| AuthorityRegistry | The canonical record or reconstructable registry of recognized authorities, lineage, lifecycle, challenges, revocations, and governance provenance. |
| AuthorityRecognition | The process by which Claimed Authority or eligibility becomes Recognized Authority. |

Implementations SHOULD fail closed when authority cannot be established. Implementations SHOULD preserve historical authority records even after expiration, revocation, or supersession. Implementations SHOULD expose sufficient explanation to support audit, governance review, and challenge without exposing information prohibited by policy, confidentiality obligations, or law.

---

## 25. Future RFC Dependencies

This RFC depends on and informs the following future RFCs.

| RFC | Relationship |
|---|---|
| RFC-005-H6 Standing Algorithms | Defines standing algorithm semantics that authority recognition may consume through standing prerequisites, thresholds, freshness, decay, and challenge outcomes. |
| RFC-005-H9 Decision Framework | Should define how decisions consume Recognized Authority and how decision validity responds to authority restriction, suspension, revocation, or challenge. |
| RFC-005-H10 Governance Registry (potential) | May define registry models for governance bodies, governance authorities, recognition frameworks, policy versions, and governance provenance. |
| RFC-005-H11 Governance Challenges (potential) | May define detailed challenge processes for governance objects that recognize, constrain, or revoke authority. |
| RFC-005-H12 Governance Delegation (potential) | May define delegation of governance authority and the constraints on sub-delegation, oversight, and governance revocation. |
| RFC-005-H13 Delegation Chains (potential) | May define chain semantics for multi-hop delegation affecting capability and authority recognition. |
| RFC-005-H14 Authority Registry (potential) | May define the concrete protocol registry model for recording Recognized Authority, lineage, lifecycle, revocations, and decision consumption references. |

Future RFCs MUST preserve the constitutional separation between capability, authority, and decision.

---

## 26. Acceptance Criteria

A conformant Authority Model satisfies the following checklist:

- [ ] It defines Authority as policy-recognized legitimacy to perform, validate, approve, issue, review, govern, or influence protocol-recognized outcomes.
- [ ] It states that Authority is not power, capability, standing, ownership, evidence, claims, or decisions.
- [ ] It places Authority between Capability and Decision in the canonical constitutional chain.
- [ ] It states that capabilities enable action and authority legitimizes action.
- [ ] It defines Recognized Authority as a first-class protocol concept.
- [ ] It distinguishes Claimed Authority from Recognized Authority.
- [ ] It requires that only Recognized Authority influence decisions.
- [ ] It defines Authority Principles: Legitimacy, Recognition, Traceability, Bounded Authority, Revocability, Governance, and Accountability.
- [ ] It defines canonical Authority Types: Review, Approval, Issuance, Verification, Governance, Delegation, Operational, AI, Regulatory, and Financial Authority.
- [ ] It defines AuthoritySubject and examples including Person, Organization, Team, Vendor, Agent, Service, Project, and Governance Body.
- [ ] It states that authority is never global and requires AuthorityScope.
- [ ] It defines project, jurisdiction, capability, monetary, risk, time, and organization scopes.
- [ ] It defines temporal, policy, risk, governance, capability, standing, and jurisdiction constraints.
- [ ] It defines Authority Eligibility and distinguishes eligibility from authority.
- [ ] It defines AuthorityLifecycle states: Proposed, Pending Recognition, Recognized, Restricted, Suspended, Expired, Revoked, and Superseded.
- [ ] It defines traceability requirements sufficient to answer who holds authority, why, who recognized it, under what policy and governance, when, what scope, and what constraints.
- [ ] It defines the Authority Dependency Graph across Evidence, Claims, Standing, Delegation, Capabilities, Authority, Decisions, Governance, Policies, and Challenges.
- [ ] It defines an Authority Recognition Process including request, review, approval, registry, lifecycle, and revocation.
- [ ] It defines Authority Delegation and requires policy permission, explicit boundaries, inheritance limits, and revocation propagation.
- [ ] It defines Authority Challenges covering recognition, scope, legitimacy, policy compliance, delegation basis, and governance basis.
- [ ] It defines Authority Governance and references RFC-005-H3 Standing Governance.
- [ ] It defines the Authority Registry and its purposes.
- [ ] It defines guarantees: no authority without recognition, traceability, governance, scope, policy, visibility, and lineage.
- [ ] It covers security implications including authority laundering, fake authority, recognition abuse, governance capture, authority escalation, inheritance abuse, AI authority abuse, zombie authority, and policy bypass.
- [ ] It explicitly explains Authority vs Capability.
- [ ] It explicitly explains Authority vs Standing.
- [ ] It explains how Authority influences Decisions.
- [ ] It remains implementation-neutral and avoids UI, platform-specific, or product-specific models.

## Conclusion

Authority is the constitutional legitimacy layer of the AOC Protocol.

It exists because the ability to act is not the same as the legitimacy of action. Capabilities enable action. Authority legitimizes action. Decisions consume authority. Without capability, action cannot occur in a conformant system. Without authority, action is not recognized.

The central contribution of this RFC is the elevation of Recognized Authority to a first-class protocol concept. Claimed Authority may be evidence. Recognized Authority may influence decisions. The protocol MUST distinguish the two.

Authority = Recognized legitimacy to perform or validate specific classes of actions under policy.
