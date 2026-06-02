# RFC-005 — AOC Claims Framework: Canonical Trust and Authority Model

| Field | Value |
|---|---|
| RFC Number | 005 |
| Title | AOC Claims Framework: Canonical Trust and Authority Model |
| Status | Draft |
| Category | Core Protocol / Constitutional Specification |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-02 |
| Last Updated | 2026-06-02 |
| Supersedes | — |
| Related | AOC Charter, RFC-004 Evidence Layer v1.0, Governance Compliance Specification, Protocol Invariants Specification |

---

## Abstract

This RFC defines the canonical trust and authority model for the Architects of Change Protocol ecosystem. It introduces a constitutional chain connecting evidence, assertions, claims, attestations, verification, standing, capabilities, authority, and decisions.

The canonical chain is:

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
Capability
  ↓
Authority
  ↓
Decision
```

This RFC is concept-first and implementation-neutral. It does not define a database schema, API, runtime engine, storage model, credential format, or product implementation. It defines the protocol concepts that all future AOC implementations must preserve.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Definitions](#2-definitions)
3. [The Trust Chain](#3-the-trust-chain)
4. [The Authority Chain](#4-the-authority-chain)
5. [Assertions](#5-assertions)
6. [Claims](#6-claims)
7. [Attestations](#7-attestations)
8. [Verification](#8-verification)
9. [Standing](#9-standing)
10. [Capabilities](#10-capabilities)
11. [Authority](#11-authority)
12. [Decisions](#12-decisions)
13. [Credentials](#13-credentials)
14. [Explainability](#14-explainability)
15. [Constitutional Principles](#15-constitutional-principles)
16. [Non-Goals](#16-non-goals)
17. [Future RFC Dependencies](#17-future-rfc-dependencies)
18. [Conformance](#18-conformance)
19. [Conclusion](#19-conclusion)

---

## 1. Introduction

Trust in AOC is not an assumption. Trust is a protocol state that must be created, supported, evaluated, maintained, and explained.

A system that merely stores identities, roles, credentials, or permissions does not by itself create trustworthy authority. A person may have an identity but no current authority. A credential may have been valid yesterday but revoked today. A document may exist but not support the interpretation made from it. A decision may be permitted by a user interface but still lack constitutional authority under the protocol.

RFC-005 exists to prevent these failures by requiring every consequential decision in the AOC ecosystem to be explainable through a complete trust and authority chain.

### 1.1 Why trust must be modeled explicitly

Trust must be modeled explicitly because AOC is intended to operate across organizations, jurisdictions, runtimes, products, market makers, autonomous agents, and human governance bodies. In such an ecosystem, there is no single default institution that can be trusted to decide what is true or who is authorized.

Explicit trust modeling ensures that:

- evidence is not confused with interpretation;
- claims are not confused with truth;
- attestations are not confused with verification;
- verification is not confused with current validity;
- capabilities are not confused with authority;
- decisions are not accepted without justification.

### 1.2 Why authority cannot be assumed

Authority cannot be inferred solely from identity, employment, role title, possession of a credential, possession of a token, or prior approval. Authority is derived from standing claims and policy in a specific context.

For example, a principal may be the Chief Financial Officer of an organization and still lack authority to approve a specific payment if the relevant budget authority claim has expired, has been suspended, does not cover the requested amount, or is constrained by policy requiring board review.

### 1.3 Why decisions require justification

A decision is a consequential action taken under authority. AOC decisions may approve budgets, deploy systems, grant access, issue credentials, perform AI actions, validate relationships, or execute market-maker operations. Such decisions affect rights, resources, obligations, and trust relationships.

Therefore, a decision must be justified by an authority chain, and that authority chain must be supported by a trust chain.

### 1.4 Why explainability is constitutional

Explainability is a constitutional requirement because AOC is a sovereignty-oriented protocol. Participants must be able to inspect why an action was allowed, denied, escalated, suspended, or revoked. Auditors must be able to reconstruct authority. Governance officers must be able to identify policy failures. Engineers must be able to implement fail-closed systems. Enterprise architects must be able to prove control boundaries.

A decision that cannot be explained is not constitutionally complete under RFC-005.

---

## 2. Definitions

The following definitions are canonical for RFC-005. They are protocol-neutral and implementation-neutral.

### 2.1 Evidence

**Evidence** is a record, artifact, observation, event, document, trace, or proof that can support an interpretation about a subject, action, state, or event.

Evidence may be digital or physical, direct or indirect, human-produced or machine-produced. Evidence does not, by itself, determine what conclusion should be drawn from it.

### 2.2 Assertion

**Assertion** is an interpretation made from evidence.

An assertion expresses what a principal, system, policy, auditor, or governance process believes the evidence indicates. Assertions are distinct from claims because they are interpretive bridges between evidence and formal protocol statements.

### 2.3 Claim

**Claim** is a formal statement asserted about a subject.

A claim may describe identity, role, certification, authorization, capability eligibility, relationship, compliance status, governance status, or another protocol-relevant fact. A claim is not automatically true merely because it is well formed.

### 2.4 Attestation

**Attestation** is a signed or otherwise attributable declaration supporting a claim.

An attestation binds an attester to a declaration that a claim is supported according to some context, evidence, policy, or authority. Attestation is not identical to verification.

### 2.5 Verification

**Verification** is the process of evaluating whether a claim is supported.

Verification may evaluate evidence, attestations, signatures, issuer status, policy requirements, temporal validity, revocation state, chain integrity, and conformance to protocol rules.

### 2.6 Standing

**Standing** is the current validity state of a claim.

Standing answers whether a claim is currently usable for trust, capability, authority, or decision purposes. A claim may be historically true but lack current standing.

### 2.7 Capability

**Capability** is a permission derived from standing claims and policy.

A capability expresses what a principal or system may do within defined scope, constraints, time bounds, and context. A capability is not self-justifying; it must be derivable from standing claims and policy.

### 2.8 Authority

**Authority** is the recognized ability to make a decision in a defined context.

Authority is derived from standing claims, capabilities, delegation rules, governance policy, and applicable constraints. Authority is not assumed from identity alone.

### 2.9 Decision

**Decision** is an action or determination taken under authority.

A decision may allow, deny, approve, revoke, suspend, issue, deploy, grant, escalate, or otherwise alter protocol state or organizational state.

### 2.10 Credential

**Credential** is a collection of claims packaged for presentation, verification, or recognition.

A credential may include evidence references, attestations, issuer metadata, verification methods, standing metadata, and expiration or revocation information.

### 2.11 Principal

**Principal** is an entity capable of being the subject, issuer, attester, verifier, authority holder, delegate, or actor in a protocol context.

A principal may be a human, organization, service, workload, AI agent, governance body, runtime, or remote system.

### 2.12 Identity

**Identity** is the protocol-recognized representation of a principal.

Identity may include identifiers, claims, credentials, status, trust metadata, tenant context, federation context, and other attributes needed to distinguish and evaluate the principal.

---

## 3. The Trust Chain

The canonical trust chain is:

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

This chain defines how information becomes usable trust state.

### 3.1 Evidence → Assertion

Evidence becomes meaningful only when interpreted. A board resolution, employment agreement, certificate, signed audit report, machine log, policy trace, or governance record may support multiple interpretations. The assertion layer captures the specific interpretation being made.

Example:

- Evidence: Board resolution dated 2026-05-15.
- Assertion: Victor may approve operating budgets up to USD 250,000 for the Growth Division.

Skipping this layer is dangerous because evidence may be ambiguous. A document may show that a meeting occurred without proving that a specific authority was granted.

### 3.2 Assertion → Claim

An assertion becomes a claim when it is formalized as a protocol statement about a subject.

Example:

- Assertion: Victor may approve operating budgets up to USD 250,000 for the Growth Division.
- Claim: Budget Approval Authority Claim for subject `Victor`, scope `Growth Division`, limit `USD 250,000`, source assertion `Board Resolution Interpretation`.

Skipping this layer is dangerous because informal interpretations cannot be consistently verified, exchanged, audited, revoked, or used by policy engines.

### 3.3 Claim → Attestation

A claim is supported when an attester declares that the claim is valid, accurate, or otherwise acceptable according to the attester's authority and context.

Example:

- Claim: Victor has budget approval authority up to USD 250,000.
- Attestation: Corporate Secretary signs an attestation that the claim reflects the approved board resolution.

Skipping this layer is dangerous because a claim without attributable support may be self-asserted, forged, stale, or outside the issuer's authority.

### 3.4 Attestation → Verification

An attestation must be evaluated. Verification determines whether the attestation is authentic, attributable, current, policy-compatible, and sufficient for the claim it supports.

Example verification questions:

- Was the attestation signed by a recognized attester?
- Was the attester authorized to support this claim type?
- Does the evidence match the claim scope?
- Has the attestation expired, been revoked, or been superseded?
- Does policy require multiple attestations?

Skipping this layer is dangerous because signed statements may be invalid, compromised, mis-scoped, unauthorized, or insufficient.

### 3.5 Verification → Standing

Verification produces an evaluation result. Standing expresses whether the claim is currently usable.

Example:

- Verification result: The claim was validly issued and supported on 2026-05-15.
- Standing on 2026-06-02: Active.
- Standing on 2027-06-02 after expiration: Expired.
- Standing after board repeal: Revoked or Superseded.

Skipping this layer is dangerous because historical truth does not imply present authority. A claim may have been verified in the past and still be unusable today.

### 3.6 Trust Chain Examples

#### Budget authority

```text
Board Resolution
  ↓
