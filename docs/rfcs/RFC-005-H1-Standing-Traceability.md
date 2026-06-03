# RFC-005-H1 — Standing Traceability

| Field | Value |
|---|---|
| RFC Number | 005-H1 |
| Title | Standing Traceability |
| Status | Draft |
| Category | Core Protocol Extension |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-03 |
| Supersedes | — |
| Related | RFC-004 Evidence Layer v1.0, RFC-005 AOC Claims Framework |

---

## Abstract

This document defines Standing Traceability for the AOC Protocol. Standing Traceability specifies how standing is derived, versioned, explained, challenged, invalidated, and reconstructed from canonical evidence, evidence lifecycle state, authority context, policy context, and algorithm version. It extends RFC-004 and RFC-005 by requiring every standing state to preserve complete evidence lineage and deterministic rebuild semantics.

Standing Traceability does not define a storage system, user interface, scoring product, reputation market, or implementation-specific standing engine. It defines the protocol requirements that any conformant standing implementation must satisfy.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [AOC Principle](#3-aoc-principle)
4. [Definition of Standing](#4-definition-of-standing)
5. [Standing Traceability Requirements](#5-standing-traceability-requirements)
6. [Standing Evolution Model](#6-standing-evolution-model)
7. [Standing Timeline](#7-standing-timeline)
8. [Standing Snapshot Model](#8-standing-snapshot-model)
9. [Standing Delta Model](#9-standing-delta-model)
10. [Explainability Requirement](#10-explainability-requirement)
11. [Evidence Dependency Graph](#11-evidence-dependency-graph)
12. [Reverse Traceability](#12-reverse-traceability)
13. [Standing Lineage](#13-standing-lineage)
14. [Standing Invalidation](#14-standing-invalidation)
15. [Standing Challenges](#15-standing-challenges)
16. [Deterministic Rebuild Requirement](#16-deterministic-rebuild-requirement)
17. [Audit Requirements](#17-audit-requirements)
18. [Protocol Guarantees](#18-protocol-guarantees)
19. [Security and Governance Implications](#19-security-and-governance-implications)
20. [Canonical Principle](#20-canonical-principle)
21. [Implementation Notes](#21-implementation-notes)
22. [Acceptance Criteria](#22-acceptance-criteria)

---

## 1. Executive Summary

Standing Traceability defines how an entity's standing evolves over time and how every standing state can be reconstructed, audited, verified, challenged, and explained.

Standing is never directly modified. Standing is an emergent state derived from evidence.

In the AOC Protocol, standing is not an administrative field that can be edited by an operator. It is not a mutable reputation score, a subjective trust label, or a black-box output detached from provenance. Standing is a deterministic interpretation produced from canonical evidence, the lifecycle state of that evidence, the authority of evidence sources, the applicable policy context, and the algorithm version used to evaluate those inputs.

Standing Traceability therefore requires that every standing output answer the following questions:

- What evidence contributed to this standing state?
- What evidence was excluded, and why?
- What authority did each evidence source possess?
- What algorithm version evaluated the evidence?
- What policy context constrained the interpretation?
- What challenges, invalidations, expirations, or supersessions affected the result?
- What changed from the previous standing state?
- Can the same standing state be reproduced for any historical timestamp?

A conformant AOC implementation MUST treat standing as derived protocol state. It MUST persist enough lineage, dependency, and explanation data to prove how standing was produced without requiring trust in an administrator, opaque model, vendor database, or mutable score field.

---

## 2. Problem Statement

Traditional reputation and trust systems often collapse evidence, authority, interpretation, and administrative judgment into a single mutable score or label. This creates protocol failures that cannot be repaired by adding audit logs after the fact.

### 2.1 Opaque scoring

Many systems expose a score while concealing the evidence, weights, rules, authority sources, or policy conditions that produced it. A person, vendor, project, AI agent, or organization may be labeled as high-risk or trusted without any inspectable basis for that label.

### 2.2 Non-reproducibility

A historical reputation value is often impossible to reproduce because the underlying data changed, the scoring algorithm changed, old evidence was overwritten, or policy assumptions were not versioned. Without deterministic reconstruction, audits cannot distinguish legitimate evolution from manipulation.

### 2.3 Mutable reputation

Administrative interfaces commonly allow a reputation value to be edited directly. Direct edits sever the relationship between standing and evidence, creating a governance path where outcome state can be changed without changing the facts that justify it.

### 2.4 Missing provenance

Reputation systems frequently fail to record who supplied evidence, whether the source had authority, what the evidence originally claimed, whether it was verified, and how it affected downstream decisions. A score without provenance is not auditable standing.

### 2.5 Lack of appealability

Subjects cannot meaningfully challenge a standing outcome if they cannot identify the evidence, source, policy, or algorithm that produced it. Appealability requires traceability to specific evidence and specific interpretation rules.

### 2.6 Hidden administrative manipulation

If a privileged operator can alter reputation without emitting evidence, policy, or algorithm events, the system permits silent punishment, favoritism, risk laundering, and arbitrary trust changes.

### 2.7 Black-box algorithmic changes

If an algorithm is changed without version attribution, two identical evidence sets can produce different outcomes with no explanation. Algorithmic change must be governed as a protocol-relevant event, not hidden as an implementation detail.

---

## 3. AOC Principle

Standing Traceability is governed by the following principle:

```text
Standing(t) = f(EvidenceSet(t), AlgorithmVersion, PolicyContext)
```

Where:

- `Standing(t)` is the standing state of an entity at timestamp `t`.
- `EvidenceSet(t)` is the canonical evidence available and eligible at timestamp `t`, including lifecycle states such as verified, challenged, invalidated, expired, or superseded.
- `AlgorithmVersion` is the exact version of the deterministic standing algorithm used for evaluation.
- `PolicyContext` is the exact policy bundle, jurisdictional context, domain context, threshold set, and governance constraints applicable to the standing computation.

This formula means standing MUST be deterministic and reconstructable. Given the same inputs, a conformant implementation MUST produce the same standing state, the same included and excluded evidence sets, the same explanation structure, and the same reasoned delta from the previous state.

Determinism is required because standing can affect authority, capability, employment eligibility, vendor governance, compliance posture, identity recognition, AI agent execution, and other consequential decisions. If standing cannot be reproduced, it cannot be audited. If it cannot be audited, it cannot safely participate in authority.

---

## 4. Definition of Standing

Standing is the current interpretable state of an entity derived from evidence under an explicit policy and algorithmic context.

Standing answers a contextual question such as:

- Is this entity currently reliable for this purpose?
- Is this claim currently usable under this policy?
- Does this vendor currently satisfy required trust conditions?
- Does this AI agent currently meet operational trust requirements?
- Does this professional credential currently support the requested authority?

Standing may apply to a claim, credential, principal, project, vendor, organization, AI agent, policy object, or other protocol-recognized entity. RFC-005 defines standing as the current validity state of a claim. RFC-005-H1 generalizes traceability requirements for any standing output that a future standing engine or domain implementation emits.

### 4.1 Domain examples

| Domain | Example standing interpretation |
|---|---|
| HRKey / employment | Candidate reliability, verified professional standing, credential usability, employment eligibility confidence, or role-specific readiness. |
| PMFreak / Privana | Project health, PMO execution standing, delivery governance confidence, or portfolio risk posture derived from project evidence. |
| Vendor governance | Vendor trustworthiness, onboarding readiness, contract performance standing, security posture, or renewal eligibility. |
| Legal / compliance | Compliance posture, audit readiness, policy adherence, regulatory control maturity, or remediation standing. |
| Education | Competency maturity, credential standing, learning progression, assessment reliability, or certification readiness. |
| Identity | Verification confidence, identity assurance standing, source authority sufficiency, or credential presentation usability. |
| AI agents | Operational trust standing, safe execution readiness, delegated capability reliability, runtime behavior standing, or supervision sufficiency. |

### 4.2 Boundary rules

Standing MUST remain distinct from the data that produces it:

- Standing is not evidence.
- Standing is not a claim.
- Standing is not a score.
- Standing is a derived interpretation.

Evidence records observed or asserted facts. Claims express propositions. Scores may be one possible internal representation or component, but a score alone is not standing. Standing is the protocol-level interpretation produced by applying a defined algorithm and policy context to evidence with known authority and lifecycle state.

---

## 5. Standing Traceability Requirements

The following requirements are normative for conformant standing implementations.

### ST-1 Historical Reconstruction

| Field | Requirement |
|---|---|
| Purpose | Ensure standing can be reproduced for any historical timestamp. |
| Required behavior | The system MUST retain or reference all inputs required to recompute standing at timestamp `t`, including evidence content or canonical references, evidence lifecycle states, algorithm version, policy context, source authority, and prior snapshot references. |
| Audit question | What was this entity's standing at a specific point in time, and can the system reproduce it exactly? |

### ST-2 Evidence Attribution

| Field | Requirement |
|---|---|
| Purpose | Ensure every standing state identifies the evidence that contributed to it. |
| Required behavior | Every standing snapshot MUST list included evidence and excluded evidence with exclusion reasons. Evidence attribution MUST reference canonical evidence identifiers or content-addressed evidence references. |
| Audit question | Which evidence produced this standing, and which evidence was considered but excluded? |

### ST-3 Weight Attribution

| Field | Requirement |
|---|---|
| Purpose | Explain how evidence influenced the standing output. |
| Required behavior | When a standing algorithm applies weights, thresholds, contribution categories, confidence adjustments, or rule-based impact, the standing explanation MUST expose the contribution logic for each relevant evidence item. If the algorithm is non-numeric, it MUST expose rule satisfaction, rule failure, or precedence logic instead of weights. |
| Audit question | How much did each evidence item matter, or which rule did it satisfy or fail? |

### ST-4 Authority Attribution

| Field | Requirement |
|---|---|
| Purpose | Prevent unauthoritative evidence from silently affecting standing. |
| Required behavior | Every included evidence item MUST be linked to its supplier, issuer, attester, verifier, registry, or authority context. The system MUST record the authority basis that allowed the evidence to contribute. Low-authority or authority-free evidence MUST either be excluded or explicitly marked with limited contribution. |
| Audit question | Who supplied or validated this evidence, and what authority did they have? |

### ST-5 Temporal Attribution

| Field | Requirement |
|---|---|
| Purpose | Ensure standing reflects time-sensitive evidence validity. |
| Required behavior | Standing computation MUST account for evidence creation time, effective time, verification time, expiration time, revocation time, supersession time, challenge time, and policy effective windows where applicable. Temporal relevance MUST be represented in the explanation output. |
| Audit question | Why was this evidence relevant or irrelevant at this timestamp? |

### ST-6 Challenge Attribution

| Field | Requirement |
|---|---|
| Purpose | Make disputes visible and preserve appealability. |
| Required behavior | Evidence and claims under challenge MUST carry challenge state into standing computation. The standing snapshot MUST disclose challenged evidence, challenge status, impact on confidence or usability, and whether the evidence was included, discounted, suspended, or excluded under policy. |
| Audit question | Which evidence is disputed, and how did the dispute affect standing? |

### ST-7 Algorithm Version Attribution

| Field | Requirement |
|---|---|
| Purpose | Prevent hidden algorithmic changes from changing standing without traceability. |
| Required behavior | Every standing snapshot and standing delta MUST record the exact algorithm version used. Algorithm changes MUST trigger recomputation or explicit migration analysis for impacted standing states when policy requires current standing to be refreshed. |
| Audit question | What algorithm produced this standing, and did an algorithm change alter the outcome? |

### ST-8 Policy Context Attribution

| Field | Requirement |
|---|---|
| Purpose | Ensure standing is interpreted under explicit governance rules. |
| Required behavior | Every standing snapshot MUST reference the policy context used for evaluation, including policy version, domain, jurisdiction, thresholds, risk tier, and any special governance constraints needed to interpret the result. |
| Audit question | What policy rules made this standing valid for this context? |

### ST-9 Invalidation Propagation

| Field | Requirement |
|---|---|
| Purpose | Ensure revoked, expired, corrected, or superseded evidence affects all dependent standing states. |
| Required behavior | Evidence lifecycle events that change eligibility or interpretation MUST identify impacted standing snapshots and trigger recomputation, invalidation marking, or supersession according to policy. Standing MUST be recomputed, not manually changed. |
| Audit question | Which standing states were impacted when this evidence changed lifecycle state? |

### ST-10 Explainability Output

| Field | Requirement |
|---|---|
| Purpose | Ensure every standing result is understandable and challengeable. |
| Required behavior | Every standing output MUST produce a persistable explanation tree that identifies evidence, contribution logic, authority, temporal relevance, challenges, exclusions, invalidations, policy context, algorithm version, and confidence impact. |
| Audit question | Why does this standing exist, and can a reviewer inspect the complete reasoning path? |

---

## 6. Standing Evolution Model

Standing evolves through events, not edits.

A standing implementation MUST NOT treat standing as a mutable field that can be directly changed by an administrator or background job. Instead, changes to standing MUST result from protocol-recognized events and deterministic recomputation.

Examples of standing-relevant events include:

- `evidence.created`
- `evidence.verified`
- `evidence.challenged`
- `evidence.invalidated`
- `evidence.expired`
- `evidence.superseded`
- `evidence.corrected`
- `policy.changed`
- `algorithm.versioned`
- `standing.recomputed`
- `standing.snapshot.emitted`

A standing event stream SHOULD preserve both evidence lifecycle events and standing recomputation events. Evidence events explain why recomputation was necessary. Standing snapshot and delta events explain what interpretation changed.

Direct operations such as `setStanding(High)`, `editReputation(87)`, or `adminOverrideTrusted` are incompatible with Standing Traceability unless represented as evidence or policy events with authority, reviewability, and deterministic recomputation semantics. Even then, the outcome is not the manual command; the outcome is the recomputed standing produced from the new evidence or policy state.

---

## 7. Standing Timeline

A standing timeline is the chronological sequence of evidence lifecycle events, policy or algorithm events, recomputation events, snapshots, and deltas that explain how an entity's standing evolved.

A standing timeline MUST be append-only or otherwise audit-preserving. Corrections MUST create new events that supersede prior events; they MUST NOT erase historical events.

Example timeline:

| Timestamp | Event | Traceability effect |
|---|---|---|
| `2026-06-01T09:00:00Z` | `evidence.created` | Employment validation evidence is registered for `entity:person-123`. |
| `2026-06-01T09:05:00Z` | `evidence.verified` | Verifier confirms issuer signature and source authority. |
| `2026-06-01T09:06:00Z` | `standing.recomputed` | Standing algorithm `standing-employment-v1.0.0` evaluates eligible evidence. |
| `2026-06-01T09:06:01Z` | `standing.snapshot.emitted` | Snapshot `standing-snap-001` records `VerifiedProfessionalStanding: Active`. |
| `2026-07-15T14:20:00Z` | `evidence.challenged` | A dispute is opened against the manager review evidence. |
| `2026-07-15T14:21:00Z` | `standing.recomputed` | Policy discounts challenged evidence pending review. |
| `2026-07-15T14:21:01Z` | `standing.snapshot.emitted` | Snapshot `standing-snap-002` records reduced confidence and challenge disclosure. |
| `2026-08-02T10:00:00Z` | `evidence.invalidated` | Manager review evidence is invalidated after review. |
| `2026-08-02T10:01:00Z` | `standing.recomputed` | Invalidated evidence is excluded; impacted snapshots are linked. |
| `2026-08-02T10:01:01Z` | `standing.snapshot.emitted` | Snapshot `standing-snap-003` records new standing with invalidation lineage. |

---

## 8. Standing Snapshot Model

A standing snapshot is an immutable record of standing at a specific timestamp under a specific algorithm version and policy context.

A snapshot MUST NOT be overwritten to reflect later evidence, later policy, or later algorithm changes. Later changes MUST produce new snapshots and deltas.

Example snapshot:

```json
{
  "snapshotId": "standing-snap-003",
  "entityId": "entity:person-123",
  "timestamp": "2026-08-02T10:01:01Z",
  "standingType": "VerifiedProfessionalStanding",
  "standingLevel": "active_with_reduced_confidence",
  "confidence": 0.82,
  "evidenceIncluded": [
    {
      "evidenceId": "evidence:certification-778",
      "contribution": "supports_required_certification",
      "authorityRef": "authority:issuer-accredited-training-board",
      "temporalStatus": "current"
    },
    {
      "evidenceId": "evidence:employment-validation-441",
      "contribution": "supports_employment_history",
      "authorityRef": "authority:employer-verified-hr",
      "temporalStatus": "current"
    },
    {
      "evidenceId": "evidence:identity-verification-219",
      "contribution": "supports_subject_identity",
      "authorityRef": "authority:identity-provider-level-2",
      "temporalStatus": "current"
    }
  ],
  "evidenceExcluded": [
    {
      "evidenceId": "evidence:manager-review-552",
      "exclusionReason": "invalidated_after_challenge",
      "invalidatedAt": "2026-08-02T10:00:00Z"
    }
  ],
  "algorithmVersion": "standing-employment-v1.0.0",
  "policyContext": {
    "policyId": "policy:hrkey-professional-standing",
    "policyVersion": "2026.08.0",
    "domain": "employment",
    "jurisdiction": "US",
    "riskTier": "moderate"
  },
  "explanationRef": "explanation:standing-snap-003",
  "previousSnapshotId": "standing-snap-002"
}
```

The concrete serialization format MAY vary across implementations, but any conformant snapshot model MUST preserve equivalent semantics.

---

## 9. Standing Delta Model

A standing delta is the difference between two standing snapshots. Deltas explain what changed, why it changed, and which events caused recomputation.

A delta MUST reference both the previous snapshot and the new snapshot unless the new snapshot is the first standing snapshot for the entity and standing type.

Example delta:

```json
{
  "deltaId": "standing-delta-003",
  "previousSnapshotId": "standing-snap-002",
  "newSnapshotId": "standing-snap-003",
  "triggeringEvents": [
    {
      "eventId": "event:evidence-invalidated-9001",
      "eventType": "evidence.invalidated",
      "evidenceId": "evidence:manager-review-552",
      "timestamp": "2026-08-02T10:00:00Z"
    }
  ],
  "previousStanding": {
    "standingLevel": "active_under_review",
    "confidence": 0.88
  },
  "newStanding": {
    "standingLevel": "active_with_reduced_confidence",
    "confidence": 0.82
  },
  "changedEvidence": {
    "included": [],
    "excluded": [
      {
        "evidenceId": "evidence:manager-review-552",
        "reason": "invalidated_after_challenge"
      }
    ],
    "changedContribution": []
  },
  "explanation": "Manager review evidence was invalidated after challenge review and excluded from recomputation. Remaining current evidence still satisfies active standing policy with reduced confidence.",
  "recomputationReason": "evidence_lifecycle_state_changed"
}
```

Deltas SHOULD be queryable by entity, evidence identifier, policy version, algorithm version, standing type, and triggering event.

---

## 10. Explainability Requirement

Every standing output MUST produce a persistable explanation tree.

The explanation tree MUST include:

- direct contributing evidence;
- weights, thresholds, contribution categories, or rule satisfaction logic;
- authority of each evidence item;
- confidence impact or qualitative confidence effect;
- temporal relevance, including effective dates, expiration, revocation, and supersession status;
- challenges, disputes, review states, and their impact;
- invalidated, expired, superseded, or excluded evidence;
- algorithm version;
- policy context;
- prior snapshot and delta references where applicable.

The following output is invalid because it cannot be audited or challenged:

```text
Standing = 87%, Reason = Unknown
```

A conformant implementation may expose a concise human-readable explanation, but it MUST preserve a machine-readable explanation tree sufficient for audit, deterministic rebuild, dispute review, and impacted-state analysis.

---

## 11. Evidence Dependency Graph

Standing SHOULD be represented as a dependency graph linking evidence, claims, authorities, policies, algorithms, and standing snapshots. The graph does not require a specific database technology. It requires explicit relationships.

Simple dependency diagram:

```text
[Evidence: Certification]
        | supports
        v
[Claim: Holds Certification] ----\
                                  \
[Evidence: Employment Validation] ---> [Standing Snapshot V4]
        | supports                  /          |
        v                          /           | produced_by
[Claim: Employment History] -------            v
                                      [Algorithm Version]
                                                |
                                                | constrained_by
                                                v
                                         [Policy Context]

[Authority: Accredited Issuer] ---> authorizes ---> [Evidence: Certification]
[Challenge Record] -------------> affects -------> [Standing Snapshot V4]
[Invalidated Evidence] ---------> excluded_by ---> [Standing Snapshot V4]
```

A standing snapshot without graph edges to evidence, authority, policy, and algorithm context is an orphan standing state and is not conformant with this RFC.

---

## 12. Reverse Traceability

Standing Traceability requires both forward and reverse traceability.

### 12.1 Forward traceability

Forward traceability answers:

```text
Which standing states did this evidence affect?
```

Given an evidence item, the system MUST identify standing snapshots, standing deltas, decisions, capabilities, or authority determinations that were affected by that evidence where those relationships are within the implementation's standing domain.

Forward traceability is required for invalidation propagation, impact analysis, breach response, audit review, and subject notification.

### 12.2 Reverse traceability

Reverse traceability answers:

```text
Which evidence produced this standing?
```

Given a standing snapshot, the system MUST identify included evidence, excluded evidence, source authority, contribution logic, policy context, algorithm version, challenges, invalidations, and prior snapshot ancestry.

Reverse traceability is required for explanation, appealability, regulatory review, and deterministic rebuild.

---

## 13. Standing Lineage

Each standing state has ancestry. The ancestry of standing is the ordered set of evidence, claims, authorities, policies, algorithms, lifecycle states, snapshots, and deltas that produced it.

Example lineage:

```text
Standing V4
← Certification Evidence
← Manager Review Evidence
← Employment Validation Evidence
← Identity Verification Evidence
← Policy Version
← Algorithm Version
```

Lineage MUST remain available even when evidence is later invalidated or superseded. The historical standing state must show that the evidence contributed at the time, and later snapshots must show how invalidation or supersession changed the result.

Standing lineage MAY include nested lineage. For example, a certification evidence item may itself depend on issuer accreditation evidence, identity proofing evidence, assessment evidence, and policy evidence.

---

## 14. Standing Invalidation

Standing invalidation occurs when evidence or context that contributed to standing is revoked, expired, challenged, corrected, superseded, or otherwise made ineligible under policy.

Key rule:

```text
Standing must be recomputed, not manually changed.
```

When an evidence lifecycle event occurs, the standing implementation MUST:

1. Identify standing snapshots and standing types that depended on the evidence.
2. Determine whether policy requires recomputation, suspension, disclosure, notification, or historical marking.
3. Recompute standing using the updated evidence lifecycle state, the applicable algorithm version, and the applicable policy context.
4. Emit a new standing snapshot if the current standing interpretation changes or if policy requires an explicit no-change recomputation record.
5. Emit a standing delta that references the triggering event and explains the impact.
6. Preserve prior snapshots as historical records.

Invalidation MUST NOT erase the fact that a prior standing snapshot existed. Instead, it creates a traceable history showing that the previous standing was derived from evidence that later changed lifecycle state.

---

## 15. Standing Challenges

Challenges are disputes, appeals, reviews, or contestations raised against evidence, claims, verification results, standing interpretations, or authority context.

Standing Traceability recognizes the following challenge states:

| Challenge state | Meaning |
|---|---|
| `unchallenged` | No active or historical challenge is associated with the evidence or standing element. |
| `challenged` | A challenge has been filed but has not yet entered formal review. |
| `under_review` | A recognized reviewer, governance process, or policy-defined body is evaluating the challenge. |
| `confirmed` | The challenged evidence or standing element was confirmed after review. |
| `invalidated` | The challenged evidence or standing element was found invalid or unusable under policy. |
| `superseded` | The challenged evidence or standing element was replaced by corrected or newer evidence, policy, or interpretation. |

Challenges MUST remain part of the historical record. A confirmed or rejected challenge is still relevant lineage because it explains why evidence continued to contribute, stopped contributing, or contributed with modified confidence.

Policies MAY define different standing behavior for challenged evidence. Examples include:

- include challenged evidence with disclosure;
- discount challenged evidence until review completes;
- suspend use of challenged evidence for high-risk decisions;
- exclude challenged evidence when challenge authority is high;
- require human review before standing can support authority.

Regardless of policy choice, the challenge state and its effect MUST be visible in the standing explanation.

---

## 16. Deterministic Rebuild Requirement

A conformant system MUST reproduce the exact standing state at a point in time when given:

- entity ID;
- evidence set;
- evidence lifecycle states;
- algorithm version;
- policy context;
- timestamp.

The rebuild MUST reproduce:

- standing type;
- standing level;
- confidence or qualitative confidence interpretation;
- included evidence;
- excluded evidence and exclusion reasons;
- contribution logic;
- authority attribution;
- temporal attribution;
- challenge and invalidation effects;
- explanation tree;
- previous snapshot linkage where applicable.

If implementation dependencies make exact rebuild impossible, the system MUST mark the standing output as non-reconstructable and non-conformant for audit purposes. A non-reconstructable standing state MUST NOT be used as sole support for consequential authority.

---

## 17. Audit Requirements

Auditors MUST be able to answer the following questions from standing records, evidence records, lifecycle events, policy references, algorithm versions, snapshots, deltas, and explanation trees:

- Why does this standing exist?
- Which evidence contributed?
- Which evidence was excluded?
- Who supplied the evidence?
- What authority did they have?
- What algorithm version was used?
- What policy context was used?
- When did standing change?
- What changed between standing versions?
- What would standing be if evidence X were removed?
- Which evidence is disputed?
- Which standing states were impacted by an invalidated evidence item?

The question "What would standing be if evidence X were removed?" MAY be answered through simulation or what-if analysis rather than by mutating standing history. Simulations MUST be labeled as simulations and MUST NOT overwrite canonical standing snapshots.

---

## 18. Protocol Guarantees

Standing Traceability guarantees the following properties for conformant implementations:

- no invisible reputation changes;
- no unexplained standing;
- no orphan standing states;
- no authority-free standing modifications;
- no irreversible standing history;
- no hidden admin overrides;
- no standing without evidence lineage;
- no algorithmic change without version attribution.

These guarantees are protocol properties, not user interface preferences. A system that allows hidden or unexplained standing changes is not conformant even if it separately maintains logs or reports.

---

## 19. Security and Governance Implications

Standing Traceability protects the AOC ecosystem against the following risks.

### 19.1 Silent manipulation

Because standing changes require evidence, lifecycle, policy, or algorithm events, a hidden operator cannot silently alter standing without creating traceable inputs and recomputation outputs.

### 19.2 Reputation fraud

Evidence attribution, authority attribution, and dependency graphs make it harder to inflate standing through fabricated, duplicated, low-authority, or circular evidence.

### 19.3 Arbitrary score changes

Standing is not a mutable score. Any numeric confidence or level must be explainable through evidence and policy, preventing arbitrary administrative score changes.

### 19.4 Hidden algorithmic penalties

Algorithm version attribution makes it visible when a new evaluation rule changes standing. A policy may then require migration review, affected-entity disclosure, or comparative deltas.

### 19.5 Administrative tampering

Administrative actions that alter evidence, policy, challenge state, or algorithm activation are themselves governance-relevant events. They must carry authority, provenance, and auditability.

### 19.6 Evidence laundering

Authority attribution and lineage prevent untrusted evidence from becoming trusted merely by being copied into a trusted system. The source, issuer, verifier, and authority chain remain inspectable.

### 19.7 Malicious or low-authority claims

Standing computation must account for authority and policy. Evidence from a low-authority or malicious source must be excluded, discounted, challenged, or separately reviewed according to policy.

### 19.8 Stale evidence affecting current standing

Temporal attribution ensures expired, obsolete, superseded, or time-bounded evidence does not silently continue to support current standing.

### 19.9 Unreviewed challenged evidence

Challenge attribution ensures disputed evidence is not treated as undisputed. The standing explanation must show whether challenged evidence was included, discounted, suspended, or excluded.

---

## 20. Canonical Principle

Standing is not an asset.
Standing is not a score.
Standing is not a claim.
Standing is a continuously derivable interpretation of evidence.
Therefore every standing state must remain fully traceable to the evidence, authority, policy, and algorithmic context that produced it.

---

## 21. Implementation Notes

The following guidance is non-exhaustive and implementation-neutral.

1. Standing snapshots should be immutable.
2. Standing deltas should reference previous and new snapshots.
3. Evidence lifecycle events must trigger recomputation when they affect standing eligibility or contribution logic.
4. Algorithm versions must be stored with standing snapshots, deltas, explanations, and recomputation records.
5. Explanation outputs must be persistable and queryable.
6. Policies must be versioned and referenced by standing outputs.
7. Standing should support simulation and what-if analysis without mutating canonical history.
8. Challenge and invalidation events must propagate to impacted standing states.
9. Standing engines should expose both human-readable explanations and machine-readable explanation trees.
10. Implementations should index standing snapshots by entity, standing type, evidence identifier, algorithm version, policy version, challenge state, and lifecycle event.
11. Implementations should treat admin actions as evidence, policy, or governance events rather than standing edits.
12. Implementations should preserve historical inputs or canonical references sufficient to support deterministic rebuild.
13. Implementations should define retention and archival policies that do not break auditability.
14. Implementations should make simulation outputs visibly distinct from canonical snapshots.
15. Implementations should preserve compatibility with RFC-004 evidence portability and RFC-005 trust-chain boundaries.

This RFC does not require a specific database, event bus, graph store, API shape, schema language, or scoring algorithm. It requires that whatever implementation is chosen preserves traceability, determinism, explainability, challenge awareness, invalidation propagation, policy attribution, and algorithm attribution.

---

## 22. Acceptance Criteria

A complete implementation or document alignment for RFC-005-H1 satisfies the following checklist:

- [x] RFC-005-H1 exists in the correct repo location.
- [x] It follows existing RFC formatting.
- [x] It defines Standing Traceability clearly.
- [x] It distinguishes standing from evidence, claims, and scores.
- [x] It includes traceability requirements ST-1 through ST-10.
- [x] It includes snapshot and delta models.
- [x] It includes deterministic rebuild requirements.
- [x] It includes audit questions.
- [x] It includes challenge and invalidation behavior.
- [x] It includes protocol guarantees.
- [x] It is detailed enough to guide future implementation.

---

## Conclusion

RFC-005-H1 establishes Standing Traceability as a constitutional requirement for the Evidence Layer and Claims Framework. Standing may influence authority, capability, trust, governance, compliance, employment, vendor qualification, education, identity, AI execution, and other consequential contexts. For that reason, standing cannot be an opaque reputation value or manually edited score.

Standing must always be derivable from evidence. Every standing state must preserve its lineage. Every change must be explainable as the consequence of evidence, lifecycle, policy, algorithm, or challenge events. Every historical state must remain reconstructable.

Standing = Function(Evidence).
