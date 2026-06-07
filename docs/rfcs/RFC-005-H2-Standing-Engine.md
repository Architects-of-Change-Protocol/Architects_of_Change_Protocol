# RFC-005-H2 — Standing Engine

| Field | Value |
|---|---|
| RFC Number | 005-H2 |
| Title | Standing Engine |
| Status | Draft |
| Category | Core Protocol / Constitutional Specification |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-07 |
| Supersedes | RFC-005-H2 (Standing Engine, 2026-06-03 initial draft) |
| Related | AOC Charter, RFC-001 Identity Layer, RFC-004 Evidence Layer v1.0, RFC-005 AOC Claims Framework, RFC-005-H1 Standing Traceability, RFC-005-H3 Standing Governance, RFC-005-H4 Capability Mapping, RFC-005-H5 Delegated Standing, RFC-005-H6 Standing Algorithms, RFC-005-H7 Capability Engine, RFC-005-H8 Authority Model |

---

## Abstract

This document defines the **Standing Engine** as the constitutional core of the Standing Layer within the AOC Protocol. The Standing Engine is the deterministic evaluation system that transforms a collection of verified Claims, supported by Evidence and recognized by Governance, into a Standing state that is reproducible, explainable, contestable, and auditable.

Standing is the constitutional bridge between the Claims Layer and the Capability Layer. Without Standing, Claims remain uninterpreted assertions. Without Standing, Capability would have no principled evidentiary basis. Standing is the layer at which the protocol asks: *given everything we can verify about this subject, what is the current recognized state of that subject for this purpose, under this policy, at this moment?*

**Standing is not Identity.** RFC-001 answers who or what is referenced. Standing answers what that subject's recognized protocol state is for a specific purpose.

**Standing is not Authority.** RFC-005-H8 defines how Authority is constituted. Standing is a necessary but never sufficient precondition for Authority derivation.

**Standing is not Capability.** RFC-005-H7 defines how Capabilities are bounded and granted. Standing informs but never constitutes a Capability grant.

**Standing is not a score.** Standing is a deterministic, constitutionally governed protocol state, not an opaque numeric reputation.

**Standing is not permanent.** Every Standing state carries temporal bounds, decay behavior, challenge susceptibility, and revocability.

This RFC derives its legitimacy from the AOC Charter and is subordinate to it. No interpretation of this RFC may expand powers, eliminate limits, or reduce rights recognized by the Charter. This RFC makes operational, in the domain of recognition, the constitutional principles of determinism, explainability, contestability, accountability, anti-capture, and reversibility that the Charter demands.

---

## Table of Contents