Victor may approve Growth Division budgets up to USD 250,000
  ↓
Budget Approval Authority Claim
  ↓
Corporate Secretary Attestation
  ↓
Verification of signature, scope, policy, and board authority
  ↓
Active standing until expiration, revocation, or supersession
```

#### Security certification

```text
Certification exam record and provider certificate
  ↓
Asha passed the required cloud security certification
  ↓
Security Certification Claim
  ↓
Certification Authority Attestation
  ↓
Verification of issuer, credential hash, date, and revocation registry
  ↓
Active, Expired, Suspended, Revoked, or Superseded standing
```

#### AI execution trust

```text
Model execution logs and policy trace
  ↓
AI agent executed within approved scope
  ↓
AI Execution Compliance Claim
  ↓
Runtime Attestation
  ↓
Verification of runtime identity, trace integrity, policy match, and replay protection
  ↓
Active or invalid standing for audit and future authority analysis
```

---

## 4. The Authority Chain

The canonical authority chain is:

```text
Claim
  ↓
Capability
  ↓
Authority
  ↓
Decision
```

In full constitutional form, it is preceded by the trust chain:

```text
Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision
```

### 4.1 Claim does not automatically grant authority

A claim is a formal statement. It may be false, unsupported, unverified, expired, revoked, suspended, superseded, mis-scoped, or insufficient. Therefore, a claim never grants authority merely by existing.

Examples:

- An identity claim does not automatically grant system access.
- A role claim does not automatically grant budget authority.
- A certification claim does not automatically authorize production deployment.
- A credential claim does not automatically authorize credential issuance.

### 4.2 Authority emerges from verified claims and policy

Authority is derived when standing claims satisfy policy requirements for a specific decision context.

For example:

1. Victor has an active identity claim.
2. Victor has an active role claim as Growth Division CFO.
3. Victor has an active budget authority claim up to USD 250,000.
4. Policy permits Growth Division CFOs with budget authority standing to approve operating budgets under USD 250,000.
5. A capability is derived: `CanApproveBudget` for the relevant scope and limit.
6. Authority is recognized for the specific approval decision.
7. The decision is recorded and explainable.

---

## 5. Assertions

Assertion is a first-class protocol concept in RFC-005.

### 5.1 Definition

```text
Assertion = an interpretation made from evidence.
```

Assertions are necessary because evidence rarely speaks in protocol-native form. Evidence must be read, interpreted, scoped, and translated into meaning before it can become a formal claim.

### 5.2 Example

```text
Evidence:
  Board Resolution

