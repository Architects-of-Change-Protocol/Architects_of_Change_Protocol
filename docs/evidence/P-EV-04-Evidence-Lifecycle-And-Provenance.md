# P-EV-04 — Evidence Lifecycle & Provenance

| Field | Value |
|---|---|
| Document ID | P-EV-04 |
| Title | Evidence Lifecycle & Provenance |
| Status | Draft |
| Category | Evidence Layer |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-03 |
| Related | RFC-004 Evidence Layer v1.0, P-EV-02 Canonical Evidence Model, P-EV-03 Evidence Registry, RFC-005 Claims Framework, RFC-005-H1 Standing Traceability |

---

## Abstract

This document defines the complete lifecycle of Evidence in the AOC Protocol. It specifies canonical lifecycle states, lifecycle transition rules, provenance requirements, lineage reconstruction, invalidation, supersession, challenge history, verification history, temporal truth, and downstream dependency impact.

Evidence is the root layer of protocol truth. Its history MUST be preserved without being overwritten by Claims, Standing, Capabilities, Authority, Decisions, registries, platforms, or operational convenience. Evidence MAY evolve in interpretation, verification status, challenge state, downstream use, or relationship context, but the historical record of what was known, asserted, verified, challenged, invalidated, superseded, confirmed, or archived MUST remain reconstructable.

