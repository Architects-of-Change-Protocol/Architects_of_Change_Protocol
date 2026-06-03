# P-EV-03 — Evidence Registry

| Field | Value |
|---|---|
| Document ID | P-EV-03 |
| Title | Evidence Registry |
| Status | Draft |
| Category | Evidence Layer |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-03 |
| Related | RFC-004 Evidence Layer v1.0, RFC-005 Claims Framework, RFC-005-H1 Standing Traceability, P-EV-02 Canonical Evidence Model |

---

## Abstract

This document defines the Evidence Registry for the AOC Protocol. An Evidence Registry is a protocol-recognized mechanism for locating, referencing, preserving, and tracing canonical Evidence without becoming the source of truth, owner of Evidence, or authority over downstream Claims, Standing, Capabilities, Authority, or Decisions.

Evidence exists independently of any registry. Registration creates protocol visibility. The registry preserves discoverability, lineage, relationships, lifecycle visibility, traceability, and auditability for Evidence while respecting Evidence sovereignty and portability.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Evidence Registry Definition](#3-evidence-registry-definition)
4. [Registry Principles](#4-registry-principles)
5. [Registry Responsibilities](#5-registry-responsibilities)
6. [Registry Non-Responsibilities](#6-registry-non-responsibilities)
7. [Evidence Registration](#7-evidence-registration)
8. [Registry Identity Model](#8-registry-identity-model)
9. [Evidence Resolution](#9-evidence-resolution)
10. [Registry Relationships](#10-registry-relationships)
11. [Registry Provenance](#11-registry-provenance)
12. [Registry Lifecycle Visibility](#12-registry-lifecycle-visibility)
13. [Registry Discovery](#13-registry-discovery)
14. [Registry Verification Discovery](#14-registry-verification-discovery)
15. [Registry Challenge Discovery](#15-registry-challenge-discovery)
16. [Registry Consumption Tracking](#16-registry-consumption-tracking)
17. [Registry Sovereignty](#17-registry-sovereignty)
18. [Registry Portability](#18-registry-portability)
19. [Registry Auditability](#19-registry-auditability)
20. [Registry Security](#20-registry-security)
21. [Registry Guarantees](#21-registry-guarantees)
22. [Evidence Registry Model](#22-evidence-registry-model)
23. [Evidence Registry vs Storage](#23-evidence-registry-vs-storage)
24. [Evidence Registry vs Index](#24-evidence-registry-vs-index)
25. [Implementation Guidance](#25-implementation-guidance)
26. [Future Dependencies](#26-future-dependencies)
27. [Acceptance Criteria](#27-acceptance-criteria)

---

## 1. Executive Summary

The Evidence Registry is the canonical mechanism through which Evidence is referenced, located, linked, traced, and audited in the AOC Protocol.

Evidence MAY exist before registration. Evidence MAY be produced, verified, challenged, transported, or preserved outside a registry when the canonical Evidence semantics defined by P-EV-02 are preserved. Registration does not create Evidence truth. Registration creates protocol visibility: it makes canonical Evidence locatable, referenceable, traceable, and discoverable by conformant consumers, verifiers, auditors, standing engines, governance processes, and decision processes.

The Evidence Registry exists adjacent to Evidence. It does not sit above Evidence and does not govern Evidence. The architectural position is:

```text
Evidence
↓
Evidence Registry
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

This sequence expresses dependency and discoverability, not ownership or control. Claims interpret Evidence. Standing derives from Evidence and Claims under policy and algorithmic context. Delegation, Capabilities, Authority, and Decisions consume downstream protocol state. The registry preserves the ability to locate and reconstruct the Evidence that those downstream states consumed.

The constitutional principle is mandatory:

```text
Evidence exists independently of the registry.
The registry preserves discoverability.
The registry preserves lineage.
The registry preserves relationships.
The registry preserves traceability.
The registry does not create truth.
```

A conformant Evidence Registry MUST preserve Evidence identity, references, lineage, relationships, lifecycle visibility, verification visibility, challenge visibility, consumption visibility, auditability, sovereignty, and portability. It MUST NOT become evidence ownership, authority, standing, capability, or decision validity.

---

## 2. Problem Statement

Without a canonical Evidence Registry, Evidence becomes fragmented across platforms, repositories, workflows, archives, verifiers, governance processes, and decision systems. Fragmented Evidence may still exist, but it becomes difficult to find, difficult to reference consistently, and difficult to reconstruct after migration, supersession, challenge, or downstream consumption.

The absence of a registry creates predictable protocol failures:

- Evidence becomes fragmented across systems that do not preserve shared references.
- Evidence becomes difficult to discover by authorized consumers, reviewers, verifiers, and auditors.
- Evidence lineage becomes difficult to reconstruct when Evidence is transformed, normalized, redacted, reissued, migrated, verified, challenged, invalidated, superseded, or archived.
- Evidence relationships become hidden when Claims, Standing states, Capabilities, Authorities, Decisions, Policies, and other Evidence consume or depend on Evidence without preserving typed links.
- Evidence portability becomes harder because references become platform-local, non-exportable, or dependent on vendor-specific indexes.
- Standing traceability becomes incomplete because standing snapshots cannot reliably identify included Evidence, excluded Evidence, lifecycle states, verification status, challenge status, or authority context.
- Challenge and appeal rights become weak because subjects and reviewers cannot identify which Evidence affected downstream standing, authority, eligibility, or decisions.
- Audits become dependent on operational logs rather than canonical protocol relationships.

AOC therefore requires a canonical registry model. The registry does not replace Evidence. It preserves the ability to discover, resolve, audit, and trace Evidence across systems, organizations, domains, and time.

---

## 3. Evidence Registry Definition

**Evidence Registry** is a protocol-recognized registry responsible for maintaining canonical references, lineage, relationships, lifecycle visibility, and discoverability for Evidence.

An Evidence Registry exists to answer:

- What Evidence is registered or referenceable?
- Where can Evidence or its canonical representation be located?
- What canonical Evidence identity identifies it?
- What registry identities, external identities, and referenced identities are associated with it?
- What Evidence preceded, produced, transformed, verified, challenged, superseded, or consumed it?
- What Claims, Standing states, Capabilities, Authorities, Decisions, Policies, and other protocol objects reference it?
- What verification, challenge, lifecycle, and consumption history is visible to authorized reviewers?

An Evidence Registry is not:

| Concept | Boundary |
|---|---|
| Evidence | The registry references and preserves Evidence semantics; it is not the Evidence itself. |
| Claim | The registry MAY expose Evidence used by Claims; it does not assert the Claim's proposition. |
| Standing | The registry MAY expose Evidence consumed by Standing; it does not derive current validity state. |
| Capability | The registry MAY expose Evidence related to capability eligibility or constraints; it does not grant capability. |
| Authority | The registry MAY expose Evidence related to authority basis or delegation records; it does not create authority. |
| Decision | The registry MAY expose Evidence consumed or produced by a Decision; it does not decide. |

Registration is recognition for protocol visibility. It is not a truth-making act.

---

## 4. Registry Principles

A conformant Evidence Registry MUST preserve the following principles.

### 4.1 Discoverability

Discoverability means authorized actors and conformant systems can locate Evidence or canonical Evidence references using protocol-recognized identity, subject, source, context, relationship, lifecycle, verification, challenge, or consumption criteria.

The registry SHOULD make Evidence findable without requiring hidden platform knowledge. Discoverability MUST respect access, consent, confidentiality, security, jurisdiction, and governance constraints.

### 4.2 Traceability

Traceability means origin, lifecycle, verification, challenge, relationship, consumption, and change history can be reconstructed.

The registry MUST preserve both forward traceability and reverse traceability:

- forward traceability asks which downstream Evidence, Claims, Standing states, Capabilities, Authorities, Decisions, and Policies consumed or depended on an Evidence item;
- reverse traceability asks which Evidence, sources, producers, verification records, challenge records, lifecycle events, policies, authority contexts, and prior registry events produced the current Evidence view.

### 4.3 Portability

Portability means Evidence identity, references, provenance, lifecycle visibility, relationship semantics, verification visibility, challenge visibility, and consumption visibility remain meaningful across conformant systems.

The registry MUST NOT make Evidence dependent on proprietary identifiers, hidden logs, non-exportable indexes, or platform-specific trust assumptions.

### 4.4 Sovereignty

Sovereignty means the registry preserves the subject and producer rights recognized by the Evidence Layer rather than converting Evidence into platform-owned records.

A registry MAY index Evidence, reference Evidence, preserve Evidence metadata, and expose Evidence relationships. Those functions MUST NOT create ownership over Evidence or eliminate subject challenge rights, consent boundaries, portability, or policy-defined visibility.

### 4.5 Lineage Preservation

Lineage Preservation means the registry preserves how Evidence came into being and how it changed over time.

The registry MUST preserve origin lineage, source lineage, production lineage, transformation lineage, verification lineage, challenge lineage, registry lineage, and consumption lineage where applicable. Later events MAY confirm, invalidate, supersede, archive, or contextualize Evidence, but they MUST NOT erase prior lineage.

### 4.6 Relationship Preservation

Relationship Preservation means Evidence links remain typed, traceable, directional where material, and explainable.

The registry MUST preserve relationships between Evidence and Evidence, Claims, Standing, Capabilities, Authorities, Decisions, Policies, verification records, challenge records, lifecycle events, and consumption records when those relationships affect auditability, standing, authority, eligibility, challenge rights, or decision reconstruction.

### 4.7 Auditability

Auditability means authorized reviewers can reconstruct what happened, when it happened, who or what participated, under what context, what Evidence was used, what was excluded, what changed, and which downstream states were affected.

The registry MUST support audit queries without requiring trust in mutable operational logs alone. Logs MAY support auditability, but canonical registry relationships and lifecycle visibility MUST carry the protocol meaning.

### 4.8 Non-Ownership

Non-Ownership means registry participation does not transfer Evidence ownership, subject sovereignty, producer rights, or authority over downstream interpretation to the registry operator.

The registry is a custodian of references, lineage, relationships, and traceability. It is not the owner of Evidence and MUST NOT assert unilateral control over Evidence portability, challenge rights, provenance, or consumption visibility except as explicitly permitted by policy, consent, governance, law, or legitimate security constraints.

---

## 5. Registry Responsibilities

A conformant Evidence Registry MUST perform the following responsibilities.

### 5.1 Register Evidence

The registry MUST accept or reject Evidence Registration requests according to defined conformance, authorization, governance, and policy rules. Acceptance means the registry recognizes the Evidence reference for protocol visibility; it does not mean the registry confirms truth.

### 5.2 Resolve Evidence References

The registry MUST resolve canonical Evidence references to the available registry view of the Evidence, including canonical identity, known locations or content references, lifecycle visibility, provenance references, relationship references, verification visibility, challenge visibility, and consumption visibility where authorized.

### 5.3 Maintain Relationships

The registry MUST maintain typed Evidence relationships. Relationship records SHOULD distinguish support, refutation, qualification, derivation, duplication, correction, supersession, contradiction, verification, challenge, consumption, production, and policy governance where material.

### 5.4 Maintain Lineage

The registry MUST preserve lineage for registration, origin, source, production, transformation, verification, challenge, lifecycle, migration, anchoring, and consumption events where applicable.

### 5.5 Maintain Lifecycle Visibility

The registry MUST expose the lifecycle state and lifecycle history known to the registry. The registry exposes lifecycle visibility; it does not create the underlying lifecycle facts unless the lifecycle event is itself a registry event.

### 5.6 Support Verification Discovery

The registry MUST support discovery of verification status, verification chains, verification authorities, verification sources, verification evidence, verification scope, and verification limitations where known and authorized.

### 5.7 Support Challenge Discovery

The registry MUST support discovery of challenges, challenge status, challenge grounds, challenge lineage, challenge authority context, review status, and challenge outcomes where known and authorized.

### 5.8 Support Audit Discovery

The registry MUST support audit discovery sufficient to answer origin, lineage, verification, challenge, relationship, consumption, standing impact, authority impact, and decision-use questions.

### 5.9 Preserve Canonical References

The registry MUST preserve stable Evidence references and MUST NOT silently replace canonical Evidence identity with registry-local identity.

### 5.10 Preserve Cross-System Meaning

The registry SHOULD preserve enough semantic context that Evidence remains meaningful after migration, replication, federation, archival, export, or cross-registry resolution.

---

## 6. Registry Non-Responsibilities

The Evidence Registry is intentionally limited. A registry MUST NOT perform the following functions merely by virtue of registration.

| Non-responsibility | Rule |
|---|---|
| Create truth | Registration MUST NOT be treated as proof that Evidence content is accurate, complete, authorized, or legally valid. |
| Assign standing | The registry MUST NOT assign Standing. Standing is derived from Evidence and Claims under policy and algorithmic context. |
| Grant capability | The registry MUST NOT grant Capability. Capabilities emerge from recognized Standing, policy, and capability semantics. |
| Grant authority | The registry MUST NOT grant Authority. Authority depends on standing, delegation, policy, and governance context. |
| Make decisions | The registry MUST NOT approve, deny, execute, adjudicate, or finalize Decisions. |
| Override provenance | The registry MUST NOT replace source, producer, origin, custody, or transformation lineage with registry assertions. |
| Rewrite evidence history | The registry MUST NOT erase or overwrite Evidence lifecycle, provenance, verification, challenge, relationship, or consumption history. |
| Collapse Evidence into storage | The registry MUST NOT define Evidence by where it is stored. |
| Collapse Evidence into search results | The registry MUST NOT treat indexing or ranking as Evidence semantics. |
| Silence challenges | The registry MUST NOT hide known challenge state when the challenge affects rights, standing, authority, eligibility, or decisions, subject to authorized visibility constraints. |

A registry MAY record that a lifecycle event, verification event, challenge event, or consumption event was submitted to or observed by the registry. That record is registry Evidence or registry metadata about the event. It does not give the registry authority to determine truth beyond the scope of the recorded event.

---

## 7. Evidence Registration

**Evidence Registration** is the protocol act by which an Evidence Registry records a canonical Evidence reference and associated registry-visible metadata so that Evidence becomes discoverable, resolvable, traceable, and auditable within the registry's scope.

Registration answers: how does Evidence become discoverable?

Evidence becomes discoverable when a registry accepts a Registration Request and records a Registration Result that binds canonical Evidence identity to registry-visible references, provenance, lifecycle visibility, relationships, verification visibility, challenge visibility, and consumption visibility according to policy.

### 7.1 Registration Request

A **Registration Request** is a request to make Evidence protocol-visible within a registry.

A Registration Request SHOULD identify:

- canonical Evidence identity or Evidence ID;
- Evidence type;
- Evidence subject or subjects;
- Evidence source;
- Evidence producer where known;
- Evidence context;
- Evidence content reference or content representation where permitted;
- Evidence provenance references;
- Evidence lifecycle state or lifecycle event being registered;
- Evidence relationships known at registration time;
- verification records or verification references where available;
- challenge records or challenge references where available;
- consent, access, confidentiality, jurisdiction, retention, and governance constraints where applicable; and
- requester identity, role, authority context, or policy basis for registration.

### 7.2 Registration Context

**Registration Context** is the policy, authority, consent, jurisdictional, temporal, operational, and governance context under which the registry evaluates and records the Registration Request.

Registration Context MUST be preserved when it affects visibility, portability, challenge rights, lifecycle interpretation, downstream consumption, or auditability.

### 7.3 Registration Validation

**Registration Validation** is the registry's evaluation of whether a Registration Request is acceptable for registry recognition.

Registration Validation MAY evaluate:

- structural conformance to the canonical Evidence model;
- presence of canonical Evidence identity;
- requester authorization to register or reference the Evidence;
- consistency of supplied metadata with known registry records;
- duplicate, superseding, or cross-registry references;
- consent and access boundaries;
- minimum provenance and lifecycle visibility requirements;
- relationship integrity and non-circularity where material;
- security risks such as registry poisoning, identity spoofing, or forged references.

Registration Validation MUST NOT be represented as proof that Evidence content is true unless a separate Verification record explicitly evaluates that question under defined rules. Even then, verification scope MUST remain explicit.

### 7.4 Registration Result

A **Registration Result** is the registry's recorded outcome for a Registration Request.

A Registration Result SHOULD identify:

- accepted, rejected, pending, challenged, under review, or superseded registration status;
- canonical Evidence identity;
- registry identity assigned by the registry, if any;
- timestamp of registry acceptance or rejection;
- registry operator or registry context;
- validation basis and policy basis;
- known relationships created or updated;
- lifecycle visibility recorded;
- verification and challenge visibility recorded;
- access, consent, retention, and portability constraints; and
- reasons for rejection or review where applicable.

### 7.5 Registration Lifecycle

**Registration Lifecycle** is the historical sequence of registry events associated with Evidence registration.

Registration Lifecycle MAY include:

- requested;
- accepted;
- rejected;
- pending review;
- registered;
- relationship updated;
- lifecycle updated;
- verification linked;
- challenge linked;
- consumption linked;
- superseded;
- archived;
- migrated;
- exported; and
- cross-registered.

Registration Lifecycle MUST be append-preserving. Registry correction events MUST preserve the prior registry state and explain the correction. The registry MUST NOT silently rewrite the registration record.

---

## 8. Registry Identity Model

Registry identity exists to preserve Evidence identity across systems without confusing canonical identity with platform-local identifiers.

### 8.1 Canonical Evidence Identity

**Canonical Evidence Identity** is the stable protocol identity of an Evidence item. It SHOULD be globally unique, stable, portable, and bound to Evidence content and production context as defined by the Canonical Evidence Model and RFC-004 Evidence ID requirements.

Canonical Evidence Identity MUST remain the primary identity used for protocol traceability. A registry MUST NOT replace canonical Evidence identity with registry-local identity.

### 8.2 Registry Identity

**Registry Identity** is an identifier assigned by a registry to represent a registration record, registry event, registry-local view, or registry-specific reference.

Registry Identity MAY be useful for registry operations, but it MUST remain subordinate to Canonical Evidence Identity. Registry Identity MUST NOT imply Evidence ownership, authority, or truth.

### 8.3 External Identity

**External Identity** is an identifier assigned by a system outside the registry, such as a source system, storage location, credential ecosystem, archive, verifier, governance system, claim system, standing implementation, or decision system.

External Identity MAY help locate Evidence across systems. External Identity MUST NOT override Canonical Evidence Identity. When External Identity conflicts with Canonical Evidence Identity, the registry MUST preserve the conflict as a traceability issue rather than silently merging or rewriting Evidence.

### 8.4 Referenced Identity

**Referenced Identity** is an identity used in relationships, citations, audit records, Claims, Standing snapshots, Capabilities, Authorities, Decisions, Policies, lifecycle events, verification records, challenge records, or consumption records to refer to Evidence.

Referenced Identity SHOULD resolve to Canonical Evidence Identity when possible. When resolution is incomplete, ambiguous, conflicting, or unavailable, the registry SHOULD mark the reference as unresolved, ambiguous, conflicting, or indeterminate rather than treating it as verified.

### 8.5 Same Evidence Across Systems

The same Evidence MAY appear across multiple systems, organizations, domains, archives, registries, indexes, storage locations, verifiers, and decision records.

A conformant registry SHOULD preserve identity equivalence without collapsing distinct Evidence items. It SHOULD distinguish:

- the same canonical Evidence registered in multiple registries;
- copies of the same Evidence content in multiple storage systems;
- transformed or redacted Evidence derived from prior Evidence;
- superseding Evidence that replaces earlier Evidence;
- duplicate Evidence that appears similar but lacks sufficient identity equivalence; and
- conflicting Evidence that references the same subject or event but does not share canonical identity.

Canonical identity SHOULD be preserved through migration, export, import, replication, cross-registration, federation, archival, and cross-domain use.

---

## 9. Evidence Resolution

**Evidence Resolution** is the process of resolving an Evidence reference into the registry-visible information necessary to locate, interpret, trace, verify, challenge, consume, or audit Evidence.

Evidence Resolution exists to answer: how is Evidence resolved?

A conformant registry SHOULD support resolution for:

- canonical Evidence identity;
- registry identity;
- external identity;
- referenced identity;
- subject-based references;
- source-based references;
- relationship-based references;
- lifecycle-based references;
- verification-based references;
- challenge-based references;
- consumption-based references; and
- cross-registry references.

Evidence Resolution MUST preserve ambiguity. If multiple Evidence items match a reference, the registry MUST NOT silently select one when the distinction affects standing, authority, decisions, auditability, or challenge rights. It SHOULD return an ambiguous, incomplete, conflicting, unauthorized, or indeterminate resolution state.

Resolution MAY locate Evidence or Evidence references. Resolution MAY return access limitations, consent requirements, redaction boundaries, confidentiality constraints, jurisdictional constraints, or policy constraints. A resolution result MUST NOT imply that the Evidence is true, verified, current, authoritative, or decision-valid unless those states are explicitly represented and scoped.

Evidence Resolution SHOULD support resolving:

- where Evidence can be located;
- which canonical identity identifies it;
- what lineage produced it;
- what relationships connect it;
- what provenance is known;
- what lifecycle state is visible;
- what verification state is visible;
- what challenge state is visible; and
- what downstream objects consumed it.

---

## 10. Registry Relationships

Registry relationships preserve how Evidence participates in the protocol graph. Relationships MUST be typed, traceable, directional where material, and explainable.

A conformant registry MUST preserve the following relationship classes where known and authorized.

| Relationship | Registry requirement |
|---|---|
| Evidence ↔ Evidence | The registry MUST preserve support, duplication, correction, supersession, contradiction, derivation, verification, challenge, contextualization, transformation, and dependency relationships where material. |
| Evidence ↔ Claims | The registry MUST preserve when Evidence supports, refutes, qualifies, is cited by, is excluded from, or is required by Claims. |
| Evidence ↔ Standing | The registry MUST preserve when Evidence contributes to, is excluded from, triggers recomputation of, invalidates, suspends, or explains Standing. |
| Evidence ↔ Capabilities | The registry MUST preserve when Evidence supports capability eligibility, capability constraints, capability revocation, or capability boundary evaluation through Claims, Standing, and policy. |
| Evidence ↔ Authority | The registry MUST preserve when Evidence demonstrates authority basis, delegation record, authority scope condition, authority revocation, or authority challenge. |
| Evidence ↔ Decisions | The registry MUST preserve when Evidence is consumed by, required by, produced by, cited by, or records that a Decision occurred. |
| Evidence ↔ Policies | The registry MUST preserve when Evidence satisfies, violates, triggers, is governed by, is interpreted under, or is constrained by Policies. |

Relationship Preservation MUST support both forward traceability and reverse traceability. A consumer MUST be able to ask which downstream objects consumed Evidence. A reviewer MUST be able to ask which Evidence produced a downstream Claim, Standing state, Capability, Authority, Decision, or Policy outcome.

The registry MUST NOT use untyped generic links when relationship semantics affect standing, authority, challenge rights, lifecycle interpretation, auditability, or decision reconstruction.

---

## 11. Registry Provenance

P-EV-02 defines EvidenceProvenance as the complete lineage of Evidence origin and production. The registry MUST preserve provenance visibility; it MUST NOT replace provenance with registry custody.

A conformant registry MUST preserve or reference:

| Provenance element | Registry responsibility |
|---|---|
| Origin | Preserve where the Evidence came from and the origin context required to interpret it. |
| Source | Preserve the EvidenceSource and distinguish source identity from source trust. |
| Producer | Preserve the Evidence Producer where known and distinguish producer identity from content truth. |
| Verification Lineage | Preserve verification sources, methods, authorities, timestamps, supporting Evidence, scope, outcomes, and verification chains where known. |
| Challenge Lineage | Preserve challenge grounds, challengers, authority context, review status, outcomes, and challenge history where known. |
| Consumption Lineage | Preserve who or what consumed Evidence, when, for what purpose, and in relation to which Claim, Standing state, Capability, Authority, Decision, or Policy where known and authorized. |

Registry provenance includes registry events such as registration, update, relationship change, lifecycle visibility update, migration, cross-registration, export, archive, or registry correction. Registry provenance MUST be distinguished from Evidence provenance. Registry events can explain registry visibility, but they do not rewrite origin, source, or production lineage.

---

## 12. Registry Lifecycle Visibility

P-EV-04 Evidence Lifecycle & Provenance will define lifecycle events, transition rules, invalidation, supersession, and archival semantics in greater depth. Until then, the registry MUST preserve lifecycle visibility consistently with P-EV-02.

A conformant registry SHOULD expose visibility into the following Evidence lifecycle states where known:

| Lifecycle state | Registry visibility requirement |
|---|---|
| Observed | Evidence has been observed but may not yet be formally recorded. |
| Recorded | Evidence has been recorded with canonical structure. |
| Verified | Evidence has passed a defined verification process. |
| Challenged | Evidence has been disputed on defined grounds. |
| Under Review | A challenge, correction, authority question, or governance process is actively reviewing the Evidence. |
| Confirmed | Evidence has been confirmed after review or verification. |
| Invalidated | Evidence has been found invalid, unusable, forged, corrupted, unauthorized, materially inaccurate, or non-conformant under policy. |
| Superseded | Evidence has been replaced or made obsolete by newer, corrected, or more authoritative Evidence. |
| Archived | Evidence is retained for historical, audit, compliance, or lineage purposes but is no longer active for ordinary consumption. |

The registry exposes lifecycle. The registry does not create lifecycle, except when the lifecycle event is itself a registry event, such as registration, registry archival, registry migration, or registry correction.

Lifecycle visibility MUST be historical and append-preserving. A registry MUST NOT overwrite prior lifecycle state without preserving the prior state and the event that changed registry visibility.

---

## 13. Registry Discovery

**Evidence Discovery** is the protocol capability of finding Evidence or Evidence references through registry-recognized criteria.

Evidence Discovery answers: how is Evidence discovered?

A conformant registry SHOULD support the following discovery modes.

### 13.1 Evidence Search

**Evidence Search** discovers Evidence using criteria such as subject, source, producer, type, context, lifecycle state, verification state, challenge state, relationship type, policy domain, decision use, or time range.

Search MAY be constrained by authorization, consent, confidentiality, jurisdiction, retention, security, or policy. Search results MUST preserve semantic distinctions and MUST NOT imply truth, standing, authority, or decision validity.

### 13.2 Evidence Lookup

**Evidence Lookup** retrieves a registry-visible Evidence record or reference using a known identity, such as Canonical Evidence Identity, Registry Identity, External Identity, or Referenced Identity.

Lookup SHOULD return resolution status, lifecycle visibility, provenance visibility, relationship visibility, verification visibility, challenge visibility, consumption visibility, and applicable access constraints.

### 13.3 Evidence Reference Resolution

**Evidence Reference Resolution** resolves an Evidence reference embedded in a Claim, Standing snapshot, Capability record, Authority record, Decision record, Policy, verification record, challenge record, lifecycle event, audit record, or other Evidence item.

Reference resolution MUST preserve unresolved, ambiguous, conflicting, unauthorized, or indeterminate states.

### 13.4 Cross-Domain Discovery

**Cross-Domain Discovery** enables Evidence to be discovered across HR, project governance, vendor governance, legal, compliance, education, identity, AI execution, and other protocol domains without losing canonical semantics.

Cross-domain discovery SHOULD preserve domain context and MUST NOT strip jurisdictional, operational, governance, risk, identity, consent, or policy context.

---

## 14. Registry Verification Discovery

The registry MUST support discovery of verification information where known and authorized.

Verification discovery SHOULD expose:

- verification status;
- verification chains;
- verification authorities;
- verification sources;
- verification methods or rule references;
- verification timestamps;
- verification evidence;
- verification scope;
- verification limitations;
- failed or indeterminate verification outcomes; and
- verification relationships to Claims, Standing, Capabilities, Authorities, Decisions, and Policies.

Verification discovery MUST NOT collapse verification into truth. A verification result states that Evidence satisfied a specified verification process under specified conditions. It does not by itself establish content truthfulness, standing, capability, authority, legal validity, or decision outcome.

When verification information is unavailable, incomplete, expired, challenged, or indeterminate, the registry SHOULD expose that state rather than hiding it or treating absence as success.

---

## 15. Registry Challenge Discovery

The registry MUST support discovery of challenge information where known and authorized.

Challenge discovery SHOULD expose:

- challenges;
- challenge status;
- challenge grounds;
- challenge lineage;
- challenge source or challenger where permitted;
- challenge authority context;
- review process;
- challenge timestamps;
- challenge evidence;
- challenge outcomes;
- downstream Claims, Standing states, Capabilities, Authorities, Decisions, or Policies affected by the challenge; and
- whether Evidence was included, discounted, suspended, excluded, confirmed, invalidated, or superseded under policy.

Challenge history MUST remain visible in lineage even if the Evidence is later confirmed. A confirmed challenge is still part of the historical explanation for why Evidence remained usable. An invalidated challenge is still part of the historical explanation for why Evidence stopped contributing or contributed differently.

Challenge discovery protects appealability. The registry MUST NOT hide known challenge state when the challenge affects rights, standing, authority, eligibility, or consequential decisions, subject to explicit and traceable access, privacy, confidentiality, safety, legal, or governance constraints.

---

## 16. Registry Consumption Tracking

**Evidence Consumption** is the protocol-visible act of using, referencing, relying on, evaluating, citing, excluding, or incorporating Evidence in another protocol process or object.

Evidence Consumption answers: how is Evidence consumed?

A conformant registry SHOULD preserve visibility into Evidence Consumption where known and authorized. Consumption visibility SHOULD answer:

- Who consumed Evidence?
- When was Evidence consumed?
- For what purpose was Evidence consumed?
- Which Claim consumed or cited the Evidence?
- Which Standing state included, excluded, discounted, suspended, or recomputed because of the Evidence?
- Which Capability evaluation used the Evidence?
- Which Authority basis, delegation path, scope condition, or revocation process used the Evidence?
- Which Decision consumed, required, cited, produced, or was recorded by the Evidence?
- Which Policy governed the consumption?
- What lifecycle, verification, challenge, consent, and access state existed at the time of consumption?

Evidence Consumption MUST preserve temporal context. Later invalidation, challenge, supersession, or archival MUST NOT erase the fact that Evidence was previously consumed. Instead, downstream Claims, Standing states, Capabilities, Authorities, Decisions, and Policies SHOULD preserve how the new lifecycle state affects prior and current use.

Consumption tracking MUST NOT become surveillance by default. Visibility MUST respect consent, access, confidentiality, privacy, safety, legal, governance, and legitimate security constraints. Those constraints SHOULD be explicit and traceable.

---

## 17. Registry Sovereignty

P-EV-02 defines Evidence sovereignty as a constitutional concern: Evidence about a subject MUST NOT become a mechanism for platform capture, opaque scoring, or loss of agency.

An Evidence Registry MUST NOT become Evidence owner. It MUST preserve sovereignty properties while performing registry functions.

A conformant registry MUST preserve:

| Sovereignty property | Registry requirement |
|---|---|
| Subject sovereignty | Subjects SHOULD be able to identify Evidence about them and understand relevant context, provenance, lifecycle, and use where policy permits. |
| Portability | Evidence references, identities, provenance, lifecycle visibility, relationships, verification, challenge, and consumption semantics SHOULD remain portable across systems. |
| Challenge rights | Subjects and authorized challengers SHOULD have policy-defined mechanisms to challenge inaccurate, incomplete, miscontextualized, unauthorized, forged, or non-conformant Evidence. |
| Consent boundaries | Registry discovery, resolution, relationship visibility, verification visibility, challenge visibility, and consumption visibility MUST respect explicit consent and access constraints where applicable. |

A registry MAY limit visibility for privacy, confidentiality, safety, legal process, organizational governance, retention, or legitimate authority constraints. Such limits MUST be explicit and traceable rather than hidden behind platform control.

Registry sovereignty also requires non-laundering. Copying Evidence into a registry MUST NOT erase original source, producer, authority context, consent boundary, challenge state, or lineage.

---

## 18. Registry Portability

Registry Portability is the ability for Evidence registry semantics to remain meaningful across systems, organizations, domains, and registries.

### 18.1 Cross-System Portability

**Cross-system portability** means Evidence references, identities, provenance, lifecycle visibility, relationships, verification visibility, challenge visibility, and consumption visibility survive migration or use across platforms, archives, verifiers, claim systems, standing implementations, governance systems, and decision systems.

### 18.2 Cross-Organization Portability

**Cross-organization portability** means Evidence can be referenced or transferred across organizational boundaries without losing canonical identity, source, subject, context, lineage, lifecycle, verification, challenge, or relationship semantics.

### 18.3 Cross-Domain Portability

**Cross-domain portability** means Evidence remains interpretable across domains such as HR, project governance, vendor governance, legal, compliance, education, identity, AI execution, and policy governance.

### 18.4 Cross-Registry Portability

**Cross-registry portability** means the same canonical Evidence may be registered, replicated, migrated, referenced, or resolved across multiple conformant registries without creating competing Evidence identities.

A registry MUST NOT make portability depend on proprietary interface state, hidden registry logs, non-exportable identifiers, undisclosed ranking rules, or platform-specific trust assumptions. Portability MAY be constrained by privacy, confidentiality, consent, jurisdiction, retention, security, or governance policy. Such constraints SHOULD be represented as explicit policy and context.

---

## 19. Registry Auditability

Registry Auditability is the ability to ask and answer protocol audit questions from registry records, Evidence records, lifecycle events, provenance references, relationship records, verification records, challenge records, consumption records, policy references, and downstream traceability records.

A conformant registry MUST support audit queries sufficient to answer:

- Where did Evidence come from?
- Who or what produced it?
- Who or what supplied it to the registry?
- When was it observed, recorded, registered, verified, challenged, reviewed, confirmed, invalidated, superseded, archived, consumed, migrated, or exported?
- Under what context was it produced and registered?
- Who verified it?
- What verification process was used?
- What verification Evidence supported the result?
- Who challenged it?
- What was the challenge ground, status, lineage, and outcome?
- Who consumed it?
- What Claim cited or depended on it?
- What Standing state included or excluded it?
- What Capability, Authority, Decision, or Policy used it?
- What decisions used it?
- What downstream objects were impacted by invalidation, challenge, supersession, or archival?
- What registry events changed the registry-visible view?

Auditability MUST support historical reconstruction. Later registry events MUST NOT erase prior registry-visible states. If a registry cannot reconstruct material history, it MUST mark the affected registry view as incomplete, non-reconstructable, or indeterminate for audit purposes.

---

## 20. Registry Security

A conformant Evidence Registry MUST address security risks that can corrupt Evidence discoverability, lineage, relationships, lifecycle visibility, traceability, sovereignty, or portability.

| Risk | Registry requirement |
|---|---|
| Evidence forgery | The registry SHOULD require canonical identity, provenance, and verification visibility sufficient to distinguish registered references from confirmed Evidence integrity. |
| Registry poisoning | The registry MUST resist malicious registrations, misleading metadata, duplicate identity attacks, low-authority spam, and false relationships that pollute discovery or standing inputs. |
| Relationship tampering | The registry MUST preserve relationship history and detect or expose unauthorized, unexplained, or conflicting relationship changes. |
| Lineage corruption | The registry MUST preserve source, producer, origin, transformation, verification, challenge, registry, and consumption lineage and SHOULD expose broken, incomplete, conflicting, or circular lineage. |
| Consumption laundering | The registry MUST NOT allow downstream consumers to hide Evidence use when that use affects standing, authority, rights, eligibility, auditability, or decisions, subject to authorized constraints. |
| Discovery abuse | The registry MUST protect against unauthorized enumeration, profiling, inference, surveillance, scraping, and misuse of Evidence discovery. |
| Identity spoofing | The registry MUST distinguish canonical Evidence identity, registry identity, external identity, referenced identity, subject identity, source identity, producer identity, verifier identity, challenger identity, and consumer identity. |
| Challenge suppression | The registry MUST preserve known challenge state and challenge lineage where those states affect downstream use. |
| Supersession fraud | The registry MUST preserve supersession lineage and authority context so a malicious actor cannot silently replace Evidence with a more favorable record. |
| Registry capture | The registry MUST preserve portability and sovereignty so registry operators cannot convert infrastructure control into Evidence ownership. |

Security controls MUST not collapse registry function into authority. A secure registry protects references, lineage, relationships, lifecycle visibility, traceability, and access boundaries; it does not decide truth, standing, capability, authority, or decisions.

---

## 21. Registry Guarantees

A conformant Evidence Registry MUST preserve the following guarantees.

- **No orphan evidence**: registered Evidence MUST be associated with canonical identity, provenance, lifecycle visibility, and relationships where applicable.
- **No hidden lineage**: origin, source, production, transformation, verification, challenge, registry, and consumption lineage MUST remain visible to authorized reviewers where applicable.
- **No hidden relationships**: material relationships between Evidence and Evidence, Claims, Standing, Capabilities, Authorities, Decisions, Policies, verification records, challenge records, and consumption records MUST be preserved.
- **No hidden lifecycle**: lifecycle state and lifecycle history known to the registry MUST be visible to authorized reviewers.
- **No hidden verification**: verification status, chains, authorities, Evidence, scope, failures, and indeterminate states known to the registry MUST be visible to authorized reviewers.
- **No hidden challenges**: challenge status, grounds, lineage, review status, outcomes, and downstream effects known to the registry MUST be visible to authorized reviewers.
- **No registry ownership of evidence**: registration MUST NOT convert Evidence into registry-owned Evidence.
- **No truth by registration**: registration MUST NOT be treated as proof of content truth, legal validity, standing, capability, authority, or decision finality.
- **No identity replacement**: registry identity MUST NOT replace Canonical Evidence Identity.
- **No history rewriting**: registry correction, migration, replication, archival, or export MUST preserve prior registry-visible history.

These guarantees are protocol requirements. A registry that can store or index records but cannot preserve these guarantees is not a conformant Evidence Registry.

---

## 22. Evidence Registry Model

The Evidence Registry Model introduces the following first-class protocol concepts, including Evidence Registry, Evidence Identity, Evidence Resolution, Evidence Discovery, Evidence Consumption, Evidence Lineage, and Evidence Registration as protocol-level terms.

| Concept | Definition |
|---|---|
| EvidenceRegistry | A protocol-recognized registry responsible for maintaining canonical references, lineage, relationships, lifecycle visibility, and discoverability for Evidence. |
| EvidenceReference | A canonical, registry, external, or referenced identity or locator used to refer to Evidence without replacing Canonical Evidence Identity. |
| EvidenceRegistration | The protocol act and historical record by which Evidence becomes registry-visible, discoverable, resolvable, traceable, and auditable within registry scope. |
| EvidenceIdentity | The identity model that distinguishes Canonical Evidence Identity, Registry Identity, External Identity, and Referenced Identity. |
| EvidenceResolution | The process of resolving an Evidence reference into registry-visible information needed to locate, interpret, trace, verify, challenge, consume, or audit Evidence. |
| EvidenceRelationship | A typed, traceable linkage between Evidence and Evidence, Claims, Standing, Capabilities, Authorities, Decisions, Policies, verification records, challenge records, lifecycle events, or consumption records. |
| EvidenceLineage | The origin, source, production, transformation, verification, challenge, registry, lifecycle, and consumption ancestry of Evidence. |
| EvidenceDiscovery | The registry capability for finding Evidence or Evidence references through protocol-recognized criteria. |
| EvidenceConsumption | The protocol-visible act of using, referencing, relying on, evaluating, citing, excluding, or incorporating Evidence in another protocol process or object. |

These are semantic protocol concepts. This specification does not define database schemas, API endpoints, storage engines, serialization formats, blockchain requirements, UI behavior, ranking systems, or product-specific registry features.

---

## 23. Evidence Registry vs Storage

An Evidence Registry is not storage.

```text
Registry ≠ Storage
Registry ≠ Database
Registry ≠ Repository
```

Storage may exist without a registry. A file system, object store, database, archive, content-addressed store, document management platform, credential wallet, or repository MAY store Evidence content or artifacts without being a conformant Evidence Registry.

A registry MAY reference external storage. A registry MAY store some Evidence metadata, references, registry events, relationship records, lifecycle visibility, verification references, challenge references, or consumption records. Those implementation choices do not make the registry the source of truth or the owner of Evidence.

The boundary is:

| Storage concern | Registry concern |
|---|---|
| Holds bytes, files, records, artifacts, or content. | Preserves canonical references, lineage, relationships, lifecycle visibility, discovery, resolution, and traceability. |
| May optimize durability, availability, replication, retention, or retrieval. | Preserves protocol semantics necessary for auditability, sovereignty, portability, and downstream reconstruction. |
| May be platform-specific. | MUST preserve canonical Evidence identity and cross-system meaning. |
| May lack Evidence semantics. | MUST preserve Evidence semantics. |

Evidence can be stored without being discoverable through a registry. Evidence can be registered while its content remains in external storage. Registry conformance depends on protocol semantics, not storage technology.

---

## 24. Evidence Registry vs Index

An Evidence Registry is not a search index.

```text
Registry ≠ Search Index
```

An index optimizes retrieval. A registry preserves semantics.

A search index MAY help users or systems find records. It MAY rank, filter, cache, tokenize, summarize, denormalize, or optimize query performance. Those functions do not by themselves preserve Evidence identity, lineage, relationships, lifecycle visibility, verification visibility, challenge visibility, consumption visibility, sovereignty, or portability.

A conformant Evidence Registry MAY use indexes internally. However, registry conformance is determined by whether the registry preserves protocol semantics, not by whether it provides fast search.

The registry MUST NOT allow indexing artifacts to replace canonical Evidence relationships. If an index omits lineage, hides challenges, drops lifecycle history, strips provenance, collapses identities, or loses consumption visibility, the index output MUST NOT be treated as the canonical registry view.

---

## 25. Implementation Guidance

This specification is implementation-neutral. It defines protocol semantics only.

Implementations SHOULD:

- preserve Canonical Evidence Identity separately from Registry Identity, External Identity, and Referenced Identity;
- record registration events as append-preserving historical events;
- preserve Evidence relationships as typed protocol relationships rather than generic links where material;
- preserve origin, source, producer, verification, challenge, registry, lifecycle, and consumption lineage;
- expose lifecycle visibility without pretending the registry creates the lifecycle facts;
- expose verification and challenge discovery without converting either into truth or authority;
- preserve consumption visibility where consumption affects Claims, Standing, Capabilities, Authorities, Decisions, Policies, rights, eligibility, or auditability;
- preserve subject sovereignty, challenge rights, consent boundaries, and portability;
- mark unresolved, ambiguous, conflicting, incomplete, unauthorized, expired, challenged, or indeterminate references explicitly;
- support cross-system, cross-organization, cross-domain, and cross-registry portability; and
- define extension behavior without violating Evidence boundaries.

Implementations MUST NOT define registry conformance by:

- database schemas;
- API endpoints;
- storage technologies;
- blockchain requirements;
- UI workflows;
- search ranking;
- vendor trust;
- platform-local identity alone; or
- administrative approval alone.

A conformant implementation MAY use any technically appropriate storage, transport, indexing, anchoring, access-control, federation, export, or query mechanism if it preserves the protocol semantics defined in this document.

---

## 26. Future Dependencies

This document depends on P-EV-02 Canonical Evidence Model and is intended to remain consistent with RFC-004 Evidence Layer v1.0, RFC-005 Claims Framework, and RFC-005-H1 Standing Traceability.

Future Evidence specifications SHOULD refine registry-adjacent concepts without redefining the registry as truth, ownership, authority, or decision-making.

Planned dependencies include:

- **P-EV-04 Evidence Lifecycle & Provenance**: lifecycle events, provenance models, transition rules, invalidation, supersession, archival semantics, and registry-visible lifecycle event handling.
- **P-EV-05 Evidence Profiles**: profile aggregation, profile scope, profile governance, profile portability, subject rights, and profile challenge semantics that registries may reference or expose.
- **P-EV-06 Evidence Anchoring**: cryptographic anchoring, existence proofs, integrity proofs, timestamping, cross-registry anchoring, and independent verification boundaries.
- **P-EV-07 Evidence Verification**: verification processes, verification authorities, verification chains, verification outcomes, verification conformance, and verification discovery rules.
- **P-EV-08 Evidence Governance**: governance rules for Evidence production, registration, discovery, consumption, access, consent, retention, challenge, review, portability, and registry operation.

These documents MUST preserve the principle that Evidence exists independently of the registry and that the registry preserves discoverability, lineage, relationships, and traceability without creating truth.

---

## 27. Acceptance Criteria

A conformant Evidence Registry specification satisfies the following criteria:

- [x] Defines what an Evidence Registry is.
- [x] Explains why an Evidence Registry exists.
- [x] Establishes that Evidence exists independently of the registry.
- [x] Establishes that registration creates protocol visibility, not truth.
- [x] Establishes that the registry is not Evidence, Claim, Standing, Capability, Authority, or Decision.
- [x] Defines registry principles: Discoverability, Traceability, Portability, Sovereignty, Lineage Preservation, Relationship Preservation, Auditability, and Non-Ownership.
- [x] Defines registry responsibilities, including registering Evidence, resolving Evidence references, maintaining relationships, maintaining lineage, maintaining lifecycle visibility, supporting verification discovery, supporting challenge discovery, and supporting audit discovery.
- [x] Defines registry non-responsibilities, including that the registry MUST NOT create truth, assign standing, grant capability, grant authority, make decisions, override provenance, or rewrite evidence history.
- [x] Defines Evidence Registration, Registration Request, Registration Context, Registration Validation, Registration Result, and Registration Lifecycle.
- [x] Defines Canonical Evidence Identity, Registry Identity, External Identity, and Referenced Identity.
- [x] Defines Evidence Resolution and its role in locating Evidence, resolving references, resolving lineage, resolving relationships, and resolving provenance.
- [x] Defines Registry Relationships across Evidence, Claims, Standing, Capabilities, Authority, Decisions, and Policies.
- [x] Defines Registry Provenance and references P-EV-02 provenance semantics.
- [x] Defines Registry Lifecycle Visibility and references future P-EV-04 lifecycle and provenance semantics.
- [x] Defines Evidence Discovery, Evidence Search, Evidence Lookup, Evidence Reference Resolution, and Cross-Domain Discovery.
- [x] Defines Registry Verification Discovery.
- [x] Defines Registry Challenge Discovery.
- [x] Defines Evidence Consumption and registry consumption tracking.
- [x] Defines Registry Sovereignty and preserves subject sovereignty, portability, challenge rights, and consent boundaries.
- [x] Defines Registry Portability across systems, organizations, domains, and registries.
- [x] Defines Registry Auditability and canonical audit questions.
- [x] Defines Registry Security risks, including evidence forgery, registry poisoning, relationship tampering, lineage corruption, consumption laundering, discovery abuse, and identity spoofing.
- [x] Defines Registry Guarantees, including no orphan Evidence, no hidden lineage, no hidden relationships, no hidden lifecycle, no hidden verification, no hidden challenges, and no registry ownership of Evidence.
- [x] Introduces first-class protocol concepts: EvidenceRegistry, EvidenceReference, EvidenceRegistration, EvidenceIdentity, EvidenceResolution, EvidenceRelationship, EvidenceLineage, EvidenceDiscovery, and EvidenceConsumption.
- [x] Explicitly distinguishes Evidence Registry from storage, database, repository, and search index.
- [x] Provides implementation-neutral guidance and avoids database schemas, API endpoints, storage technology prescription, blockchain requirements, and UI requirements.
- [x] Identifies future dependencies on P-EV-04, P-EV-05, P-EV-06, P-EV-07, and P-EV-08.
- [x] Uses protocol language with MUST, MUST NOT, SHOULD, and MAY.

---

## Conclusion

The Evidence Registry is the AOC Protocol mechanism for making canonical Evidence locatable, referenceable, traceable, auditable, portable, and discoverable.

It is not the source of truth. It is not Evidence ownership. It is not authority. It is not standing. It is not a decision process.

The Evidence Registry preserves the protocol graph around Evidence so that Claims, Standing, Delegation, Capabilities, Authority, and Decisions can remain explainable and reconstructable without collapsing Evidence into platform control.
