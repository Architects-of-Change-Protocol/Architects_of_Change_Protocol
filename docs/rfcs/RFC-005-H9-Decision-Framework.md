# RFC-005-H9: Decision Framework

**Number:** RFC-005-H9  
**Title:** Decision Framework  
**Status:** Draft  
**Parent:** RFC-005 Claims Framework  
**Depends on:** RFC-004, RFC-005, RFC-005-H1, RFC-005-H2, RFC-005-H3, RFC-005-H4, RFC-005-H5, RFC-005-H8  
**Extends:** RFC-005-H8 Authority Model

---

## Abstract

RFC-005-H9 defines the Decision Framework for the Architects of Change (AOC) Protocol. A decision is a protocol-recognized outcome produced under recognized authority. Decisions are the final constitutional layer of the AOC protocol stack. They consume authority, produce consequences, and alter recognized protocol state.

This RFC defines what a decision is, how decisions are produced, how decisions are recognized, how decisions are challenged, how decisions are traced, and how decisions alter protocol reality.

Evidence describes reality. Claims interpret reality. Standing evaluates reality. Capabilities enable action. Authority legitimizes action. Decisions create recognized outcomes.

---

## 1. Executive Summary

### 1.1 What Is the Decision Framework?

The Decision Framework defines how protocol-recognized outcomes are created within the AOC Protocol. A decision is not a recommendation, not a review, not a claim, and not an opinion. A decision is a protocol-recognized outcome produced under recognized authority.