Assertion:
  Victor may approve budgets.

Claim:
  Approved Budget Authority Claim
```

### 5.3 Why assertion is distinct from claim

Assertion is distinct from claim because an assertion captures interpretive meaning, while a claim captures formal protocol meaning.

An assertion may be:

- disputed;
- incomplete;
- ambiguous;
- context-dependent;
- human-reviewed;
- machine-derived;
- one of several possible interpretations of the same evidence.

A claim must be formal enough to be exchanged, attested, verified, evaluated for standing, and consumed by policy.

### 5.4 Assertion requirements

A conformant future implementation that represents assertions SHOULD identify:

- the evidence being interpreted;
- the subject of the interpretation;
- the interpreter or process making the interpretation;
- the time of interpretation;
- the claim type or claim family the assertion may support;
- any ambiguity, confidence, or review status relevant to the interpretation.

This RFC does not mandate a storage schema for assertions.

---

## 6. Claims

### 6.1 Definition

```text
Claim = a formal statement asserted about a subject.
```

A claim is the canonical unit of formal trust expression in AOC.

### 6.2 Claim examples

Examples include:

- **Identity Claim** — a statement about who or what a principal is.
- **Capability Claim** — a statement that a principal satisfies prerequisites for a capability.
- **Certification Claim** — a statement that a principal holds a certification.
- **Role Claim** — a statement that a principal occupies a role.
- **Authorization Claim** — a statement that a principal is eligible for a specific authorization.
- **Relationship Claim** — a statement that a principal has a relationship to another principal or entity.
- **Compliance Claim** — a statement that a principal, process, or artifact satisfies a requirement.
- **Governance Claim** — a statement about approval, review, delegation, mandate, quorum, or policy outcome.

### 6.3 Claims are not automatically true

A claim is not truth. A claim is a formal assertion that must be supported, attested, verified, and evaluated for standing before it can participate in authority.

AOC implementations MUST NOT treat claim presence alone as sufficient authority.

### 6.4 Claim subjects and issuers

A claim SHOULD distinguish at least:

- the subject the claim is about;
- the issuer or originator of the claim;
- the claim type;
- the claim value or statement;
- temporal boundaries, when relevant;
- supporting assertion or evidence references, when available;
- attestation and verification references, when available.

This RFC does not require a specific claim schema. A future Claim Schema RFC should define canonical fields.

---

## 7. Attestations

### 7.1 Definition

```text
Attestation = a signed declaration supporting a claim.
```

An attestation creates accountability. It answers: who, or what, stands behind this claim?

### 7.2 Attester examples

Attesters may include:

- an organization;
- a person;
- an AI system;
- a remote system;
- a governance body;
- a certification authority;
- a runtime environment;
- a trust registry;
- a policy engine;
- an auditor.

### 7.3 Claim vs Attestation

A claim and an attestation are different protocol concepts.

| Concept | Purpose | Question Answered |
|---|---|---|
| Claim | Formal statement about a subject | What is being asserted? |
| Attestation | Attributable support for a claim | Who or what supports it? |

A claim may exist without an attestation, but such a claim may lack sufficient support for verification. An attestation may support one claim, multiple claims, or a claim family, depending on future schema definitions.

### 7.4 Attestation requirements

A conformant attestation model SHOULD identify:

- the claim or claims supported;
- the attester;
- the attester's authority or role;
- the time of attestation;
- the signature or attribution mechanism;
- supporting evidence references;
- validity window;
- revocation or supersession references;
- integrity proof or audit reference, when relevant.

---

## 8. Verification

### 8.1 Definition

```text
Verification = the process of evaluating whether a claim is supported.
```

Verification is an evaluation process, not a document, token, credential, or mere signature check.

### 8.2 Evidence evaluation

Evidence evaluation determines whether referenced evidence is authentic, relevant, sufficient, unmodified, and appropriate for the assertion and claim.

Evidence evaluation may include:

- artifact integrity checks;
- content-address verification;
- provenance evaluation;
- timestamp evaluation;
- audit trace inspection;
- document review;
- chain-of-custody review;
- policy-specific sufficiency checks.

### 8.3 Attestation validation

Attestation validation determines whether the attestation is attributable, authentic, scoped, current, and issued by a recognized attester.

Attestation validation may include:

- signature verification;
- attester identity verification;
- issuer registry lookup;
- validity window evaluation;
- revocation check;
- replay protection;
- integrity proof validation;
- delegation chain validation.

### 8.4 Policy validation

Policy validation determines whether the claim and its support satisfy the rules required for the relevant context.

Policy may require:

- a specific issuer;
- a minimum assurance level;
- multiple independent attestations;
- human review;
- governance approval;
- active consent;
- jurisdictional constraints;
- relationship validation;
- risk thresholds;
- non-expired evidence.

### 8.5 Chain validation

Chain validation determines whether the full chain from evidence to standing is coherent.

A verification result SHOULD explain:

- what was evaluated;
- what passed;
- what failed;
- which policies were applied;
- which reasons support the outcome;
- whether the claim can receive standing;
- which standing states are possible.

---

## 9. Standing

Standing is critical to RFC-005.

### 9.1 Definition

```text
Standing = the current validity state of a claim.
```

Standing is not the same as verification. Verification may establish that a claim was properly supported at a point in time. Standing determines whether that claim is currently usable.

### 9.2 Canonical standing states

RFC-005 defines the following canonical standing states:

| Standing | Meaning |
|---|---|
| `Verified` | The claim has been evaluated and found supported, but may still require activation or contextual checks before use. |
| `Active` | The claim is currently valid and usable for its permitted purposes. |
| `Expired` | The claim passed its validity window and is no longer currently usable. |
| `Suspended` | The claim is temporarily disabled pending review, remediation, appeal, or additional verification. |
| `Revoked` | The claim has been invalidated by an authorized revocation process. |
| `Superseded` | The claim has been replaced by a newer claim, policy, authority, credential, or governance decision. |
| `Invalid` | The claim failed verification, violates protocol rules, or cannot be trusted for use. |
| `Not Yet Active` | The claim is validly issued but its activation time has not arrived. |

Future standing engines MAY define additional implementation states, but they MUST map them to these canonical states for protocol-level interpretation.

### 9.3 Historical truth vs active standing

A claim may be historically true but no longer active.

Examples:

- A professional license was valid in 2024 but expired in 2025.
- A budget authority claim was active until the board revoked it.
- A security certification was valid until superseded by a newer version requirement.
- A delegated authority was valid until the parent authority was revoked.
- An identity credential was valid until the issuer became inactive.

Systems MUST distinguish historical verification from current standing.

### 9.4 Standing and authority

Only claims with standing acceptable under applicable policy may participate in capability derivation or authority recognition.

A policy may permit `Verified` standing for some low-risk decisions, require `Active` standing for consequential decisions, or reject suspended, expired, revoked, superseded, invalid, or not-yet-active claims.

---

## 10. Capabilities

### 10.1 Definition

```text
Capability = a permission derived from standing claims.
```

Capabilities operationalize trust into bounded permissions.

### 10.2 Capability examples

Examples include:

- `CanApproveBudget`
- `CanDeploySystem`
- `CanIssueCredential`
- `CanGrantAuthority`
- `CanAccessData`
- `CanDelegateCapability`
- `CanPerformHumanReview`
- `CanRunAutonomousExecution`

### 10.3 Capability derivation

A capability SHOULD be derived from:

- one or more standing claims;
- applicable governance or authorization policy;
- scope constraints;
- permission constraints;
- temporal constraints;
- delegation constraints;
- subject and grantee constraints;
- revocation and suspension state;
- risk and assurance requirements.

### 10.4 Capability constraints

Capabilities MUST be bounded. A capability without scope, time, subject, policy, or revocation semantics creates unbounded authority and is incompatible with RFC-005.

Capabilities SHOULD be explainable by identifying the standing claims and policies that produced them.

---

## 11. Authority

### 11.1 Definition

```text
Authority = recognized ability to make a decision.
```

Authority is contextual. A principal may have authority for one decision and lack authority for another.

### 11.2 Authority is derived

Authority is derived from:

- standing claims;
- capabilities;
- governance policy;
- delegation rules;
- relationship context;
- consent state;
- risk controls;
- temporal bounds;
- jurisdictional or enterprise constraints, when applicable.

### 11.3 Authority is not assumed

Authority MUST NOT be assumed from:

- identity alone;
- role title alone;
- token possession alone;
- prior decision alone;
- self-asserted claim alone;
- UI access alone;
- organizational hierarchy alone;
- AI agent configuration alone.

### 11.4 Authority must be explainable

An authority determination MUST be explainable by reference to the capabilities, standing claims, verification results, attestations, claims, assertions, and evidence that support it.

If a system cannot explain an authority determination, it SHOULD fail closed for consequential decisions.

---

## 12. Decisions

### 12.1 Definition

```text
Decision = an action taken under authority.
```

A decision is the endpoint of the trust and authority model.

### 12.2 Decision examples

Examples include:

- approve a budget;
- deploy software;
- grant access;
- issue a credential;
- revoke a credential;
- approve a governance proposal;
- deny a data access request;
- escalate to human review;
- authorize an AI agent action;
- validate a delegation;
- suspend a capability.

### 12.3 Traceability requirement

Every consequential decision MUST be traceable.

A decision trace SHOULD identify:

- the decision actor;
- the decision subject or target;
- the requested action;
- the authority used;
- the capability or capabilities invoked;
- standing claims relied upon;
- verification outcomes;
- attestations relied upon;
- claims evaluated;
- assertions and evidence references;
- policies applied;
- reasons for allow, deny, escalation, or condition;
- timestamp;
- audit or evidence record.

---

## 13. Credentials

### 13.1 Definition

```text
Credential = a collection of claims.
```

A credential packages claims for presentation, recognition, verification, or governance use.

### 13.2 Credential examples

Examples include:

- PMP Credential;
- Security Certification;
- Professional License;
- KYC Credential;
- Employment Credential;
- Training Completion Credential;
- Governance Delegate Credential;
- AI Runtime Compliance Credential.

### 13.3 Credential semantics

A credential may contain multiple claims with different standing states.

For example, a professional credential may include:

- identity claim;
- issuer claim;
- certification claim;
- expiration claim;
- scope claim;
- continuing education claim;
- revocation status claim.

The credential itself may be recognized only if required claims have acceptable standing under policy.

### 13.4 Credential does not equal authority

A credential does not automatically grant authority. It may support claims that, if verified and active, may contribute to capability derivation and authority recognition.

---

## 14. Explainability

Every consequential decision must be explainable through the full constitutional chain:

```text
Decision
  ↓