This specification is technology-neutral. It defines constitutional protocol semantics and MUST NOT be interpreted as requiring a particular storage system, API, database, ledger, chain, registry implementation, or infrastructure provider.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Evidence Lifecycle Definition](#3-evidence-lifecycle-definition)
4. [Canonical Lifecycle States](#4-canonical-lifecycle-states)
5. [Lifecycle Transition Rules](#5-lifecycle-transition-rules)
6. [Evidence Provenance](#6-evidence-provenance)
7. [Provenance Requirements](#7-provenance-requirements)
8. [Evidence Lineage](#8-evidence-lineage)
9. [Evidence Evolution](#9-evidence-evolution)
10. [Evidence Invalidation](#10-evidence-invalidation)
11. [Evidence Supersession](#11-evidence-supersession)
12. [Challenge Lifecycle](#12-challenge-lifecycle)
13. [Verification Lifecycle](#13-verification-lifecycle)
14. [Temporal Truth](#14-temporal-truth)
15. [Dependency Impact](#15-dependency-impact)
16. [Lifecycle Traceability](#16-lifecycle-traceability)
17. [Lifecycle Graph](#17-lifecycle-graph)
18. [Provenance Reconstruction](#18-provenance-reconstruction)
19. [Human Sovereignty](#19-human-sovereignty)
20. [Federated Lifecycle](#20-federated-lifecycle)
21. [Lifecycle Guarantees](#21-lifecycle-guarantees)
22. [Security Implications](#22-security-implications)
23. [Canonical Concepts](#23-canonical-concepts)
24. [Implementation Guidance](#24-implementation-guidance)
25. [Future Dependencies](#25-future-dependencies)
26. [Acceptance Criteria](#26-acceptance-criteria)

---

## 1. Executive Summary

Evidence changes across time through protocol-recognized lifecycle events. An Evidence item may be observed, recorded, registered, verified, challenged, placed under review, confirmed, invalidated, superseded, archived, or otherwise contextualized by relationship and consumption history. These changes do not mutate Evidence into a downstream interpretation. They preserve the temporal record of how Evidence was understood and used.

The Evidence Lifecycle answers the core question: **what happens to Evidence across time?**

A conformant lifecycle model MUST preserve:

- the Evidence identity;
- the Evidence content binding or canonical reference;
- the EvidenceSubject;
- the EvidenceSource;
- the EvidenceContext;
- the EvidenceProvenance;
- the EvidenceLifecycle state history;
- the EvidenceLifecycleEvent history;
- the EvidenceLineage;
- the EvidenceVerification history;
- the EvidenceChallenge history;
- invalidation and supersession records;
- downstream dependency impact; and
- temporal truth.

Evidence history is append-preserving. Lifecycle events MAY change current usability, confidence, eligibility, interpretation, or downstream contribution, but they MUST NOT erase prior states. A prior standing snapshot, claim interpretation, authority evaluation, or decision may have been valid under the Evidence state known at that time even if the Evidence is later invalidated or superseded. The protocol MUST preserve both facts.

Evidence provenance identifies where Evidence came from and how it was produced. Evidence lineage identifies the chain of origin, transformation, verification, challenge, registry, custody, relationship, consumption, invalidation, supersession, and archival events through which Evidence became what it is known to be. Provenance is therefore a required part of Evidence identity and interpretability; lineage is the reconstructable historical graph that explains Evidence evolution.

---

## 2. Problem Statement

Evidence that cannot explain its past cannot support protocol truth.

Contemporary systems often store records without preserving the full history of observation, production, registration, verification, dispute, correction, invalidation, supersession, and use. When this happens:

- a record may appear current even after it has become obsolete;
- a verified artifact may remain trusted after its source authority was disproven;
- a challenged item may continue to support Standing without disclosure;
- a corrected record may silently replace the original record;
- a decision may be impossible to reconstruct because the Evidence state at decision time is unavailable;
- a registry may expose only a current view and hide historical lifecycle changes;
- downstream Claims may continue relying on Evidence that is invalid, superseded, expired, disputed, or outside policy context; and
- human subjects may lose the ability to contest Evidence because challenge history and provenance are incomplete.

The AOC Protocol requires Evidence to remain inspectable across time. The protocol MUST distinguish between:

- Evidence content and Evidence interpretation;
- registration and verification;
- verification and truth;
- challenge and invalidation;
- correction and erasure;
- supersession and deletion;
- archival and loss of meaning;
- current truth and temporal truth; and
- historical use and current eligibility.

Without this distinction, Claims, Standing, Capabilities, Authority, and Decisions become fragile because downstream outputs cannot explain which Evidence state they consumed.

---

## 3. Evidence Lifecycle Definition

**EvidenceLifecycle** is the protocol-recognized state model and event history of Evidence over time.

EvidenceLifecycle MUST be:

- **historical**: prior states MUST remain reconstructable;
- **traceable**: every lifecycle change MUST identify its basis;
- **append-preserving**: corrections MUST create new lifecycle events rather than silently replacing old events;
- **context-preserving**: state changes MUST retain temporal, policy, authority, and subject-relevant context where applicable;
- **dependency-aware**: changes that affect downstream Claims, Standing, Capabilities, Authority, or Decisions MUST be discoverable;
- **challenge-aware**: disputes and review outcomes MUST remain visible even after resolution;
- **verification-aware**: verification outcomes MUST identify scope, method, authority, time, limitation, and result where applicable; and
- **federation-safe**: lifecycle meaning MUST survive registry, domain, jurisdictional, organizational, and infrastructure boundaries.

An **EvidenceLifecycleState** is a named state describing the protocol-recognized lifecycle condition of Evidence at a point in time.

An **EvidenceLifecycleEvent** is a traceable event that changes, confirms, qualifies, contextualizes, or records an EvidenceLifecycleState or lifecycle-relevant relationship.

EvidenceLifecycle is not a mutable status field. A current lifecycle state MAY be derived from the lifecycle event history, but the current state MUST NOT be treated as a substitute for lifecycle history.

---

## 4. Canonical Lifecycle States

The following lifecycle states are canonical for P-EV-04. Implementations MAY define profile-specific sub-states only if the canonical state remains preserved and mappable.

| State | Definition | Protocol effect |
|---|---|---|
| Observed | A fact, event, condition, artifact, assertion, or state has been perceived or detected by a source, actor, system, or process. | Observation alone does not make Evidence fully conformant. It begins potential Evidence history. |
| Recorded | The observation or artifact has been captured as a durable record with sufficient context to be inspected. | Recorded material MAY become Evidence if canonical Evidence requirements are satisfied. |
| Registered | Evidence has been recognized by an Evidence Registry or equivalent protocol-visible registration context. | Registration creates visibility and referenceability; it MUST NOT be treated as proof of truth. |
| Verified | Evidence has passed a defined verification process within a declared scope. | Verification increases confidence or eligibility only within the stated verification scope and policy context. |
| Challenged | Evidence has been disputed on defined grounds. | Challenge state MUST be visible to downstream consumers and MUST affect use according to policy. |
| Under Review | A challenge, verification concern, provenance concern, policy concern, authority concern, or lifecycle concern is being examined. | Downstream use MAY be suspended, discounted, qualified, or permitted with disclosure according to policy. |
| Confirmed | Evidence, a verification result, or a challenged lifecycle condition has been affirmed after review. | Confirmation MUST preserve the challenge or review history that led to it. |
| Invalidated | Evidence has been found invalid, unusable, forged, corrupted, unauthorized, materially inaccurate, expired where policy treats expiration as invalidating, or non-conformant under policy. | Invalidated Evidence MUST NOT be silently used as current valid Evidence. Historical use MUST remain traceable. |
| Superseded | Evidence has been replaced or made obsolete by newer, corrected, more complete, or more authoritative Evidence. | Superseded Evidence MAY remain historically valid for prior periods but MUST be linked to the superseding Evidence. |
| Archived | Evidence is no longer active for ordinary current use but is preserved for audit, temporal truth, legal, governance, historical, or accountability purposes. | Archival MUST NOT break provenance, lineage, challenge rights, or dependency reconstruction. |

### 4.1 State Semantics

Lifecycle states describe Evidence condition, not downstream conclusion. A Claim may interpret Evidence. Standing may derive from Evidence and Claims under policy and algorithmic context. Authority may depend on recognized Standing and governance context. Decisions may consume Authority. None of those downstream objects MAY redefine the EvidenceLifecycleState.

### 4.2 Multiple Concurrent Conditions

Evidence MAY have a primary current lifecycle state and additional lifecycle qualifiers. For example, Evidence may be Registered, Verified, Challenged, and Under Review at the same time. A conformant implementation MUST preserve enough lifecycle history to explain the relationship among such conditions.

### 4.3 Terminal and Non-Terminal States

Invalidated, Superseded, and Archived are not erasure states. They limit or contextualize current use, but they MUST NOT destroy history. Confirmed is not necessarily terminal; confirmed Evidence may later be challenged on new grounds, invalidated by new Evidence, superseded by corrected Evidence, or archived under policy.

---

## 5. Lifecycle Transition Rules

Lifecycle transitions MUST occur through EvidenceLifecycleEvents.

### 5.1 General Transition Rule

Every lifecycle transition MUST identify, where applicable:

- Evidence ID or canonical Evidence identity;
- prior lifecycle state or prior lifecycle condition;
- new lifecycle state or lifecycle condition;
- actor, source, verifier, reviewer, authority, registry, or process causing the transition;
- timestamp and relevant temporal context;
- policy basis;
- authority context;
- supporting Evidence, Claim, review record, verification record, challenge record, decision record, or governance record;
- scope of the transition;
- downstream dependency impact; and
- limitations, caveats, or disputed elements.

### 5.2 Permitted Canonical Transition Paths

The following paths are canonical and non-exhaustive:

```text
Observed -> Recorded
Recorded -> Registered
Registered -> Verified
Registered -> Challenged
Registered -> Under Review
Verified -> Challenged
Verified -> Under Review
Challenged -> Under Review
Under Review -> Confirmed
Under Review -> Invalidated
Under Review -> Superseded
Confirmed -> Challenged
Confirmed -> Superseded
Confirmed -> Archived
Verified -> Confirmed
Verified -> Superseded
Verified -> Invalidated
Invalidated -> Archived
Superseded -> Archived
Registered -> Archived
```

A profile MAY restrict or require transition paths. A profile MUST NOT permit silent replacement of lifecycle history.

### 5.3 Transition Constraints

A lifecycle transition MUST NOT:

- erase prior EvidenceLifecycleEvents;
- change Evidence identity to avoid invalidation or challenge history;
- convert registration into verification;
- convert verification into absolute truth;
- convert challenge into invalidation without review, policy basis, or authority basis where required;
- convert supersession into deletion;
- convert archival into disappearance;
- hide downstream dependency impact; or
- suppress subject challenge rights except as law, governance, consent, or legitimate security constraints require.

### 5.4 Transition Reopening

Evidence MAY return from Confirmed to Challenged or Under Review if new grounds appear. Evidence MAY move from Archived to Under Review if archival review discovers unresolved provenance, authenticity, authority, or temporal issues. Such reopening MUST preserve the prior closure or archival event.

---

## 6. Evidence Provenance

**EvidenceProvenance** is the complete lineage of Evidence origin and production.

EvidenceProvenance explains how Evidence came into being before downstream interpretation. It MUST identify the origin facts necessary to distinguish Evidence from untraceable data, unverifiable assertion, or platform-local record.

EvidenceProvenance SHOULD include, where applicable:

- source lineage;
- producer lineage;
- production lineage;
- observation lineage;
- transformation lineage;
- verification lineage;
- custody lineage;
- registry lineage;
- authority context;
- policy context;
- temporal context;
- subject context;
- relationship context; and
- consumption context where consumption affects auditability or downstream interpretation.

Provenance MUST be preserved even when Evidence is invalidated, superseded, archived, migrated, redacted, normalized, summarized, anchored, transferred, or replicated. A system MUST NOT launder Evidence by copying it into a new context without preserving provenance.

---

## 7. Provenance Requirements

A conformant EvidenceProvenance model MUST satisfy the following requirements.

### 7.1 Origin Attribution

Evidence MUST identify its source or origin context sufficiently to support inspection, verification, challenge, and policy evaluation. Anonymous, confidential, or privacy-protected sources MAY be represented under policy, but the provenance model MUST still preserve reviewable authority and accountability semantics where required.

### 7.2 Production Attribution

Evidence MUST identify how and when it was produced, including the producer, production time, production context, and relevant process context where applicable.

### 7.3 Authority Attribution

If Evidence depends on the authority of a producer, issuer, verifier, reviewer, registry, institution, agent, delegate, or governance process, that authority context MUST be traceable. Authority context MUST NOT be inferred solely from platform possession.

### 7.4 Temporal Attribution

Evidence MUST preserve observation time, recording time, production time, registration time, verification time, challenge time, review time, confirmation time, invalidation time, supersession time, archival time, effective time, expiration time, and validity windows where applicable.

### 7.5 Transformation Attribution

If Evidence is transformed, normalized, redacted, summarized, translated, migrated, reissued, corrected, derived, or anchored, the transformation MUST be visible as provenance or lifecycle history. The transformed Evidence MUST link to the prior Evidence or source record where policy permits.

### 7.6 Verification Attribution

Verification provenance MUST identify the verifier, verification scope, verification basis, verification time, verification method class, authority context, limitations, and outcome where applicable.

### 7.7 Challenge Attribution

Challenge provenance MUST identify challenge grounds, challenger authority or standing where applicable, challenge time, review process, reviewer authority, outcome, and downstream impact where applicable.

### 7.8 Registry Attribution

Registry provenance MUST identify registration context, registry lineage, registry correction events, registry migration events, and registry relationship preservation where applicable. Registry provenance MUST NOT imply registry ownership over Evidence.

### 7.9 Consumption Attribution

Where Evidence consumption affects Claims, Standing, Capabilities, Authority, or Decisions, consumption provenance MUST preserve which downstream object consumed the Evidence, under what policy, at what time, with what lifecycle state, and with what interpretation limits.

---

## 8. Evidence Lineage

**EvidenceLineage** is the reconstructable chain of Evidence origin, lifecycle events, relationships, transformations, verifications, challenges, invalidations, supersessions, registry events, custody events, and downstream consumption events.

Lineage is broader than origin provenance. Provenance explains where Evidence came from and how it was produced. Lineage explains how Evidence evolved and how it affected the protocol across time.

EvidenceLineage MUST support reconstruction of:

- source lineage;
- origin lineage;
- production lineage;
- transformation lineage;
- registration lineage;
- verification lineage;
- challenge lineage;
- review lineage;
- confirmation lineage;
- invalidation lineage;
- supersession lineage;
- custody lineage;
- registry lineage;
- relationship lineage;
- consumption lineage;
- archival lineage; and
- downstream dependency lineage.

Lineage MUST remain available even when Evidence becomes invalidated, superseded, or archived. The fact that Evidence once contributed to a Claim, Standing state, Authority evaluation, Capability determination, or Decision MUST remain traceable.

---

## 9. Evidence Evolution

Evidence evolves through events and relationships, not through hidden mutation.

Evidence MAY evolve when:

- an observation becomes recorded;
- a record becomes registered;
- verification is performed;
- verification scope changes;
- a challenge is raised;
- a challenge is reviewed;
- Evidence is confirmed;
- Evidence is found inaccurate, unauthorized, forged, corrupted, expired, or non-conformant;
- Evidence is corrected by new Evidence;
- Evidence is superseded by newer or more authoritative Evidence;
- Evidence relationships change;
- policy context changes;
- authority context changes;
- Evidence is consumed by downstream Claims, Standing, Capabilities, Authority, or Decisions;
- Evidence is archived; or
- a federated registry reports additional lifecycle facts.

Evidence evolution MUST NOT imply that historical states were false merely because later states differ. A lifecycle event creates temporal context. It explains what became known, when it became known, and how that knowledge affects current and historical interpretation.

---

## 10. Evidence Invalidation

**EvidenceInvalidation** is a lifecycle determination that Evidence is invalid, unusable, forged, corrupted, unauthorized, materially inaccurate, expired where policy treats expiration as invalidating, non-conformant, or otherwise ineligible for the claimed evidentiary use.

### 10.1 Invalidation Grounds

Evidence MAY become invalid on grounds including:

- authenticity failure;
- integrity failure;
- provenance failure;
- source authority failure;
- producer authority failure;
- verifier authority failure;
- material inaccuracy;
- material incompleteness;
- unauthorized production;
- unauthorized disclosure;
- consent failure where consent is required;
- policy non-conformance;
- expiration or temporal invalidity;
- corruption;
- forgery;
- identity misattribution;
- subject misattribution;
- duplicated or laundered Evidence;
- broken lineage; or
- confirmed challenge outcome.

### 10.2 Invalidation Requirements

An invalidation event MUST identify:

- the invalidated Evidence;
- invalidation grounds;
- invalidation authority or review context;
- invalidation timestamp;
- effective time of invalidity if different from discovery time;
- supporting Evidence or decision record;
- policy basis;
- affected lifecycle states;
- downstream dependency impact; and
- whether historical uses remain valid for temporal truth.

### 10.3 Invalidation Effects

Invalidated Evidence MUST NOT be treated as current valid Evidence unless a policy explicitly permits limited use with disclosure. Invalidated Evidence MAY remain historically relevant to show what was known at a prior time, why a prior Decision occurred, or why a later correction was required.

Invalidation MUST propagate to dependent Claims, Standing states, Capabilities, Authority evaluations, and Decisions where the invalidated Evidence affected eligibility, confidence, interpretation, authority, or outcome.

Invalidation MUST NOT erase the Evidence. It changes current validity and downstream eligibility while preserving provenance and lineage.

---

## 11. Evidence Supersession

**EvidenceSupersession** is a lifecycle relationship in which Evidence is replaced, corrected, qualified, made obsolete, or made less authoritative by newer, corrected, more complete, or more authoritative Evidence.

### 11.1 Supersession Grounds

Evidence MAY become superseded when:

- a corrected Evidence item replaces an earlier inaccurate item;
- a newer Evidence item covers a later effective period;
- a more authoritative Evidence item resolves an ambiguity;
- a complete Evidence item replaces a partial Evidence item;
- a revised policy context changes recognized evidentiary relevance;
- a verified original replaces an unverified copy;
- a canonical Evidence item replaces a duplicate or derived item;
- a review confirms that prior Evidence is obsolete; or
- a jurisdictional or governance context recognizes a successor Evidence item.

### 11.2 Supersession Requirements

A supersession event MUST identify:

- the superseded Evidence;
- the superseding Evidence;
- supersession grounds;
- supersession timestamp;
- effective time of supersession if different from recording time;
- supersession authority or review context;
- policy basis;
- relationship type;
- whether supersession is total or partial;
- whether prior Evidence remains valid for a historical period; and
- downstream dependency impact.

### 11.3 Supersession Effects

Superseded Evidence MUST remain traceable. Supersession MUST NOT be treated as deletion, invalidation, or proof that the prior Evidence was false unless the supersession event also carries an invalidation basis.

Downstream consumers MUST determine whether superseded Evidence remains usable for the relevant temporal context. A Claim about a historical event MAY still depend on superseded Evidence if the Evidence was valid for that historical period. A current Standing state SHOULD prefer non-superseded Evidence where policy requires currentness.

---

## 12. Challenge Lifecycle

**EvidenceChallenge** is a protocol-recognized dispute about Evidence authenticity, accuracy, completeness, provenance, authority context, consent context, policy conformance, temporal applicability, or contextual applicability.

### 12.1 Challenge States

Challenge lifecycle states SHOULD include:

| Challenge state | Meaning |
|---|---|
| Raised | A challenge has been submitted on defined grounds. |
| Acknowledged | The challenge has been received by the appropriate review context. |
| Under Review | The challenge is being examined. |
| Additional Evidence Requested | Further Evidence is required to assess the challenge. |
| Confirmed | The challenge is upheld in whole or part. |
| Rejected | The challenge is denied under the applicable policy and Evidence. |
| Resolved by Supersession | The challenged Evidence is superseded by another Evidence item. |
| Resolved by Invalidation | The challenged Evidence is invalidated. |
| Closed | The challenge process is complete, while challenge history remains preserved. |

### 12.2 Challenge Requirements

A challenge MUST preserve:

- challenge grounds;
- challenged Evidence;
- challenger identity, role, authority, standing, or protected status where applicable;
- challenge timestamp;
- review authority;
- policy basis;
- supporting Evidence;
- affected lifecycle state;
- interim treatment;
- outcome;
- downstream dependency impact; and
- appeal or reopening context where applicable.

### 12.3 Challenge Effects

A challenge MAY cause Evidence to become Challenged, Under Review, Confirmed, Invalidated, Superseded, or Archived. A challenge MUST remain part of historical lineage even if rejected. Downstream Claims, Standing, Capabilities, Authority, and Decisions MUST disclose or account for challenged Evidence according to policy.

---

## 13. Verification Lifecycle

**EvidenceVerification** is the lifecycle process by which Evidence is tested for integrity, provenance, conformance, authenticity, authority, contextual applicability, or other declared verification scope.

Verification MUST be scope-bound. A verification result MUST NOT be interpreted beyond its stated scope.

### 13.1 Verification States

Verification lifecycle states SHOULD include:

| Verification state | Meaning |
|---|---|
| Requested | Verification has been requested. |
| Performed | A verification process has been executed. |
| Passed | Evidence satisfies the declared verification scope. |
| Failed | Evidence does not satisfy the declared verification scope. |
| Qualified | Evidence satisfies the declared scope only with limitations. |
| Expired | The verification result is no longer current under policy. |
| Superseded | A later verification result replaces the earlier result. |
| Revoked | The verification result is withdrawn by a recognized authority or policy process. |

### 13.2 Verification Requirements

A verification event MUST identify:

- verified Evidence;
- verifier;
- verifier authority context;
- verification timestamp;
- verification scope;
- verification basis;
- verification outcome;
- verification limitations;
- policy context;
- relationship to prior verification results; and
- downstream dependency impact where applicable.

### 13.3 Verification Effects

Verification MAY make Evidence eligible for downstream use, increase confidence, satisfy policy, or establish conformance within scope. Verification MUST NOT convert Evidence into absolute truth. Verified Evidence MAY later be challenged, invalidated, superseded, or archived.

---

## 14. Temporal Truth

**TemporalTruth** is the protocol principle that the truth value, usability, authority, relevance, and downstream effect of Evidence MUST be evaluated in relation to time.

TemporalTruth distinguishes:

- observation time;
- recording time;
- production time;
- registration time;
- verification time;
- challenge time;
- review time;
- confirmation time;
- invalidation discovery time;
- invalidation effective time;
- supersession recording time;
- supersession effective time;
- archival time;
- consumption time;
- decision time;
- policy effective windows;
- authority effective windows;
- validity windows; and
- expiration time.

A statement such as "this Evidence is valid" is incomplete unless the relevant temporal context is known. Evidence may have been valid when consumed by a prior Decision and invalid for current use after later review. Evidence may be superseded for present Standing while remaining historically relevant for a Claim about the past.

Conformant systems MUST preserve enough temporal context to answer:

- What was known at the time?
- What Evidence state existed at the time?
- What policy applied at the time?
- What authority context applied at the time?
- When did the protocol learn the Evidence was invalid, superseded, or challenged?
- Did invalidity apply retroactively or only prospectively?
- Which downstream outputs were valid under temporal truth and which require recomputation, supersession, annotation, or invalidation marking?

---

## 15. Dependency Impact

Evidence lifecycle changes can affect downstream protocol objects. Dependency impact MUST be traceable and policy-governed.

### 15.1 Claims Impact

Claims interpret Evidence. When Evidence is challenged, confirmed, invalidated, superseded, or archived, dependent Claims MUST be reviewed according to policy.

A Claim MAY be:

- unchanged because the lifecycle change does not affect its interpretation;
- qualified because Evidence confidence or scope changed;
- challenged because its supporting Evidence is disputed;
- superseded by a new Claim using successor Evidence;
- invalidated if its required Evidence is invalidated; or
- marked historically valid but currently unsupported.

Claims MUST NOT silently continue to assert facts that depend on invalidated or superseded Evidence without disclosure.

### 15.2 Standing Impact

Standing is a continuously derivable interpretation of Evidence and Claims under policy and algorithmic context. Evidence lifecycle events that affect standing eligibility or contribution MUST trigger recomputation, invalidation marking, supersession, or migration analysis according to policy.

Standing MUST be recomputed, not manually changed. Standing explanations MUST disclose challenged, excluded, discounted, suspended, invalidated, expired, or superseded Evidence and the temporal relevance of the lifecycle event.

### 15.3 Capability Impact

Capabilities depend on recognized Standing, policy, and capability semantics. If Evidence lifecycle changes alter the Standing or Claim basis for a Capability, the Capability determination MUST be re-evaluated according to policy.

A Capability MAY become active, suspended, narrowed, expanded, expired, superseded, or invalidated depending on the downstream effect of the Evidence lifecycle event.

### 15.4 Authority Impact

Authority depends on standing, delegation, policy, governance context, and recognized evidentiary basis. If Evidence supporting Authority is challenged, invalidated, superseded, or temporally inapplicable, Authority evaluations MUST be re-evaluated.

Authority MUST NOT be treated as self-justifying. The Evidence lineage supporting Authority MUST remain inspectable.

### 15.5 Decision Impact

Decisions consume Authority to create recognized protocol outcomes. A later Evidence lifecycle event MAY affect a prior Decision in different ways:

- no effect, if the Decision was valid under temporal truth and policy;
- annotation, if later Evidence changes interpretation but does not undo the Decision;
- review, if policy requires reassessment;
- supersession, if a new Decision replaces a prior Decision;
- invalidation marking, if the Decision depended on Evidence that was invalid at the relevant time; or
- appeal, remedy, or governance process, if human rights, legal rights, or protocol rights require it.

Decisions MUST preserve the Evidence state consumed at decision time. Later lifecycle changes MUST NOT silently rewrite the historical Decision record.

---

## 16. Lifecycle Traceability

Lifecycle traceability is the ability to reconstruct Evidence state and impact from EvidenceLifecycleEvents, EvidenceProvenance, EvidenceLineage, EvidenceRelationships, EvidenceVerification records, EvidenceChallenge records, registry lineage, and downstream consumption references.

A conformant lifecycle trace MUST answer:

- What Evidence existed?
- Who or what produced it?
- What did it concern?
- When was it observed, recorded, produced, registered, verified, challenged, confirmed, invalidated, superseded, consumed, or archived?
- Under what authority and policy context did lifecycle events occur?
- What Evidence supported lifecycle changes?
- Which Claims consumed it?
- Which Standing states depended on it?
- Which Capabilities or Authority evaluations depended on it?
- Which Decisions consumed downstream Authority derived from it?
- What changed after a challenge, verification result, invalidation, or supersession?
- What remained historically true?

Lifecycle traceability MUST NOT depend solely on mutable operational logs. Logs MAY support traceability, but protocol meaning MUST be preserved through canonical lifecycle, provenance, lineage, relationship, and dependency records.

---

## 17. Lifecycle Graph

The Evidence Lifecycle SHOULD be reconstructable as a graph of Evidence and lifecycle-relevant relationships.

Canonical nodes MAY include:

- Evidence;
- EvidenceSubject;
- EvidenceSource;
- EvidenceContext;
- EvidenceProvenance;
- EvidenceLifecycleEvent;
- EvidenceVerification;
- EvidenceChallenge;
- EvidenceInvalidation;
- EvidenceSupersession;
- EvidenceRelationship;
- Claim;
- Standing snapshot;
- Capability determination;
- Authority evaluation;
- Decision;
- Policy context;
- Authority context; and
- Registry record.

Canonical relationships MAY include:

- produced_by;
- observed_by;
- recorded_by;
- registered_by;
- verified_by;
- challenged_by;
- reviewed_by;
- confirmed_by;
- invalidated_by;
- superseded_by;
- derived_from;
- corrects;
- duplicates;
- qualifies;
- supports;
- refutes;
- consumed_by;
- governed_by;
- authorized_by;
- effective_during; and
- archived_by.

Example lifecycle graph:

```text
[EvidenceSource]
      |
      v
[Evidence] --has_provenance--> [EvidenceProvenance]
      |                              |
      |                              v
      |                        [EvidenceLineage]
      |
      +--registered_by----------> [Registry Record]
      |
      +--verified_by------------> [EvidenceVerification]
      |
      +--challenged_by----------> [EvidenceChallenge]
      |                              |
      |                              v
      |                       [Review Outcome]
      |                         /          \
      |                        v            v
      |              [EvidenceInvalidation] [EvidenceSupersession]
      |
      +--supports--------------> [Claim]
                                      |
                                      v
                              [Standing Snapshot]
                                      |
                                      v
                         [Capability / Authority]
                                      |
                                      v
                                  [Decision]
```

The graph is conceptual. This specification does not require a graph database or any particular storage design.

---

## 18. Provenance Reconstruction

Provenance reconstruction is the process of rebuilding the origin and production history of Evidence from canonical Evidence references, provenance records, lineage events, registry relationships, verification records, challenge records, transformation records, and downstream consumption records.

A conformant provenance reconstruction MUST be able to answer:

- What is the Evidence?
- What Artifact or observation became Evidence?
- What Evidence ID or canonical identity identifies it?
- Who or what produced it?
- Who or what was the EvidenceSource?
- What was the EvidenceSubject?
- What EvidenceContext governed production and interpretation?
- What transformations occurred?
- What verification occurred?
- What challenges occurred?
- What invalidations or supersessions occurred?
- What registries recognized it?
- What downstream objects consumed it?
- What lifecycle state existed at a specified time?
- What current lifecycle state is derived from lifecycle history?

If provenance cannot be reconstructed, the Evidence MUST be treated according to policy as incomplete, low-confidence, challenged, under review, excluded, or invalidated. Provenance gaps MUST NOT be hidden from downstream consumers.

---

## 19. Human Sovereignty

Evidence lifecycle management MUST preserve human sovereignty.

Human subjects MUST retain protocol-recognized rights to inspect, understand, challenge, correct, appeal, contextualize, and seek remedy for Evidence that affects their Standing, Capabilities, Authority, eligibility, rights, obligations, or Decisions, subject to lawful, governance, consent, privacy, safety, and security constraints.

A lifecycle implementation MUST NOT:

- hide Evidence use from affected humans where disclosure is required;
- erase challenge history;
- prevent correction from being linked to the corrected Evidence;
- use supersession to conceal prior harms;
- use invalidation to erase accountability;
- use archival to make Evidence unreachable for authorized audit;
- use federation to avoid subject rights; or
- treat automated verification as a substitute for human review where policy requires human review.

Human sovereignty does not require every Evidence item to be public. It requires that lifecycle authority, provenance, challenge, dependency impact, and reviewability remain governed by protocol-recognized rights and constraints.

---

## 20. Federated Lifecycle

Evidence MAY move across systems, organizations, domains, jurisdictions, registries, and infrastructure providers. Federation MUST preserve lifecycle meaning.

A federated lifecycle model MUST:

- preserve canonical Evidence identity;
- preserve lifecycle history;
- preserve provenance and lineage;
- preserve verification scope and limitations;
- preserve challenge state and challenge history;
- preserve invalidation and supersession links;
- preserve temporal context;
- preserve policy and authority context where applicable;
- preserve subject rights and consent boundaries where applicable;
- distinguish local registry visibility from global Evidence truth;
- distinguish registry registration from Evidence verification; and
- disclose lifecycle gaps introduced by migration, replication, redaction, export, or import.

A receiving registry or domain MAY add local lifecycle events, local verification, local policy interpretation, or local archival context. It MUST NOT silently rewrite the originating lifecycle history.

---

## 21. Lifecycle Guarantees

P-EV-04 establishes the following protocol guarantees:

1. Evidence lifecycle history is append-preserving.
2. Evidence provenance is required and must remain reconstructable.
3. Evidence lineage must survive invalidation, supersession, archival, migration, and federation.
4. Registration does not equal verification.
5. Verification does not equal absolute truth.
6. Challenge does not equal invalidation.
7. Invalidation does not erase Evidence.
8. Supersession does not delete prior Evidence.
9. Archival does not break auditability.
10. Current truth and temporal truth must be distinguishable.
11. Downstream Claims, Standing, Capabilities, Authority, and Decisions must react to lifecycle changes according to policy.
12. Human challenge rights and reviewability must remain visible where required.
13. Lifecycle state must be derived from lifecycle events, not hidden mutable status.
14. Federated systems must preserve canonical lifecycle meaning.

---

## 22. Security Implications

Evidence lifecycle and provenance protect the protocol against attacks on truth history.

### 22.1 Provenance Fabrication

An attacker may fabricate origin, source, producer, authority, or temporal context. Conformant Evidence MUST make provenance inspectable and challengeable. Downstream systems SHOULD limit use of Evidence with broken, circular, unverifiable, or suspicious provenance according to policy.

### 22.2 Evidence Laundering

Evidence laundering occurs when low-authority, invalid, challenged, or unverifiable Evidence is copied into a trusted context to appear authoritative. Lifecycle lineage MUST preserve source, registry, transformation, and authority context to prevent laundering.

### 22.3 Silent Replacement

Silent replacement occurs when corrected or newer Evidence overwrites prior Evidence without supersession history. Supersession MUST preserve both prior and successor Evidence and MUST identify scope, effective time, and dependency impact.

### 22.4 Hidden Invalidation

Hidden invalidation occurs when Evidence is known to be invalid but continues to support downstream outcomes. Invalidation events MUST be discoverable by authorized downstream consumers and MUST trigger impact analysis according to policy.

### 22.5 Challenge Suppression

Challenge suppression occurs when disputes are hidden from downstream consumers or affected subjects. Challenge history MUST remain visible where authorized and MUST be reflected in standing, authority, and decision explanations according to policy.

### 22.6 Temporal Confusion

Temporal confusion occurs when current validity is confused with past validity or when discovery time is confused with effective invalidity. TemporalTruth MUST preserve relevant time distinctions.

### 22.7 Registry Capture

Registry capture occurs when a registry attempts to redefine Evidence identity, suppress lifecycle history, or assert ownership over Evidence. Registries MUST preserve canonical references, lineage, and non-ownership semantics.

---

## 23. Canonical Concepts

P-EV-04 defines or refines the following canonical concepts.

| Concept | Definition |
|---|---|
| EvidenceLifecycle | The protocol-recognized state model and event history of Evidence over time. |
| EvidenceLifecycleState | A named lifecycle condition of Evidence at a point in time. |
| EvidenceLifecycleEvent | A traceable event that records, changes, confirms, qualifies, or contextualizes Evidence lifecycle state or lifecycle-relevant relationships. |
| EvidenceLineage | The reconstructable chain of Evidence origin, lifecycle events, relationships, transformations, verifications, challenges, invalidations, supersessions, registry events, custody events, and downstream consumption events. |
| EvidenceProvenance | The complete lineage of Evidence origin and production. |
| EvidenceInvalidation | A lifecycle determination that Evidence is invalid or ineligible for a claimed evidentiary use under defined grounds and policy. |
| EvidenceSupersession | A lifecycle relationship in which Evidence is replaced, corrected, qualified, made obsolete, or made less authoritative by successor Evidence. |
| EvidenceChallenge | A protocol-recognized dispute about Evidence authenticity, accuracy, completeness, provenance, authority context, consent context, policy conformance, temporal applicability, or contextual applicability. |
| EvidenceVerification | A lifecycle process by which Evidence is tested for integrity, provenance, conformance, authenticity, authority, contextual applicability, or other declared verification scope. |
| TemporalTruth | The protocol principle that Evidence truth value, usability, authority, relevance, and downstream effect must be evaluated in relation to time. |

These concepts MUST be interpreted consistently with RFC-004, P-EV-02, P-EV-03, RFC-005, and RFC-005-H1. P-EV-04 does not introduce a competing Evidence model.

---

## 24. Implementation Guidance

The following guidance is non-exhaustive and implementation-neutral.

1. Implementations SHOULD model lifecycle changes as append-preserving events.
2. Implementations SHOULD derive current lifecycle state from lifecycle history.
3. Implementations MUST preserve prior lifecycle states when recording corrections.
4. Implementations MUST distinguish registration from verification.
5. Implementations MUST distinguish challenge, review, invalidation, and supersession.
6. Implementations SHOULD preserve lifecycle state at downstream consumption time.
7. Implementations SHOULD index lifecycle events by Evidence identity, subject, source, lifecycle state, timestamp, challenge state, verification state, invalidation, supersession, policy context, authority context, and downstream dependency where applicable.
8. Implementations SHOULD expose lifecycle explanations sufficient for authorized audit and human review.
9. Implementations MUST NOT require blockchain, ledger, database, API, or storage-specific semantics to satisfy this specification.
10. Implementations SHOULD support temporal reconstruction without mutating canonical history.
11. Implementations SHOULD treat administrative actions affecting Evidence lifecycle as governance-relevant lifecycle events with authority, provenance, and auditability.
12. Implementations SHOULD preserve enough canonical references to rebuild dependency impact when Evidence changes state.
13. Implementations SHOULD make simulation, what-if analysis, and projected impact visibly distinct from canonical lifecycle history.
14. Implementations MUST preserve portability and federation-safe semantics.
15. Implementations MUST preserve human challenge and review rights where required by policy, consent, governance, or law.

---

## 25. Future Dependencies

P-EV-04 is expected to inform future protocol work, including:

- Evidence verification profiles;
- Evidence challenge and appeal procedures;
- Evidence invalidation propagation rules;
- Evidence supersession relationship profiles;
- Evidence dependency graph profiles;
- temporal truth evaluation profiles;
- registry federation profiles;
- provenance reconstruction requirements;
- lifecycle audit profiles;
- standing recomputation profiles;
- authority impact profiles;
- decision review and remedy profiles; and
- human sovereignty and consent enforcement profiles.

Future specifications MUST NOT weaken the lifecycle guarantees defined here without an explicit supersession of P-EV-04.

---

## 26. Acceptance Criteria

A conformant Evidence Lifecycle & Provenance specification satisfies the following criteria:

- [x] Defines EvidenceLifecycle.
- [x] Defines EvidenceLifecycleState.
- [x] Defines EvidenceLifecycleEvent.
- [x] Defines EvidenceLineage.
- [x] Defines EvidenceProvenance.
- [x] Defines EvidenceInvalidation.
- [x] Defines EvidenceSupersession.
- [x] Defines EvidenceChallenge.
- [x] Defines EvidenceVerification.
- [x] Defines TemporalTruth.
- [x] Defines canonical lifecycle states: Observed, Recorded, Registered, Verified, Challenged, Under Review, Confirmed, Invalidated, Superseded, and Archived.
- [x] Defines lifecycle transition rules.
- [x] Explains how Evidence evolves.
- [x] Explains how Evidence becomes invalid.
- [x] Explains how Evidence becomes superseded.
- [x] Explains how provenance is preserved.
- [x] Explains how lineage is reconstructed.
- [x] Explains how downstream Claims react.
- [x] Explains how Standing reacts.
- [x] Explains how Capabilities react.
- [x] Explains how Authority reacts.
- [x] Explains how Decisions react.
- [x] Defines challenge history preservation.
- [x] Defines verification history preservation.
- [x] Defines temporal truth.
- [x] Defines dependency impact.
- [x] Defines lifecycle traceability.
- [x] Defines provenance reconstruction.
- [x] Preserves human sovereignty.
- [x] Supports federated lifecycle semantics.
- [x] Avoids storage details.
- [x] Avoids APIs.
- [x] Avoids blockchain assumptions.
- [x] Uses protocol language and normative terms.
