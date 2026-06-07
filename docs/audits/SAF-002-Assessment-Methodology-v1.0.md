# SAF-002 — Assessment Methodology v1.0

| Field            | Value                                                                 |
|------------------|-----------------------------------------------------------------------|
| Document ID      | SAF-002                                                               |
| Title            | Sovereignty Assurance Framework — Assessment Methodology              |
| Version          | 1.0                                                                   |
| Status           | Active                                                                |
| Category         | Assurance Methodology / Constitutional Audit Procedure                |
| Supersedes       | None (initial release)                                                |
| Authors          | AOC Assurance Working Group                                           |
| Created          | 2026-06-07                                                            |
| Last Updated     | 2026-06-07                                                            |
| Normative Basis  | SAF-001 — Constitutional Control Catalog                              |

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Core Principle](#2-core-principle)
3. [Relationship with SAF-001](#3-relationship-with-saf-001)
4. [Assessment Types](#4-assessment-types)
5. [Assessment Roles](#5-assessment-roles)
6. [Full Assessment Lifecycle](#6-full-assessment-lifecycle)
7. [Phase 0 — Intake](#7-phase-0--intake)
8. [Phase 1 — Scope Definition](#8-phase-1--scope-definition)
9. [Phase 2 — Evidence Planning](#9-phase-2--evidence-planning)
10. [Phase 3 — Evidence Collection](#10-phase-3--evidence-collection)
11. [Phase 4 — Control Mapping](#11-phase-4--control-mapping)
12. [Phase 5 — Scoring](#12-phase-5--scoring)
13. [Phase 6 — Findings Review](#13-phase-6--findings-review)
14. [Phase 7 — Risk & Remediation](#14-phase-7--risk--remediation)
15. [Phase 8 — Report Production](#15-phase-8--report-production)
16. [Phase 9 — Certification Decision](#16-phase-9--certification-decision)
17. [Phase 10 — Follow-Up / Continuous Assurance](#17-phase-10--follow-up--continuous-assurance)
18. [Assessment Timeline](#18-assessment-timeline)
19. [Assessment Deliverables](#19-assessment-deliverables)
20. [Assessment Ethics](#20-assessment-ethics)
21. [Independence Requirements](#21-independence-requirements)
22. [Quality Assurance](#22-quality-assurance)
23. [Public Disclosure Rules](#23-public-disclosure-rules)
24. [Standard Disclaimer](#24-standard-disclaimer)
25. [Assessment Records](#25-assessment-records)
26. [Example Assessment Workflow](#26-example-assessment-workflow)
27. [Assessment Maturity Model](#27-assessment-maturity-model)
28. [Minimum Viable SAF Audit](#28-minimum-viable-saf-audit)
29. [First Commercial Package](#29-first-commercial-package)
30. [Constitutional Closing Statement](#30-constitutional-closing-statement)

---

## 1. Abstract

SAF-002 defines the operational methodology by which Sovereignty Assurance Framework (SAF) assessments are planned, executed, documented, reviewed, and resolved. It is the procedural complement to SAF-001, which defines the control catalog against which all assessments are measured.

This document governs every actor who participates in an SAF assessment: the Assessing Organization, the Assessed Organization, independent auditors, Certification Authorities, and any third party providing evidence or attestation. It defines what constitutes a valid assessment, what constitutes a valid finding, and what constitutes a defensible certification decision.

SAF-002 is grounded in a single thesis: sovereignty cannot be claimed. Sovereignty must be evidenced. No declaration, marketing statement, architecture diagram, or vendor attestation substitutes for structured, traceable, independently reviewable evidence collected against defined controls. An SAF assessment is the mechanism by which that evidence is systematically gathered, mapped, scored, reviewed, and adjudicated.

This document is normative. All SAF assessments conducted under the AOC Enterprise assurance program MUST comply with the methodology defined herein. Deviations require written authorization from the AOC Assurance Governance Board and MUST be documented as exceptions in the final assessment report.

---

## 2. Core Principle

> **Sovereignty cannot be claimed. Sovereignty must be evidenced.**

This principle governs every decision in SAF-002. It has three operational consequences:

**2.1 Claims are not evidence.**
A vendor's assertion that their platform is sovereign, privacy-respecting, or consent-driven is not an assessment finding. It is a claim. Claims require corroboration through independently verifiable artifacts: audit logs, configuration exports, architectural specifications, policy enforcement traces, cryptographic proofs, or independently observed runtime behavior.

**2.2 Evidence without mapping is insufficient.**
An artifact is not an assessment finding until it has been mapped to a specific control in SAF-001 with a documented rationale for how it satisfies, partially satisfies, or fails to satisfy that control. Evidence without control mapping produces no assurance conclusion.

**2.3 Assurance is bounded and time-limited.**
An SAF certification attests to the state of a system as assessed during a defined assessment window. It does not assert permanent sovereignty. Control environments change. Systems evolve. Certifications expire. Continuous assurance obligations exist beyond initial certification.

---

## 3. Relationship with SAF-001

SAF-001 defines the **what**: the catalog of constitutional controls that a sovereign system must satisfy. SAF-002 defines the **how**: the structured methodology for determining whether those controls are satisfied.

The relationship is strictly hierarchical and normative.

| Dimension                    | SAF-001 Responsibility                          | SAF-002 Responsibility                              |
|------------------------------|-------------------------------------------------|-----------------------------------------------------|
| Control definition           | Owns and maintains control specifications       | Consumes control specifications as fixed inputs     |
| Control categorization       | Defines control families and criticality tiers  | Applies categorization during scope and scoring     |
| Evidence standards           | May specify minimum evidence types per control  | Implements evidence collection procedures           |
| Scoring criteria             | Defines pass/fail thresholds per control        | Executes scoring against those thresholds           |
| Control versioning           | Manages control catalog versioning              | Records which SAF-001 version applies to each audit |
| Certification basis          | Defines what constitutes full compliance        | Adjudicates whether full compliance is achieved     |

An SAF assessment conducted under SAF-002 MUST reference a specific, immutable version of SAF-001. If the SAF-001 catalog is amended during an active assessment, the Lead Auditor MUST document the version in use at assessment initiation and is not required to incorporate amendments until the following assessment cycle, unless the amendment addresses a critical constitutional defect.

---

## 4. Assessment Types

SAF recognizes four distinct assessment types. Each carries different scope, evidence requirements, auditor independence requirements, and certification outcomes.

### 4.1 Full Constitutional Assessment (FCA)

A complete evaluation of all SAF-001 controls applicable to the assessed system in its declared scope. Required for initial certification and for re-certification after a major architectural change.

- All control families evaluated
- All critical controls must achieve a passing score
- Mandatory on-site or authenticated remote evidence collection
- Requires a Lead Auditor and at least one independent Peer Reviewer
- Produces a full SAF Certificate of Conformance upon passing

### 4.2 Targeted Domain Assessment (TDA)

An evaluation limited to one or more specific SAF-001 control families, conducted when a system has undergone a bounded change affecting only those domains. Does not replace or renew an FCA.

- Scope explicitly limited to named control families
- Evidence collection restricted to affected domains
- Requires a Lead Auditor; Peer Review is advisory, not mandatory
- Produces a Domain-Scoped Addendum to an existing Certificate of Conformance
- An existing valid FCA is a prerequisite

### 4.3 Continuous Assurance Review (CAR)

A lightweight, periodic review conducted between full assessment cycles to verify that no material drift from the certified control state has occurred. Frequency is defined in the Continuous Assurance Agreement negotiated at FCA completion.

- Evidence collection through automated artifact submission and spot checks
- No new scoring of previously passed controls unless drift indicators are present
- Conducted by an Assurance Monitor; Lead Auditor review required only on exception
- Produces a Continuous Assurance Status Report
- Drift findings above the materiality threshold trigger a mandatory TDA or FCA

### 4.4 Remediation Verification Assessment (RVA)

A targeted assessment conducted after a finding of non-conformance to verify that the assessed organization has implemented corrective action. Scope is restricted to the specific controls that generated the non-conformance finding.

- Evidence collection limited to remediation artifacts
- Pass/fail determination against the specific controls under remediation
- Requires the original Lead Auditor or a designated successor with full context transfer
- Produces a Remediation Verification Report
- Does not elevate or extend the scope of the original certificate

---

## 5. Assessment Roles

All SAF assessments operate under a defined role structure. Role assignments are documented in the Assessment Charter and cannot be changed after evidence collection begins without documented approval from the Assurance Governance Board.

| Role                        | Abbreviation | Responsibilities                                                                                                                       | Independence Requirement           |
|-----------------------------|--------------|----------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|
| Lead Auditor                | LA           | Owns the assessment end-to-end. Signs all formal findings. Makes the certification recommendation.                                     | Must satisfy Section 21            |
| Peer Reviewer               | PR           | Reviews lead auditor conclusions independently. Required for FCA. Advisory for TDA.                                                    | Must satisfy Section 21            |
| Evidence Coordinator        | EC           | Manages evidence collection logistics. Maintains the evidence registry. Does not make findings.                                        | Organizational independence only   |
| Technical Specialist        | TS           | Subject matter expert engaged for specific technical domains. Findings are advisory; LA must ratify.                                   | Domain competence required         |
| Assurance Monitor           | AM           | Executes Continuous Assurance Reviews between full cycles. Escalates to LA on drift.                                                   | Organizational independence only   |
| Assessed Organization Rep   | AOR          | Primary counterpart for the assessed organization. Provides access and evidence. Cannot influence findings.                            | N/A (interested party)             |
| Certification Authority     | CA           | Issues and revokes SAF Certificates of Conformance. Cannot conduct assessments they certify.                                           | Full independence from LA and AOR  |
| Assurance Governance Board  | AGB          | Oversees the SAF program. Resolves disputes. Authorizes exceptions. Does not conduct assessments.                                      | Institutional independence         |

### 5.1 Role Prohibitions

- The Lead Auditor MUST NOT have had a consulting, employment, or advisory relationship with the Assessed Organization within the preceding twenty-four months.
- The Certification Authority MUST NOT be the same entity as the Assessing Organization.
- The Assessed Organization Representative MUST NOT have access to draft findings before the Lead Auditor has finalized them.
- No individual may hold more than one role in the same assessment, with the single exception that a Technical Specialist may also serve as Evidence Coordinator if the assessment is a Minimum Viable SAF Audit (see Section 28).

---

## 6. Full Assessment Lifecycle

An SAF assessment proceeds through eleven sequential phases. Phases may not be reordered. Phases may not be skipped except as explicitly authorized in Sections 28 and 29. The Lead Auditor is responsible for gate approval at each phase transition.

```
Phase 0   Intake
    |
Phase 1   Scope Definition
    |
Phase 2   Evidence Planning
    |
Phase 3   Evidence Collection
    |
Phase 4   Control Mapping
    |
Phase 5   Scoring
    |
Phase 6   Findings Review
    |
Phase 7   Risk & Remediation
    |
Phase 8   Report Production
    |
Phase 9   Certification Decision
    |
Phase 10  Follow-Up / Continuous Assurance
```

Each phase has defined entry criteria, defined outputs, and a defined gate approval requirement. A phase is not complete until its gate criteria are satisfied. The Lead Auditor documents phase completion in the Assessment Journal.

---

## 7. Phase 0 — Intake

### 7.1 Purpose

Phase 0 establishes the administrative and constitutional basis for the assessment. It produces the Assessment Charter, which is the binding agreement governing scope, roles, timeline, access, and obligations.

### 7.2 Entry Criteria

- Written request from the Assessed Organization
- Preliminary identification of assessment type (FCA, TDA, CAR, or RVA)
- Preliminary identification of the system or system boundary under assessment

### 7.3 Procedures

**7.3.1 Conflict of Interest Review**
The proposed Lead Auditor completes a formal Conflict of Interest Declaration covering the preceding twenty-four months. The Assurance Governance Board reviews and approves the declaration before the assessment proceeds.

**7.3.2 Preliminary System Description**
The Assessed Organization submits a Preliminary System Description (PSD) covering:
- System name and version
- Architectural summary (narrative, not detailed design)
- Claimed sovereign capabilities
- Existing certifications or prior assessments
- Known open findings from prior assessments

The PSD is not an evidence document. It is an orientation document. Claims in the PSD require evidence corroboration in Phase 3.

**7.3.3 Assessment Charter Execution**
The Assessment Charter is a binding document executed by the Lead Auditor, the Assessed Organization's authorized representative, and the Certification Authority. It defines:
- Assessment type
- SAF-001 version applied
- System boundary and named exclusions
- Assessment window (start and end dates)
- Access obligations of the Assessed Organization
- Confidentiality terms
- Dispute resolution mechanism
- Fee and payment terms (if applicable)

No evidence collection may begin before the Assessment Charter is executed.

### 7.4 Gate Criteria

- Conflict of Interest Declaration approved by AGB
- Assessment Charter fully executed
- Assessment Journal initiated by Lead Auditor

### 7.5 Outputs

| Output                          | Owner  | Disposition                        |
|---------------------------------|--------|------------------------------------|
| Conflict of Interest Declaration| LA     | Retained in Assessment Record      |
| Preliminary System Description  | AOR    | Reference only; not an evidence doc|
| Assessment Charter              | LA/CA  | Binding; retained in Assessment Record |
| Assessment Journal (initiated)  | LA     | Living document throughout audit   |

---

## 8. Phase 1 — Scope Definition

### 8.1 Purpose

Phase 1 translates the preliminary system description and assessment type into a precise, auditable scope statement. It identifies which SAF-001 controls are in scope, which are explicitly excluded, and the rationale for exclusions.

### 8.2 Entry Criteria

- Assessment Charter executed (Phase 0 gate passed)
- Access to Assessed Organization's architectural documentation for scoping purposes

### 8.3 Procedures

**8.3.1 System Boundary Definition**
The Lead Auditor works with the Assessed Organization Representative to produce a System Boundary Document (SBD) that defines:
- The logical and technical perimeter of the assessed system
- Named components included in scope
- Named components excluded from scope, with exclusion rationale
- External dependencies that may affect control satisfiability

The SBD MUST be specific enough that a third-party auditor, reviewing only the SBD and the assessment report, could determine precisely what was and was not assessed.

**8.3.2 Control Selection**
Against the defined system boundary, the Lead Auditor selects the applicable SAF-001 controls. Control selection follows these rules:

- All controls in a control family are applicable unless a documented exclusion rationale is accepted by the AGB.
- Critical controls (as designated in SAF-001) may never be excluded from an FCA.
- A TDA may exclude control families outside its named domain scope.
- Exclusions are documented in the Scope Matrix with a rationale code and AGB acknowledgment.

**8.3.3 Scope Matrix Production**
The Scope Matrix is a structured table mapping every SAF-001 control to one of three dispositions:

| Disposition     | Meaning                                                                  |
|-----------------|--------------------------------------------------------------------------|
| In Scope        | Control will be assessed; evidence is required                           |
| Excluded        | Control is not applicable to this system or assessment type; documented  |
| Deferred        | Control is in scope but will be assessed in a subsequent phase or cycle  |

Deferred controls are permissible only in a CAR or TDA. An FCA may not defer any critical control.

### 8.4 Gate Criteria

- System Boundary Document approved by LA and acknowledged by AOR
- Scope Matrix complete; all exclusions carry AGB acknowledgment
- Assessment Journal updated with Phase 1 completion entry

### 8.5 Outputs

| Output                  | Owner  | Disposition                             |
|-------------------------|--------|-----------------------------------------|
| System Boundary Document| LA/AOR | Appended to Assessment Record           |
| Scope Matrix            | LA     | Normative; governs all subsequent phases|

---

## 9. Phase 2 — Evidence Planning

### 9.1 Purpose

Phase 2 produces an Evidence Plan that specifies, for each in-scope control, what evidence types are expected, what sources will be queried, what collection methods will be used, and what constitutes sufficient evidence to proceed to scoring.

### 9.2 Entry Criteria

- Scope Matrix finalized (Phase 1 gate passed)

### 9.3 Procedures

**9.3.1 Evidence Type Classification**
For each in-scope control, the Lead Auditor assigns one or more expected evidence types from the SAF Evidence Type Registry:

| Evidence Type Code | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| ART-LOG            | System-generated log artifact (audit trail, event log, enforcement trace)   |
| ART-CFG            | Configuration artifact (policy file, runtime config, feature flag manifest) |
| ART-CODE           | Source code artifact (policy implementation, enforcement logic)             |
| ART-SPEC           | Architectural specification (design document, data flow diagram, RFC)       |
| ART-CERT           | Third-party certification or attestation (SOC 2, ISO 27001, cryptographic proof)|
| ART-TEST           | Test result artifact (automated test output, penetration test report)       |
| OBS-LIVE           | Live observation (real-time demonstration of control behavior)              |
| OBS-REPLAY         | Deterministic replay observation (reproduced control behavior from recorded state)|
| INT-AOR            | Interview — Assessed Organization Representative                            |
| INT-ENG            | Interview — Engineer or technical implementer                               |
| INT-OPS            | Interview — Operator or administrator                                       |

A single control may require multiple evidence types. Where SAF-001 specifies minimum evidence types for a control, the Evidence Plan MUST include those types. Additional types may be added at the Lead Auditor's discretion.

**9.3.2 Evidence Source Mapping**
For each expected evidence type, the Evidence Plan identifies:
- The named system or subsystem that is the evidence source
- The collection method (automated export, manual retrieval, API pull, screen capture, interview)
- The responsible party for collection (EC, AOR, TS)
- The expected format and schema of the artifact

**9.3.3 Evidence Sufficiency Criteria**
For each control, the Evidence Plan defines what constitutes sufficient evidence to enter Phase 4 scoring. Sufficiency criteria MUST be defined before collection begins. They MUST NOT be modified during or after collection in response to what was or was not found.

**9.3.4 Evidence Plan Review**
The Evidence Plan is reviewed by the Peer Reviewer (for FCA) before collection begins. The Peer Reviewer confirms that the planned evidence is plausibly sufficient to assess each control. Disagreements are resolved by the Lead Auditor with written rationale.

### 9.4 Gate Criteria

- Evidence Plan complete for all in-scope controls
- Peer Reviewer acknowledgment recorded (FCA)
- Evidence Plan locked; no modifications permitted after Phase 3 begins without LA written authorization and Assessment Journal entry

### 9.5 Outputs

| Output           | Owner  | Disposition                                 |
|------------------|--------|---------------------------------------------|
| Evidence Plan    | LA     | Locked at phase gate; appended to record    |

---

## 10. Phase 3 — Evidence Collection

### 10.1 Purpose

Phase 3 executes the Evidence Plan. All evidence artifacts are collected, registered, authenticated, and stored in the Evidence Repository.

### 10.2 Entry Criteria

- Evidence Plan locked (Phase 2 gate passed)
- Assessed Organization has confirmed access availability for collection window

### 10.3 Procedures

**10.3.1 Evidence Repository Initialization**
The Evidence Coordinator initializes the Evidence Repository prior to any collection activity. The repository is a tamper-evident, access-logged storage system. Every artifact added to the repository receives:
- A unique Evidence Item Identifier (EII)
- A collection timestamp
- A collector identity record
- A source system record
- A hash of the artifact at time of ingestion
- A chain-of-custody log entry

**10.3.2 Artifact Collection**
Evidence is collected according to the Evidence Plan. For each artifact:
- The collector records the collection method, source system, and any deviations from the plan
- If an artifact cannot be collected as planned, the deviation is logged with a reason code and escalated to the Lead Auditor
- The Lead Auditor determines whether the deviation requires a plan amendment or constitutes a gap finding

**10.3.3 Interview Conduct**
Interviews are conducted by the Lead Auditor or a designated Technical Specialist. All interviews:
- Are recorded or transcribed with the interviewee's consent; if consent is declined, detailed notes are taken
- Follow a structured question set derived from the Evidence Plan
- Do not permit leading questions that suggest desired answers
- Are reviewed by the interviewee for factual accuracy before being admitted to the Evidence Repository

**10.3.4 Live Observation**
Where OBS-LIVE evidence is required, observations are conducted in the presence of at least two members of the assessment team. The observation is documented with:
- The system state at observation time
- The specific control behavior observed
- The outcome and any anomalies
- The identity of all observers

**10.3.5 Evidence Gaps**
An evidence gap is recorded when a planned evidence item cannot be collected. Gaps are classified:

| Gap Classification | Definition                                                                 |
|--------------------|----------------------------------------------------------------------------|
| Resolved           | Alternative evidence collected; plan amended with LA authorization         |
| Open — Minor       | Evidence is missing but other artifacts plausibly satisfy the control      |
| Open — Major       | Evidence is missing and no alternative satisfies the control               |
| Open — Critical    | Evidence is missing for a critical control; assessment suspension triggered |

A critical gap triggers mandatory assessment suspension. The Lead Auditor notifies the AGB within forty-eight hours. The assessment may not resume until either the evidence is provided or the AGB authorizes a path forward.

**10.3.6 Evidence Collection Closure**
The Evidence Coordinator produces an Evidence Collection Summary upon completion. The summary lists all collected artifacts by EII, all gaps by classification, and confirms that the repository hash registry is complete.

### 10.4 Gate Criteria

- Evidence Collection Summary approved by Lead Auditor
- No unresolved critical gaps
- All collected artifacts registered in Evidence Repository with complete chain-of-custody records

### 10.5 Outputs

| Output                       | Owner  | Disposition                              |
|------------------------------|--------|------------------------------------------|
| Evidence Repository          | EC     | Tamper-evident; retained per Section 25  |
| Evidence Collection Summary  | EC     | Appended to Assessment Record            |

---

## 11. Phase 4 — Control Mapping

### 11.1 Purpose

Phase 4 maps each collected evidence item to the in-scope controls it is intended to satisfy. Mapping is a distinct intellectual activity from scoring. A mapper identifies relevant relationships. A scorer evaluates sufficiency.

### 11.2 Entry Criteria

- Evidence Collection Summary approved (Phase 3 gate passed)
- No unresolved critical gaps in evidence

### 11.3 Procedures

**11.3.1 Evidence-to-Control Matrix Construction**
For each in-scope control, the Lead Auditor (or a designated Technical Specialist, subject to LA ratification) constructs an Evidence-to-Control Matrix entry containing:
- The control identifier (from SAF-001)
- The control description
- The list of EIIs mapped to this control
- For each EII: the mapping rationale (a written statement explaining how the artifact addresses the control)
- A preliminary mapping completeness assessment: Full, Partial, or Insufficient

**11.3.2 Mapping Rationale Standards**
A mapping rationale MUST:
- Reference specific, named elements of the artifact (not general artifact descriptions)
- Identify what aspect of the control the artifact satisfies and why
- Acknowledge what aspects of the control are not addressed by the artifact, if any
- Be written such that a technically qualified third party could reproduce the mapping conclusion from the artifact alone

A mapping rationale MUST NOT:
- Assert that a control is satisfied based on the reputation or trust of the Assessed Organization
- Treat an uncorroborated claim as a satisfying artifact
- Defer to the Assessed Organization's own assessment of compliance

**11.3.3 Conflicting Evidence**
Where evidence items conflict (one artifact suggests control satisfaction, another suggests deficiency), the Lead Auditor MUST:
- Document both artifacts and the conflict
- Investigate the source of the conflict
- Record a resolution rationale
- Default to the less favorable interpretation in the absence of a clear resolution

**11.3.4 Unmapped Evidence**
Evidence items not mapped to any control are flagged as Unmapped. Unmapped items do not contribute to scoring. Their existence is noted in the mapping summary. If an unmapped item appears relevant to a control not in scope, the Lead Auditor notes this for potential future scope expansion.

### 11.4 Gate Criteria

- Evidence-to-Control Matrix complete for all in-scope controls
- All mapping rationales reviewed by Lead Auditor
- Conflicting evidence resolved and documented
- Matrix locked; no amendments permitted after Phase 5 begins without LA authorization

### 11.5 Outputs

| Output                         | Owner  | Disposition                            |
|--------------------------------|--------|----------------------------------------|
| Evidence-to-Control Matrix     | LA/TS  | Normative input to Phase 5; locked     |

---

## 12. Phase 5 — Scoring

### 12.1 Purpose

Phase 5 evaluates the mapped evidence against SAF-001 scoring criteria and produces a finding for each in-scope control. The finding is the primary unit of assurance output.

### 12.2 Entry Criteria

- Evidence-to-Control Matrix locked (Phase 4 gate passed)

### 12.3 Scoring Scale

SAF uses a four-level finding scale. The Lead Auditor assigns one finding level per control.

| Finding Level | Code | Definition                                                                                                      |
|---------------|------|-----------------------------------------------------------------------------------------------------------------|
| Conformant    | C    | Evidence is sufficient, complete, and credible. The control is satisfied as specified in SAF-001.               |
| Partially Conformant | PC | Evidence satisfies core control requirements but gaps exist in secondary requirements or coverage.         |
| Non-Conformant| NC   | Evidence is insufficient, absent, or contradicts control requirements. The control is not satisfied.            |
| Not Applicable| NA   | The control is documented as excluded in the Scope Matrix with AGB acknowledgment.                              |

A control with a Partially Conformant finding is treated as non-conformant for certification purposes unless the Lead Auditor documents a reasoned exception and the Peer Reviewer concurs.

### 12.4 Scoring Procedure

**12.4.1 Per-Control Scoring**
For each in-scope control, the Lead Auditor:
1. Reviews the Evidence-to-Control Matrix entry
2. Applies the SAF-001 scoring criteria for that control
3. Records a finding level with a written scoring rationale
4. Identifies whether the finding is on a critical control

**12.4.2 Scoring Rationale Standards**
A scoring rationale MUST:
- Reference specific EIIs that informed the finding
- Apply the SAF-001 criteria explicitly, citing the relevant criterion
- State what is and is not satisfied
- For NC findings: state specifically what evidence is absent or contradictory

**12.4.3 Critical Control Findings**
A Non-Conformant finding on any critical control (as designated in SAF-001) automatically generates a Critical Finding Flag. An assessment with any unresolved Critical Finding Flag cannot pass certification (Section 16).

**12.4.4 Aggregate Assessment Score**
Upon completion of per-control scoring, the Lead Auditor computes the aggregate assessment score:

| Metric                         | Calculation                                                     |
|--------------------------------|-----------------------------------------------------------------|
| Controls in Scope              | Total count of controls with disposition "In Scope"             |
| Conformant Controls            | Count of controls with finding level C                          |
| Partially Conformant Controls  | Count of controls with finding level PC                         |
| Non-Conformant Controls        | Count of controls with finding level NC                         |
| Critical Finding Flags         | Count of NC findings on critical controls                       |
| Conformance Rate               | (Conformant / Controls in Scope) x 100                         |
| Critical Pass Status           | Pass if Critical Finding Flags = 0; Fail otherwise              |

Certification thresholds are defined in SAF-001. SAF-002 applies those thresholds; it does not define them.

### 12.5 Gate Criteria

- All in-scope controls scored with documented rationale
- Aggregate assessment score computed
- Scoring workbook reviewed by Peer Reviewer (FCA)
- Scoring locked; no amendments permitted after Phase 6 begins without AGB authorization

### 12.6 Outputs

| Output                    | Owner  | Disposition                            |
|---------------------------|--------|----------------------------------------|
| Scoring Workbook          | LA     | Normative; locked at gate              |
| Aggregate Assessment Score| LA     | Appended to Assessment Record          |

---

## 13. Phase 6 — Findings Review

### 13.1 Purpose

Phase 6 is the adversarial review phase. The Lead Auditor's scoring conclusions are tested by the Peer Reviewer (FCA) and by a structured response opportunity for the Assessed Organization. This phase protects the integrity of findings by subjecting them to challenge before finalization.

### 13.2 Entry Criteria

- Scoring Workbook locked (Phase 5 gate passed)

### 13.3 Procedures

**13.3.1 Peer Reviewer Challenge (FCA)**
The Peer Reviewer receives the Scoring Workbook and Evidence-to-Control Matrix. The Peer Reviewer has five business days to submit a formal Challenge Log. Each challenge entry must:
- Identify the specific control and finding level challenged
- State the grounds for challenge (rationale error, evidence misapplication, missing evidence, etc.)
- Propose an alternative finding level with rationale

The Lead Auditor must respond to each challenge entry within three business days. Responses are:
- Accepted: finding level changed; amendment logged
- Accepted in Part: finding level refined; rationale amended
- Rejected: original finding maintained; counter-rationale provided

Unresolved challenges are escalated to the AGB for binding resolution.

**13.3.2 Assessed Organization Response**
The Assessed Organization receives a Preliminary Findings Report containing all Non-Conformant and Partially Conformant findings. The AOR has five business days to submit a Factual Accuracy Response. The Factual Accuracy Response may:
- Identify factual errors in the evidence record (incorrect artifact, misquoted configuration, etc.)
- Provide supplemental evidence that was inadvertently omitted from collection
- Clarify technical context that may have affected evidence interpretation

The Factual Accuracy Response MUST NOT:
- Argue that a non-conformant finding should be upgraded without providing new evidence
- Assert that findings are unfair or commercially damaging as grounds for amendment
- Introduce post-assessment remediation as evidence of pre-assessment control satisfaction

The Lead Auditor reviews all factual accuracy submissions. Findings are amended only where the submission demonstrates a genuine factual error or provides legitimately overlooked evidence. Amendments are logged with rationale.

**13.3.3 Findings Finalization**
Upon completion of the challenge and response cycle, the Lead Auditor produces the Final Findings Register. The register is immutable after finalization.

### 13.4 Gate Criteria

- All Peer Reviewer challenges resolved (FCA)
- AOR Factual Accuracy Response reviewed and dispositioned
- Final Findings Register produced and signed by Lead Auditor
- Final Findings Register acknowledged by Peer Reviewer (FCA)

### 13.5 Outputs

| Output                        | Owner  | Disposition                             |
|-------------------------------|--------|-----------------------------------------|
| Peer Reviewer Challenge Log   | PR     | Appended to Assessment Record           |
| AOR Factual Accuracy Response | AOR    | Appended to Assessment Record           |
| Final Findings Register       | LA     | Immutable; normative for Phases 7-9     |

---

## 14. Phase 7 — Risk & Remediation

### 14.1 Purpose

Phase 7 contextualizes non-conformant findings within a risk framework and produces a Remediation Roadmap that the Assessed Organization can act upon. Risk contextualization does not alter findings. It informs the certification decision and the Assessed Organization's remediation priorities.

### 14.2 Entry Criteria

- Final Findings Register finalized (Phase 6 gate passed)

### 14.3 Procedures

**14.3.1 Risk Classification**
For each Non-Conformant or Partially Conformant finding, the Lead Auditor assigns a risk classification:

| Risk Level    | Criteria                                                                                           |
|---------------|----------------------------------------------------------------------------------------------------|
| Critical      | Finding on a critical control; direct constitutional violation; no compensating controls present   |
| High          | Finding on a significant control; meaningful sovereignty exposure; compensating controls inadequate|
| Medium        | Finding on a standard control; bounded sovereignty exposure; some compensating controls present    |
| Low           | Finding on a supplementary control; minimal sovereignty impact; effective compensating controls    |

Risk classification is advisory. It does not change the finding level. A Low-risk NC finding is still an NC finding for certification purposes.

**14.3.2 Compensating Control Assessment**
Where the Assessed Organization has presented evidence of a compensating control (an alternative mechanism that partially mitigates the effect of a non-conformant control), the Lead Auditor evaluates:
- Whether the compensating control is documented and deliberately implemented
- Whether the compensating control is verifiable
- Whether the compensating control materially reduces the sovereignty risk associated with the NC finding
- The compensating control's own reliability and audit trail

Compensating controls may reduce risk classification. They do not remove NC findings.

**14.3.3 Remediation Roadmap**
For each NC or PC finding, the Lead Auditor produces a Remediation Guidance entry specifying:
- The control identifier and finding level
- The root cause of the non-conformance (missing evidence, absent capability, policy gap, configuration defect, etc.)
- The remediation approach recommended to achieve conformance
- The recommended remediation priority (aligned with risk classification)
- The evidence type that would be required to demonstrate remediation in an RVA

The Remediation Roadmap is a guidance document. Acceptance of remediation guidance by the Assessed Organization does not constitute a waiver of findings or an extension of certification.

### 14.4 Gate Criteria

- All NC and PC findings assigned a risk classification
- Remediation Roadmap produced for all NC findings
- Risk & Remediation Report signed by Lead Auditor

### 14.5 Outputs

| Output                       | Owner  | Disposition                             |
|------------------------------|--------|-----------------------------------------|
| Risk & Remediation Report    | LA     | Provided to AOR; appended to record     |

---

## 15. Phase 8 — Report Production

### 15.1 Purpose

Phase 8 assembles all assessment outputs into a structured Assessment Report that constitutes the formal record of the assessment and the basis for the certification decision.

### 15.2 Entry Criteria

- Risk & Remediation Report produced (Phase 7 gate passed)

### 15.3 Report Structure

The SAF Assessment Report MUST contain the following sections in the following order:

| Section | Title                                  | Source                               |
|---------|----------------------------------------|--------------------------------------|
| 1       | Executive Summary                      | LA authored                          |
| 2       | Assessment Charter Reference           | Phase 0 output                       |
| 3       | System Boundary Definition             | Phase 1 output                       |
| 4       | Scope Matrix                           | Phase 1 output                       |
| 5       | Evidence Plan Summary                  | Phase 2 output                       |
| 6       | Evidence Collection Summary            | Phase 3 output                       |
| 7       | Evidence-to-Control Matrix Summary     | Phase 4 output                       |
| 8       | Final Findings Register                | Phase 6 output                       |
| 9       | Aggregate Assessment Score             | Phase 5 output                       |
| 10      | Risk & Remediation Report              | Phase 7 output                       |
| 11      | Lead Auditor Declaration               | LA authored                          |
| 12      | Peer Reviewer Declaration              | PR authored (FCA)                    |
| 13      | Assessed Organization Acknowledgment   | AOR authored                         |
| 14      | Standard Disclaimer                    | Per Section 24                       |
| 15      | Appendices                             | Supporting artifacts as needed       |

**15.3.1 Executive Summary**
The Executive Summary is authored by the Lead Auditor. It MUST include:
- The assessment type and SAF-001 version applied
- The system under assessment and its declared boundary
- The assessment window
- The aggregate conformance rate and critical pass status
- A plain-language summary of significant findings
- The Lead Auditor's certification recommendation

The Executive Summary MUST NOT contain marketing language, favorable impressions not grounded in findings, or qualifications not supported by the findings record.

**15.3.2 Lead Auditor Declaration**
The Lead Auditor Declaration is a signed attestation that:
- The assessment was conducted in accordance with SAF-002
- All conflicts of interest were disclosed
- All findings are based on evidence in the Evidence Repository
- The certification recommendation reflects the findings and the auditor's independent professional judgment

**15.3.3 Report Review**
The draft report is provided to the Peer Reviewer and the AOR simultaneously. The Peer Reviewer has three business days to confirm that the report accurately reflects the findings. The AOR has three business days to submit an Organizational Response Statement for inclusion as an appendix. The Organizational Response Statement does not alter findings; it provides the Assessed Organization's formal position.

### 15.4 Gate Criteria

- All required report sections present and complete
- Peer Reviewer confirmation received (FCA)
- AOR Organizational Response Statement received or deadline passed
- Report signed by Lead Auditor
- Report transmitted to Certification Authority

### 15.5 Outputs

| Output                          | Owner  | Disposition                                |
|---------------------------------|--------|--------------------------------------------|
| SAF Assessment Report (Draft)   | LA     | Internal; not disclosed before CA review   |
| SAF Assessment Report (Final)   | LA/CA  | Normative; subject to disclosure per Sec 23|

---

## 16. Phase 9 — Certification Decision

### 16.1 Purpose

Phase 9 is the adjudication phase. The Certification Authority reviews the Assessment Report independently and makes the certification decision. The Lead Auditor has made a recommendation; the CA makes the decision.

### 16.2 Entry Criteria

- Final Assessment Report received by Certification Authority (Phase 8 gate passed)

### 16.3 Procedures

**16.3.1 CA Independent Review**
The Certification Authority conducts an independent review of the Assessment Report. The CA review is not a re-execution of the assessment. It is a procedural and substantive review to confirm:
- The assessment was conducted in accordance with SAF-002
- The findings are supported by the evidence record
- The certification recommendation is consistent with the findings and SAF-001 thresholds
- No conflicts of interest, procedural violations, or integrity concerns are present

**16.3.2 Certification Outcomes**
The Certification Authority issues one of three decisions:

| Decision                            | Conditions                                                                    |
|-------------------------------------|-------------------------------------------------------------------------------|
| Certified — Full Conformance        | Conformance rate meets or exceeds SAF-001 threshold; no critical finding flags |
| Certified — Conditional Conformance | Conformance rate meets threshold; some NC findings on non-critical controls; Remediation Roadmap accepted; CAR schedule established |
| Not Certified                       | Critical finding flags present; or conformance rate below threshold; or material procedural violations found |

**16.3.3 Certificate of Conformance**
Upon a Certified decision, the CA issues a SAF Certificate of Conformance containing:
- Certificate identifier
- Assessed organization and system name
- Assessment type (FCA or TDA-scoped)
- SAF-001 version applied
- Certification level (Full or Conditional)
- Certification date
- Expiry date (as defined by SAF-001 for each certification level)
- Any conditions or obligations attached (Conditional Conformance)
- CA signature and seal

**16.3.4 Certification Denial**
A Not Certified decision is issued in writing by the CA with:
- Reference to the specific findings that precluded certification
- Statement of the remediation path available (RVA upon demonstrated remediation)
- The period after which a new FCA may be initiated if remediation cannot be demonstrated

**16.3.5 CA Decision Independence**
The CA MUST NOT communicate with the Assessed Organization about the certification decision before the decision is issued. The CA MUST NOT accept representations from the Assessed Organization that contradict the Assessment Report after the report has been finalized.

### 16.4 Gate Criteria

- CA independent review completed
- Certification decision issued in writing
- Certificate of Conformance issued (if certified) or Denial issued (if not certified)

### 16.5 Outputs

| Output                         | Owner  | Disposition                             |
|--------------------------------|--------|-----------------------------------------|
| Certification Decision Letter  | CA     | Transmitted to AOR and LA; public per Sec 23 |
| Certificate of Conformance     | CA     | Issued to AOR; registered in SAF registry |
| Certification Denial Letter    | CA     | Transmitted to AOR and LA; confidential |

---

## 17. Phase 10 — Follow-Up / Continuous Assurance

### 17.1 Purpose

Phase 10 is not a single event. It is the ongoing assurance obligation that persists for the life of the certificate. Certification does not terminate the assurance relationship; it transforms it from assessment mode to monitoring mode.

### 17.2 Entry Criteria

- Certification Decision issued (Phase 9 gate passed)
- Continuous Assurance Agreement negotiated and executed (for Certified outcomes)

### 17.3 Procedures

**17.3.1 Continuous Assurance Agreement**
For Certified outcomes, the Assessed Organization and the Assurance Organization execute a Continuous Assurance Agreement (CAA) defining:
- The frequency of Continuous Assurance Reviews (CAR)
- The evidence types required for each CAR
- The drift materiality threshold that triggers a mandatory TDA or FCA
- The notification obligations of the Assessed Organization when material changes occur
- The consequences of failing to fulfill CAA obligations

**17.3.2 Material Change Notification**
The Assessed Organization MUST notify the Lead Auditor within ten business days of any material change to the certified system, including:
- Architectural changes affecting the system boundary
- Changes to consent management, data processing, or sovereignty enforcement mechanisms
- Significant changes to third-party dependencies within scope
- Security incidents that may affect control integrity

**17.3.3 Continuous Assurance Review Execution**
CARs are executed as defined in Section 4.3. Each CAR produces a Continuous Assurance Status Report. A green status (no material drift) maintains the certificate. A yellow status (minor drift) may be noted without action if the Assurance Monitor and LA concur. A red status (material drift) triggers a mandatory TDA or FCA and may result in certificate suspension.

**17.3.4 Certificate Suspension**
The CA may suspend a certificate pending remediation or re-assessment if:
- A CAR produces a red status
- A material change notification reveals a change inconsistent with certified control state
- Evidence of control failure emerges through external reporting
- The Assessed Organization fails to fulfill CAA obligations

A suspended certificate is marked in the SAF registry. Suspension does not invalidate historical certification; it signals that the current control state has not been re-confirmed.

**17.3.5 Certificate Expiry and Renewal**
Upon certificate expiry, the Assessed Organization must initiate a new FCA to maintain certified status. A lapsed certificate does not imply non-conformance; it implies that current conformance has not been assessed.

### 17.4 Outputs

| Output                              | Owner     | Disposition                              |
|-------------------------------------|-----------|------------------------------------------|
| Continuous Assurance Agreement      | LA/CA/AOR | Retained in Assessment Record            |
| Continuous Assurance Status Reports | AM        | Retained; triggers escalation if red     |
| Material Change Notifications       | AOR       | Logged; triggers LA review               |

---

## 18. Assessment Timeline

The following timelines are normative for Full Constitutional Assessments. Timelines for other assessment types are defined in the Assessment Charter and MUST be proportionate to scope.

| Phase                          | Duration (Business Days) | Notes                                                      |
|--------------------------------|--------------------------|------------------------------------------------------------|
| Phase 0 — Intake               | 5 – 10                   | Includes COI review; Charter negotiation may extend this   |
| Phase 1 — Scope Definition     | 5 – 10                   | Depends on system complexity                               |
| Phase 2 — Evidence Planning    | 5 – 10                   | Peer Review adds 3 days                                    |
| Phase 3 — Evidence Collection  | 10 – 30                  | Highly variable; access delays extend this                 |
| Phase 4 — Control Mapping      | 5 – 15                   | Proportional to evidence volume                            |
| Phase 5 — Scoring              | 5 – 10                   | Peer Review adds 5 days                                    |
| Phase 6 — Findings Review      | 10 – 15                  | Challenge + AOR response cycles                            |
| Phase 7 — Risk & Remediation   | 3 – 5                    | Shorter for low-finding assessments                        |
| Phase 8 — Report Production    | 5 – 10                   | Includes AOR response window                               |
| Phase 9 — Certification Decision| 10 – 15                 | CA independent review                                      |
| **Total (FCA)**                | **63 – 130**             | **Approximately 3 – 6 months for complex systems**         |

Timeline deviations require Lead Auditor documentation in the Assessment Journal. Extensions caused by Assessed Organization access delays are not counted against auditor timelines.

---

## 19. Assessment Deliverables

The following deliverables are produced across all phases of a Full Constitutional Assessment. Each deliverable has a defined owner, format requirement, and retention period.

| Deliverable                          | Phase | Owner  | Format                 | Retention   |
|--------------------------------------|-------|--------|------------------------|-------------|
| Conflict of Interest Declaration     | 0     | LA     | Signed document        | 7 years     |
| Assessment Charter                   | 0     | LA/CA  | Signed contract        | 7 years     |
| Preliminary System Description       | 0     | AOR    | Free-form document     | 3 years     |
| System Boundary Document             | 1     | LA/AOR | Structured document    | 7 years     |
| Scope Matrix                         | 1     | LA     | Structured table       | 7 years     |
| Evidence Plan                        | 2     | LA     | Structured document    | 7 years     |
| Evidence Repository                  | 3     | EC     | Tamper-evident archive | 7 years     |
| Evidence Collection Summary          | 3     | EC     | Structured document    | 7 years     |
| Evidence-to-Control Matrix           | 4     | LA     | Structured table       | 7 years     |
| Scoring Workbook                     | 5     | LA     | Structured document    | 7 years     |
| Peer Reviewer Challenge Log          | 6     | PR     | Structured document    | 7 years     |
| AOR Factual Accuracy Response        | 6     | AOR    | Document               | 7 years     |
| Final Findings Register              | 6     | LA     | Immutable document     | 10 years    |
| Risk & Remediation Report            | 7     | LA     | Structured document    | 7 years     |
| SAF Assessment Report                | 8     | LA     | Formal report          | 10 years    |
| AOR Organizational Response          | 8     | AOR    | Document               | 10 years    |
| Certification Decision Letter        | 9     | CA     | Signed letter          | 10 years    |
| Certificate of Conformance           | 9     | CA     | Signed certificate     | 10 years    |
| Continuous Assurance Agreement       | 10    | LA/CA  | Signed contract        | Active + 5  |
| Continuous Assurance Status Reports  | 10    | AM     | Structured reports     | 5 years     |

---

## 20. Assessment Ethics

All participants in an SAF assessment are bound by the following ethical obligations. These obligations are non-negotiable and apply regardless of commercial relationships, time pressure, or organizational hierarchy.

**20.1 Truthfulness**
Every finding MUST reflect the auditor's genuine professional judgment based on evidence. An auditor who records a finding they do not believe to be accurate is committing an integrity violation. Findings favorable to the Assessed Organization must be as rigorously supported as adverse findings.

**20.2 Independence of Judgment**
The Lead Auditor's professional judgment is not subject to direction by the Assessed Organization, the Assessing Organization's commercial leadership, or any party with a financial interest in the outcome. Commercial arrangements do not purchase findings. An auditor who adjusts findings in response to commercial pressure is committing an integrity violation.

**20.3 Completeness**
An auditor MUST NOT selectively omit evidence that is adverse to a preferred conclusion. The evidence record MUST reflect all collected artifacts, including those that complicate or contradict the overall finding.

**20.4 Transparency of Limitation**
Where an auditor lacks expertise to evaluate specific evidence, they MUST engage a Technical Specialist or disclose the limitation. An auditor MUST NOT represent confidence they do not hold.

**20.5 Confidentiality**
Assessment artifacts, findings, and reports are confidential unless the Assessed Organization authorizes disclosure (Section 23). Auditors MUST NOT discuss assessment contents with parties outside the assessment team without authorization.

**20.6 Non-Retaliation**
An auditor who identifies a finding adverse to a commercially significant Assessed Organization MUST NOT soften or suppress that finding in response to actual or anticipated retaliation. Threats of retaliation MUST be reported to the AGB immediately.

**20.7 Disclosure of Errors**
If an auditor discovers an error in a prior finding after that finding has been finalized, they MUST disclose it to the Lead Auditor and the AGB. Concealment of known errors is an integrity violation regardless of whether the error favors or disfavors the Assessed Organization.

---

## 21. Independence Requirements

Independence is the structural foundation of SAF assurance integrity. Without independence, an assessment produces a confirmation, not an assurance. SAF-002 defines independence requirements at three levels.

### 21.1 Organizational Independence

The Assessing Organization MUST be structurally separate from the Assessed Organization. Structural separation means:
- No common ownership above fifty percent
- No common board members
- No common operational management
- No existing or pending contractual relationship that creates financial dependency between the assessing and assessed organizations in the context of the assessed system

### 21.2 Individual Independence

The Lead Auditor and Peer Reviewer MUST satisfy all of the following:
- No employment relationship with the Assessed Organization within the preceding twenty-four months
- No consultancy, advisory, or board relationship with the Assessed Organization within the preceding twenty-four months
- No financial interest (equity, royalty, or contingent payment) in the Assessed Organization or the outcome of the assessment
- No personal relationship that a reasonable observer would consider likely to impair objectivity
- No prior authorship or co-authorship of the system architecture under assessment

Independence declarations are self-reported and verified by the AGB. False declarations constitute grounds for disqualification and referral.

### 21.3 Certification Authority Independence

The Certification Authority MUST be:
- Organizationally independent of both the Assessing Organization and the Assessed Organization
- Not the same entity as the Assessing Organization under any circumstance
- Without a commercial interest in the outcome of any specific certification decision

The CA's compensation MUST be structured in a manner that does not create incentives to certify or deny at rates above or below the actual conformance distribution.

### 21.4 Independence Waivers

Independence waivers are not permitted for Lead Auditor or Certification Authority roles. For Technical Specialist roles, limited independence waivers may be authorized by the AGB where no independent specialist is available and the scope of the TS engagement is strictly limited to areas without advisory history. Waivers are documented in the Assessment Record.

---

## 22. Quality Assurance

### 22.1 Internal Quality Review

The Assessing Organization MUST maintain an internal quality review function that is separate from the assessment team. The internal quality reviewer:
- Reviews Phase gate documentation for completeness and procedural compliance
- Does not review findings for substantive correctness (which is the Peer Reviewer's role)
- Produces a Quality Compliance Certificate appended to each Assessment Report

### 22.2 External Quality Audit

The SAF program undergoes external quality audit annually. The external auditor:
- Selects a representative sample of completed assessments
- Reviews documentation, evidence integrity, and procedural compliance
- Reports findings to the AGB
- Does not re-score individual controls or overturn findings; it reviews process quality

### 22.3 Auditor Qualification Standards

Lead Auditors must demonstrate:
- Demonstrated competence in the technical domains covered by the assessment (assessed through qualification review, not self-attestation)
- Familiarity with SAF-001 and SAF-002 (assessed through a formal methodology examination administered by the AGB)
- At least two years of experience in assurance, audit, or compliance in a technically relevant domain
- Completion of at least two prior assessments as a Peer Reviewer or Technical Specialist under a qualified Lead Auditor

### 22.4 Methodology Maintenance

SAF-002 is reviewed annually by the AGB. Amendments are version-controlled. Amendments affecting scoring criteria, certification thresholds, or evidence type definitions require a sixty-day public comment period before taking effect. Minor procedural amendments require AGB majority approval without public comment.

---

## 23. Public Disclosure Rules

### 23.1 Default Confidentiality

Assessment findings, the Assessment Report, and all assessment artifacts are confidential by default. Disclosure requires written authorization from the Assessed Organization.

### 23.2 Mandatory Public Registry Entries

Regardless of confidentiality preferences, the following information is entered into the public SAF Registry upon certification decision:
- Assessed organization name
- System name and version assessed
- Assessment type
- Certification outcome (Certified — Full, Certified — Conditional, or Not Certified)
- Certification date and expiry date (if certified)
- SAF-001 version applied
- Certificate identifier (if certified)
- Certificate suspension status (if suspended)

The registry does not publish findings, scores, or evidence.

### 23.3 Voluntary Public Disclosure

An Assessed Organization may authorize the publication of its Assessment Report, in whole or in part. Partial disclosures MUST NOT be misleading. A partial disclosure that omits material adverse findings without disclosure of omission is prohibited. The Assessing Organization has the right to refuse publication of a partial report that would be misleading.

### 23.4 Regulatory Disclosure

Where applicable law or regulation requires disclosure of assessment findings to a regulatory authority, such disclosure is mandatory and does not require the Assessed Organization's authorization. The Lead Auditor MUST consult legal counsel before making any regulatory disclosure.

### 23.5 Disclosure upon Certificate Suspension or Revocation

When a certificate is suspended or revoked, the public registry is updated within five business days. The Assessed Organization is notified before the registry is updated. The reason for suspension is recorded in the registry in summary form (e.g., "material drift identified" or "CAA obligations not fulfilled"), not in specific finding terms.

---

## 24. Standard Disclaimer

The following disclaimer MUST appear verbatim in every SAF Assessment Report, Certificate of Conformance, and any public summary derived from an SAF assessment:

---

> **SAF Assurance Disclaimer**
>
> This assessment was conducted in accordance with the Sovereignty Assurance Framework (SAF) methodology, as defined in SAF-002 v1.0, against the controls defined in the SAF-001 Constitutional Control Catalog version referenced herein.
>
> An SAF assessment attests to the state of the assessed system as observed during the assessment window defined in the Assessment Charter. It does not constitute a guarantee of future performance, a warranty of fitness for any particular purpose, or a representation that the system will continue to satisfy SAF controls following the assessment window.
>
> This assessment reflects the professional judgment of the Lead Auditor based on evidence available and collected during the assessment period. No assurance can be absolute. Evidence may be incomplete, artifacts may not reflect production behavior, and systems change after assessment.
>
> Certification under SAF is not equivalent to certification under any other regulatory, legal, or standards framework unless explicitly stated. Users of certified systems remain responsible for their own compliance obligations under applicable law.
>
> AOC Assurance and the Certification Authority make no representations regarding the commercial suitability, security, or reliability of the assessed system beyond what is expressly stated in the findings.

---

## 25. Assessment Records

### 25.1 Record Completeness

The Assessment Record for each SAF assessment MUST be complete, tamper-evident, and sufficient to allow a qualified third party to independently reconstruct the basis for every finding and the certification decision. An incomplete Assessment Record is a procedural defect that may invalidate the assessment.

### 25.2 Retention

Retention periods are defined in Section 19. The Assessment Record is retained by the Assessing Organization and a copy is retained by the Certification Authority. The Assessed Organization receives a copy of the Assessment Report and the Certificate of Conformance (if issued). The Assessed Organization does not have custody of the Evidence Repository or the internal assessment workpapers.

### 25.3 Evidence Repository Integrity

The Evidence Repository is maintained in a tamper-evident format. The hash registry generated at collection time (Section 10.3.1) is retained separately from the repository. Any discrepancy between the hash registry and the repository contents at time of review is a repository integrity violation and MUST be reported to the AGB.

### 25.4 Record Requests

Assessment Records may be requested by:
- The Assessed Organization (for their own report and certificate only)
- The AGB (for quality audit purposes)
- A regulatory authority with lawful authority to demand disclosure
- A successor Lead Auditor conducting a subsequent assessment

Record requests from other parties require AGB authorization and, where applicable, the consent of the Assessed Organization.

---

## 26. Example Assessment Workflow

The following example illustrates the SAF assessment workflow for a mid-complexity system undergoing its first Full Constitutional Assessment.

**System: AcmeCorp Consent Platform v2.3**
**Assessment Type: Full Constitutional Assessment**
**Lead Auditor: Independent Auditor A**
**Peer Reviewer: Independent Auditor B**

---

**Week 1-2 — Phase 0 (Intake)**
Auditor A submits a Conflict of Interest Declaration to the AGB. AGB confirms no conflicts. AcmeCorp submits a Preliminary System Description describing their consent management platform. The Assessment Charter is negotiated and executed by Auditor A, AcmeCorp's CTO, and the Certification Authority. The Assessment Journal is initiated.

**Week 3-4 — Phase 1 (Scope Definition)**
Auditor A and AcmeCorp's Engineering Lead produce the System Boundary Document, defining the platform's consent management engine, policy enforcement layer, and audit trail system as in scope. The data analytics module is excluded with documented rationale (it operates on derived, post-consent data with no sovereign capability claim). The Scope Matrix is produced. AGB acknowledges the exclusion.

**Week 5 — Phase 2 (Evidence Planning)**
The Evidence Plan is produced, specifying fifty-three SAF-001 controls as in scope. For each control, expected evidence types, sources, and collection methods are documented. Auditor B reviews the Evidence Plan and raises two clarifications; Auditor A amends the plan. The plan is locked.

**Weeks 6-9 — Phase 3 (Evidence Collection)**
Evidence collection proceeds over four weeks. The Evidence Coordinator registers forty-one artifacts in the Evidence Repository. Three planned artifacts are unavailable: one configuration export was not generated before the collection window closed. Auditor A classifies this as an Open — Minor gap. Interviews are conducted with four AcmeCorp engineers. Two live observations are conducted for real-time consent enforcement behavior.

**Weeks 10-11 — Phase 4 (Control Mapping)**
Auditor A maps artifacts to controls. Forty-nine controls receive full evidence coverage. Four controls receive partial coverage due to the gap and two thin artifacts. Conflicting evidence is found for one control (a log artifact suggests enforcement is not applied consistently); Auditor A investigates and resolves the conflict through a follow-up interview.

**Weeks 12-13 — Phase 5 (Scoring)**
Scoring is completed. Forty-six controls are scored Conformant, four Partially Conformant, and three Non-Conformant. No Non-Conformant findings are on critical controls. The conformance rate is 86.8%. Auditor B reviews the Scoring Workbook and raises one substantive challenge.

**Week 14 — Phase 6 (Findings Review)**
Auditor B challenges the finding on Control SAF-001-C-17, arguing that the evidence is sufficient for a PC rather than NC finding. Auditor A reviews the challenge and agrees in part; the finding is amended to PC. AcmeCorp submits a Factual Accuracy Response correcting an artifact misidentification; Auditor A updates the evidence record. The Final Findings Register is produced.

**Week 15 — Phase 7 (Risk & Remediation)**
Risk classifications are assigned. The three NC findings are assessed as Medium risk; the five PC findings include two Medium and three Low risk. Compensating controls are documented for two findings. The Remediation Roadmap is produced.

**Weeks 16-17 — Phase 8 (Report Production)**
The Assessment Report is drafted and reviewed by Auditor B. AcmeCorp submits an Organizational Response Statement noting their intent to remediate the three NC findings within sixty days. The report is finalized and transmitted to the Certification Authority.

**Weeks 18-19 — Phase 9 (Certification Decision)**
The CA completes its independent review. The conformance rate (88.7% after the Phase 6 amendment) meets the SAF-001 threshold. No critical finding flags are present. The CA issues a Certified — Conditional Conformance decision, with the condition that AcmeCorp undergoes an RVA on the three NC findings within ninety days. A Certificate of Conformance is issued. The SAF Registry is updated.

**Ongoing — Phase 10 (Continuous Assurance)**
A Continuous Assurance Agreement is executed. Quarterly CARs are scheduled. AcmeCorp completes remediation within sixty days and requests an RVA, which confirms conformance on all three previously NC controls. The certificate condition is lifted.

---

## 27. Assessment Maturity Model

The SAF Assessment Maturity Model describes the evolution of an organization's posture toward SAF assessments over time. Maturity does not affect the findings of any single assessment; it describes the systemic readiness of the assessed organization to demonstrate and sustain sovereign control.

| Maturity Level | Name            | Characteristics                                                                                              |
|----------------|-----------------|--------------------------------------------------------------------------------------------------------------|
| 1              | Unprepared      | No prior SAF engagement; evidence is ad hoc; controls are undocumented; assessment requires significant AOR support effort |
| 2              | Aware           | Prior TDA or FCA completed; key controls documented; some evidence generation is systematic; gaps are expected |
| 3              | Managed         | All SAF-001 controls mapped to internal policies; evidence generation is systematized; CAR obligations fulfilled consistently |
| 4              | Integrated      | Control state is continuously monitored; evidence is automatically collected and retained; material change notification is proactive |
| 5              | Constitutional  | Sovereignty is architecturally embedded; controls are enforced, not just documented; assessment evidence is generated as a byproduct of normal operations |

Maturity Level 5 organizations generate assessment evidence as a structural consequence of how they build and operate systems. Their sovereignty is not declared in marketing materials. It is demonstrable in their audit logs, their enforcement traces, and their configuration exports. This is the constitutional standard toward which the SAF program is oriented.

---

## 28. Minimum Viable SAF Audit

A Minimum Viable SAF Audit (MVSA) is a streamlined assessment procedure for use when a full FCA is not yet warranted or feasible. It is not a certification pathway. It produces a Baseline Readiness Report that can inform a subsequent FCA.

### 28.1 Scope

An MVSA covers only the SAF-001 critical controls. All other controls are deferred. The MVSA is used to:
- Assess a system's readiness to undertake a full FCA
- Identify blocking deficiencies before committing to a full assessment
- Provide a baseline for systems early in their sovereign capability development

### 28.2 Procedure Simplifications

An MVSA may simplify Phase procedures as follows:

| Phase           | Simplification Permitted                                                         |
|-----------------|----------------------------------------------------------------------------------|
| Phase 0         | Abbreviated Assessment Charter; no separate COI process required if LA is pre-cleared |
| Phase 1         | Scope Matrix limited to critical controls only                                   |
| Phase 2         | Evidence Plan may be abbreviated; sufficiency criteria still required            |
| Phase 3         | Documentary evidence only; live observation not required for MVSA                |
| Phase 4         | Mapping rationales may be abbreviated                                            |
| Phase 5         | Scoring required; Peer Review not required                                       |
| Phase 6         | AOR Factual Accuracy Response required; Peer Reviewer Challenge not required     |
| Phase 7         | Risk classification required for NC findings only                                |
| Phase 8         | Baseline Readiness Report replaces full Assessment Report                        |
| Phase 9         | No certification decision; Baseline Readiness Report transmitted to AOR only    |
| Phase 10        | No CAA; AOR may request FCA follow-up                                            |

### 28.3 Output

An MVSA produces a Baseline Readiness Report that specifies:
- The critical controls assessed and their findings
- The key evidence gaps identified
- The estimated remediation effort required to achieve FCA readiness
- A recommended FCA initiation timeline

The Baseline Readiness Report is not a certification and MUST NOT be represented as one.

---

## 29. First Commercial Package

The AOC SAF First Commercial Package (FCP) is the entry point for organizations seeking their first SAF engagement. It bundles the MVSA with a structured FCA readiness consultation, producing a clear path to initial certification.

### 29.1 Package Components

| Component                              | Description                                                          |
|----------------------------------------|----------------------------------------------------------------------|
| Minimum Viable SAF Audit               | Per Section 28; covers all critical controls                         |
| Baseline Readiness Report              | Delivered within thirty business days of Assessment Charter execution|
| Readiness Consultation                 | Two facilitated sessions with the Lead Auditor to review findings and remediation paths |
| FCA Roadmap                            | A structured timeline and workplan for initiating a Full Constitutional Assessment |
| Evidence Generation Guidance           | Guidance on establishing systematic evidence generation practices    |

### 29.2 Package Terms

The FCP is scoped to a single system within a defined boundary. The package does not include the FCA itself. Following the FCP, the Assessed Organization may initiate an FCA at the standard rate with a credit for the FCP Evidence Plan work already completed.

### 29.3 Package Integrity

The FCP is an assurance product, not a consulting product. The Lead Auditor executing the FCP MUST be capable of conducting the subsequent FCA with independence intact. FCP findings are not softened to improve the commercial relationship. The FCP is designed to surface deficiencies, not to affirm readiness that does not exist.

---

## 30. Constitutional Closing Statement

The Sovereignty Assurance Framework exists because sovereignty, as a technical and operational property of systems, cannot be established by declaration. It must be established by evidence, evaluated by independent judgment, and sustained by ongoing practice.

SAF-002 is the procedural expression of that constitutional commitment. It defines not merely how assessments are conducted, but why each procedural requirement exists: to protect the integrity of findings, to protect assessed organizations from unfair process, to protect users from false assurance, and to protect the auditor's professional judgment from commercial and institutional pressure.

Every phase of the SAF assessment lifecycle reflects a choice to prioritize constitutional rigor over procedural convenience. The independence requirements exist because proximity corrupts objectivity. The evidence sufficiency requirements exist because claims are not facts. The adversarial review phase exists because conclusions benefit from challenge. The public registry exists because assurance that is invisible provides no accountability. The continuous assurance obligation exists because control environments change and one-time certification does not constitute permanent sovereignty.

SAF-002 will be maintained, challenged, and improved. Every amendment must answer the same question that governs every assessment: does this change make it more likely that evidence of sovereignty will be distinguished from claims of sovereignty?

Sovereignty cannot be claimed. Sovereignty must be evidenced. This document is how that evidence is found.

---

*SAF-002 — Assessment Methodology v1.0*
*Issued by: AOC Assurance Working Group*
*Effective: 2026-06-07*
*Next scheduled review: 2027-06-07*
*Governing body: AOC Assurance Governance Board*
*Constitutional basis: SAF-001 — Constitutional Control Catalog*