Authority
  ↓
Capability
  ↓
Standing
  ↓
Verification
  ↓
Attestation
  ↓
Claim
  ↓
Assertion
  ↓
Evidence
```

### 14.1 Explainability as backward reconstruction

Explainability is the ability to reconstruct why a decision was made by walking backward from the decision to the evidence.

A complete explanation answers:

1. What decision was made?
2. Who or what had authority to make it?
3. Which capability enabled that authority?
4. Which standing claims supported the capability?
5. How were those claims verified?
6. Which attestations supported those claims?
7. What claims were being supported?
8. What assertions led to those claims?
9. What evidence supported those assertions?

### 14.2 Example: budget approval

```text
Decision:
  Approve Growth Division operating budget of USD 180,000.

Authority:
  Victor recognized as authorized budget approver for Growth Division budgets below USD 250,000.

Capability:
  CanApproveBudget(scope=Growth Division, limit=USD 250,000).

Standing:
  Budget Approval Authority Claim is Active.

Verification:
  Signature, board authority, amount scope, division scope, and revocation registry verified.

Attestation:
  Corporate Secretary attested to board resolution interpretation.

Claim:
  Victor has budget approval authority up to USD 250,000 for Growth Division.

Assertion:
  Board resolution grants Victor that authority.

Evidence:
  Signed board resolution and meeting minutes.
