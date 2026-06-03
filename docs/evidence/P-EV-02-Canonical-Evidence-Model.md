# P-EV-02 — Canonical Evidence Model

| Field | Value |
|---|---|
| Document ID | P-EV-02 |
| Title | Canonical Evidence Model |
| Status | Draft |
| Category | Evidence Layer |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-03 |
| Related | RFC-004 Evidence Layer v1.0, RFC-005 Claims Framework, RFC-005-H1 Standing Traceability, P-EV-01.5 Strategic Implications, P-EV-01.6 Evidence and Human Sovereignty |

---

## Abstract

This document defines the Canonical Evidence Model for the AOC Protocol. It establishes Evidence as the foundational protocol primitive from which Claims, Standing, Capabilities, Authority, and Decisions derive their explainable force. It specifies what Evidence is, what makes something Evidence, how Evidence is represented semantically, how Evidence remains traceable and sovereign, and how Evidence is distinguished from downstream interpretations and outcomes.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Evidence Definition](#3-evidence-definition)
4. [Evidence Principles](#4-evidence-principles)
5. [Evidence Types](#5-evidence-types)
6. [Evidence Subject Model](#6-evidence-subject-model)
7. [Evidence Structure](#7-evidence-structure)
8. [Evidence Provenance](#8-evidence-provenance)
9. [Evidence Source Model](#9-evidence-source-model)
10. [Evidence Lifecycle](#10-evidence-lifecycle)
11. [Evidence Relationships](#11-evidence-relationships)
12. [Evidence Context](#12-evidence-context)
13. [Evidence Verification](#13-evidence-verification)
14. [Evidence Challenges](#14-evidence-challenges)
15. [Evidence Sovereignty](#15-evidence-sovereignty)
16. [Evidence Portability](#16-evidence-portability)
17. [Evidence Traceability](#17-evidence-traceability)
18. [Evidence Profiles](#18-evidence-profiles)
19. [Evidence Registry](#19-evidence-registry)
20. [Evidence Anchoring](#20-evidence-anchoring)
21. [Evidence Guarantees](#21-evidence-guarantees)
22. [Security Implications](#22-security-implications)
23. [Evidence vs Data](#23-evidence-vs-data)
24. [Evidence vs Claims](#24-evidence-vs-claims)
25. [Evidence vs Standing](#25-evidence-vs-standing)
26. [Evidence Registry Model](#26-evidence-registry-model)
27. [Implementation Guidance](#27-implementation-guidance)
28. [Future Dependencies](#28-future-dependencies)
29. [Acceptance Criteria](#29-acceptance-criteria)

---

## 1. Executive Summary

The Canonical Evidence Model defines the foundational representation of Evidence within AOC.

Evidence is the source of protocol truth. It is the atomic unit of verifiable reality from which all downstream protocol interpretations derive. Evidence represents observed facts, recorded events, verified artifacts, and attested information. Evidence does not represent interpretation, opinion, trust, authority, standing, capability, or decision.

The architectural order is:

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

Evidence is the root layer. Claims interpret Evidence. Standing is derived from Evidence and Claims under policy and algorithmic context. Capabilities and Authority emerge from recognized Standing and policy. Decisions consume Authority to create recognized protocol outcomes.

Evidence depends on nothing downstream. A conformant Evidence item MUST remain meaningful without relying on a Claim, Standing state, Capability, Authority grant, or Decision. Downstream objects MAY reference Evidence, but they MUST NOT redefine what the Evidence is.

If Evidence becomes ambiguous, the entire protocol becomes ambiguous. This model therefore defines Evidence as a first-class protocol primitive with explicit subject, source, context, provenance, lifecycle, relationships, verification, traceability, portability, and sovereignty semantics.

---

## 2. Problem Statement

Most digital systems fail to distinguish between:

- data;
- evidence;
- claims;
- trust;
- authority; and
- decisions.

When these concepts collapse into one another, systems treat stored data as if it were verified Evidence, treat Claims as if they were facts, treat Trust as if it were Authority, and treat Decisions as if they were self-justifying. The result is protocol ambiguity.

This ambiguity creates predictable failures:

- Evidence becomes mixed with interpretation.
- Provenance is lost or hidden inside platform-specific logs.
- Auditability is lost when systems cannot reconstruct origin, lifecycle, or consumption history.
- Trust becomes opaque because consumers cannot distinguish source reliability, verification status, policy interpretation, and authority.
- Standing and decisions become difficult to challenge because the Evidence that produced them is not independently traceable.

AOC requires a canonical Evidence model so that every downstream trust, governance, capability, authority, and decision mechanism can rely on a stable foundation. Evidence MUST be represented in a manner that preserves reality before interpretation is applied to it.

---

## 3. Evidence Definition

**Evidence** is a traceable representation of an observed, recorded, verified, or attested fact.

Evidence exists to preserve protocol-recognizable reality in a form that can be inspected, referenced, verified, challenged, transported, and reused across domains without becoming platform-owned or interpretation-dependent.

Evidence MUST be:

- **Traceable**: its origin, changes, verification, challenges, and consumption MUST be reconstructable.
- **Auditable**: it MUST support independent review of what happened, when, by whom, and under what context.
- **Portable**: it MUST remain meaningful across conformant systems, organizations, domains, and time.
- **Verifiable**: it MUST expose enough structure to test integrity, provenance, and conformance to Evidence rules.
- **Contextual**: it MUST preserve the context required to understand what the Evidence represents.
- **Versionable**: it MUST preserve historical versions, supersession, invalidation, and lifecycle changes without overwriting history.
- **Explainable**: it MUST support explanation of why it exists, what it records, where it came from, and how it was used.

Something becomes Evidence only when it is represented within the Canonical Evidence Model. A document, event log, sensor reading, credential, or human statement is not automatically Evidence merely because it contains information. It becomes Evidence when it has a canonical Evidence identity, type, subject, source, timestamp, context, content reference or content representation, provenance, lifecycle state, and traceable relationships sufficient for protocol use.

---

## 4. Evidence Principles

### 4.1 Truth Preservation

Evidence MUST preserve observed or attested reality before interpretation. Evidence MUST NOT silently modify, summarize away, or reinterpret the fact it represents. Corrections, challenges, supersessions, or invalidations MUST be recorded as lifecycle or relationship events rather than hidden rewrites.

### 4.2 Provenance

Evidence MUST carry provenance. Provenance identifies the complete lineage of Evidence origin, including source, producer, production time, production context, and authority context where applicable. Evidence without provenance is not conformant Evidence.

### 4.3 Traceability

Evidence MUST be traceable forward and backward. A conformant system MUST be able to reconstruct who created, verified, challenged, consumed, changed, superseded, or invalidated Evidence and when those events occurred.

### 4.4 Sovereignty

Evidence SHOULD remain under the sovereignty of the subject to which it pertains, subject to law, policy, consent, and legitimate governance constraints. A platform MAY process Evidence, but the platform MUST NOT become the source of Evidence ownership merely by storing, indexing, validating, or displaying it.

### 4.5 Portability

Evidence MUST be representable across systems without losing canonical identity, context, provenance, lifecycle, or verification semantics. Portability is a protocol property, not an export feature.

### 4.6 Verifiability

Evidence MUST expose sufficient semantic structure for independent verification. Verification MAY evaluate integrity, provenance, lifecycle status, source authority, and verification chains, but verification MUST NOT be confused with final truth, legal validity, standing, authority, or decision outcome.

### 4.7 Immutability of History

Evidence history MUST be append-preserving. Later events MAY challenge, invalidate, confirm, supersede, archive, or contextualize Evidence, but they MUST NOT erase the historical record of prior states.

### 4.8 Context Preservation

Evidence MUST preserve the context necessary to understand its meaning and limits. Evidence without context can be laundered, replayed, or misapplied outside the circumstances that gave it evidentiary value.

---

## 5. Evidence Types

EvidenceType is the canonical classification of what kind of fact, event, artifact, or attestation an Evidence item represents. Evidence types MUST aid interpretation without becoming claims, standing, authority, or decisions.

Canonical evidence categories include:

| Evidence Type | Meaning |
|---|---|
| Observation Evidence | Evidence representing an observed condition, behavior, state, measurement, or event. |
| Verification Evidence | Evidence representing the result or record of a verification process. |
| Attestation Evidence | Evidence representing an attested statement made by a person, organization, system, agent, or authority. |
| Transaction Evidence | Evidence representing an exchange, transfer, acceptance, execution, payment, agreement, or state transition. |
| Identity Evidence | Evidence representing identity attributes, identity verification events, identity bindings, or identity assurance artifacts. |
| Compliance Evidence | Evidence representing compliance activity, control satisfaction, audit findings, regulatory submissions, remediation, or exceptions. |
| Credential Evidence | Evidence representing issuance, presentation, revocation, expiration, renewal, or validation of credentials. |
| Governance Evidence | Evidence representing policy adoption, governance action, delegation, approval process, consent, challenge, or review. |
| Decision Evidence | Evidence recording that a decision occurred, including the decision record as an observed protocol event. Decision Evidence is not itself the Decision's authority. |
| Execution Evidence | Evidence representing runtime execution, agent action, workflow completion, system output, or operational trace. |

Future Evidence types MAY be defined by later specifications. Extensions MUST preserve the Evidence boundary and MUST NOT introduce types that encode interpretation, standing, capability, authority, or decision power as if those properties were raw Evidence.

---

## 6. Evidence Subject Model

**EvidenceSubject** identifies the entity, object, policy, event, process, or matter to which Evidence pertains.

An Evidence item MAY reference one subject or multiple subjects. Multi-subject Evidence MUST preserve the role of each subject where the distinction is material. For example, an employment verification may reference a person as the verified individual, an organization as the employer, and a credential as the item being verified.

Canonical EvidenceSubject examples include:

- Person;
- Organization;
- Project;
- Vendor;
- Team;
- Agent;
- Service;
- Asset;
- Policy; and
- Decision.

EvidenceSubject MUST NOT be confused with EvidenceSource. The subject is what the Evidence is about. The source is where the Evidence came from or who produced it. A person may be the subject of Evidence without being the source. A system may be the source of Evidence about a project without being the subject of the Evidence.

---

## 7. Evidence Structure

The Canonical Evidence Model defines semantic structure, not an implementation schema. Implementations MAY encode Evidence in different formats, but conformant Evidence MUST preserve the following canonical components.

| Component | Semantic requirement |
|---|---|
| Evidence Identifier | A persistent canonical identifier for the Evidence item. It SHOULD be globally unique, stable, portable, and bound to the Evidence content and production context. |
| Evidence Type | The canonical category of Evidence represented by the item. |
| Evidence Subject | The subject or subjects to which the Evidence pertains, including material subject roles where necessary. |
| Evidence Source | The person, organization, authority, system, device, sensor, agent, service, or third party from which the Evidence originated. |
| Evidence Timestamp | The relevant time values for the Evidence, including creation, observation, recording, effective, verification, challenge, expiration, revocation, supersession, or archival time where applicable. |
| Evidence Context | The temporal, jurisdictional, operational, governance, risk, identity, and other contextual information required to interpret the Evidence. |
| Evidence Content | The represented fact, event, artifact reference, attested information, or recorded content. Content MAY be directly represented or canonically referenced. |
| Evidence Provenance | The lineage of origin and production for the Evidence. |
| Evidence Status | The lifecycle state of the Evidence. |
| Evidence Relationships | Traceable links to related Evidence, Claims, Standing, Capabilities, Authorities, Decisions, Policies, or other protocol-recognized objects. |

Evidence is represented by the combination of these components. No single component is sufficient on its own. Data without context is not Evidence. Content without provenance is not Evidence. An identifier without lifecycle and traceability is not Evidence. A trusted source without verifiable content is not Evidence.

---

## 8. Evidence Provenance

**Provenance** is the complete lineage of Evidence origin.

Evidence provenance MUST answer:

- Where did it come from?
- Who produced it?
- When was it observed, recorded, produced, or attested?
- Under what context was it produced?
- Under what authority was it produced, where authority is relevant?

EvidenceProvenance SHOULD include source lineage, production lineage, transformation lineage, verification lineage, custody lineage, and registry lineage where applicable. If Evidence is transformed, normalized, redacted, summarized, migrated, anchored, or reissued, the transformation MUST be visible as provenance or lifecycle history.

Authority context in provenance does not mean Evidence contains Authority. It means the Evidence records the authority basis under which the source or producer acted, if such authority affected the Evidence's creation or admissibility. A licensing board issuing a credential may have authority to issue the credential. That authority is provenance context; it is not transferred into the Evidence as a capability held by the subject.

Evidence without provenance MUST NOT be treated as conformant Evidence. It MAY be stored as data, treated as an artifact, or used as non-conformant input, but it MUST NOT silently enter the Evidence layer.

---

## 9. Evidence Source Model

**EvidenceSource** identifies the origin of Evidence.

Canonical EvidenceSource examples include:

- Person;
- Organization;
- Authority;
- System;
- Device;
- Sensor;
- Agent;
- Service; and
- Third Party.

EvidenceSource MUST be separated from source trust. A source identifies origin; it does not by itself establish reliability, authority, truthfulness, standing, or decision validity. Source reliability MAY be evaluated by downstream verification, policy, standing, or governance mechanisms, but Evidence MUST preserve source identity even when source trust is low, unknown, challenged, or invalidated.

A high-trust source can produce incorrect Evidence. A low-trust source can produce accurate Evidence. The protocol MUST preserve source provenance and verification state so that downstream systems can apply explicit policy rather than hidden trust assumptions.

---

## 10. Evidence Lifecycle

EvidenceLifecycle records the state of Evidence over time. Lifecycle states MUST be historical, traceable, and append-preserving.

Canonical lifecycle states include:

| State | Meaning |
|---|---|
| Observed | A fact, event, condition, or artifact has been observed but may not yet be formally recorded. |
| Recorded | The observation, artifact, event, or attestation has been recorded as Evidence with canonical structure. |
| Verified | The Evidence has passed a defined verification process. |
| Challenged | The Evidence has been disputed on defined grounds. |
| Under Review | A challenge, correction, authority question, or governance process is actively reviewing the Evidence. |
| Confirmed | The Evidence has been confirmed after review or verification. |
| Invalidated | The Evidence has been found invalid, unusable, forged, corrupted, unauthorized, materially inaccurate, or non-conformant under policy. |
| Superseded | The Evidence has been replaced or made obsolete by newer, corrected, or more authoritative Evidence. |
| Archived | The Evidence is retained for historical, audit, compliance, or lineage purposes but is no longer active for ordinary consumption. |

Lifecycle state changes MUST identify the actor, source, authority context, policy basis, timestamp, and supporting Evidence or decision record that caused the change where applicable. Lifecycle state MUST NOT be overwritten without preserving the prior state in history.

---

## 11. Evidence Relationships

EvidenceRelationship defines how Evidence is linked to other protocol-recognized objects. Relationships MUST be typed, directional where material, traceable, and explainable.

Evidence may relate to:

| Related object | Relationship semantics |
|---|---|
| Evidence | Evidence MAY support, duplicate, correct, supersede, contradict, derive from, verify, challenge, or contextualize other Evidence. |
| Claims | Evidence MAY support, refute, qualify, or be cited by Claims. Evidence does not become the Claim. |
| Standing | Evidence MAY contribute to, be excluded from, trigger recomputation of, invalidate, or explain Standing. Evidence does not contain Standing. |
| Capabilities | Evidence MAY support capability eligibility or constraints through Claims, Standing, and policy. Evidence does not grant Capability by itself. |
| Authorities | Evidence MAY demonstrate authority basis, delegation record, revocation, or scope condition. Evidence does not become Authority. |
| Decisions | Evidence MAY be consumed by Decisions, required as a precondition, created by Decisions, or record that a Decision occurred. Evidence does not decide. |
| Policies | Evidence MAY satisfy, violate, trigger, interpret under, or be governed by Policies. Policy determines downstream meaning; Evidence preserves the fact. |

Relationship semantics MUST distinguish supporting, deriving, verifying, challenging, superseding, consuming, and producing relationships. A conformant system MUST NOT use a generic relationship link when the relationship affects standing, authority, auditability, challenge rights, or decision reconstruction.

Evidence relationships preserve both forward traceability and reverse traceability. A consumer MUST be able to ask what downstream Claims, Standing states, Capabilities, Authorities, Decisions, and Policies consumed an Evidence item. A reviewer MUST be able to ask which Evidence items produced a downstream state.

---

## 12. Evidence Context

**EvidenceContext** is the set of circumstances required to interpret Evidence without ambiguity.

Canonical context categories include:

| Context | Meaning |
|---|---|
| Temporal Context | Observation time, recording time, effective time, expiration time, validity windows, sequence, and historical relevance. |
| Jurisdiction Context | Legal, regulatory, geographic, contractual, or institutional jurisdiction relevant to interpretation. |
| Operational Context | Process, workflow, environment, system state, business event, runtime condition, or operational boundary. |
| Governance Context | Policy, authority basis, consent regime, review process, delegation path, or governance rule active at the time. |
| Risk Context | Risk domain, materiality, sensitivity, impact, assurance requirement, or high-risk classification. |
| Identity Context | Subject identifiers, source identifiers, issuer bindings, identity assurance level, or identity verification basis. |

Evidence without context loses meaning. The same recorded fact may have different implications depending on time, jurisdiction, operating environment, governance policy, risk threshold, and identity binding. Context MUST be preserved so that Evidence cannot be reused deceptively outside the conditions under which it was created.

---

## 13. Evidence Verification

**Verification** is the traceable process of evaluating Evidence against defined rules, sources, authorities, and supporting Evidence.

EvidenceVerification MUST distinguish:

| Concept | Meaning |
|---|---|
| Verification | The process of evaluating Evidence conformance, integrity, provenance, authority context, lifecycle state, or relationship consistency. |
| Verification Status | The current result of verification, such as unverified, verified, failed, expired, challenged, or indeterminate. |
| Verification Source | The actor, system, authority, agent, or process that performed or supplied verification. |
| Verification Authority | The authority basis, policy basis, credential, or governance role under which verification was recognized. |
| Verification Evidence | Evidence supporting the verification result. |
| Verification Chain | The ordered lineage of verification steps, dependencies, sources, and results. |

Verification MUST be traceable. A verification result without source, timestamp, method, authority context where applicable, and supporting Evidence MUST NOT be treated as complete verification.

Verification does not automatically establish truth, standing, capability, authority, legal validity, or decision outcome. It establishes that Evidence satisfied a specified verification process under specified conditions.

---

## 14. Evidence Challenges

Evidence Challenges are protocol-recognized disputes about Evidence authenticity, accuracy, completeness, provenance, authority context, or contextual applicability.

Grounds for challenge include:

| Challenge ground | Meaning |
|---|---|
| Authenticity | The Evidence may not be genuine or may not correspond to its asserted origin. |
| Accuracy | The Evidence may contain materially incorrect information. |
| Completeness | The Evidence may omit material facts, context, dependencies, or qualifications. |
| Provenance | The Evidence lineage may be incomplete, false, broken, or unverifiable. |
| Authority | The Evidence source or producer may have lacked authority to produce or attest the Evidence for the represented purpose. |
| Context | The Evidence may be used outside the temporal, jurisdictional, operational, governance, risk, or identity context that gives it meaning. |

Challenges MUST be preserved as Evidence lifecycle and relationship history. A challenge MAY cause Evidence to become Challenged, Under Review, Confirmed, Invalidated, or Superseded. Challenge history MUST remain visible even if the Evidence is later confirmed.

Evidence challenges protect appealability. Downstream Claims, Standing states, Capabilities, Authorities, and Decisions that consumed challenged Evidence SHOULD disclose the challenge state and MAY require recomputation, suspension, discounting, exclusion, human review, or supersession according to policy.

---

## 15. Evidence Sovereignty

P-EV-01.6 frames Evidence and Human Sovereignty as a constitutional concern: Evidence about a subject MUST NOT become a mechanism for platform capture, opaque scoring, or loss of human agency.

Evidence belongs to the subject to which it pertains, subject to applicable consent, governance, policy, legal, and legitimate operational constraints. Systems MAY consume Evidence. Registries MAY index Evidence. Verifiers MAY evaluate Evidence. Decision processes MAY rely on Evidence. None of those activities SHOULD convert subject Evidence into platform-owned Evidence.

A conformant Evidence model SHOULD preserve the following sovereignty properties:

- subjects SHOULD be able to identify Evidence about them;
- subjects SHOULD be able to understand Evidence context, provenance, lifecycle, and use;
- subjects SHOULD have policy-defined mechanisms to challenge inaccurate, incomplete, miscontextualized, or unauthorized Evidence;
- Evidence SHOULD remain portable across systems and organizations;
- Evidence SHOULD NOT be locked into a single vendor, repository, identity provider, scoring system, or governance interface; and
- platforms MUST NOT hide Evidence lineage, lifecycle, or consumption history when that history affects rights, standing, authority, eligibility, or consequential decisions.

Evidence sovereignty does not require that all Evidence be publicly disclosed or unilaterally controlled by the subject. Privacy, confidentiality, safety, legal process, organizational governance, and legitimate authority constraints MAY limit access or use. However, those limits MUST be explicit and traceable rather than hidden behind platform control.

---

## 16. Evidence Portability

**Portable Evidence** is Evidence whose identity, content reference or content representation, subject, source, context, provenance, lifecycle, relationships, and verification semantics remain meaningful outside the system in which it was first recorded.

Portability applies across:

| Portability domain | Requirement |
|---|---|
| Cross-domain Evidence | Evidence SHOULD remain interpretable across domains such as HR, project governance, vendor governance, compliance, education, identity, and AI execution. |
| Cross-organization Evidence | Evidence SHOULD be transferable or referable across organizations without losing source, subject, provenance, lifecycle, or verification semantics. |
| Cross-system Evidence | Evidence SHOULD survive migration between platforms, registries, archives, verification services, and governance systems. |

Portable Evidence MUST preserve canonical identity and lineage. It MUST NOT depend on proprietary interface state, hidden logs, non-exportable identifiers, or platform-specific trust assumptions to retain evidentiary value.

Portability MAY be constrained by privacy, confidentiality, consent, jurisdiction, retention policy, or security. Such constraints SHOULD be represented as policy and context rather than as hidden platform behavior.

---

## 17. Evidence Traceability

RFC-005-H1 establishes traceability as a constitutional requirement for standing. The Canonical Evidence Model applies the same principle at the Evidence root layer.

Every Evidence item MUST answer:

- Who created it?
- Who verified it?
- Who challenged it?
- Who consumed it?
- What changed?
- When did each event occur?

Evidence traceability MUST include creation lineage, source lineage, lifecycle lineage, verification lineage, challenge lineage, relationship lineage, and consumption lineage where applicable.

Forward traceability asks: which Claims, Standing states, Capabilities, Authorities, Decisions, Policies, or Evidence items consumed or depended on this Evidence?

Reverse traceability asks: which Evidence, sources, verification records, lifecycle events, policies, and authority contexts produced this Evidence or its downstream interpretations?

Traceability MUST NOT be limited to operational logs. Logs MAY support traceability, but protocol traceability requires canonical relationships and lifecycle events that survive platform migration and audit reconstruction.

---

## 18. Evidence Profiles

Evidence MAY be aggregated into Evidence Profiles.

An Evidence Profile is a curated or policy-defined aggregation of Evidence about a subject, role, domain, capability, risk posture, compliance state, credential history, execution history, or governance context. Evidence Profiles MAY improve portability and explainability by grouping Evidence without converting the profile into Standing, Authority, or a Decision.

This document introduces Evidence Profiles only as a dependent concept. P-EV-05 Evidence Profiles will define profile composition, scope, update rules, challenge handling, portability, sovereignty, and governance requirements.

---

## 19. Evidence Registry

An Evidence Registry is a protocol-recognized mechanism for making canonical Evidence locatable, traceable, and auditable.

The purpose of an Evidence Registry is to:

- store or reference canonical Evidence;
- preserve lineage;
- preserve relationships;
- preserve lifecycle;
- support verification;
- support challenge and review visibility; and
- support portability across conformant systems.

The Evidence Registry MUST NOT become the source of truth by platform ownership alone. The registry preserves Evidence identity and lineage; it does not create truth, standing, authority, or decision validity by itself.

This document introduces the Evidence Registry concept only at the semantic level. P-EV-03 Evidence Registry will define the canonical registry model in greater depth.

---

## 20. Evidence Anchoring

Evidence MAY be cryptographically anchored so that Evidence existence, integrity, timestamp, or lineage can be independently verified.

Evidence anchoring MAY support tamper detection, independent existence proofs, chain-of-custody verification, and cross-system portability. Anchoring MUST NOT be confused with Evidence truth, source authority, legal validity, or decision authority. A forged fact can be anchored. Anchoring proves that a representation existed or remained unchanged under defined rules; it does not prove that the represented fact is true.

This document introduces Evidence Anchoring only as a dependent concept. P-EV-06 Evidence Anchoring will define anchoring semantics, verification boundaries, and security requirements.

---

## 21. Evidence Guarantees

Conformant Evidence systems MUST preserve the following guarantees:

- **No orphan evidence**: Evidence MUST identify subject, source, context, provenance, lifecycle, and relationships where applicable.
- **No evidence without provenance**: Evidence without lineage is not conformant Evidence.
- **No evidence without context**: Evidence MUST preserve the context required to understand what it represents and where it applies.
- **No evidence without lifecycle**: Evidence MUST have a lifecycle state and lifecycle history.
- **No evidence without traceability**: Evidence MUST support reconstruction of origin, verification, challenge, consumption, and change history.
- **No hidden evidence history**: lifecycle events, transformations, challenges, confirmations, invalidations, and supersessions MUST remain visible to authorized reviewers.
- **No platform-owned evidence**: platforms MAY store, process, verify, or index Evidence, but MUST NOT convert Evidence sovereignty into proprietary ownership by control of infrastructure.

These guarantees are protocol requirements. A system that stores records but cannot preserve provenance, context, lifecycle, traceability, or sovereignty is not a conformant Evidence system.

---

## 22. Security Implications

The Canonical Evidence Model exists in part to resist attacks against the root of protocol truth.

| Risk | Protocol implication |
|---|---|
| Evidence forgery | Systems MUST support integrity checks, source attribution, provenance review, and challenge mechanisms. |
| Evidence laundering | Copying low-authority or malicious Evidence into a trusted system MUST NOT erase original source, authority context, or lineage. |
| Evidence tampering | Changes MUST be detectable through identifiers, lifecycle history, provenance, anchoring, verification, or other conformant controls. |
| Evidence replay | Evidence MUST preserve temporal, jurisdictional, operational, governance, risk, and identity context so old or context-bound Evidence is not reused deceptively. |
| Context manipulation | Context MUST be explicit and traceable because altering context can alter downstream standing and authority without altering content. |
| Verification abuse | Verification MUST identify method, source, authority context, and scope so verification cannot be misrepresented as universal truth or authority. |
| Provenance attacks | Broken, fabricated, incomplete, or circular lineage MUST be challengeable and SHOULD limit downstream use according to policy. |
| Identity spoofing | EvidenceSource and EvidenceSubject identity bindings MUST be traceable and verifiable where identity affects use. |
| Sybil evidence | Multiple Evidence items from coordinated, duplicate, fabricated, or low-authority sources MUST NOT inflate Claims, Standing, or Authority without source and relationship analysis. |

Security controls MUST protect Evidence without collapsing Evidence into trust, authority, or decision-making. The protocol preserves facts and lineage so downstream governance can evaluate them explicitly.

---

## 23. Evidence vs Data

Data is not Evidence.

Data may be a value, file, message, record, metric, log entry, document, credential, sensor reading, or database row. Data becomes Evidence only when represented within the Evidence model.

The difference is constitutional:

| Data | Evidence |
|---|---|
| May contain information. | Represents an observed, recorded, verified, or attested fact. |
| May lack provenance. | MUST preserve provenance. |
| May lack context. | MUST preserve context. |
| May be platform-bound. | MUST be portable across conformant systems. |
| May be mutable without visible history. | MUST preserve lifecycle and history. |
| May be difficult to verify. | MUST be verifiable under defined rules. |

A system MUST NOT treat raw data as Evidence merely because it is stored, logged, signed, indexed, or produced by a trusted platform. It becomes Evidence when it has canonical Evidence structure and satisfies Evidence guarantees.

---

## 24. Evidence vs Claims

Evidence is not a Claim.

Evidence supports Claims. Claims interpret Evidence.

A Claim expresses a proposition about a subject. Evidence preserves the fact, event, artifact, or attestation that may support, refute, qualify, or contextualize the Claim. The same Evidence may support multiple Claims. The same Claim may require multiple Evidence items. A Claim may be weak, disputed, or invalid even when one supporting Evidence item is genuine.

Evidence MUST NOT encode the Claim's interpretation as if it were the observed fact. For example, Evidence may record that a certification was issued by an issuer on a date. A Claim may state that a person is qualified for a role. The Claim interprets the Evidence under policy, authority, and context; the Evidence does not itself assert role qualification unless the qualification statement is the attested fact being recorded.

Claims MUST reference Evidence through traceable relationships. Evidence MUST remain reusable and challengeable independently of any single Claim that cites it.

---

## 25. Evidence vs Standing

Evidence is not Standing.

Standing emerges from Evidence. Standing is a derived interpretation of Evidence under explicit policy, algorithmic context, authority attribution, temporal context, challenge state, and lifecycle state. Evidence does not contain Standing.

The boundary is mandatory:

- Evidence records what was observed, recorded, verified, or attested.
- Claims express propositions based on Evidence.
- Standing evaluates current usability, reliability, validity, eligibility, or confidence under policy.

A conformant system MUST NOT manually store a standing conclusion inside Evidence as though it were an observed fact. It MAY store Evidence that a standing computation occurred, Evidence of the inputs consumed, or Evidence of the resulting standing snapshot. Those records remain Evidence about standing events; they do not convert Evidence into Standing itself.

When Evidence changes lifecycle state, Standing that depends on it SHOULD be recomputed, invalidated, superseded, or marked according to policy. Standing MUST remain traceable to Evidence and MUST NOT mutate Evidence history.

### 25.1 Evidence vs Decisions

Evidence is not a Decision.

A Decision is a protocol-recognized outcome produced by an authorized decision process. Evidence records facts that a Decision MAY consume, require, produce, or cite. Evidence may record that a Decision occurred, what inputs were consumed, what authority was invoked, and what outcome was recognized, but that record is Decision Evidence rather than the Decision itself.

The distinction is mandatory:

- Evidence records reality available to the protocol.
- Authority legitimizes action under policy.
- Decisions consume Authority and Evidence to create recognized outcomes.

A conformant system MUST NOT treat the existence of Evidence as approval, authorization, or decision finality. Evidence can support a Decision, and a Decision can produce new Evidence, but neither collapses into the other.

---

## 26. Evidence Registry Model

The Canonical Evidence Registry Model includes the following first-class concepts:

| Concept | Definition |
|---|---|
| Evidence | A traceable representation of an observed, recorded, verified, or attested fact. |
| EvidenceType | The canonical category of Evidence. |
| EvidenceSubject | The entity, object, policy, event, process, or matter to which Evidence pertains. |
| EvidenceSource | The origin of Evidence. |
| EvidenceContext | The circumstances required to interpret Evidence. |
| EvidenceLifecycle | The state model and event history of Evidence. |
| EvidenceProvenance | The complete lineage of Evidence origin and production. |
| EvidenceRelationship | Typed traceable linkage between Evidence and other protocol-recognized objects. |
| EvidenceVerification | Traceable evaluation of Evidence under defined rules, sources, authorities, and supporting Evidence. |
| EvidenceRegistry | The mechanism that stores or references canonical Evidence while preserving lineage, relationships, lifecycle, and verification semantics. |

These concepts are semantic protocol concepts. This document does not define API endpoints, storage engines, database structures, serialization formats, or JSON schemas.

---

## 27. Implementation Guidance

Implementations SHOULD preserve protocol semantics before optimizing technical representation.

Conformant implementations SHOULD:

- model Evidence separately from Claims, Standing, Capabilities, Authorities, and Decisions;
- preserve Evidence identity, type, subject, source, timestamp, context, content, provenance, status, and relationships;
- record lifecycle changes as historical events rather than mutable overwrites;
- maintain traceable verification and challenge records;
- preserve portability across systems and organizations;
- preserve subject sovereignty and challenge rights where applicable;
- expose relationship semantics sufficient for audit reconstruction; and
- define extension types without violating Evidence boundaries.

Implementations MUST avoid treating storage location, platform trust, UI visibility, signature presence, or administrative approval as sufficient to make data Evidence. Those may support Evidence, but Evidence exists only when canonical semantics are preserved.

This document intentionally avoids APIs, JSON schemas, storage details, UI behavior, and vendor-specific mechanisms. Those concerns belong to later implementation profiles and registry specifications.

---

## 28. Future Dependencies

The Canonical Evidence Model is the foundation for the following planned Evidence specifications:

- **P-EV-03 Evidence Registry**: canonical registry semantics, registry responsibilities, registry relationships, and registry conformance.
- **P-EV-04 Evidence Lifecycle & Provenance**: lifecycle events, provenance models, transition rules, invalidation, supersession, and archival semantics.
- **P-EV-05 Evidence Profiles**: aggregation, profile scope, profile governance, profile portability, subject rights, and profile challenge semantics.
- **P-EV-06 Evidence Anchoring**: cryptographic anchoring, existence proofs, integrity proofs, timestamping, and independent verification boundaries.
- **P-EV-07 Evidence Verification**: verification processes, verification authorities, verification chains, verification outcomes, and verification conformance.
- **P-EV-08 Evidence Governance**: governance rules for Evidence production, consumption, access, consent, retention, challenge, and review.

These future documents MUST remain consistent with the principle that Evidence is the root layer and MUST NOT be redefined by downstream Claims, Standing, Capabilities, Authority, or Decisions.

---

## 29. Acceptance Criteria

A conformant Canonical Evidence Model specification satisfies the following criteria:

- [x] Defines Evidence as a traceable representation of an observed, recorded, verified, or attested fact.
- [x] Explains why Evidence exists as the source of protocol truth and the atomic unit of verifiable reality.
- [x] Defines how Evidence is represented semantically without prescribing implementation schemas.
- [x] Defines what makes something Evidence rather than raw data or an artifact.
- [x] Defines Evidence principles: Truth Preservation, Provenance, Traceability, Sovereignty, Portability, Verifiability, Immutability of History, and Context Preservation.
- [x] Defines canonical Evidence types and allows future extensibility without competing concepts.
- [x] Elevates EvidenceSubject, EvidenceSource, EvidenceContext, EvidenceProvenance, EvidenceLifecycle, EvidenceRelationship, and Evidence Sovereignty to first-class protocol concepts.
- [x] Defines Evidence structure, provenance, source model, lifecycle, relationships, context, verification, challenges, sovereignty, portability, and traceability.
- [x] Explicitly distinguishes Evidence from Data.
- [x] Explicitly distinguishes Evidence from Claims.
- [x] Explicitly distinguishes Evidence from Standing.
- [x] Explains how Evidence relates to Decisions without becoming a Decision.
- [x] Explains how Evidence is verified and how verification remains traceable.
- [x] Explains how Evidence is challenged and how challenges affect downstream use.
- [x] Explains how Evidence remains portable across domains, organizations, and systems.
- [x] Explains how Evidence remains sovereign and not platform-owned.
- [x] Introduces Evidence Profiles, Evidence Registry, and Evidence Anchoring while reserving deeper treatment for future P-EV documents.
- [x] Defines security implications including forgery, laundering, tampering, replay, context manipulation, verification abuse, provenance attacks, identity spoofing, and Sybil evidence.
- [x] Uses protocol language with MUST, MUST NOT, SHOULD, and MAY.
- [x] Avoids implementation APIs, JSON schemas, UI discussion, and storage technology prescription.

---

## Conclusion

Evidence is the foundational primitive of AOC. It records observed facts, recorded events, verified artifacts, and attested information in a portable, sovereign, traceable, and verifiable form.

Everything downstream depends on Evidence:

```text
Evidence → Claims → Standing → Delegation → Capabilities → Authority → Decisions
```

Evidence does not depend on anything downstream. It does not interpret, trust, authorize, decide, score, or grant capability. It preserves the factual substrate from which the protocol can construct explainable Claims, derive Standing, recognize Capabilities and Authority, and justify Decisions.

The Canonical Evidence Model therefore protects the entire protocol from ambiguity at its root.
