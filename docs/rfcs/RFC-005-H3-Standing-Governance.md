# RFC-005-H3 — Standing Governance

| Field | Value |
|---|---|
| RFC Number | 005-H3 |
| Title | Standing Governance |
| Status | Draft |
| Category | Core Protocol Extension |
| Authors | AOC Protocol Architecture Working Group |
| Created | 2026-06-03 |
| Last Updated | 2026-06-03 |
| Supersedes | — |
| Related | RFC-004 Evidence Layer v1.0, RFC-005 AOC Claims Framework, RFC-005-H1 Standing Traceability, RFC-005-H2 Standing Engine, RFC-005-H4 Capability Mapping |

---

## Abstract

This document defines Standing Governance for the AOC Protocol. Standing Governance establishes the legitimate authority structure responsible for defining, maintaining, reviewing, approving, challenging, and constraining all standing-related protocol rules. It extends RFC-004, RFC-005, RFC-005-H1, RFC-005-H2, and RFC-005-H4 by specifying who governs the rules that govern standing — and under what recognition, scope, policy, and constraint that governance is itself valid.

Standing Governance does not define a product, database, user interface, runtime, or implementation-specific governance tool. It defines the constitutional authority model that any conformant governance implementation must respect.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Governance Definition](#3-governance-definition)
4. [Governance Scope](#4-governance-scope)
5. [Governance Principles](#5-governance-principles)
6. [Governance Authority](#6-governance-authority)
7. [Authority Recognition](#7-authority-recognition)
8. [Governance Roles](#8-governance-roles)
9. [Governance Objects](#9-governance-objects)
10. [Policy Governance](#10-policy-governance)
11. [Algorithm Governance](#11-algorithm-governance)
12. [Standing Governance](#12-standing-governance)
13. [Capability Governance](#13-capability-governance)
14. [Challenge Governance](#14-challenge-governance)
15. [Review Governance](#15-review-governance)
16. [Governance Traceability](#16-governance-traceability)
17. [Governance Dependency Graph](#17-governance-dependency-graph)
18. [Governance Constraints](#18-governance-constraints)
19. [Governance Lifecycle](#19-governance-lifecycle)
20. [Governance Guarantees](#20-governance-guarantees)
21. [Security Implications](#21-security-implications)
22. [Implementation Guidance](#22-implementation-guidance)
23. [Future RFC Dependencies](#23-future-rfc-dependencies)
24. [Acceptance Criteria](#24-acceptance-criteria)

---

## 1. Executive Summary

### What is Standing Governance

Standing Governance is the authority structure responsible for defining and maintaining the trust rules by which standing is produced, evaluated, and consumed across the AOC Protocol.

The AOC constitutional chain is:

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

Every layer of this chain is governed by rules. Standing Governance defines who has the legitimate authority to create, modify, approve, retire, and challenge those rules — and under what conditions that authority is itself recognized as legitimate.

Governance sits above the chain. Governance does not replace the chain. Governance does not make decisions for the chain. Governance defines and maintains the rules the chain operates under.

### What Governance Controls

Standing Governance controls:

- Standing policies
- Standing algorithms
- Standing types
- Capability types
- Challenge procedures
- Review procedures
- Authority structures
- Delegation frameworks
- Recognition criteria

### The Central Concept: Recognized Authority

The most important concept introduced by this RFC is **Recognized Authority**.

Governance in AOC MUST NOT depend on administrative authority — the power to act because one has system access, organizational seniority, or vendor control. Governance MUST depend on Recognized Authority — the power to act because governance structures have formally recognized that authority as legitimate, scoped, and bounded.

This distinction is fundamental and constitutional. An administrator who edits a standing policy without Recognized Authority is not exercising governance. An actor who invokes governance powers without recognition is not a governance participant. The protocol MUST NOT treat administrative capability as governance legitimacy.

---

## 2. Problem Statement

### 2.1 Standing without governance becomes arbitrary

Without governance, standing algorithms, standing types, and standing policies are created, modified, or retired by whoever has access. There is no basis for a subject to understand why their standing is computed as it is, what rules governed the computation, who was authorized to create those rules, or how to challenge a rule that produces an unjust outcome.

Ungoverned standing is arbitrary standing. Arbitrary standing MUST NOT participate in authority.

### 2.2 Algorithms without governance become opaque

A standing algorithm encodes interpretive logic that directly affects protocol outcomes. If algorithms may be created or changed without governance recognition, authorization, versioning, or traceability, then two identical evidence sets may produce different standing with no explanation. Algorithm opacity is not a technical problem — it is a governance failure.

### 2.3 Policy without governance becomes uncontrolled

Policies define eligibility rules, thresholds, decay behavior, challenge handling, and output mappings. Policy controls what evidence counts, what authority is required, and how disputes are resolved. Policy without governance allows policy authors to self-authorize rule changes that benefit specific parties, exclude competitors, or avoid accountability.

### 2.4 Capabilities without governance become dangerous

Capabilities translate standing into permissions. If the policy that authorizes a capability is ungoverned, the capability may expand or contract without justification, challenge, or review. Ungoverned capability policy can create silent privilege escalation or silent privilege withdrawal.

### 2.5 Authority without governance becomes undefined

Authority is derived. It is derived from capabilities, which are derived from standing, which is derived from evidence. But what governs the derivation rules themselves? Without a defined governance structure, authority chains cannot be verified as legitimate — only as technically correct under rules that may themselves be illegitimate.

### 2.6 Challenges without governance become ineffective

Standing may be challenged. Evidence may be disputed. Policies may be contested. These challenge mechanisms exist to protect subjects from arbitrary or incorrect standing. But if the challenge review process itself is ungoverned — if reviewers are self-appointed, if outcomes can be overridden by administrators, if appeals have no recognized path — then challenges cannot provide the protection the protocol promises.

---

## 3. Governance Definition

### 3.1 Canonical definition

```text
Governance is the system responsible for defining, maintaining, reviewing,
approving, and challenging protocol trust rules under recognized authority.
```

Governance governs **rules**. It does not govern **outcomes**.

This distinction is constitutional. A governance body that defines what evidence types are eligible for a standing algorithm is exercising legitimate governance. A governance body that commands a standing engine to produce a specific standing result for a specific subject is exercising unauthorized control over an outcome — which is the opposite of governance.

### 3.2 What governance is not

Governance is not administration. An administrator who configures a system is performing an operational function within pre-existing rules. A governance body that defines those rules is performing a governance function.

Governance is not ownership. An organization that operates a standing registry does not thereby govern standing. Ownership of infrastructure is not recognition as a governance authority.

Governance is not platform control. A vendor that provides a standing engine product does not govern the protocol rules that the engine implements. Platform control without governance recognition is implementation capability, not protocol authority.

Governance is not majority vote without legitimacy. A majority of actors agreeing to a rule does not make that rule legitimate under the protocol if none of those actors hold Recognized Authority in the governance domain at issue.

---

## 4. Governance Scope

### 4.1 What governance MAY define

A Governance Authority, acting within its recognized scope, MAY define:

- Standing policies
- Standing algorithms
- Standing types
- Capability types
- Challenge procedures
- Review procedures
- Authority structures
- Delegation frameworks
- Recognition criteria for other authorities
- Governance roles and their powers
- Governance registry contents
- Governance lifecycle states

### 4.2 What governance MUST NOT do

Governance MUST NOT:

- Directly edit standing for a specific subject
- Directly grant or revoke capabilities for a specific subject
- Directly alter evidence lifecycle state outside recognized evidence governance processes
- Issue decisions on behalf of the constitutional chain
- Recognize itself as a Governance Authority without a recognized recognition process
- Expand its own scope without authorization from a higher-order or co-equal governance body
- Exercise authority outside its recognized scope

### 4.3 Scope is bounded

Every governance authority exercises authority within a defined scope. Scope may be defined by:

- Domain (employment, compliance, AI agents, projects, vendors)
- Jurisdiction (geographic, legal, regulatory)
- Organization (enterprise, consortium, protocol working group)
- Standing type (which standing types the authority governs)
- Capability type (which capability types the authority governs)
- Temporal validity (when the authority's governance recognition is valid)

An authority MUST NOT exercise governance outside its recognized scope. Governance actions outside recognized scope are not conformant and MUST be treated as ungoverned administrative acts.

---

## 5. Governance Principles

The following principles are canonical for RFC-005-H3. All governance structures, processes, and rules MUST be consistent with these principles.

### P-G1: Transparency

Governance rules MUST be publicly accessible to all parties affected by them. A governance body MUST NOT operate through hidden rules, confidential policies, or opaque algorithms. A subject whose standing is affected by a governance rule MUST be able to inspect that rule.

### P-G2: Traceability

Every governance action MUST be traceable. Traceability means that for any governance action, any party can determine who took it, under what authority, under what policy, at what time, and with what effect on standing, capabilities, or other protocol state.

### P-G3: Legitimacy

Governance authority derives from recognition, not from assertion. An actor who claims governance authority does not thereby hold it. Legitimacy is conferred by a recognized recognition process. A governance action taken without recognized authority is not a legitimate governance action, regardless of its technical effect.

### P-G4: Auditability

Governance actions MUST be auditable. Auditability means that governance history cannot be selectively erased, retroactively altered, or hidden from recognized auditors. Governance records MUST be preserved with the same standards of integrity as the evidence they govern.

### P-G5: Challengeability

Every governance rule and every governance action MUST be challengeable. No governance rule is beyond review. No governance action is immune to challenge. A protocol that protects governance from challenge is a protocol that protects ungoverned power.

### P-G6: Proportionality

Governance authority MUST be proportional to governance responsibility. An authority recognized to govern a narrow domain of standing algorithms MUST NOT be treated as having authority over the entire standing framework. Proportionality prevents the conflation of specific recognition with general authority.

### P-G7: Bounded Authority

Governance authority is finite. It is bounded by scope, jurisdiction, temporal validity, delegation terms, and recognized constraints. An authority whose power is unbounded is not a governance authority in the sense of this RFC — it is an administrative supremacy, which is incompatible with the protocol.

### P-G8: Policy Before Outcome

Governance defines the rules under which outcomes are produced. Governance MUST NOT intervene in the production of specific outcomes. A governance body that defines threshold rules for employment standing is exercising legitimate governance. The same body that instructs the standing engine to classify a specific vendor as Trusted is overriding the protocol chain — which is not governance.

---

## 6. Governance Authority

### 6.1 Definition

A **Governance Authority** is an actor — individual, organization, body, process, or AI system — that holds recognized authority to govern one or more standing-related protocol objects within a defined scope.

Governance Authority is not self-conferred. An entity does not become a Governance Authority by claiming the role, building a product, operating a registry, or having administrative access. Governance Authority is conferred by a recognition process described in Section 7.

### 6.2 Types of Governance Authority

The following authority types are canonical. Implementations MAY extend this list. Extensions MUST conform to the recognition requirements defined in Section 7.

#### Protocol Authority

A Protocol Authority is recognized to govern protocol-wide standing rules. Protocol Authorities have the broadest scope and the most stringent recognition requirements. A Protocol Authority MAY define canonical standing types, canonical capability types, protocol-level algorithm versioning requirements, and the recognition criteria used to confer other authority types.

A Protocol Authority MUST be recognized by the AOC Protocol Governance Body or its delegated successor. The existence of multiple Protocol Authorities for the same domain MUST be explicitly addressed by protocol governance to prevent conflicting canonical definitions.

#### Domain Authority

A Domain Authority is recognized to govern standing rules within a defined domain such as employment, compliance, vendor management, AI agent operations, or project governance. Domain Authorities operate within boundaries defined by Protocol Authority or by domain-specific governance bodies.

A Domain Authority MAY define standing algorithms, standing policies, standing types, and challenge procedures that are specific to its domain. A Domain Authority MUST NOT define rules that conflict with protocol-level canonical definitions established by a recognized Protocol Authority.

#### Organizational Authority

An Organizational Authority is recognized to govern standing rules within a defined organization, enterprise, consortium, or institutional boundary. Organizational Authorities operate within the scope of their organizational governance mandate and within the constraints established by applicable Domain and Protocol Authorities.

An Organizational Authority MAY define standing policies, capability policies, challenge procedures, and governance roles specific to its organizational context. An Organizational Authority MUST NOT claim authority beyond its organizational boundary.

#### Regulatory Authority

A Regulatory Authority is recognized to govern standing rules within the scope of a regulatory mandate. Regulatory Authorities derive their governance legitimacy from applicable legal frameworks, regulatory charters, or jurisdictional recognition. Their authority within the AOC Protocol is bounded by the intersection of their regulatory mandate and the scope of AOC governance recognition they hold.

A Regulatory Authority MAY define eligibility rules, required evidence types, required verification standards, and revocation triggers within its regulatory domain. A Regulatory Authority SHOULD be formally recognized by Protocol Authority or by applicable governance agreements to ensure that its governance rules are incorporated consistently into the protocol.

#### Delegated Authority

A Delegated Authority is an actor to whom governance powers have been formally delegated by a recognized authority within a defined and bounded scope. Delegated Authorities do not hold governance power independently; they hold it by virtue of a delegation that traces to a recognized authority.

A Delegated Authority MAY exercise only those governance powers that were explicitly included in the delegation. A Delegated Authority MUST NOT sub-delegate governance powers unless the delegation explicitly permits sub-delegation with defined constraints. Delegation is revocable by the delegating authority.

---

## 7. Authority Recognition

### 7.1 The constitutional principle

Authority does not exist because it is claimed. Authority exists because it is recognized.

This principle distinguishes the AOC Protocol from systems where power is determined by technical access, organizational hierarchy, or market position. In AOC governance, recognition is the source of legitimate authority. An actor that controls a system but has not been recognized as a governance authority does not hold governance authority over the protocol rules that system implements.

### 7.2 Recognition defined

**Recognition** is the formal act by which an existing recognized governance body — or the protocol's foundational governance process — confers Governance Authority status on an actor within a defined scope.

Recognition MUST:

- Identify the recognized authority by a stable, verifiable reference
- Define the scope of authority being conferred
- Define the temporal validity of the recognition
- Define the constraints under which the authority operates
- Be itself traceable, explainable, and challengeable
- Be recorded in a Governance Registry accessible to affected parties

### 7.3 Recognition requires a recognizer

Recognition is relational. For recognition to be valid, the recognizing party must itself be a recognized authority with the power to confer the type of authority being granted.

This creates a recognition chain:

```text
Protocol Governance Body
  ↓ recognizes
Protocol Authority (scope: canonical standing types)
  ↓ recognizes
Domain Authority (scope: employment standing algorithms)
  ↓ delegates
Delegated Authority (scope: employment standing threshold review)
```

A recognition chain that cannot be traced to a foundational recognized body is not a valid governance chain. The foundational recognition is the recognition of the Protocol Governance Body itself, which is established by the AOC Protocol charter process.

### 7.4 Failure to recognize is not neutral

An actor that attempts to exercise governance authority without recognition is not performing an unrecognized governance function — they are performing an ungoverned administrative action. The protocol MUST treat ungoverned administrative actions differently from recognized governance actions. Ungoverned administrative changes to standing rules are protocol violations regardless of technical feasibility.

### 7.5 Recognition can be revoked

Recognition is not permanent. A recognized authority may lose its recognition due to:

- Scope violation (acting outside recognized scope)
- Policy violation (acting contrary to governance constraints)
- Legitimacy failure (ceasing to satisfy the conditions of recognition)
- Governance revocation (revocation by a higher-order recognized body)
- Temporal expiry (recognition expires and is not renewed)

Revocation of recognition MUST be traceable and MUST be recorded in the Governance Registry. Prior governance actions taken by a revoked authority MUST be reviewed and their continued validity assessed by a recognized authority.

### 7.6 Contested recognition

When two actors both claim recognition for the same governance scope, the conflict MUST be resolved by a higher-order recognized authority or by the protocol's foundational governance process. A system MUST NOT resolve contested recognition through administrative action or technical override. Contested recognition is a governance dispute requiring a governance resolution.

---

## 8. Governance Roles

### 8.1 Policy Author

A **Policy Author** is an actor with recognized authority to draft standing policies or capability policies within their authorized scope.

Responsibilities:
- Drafting policy text that is consistent with protocol principles
- Identifying the standing types, capability types, or domains the policy governs
- Specifying policy scope, constraints, and temporal validity
- Submitting policies to the designated review process
- Responding to review findings and challenge submissions

Limits: A Policy Author MUST NOT approve their own policies. Policy authors and policy reviewers for the same policy MUST be distinct roles.

### 8.2 Policy Reviewer

A **Policy Reviewer** is an actor with recognized authority to formally evaluate and approve or reject submitted policies within a defined governance scope.

Responsibilities:
- Evaluating submitted policies for consistency with protocol principles
- Evaluating submitted policies for conflicts with existing governance objects
- Approving, rejecting, or requesting revision of submitted policies
- Recording the review outcome with full traceability
- Notifying affected parties of policy changes

Limits: A Policy Reviewer MUST NOT review policies for which they have a recognized conflict of interest. Conflict of interest rules MUST be defined by the governance body authorizing the reviewer role.

### 8.3 Algorithm Author

An **Algorithm Author** is an actor with recognized authority to draft standing algorithms within their authorized domain.

Responsibilities:
- Drafting algorithm logic that is deterministic and reproducible
- Documenting algorithm behavior including inputs, outputs, decay functions, and edge cases
- Specifying the standing types and contexts the algorithm governs
- Providing sufficient documentation for conformant implementation
- Submitting algorithms to the designated review and approval process

Limits: An Algorithm Author MUST NOT approve their own algorithms. Algorithm authorship and algorithm review for the same algorithm MUST be distinct roles.

### 8.4 Algorithm Reviewer

An **Algorithm Reviewer** is an actor with recognized authority to formally evaluate and approve or reject standing algorithms within a defined governance scope.

Responsibilities:
- Evaluating algorithm determinism, reproducibility, and explainability
- Evaluating algorithm consistency with applicable policies and protocol principles
- Approving, rejecting, or requesting revision of submitted algorithms
- Specifying versioning requirements for approved algorithms
- Recording the review outcome with full traceability

Limits: An Algorithm Reviewer MUST NOT review algorithms they authored. Conflicts of interest MUST be disclosed and managed by the authorizing governance body.

### 8.5 Standing Reviewer

A **Standing Reviewer** is an actor with recognized authority to perform formal reviews of standing outputs, standing interpretations, or standing-affecting evidence in contexts where such review is required by policy or triggered by a challenge.

Responsibilities:
- Reviewing standing outputs against applicable policies and evidence
- Assessing whether the standing computation was performed correctly under the applicable algorithm and policy context
- Producing a review record with findings, reasoning, and recommended action
- Escalating to the appropriate governance body when review findings exceed the reviewer's authority

Limits: A Standing Reviewer MUST NOT review standing for subjects in which they have a recognized conflict of interest. A Standing Reviewer MUST NOT directly modify standing — their outputs are inputs to the standing recomputation process.

### 8.6 Challenge Reviewer

A **Challenge Reviewer** is an actor with recognized authority to evaluate governance challenges — formal disputes targeting evidence, claims, standing, capabilities, policies, algorithms, or governance decisions.

Responsibilities:
- Receiving and logging governance challenges
- Evaluating the basis, scope, and legitimacy of challenges
- Producing a challenge review record with findings and recommendations
- Determining whether a challenged governance object should be confirmed, modified, retired, or superseded
- Escalating appeals and unresolved challenges to appropriate governance bodies

Limits: A Challenge Reviewer MUST NOT review challenges they filed or in which they have a recognized interest. Challenge review outcomes MUST be recorded and be themselves challengeable through defined appeal processes.

### 8.7 Registrar

A **Registrar** is an actor with recognized authority to maintain a Governance Registry — the canonical record of recognized authorities, approved policies, approved algorithms, registered standing types, registered capability types, and governance actions.

Responsibilities:
- Maintaining the Governance Registry in a durable, append-only or audit-preserving manner
- Recording recognition events, policy approvals, algorithm approvals, and standing type registrations
- Recording governance challenges, review outcomes, and appeals
- Providing public read access to registry contents for affected parties
- Flagging conflicts, duplications, or gaps in registry contents to the appropriate governance body

Limits: A Registrar MUST NOT use registry maintenance functions to alter governance outcomes. Registry entries are records of governance decisions — they are not themselves governance decisions.

### 8.8 Delegate Authority

A **Delegate Authority** is an actor who has been formally delegated governance powers by a recognized authority within a defined and bounded scope. Delegate Authorities act as extensions of the recognizing authority for the purposes of the delegation.

Responsibilities:
- Exercising delegated governance powers within the scope and constraints of the delegation
- Maintaining traceability between delegated actions and the originating authority
- Notifying the delegating authority of actions taken under delegation
- Returning to or declining to exercise delegated powers when delegation conditions are not met

Limits: A Delegate Authority MUST NOT exercise powers beyond those explicitly delegated. Sub-delegation is prohibited unless explicitly authorized by the delegation terms.

### 8.9 Governance Auditor

A **Governance Auditor** is an actor with recognized authority to independently audit governance actions, governance records, authority recognition, policy compliance, and challenge outcomes.

Responsibilities:
- Independently assessing whether governance actions comply with recognized authority, policy, and protocol principles
- Reviewing governance registry integrity
- Identifying governance failures, scope violations, recognition gaps, and policy conflicts
- Producing audit reports that are available to affected parties and higher-order governance bodies
- Recommending corrective actions, escalations, or governance reforms

Limits: A Governance Auditor MUST have independence from the governance bodies they audit. Governance auditors SHOULD NOT hold other governance roles in the bodies they audit. Audit reports MUST be produced without suppression or interference.

### 8.10 Governance Body

A **Governance Body** is a recognized entity — committee, board, working group, or protocol process — that holds collective governance authority over a defined scope of protocol rules.

Responsibilities:
- Exercising recognized governance authority within defined scope
- Recognizing and revoking subordinate governance authorities
- Approving governance object lifecycles (proposals, reviews, approvals, retirements)
- Resolving governance disputes and contested recognitions
- Maintaining governance records through designated registrars
- Ensuring governance processes comply with protocol principles

Limits: A Governance Body operates within its recognized scope. It MUST NOT exercise authority over protocol objects outside that scope. A Governance Body MUST have defined membership, decision procedures, quorum requirements, and appeal paths.

---

## 9. Governance Objects

Governance governs objects. A **Governance Object** is any protocol artifact that requires governance authority to create, modify, approve, or retire.

Canonical Governance Objects include:

| Governance Object | Definition |
|---|---|
| Policy | A versioned, scoped, governance-approved set of rules defining eligibility, thresholds, constraints, decay, and other standing- or capability-relevant logic. |
| Algorithm | A versioned, governance-approved deterministic evaluation logic used by a Standing Engine to compute standing from evidence and claims. |
| Standing Type | A protocol-recognized category of standing interpretation that is registered in the Governance Registry and governed by applicable policies and algorithms. |
| Capability Type | A protocol-recognized category of bounded permission that is registered in the Governance Registry and governed by applicable capability policies. |
| Registry | A governance-maintained canonical record of recognized authorities, approved policies, approved algorithms, registered types, and governance actions. |
| Delegation Rule | A governance-approved specification defining how governance powers may be delegated, constrained, and revoked within a recognized scope. |
| Review Process | A governance-approved procedure defining how standing reviews, capability reviews, or governance reviews are conducted, recorded, and appealed. |
| Challenge Process | A governance-approved procedure defining how challenges to evidence, claims, standing, capabilities, policies, algorithms, or governance decisions are filed, reviewed, and resolved. |
| Authority Model | A governance-approved specification defining which authority types are recognized, under what conditions, with what scope constraints, and through what recognition process. |

Each Governance Object MUST be associated with at least one recognized Governance Authority responsible for it. A Governance Object without an associated recognized authority is ungoverned and MUST be treated as unrecognized for protocol purposes.

---

## 10. Policy Governance

### 10.1 Who may create policies

A policy MAY be drafted by any actor holding the Policy Author role within the relevant governance scope. A policy submitted for approval MUST identify:

- The drafting Policy Author and their authority basis
- The policy scope, domain, and standing types or capability types affected
- The policy version and temporal validity
- The governance body to which the policy is submitted for review
- References to any policies the submitted policy supersedes or amends

### 10.2 Who may approve policies

Policies MUST be approved by a recognized Policy Reviewer or Governance Body with authority over the policy's scope. Approval MUST produce a governance record identifying the approver, the approval basis, the policy version approved, and the effective date.

Self-approval is prohibited. A Policy Author MUST NOT approve their own policy.

### 10.3 Who may retire policies

A policy MAY be retired by:

- The Governance Body that approved it
- A higher-order Governance Authority with authority over the policy's scope
- A recognized governance process triggered by the policy's expiry conditions

Retirement MUST be recorded in the Governance Registry. Retirement MUST identify any superseding policy, the reason for retirement, and the effective date. Retired policies MUST remain accessible in the registry for audit and historical standing reconstruction.

### 10.4 Who may challenge policies

Any affected party MAY challenge a policy through the recognized Challenge Process defined for the policy's governance scope. Challenge eligibility MUST NOT be restricted solely to parties who hold governance authority.

A challenge MUST be reviewed by a Challenge Reviewer with recognized authority over the policy domain. The challenge review outcome MUST be recorded and MUST be itself subject to appeal through defined appeal paths.

### 10.5 Policy lifecycle states

| State | Meaning |
|---|---|
| Proposed | Policy has been drafted and submitted for review. It MUST NOT be applied to standing computation until approved. |
| Under Review | Policy is being evaluated by a recognized reviewer or governance body. |
| Approved | Policy has been formally approved by a recognized authority and is eligible for activation. |
| Active | Policy is currently applied to standing computation or capability evaluation in its defined scope. |
| Restricted | Policy is active but its application has been limited due to a challenge, review, or governance condition. |
| Suspended | Policy application is temporarily halted pending governance review, challenge outcome, or remediation. |
| Retired | Policy is no longer active and has been formally removed from the Governance Registry's active set. |
| Superseded | Policy has been replaced by a newer approved policy. |

---

## 11. Algorithm Governance

### 11.1 Who may create algorithms

A standing algorithm MAY be drafted by any actor holding the Algorithm Author role within the relevant governance scope. A submitted algorithm MUST:

- Be fully deterministic for the same inputs
- Be reproducible for any historical timestamp required by RFC-005-H1
- Document all evaluation stages, inputs, outputs, decay functions, thresholds, and edge cases
- Identify the standing types and contexts it governs
- Specify its versioning scheme

### 11.2 Who may approve algorithms

Algorithms MUST be approved by a recognized Algorithm Reviewer or Governance Body with authority over the algorithm's domain. Approval MUST produce a governance record identifying the reviewer, the approval basis, the algorithm version approved, and the effective date.

An Algorithm Author MUST NOT approve their own algorithm.

### 11.3 Who may retire algorithms

A standing algorithm MAY be retired by:

- The Governance Body that approved it
- A higher-order Governance Authority with authority over the algorithm's domain

Algorithm retirement MUST NOT invalidate historical standing snapshots computed under the retired algorithm. Historical snapshots remain valid records produced under the algorithm version in effect at the time of computation, in accordance with RFC-005-H1.

### 11.4 Who may challenge algorithms

Any affected party MAY challenge a standing algorithm through the recognized Challenge Process. Challenges MAY target:

- Determinism failures
- Reproducibility failures
- Unexplained behavior
- Policy inconsistency
- Scope violations
- Unauthorized changes between versions

### 11.5 Versioning

Algorithm versioning is a governance requirement, not an implementation preference. A conformant algorithm governance process MUST:

- Assign a unique, immutable version identifier to each approved algorithm version
- Prohibit modification of an approved algorithm version in place
- Require that changes to algorithm logic produce a new version submitted for review
- Record the relationship between algorithm versions in the Governance Registry
- Define migration and recomputation obligations when a new algorithm version supersedes an older one

### 11.6 Algorithm legitimacy

An algorithm is legitimate when it has been:

- Authored by a recognized Algorithm Author
- Submitted through the defined governance process
- Reviewed by a recognized Algorithm Reviewer without a conflict of interest
- Approved by a recognized governance body or authority
- Recorded in the Governance Registry with a traceable version identifier

An algorithm version that has not completed this process MUST NOT be used in canonical standing computation. Use of an ungoverned algorithm in standing computation is a protocol violation regardless of the algorithm's technical correctness.

---

## 12. Standing Governance

### 12.1 Who may define Standing Types

Standing Types, as defined in RFC-005-H2, are protocol-recognized categories of standing interpretation. A Standing Type MUST be registered in the Governance Registry by a recognized Governance Authority with appropriate scope.

Standing Types MAY be proposed by any governance participant but MUST be approved and registered by a recognized Governance Body or Protocol Authority. New Standing Types MUST:

- Define their subject scope (what entities the standing type applies to)
- Define eligible evidence and claim categories
- Define applicable policy context and algorithm version requirements
- Preserve all RFC-005-H2 Standing Engine semantics including determinism, explainability, and context sensitivity

### 12.2 Who may retire Standing Types

A Standing Type MAY be retired by the Governance Body or Protocol Authority that registered it, or by a higher-order recognized authority. Retirement MUST:

- Be recorded in the Governance Registry
- Identify the reason for retirement
- Define the transition path for existing standing snapshots computed under the retired type
- Notify affected parties through the governance body's recognized communication process

### 12.3 Who may approve new Standing Contexts

New standing contexts — the domain, jurisdiction, risk tier, and purpose combinations under which standing is computed — MUST be approved by the Domain Authority or Organizational Authority with governance scope over the relevant domain and jurisdiction.

A standing context MUST NOT be introduced without governance approval. Ungoverned standing contexts produce standing outputs that cannot be reliably interpreted, challenged, or consumed by capability engines.

### 12.4 Who may challenge standing frameworks

Any affected party MAY challenge the standing framework applicable to them through the recognized Challenge Process. Standing framework challenges MAY target:

- Incorrect or unauthorized Standing Types
- Unauthorized standing contexts
- Policy inconsistency in standing computation
- Algorithm legitimacy failures
- Authority attribution failures in standing snapshots
- Governance failures in the standing type registration process

---

## 13. Capability Governance

### 13.1 Who may define Capability Types

Capability Types, as defined in RFC-005-H4, are protocol-recognized categories of bounded permission. A Capability Type MUST be registered in the Governance Registry by a recognized Governance Authority.

Capability Type governance follows the same recognition and approval requirements as Standing Type governance. A Capability Type definition MUST preserve all RFC-005-H4 Capability Mapping semantics including boundedness, scope requirements, traceability, and revocability.

### 13.2 Who may approve capability mappings

Capability mappings — the policy definitions that connect standing states to capability eligibility — MUST be approved by the Governance Body or Domain Authority with scope over both the standing type and the capability type involved. A capability mapping that is not governed by a recognized authority is not a legitimate policy.

RFC-005-H4 defines the formal model for capability derivation. Governance ensures that the policies driving that derivation are themselves legitimate.

### 13.3 Who may retire capabilities

A Capability Type or capability policy MAY be retired by the Governance Body that approved it or by a higher-order authority. Retirement MUST follow the same requirements as policy retirement under Section 10.3.

Retirement of a Capability Type MUST define the disposition of existing CapabilityGrants issued under that type.

### 13.4 Reference to RFC-005-H4

Capability governance interacts with Capability Mapping as defined in RFC-005-H4. The capability policy, capability scope definitions, constraint definitions, and revocation trigger definitions referenced throughout RFC-005-H4 are all Governance Objects subject to the governance requirements of this RFC. A capability policy that has not been approved by a recognized Governance Authority is an ungoverned policy and MUST NOT be applied to consequential capability decisions.

---

## 14. Challenge Governance

### 14.1 Governance Challenges defined

A **Governance Challenge** is a formal dispute filed by an affected party against a governance object, a governance action, or a governance outcome.

Governance Challenges are distinct from standing challenges (disputes about specific standing snapshots) and evidence challenges (disputes about specific evidence artifacts). Governance Challenges target the rules themselves.

### 14.2 Who may file a Governance Challenge

Any party affected by a governance rule, governance action, or governance outcome MAY file a Governance Challenge. Challenge eligibility MUST NOT be restricted to parties who hold governance authority. A subject whose standing is affected by a policy MUST have the right to challenge that policy.

### 14.3 What may be challenged

Governance Challenges MAY target:

| Target | Examples |
|---|---|
| Evidence | Authenticity, authority, relevance, or lifecycle state of evidence used in governance decisions |
| Claims | Accuracy, scope, or authority of claims supporting governance decisions |
| Standing | Correctness of standing computation, algorithm legitimacy, policy compliance |
| Capabilities | Validity of capability grants, scope compliance, revocation failures |
| Policies | Consistency with protocol principles, authority of policy authors, scope violations |
| Algorithms | Determinism failures, legitimacy of approval process, version integrity |
| Authorities | Validity of recognition, scope violations, expired recognition |
| Governance Decisions | Procedural compliance, conflict of interest, authority violations |

### 14.4 Challenge process requirements

A recognized Challenge Process MUST define:

- How challenges are filed (format, required elements, submission path)
- How challenges are logged in the Governance Registry
- Who reviews challenges (Challenge Reviewer role and recognition requirements)
- What standing challenge targets have during review (disclosure, participation rights)
- What outcomes are possible (confirm, modify, retire, supersede)
- How outcomes are recorded
- How outcomes may be appealed

### 14.5 Challenge effect on governance objects

A pending Governance Challenge MUST carry challenge state visibly in the Governance Registry. Governance objects under active challenge SHOULD be disclosed as such to parties who rely on them. Policy behavior during a pending governance challenge MUST be defined by the governing policy framework — in the absence of a specific provision, challenged governance objects SHOULD be treated with reduced confidence for high-risk decisions.

---

## 15. Review Governance

### 15.1 Review process defined

A **Governance Review** is a formal evaluation of a governance object, governance action, or governance outcome by a recognized reviewer or governance body.

Reviews differ from challenges. A challenge is filed by an affected party. A review may be initiated by the governance body, a designated auditor, or a defined periodic review schedule.

### 15.2 Review authority

Reviews MUST be conducted by actors holding the Standing Reviewer, Challenge Reviewer, Governance Auditor, or Governance Body role, depending on the object under review. Review authority MUST be traceable to recognized governance recognition.

### 15.3 Review outcomes

Conformant review processes MUST define the following possible outcomes:

| Outcome | Meaning |
|---|---|
| Confirmed | The governance object is found to comply with applicable rules and may continue without modification. |
| Modified | The governance object requires changes to achieve compliance. Changes MUST be approved through the appropriate governance process. |
| Suspended | The governance object is temporarily deactivated pending further review, additional evidence, or governance action. |
| Retired | The governance object is permanently deactivated. The governance record is preserved. |
| Superseded | The governance object is replaced by a revised version submitted through the appropriate governance process. |
| Escalated | The review findings exceed the reviewer's authority and the matter is referred to a higher-order governance body. |

### 15.4 Appeal structures

Every governance review outcome MUST have a defined appeal path. An appeal MUST be:

- Filed by an affected party within a defined period after the review outcome is recorded
- Evaluated by a governance body or authority that is independent of the original reviewer
- Recorded in the Governance Registry with full traceability
- Itself subject to further appeal up to the maximum defined governance hierarchy

A governance structure without appeal paths is not conformant with this RFC.

---

## 16. Governance Traceability

### 16.1 Relationship to RFC-005-H1

RFC-005-H1 defines Standing Traceability — the requirement that every standing state be traceable to its evidence, algorithm, and policy context. RFC-005-H3 extends traceability upward: every governance action must itself be traceable to its authority, policy basis, and effect.

Governance traceability is the traceability of the rules, not just the outputs of those rules.

### 16.2 What every governance action must answer

Every governance action MUST be answerable with:

| Question | Required record |
|---|---|
| Who? | The identity of the governance actor, their role, and their recognized authority basis |
| Why? | The reason for the governance action, including policy basis and triggering event |
| Under what authority? | The recognized Governance Authority that authorized the action, including scope confirmation |
| Under what policy? | The governance policy or process under which the action was taken |
| When? | The timestamp of the governance action |
| What changed? | The governance object state before and after the action |
| What impact resulted? | Identified affected standing snapshots, capability grants, authority determinations, or decisions |

### 16.3 Governance traceability requirements

Governance traceability is normative. A conformant governance implementation MUST:

- Record every governance action with the elements listed in Section 16.2
- Preserve governance records in an append-only or audit-preserving format
- Maintain a Governance Registry that links governance actions to governance objects and to affected standing and capability records
- Support reconstruction of the governance state at any historical timestamp
- Expose governance records to recognized auditors without suppression

---

## 17. Governance Dependency Graph

The Governance Dependency Graph extends the Standing Dependency Graph (RFC-005-H1) and the Capability Dependency Graph (RFC-005-H4) to include the governance layer.

```text
[Recognized Authority]
    |
    | defines/approves
    v
[Governance Policy]          [Algorithm Version]
    |                              |
    | governs                      | governs
    v                              v
[Standing Type]           [Standing Computation]
    |                              |
    | consumed_by                  | produces
    v                              v
[Capability Type]         [Standing Snapshot]
    |                              |
    | governed_by                  | consumed_by
    v                              v
[Capability Policy]       [Capability Decision]
    |                              |
    | governs                      | enables
    v                              v
[Capability Grant]        [Authority Recognition]
    |                              |
    | may_trigger                  | enables
    v                              v
[Governance Challenge]    [Decision]
    |                              |
    | reviewed_by                  | may_trigger
    v                              v
[Governance Review]       [Governance Challenge]
    |
    | recorded_in
    v
[Governance Registry]
    |
    | audited_by
    v
[Governance Auditor]
```

### 17.1 Governance objects that must appear in the graph

A conformant governance implementation MUST maintain explicit graph relationships among:

- Recognized Authorities and the governance objects they govern
- Governance Policies and the standing types or capability types they define
- Algorithm Versions and the governance body that approved them
- Standing Types and the policies and algorithms that govern their computation
- Capability Types and the policies that govern their grant
- Review Processes and the governance bodies that authorize them
- Challenge Processes and the governance bodies that define them
- Governance Actions and the standing snapshots or capability grants they affect
- Governance Registry entries and the actions that created them

### 17.2 Graph integrity requirement

A Governance Object without explicit graph edges to its authorizing Recognized Authority is an ungoverned object and MUST be treated as such. An orphan governance object — one that cannot be traced to recognized authority — MUST NOT be used as the basis for standing computation, capability grant, or authority recognition.

---

## 18. Governance Constraints

### 18.1 Scope constraints

Every Governance Authority operates within a defined scope. Governance actions outside recognized scope are null and void under this protocol. A governance body MUST NOT expand its own scope without authorization from a co-equal or higher-order recognized authority.

### 18.2 Jurisdiction constraints

Governance authority may be bounded by legal jurisdiction, regulatory mandate, or geographic applicability. A Governance Authority MUST respect jurisdictional constraints and MUST NOT assert governance authority in jurisdictions where its recognition does not apply.

### 18.3 Policy constraints

Governance authorities are themselves governed by policies. A governance body MUST operate within its defined governance policy framework. Governance actions that violate the governance body's own policy framework are not legitimate governance actions.

### 18.4 Delegation constraints

Delegation of governance authority is bounded. A delegating authority:

- MUST NOT delegate more power than it holds
- MUST define explicit scope, constraints, and temporal bounds for all delegations
- MUST retain accountability for actions taken by delegated authorities within the scope of the delegation
- MAY revoke delegations

A delegation chain MUST be traceable. Governance actions taken under delegation MUST identify the full delegation chain from the action to the foundational recognized authority.

### 18.5 Temporal constraints

Recognition, policies, algorithms, and delegation are temporally bounded. Governance actions taken after the expiry of the relevant authority, policy, or delegation are not valid governance actions. A conformant governance implementation MUST check temporal validity before treating a governance action as valid.

### 18.6 Risk constraints

High-risk governance actions — those that affect large populations of subjects, that change fundamental standing rules, or that affect protocol-level definitions — MUST require higher-order governance approval, broader review, or mandatory challenge periods before taking effect. Governance policies MUST define risk tiers for governance actions and the procedural requirements associated with each tier.

---

## 19. Governance Lifecycle

Governance Objects progress through the following lifecycle states:

| State | Meaning |
|---|---|
| Proposed | The governance object has been drafted and submitted for review. It MUST NOT be applied to standing computation, capability evaluation, or authority recognition until approved. |
| Under Review | A recognized reviewer or governance body is formally evaluating the governance object. |
| Approved | The governance object has been formally approved by a recognized authority. It is eligible for activation. |
| Active | The governance object is currently applied within its defined scope and producing effects on standing, capabilities, or authority. |
| Restricted | The governance object is active but its application is constrained due to a challenge, review condition, or governance hold. |
| Suspended | Application of the governance object is temporarily halted pending governance review, challenge outcome, or remediation. |
| Retired | The governance object is permanently deactivated. Its historical record is preserved in the Governance Registry. |
| Superseded | The governance object has been replaced by a newer approved version. The superseded object's record is preserved. |

### 19.1 Lifecycle requirements

Lifecycle state transitions MUST be:

- Authorized by a recognized Governance Authority with appropriate scope
- Recorded in the Governance Registry with traceability
- Associated with a reason and an applicable policy or governance decision
- Propagated to affected standing snapshots, capability grants, and authority determinations where required

A lifecycle transition that is not authorized and recorded is not a valid governance action.

---

## 20. Governance Guarantees

The following guarantees are normative for conformant governance implementations.

### No hidden governance

Governance rules MUST be publicly accessible. A protocol rule that is not visible to affected parties is not a legitimate governance rule. Hidden governance policies, hidden algorithm changes, and hidden authority recognition are protocol violations.

### No authority-free governance

Every governance action MUST be traceable to a recognized Governance Authority. An action taken without recognized authority is an ungoverned administrative action. Ungoverned administrative actions MUST NOT be treated as governance.

### No governance without traceability

Every governance action MUST produce a traceable governance record answering who, why, under what authority, under what policy, when, what changed, and what impact resulted.

### No governance without challenge

Every governance rule and every governance action MUST be challengeable through a recognized governance challenge process. Governance that is immune to challenge is not legitimate governance under this protocol.

### No governance without legitimacy

Governance authority derives from recognition, not from assertion, ownership, or technical access. An actor without recognized authority MUST NOT perform governance actions. Protocol participants MUST NOT treat ungoverned administrative changes as legitimate governance.

### No governance without scope

Governance authority is bounded. No Governance Authority holds unlimited scope. Actions taken outside recognized scope are invalid regardless of the actor's general governance status.

---

## 21. Security Implications

### 21.1 Governance capture

**Threat**: A powerful actor — market maker, vendor, regulator, or insider — captures the governance process, installing compliant governance bodies, approving favorable policies, and using governance legitimacy to entrench unfair rules.

**Protocol response**: Governance capture is resisted by requiring recognition chains that trace to a foundational governance process, by requiring transparency and auditability of all governance actions, by making all governance rules challengeable, and by requiring that governance bodies have defined membership, quorum, and conflict of interest rules. No single actor SHOULD be able to control the full recognition chain.

### 21.2 Authority laundering

**Threat**: An unrecognized actor routes governance actions through a nominally recognized authority to obtain the appearance of legitimacy without the substance.

**Protocol response**: Recognition chain traceability requirements mean that governance actions must be attributable to the actor who performed them, not only to the recognized authority in whose name they were performed. Delegation chains must be explicit and bounded. Governance registries must record the actual actor, not only the authority.

### 21.3 Policy abuse

**Threat**: A Policy Author or Governance Body uses governance powers to create policies that benefit specific parties, exclude competitors, or evade accountability.

**Protocol response**: Policy approval requires recognized reviewers who are independent of the policy author. All policies are challengeable. Governance auditors have authority to review policies for consistency with protocol principles. Policies that conflict with protocol principles can be challenged and retired.

### 21.4 Algorithm abuse

**Threat**: An Algorithm Author introduces logic into a standing algorithm that systematically disadvantages specific subjects or inflates the standing of others, using technical complexity to conceal the abuse.

**Protocol response**: Algorithm legitimacy requires review by a recognized Algorithm Reviewer who evaluates determinism, reproducibility, and consistency with applicable policies. Algorithm version control means that changes are visible. Governance challenges may target algorithms. Governance auditors may review algorithm behavior.

### 21.5 Reviewer corruption

**Threat**: A Policy Reviewer or Algorithm Reviewer is compromised — through conflict of interest, coercion, or collusion — and approves governance objects they should reject.

**Protocol response**: Conflict of interest rules are required by governance policy. Appeal processes allow reviewers' decisions to be contested. Governance auditors may review review outcomes. The challenge process is available to any affected party. No single reviewer's decision is final if contested.

### 21.6 Delegation abuse

**Threat**: A recognized authority delegates governance powers to an actor who then exercises those powers for unauthorized purposes, or extends the delegation beyond its defined scope.

**Protocol response**: Delegation must be explicit, bounded, and traceable. Delegated authorities MUST NOT exceed their delegation scope. The delegating authority retains accountability. Delegation chains must be recorded in the Governance Registry. Sub-delegation is prohibited unless explicitly authorized.

### 21.7 Fake authorities

**Threat**: An actor asserts governance authority without recognition and is treated as a legitimate governance body by protocol participants who do not verify the recognition chain.

**Protocol response**: Recognition is a requirement, not a courtesy. Protocol implementations MUST verify that governance actions trace to a recognized authority before treating them as legitimate. The Governance Registry provides the canonical record of recognized authorities. An actor not in the registry is not a recognized authority.

### 21.8 Opaque governance

**Threat**: Governance bodies operate without transparency, approving policies and algorithms through processes that affected parties cannot inspect or challenge.

**Protocol response**: Transparency is a foundational governance principle. Hidden governance rules are not legitimate. Governance records must be publicly accessible. Challenge processes must be available without requiring governance authority as a prerequisite.

### 21.9 Governance drift

**Threat**: Over time, governance rules accumulate inconsistencies, outdated provisions, and conflicting authorities without anyone being responsible for maintaining coherence.

**Protocol response**: Governance objects have defined lifecycles. Retired and superseded objects are recorded. Governance auditors are responsible for identifying governance failures. Governance bodies have defined accountability for maintaining their governance domains. Periodic review requirements SHOULD be defined by governance policy.

---

## 22. Implementation Guidance

This section introduces canonical governance concepts for implementation. This RFC is implementation-neutral. It does not prescribe a database, API, blockchain, user interface, or specific governance tooling.

| Concept | Definition |
|---|---|
| GovernanceAuthority | A protocol-recognized entity that holds recognized authority to govern standing-related protocol objects within a defined scope. |
| RecognizedAuthority | The property of holding governance recognition from a valid recognition chain; the central basis of legitimate governance in AOC. |
| GovernanceRole | A defined governance function (Policy Author, Algorithm Reviewer, Challenge Reviewer, etc.) conferred by a recognized governance body. |
| GovernanceAction | Any act of governance — policy approval, algorithm registration, standing type retirement, challenge resolution — that produces a governance record. |
| GovernanceReview | A formal evaluation of a governance object by a recognized reviewer or governance body, producing a reviewable, challengeable outcome. |
| GovernanceChallenge | A formal dispute filed by an affected party targeting a governance object, governance action, or governance outcome. |
| GovernanceDecision | A formal outcome produced by a governance body or recognized authority resolving a governance action, review, or challenge. |
| GovernanceRegistry | The canonical, audit-preserving record of recognized authorities, approved policies, approved algorithms, registered standing types, registered capability types, governance actions, governance reviews, challenges, and governance decisions. |
| GovernancePolicy | A governance object that defines the rules under which a governance body operates, including membership, quorum, conflict of interest, appeal paths, and decision procedures. |
| GovernanceScope | The bounded domain — by type, domain, jurisdiction, and temporal validity — within which a governance authority may act. |

### 22.1 Implementation notes

1. Governance Registries SHOULD be maintained with the same integrity standards as evidence registries. Append-only or equivalent audit-preserving structures are recommended.
2. Recognition events SHOULD be treated as governance actions that are themselves subject to traceability requirements.
3. Governance objects SHOULD be versioned. Changes SHOULD produce new versions, not in-place modifications.
4. Conflict of interest rules MUST be defined and enforced for all governance roles.
5. Governance decisions SHOULD fail to a safe default — which is treated as ungoverned — when recognition cannot be verified.
6. Governance challenges SHOULD be trackable from filing through resolution, with all intermediate states recorded.
7. Governance auditors SHOULD have independent access to all governance records without requiring the cooperation of the governance bodies they audit.
8. Appeal paths SHOULD be defined in governance policy before governance bodies are recognized, not after disputes arise.
9. Governance lifecycle state transitions SHOULD be events that propagate to affected standing and capability records.
10. Implementations SHOULD support simulation of governance changes — the impact of a hypothetical policy change — without applying those changes to canonical governance state.

---

## 23. Future RFC Dependencies

Standing Governance creates the following future RFC dependencies.

| Future RFC | Scope |
|---|---|
| RFC-005-H5 Delegated Standing | Defines how standing may be delegated across principals. Governance of delegation rules — who may authorize delegation policies and how delegation challenges are resolved — falls within the scope of Standing Governance as defined here. |
| RFC-005-H6 Standing Algorithms | Defines algorithm requirements and versioning in depth. Algorithm governance requirements established here — authoring, review, approval, versioning, retirement — provide the constitutional framework that RFC-005-H6 must operate within. |
| RFC-005-H8 Authority Model (proposed) | Would define how authority is recognized from capabilities and how governance bodies participate in authority recognition. The Governance Authority model defined in this RFC is the foundation for the Authority Model. |
| RFC-005-H9 Decision Framework (proposed) | Would define the Decision layer. Governance of decision-level policies and challenge processes falls within the scope established by this RFC. |
| RFC-005-H10 Governance Registry (potential) | Would define the canonical structure, data model, access model, and integrity requirements for the Governance Registry introduced in this RFC. |
| RFC-005-H11 Governance Challenges (potential) | Would define the full challenge lifecycle, challenge evidence requirements, challenge review procedures, appeal structures, and challenge outcome effects in greater detail than this RFC establishes. |
| RFC-005-H12 Governance Delegation (potential) | Would define the full framework for delegation of governance authority, including delegation chain semantics, delegation constraints, sub-delegation rules, delegation revocation, and delegation audit. |

---

## 24. Acceptance Criteria

A complete implementation or document alignment for RFC-005-H3 satisfies the following checklist:

- [ ] RFC-005-H3 exists in the correct repository location.
- [ ] It follows existing RFC formatting and metadata conventions.
- [ ] It defines governance as the system responsible for rules, not outcomes.
- [ ] It distinguishes governance from administration, ownership, and platform control.
- [ ] It defines Recognized Authority as the central concept of governance legitimacy.
- [ ] It defines governance scope and establishes that scope is bounded.
- [ ] It defines the eight canonical governance principles (P-G1 through P-G8).
- [ ] It defines the five canonical Governance Authority types.
- [ ] It defines Authority Recognition as the foundational requirement for legitimate governance.
- [ ] It defines the recognition chain and its requirement to trace to foundational governance.
- [ ] It defines all ten canonical Governance Roles with responsibilities and limits.
- [ ] It defines canonical Governance Objects.
- [ ] It defines policy governance including creation, approval, retirement, challenge, and lifecycle states.
- [ ] It defines algorithm governance including authoring, review, approval, versioning, retirement, and legitimacy requirements.
- [ ] It defines standing governance including standing type definition, retirement, context approval, and challenge.
- [ ] It defines capability governance and references RFC-005-H4.
- [ ] It defines Governance Challenges, including what may be challenged and process requirements.
- [ ] It defines review governance including review authority, outcomes, and appeal structures.
- [ ] It defines governance traceability and the mandatory questions every governance action must answer.
- [ ] It defines the Governance Dependency Graph.
- [ ] It defines governance constraints across scope, jurisdiction, policy, delegation, temporal, and risk dimensions.
- [ ] It defines the governance lifecycle states and transition requirements.
- [ ] It defines the six normative governance guarantees.
- [ ] It covers nine security implications: governance capture, authority laundering, policy abuse, algorithm abuse, reviewer corruption, delegation abuse, fake authorities, opaque governance, and governance drift.
- [ ] It introduces ten canonical implementation concepts.
- [ ] It identifies future RFC dependencies.
- [ ] It answers all mandatory questions from the RFC specification.

### Mandatory questions answered

| Question | Section |
|---|---|
| What is governance? | Section 3 |
| Why does governance exist? | Section 2 |
| Who governs standing? | Sections 6, 7, 12 |
| Who governs capabilities? | Sections 6, 7, 13 |
| Who governs algorithms? | Sections 6, 7, 11 |
| Who governs policies? | Sections 6, 7, 10 |
| Who recognizes authority? | Section 7 |
| Who reviews governance? | Sections 8.5, 8.6, 8.9, 15 |
| Who challenges governance? | Sections 8.6, 14 |
| How is governance constrained? | Section 18 |

---

## Conclusion

RFC-005-H3 establishes the constitutional authority structure for governance of the AOC standing, capability, and authority chain. Every layer of that chain — evidence, assertions, claims, attestations, verification, standing, capabilities, authorities, and decisions — operates under rules. This RFC governs who may define those rules, how they acquire legitimacy, how they may be challenged, and how they must be constrained.

The central contribution of this RFC is the concept of **Recognized Authority**.

Governance in AOC is not the exercise of administrative power. It is not the action of whoever controls a system. It is not the preference of whoever owns a product. Governance is the exercise of authority that has been formally recognized by a governance chain traceable to the AOC Protocol's foundational governance process.

This distinction protects the protocol against administrative capture, opaque rule-making, ungoverned algorithm changes, and authority structures that are legitimate in appearance but arbitrary in fact. When a standing algorithm changes, governance must have authorized that change. When a capability policy expands, governance must have approved that expansion. When an authority is recognized, governance must have conferred that recognition.

The protocol chain produces determinate, explainable, auditable outputs precisely because every rule that governs the chain is itself governed.

Governance = Recognized Authority acting within bounded scope under transparent, challengeable, traceable rules.