```

### 14.3 Example: production deployment

```text
Decision:
  Deploy release v4.2 to production.

Authority:
  Release manager has authority under production deployment policy.

Capability:
  CanDeploySystem(system=JAPI, environment=production).

Standing:
  Security Certification Claim Active; Release Manager Role Claim Active; Change Approval Claim Active.

Verification:
  Credential issuer, HR role source, change approval workflow, and policy trace verified.

Attestation:
  Certification provider, HR system, and change-control board attestations.

Claim:
  Principal is certified, assigned release manager, and approved for this change.

Assertion:
  Records indicate principal satisfies deployment prerequisites.

Evidence:
  Certification record, HR assignment record, change approval record, policy trace.
```

### 14.4 Example: credential issuance

```text
Decision:
  Issue Professional License Credential.

Authority:
  Licensing board officer recognized as authorized issuer.

Capability:
  CanIssueCredential(type=ProfessionalLicense).

Standing:
  Licensing Officer Claim Active; Board Mandate Claim Active.

Verification:
  Officer appointment, board registry, mandate, and revocation state verified.

Attestation:
  Licensing board attests officer appointment and mandate.

Claim:
  Officer may issue professional license credentials.

Assertion:
  Appointment record authorizes officer to issue licenses.

Evidence:
  Appointment order, board charter, credential issuance policy.