Decisions occupy the final layer of the AOC constitutional stack:

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
Decision
```

Decision is where protocol state changes. Every layer below decision exists to support, constrain, legitimize, and trace the decisions that alter protocol reality.

### 1.2 What Decisions Do

Decisions consume authority. When a recognized authority acts within the bounds of its recognized scope, it produces a decision. That consumption is the legitimizing act. Authority that is never exercised produces no decision. Authority exercised outside its scope produces a claimed decision, not a recognized decision.

Decisions produce consequences. A recognized decision may grant capability, revoke authority, issue a credential, approve a proposal, reject a request, recognize standing, invalidate standing, suspend delegation, or alter any other element of protocol state for which the decision-making authority has recognized scope.

Decisions alter recognized protocol state. Protocol state is not altered by claims about decisions, by recommendations resembling decisions, or by informal acts that resemble decisions. Only recognized decisions alter recognized protocol state.

### 1.3 The Central Concept: Recognized Decision

The Decision Framework elevates the **Recognized Decision** to a first-class protocol concept. The protocol MUST distinguish:

- **Claimed Decision** — an outcome asserted by any party without protocol recognition;
- **Recognized Decision** — a protocol-recognized outcome produced under recognized authority.

A Claimed Decision describes what someone says happened. A Recognized Decision describes what the protocol acknowledges as having happened.

Only Recognized Decisions alter protocol reality.

---

## 2. Problem Statement

### 2.1 Conflation of Outcomes

Many systems conflate distinct outcome types and treat them as equivalent. The AOC Protocol requires clear distinction among:

| Outcome Type | Meaning |
|---|---|
| Recommendation | A suggestion that a decision-maker consider an action. |
| Review | An evaluation of a subject, artifact, proposal, or action. |
| Approval | A positive finding from an authorized reviewer or governance body. |
| Decision | A protocol-recognized outcome produced under recognized authority. |

These are not equivalent. A recommendation is not a decision. A review is not a decision. An approval may be a precondition for a decision, but it is not itself the decision. A decision is a distinct protocol act with distinct preconditions, authority requirements, traceability obligations, and consequences.

### 2.2 Examples of Conflation

The following examples illustrate how conflation occurs and why it is dangerous:

| Scenario | Conflation Risk |
|---|---|
| An AI system recommends a vendor for approval | The recommendation may be mistakenly treated as the approval |
| A manager reviews a proposal | The review may be mistakenly treated as authorization to proceed |
| A committee votes on a motion | The vote may not constitute a recognized decision without quorum, authority, and governance compliance |
| A department head informally approves expenditure | The informal act may not constitute an authorized financial decision |
| An automated policy engine flags a compliance violation | The flag may not constitute a recognized enforcement decision |

In each case, without a clear decision framework, actors may proceed as if a protocol-recognized outcome has been produced when none has. This creates unauthorized state changes, audit failures, accountability gaps, and protocol integrity violations.

### 2.3 Why Decisions Must Be Recognized

Recognition is the mechanism by which the protocol distinguishes consequential acts from procedural acts. Without recognition:

- Any party could claim to have made a decision;
- Consequences could follow from unverified claims;
- Authority chains could be bypassed;
- Governance could be circumvented;
- Traceability would collapse;
- Challenges would have no stable target.

Recognition ensures that only decisions produced under verified authority, within verified scope, under verified policy, with verified governance compliance alter protocol state.

---

## 3. Decision Definition

### 3.1 Canonical Definition

A **Decision** is:

> A protocol-recognized outcome produced under recognized authority.

This definition has three elements:

1. **Protocol-recognized** — the protocol must acknowledge the outcome as valid, not merely the actor;
2. **Outcome** — the decision produces a result distinct from the process of producing it;
3. **Recognized authority** — the actor must hold authority recognized by the protocol for the relevant scope and type.

### 3.2 What a Decision Is Not

A decision is not evidence. Evidence records facts. A decision produces protocol-recognized outcomes from the consumption of authority over evidence, claims, and standing.

A decision is not a claim. A claim asserts a fact about a subject. A decision produces a binding protocol outcome. Claims may support decisions, but claims are not decisions.

A decision is not standing. Standing interprets evidence and claims into a current protocol state. Standing may be a precondition for a decision, but standing is not itself a decision.

A decision is not a capability. Capability enables action within policy bounds. A decision is the exercise of that capability under authority to produce a protocol-recognized outcome.

A decision is not authority. Authority legitimizes action. A decision consumes authority. Authority not exercised through a recognized decision does not alter protocol state.

A decision is not a recommendation, review, opinion, audit finding, policy annotation, or advisory output.

### 3.3 Why Decisions Exist

Decisions exist because protocol state must change through recognized, bounded, traceable, accountable acts.

Without decisions, protocol state could only ever reflect evidence and claims about reality. Evidence and claims describe what has been observed or asserted. Decisions extend protocol reality by creating new outcomes: a credential that did not exist, a capability that was not previously held, a standing that has been revoked, an authority that has been delegated.

Decisions are the mechanism by which recognized actors, acting under recognized authority, within recognized scope, under recognized policy, create new protocol facts.

---

## 4. Decision Principles

The following canonical principles govern all decisions within the AOC Protocol.

### P-D1: Legitimacy

A decision is legitimate only when it is produced under recognized authority within recognized scope. An actor may have recognized authority in one scope and not another. A decision made outside recognized scope is a Claimed Decision, not a Recognized Decision.

### P-D2: Traceability

Every decision MUST be traceable. Traceability means that any authorized party can reconstruct who made the decision, under what authority, under what policy, under what governance, with what evidence, with what standing, and with what capability.

### P-D3: Accountability

Every decision MUST be attributable to a recognized actor. Anonymous decisions are not recognized. Decisions made by unrecognized agents, unrecognized systems, or unrecognized processes are Claimed Decisions.

### P-D4: Reviewability

Every Recognized Decision MUST be reviewable by authorized governance or audit parties. Reviewability does not mean every decision will be reviewed. It means review is possible, traceable, and supported by preserved records.

### P-D5: Challengeability

Every Recognized Decision MUST be challengeable through recognized processes. No decision is unchallengeable. Finality does not preclude challenge; it defines the effect of the decision until a challenge succeeds.

### P-D6: Governance

Every Recognized Decision MUST comply with applicable governance. Governance defines who may decide, under what conditions, subject to what review, at what quorum, within what policy bounds. A decision that bypasses governance is not recognized.

### P-D7: Finality

A Recognized Decision has finality within its scope until it is reversed, superseded, expired, or suspended by a recognized process. Finality means the decision produces consequences. Finality does not mean the decision is eternal.

### P-D8: Boundedness

A decision is bounded by the scope of the authority that produced it. A decision MUST NOT produce consequences outside the recognized scope of the authority exercised. Decisions with overbroad consequences exceed authority and constitute governance violations.

---

## 5. Decision Types

The following canonical decision types are recognized by the AOC Protocol. Future types are extensible provided they preserve Decision Framework semantics.

| Decision Type | Meaning |
|---|---|
| Approval Decision | Recognition that a subject, proposal, action, or outcome satisfies the requirements for which approval authority was exercised. |
| Denial Decision | Recognition that a subject, proposal, action, or outcome does not satisfy requirements and is not approved under the relevant authority. |
| Issuance Decision | Recognition that a credential, certificate, identifier, token, or protocol artifact has been created and is now recognized as valid. |
| Recognition Decision | Recognition that a subject, standing state, authority, capability, or protocol fact is acknowledged as existing within the protocol. |
| Governance Decision | Recognition of a governance act: policy creation, policy change, governance body formation, quorum result, mandate authorization, or governance instrument adoption. |
| Financial Decision | Recognition that a financial obligation, payment, budget, allocation, or financial instrument has been authorized and is protocol-recognized. |
| Operational Decision | Recognition that an operational action, service activation, process initiation, execution authorization, or operational change has been authorized. |
| Verification Decision | Recognition that a verification process has been completed and its finding is protocol-recognized. |
| Delegation Decision | Recognition that authority, standing, capability, or responsibility has been delegated to a specified principal within a specified scope. |
| AI-Assisted Decision | A decision in which an AI agent's output was consumed as input to the authority act. The human or recognized authority that exercised the decision remains accountable. AI output is not itself a Recognized Decision. |

### 5.1 AI-Assisted Decisions

AI-Assisted Decisions require explicit traceability of the AI agent's contribution, the authority that consumed it, and the human or recognized actor who exercised final authority. An AI agent's recommendation, ranking, risk score, or analysis MUST be treated as an input to the decision process, not as the decision.

A Recognized Decision consuming AI input MUST record:

- the AI agent's identity and standing;
- the nature and scope of AI contribution;
- the human or recognized authority that exercised the decision;
- the basis for authority trust over the AI output.

---

## 6. Decision Subject Model

A decision always applies to a **DecisionSubject**. Every Recognized Decision MUST identify its subject.

Canonical subjects include:

| Subject | Examples |
|---|---|
| Person | Individual, employee, professional, contractor |
| Organization | Enterprise, nonprofit, government agency |
| Project | Funded project, delivery initiative, program |
| Vendor | Supplier, contractor, service provider |
| Agent | AI agent, autonomous system, delegated service |
| Service | Platform service, API, integration, runtime |
| Team | Department, division, working group |
| Governance Body | Board, committee, review panel, standards body |
| Credential | Certificate, attestation, claim artifact |
| Policy Object | Policy instrument, governance instrument, rule set |

A decision without an identified subject is not conformant.

---

## 7. Decision Scope

A decision applies within a defined **DecisionScope**. Scope defines the boundaries within which the decision produces consequences. A decision MUST NOT produce consequences outside its recognized scope.

Canonical scope dimensions include:

| Scope Dimension | Meaning |
|---|---|
| Project | Decision applies within a specific project or program |
| Organization | Decision applies within a specific organization or enterprise |
| Jurisdiction | Decision applies within a legal, regulatory, or governance jurisdiction |
| Capability | Decision applies to a specific capability or capability class |
| Authority | Decision applies within a defined authority chain |
| Financial | Decision applies within a financial limit, budget category, or fiscal period |
| Operational | Decision applies to a specific operation, service, or execution context |
| Time | Decision applies within a defined time window or expires at a defined point |
| Risk | Decision applies within a defined risk tier or risk category |

A decision that does not specify scope is ambiguous and SHOULD be treated as a Claimed Decision pending scope clarification.

---

## 8. Decision Preconditions

A valid Recognized Decision may require the satisfaction of preconditions before it is recognized. Unsatisfied preconditions produce a Claimed Decision, not a Recognized Decision.

### 8.1 Evidence Preconditions

A decision MAY require specific evidence. The evidence MUST exist in a recognized state within the AOC evidence layer (RFC-004). Evidence that is expired, revoked, challenged, or invalidated MAY disqualify a decision from recognition unless policy explicitly permits the decision under those conditions.

### 8.2 Claims Preconditions

A decision MAY require specific claims to exist, to be verified, and to be in an active standing state as defined by RFC-005. Claims that are not attested, not verified, expired, challenged, or superseded MAY disqualify a decision.

### 8.3 Standing Preconditions

A decision MAY require the DecisionSubject or decision-making actor to hold specific standing as defined by RFC-005-H1 and RFC-005-H2. Standing that is Insufficient, Invalid, Suspended, Challenged, or Expired MAY disqualify a decision.

### 8.4 Capability Preconditions

A decision MAY require the decision-making actor to hold recognized capability as defined by RFC-005-H4. Capability not held, not current, or outside recognized scope disqualifies the decision from recognition.

### 8.5 Authority Preconditions

A decision MUST be produced by a recognized authority as defined by RFC-005-H8. The authority MUST be recognized, current, in scope, and not suspended, challenged, or revoked. A decision produced by an unrecognized, out-of-scope, or revoked authority is a Claimed Decision.

### 8.6 Policy Preconditions

A decision MUST comply with applicable policy. Policy defines eligibility rules, required approvals, scope limits, temporal bounds, risk controls, and governance requirements. A decision that violates policy is not recognized.

### 8.7 Governance Preconditions

A decision MAY require governance approval, quorum, review completion, or governance body authorization as defined by RFC-005-H3. Governance preconditions ensure that decisions requiring collective authorization are not made by individual actors alone.

### 8.8 Review Preconditions

A decision MAY require completion of a review process. A review is not itself a decision; it is a precondition that must be satisfied before the decision-making authority may act.

### 8.9 Verification Preconditions

A decision MAY require that specific verification processes have been completed. Verification confirms that evidence, claims, identities, or conditions meet policy requirements before the decision is recognized.

### 8.10 Dependency Requirements

Preconditions create a dependency structure that MUST be satisfied and MUST be traceable. A Recognized Decision MUST record which preconditions were required, which were satisfied, and how they were verified. Missing or unsatisfied preconditions MUST cause the decision to remain in a pending or disqualified state until remediated.

---

## 9. Decision Lifecycle

A decision progresses through recognized lifecycle states. The protocol MUST track and expose the current lifecycle state of every decision.

| State | Meaning |
|---|---|
| Proposed | A decision has been initiated but preconditions have not been evaluated. |
| Pending Review | A decision is awaiting required review completion before authority may act. |
| Pending Authority | Preconditions are satisfied; the decision is awaiting exercise of authority. |
| Recognized | The decision has been produced under recognized authority and is protocol-recognized. |
| Executed | The consequences of the decision have been operationally realized. |
| Challenged | The decision is subject to an active challenge that may affect its recognition or consequences. |
| Suspended | The decision's consequences are temporarily suspended pending challenge resolution, review, or governance action. |
| Reversed | The decision has been reversed by a recognized process and its consequences have been unwound to the extent protocol permits. |
| Superseded | The decision has been replaced by a later Recognized Decision that takes precedence. |
| Archived | The decision is no longer active and has been preserved in the Decision Registry for audit and lineage purposes. |

### 9.1 Lifecycle Transition Rules

Lifecycle transitions MUST be produced by authorized governance or decision events. Manual state edits are not conformant. The following canonical transitions apply:

| From | To | Trigger |
|---|---|---|
| Proposed | Pending Review | Review requirement identified |
| Proposed | Pending Authority | No review required; preconditions met |
| Pending Review | Pending Authority | Review completed |
| Pending Authority | Recognized | Authority exercised |
| Recognized | Executed | Operational execution completed |
| Recognized | Challenged | Challenge raised by recognized party |
| Challenged | Recognized | Challenge rejected |
| Challenged | Suspended | Challenge triggers suspension |
| Suspended | Recognized | Suspension lifted |
| Suspended | Reversed | Challenge succeeds and reversal authorized |
| Recognized | Superseded | Later decision supersedes this one |
| Recognized | Archived | Governance archives the decision |
| Reversed | Archived | Reversed decision preserved for lineage |

---

## 10. Decision Eligibility

Not every actor may produce a Recognized Decision. Eligibility is determined by the intersection of authority, standing, capabilities, governance, and policy.

### 10.1 Authority Requirements

A decision-making actor MUST hold recognized authority for the decision type and scope. Authority is defined by RFC-005-H8. Authority MUST be current, recognized, in scope, and not suspended or revoked.

### 10.2 Standing Requirements

A decision-making actor MAY be required to hold a minimum standing level for the relevant context as evaluated by RFC-005-H2. Actors with Invalid, Suspended, or Challenged standing in a relevant context MAY be disqualified from producing Recognized Decisions.

### 10.3 Capability Requirements

A decision-making actor MUST hold the capability to perform the decision type within the relevant scope as defined by RFC-005-H4. Capability requirements are policy-defined and scope-bounded.

### 10.4 Governance Approval

A decision requiring collective authorization MUST satisfy governance approval requirements as defined by RFC-005-H3. Governance approval may require quorum, sequential review, parallel approval, or delegated authorization.

### 10.5 Review Completion

A decision that requires review MUST have that review completed and the review finding recorded before the decision is recognized. Incomplete reviews leave the decision in Pending Review state.

### 10.6 Policy Compliance

All eligibility requirements MUST be satisfied under the version of policy applicable at the time the decision is produced. Policy changes that occur after a decision is produced do not retroactively disqualify it unless the governing policy explicitly provides for retroactive effect.

---

## 11. Decision Traceability

Decision Traceability is the mandatory property that every Recognized Decision must be fully reconstructable from its recorded inputs, preconditions, authority exercise, and governance compliance.

Traceability is defined in relation to RFC-005-H1, which establishes the foundational traceability semantics for the protocol stack. The Decision Framework extends those semantics to the decision layer.

### 11.1 Mandatory Traceability Questions

Every Recognized Decision MUST provide recorded answers to the following questions:

| Question | Traceability Requirement |
|---|---|
| Who made it? | Identity of the authority actor or governance body |
| Why? | The decision purpose, context, and policy basis |
| Under what authority? | Reference to the recognized authority record (RFC-005-H8) |
| Under what policy? | Reference to the applicable policy version |
| Under what governance? | Reference to governance compliance record (RFC-005-H3) |
| What evidence supported it? | References to evidence records (RFC-004) |
| What standing supported it? | References to standing snapshots (RFC-005-H1, RFC-005-H2) |
| What capability enabled it? | References to capability records (RFC-005-H4) |
| What preconditions were satisfied? | Record of each required precondition and its satisfaction |
| What consequences did it produce? | Record of the protocol state changes resulting from the decision |

### 11.2 Traceability Records

Traceability records MUST be immutable once a decision is Recognized. Amendments to traceability records MUST produce new records, not overwrite existing records. Historical traceability MUST be preserved for audit, challenge, reversal, and lineage purposes.

### 11.3 Audit Accessibility

Traceability records MUST be accessible to authorized audit parties. Decisions whose traceability records are inaccessible, incomplete, or unverifiable MUST be flagged as non-conformant and MAY be suspended pending remediation.

---

## 12. Decision Dependency Graph

The Decision Dependency Graph represents all relationships necessary to produce, trace, audit, and propagate a Recognized Decision.

```text
[Evidence] ---- supports ----> [Claim]
    |                              |
    | has_authority                | evaluated_for
    v                              v
