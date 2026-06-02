# RFC-004 — AOC Evidence Layer v1.0

| Field | Value |
|---|---|
| RFC Number | 004 |
| Title | AOC Evidence Layer v1.0 |
| Status | Draft |
| Category | Core Protocol |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-02 |
| Last Updated | 2026-06-02 |
| Supersedes | — |
| Related | RFC-001 (Identity Layer), RFC-002 (Governance Layer), RFC-003 (Knowledge Layer) |

---

## Abstract

This document defines the Evidence Layer, the fourth foundational pillar of the AOC Protocol. The Evidence Layer establishes a technology-neutral model for generating, registering, transferring, and verifying digital evidence in a portable, sovereign, and interoperable manner. It provides a formal conceptual and normative framework enabling individuals, organizations, governments, and AI systems to produce and consume evidence that is tamper-detectable, auditable, and independent of any single infrastructure provider.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Design Goals](#3-design-goals)
4. [Non-Goals](#4-non-goals)
5. [Core Principles](#5-core-principles)
6. [Core Concepts](#6-core-concepts)
7. [Evidence Lifecycle](#7-evidence-lifecycle)
8. [Trust Model](#8-trust-model)
9. [Roles and Responsibilities](#9-roles-and-responsibilities)
10. [Interoperability Requirements](#10-interoperability-requirements)
11. [Security Considerations](#11-security-considerations)
12. [Example Use Cases](#12-example-use-cases)
13. [Future Evolution](#13-future-evolution)
14. [Conclusion](#14-conclusion)

---

## 1. Executive Summary

### What is the Evidence Layer

The Evidence Layer is the normative framework within the AOC Protocol that governs how digital artifacts acquire, maintain, and transfer evidentiary value. It defines the rules under which a digital object — a contract, a decision record, a certification, a credential, or any formally produced document — can be asserted to be genuine, unmodified, and attributable to its origin.

While the existing AOC layers address *who* is acting (Identity), *under what authority* (Governance), and *with what knowledge* (Knowledge), the Evidence Layer addresses a distinct question: **how can the consequences of those actions be permanently and verifiably recorded?**

The Evidence Layer is not a storage system, a blockchain, or a document management platform. It is a protocol-level model that abstracts over all such infrastructure. Any conformant system — whether backed by a distributed ledger, a traditional database, a content-addressed file system, or a hybrid — can participate in the Evidence Layer as long as it respects the normative model defined herein.

### Why it exists

Digital organizations operate under the persistent assumption that the documents they produce carry weight — that a contract signed today will be recognizable as authentic in five years, that an approval recorded this quarter can be audited next year, that a decision made by an AI agent can be examined by a regulator tomorrow. This assumption is, in most contemporary systems, fragile. Documents are stored in vendor-controlled repositories, signed with vendor-managed keys, and interpreted through vendor-specific tooling. The moment a vendor is acquired, discontinued, or breached, the evidentiary chain collapses.

The Evidence Layer exists to make that assumption robust. By defining a vendor-neutral, protocol-level model for evidence, AOC Protocol enables any actor to produce evidence that survives infrastructure changes, outlasts individual platforms, and can be verified by parties who were never party to the original transaction.

### What problem it solves

The Evidence Layer solves the problem of **fragile, dependent, unverifiable digital evidence** at organizational scale. It defines:

- A canonical model for what constitutes a verifiable artifact
- A lifecycle model that tracks evidence from creation to archival
- A trust model that does not assume infrastructure trustworthiness
- A roles model that distributes responsibilities without centralizing control
- An interoperability model that allows evidence to cross system, jurisdictional, and temporal boundaries

---

## 2. Problem Statement

### 2.1 Evidence Fragmentation

In contemporary digital environments, evidence of consequential events is scattered across heterogeneous, disconnected systems. A contract may exist in a legal document management system. The approval for that contract may live in an email thread. The identity of the approver may be managed by a third-party SSO provider. The timestamp may be supplied by the application server without independent verification. No single actor can reconstruct the full evidentiary chain without accessing multiple proprietary systems, each with its own access controls, data formats, and availability guarantees.

This fragmentation is not merely inconvenient. It creates audit gaps that cannot be closed retroactively, compliance exposures that cannot be detected until an incident occurs, and legal disputes that cannot be resolved with available evidence.

### 2.2 Vendor and Platform Dependence

The evidentiary validity of most digital records is contingent on the continued operation of the platform that issued them. An e-signature produced by a SaaS provider is meaningful only as long as that provider's verification endpoint remains operational and that provider's trust anchors remain valid. A document stored in a cloud-native repository is retrievable only as long as the organization maintains its subscription and the provider does not alter its access policies.

This dependence is an architectural flaw, not a business consideration. Evidence that expires when a contract does is not evidence — it is a record with a planned obsolescence built in.

### 2.3 Audit Difficulty

Even where evidence nominally exists, the ability to audit it is constrained by the same proprietary systems that store it. Auditors frequently find themselves unable to verify the integrity of a document without access to vendor-specific tooling, internal certificate authorities, or proprietary metadata schemas. Independent third-party verification — the gold standard of evidentiary integrity — is rarely achievable within current enterprise document architectures.

### 2.4 Loss of Traceability

Digital evidence routinely loses traceability through migration, reformatting, or system replacement. When an organization moves from one platform to another, evidence produced in the old system may be imported in a degraded form that strips cryptographic metadata, signature timestamps, or audit trail linkages. The result is a corpus of records that exist physically but are, from an evidentiary standpoint, unverifiable.

### 2.5 Manipulation and Forgery

The lack of a universal verification model creates conditions in which document manipulation is difficult to detect and easy to conceal. Without independent verification anchors, a document that has been altered after the fact may be indistinguishable from one that has not — particularly when the alteration is performed by a party with write access to the storage system. This vulnerability affects not only individual documents but the integrity of entire decision records, compliance histories, and audit trails.

### 2.6 Absence of Universal Verifiability

Perhaps most critically, no current standard enables a party entirely external to a transaction to independently verify evidence without cooperation from the parties involved. Legal systems, regulators, auditors, and AI systems that must operate across organizational boundaries consistently encounter evidence that is only self-verifiable — verifiable, if at all, only by reference to the systems that produced it.

### 2.7 Impact Across Actor Classes

These problems do not affect actors uniformly:

**Individuals** face evidence asymmetry: organizations that produce evidence about them — employment records, credentials, evaluations — control that evidence completely. An individual seeking to port a work history, dispute a record, or establish their qualifications to a new party has no protocol-level mechanism for doing so without the cooperation of the original issuing organization.

**Enterprises** face regulatory exposure, litigation risk, and internal audit failures that derive directly from fragile evidentiary infrastructure. The cost of reconstructing evidence chains during discovery or regulatory review is substantial, and the risk of undetectable manipulation is not adequately addressed by current controls.

**Governments** and **regulatory bodies** depend on the ability to independently verify that the documents they receive accurately represent the transactions they purport to record. Where they cannot do so — because the evidentiary infrastructure belongs to the regulated entity — the regulatory function is compromised.

**AI systems** face a distinct challenge: as they increasingly make, participate in, or execute consequential decisions, the ability to produce tamper-evident records of those decisions becomes a prerequisite for trust, accountability, and safe deployment. Without an evidence layer, AI decision-making is opaque by default.

---

## 3. Design Goals

The Evidence Layer is designed to satisfy the following goals. These goals are ordered by priority. Where goals conflict, higher-priority goals take precedence.

### G-1: Verifiability

Any conformant evidence artifact must be independently verifiable by a party that was not involved in its production, without relying on the continued availability of the producing system or the cooperation of the producing party. Verification must be achievable using only the artifact itself, its Evidence ID, and public verification rules.

### G-2: Sovereignty

The entity that produces evidence must retain meaningful control over it. This does not mean exclusive custody — evidence may be registered with third parties, shared with consumers, or submitted to registries — but the producing entity must not be required to surrender ownership, access rights, or the ability to assert provenance as a condition of evidential validity.

### G-3: Portability

Evidence must be expressible in forms that can be transferred across organizational, jurisdictional, and technological boundaries without loss of evidentiary integrity. Portability requires that the evidence model, not the transport mechanism, carries the evidentiary properties.

### G-4: Technological Neutrality

The Evidence Layer must not be bound to any specific infrastructure technology, cryptographic algorithm suite, distributed ledger, or vendor. Conformant implementations may use any technically appropriate mechanism for registration and verification, provided they satisfy the normative requirements of this specification.

### G-5: Resistance to Manipulation

The Evidence Layer must provide structural guarantees, not merely procedural ones, against undetected modification of evidence. Any alteration of a conformant evidence artifact must be detectable by a verifier who has access to the original Evidence ID and the verification rules.

### G-6: Auditability

Evidence must be auditable. This means that the full history of an artifact's lifecycle — from generation through any transformations, supersessions, or archival — must be reconstructable by an authorized auditor using only the artifact's Evidence ID and publicly available protocol rules.

### G-7: Interoperability

The Evidence Layer must define a model that can be implemented by, and integrated with, existing systems across enterprise, legal, regulatory, and AI contexts. Interoperability does not require full conformance from all parties; it requires that partially conformant integrations produce evidence that is meaningful and partially verifiable even across the conformance boundary.

---

## 4. Non-Goals

The following are explicitly outside the scope of the Evidence Layer v1.0. They are documented here to prevent scope creep and to establish clear expectations for implementers.

### 4.1 Universal Storage

The Evidence Layer does not define or provide a universal storage system for digital artifacts. It defines how artifacts acquire evidentiary properties; it does not prescribe where or how they are stored. Storage is an infrastructure concern that falls outside the protocol layer.

### 4.2 Legal Identity Resolution

The Evidence Layer does not resolve legal identity. Whether a given Evidence Producer corresponds to a specific legal entity — a natural person, a corporation, a government body — is a matter for identity systems, legal frameworks, and jurisdictional rules. The Evidence Layer may interoperate with identity systems, but it does not replace them.

### 4.3 Replacement of Digital Signatures

The Evidence Layer is not a digital signature scheme and does not replace existing digital signature standards (such as those defined in PKCS, ISO 14888, or ETSI AdES families). It may incorporate or reference digital signatures as a mechanism for achieving certain evidential properties, but it operates at a conceptual layer above specific cryptographic mechanisms.

### 4.4 Replacement of Legal or Judicial Systems

The Evidence Layer does not create legal rights, obligations, or remedies. It provides a technical model for establishing evidentiary properties that may be useful in legal contexts, but the determination of legal evidentiary admissibility, weight, and effect remains the exclusive province of applicable legal systems.

### 4.5 Replacement of Blockchain Infrastructure

The Evidence Layer does not replace, compete with, or replicate blockchain technology. It defines a protocol model that may use a blockchain as one possible registration infrastructure, alongside many other options. No blockchain system is required, privileged, or excluded by this specification.

### 4.6 Content Interpretation

The Evidence Layer is not concerned with the semantic content of artifacts. It does not define what a contract means, whether a decision was correct, or whether a credential accurately represents a person's qualifications. These interpretive questions are outside its scope. The Evidence Layer is concerned solely with the structural integrity and verifiable provenance of the artifact as a digital object.

### 4.7 Real-Time Verification Performance

The Evidence Layer does not specify performance requirements for verification operations. Verification latency, throughput, and availability are implementation concerns that depend on the chosen registration infrastructure and are not normatively constrained by this specification.

---

## 5. Core Principles

The following principles are normative foundations of the Evidence Layer. All design decisions in this specification are derived from, and must be consistent with, these principles.

### P-1: Evidence Ownership

Evidence belongs to the entity that generates it. This principle establishes that the Evidence Producer is the primary rights-holder with respect to evidence it creates. Third parties — registries, verifiers, consumers — acquire access rights and functional roles with respect to evidence, but they do not acquire ownership. This principle has implications for data governance, portability requirements, and the structure of registry relationships: no registry may assert a right to withhold, modify, or destroy evidence on behalf of the Producer, except where explicitly authorized by the Producer or required by applicable law.

### P-2: Verifiability Without Trust

Evidence verification must not require trust in the verifying party's counterpart. A verifier must be able to confirm the evidentiary properties of an artifact using only public protocol rules and the artifact's own structure. This principle excludes verification models that depend on the issuer confirming the document's authenticity upon request — a model that is both fragile and centralized. Verifiability must be an intrinsic property of conformant evidence, not a service provided by its creator.

### P-3: Infrastructure Independence

The evidentiary properties of a conformant artifact must not be contingent on the continued operation of any specific infrastructure component. The loss or unavailability of any single registry, signing service, timestamping authority, or distributed ledger must not retroactively invalidate evidence that was validly produced under this protocol. This principle requires that evidentiary properties be encoded within the artifact itself in a form sufficient for independent verification, not merely referenced by pointer to an external system.

### P-4: Portability as First-Class Property

The ability to transfer evidence across system boundaries without degradation of its evidentiary properties is a first-class design requirement, not an optional feature. Evidence must be expressible in portable forms that carry all information necessary for verification, and the protocol must define how evidence retains its properties when transferred from one context to another.

### P-5: Public Transparency of Verification Rules

The rules by which conformant evidence is verified must be publicly documented, openly accessible, and not subject to unilateral change by any single party. This principle ensures that evidence produced under this protocol remains verifiable even when the original producing organization no longer exists, has been acquired, or has changed its policies.

### P-6: Integrity by Structure

Tamper-detection must be a structural property of conformant evidence, not a procedural one. It must not be the case that the integrity of evidence depends on procedural controls such as access restrictions, audit logs, or change management processes, even though such controls may exist as complementary safeguards. The evidence itself, by its structure, must make any unauthorized modification detectable.

### P-7: Persistence Beyond Producers

Evidence must be designed to survive the discontinuation of the system, organization, or platform that produced it. This requires that evidence carry sufficient internal context for verification to proceed without reference to the producing system's current operational state. An evidence artifact must remain verifiable — absent specific time-bound trust anchors — even if the organization that produced it no longer exists.

---

## 6. Core Concepts

### 6.1 Artifact

#### Definition

An **Artifact** is any discrete digital object that an actor intentionally produces as a record of a consequential event, decision, state, or agreement. An Artifact, by itself, is simply a digital object — it carries informational content but does not yet possess evidentiary properties.

#### Examples

- A contract document produced at the conclusion of a negotiation
- A decision record capturing the outcome of a governance process
- A meeting minute summarizing a discussion and any resolutions reached
- An approval record encoding authorization granted within a workflow
- A requirements document capturing formally agreed functional specifications
- A policy document defining organizational rules or constraints
- A certification asserting that a process or system meets defined criteria
- A credential asserting that an individual has acquired a recognized qualification
- An evaluation record summarizing a performance or competency assessment
- A reference letter attesting to an individual's professional history
- A legal instrument creating, modifying, or terminating legal obligations
- A regulatory submission documenting compliance with applicable rules
- A record of an AI agent's decision, including the inputs, reasoning, and outcome

#### Conceptual Attributes

An Artifact, prior to evidence production, possesses the following conceptual attributes:

- **Content**: The substantive informational body of the artifact
- **Type**: A classification indicating the kind of record (contract, decision, credential, etc.)
- **Origin Context**: The system, process, or actor that produced the artifact
- **Production Time**: The point in time at which the artifact was created
- **Subject**: The entity or matter to which the artifact pertains

Note that these attributes are conceptual. This specification does not prescribe their encoding; that is an implementation concern.

### 6.2 Evidence

#### Definition

**Evidence** is an Artifact to which evidentiary properties have been formally applied under this protocol. Evidence is not merely a stored document — it is a document plus a set of structural guarantees about its integrity, provenance, and verifiability.

The transformation from Artifact to Evidence is not automatic. It requires a deliberate act by an Evidence Producer, resulting in the attachment of an Evidence ID and compliance with the structural requirements of this specification.

#### Difference Between Artifact and Evidence

The distinction is foundational and must be clearly understood:

| Property | Artifact | Evidence |
|---|---|---|
| Exists as digital object | Yes | Yes |
| Carries informational content | Yes | Yes |
| Tamper-detectable | Not necessarily | Required |
| Independently verifiable | Not necessarily | Required |
| Has an Evidence ID | No | Required |
| Lifecycle-tracked | Not necessarily | Required |
| Infrastructure-independent | Not necessarily | Required |

An Artifact becomes Evidence when it satisfies all of the structural requirements defined in this specification. The same physical document may serve as both an Artifact within a document management system and as Evidence within the AOC Evidence Layer — but its evidentiary properties derive from its conformance to this protocol, not from its storage location.

### 6.3 Evidence ID

#### Definition

An **Evidence ID** is a globally unique, deterministically derivable identifier that is canonically bound to a specific Evidence artifact. It functions as the persistent handle by which evidence can be referenced, retrieved, and verified across any conformant system.

#### Characteristics

The Evidence ID has the following conceptual characteristics:

- **Global uniqueness**: No two distinct Evidence artifacts may share an Evidence ID
- **Determinism**: Given the same artifact content and production context, the same Evidence ID must always result. This property enables independent verification without reliance on a central issuing authority
- **Immutability**: An Evidence ID, once issued, may not be changed, reused, or reassigned
- **Opacity**: An Evidence ID carries no semantic content about the evidence it identifies. It does not encode classification, ownership, or content — it is solely an identifier

#### Requirements

A conformant Evidence ID must satisfy the following normative requirements:

- It must be derivable from the artifact's content using a deterministic, publicly specified derivation rule
- It must be collision-resistant: the probability that two distinct artifacts produce the same Evidence ID must be negligible under the protocol's security model
- It must be portable: it must be representable in any text-based medium without loss of fidelity
- It must be stable: the Evidence ID of a given artifact must remain constant regardless of where the artifact is stored, how it is transported, or which system is used to read it

#### Expected Properties

Beyond the normative requirements above, a well-designed Evidence ID should:

- Be compact enough for inclusion in document headers, metadata fields, and audit records
- Be self-describing in the sense that its structure reveals which derivation rule was used, enabling forward-compatible verification as derivation rules evolve
- Be human-readable to a sufficient degree that manual transcription errors are detectable

### 6.4 Verification

#### Formal Definition

**Verification** is the process by which a party — the Verifier — determines, using only the evidence artifact, its Evidence ID, and the publicly specified verification rules of this protocol, whether a given artifact conforms to the structural requirements of the Evidence Layer and has not been modified since its Evidence ID was derived.

#### Objective

The objective of verification is to answer, with a deterministic outcome, the question: *Is this the artifact that produced this Evidence ID, unmodified since that ID was derived?*

Verification is intentionally scoped to structural integrity and provenance. It does not, and cannot, verify:

- The truthfulness of the artifact's content
- The authority of the Evidence Producer to produce the artifact
- The legal or regulatory validity of the artifact's claims
- The completeness of the information the artifact contains

These questions are outside the scope of the Evidence Layer and must be addressed by the Identity Layer, Governance Layer, or applicable external frameworks.

#### Possible Outcomes

A conformant verification operation produces one of exactly three outcomes:

**VALID**: The artifact matches its Evidence ID under the applicable verification rule. The artifact has not been modified since its Evidence ID was derived.

**INVALID**: The artifact does not match its Evidence ID under the applicable verification rule. This may indicate modification, corruption, or a mismatch between the artifact and the claimed Evidence ID.

**INDETERMINATE**: Verification cannot be completed. This outcome arises when required verification inputs are unavailable — for example, when the verification rule referenced by the Evidence ID is not available, or when the artifact is structurally incomplete. An INDETERMINATE outcome must not be treated as equivalent to VALID.

### 6.5 Evidence Registry

#### Conceptual Definition

An **Evidence Registry** is any system that accepts Evidence IDs and associated metadata for the purpose of providing an independently accessible record of evidence existence at a specific point in time. A registry does not store the artifact itself; it stores the Evidence ID and sufficient metadata to support lifecycle queries and temporal proofs.

#### Responsibilities

A conformant Evidence Registry is responsible for:

- Accepting registration requests from authorized Evidence Producers
- Recording the Evidence ID and associated registration metadata in a manner that is durable, timestamped, and auditable
- Providing a mechanism by which any party can query the registration status of an Evidence ID
- Maintaining the integrity of registration records against modification after the fact
- Supporting lifecycle state transitions as defined in Section 7

#### Limitations

An Evidence Registry is not responsible for:

- Storing or serving the artifact itself
- Verifying the content accuracy of registered evidence
- Determining the legal validity of registered evidence
- Enforcing access controls on the underlying artifact
- Guaranteeing the identity of the Evidence Producer beyond what the registration metadata attests

A single evidence artifact may be registered in multiple registries simultaneously. Multiple registrations do not create multiple evidence artifacts — they create multiple temporal proofs for the same artifact, which may serve different governance, jurisdictional, or redundancy purposes.

---

## 7. Evidence Lifecycle

The Evidence Lifecycle defines the states through which a conformant evidence artifact may pass, the valid transitions between those states, and the events that trigger those transitions.

### 7.1 States

```
┌─────────┐
│  DRAFT  │
└────┬────┘
     │ Evidence Production Act
     ▼
┌───────────┐
│ GENERATED │
└─────┬─────┘
      │ Registration Act
      ▼
┌────────────┐
│ REGISTERED │◄──────────────────────────────┐
└──────┬─────┘                               │
       │ Verification Act                    │ Re-registration
       ▼                                     │ (additional registry)
┌──────────┐                                 │
│ VERIFIED │─────────────────────────────────┘
└──────┬───┘
       │ Supersession Act OR Archival Decision
       ▼                        ▼
┌────────────┐           ┌──────────┐
│ SUPERSEDED │           │ ARCHIVED │
└────────────┘           └──────────┘
```

### 7.2 State Definitions

#### DRAFT

**Meaning**: The artifact exists as a digital object but has not yet had an Evidence ID derived. It is a work in progress. It possesses no evidentiary properties under this protocol.

**Permitted Transitions**: DRAFT → GENERATED only.

**Relevant Events**: Content finalization, authoring completion, approval to produce evidence.

#### GENERATED

**Meaning**: The Evidence Production Act has been performed. An Evidence ID has been derived from the artifact's content. The artifact now possesses structural evidentiary properties — its integrity can be verified against its Evidence ID — but it has not yet been registered with any external registry.

**Permitted Transitions**: GENERATED → REGISTERED, GENERATED → ARCHIVED (if the artifact is abandoned before registration).

**Relevant Events**: Evidence ID derivation, signing act, attachment of production metadata.

Note: Evidence in GENERATED state is verifiable but carries no external temporal proof. Its timestamp is asserted by the producer alone.

#### REGISTERED

**Meaning**: The Evidence ID and associated metadata have been accepted by at least one conformant Evidence Registry. The artifact now benefits from an externally provided temporal proof establishing that the Evidence ID existed at the time of registration.

**Permitted Transitions**: REGISTERED → VERIFIED, REGISTERED → SUPERSEDED, REGISTERED → ARCHIVED. Additional registrations are permitted (the state remains REGISTERED, but the set of registration records grows).

**Relevant Events**: Registry acceptance, timestamp issuance, registry acknowledgment delivery.

#### VERIFIED

**Meaning**: A conformant verification operation has been performed and returned a VALID outcome. The artifact has been confirmed to match its Evidence ID under the applicable verification rule as of the time of verification.

**Permitted Transitions**: VERIFIED → SUPERSEDED, VERIFIED → ARCHIVED. Additional verifications may be performed; each verification creates an independent verification record while the state remains VERIFIED.

**Relevant Events**: Verification request, verification computation, VALID outcome recorded.

Note: Verification is an act, not a permanent state. Evidence that is VERIFIED today may be re-verified at any future time by any party. Each verification is independently significant. The VERIFIED state indicates that at least one successful verification has been performed and recorded.

#### SUPERSEDED

**Meaning**: The artifact has been formally replaced by a new artifact that corrects, updates, or supplements it. The superseded artifact retains its Evidence ID and its complete lifecycle history, but it is no longer the current version of record.

**Permitted Transitions**: None. SUPERSEDED is a terminal state for the artifact itself, though the superseding artifact has its own independent lifecycle.

**Relevant Events**: Supersession declaration, linkage to successor artifact's Evidence ID, reason for supersession recorded.

Note: Supersession does not invalidate the evidentiary record of the superseded artifact. Historical verifications of the superseded artifact remain valid. The supersession record itself is evidence of the transition.

#### ARCHIVED

**Meaning**: The artifact is no longer in active use but its evidentiary record is preserved for historical, legal, or compliance purposes. Archival is an administrative state that does not affect verifiability.

**Permitted Transitions**: None. ARCHIVED is a terminal state.

**Relevant Events**: Archival decision, retention policy application, archival record creation.

Note: ARCHIVED evidence remains fully verifiable. Archival affects operational status, not evidentiary validity.

---

## 8. Trust Model

### 8.1 What the Protocol Assumes

The Evidence Layer operates on the following foundational assumptions:

**Honest derivation assumption**: The Evidence Layer assumes that the Evidence ID was derived from the artifact as presented at the time of production. It does not assume that the artifact's *content* is true, authorized, or legally valid — only that the relationship between the artifact and its Evidence ID was established honestly at the time of production.

**Public rule availability**: The protocol assumes that verification rules are publicly available and have not been altered after evidence was produced against them. Verification rule integrity is a prerequisite for meaningful verification; it is a responsibility of the protocol governance structure, not the Evidence Layer itself.

**Registry temporal honesty**: When a registry records a timestamp, the protocol assumes that timestamp accurately reflects the time of registration. This assumption may be strengthened by registry infrastructure choices — distributed ledgers, trusted timestamping services, or network time attestations — but the protocol does not mandate any specific mechanism.

### 8.2 What the Protocol Does Not Assume

**The protocol does not assume infrastructure honesty.** The Evidence Layer is specifically designed to function correctly even when registry operators, storage systems, or transport infrastructure behave incorrectly, fail, or are compromised — as long as the artifact itself survives intact. The protocol's tamper-detection properties are intrinsic to the artifact, not dependent on infrastructure honesty.

**The protocol does not assume producer honesty about content.** A malicious producer could create an Evidence ID for a document containing false information. The Evidence Layer would correctly verify that the document matches its Evidence ID — this is accurate — while saying nothing about whether the document's content is true. Content truthfulness is out of scope.

**The protocol does not assume single-registry availability.** The protocol explicitly accommodates scenarios in which registries become unavailable. Evidence that has been registered, and whose artifact survives, remains verifiable regardless of registry availability.

### 8.3 Trust Boundaries

The Evidence Layer establishes clear trust boundaries:

**Within the boundary** (what the Evidence Layer guarantees):
- That a conformant artifact has not been modified since its Evidence ID was derived
- That the relationship between artifact and Evidence ID is deterministic and publicly verifiable
- That the lifecycle state transitions of an artifact have been recorded in conforming registries

**Outside the boundary** (what the Evidence Layer cannot guarantee):
- The identity of the Evidence Producer as a legal or natural person
- The authority of the Evidence Producer to produce the artifact
- The accuracy of the artifact's content
- The legal admissibility or enforceability of the evidence in any jurisdiction
- The operational availability of any registry

### 8.4 Verifying vs. Trusting

A critical distinction underlies the entire trust model:

**Trusting a system** means relying on the system to behave correctly, and accepting its assertions without independent validation. Trust is inherently fragile: it depends on the trustee's continued competence, honesty, and availability.

**Verifying a system** means independently confirming, using public rules and local computation, that the system's claims are consistent with the evidence presented. Verification is inherently robust: it depends only on the availability of the artifact and the verification rules, neither of which requires the continued cooperation of any third party.

The Evidence Layer is explicitly designed to enable verification, not to require trust. Every normative requirement in this specification is, at its root, aimed at making independent, trustless verification possible for any conformant artifact.

---

## 9. Roles and Responsibilities

### 9.1 Evidence Producer

#### Definition

An **Evidence Producer** is any actor — individual, organization, automated system, or AI agent — that performs the Evidence Production Act on an Artifact, thereby creating Evidence conformant with this protocol.

#### Responsibilities

- Performing the Evidence Production Act correctly and completely
- Ensuring the accuracy and completeness of evidence metadata at the time of production
- Registering produced evidence with at least one conformant Evidence Registry when independent temporal proof is required
- Managing the lifecycle of produced evidence, including declaring supersessions and initiating archival
- Retaining the artifact and its Evidence ID in a manner sufficient to support future verification

#### Limits

The Evidence Producer is responsible for the integrity of the production act, not for the truthfulness of the artifact's content as evaluated by third parties. The Evidence Producer's obligations are structural and procedural; they do not extend to guaranteeing that the evidence will be legally recognized in any jurisdiction.

### 9.2 Evidence Consumer

#### Definition

An **Evidence Consumer** is any actor that receives, references, or makes decisions based on evidence produced under this protocol.

#### Responsibilities

- Performing or commissioning verification before relying on evidence for consequential decisions
- Retaining verification records sufficient to demonstrate due diligence
- Understanding the scope of what verification confirms and does not confirm (see Section 8)
- Not asserting evidentiary properties beyond what has been verified

#### Limits

Evidence Consumers are not required to verify evidence independently in all cases. They may rely on verification records produced by authorized Evidence Verifiers. However, the decision to rely on evidence without independent verification is the consumer's responsibility.

### 9.3 Evidence Verifier

#### Definition

An **Evidence Verifier** is any actor that performs a formal verification operation on evidence and produces a verification record.

#### Responsibilities

- Performing verification in strict conformance with the publicly specified verification rules
- Recording the verification outcome, the time of verification, and the identity of the verifier
- Communicating verification outcomes clearly, including the scope of what was verified
- Not asserting certainty about matters outside the scope of the verification act (content truthfulness, legal validity, producer authority)

#### Limits

An Evidence Verifier's authority is limited to the verification act itself. A verifier's assertion that evidence is VALID means only that the artifact matches its Evidence ID under the applicable rule. It does not constitute an endorsement of the content, an authorization of the action it records, or a legal attestation of any kind.

### 9.4 Registry Operator

#### Definition

A **Registry Operator** is any actor that operates a conformant Evidence Registry.

#### Responsibilities

- Maintaining the registry in a manner that preserves the integrity of registration records
- Providing publicly accessible query mechanisms for Evidence IDs and their registration metadata
- Implementing the lifecycle state transition model defined in Section 7
- Publishing and maintaining a registry conformance statement documenting the registry's technical approach and governance model
- Preserving registration records for a duration consistent with the registry's governance commitments

#### Limits

Registry Operators do not have authority to modify registration records after the fact. They are custodians of temporal proof, not arbiters of evidentiary validity. A registry that becomes unavailable does not invalidate evidence registered in it — it merely reduces the availability of temporal proof for that evidence.

### 9.5 Governance Authority

#### Definition

A **Governance Authority** is the body or process responsible for maintaining this protocol specification, managing verification rule versions, and adjudicating conformance disputes.

#### Responsibilities

- Maintaining the canonical version of this specification and all referenced verification rules
- Managing the versioning and deprecation lifecycle of verification rules
- Providing public access to all current and historical verification rules
- Adjudicating disputes about protocol conformance
- Communicating changes to this specification with sufficient notice for implementers to adapt

#### Limits

The Governance Authority is responsible for the specification and its rules; it is not the issuing authority for evidence, a registry operator, or a verifier. It does not validate individual evidence artifacts, approve specific registries, or certify the qualifications of Evidence Producers.

---

## 10. Interoperability Requirements

The Evidence Layer must support meaningful integration with a broad set of existing and future systems. Interoperability requirements are organized by system class.

### 10.1 Enterprise Platforms

Systems in this class include enterprise resource planning platforms, document management systems, contract lifecycle management platforms, and project management tools.

Requirements:

- Evidence Producers operating within enterprise platforms must be able to produce conformant evidence from artifacts managed within those platforms without requiring migration of artifacts to a separate evidence-specific system
- Enterprise platforms that wish to serve as Evidence Registries must be able to implement the registry interface model without structural changes to their existing data models
- Evidence IDs must be expressible as metadata attributes within standard enterprise document schemas
- Verification operations must be performable by enterprise platforms on behalf of their users, with the platform acting as an authorized Evidence Verifier
- Evidence lifecycle state must be queryable through interfaces compatible with enterprise workflow and audit systems

### 10.2 AI Agent Systems

Systems in this class include autonomous AI agents, AI-assisted decision platforms, and multi-agent coordination systems.

Requirements:

- AI agents that produce consequential decisions must be able to act as Evidence Producers, generating conformant evidence of those decisions
- Evidence produced by AI agents must carry sufficient provenance metadata to identify the agent, the model version, the input context, and the decision or output
- AI systems consuming evidence must be able to perform or request verification before incorporating evidentiary claims into downstream reasoning
- Multi-agent systems must support evidence chain construction: evidence produced by one agent may reference evidence produced by another, creating a verifiable lineage of decisions
- Evidence produced by AI agents must be verifiable by human actors using the same verification rules as apply to human-produced evidence

### 10.3 Legal Systems

Systems in this class include courts, arbitral tribunals, notarial services, and legal document management platforms.

Requirements:

- Evidence produced under this protocol must be expressible in forms that can be submitted as exhibits in legal proceedings without requiring specialized technical infrastructure for presentation
- The verification rules of this protocol must be publicly documented in a form accessible to legal professionals who are not technical specialists
- Evidence IDs must be incorporable into legal instruments by reference, such that a legal instrument that references an Evidence ID can be meaningfully linked to the corresponding artifact
- The SUPERSEDED and ARCHIVED lifecycle states must produce records that support legal inquiry into the history of a document
- The protocol must not create dependencies on evidence validity that would conflict with applicable legal requirements for document admissibility

### 10.4 Regulatory Systems

Systems in this class include compliance management platforms, regulatory reporting systems, and government inspection and audit systems.

Requirements:

- Evidence submitted to regulatory systems must carry sufficient metadata to enable regulators to independently verify its provenance and integrity without requiring access to the submitting organization's internal systems
- Registry records must be exportable in forms suitable for regulatory preservation and retrieval
- The lifecycle model defined in Section 7 must support regulatory retention requirements, including the ability to distinguish between active, superseded, and archived evidence
- Regulatory bodies that wish to act as Evidence Registries must be able to do so within the normative framework of this specification
- Evidence produced by regulated entities must be verifiable by regulators using only public protocol rules, without cooperation from the regulated entity

### 10.5 Distributed Ledgers and Blockchains

Systems in this class include public and private blockchain networks, distributed ledger systems, and smart contract platforms.

Requirements:

- Any conformant distributed ledger may serve as an Evidence Registry by accepting Evidence IDs and providing durable, timestamped, publicly queryable records
- The protocol must not require the use of any specific ledger and must not privilege any ledger over others
- Evidence IDs registered on multiple ledgers simultaneously must retain their identity: the same Evidence ID registered on multiple chains represents the same evidence, not multiple evidence artifacts
- The protocol must accommodate the performance and cost characteristics of distributed ledgers, including scenarios where registration may be delayed, batched, or subject to finality delays
- Smart contract-based registries must be able to implement the registry interface model, subject to the technical constraints of their execution environment

### 10.6 Document Repositories and Archives

Systems in this class include content management systems, digital preservation platforms, institutional repositories, and long-term archival systems.

Requirements:

- Evidence artifacts must be storable in conformant repositories in their original form, without modification that would invalidate their Evidence IDs
- Repositories must be able to serve as Evidence Registries if they implement the required interface model
- Long-term archival systems must be able to preserve evidence in forms that remain verifiable even as the technical environment evolves, including through cryptographic algorithm transitions
- The Evidence ID model must support future-proofing strategies that allow verification to remain possible even when original derivation algorithms are deprecated

---

## 11. Security Considerations

This section identifies the principal security threats relevant to the Evidence Layer and describes the protocol's conceptual response to each. This section does not prescribe specific cryptographic mechanisms or implementation controls; those are addressed in implementation guidance documents.

### 11.1 Artifact Alteration

**Threat**: An artifact is modified after its Evidence ID has been derived, in an attempt to change the record of an event while preserving the appearance of evidentiary validity.

**Protocol response**: The Evidence Layer's Integrity principle (P-6) requires that Evidence IDs be derived from the full artifact content in a manner that makes any post-derivation modification detectable as a verification failure. Any attempt to alter an artifact will produce a INVALID verification outcome. The protocol does not prevent alteration — it guarantees that alteration is detectable.

**Residual risk**: If both the artifact and the registry record are controlled by the same party, that party could attempt to derive a new Evidence ID for the altered artifact and substitute the registration record. The Evidence Layer mitigates this through the use of independent registries and by ensuring that Evidence IDs derived from distinct content are distinct. However, this residual risk underlines the importance of registering evidence with registries that are operationally independent of the Evidence Producer.

### 11.2 Forgery and Fabrication

**Threat**: A malicious actor creates a fraudulent artifact and presents it with a valid-appearing Evidence ID and registration record, in an attempt to pass off fabricated content as legitimate evidence.

**Protocol response**: The deterministic derivation of Evidence IDs means that a valid Evidence ID can only be produced by computing it from the specific content of the artifact. An adversary who wishes to forge a specific document must either compute an Evidence ID for the forged content — which is detectable by anyone who queries the registry for the expected Evidence ID — or produce a collision, which is excluded by the collision-resistance requirement (Section 6.3).

**Residual risk**: Nothing in the Evidence Layer prevents a producer from honestly producing evidence of a fraudulent document — that is, accurately attesting that a document with false content existed at a given time. The protocol detects modification; it does not validate truthfulness. Forensic and legal mechanisms remain necessary for content verification.

### 11.3 Registry Record Loss

**Threat**: A registry becomes unavailable, is decommissioned, or loses its records, causing the temporal proof for registered evidence to be lost.

**Protocol response**: The protocol accommodates multi-registry registration (Section 6.5), which distributes temporal proof across independent registries. Evidence that is registered in multiple conformant registries retains its temporal proofs even if some registries become unavailable. The protocol also requires that evidence artifacts be self-contained with respect to verification — the Evidence ID alone, without reference to a registry, is sufficient to verify structural integrity.

**Residual risk**: If all registries in which an artifact is registered become unavailable, temporal proof is lost. The artifact remains structurally verifiable against its Evidence ID, but no external timestamp corroborates the claimed production time. This underlines the value of multi-registry registration for evidence of high temporal sensitivity.

### 11.4 Third-Party Dependency

**Threat**: The continued validity of evidence is contingent on the continued operation of a third party — a signing service, a timestamping authority, a registry — whose future availability cannot be guaranteed.

**Protocol response**: The Infrastructure Independence principle (P-3) and the Persistence principle (P-7) directly address this threat. Verification must be achievable from the artifact itself, without depending on any specific third-party service being operational. Registry availability strengthens the evidentiary record; it is not a prerequisite for verification.

**Residual risk**: Evidence that relies on revocable trust anchors — such as certificates issued by a Certificate Authority that may later be revoked — carries an inherent dependency that the protocol cannot fully eliminate. Implementers are advised to prefer time-stamped evidence structures that fix the trust relationship at the time of production rather than dynamically resolving it at the time of verification.

### 11.5 Metadata Corruption

**Threat**: The metadata associated with an evidence artifact — producer identity, production time, artifact type, lifecycle state — is corrupted or falsified, without altering the artifact content itself.

**Protocol response**: The Evidence Layer's integrity requirements apply to the full evidence structure, which includes metadata as well as artifact content. An Evidence ID derived from a structure that includes metadata will detect any post-derivation corruption of that metadata as a verification failure. However, metadata that is stored separately from the artifact — in a registry record that is not bound by the same Evidence ID — is not protected by this mechanism.

**Residual risk**: Metadata stored exclusively in registries, without being incorporated into the artifact structure from which the Evidence ID is derived, is not intrinsically protected. Registry operators bear primary responsibility for the integrity of registry records. This specification recommends that evidence production structures incorporate all material metadata within the artifact itself, not solely in registry records.

---

## 12. Example Use Cases

### 12.1 PMO: Verified Scope Change

**Context**: An organization is executing a large software development program. Midway through delivery, the project sponsor requests a significant change to the agreed project scope. The program management office must create a formal record of this change that is attributable, unmodifiable, and auditable for the life of the program.

**Evidence Layer application**: The PMO produces a Scope Change artifact documenting the original scope, the requested change, the sponsor's approval, the date and authority of that approval, and the governance process through which the change was ratified. This artifact is submitted to the Evidence Production Act, generating an Evidence ID that is derived from the full content of the scope change record. The artifact, with its Evidence ID, is registered with the organization's preferred Evidence Registry.

**Value delivered**: Any future audit — internal, external, regulatory, or legal — can verify, using only the artifact and its Evidence ID, that the scope change record has not been altered since its registration. The Evidence ID can be incorporated into the program's governance records, status reports, and contract amendments, creating a verifiable chain of evidence linking each formal record back to the original change authorization.

**Without the Evidence Layer**: The scope change might be recorded as an email thread, a slide deck attachment, or a document in a project management tool — all of which are modifiable, vendor-dependent, and unverifiable by external parties without cooperation from the producing organization.

### 12.2 Human Resources: Verifiable Professional Reference

**Context**: An individual is seeking new employment. A former employer is willing to provide a professional reference attesting to the individual's performance and character during their previous engagement. The individual wishes to be able to present this reference to future employers in a form that is verifiably authentic — that cannot be altered, forged, or claimed to have been issued by a different organization.

**Evidence Layer application**: The former employer produces a Reference artifact attesting to the individual's qualifications and tenure, signed by an authorized representative. The artifact is submitted to the Evidence Production Act. The resulting Evidence ID is provided to the individual and registered by the employer in a publicly accessible registry.

**Value delivered**: The individual can present the reference to any future employer. The receiving employer can independently verify — without contacting the issuing organization — that the reference matches its Evidence ID and has not been altered. The registry provides a temporal proof that the Evidence ID existed at the claimed date of issuance. The individual's sovereignty over their professional history is preserved: they possess a verifiable credential that they can share selectively, without requiring the issuing organization to confirm its validity on demand.

**Without the Evidence Layer**: Reference letters are typically plain documents, trivially alterable, and verifiable only by calling the issuing organization — which may not maintain historical records, may be unreachable, or may have been acquired or dissolved.

### 12.3 Legal: Verifiable Contract

**Context**: Two parties execute a commercial contract. Both parties wish to ensure that the contract they signed is the contract that governs their relationship — and that neither party can later claim that the document was modified after execution.

**Evidence Layer application**: At the moment of execution, the final contract document is submitted to the Evidence Production Act by both parties' authorized representatives. Each party derives the same Evidence ID from the same artifact, confirming their agreement that the document is the one being evidenced. The Evidence ID is incorporated into the contract's execution block, and the artifact is registered with a mutually agreed Evidence Registry.

**Value delivered**: At any future point — during performance, in dispute, or upon enforcement — either party, or any arbitral or judicial body, can verify that the document presented as the contract matches the Evidence ID recorded at execution. The shared Evidence ID, embedded in the contract itself, constitutes structural evidence that both parties agreed to the same document at the same time.

**Without the Evidence Layer**: Executed contracts are frequently challenged on the grounds of alteration, version confusion, or disputed authenticity. Current verification mechanisms — notarization, witnessed execution, e-signature platform verification — are largely dependent on third-party cooperation and vendor availability.

### 12.4 Compliance: Regulatory Audit Trail

**Context**: A regulated financial institution is subject to an annual compliance audit. The regulator requires evidence that specific policies, procedures, and approvals were in place at specific times during the audit period. The institution must demonstrate not only that documents exist, but that they were not created or modified retroactively.

**Evidence Layer application**: Throughout the audit period, the institution produces conformant evidence artifacts for all material policy approvals, control certifications, and exception authorizations as they occur. Each artifact is registered with an Evidence Registry at the time of production, creating temporal proofs that cannot be retroactively fabricated. At audit time, the institution presents the artifacts with their Evidence IDs and registration records.

**Value delivered**: The regulator can independently verify, for each presented document, that the document was registered prior to the audit period with its current content. Evidence that is VERIFIED against a pre-audit registration record is structurally resistant to the accusation of retroactive creation. The institution's compliance documentation acquires a structural trustworthiness that procedural controls alone cannot provide.

**Without the Evidence Layer**: Regulators typically rely on procedural attestations and access logs to determine when documents were created. These controls are vulnerable to manipulation by parties with administrative access and are not independently verifiable by the regulator.

### 12.5 AI Systems: Verifiable Agent Decision

**Context**: An AI agent operating within an enterprise workflow makes a consequential decision — for example, approving a purchase order above a threshold that would normally require human review. The organization must be able to demonstrate, to internal auditors and external regulators, that the decision was made by the AI agent, at a specific time, on the basis of specific inputs, and that the record of that decision has not been altered.

**Evidence Layer application**: The AI agent, upon making the decision, produces an Evidence artifact containing the decision context — the inputs provided to the agent, the model version and configuration, the decision reached, the confidence level, the applicable policy rules consulted, and a timestamp. The artifact is submitted to the Evidence Production Act by the agent, generating an Evidence ID. The agent registers the artifact with the organization's Evidence Registry before the decision is acted upon.

**Value delivered**: Any subsequent audit of the agent's decision — by internal compliance, external auditors, or regulators investigating an anomalous outcome — can independently verify that the decision record has not been altered and that it was registered before the decision was acted upon. The AI agent's decision trail is as verifiable as a human approval record.

**Without the Evidence Layer**: AI decision logs are typically stored in application databases or logging infrastructure controlled by the operating organization. They are modifiable by system administrators, dependent on the continued operation of the logging system, and not independently verifiable by external parties.

---

## 13. Future Evolution

The following directions represent planned or anticipated extensions to the Evidence Layer. They are outside the scope of v1.0 but are documented here to ensure that v1.0 design decisions do not preclude their eventual adoption.

### 13.1 Zero-Knowledge Evidence Proofs

A future extension to the Evidence Layer will define a mechanism by which an Evidence Consumer can verify specific properties of an artifact — for example, that it was produced before a given date, or that it was produced by a producer with a specific role — without the artifact's full content being disclosed. Zero-knowledge proof techniques make this possible in principle; the extension will define how such proofs are bound to Evidence IDs and what verification claims they support.

This extension is particularly relevant for evidence involving sensitive personal data, trade secrets, or confidential commercial terms, where full disclosure is not appropriate but partial verification is needed.

### 13.2 Decentralized Identity Integration

A future extension will define how Evidence Producers, Consumers, and Verifiers can be identified using Decentralized Identifiers (DIDs) conformant with the W3C DID Core specification, and how the Identity Layer of the AOC Protocol maps onto evidence production metadata. This extension will enable evidence provenance chains in which every actor at every stage is identified using portable, self-sovereign identifiers rather than platform-specific credentials.

### 13.3 Verifiable Credentials Alignment

A future extension will align the Evidence Layer's credential-type artifacts with the W3C Verifiable Credentials Data Model, enabling evidence produced under this protocol to be presented and verified within VC-compatible ecosystems. This extension will define the mapping between AOC Evidence IDs and VC identifiers, and how VC verification flows interact with the Evidence Layer's verification rules.

### 13.4 Multi-Chain Registration

A future extension will define a multi-chain registration model that allows a single Evidence ID to be registered across multiple distributed ledgers simultaneously, with a canonical registration record that aggregates the temporal proofs from each ledger. This extension will address the challenge of evidence that must satisfy the registration requirements of multiple jurisdictions or governance contexts, each of which prefers a different ledger infrastructure.

### 13.5 Autonomous AI Evidence Chains

As AI systems become more capable of initiating, executing, and concluding multi-step workflows autonomously, the need arises for evidence chains in which each step — and the causal relationships between steps — is individually evidenced. A future extension will define how AI agents can produce evidence chains: linked sequences of evidence artifacts in which each artifact references the Evidence IDs of the artifacts that preceded it, creating a verifiable causal record of an autonomous workflow.

This extension will also address the governance questions raised by AI-produced evidence: what authority an AI agent must possess to act as an Evidence Producer, how the governance structure of the organization deploying the agent is reflected in the evidence the agent produces, and how human oversight can be maintained over evidence chains that may span thousands of individual decisions.

### 13.6 Evidence Delegation

A future extension will define how an Evidence Producer can delegate evidence production authority to another party — including another AI agent — while preserving the provenance connection to the original authority. Evidence delegation enables organizational hierarchies to be reflected in evidence chains: a decision made by a delegated agent carries the authority of the delegating principal, and this delegation relationship is itself evidenced.

---

## 14. Conclusion

The Evidence Layer is not an incremental addition to the AOC Protocol. It is the capstone that transforms the protocol from a model for governing action into a model for governing action with consequence — with the ability to prove, to any party, at any future time, that specific actions occurred, were authorized, and have not been misrepresented.

The Identity Layer tells us who is acting. The Governance Layer tells us under what authority. The Knowledge Layer tells us from what informational foundation. The Evidence Layer answers the fourth and final foundational question: **how do we know it happened the way we claim it happened?**

Without evidence, governance is aspirational. With fragile evidence, governance is revisable by whoever controls the records. The Evidence Layer makes governance permanent: its record is tamper-detectable, infrastructure-independent, and verifiable by anyone who possesses the artifact and understands the protocol.

This has implications that extend beyond enterprise compliance. As AI systems become operational actors — making decisions, executing agreements, consuming and producing information at scale — the question of what constitutes verifiable evidence of an AI action becomes a question of fundamental social importance. Regulatory frameworks, legal systems, and organizational governance structures will need to answer questions about AI decisions that they can only answer if the evidence exists and is verifiable. The Evidence Layer provides the foundation for that answer.

As organizations grapple with an environment in which digital documents are easy to produce, easy to alter, and easy to deny, the Evidence Layer provides a structural response: evidence whose integrity does not depend on trusting its custodian, whose verifiability does not depend on the cooperation of its producer, and whose persistence does not depend on the continued existence of the platform that created it.

The Evidence Layer is a prerequisite for the kind of digital governance that the modern world requires. Its adoption as a core pillar of the AOC Protocol reflects the conviction that trust — whether between humans, between organizations, or between humans and AI systems — cannot be built on evidence that is only as reliable as the goodwill of the party holding it.

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| Artifact | A discrete digital object produced as a record of a consequential event, prior to the application of evidentiary properties |
| Evidence | An Artifact to which evidentiary properties have been formally applied under the AOC Evidence Layer protocol |
| Evidence ID | A globally unique, deterministically derivable identifier canonically bound to a specific Evidence artifact |
| Evidence Producer | An actor that performs the Evidence Production Act on an Artifact |
| Evidence Consumer | An actor that receives, references, or relies upon evidence |
| Evidence Verifier | An actor that performs a formal verification operation on evidence |
| Evidence Registry | A system that accepts and preserves registration records for Evidence IDs |
| Registry Operator | An actor that operates a conformant Evidence Registry |
| Governance Authority | The body responsible for maintaining this specification and its verification rules |
| Verification | The process of determining whether an artifact matches its Evidence ID under applicable verification rules |
| VALID | Verification outcome indicating artifact-to-Evidence-ID match |
| INVALID | Verification outcome indicating artifact-to-Evidence-ID mismatch |
| INDETERMINATE | Verification outcome indicating that verification could not be completed |
| Evidence Production Act | The formal act of deriving an Evidence ID from an Artifact |
| Supersession | The formal replacement of one evidence artifact by a successor |
| Archival | The transition of evidence to long-term inactive preservation |

---

## Appendix B: Relationship to Other AOC Protocol Layers

```
┌─────────────────────────────────────────────────────────┐
│                     AOC Protocol                         │
│                                                          │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │  Identity  │  │ Governance  │  │    Knowledge     │  │
│  │   Layer    │  │    Layer    │  │      Layer       │  │
│  │            │  │             │  │                  │  │
│  │  WHO acts  │  │  UNDER WHAT │  │  FROM WHAT info  │  │
│  │            │  │  authority  │  │  foundation      │  │
│  └─────┬──────┘  └──────┬──────┘  └────────┬─────────┘  │
│        │                │                  │             │
│        └────────────────┼──────────────────┘             │
│                         │                                │
│                         ▼                                │
│              ┌───────────────────┐                       │
│              │  Evidence Layer   │                       │
│              │                   │                       │
│              │  HOW we know it   │                       │
│              │  happened the way │                       │
│              │  we claim         │                       │
│              └───────────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

The Evidence Layer is downstream of the other three layers in the sense that it records the outcomes of identity-governed, authority-sanctioned, knowledge-informed actions. It is also foundational to those layers in the sense that the Identity, Governance, and Knowledge layers produce artifacts — identity assertions, governance decisions, knowledge records — that may themselves be evidenced under the Evidence Layer.

---

*This document is RFC-004 of the AOC Protocol specification series. It represents the first formal version (v1.0) of the Evidence Layer specification. Feedback, errata, and proposed amendments should be directed to the AOC Protocol Governance Authority through the established contribution process.*
