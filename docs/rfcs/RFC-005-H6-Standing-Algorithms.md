# RFC-005-H6 — Standing Algorithms

| Field | Value |
|---|---|
| RFC Number | 005-H6 |
| Title | Standing Algorithms |
| Status | Draft |
| Category | Core Protocol Extension |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-03 |
| Supersedes | — |
| Related | RFC-004 Evidence Layer v1.0, RFC-005 AOC Claims Framework, RFC-005-H1 Standing Traceability, RFC-005-H2 Standing Engine, RFC-005-H3 Standing Governance, RFC-005-H4 Capability Mapping, RFC-005-H5 Delegated Standing, RFC-005-H8 Authority Model, RFC-005-H9 Decision Framework |

---

## Abstract

This document defines Standing Algorithms for the AOC Protocol. A Standing Algorithm is a deterministic evaluation model that transforms evidence and claims into standing states under explicit context, policy, and version governance. Standing Algorithms define how evidence and claims are evaluated, how weights are applied, how confidence is produced, how standing decays, how standing evolves, and how standing remains explainable, auditable, and reproducible.

Standing Algorithms govern evaluation. They do not govern truth. Evidence remains the source of truth. Algorithms are the governed mechanism by which that truth is transformed into standing state under policy.

The protocol MUST reject black-box reputation systems. Every Standing Algorithm MUST produce results that are deterministic, explainable, auditable, reproducible, challengeable, and policy-governed.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Standing Algorithm Definition](#3-standing-algorithm-definition)
4. [Standing Algorithm Principles](#4-standing-algorithm-principles)
5. [Standing Inputs](#5-standing-inputs)
6. [Standing Outputs](#6-standing-outputs)
7. [Standing Profiles](#7-standing-profiles)
8. [Standing Dimensions](#8-standing-dimensions)
9. [Standing Composition](#9-standing-composition)
10. [Standing Confidence](#10-standing-confidence)
11. [Evidence Weighting](#11-evidence-weighting)
12. [Claim Weighting](#12-claim-weighting)
13. [Standing Decay](#13-standing-decay)
14. [Standing Recalculation](#14-standing-recalculation)
15. [Standing Simulation](#15-standing-simulation)
16. [Standing Explanation](#16-standing-explanation)
17. [Standing Challenges](#17-standing-challenges)
18. [Standing Governance](#18-standing-governance)
19. [Algorithm Versioning](#19-algorithm-versioning)
20. [Algorithm Registry](#20-algorithm-registry)
21. [Standing Guarantees](#21-standing-guarantees)
22. [Security Implications](#22-security-implications)
23. [Standing vs Reputation](#23-standing-vs-reputation)
24. [Standing vs Scoring](#24-standing-vs-scoring)
25. [Standing Registry Model](#25-standing-registry-model)
26. [Implementation Guidance](#26-implementation-guidance)
27. [Future RFC Dependencies](#27-future-rfc-dependencies)
28. [Acceptance Criteria](#28-acceptance-criteria)

---

## 1. Executive Summary

Standing Algorithms define how evidence and claims are transformed into standing states.

The AOC Protocol requires that standing be derived — never manually assigned, never manually edited. Standing emerges from evidence and claims evaluated under policy. But evidence and claims do not speak standing directly. A governed, versioned, deterministic evaluation model is required to perform that transformation. That model is a Standing Algorithm.

The Standing Algorithm occupies a specific architectural position in the AOC constitutional chain:

```text
Evidence
  ↓
Claims
  ↓
Standing Algorithms   ← This RFC
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

Standing Algorithms govern evaluation, not truth. Evidence remains the source of truth. A Standing Algorithm interprets that truth under policy and context to produce a standing state. The algorithm does not determine what facts are true. The algorithm determines what those facts mean for standing, in a defined context, under a specific version of evaluation logic.

This RFC establishes Standing Profile, Standing Dimension, Composite Standing, and AlgorithmVersion as first-class protocol concepts. It defines how evidence weighting, claim weighting, decay, and confidence are governed. It introduces the critical architectural question of whether Standing Algorithms should consume Evidence + Claims or Claims only. It establishes that all standing computation is explainable, traceable, reproducible, and challengeable.

The protocol MUST reject any standing model that cannot answer:

- What inputs were evaluated?
- What weights were applied?
- What policy governed evaluation?
- What algorithm version produced the result?
- What confidence is assigned and why?
- How can the result be reproduced?
- How can the result be challenged?

---

## 2. Problem Statement

### 2.1 Standing Without Algorithms Is Arbitrary

Without formal algorithms, standing becomes a matter of administrative judgment. An operator sets a value. A background process updates a score. A human reviewer changes a label. Each change carries no formal derivation, no policy basis, no reproducible logic. The result is standing that is arbitrary, inconsistent, non-reproducible, and vulnerable to manipulation.

Arbitrary standing MUST NOT participate in capability derivation, authority recognition, or consequential decisions.

### 2.2 Inconsistency Across Evaluations

Without a versioned, governed algorithm, the same evidence and claims evaluated at different times, by different systems, or under different undocumented assumptions may produce different standing. This inconsistency is not merely inconvenient — it is a protocol failure. A standing state that cannot be reproduced cannot be audited. A standing state that cannot be audited cannot safely support authority.

### 2.3 Non-Reproducibility

Historical standing states must be reconstructable. Regulatory inquiries, legal disputes, governance challenges, and audit reviews frequently require the ability to prove what standing was at a specific historical moment and why. Without algorithm versioning, input preservation, and deterministic computation, historical reconstruction is impossible.

### 2.4 Vulnerability to Manipulation

Without formal algorithms, standing is editable. An administrator can alter it. A background process can silently change it. A policy update can retroactively shift it without explanation. A favored subject can receive elevated standing through opaque mechanisms. These are protocol violations, but without formal algorithms they are often undetectable.

### 2.5 Non-Explainability

Standing that participates in authority must be explainable. A subject whose capability is denied because of standing must be able to understand why. An auditor reviewing a past decision must be able to trace how standing was produced. A governance reviewer evaluating a challenge must be able to inspect the full evaluation path. Without formal algorithms, explainability is impossible.

### 2.6 The Need for Deterministic Standing Computation

The AOC Protocol requires:

```text
Standing = f(Evidence, Claims, Context, Policy, AlgorithmVersion)
```

This formula is deterministic, governed, explainable, and reproducible. It is the foundational requirement that RFC-005-H6 exists to satisfy.

---

## 3. Standing Algorithm Definition

### 3.1 Canonical Definition

A **Standing Algorithm** is a deterministic evaluation model that transforms evidence and claims into standing states under explicit context, policy, and version governance.

A Standing Algorithm MUST:

- Produce the same output for the same input, context, policy, and version.
- Document all evaluation logic, including filtering rules, eligibility rules, weighting logic, decay functions, aggregation logic, and output mappings.
- Carry a unique, immutable version identifier.
- Be approved through a governance process before use in canonical standing computation.
- Be auditable: every output must be traceable back to the algorithm version that produced it.

### 3.2 Formal Model

```text
Standing = f(
  EvidenceSet,
  ClaimSet,
  StandingContext,
  PolicyContext,
  AlgorithmVersion
)
```

Where:

- `EvidenceSet` is the set of evidence items considered for evaluation, including lifecycle states, authority context, verification records, and challenges.
- `ClaimSet` is the set of formal claims about the subject, including claim type, issuer, verification status, challenge state, and temporal bounds.
- `StandingContext` is the domain, purpose, risk tier, jurisdiction, and subject context defining what the standing output means.
- `PolicyContext` is the versioned governance and compliance policy that governs eligibility, weighting, decay, thresholds, and output mappings.
- `AlgorithmVersion` is the exact version of the evaluation logic applied.

The output is a `StandingState`, accompanied by `StandingConfidence`, `StandingExplanation`, and a `StandingSnapshot`.

### 3.3 Evidence → Claims → Standing: The Input Layer Architecture

The relationship between evidence, claims, and the Standing Algorithm input layer is one of the most important architectural questions in the protocol. This RFC defines the canonical model and formally documents the tradeoffs in the architectural consideration below.

#### 3.3.1 The Canonical Model

In the AOC constitutional chain:

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
```

Claims are the formal layer produced from evidence through assertion, attestation, and verification. Claims carry structured, protocol-normalized meaning. Evidence carries raw, artifact-level provenance.

A Standing Algorithm SHOULD treat Claims as its primary input layer. Evidence serves as the underlying source of truth that is already expressed through claims. The claim is the formalized protocol-level statement that the algorithm operates on.

#### 3.3.2 Architectural Consideration: Claims Only vs. Evidence + Claims

The protocol MUST formally recognize the following architectural tradeoff:

**Option A: Claims Only Input**

The Standing Algorithm consumes the ClaimSet only. Evidence has already been interpreted, attested, verified, and expressed through claims. The algorithm does not re-evaluate raw evidence — it evaluates the protocol-level claim representations of that evidence.

Advantages:
- Clean architectural separation between evidence evaluation and standing evaluation.
- Avoids duplicating evidence evaluation logic that already exists in the attestation and verification layers.
- Claims carry normalized, versioned semantics that algorithms can evaluate consistently.
- Simpler algorithm inputs reduce the surface for inconsistency and manipulation.

Disadvantages:
- If claim quality degrades (e.g., claims are too coarsely specified), the algorithm cannot compensate by examining evidence directly.
- The algorithm must trust that claim evaluation was complete and accurate; it cannot independently re-evaluate evidence authority, provenance, or verification quality.
- Standing Algorithms cannot directly weight evidence by source authority, recency, or independence unless claims carry that metadata.

**Option B: Evidence + Claims Input**

The Standing Algorithm consumes both the EvidenceSet and the ClaimSet. It may evaluate evidence directly for properties not yet expressed through claims, such as evidence source authority, evidence recency, evidence independence, and verification depth.

Advantages:
- Richer evaluation: the algorithm can directly assess evidence quality, source diversity, independence, and temporal attributes.
- Reduces reliance on claim quality as a bottleneck.
- Allows algorithms to apply granular evidence-level weighting without requiring claims to carry all evidence metadata.

Disadvantages:
- Risk of duplicating evaluation logic that belongs in the attestation and verification layers.
- Increases algorithm complexity, making explainability and governance harder.
- Conflates distinct constitutional layers, potentially undermining the separation of concerns that the AOC chain is designed to preserve.

**Protocol Position:**

This RFC does not require a definitive resolution. Both models are architecturally coherent. Implementations MUST explicitly document which input model their Standing Algorithm uses, and why. Domain-specific algorithms MAY use either model, provided they satisfy all other requirements of this RFC.

The preferred default for new algorithm designs is Option A, with claims carrying sufficient metadata — including evidence authority, verification depth, source classification, and temporal attributes — to support algorithm-level weighting without requiring direct evidence re-evaluation.

Duplication of logic MUST be avoided. If evidence evaluation logic belongs in the attestation and verification layers, it MUST NOT be re-implemented inside Standing Algorithms. This creates fragmentation, inconsistency, and governance failure points.

---

## 4. Standing Algorithm Principles

The following principles are normative for all Standing Algorithms conformant with this RFC. No approved algorithm may violate these principles.

### P-SA1: Determinism

A Standing Algorithm MUST produce the same output for the same inputs, context, policy, and version. Two evaluations of the same subject with the same EvidenceSet, ClaimSet, StandingContext, PolicyContext, and AlgorithmVersion MUST produce identical outputs. Randomness, undocumented heuristics, and non-reproducible logic are prohibited.

### P-SA2: Explainability

A Standing Algorithm MUST produce outputs that are fully explainable. Every standing output MUST identify which inputs were evaluated, how each input contributed, what policy rules were applied, what weights or rules affected the result, what confidence was assigned and why, and what algorithmic logic produced the final standing state. An algorithm whose behavior cannot be explained is not conformant.

### P-SA3: Traceability

Every output produced by a Standing Algorithm MUST be traceable to the exact inputs, policy context, and algorithm version that produced it. Traceability MUST satisfy the requirements of RFC-005-H1 Standing Traceability. An algorithm that produces standing outputs without traceable provenance is not conformant.

### P-SA4: Reproducibility

Any historical standing output MUST be reproducible by providing the same inputs, context, policy, and algorithm version as were used at the original computation time. Conformant implementations MUST preserve the inputs, versions, and policy references necessary to support historical reproduction. A standing output that cannot be reproduced is non-conformant for audit purposes.

### P-SA5: Challengeability

Standing Algorithms MUST produce outputs that can be meaningfully challenged. This requires that every output expose enough detail for a challenger to identify which inputs, weights, policies, or algorithm logic they are contesting. An algorithm that produces opaque outputs that cannot be meaningfully disputed is not conformant.

### P-SA6: Policy Conformance

Standing Algorithms MUST operate under explicit, versioned policy. All eligibility rules, thresholds, weights, decay functions, challenge handling rules, and output mappings MUST be defined in PolicyContext. An algorithm that applies undocumented rules, hidden thresholds, or non-versioned logic is not conformant.

### P-SA7: Auditability

Standing Algorithms MUST support audit. This means that governance auditors, challenge reviewers, subject representatives, and authorized third parties MUST be able to inspect algorithm behavior, evaluation records, version history, and governance approval provenance. An algorithm that resists audit is not conformant.

### P-SA8: Versionability

Every Standing Algorithm MUST carry a unique, immutable version identifier. Changes to algorithm logic MUST produce a new version. Algorithm versions MUST be registered in the Algorithm Registry with full governance provenance. An algorithm whose version is unknown, ambiguous, or mutable is not conformant for use in canonical standing computation.

---

## 5. Standing Inputs

A Standing Algorithm MUST receive or resolve the following canonical inputs before beginning evaluation.

### 5.1 EvidenceSet

The EvidenceSet is the set of evidence items considered for standing computation. It MUST include:

- evidence identifiers, consistent with RFC-004 Evidence Layer;
- evidence lifecycle states (GENERATED, REGISTERED, VERIFIED, SUPERSEDED, ARCHIVED);
- evidence type and content classification;
- evidence source authority context;
- verification records, including verifier identity, verification time, and verification outcome;
- challenge state for each evidence item;
- temporal metadata including creation time, effective time, verification time, and expiration time.

The EvidenceSet is the raw truth layer. Evidence MUST NOT be treated as equivalent to claims. Evidence is the substrate from which claims are derived.

### 5.2 ClaimSet

The ClaimSet is the set of formal claims about the StandingSubject that may affect standing computation. It MUST include:

- claim type;
- claim subject;
- claim issuer and issuer authority;
- claim value or statement;
- temporal bounds;
- supporting evidence references or assertion references;
- attestation references;
- verification results and verification depth;
- claim standing (Active, Expired, Revoked, Suspended, Superseded, Invalid, Not Yet Active);
- challenge state.

A claim MUST NOT be treated as automatically true merely because it exists. RFC-005 requires that claims be supported, attested, verified, and evaluated for standing before participating in authority.

### 5.3 StandingContext

The StandingContext defines the domain-specific and purpose-specific context under which standing is evaluated. The same EvidenceSet and ClaimSet may produce different standing under different contexts. StandingContext MUST identify:

- standing type;
- standing subject;
- evaluation purpose;
- domain;
- jurisdiction;
- organization or governance scope;
- risk tier;
- evaluation timestamp;
- intended capability mapping context;
- applicable policy family;
- challenge handling mode;
- temporal horizon.

A Standing Algorithm MUST NOT produce canonical standing without StandingContext. Context-free standing is not conformant.

### 5.4 PolicyContext

The PolicyContext is the versioned governance, compliance, and operational policy that governs the algorithm's evaluation logic. It MUST identify:

- policy identifier and version;
- eligibility rules;
- weighting principles;
- decay schedule and decay rules;
- thresholds for standing state transitions;
- challenge handling behavior;
- temporal validity windows;
- required evidence or claim categories;
- exclusion rules;
- output mappings from internal evaluation results to canonical standing states.

A Standing Algorithm MUST apply PolicyContext as the governing document. Undocumented internal rules that are not expressed in PolicyContext are prohibited.

### 5.5 AlgorithmVersion

The AlgorithmVersion is the exact version identifier of the Standing Algorithm being applied. It MUST:

- uniquely identify the algorithm and version;
- be immutable once approved;
- be recorded in every standing output, snapshot, and delta;
- be resolvable in the Algorithm Registry.

### 5.6 Authority Context

The Authority Context identifies the recognized governance and issuing authorities applicable to the evaluation. It informs:

- which evidence sources carry recognized authority;
- which claim issuers are recognized;
- which attesters are recognized;
- which verifiers are recognized;
- which governance approvals are in effect.

Authority Context allows the algorithm to distinguish high-authority evidence from low-authority evidence, recognized attesters from unrecognized attesters, and verified claims from self-asserted claims.

### 5.7 Temporal Context

The Temporal Context defines the evaluation timestamp and temporal parameters that affect eligibility, decay, recency, and validity window evaluation. It MUST identify:

- evaluation timestamp (the point in time as of which standing is being computed);
- lookback windows for evidence and claim recency;
- decay horizon (how far into the future decay projections should apply, when simulation is requested);
- temporal eligibility rules for evidence and claim inclusion.

Temporal Context enables deterministic historical reconstruction. Given the same temporal context, an algorithm MUST produce the same standing output as it produced at the original evaluation time.

---

## 6. Standing Outputs

A Standing Algorithm MUST produce the following canonical outputs.

### 6.1 StandingState

The StandingState is the primary output of standing computation. It expresses the current protocol interpretation of the subject's standing in the defined context. Canonical standing states are defined in RFC-005-H2. Examples include Unknown, Insufficient, Emerging, Verified, Trusted, Highly Trusted, Restricted, Challenged, Under Review, Invalid, Expired, Superseded, and Suspended.

### 6.2 StandingLevel

The StandingLevel is an optional granularity within a StandingState. Where policy defines ordered levels within a state — for example, Trusted Level 1 vs. Trusted Level 2 — StandingLevel expresses that granularity. Levels MUST be defined by policy. An algorithm MUST NOT introduce levels that are not governed by PolicyContext.

### 6.3 StandingConfidence

StandingConfidence is the degree of certainty, assurance, or reliability associated with the StandingState output. Confidence is separate from state. Two evaluations may produce the same StandingState with different confidence values because evidence quality, authority, recency, independence, challenge state, or coverage differs. Section 10 of this RFC defines StandingConfidence in detail.

### 6.4 StandingExplanation

StandingExplanation is the human-readable, machine-readable, and audit-ready explanation of why the StandingState and StandingConfidence exist. It MUST satisfy the explainability requirements of RFC-005-H1 and Section 16 of this RFC.

### 6.5 StandingSnapshot

A StandingSnapshot is an immutable record of standing at a specific timestamp under a specific AlgorithmVersion, PolicyContext, and StandingContext. Snapshots MUST be preserved as historical records. They MUST NOT be overwritten. They MUST satisfy RFC-005-H1 snapshot model requirements.

### 6.6 StandingDelta

A StandingDelta is the structured difference between two StandingSnapshots. It MUST identify which inputs changed, what triggered recomputation, how the standing state or confidence changed, and what the explanation of the change is. Deltas MUST satisfy RFC-005-H1 delta model requirements.

### 6.7 StandingProfile

A StandingProfile is a structured collection of standing outputs across multiple StandingTypes or StandingDimensions for the same subject. Profiles are introduced as a first-class protocol concept in Section 7 of this RFC.

---

## 7. Standing Profiles

### 7.1 The Problem With Single-Dimension Standing

A subject rarely has a single standing. A professional has standing as a project manager, as a compliance officer, as a leader, as a vendor, as an employee. An organization has standing for governance, for financial reliability, for delivery, for regulatory compliance. An AI agent has standing for autonomous execution, for supervised review, for data access, for API interaction.

Computing a single standing value that represents all of these contexts is neither accurate nor useful. Different evidence supports different dimensions. Different policies govern different contexts. Different capabilities depend on different standing types.

The protocol MUST support multi-dimensional standing through the concept of the StandingProfile.

### 7.2 StandingProfile Definition

A **StandingProfile** is a structured collection of standing outputs for a subject across multiple StandingTypes, StandingDimensions, or evaluation contexts.

A StandingProfile does not aggregate standing into a single score. It preserves the independence of each standing dimension, allowing capability engines, authority recognition processes, and decision records to reference the specific standing dimension they actually need.

### 7.3 Example Standing Profiles

| Profile Type | Constituent Standing |
|---|---|
| Professional Standing Profile | Competence Standing + Compliance Standing + Verification Standing |
| Leadership Standing Profile | Governance Maturity Standing + Authority Readiness Standing + Trustworthiness Standing |
| Vendor Standing Profile | Reliability Standing + Compliance Standing + Delivery Standing |
| AI Agent Standing Profile | AI Trust Standing + Operational Readiness Standing + Governance Compliance Standing |
| Compliance Standing Profile | Regulatory Evidence Standing + Audit Readiness Standing + Policy Adherence Standing |

### 7.4 Profile Governance

A StandingProfile definition — which dimensions it contains, how it is structured, what context it applies to — is itself a governance object. StandingProfile definitions MUST be approved by a recognized Governance Authority as defined in RFC-005-H3.

### 7.5 Profile Output

A StandingProfile output MUST include:

- subject identifier;
- profile type and version;
- evaluation timestamp;
- a list of constituent StandingSnapshots, one per dimension;
- a profile-level explanation that identifies how constituent standings relate to each other;
- policy context applicable to the profile as a whole;
- algorithm versions used for each constituent dimension.

A StandingProfile MUST NOT collapse constituent standings into a single opaque aggregate score. The profile preserves dimension-level explainability.

---

## 8. Standing Dimensions

### 8.1 StandingDimension Definition

A **StandingDimension** is a protocol-recognized axis of standing evaluation that represents a distinct, independently evaluable aspect of a subject's standing.

StandingDimensions are evaluated independently. Each dimension has its own EvidenceSet, ClaimSet, PolicyContext, and AlgorithmVersion. Two dimensions for the same subject may produce different standing states and different confidence values.

### 8.2 Canonical StandingDimensions

The following dimensions are canonical starting examples. Implementations MAY define additional dimensions. New dimensions MUST be registered through governance as defined in RFC-005-H3.

| StandingDimension | Meaning |
|---|---|
| Reliability | Consistency and dependability of the subject across evidence of commitments, deliveries, and obligations. |
| Trustworthiness | Evidence of honest behavior, accurate representation, and absence of deception across interactions and relationships. |
| Competence | Evidence of demonstrated capability, qualification, certification, and skill within a defined domain or role. |
| Compliance | Evidence of conformance to applicable legal, regulatory, policy, contractual, or protocol requirements. |
| Verification | Evidence that identity, credentials, relationships, and attestations have been independently confirmed. |
| Consistency | Evidence of stable behavior, coherent decisions, and predictable patterns over time. |
| Authority Readiness | Evidence that the subject satisfies the prerequisites for exercising recognized authority in a defined context. |
| Governance Maturity | Evidence of participation, accountability, challenge engagement, audit responsiveness, and policy adherence within governance frameworks. |

Future dimensions are extensible. An extensible dimension model ensures that standing can grow to cover new subjects, new contexts, new evidence types, and new capability requirements without requiring protocol-level amendments.

---

## 9. Standing Composition

### 9.1 What Is Composite Standing

**Composite Standing** is a standing output produced by combining two or more StandingDimensions or StandingTypes under a defined composition rule.

Composite Standing is a first-class protocol concept. It allows capability engines to reason about whether a subject satisfies a multi-dimensional trust requirement without requiring multiple independent standing lookups.

### 9.2 Composition Examples

| Composition | Constituent Standings | Resulting Composite |
|---|---|---|
| Trusted Contractor Standing | Identity Standing + Professional Standing + Compliance Standing | Trusted Contractor |
| Trusted Vendor Standing | Reliability Standing + Delivery Standing + Governance Standing | Trusted Vendor |
| Certified Professional Standing | Competence Standing + Verification Standing + Authority Readiness Standing | Certified Professional |
| Autonomous AI Agent Standing | AI Trust Standing + Governance Compliance Standing + Operational Readiness Standing | Trusted Autonomous Agent |

### 9.3 Composition Rules

Composition MUST be governed by explicit rules defined in PolicyContext. Composition rules MUST define:

- which constituent standings are required;
- which constituent standings are optional or supplementary;
- the minimum state for each required constituent;
- the minimum confidence for each required constituent;
- how challenge state in any constituent affects the composite;
- how decay in any constituent propagates to the composite;
- how algorithm version changes in any constituent affect the composite;
- the composition algorithm version that governs the aggregation logic.

Composition MUST NOT use opaque aggregation. A composite standing output MUST be explainable by reference to its constituent standings and the composition rules applied.

### 9.4 Composition Is Not Averaging

Composite Standing MUST NOT be produced by averaging constituent standing scores. Averaging destroys dimension-level explainability, hides failures in critical dimensions, and produces non-traceable results.

If a composition requires that all constituents satisfy minimum thresholds, and one constituent fails, the composite MUST reflect that failure — not smooth it with the contributions of passing dimensions.

### 9.5 Compositional Consistency

A Composite Standing output MUST preserve:

- algorithm versions of all constituent computations;
- snapshot references for all constituent outputs;
- the composition rule version used;
- explanation of how each constituent contributed to or constrained the composite;
- delta tracking for changes in any constituent that affect the composite.

---

## 10. Standing Confidence

### 10.1 Confidence as a Separate Concept

StandingConfidence is the degree of reliability, assurance, or certainty associated with a StandingState. Confidence is separate from state. The same state may exist at many confidence levels. The same confidence level may accompany many different states.

Standing and confidence MUST NOT be conflated. A protocol implementation MUST expose both independently.

### 10.2 Confidence Examples

The following examples illustrate how two subjects may share a StandingState at different confidence levels:

```
Subject A:
  StandingState: Trusted
  StandingConfidence: High
  Basis: Multiple verified, independent, recent, high-authority evidence items;
         all claims attested and verified; no challenges; strong coverage.

Subject B:
  StandingState: Trusted
  StandingConfidence: Moderate
  Basis: Minimum threshold satisfied; some evidence is aging; one claim is
         self-attested; limited independent corroboration.
```

Both subjects achieve Trusted standing. The confidence difference reflects the quality, recency, authority, and coverage of the supporting evidence and claims.

### 10.3 Confidence Semantics

Confidence semantics MUST be defined in PolicyContext or AlgorithmVersion. The following semantic categories are suggested as canonical reference points:

| Confidence Level | Meaning |
|---|---|
| High | Strong evidentiary basis; recent, diverse, independently verified, high-authority inputs; no active challenges. |
| Moderate | Adequate evidentiary basis; some limitations in recency, diversity, or authority; no disqualifying challenges. |
| Low | Minimum threshold satisfied; significant limitations in evidence quality, recency, authority, or coverage. |
| Uncertain | Standing state was produced, but significant uncertainty exists due to incomplete evidence, pending challenges, or recent decay. |

Numeric confidence representations are permitted as implementation artifacts. However, the protocol recognizes confidence through these semantic categories. Any numeric representation MUST map to a semantic category.

### 10.4 Uncertainty Handling

A Standing Algorithm MUST explicitly handle uncertainty. Uncertainty arises from:

- insufficient evidence;
- challenged evidence under review;
- stale or decayed evidence;
- low-authority or self-attested evidence;
- incomplete attestation or verification;
- conflicting evidence or claims;
- pending governance events.

When uncertainty is high, a Standing Algorithm MUST:

- report it transparently in StandingConfidence;
- disclose it in StandingExplanation;
- prevent Confident standing states from being produced when evidentiary support is materially insufficient.

A high-uncertainty standing output SHOULD trigger a review flag when consumed by a capability engine for consequential decisions, consistent with RFC-005-H2 standing engine guarantees.

---

## 11. Evidence Weighting

### 11.1 Why Evidence Weight Matters

Not all evidence contributes equally to standing. Evidence differs in authority, verification depth, recency, independence, scope, and regulatory recognition. A Standing Algorithm MUST apply weights that reflect these differences. An algorithm that treats all evidence equally regardless of source, verification, or recency produces inaccurate standing.

Evidence Weight is the relative contribution value assigned to an evidence item by the algorithm under PolicyContext. Weight affects how strongly an evidence item supports or limits a standing state and confidence level.

### 11.2 Weight Principles

Evidence weighting MUST follow the following principles. This RFC does not prescribe exact numeric values. Weighting principles and relative hierarchies MUST be defined in PolicyContext and AlgorithmVersion.

**Higher-weight evidence categories:**

| Evidence Category | Weight Basis |
|---|---|
| Regulatory Evidence | Issued by or recognized under applicable regulatory frameworks; carries legal weight and high issuer authority. |
| Authority-Issued Evidence | Issued by a recognized authority under a formal governance process; traceability is high. |
| Independently Verified Evidence | Verified by an independent third party with recognized authority; reduces self-serving bias. |
| Verified Evidence | Formally verified under RFC-004 Evidence Layer; structural integrity confirmed. |

**Lower-weight evidence categories:**

| Evidence Category | Weight Basis |
|---|---|
| Third-Party Evidence (Unverified) | Provided by a third party but not independently verified; value depends on source authority. |
| Self-Attested Evidence | Provided by the subject themselves without independent attestation; highest susceptibility to gaming; lowest authority. |

**Weight modifiers:**

Weight is not fixed. The following factors MUST be treated as weight modifiers in conformant algorithms:

- **Recency**: More recent evidence carries greater weight for time-sensitive dimensions. Older evidence decays in contribution.
- **Independence**: Evidence from independent, non-affiliated sources carries more weight than evidence from sources with a relationship to the subject.
- **Verification depth**: Evidence verified with higher-assurance methods carries more weight.
- **Challenge state**: Evidence under active challenge MUST carry reduced weight or be excluded, per PolicyContext.
- **Source authority**: Evidence from sources with higher recognized authority carries more weight.

### 11.3 Weighting Must Be Explainable

Every weight assignment MUST be explained in StandingExplanation. A subject challenging standing MUST be able to inspect how each evidence item was weighted and why. A governance reviewer auditing an algorithm MUST be able to verify that weighting conforms to PolicyContext.

---

## 12. Claim Weighting

### 12.1 Why Claim Weight Matters

Claims are formal statements supported by evidence. Not all claims contribute equally to standing. A claim differs in verification status, issuer authority, evidence support depth, challenge state, and recency. Claim Weight is the relative contribution value assigned to a claim by the algorithm under PolicyContext.

### 12.2 Claim Weight Factors

A Standing Algorithm MUST consider the following factors when weighting claims:

| Factor | Effect on Weight |
|---|---|
| Evidence Support | Claims backed by strong, verified, independent evidence carry more weight. Claims with no evidence support carry minimal weight. |
| Authority Support | Claims issued or attested by a recognized, high-authority issuer carry more weight. Claims from self-issuing subjects carry less weight. |
| Verification Status | Verified claims carry more weight than unverified claims. Claims that failed verification carry no positive weight. |
| Challenge Status | Claims under active challenge MUST carry reduced weight or be disclosed as uncertain per PolicyContext. Claims that survived challenge may carry increased weight reflecting confirmed robustness. |
| Recency | Recent claims carry more weight for time-sensitive standing dimensions. Stale claims are subject to decay as defined in Section 13. |

### 12.3 Claim Weight and Evidence Weight Alignment

Claim weighting and evidence weighting MUST be consistent. A claim that is well-attested but whose underlying evidence carries low authority MUST NOT receive high weight purely because of the attestation quality. Weight SHOULD reflect the complete chain: evidence authority, attestation quality, verification depth, and temporal relevance.

---

## 13. Standing Decay

### 13.1 Validity Is Not Relevance

A foundational principle of standing decay is:

```text
Validity ≠ Relevance
```

Evidence or a claim may remain verifiable — structurally authentic, unconflicted, and unexpired — while its relevance to current standing has diminished because time has passed. A certificate issued seven years ago may still be authentic. It may no longer be relevant to current professional standing in a domain where recertification is expected every three years.

Standing Decay captures this distinction. Decay does not invalidate evidence. Decay reduces its contribution to current standing.

### 13.2 Evidence Decay

**Evidence Decay** is the reduction in contribution, relevance, confidence impact, or eligibility of an evidence item due to time, context, policy, recency requirements, or changed conditions.

Evidence Decay examples:

| Evidence | Decay Basis |
|---|---|
| Old employment record | Still authentic; decreasing relevance to current professional standing as tenure ended years ago. |
| Old certification | Still verifiable; diminishing support for competence standing if the domain has evolved or recertification is required. |
| Old project success | Historical delivery record; reduced weight for current operational readiness standing. |
| Old reference or review | Authentic assessment; reduced weight for current reliability or trustworthiness standing. |

Evidence Decay MUST be distinguished from evidence invalidation, expiration, revocation, and supersession:

| Lifecycle Event | Effect |
|---|---|
| Decay | Reduces relevance or weight; evidence remains otherwise valid. |
| Expiration | Evidence passes its defined validity window; may become ineligible. |
| Invalidation | Evidence is found to be false, insufficient, or non-conformant; must be excluded or disclosed. |
| Revocation | Evidence is formally withdrawn by issuer or authority; must be excluded. |
| Supersession | Evidence is replaced by newer evidence; prior version may carry reduced or zero contribution. |

### 13.3 Claim Decay

**Claim Decay** is the reduction in contribution, relevance, or confidence impact of a claim due to elapsed time since issuance, verification, or confirmation.

Claim Decay applies when:

- the claim covers a role, certification, or status that is expected to be renewed or re-verified;
- the policy governing the claim defines a recency window beyond which the claim contributes less;
- the evidence supporting the claim has itself decayed, reducing the claim's evidentiary basis.

### 13.4 Standing Decay

**Standing Decay** is the change in standing state, confidence, or capability relevance caused by the cumulative decay of contributing evidence, claims, authority context, or policy context.

Standing Decay is computed, not manually edited. If decay causes standing to change — for example, because the aggregate confidence falls below a threshold — the Standing Algorithm MUST emit a new StandingSnapshot and StandingDelta when policy requires recomputation.

### 13.5 Decay Functions

Decay functions are deterministic rules that reduce contribution, confidence, eligibility, or state support over time. A decay function MUST:

- be deterministic: given a timestamp, it produces the same decay output;
- be versioned through AlgorithmVersion or PolicyContext;
- be reproducible for any historical timestamp required by RFC-005-H1;
- be explainable: the decay formula, parameters, and effect MUST appear in StandingExplanation.

Decay function forms MAY include:

- time-window-based decay (full weight within a window; reduced weight outside);
- stepwise decay (discrete reductions at defined time intervals);
- threshold-based decay (full weight until a threshold, then disqualification);
- event-triggered decay (decay initiated by an external event rather than solely time);
- policy-driven decay (decay rate controlled by PolicyContext parameters).

No specific numeric decay schedule is prescribed by this RFC. Decay functions MUST be defined in PolicyContext or AlgorithmVersion.

---

## 14. Standing Recalculation

### 14.1 Standing Evolves Through Events, Not Edits

Standing MUST evolve through protocol-recognized events and deterministic recomputation. A Standing Algorithm MUST be triggered by events, not by administrative commands.

### 14.2 Canonical Recalculation Triggers

The following events are canonical triggers for standing recalculation:

| Trigger | Effect |
|---|---|
| Evidence Added | New evidence may support, weaken, or contextualize standing. Algorithm MUST evaluate the updated EvidenceSet. |
| Evidence Removed | Removal of previously included evidence may reduce confidence or change the standing state. |
| Evidence Invalidated | Invalidated evidence MUST be excluded per RFC-005-H1. Standing MUST be recomputed against the updated EvidenceSet. |
| Evidence Expired | Expired evidence MUST affect eligibility and confidence per PolicyContext. |
| Claim Added | New claims may support, challenge, or contextualize standing. |
| Claim Changed | Modified, revoked, suspended, expired, superseded, or invalid claims may change standing. |
| Claim Challenged | A challenge to a claim MUST carry challenge state into the next standing computation. |
| Policy Changed | Policy changes may alter thresholds, eligibility rules, decay functions, or output mappings. |
| Algorithm Changed | A change to AlgorithmVersion requires new computation or explicit migration analysis. |
| Context Changed | A different StandingContext may produce different standing from the same inputs. |
| Delegation Changed | Changes in delegation scope, lifecycle, or revocation affecting the subject may affect standing eligibility inputs. |
| Governance Event | Authorized governance events affecting evidence, claims, policy, challenge state, or algorithm activation MUST trigger recomputation where policy requires. |

### 14.3 Governance Events Are Not Direct Edits

Manual governance events MUST NOT directly edit standing. They MAY create or modify protocol-recognized inputs that cause deterministic recomputation. The standing output is the result of algorithm evaluation, not the governance command itself.

---

## 15. Standing Simulation

### 15.1 Why Simulation Is Necessary

Standing Simulation is a non-canonical what-if analysis that evaluates hypothetical standing under altered inputs, policy, algorithm version, or temporal context. Simulation is necessary for:

- impact analysis before removing evidence;
- policy change planning before activating new policy;
- future decay projection;
- algorithm migration planning before changing algorithm versions;
- challenge review support;
- governance audit preparation;
- capability risk analysis.

### 15.2 Canonical Simulation Types

| Simulation Type | Description |
|---|---|
| Remove Evidence | Evaluates standing if a specific evidence item were excluded. |
| Remove Claim | Evaluates standing if a specific claim were excluded or invalidated. |
| Change Policy | Evaluates standing under a proposed or alternative policy version. |
| Apply Future Decay | Projects standing to a future timestamp, applying decay to current evidence and claims as if that time had elapsed. |
| Alternative Algorithm | Evaluates standing under a different algorithm version to support migration analysis or comparison. |
| Challenge Resolution | Evaluates standing under the assumption that a challenged evidence or claim item is confirmed invalid. |

### 15.3 Simulation MUST NOT Alter Canonical Standing

Simulation outputs MUST be clearly labeled as simulations. A simulation output MUST NOT:

- overwrite StandingSnapshots;
- overwrite StandingDeltas;
- alter evidence lifecycle state;
- alter claim state;
- alter PolicyContext activation;
- alter AlgorithmVersion activation;
- affect capability decisions;
- appear as canonical standing in any governance or authority record.

A StandingSimulation output MUST carry a simulation flag that is visible to all consuming systems. Consuming systems MUST NOT treat simulation outputs as canonical standing.

### 15.4 Simulation Traceability

A StandingSimulation output MUST identify:

- simulation type;
- hypothetical changes applied;
- baseline StandingSnapshot, when applicable;
- simulated StandingContext;
- simulated PolicyContext version;
- simulated AlgorithmVersion;
- simulated timestamp or projection horizon;
- simulated StandingState and StandingConfidence;
- explanation of differences from canonical standing.

---

## 16. Standing Explanation

### 16.1 Explainability Is Constitutional

Explainability is not optional. RFC-005-H1 establishes Standing Traceability as a constitutional requirement. This RFC establishes that the Standing Algorithm is responsible for generating explanation as part of computation, not as a post-processing artifact.

### 16.2 What Every Standing Explanation Must Cover

Every standing output produced by a conformant Standing Algorithm MUST explain:

| Element | Requirement |
|---|---|
| Inputs | Which evidence and claims were evaluated; which were excluded and why. |
| Weighting | How each input was weighted; what weight principles and modifiers were applied. |
| Policies | Which PolicyContext version governed evaluation; which specific rules were applied. |
| Context | Which StandingContext defined the evaluation scope and purpose. |
| Confidence | How StandingConfidence was determined; what factors raised or lowered it. |
| Challenges | Which inputs were under challenge; how challenge state affected computation. |
| Decay | What decay functions were applied; how decay affected specific inputs and confidence. |
| Algorithm Version | Which AlgorithmVersion produced the output; where that version is registered. |
| Prior Snapshot | How the current output compares to the previous StandingSnapshot, where applicable. |

### 16.3 Explanation Forms

As established in RFC-005-H2, standing explanation MUST be produced in three forms:

| Form | Purpose |
|---|---|
| Human Explanation | Concise prose that a subject, reviewer, or governance participant can understand without technical expertise. |
| Machine Explanation | Structured data suitable for automated consumption, capability engine input, and governance systems. |
| Audit Explanation | Full lineage, input references, snapshot links, delta links, dependency graph references, and deterministic rebuild data sufficient for audit and historical reconstruction. |

An unexplained standing output is not conformant.

---

## 17. Standing Challenges

Standing computed by a Standing Algorithm MUST be challengeable. Challengeability is a protocol guarantee, not a product preference.

### 17.1 Algorithm Challenges

An Algorithm Challenge targets the Standing Algorithm itself. It may contest:

- whether the algorithm was properly approved through governance;
- whether the algorithm produces deterministic outputs;
- whether the algorithm logic is consistent with applicable PolicyContext;
- whether an algorithm version was changed without governance authorization;
- whether the algorithm behaves differently from its documented specification.

Algorithm Challenges MUST be filed through the Governance Challenge process defined in RFC-005-H3.

### 17.2 Input Challenges

An Input Challenge targets the inputs provided to the algorithm. It may contest:

- whether specific evidence items were correctly included or excluded;
- whether specific claims were correctly included or excluded;
- whether the EvidenceSet was complete;
- whether the ClaimSet was accurate;
- whether evidence or claim authority was correctly assessed.

### 17.3 Weighting Challenges

A Weighting Challenge targets how specific inputs were weighted. It may contest:

- whether a high-weight evidence category was correctly applied;
- whether a low-weight category was correctly applied;
- whether recency modifiers were correctly applied;
- whether independence assessments were accurate;
- whether decay functions were correctly applied.

### 17.4 Policy Challenges

A Policy Challenge targets the PolicyContext applied to the computation. It may contest:

- whether the correct policy version was applied;
- whether the policy itself is legitimate under RFC-005-H3 governance requirements;
- whether the policy produces outcomes inconsistent with protocol principles.

### 17.5 Standing Output Challenges

A Standing Output Challenge targets the final StandingState or StandingConfidence. It may contest:

- whether the output correctly reflects the inputs under the algorithm logic;
- whether the confidence level is accurately represented;
- whether the explanation accurately describes the computation;
- whether the snapshot correctly records the evaluation.

### 17.6 Challenge Effects

While a challenge is pending, PolicyContext MUST define how the algorithm handles the challenged output. Options include:

- include with challenge disclosure;
- reduce confidence to reflect challenge uncertainty;
- suspend the standing state for high-risk decisions;
- maintain the state pending formal review.

Challenge outcomes MUST be recorded and MUST propagate to affected standing snapshots, deltas, and capability decisions.

---

## 18. Standing Governance

### 18.1 Algorithms Are Governance Objects

A Standing Algorithm is a Governance Object as defined in RFC-005-H3. It requires recognized governance authority for creation, approval, activation, modification, retirement, and challenge. This section summarizes governance requirements specific to Standing Algorithms.

### 18.2 Who Approves Algorithms

A Standing Algorithm MUST be approved by a recognized Algorithm Reviewer or Governance Body with authority over the algorithm's domain, consistent with RFC-005-H3 Section 11. Self-approval is prohibited. The approver MUST be distinct from the Algorithm Author.

### 18.3 Who Retires Algorithms

A Standing Algorithm MAY be retired by:

- the Governance Body that approved it;
- a higher-order Governance Authority with authority over the algorithm's domain.

Retirement MUST NOT invalidate historical standing snapshots computed under the retired algorithm. Historical snapshots remain valid records produced under the algorithm version in effect at the time.

### 18.4 Who Reviews Algorithms

Algorithm review is the responsibility of recognized Algorithm Reviewers as defined in RFC-005-H3. Reviews evaluate determinism, reproducibility, explainability, policy consistency, and domain appropriateness. Algorithm Reviewers MUST have no conflict of interest.

### 18.5 Who Challenges Algorithms

Any affected party MAY challenge a Standing Algorithm through the recognized Challenge Process defined in RFC-005-H3. Challengeable aspects include determinism failures, reproducibility failures, unexplained behavior, policy inconsistency, scope violations, and unauthorized changes between versions.

### 18.6 Governance Traceability

All governance actions affecting Standing Algorithms MUST produce traceable governance records answering: who acted, under what authority, under what policy, when, and with what effect. Governance records MUST be stored in the Governance Registry and MUST be auditable by recognized Governance Auditors.

---

## 19. Algorithm Versioning

### 19.1 AlgorithmVersion as a First-Class Protocol Concept

AlgorithmVersion is a first-class protocol concept in RFC-005-H6. It is not an implementation detail, a build tag, or an optional metadata field. AlgorithmVersion is the governed, immutable identifier that enables deterministic reproducibility, historical reconstruction, and standing auditability.

Every Standing Algorithm MUST have a version. Every standing output MUST record the version. Every historical reconstruction MUST use the version in effect at the original computation time.

### 19.2 Version Requirements

A conformant AlgorithmVersion MUST:

- be globally unique within the Algorithm Registry;
- be immutable once approved: the algorithm logic associated with a version MUST NOT be changed after approval;
- identify a specific, complete, approved version of evaluation logic;
- be recorded in every StandingSnapshot, StandingDelta, and StandingExplanation that was produced under it;
- be resolvable in the Algorithm Registry with full governance provenance.

### 19.3 Version Lineage

An AlgorithmVersion SHOULD carry lineage information:

- which prior version it supersedes or extends;
- the governance basis for the new version;
- a description of changes from the prior version;
- migration analysis requirements when moving from a prior version.

Version lineage enables:

- understanding how algorithm behavior has evolved;
- identifying which standing outputs may be affected by a new version;
- conducting migration analysis before activating a new version;
- supporting historical comparison between version outputs.

### 19.4 Version Traceability

Version traceability means that any standing output can be associated with its exact algorithm version, and that version can be retrieved from the Algorithm Registry with its full governance history.

### 19.5 Version Reproducibility

Given the same AlgorithmVersion, EvidenceSet, ClaimSet, StandingContext, PolicyContext, and Temporal Context, a conformant implementation MUST produce the same standing output as was produced at the original evaluation time.

### 19.6 Historical Rebuild Support

The protocol MUST support historical standing rebuild. This means:

- historical AlgorithmVersions MUST remain accessible in the Algorithm Registry even after retirement;
- historical inputs MUST be preserved or resolvable through canonical references;
- historical PolicyContext versions MUST remain retrievable;
- all of the above MUST be available for any standing snapshot that was emitted.

An algorithm that cannot support historical rebuild is not conformant for use in standing computation that participates in authority chains.

---

## 20. Algorithm Registry

### 20.1 Definition

The **Standing Algorithm Registry** (AlgorithmRegistry) is the governance-maintained canonical record of all approved Standing Algorithms, their versions, their governance provenance, and their lifecycle states.

### 20.2 Registry Purpose

The AlgorithmRegistry serves the following protocol purposes:

- provides a canonical, authoritative source of truth for which algorithms are approved for use;
- enables version resolution for historical reconstruction;
- records governance provenance for each version;
- tracks lifecycle states to prevent use of unapproved, suspended, or retired algorithms;
- supports audit queries about algorithm history, changes, and challenges.

### 20.3 Registry Contents

The AlgorithmRegistry MUST store, for each registered algorithm version:

- algorithm identifier;
- version identifier;
- version lineage references;
- algorithm description and scope of application;
- governance approval record (approver, approval date, authority basis);
- policy dependencies;
- lifecycle state;
- activation date and retirement date, when applicable;
- challenge records, where applicable;
- migration notes, where applicable.

### 20.4 Registry Access

The AlgorithmRegistry MUST be publicly accessible to affected parties for audit, challenge, and research purposes. Access controls may restrict write operations to authorized governance actors. Read access MUST be available to subjects whose standing is computed under registered algorithms, to recognized auditors, and to capability engines consuming standing outputs.

### 20.5 Registry Integrity

The AlgorithmRegistry MUST be maintained with integrity equivalent to the evidence registries defined in RFC-004. Registry records MUST be append-only or otherwise audit-preserving. Historical records MUST NOT be erased.

---

## 21. Standing Guarantees

The following guarantees are normative for any Standing Algorithm conformant with this RFC.

### No Black-Box Standing

Every standing output MUST be fully explainable. An algorithm that conceals its evaluation logic, weights, or decision rules is not conformant. Black-box reputation systems are incompatible with the AOC Protocol.

### No Standing Without Evidence

Standing MUST be derived from evidence directly or from claims that are supported by evidence. If no qualifying evidence exists, standing MUST be Unknown, Insufficient, or another state that reflects the absence of evidentiary support.

### No Standing Without Explainability

Every standing output MUST include an explanation sufficient for subject review, governance audit, and legal challenge. A standing output without explanation is not conformant.

### No Standing Without Traceability

Every standing output MUST be traceable to its inputs, algorithm version, policy context, and evaluation timestamp. Traceability is required by RFC-005-H1 and extends to Standing Algorithms as defined in this RFC.

### No Standing Without Versioning

Every standing output MUST record the AlgorithmVersion that produced it. Standing produced by an unversioned, unknown, or unregistered algorithm is not conformant for participation in authority chains.

### No Standing Without Governance

No Standing Algorithm MAY be used in canonical standing computation without governance approval. An unapproved algorithm is not a conformant algorithm, regardless of its technical properties.

### No Hidden Standing Changes

Changes to standing MUST result from traceable events and deterministic recomputation. Hidden administrative changes, undocumented algorithm updates, and silent policy activations are prohibited.

---

## 22. Security Implications

Standing Algorithms are security-relevant. The following threats are specific to the algorithm layer.

### 22.1 Reputation Gaming

Subjects may attempt to optimize inputs superficially — adding many low-quality evidence items, generating self-issued claims, or structuring evidence to satisfy eligibility rules without genuine qualification. Algorithms MUST apply authority-based weighting, independence requirements, and decay functions to resist gaming. Evidence quantity MUST NOT substitute for evidence quality.

### 22.2 Evidence Stuffing

Evidence stuffing is the introduction of large volumes of low-authority or duplicated evidence to inflate confidence artificially. Algorithms MUST detect and discount evidence stuffing through source authority weighting, independence evaluation, and de-duplication logic governed by PolicyContext.

### 22.3 Claim Inflation

Claim inflation is the generation of numerous claims with weak evidentiary support to inflate standing. Algorithms MUST weight claims by evidence support depth, issuer authority, and verification status. Self-issued, low-authority, or unverified claims MUST NOT contribute materially to high confidence standing.

### 22.4 Algorithm Manipulation

An adversary may attempt to influence algorithm behavior through unauthorized algorithm changes, version substitution, or by introducing algorithm versions that have not passed governance review. AlgorithmVersion governance, immutable version identifiers, and Algorithm Registry integrity requirements are the primary defenses.

### 22.5 Policy Manipulation

An adversary may attempt to introduce policy changes that alter weighting, thresholds, or eligibility rules in ways that benefit specific subjects. Policy governance requirements as defined in RFC-005-H3 require that policy changes be approved, traceable, and challengeable.

### 22.6 Standing Laundering

Standing laundering is the attempt to transfer standing from a high-standing subject to a low-standing subject through delegation, claim copying, or evidence reuse without genuine qualification. RFC-005-H5 and the input validation requirements of this RFC are the primary defenses. Algorithm inputs MUST carry subject-specific provenance.

### 22.7 Sybil Influence

Sybil attacks create many identities, issuers, or reviewers to manufacture evidence, claims, or attestations that artificially support standing. Algorithms MUST evaluate issuer independence, claim issuer diversity, and evidence source diversity as weighting factors. Related-party evidence and circular attestation MUST carry reduced weight.

### 22.8 Weight Abuse

Weight abuse is the attempt to manipulate evidence or claim presentation to receive maximum weight classification without genuine qualification. Algorithms MUST evaluate weight categories based on objective, verifiable properties — not on subject assertions about those properties.

### 22.9 Decay Abuse

Decay abuse is the attempt to artificially reset or slow decay — for example, by re-attesting old evidence to make it appear recent, or by creating superficial evidence events that reset recency clocks without genuine re-qualification. Algorithms MUST evaluate evidence recency based on the actual qualifying event — the original issue, the re-verification under full criteria, or the renewal — not on superficial re-assertion dates.

---

## 23. Standing vs Reputation

### 23.1 The Distinction Is Constitutional

Standing is not reputation. This is a constitutional distinction in the AOC Protocol.

**Reputation** is a market signal, social perception, aggregated opinion, or platform-computed value that reflects how a subject is perceived. Reputation is often opaque, influenced by popularity, social network effects, platform-specific signals, and editorial judgment. Reputation systems are frequently not explainable, not reproducible, and not challengeable in a meaningful way.

**Standing** is an evidence-derived, policy-evaluated, algorithm-computed, governance-governed protocol state. Standing is explainable. Standing is reproducible. Standing is challengeable. Standing is traceable to specific evidence, claims, policies, and algorithm versions.

### 23.2 Why the Distinction Matters

A reputation system may be manipulated by gaming reviews, accumulating unverified endorsements, or exploiting platform incentives. Standing cannot be manipulated in this way because every input must carry authority, every computation must be governed, and every output must be explainable.

A reputation system cannot be deterministically reproduced. Standing must be reproducible for any historical timestamp.

A reputation system cannot meaningfully be challenged because the evaluation logic is hidden. Standing must be challengeable because the evaluation logic is published, governed, and versioned.

### 23.3 Reputation Standing Is Permitted Under Protocol Constraints

RFC-005-H2 defines Reputation Standing as a valid StandingType, but with the requirement that it MUST NOT collapse into an opaque or mutable reputation score. Reputation Standing, when computed under this protocol, must satisfy all requirements of this RFC: determinism, explainability, reproducibility, challengeability, governance, and versioning.

If a system calls its output "reputation" but satisfies all of the above requirements, it is a conformant Standing output using the Reputation Standing type. If it does not, it is a non-conformant reputation system that MUST NOT participate in the AOC authority chain.

---

## 24. Standing vs Scoring

### 24.1 The Distinction

Standing is not a score. This distinction is important for protocol semantics and governance clarity.

**A Score** is a numerical value produced by an aggregation function. Scores may be useful as internal implementation artifacts within a Standing Algorithm — a confidence value, a threshold comparison, an eligibility sum. Scores are computation inputs and outputs.

**Standing** is a protocol concept: a policy-governed, evidence-derived, context-sensitive, explainable interpretation of a subject's protocol state. Standing is richer than a score. Standing carries context, policy provenance, algorithm version, explanation, challenge state, and decay history.

### 24.2 Why Scores Are Not Sufficient

A score does not explain itself. "87" does not tell a subject why capability was denied. "42" does not tell an auditor what evidence contributed to a governance decision. Scores are useful for internal computation but are not sufficient as protocol-level standing outputs.

### 24.3 Scores May Exist as Implementation Artifacts

This RFC does not prohibit the use of numeric values within Standing Algorithm implementations. A confidence level may be computed numerically. A threshold may be expressed numerically. Aggregation logic may produce an intermediate numeric result.

What is prohibited is exposing that number as the standing output without the surrounding protocol semantics: the StandingState, StandingContext, PolicyContext, AlgorithmVersion, StandingExplanation, challenge state, and temporal context.

A conformant standing output MUST expose the full protocol semantics. It MAY additionally expose numeric values as implementation transparency artifacts. It MUST NOT replace protocol semantics with numbers alone.

---

## 25. Standing Registry Model

This section introduces the canonical protocol concepts that conformant implementations SHOULD represent.

| Concept | Definition |
|---|---|
| StandingAlgorithm | A deterministic, governance-approved evaluation model that transforms evidence and claims into standing states under explicit context, policy, and version governance. |
| AlgorithmVersion | The unique, immutable identifier for a specific approved version of a StandingAlgorithm. Records which logic was used to produce a standing output. |
| StandingProfile | A structured collection of standing outputs across multiple StandingTypes or StandingDimensions for the same subject. A first-class protocol concept. |
| StandingDimension | A protocol-recognized axis of standing evaluation representing a distinct, independently evaluable aspect of a subject's standing. |
| StandingConfidence | The degree of reliability, assurance, or certainty associated with a StandingState, expressed separately from the state itself. |
| StandingExplanation | The human-readable, machine-readable, and audit-ready explanation of why a standing output exists, covering inputs, weights, policies, context, confidence, challenges, decay, and algorithm version. |
| StandingSimulation | A non-canonical what-if analysis evaluating hypothetical standing under altered inputs, policy, algorithm, or temporal context. MUST NOT alter canonical standing. |
| StandingRegistry | The canonical, governance-maintained registry of standing snapshots, standing profiles, and standing history for subjects within a governed domain. |
| AlgorithmRegistry | The canonical, governance-maintained registry of approved Standing Algorithms, their versions, governance provenance, and lifecycle states. |

---

## 26. Implementation Guidance

This section provides implementation-neutral guidance. It does not prescribe APIs, schemas, programming languages, databases, or specific infrastructure.

### 26.1 Algorithm Design

Standing Algorithms SHOULD:

- implement evaluation logic as a pure function: same inputs, same context, same policy, same version → same output;
- document all input normalization steps, eligibility filters, validation steps, evaluation steps, aggregation steps, and output steps explicitly in their specification;
- define all weight categories, decay functions, thresholds, and output mappings in PolicyContext or AlgorithmVersion documentation;
- be designed for testability: given a set of test inputs, the algorithm MUST produce documented expected outputs;
- be designed for auditability: all intermediate evaluation steps MUST be recordable for explanation generation.

### 26.2 Versioning

Implementations SHOULD:

- treat AlgorithmVersion as the primary key for historical standing reconstruction;
- never overwrite an approved version's logic;
- register new versions through the governance process before activating them for canonical computation;
- maintain compatibility with the AlgorithmRegistry structure for version lookup;
- support side-by-side execution of multiple versions for simulation and migration analysis.

### 26.3 Decay

Implementations SHOULD:

- implement decay as a time-parameterized function: decay(evidenceItem, evaluationTimestamp) → weight modifier;
- version decay functions through AlgorithmVersion or PolicyContext;
- expose decay contributions in StandingExplanation;
- support future-dated decay projection for simulation purposes without affecting canonical snapshots.

### 26.4 Profiles and Dimensions

Implementations SHOULD:

- represent StandingDimensions as independently evaluable units with their own inputs, context, policy, and algorithm version;
- represent StandingProfiles as structured collections of dimension outputs with explicit composition rules;
- avoid collapsing profiles into single scores;
- preserve dimension-level explainability within profile outputs.

### 26.5 Simulation

Implementations SHOULD:

- clearly segregate simulation outputs from canonical standing records;
- label simulation outputs with a simulation flag at the data model level, not only in display;
- provide simulation capabilities that cover all canonical simulation types defined in Section 15;
- ensure simulations consume the same algorithm logic as canonical computation, applied to hypothetical inputs.

### 26.6 Governance Integration

Implementations SHOULD:

- integrate with the Algorithm Registry for version lookup, lifecycle state checking, and governance provenance retrieval;
- reject algorithm versions that are not in an Active lifecycle state in the Algorithm Registry;
- log all governance events that affect algorithm activation, retirement, or challenge as first-class dependency events;
- support governance audit queries against standing records.

---

## 27. Future RFC Dependencies

RFC-005-H6 depends on and informs the following existing and future RFCs.

### 27.1 Existing RFC Dependencies

| RFC | Dependency |
|---|---|
| RFC-004 Evidence Layer | Defines evidence semantics, evidence IDs, evidence lifecycle states, and the evidence authority model that Standing Algorithms consume. |
| RFC-005 Claims Framework | Defines claims, attestations, verification, and the constitutional trust chain that Standing Algorithms operate within. |
| RFC-005-H1 Standing Traceability | Defines traceability requirements that Standing Algorithms must satisfy: snapshots, deltas, deterministic rebuild, evidence attribution, and explainability. |
| RFC-005-H2 Standing Engine | Defines the Standing Engine architecture, standing states, confidence, decay, simulation, and standing layer boundaries that algorithms implement. |
| RFC-005-H3 Standing Governance | Defines the governance authority structure — algorithm approval, algorithm retirement, algorithm challenges, versioning requirements — that Standing Algorithms must operate within. |
| RFC-005-H4 Capability Mapping | Defines how standing outputs are consumed by capability engines. Algorithm outputs must satisfy capability engine consumption requirements. |
| RFC-005-H5 Delegated Standing | Defines how delegation affects standing eligibility inputs without rewriting evidence or claims. |
| RFC-005-H8 Authority Model | Defines how standing-derived capability outputs are consumed by the authority layer. Algorithm outputs contribute to the authority chain. |
| RFC-005-H9 Decision Framework | Defines how recognized decisions consume authority derived from standing. Algorithm outputs are the evidentiary foundation of that chain. |

### 27.2 Potential Future RFCs

The following future RFCs are anticipated based on the protocol concepts introduced by RFC-005-H6:

| Future RFC | Potential Scope |
|---|---|
| RFC-005-H14 Authority Registry | Would define the canonical structure, access model, and integrity requirements for the Authority Registry. Standing Algorithm outputs feed into authority recognition. |
| RFC-005-H15 Decision Execution Framework | Would define how Recognized Decisions are executed, recorded, and traced. Algorithm-produced standing is the foundation of decision authority. |
| RFC-005-H16 Standing Profiles | Would define StandingProfile in full detail: profile types, composition rules, dimension governance, profile registry, and profile lifecycle. |
| RFC-005-H17 Standing Composition | Would define Composite Standing in full: composition rules, multi-dimension aggregation, failure propagation, composition governance, and composition registry. |
| RFC-005-H18 Simulation Framework | Would define the StandingSimulation model in full: simulation types, simulation governance, simulation output semantics, simulation registries, and simulation audit requirements. |
| RFC-005-H19 Algorithm Governance | Would define the Algorithm Governance lifecycle in detail: algorithm proposal, review criteria, approval procedures, migration obligations, retirement consequences, and challenge resolution. |

---

## 28. Acceptance Criteria

A complete implementation or document alignment for RFC-005-H6 satisfies the following checklist:

- [ ] RFC-005-H6 exists in the correct repository location.
- [ ] It follows existing RFC formatting and metadata conventions.
- [ ] It defines Standing Algorithm as a deterministic evaluation model.
- [ ] It formalizes the Standing = f(EvidenceSet, ClaimSet, StandingContext, PolicyContext, AlgorithmVersion) model.
- [ ] It explicitly analyzes the Evidence+Claims vs. Claims Only architectural question with tradeoffs documented.
- [ ] It establishes that duplication of evaluation logic must be avoided.
- [ ] It defines all eight Standing Algorithm Principles (P-SA1 through P-SA8).
- [ ] It defines canonical Standing Inputs: EvidenceSet, ClaimSet, StandingContext, PolicyContext, AlgorithmVersion, Authority Context, Temporal Context.
- [ ] It defines canonical Standing Outputs: StandingState, StandingLevel, StandingConfidence, StandingExplanation, StandingSnapshot, StandingDelta, StandingProfile.
- [ ] It introduces StandingProfile as a first-class protocol concept.
- [ ] It defines canonical StandingDimensions.
- [ ] It introduces Composite Standing as a first-class protocol concept.
- [ ] It defines composition rules and prohibits opaque aggregation.
- [ ] It defines StandingConfidence as separate from StandingState with uncertainty handling.
- [ ] It defines Evidence Weighting with weight principles and modifiers.
- [ ] It defines Claim Weighting with contributing factors.
- [ ] It defines Evidence Decay, Claim Decay, and Standing Decay.
- [ ] It establishes that Validity ≠ Relevance.
- [ ] It defines canonical recalculation triggers.
- [ ] It defines StandingSimulation and prohibits simulation from altering canonical standing.
- [ ] It defines StandingExplanation covering all mandatory elements.
- [ ] It defines algorithm, input, weighting, policy, and output challenges.
- [ ] It references RFC-005-H3 for governance requirements.
- [ ] It introduces AlgorithmVersion as a first-class protocol concept with version lineage, traceability, reproducibility, and historical rebuild support.
- [ ] It defines the Standing Algorithm Registry (AlgorithmRegistry).
- [ ] It defines all seven Standing Guarantees including the prohibition on black-box standing.
- [ ] It covers nine security implications including reputation gaming, evidence stuffing, claim inflation, algorithm manipulation, policy manipulation, standing laundering, Sybil influence, weight abuse, and decay abuse.
- [ ] It distinguishes Standing from Reputation.
- [ ] It distinguishes Standing from Scoring.
- [ ] It defines all nine canonical Standing Registry Model concepts.
- [ ] It provides implementation-neutral guidance.
- [ ] It identifies future RFC dependencies.
- [ ] It explicitly answers all mandatory questions.

### Mandatory Questions Answered

| Question | Section |
|---|---|
| How is standing calculated? | Sections 3, 5, 6, 9 |
| How are claims evaluated? | Sections 3.3, 5.2, 12 |
| How are evidence inputs evaluated? | Sections 5.1, 11 |
| How is confidence produced? | Section 10 |
| How does standing decay? | Section 13 |
| How does standing evolve? | Section 14 |
| How is standing challenged? | Section 17 |
| How are algorithms governed? | Section 18 |
| How are algorithms versioned? | Section 19 |
| How are historical standings reproduced? | Sections 19.5, 19.6 |

---

## Conclusion

RFC-005-H6 establishes Standing Algorithms as a first-class, governance-governed, constitutional component of the AOC Protocol. Standing Algorithms are not implementation details. They are the formalized mechanism by which the protocol transforms evidence and claims into standing states.

The protocol MUST reject black-box reputation systems. It MUST require that every standing output be deterministic, explainable, auditable, reproducible, challengeable, and policy-governed. RFC-005-H6 is the specification that makes those requirements operational.

The concepts introduced as first-class protocol concepts — StandingProfile, StandingDimension, Composite Standing, and AlgorithmVersion — elevate the sophistication of standing computation beyond simple threshold evaluation. They enable multi-dimensional, context-sensitive, governance-governed standing that can support the authority chains, capability decisions, and consequential decisions that the AOC Protocol demands.

Standing Algorithm = Deterministic(Evidence, Claims, Context, Policy, Version).