[Authority] <---- legitimizes -- [Standing Snapshot]
    |                              |
    | constrained_by               | consumed_by
    v                              v
[Policy] -----------------> [Capability]
    |                              |
    | governs                      | enables
    v                              v
[Governance] ------------> [Decision]
    |                          |      |
    | records                  |      | produces
    v                          v      v
[Challenge] <-- challenges  [Decision Registry]
                                      |
                                      | traces
                                      v
                               [Protocol State Change]
```

All edges in the dependency graph MUST be traceable. A decision node without traceable edges to evidence, claims, authority, standing, capability, policy, and governance is not conformant.

### 12.1 Graph Properties

The Decision Dependency Graph MUST support:

- **Reverse traceability**: Which evidence, claims, authority, standing, capabilities, policies, and governance acts produced this decision?
- **Forward traceability**: Which protocol state changes, consequences, and downstream decisions were produced by this decision?
- **Challenge propagation**: Which challenges affect the inputs to this decision, and how does challenge state affect decision recognition?
- **Reversal propagation**: If a decision is reversed, which downstream consequences must be unwound?

---

## 13. Decision Recognition

Recognition is the protocol mechanism that distinguishes a Recognized Decision from a Claimed Decision. Recognition is not automatic. It is the result of protocol-compliant production under recognized authority.

### 13.1 Recognized Decision

A **Recognized Decision** is a decision that:

1. Was produced by a recognized authority within recognized scope;
2. Satisfied all required preconditions under applicable policy;
3. Complied with applicable governance requirements;
4. Has been recorded in the Decision Registry with complete traceability;
5. Has not been reversed, suspended, or invalidated.

### 13.2 Claimed Decision

A **Claimed Decision** is an outcome asserted by any party as a decision without meeting the requirements for recognition. A Claimed Decision:

- Does NOT alter protocol state;
- Does NOT produce recognized consequences;
- MUST NOT be treated as a Recognized Decision by downstream processes;
- MAY be challenged, investigated, or disregarded without requiring a formal challenge process.

### 13.3 Recognition Requirements

The protocol MUST apply the following recognition requirements to every decision:

| Requirement | Condition |
|---|---|
| Authority verified | The actor holds recognized authority for this decision type and scope |
| Preconditions satisfied | All required preconditions are recorded as satisfied |
| Governance compliant | Governance requirements are met and recorded |
| Policy compliant | The decision complies with applicable policy |
| Registry recorded | The decision is recorded in the Decision Registry |
| Traceability complete | All mandatory traceability fields are present |

A decision that fails any recognition requirement MUST remain in a non-Recognized state until the deficiency is remediated or the decision is disqualified.

### 13.4 Recognition vs. Execution

Recognition establishes that the decision exists as a protocol fact. Execution realizes the consequences of that fact operationally. A Recognized Decision that has not yet been Executed is still a Recognized Decision; it simply has not yet produced its operational effects.

---

## 14. Decision Execution

**Execution** is the operational realization of a Recognized Decision.

### 14.1 Decision ≠ Execution

Decision and Execution are distinct protocol acts. A Recognized Decision establishes the protocol-recognized outcome. Execution delivers the operational effect of that outcome.

Examples:

| Decision | Execution |
|---|---|
| Vendor approved | Vendor onboarded to procurement system |
| Capability granted | System access provisioned |
| Credential issued | Credential delivered to subject |
| Payment authorized | Payment transmitted |
| Delegation recognized | Delegation record activated |

### 14.2 Execution Requirements

Execution MUST reference the Recognized Decision it realizes. Execution without a corresponding Recognized Decision is unauthorized action. Unauthorized execution MUST be treated as a protocol violation.

### 14.3 Partial Execution

A decision may be partially executed if operational constraints prevent full execution at a single point in time. Partial execution MUST be recorded. Incomplete execution does not alter the recognition state of the decision itself.

### 14.4 Execution Failure

If execution fails after a decision is Recognized, the decision remains Recognized. The execution failure MUST be recorded and MUST trigger a defined remediation, retry, or escalation process as specified by policy.

---

## 15. Decision Finality

### 15.1 Finality Defined

A Recognized Decision has **finality** when it produces binding protocol consequences within its recognized scope. Finality begins at recognition. A decision in Recognized or Executed state has finality.

### 15.2 Can Decisions Be Reversed?

A Recognized Decision MAY be reversed by a recognized reversal process. Reversal requires:

- recognized authority to reverse;
- a reversal ground recognized by policy or governance;
- a record of the reversal in the Decision Registry;
- propagation of reversal to protocol state changes produced by the original decision to the extent policy permits.

Reversal does not erase history. The original decision and its reversal are both preserved in the Decision Registry.

### 15.3 Can Decisions Be Superseded?

A Recognized Decision MAY be superseded by a later Recognized Decision. Supersession replaces the effect of the earlier decision with the effect of the later decision. Supersession requires:

- the later decision to be Recognized under applicable authority;
- the supersession to be recorded in the Decision Registry;
- the earlier decision to be transitioned to Superseded state.

### 15.4 Can Decisions Expire?

A Recognized Decision MAY expire if it was made with a defined temporal scope. Expiration is a lifecycle transition, not a reversal. An expired decision retains its recognition history but its consequences are no longer active.

### 15.5 Can Decisions Be Challenged?

Every Recognized Decision MUST be challengeable. Challenge does not automatically invalidate a decision. Challenge triggers a challenge process as defined in Section 16. The decision remains in Recognized state during challenge unless suspension is authorized.

---

## 16. Decision Challenges

### 16.1 Challenge Definition

A **DecisionChallenge** is a formal protocol act by a recognized party disputing the validity, basis, authority, policy compliance, governance compliance, or consequences of a Recognized Decision.

### 16.2 Who May Challenge

Challenges MAY be raised by:

- the DecisionSubject;
- affected parties with recognized interest;
- authorized governance bodies;
- authorized auditors;
- policy-recognized reviewers;
- parties with recognized authority over the decision type.

Anonymous challenges are not recognized. A challenge MUST be attributable to a recognized actor.

### 16.3 Grounds for Challenge

A challenge may be raised on any of the following grounds:

| Ground | Description |
|---|---|
| Authority | The decision-making actor did not hold recognized authority |
| Scope | The decision exceeded the recognized scope of the authority exercised |
| Policy | The decision violated applicable policy |
| Evidence | The evidence supporting the decision was invalid, expired, or insufficient |
| Standing | The standing relied upon was Invalid, Expired, or Challenged |
| Capability | The capability exercised was not held or was out of scope |
| Governance | The required governance approval was not obtained |
| Recognition Process | The recognition process was deficient or bypassed |
| Decision Content | The substance of the decision contains material error |

### 16.4 Challenge Lifecycle

A DecisionChallenge progresses through the following states:

| State | Meaning |
|---|---|
| Raised | Challenge submitted by a recognized party |
| Under Review | Challenge being evaluated by authorized reviewer or governance body |
| Sustained | Challenge upheld; decision consequences affected |
| Rejected | Challenge denied; decision remains Recognized |
| Withdrawn | Challenge withdrawn by the challenging party |

### 16.5 Challenge Effects

A sustained challenge MAY result in:

- suspension of the decision pending remediation;
- reversal of the decision;
- supersession of the decision;
- limitation of the decision's consequences to a narrower scope;
- escalation to a higher governance authority.

A rejected challenge does not alter the decision's Recognized state.

### 16.6 Challenge Governance

Challenge review MUST be performed by a recognized party with authority over the challenge ground. Self-review is not permitted. A decision-making actor MUST NOT serve as the reviewer of a challenge to their own decision.

---

## 17. Decision Governance

Decision Governance defines who governs decisions, who defines decision frameworks, who reviews decisions, who reverses decisions, and who supersedes decisions.

Decision Governance is grounded in RFC-005-H3 Standing Governance and RFC-005-H8 Authority Model. The following governance responsibilities are specific to the decision layer.

### 17.1 Who Governs Decisions?

| Governance Role | Responsibility |
|---|---|
| Protocol Governance | Defines canonical decision types, principles, lifecycle states, recognition requirements, and challenge grounds |
| Domain Governance | Defines domain-specific decision types, precondition requirements, policy constraints, and authority eligibility within a domain |
| Organizational Governance | Defines organizational decision policies, authority assignments, approval chains, and review requirements |
| Regulatory Governance | Defines jurisdiction-specific requirements that decisions must satisfy for legal or regulatory compliance |

### 17.2 Who Defines Decision Frameworks?

Decision framework definition MUST be authorized by Protocol Governance or delegated Domain Governance. Decision frameworks define the rules under which decisions of a given type are produced, recognized, and challenged.

### 17.3 Who Reviews Decisions?

Decision review MUST be performed by an authorized reviewer or governance body with recognized authority over the decision type and scope. Review completion is recorded as a precondition to recognition.

### 17.4 Who Reverses Decisions?

Decision reversal MUST be authorized by a recognized authority with scope over the decision type. Reversal authority MAY be the same authority that produced the decision, a higher authority, or a governance body designated for reversal review.

### 17.5 Who Supersedes Decisions?

Decision supersession requires the producing actor to hold recognized authority for the new decision and for the supersession to comply with applicable policy. Supersession MAY require governance approval if the original decision required governance approval.

---

## 18. Decision Registry

The **Decision Registry** is the canonical store of Recognized Decisions within the protocol.

### 18.1 Purpose

The Decision Registry:

- stores Recognized Decisions with complete traceability records;
- preserves decision lineage including supersession and reversal chains;
- preserves challenge history;
- preserves execution history;
- supports audit, appeal, and historical reconstruction;
- enables forward and reverse traversal of the Decision Dependency Graph.

### 18.2 Registry Requirements

The Decision Registry MUST:

- be append-only or audit-preserving (historical records MUST NOT be deleted or overwritten);
- record each decision with all mandatory traceability fields;
- record lifecycle state transitions with timestamps and authority attribution;
- record challenge records with challenge grounds, reviewer attribution, and outcomes;
- record execution records referencing the Recognized Decision being executed;
- support retrieval of decisions by subject, type, scope, authority, lifecycle state, and time.

### 18.3 Registry Integrity

Decision Registry records MUST be protected against unauthorized modification. A registry record that has been tampered with MUST be treated as non-conformant and MUST trigger investigation and remediation.

### 18.4 Registry Accessibility

The Decision Registry MUST be accessible to authorized audit parties, governance bodies, challenge reviewers, and authorized subjects. Accessibility rules are policy-defined and MUST preserve confidentiality where required by jurisdiction or governance.

---

## 19. Decision Consequences

Decisions create consequences. Consequences are the protocol state changes that result from a Recognized Decision.

### 19.1 Consequence Types

Canonical consequence types include:

| Consequence | Description |
|---|---|
| Grant Capability | A recognized authority grants a capability to a subject |
| Revoke Capability | A recognized authority revokes a capability from a subject |
| Grant Authority | A recognized authority delegates authority to a principal |
| Revoke Authority | A recognized authority revokes authority from a principal |
| Issue Credential | A recognized authority creates a protocol credential for a subject |
| Revoke Credential | A recognized authority revokes a previously issued credential |
| Approve Proposal | A recognized authority approves a proposal, enabling subsequent acts |
| Reject Proposal | A recognized authority denies a proposal |
| Recognize Standing | A recognized authority formally acknowledges a standing state |
| Invalidate Standing | A recognized authority formally invalidates a standing state |
| Approve Payment | A recognized authority authorizes a financial transaction |
| Suspend Delegation | A recognized authority suspends an active delegation |
| Activate Policy | A recognized authority places a policy instrument in active effect |
| Retire Policy | A recognized authority removes a policy instrument from active effect |

### 19.2 State-Changing Behavior

Consequences alter recognized protocol state. Protocol state is the aggregated set of Recognized Decisions, recognized standing states, recognized authority records, recognized capabilities, and recognized credentials that together constitute the protocol's current view of reality.

A consequence MUST be traceable to the Recognized Decision that produced it. An orphan state change — one with no traceable Recognized Decision — is a protocol violation.

### 19.3 Consequence Propagation

When a decision is reversed or superseded, consequences produced by that decision MAY need to be unwound. Consequence propagation defines the rules by which reversal or supersession effects travel downstream to protocol state changes, subsequent decisions, and dependent capabilities.

Consequence propagation MUST be defined by policy. Propagation rules MUST be traceable. Automatic propagation MUST NOT produce unintended state changes without governance awareness.

---

## 20. Decision Guarantees

The Decision Framework provides the following protocol guarantees. These guarantees are normative.

### G-D1: No Decision Without Authority

A Recognized Decision MUST NOT be produced without recognized authority. Any outcome produced without recognized authority is a Claimed Decision and MUST NOT alter protocol state.

### G-D2: No Decision Without Traceability

A Recognized Decision MUST carry complete traceability to its producer, authority, policy, governance, preconditions, and consequences. A decision without complete traceability is not conformant and MUST be flagged for remediation.

### G-D3: No Decision Without Policy

A Recognized Decision MUST comply with applicable policy. Policy-free decisions are not recognized.

### G-D4: No Decision Without Governance

A Recognized Decision that requires governance approval MUST have that approval recorded. Governance-requiring decisions produced without governance approval are Claimed Decisions.

### G-D5: No Hidden Decisions

All Recognized Decisions MUST be recorded in the Decision Registry. Decisions not in the registry are not Recognized Decisions. Protocol state MUST NOT be altered by unregistered decisions.

### G-D6: No Orphan Decisions

Every Recognized Decision MUST trace to recognized evidence, claims, standing, capabilities, and authority. Decisions that cannot be traced to supporting protocol inputs are not conformant.

### G-D7: No Unchallengeable Decisions

Every Recognized Decision MUST be challengeable by recognized parties on recognized grounds. A decision framework that prohibits challenge is not conformant.

### G-D8: No Consequence Without Decision

Protocol state MUST NOT change without a traceable Recognized Decision. Untraced state changes are protocol violations.

---

## 21. Security Implications

The Decision Framework must guard against the following threats.

### 21.1 Fake Decisions

An actor may assert that a decision has been made when no recognized authority has acted. Defense: recognition requirements, Decision Registry mandatory recording, and traceability to recognized authority.

### 21.2 Authority Laundering

An actor may claim authority derived from a compromised, expired, or out-of-scope source to produce decisions that appear legitimate. Defense: authority validation per RFC-005-H8, lineage verification, and governance review of authority chains.

### 21.3 Governance Abuse

A governance body or authority may use governance mechanisms to produce decisions that benefit specific parties at the expense of protocol integrity. Defense: separation of decision-making authority and challenge authority, audit logging, external governance oversight, and challenge rights for affected parties.

### 21.4 Execution Abuse

A party may claim to execute a decision that was never Recognized, or may execute beyond the scope of a Recognized Decision. Defense: execution MUST reference a Recognized Decision; execution records MUST be traceable; unauthorized execution is a protocol violation.

### 21.5 Decision Replay

A previously recognized and superseded or expired decision may be presented as currently valid. Defense: lifecycle state in the Decision Registry; decisions in Superseded, Reversed, or Archived state MUST NOT be treated as producing current consequences.

### 21.6 Decision Forgery

Decision records may be altered to fabricate authority, expand scope, or hide challenge history. Defense: immutable or audit-preserving Decision Registry; integrity protection for registry records; tamper detection.

### 21.7 AI Decision Abuse

An AI agent's output may be treated as a Recognized Decision without human or recognized authority oversight. Defense: AI-Assisted Decisions MUST require recognized authority exercise; AI output is input, not decision; traceability of AI contribution is mandatory.

### 21.8 Policy Bypass

A decision may be produced under one policy while the intended policy requires different preconditions. Defense: policy version MUST be recorded with every decision; governance review of policy assignments.

### 21.9 Recognition Abuse

A party may manipulate the recognition process to cause a Claimed Decision to be treated as Recognized. Defense: recognition is protocol-enforced, not self-asserted; all recognition requirements MUST be independently verifiable.

---

## 22. Decision vs. Authority

Authority and Decision are distinct protocol concepts. The distinction is fundamental.

**Authority legitimizes.** Authority is the protocol-recognized right to act within defined scope under defined policy. Authority exists before it is exercised. Authority is held, not produced.

**Decision consumes legitimacy.** A decision is produced by consuming authority. When an authority exercises its recognized right within scope, it produces a decision. The decision is the output; the authority is the source of legitimacy.

| Concept | Protocol Role |
|---|---|
| Authority: Can Approve | Legitimate right to produce an Approval Decision |
| Decision: Approval Issued | Protocol-recognized outcome produced by exercising approval authority |
| Authority: Can Recognize Standing | Legitimate right to produce a Recognition Decision for standing |
| Decision: Standing Recognized | Protocol-recognized outcome produced by exercising recognition authority |
| Authority: Can Delegate | Legitimate right to produce a Delegation Decision |
| Decision: Delegation Granted | Protocol-recognized outcome produced by exercising delegation authority |

Authority is not self-consuming. An actor may hold authority indefinitely without producing decisions. Authority consumed in producing a decision is exercised, not exhausted (unless policy defines authority limits by exercise count or cumulative effect).

Decisions MUST trace to recognized authority. Authority records MUST be consulted during recognition evaluation.

---

## 23. Decision vs. Capability

Capability and Decision are distinct protocol concepts.

**Capability enables.** Capability is a bounded permission or action surface that a principal holds under policy. Capability defines what actions may be taken. Capability does not produce outcomes.

**Decision produces outcome.** A decision is produced by a recognized authority exercising its legitimacy within recognized scope. The decision produces a protocol-recognized outcome, not merely a permitted action.

| Concept | Protocol Role |
|---|---|
| Capability: Can Issue Credentials | Bounded permission to invoke credential issuance |
| Decision: Credential Issued | Protocol-recognized outcome of exercising issuance authority under recognized authority |
| Capability: Can Approve Vendors | Bounded permission to invoke vendor approval |
| Decision: Vendor Approved | Protocol-recognized outcome of exercising approval authority |

A capability without authority produces permitted actions, not recognized decisions. An authority without capability may be recognized in principle but blocked from acting. Both capability and authority MUST be present for a Recognized Decision to be produced.

---

## 24. Decision vs. Standing

Standing and Decision are distinct protocol concepts.

**Standing describes state.** Standing is the current protocol interpretation of a subject's evidence and claims under context and policy. Standing is computed, not decided.

**Decision changes state.** A decision is a protocol act that alters recognized protocol state. Decisions produce new facts; standing reflects existing facts.

| Concept | Protocol Role |
|---|---|
| Standing: Subject is Verified | Current protocol interpretation of subject's evidence and claims |
| Decision: Standing Recognized | Protocol act by recognized authority acknowledging the standing |
| Standing: Subject is Challenged | Current protocol interpretation reflects active challenge |
| Decision: Standing Suspended | Protocol act by recognized authority altering the subject's standing state |

Standing may be a precondition for a decision. A decision may alter the standing of a subject. But standing does not produce decisions, and decisions do not automatically produce standing without a traceable computation process.

---

## 25. Decision Registry Model

The following canonical concepts are defined by the Decision Framework.

| Concept | Definition |
|---|---|
| Decision | A protocol-recognized outcome produced under recognized authority |
| DecisionType | The canonical category of decision (Approval, Denial, Issuance, Recognition, Governance, Financial, Operational, Verification, Delegation, AI-Assisted) |
| DecisionSubject | The protocol-recognized subject to which the decision applies |
| DecisionScope | The explicit scope within which the decision produces consequences |
| DecisionLifecycle | The sequence of recognized states through which a decision progresses |
| DecisionChallenge | A formal protocol act disputing the validity, basis, or consequences of a Recognized Decision |
| RecognizedDecision | A decision that has satisfied all recognition requirements and is recorded in the Decision Registry |
| ClaimedDecision | An outcome asserted as a decision without meeting recognition requirements |
| DecisionRegistry | The canonical, append-only store of Recognized Decisions with complete traceability records |
| DecisionExecution | The operational realization of a Recognized Decision's consequences |
| DecisionPrecondition | A required condition that must be satisfied before a decision may be recognized |
| DecisionConsequence | A protocol state change produced by a Recognized Decision |
| DecisionDependencyGraph | The directed graph of relationships linking a decision to its evidence, claims, standing, capabilities, authority, policy, governance, challenges, and consequences |

---

## 26. Implementation Guidance

The following guidance is implementation-neutral. This RFC does not define APIs, schemas, databases, workflow engines, or user interfaces.

### 26.1 Protocol Semantics

Implementations SHOULD:

- enforce recognition requirements before transitioning a decision to Recognized state;
- record all lifecycle transitions with timestamps and actor attribution;
- prevent direct edits to decision records; alterations MUST produce new records;
- provide challenge mechanisms accessible to recognized parties;
- expose traceability records to authorized audit parties;
- support decision simulation for impact analysis without altering canonical state;
- propagate challenge state to decisions whose inputs are challenged;
- support consequence propagation rules defined by policy;
- treat AI outputs as inputs to the decision process, not as decisions.

### 26.2 Fail-Closed Behavior

When recognition requirements cannot be verified — because authority records are inaccessible, traceability is incomplete, or governance compliance cannot be confirmed — implementations SHOULD fail closed. An unverifiable decision MUST remain in a non-Recognized state pending remediation.

### 26.3 Simulation

Implementations MAY support decision simulation: what-if analysis of whether a decision would be recognized under hypothetical inputs, alternative policy, or alternative authority. Simulation output MUST NOT be recorded as a Recognized Decision and MUST be clearly labeled as simulation.

### 26.4 Interoperability

Decision records SHOULD be portable and interoperable. They SHOULD reference evidence through RFC-004 canonical evidence references, reference standing through RFC-005-H1 snapshot references, reference authority through RFC-005-H8 authority records, and reference capabilities through RFC-005-H4 capability records.

---

## 27. Future RFC Dependencies

The Decision Framework creates or anticipates the following future RFC dependencies:

| Future RFC | Placeholder Scope |
|---|---|
| RFC-005-H6 Standing Algorithms | Defines algorithm requirements for standing computation consumed by decisions |
| RFC-005-H10 Governance Registry | Defines canonical store for governance acts, mandates, and approval records referenced by decisions |
| RFC-005-H11 Governance Challenges | Defines challenge processes for governance acts that produced or blocked decisions |
| RFC-005-H12 Governance Delegation | Defines delegation of governance authority consumed in decision production |
| RFC-005-H13 Delegation Chains | Defines multi-hop delegation chains affecting decision eligibility and authority traceability |
| RFC-005-H14 Authority Registry | Defines canonical store for authority records referenced by the Decision Registry |
| RFC-005-H15 Decision Execution Framework | Defines operational execution semantics, execution traceability, failure handling, and consequence propagation rules |

Future RFCs MUST preserve the constitutional principle established by RFC-005-H9: only Recognized Decisions alter protocol reality. Recommendations, reviews, approvals, and AI outputs are not decisions until produced under recognized authority through a recognized decision process.

---

## 28. Acceptance Criteria

A complete implementation or document alignment for RFC-005-H9 satisfies the following checklist:

- [ ] RFC-005-H9 exists in the correct repository location.
- [ ] It follows existing RFC formatting conventions.
- [ ] It defines Decision as a protocol-recognized outcome produced under recognized authority.
- [ ] It distinguishes Recognized Decision from Claimed Decision.
- [ ] It establishes Decision as the final constitutional layer of the AOC protocol stack.
- [ ] It defines the complete architectural position: Evidence → Claims → Standing → Delegation → Capabilities → Authority → Decision.
- [ ] It defines canonical decision principles (Legitimacy, Traceability, Accountability, Reviewability, Challengeability, Governance, Finality, Boundedness).
- [ ] It defines canonical decision types including AI-Assisted Decisions.
- [ ] It defines the DecisionSubject model.
- [ ] It defines DecisionScope.
- [ ] It defines all decision precondition categories.
- [ ] It defines the full decision lifecycle with states and transition rules.
- [ ] It defines decision eligibility requirements.
- [ ] It defines decision traceability including mandatory traceability questions.
- [ ] It defines the Decision Dependency Graph with forward and reverse traceability.
- [ ] It distinguishes Recognized Decision from Claimed Decision with recognition requirements.
- [ ] It distinguishes Decision from Execution.
- [ ] It defines decision finality, reversibility, supersession, expiration, and challengeability.
- [ ] It defines DecisionChallenge with grounds, lifecycle, and effects.
- [ ] It defines Decision Governance including reversal and supersession authority.
- [ ] It defines the Decision Registry with append-only semantics.
- [ ] It defines decision consequences and state-changing behavior.
- [ ] It defines all Decision Guarantees (G-D1 through G-D8).
- [ ] It covers all security implications.
- [ ] It clearly distinguishes Decision from Authority.
- [ ] It clearly distinguishes Decision from Capability.
- [ ] It clearly distinguishes Decision from Standing.
- [ ] It defines all canonical Decision Registry Model concepts.
- [ ] It provides implementation-neutral guidance.
- [ ] It identifies future RFC dependencies.
- [ ] It explicitly answers all mandatory questions from the mission specification.

---

## Mandatory Questions: Explicit Answers

**What is a decision?**  
A decision is a protocol-recognized outcome produced under recognized authority. It is the final constitutional layer of the AOC protocol stack and is the mechanism by which protocol state changes.

**Why do decisions exist?**  
Decisions exist because protocol state must change through recognized, bounded, traceable, accountable acts. Without decisions, no new protocol facts can be created; the protocol could only describe what has been observed or asserted, never what has been authoritatively concluded.

**Who may create decisions?**  
An actor who holds recognized authority for the decision type within the decision scope, holds required capabilities and standing, satisfies governance preconditions, and complies with applicable policy.

**What authority is required?**  
Recognized authority as defined by RFC-005-H8, specific to the decision type and scope, that is current, not suspended, not revoked, and not challenged. Authority outside scope or authority not recognized by the protocol does not support a Recognized Decision.

**How are decisions recognized?**  
By satisfying all recognition requirements: verified authority, satisfied preconditions, governance compliance, policy compliance, registry recording, and complete traceability. Recognition is enforced by the protocol, not self-asserted by the deciding actor.

**How are decisions challenged?**  
Through a formal DecisionChallenge raised by a recognized party on a recognized ground (authority, scope, policy, evidence, standing, capability, governance, recognition process, or content). Challenges are reviewed by an authorized party and result in Sustained, Rejected, or Withdrawn outcomes.

**How are decisions reversed?**  
By a recognized reversal authority acting on a recognized reversal ground, recording the reversal in the Decision Registry, and propagating reversal to consequences as defined by policy. Reversal preserves history; it does not erase the original decision record.

**How are decisions superseded?**  
By a later Recognized Decision that takes precedence, produced under recognized authority, recorded in the Decision Registry, and causing the earlier decision to transition to Superseded state.

**How are decisions traced?**  
Through the Decision Dependency Graph and traceability records in the Decision Registry, answering who made the decision, why, under what authority, under what policy, under what governance, with what evidence, with what standing, and with what capability.

**How do decisions alter protocol state?**  
By producing recognized consequences: granting or revoking capabilities and authorities, issuing or revoking credentials, approving or rejecting proposals, recognizing or invalidating standing, and other canonical consequence types. Consequences alter protocol state by creating new recognized facts that downstream processes, actors, and systems treat as authoritative.

---

## Conclusion

RFC-005-H9 establishes the Decision Framework as the final constitutional layer of the AOC Protocol. Decisions are not opinions, recommendations, reviews, or claims. Decisions are protocol-recognized outcomes produced under recognized authority.

The constitutional chain is:

```text
Evidence → Claims → Standing → Delegation → Capabilities → Authority → Decision
```

Each layer is necessary. Evidence grounds claims. Claims ground standing. Standing grounds capabilities. Capabilities and authority ground decisions. Decisions produce recognized protocol state changes that alter protocol reality.

Only Recognized Decisions alter protocol reality. A Claimed Decision is not a Decision. An AI recommendation is not a Decision. A manager review is not a Decision. Only a protocol-recognized outcome produced under recognized authority, within recognized scope, under recognized policy, satisfying recognized governance, recorded in the Decision Registry with complete traceability, is a Recognized Decision.

The Decision Framework guarantees no decision without authority, no decision without traceability, no decision without policy, no decision without governance, no hidden decisions, no orphan decisions, and no unchallengeable decisions.

Decision is where protocol state changes. Decision is the constitutional endpoint of the AOC Claims Framework.
