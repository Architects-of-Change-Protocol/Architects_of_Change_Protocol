# RFC-005-H2 — Standing Engine

| Field | Value |
|---|---|
| RFC Number | 005-H2 |
| Title | Standing Engine |
| Status | Draft |
| Category | Core Protocol Extension |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-03 |
| Supersedes | — |
| Related | RFC-004 Evidence Layer v1.0, RFC-005 AOC Claims Framework, RFC-005-H1 Standing Traceability |

---

## Abstract

This document defines the Standing Engine for the AOC Protocol. The Standing Engine is the deterministic evaluation system that transforms evidence and claims into standing states under explicit standing context, policy context, and algorithm version. It extends RFC-004, RFC-005, and RFC-005-H1 by specifying how standing is computed, how standing remains contextual and challenge-aware, how standing decays, how standing evolves, and how standing outputs are consumed by capability decisions without directly granting capability.

The Standing Engine does not define a database schema, API, runtime engine, scoring product, reputation market, user interface, or implementation-specific algorithm. It defines the protocol requirements that any conformant standing computation implementation must satisfy.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Standing Engine Definition](#3-standing-engine-definition)
4. [Standing Taxonomy](#4-standing-taxonomy)
5. [Standing Context](#5-standing-context)
6. [Standing Subject](#6-standing-subject)
7. [Standing Composition](#7-standing-composition)
8. [Standing States](#8-standing-states)
9. [Standing Confidence](#9-standing-confidence)
10. [Standing Decay](#10-standing-decay)
11. [Standing Computation](#11-standing-computation)
12. [Standing Recalculation Triggers](#12-standing-recalculation-triggers)
13. [Standing Simulation](#13-standing-simulation)
14. [Standing Explanation](#14-standing-explanation)
15. [Standing Dependency Graph](#15-standing-dependency-graph)
16. [Standing Governance](#16-standing-governance)
17. [Capability Mapping](#17-capability-mapping)
18. [Standing Engine Guarantees](#18-standing-engine-guarantees)
19. [Security Implications](#19-security-implications)
20. [Implementation Guidance](#20-implementation-guidance)
21. [Future RFC Dependencies](#21-future-rfc-dependencies)
22. [Acceptance Criteria](#22-acceptance-criteria)

---

## 1. Executive Summary

The Standing Engine transforms evidence and claims into standing states.

Standing is contextual. The same evidence and claims may produce different standing in different domains, jurisdictions, risk tiers, policy scopes, or decision contexts.

Standing is derived. It is produced from canonical evidence, evidence lifecycle state, formal claims, claim standing, authority context, challenge state, policy context, and algorithm version.

Standing is never manually edited. A conformant implementation MUST NOT expose standing as an administrative field that can be directly changed. Standing MUST be computed. If a governance actor wishes to affect standing, that actor MUST do so by creating, updating, challenging, invalidating, or superseding evidence, claims, policies, or algorithms through authorized protocol events. The new standing output is then produced by deterministic recomputation.

The Standing Engine establishes the Standing Layer within the AOC architectural chain:

```text
Evidence Layer
  ↓
Claims Layer
  ↓
Standing Layer
  ↓
Capability Layer
```

At protocol level:

| Layer | Definition | Primary question |
|---|---|---|
| Evidence | Observed or attested facts. | What facts, artifacts, observations, events, or proofs exist? |
| Claims | Assertions supported by evidence. | What formal statements are asserted about a subject? |
| Standing | Current interpretation of claims and evidence. | What is the current protocol state of the subject in this context? |
| Capabilities | Permissions, authority, access, delegation, governance powers, or actions. | What actions may be considered or invoked under policy? |

Standing NEVER directly grants capability. Capability decisions consume standing through a separate capability engine, authorization policy, or governance process. A standing state may support, weaken, block, condition, or require review for a capability decision, but standing is not itself a permission.

---

## 2. Problem Statement

Evidence alone is insufficient. Evidence records observed or attested facts, but evidence does not decide what interpretation should be drawn, what context matters, what policy applies, whether the evidence is current, or whether a disputed artifact should be included, discounted, suspended, or excluded.

Claims alone are insufficient. A claim is a formal statement asserted about a subject, but claim presence does not establish truth, current usability, authority, or operational trust. RFC-005 requires claims to be supported, attested, verified, evaluated for standing, and consumed by policy before they can participate in authority.

Organizations need interpretable protocol states. Humans, systems, auditors, governance bodies, market makers, and AI agents need a way to interpret evidence and claims as current state without collapsing that state into opaque reputation or manually edited labels.

Examples of interpretable standing states include:

- Verified Professional;
- Trusted Vendor;
- Compliant Entity;
- Healthy Project;
- Verified Identity;
- Trusted AI Agent.

Standing exists to provide interpretable protocol state. It answers questions such as:

- Is this subject currently verified for this purpose?
- Is this vendor currently trusted under this procurement policy?
- Is this project currently healthy under this delivery governance context?
- Is this AI agent currently trusted for autonomous execution under this risk tier?
- Is this professional credential currently relevant to the requested action?

Standing differs from claims because claims are formal statements and standing is the current interpretation of those statements and their supporting evidence under context and policy.

Standing differs from reputation because reputation is often a score, market signal, or social judgment. Standing is a deterministic, explainable, reproducible, challenge-aware, policy-aware, and context-aware protocol state.

Standing differs from capability because capability is a bounded permission or action surface derived by policy. Standing may influence capability decisions, but standing MUST NOT itself grant access, authority, delegation, governance power, or execution rights.

---

## 3. Standing Engine Definition

The Standing Engine is a deterministic evaluation system that transforms evidence and claims into standing states.

A conformant Standing Engine MUST evaluate standing as a function of explicit inputs:

```text
Standing = f(
  EvidenceSet,
  ClaimSet,
  StandingContext,
  PolicyContext,
  AlgorithmVersion
)
```

### 3.1 EvidenceSet

EvidenceSet is the set of evidence items considered for standing computation. It includes included evidence, excluded evidence, evidence lifecycle states, evidence authority context, verification records, timestamps, challenges, invalidations, revocations, expirations, supersessions, and canonical evidence references.

EvidenceSet MUST be traceable to RFC-004 evidence semantics. Evidence MAY be direct or indirect, human-produced or machine-produced, digital or physical, but it MUST have sufficient provenance and lifecycle state to support protocol interpretation.

### 3.2 ClaimSet

ClaimSet is the set of formal statements asserted about the StandingSubject that may affect standing. It includes claim type, claim subject, claim issuer, claim value or statement, temporal boundaries, supporting assertion or evidence references, attestation references, verification results, claim standing, challenges, invalidations, and supersessions.

ClaimSet MUST be interpreted consistently with RFC-005. A claim MUST NOT be treated as automatically true merely because it exists.

### 3.3 StandingContext

StandingContext is the domain-specific and purpose-specific context in which standing is evaluated. It identifies the question the standing output is intended to answer, including standing type, subject, scope, domain, jurisdiction, risk tier, time of evaluation, capability mapping context, and other contextual constraints.

StandingContext is mandatory. A standing result without context is not conformant.

### 3.4 PolicyContext

PolicyContext is the versioned governance, authorization, compliance, risk, or operational policy used to interpret evidence and claims. It defines eligibility rules, thresholds, required authorities, decay behavior, challenge behavior, temporal windows, exclusion rules, review requirements, and output mappings.

PolicyContext is mandatory. A standing result without policy is not conformant.

### 3.5 AlgorithmVersion

AlgorithmVersion is the exact version of the evaluation logic used to compute standing. It may represent rules, thresholds, deterministic scoring functions, qualitative decision trees, aggregation logic, decay functions, or other deterministic computation methods.

AlgorithmVersion MUST be recorded in every StandingSnapshot and StandingDelta. Algorithm changes MUST be visible and traceable, as required by RFC-005-H1.

---

## 4. Standing Taxonomy

StandingType is the protocol-recognized category of standing being computed. StandingType defines the semantic family of the interpretation, not merely a label for a score.

A Standing Engine MAY support multiple StandingTypes. Each StandingType MUST define its subject scope, eligible evidence, eligible claims, policy context, algorithm version, output states, confidence semantics, explanation requirements, and capability mapping expectations.

Canonical StandingTypes include:

| StandingType | Meaning |
|---|---|
| Identity Standing | Interpretation of identity evidence, identity claims, verification confidence, source authority, and credential usability. |
| Trust Standing | Interpretation of whether a subject satisfies trust requirements for a defined relationship, domain, or risk context. |
| Compliance Standing | Interpretation of whether a subject, process, artifact, or organization satisfies applicable policy, legal, regulatory, or governance controls. |
| Operational Standing | Interpretation of runtime, project, process, service, or execution health. |
| Capability Standing | Interpretation of whether standing evidence and claims may support capability derivation under policy. |
| Governance Standing | Interpretation of governance participation, delegation, mandate, quorum, review, approval, or decision-readiness state. |
| Reputation Standing | Interpretation of reputation-relevant evidence under traceable protocol rules; it MUST NOT collapse into an opaque or mutable reputation score. |
| Project Standing | Interpretation of project health, delivery readiness, PMO confidence, risk posture, or execution maturity. |
| Vendor Standing | Interpretation of vendor trustworthiness, onboarding readiness, contract performance, risk posture, or renewal eligibility. |
| Professional Standing | Interpretation of professional qualification, credential relevance, employment eligibility, certification state, or role-specific readiness. |
| AI Agent Standing | Interpretation of AI agent operational trust, safe execution readiness, runtime compliance, supervision sufficiency, or delegated action readiness. |

Future StandingTypes are extensible. Extensions MUST NOT redefine standing in a way that conflicts with RFC-005 or RFC-005-H1. New StandingTypes MUST preserve determinism, explainability, reproducibility, challenge awareness, policy awareness, context awareness, and traceability.

---

## 5. Standing Context

StandingContext is the explicit context under which standing is computed.

The same evidence may produce different standing under different contexts. Context sensitivity is mandatory because evidence is rarely globally meaningful. Evidence has scope, domain relevance, temporal relevance, authority relevance, and policy relevance.

Example:

| Evidence | Context | Result |
|---|---|---|
| PMP Certification | Project Management | High Standing |
| PMP Certification | Cybersecurity | Neutral Standing |

A PMP Certification may strongly support Professional Standing in a project management context because the evidence is relevant to project management competency. The same certification may have no meaningful impact on cybersecurity standing because the policy context does not treat project management certification as evidence of cybersecurity capability.

A StandingContext SHOULD identify:

- standing type;
- standing subject;
- evaluation purpose;
- domain;
- jurisdiction;
- organization or governance scope;
- risk tier;
- evaluation timestamp;
- intended capability mapping context;
- relevant policy family;
- applicable authority assumptions;
- challenge handling mode;
- temporal horizon, when future decay or lookback windows matter.

A Standing Engine MUST NOT emit canonical standing without StandingContext. A context-free standing output is an orphan interpretation and is not conformant.

---

## 6. Standing Subject

StandingSubject is the protocol-recognized subject to which standing belongs.

Standing always belongs to a subject. A standing state without a subject is not meaningful and is not conformant.

Examples of StandingSubject include:

- Person;
- Organization;
- Vendor;
- Project;
- Team;
- AI Agent;
- Credential;
- Policy Object;
- Capability Object.

A StandingSubject SHOULD be identified with a stable subject reference appropriate to the implementation domain. The subject reference SHOULD support traceability to identity, evidence, claims, authority context, and governance scope where applicable.

StandingSubject MUST NOT be confused with evidence issuer, claim issuer, attester, verifier, reviewer, or capability grantee unless those roles are explicitly the same subject under the relevant context.

---

## 7. Standing Composition

Standing is a composition layer.

The AOC standing composition chain is:

```text
Evidence → Claims
Claims → Standing
Standing → Capability
```

In the broader RFC-005 constitutional chain, standing participates in:

```text
Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision
```

Standing is not a storage layer. It does not replace evidence repositories, claim registries, credential stores, audit logs, or governance records.

Standing is not a raw evidence layer. It does not merely list documents, artifacts, observations, or attestations.

Standing is not a claim layer. It does not assert a new fact merely because claims exist. It interprets evidence and claims under context and policy.

Standing is not a capability layer. It does not grant permission, authority, access, delegation, governance power, or action rights.

A conformant Standing Engine MUST preserve the boundary between these layers. It MAY materialize StandingSnapshots and StandingDeltas for audit and reproducibility, but those records are derived protocol outputs, not manually authored source facts.

---

## 8. Standing States

Standing states are canonical interpretations emitted by the Standing Engine. A standing state expresses current protocol interpretation, not raw truth and not direct authority.

Canonical standing states include:

| Standing state | Meaning |
|---|---|
| Unknown | The Standing Engine has no recognized evidence or claims sufficient to form a contextual interpretation. |
| Insufficient | Evidence or claims exist, but they do not satisfy minimum policy requirements for a stronger standing state. |
| Emerging | Evidence or claims show developing support but have not yet satisfied verification, authority, temporal, or policy thresholds for verified or trusted standing. |
| Verified | Evidence and claims have been evaluated and found supported for the context, subject to policy constraints. |
| Trusted | Evidence, claims, source authority, temporal relevance, and policy requirements support trust for the defined context. |
| Highly Trusted | Trust requirements are satisfied with stronger evidence, authority, confidence, recency, independence, or governance support than ordinary Trusted standing. |
| Restricted | Standing exists but policy restricts its use due to scope, risk, challenge, authority limits, or unmet conditions. |
| Challenged | Evidence, claims, authority, policy interpretation, or standing output is disputed and the challenge affects standing interpretation. |
| Under Review | A recognized reviewer, governance process, or policy-defined body is evaluating standing-relevant evidence, claims, or challenges. |
| Invalid | Evidence, claims, or interpretation failed verification, violates protocol rules, or cannot be trusted for the context. |
| Expired | Standing is no longer current because evidence, claims, credentials, policies, or temporal windows passed their validity period. |
| Superseded | Standing has been replaced by newer evidence, claims, policy, algorithm, or governance interpretation. |
| Suspended | Standing is temporarily disabled pending review, remediation, appeal, additional evidence, policy action, or governance process. |

Implementations MAY extend states for domain-specific requirements. Extended states MUST map to canonical protocol states for interoperability, audit, capability mapping, and governance review. Extended states MUST NOT hide challenge, invalidation, expiration, supersession, or restriction semantics.

The RFC-005 claim standing states such as `Active`, `Revoked`, and `Not Yet Active` remain valid for claim standing. RFC-005-H2 standing states generalize interpretation across subjects and standing types. Implementations that compute standing for claims MUST preserve mapping to RFC-005 canonical claim standing states.

---

## 9. Standing Confidence

StandingConfidence is the degree of confidence associated with a standing output.

Standing and confidence are separate. Standing is a state. Confidence is the strength, reliability, assurance, or uncertainty interpretation associated with that state under the applicable policy and algorithm.

Examples:

```text
Standing: Verified
Confidence: 92%
```

```text
Standing: Verified
Confidence: 58%
```

Both outputs are possible. The same standing state may have different confidence values because the state threshold was satisfied in both cases, while evidence quality, recency, source authority, challenge state, independence, or coverage differed.

StandingConfidence MAY be numeric, qualitative, ordinal, categorical, or threshold-based. If confidence is numeric, the range and semantics MUST be defined by policy or algorithm version. If confidence is qualitative, the categories and transition rules MUST be defined by policy or algorithm version.

A Standing Engine MUST explain confidence separately from state. It MUST identify the evidence, claims, authority, temporal relevance, challenge effects, decay effects, exclusions, and policy rules that affected confidence.

A confidence value alone is not standing. A score alone is not standing. A conformant output MUST expose the standing state, confidence semantics, StandingContext, PolicyContext, AlgorithmVersion, and explanation.

---

## 10. Standing Decay

Standing Decay is mandatory for contexts in which evidence or claims lose relevance over time.

Evidence can remain valid while losing relevance. A document, credential, review, employment record, project success, or audit result may remain historically authentic and verifiable while becoming less relevant to current standing.

Examples include:

- old employment evidence;
- old certification evidence;
- old project success evidence;
- old review evidence.

### 10.1 Evidence Decay

Evidence Decay is the reduction in contribution, relevance, confidence impact, or eligibility of evidence due to time, context, policy, recency requirements, or changed conditions.

Evidence Decay does not necessarily invalidate evidence. A five-year-old employment record may remain true and verifiable, but policy may treat it as weak support for current professional standing. An archived project success may remain evidence of historical delivery, but policy may discount it for current operational readiness.

Evidence Decay MUST be distinguishable from evidence invalidation, revocation, expiration, supersession, and challenge. Decay changes relevance or weight. Invalidation changes usability or truth status under policy.

### 10.2 Standing Decay

Standing Decay is the change in standing state, confidence, or capability relevance caused by decay of contributing evidence, claims, authority context, policy context, or algorithmic interpretation.

Standing Decay MUST be computed, not manually edited. If decay changes standing, the Standing Engine MUST emit a new StandingSnapshot and StandingDelta when policy requires material changes, scheduled recomputation, or explicit no-change records.

### 10.3 Temporal weighting

Temporal weighting assigns contribution effects based on time. A Standing Engine MAY apply stronger weight to recent evidence, weaker weight to older evidence, or policy-defined eligibility windows.

Temporal weighting MUST be explainable. The explanation MUST identify the relevant dates, lookback windows, decay factors, and policy rules.

### 10.4 Recency effects

Recency effects determine how recently evidence must have been created, verified, renewed, confirmed, or observed to support a standing state. Recency requirements MAY differ by standing type, subject type, risk tier, jurisdiction, or capability mapping context.

A Standing Engine MUST NOT silently treat stale evidence as current. If stale evidence contributes, the explanation MUST disclose why policy permits it and how it affected standing or confidence.

### 10.5 Decay functions

Decay functions are deterministic rules that reduce contribution, confidence, eligibility, or state support over time. Decay functions MAY be linear, stepwise, threshold-based, event-based, categorical, qualitative, or domain-specific.

Every decay function MUST be versioned through AlgorithmVersion or PolicyContext. A decay function MUST be reproducible for any historical timestamp required by RFC-005-H1.

### 10.6 Policy-driven decay

Decay is policy-driven. PolicyContext MUST define whether decay applies, which evidence or claim types decay, the time basis for decay, the decay schedule, thresholds, renewal conditions, challenge effects, and recomputation triggers.

A Standing Engine MUST apply decay according to explicit policy. A standing result without decay semantics in a decay-relevant context is incomplete.

---

## 11. Standing Computation

Standing computation is the lifecycle by which a Standing Engine transforms inputs into a standing output.

### 11.1 Inputs

A standing computation MUST receive or resolve the following inputs:

- Evidence;
- Claims;
- Context;
- Policy;
- Algorithm.

### 11.2 Process

A conformant Standing Engine SHOULD perform the following computation stages. Domain implementations MAY add stages, but MUST preserve equivalent semantics.

| Stage | Required behavior |
|---|---|
| Normalize | Convert evidence, claims, lifecycle states, timestamps, authority references, challenge states, and policy references into canonical evaluation form. |
| Filter | Determine which evidence and claims are eligible, ineligible, out of scope, stale, low-authority, challenged, expired, superseded, invalidated, or irrelevant to the StandingContext. |
| Validate | Evaluate integrity, provenance, authority, attestation, verification status, temporal boundaries, challenge status, and policy eligibility. |
| Evaluate | Apply AlgorithmVersion and PolicyContext to eligible evidence and claims, including rule satisfaction, thresholds, weights, qualitative logic, decay functions, and challenge handling. |
| Aggregate | Combine evidence-level and claim-level interpretations into standing-type-specific interpretation. Aggregation MUST be deterministic and explainable. |
| Compute Standing | Emit the standing state and StandingConfidence for the StandingSubject and StandingType under the StandingContext. |
| Generate Explanation | Produce human-readable, machine-readable, and audit-ready explanation artifacts sufficient for RFC-005-H1 traceability. |
| Persist Snapshot | Persist or reference an immutable StandingSnapshot when policy requires canonical standing output. |
| Generate Delta | Compare with prior StandingSnapshot and emit a StandingDelta explaining what changed and why. |

### 11.3 Output

A standing computation output MUST identify:

- StandingSubject;
- StandingType;
- standing state;
- StandingConfidence;
- StandingContext;
- PolicyContext;
- AlgorithmVersion;
- included evidence;
- excluded evidence and exclusion reasons;
- included claims;
- excluded claims and exclusion reasons;
- authority attribution;
- temporal attribution;
- decay effects;
- challenge effects;
- explanation;
- snapshot reference, when persisted;
- delta reference, when applicable.

---

## 12. Standing Recalculation Triggers

Standing evolves through events, not edits. A Standing Engine MUST recompute, invalidate, suspend, or mark standing according to policy when standing-relevant events occur.

Canonical recalculation triggers include:

| Trigger | Standing effect |
|---|---|
| Evidence Added | New evidence may support, weaken, challenge, or contextualize standing. |
| Evidence Updated | Corrected or revised evidence may change eligibility, contribution, confidence, or explanation. |
| Evidence Invalidated | Invalidated evidence MUST be excluded, discounted, or disclosed according to policy and RFC-005-H1. |
| Evidence Expired | Expired evidence MUST affect eligibility, confidence, or state according to policy. |
| Claim Changed | New, modified, revoked, suspended, expired, superseded, or invalid claims may change standing. |
| Challenge Raised | Challenged evidence, claims, authority, policy interpretation, or standing output MUST carry challenge state into computation. |
| Challenge Resolved | Confirmation, invalidation, supersession, rejection, or remediation MUST propagate to standing. |
| Policy Changed | Policy changes may alter thresholds, eligibility, decay, challenge handling, output states, or capability mapping expectations. |
| Algorithm Changed | Algorithm version changes may alter evaluation logic and MUST be traceable. |
| Context Changed | A different StandingContext may produce different standing from the same inputs. |
| Manual Governance Event | Authorized governance events may affect evidence, claims, policy, challenge state, algorithm activation, review state, or recomputation requirements. |

Manual Governance Events MUST NOT directly edit standing. They MAY create or modify protocol-recognized inputs that cause deterministic recomputation.

---

## 13. Standing Simulation

StandingSimulation is a non-canonical what-if analysis that evaluates hypothetical standing under altered inputs, policy, algorithm, context, or time.

Examples include:

- Remove Evidence X;
- Change Policy;
- Apply New Algorithm;
- Future Decay Projection.

Simulation MUST NOT modify canonical standing. A simulation output MUST NOT overwrite StandingSnapshots, StandingDeltas, evidence lifecycle state, claim state, policy activation, algorithm activation, challenge records, or capability decisions.

A StandingSimulation MUST be clearly labeled as simulation. It SHOULD identify:

- simulation inputs;
- hypothetical changes;
- baseline StandingSnapshot, when applicable;
- simulated StandingContext;
- simulated PolicyContext;
- simulated AlgorithmVersion;
- simulated timestamp or projection horizon;
- simulated output state and confidence;
- explanation of differences from canonical standing.

Simulation MAY support audit, impact analysis, migration planning, policy design, challenge review, future decay projection, and capability risk analysis.

---

## 14. Standing Explanation

Every standing output must be explainable.

RFC-005-H1 defines Standing Traceability and requires every standing output to produce a persistable explanation tree. RFC-005-H2 adopts that requirement as a computation requirement: the Standing Engine MUST generate explanation as part of standing computation, not as an optional post-processing report.

Standing explanation has three forms:

| Explanation form | Purpose |
|---|---|
| Human explanation | Provides a concise reason that a subject, reviewer, operator, or governance participant can understand. |
| Machine explanation | Provides structured references, rule results, evidence contributions, claims, authority context, temporal attribution, challenge effects, decay effects, policy context, and algorithm version. |
| Audit explanation | Provides sufficient lineage, inputs, snapshots, deltas, dependency graph references, and deterministic rebuild data for audit, appeal, invalidation propagation, and historical reconstruction. |

A conformant Standing Engine MUST explain:

- why the standing state exists;
- why the confidence value or confidence category exists;
- which evidence and claims contributed;
- which evidence and claims were excluded;
- what authority allowed evidence or claims to contribute;
- what temporal and decay rules applied;
- what challenges affected computation;
- what policy and algorithm produced the result;
- what changed from the previous snapshot, when applicable.

An unexplained standing output is not conformant.

---

## 15. Standing Dependency Graph

The Standing Dependency Graph expands the RFC-005-H1 Evidence Dependency Graph by representing all relationships necessary to compute, explain, audit, and propagate standing changes.

A StandingGraph SHOULD include explicit graph relationships among:

- Evidence;
- Claims;
- Authorities;
- Policies;
- Algorithms;
- Standing;
- Capabilities;
- Challenges;
- Snapshots;
- Deltas.

Example dependency diagram:

```text
[Evidence] ---- supports ----> [Claim]
    |                              |
    | has_authority                | evaluated_for
    v                              v
[Authority]                  [Standing Snapshot]
    |                              |
    | constrained_by               | produced_by
    v                              v
[Policy Context] ----------> [Algorithm Version]
    |                              |
    | affects                      | emits
    v                              v
[Challenge] -------------> [Standing Delta]
                                   |
                                   | consumed_by
                                   v
                             [Capability Decision]
```

A StandingGraph MUST preserve both reverse traceability and forward traceability where required by RFC-005-H1.

Reverse traceability answers:

```text
Which evidence, claims, authorities, policies, algorithms, challenges, snapshots, and deltas produced this standing?
```

Forward traceability answers:

```text
Which standing states, capability decisions, authority determinations, or downstream outputs were affected by this evidence, claim, policy, algorithm, or challenge?
```

A StandingSnapshot without graph edges to evidence, claims, authority context, policy context, algorithm version, challenge state, and prior snapshot or delta lineage is not conformant.

---

## 16. Standing Governance

Standing Governance defines who may define, change, challenge, review, or activate standing-relevant protocol inputs.

A conformant implementation MUST define governance rules for:

| Governance question | Requirement |
|---|---|
| Who can define standing algorithms? | Algorithm definition MUST be authorized by a governance process, protocol maintainer, delegated standards body, domain authority, or policy-recognized administrator. Algorithm versions MUST be immutable once activated for audit. |
| Who can define policies? | Policy definition MUST be authorized by the relevant governance, compliance, legal, enterprise, jurisdictional, or protocol authority. Policy versions MUST be traceable. |
| Who can define standing types? | StandingType definition MUST be authorized by protocol governance or a domain governance process and MUST preserve RFC-005-H2 semantics. |
| Who can challenge standing? | Subjects, affected parties, auditors, governance bodies, authorities, issuers, verifiers, or policy-recognized reviewers MAY challenge standing according to policy. |
| Who can review challenges? | Challenge review MUST be performed by policy-recognized reviewers, governance bodies, authorities, auditors, or delegated review processes with explicit authority. |

Standing Governance MUST NOT permit hidden standing changes. Governance actions that affect standing MUST be represented as evidence, claim, policy, algorithm, challenge, review, or lifecycle events with authority, provenance, and auditability.

Future RFC-005-H3 SHOULD define Standing Governance in greater detail.

---

## 17. Capability Mapping

Standing does not grant capability.

Capability engines consume standing. A capability engine, authorization policy, governance process, or authority recognition process MAY use standing as an input to decide whether a capability is allowed, denied, restricted, suspended, escalated, delegated, revoked, or conditioned.

Examples:

| Standing | Capability |
|---|---|
| Trusted Vendor | Can Bid on Contract |
| Verified Professional | Can Issue Certain Claims |
| Trusted AI Agent | Can Execute Autonomous Actions |

These examples are mappings, not automatic grants. A Trusted Vendor standing state may support `Can Bid on Contract`, but the capability decision may still require jurisdiction, contract class, procurement policy, conflict-of-interest checks, risk tier, insurance evidence, sanctions screening, and active registration.

A Verified Professional standing state may support `Can Issue Certain Claims`, but the capability decision may still require scope limits, credential issuer authority, current certification, jurisdiction, employer relationship, and claim type constraints.

A Trusted AI Agent standing state may support `Can Execute Autonomous Actions`, but the capability decision may still require supervision policy, runtime controls, risk limits, delegated authority, audit logging, and revocation state.

Capability mapping SHOULD identify:

- required StandingType;
- required standing states;
- minimum confidence or assurance;
- required evidence or claim categories;
- required policy context;
- required subject scope;
- temporal constraints;
- challenge behavior;
- restriction behavior;
- escalation requirements;
- revocation and suspension handling;
- explanation references.

A capability decision MUST be traceable to the standing outputs it consumed. A capability decision that consumes standing without StandingSnapshot, StandingContext, PolicyContext, AlgorithmVersion, and explanation references is not conformant for consequential use.

Future RFC-005-H4 SHOULD define Capability Mapping in greater detail.

---

## 18. Standing Engine Guarantees

A conformant Standing Engine guarantees the following protocol properties:

- No opaque standing.
- No standing without evidence.
- No standing without context.
- No standing without policy.
- No hidden standing changes.
- No unexplained standing.
- No authority-free standing.
- No capability without standing traceability.

These guarantees are normative.

### 18.1 No opaque standing

Every standing output MUST expose sufficient explanation, lineage, policy context, algorithm version, and dependency references to support audit and challenge.

### 18.2 No standing without evidence

Standing MUST be derived from evidence directly or from claims that are themselves supported by evidence. If no evidence exists, standing MUST be Unknown, Insufficient, or another policy-defined state that maps to insufficient evidentiary support.

### 18.3 No standing without context

Standing MUST be computed under StandingContext. Context-free standing is not meaningful.

### 18.4 No standing without policy

Standing MUST be computed under PolicyContext. Policy-free standing is arbitrary interpretation.

### 18.5 No hidden standing changes

Standing changes MUST result from traceable events and deterministic recomputation. Hidden administrative changes are not conformant.

### 18.6 No unexplained standing

Every standing output MUST include human, machine, and audit explanation semantics sufficient for RFC-005-H1.

### 18.7 No authority-free standing

Evidence, claims, policies, algorithms, challenges, and governance events that affect standing MUST carry authority context or be excluded, discounted, restricted, or disclosed according to policy.

### 18.8 No capability without standing traceability

Capability decisions that consume standing MUST reference traceable standing outputs. Consequential capability decisions SHOULD fail closed when standing traceability is missing or non-reconstructable.

---

## 19. Security Implications

The Standing Engine protects against standing manipulation only if implementations preserve determinism, traceability, context, policy, authority attribution, and explanation. The following risks are security-relevant.

### 19.1 Manipulation

Attackers or insiders may attempt to alter standing outcomes without changing evidence, claims, policy, or algorithm records. Conformant systems MUST prevent direct standing edits and MUST require traceable recomputation.

### 19.2 Gaming

Subjects may attempt to optimize superficial evidence while avoiding substantive qualification. Policies and algorithms SHOULD detect duplication, circular support, low-authority evidence, missing independence, narrow scope, stale signals, and unsupported claims.

### 19.3 Reputation inflation

Standing MUST NOT become an opaque reputation score that can be inflated by unverifiable social signals, popularity, duplicated reviews, self-issued attestations, or low-authority claims. Reputation Standing MUST remain evidence-based, policy-aware, and explainable.

### 19.4 Evidence laundering

Untrusted evidence MUST NOT become trusted merely by being copied, repackaged, attested by an unauthorized party, or introduced through a trusted interface. Source authority, issuer authority, verifier authority, and lineage MUST remain inspectable.

### 19.5 Sybil attacks

Attackers may create many subjects, issuers, reviewers, vendors, agents, or identities to manufacture standing. Standing policies SHOULD evaluate issuer independence, subject uniqueness, relationship graphs, identity assurance, evidence provenance, and authority chains.

### 19.6 Fake authority

A malicious or mistaken source may present itself as an authority. Standing computation MUST validate authority context and MUST exclude, discount, restrict, or challenge evidence and claims from unrecognized or insufficient authorities.

### 19.7 Stale evidence

Old evidence may remain verifiable while no longer supporting current standing. Standing Decay, temporal attribution, expiration handling, and recency policy MUST prevent stale evidence from silently inflating current standing.

### 19.8 Context abuse

A subject may attempt to transfer standing from one context to another where the evidence is not relevant. StandingContext MUST prevent context laundering. Evidence that supports project management standing MUST NOT silently support cybersecurity standing unless policy explicitly recognizes that relevance.

### 19.9 Policy abuse

Policy authors or administrators may attempt to alter standing outcomes through hidden or excessive policy changes. PolicyContext MUST be versioned, authorized, and traceable. Material policy changes SHOULD trigger migration analysis, recomputation, disclosure, or review.

### 19.10 Algorithm abuse

Algorithm changes may alter standing at scale. AlgorithmVersion MUST be versioned, authorized, explainable, and traceable. Conformant systems SHOULD support comparative deltas and simulation before activating material algorithm changes.

---

## 20. Implementation Guidance

The following guidance is implementation-neutral and non-exhaustive.

### 20.1 Canonical concepts

Conformant implementations SHOULD support the following canonical concepts:

| Concept | Meaning |
|---|---|
| StandingSnapshot | Immutable record of standing at a specific timestamp under a specific StandingContext, PolicyContext, and AlgorithmVersion. |
| StandingDelta | Difference between two StandingSnapshots, including triggers, changed evidence, changed claims, policy or algorithm changes, and explanation. |
| StandingContext | Explicit evaluation context that defines domain, purpose, subject, risk, time, policy scope, and capability mapping context. |
| StandingType | Category of standing being computed, such as Identity Standing, Vendor Standing, Project Standing, or AI Agent Standing. |
| StandingSubject | Subject to which standing belongs. |
| StandingConfidence | Confidence, assurance, or uncertainty interpretation associated with a standing state. |
| StandingExplanation | Human, machine, and audit explanation for why the standing output exists. |
| StandingGraph | Dependency graph linking evidence, claims, authorities, policies, algorithms, standing, capabilities, challenges, snapshots, and deltas. |
| StandingSimulation | Non-canonical what-if analysis that does not modify canonical standing. |

### 20.2 Implementation notes

1. Standing computations should be deterministic for the same input set, context, policy, algorithm version, and timestamp.
2. Standing snapshots should be immutable and append-only or audit-preserving.
3. Standing deltas should be emitted for material changes and for explicit no-change recomputations when policy requires them.
4. Evidence and claim exclusions should be recorded with exclusion reasons.
5. Context, policy, and algorithm versions should be explicit in every output.
6. Decay logic should be versioned and reproducible.
7. Challenge state should be carried into computation and explanation.
8. Manual governance events should affect standing only through authorized changes to evidence, claims, policy, algorithm activation, challenge state, or review state.
9. Capability engines should consume StandingSnapshots rather than raw mutable standing fields.
10. Simulation outputs should be visibly distinct from canonical StandingSnapshots.
11. Recalculation queues should identify impacted subjects, standing types, snapshots, deltas, and capability decisions where policy requires impact analysis.
12. Implementations should preserve compatibility with RFC-004 evidence portability, RFC-005 trust-chain boundaries, and RFC-005-H1 traceability requirements.

This RFC does not require a specific database, graph store, programming language, event bus, serialization format, API, user interface, machine learning model, or numeric scoring method.

---

## 21. Future RFC Dependencies

The Standing Engine creates the following future RFC dependencies:

| Future RFC | Placeholder scope |
|---|---|
| RFC-005-H3 Standing Governance | Defines governance roles, algorithm approval, policy approval, standing type registration, challenge review, administrative authority, and standing oversight. |
| RFC-005-H4 Capability Mapping | Defines how capability engines consume standing, how standing states map to capability decisions, and how capabilities remain bounded, explainable, and traceable. |
| RFC-005-H5 Delegated Standing | Defines how standing may be delegated, inherited, constrained, scoped, revoked, or transferred across principals, organizations, teams, AI agents, projects, and policy objects. |
| RFC-005-H6 Standing Algorithms | Defines algorithm requirements, versioning, deterministic evaluation patterns, decay functions, aggregation models, migration analysis, and algorithm audit. |

Future RFCs MUST preserve the core boundary established by RFC-005-H2: standing is derived interpretation, not evidence, not claim, not score, not reputation, and not capability.

---

## 22. Acceptance Criteria

A complete implementation or document alignment for RFC-005-H2 satisfies the following checklist:

- [x] RFC-005-H2 exists in the correct repo location.
- [x] It follows existing RFC formatting.
- [x] It defines the Standing Engine clearly.
- [x] It establishes the Evidence Layer → Claims Layer → Standing Layer → Capability Layer architecture.
- [x] It defines standing as derived interpretation of evidence and claims under context and policy.
- [x] It states that standing is computed and never manually edited.
- [x] It formalizes `Standing = f(EvidenceSet, ClaimSet, StandingContext, PolicyContext, AlgorithmVersion)`.
- [x] It defines StandingType taxonomy.
- [x] It defines StandingContext as mandatory.
- [x] It defines StandingSubject.
- [x] It distinguishes standing from evidence, claims, scores, reputation, and capability.
- [x] It defines canonical standing states.
- [x] It defines StandingConfidence separately from standing state.
- [x] It defines Evidence Decay and Standing Decay.
- [x] It defines standing computation lifecycle stages.
- [x] It defines standing recalculation triggers.
- [x] It defines StandingSimulation and prohibits simulation from modifying canonical standing.
- [x] It references RFC-005-H1 Standing Traceability for explanation, snapshots, deltas, and deterministic rebuild.
- [x] It defines Standing Dependency Graph relationships.
- [x] It defines governance responsibilities at a protocol level.
- [x] It explains that standing influences but does not grant capability.
- [x] It defines Standing Engine guarantees.
- [x] It covers security implications including manipulation, gaming, reputation inflation, evidence laundering, Sybil attacks, fake authority, stale evidence, context abuse, policy abuse, and algorithm abuse.
- [x] It introduces canonical implementation concepts.
- [x] It identifies future RFC dependencies.

---

## Conclusion

RFC-005-H2 establishes the Standing Engine as the canonical specification for the Standing Layer of AOC. Evidence records observed or attested facts. Claims express formal assertions supported by evidence. Standing interprets evidence and claims under explicit context, policy, and algorithm version. Capabilities consume standing but are never granted directly by standing.

Standing must always be deterministic, explainable, reproducible, challenge-aware, policy-aware, and context-aware. It must evolve through evidence, claim, policy, algorithm, challenge, and governance events, not direct edits. It must support decay, simulation, explanation, dependency graphs, snapshots, deltas, and capability traceability.

Standing = Function(Evidence, Claims, Context, Policy, Algorithm).