```

---

## 15. Constitutional Principles

RFC-005 aligns with existing AOC constitutional and protocol principles.

### 15.1 Alignment with GA-01

For purposes of RFC-005, **GA-01** is treated as the ecosystem governance axiom that protocol authority must be explicit, governed, auditable, and non-arbitrary. RFC-005 operationalizes GA-01 by requiring that authority emerge from standing claims and policy rather than from assumption, hierarchy, or opaque runtime behavior.

RFC-005 supports GA-01 by requiring:

- explicit trust chains;
- explicit authority chains;
- explainable decisions;
- traceable governance actions;
- non-retroactive interpretation of standing where future policy changes occur;
- auditable justification for allow, deny, escalation, suspension, or revocation.

### 15.2 Alignment with the AOC Charter

RFC-005 supports the AOC Charter by reinforcing:

- **Self-Sovereignty** — identity, claims, credentials, and evidence cannot be captured by opaque institutional trust.
- **Consent-First Architecture** — authority over data access must be derived from explicit, standing consent and policy.
- **Local First, Global Compatible** — trust chains can be implemented locally while preserving globally understandable concepts.
- **Minimal Trust Surfaces** — trust comes from evidence, attestations, verification, standing, policy, and explainability rather than institutional promises.
- **Market Neutrality** — any market or product may implement the model if it preserves the canonical chain.
- **Open Source Commitment** — public, auditable definitions make trust and authority inspectable.
- **Governance Philosophy** — transparent proposals and public history are reinforced by traceable decisions.

### 15.3 Alignment with RFC-004 Evidence Layer

RFC-005 builds on RFC-004 by defining how evidence participates in trust and authority. RFC-004 defines evidentiary value; RFC-005 defines how evidence supports assertions, claims, attestations, verification, standing, capabilities, authority, and decisions.

### 15.4 Alignment with Protocol Invariants

RFC-005 adds conceptual invariants:

- claim presence is not authority;
- evidence is not interpretation;
- attestation is not verification;
- verification is not standing;
- standing is required for capability derivation;
- capability is bounded permission, not unlimited authority;
- authority is derived and contextual;
- decisions must be explainable.

These conceptual invariants complement object-level authorization, integrity, lifecycle, security, and audit invariants.

### 15.5 Alignment with Governance Compliance

RFC-005 supports governance compliance by requiring decisions to preserve protocol invariants, respect authority chains, and generate auditable explanations. Market makers, enterprise runtimes, AI agents, credential issuers, and governance systems must not weaken the trust chain when implementing product-specific logic.

---

## 16. Non-Goals

RFC-005 does not define:

- storage systems;
- database schemas;
- APIs;
- runtime implementations;
- package exports;
- credential serialization formats;
- cryptographic algorithms;
- trust registry implementation details;
- user interfaces;
- legal compliance procedures;
- jurisdiction-specific authority rules;
- business workflows;
- product-specific authorization engines.

RFC-005 defines concepts.

Implementations may vary, but they must preserve the constitutional relationships defined here.

---

## 17. Future RFC Dependencies

Future RFCs may build on RFC-005 to define implementation-level models.

### 17.1 Claim Schema

A future Claim Schema RFC should define canonical claim fields, claim identifiers, subject references, issuer references, values, evidence links, assertion references, temporal fields, and claim type registry semantics.

### 17.2 Verification Engine

A future Verification Engine RFC should define verification inputs, outputs, reason codes, assurance levels, policy hooks, attestation validation, evidence evaluation, and deterministic verification semantics.

### 17.3 Standing Engine

A future Standing Engine RFC should define standing state transitions, revocation, suspension, expiration, supersession, appeals, reinstatement, temporal queries, and historical validity semantics.

### 17.4 Authority Engine

A future Authority Engine RFC should define how standing claims and capabilities are evaluated into authority determinations for specific decision contexts.

### 17.5 Credential Framework

A future Credential Framework RFC should define credentials as portable bundles of claims, attestations, evidence references, issuer metadata, holder semantics, presentation rules, and standing metadata.

### 17.6 Trust Graph

A future Trust Graph RFC should define graph semantics connecting principals, identities, claims, assertions, evidence, attestations, verification outcomes, standing states, capabilities, authorities, policies, credentials, and decisions.

### 17.7 Runtime Authorization

A future Runtime Authorization RFC should map the constitutional authority model to enforcement engines, policy decision points, runtime grants, capability tokens, audit traces, and fail-closed decision behavior.

---

## 18. Conformance

A future implementation conforms to RFC-005 when it preserves the following rules:

1. It does not treat evidence as authority without assertion, claim, attestation, verification, standing, capability, and policy evaluation.
2. It distinguishes assertions from claims.
3. It distinguishes claims from attestations.
4. It distinguishes verification from standing.
5. It does not treat claims as automatically true.
6. It does not treat credentials as automatically authoritative.
7. It derives capabilities from standing claims and policy.
8. It derives authority from capabilities, standing claims, governance context, and policy.
9. It records or can reconstruct the explanation chain for consequential decisions.
10. It fails closed when required authority cannot be established for consequential decisions.

---

## 19. Conclusion

RFC-005 establishes the constitutional foundation for identity, trust, authority, governance, runtime authorization, enterprise governance, and future AOC ecosystem products.

The canonical model is:

```text
Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision
```

All future AOC protocol specifications, runtime implementations, enterprise products, market-maker integrations, AI governance systems, credential frameworks, and trust registries should conform to this model.

RFC-005 establishes the canonical trust and authority model for the AOC ecosystem.