1. [Scope and Normative Language](#1-scope-and-normative-language)
2. [Constitutional Alignment](#2-constitutional-alignment)
3. [Standing Principles](#3-standing-principles)
4. [Canonical Standing Model](#4-canonical-standing-model)
5. [Standing States](#5-standing-states)
6. [Standing Lifecycle](#6-standing-lifecycle)
7. [Standing Inputs](#7-standing-inputs)
8. [Standing Evaluation Model](#8-standing-evaluation-model)
9. [Standing Algorithms](#9-standing-algorithms)
10. [Standing Governance](#10-standing-governance)
11. [Standing Traceability](#11-standing-traceability)
12. [Standing Explainability](#12-standing-explainability)
13. [Standing Challenges](#13-standing-challenges)
14. [Standing Delegation](#14-standing-delegation)
15. [Standing Recovery](#15-standing-recovery)
16. [Standing Reconstruction](#16-standing-reconstruction)
17. [Constitutional Invariants](#17-constitutional-invariants)
18. [Anti-Capture Requirements](#18-anti-capture-requirements)
19. [Auditability Requirements](#19-auditability-requirements)
20. [Runtime Contracts](#20-runtime-contracts)
21. [Relationship with RFC-001 Identity Layer](#21-relationship-with-rfc-001-identity-layer)
22. [Relationship with Authority](#22-relationship-with-authority)
23. [Constitutional Compliance Matrix](#23-constitutional-compliance-matrix)
24. [Standing Taxonomy](#24-standing-taxonomy)
25. [Standing Decay](#25-standing-decay)
26. [Standing Simulation](#26-standing-simulation)
27. [Security Implications](#27-security-implications)
28. [Future RFC Dependencies](#28-future-rfc-dependencies)
29. [Open Questions](#29-open-questions)
30. [Conformance](#30-conformance)
31. [Glossary](#31-glossary)

---

## 1. Scope and Normative Language

### 1.1 Scope

This RFC governs exclusively the constitutional semantics of Standing in AOC. It defines:

- what Standing is and what it is not;
- the canonical model through which Standing is constituted;
- the state machine that governs Standing transitions;
- the lifecycle from absence of Standing to active Standing and beyond;
- the inputs that may legitimately contribute to Standing evaluation;
- the evaluation model that transforms inputs into Standing states;
- the algorithms by which evaluation proceeds, at a conceptual level;
- the governance structure that authorizes and limits the Standing Engine;
- the traceability requirements that make Standing auditable;
- the explainability requirements that make Standing intelligible;
- the challenge system that makes Standing contestable;
- the delegation rules that govern how Standing may flow across principals;
- the recovery procedures for Standing that was wrongly denied or wrongly revoked;
- the reconstruction capability that makes historical Standing deterministically reproducible;
- the constitutional invariants that no implementation may violate;
- the anti-capture requirements that prevent illegitimate concentration of standing power;
- the auditability requirements that make every standing outcome verifiable;
- the abstract runtime contracts that conformant implementations must satisfy;
- the constitutional relationship between Standing and Identity, and between Standing and Authority.

This RFC does not define:

- database schemas, indexes, query languages, or persistence mechanisms;
- APIs, REST endpoints, message formats, or transport protocols;
- blockchain, distributed ledgers, wallets, or cryptographic key management;
- user interfaces, dashboards, or human-facing applications;
- specific numeric scoring algorithms or machine learning models;
- authentication, session management, or access control systems;
- product implementations, vendor integrations, or deployment architectures.

### 1.2 Normative Language

The keywords MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL in this document are to be interpreted as described in RFC 2119.

Normative requirements are stated in present tense with MUST or MUST NOT. Guidance is stated with SHOULD or SHOULD NOT. Permissive design space is stated with MAY.

### 1.3 Relationship to the AOC Charter

The AOC Charter is the supreme constitutive document of the AOC Protocol. All RFCs, including this one, derive their legitimacy from the Charter and are subordinate to it. Where this RFC is silent, the Charter governs. Where this RFC appears to conflict with the Charter, the Charter prevails and the apparent conflict MUST be resolved by constitutional interpretation, not by amendment of the Charter.

This RFC operationalizes Charter principles in the domain of recognition: how a protocol recognizes the state of a subject, under what conditions, with what limits, and subject to what oversight.

---

## 2. Constitutional Alignment

Standing is not a technical convenience. Standing is a constitutional instrument. Each structural element of the Standing Engine is designed to operationalize a specific constitutional principle derived from the AOC Charter.

| Constitutional Principle | How Standing Operationalizes It |
|---|---|
| **Supremacy** | The Standing Engine operates under the Charter and under Governance rules that themselves derive from the Charter. No standing outcome may override or circumvent Charter-recognized rights. The Charter's supremacy is enforced by requiring that no standing rule may reduce rights the Charter recognizes. |
| **Legitimacy** | Standing is legitimate only when derived from evidence that carries recognized authority, claims that have been verified through authorized processes, policies approved by recognized governance, and algorithms whose version is traceable and authorized. Illegitimate inputs produce standing that MUST be discarded, challenged, or excluded. |
| **Consent** | Where Standing depends on data about a subject, the subject's consent requirements — as recognized by the Charter and applicable jurisdiction — MUST be honored. Standing evaluation MUST NOT consume evidence obtained without appropriate consent. Consent state is an input to Standing evaluation, not an afterthought. |
| **Delegation** | Standing may in some cases be delegated, inherited, or scoped across principals. All delegation of Standing MUST be traceable, authorized, bounded, and revocable. Standing gained through delegation MUST carry the constraints of the delegation instrument that authorized it. |
| **Limitation** | Standing does not confer unlimited capability. The Standing Engine MUST enforce that standing states remain bounded by the policy context and governance rules that produced them. No standing state may be construed to authorize action beyond the scope of its context. |
| **Revocabilidad** | Every standing state is revocable. No standing is permanent, inviolable, or protected from revocation by governance authority. Standing gained through fraud, error, or changed conditions MUST be revocable without destroying the historical audit record. |
| **Supervisión** | The Standing Engine MUST be subject to ongoing supervision by authorized governance bodies, auditors, and subjects. The engine's behavior, its policy inputs, its algorithm versions, and its outputs MUST be open to inspection by recognized supervisory authorities. |
| **Accountability** | Every standing outcome must be attributable. The issuing authority, the evaluation process, the policy context, the algorithm version, the evidence basis, and the claim basis must all be identified and preserved. Accountability requires not only traceability of outcomes but traceability of decisions. |
| **Transparencia** | Standing evaluation MUST NOT be a black box. The rationale behind every standing state MUST be expressible in terms understandable to the subject, to reviewers, to auditors, and to governance bodies. Transparency is not optional; it is a constitutional requirement. |
| **Impugnación** | Every standing outcome MUST be contestable. Subjects, affected parties, auditors, and governance bodies MUST have a recognized process by which they can challenge standing, challenge the evidence behind it, challenge the claims behind it, or challenge the governance rules that produced it. A standing system without contestability is constitutionally defective. |
| **Continuidad** | The Standing Engine MUST preserve historical standing so that governance disputes, audits, legal proceedings, and accountability processes can reconstruct the standing of any subject at any historical moment. Continuity requires that history not be rewritten, only extended. |
| **Anti-Captura** | No single actor, institution, or algorithm may capture the Standing system. The Standing Engine MUST distribute governance authority, evaluation oversight, policy control, and challenge review across multiple recognized actors. Anti-capture is a design requirement, not an aspirational value. |

---

## 3. Standing Principles

The following principles are normative. No conformant implementation of the Standing Engine may violate them. Extensions, customizations, and domain adaptations MUST preserve all principles.

### 3.1 Standing is not Identity

Standing presupposes Identity. A subject must be identified before its Standing can be evaluated. However, Standing is not Identity and MUST NOT be confused with it. RFC-001 governs Identity. This RFC governs Standing. A subject's Identity may be stable while its Standing changes, expires, or is revoked. A subject's Identity may change — through recovery, compromise remediation, or succession — while its historical Standing record remains intact and attributable.

The distinction is constitutional: Identity answers *who or what is this subject?* Standing answers *what is the recognized protocol state of this subject for this purpose at this moment?* These are different questions with different governance regimes.

### 3.2 Standing is not Authority

Standing is a necessary but never sufficient precondition for Authority derivation. A subject may have full Active Standing and still lack the Authority to take a specific action, because Authority requires capability grants, governance mandates, scope constraints, and decision records that go beyond Standing. RFC-005-H8 governs Authority. The Standing Engine MUST NOT issue standing outputs that are labeled, interpreted, or consumed as Authority grants.

### 3.3 Standing is not Capability

Standing informs Capability but does not constitute it. A Capability is a bounded, authorized permission to take a specific class of action. Standing is the protocol recognition that a subject satisfies certain evidential and policy thresholds. A standing state may support a capability decision, but the capability engine — governed by RFC-005-H7 — makes the capability determination. The Standing Engine MUST NOT emit outputs that function as capability tokens, access grants, or permission records.

### 3.4 Standing is evidence-derived

Every standing state MUST be traceable to evidence. A standing state unsupported by evidence is not standing; it is an administrative label. Evidence in this context means records, observations, attestations, verifications, and proofs governed by RFC-004. If no qualifying evidence exists, the standing MUST reflect that absence rather than asserting a state without foundation.

### 3.5 Standing is claim-mediated

Claims governed by RFC-005 are the formal statements that interpret evidence into assertions about a subject. Standing MUST be derived from evaluated Claims, not directly from raw evidence. This is the constitutional function of the Claims Layer: to interpose a formal, verifiable, contestable assertion between raw evidence and standing recognition.

### 3.6 Standing is contextual

The same evidence and the same claims may produce different standing in different contexts. Context includes the domain of evaluation, the purpose of the standing determination, the applicable policy, the risk tier, the jurisdictional frame, and the temporal horizon. A conformant Standing Engine MUST compute standing under an explicit, mandatory StandingContext. Context-free standing is constitutionally incoherent.

### 3.7 Standing is policy-governed

Standing MUST be computed under an explicit, versioned PolicyContext. Policy defines the eligibility rules, the thresholds, the authority requirements, the decay behaviors, the challenge handling procedures, and the output semantics. Policy-free standing is arbitrary interpretation and MUST NOT be emitted as a conformant standing record.

### 3.8 Standing is deterministic

For identical inputs — evidence set, claim set, standing context, policy context, and algorithm version — a conformant Standing Engine MUST produce identical standing outputs. Determinism is the constitutional guarantee that makes standing auditable, reconstructable, and contestable. Non-deterministic standing is constitutionally unacceptable because it cannot be explained, reproduced, or challenged consistently.

### 3.9 Standing is revocable

No standing state is permanent. Every standing state is subject to revocation by authorized governance action, triggered by disqualifying evidence, claim invalidation, policy change, or challenge resolution. Revocation MUST be recorded and explained. Revocation MUST NOT destroy the historical record; it MUST extend it. The history of a subject's standing — including periods of revocation — is part of the standing record and MUST be preserved.

### 3.10 Standing is explainable

Every standing output MUST be accompanied by an explanation that answers why the standing state was produced, what evidence and claims contributed, what policy and algorithm were applied, what authority recognized the result, what challenges were considered, and what temporal and decay effects applied. An unexplained standing output is not conformant.

### 3.11 Standing is contestable

Every standing state is subject to challenge by the subject of the standing, by affected parties, by authorized auditors, by governance bodies, and by anyone with recognized standing to contest. The challenge system MUST be accessible, governed, traceable, and capable of producing binding outcomes that affect standing states. A standing system without a challenge pathway is constitutionally closed and therefore illegitimate.

### 3.12 Standing is reconstructable

For any historical timestamp within the preservation window, a conformant implementation MUST be able to reconstruct the standing of any subject deterministically. Reconstruction means: given the evidence, claims, policies, algorithms, and governance events that were canonical at that moment, produce the same standing output that would have been produced then. Reconstruction supports audit, legal proceedings, governance disputes, and historical accountability.

### 3.13 Standing is temporal

Standing exists in time. Every standing state carries a valid-from timestamp, an expiration timestamp or condition, a decay schedule, and a history of transitions. Standing at time T1 may differ from standing at time T2 for the same subject under the same context, because evidence ages, claims expire, policies change, and challenges are resolved. The temporal dimension of standing is not optional; it is constitutive.

### 3.14 Standing is governed

The rules that produce standing are not self-authorizing. They derive from governance processes that are themselves constitutionally constrained. Governance defines which policies are valid, which algorithms are authorized, which authorities are recognized, and which challenge resolutions are binding. The Standing Engine executes governance-approved rules; it does not make governance decisions. The distinction between rule execution and rule-making is constitutional.

### 3.15 Standing is auditable

Every aspect of standing computation — inputs, process, outputs, decisions, exclusions, inclusions, decay effects, challenge effects, and governance events — MUST be preserved in a form that supports independent audit. Auditability is not satisfied by logging alone; it requires that logs be sufficient to reconstruct the computation, explain the outcome, and evaluate whether governance rules were followed correctly.

### 3.16 Standing is not permanent

No standing state confers permanent recognition. Even the strongest standing states carry temporal bounds and are subject to decay, expiration, policy review, and revocation. The principle that standing is not permanent prevents the creation of privileged classes of subjects who are exempt from ongoing accountability. Permanence would be anti-constitutional.

### 3.17 Standing is portable within protocol bounds

A standing record MUST be portable to the extent that any authorized evaluator, governance body, or audit process can receive, interpret, and verify it using the same constitutional rules. Portability does not mean universality; it means that standing records carry enough context, authority attribution, and explanation to be evaluated by any conformant system.

### 3.18 Standing is bounded by its own basis

Standing cannot exceed the evidentiary and policy basis on which it rests. A standing outcome MUST NOT be construed to recognize more than the evidence, claims, policies, and governance processes that produced it actually support. This principle prevents standing inflation — the informal extension of recognized standing beyond its constitutional warrant.

---

## 4. Canonical Standing Model

The Canonical Standing Model defines the protocol objects that constitute, mediate, and represent Standing. These are constitutional constructs, not implementation artifacts.

### 4.1 Standing Record

The Standing Record is the canonical, immutable representation of a standing determination at a specific moment. It is the authoritative output of the Standing Engine for a given subject, context, policy, and algorithm version.

A Standing Record MUST include:

- a unique, stable identifier for this standing determination;
- the Standing Subject to which the record applies;
- the Standing Basis on which the determination rests;
- the Standing Context under which evaluation occurred;
- the Standing Evaluation that produced the outcome;
- the Standing Outcome — the state and confidence produced;
- a reference to the prior Standing Record in the chain, or a genesis marker;
- the timestamp at which evaluation occurred;
- the valid-from and valid-until (or decay schedule) that bounds the record's operational relevance;
- the governance authority that authorized the evaluation;
- the algorithm version applied;
- the policy version applied;
- the explanation tree sufficient for RFC-005-H1 traceability;
- a challenge state indicator;
- a reconstruction index sufficient for deterministic replay.

A Standing Record is immutable once issued. Changes in standing produce new Standing Records that supersede, suspend, revoke, or extend prior records; they do not overwrite them.

### 4.2 Standing Subject

The Standing Subject is the protocol-recognized principal whose standing is being evaluated. A Standing Subject must be referentially stable — capable of being identified consistently across time, context, and governance events.

A Standing Subject MUST be associated with an identity reference governed by RFC-001. The identity reference and the standing record MUST be linked through a traceable, auditable relationship. The identity reference MUST NOT be confused with the standing record itself; a principal's identity persists even when its standing is revoked.

Standing Subject types include:

| Subject Type | Description |
|---|---|
| Natural Person | A human individual recognized by the protocol. |
| Legal Entity | An organization, corporation, association, or other legally constituted body. |
| Vendor | A commercial or service entity operating under procurement or contractual governance. |
| Project | A bounded, intentional effort with defined deliverables, governance, and lifecycle. |
| Team | A constituted group acting collectively under shared governance. |
| AI Agent | An autonomous or semi-autonomous software system operating under delegated principal relationships. |
| Credential Object | A formal credential or certificate that itself may carry standing as an object of trust. |
| Policy Object | A governance rule or policy instrument that may carry standing as a recognized authority source. |

### 4.3 Standing Basis

The Standing Basis is the constitutional foundation on which a standing determination rests. It is the structured representation of all inputs that contributed to the standing outcome, all inputs that were considered and excluded, and the reasons for each inclusion or exclusion.

The Standing Basis MUST identify:

- the set of Claims considered (with standing state for each claim);
- the set of Evidence items considered (with lifecycle state for each item);
- the set of Attestations considered (with authority context for each);
- the set of Verifications considered (with verifier authority for each);
- the historical Standing Records considered (with their own basis references);
- the Delegation instruments considered, if any;
- the Challenge state for each element;
- the Governance Policies applied;
- the inclusion rationale for each included element;
- the exclusion rationale for each excluded element.

The Standing Basis is the audit spine of the Standing Engine. Without it, standing cannot be explained, challenged, or reconstructed.

### 4.4 Standing Evaluation

The Standing Evaluation is the governed process by which the Standing Engine transforms the Standing Basis into a Standing Outcome. It is not a computation in isolation; it is a constitutionally authorized act of interpretation that must follow documented, versioned rules under recognized governance authority.

A Standing Evaluation MUST:

- be conducted under an explicit, versioned algorithm;
- follow an explicit, versioned policy;
- operate under a recognized governance authorization;
- produce a deterministic outcome for its inputs;
- generate an explanation tree;
- record its process in a form sufficient for audit and reconstruction.

A Standing Evaluation MUST NOT:

- modify its own inputs during evaluation;
- apply rules not present in the declared policy version;
- apply an algorithm version that was not activated for this context;
- produce different outcomes for identical inputs.

### 4.5 Standing Outcome

The Standing Outcome is the result produced by the Standing Evaluation. It is a structured record comprising the standing state, the standing confidence, and the explanation.

The Standing Outcome is the piece of the Standing Record that capability engines, governance processes, and authority derivation systems consume. It MUST be bounded by the Standing Context that produced it; it MUST NOT be transferred to a different context without explicit, authorized re-evaluation.

### 4.6 Standing History

The Standing History is the ordered, immutable chain of Standing Records for a given subject and context. It captures how standing has evolved over time: when it was first established, how it changed, when it was challenged, when challenges were resolved, when it expired, when it was revoked, and when it was superseded.

The Standing History is a constitutional record. It MUST be preserved within the defined retention window. It MUST support deterministic reconstruction of standing at any historical timestamp within that window. It MUST NOT be modified retroactively; new events extend the chain forward.

### 4.7 Standing Context

The Standing Context is the explicit, mandatory frame within which standing is evaluated. Without a Standing Context, a standing evaluation is undefined. Two standing evaluations of the same subject using the same evidence but under different contexts may produce entirely different outcomes; this is expected and correct.

A Standing Context MUST identify:

- the Standing Type (see Section 24);
- the Standing Subject;
- the evaluation purpose;
- the domain;
- the jurisdiction (where applicable);
- the organization or governance scope;
- the risk tier;
- the evaluation timestamp;
- the intended capability mapping context;
- the relevant policy family;
- the applicable authority assumptions;
- the challenge handling mode;
- the temporal horizon.

### 4.8 Standing Governance

Standing Governance is the constitutional structure that authorizes, constrains, supervises, and audits the Standing Engine and everything it produces. Standing Governance is not a feature of the engine; it is the condition under which the engine may operate legitimately.

Standing Governance defines:

- who may define and modify standing rules;
- who may approve and activate algorithms;
- who may approve and activate policies;
- who may authorize new Standing Types;
- who may review and resolve challenges;
- who may conduct standing audits;
- how governance authority is delegated and bounded;
- how governance disputes are resolved;
- how governance records are preserved.

Standing Governance MUST be open to supervisory inspection. A Standing Governance structure that is opaque, uncontested, or controlled by a single actor is constitutionally defective. RFC-005-H3 governs Standing Governance in detail.

---

## 5. Standing States

The Standing Engine operates a canonical state machine. States are not administrative labels; they are constitutional determinations with defined meanings, permitted transitions, and prohibited transitions.

### 5.1 Canonical States

| State | Constitutional Meaning |
|---|---|
| **Draft** | A standing evaluation has been initiated but not yet completed. Inputs have been assembled; the evaluation process has not produced a canonical outcome. Draft standing MUST NOT be consumed by capability engines. |
| **Pending Evaluation** | All required inputs are assembled. The Standing Evaluation is authorized and queued or in progress. The subject's standing is formally under evaluation. Prior standing (if any) remains operative during this period unless suspended. |
| **Verified** | The evaluation has produced a positive determination: the subject satisfies the evidentiary and policy thresholds for the standing type in this context. Verified standing may be consumed by capability engines within the bounds of the Standing Context. |
| **Active** | Verified standing that is within its valid period, not suspended, not challenged to a degree that affects operational use, and not expired. Active is the operational state from which capability derivation may proceed. |
| **Suspended** | Standing has been temporarily disabled. The standing record persists; capability engines MUST treat suspended standing as insufficient for decisions requiring active standing, unless policy explicitly provides otherwise. Suspension requires authorization and MUST be traceable. |
| **Expired** | The temporal or condition-based validity of the standing has elapsed. An expired standing record is preserved in history but MUST NOT be treated as currently operative. Renewal requires a new evaluation cycle. |
| **Revoked** | Standing has been definitively terminated by authorized governance action, upon disqualifying evidence, upon successful challenge resolution, or upon policy mandate. Revocation is a terminal state for that standing record. The historical record is preserved; future standing for the same subject must begin a new evaluation cycle. |
| **Superseded** | A new Standing Record has been produced for the same subject and context, typically reflecting new evidence, a new algorithm version, or a new policy version. The superseded record is preserved in history. The superseding record becomes the operative record. |
| **Invalid** | The Standing Record has been determined to be constitutionally defective: it lacked required inputs, was produced by an unauthorized algorithm, was issued without proper governance authority, or was found to rely on fraudulent evidence. Invalid records MUST be excluded from capability derivation and MUST be disclosed in audit. |
| **Archived** | Standing has passed its preservation-active period and moved into long-term historical storage. Archived standing MUST remain reconstructable within the archival retention window but is no longer operational. |

### 5.2 Permitted Transitions

```text
[No Standing]
    ↓
  Draft
    ↓
  Pending Evaluation
    ↓ (evaluation succeeds)
  Verified
    ↓ (validity period begins)
  Active
    ↓                  ↓              ↓              ↓
  Expired          Suspended        Revoked       Superseded
    ↓                  ↓
  Archived         (Review)
                       ↓              ↓
                     Active         Revoked
                                       ↓
                                   Archived
```

Additional permitted transitions:

- `Pending Evaluation` → `Invalid` (if inputs are found constitutionally defective during evaluation)
- `Verified` → `Suspended` (if a challenge or governance event is raised before the Active period begins)
- `Active` → `Challenged` (informational overlay; does not change the base state but affects capability engine consumption)
- `Suspended` → `Superseded` (if a new evaluation produces a new record during the suspension period)
- `Draft` → `[Abandoned]` (if the evaluation is withdrawn before producing a Pending Evaluation state)

### 5.3 Prohibited Transitions

| Prohibited Transition | Constitutional Reason |
|---|---|
| `Revoked` → `Active` | Revocation is terminal for a standing record. New standing requires a new evaluation cycle with new evidentiary basis. |
| `Invalid` → `Active` | A constitutionally defective record cannot become operative. It must be superseded by a new, valid evaluation. |
| `Expired` → `Active` (direct) | Expiration cannot be reversed by re-dating. A new evaluation is required. |
| `Archived` → `Active` | Archived records are historical. They may inform new evaluations but cannot themselves become operative again. |
| Any state → `Draft` | States do not regress to Draft. Draft is only an initial state. |
| Any state (direct administrative edit) | No standing state transition may occur through direct administrative edit. All transitions MUST result from authorized protocol events and deterministic recomputation. |

### 5.4 Challenge Overlay

The `Challenged` state is an overlay that may apply to `Active`, `Verified`, `Pending Evaluation`, or `Suspended` records. A challenge does not automatically change the base state but MUST be reflected in:

- the standing record's challenge state indicator;
- the explanation tree;
- the capability engine's consumption of the standing record;
- the audit trail.

Policy defines whether a standing record under active challenge may still support capability decisions and under what conditions.

---

## 6. Standing Lifecycle

The Standing Lifecycle describes the complete trajectory a standing state traverses from its absence to its final archival. Each phase has constitutional requirements.

### 6.1 No Standing

The initial constitutional condition. The subject exists (per RFC-001 Identity) but no standing evaluation has been completed for the relevant standing type and context. The absence of standing is itself a recognized protocol state and MUST be handled explicitly by capability engines — the absence of standing is not permission; it is a barrier unless policy specifically recognizes a default-allow rule, which itself requires explicit governance authorization.

### 6.2 Evidence Accumulation

Before standing can be evaluated, a sufficient evidentiary basis must exist. Evidence items governed by RFC-004 are created, preserved, and assigned lifecycle states. Evidence accumulation may occur over time, across multiple sources, under different authorities, and through different verification methods.

Evidence accumulation is a precondition for standing evaluation. A Standing Engine that begins evaluation before evidence has achieved a sufficient lifecycle state MUST either produce a standing state that reflects insufficient evidence or defer evaluation until minimum evidentiary thresholds are met per policy.

### 6.3 Claim Formation

Evidence gives rise to Claims, governed by RFC-005. Claims are formal assertions about a subject, supported by evidence, issued by recognized authorities, and subject to attestation and verification. The Claim Layer mediates between raw evidence and standing interpretation.

Standing evaluation MUST consume Claims, not raw evidence directly. This interposition ensures that evidence has been formally asserted, attributed, and verified before contributing to standing. Claims carry their own standing states per RFC-005, and those claim-level standing states MUST be considered by the Standing Evaluation.

### 6.4 Evaluation Authorization

Before evaluation begins, the Standing Evaluation MUST be authorized by recognized governance authority. Authorization includes:

- confirmation that the applicable policy is activated and versioned;
- confirmation that the applicable algorithm is authorized for this context;
- confirmation that the evaluating entity has governance authorization;
- confirmation that the subject's identity reference is valid per RFC-001;
- confirmation that consent requirements (where applicable) are satisfied.

Evaluation without authorization is constitutionally defective and MUST produce an Invalid standing record.

### 6.5 Draft Standing

Once evaluation is authorized and inputs are assembled, the Standing Record enters the Draft state. Draft standing is internal to the evaluation process and MUST NOT be shared externally or consumed by capability engines.

### 6.6 Pending Evaluation

When all required inputs are assembled, verified, and ready for algorithmic evaluation, the record transitions to Pending Evaluation. The evaluation process begins deterministic execution.

### 6.7 Evaluation

The Standing Evaluation executes the authorized algorithm against the assembled Standing Basis under the Standing Context and PolicyContext. The evaluation MUST be deterministic, documented, and capable of producing a full explanation tree.

### 6.8 Recognition

If the evaluation produces a positive outcome, the standing is recognized. The Standing Record is issued with a Verified state and the evaluation outputs. Recognition is a constitutionally governed act: it is not merely a technical output; it is a formal determination by an authorized governance process.

### 6.9 Active Standing

Recognized standing enters the Active state when its valid-from timestamp is reached. Active standing is the operational condition from which capability engines may derive authorized capabilities, subject to all bounds, constraints, and conditions defined in the Standing Context and PolicyContext.

### 6.10 Expiration

Active standing expires when its valid-until timestamp is reached or when a defined expiration condition is triggered. Expiration is not punishment; it is constitutional hygiene. Evidence ages. Claims become outdated. Policies change. Expiration ensures that standing is continuously grounded in current evidentiary reality.

### 6.11 Revocation

Revocation terminates a standing record prior to its natural expiration. Revocation may be triggered by disqualifying evidence, successful challenge resolution, governance mandate, policy change, or identity compromise. Revocation MUST be authorized, explained, and recorded. The revocation record is part of the Standing History and MUST be preserved.

### 6.12 Historical Preservation

All standing records — regardless of state — MUST be preserved within the defined retention window. Historical preservation serves audit, accountability, legal proceedings, governance dispute resolution, and the possibility of reconstruction. Preservation does not mean that historical records remain operative; it means that they remain readable, attributable, and reconstructable.

---

## 7. Standing Inputs

The Standing Engine accepts a defined set of constitutional inputs. Each input type has a specific role, weight implications, and eligibility requirements.

### 7.1 Claims

Claims are the primary constitutional input to standing evaluation. A Claim governed by RFC-005 carries: the type of assertion, the subject, the issuer, the evidentiary basis, the attestation record, the verification record, the claim standing state, the temporal bounds, and the challenge state. The Standing Engine MUST evaluate Claim standing states before including a Claim in the evaluation basis.

**Weight and relevance:** Claims carry high constitutional weight because they represent formally issued, verified assertions. However, weight must be modulated by: claim type relevance to the standing context, issuer authority within the policy context, temporal currency, and challenge state. A challenged claim MUST contribute differently than an unchallenged claim, as defined by policy.

### 7.2 Attestations

Attestations are formal confirmations by recognized attestors that an assertion is valid, true, or supported. Attestations strengthen the evidentiary basis of Claims but are not independently sufficient to constitute standing without the underlying Claim and Evidence basis.

**Weight and relevance:** Attestations from high-authority, independent, policy-recognized attestors carry higher weight. Self-attestations (where the subject attests to its own claims) carry minimal weight and MUST be disclosed explicitly in the explanation tree.

### 7.3 Verifications

Verifications are the formal confirmation that a claim, attestation, or evidence item has been evaluated by a recognized verifier using a defined method and found to satisfy stated criteria. Verifications are the strongest form of third-party confirmation.

**Weight and relevance:** Verifications carry the highest weight among claim-support inputs. The weight of a verification is modulated by: the authority of the verifier, the method used, the scope of verification, and the recency of the verification.

### 7.4 Evidence

Evidence items governed by RFC-004 provide the foundational factual substrate. While the Standing Engine evaluates Claims rather than raw evidence, Evidence lifecycle states affect the standing states of the Claims they support. Evidence that has been invalidated, revoked, or expired MUST cause re-evaluation of Claims that depend on it, which in turn MUST trigger standing recalculation.

**Weight and relevance:** Evidence weight is determined by: source authority, evidence type, temporal currency, verification status, and challenge state. The Standing Engine MUST NOT directly consume raw evidence as if it were a verified claim.

### 7.5 Historical Standing

Prior Standing Records for the same subject — or for related subjects under delegation — provide contextual input. Historical standing may inform the evaluation of recovery scenarios, of standing trajectories, or of patterns relevant to policy (such as repeated suspensions suggesting a systemic issue).

**Weight and relevance:** Historical standing carries informational rather than determinative weight. A history of strong standing may support lenient treatment of gap periods. A history of revocations may trigger enhanced scrutiny. Policy defines how historical standing is weighted.

### 7.6 Governance Policies

The activated PolicyContext is a mandatory input. It defines the rules under which all other inputs are weighted, included, excluded, and combined. PolicyContext is not data; it is the interpretive framework that makes evaluation possible.

**Weight and relevance:** Policy is not weighted against other inputs; it governs the weighting of all other inputs. A PolicyContext that conflicts with Charter principles MUST be challenged through the governance process.

### 7.7 Identity State

The current identity state of the Standing Subject per RFC-001 is an input. If the subject's identity is compromised, suspended, or invalid, the Standing Engine MUST consider this before evaluating standing. Active standing cannot exist for a subject whose identity is invalid.

**Weight and relevance:** Identity state is a gate condition: if the identity is not in a valid state per RFC-001, standing evaluation MUST be suspended, deferred, or restricted as defined by policy.

### 7.8 Delegation State

If standing is being evaluated for a subject that holds delegated standing from a principal, the delegation instrument, its scope, its constraints, and its current state are mandatory inputs. Delegated standing MUST NOT exceed the bounds of the delegation instrument.

**Weight and relevance:** Delegation state affects the ceiling of achievable standing. A delegation with narrow scope limits the standing type and confidence that can be achieved through it. A revoked delegation eliminates any standing derived from it.

### 7.9 Challenge State

The challenge state of every input — each Claim, each Evidence item, each Attestation, each Verification — is a mandatory input. An active, unresolved challenge on a critical input MUST affect the standing outcome. The Standing Engine MUST NOT treat challenged inputs the same as unchallenged inputs.

**Weight and relevance:** Challenge state reduces the effective weight of challenged inputs and may trigger the `Challenged` overlay on the resulting standing record. The degree of weight reduction is policy-defined and MUST be disclosed in the explanation.

---

## 8. Standing Evaluation Model

The Standing Evaluation Model is the constitutional heart of the Standing Engine. It defines how the engine transforms inputs into standing states through a governed, deterministic, explainable process.

### 8.1 The Evaluation Equation

At the protocol level, standing is a function:

```text
Standing(Subject, Time) = Evaluate(
  ClaimSet(Subject, Time),
  EvidenceSet(Subject, Time),
  AttestationSet(Subject, Time),
  VerificationSet(Subject, Time),
  HistoricalStanding(Subject, Time),
  DelegationState(Subject, Time),
  IdentityState(Subject, Time),
  ChallengeState(Subject, Time),
  PolicyContext(Context, Time),
  AlgorithmVersion(Context, Time),
  StandingContext
)
```

This function MUST be deterministic: identical inputs produce identical outputs. This function MUST be total: every valid input combination produces a defined output state. This function MUST be explainable: every output is accompanied by a full explanation tree.

### 8.2 How Multiple Claims Generate Standing

Claims do not simply add together to produce standing. The evaluation model must address:

**Claim aggregation:** Multiple claims of the same type, from different issuers, may reinforce each other. Policy defines whether multiple claims from a single domain produce stronger standing or whether issuer independence is required for reinforcement. Without independence requirements, a subject could manufacture standing by generating many low-quality claims from a single source.

**Claim coverage:** Different claims may cover different aspects of the standing type. Full standing may require coverage across multiple domains. The evaluation model MUST assess whether the claim set covers the required aspects and identify gaps.

**Claim convergence:** When multiple independent claims from high-authority issuers converge on the same assertion, the resulting standing should reflect that convergence with higher confidence. Convergence without independence (multiple claims from the same source network) MUST NOT produce the same confidence boost as genuine independent convergence.

**Minimum thresholds:** Policy defines minimum claim thresholds for each standing state. No standing state above `Insufficient` may be produced if minimum claim thresholds are not satisfied, regardless of evidence quality.

### 8.3 How Conflicting Claims Affect Standing

Conflicting claims arise when two verified claims, from recognized issuers, make incompatible assertions about the same subject. The evaluation model MUST address this scenario explicitly.

**Conflict detection:** The Standing Engine MUST detect claim conflicts and record them in the Standing Basis. Undetected conflicts that affect the standing outcome are a constitutional defect.

**Conflict resolution:** Policy defines the conflict resolution hierarchy. Resolution methods may include: recency preference (newer claim supersedes older), authority preference (higher-authority issuer's claim prevails), challenge initiation (conflict triggers a formal challenge), suspension (standing is suspended pending resolution), or scope narrowing (the conflicting aspect is excluded, narrowing the standing scope).

**Conflict disclosure:** Regardless of how a conflict is resolved, the conflict and its resolution MUST be disclosed in the explanation tree. A standing output that silently ignores a known conflict is constitutionally defective.

**Unresolvable conflicts:** If policy cannot resolve the conflict through defined rules, the Standing Engine MUST produce a state no higher than `Restricted` or `Under Review` and MUST initiate a governance review process.

### 8.4 How Conflicting Evidence Affects Standing

Evidence conflicts arise when two evidence items, each valid per RFC-004, support incompatible factual assertions. Since claims depend on evidence, evidence conflicts propagate upward into claim conflicts.

The evaluation model MUST:

- detect evidence-level conflicts before evaluating claim-level inputs;
- assess whether the conflict affects the claims being evaluated;
- apply the evidence conflict resolution rules defined in policy;
- record the conflict, the resolution method, and the outcome in the Standing Basis;
- reduce confidence where evidence conflicts were resolved by preference rather than by definitive adjudication.

### 8.5 How Prior Standing Affects Future Standing

Prior standing records are inputs, not precedents that bind the evaluation. The evaluation MUST produce the correct outcome based on current inputs. However, prior standing is relevant as:

- a contextual signal (a long, uninterrupted history of Active standing increases confidence in current evaluation);
- a gap marker (a gap between standing periods may require explanation per policy);
- a recurrence indicator (repeated suspensions or revocations may trigger enhanced scrutiny requirements);
- a continuity basis (where policy recognizes standing continuity, prior standing may reduce the evidentiary minimum for renewal).

Prior standing MUST NOT be used to avoid evaluation. Every standing period requires its own evaluation basis.

### 8.6 How Delegation Affects Standing

When a subject holds delegated standing, the evaluation must assess:

- whether the delegation instrument is valid, active, and within scope;
- whether the delegating principal has the authority to delegate the asserted standing type;
- whether the delegation constraints (scope, risk tier, temporal bounds) limit the achievable standing;
- whether any conditions imposed by the delegation instrument are satisfied;
- whether the delegation chain introduces any conflicts with the subject's own standing.

Delegated standing MUST be clearly marked as such in the Standing Record. The delegation chain MUST be traceable. The ceiling of delegated standing MUST be bounded by the delegating principal's own standing.

### 8.7 How Revocations Affect Standing

Revocations — of claims, attestations, verifications, or evidence — propagate through the evaluation model. When a revocation occurs:

1. The Standing Engine MUST identify all standing records that directly or indirectly depend on the revoked element.
2. Each affected standing record MUST be flagged for recalculation.
3. Recalculation MUST exclude the revoked element from the Standing Basis.
4. If the resulting standing would be materially different, the standing record MUST be updated and a new Standing Record issued.
5. The revocation propagation MUST be recorded in the Standing Basis and explanation of the new standing record.
6. Capability engines that consumed the affected standing MUST be notified per the notification protocol.

Revocations MUST NOT be silently absorbed. Every revocation that materially affects standing MUST produce an observable, auditable standing change.

---

## 9. Standing Algorithms

This section defines the conceptual algorithms that govern the Standing Engine's evaluation processes. These are constitutional specifications, not pseudocode or implementation blueprints.

### 9.1 Eligibility Evaluation Algorithm

**Purpose:** Determine which inputs are eligible to contribute to the standing evaluation for a specific subject, context, and policy.

**Conceptual process:**

```text
FOR each input I in {Claims, Evidence, Attestations, Verifications, Historical Standing, Delegation}:
  1. Identify I's current lifecycle state.
  2. Apply inclusion rules from PolicyContext: does I's type satisfy the policy's eligible input types for this StandingType?
  3. Apply temporal filters from PolicyContext: is I within the required recency window?
  4. Apply authority filters from PolicyContext: does I's issuing authority satisfy the required authority tier?
  5. Apply challenge filters from PolicyContext: if I is challenged, does the challenge state disqualify I or reduce I's weight?
  6. Record outcome as: Included / Excluded-with-reason / Weight-reduced-with-reason.
END FOR

ASSERT that all exclusions are documented with specific rule references.
ASSERT that no eligible input is silently omitted.
```

### 9.2 Standing Activation Algorithm

**Purpose:** Transition a Verified standing record to Active status at the appropriate moment.

**Conceptual process:**

```text
Given a Verified Standing Record V:
1. Confirm that V's valid-from timestamp has been reached.
2. Confirm that no suspension event has occurred between Verification and Activation.
3. Confirm that no new disqualifying evidence or challenge has been received that would alter the evaluation.
4. Confirm that the PolicyContext under which V was produced remains active (or that migration rules apply).
5. IF all conditions satisfied: transition V to Active. Record activation event with timestamp and authority.
6. IF any condition fails: defer Activation or trigger re-evaluation.
```

### 9.3 Standing Suspension Algorithm

**Purpose:** Temporarily disable active standing in response to a recognized suspension trigger.

**Conceptual process:**

```text
Given a suspension trigger T for Subject S, Standing Type ST, Context C:
1. Identify the applicable Standing Record R (most recent Active or Verified record for S, ST, C).
2. Verify that T is a recognized suspension trigger per PolicyContext.
3. Verify that the suspending authority is authorized to suspend under PolicyContext.
4. Record suspension event: trigger, authority, timestamp, expected resolution process.
5. Transition R to Suspended state.
6. Notify affected capability engines per notification protocol.
7. Initiate the applicable review process per PolicyContext.
```

### 9.4 Standing Expiration Algorithm

**Purpose:** Transition active standing to Expired when temporal or condition-based validity ends.

**Conceptual process:**

```text
At each evaluation cycle or on-demand for Subject S, Standing Type ST, Context C:
1. Identify the operative Standing Record R.
2. Evaluate all expiration conditions: is the valid-until timestamp reached? Are any condition-based expiration triggers satisfied?
3. IF any expiration condition is met AND R is in Active state: transition R to Expired.
4. Record expiration event: condition triggered, timestamp.
5. Notify affected capability engines per notification protocol.
6. Preserve R in Standing History.
```

### 9.5 Standing Revocation Algorithm

**Purpose:** Definitively terminate a standing record upon authorized revocation trigger.

**Conceptual process:**

```text
Given a revocation order O for Subject S, Standing Record R, authority A:
1. Verify that A is authorized to revoke this standing type under PolicyContext.
2. Verify that O specifies a valid revocation basis: disqualifying evidence, challenge resolution, governance mandate, or policy mandate.
3. Record revocation event: basis, authority, timestamp, explanation.
4. Transition R to Revoked state.
5. Propagate revocation to all downstream Standing Records that depend on R.
6. Notify affected capability engines per notification protocol.
7. Preserve R and all revocation records in Standing History.
8. Mark the revocation as terminal: no direct transition back to Active is possible from this record.
```

### 9.6 Standing Recovery Algorithm

**Purpose:** Restore standing for a subject following erroneous denial, erroneous revocation, or successful appeal.

**Conceptual process:**

```text
Given a recovery authorization O for Subject S, Standing Type ST, Context C:
1. Identify the basis for recovery: error of governance, new evidence, appeal resolution, identity recovery, institutional change.
2. Verify that O is authorized by the appropriate governance process.
3. Determine whether the prior standing record can be un-revoked (only for erroneous revocations) or whether a new evaluation is required.
4. IF un-revoking: create a Superseding record that restores standing, with full explanation of the error and the correction.
5. IF new evaluation required: initiate the full evaluation lifecycle with the corrected or new evidentiary basis.
6. Record recovery event with full audit trail: original record, error basis, correction basis, authority, timestamp.
7. Notify affected capability engines.
```

### 9.7 Standing Reconstruction Algorithm

**Purpose:** Deterministically reproduce the standing state of a subject at any historical timestamp T within the preservation window.

**Conceptual process:**

```text
Given Subject S, Standing Type ST, Context C, timestamp T:
1. Retrieve the canonical Standing History chain for S, ST, C.
2. Identify the Standing Record R that was operative at timestamp T (based on valid-from and valid-until timestamps in the chain).
3. Retrieve R's Standing Basis: the exact set of Claim versions, Evidence versions, Policy version, Algorithm version, and Challenge state that were canonical at T.
4. Re-execute the Standing Evaluation using the retrieved inputs, under the retrieved Policy and Algorithm versions.
5. ASSERT that the result matches R's recorded Standing Outcome.
6. IF the result does not match: flag a reconstruction discrepancy and initiate a constitutional review.
7. Emit the reconstructed Standing Record with a reconstruction provenance marker.
```

### 9.8 Standing Delegation Algorithm

**Purpose:** Evaluate whether standing may be delegated from a delegating principal to a delegate, and compute the constrained standing for the delegate.

**Conceptual process:**

```text
Given Principal P, Delegate D, Standing Type ST, Delegation Instrument DI:
1. Verify that P has Active standing of type ST in context C.
2. Verify that DI is valid, authorized by recognized governance, and within scope.
3. Identify the ceiling of delegatable standing: the lesser of P's standing scope and DI's authorized scope.
4. Verify that D's own identity state per RFC-001 permits delegation.
5. Evaluate any additional conditions imposed by DI.
6. IF all conditions satisfied: issue a Delegated Standing Record for D, bounded by the ceiling and DI's constraints.
7. Record the delegation chain: P → DI → D, with all references.
8. Revocation of P's standing or DI's validity MUST propagate automatically to D's delegated standing.
```

### 9.9 Standing Supersession Algorithm

**Purpose:** Replace an operative standing record with a new one following a material change in inputs, policy, or algorithm.

**Conceptual process:**

```text
Given Subject S, current Standing Record R (Active or Verified), and a supersession trigger T:
1. Execute a new Standing Evaluation with the current inputs and the applicable policy and algorithm versions.
2. Compare the new outcome with R's outcome: identify differences in state, confidence, basis, and explanation.
3. Issue a new Standing Record R' with the new outcome.
4. Mark R as Superseded, with a reference to R'.
5. Record the supersession delta: what changed, why, which inputs drove the change.
6. Notify capability engines.
```

### 9.10 Standing Challenge Resolution Algorithm

**Purpose:** Resolve a formal challenge to a standing record and update the standing state accordingly.

**Conceptual process:**

```text
Given Challenge CH for Standing Record R, resolved by authority A with outcome O:
1. Verify that A is authorized to resolve challenges of this type per PolicyContext.
2. Record resolution: A, O, timestamp, reasoning, evidence considered.
3. IF O = Challenge Sustained:
   a. Identify the affected element (claim, evidence, evaluation rule, authority).
   b. Execute the corrective process: invalidate the element, revoke, supersede, or suspend.
   c. Trigger standing re-evaluation.
4. IF O = Challenge Rejected:
   a. Record the rejection with full reasoning.
   b. Remove the Challenged overlay from R if no other active challenges remain.
5. In both cases: update the explanation tree and notify S.
```

---

## 10. Standing Governance

### 10.1 Who May Define Standing Rules

Standing rules — including policy versions, algorithm versions, standing type definitions, and evaluation requirements — MUST be defined through the governance process established by RFC-005-H3. Rule definition authority MUST be:

- explicitly delegated by the protocol's constitutional governance;
- exercised through a documented, traceable governance process;
- subject to review, challenge, and audit;
- limited in scope to the subject matter for which authority was granted.

No standing rule may be defined unilaterally by a single actor, even if that actor holds governance authority in other domains. Rule definition that affects multiple domains MUST receive multi-domain governance participation.

### 10.2 Who May Modify Rules

Rule modification MUST follow the same governance process as rule definition. Modifications MUST be versioned, not retroactive, and accompanied by a migration analysis identifying which standing records would be affected by the modification. Material modifications MUST trigger a public comment period within the governance process before taking effect.

### 10.3 Who May Approve Rules

Rule approval is the constitutional act that authorizes a rule to be applied by the Standing Engine. Approval MUST be:

- performed by recognized governance bodies with explicit approval authority;
- recorded as a governance event with full attribution;
- subject to super-majority requirements for rules affecting fundamental standing definitions;
- reversible only through the same governance process that approved the rule.

### 10.4 Who May Audit Standing Governance

Standing Governance is subject to audit by:

- authorized protocol auditors;
- constitutionally recognized independent oversight bodies;
- subject representatives with recognized standing to audit governance affecting their domain;
- external auditors appointed through recognized governance processes.

Audit access MUST be sufficient to verify that rules were defined, approved, and applied correctly. Audit access MUST NOT be conditioned on the auditor's agreement with the governance outcomes.

### 10.5 Who May Challenge Standing Rules

Any actor with recognized standing to participate in governance may challenge a standing rule by demonstrating that it:

- violates Charter principles;
- was produced without proper governance authorization;
- creates discriminatory or anti-competitive outcomes;
- was applied inconsistently or selectively;
- was modified without proper process.

Challenges to standing rules MUST be resolved through the governance dispute resolution process defined in RFC-005-H3.

### 10.6 How Rules Evolve

Rules evolve through versioned, governed amendment cycles. Each new rule version MUST:

- be assigned a unique version identifier;
- carry a changelog documenting what changed from the prior version and why;
- identify the governance authority that approved the change;
- specify the effective date;
- specify whether existing standing records are grandfathered under the prior version or must be re-evaluated;
- be stored immutably once activated.

No rule version may be overwritten. The history of rule versions is part of the constitutional record of the Standing Governance.

---

## 11. Standing Traceability

Standing Traceability is the constitutional requirement that every standing outcome be traceable to its complete causal history. This section specifies the traceability requirements; RFC-005-H1 defines the traceability infrastructure in detail.

### 11.1 Why This Standing Exists

Every Standing Record MUST carry a human-readable and machine-readable explanation of why this standing state was produced for this subject at this time. The explanation MUST identify:

- the standing type and context that framed the evaluation;
- the governance authorization under which the evaluation occurred;
- the policy version that defined the rules;
- the algorithm version that executed the evaluation;
- the evaluation timestamp.

### 11.2 What Evidence Produced It

The Standing Basis MUST enumerate every evidence item that contributed to the standing outcome, along with:

- the evidence's lifecycle state at evaluation time;
- the evidence's source authority;
- the evidence's verification status;
- the evidence's challenge state;
- the weight or relevance assigned to the evidence by policy;
- the rationale for including this evidence (which policy rule permitted it).

### 11.3 What Claims Participated

The Standing Basis MUST enumerate every claim that contributed, along with:

- the claim type;
- the claim issuer and issuer authority;
- the claim's standing state per RFC-005;
- the claim's attestation and verification records;
- the claim's temporal bounds;
- the claim's challenge state;
- the weight or relevance assigned by policy.

### 11.4 What Verifications Participated

Each verification contributing to a claim that contributed to standing MUST be traceable, including the verifier, the verification method, the scope of verification, the verification timestamp, and the verifier's authority.

### 11.5 What Rules Participated

The specific policy rules, eligibility criteria, threshold requirements, aggregation rules, and decay functions applied during evaluation MUST be identified by rule reference within the PolicyContext and AlgorithmVersion.

### 11.6 What Authority Recognized the Result

The Standing Record MUST identify the governance authority under which the evaluation was authorized and the authority that issued the Standing Record. For delegated evaluations, the full authorization chain MUST be traceable.

### 11.7 When It Occurred

Every event in the Standing Record — initiation, evaluation, issuance, suspension, expiration, revocation, supersession — MUST carry a timestamp that is consistent with the system's canonical time reference.

---

## 12. Standing Explainability

Explainability is a constitutional right. A subject affected by a standing determination MUST be able to understand why the determination was made. An auditor MUST be able to verify the determination. A governance body MUST be able to evaluate whether the determination followed the rules. This section defines what explanations the Standing Engine MUST be capable of producing.

### 12.1 Why Do I Have Standing?

The Standing Engine MUST be capable of producing an explanation in human-intelligible terms that answers:

*Your standing of [state] for [standing type] in context [C] was produced on [date] because [claims and evidence summary]. Your primary qualifying evidence was [evidence summary]. The evaluation was conducted under policy version [P] and algorithm version [A]. Your standing is valid until [date or condition]. The following authorities contributed: [authority list].*

### 12.2 Why Did I Lose Standing?

The Standing Engine MUST be capable of producing an explanation that answers:

*Your standing of [prior state] was changed to [new state] on [date] because [trigger]. The specific element that caused this change was [element: claim, evidence, challenge outcome, policy change, or expiration]. The responsible governance authority was [authority]. [If challenge resolution:] A challenge raised by [challenger] was resolved with outcome [outcome], which determined that [explanation of impact on standing basis]. You may [initiate recovery / appeal / request review] through [process reference] within [deadline if applicable].*

### 12.3 Why Is My Standing Suspended?

The Standing Engine MUST be capable of explaining:

*Your standing was suspended on [date] by [authority] because [basis: pending review / active challenge / governance investigation / policy-required suspension]. The suspension is expected to be resolved through [process] by [estimated timeframe or condition]. While suspended, your standing is not operative for [capability implications]. You may [participate in the resolution process / submit additional evidence] through [channel].*

### 12.4 Why Did My Standing Expire?

*Your standing expired on [date] because [condition: valid-until timestamp reached / evidence age exceeded policy threshold / certification lapsed]. Expiration is not a negative determination; it reflects that standing requires periodic renewal to remain current. To renew, you must [initiate a new evaluation / submit current evidence / satisfy currency requirements per policy version P].*

### 12.5 Why Was My Standing Rejected?

*Your standing evaluation for [standing type] in context [C] produced an [Insufficient / Invalid] outcome because [specific deficit: insufficient claims / unqualified evidence / failed verification / authority gap / challenge not resolved / policy minimum not met]. The specific gap was [gap description]. To be eligible for [target standing state], you would need to satisfy [requirement description] per policy version [P].*

---

## 13. Standing Challenges

The Challenge System is the constitutional mechanism by which the legitimacy of any standing determination may be contested. Without a challenge system, standing becomes an unreviewable administrative determination — constitutionally illegitimate under the AOC Charter.

### 13.1 Challenge Types

| Challenge Type | What Is Contested |
|---|---|
| **Challenge Standing** | The standing outcome itself is contested: the challenger asserts that the produced state is incorrect given the evidence, claims, policy, and algorithm. |
| **Challenge Evidence** | Specific evidence underlying the standing is contested: the challenger asserts that the evidence is fraudulent, misattributed, invalid, or misapplied. |
| **Challenge Verification** | A verification supporting a claim is contested: the challenger asserts that the verification was conducted incorrectly, by an unqualified verifier, or under a conflict of interest. |
| **Challenge Delegation** | A delegation instrument used in the standing evaluation is contested: the challenger asserts that the delegation lacked authority, exceeded bounds, or was improperly executed. |
| **Challenge Governance Rule** | A policy rule or algorithm applied in the evaluation is contested: the challenger asserts that the rule is unconstitutional, unauthorized, or misapplied. |
| **Challenge Authority** | The authority that produced or recognized the standing is contested: the challenger asserts that the authority lacked the constitutional mandate to issue this standing determination. |

### 13.2 Challenge States

| State | Meaning |
|---|---|
| **Submitted** | The challenge has been formally submitted through a recognized challenge channel and assigned an identifier. |
| **Accepted** | The challenge has been assessed as formally valid: it identifies a specific, contestable element; it is brought by a recognized party; it is within the challenge window. |
| **Rejected** | The challenge has been assessed as formally invalid: it lacks specificity, is brought by an unrecognized party, is outside the challenge window, or duplicates a resolved challenge. |
| **Under Review** | The challenge has been accepted and is being evaluated by recognized reviewers with appropriate authority. |
| **Escalated** | The challenge has been elevated to a higher governance body because the initial review body lacked authority, faced a conflict of interest, or produced a contested outcome. |
| **Resolved** | The challenge review process has produced a binding outcome: either the challenge is sustained (affecting standing) or the challenge is rejected on the merits (standing confirmed). |
| **Closed** | The challenge is concluded: resolution recorded, appeals exhausted or waived, outcome implemented. |

### 13.3 Who May Challenge

The following parties have constitutional standing to challenge:

- the Standing Subject (the subject of the challenged standing);
- directly affected parties (parties whose legal, contractual, or governance rights are materially affected by the standing outcome);
- authorized auditors conducting protocol or governance audits;
- recognized governance bodies with supervisory authority over the relevant standing domain;
- any party with recognized standing to participate in governance challenge processes per RFC-005-H3.

### 13.4 Challenge Requirements

A valid challenge MUST:

- identify the specific standing record being challenged;
- identify the specific element being contested (evidence item, claim, verification, authority, rule, or outcome);
- provide the basis for the challenge with supporting rationale;
- be submitted by a recognized party within the defined challenge window;
- be submitted through the recognized challenge channel.

### 13.5 Challenge Effects on Standing

- A submitted challenge alone does not suspend standing (unless policy provides for automatic suspension upon submission for certain challenge types).
- An accepted challenge MUST produce the `Challenged` overlay on the affected standing record.
- A challenge under review MUST be disclosed in the standing record's explanation.
- A challenge sustained MUST trigger standing re-evaluation with the affected element excluded or invalidated.
- A challenge rejected MUST result in removal of the `Challenged` overlay (if no other challenges are active).

### 13.6 Challenge Resolution Requirements

Challenge resolution MUST:

- be performed by an authority with no conflict of interest in the outcome;
- be conducted with access to all relevant evidence, claims, and governance records;
- produce a written resolution explaining the outcome and its basis;
- be binding on the challenged standing record;
- be recorded in the Standing History and the challenge record;
- be itself subject to appeal through the governance escalation process.

---

## 14. Standing Delegation

### 14.1 What May Be Delegated

Standing delegation transfers, within defined bounds, the recognition basis that enables a principal to confer some form of recognized state upon a delegate. The following forms of standing delegation are constitutionally recognized:

- **Scoped Professional Delegation:** A credentialed professional delegates their recognized qualification standing to authorize a supervised subordinate to operate within a defined, narrower scope.
- **Institutional Delegation:** An institution delegates its organizational standing to a project, team, or agent operating under its authority.
- **Temporal Delegation:** A principal with active standing delegates recognition for a defined time period and defined purpose.
- **AI Agent Standing Delegation:** A human or institutional principal delegates supervised operational standing to an AI agent for a defined task scope and risk tier.

### 14.2 What May NOT Be Delegated

The following are constitutionally non-delegable:

- **Personal standing derived from individual credentials:** A professional certification belongs to the holder; the standing it produces for that holder cannot be transferred to give another individual the same qualified standing.
- **Standing derived from unmet conditions:** A principal cannot delegate standing at a level higher than their own current standing.
- **Standing that is itself delegated:** Delegated standing cannot be re-delegated (no sub-delegation) unless explicitly authorized by the original delegation instrument and the original delegating principal.
- **Standing under active suspension or revocation:** Suspended or revoked standing cannot be delegated.
- **Standing that bypasses consent requirements:** Delegation cannot be used to circumvent the consent requirements of the subject or the subject of the underlying evidence.

### 14.3 Personal Standing

Personal standing is standing that derives from the personal characteristics, credentials, qualifications, or history of the individual subject. It belongs to the individual and MUST NOT be transferable except through delegation instruments that respect the non-personal nature of what is actually being transferred (e.g., an institutional vouching relationship, not an identity transfer).

### 14.4 Transferable Standing

Transferable standing is standing that policy explicitly recognizes as capable of delegation, inheritance, or scope transfer. Transfer MUST be authorized, bounded, recorded, and revocable. The transfer does not eliminate the original principal's standing; it creates a dependent standing for the delegate, bounded by and revocable through the delegating relationship.

### 14.5 Institutional Standing

Institutional standing belongs to a constituted legal entity or governance body. It may be delegated to teams, projects, agents, and authorized representatives, but the delegated standing is derivative and MUST carry the institutional constraints. Institutional standing survives individual personnel changes; it is bound to the institution, not the individuals who hold roles within it.

### 14.6 Temporal Standing

Temporal standing is standing valid only for a defined time period or a defined set of transactions. Delegation of temporal standing MUST explicitly bound the delegate's standing to the same or a narrower temporal window. Temporal standing expires absolutely at the end of its window and cannot be extended through delegation.

### 14.7 Hereditary Standing

Certain standing types — particularly institutional standing — may be structured to survive governance transitions, leadership changes, or organizational restructuring. This is hereditary standing: it passes to a constituted successor under defined conditions. Hereditary standing MUST be governed by succession rules defined in the applicable institutional governance and recognized by AOC Protocol governance. Hereditary standing is not automatic; it requires a governed succession process.

---

## 15. Standing Recovery

Standing recovery is the constitutional process by which standing is restored to a subject following an error, a successful appeal, the emergence of new exonerating evidence, or a change in conditions that caused the loss.

### 15.1 Recovery from Error

**Error of governance:** If standing was denied or revoked because a governance process applied a rule incorrectly, the governance body MUST acknowledge the error, issue a corrective governance record, and authorize a recovery evaluation. The corrective evaluation MUST use the correct rule application and produce a new standing record. The error record and the correction record MUST both be preserved.

**Error of algorithm:** If a bug or incorrect version of the evaluation algorithm produced a wrong outcome, the algorithm authority MUST issue an error notification, identify all affected standing records, and authorize re-evaluation. Re-evaluation MUST use the correct algorithm version. Both the erroneous output and the corrected output MUST be preserved with explicit error attribution.

### 15.2 Recovery through Appeal

If a challenge is sustained on appeal — that is, an initial challenge was rejected but the escalated review sustains the challenge — the recovery process follows the challenge resolution algorithm (Section 9.10, sustained outcome). The subject's standing record MUST be updated to reflect the appeal outcome, and the explanation tree MUST document the full appeal history.

### 15.3 Recovery with New Evidence

New evidence may emerge that, if it had been available at the time of evaluation, would have produced different standing. Recovery on the basis of new evidence MUST:

- establish that the evidence is genuinely new (post-evaluation) and not previously available;
- assess whether the evidence changes the Standing Basis sufficiently to produce a different outcome;
- initiate a fresh evaluation that includes the new evidence;
- preserve the prior evaluation record alongside the new one, with explicit attribution of the new evidence.

New evidence recovery does not retroactively change the prior standing record; it produces a new one from the date of the new evaluation.

### 15.4 Recovery from Compromised Identity

If standing was suspended or revoked because the subject's identity was compromised, and the identity is subsequently recovered per RFC-001's recovery procedures, the Standing Engine MUST evaluate whether the identity recovery resolves the standing impact:

- Confirm that the identity recovery is valid and complete per RFC-001.
- Assess whether the identity compromise affected the evidentiary basis of the standing.
- If the basis is intact, initiate a recovery evaluation from the suspension date.
- If the basis is affected, require a full re-evaluation.

### 15.5 Recovery from Institutional Change

Organizational restructuring, merger, dissolution, or succession may disrupt institutional standing. Recovery requires:

- a recognized governance determination that the successor entity is constitutionally continuous with the original;
- a transfer of the standing record under the succession governance process;
- re-evaluation to confirm that the evidentiary basis remains valid for the successor entity.

### 15.6 Recovery from Governance Error

If a standing loss resulted from a governance process that itself violated constitutional rules — for example, a rule was applied that had not been validly approved, or a challenge was resolved by an authority with a conflict of interest — the recovery process must address the governance defect before restoring standing. The recovery MUST include:

- a constitutional review finding that identifies the governance defect;
- a remediation of the governance process;
- a fresh evaluation under the corrected governance process.

---

## 16. Standing Reconstruction

Standing Reconstruction is the constitutional capability that makes the Standing Engine historically accountable. It is not merely a feature; it is a requirement. A Standing Engine that cannot reconstruct past standing is constitutionally defective because it cannot be audited, challenged retroactively, or held accountable for past decisions.

### 16.1 The Reconstruction Requirement

For any timestamp T within the preservation window, and for any subject S and standing type ST and context C, the following MUST hold:

```text
Reconstruct(S, ST, C, T) = Standing(S, ST, C, T)
```

That is: the reconstruction produces the same result as the original evaluation would have produced at time T. This is the determinism requirement applied to history.

### 16.2 Requirements for Reconstruction Capability

Reconstruction requires that the following artifacts are preserved immutably within the retention window:

- every version of every PolicyContext ever applied;
- every version of every AlgorithmVersion ever applied;
- every version of every evidence item, with its lifecycle state at every timestamp;
- every version of every claim, with its lifecycle state at every timestamp;
- every attestation and verification record, with timestamps;
- every challenge record, with resolution records and timestamps;
- every governance event affecting standing rules, with timestamps;
- every Standing Record, in all states, with full provenance.

Without these artifacts, reconstruction is impossible. Their preservation is a constitutional requirement, not an operational preference.

### 16.3 Reconstruction Process

The reconstruction process is defined algorithmically in Section 9.7. Constitutionally, reconstruction MUST:

- produce a result consistent with the canonical standing at time T;
- flag any discrepancy between the reconstructed result and the archived Standing Record as a reconstruction anomaly;
- submit reconstruction anomalies to governance review;
- never use reconstruction to retroactively alter the historical record — reconstruction is for verification, not correction.

### 16.4 Reconstruction Determinism Guarantee

The Standing Engine MUST provide a constitutional guarantee: for any point in time within the preservation window, the standing of any subject is deterministically reconstructable. This guarantee is what makes the Standing Engine trustworthy as a constitutional instrument. Without it, standing becomes unverifiable and therefore illegitimate.

---

## 17. Constitutional Invariants

The following invariants are normative. No implementation of the Standing Engine may violate them. No governance rule may authorize their violation. No algorithm may produce outcomes that contravene them. They represent the constitutional bedrock of the Standing Layer.

### Group A: Separation Invariants

1. Standing does not create Identity. Identity precedes and is governed by RFC-001.
2. Standing does not create Authority. Authority is constituted by RFC-005-H8, not by standing states alone.
3. Standing does not create Capability. Capability is bounded by RFC-005-H7; standing is an input, not the grant.
4. Standing is not a role. An organizational role does not confer standing, and standing does not confer a role.
5. Standing is not a permission. A permission is a discrete capability grant; standing is an evaluated state.
6. Standing is not a credential. A credential is a verifiable artifact; standing is the interpretation of such artifacts under policy.
7. Standing is not a score. A score is a numeric aggregation; standing is a governed, explainable protocol state.
8. Standing is not a reputation. Reputation may be a social or market signal; standing is a deterministic, policy-governed determination.
9. Standing does not grant access. Access control is a separate protocol layer.
10. Standing does not survive the revocation of its evidentiary basis. When foundational evidence is revoked, standing must be re-evaluated.

### Group B: Derivation Invariants

11. Standing requires evidence. No standing state above `Insufficient` or `Unknown` may exist without an evidentiary basis traceable to RFC-004.
12. Standing requires claims. Evidence must be mediated through RFC-005 claims before contributing to standing.
13. Standing requires context. Context-free standing is constitutionally undefined.
14. Standing requires policy. Policy-free standing is arbitrary and non-conformant.
15. Standing requires a recognized algorithm. Unauthorized evaluation methods MUST NOT produce conformant standing records.
16. Standing requires governance authorization. Unauthorized evaluations produce Invalid standing records.
17. Standing requires a valid subject identity. A standing record for a subject with an Invalid identity per RFC-001 is constitutionally defective.
18. Standing derives from its basis. A standing outcome MUST NOT exceed what its basis actually supports.
19. Standing cannot be manufactured from circular evidence. Self-referential or circularly supporting evidence chains MUST be detected and excluded.
20. Standing cannot be manufactured through unauthorized self-attestation. Self-attestations carry minimal weight and must be explicitly disclosed.

### Group C: Process Invariants

21. Standing is computed, not edited. Direct administrative edits to standing states are constitutionally prohibited.
22. Standing changes occur through events. Every standing transition results from a recognized protocol event.
23. Standing is deterministic. Identical inputs produce identical outputs.
24. Standing is reproducible. Any past standing state can be reconstructed from preserved artifacts.
25. Standing evaluation is authorized. No evaluation proceeds without valid governance authorization.
26. Standing is explainable. Every standing record carries a complete explanation tree.
27. Standing is auditable. Every aspect of standing computation is preserved in auditable form.
28. Standing is traceable. Every standing record links to its complete causal history.
29. Standing is versioned. Every policy and algorithm contributing to standing carries a unique version identifier.
30. Standing is temporal. Every standing record has defined valid-from and valid-until bounds or decay conditions.

### Group D: Rights Invariants

31. Standing is contestable. Every standing determination may be challenged through a recognized process.
32. Standing challenge access is universal within governance bounds. No class of standing outcomes is exempt from challenge.
33. Standing is explainable to its subject. The subject has a right to receive an explanation of their standing.
34. Standing recovery is available. No standing determination is irreversible through error.
35. Standing history is preserved. No standing record may be destroyed within the retention window.
36. Challenge resolution is authoritative. Sustained challenges produce binding corrections.
37. Appeal rights are recognized. Initial challenge rejections may be escalated through recognized governance processes.
38. Standing cannot be used to silently discriminate. Standing rules must be transparent and applied uniformly.
39. Standing cannot be used to retroactively punish. New standing rules cannot retroactively change the interpretation of historical standing in ways that punish past conduct that was compliant under prior rules.
40. Standing cannot create permanent disqualification without ongoing governance review. A subject disqualified from standing has the right to re-apply after satisfying defined conditions.

### Group E: Governance Invariants

41. Standing rules are authorized. No rule takes effect without proper governance approval.
42. Standing rules are versioned and immutable once active. Activated rules may not be overwritten; they are superseded by new versions.
43. Standing governance is distributed. No single actor may unilaterally control standing rule-making.
44. Standing governance is auditable. The governance process that produced each rule is preserved and inspectable.
45. Standing governance is contestable. Governance decisions about rules may be challenged through constitutional processes.
46. Policy captures cannot be hidden. Policy changes that systematically benefit specific actors must be subject to conflict-of-interest review.
47. Algorithm captures cannot be hidden. Algorithm changes that systematically produce different outcomes for identifiable classes of subjects must be disclosed and subject to impact review.
48. Standing authority is bounded. Governance bodies have authority only over the standing domains delegated to them.
49. Standing governance respects Charter primacy. No governance rule may conflict with Charter principles.
50. Standing governance is continuous. The governance structure MUST persist; governance dissolution does not authorize standing engine shutdown without succession arrangements.

### Group F: Anti-Manipulation Invariants

51. Revocation of standing evidence propagates to standing. Evidence revocation that materially affects the standing basis MUST trigger re-evaluation.
52. Expired evidence affects standing. Evidence that has passed its recency window MUST be treated as stale per policy, not as current.
53. Challenged inputs affect standing outcomes. Active challenges on critical inputs MUST be reflected in the standing record.
54. Stale standing does not carry forward indefinitely. Standing that depends on evidence older than the policy's recency window MUST decay or expire per the applicable decay function.
55. Context laundering is prohibited. Standing produced in one context MUST NOT be silently reused in a different context where the evidence is not relevant.
56. Standing inflation through duplication is prohibited. Multiple claims from the same source do not carry the same weight as claims from independent sources.
57. Fake authority is excluded. Evidence and claims from unrecognized or unauthorized authority sources MUST be excluded or discounted per policy.
58. Sybil attacks are mitigated. Standing policies MUST evaluate issuer independence and subject uniqueness.
59. Standing cannot be laundered through delegation chains. Delegation cannot produce standing at a higher level than the delegating principal possesses.
60. Simulation is not standing. Simulation outputs MUST NOT be consumed as canonical standing records.

---

## 18. Anti-Capture Requirements

Capture occurs when a single actor, or a colluding group, gains control over a governance or evaluation system in a way that systematically produces outcomes favorable to the capturing actor at the expense of the system's constitutional purpose. The Standing Engine is a constitutional target for capture. These requirements are mandatory countermeasures.

### 18.1 No Standing Monopolies

No single entity may be the only recognized producer of standing determinations for a given standing type or domain. The Standing Engine MUST support, and governance MUST mandate, multiple authorized evaluators for each material standing type. Concentration of standing production capacity in a single actor is a constitutional risk that MUST be actively mitigated.

### 18.2 No Single Evaluator Dominance

If multiple evaluators are recognized, no single evaluator's outcomes may be treated as automatically correct or beyond challenge. Multi-evaluator disagreements MUST be resolvable through governance processes and MUST not be silently resolved in favor of the dominant evaluator.

### 18.3 No Single Authority Dominance

No single governance authority may control all of: rule definition, rule approval, algorithm authorization, challenge review, and audit. These functions MUST be distributed across distinct governance roles that operate independently and with distinct accountability mechanisms.

### 18.4 No Opaque Evaluation

The evaluation process MUST be transparent in its rules, its inputs, its outputs, and its explanation. Opaque evaluation processes — including black-box algorithms, proprietary scoring systems, or unexplained exclusions — are constitutionally prohibited. A standing system that cannot be explained cannot be challenged and is therefore illegitimate.

### 18.5 No Governance Capture

Governance capture occurs when rule-making bodies are systematically populated by actors with a material interest in specific rule outcomes. The governance structure defined in RFC-005-H3 MUST include:

- conflict-of-interest disclosure requirements for rule-makers;
- recusal procedures for interested parties;
- independent representation requirements for affected communities;
- review processes for governance decisions that systematically benefit specific actors.

### 18.6 No Rule Capture

Rule capture occurs when standing rules are designed to systematically favor or exclude specific classes of subjects. Rules MUST be assessed for discriminatory impact before activation. Rules that produce systematic exclusion of legitimate subjects without a constitutional justification MUST be rejected or amended.

### 18.7 No Evidence Capture

Evidence capture occurs when a single entity controls the production, verification, or validation of evidence for a standing type, enabling manipulation of the evidentiary basis. Standing policies MUST require evidence from diverse, independent sources. Single-source evidence for a full standing determination MUST be treated with reduced confidence and disclosed.

### 18.8 Concentration Monitoring

The Standing Governance structure MUST include mechanisms for monitoring concentration of governance power, evaluator dominance, evidence source concentration, and challenge resolution bias. Concentration indicators MUST trigger mandatory review processes.

---

## 19. Auditability Requirements

### 19.1 What Must Be Recorded

Every standing evaluation MUST produce a complete computation record including:

- the full input set with lifecycle states at evaluation time;
- the policy version and algorithm version applied;
- all inclusion and exclusion decisions with rule references;
- all weight assignments with policy justifications;
- all conflict detections and resolutions;
- all challenge states considered;
- the full explanation tree;
- the governance authorization record;
- the producing authority's attribution.

### 19.2 What Must Be Preserved

The following artifacts MUST be preserved within the defined retention window:

- all Standing Records in all states;
- all Standing Basis records;
- all challenge records and resolutions;
- all governance records affecting standing rules;
- all policy versions ever activated;
- all algorithm versions ever activated;
- all evidence and claim versions as of each standing evaluation;
- all standing history chains.

### 19.3 What Must Be Reconstructable

Within the retention window, any standing state at any historical timestamp MUST be reconstructable from preserved artifacts. The reconstruction MUST produce a result consistent with the original evaluation. Reconstruction discrepancies are constitutional anomalies requiring governance review.

### 19.4 What Must Be Explainable

Every standing output MUST be explainable to:

- the subject (in human-intelligible terms);
- an auditor (in machine-readable, structured terms);
- a governance body (in constitutional terms tracing to applicable rules);
- a legal proceeding (with full provenance and authority attribution).

### 19.5 What Must Remain Verifiable

The following MUST remain independently verifiable within the retention window:

- that a standing evaluation was authorized;
- that the policy and algorithm versions applied are authentic and unmodified;
- that the included evidence and claims had the stated lifecycle states at evaluation time;
- that the exclusion decisions followed the stated rules;
- that the explanation matches the actual computation;
- that the governance authorization was valid at evaluation time.

---

## 20. Runtime Contracts

Runtime Contracts are the abstract interface definitions that conformant implementations MUST satisfy. These are constitutional contracts — they define what each service must guarantee, not how it is implemented.

### 20.1 Standing Engine Contract

The Standing Engine is the core evaluation service. Its constitutional contract requires:

- **Determinism:** For identical inputs, produce identical outputs.
- **Totality:** For all valid input combinations, produce a defined output.
- **Completeness:** Every output carries a full explanation tree, Standing Basis, Standing Context, PolicyContext, and AlgorithmVersion.
- **Isolation:** The Standing Engine MUST NOT modify its inputs during evaluation.
- **Authorization check:** The Standing Engine MUST verify governance authorization before producing canonical outputs.
- **Non-writability of history:** The Standing Engine MUST NOT modify or delete prior Standing Records.

### 20.2 Standing Registry Contract

The Standing Registry is the service that maintains the canonical, immutable record of Standing Records. Its constitutional contract requires:

- **Immutability:** Once a Standing Record is committed, it cannot be modified.
- **Completeness:** The registry retains all Standing Records within the retention window.
- **Accessibility:** Authorized parties can retrieve any Standing Record by subject, type, context, or timestamp.
- **Chain integrity:** The registry preserves and validates the Standing History chain for each subject and standing type.
- **Audit support:** The registry supports reconstruction queries, returning all artifacts necessary to reconstruct standing at any historical timestamp.

### 20.3 Standing Evaluation Service Contract

The Standing Evaluation Service orchestrates the evaluation lifecycle. Its constitutional contract requires:

- **Authorization gate:** It MUST verify governance authorization before beginning evaluation.
- **Input assembly:** It MUST assemble a complete Standing Basis before evaluation begins.
- **Eligibility filtering:** It MUST apply eligibility rules before evaluation.
- **Conflict detection:** It MUST detect and handle input conflicts before aggregation.
- **Explanation generation:** It MUST generate a complete explanation tree as part of evaluation, not as a post-processing step.
- **Event emission:** It MUST emit evaluation events that trigger downstream notifications per the notification protocol.

### 20.4 Standing Governance Service Contract

The Standing Governance Service manages the governance lifecycle of standing rules. Its constitutional contract requires:

- **Rule versioning:** Every rule version is immutable once activated.
- **Approval gating:** No rule takes effect without completing the defined approval process.
- **Conflict detection:** New rules are assessed against existing rules for conflicts before activation.
- **Audit trail:** All governance actions are recorded with full attribution.
- **Challenge support:** The service supports challenge submission and escalation for governance decisions.

### 20.5 Standing Challenge Service Contract

The Standing Challenge Service manages the challenge lifecycle. Its constitutional contract requires:

- **Formal validation:** Challenges are validated for completeness and recognized party status before acceptance.
- **Conflict-of-interest check:** Challenge reviewers are assessed for conflicts before assignment.
- **Timeline enforcement:** Defined timelines for challenge review and resolution are tracked and enforced.
- **Resolution binding:** Sustained challenges produce binding correction instructions to the Standing Engine.
- **Appeal pathway:** Rejected challenges may be escalated through defined appeal pathways.
- **Record preservation:** All challenge records are preserved in the Standing History.

### 20.6 Standing Reconstruction Service Contract

The Standing Reconstruction Service produces verified historical standing states. Its constitutional contract requires:

- **Artifact retrieval:** It retrieves all canonical artifacts necessary for reconstruction at any requested timestamp.
- **Deterministic replay:** It executes the evaluation algorithm for the retrieved inputs and policy/algorithm versions.
- **Consistency verification:** It verifies that the reconstructed output matches the archived Standing Record.
- **Anomaly reporting:** Reconstruction discrepancies are flagged and submitted to governance review.
- **Non-modification:** Reconstruction never modifies the historical record.

### 20.7 Standing Audit Service Contract

The Standing Audit Service supports independent audit of the Standing Engine and its outputs. Its constitutional contract requires:

- **Complete access:** Authorized auditors have access to all Standing Records, Standing Basis records, governance records, and challenge records within the scope of their audit mandate.
- **Query support:** The service supports queries by subject, standing type, context, timestamp, policy version, algorithm version, and authority.
- **Export support:** The service can produce audit-ready exports with full provenance.
- **Independence guarantee:** The audit service operates independently of the evaluation service; auditors do not have modification access.
- **Anomaly escalation:** Audit findings are reported through recognized governance channels.

---

## 21. Relationship with RFC-001 Identity Layer

### 21.1 The Constitutional Chain

```text
Identity (RFC-001)
    ↓
Evidence (RFC-004)
    ↓
Claim (RFC-005)
    ↓
Standing (RFC-005-H2)
    ↓
Capability (RFC-005-H7)
    ↓
Authority (RFC-005-H8)
```

Each layer in this chain presupposes and depends upon the layer beneath it. Standing cannot exist without a stable identity reference. A subject must first be identifiable before its recognized state can be evaluated.

### 21.2 How Standing Depends on Identity without Confusing with It

**Dependency:** The Standing Subject MUST be associated with an identity reference governed by RFC-001. The identity reference must be in a valid state — not Invalid, not Compromised without recovery, not Archived — before standing evaluation proceeds. The Standing Engine MUST verify identity state as a precondition for every evaluation. Identity state changes MUST trigger standing re-evaluation.

**Independence:** Identity is stable regardless of standing. A subject's identity persists when its standing expires, is suspended, or is revoked. The historical standing record is associated with the identity reference but does not alter it. A new standing evaluation can be initiated for a subject whose standing was revoked, using the same identity reference. Identity does not depend on standing; standing depends on identity.

**Non-conflation:** It would be a constitutional error to treat a revoked standing state as evidence of identity invalidity, or to treat a strong standing state as evidence of identity assurance beyond what RFC-001 validates. Identity assurance levels are governed by RFC-001's verification model, not by standing states.

### 21.3 What Identity Provides to Standing

RFC-001 provides to Standing:

- a stable, resolvable subject reference;
- the identity's current lifecycle state;
- the identity's verification level;
- the identity's delegation relationships;
- the identity's recovery history;
- the identity's associated evidence and claims at the identity layer.

### 21.4 What Standing Provides Back to Identity

Standing does not modify Identity. However, standing records may serve as evidence in identity-adjacent processes, such as identity recovery (prior active standing may support an identity recovery claim) or identity verification escalation.

---

## 22. Relationship with Authority

### 22.1 Why Authority Cannot Emerge Directly from Identity

A constitutional chain connects Identity to Authority, but the connection is indirect, mediated, and conditional. The direct path `Identity → Authority` is constitutionally prohibited because:

- Identity answers only *who or what is this subject?* — it carries no inherent operational qualification.
- Authority requires demonstrated competence, recognized standing, bounded capability, and governance authorization — none of which are asserted by Identity alone.
- If Identity directly granted Authority, the destruction or capture of identity management systems would translate into the destruction or capture of governance authority — a catastrophic constitutional coupling.

The canonical chain is:

```text
Identity
    ↓
Evidence (RFC-004)
    ↓
Claims (RFC-005)
    ↓
Standing (RFC-005-H2) ← HERE
    ↓
Capability (RFC-005-H7)
    ↓
Authority (RFC-005-H8)
    ↓
Decision
```

### 22.2 Standing's Role in the Authority Chain

Standing is the constitutional bridge between the Claims Layer and the Capability Layer. It answers: *given the claims that have been verified about this subject, in this context, under this policy, what is the subject's recognized protocol state?*

Capability engines consume standing. They do not consume Identity or raw Evidence directly. This ensures that capability derivation always requires:

- a formally issued, verified standing determination;
- an explicit standing context;
- a policy-governed capability mapping;
- governance authorization.

### 22.3 Why Standing Alone Does Not Grant Authority

Even full Active standing does not constitute Authority. Authority, governed by RFC-005-H8, requires:

- a bounded Capability grant (governed by RFC-005-H7);
- an explicit authorization process;
- a decision record;
- scope constraints;
- accountability mechanisms.

Standing informs all of these but constitutes none of them. A subject with the highest possible standing must still traverse the Capability and Authority layers to exercise governance power, take authorized actions, or make binding decisions.

### 22.4 The Constitutional Necessity of This Design

This design prevents three categories of constitutional failure:

1. **Identity-to-Authority collapse:** Where merely being identified grants operational power. This is the design of credential-based access control systems that conflate identity with authorization. AOC's constitutional chain prevents this.

2. **Standing-to-Authority collapse:** Where a high standing score directly triggers governance privileges. This is prevented by requiring the Capability and Authority layers to interpose their own governed processes.

3. **Capability-to-Authority collapse:** Where a capability grant is itself treated as an authority mandate without requiring an explicit decision record. RFC-005-H8 addresses this; the Standing layer's design supports it by maintaining clear layer separation.

---

## 23. Constitutional Compliance Matrix

| Constitutional Principle | Standing Mechanism | Constitutional Requirement |
|---|---|---|
| **Supremacy** | Standing rules derive from Charter; no standing rule may override Charter rights | Any rule inconsistent with the Charter is void; charter supremacy is enforced at the rule definition stage |
| **Legitimacy** | Standing is produced only by authorized evaluators under authorized policies and algorithms | Unauthorized evaluations produce Invalid records |
| **Consent** | Evidence obtained without appropriate consent is excluded from Standing Basis | Consent state is a mandatory input filter |
| **Delegation** | Standing delegation is traceable, bounded, and revocable; delegated standing cannot exceed the delegating principal's standing | Delegation instruments are mandatory inputs; ceiling enforcement is algorithmic |
| **Limitation** | Standing is bounded by its context; it does not grant capability, authority, or access | Standing MUST NOT be consumed as a permission grant; capability engines interpose |
| **Revocabilidad** | Every standing state is revocable; revocation is terminal for the record, not for the subject | Revocation algorithm produces terminal state; future standing requires new evaluation |
| **Supervisión** | Authorized governance bodies, auditors, and subjects may inspect standing records, rules, and processes | Standing records, governance records, and audit trails are open to recognized supervisors |
| **Accountability** | Every standing outcome is attributed to an authority, a policy, an algorithm, and an evaluation process | Authority attribution is mandatory in every Standing Record |
| **Transparencia** | Standing evaluation rules, inputs, outputs, and explanations are inspectable by authorized parties | Opaque evaluation is constitutionally prohibited |
| **Impugnación** | Every standing determination may be challenged; challenge types cover evidence, claims, verifications, delegation, rules, and authority | Challenge service is a mandatory component of the Standing Engine |
| **Continuidad** | Standing history is preserved within the retention window; reconstruction is guaranteed | Historical preservation and reconstruction capability are constitutional requirements |
| **Anti-Captura** | No single actor controls rule-making, evaluation, challenge review, and audit; concentration is monitored | Governance distribution requirements, conflict-of-interest controls, and concentration monitoring |

---

## 24. Standing Taxonomy

StandingType is the protocol-recognized category of standing being computed. Each StandingType defines the semantic family of the interpretation.

| StandingType | Constitutional Meaning |
|---|---|
| **Identity Standing** | Evaluation of whether the subject's identity evidence, identity claims, and verification state support a recognized identity assurance level. Governed in conjunction with RFC-001. |
| **Trust Standing** | Evaluation of whether the subject satisfies the trust requirements for a defined relationship, domain, or risk context. |
| **Compliance Standing** | Evaluation of whether a subject, process, artifact, or organization satisfies applicable policy, legal, regulatory, or governance controls. |
| **Operational Standing** | Evaluation of runtime, project, process, service, or execution health relative to defined standards. |
| **Capability Standing** | Evaluation of whether standing evidence and claims may support capability derivation under policy. Pre-condition assessment for RFC-005-H7. |
| **Governance Standing** | Evaluation of governance participation eligibility, delegation mandate, quorum contribution, review authority, approval eligibility, or decision-readiness. |
| **Reputation Standing** | Evaluation of reputation-relevant evidence under explicit protocol rules. MUST NOT collapse into an opaque or mutable reputation score. |
| **Project Standing** | Evaluation of project health, delivery readiness, PMO confidence, risk posture, or execution maturity. |
| **Vendor Standing** | Evaluation of vendor trustworthiness, onboarding readiness, contract performance, risk posture, or renewal eligibility. |
| **Professional Standing** | Evaluation of professional qualification, credential relevance, employment eligibility, certification state, or role-specific readiness. |
| **AI Agent Standing** | Evaluation of AI agent operational trust, safe execution readiness, runtime compliance, supervision sufficiency, and delegated action readiness under an applicable risk tier. |

Extensions MUST preserve determinism, explainability, reproducibility, challenge awareness, policy awareness, context awareness, and traceability.

---

## 25. Standing Decay

### 25.1 Constitutional Basis for Decay

Decay is not punishment. Decay is the constitutional recognition that evidence loses relevance over time, that claims become outdated, that the world changes, and that standing must remain grounded in current evidentiary reality. A standing system without decay would progressively lose its connection to ground truth, producing recognition states that no longer reflect the subject's actual status.

### 25.2 Evidence Decay

Evidence items governed by RFC-004 lose relevance as they age. A five-year-old employment record may remain authentic and verifiable while providing weak support for current professional standing. Policy defines evidence decay schedules, lookback windows, and recency requirements by evidence type and standing context.

Evidence Decay MUST be distinguished from evidence invalidation. Decay changes relevance and weight; invalidation changes usability or truth status.

### 25.3 Standing Decay

When the evidence underlying a standing determination decays, the standing itself decays. Standing Decay changes the confidence or state of a standing record over time, even without new events. Decay MUST be computed, not manually applied, and MUST be disclosed in the explanation tree.

### 25.4 Decay Functions

Decay functions are deterministic rules that reduce contribution, confidence, eligibility, or state support over time. Every decay function MUST be versioned through AlgorithmVersion or PolicyContext. Decay functions MUST be reproducible for any historical timestamp within the reconstruction window.

### 25.5 Policy-Driven Decay

PolicyContext defines whether decay applies, which evidence or claim types decay, the time basis, the decay schedule, the thresholds, the renewal conditions, and the challenge effects. Standing Decay without explicit policy definition is arbitrary and non-conformant.

---

## 26. Standing Simulation

### 26.1 Purpose of Simulation

StandingSimulation is a non-canonical what-if analysis enabling governance bodies, evaluators, subjects, and policy designers to explore hypothetical standing outcomes without affecting canonical standing records.

Simulation supports: policy impact analysis, algorithm migration analysis, challenge outcome projection, decay planning, capability risk analysis, and subject self-assessment.

### 26.2 Simulation Requirements

- Simulation MUST NOT modify canonical standing records, evidence lifecycle states, claim states, or governance records.
- Simulation outputs MUST be labeled as simulation and MUST NOT be consumed by capability engines as canonical standing.
- Simulation MUST identify: the hypothetical changes, the baseline Standing Record, the simulated Context, Policy, and Algorithm, and the differences from canonical standing.
- Simulation results MUST be preserved as simulation artifacts, separate from the canonical Standing Registry.

---

## 27. Security Implications

The Standing Engine is a high-value target for manipulation because standing states influence capability decisions, authority derivation, and governance processes. The following security requirements are constitutional.

| Threat | Constitutional Countermeasure |
|---|---|
| **Direct manipulation** | Standing states are computed, not edited; the evaluation chain is the only authorized path to standing change |
| **Gaming** | Independence requirements, authority filters, and recency requirements prevent optimization of superficial signals |
| **Reputation inflation** | Evidence-derivation requirement, issuer independence rules, and self-attestation disclosure prevent inflation |
| **Evidence laundering** | Source authority validation, lineage inspection, and authority chain requirements prevent laundering |
| **Sybil attacks** | Issuer independence evaluation, subject uniqueness assessment, and relationship graph analysis mitigate Sybil attacks |
| **Fake authority** | Authority context validation, recognized authority registries, and authority chain tracing exclude fake authority |
| **Stale evidence** | Decay functions, recency requirements, and temporal attribution prevent stale evidence from silently inflating standing |
| **Context abuse** | StandingContext isolation prevents cross-context laundering |
| **Policy abuse** | Policy versioning, approval requirements, material change review, and policy challenge processes prevent policy abuse |
| **Algorithm abuse** | Algorithm versioning, approval requirements, comparative delta analysis, and algorithm challenge processes prevent algorithm abuse |

---

## 28. Future RFC Dependencies

| Future RFC | Scope |
|---|---|
| RFC-005-H3 Standing Governance | Governance roles, algorithm approval, policy approval, standing type registration, challenge review, administrative authority, standing oversight |
| RFC-005-H4 Capability Mapping | How capability engines consume standing; how standing states map to capability decisions; how capabilities remain bounded, explainable, and traceable |
| RFC-005-H5 Delegated Standing | How standing is delegated, inherited, constrained, scoped, revoked, or transferred across principals, organizations, teams, AI agents, projects, and policy objects |
| RFC-005-H6 Standing Algorithms | Algorithm requirements, versioning, deterministic evaluation patterns, decay functions, aggregation models, migration analysis, and algorithm audit |
| RFC-005-H7 Capability Engine | How the Capability Engine is constituted and bounded; Standing is a primary input |
| RFC-005-H8 Authority Model | How Authority is constituted from Capability, with Standing as a foundational precondition |
| RFC-005-H9 Decision Framework | How decisions are made under Authority, with Standing as a traceable precondition |

Future RFCs MUST preserve the boundary: Standing is derived interpretation. It is not evidence, not claim, not score, not reputation, and not capability.

---

## 29. Open Questions

The following questions are identified but not resolved. They are documented here to guide future RFC work and governance deliberation.

1. **Temporal precision:** At what granularity should standing timestamps be defined — epoch seconds, milliseconds, logical event order? The answer affects reconstruction determinism in distributed environments.

2. **Cross-domain standing interoperability:** When a standing determination produced under one domain's governance is consumed by another domain's capability engine, what re-evaluation or attestation requirements apply?

3. **AI agent standing autonomy bounds:** At what level of AI agent standing does the protocol recognize reduced human oversight requirements, and what governance process determines those thresholds?

4. **Standing reciprocity:** When two institutions each hold each other's standing determinations, how are conflicts between their mutual evaluations resolved?

5. **Delegation depth limits:** Should delegation chains be limited to a fixed depth (e.g., no more than two levels of sub-delegation), and if so, who governs the limit?

6. **Retention window governance:** What is the default retention window for standing history, and who has authority to extend or reduce it for specific standing types or jurisdictions?

7. **Standing portability across governance regimes:** When a subject moves from one governance regime to another (e.g., different jurisdictions), how is prior standing ported, re-evaluated, or recognized?

8. **Standing during identity transition:** When a subject undergoes identity recovery per RFC-001, what is the precise mechanism for associating historical standing records with the recovered identity?

9. **Simulation governance:** Who may authorize standing simulations for subjects who have not consented to simulation, and under what conditions (e.g., anonymous, aggregate-only)?

10. **Standing aggregation across subjects:** When capability decisions depend on the aggregate standing of multiple subjects (e.g., a team's collective standing), what governance rules apply to aggregation?

11. **Standing in emergency governance:** What standing rules apply when the normal governance process is suspended due to emergency conditions, and who authorizes emergency standing determinations?

12. **Minimum viable standing for AI governance:** What minimum standing requirements should apply to AI agents participating in governance processes, and how are they verified?

13. **Standing and data minimization:** When standing evaluation requires access to sensitive personal data, what minimization, anonymization, or privacy-preserving techniques are constitutionally permitted without sacrificing determinism?

14. **Standing for governance bodies themselves:** Should governance bodies that exercise authority over the Standing Engine be subject to their own standing requirements? If so, what Standing Type governs them?

---

## 30. Conformance

A Standing Engine implementation is conformant with RFC-005-H2 if and only if it satisfies all MUST requirements in this document, does not violate any constitutional invariant in Section 17, and does not violate any anti-capture requirement in Section 18.

Conformance is evaluated against the constitutional layer, not the implementation layer. An implementation may choose any technology stack, persistence model, programming language, or deployment architecture, provided that the constitutional contracts defined in Section 20 are satisfied.

Partial conformance is not conformance. An implementation that satisfies 59 of the 60 constitutional invariants is constitutionally defective. Waivers require explicit governance authorization and MUST be documented in the governance record.

---

## 31. Glossary

| Term | Definition |
|---|---|
| **AlgorithmVersion** | The exact, immutable, versioned specification of the evaluation logic applied by the Standing Engine to produce a standing outcome. |
| **Canonical Standing** | A standing record produced through the full, authorized evaluation lifecycle and stored in the Standing Registry. Distinguished from simulation outputs. |
| **Challenge** | A formal, governed process by which a recognized party contests a standing determination, an underlying input, or a governance rule. |
| **Claim** | A formal assertion about a subject, governed by RFC-005, supported by evidence, subject to attestation and verification, and carrying its own claim standing state. |
| **Evidence** | An observed or attested fact, governed by RFC-004, carrying provenance, authority attribution, lifecycle state, and verification records. |
| **PolicyContext** | The explicit, versioned governance, compliance, or operational policy under which standing is evaluated. Defines eligibility rules, thresholds, decay, challenge handling, and output semantics. |
| **Standing** | A deterministic, explainable, reproducible, challenge-aware, policy-aware, context-aware protocol state representing the current recognized status of a subject for a defined purpose. |
| **Standing Basis** | The structured record of all inputs considered in a standing evaluation, with inclusion and exclusion rationales. |
| **Standing Context** | The explicit, mandatory frame defining the domain, purpose, subject, risk tier, and policy scope of a standing evaluation. |
| **Standing Decay** | The change in standing state or confidence caused by the aging of underlying evidence, claims, or policy relevance over time. |
| **Standing Engine** | The deterministic evaluation system that transforms evidence, claims, context, policy, and algorithm into standing states. |
| **Standing History** | The ordered, immutable chain of Standing Records for a subject and standing type, from genesis to the present. |
| **Standing Outcome** | The standing state and confidence produced by a Standing Evaluation, bounded by the Standing Context that produced it. |
| **Standing Record** | The canonical, immutable representation of a standing determination for a subject at a specific moment. |
| **Standing Reconstruction** | The process of deterministically reproducing the standing state of a subject at a historical timestamp using preserved artifacts. |
| **Standing Subject** | The protocol-recognized principal to which standing belongs. |
| **Standing Type** | The category of standing being evaluated: Identity, Trust, Compliance, Operational, Capability, Governance, Reputation, Project, Vendor, Professional, or AI Agent. |
| **StandingSimulation** | A non-canonical what-if analysis. MUST NOT be consumed as canonical standing. |

---

## Conclusion

RFC-005-H2 establishes the Standing Engine as the constitutional instrument of the Standing Layer in the AOC Protocol. Standing is the bridge between the formal claims that describe a subject and the capabilities that may be granted to that subject. It is the layer at which the protocol asks its most important interpretive question: *given everything we can verify, what is the recognized state of this subject for this purpose, right now?*

Standing is not identity. Identity is governed by RFC-001 and precedes standing. Standing is not authority. Authority is governed by RFC-005-H8 and follows from standing through the Capability Layer. Standing is not capability. Capability is governed by RFC-005-H7 and requires standing as an input but standing alone is never sufficient.

Standing is evidence-derived, claim-mediated, context-bound, policy-governed, deterministic, explainable, contestable, revocable, temporal, reconstructable, and governed. Every one of these properties is constitutional. Every one of them is enforceable through the invariants defined in this RFC. And every one of them is necessary to prevent standing from becoming the kind of opaque, manipulable, unaccountable administrative label that would corrupt the integrity of the entire AOC constitutional chain.

```text
Standing = Evaluate(
  ClaimSet, EvidenceSet, AttestationSet, VerificationSet,
  HistoricalStanding, DelegationState, IdentityState, ChallengeState,
  PolicyContext, AlgorithmVersion, StandingContext
)
```

This is the constitutional function of the Standing Engine. Everything in this RFC defines what it means for this function to be executed legitimately, transparently, accountably, and in service of the constitutional principles the AOC Charter demands.
