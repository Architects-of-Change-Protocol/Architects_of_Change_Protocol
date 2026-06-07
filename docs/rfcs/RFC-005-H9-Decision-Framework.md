# RFC-005-H9 — Decision Framework

| Field | Value |
|---|---|
| RFC Number | 005-H9 |
| Title | Decision Framework |
| Status | Draft |
| Category | Core Protocol Extension |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-07 |
| Last Updated | 2026-06-07 |
| Supersedes | RFC-005-H9 (prior draft) |
| Related | RFC-001 Identity Layer, RFC-004 Evidence Layer, RFC-005 Claims Framework, RFC-005-H2 Standing Engine, RFC-005-H3 Standing Governance, RFC-005-H8 Authority Recognition Model |

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Constitutional Alignment](#2-constitutional-alignment)
3. [Decision Principles](#3-decision-principles)
4. [Canonical Decision Model](#4-canonical-decision-model)
5. [Decision States](#5-decision-states)
6. [Decision Lifecycle](#6-decision-lifecycle)
7. [Decision Inputs](#7-decision-inputs)
8. [Decision Creation Model](#8-decision-creation-model)
9. [Decision Algorithms](#9-decision-algorithms)
10. [Decision Scope Model](#10-decision-scope-model)
11. [Decision Constraints](#11-decision-constraints)
12. [Decision Validation Model](#12-decision-validation-model)
13. [Decision Explainability](#13-decision-explainability)
14. [Decision Challenges](#14-decision-challenges)
15. [Decision Revocation](#15-decision-revocation)
16. [Decision Supersession](#16-decision-supersession)
17. [Decision Reconstruction](#17-decision-reconstruction)
18. [Decision Accountability](#18-decision-accountability)
19. [Separation of Powers](#19-separation-of-powers)
20. [Constitutional Legitimacy Model](#20-constitutional-legitimacy-model)
21. [Constitutional Invariants](#21-constitutional-invariants)
22. [Anti-Capture Requirements](#22-anti-capture-requirements)
23. [Auditability Requirements](#23-auditability-requirements)
24. [Runtime Contracts](#24-runtime-contracts)
25. [Relationship With Authority](#25-relationship-with-authority)
26. [Relationship With Governance](#26-relationship-with-governance)
27. [Constitutional Compliance Matrix](#27-constitutional-compliance-matrix)
28. [Open Questions](#28-open-questions)

---

## 1. Abstract

### 1.1 Purpose

RFC-005-H9 establishes the Decision Framework as the constitutional layer that defines what a decision is, how it is born, how it is validated, how it is executed, how it is challenged, how it is revoked, how it is superseded, how it is reconstructed, how it is audited, and how it is preserved within the AOC Protocol.

A decision is not an action. A decision is not an event. A decision is not an opinion. A decision is not a vote. A decision is not an instruction. A decision is not a recommendation. A decision is not a permission. A decision is not execution.

A decision is a **protocol-recognized outcome produced under recognized authority, within recognized scope, under recognized governance, with traceable basis, with capacity for challenge, and with capacity for audit.**

### 1.2 Scope

This RFC defines the constitutional layer exclusively. It does not define databases, APIs, blockchain mechanisms, wallet structures, UI components, or infrastructure. It defines the normative model — the rules, semantics, principles, invariants, and constraints — that any conformant implementation must satisfy.

### 1.3 Problem

Most systems never define what a decision is. They confuse it with other protocol acts:

| Act | Why It Is Not a Decision |
|---|---|
| "Has authority." | Authority is the precondition. Not the outcome. |
| "Issued an opinion." | Opinion is advisory input. Not a binding protocol fact. |
| "Voted." | A vote is a deliberation input. Quorum plus governance produces a decision. |
| "Executed something." | Execution is the realization of a decision. Not the decision itself. |
| "Has permission." | Permission is a capability. Not a recognized outcome. |
| "Signed something." | Signature is an attestation act. Not a decision. |
| "Recommended something." | Recommendation is advisory input to authority. Not a decision. |
| "Reviewed something." | Review is a precondition to decision. Not the decision. |

This confusion produces governance gaps, accountability gaps, and protocol integrity failures. When any of the above is treated as a decision, unauthorized state changes occur, challenges have no stable target, and audit trails collapse.

### 1.4 Relation to RFC-001 Identity Layer

RFC-001 establishes identity as the root protocol primitive — the verifiable, persistent anchor from which all trust derives. RFC-005-H9 depends on identity being established: every decision must be attributable to an identified actor. Anonymous decisions are constitutionally invalid. Identity is necessary but not sufficient. A recognized identity that holds no recognized authority cannot produce a recognized decision.

### 1.5 Relation to RFC-004 Evidence Layer

RFC-004 establishes the evidentiary foundation: how facts are recorded, attested, verified, and preserved. Decisions consume evidence. No decision is constitutionally valid without traceable evidentiary basis. Evidence describes what exists; decisions interpret what it means for protocol state and produce new recognized facts upon that basis.

### 1.6 Relation to RFC-005-H2 Standing Engine

RFC-005-H2 defines how standing is computed from evidence and claims. Standing is the current protocol interpretation of a subject's verified state. Standing is a precondition class for decisions. A decision-making actor must hold sufficient standing for its context. A decision subject's standing may be altered by the decision. Standing is computed; decisions are produced. These are distinct protocol acts.

### 1.7 Relation to RFC-005-H8 Authority Recognition Model

RFC-005-H8 defines recognized authority: the policy-recognized legitimacy to perform or influence protocol-recognized outcomes. Authority is the direct constitutional parent of decision. A decision cannot be recognized without recognized authority. Authority is necessary but never sufficient: authority without valid process, valid scope, valid governance, and traceable basis produces no recognized decision.

### 1.8 Constitutional Position

```
Identity (RFC-001)
  ↓
Evidence (RFC-004)
  ↓
Assertion → Claim (RFC-005)
  ↓
Standing (RFC-005-H2)
  ↓
Authority (RFC-005-H8)
  ↓
Decision ← This RFC
  ↓
Governance Runtime [future]
  ↓
Constitutional Enforcement [future]
```

Decision is the bridge between Authority and Governance. It is the act by which authority produces recognized protocol facts that Governance must consume, enforce, and preserve.

---

## 2. Constitutional Alignment

Every decision in the AOC Protocol must satisfy twelve constitutional principles. The following matrix defines each principle, the mechanism by which the Decision Framework satisfies it, and the consequence of violation.

### 2.1 Constitutional Alignment Matrix

| # | Constitutional Principle | Definition | Decision Framework Mechanism | Violation Consequence |
|---|---|---|---|---|
| 1 | **Supremacy** | The constitutional framework governs all acts; no act is above it. | Decision recognition requires constitutional compliance. No actor may self-authorize a decision. Constitutional rules cannot be overridden by individual authority. | Decision is classified as Claimed Decision. Protocol state change is void. |
| 2 | **Legitimacy** | Protocol acts derive legitimacy from recognized sources, not from power, claim, or assertion alone. | Recognition requirements enforce verified authority, verified policy, verified governance, verified scope. Legitimacy is externally verified, not self-declared. | Decision is classified as Claimed Decision regardless of actor's power or claim. |
| 3 | **Consent** | The governed must have a basis for consenting to the rules under which decisions affecting them are made. | Decision scope, governance basis, and applicable policy are recorded and auditable. Subjects have challenge rights. Challenge processes are accessible. | Unchallenged decisions made under opaque governance are constitutionally deficient even if technically recognized. |
| 4 | **Delegation** | Authority and decision-making power may be delegated, but delegation must be explicit, bounded, and traceable. | Delegation decisions are a canonical decision type. Delegated authority must trace to origin. Delegation chains are recorded. Scope of delegated decision-making is bounded and explicit. | Decisions made under undocumented, untraceable, or unbounded delegation are not recognized. |
| 5 | **Limitation** | All authority is bounded. No actor holds unlimited decision-making power. | Decision scope is mandatory. Authority scope constrains decision scope. Decisions exceeding authority scope are invariant violations. Governance imposes collective limits on individual actors. | Decisions exceeding scope are void as to excess. Authority and governance violations are recorded. |
| 6 | **Revocability** | Decisions must be reversible through recognized processes. No decision is permanently beyond recall. | Revocation is a canonical lifecycle state. Revocation authority is defined. Revocation requires recognized process and documented grounds. Revocation is recorded and preserved. | A decision framework that makes any class of decision irrevocable is constitutionally non-conformant. |
| 7 | **Supervisión** | Decision-making must be subject to oversight by authorized parties. | Decision Review is a defined lifecycle stage. Governance bodies hold review authority. Audit access to decision records is mandatory. Decision Registry is accessible to authorized supervisory parties. | Decisions made without supervisory access or review capacity are constitutionally deficient. |
| 8 | **Accountability** | Actors who produce decisions must be identifiable and answerable for them. | Every decision records its author (the recognized authority that exercised it), the governance bodies that approved it, and the validators who recognized it. No anonymous decisions. | Decisions without identified accountable actors are Claimed Decisions. |
| 9 | **Transparency** | Decision basis, authority, governance, and consequences must be accessible to authorized parties. | Mandatory traceability fields are defined. The Decision Registry is accessible to authorized parties. Explainability requirements are canonical. | Opaque decisions fail explainability requirements and may be challenged on governance grounds. |
| 10 | **Impugnación (Challenge)** | Every decision must be challengeable. No decision is immune from review through recognized processes. | Challenge is a canonical invariant. Challenge grounds, lifecycle, and resolution processes are defined. No decision framework may suppress challenge rights. | Any decision framework that prohibits challenge is constitutionally non-conformant. |
| 11 | **Continuity** | The constitutional framework must survive the replacement of individual actors. Decisions must outlast those who made them. | Decision Registry is append-only. Historical records are preserved. Reconstruction is mandatory. Decisions survive actor departure, authority expiration, and governance change. | Decisions that exist only in the memory of their authors and cannot be reconstructed are constitutionally deficient. |
| 12 | **Anti-Capture** | No single actor, coalition, or faction may capture the decision-making apparatus and exclude others from legitimate process. | Separation of decision-creation, validation, execution, oversight, challenge, and audit is canonical. No actor may hold all roles simultaneously. Challenge rights are guaranteed. Monopoly formation is an invariant violation. | Captured decision systems are constitutionally non-conformant regardless of whether their outputs resemble decisions. |

---

## 3. Decision Principles

The following principles are normative. Every conformant Decision Framework implementation must satisfy all of them. No implementation may select a subset.

### Foundational Distinction Principles

**P-D-001: Decision is not authority.**
Authority is the recognized right to act. A decision is the act of exercising that right to produce a protocol-recognized outcome. Authority exists before it is exercised. Decision is the result of exercise. A subject holding authority but producing no decision creates no protocol fact. A decision without authority is not recognized.

**P-D-002: Decision is not execution.**
Execution is the operational realization of a decision's consequences. A decision establishes a recognized protocol fact. Execution delivers that fact into operational reality. They are distinct acts with distinct actors, distinct traceability requirements, and distinct authority requirements. An actor who executes without a corresponding recognized decision commits an unauthorized act.

**P-D-003: Decision is not opinion.**
Opinion is advisory input. It carries no binding force. It alters no protocol state. It requires no recognized authority. A decision requires recognized authority, valid process, valid scope, and governance compliance. Opinion may inform a decision; it is never the decision.

**P-D-004: Decision is not a vote.**
A vote is a deliberation input within a collective decision process. Votes may aggregate into a decision, but only when quorum is established, governance requirements are satisfied, and recognition requirements are met. A vote alone is not a decision.

**P-D-005: Decision is not a recommendation.**
A recommendation is advisory. It expresses what a party believes should be decided. It does not itself decide. An AI recommendation, a committee recommendation, or a regulatory recommendation is never a decision until consumed by a recognized authority acting within recognized scope under recognized governance.

**P-D-006: Decision is not a review.**
A review is a precondition act. It evaluates evidence, standing, claims, proposals, or prior decisions. A review finding may be a precondition to a decision. The review itself is not the decision.

**P-D-007: Decision is not an instruction.**
An instruction directs a party to act. Instructions require capability to issue but not necessarily decision authority. Following an instruction without a corresponding recognized decision produces unauthorized execution.

**P-D-008: Decision is not a permission.**
A permission (or capability grant) defines what may be done. A decision is the recognized outcome of what has been authoritatively concluded. Permissions are preconditions to acting. Decisions are the protocol acts that produce recognized facts.

### Production Principles

**P-D-009: Decision requires recognized authority.**
No recognized decision may be produced without recognized authority as defined by RFC-005-H8. Authority must be current, within scope, and not suspended or revoked at the moment the decision is produced.

**P-D-010: Decision requires a valid decision process.**
Authority alone is insufficient. The decision must be produced through a process that satisfies all applicable governance requirements, review requirements, precondition requirements, and policy constraints. A recognized authority acting through an invalid process produces a claimed decision.

**P-D-011: Decision requires valid scope.**
Every decision must define its scope. The scope of the decision cannot exceed the scope of the authority exercised. Decisions with undefined scope or scope exceeding authority are constitutionally invalid.

**P-D-012: Decision requires valid temporal context.**
A decision must be produced at a moment when: the authority is recognized and active; the applicable policy is in force; the required governance approvals are current; and all preconditions are satisfied. A decision produced outside valid temporal context is a claimed decision.

**P-D-013: Decision requires traceable basis.**
Every decision must trace to its evidence, claims, standing, authority, and governance basis. Traceability is not optional. It is the mechanism by which the decision can be audited, challenged, reconstructed, and preserved.

**P-D-014: Decision requires capacity for challenge.**
Every decision must be challengeable by recognized parties through recognized processes. This capacity must exist before the decision is produced and must persist for the lifetime of the decision record. No decision may be constitutionally immunized from challenge.

### Operational Principles

**P-D-015: Decision is explainable.**
Every recognized decision must be explainable: why it was produced, who produced it, with what authority, under what governance, with what evidence, and what consequences it produced. Unexplainable decisions are constitutionally deficient.

**P-D-016: Decision is auditable.**
Every recognized decision must be auditable by authorized parties. The decision record must be complete, accessible, and verifiable. Audit access cannot be restricted except by recognized policy applied uniformly.

**P-D-017: Decision is reconstructable.**
For any historical moment, the state of any decision must be reconstructable from preserved records. Reconstruction must be deterministic. A decision framework that does not support reconstruction is constitutionally non-conformant.

**P-D-018: Decision is bounded.**
Every decision operates within defined limits: authority limits, scope limits, temporal limits, governance limits, and consequence limits. A decision cannot exceed these limits. A decision that produces consequences outside its recognized bounds is invalid as to the excess.

**P-D-019: Decision is temporal.**
Decisions exist within time. They are produced at a moment, they may be bounded by a temporal scope, and they may expire. Temporal context is a mandatory attribute of every recognized decision.

**P-D-020: Decision is governed.**
Every decision is subject to governance: the rules, bodies, processes, and constraints that define how decisions of that type are produced, validated, challenged, and preserved. No decision exists outside governance.

### Integrity Principles

**P-D-021: Decision is revocable.**
No decision is permanently irrevocable. Every recognized decision may be revoked through a recognized revocation process by a recognized revocation authority. Revocation preserves history; it does not erase the original decision.

**P-D-022: Decision is never self-validating.**
A decision-making actor cannot validate their own decision. Validation requires an independent authorized party or process. Self-validation is an invariant violation.

**P-D-023: Decision is never immune from review.**
No class of decision, no level of authority, and no type of governance body produces decisions that are beyond review by higher governance authority. The constitutional framework is always supreme.

**P-D-024: Decision cannot exceed authority.**
A decision is bounded by the authority that produced it. Consequences that extend beyond the recognized scope of the exercised authority are void. The constitutional limit on authority is a hard constraint, not a guideline.

**P-D-025: Decision cannot bypass governance.**
Governance requirements are not optional preconditions that may be waived by the decision-making authority. Decisions produced without required governance compliance are claimed decisions regardless of the authority's power.

**P-D-026: Decision cannot bypass standing requirements.**
Where standing requirements apply to the decision-making actor or the decision subject, those requirements must be satisfied. Authority does not override standing requirements.

**P-D-027: Decision cannot bypass evidence requirements.**
Where evidence requirements apply, the required evidence must exist, be verified, and be referenced in the decision record. Evidence requirements cannot be waived by authority alone.

**P-D-028: Decision requires independent oversight.**
The actor who produces a decision must not be the sole actor who validates, executes, oversees, challenges, and audits that decision. At least one function — validation, oversight, challenge, or audit — must be held by an independent party.

**P-D-029: Decision is a constitutional primitive.**
A decision is not a derived concept, not an implementation detail, and not a convenience label. It is a foundational constitutional primitive with defined requirements, defined lifecycle, defined accountability, and defined challenge capacity. It cannot be reduced to simpler primitives without losing constitutional integrity.

**P-D-030: Decision creates recognized protocol facts.**
Only recognized decisions create recognized protocol facts. Recommendations, reviews, opinions, claims, votes, and instructions do not alter protocol state. Only recognized decisions do.

---

## 4. Canonical Decision Model

A recognized decision is composed of nine canonical components. Every component is mandatory. A decision lacking any component is constitutionally incomplete and must not be recognized.

### 4.1 Decision Record

The **Decision Record** is the canonical, immutable, registered representation of a recognized decision. It is the authoritative source of truth for all decision attributes.

The Decision Record contains:

| Field | Obligation | Meaning |
|---|---|---|
| Decision Identifier | MUST | Globally unique, stable, protocol-assigned identifier |
| Decision Type | MUST | Canonical decision type from defined typology |
| Decision State | MUST | Current lifecycle state |
| Decision Version | MUST | Version counter incremented on each state transition |
| Produced At | MUST | Timestamp of authority exercise |
| Recognized At | MUST | Timestamp of recognition |
| Expires At | CONDITIONAL | If temporal scope is bounded |
| Subject Reference | MUST | Reference to DecisionSubject |
| Scope Reference | MUST | Reference to DecisionScope |
| Authority Reference | MUST | Reference to recognized authority record (RFC-005-H8) |
| Governance Reference | MUST | Reference to governance compliance record |
| Evidence References | MUST | References to supporting evidence records (RFC-004) |
| Claims References | MUST | References to supporting claims |
| Standing References | MUST | References to standing snapshots (RFC-005-H2) |
| Preconditions Record | MUST | Record of each required precondition and its satisfaction |
| Outcome Statement | MUST | Human-readable and machine-parseable statement of the decision |
| Consequence References | MUST | References to protocol state changes produced |
| Challenge History | MUST | References to all challenges raised against this decision |
| Supersession Reference | CONDITIONAL | Reference to superseded decision, if any |
| Revocation Reference | CONDITIONAL | Reference to revocation record, if revoked |
| Lineage Reference | CONDITIONAL | Reference to prior decisions in the same lineage |

The Decision Record is append-only once in Recognized state. Amendments produce new version entries in the record, preserving all prior versions.

### 4.2 Decision Maker

The **Decision Maker** is the recognized authority actor who exercises decision-making authority to produce the decision. The Decision Maker must be identifiable, attributable, and accountable.

Decision Maker requirements:

- Must be an identified principal under RFC-001 Identity Layer.
- Must hold recognized authority under RFC-005-H8 for the decision type and scope.
- Must hold required standing under RFC-005-H2 for the context.
- Must hold required capability under RFC-005-H4 for the decision type.
- Must not be in a disqualifying state (suspended standing, revoked authority, active challenge on relevant authority).
- Must not be in a conflict-of-interest position as defined by applicable governance.

A Decision Maker who is a collective governance body must satisfy quorum and collective authorization requirements. Individual members of a collective body are not Decision Makers unless explicitly delegated sole authority.

### 4.3 Decision Basis

The **Decision Basis** is the evidentiary, claim-based, and standing-based foundation upon which the decision rests. The basis is what justifies the decision constitutionally.

Decision Basis components:

| Component | Role in Basis |
|---|---|
| Evidence | Establishes the facts that the decision interprets or acts upon |
| Verified Claims | Establishes verified assertions about subjects relevant to the decision |
| Standing Snapshot | Establishes the protocol state of relevant parties at decision time |
| Prior Decisions | Establishes the decision lineage and prior binding protocol facts |
| Policy Version | Establishes the governance rules applicable at decision time |
| Review Findings | Establishes the outcome of required reviews |

The Decision Basis must be sufficient: it must provide the evidentiary and interpretive foundation that a reasonable auditor would require to understand why the decision was produced. An insufficient basis is a validity deficiency that may support a challenge.

### 4.4 Decision Authority

**Decision Authority** is the recognized authority exercised to produce the decision. It is distinct from the Decision Maker: the authority is the institutional recognition; the Decision Maker is the actor who exercises it.

Decision Authority must:

- Be recognized under RFC-005-H8.
- Be current (not expired, not revoked, not suspended) at the moment of decision.
- Apply to the decision type being produced.
- Apply within the decision scope being claimed.
- Be traceable to its recognition source.
- Be traceable through any delegation chain to its origin.

Decision Authority is the constitutional bridge between the Decision Maker and the recognized decision. Without recognized authority, the Decision Maker's act is a claimed decision.

### 4.5 Decision Context

**Decision Context** captures the circumstances, environmental conditions, and situational factors present at the moment of decision production. Context does not legitimize a decision, but its absence undermines explainability and reconstruction.

Context elements:

| Element | Meaning |
|---|---|
| Temporal Context | The date, time, and applicable policy period |
| Organizational Context | The organizational unit, governance body, or institutional actor involved |
| Regulatory Context | Applicable jurisdictional or regulatory frameworks |
| Operational Context | The operational conditions (e.g., emergency, standard, elevated review) |
| Dependency Context | Other active decisions, standing states, and authority records that bear on this decision |
| Challenge Context | Whether any active challenge to inputs exists at decision time |

Context is recorded but not binding as a constraint unless policy designates specific context conditions as preconditions.

### 4.6 Decision Scope

**Decision Scope** defines the boundaries within which the decision produces consequences. Scope is a hard constraint: consequences may not extend beyond recognized scope.

Scope dimensions:

| Dimension | Definition |
|---|---|
| Temporal | The time window during which the decision is operative |
| Jurisdictional | The legal, regulatory, or governance jurisdictions in which the decision applies |
| Contextual | The specific operational or organizational context in which the decision applies |
| Organizational | The organization, unit, or governance body within which the decision applies |
| Domain | The subject-matter domain (financial, operational, credential, governance, etc.) |
| Purpose | The specific purpose for which the decision was produced |
| Authority Dependency | The specific authority upon which the decision depends — if the authority is revoked, the decision scope collapses |

A decision without defined scope is a constitutional deficiency. A decision whose consequences exceed its defined scope is void as to the excess.

### 4.7 Decision Outcome

The **Decision Outcome** is the specific protocol-recognized result that the decision produces. It is distinct from the decision itself and from the execution of its consequences.

Outcome elements:

| Element | Meaning |
|---|---|
| Outcome Type | The canonical category of outcome (grant, revoke, approve, deny, issue, recognize, delegate, suspend, etc.) |
| Outcome Target | The specific subject, artifact, standing state, capability, or protocol element affected |
| Outcome Effect | The specific change in protocol state produced |
| Outcome Conditions | Any conditions under which the outcome is operative or may be modified |
| Outcome Expiration | Whether the outcome expires at a defined time |

The outcome is the protocol fact that governance, downstream processes, and affected parties must recognize and act upon.

### 4.8 Decision Governance

**Decision Governance** is the set of governance rules, bodies, approvals, and oversight mechanisms that governed the production, validation, and recognition of the decision.

Governance elements:

| Element | Meaning |
|---|---|
| Applicable Policy Version | The specific version of policy governing this decision type at decision time |
| Required Governance Approvals | Any collective body approvals required before recognition |
| Quorum Record | If a collective body voted, the quorum record |
| Review Record | Record of any required review completion |
| Governance Body Reference | Reference to the governance body with jurisdiction over this decision type |
| Oversight Record | Record of oversight actors notified or participating |

Decision Governance establishes that the decision was not produced in a governance vacuum. Governance is not an afterthought; it is a precondition and a permanent attribute of the decision.

### 4.9 Decision History

**Decision History** is the immutable, append-only record of all state transitions, challenge events, revocation events, supersession events, and audit events associated with a decision across its lifetime.

History requirements:

- Every lifecycle transition must be recorded with: timestamp, new state, prior state, triggering event, and actor attribution.
- Every challenge must be recorded: submission, outcome, and resolution.
- Every revocation must be recorded: grounds, authority, and preservation reference.
- Every supersession must be recorded: reference to superseding decision.
- Every audit access must be recorded: accessor identity, timestamp, and scope of access.

Decision History enables reconstruction. Without complete history, reconstruction fails. History may never be deleted, overwritten, or redacted except by recognized governance order that itself is recorded as a decision.

### 4.10 Component Relationships

```
Decision Record
  ├── Decision Maker          [who acted]
  ├── Decision Basis          [why it is justified]
  ├── Decision Authority      [what legitimizes it]
  ├── Decision Context        [when and where it occurred]
  ├── Decision Scope          [what it applies to]
  ├── Decision Outcome        [what it produces]
  ├── Decision Governance     [under what rules]
  └── Decision History        [how it evolved]
```

All nine components are mandatory. The absence of any component is a recognition deficiency.

---

## 5. Decision States

### 5.1 State Definitions

| State | Meaning |
|---|---|
| **Draft** | Decision has been initiated internally by a potential decision-making actor. No preconditions have been evaluated. No protocol obligations are yet triggered. Draft exists only in the decision-making actor's context. |
| **Proposed** | Decision has been formally submitted into the protocol for evaluation. Precondition evaluation has been triggered. The decision is now a protocol artifact, not merely an internal intention. |
| **Pending Validation** | Preconditions are being evaluated. Required reviews are in progress. Governance approvals are being sought. The decision cannot be recognized until validation is complete. |
| **Validated** | All required preconditions are satisfied. Required reviews are complete. Governance approvals are recorded. The decision is eligible for recognition. Authority has not yet been exercised to produce the outcome. |
| **Active** | The decision has been recognized. Authority has been exercised. The outcome is in force. Consequences are being realized or have been realized. This is the primary operative state. |
| **Under Challenge** | One or more challenges have been raised against the Active decision. The decision retains recognition during challenge unless suspension is ordered. Challenge resolution is in progress. |
| **Suspended** | The decision's consequences have been temporarily suspended. This may follow a challenge that warrants suspension pending resolution, or a governance order. The decision exists but its consequences are not operative. |
| **Superseded** | A later recognized decision has replaced this one. This decision's consequences are no longer operative. This decision's record is preserved for lineage, audit, and reconstruction. |
| **Revoked** | The decision has been revoked through a recognized revocation process by a recognized revocation authority. Consequences are wound back to the extent policy permits. The decision record is preserved permanently. |
| **Invalid** | The decision was found to fail recognition requirements after having been recorded. It was never a Recognized Decision. It is preserved for audit purposes but produces no protocol consequences. |
| **Archived** | The decision has completed its lifecycle and has been preserved in the Decision Registry for permanent audit and reconstruction access. Archived decisions produce no current consequences but remain fully accessible. |

### 5.2 State Machine

```
                    ┌─────────┐
                    │  Draft  │
                    └────┬────┘
                         │ formal submission
                         ▼
                    ┌──────────┐
                    │ Proposed │
                    └────┬─────┘
                         │ precondition evaluation begins
                         ▼
               ┌──────────────────┐
               │ Pending          │
               │ Validation       │
               └──────┬───────────┘
          ┌───────────┤
          │ fails     │ succeeds
          ▼           ▼
      ┌─────────┐  ┌───────────┐
      │ Invalid │  │ Validated │
      └─────────┘  └─────┬─────┘
                         │ authority exercised
                         ▼
                    ┌────────┐
                    │ Active │◄──────────────────┐
                    └───┬────┘                   │
           ┌────────────┼────────────┐           │
           │            │            │           │
     challenge      supersession  revocation     │
           ▼            ▼            ▼           │
    ┌────────────┐  ┌──────────┐  ┌─────────┐   │
    │ Under      │  │Superseded│  │ Revoked │   │
    │ Challenge  │  └────┬─────┘  └────┬────┘   │
    └──────┬─────┘       │             │         │
     ┌─────┼─────┐       │             │         │
     │           │       │             │         │
  suspend    reject      │             │         │
     │       challenge   │             │         │
     ▼           │       │             │         │
┌──────────┐     └───────┘→→→→→→→→→→→→┘         │
│Suspended │                                     │
└────┬─────┘                                     │
     │ lifted                                    │
     └───────────────────────────────────────────┘
     
All terminal states → Archive upon governance order
```

### 5.3 Valid Transitions

| From | To | Trigger |
|---|---|---|
| Draft | Proposed | Formal submission by initiating actor |
| Proposed | Pending Validation | Protocol acceptance of submission |
| Pending Validation | Validated | All preconditions satisfied |
| Pending Validation | Invalid | Irremediable precondition failure |
| Validated | Active | Authority exercises decision; recognition confirmed |
| Active | Under Challenge | Challenge raised by recognized party |
| Active | Superseded | Superseding decision recognized |
| Active | Revoked | Revocation by recognized authority |
| Active | Archived | Governance archives completed decision |
| Under Challenge | Active | Challenge rejected |
| Under Challenge | Suspended | Challenge triggers suspension order |
| Suspended | Active | Suspension lifted by governance or challenge resolution |
| Suspended | Revoked | Challenge succeeds; revocation ordered |
| Revoked | Archived | Permanent preservation |
| Superseded | Archived | Permanent preservation |
| Invalid | Archived | Permanent preservation of deficient record |

### 5.4 Prohibited Transitions

| Prohibited | Reason |
|---|---|
| Active → Validated | A recognized decision cannot be unrecognized by reverting to a prior state |
| Active → Draft | State cannot regress past recognition |
| Active → Proposed | State cannot regress past recognition |
| Archived → Any | Archived is terminal |
| Invalid → Active | An invalid decision cannot become recognized without re-submission |
| Revoked → Active | A revoked decision cannot be reinstated; a new decision must be produced |
| Superseded → Active | A superseded decision cannot be reinstated |
| Any → Any (without trigger) | State transitions require protocol-recognized triggers |

---

## 6. Decision Lifecycle

The full lifecycle from authority to historical preservation:

```
RECOGNIZED AUTHORITY (RFC-005-H8)
         │
         │  exercises decision-making in context
         ▼
DECISION PROPOSAL
  • Decision Maker initiates
  • Decision type, subject, scope, basis identified
  • Formal submission into protocol
         │
         ▼
PRECONDITION VALIDATION
  • Evidence requirements verified (RFC-004)
  • Claims requirements verified (RFC-005)
  • Standing requirements verified (RFC-005-H2)
  • Authority requirements verified (RFC-005-H8)
  • Governance requirements evaluated (RFC-005-H3)
  • Policy requirements evaluated
  • Review requirements triggered
         │
         │  [fail → Invalid]
         ▼
GOVERNANCE COMPLIANCE
  • Required reviews completed
  • Required governance approvals obtained
  • Quorum established (if collective)
  • Policy version recorded
         │
         ▼
RECOGNITION
  • All recognition requirements satisfied
  • Decision Record created in Decision Registry
  • Outcome formally established
  • State transitions to Active
         │
         ▼
ACTIVE DECISION
  • Outcome is in force
  • Consequences are operative
  • Downstream processes may rely on it
         │
         ├──→ EXECUTION
         │      • Operational realization of consequences
         │      • Execution Record references Decision Record
         │      • Partial execution tracked
         │
         ├──→ REVIEW (periodic or triggered)
         │      • Authorized governance review of decision
         │      • Does not alter recognition state
         │      • May trigger challenge or revocation
         │
         ├──→ CHALLENGE
         │      • Raised by recognized party
         │      • Challenge grounds verified
         │      • Review by independent body
         │      • [sustained → Suspension or Revocation]
         │      • [rejected → returns to Active]
         │
         ├──→ SUPERSESSION
         │      • New decision recognized
         │      • Prior decision transitions to Superseded
         │      • Lineage preserved
         │
         ├──→ REVOCATION
         │      • Recognized revocation authority acts
         │      • Grounds documented
         │      • Consequences unwound per policy
         │      • Record preserved permanently
         │
         └──→ HISTORICAL PRESERVATION (Archive)
                • Decision and all history preserved
                • Accessible for audit and reconstruction
                • No further state changes possible
```

---

## 7. Decision Inputs

All inputs to a decision carry constitutional weight. No input may be fabricated, forged, ignored, or selectively omitted.

### 7.1 Authority (RFC-005-H8)

**Constitutional weight: Mandatory. Without it, no decision is possible.**

The recognized authority that produces the decision is the most fundamental input. It establishes the constitutional legitimacy of the act. Without a traceable reference to a recognized, current, in-scope authority record, no decision may be recognized.

### 7.2 Standing (RFC-005-H2)

**Constitutional weight: Mandatory precondition class. Scope-dependent.**

Standing snapshots establish the current protocol state of the decision-making actor and, where required, the decision subject. Standing is evaluated at decision time. Standing snapshots are immutable records of the standing evaluation at that moment.

### 7.3 Evidence (RFC-004)

**Constitutional weight: Mandatory basis. Insufficient evidence is a validity deficiency.**

Evidence provides the factual foundation upon which the decision rests. Evidence must be verified, current, and referenced. Expired, revoked, or challenged evidence may not be relied upon unless policy explicitly permits it, in which case the reliance must be recorded.

### 7.4 Claims (RFC-005)

**Constitutional weight: Mandatory basis for claim-dependent decision types.**

Verified claims interpret evidence into protocol assertions about subjects. Claims that are unverified, expired, superseded, or challenged may not form the basis of a recognized decision without explicit policy authorization and documented justification.

### 7.5 Governance Rules (RFC-005-H3)

**Constitutional weight: Mandatory framework. No decision exists outside governance.**

The applicable governance rules define what process must be followed to produce a recognized decision of this type. Governance rules are version-controlled: the version in force at decision time governs the decision.

### 7.6 Historical Decisions

**Constitutional weight: Mandatory for decisions with precedent dependencies.**

Prior recognized decisions establish protocol facts upon which subsequent decisions may depend. A decision that contradicts an active prior decision without superseding it is a constitutional conflict. Decision lineage must be consulted.

### 7.7 Challenges

**Constitutional weight: Mandatory awareness. Active challenges on inputs may disqualify the decision.**

If any input to a decision — an evidence record, a claim, a standing snapshot, an authority record — is under active challenge, the decision-making process must account for this. Policy defines whether a challenged input disqualifies the decision or whether the decision may proceed with documented awareness of the challenge.

### 7.8 Delegations

**Constitutional weight: Mandatory if authority is delegated.**

If the decision-making authority was delegated rather than original, the full delegation chain must be traced. Delegation records must be active, within scope, and not revoked. Delegation chains must terminate at an original recognized authority.

### 7.9 Context

**Constitutional weight: Mandatory for reconstruction and explainability.**

Context captures the conditions under which the decision was produced. It enables reconstruction, supports challenge analysis, and enables explainability. Context cannot substitute for a substantive input but its absence undermines auditability.

### 7.10 Input Weight Summary

| Input | Weight | Absence Effect |
|---|---|---|
| Authority | Mandatory | Decision cannot be recognized |
| Standing | Mandatory (scope-dependent) | Decision cannot be recognized |
| Evidence | Mandatory | Decision is constitutionally deficient |
| Claims | Mandatory (decision-type dependent) | Decision is constitutionally deficient |
| Governance Rules | Mandatory | Decision cannot be recognized |
| Historical Decisions | Mandatory (lineage-dependent) | Undetected conflicts may arise |
| Challenges | Mandatory awareness | Unrecognized conflicts may void decision |
| Delegations | Mandatory if applicable | Authority chain fails |
| Context | Mandatory for reconstruction | Explainability and audit fail |

---

## 8. Decision Creation Model

### 8.1 How a Decision Is Born

A decision is born from the convergence of four constitutional conditions:

```
Recognized Authority
      ×
Valid Decision Process
      ×
Governance Compliance
      ×
Constitutional Legitimacy
      =
Recognized Decision
```

None of the four conditions alone, and no combination of three without the fourth, produces a recognized decision. They are jointly necessary.

### 8.2 How a Decision Is Validated

Validation is the protocol process by which a submitted decision is evaluated against all recognition requirements. Validation is not performed by the Decision Maker. Validation is an independent protocol function.

Validation checks, in sequence:

**Step 1 — Identity Verification**
Is the Decision Maker identified under RFC-001? Is their identity current and not revoked?

**Step 2 — Authority Verification**
Does the Decision Maker hold recognized authority under RFC-005-H8 for this decision type and scope? Is the authority current, not suspended, not revoked?

**Step 3 — Standing Verification**
Does the Decision Maker hold required standing under RFC-005-H2? Does the decision subject's standing state satisfy decision preconditions?

**Step 4 — Evidence Verification**
Is the required evidence present, referenced, current, and verified under RFC-004? Is any required evidence missing, expired, or challenged?

**Step 5 — Claims Verification**
Are required claims present, verified, and in active standing? Are any claims superseded, challenged, or expired?

**Step 6 — Governance Verification**
Have required governance approvals been obtained? Has required review been completed? Is quorum established for collective decisions? Is the applicable policy version recorded?

**Step 7 — Scope Verification**
Is the decision scope defined? Does the decision scope fall within the authority scope? Are the claimed consequences within the defined scope?

**Step 8 — Completeness Verification**
Are all mandatory Decision Record fields present? Are all references resolvable?

If any step fails, validation returns a deficiency list. The decision remains in Pending Validation state. The initiating actor may remediate deficiencies and resubmit. Some deficiencies are irremediable (e.g., authority has been revoked); these produce the Invalid state.

### 8.3 How a Decision Is Recognized

Recognition occurs when all eight validation steps pass. Recognition is performed by the Decision Validation Service (a protocol function distinct from the Decision Maker). Upon recognition:

- The Decision Record is written to the Decision Registry.
- The state transitions to Active.
- The Recognition timestamp is recorded.
- Consequences become operative.
- Downstream processes may rely on the decision.

Recognition is not reversible in the sense of erasure. A recognized decision may be revoked or superseded, but it remains in the registry permanently.

### 8.4 How a Decision Is Rejected

A decision is rejected when validation fails and the deficiency is irremediable. Irremediable conditions include:

- The claimed authority does not exist or has been revoked.
- The decision scope exceeds any possible authority scope.
- Required evidence is permanently unavailable.
- Required governance has definitively declined to approve.

Rejected decisions are recorded in Invalid state. The rejection grounds are documented. The record is preserved for audit.

### 8.5 How a Decision Is Limited

A decision's consequences may be limited when:

- A challenge is sustained on scope grounds → consequences are limited to the valid scope.
- Governance orders a limitation following review.
- A superseding decision limits the effect of the prior decision.

Limitation is not revocation. The limited decision remains Active but with reduced consequences. Limitation is recorded and traceable.

### 8.6 How a Decision Is Executed

Execution is the operational realization of the decision's consequences. Execution is performed by an authorized execution actor (distinct from the Decision Maker). Every execution act must reference the Recognized Decision it realizes. Execution without a corresponding recognized decision is unauthorized.

### 8.7 How a Decision Is Conserved

Conservation — the permanent preservation of the decision record — begins at recognition and continues indefinitely. Every state change, challenge, revocation, supersession, and audit access is appended to the record. Conservation is not contingent on the decision being Active. Revoked, superseded, and invalid decisions are equally preserved.

---

## 9. Decision Algorithms

These are conceptual algorithms — not code. They define the logical processes that a conformant implementation must realize.

### 9.1 Decision Eligibility Algorithm

```
ALGORITHM: DecisionEligibility

INPUT:
  candidate_actor (identified principal)
  decision_type
  decision_scope
  applicable_policy_version

OUTPUT:
  eligibility_result { eligible: boolean, deficiencies: list }

PROCESS:
  1. Resolve identity of candidate_actor via RFC-001
     IF identity not recognized OR revoked → ADD deficiency("identity_invalid")

  2. Resolve authority of candidate_actor for decision_type and decision_scope via RFC-005-H8
     IF no recognized authority → ADD deficiency("no_authority")
     IF authority suspended → ADD deficiency("authority_suspended")
     IF authority out of scope → ADD deficiency("authority_out_of_scope")

  3. Evaluate standing of candidate_actor for context via RFC-005-H2
     IF standing insufficient → ADD deficiency("standing_insufficient")
     IF standing challenged in relevant context → ADD deficiency("standing_under_challenge")

  4. Verify capability of candidate_actor for decision_type via RFC-005-H4
     IF capability not held → ADD deficiency("capability_missing")
     IF capability expired or revoked → ADD deficiency("capability_invalid")

  5. Check governance requirements for decision_type in applicable_policy_version
     Collect: required_approvals, required_reviews, quorum_requirements

  6. Evaluate conflict-of-interest conditions per policy
     IF conflict exists → ADD deficiency("conflict_of_interest")

  RETURN { eligible: deficiencies.empty(), deficiencies: deficiencies }
```

### 9.2 Decision Creation Algorithm

```
ALGORITHM: DecisionCreation

INPUT:
  decision_maker
  decision_type
  decision_subject
  decision_scope
  decision_basis { evidence_refs, claim_refs, standing_refs }
  decision_context
  governance_record

OUTPUT:
  decision_record { draft }

PROCESS:
  1. Run DecisionEligibility(decision_maker, decision_type, decision_scope)
     IF not eligible → REJECT with deficiencies

  2. Construct Decision Record:
     - Assign provisional Decision Identifier
     - Record decision_type, decision_subject, decision_scope
     - Record decision_basis references
     - Record decision_context
     - Record governance_record references
     - Record Produced At timestamp
     - Set state = Proposed

  3. Submit Decision Record to Decision Validation Service
     SET state = Pending Validation

  RETURN decision_record
```

### 9.3 Decision Validation Algorithm

```
ALGORITHM: DecisionValidation

INPUT:
  decision_record (in Pending Validation state)

OUTPUT:
  validation_result { valid: boolean, deficiencies: list }

PROCESS:
  1. Verify identity of decision_maker (Step 1)
  2. Verify authority for type and scope (Step 2)
  3. Verify standing requirements (Step 3)
  4. Verify evidence references (Step 4)
     FOR EACH evidence_ref:
       Resolve via RFC-004
       IF not found OR revoked OR expired → ADD deficiency
  5. Verify claims references (Step 5)
  6. Verify governance compliance (Step 6)
     FOR EACH required_approval:
       Verify approval is recorded and current
     IF quorum_required: verify quorum_record
  7. Verify scope (Step 7)
     IF decision_scope.exceeds(authority_scope) → ADD deficiency
  8. Verify completeness (Step 8)
     FOR EACH mandatory_field:
       IF missing → ADD deficiency

  IF deficiencies.empty():
    SET state = Validated
  ELSE IF any_deficiency_irremediable():
    SET state = Invalid
  ELSE:
    RETURN deficiencies for remediation

  RETURN validation_result
```

### 9.4 Decision Activation Algorithm

```
ALGORITHM: DecisionActivation

INPUT:
  decision_record (in Validated state)
  authority_exercise_attestation

OUTPUT:
  recognized_decision_record

PROCESS:
  1. Verify state = Validated
  2. Verify authority_exercise_attestation:
     - authority_record current and recognized
     - attestation signed by recognized decision_maker
     - attestation timestamp within valid window
  3. Record Recognized At timestamp
  4. SET state = Active
  5. Write immutable record to Decision Registry
  6. Record consequences in protocol state
  7. Notify authorized parties per policy

  RETURN recognized_decision_record
```

### 9.5 Decision Suspension Algorithm

```
ALGORITHM: DecisionSuspension

INPUT:
  decision_record (in Active or Under Challenge state)
  suspension_authority
  suspension_grounds
  suspension_order

OUTPUT:
  updated_decision_record

PROCESS:
  1. Verify suspension_authority holds recognized authority to suspend this decision type
  2. Verify suspension_grounds are valid per policy
  3. Record suspension_order in Decision History
  4. SET state = Suspended
  5. Emit suspension event to consequence holders
  6. Consequences become temporarily inoperative

  RETURN updated_decision_record
```

### 9.6 Decision Revocation Algorithm

```
ALGORITHM: DecisionRevocation

INPUT:
  decision_record (in Active, Suspended, or Under Challenge state)
  revocation_authority
  revocation_grounds
  revocation_decision_record (itself a recognized decision)

OUTPUT:
  revoked_decision_record

PROCESS:
  1. Verify revocation_authority holds recognized revocation authority
  2. Verify revocation_grounds are valid per policy
  3. Verify revocation_decision_record is itself a Recognized Decision
  4. Record revocation in Decision History with all attributes
  5. SET state = Revoked
  6. Propagate revocation to consequences per policy
  7. Preserve complete record permanently

  RETURN revoked_decision_record
```

### 9.7 Decision Supersession Algorithm

```
ALGORITHM: DecisionSupersession

INPUT:
  prior_decision_record (in Active state)
  superseding_decision_record (must be a Recognized Decision)

OUTPUT:
  updated_prior_decision_record

PROCESS:
  1. Verify superseding_decision_record is Recognized
  2. Verify superseding authority is recognized for the domain
  3. Verify supersession is explicitly recorded in superseding_decision_record
  4. Record supersession reference in prior_decision_record.history
  5. SET prior_decision_record.state = Superseded
  6. Superseding_decision_record consequences become operative
  7. Prior consequences wound back per policy (if applicable)

  RETURN updated_prior_decision_record
```

### 9.8 Decision Reconstruction Algorithm

```
ALGORITHM: DecisionReconstruction

INPUT:
  decision_identifier
  target_timestamp

OUTPUT:
  reconstructed_decision_state { state, attributes, history_up_to_timestamp }

PROCESS:
  1. Retrieve Decision Record from Decision Registry by decision_identifier
  2. Retrieve complete Decision History
  3. Filter history events to all events with timestamp ≤ target_timestamp
  4. Replay history events in chronological order:
     FOR EACH event:
       Apply event to reconstruct state at that point
  5. Derive: state, active_scope, operative_consequences, pending_challenges
     at target_timestamp

  RETURN reconstructed_decision_state
```

### 9.9 Decision Challenge Resolution Algorithm

```
ALGORITHM: ChallengeResolution

INPUT:
  challenge_record
  challenge_reviewer (must be independent of decision_maker)
  review_findings

OUTPUT:
  resolution_record

PROCESS:
  1. Verify challenge_reviewer is authorized and independent
  2. Evaluate review_findings against challenge_grounds
  3. IF challenge sustained:
     a. Record sustenance in challenge_record
     b. Determine consequence: suspension, revocation, limitation, or escalation
     c. Execute consequence via appropriate algorithm
  4. IF challenge rejected:
     a. Record rejection in challenge_record
     b. Decision returns to Active state (if suspended)
     c. Challenge grounds preserved for appeal
  5. Record resolution in Decision History

  RETURN resolution_record
```

### 9.10 Decision Audit Algorithm

```
ALGORITHM: DecisionAudit

INPUT:
  decision_identifier
  auditor (must hold authorized audit standing)
  audit_scope { fields, time_range }

OUTPUT:
  audit_record

PROCESS:
  1. Verify auditor holds authorized audit standing
  2. Retrieve Decision Record
  3. Retrieve Decision History (complete)
  4. Evaluate all mandatory traceability fields: present, resolvable, consistent
  5. Evaluate lifecycle transitions: all valid, all triggered by recognized events
  6. Evaluate all challenge records: complete, independent reviewers, valid outcomes
  7. Evaluate consequence records: traceable to decision, within scope
  8. Evaluate reconstruction capacity: all inputs preserved and resolvable
  9. Produce audit findings: conformant, deficient, or non-conformant
  10. Record audit access in Decision History

  RETURN audit_record
```

---

## 10. Decision Scope Model

Scope is a hard constitutional constraint. A decision produces consequences only within its defined scope. Scope cannot be implied, assumed, or retroactively expanded.

### 10.1 Temporal Scope

**Definition:** The time window during which the decision is operative.

Every decision has a temporal scope. For some decisions, this is indefinite (until revoked or superseded). For others, it is bounded (expires on a date, or applies only during a defined period).

Temporal scope constraints:
- The decision must be produced within the authority's valid temporal window.
- The decision may not claim temporal scope beyond the authority's recognized period.
- Temporal expiration is a lifecycle event, not a revocation. Expired decisions are archived, not revoked.

### 10.2 Jurisdictional Scope

**Definition:** The legal, regulatory, or governance jurisdictions in which the decision is operative.

A decision made within one jurisdiction does not automatically apply in another. Cross-jurisdictional effect requires:
- The authority to be recognized in all claimed jurisdictions.
- Policy in each jurisdiction to permit the decision type.
- Governance compliance in each jurisdiction.

### 10.3 Contextual Scope

**Definition:** The specific operational, organizational, or situational context in which the decision applies.

A decision made in an emergency operational context may not apply in standard operational contexts, and vice versa. Context-dependent scope must be explicit.

### 10.4 Organizational Scope

**Definition:** The organizational unit, division, or entity within which the decision is operative.

A decision made within one organizational unit does not extend to sibling or parent units unless authority to bind those units was recognized.

### 10.5 Domain Scope

**Definition:** The subject-matter domain in which the decision applies (financial, credential, operational, governance, etc.).

Domain scope ensures that authority recognized in one domain does not produce decisions in another. A financial authority cannot produce a governance decision. A credential authority cannot produce a financial decision.

### 10.6 Purpose Scope

**Definition:** The specific purpose for which the decision was produced.

A decision made for a specific purpose may not be applied to other purposes. Purpose scope prevents scope creep and unauthorized repurposing of recognized decisions.

### 10.7 Authority Dependency

**Definition:** The specific authority record upon which the decision's scope depends.

If the authority record is revoked, the decision's scope collapses. If the authority record's scope is limited, the decision's scope is correspondingly limited. Authority dependency is a live scope constraint.

### 10.8 Scope Violation Detection

A scope violation occurs when:
- Consequences are realized outside the defined scope dimensions.
- A downstream process treats the decision as applying beyond its scope.
- An execution actor realizes consequences in excess of the decision scope.

Scope violations must be detectable by the Decision Audit Algorithm and must be challengeable on scope grounds.

---

## 11. Decision Constraints

### 11.1 Absolute Constraints

The following constraints are absolute. No authority, governance body, or policy instrument may waive them.

**CONSTRAINT-001:** A decision can never exceed the authority of its Decision Maker.
*Rationale:* Authority is the constitutional ceiling of decision scope. Authority that is itself bounded cannot produce decisions that exceed its bounds.

**CONSTRAINT-002:** A decision can never exceed the standing required by its type and context.
*Rationale:* Standing is a constitutional precondition. Insufficient standing is not a waivable procedural defect; it is a constitutional disqualification.

**CONSTRAINT-003:** A decision can never bypass governance.
*Rationale:* Governance is the collective constraint on individual authority. No individual authority holds the power to unilaterally exempt itself from governance.

**CONSTRAINT-004:** A decision can never ignore required evidence.
*Rationale:* Evidence is the factual foundation. A decision without required evidence is a decision without constitutional basis.

**CONSTRAINT-005:** A decision can never ignore required context.
*Rationale:* Context is necessary for reconstruction, explainability, and challenge. Decontextualized decisions are constitutionally deficient.

**CONSTRAINT-006:** A decision can never ignore scope limits.
*Rationale:* Scope is a hard constitutional boundary. Consequences outside scope are void regardless of authority or governance.

**CONSTRAINT-007:** A decision can never self-validate.
*Rationale:* Self-validation is the foundational form of capture. The validator must be independent of the Decision Maker.

**CONSTRAINT-008:** A decision can never self-review.
*Rationale:* A challenged decision must be reviewed by an independent authority. The Decision Maker cannot be the reviewer of their own decision.

**CONSTRAINT-009:** A decision can never self-audit.
*Rationale:* Audit must be independent. The Decision Maker cannot audit the correctness of their own decision.

**CONSTRAINT-010:** A decision can never alter its own recognition requirements retroactively.
*Rationale:* Recognition requirements are set by governance, not by individual authorities. Post-hoc alteration is a governance bypass.

**CONSTRAINT-011:** A decision can never produce consequences without traceability.
*Rationale:* Untraceable consequences are ungoverned consequences. All protocol state changes must trace to recognized decisions.

**CONSTRAINT-012:** A decision can never eliminate challenge rights.
*Rationale:* Challenge is a constitutional right. No decision can extinguish the right of recognized parties to challenge it.

**CONSTRAINT-013:** A decision can never alter its own historical record.
*Rationale:* Historical records are immutable. History is the foundation of reconstruction and audit.

**CONSTRAINT-014:** A decision can never be applied outside its temporal scope without recognition of a superseding decision.
*Rationale:* Temporal scope is a hard limit. Extended effect requires a new decision.

**CONSTRAINT-015:** A decision produced by a revoked authority is void from production.
*Rationale:* Revoked authority produces no legitimate decisions. Void ab initio.

### 11.2 Governance-Configurable Constraints

These constraints define defaults that governance may configure within constitutional limits.

- The minimum required standing level for decision types within a domain.
- The types and number of required governance approvals for collective decisions.
- The temporal expiration periods for decision types.
- The challenge filing periods applicable to decision types.
- The propagation rules for consequence unwinding upon revocation.

Governance-configurable constraints must themselves be produced through recognized governance decisions. Governance cannot self-exempt from governance.

---

## 12. Decision Validation Model

### 12.1 What Makes a Decision Valid

A decision is constitutionally valid when:

1. **Authority is verified.** The Decision Maker holds recognized, current, in-scope authority for the decision type.
2. **Process is valid.** The decision was produced through a process that satisfies all applicable governance, review, and precondition requirements.
3. **Scope is valid.** The decision scope is defined and falls within the authority scope.
4. **Basis is sufficient.** Required evidence, claims, and standing are present, verified, and referenced.
5. **Governance is satisfied.** Required approvals, quorums, and reviews are recorded.
6. **Record is complete.** All mandatory Decision Record fields are present and resolvable.
7. **Traceability is complete.** All mandatory traceability questions can be answered from the record.
8. **Recognition is independent.** Validation was performed by an actor independent of the Decision Maker.

All eight conditions are jointly necessary. Satisfaction of seven conditions with one failure does not produce a valid decision.

### 12.2 What Makes a Decision Invalid

A decision is constitutionally invalid when any of the following applies:

| Invalidity Condition | Classification |
|---|---|
| No recognized authority | Void — never a recognized decision |
| Authority out of scope | Void as to the out-of-scope elements |
| Authority revoked before exercise | Void — production on revoked authority |
| Governance requirements unmet | Claimed Decision — not recognized |
| Required evidence absent or revoked | Constitutionally deficient |
| Required review not completed | Claimed Decision — not recognized |
| Self-validation | Invariant violation — void |
| Scope undefined | Constitutionally deficient |
| Traceability incomplete | Constitutionally deficient |
| Record incomplete | Constitutionally deficient |

### 12.3 What Evidence a Valid Decision Requires

Required evidence is policy-defined per decision type. Constitutional minimums:

- **Identity evidence:** Identity of Decision Maker must be verified (RFC-001).
- **Authority evidence:** Authority record must be referenced and resolvable (RFC-005-H8).
- **Basis evidence:** Substantive evidence relevant to the decision outcome must be referenced (RFC-004).
- **Governance evidence:** Governance approvals, review records, and applicable policy version must be referenced.
- **Standing evidence:** Standing snapshots for relevant parties must be referenced (RFC-005-H2).

### 12.4 What Authority a Valid Decision Requires

- Recognized authority under RFC-005-H8.
- Authority recognized for the specific decision type.
- Authority recognized within the claimed scope.
- Authority current at decision time.
- Authority not suspended, revoked, or under challenge that blocks exercise.

### 12.5 What Governance a Valid Decision Requires

- Compliance with the applicable policy version.
- All required collective approvals obtained and recorded.
- Quorum established where required.
- Required review processes completed.
- Governance body with jurisdiction notified or participating as required.

### 12.6 What Traceability a Valid Decision Requires

Every recognized decision must answer all mandatory traceability questions:

| Question | Source |
|---|---|
| Who made it? | Decision Maker identity |
| With what authority? | Authority record reference |
| For what purpose? | Decision outcome statement |
| Within what scope? | Decision scope definition |
| On what evidence? | Evidence references |
| Under what governance? | Governance record references |
| At what moment? | Produced At and Recognized At timestamps |
| With what consequences? | Consequence references |
| With what history? | Decision History |

---

## 13. Decision Explainability

Every recognized decision must be explainable. Explainability is not a feature; it is a constitutional requirement.

### 13.1 Why Does This Decision Exist?

The decision must record its purpose: what outcome it was produced to achieve, what protocol state it was produced to create or alter, and what governance context authorized its production.

An unexplained decision — one for which no stated purpose is recorded — fails the explainability requirement.

### 13.2 Who Produced It?

The Decision Maker must be identified. The identification must be verifiable via RFC-001. The authority exercised must be traceable to the Decision Maker's recognized authority record.

### 13.3 With What Authority?

The authority record must be referenced. The authority must be verifiable as current, recognized, and in-scope at decision time. The authority's recognition basis must be traceable through RFC-005-H8.

### 13.4 Under What Governance?

The governance record must be referenced. The applicable policy version must be identified. Required approvals and reviews must be referenced. The governance body with jurisdiction must be identified.

### 13.5 With What Evidence?

Every evidence record relied upon must be referenced. The nature of reliance (what fact the evidence establishes, why it is relevant to the decision outcome) must be recorded. Unexplained evidence references do not satisfy the explainability requirement.

### 13.6 Why Was It Approved?

Where governance approval was required, the approval record must explain why approval was granted: what requirements were satisfied, what review was completed, what governance body authorized it.

### 13.7 Why Was It Rejected?

Where a decision was rejected (Invalid state), the grounds for rejection must be recorded: which precondition failed, which authority was insufficient, which governance requirement was unmet. Rejection records are as constitutionally significant as recognition records.

### 13.8 Why Was It Revoked?

Where a decision was revoked, the revocation grounds must be recorded: what made the decision constitutionally deficient, what authority ordered revocation, what consequences were unwound. Revocation without explained grounds is a governance failure.

### 13.9 Explainability as a Challenge Ground

A decision that cannot be explained — that lacks recorded basis for its existence, its authority, its governance, its evidence, or its consequences — is challengeable on governance grounds. Unexplainability is an auditable deficiency.

---

## 14. Decision Challenges

### 14.1 Constitutional Basis for Challenges

Challenge is a constitutional right, not a procedural privilege. Every recognized decision must be challengeable. No decision type, no level of authority, and no governance body produces decisions that are immune from challenge.

Challenge is the mechanism by which constitutional legitimacy is maintained over time. Without challenges, errors in authority, scope, governance, and evidence cannot be corrected.

### 14.2 Challenge Types

| Challenge Type | Description | Grounds |
|---|---|---|
| **Challenge Authority** | The Decision Maker did not hold recognized authority for this decision type and scope at decision time. | Authority record does not support this decision. Authority was revoked before exercise. Authority scope does not include this decision scope. |
| **Challenge Evidence** | The evidence relied upon was invalid, expired, revoked, forged, or insufficient. | Evidence record not found. Evidence was revoked at decision time. Evidence was not verified. Evidence does not support the asserted fact. |
| **Challenge Governance Basis** | The required governance process was not followed. | Required approval was not obtained. Quorum was not established. Required review was not completed. Applicable policy was incorrectly identified. |
| **Challenge Scope** | The decision produced consequences outside its recognized scope. | Consequences extend beyond defined temporal, jurisdictional, organizational, or domain scope. |
| **Challenge Procedure** | The decision production process was procedurally deficient. | Required steps were skipped. Process was followed out of order. Required actors were excluded. |
| **Challenge Outcome** | The decision outcome contains material error: the outcome does not follow from the basis, authority, and governance of the decision. | Logical inconsistency between basis and outcome. Outcome exceeds what the basis can support. |

### 14.3 Who May Challenge

- The decision subject (the party directly affected by the outcome).
- Parties with recognized interest as defined by policy.
- Authorized governance bodies.
- Authorized audit parties.
- Protocol-recognized challenge actors.

Anonymous challenges are constitutionally invalid. Every challenge must be attributable to an identified party.

### 14.4 Challenge States

| State | Meaning |
|---|---|
| **Submitted** | Challenge formally filed by a recognized party. Challenge record created. |
| **Accepted** | Challenge is formally accepted for review. Review process initiated. |
| **Rejected** | Challenge is rejected without substantive review (e.g., the challenging party lacks standing, or the challenge grounds are manifestly invalid). |
| **Under Review** | Challenge is being substantively evaluated by an independent reviewer. |
| **Escalated** | Challenge has been escalated to a higher governance authority (e.g., because the initial reviewer lacked authority, or because the challenge raises systemic issues). |
| **Resolved** | Challenge has been resolved. Outcome: sustained, rejected, or settled through recognized process. |
| **Closed** | Challenge record is closed and archived. |

### 14.5 Challenge Resolution Effects

| Outcome | Effect |
|---|---|
| **Sustained: Revocation** | Decision is revoked. Consequences are unwound per policy. |
| **Sustained: Suspension** | Decision consequences are suspended pending remediation or further review. |
| **Sustained: Limitation** | Decision consequences are limited to a narrower scope. |
| **Sustained: Escalation** | Challenge is escalated to a higher governance body. |
| **Rejected** | Decision returns to or remains in Active state. Challenge grounds are preserved for appeal. |
| **Withdrawn** | Challenge is withdrawn by challenging party. Decision remains Active. Withdrawal is recorded. |

### 14.6 Challenge Independence Requirement

Challenge reviewers must be independent of the Decision Maker. A Decision Maker cannot review a challenge to their own decision. The governance body that approved the decision cannot be the sole reviewer of a challenge to it without independent oversight.

### 14.7 Challenge Filing Period

Policy must define a challenge filing period for each decision type. However, certain challenge grounds are not subject to filing period limits:

- Challenges on the ground that the authority used was fraudulently obtained may be filed at any time.
- Challenges on the ground that the decision record was falsified may be filed at any time.
- Challenges on the ground that the decision suppressed required evidence may be filed at any time.

Constitutional violations have no statute of limitations.

---

## 15. Decision Revocation

### 15.1 When a Decision May Be Revoked

A decision may be revoked when:

1. A sustained challenge establishes that the decision was produced on invalid authority.
2. A sustained challenge establishes that required governance was bypassed.
3. Evidence upon which the decision relied is subsequently found to be fabricated or fraudulently obtained.
4. The decision was produced in a context of conflict of interest that was not disclosed.
5. Recognized governance orders revocation for compelling public interest, constitutional compliance, or policy change.
6. The Decision Maker's authority was itself revoked on grounds that retroactively void acts performed under it.

### 15.2 Who May Revoke

Revocation must be performed by:
- A recognized authority with scope over the decision type — this may be a higher authority than the original Decision Maker.
- A governance body designated as a revocation authority for the domain.
- A challenge resolution process that produces revocation as its sustained outcome.

The Decision Maker may not unilaterally revoke their own decision without independent authorization. Self-revocation is a governance bypass.

### 15.3 How Revocation Is Documented

Revocation must be documented through a Revocation Record that is itself a Recognized Decision. The Revocation Record must include:

- Reference to the revoked decision.
- Grounds for revocation.
- The revocation authority.
- The applicable policy basis for revocation.
- The consequences of revocation (what is unwound, what is preserved).
- The timestamp of revocation.

### 15.4 How Revocation Is Audited

Revocation is a protocol fact that must be auditable. The audit trail must show:
- The original decision in full.
- The challenge or governance process that led to revocation.
- The revocation decision record.
- The consequence propagation triggered by revocation.

### 15.5 How the Record Is Preserved

Revoked decisions are never deleted. They transition to Revoked state and subsequently to Archived state. The complete decision record — including all history, challenges, and the revocation itself — is preserved permanently. Historical reconstruction must be able to show the decision as Active at the time it was Active, and Revoked at the time it was Revoked.

### 15.6 Consequence Propagation on Revocation

Policy must define consequence propagation rules. These rules determine:
- Which consequences are wound back upon revocation.
- Which consequences, once realized, cannot be unwound (e.g., actions taken in good faith reliance on the decision).
- How downstream decisions that relied on the revoked decision are affected.
- Whether downstream decisions must be independently re-evaluated.

Consequence propagation must be traceable. Automatic propagation must be governed by recognized rules, not ad hoc policy.

---

## 16. Decision Supersession

### 16.1 How a Decision Supersedes Another

Supersession occurs when a later recognized decision explicitly replaces an earlier recognized decision within an overlapping scope. Supersession requires:

1. The superseding decision is itself a Recognized Decision.
2. The superseding decision explicitly identifies the decision it supersedes.
3. The superseding Decision Maker holds recognized authority for the domain.
4. The supersession is recorded in both the superseding and superseded decision records.

### 16.2 How History Is Preserved

Superseded decisions remain in the Decision Registry in Superseded state. They are never deleted. The superseded decision record includes:
- A reference to the superseding decision.
- The timestamp of supersession.
- The history of the decision up to and including supersession.

The superseding decision record includes:
- A reference to the superseded decision.
- The basis for supersession (why the prior decision is being replaced).

### 16.3 How Traceability Is Maintained

The lineage chain — from the first decision through all supersessions — must be traversable in both directions. Given any decision in the chain, a reconstructor must be able to:
- Identify all decisions it supersedes.
- Identify the decision that supersedes it (if any).
- Reconstruct the operative decision at any historical point.

### 16.4 How Manipulation Is Prevented

Supersession manipulation risks include:
- Fabricating a superseding decision to displace a legitimate prior decision.
- Claiming supersession without producing a recognized superseding decision.
- Retroactively altering the supersession record.

Prevention mechanisms:
- Superseding decisions must themselves meet all recognition requirements.
- Supersession claims not backed by recognized superseding decisions are void.
- The Decision Registry is append-only; supersession records cannot be altered retroactively.
- Audit of the supersession lineage is a mandatory audit function.

---

## 17. Decision Reconstruction

### 17.1 Reconstruction as a Constitutional Requirement

Reconstruction is not optional. Every conformant Decision Framework must support deterministic reconstruction of any decision's state at any historical moment.

The reconstruction guarantee: for any decision identifier D and any timestamp T, there exists a deterministic function:

```
Reconstruct(D, T) → DecisionState
```

that returns the complete state of decision D as it existed at time T, including:
- Lifecycle state at time T.
- Active scope at time T.
- Operative consequences at time T.
- Active challenges at time T.
- Applicable authority record at time T.
- Applicable governance record at time T.

### 17.2 Reconstruction Requirements

For reconstruction to be possible:

1. **Complete History:** Every state transition must be recorded with timestamp and attribution.
2. **Preserved Inputs:** All evidence records, authority records, governance records, and standing snapshots referenced by the decision must be preserved in their historical state.
3. **Immutable Records:** Decision Records and their histories must not be altered retroactively.
4. **Temporal Indexing:** All events must be timestamped with sufficient precision to order them correctly.
5. **Reference Resolution:** All references in the Decision Record must remain resolvable at any future time.

### 17.3 Reconstruction and Audit

Reconstruction is the foundational capability of the Audit function. An auditor who cannot reconstruct the state of a decision at a specific historical moment cannot determine whether the decision was valid at that moment, cannot evaluate challenge grounds, and cannot verify consequence propagation.

A Decision Framework that does not support reconstruction fails its audit obligation.

### 17.4 Reconstruction and Challenge

Challenges often arise after the fact. A challenge raised years after a decision is recognized requires reconstruction of the decision's state, authority, governance, and basis at the time of recognition. Without reconstruction, historical challenges cannot be meaningfully evaluated.

---

## 18. Decision Accountability

### 18.1 Who Is Accountable for the Decision?

**The Decision Maker** is the primary accountable party for the decision. The Decision Maker is accountable for:
- Ensuring they hold recognized authority before producing the decision.
- Ensuring all required preconditions are satisfied.
- Ensuring the decision is submitted for validation through the recognized process.
- Ensuring the decision scope does not exceed their authority.

### 18.2 Who Is Accountable for Validation?

**The Decision Validation Service** (and the actors who operate it) is accountable for:
- Correctly evaluating all eight validation steps.
- Rejecting decisions that fail validation.
- Not validating decisions produced by unauthorized actors.
- Recording all validation findings accurately.

The Validation Service must be operationally independent of the Decision Maker.

### 18.3 Who Is Accountable for Execution?

**The Execution Actor** is accountable for:
- Realizing only the consequences defined in the Recognized Decision.
- Not executing without a corresponding Recognized Decision.
- Not exceeding the scope of the Recognized Decision in execution.
- Recording the execution against the Recognized Decision.

### 18.4 Who Is Accountable for Oversight?

**The Governance Body with jurisdiction** is accountable for:
- Defining the governance framework within which decisions are produced.
- Reviewing decisions as required by policy.
- Responding to challenge escalations.
- Ordering revocation or suspension when required.

### 18.5 Who Is Accountable for Challenges?

**The Challenge Reviewer** is accountable for:
- Conducting independent, impartial review.
- Evaluating challenge grounds against the decision record.
- Producing a reasoned resolution record.
- Not reviewing challenges in which they have a conflict of interest.

### 18.6 Who Is Accountable for Audit?

**The Audit Actor** is accountable for:
- Conducting complete, independent audit of decision records.
- Reporting deficiencies to the appropriate governance body.
- Preserving audit records.
- Not auditing decisions in which they have a conflict of interest.

### 18.7 Accountability Chain

```
Decision Maker → accountable for production
      ↓
Validation Service → accountable for recognition
      ↓
Execution Actor → accountable for realization
      ↓
Governance Body → accountable for oversight
      ↓
Challenge Reviewer → accountable for challenge resolution
      ↓
Audit Actor → accountable for audit integrity
```

No single actor in this chain may occupy more than one role for the same decision. Accountability requires role separation.

---

## 19. Separation of Powers

### 19.1 Constitutional Requirement

No single actor, body, or system may hold all decision-related powers simultaneously. The concentration of decision creation, validation, execution, oversight, challenge, and audit in a single actor is the definition of captured governance and is constitutionally prohibited.

### 19.2 Mandatory Role Separation

| Role | Who May Hold It | Who May Not Hold It |
|---|---|---|
| **Decision Creation** | Recognized authorities with decision-making scope | Validators, Audit actors, Challenge reviewers |
| **Decision Validation** | Independent validation actors designated by governance | The Decision Maker whose decision is being validated |
| **Decision Execution** | Execution actors with execution authority | The Decision Maker (unless policy explicitly permits) |
| **Decision Oversight** | Governance bodies with supervisory jurisdiction | Decision Makers subject to the oversight |
| **Decision Challenge** | Any recognized party with standing to challenge | The Decision Maker of the challenged decision |
| **Decision Audit** | Audit actors with audit standing | Decision Makers, Validation actors for decisions they validated |

### 19.3 Separation Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  CONSTITUTIONAL SYSTEM                    │
│                                                          │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │  Decision   │    │  Decision    │    │  Decision   │  │
│  │  Creation   │───►│  Validation  │───►│  Execution  │  │
│  │             │    │  (indep.)    │    │  (auth.)    │  │
│  └─────────────┘    └──────────────┘    └─────────────┘  │
│         │                  │                   │         │
│         ▼                  ▼                   ▼         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Decision Registry                    │   │
│  └──────────────────────────────────────────────────┘   │
│         │                  │                   │         │
│         ▼                  ▼                   ▼         │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │  Decision   │    │  Decision    │    │  Decision   │  │
│  │  Oversight  │    │  Challenge   │    │  Audit      │  │
│  │  (gov body) │    │  (indep.)    │    │  (indep.)   │  │
│  └─────────────┘    └──────────────┘    └─────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Each box is a distinct role held by distinct actors. The Decision Registry is the shared constitutional record accessible to all roles but modifiable only by the Validation Service (upon recognition) and through recognized lifecycle events.

### 19.4 Emergency Exceptions

Governance may define emergency procedures that temporarily modify role separation (e.g., during a crisis where normal quorum cannot be formed). Emergency exceptions must:
- Be defined in advance by recognized governance.
- Be time-limited.
- Be recorded as exceptional governance decisions.
- Be subject to post-emergency review.

Emergency procedures may never permanently eliminate role separation.

---

## 20. Constitutional Legitimacy Model

### 20.1 Why These Are Distinct Primitives

The following six concepts are not synonyms, not aliases, and not interchangeable. Each is a distinct constitutional primitive with distinct requirements, distinct lifecycle, and distinct constitutional function.

| Primitive | Constitutional Definition | What It Is Not |
|---|---|---|
| **Identity** | The verifiable, persistent anchor of a principal within the protocol. Established by RFC-001. | Identity is not standing. Having an identity does not mean one has any rights, capabilities, or authority. |
| **Standing** | The current protocol interpretation of a principal's verified evidence and claims within a context. Computed by RFC-005-H2. | Standing is not identity. Standing is not authority. High standing does not confer decision-making power. |
| **Authority** | Policy-recognized legitimacy to perform, validate, approve, issue, review, or influence protocol-recognized outcomes. Recognized by RFC-005-H8. | Authority is not capability. Authority is not standing. Authority is not identity. Holding authority does not produce decisions; exercising it does. |
| **Decision** | A protocol-recognized outcome produced under recognized authority within valid scope, through valid process, under valid governance. | Decision is not authority. Decision is not execution. Decision is not recommendation or review. |
| **Execution** | The operational realization of a Recognized Decision's consequences. | Execution is not the decision. Execution without a corresponding decision is unauthorized. |
| **Governance** | The collective framework of rules, bodies, processes, and oversight mechanisms that constrain and legitimate all protocol acts, including decisions. | Governance is not governance decisions. Governance decisions are individual protocol acts; Governance is the framework within which all acts occur. |

### 20.2 The Legitimacy Chain

```
IDENTITY establishes: who you are
  ↓
STANDING establishes: what the protocol currently recognizes about you
  ↓
AUTHORITY establishes: what you are legitimized to do
  ↓
DECISION establishes: what you have authoritatively concluded
  ↓
EXECUTION establishes: what has been operationally realized
  ↓
GOVERNANCE establishes: the framework within which all of the above is constrained
```

Each layer depends on all layers below it. A decision depends on recognized authority, which depends on verified standing, which depends on verified identity and evidence. Skipping any layer produces a constitutional deficiency.

### 20.3 Why Authority Is Necessary But Not Sufficient

Authority is necessary: without it, the Decision Maker has no constitutional basis for producing recognized decisions. But authority alone produces nothing. An actor holding recognized authority who does not go through a valid decision process, who does not obtain required governance compliance, who does not satisfy preconditions — that actor has not produced a recognized decision. They have produced a claimed decision.

Authority is the constitutional prerequisite. The decision process, governance compliance, and constitutional legitimacy are the constitutional completion.

---

## 21. Constitutional Invariants

The following invariants are normative. A conformant Decision Framework must preserve all of them. Violation of any invariant is a constitutional defect.

### 21.1 Decision Legitimacy Invariants

**INV-DL-001:** A recognized decision must be produced by an identified principal.
**INV-DL-002:** A recognized decision must be produced under recognized authority.
**INV-DL-003:** A recognized decision must trace to its authority record.
**INV-DL-004:** A recognized decision must trace to its governance compliance record.
**INV-DL-005:** A recognized decision must trace to its evidentiary basis.
**INV-DL-006:** A recognized decision must trace to the applicable policy version.
**INV-DL-007:** A recognized decision must be recorded in the Decision Registry.
**INV-DL-008:** A recognized decision must define its subject.
**INV-DL-009:** A recognized decision must define its scope.
**INV-DL-010:** A recognized decision must define its outcome.
**INV-DL-011:** A recognized decision must record its temporal context.
**INV-DL-012:** A recognized decision must record its governance body with jurisdiction.
**INV-DL-013:** A recognized decision must record all required preconditions and their satisfaction status.
**INV-DL-014:** A recognized decision must record its consequences.
**INV-DL-015:** A recognized decision must be explainable from its recorded attributes.

### 21.2 Decision Authority Invariants

**INV-DA-001:** No decision may be recognized without verified, current, in-scope authority.
**INV-DA-002:** No decision may be recognized under revoked authority.
**INV-DA-003:** No decision may be recognized under suspended authority unless suspension has been lifted.
**INV-DA-004:** No decision may claim authority scope broader than the recognized authority record supports.
**INV-DA-005:** Authority exercised outside its recognized scope does not produce a recognized decision.
**INV-DA-006:** Delegated authority must trace to an original recognized authority.
**INV-DA-007:** A delegation chain must be continuous and traceable at every link.
**INV-DA-008:** No decision may be recognized under fabricated authority.
**INV-DA-009:** Authority recognized in one domain does not support decisions in another domain.
**INV-DA-010:** Authority recognized in one jurisdiction does not support decisions in another jurisdiction unless explicitly extended.
**INV-DA-011:** Authority expiration before decision exercise voids the decision.
**INV-DA-012:** No collective decision may be recognized without verifying collective authority.

### 21.3 Decision Scope Invariants

**INV-DS-001:** Every recognized decision must define its temporal scope.
**INV-DS-002:** Every recognized decision must define its subject scope.
**INV-DS-003:** Every recognized decision must define its domain scope.
**INV-DS-004:** A decision's consequences must not exceed its defined scope.
**INV-DS-005:** A decision's scope cannot exceed the authority scope.
**INV-DS-006:** A decision's scope cannot be expanded after recognition without a new decision.
**INV-DS-007:** A decision expired in temporal scope does not produce current consequences.
**INV-DS-008:** A decision's scope cannot be implied; it must be explicit.
**INV-DS-009:** Cross-jurisdictional scope requires authority recognized in each jurisdiction.
**INV-DS-010:** Organizational scope cannot exceed the organizational authority of the Decision Maker.

### 21.4 Decision Auditability Invariants

**INV-DAU-001:** Every recognized decision must be auditable by an authorized auditor.
**INV-DAU-002:** Audit access cannot be denied to authorized audit actors.
**INV-DAU-003:** The Decision Registry must be accessible for audit at any time.
**INV-DAU-004:** Audit records must be preserved permanently.
**INV-DAU-005:** Every decision's history must be reconstructable from preserved records.
**INV-DAU-006:** No decision record may be deleted, overwritten, or redacted without a recognized governance order that is itself an auditable decision.
**INV-DAU-007:** An auditor must be independent of the Decision Maker whose decision is being audited.
**INV-DAU-008:** Audit findings must be recorded in the decision history.
**INV-DAU-009:** Audit access must itself be logged.
**INV-DAU-010:** Reconstruction must be deterministic: the same decision identifier and timestamp must always produce the same reconstructed state.

### 21.5 Decision Challenge Invariants

**INV-DC-001:** Every recognized decision must be challengeable.
**INV-DC-002:** No decision type may be designated as immune from challenge.
**INV-DC-003:** No level of authority produces unchallengeable decisions.
**INV-DC-004:** Every challenge must be reviewed by an actor independent of the Decision Maker.
**INV-DC-005:** A Decision Maker may not review a challenge to their own decision.
**INV-DC-006:** Challenge grounds must be evaluated on their merits, not suppressed.
**INV-DC-007:** A sustained challenge must produce a recorded resolution.
**INV-DC-008:** A rejected challenge must produce a recorded justification.
**INV-DC-009:** Challenge records must be preserved permanently.
**INV-DC-010:** Constitutional challenge grounds (fraud, fabrication) have no filing period limit.
**INV-DC-011:** Every party with recognized standing to challenge must have access to challenge processes.
**INV-DC-012:** Challenge suppression is an Anti-Capture violation.

### 21.6 Decision Governance Invariants

**INV-DG-001:** Every recognized decision must comply with the applicable governance framework.
**INV-DG-002:** No authority may unilaterally waive governance requirements for their own decisions.
**INV-DG-003:** Governance requirements may not be retroactively waived.
**INV-DG-004:** Collective decisions require collective authority, not just individual authorization.
**INV-DG-005:** Governance bodies may not approve decisions in which they have an undisclosed conflict of interest.
**INV-DG-006:** Governance decisions are themselves decisions subject to all Decision Framework requirements.
**INV-DG-007:** Governance may not self-exempt from Decision Framework requirements.
**INV-DG-008:** Governance rules must be produced through recognized governance decisions.
**INV-DG-009:** A governance body cannot simultaneously create governance rules and exempt itself from them.
**INV-DG-010:** No governance body may hold a monopoly on all decision governance functions.

### 21.7 Decision Reconstruction Invariants

**INV-DR-001:** Every recognized decision must be reconstructable at any historical moment.
**INV-DR-002:** Reconstruction must be deterministic.
**INV-DR-003:** All inputs to a decision must be preserved for reconstruction.
**INV-DR-004:** All state transitions must be recorded with sufficient information for reconstruction.
**INV-DR-005:** Reconstruction must not require access to systems outside the Decision Registry and referenced records.
**INV-DR-006:** Reconstruction must produce the same result regardless of who performs it.
**INV-DR-007:** A Decision Framework that does not support reconstruction fails a constitutional requirement.
**INV-DR-008:** Reconstruction records must be preserved permanently.

### 21.8 Decision Anti-Capture Invariants

**INV-DAC-001:** No single actor may hold all of: creation, validation, execution, oversight, challenge, and audit powers for any decision domain.
**INV-DAC-002:** Validation must be performed by an actor independent of the Decision Maker.
**INV-DAC-003:** Audit must be performed by an actor independent of the Decision Maker and Validation Service.
**INV-DAC-004:** Challenge review must be performed by an actor independent of the Decision Maker.
**INV-DAC-005:** No single actor may hold a monopoly on decision production in any domain.
**INV-DAC-006:** No single actor may hold a monopoly on decision validation.
**INV-DAC-007:** No single actor may hold a monopoly on decision execution.
**INV-DAC-008:** No single actor may hold a monopoly on governance decisions.
**INV-DAC-009:** No single actor may hold a monopoly on audit.
**INV-DAC-010:** Challenge suppression by any actor in any role is a constitutional violation.
**INV-DAC-011:** Historical manipulation of decision records is a constitutional violation.
**INV-DAC-012:** Rule capture — where governance rules are systematically altered to favor a single actor — is a constitutional violation detectable through audit.
**INV-DAC-013:** Evidence monopoly — where a single actor controls all evidence relevant to a decision domain — triggers mandatory independent evidence review requirements.

---

## 22. Anti-Capture Requirements

### 22.1 What Capture Means

Capture occurs when a single actor, coalition, or faction obtains effective control over a decision system such that decisions are no longer produced under constitutional legitimacy — they are produced under captured authority, reviewed by captured validators, executed by captured execution actors, and audited (if at all) by captured auditors.

Captured systems may produce outputs that resemble decisions. They do not produce recognized decisions. Their outputs must be treated as claimed decisions and challenged.

### 22.2 Forms of Capture and Counter-Mechanisms

**Decision Monopoly:** One actor produces all decisions in a domain.
- *Counter:* Distributed authority recognition. Governance limits on individual authority concentration. Mandatory quorum for high-stakes decisions.

**Validation Monopoly:** One actor validates all decisions.
- *Counter:* Validation function must be operationally independent. Multiple validators required for high-stakes decisions. Audit of validator independence.

**Execution Monopoly:** One actor executes all decisions.
- *Counter:* Execution authority must be separate from decision-making authority. Execution records must be independently auditable.

**Governance Monopoly:** One actor controls all governance rule-making.
- *Counter:* Governance rules must be produced through collective governance decisions. Constitutional supremacy prevents governance self-exemption.

**Audit Monopoly:** One actor audits all decisions.
- *Counter:* Audit actor must be independent. Multiple audit actors may have jurisdiction. External audit must be possible.

**Evidence Monopoly:** One actor controls all evidence relevant to a decision domain.
- *Counter:* Evidence independence requirements. RFC-004 defines evidence integrity guarantees. Independent evidence verification is mandatory where evidence monopoly risk is detected.

**Authority Monopoly:** One actor holds all recognized authority in a domain.
- *Counter:* Authority distribution requirements. Delegation must not concentrate authority. Governance limits on single-actor authority scope.

**Challenge Suppression:** Challenges are systematically blocked, delayed, or dismissed without substantive review.
- *Counter:* Challenge filing is a constitutional right. Suppression is an auditable violation. Escalation to higher governance is always available.

**Historical Manipulation:** Decision records are altered to retroactively legitimate or delegitimate decisions.
- *Counter:* Decision Registry is append-only. All records are integrity-protected. Historical manipulation is an invariant violation and auditable offense.

**Rule Capture:** Governance rules are systematically modified to advantage a specific actor or coalition.
- *Counter:* Governance rules are themselves decisions subject to all Decision Framework requirements. Constitutional invariants cannot be altered by governance rules. External audit of governance rule changes is mandatory.

### 22.3 Anti-Capture Detection

The Decision Audit Algorithm must include anti-capture detection checks:
- Concentration analysis: is one actor producing a disproportionate share of decisions in a domain?
- Validation independence check: are validators demonstrably independent of Decision Makers?
- Challenge rate analysis: is the challenge rate anomalously low, suggesting suppression?
- Rule change analysis: are governance rule changes systematically favoring specific actors?
- Evidence sourcing analysis: is evidence in a domain disproportionately sourced from a single actor?

---

## 23. Auditability Requirements

### 23.1 What Must Be Recorded

Every recognized decision must generate records for:
- Decision Record (all mandatory fields).
- Lifecycle transition events (all transitions with timestamps, triggers, and actor attribution).
- Precondition evaluation results (each precondition, its requirement, and its satisfaction status).
- Validation findings (each validation step, its result, and the validator's identity).
- Governance compliance records (approvals, quorums, review completions).
- Challenge records (all challenges, their grounds, their reviewers, and their outcomes).
- Revocation records (grounds, authority, consequences unwound).
- Supersession records (superseding decision reference, timestamp).
- Execution records (execution actor, execution timestamp, consequences realized).
- Audit access records (auditor identity, access timestamp, scope of access).

### 23.2 What Must Be Preserved

Preservation requirements:
- Decision Records: permanently, in their original and all amended versions.
- Decision History: permanently, all events in order.
- Evidence records referenced by decisions: preserved for the lifetime of the decision plus an audit period defined by policy.
- Authority records referenced by decisions: preserved for the lifetime of the decision plus an audit period.
- Governance records referenced by decisions: preserved for the lifetime of the decision plus an audit period.
- Challenge records: permanently.
- Audit records: permanently.

Preservation is not contingent on the decision's lifecycle state. Revoked, superseded, and invalid decisions require identical preservation to active decisions.

### 23.3 What Must Be Reconstructable

- The complete state of any decision at any historical moment.
- The authority chain supporting any decision at any historical moment.
- The governance compliance state of any decision at any historical moment.
- The challenge history of any decision at any historical moment.
- The consequence state of any decision at any historical moment.

### 23.4 What Must Be Explainable

- Why each decision was produced.
- Why each decision was validated or rejected.
- Why each challenge was sustained or rejected.
- Why each revocation was ordered.
- Why each supersession occurred.

### 23.5 What Must Be Audited

- Every decision, on a sampling basis, by the Audit Service.
- All high-stakes decisions, exhaustively.
- All challenged decisions, as part of the challenge process.
- All revoked decisions, as part of the revocation record.
- All decisions produced by actors subject to governance review.

### 23.6 What Must Be Verified

- That validation was performed by an independent actor.
- That challenge review was performed by an independent actor.
- That audit was performed by an independent actor.
- That the Decision Registry is append-only and has not been tampered with.
- That all referenced records are resolvable.

### 23.7 What Must Be Maintained Historically

The Decision Registry must maintain a complete, ordered, immutable history of all decisions and all events associated with them, such that any auditor, governance body, or challenge reviewer can answer any question about the decision's history from the registry alone.

---

## 24. Runtime Contracts

The following contracts define the required behavior of protocol services that implement the Decision Framework. These are contracts — not implementations. No schema, API, database, or code is defined here.

### 24.1 Decision Engine Contract

The Decision Engine is responsible for producing decision proposals and managing the decision creation process.

**Pre-conditions:**
- Decision Maker is identified and holds recognized authority for the decision type and scope.
- Required inputs are provided.

**Post-conditions:**
- A Decision Record in Proposed state is written to the Decision Registry.
- The Decision Validation Service is notified.

**Invariants maintained:**
- No decision is produced without a recognized Decision Maker.
- No decision is produced with undefined type, scope, or subject.
- No decision is produced with self-validation (Decision Engine does not perform validation).

### 24.2 Decision Registry Contract

The Decision Registry is the canonical, append-only store of all decision records.

**Pre-conditions:**
- A valid Decision Record is submitted by an authorized writer (Validation Service or lifecycle event processor).

**Post-conditions:**
- The Decision Record is written immutably.
- All subsequent lifecycle events are appended, not overwritten.

**Invariants maintained:**
- No record is deleted.
- No record is overwritten.
- All records are retrievable by decision identifier.
- All records are retrievable by subject, type, scope, state, and time.
- Integrity protection prevents unauthorized modification.

### 24.3 Decision Validation Service Contract

The Decision Validation Service is the independent service that evaluates decision proposals against all recognition requirements.

**Pre-conditions:**
- A Decision Record in Pending Validation state is submitted.
- The Validation Service is operationally independent of the Decision Maker.

**Post-conditions:**
- The Decision Record transitions to Validated (all requirements met) or remains in Pending Validation (remediable deficiencies) or transitions to Invalid (irremediable deficiencies).
- All validation findings are recorded.

**Invariants maintained:**
- The Validation Service never validates a decision produced by itself.
- The Validation Service never skips a validation step.
- All validation findings are recorded regardless of outcome.

### 24.4 Decision Governance Service Contract

The Decision Governance Service manages governance compliance: collecting approvals, verifying quorums, and recording governance compliance records.

**Pre-conditions:**
- A decision in Pending Validation state requires governance input.
- Applicable governance body is identified.

**Post-conditions:**
- Governance compliance record is produced (approved or declined).
- The compliance record is referenced in the Decision Record.

**Invariants maintained:**
- No governance approval is recorded without the governance body's participation.
- Quorum requirements are verified before recording collective approval.
- Conflict-of-interest disclosures are recorded.

### 24.5 Decision Challenge Service Contract

The Decision Challenge Service manages the lifecycle of challenges against recognized decisions.

**Pre-conditions:**
- Challenge is submitted by an identified party with standing to challenge.
- Challenge grounds are specified.

**Post-conditions:**
- Challenge Record is created.
- Challenge is assigned to an independent reviewer.
- Challenge outcome is recorded.

**Invariants maintained:**
- Challenge reviewer is independent of the Decision Maker.
- No challenge is silently suppressed.
- All challenges, including rejected and withdrawn challenges, are recorded.

### 24.6 Decision Reconstruction Service Contract

The Decision Reconstruction Service provides deterministic reconstruction of decision state at any historical moment.

**Pre-conditions:**
- Decision identifier and target timestamp are provided.
- Caller holds authorized access.

**Post-conditions:**
- Reconstructed decision state is returned.
- Reconstruction is deterministic: same inputs always produce same output.

**Invariants maintained:**
- Reconstruction never produces state that was not derivable from preserved records.
- Reconstruction access is logged.
- Reconstruction cannot alter the Decision Registry.

### 24.7 Decision Audit Service Contract

The Decision Audit Service performs independent audit of decision records.

**Pre-conditions:**
- Auditor holds recognized audit standing.
- Decision identifier and audit scope are provided.

**Post-conditions:**
- Audit findings are produced: conformant, deficient, or non-conformant.
- Audit record is appended to Decision History.

**Invariants maintained:**
- Auditor is independent of the Decision Maker.
- Auditor is independent of the Validation Service for the audited decision.
- Audit findings are preserved permanently.
- Non-conformant findings trigger governance notification.

### 24.8 Decision History Service Contract

The Decision History Service provides ordered, complete access to all events in a decision's history.

**Pre-conditions:**
- Decision identifier is provided.
- Caller holds authorized access.

**Post-conditions:**
- Complete ordered history is returned.

**Invariants maintained:**
- History is returned in chronological order.
- No event is omitted.
- History is read-only: this service does not write to the Decision Registry.

---

## 25. Relationship With Authority

### 25.1 Why Authority Is Necessary

Authority is the constitutional prerequisite for any recognized decision. Without recognized authority:

- The Decision Maker has no constitutional basis for producing protocol-recognized outcomes.
- The decision has no governance anchor — there is no recognized framework from which the decision derives its legitimacy.
- The decision cannot be traced to a constitutional source.
- The decision cannot be recognized by downstream processes without accepting unverified claims.

Authority is not bureaucratic overhead. It is the constitutional mechanism by which the protocol ensures that only actors with recognized, bounded, governed legitimacy produce outcomes that alter protocol reality.

```
RECOGNIZED AUTHORITY (RFC-005-H8)
         │
         │  provides constitutional legitimacy to
         ▼
DECISION PRODUCTION
         │
         │  produces, when valid process is followed,
         ▼
RECOGNIZED DECISION
```

### 25.2 Why Authority Is Never Sufficient

Authority is necessary but not sufficient. An actor with recognized authority who:
- does not follow the required decision process,
- does not obtain required governance approvals,
- does not satisfy required preconditions,
- does not operate within recognized scope,
- does not produce a traceable decision record,

...has not produced a recognized decision. They have produced a claimed decision.

Authority is the constitutional right to produce decisions. The Decision Framework is the constitutional process by which that right is exercised legitimately. Right without process produces nothing constitutionally recognized.

This is why the following are all constitutionally insufficient on their own:

| Condition | Why Insufficient |
|---|---|
| "Has recognized authority." | Authority not exercised through valid process produces no decision. |
| "Has high standing." | Standing is a precondition; it does not substitute for authority or process. |
| "Has required capabilities." | Capability enables action; it does not legitimize outcomes. |
| "Governance body approved it." | Governance approval is a precondition; it does not itself constitute the decision. |
| "Evidence supports it." | Evidence is the basis; it does not produce the decision. |

---

## 26. Relationship With Governance

### 26.1 How Decisions Modify Constitutional State

Governance operates on recognized protocol state. Recognized protocol state is the aggregate of all active recognized decisions, recognized standing states, recognized authority records, and recognized credentials.

When a decision is recognized:
- It adds a new protocol fact to the constitutional state.
- Governance must update its model of protocol reality to account for the new fact.
- Downstream actors relying on governance's model of reality must also update.

Governance does not create protocol facts directly. Governance creates the framework — the rules, bodies, processes — within which decisions are produced. Decisions create protocol facts. Governance consumes them.

### 26.2 How Governance Consumes Recognized Decisions

Governance consumes recognized decisions in several ways:

**Compliance enforcement:** Governance monitors whether actors comply with the consequences of recognized decisions (e.g., whether a capability grant has been executed, whether a revocation has been honored).

**Policy evolution:** Recognized governance decisions alter the applicable policy, which affects how future decisions are produced.

**Standing updates:** Recognized decisions that affect standing (recognize or invalidate standing) update the standing model that governance uses to evaluate actor eligibility.

**Authority updates:** Recognized delegation decisions update the authority model that governance uses to evaluate decision legitimacy.

### 26.3 How Governance Rejects Invalid Decisions

Governance must reject claimed decisions — outcomes that are asserted as decisions but do not meet recognition requirements:

- Governance must not enforce consequences of claimed decisions.
- Governance must not treat claimed decisions as establishing protocol facts.
- Governance must not use claimed decisions as the basis for further governance actions.
- Governance must flag claimed decisions for investigation and potential challenge.

The boundary between a recognized decision and a claimed decision is constitutionally fundamental. Governance that blurs this boundary loses constitutional integrity.

### 26.4 The Decision-Governance Feedback Loop

```
GOVERNANCE defines rules
      ↓
AUTHORITY is recognized under those rules (RFC-005-H8)
      ↓
DECISIONS are produced under recognized authority
      ↓
GOVERNANCE consumes recognized decisions
      ↓
GOVERNANCE state evolves
      ↓
GOVERNANCE rules may be updated via governance decisions
      ↓
[loop]
```

This feedback loop is the constitutional engine of the protocol. Every iteration requires recognized decisions. No iteration is possible without the Decision Framework.

---

## 27. Constitutional Compliance Matrix

The following matrix maps every constitutional principle to the specific Decision Framework mechanism that enforces it.

| Constitutional Principle | Decision Framework Mechanism | Primary Invariants |
|---|---|---|
| **Supremacy** | Recognition requirements are protocol-enforced; no authority can self-authorize. Constitutional invariants cannot be overridden by governance rules. | INV-DL-001 through INV-DL-015 |
| **Legitimacy** | Decision Maker must hold recognized authority (RFC-005-H8). Validation is independent. Recognition requires verified authority, process, governance, and traceability. | INV-DA-001 through INV-DA-012 |
| **Consent** | Decision scope, governance basis, and applicable policy are recorded and auditable. Challenge rights are guaranteed. Challenge process is accessible to affected parties. | INV-DC-001 through INV-DC-012 |
| **Delegation** | Delegation decisions are a canonical decision type. Delegation chains are traced and bounded. Delegated authority cannot exceed original authority. | INV-DA-006, INV-DA-007 |
| **Limitation** | Decision scope is mandatory. Scope cannot exceed authority scope. Constraints are absolute and governance-configurable within constitutional limits. | INV-DS-001 through INV-DS-010, CONSTRAINT-001 through CONSTRAINT-015 |
| **Revocability** | Revocation is a canonical lifecycle state. Revocation authority and process are defined. Revocation is documented and preserved. | INV-DL (Revoked state), §15 |
| **Supervisión** | Decision Review is a defined lifecycle stage. Governance bodies hold review authority. Decision Registry is accessible to supervisory parties. Audit is mandatory. | INV-DAU-001 through INV-DAU-010 |
| **Accountability** | Every decision records its author. No anonymous decisions. Accountability chain is defined across creation, validation, execution, oversight, challenge, and audit. | INV-DL-001, §18 |
| **Transparency** | Mandatory traceability fields are defined. Explainability requirements are canonical. Decision Registry is accessible. | INV-DL-015, §13 |
| **Impugnación** | Challenge is a constitutional right. All recognized decisions are challengeable. Challenge grounds are defined. Challenge suppression is a violation. | INV-DC-001 through INV-DC-012, §14 |
| **Continuity** | Decision Registry is append-only. Historical records are preserved. Reconstruction is mandatory and deterministic. | INV-DR-001 through INV-DR-008, §17 |
| **Anti-Capture** | Separation of powers is mandatory. Role monopolies are prohibited. Anti-capture detection is a mandatory audit function. | INV-DAC-001 through INV-DAC-013, §22 |

---

## 28. Open Questions

The following questions are identified as requiring future resolution. They are not answered here. They are preserved so that future RFC authors and governance bodies have visibility into known open areas.

**OQ-001: Temporal Ordering Under Conflict**
When two recognized decisions with overlapping scope are produced simultaneously (within the same governance cycle), which takes precedence? The protocol requires a tie-breaking rule. None is defined here.

**OQ-002: Cross-Protocol Decision Recognition**
When the AOC Protocol interoperates with external systems that produce their own decisions, how does the AOC Protocol evaluate whether to recognize those external decisions? The constitutional criteria for external decision recognition require a future RFC.

**OQ-003: Decision Quantification Limits**
Should there be constitutional limits on the number of decisions a single authority may produce within a time period? High-volume decision production may be a form of authority abuse or governance evasion. This requires further analysis.

**OQ-004: AI Decision Maker Eligibility**
As AI agents gain recognized identity and standing, the question of whether an AI agent may hold recognized decision-making authority (not merely provide input to a human decision) will require a future constitutional analysis. The current framework treats AI output as input, not decision. This may be revisited.

**OQ-005: Emergency Decision Validity Period**
When emergency procedures are invoked and role separation is temporarily modified, what is the constitutional validity period of decisions produced under emergency conditions? Are they subject to post-emergency re-validation?

**OQ-006: Governance Body Decision Self-Reference**
Can a governance body produce a recognized decision that applies to itself? Self-referential governance decisions present a circular authority problem. The constitutional treatment of this case requires further analysis.

**OQ-007: Challenge Cascade**
If decision D2 depends on decision D1, and D1 is successfully challenged and revoked, does the challenge automatically propagate to D2? The consequence propagation rules defined in §15.6 establish the framework, but the specific cascade semantics require further specification.

**OQ-008: Minimum Viable Reconstruction Period**
What is the minimum period for which decision records must be preserved to satisfy reconstruction requirements? The current RFC requires permanent preservation, but this may be infeasible in some operational contexts. A future RFC may define tiered preservation policies.

**OQ-009: Governance Runtime Interface**
How does the Governance Runtime (future RFC) formally consume recognized decisions? The interface between Decision Framework and Governance Runtime is described at a conceptual level but requires formal specification.

**OQ-010: Constitutional Enforcement Mechanism**
What mechanism enforces the constitutional invariants defined in §21? The constitutional invariants are normative, but the enforcement mechanism — what happens when an invariant is violated, by whom, through what process — is deferred to the Constitutional Enforcement layer (future RFC).

**OQ-011: Multi-Jurisdiction Conflict Resolution**
When a recognized decision is valid in one jurisdiction but violates the governance rules of another jurisdiction in which it claims to apply, how is the conflict resolved? The jurisdictional scope model (§10.2) defines the problem but not the resolution.

**OQ-012: Decision Inheritance**
When an organizational unit inherits authority from a parent unit, do recognized decisions produced by the parent unit apply automatically to the child unit? The scope model suggests no, but the inheritance semantics require formal specification.

---

## Conclusion

RFC-005-H9 establishes the Decision Framework as the constitutional bridge between Authority and Governance in the AOC Protocol. It defines, with constitutional precision, what a decision is and what it is not, how it is born, validated, recognized, executed, challenged, revoked, superseded, reconstructed, audited, and preserved.

The central constitutional claim of this RFC:

> **Only a protocol-recognized outcome produced under recognized authority, within recognized scope, through a valid decision process, under recognized governance, with traceable basis, with capacity for challenge, with capacity for audit, and with capacity for reconstruction is a recognized decision. Everything else is a claimed decision.**

The constitutional chain now extends:

```
Identity (RFC-001)
  ↓
Evidence (RFC-004)
  ↓
Claims (RFC-005)
  ↓
Standing (RFC-005-H2)
  ↓
Authority (RFC-005-H8)
  ↓
Decision (RFC-005-H9)       ← This RFC
  ↓
Governance Runtime          [future]
  ↓
Constitutional Enforcement  [future]
```

The foundation is laid for the Governance Runtime to consume recognized decisions and for the Constitutional Enforcement layer to verify that the invariants defined herein are preserved across all protocol operations.

No decision without authority.
No authority without governance.
No governance without accountability.
No accountability without traceability.
No traceability without reconstruction.
No reconstruction without preservation.
No legitimacy without challenge.
No challenge without independence.
No independence without separation.
No separation without constitutional supremacy.

This is the Decision Framework.
