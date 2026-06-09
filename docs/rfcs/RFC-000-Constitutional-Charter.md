# RFC-000 — Constitutional Charter v2.0

> **The Supreme Constitutional Instrument of AOC Protocol**

---

## Metadata

| Field                  | Value                                                                 |
| ---------------------- | --------------------------------------------------------------------- |
| RFC Number             | 000                                                                   |
| Title                  | Constitutional Charter v2.0                                           |
| Status                 | Draft                                                                 |
| Category               | Supreme Constitutional Instrument                                     |
| Supersedes             | `protocol/charter/README.md` (AOC Charter v1)                        |
| Governs                | All AOC RFCs, runtimes, governance rules and implementations          |
| Created                | 2026-06-07                                                            |
| Last Revised           | 2026-06-09                                                            |
| Authors                | AOC Protocol Architecture Working Group                               |
| Constitutional Rank    | Supreme                                                               |
| Ratification Status    | Draft — pending ratification                                          |
| Normative Keywords     | MUST, MUST NOT, SHOULD, SHOULD NOT, MAY per RFC 2119                  |

---

## Preamble

We, the participants in the construction of the Architects of Change Protocol, recognizing that the digital age has produced unprecedented concentrations of power over individual identity, data, standing and voice, and that such concentration constitutes a structural threat to human agency and democratic governance, establish this Constitutional Charter as the supreme normative instrument of AOC Protocol.

We hold that every individual is the primary architect of their own digital existence. No platform, institution, runtime, governance body, cryptographic proof or market adoption may override that primacy. The individual is not a resource to be optimized. The individual is a sovereign subject whose participation in any digital system must remain consensual, bounded, auditable and revocable.

We hold that institutions serve legitimate purposes. They may govern legitimate domains, certify claims, recognize standing, delegate authority and produce decisions — but only within constitutional limits, only with traceable legitimacy, and never by absorbing the sovereignty of those they serve.

We hold that legitimacy cannot be assumed, asserted, purchased, inherited or imposed. Legitimacy must be earned through transparent process, evidence-based recognition, challengeable procedure and accountable governance. A system that produces the right outcome through an illegitimate process is still constitutionally defective.

We hold that power corrupts when it is unchecked, self-perpetuating and opaque. Every authority recognized by this protocol must be bounded in scope, limited in time, independent in review and revocable in principle. An authority that cannot be challenged, audited or revoked is not an authority — it is a capture.

We hold that truth must survive change. When identities are updated, evidence superseded, standing revised, decisions appealed or governance reformed, the historical record must remain intact. No actor may rewrite the past to consolidate power in the present.

We hold that constitutional continuity matters not only in ordinary times but precisely in extraordinary ones. The value of a constitution is most visible when governance fails, when institutions collapse, when emergencies arise and when capture is attempted. This Charter must remain operative and supreme under all conditions.

This Charter does not belong to its authors. It does not belong to any company, government, protocol implementer, cryptographic proof system or governance body. It belongs, in the only meaningful sense available to a protocol, to the principles it enshrines — and to every individual whose sovereignty it is designed to protect.

Let this be the foundation on which all of AOC is built, and the limit beyond which no part of AOC may reach.

---

## Table of Contents

- [Part I — Foundational Constitutional Order](#part-i--foundational-constitutional-order)
  - [Article 1 — Purpose of the Protocol](#article-1--purpose-of-the-protocol)
  - [Article 2 — Protected Constitutional Interests](#article-2--protected-constitutional-interests)
  - [Article 3 — Constitutional Supremacy](#article-3--constitutional-supremacy)
  - [Article 4 — Constitutional Validity](#article-4--constitutional-validity)
  - [Article 5 — Constitutional Interpretation](#article-5--constitutional-interpretation)
- [Part II — The Twelve Constitutional Principles](#part-ii--the-twelve-constitutional-principles)
  - [Article 6 — Supremacy](#article-6--supremacy)
  - [Article 7 — Legitimacy](#article-7--legitimacy)
  - [Article 8 — Consent](#article-8--consent)
  - [Article 9 — Delegation](#article-9--delegation)
  - [Article 10 — Limitation](#article-10--limitation)
  - [Article 11 — Revocability](#article-11--revocability)
  - [Article 12 — Oversight](#article-12--oversight)
  - [Article 13 — Accountability](#article-13--accountability)
  - [Article 14 — Transparency](#article-14--transparency)
  - [Article 15 — Challenge](#article-15--challenge)
  - [Article 16 — Continuity](#article-16--continuity)
  - [Article 17 — Anti-Capture](#article-17--anti-capture)
- [Part III — Constitutional Rights](#part-iii--constitutional-rights)
  - [Article 18 — Right to Identity](#article-18--right-to-identity)
  - [Article 19 — Right to Consent](#article-19--right-to-consent)
  - [Article 20 — Right to Explanation](#article-20--right-to-explanation)
  - [Article 21 — Right to Challenge](#article-21--right-to-challenge)
  - [Article 22 — Right to Reconstruction](#article-22--right-to-reconstruction)
  - [Article 23 — Right to Audit](#article-23--right-to-audit)
  - [Article 24 — Right to Revocation](#article-24--right-to-revocation)
  - [Article 25 — Right to Due Process](#article-25--right-to-due-process)
  - [Article 26 — Right to Constitutional Review](#article-26--right-to-constitutional-review)
  - [Article 27 — Right to Exit and Portability](#article-27--right-to-exit-and-portability)
- [Part IV — Constitutional Duties](#part-iv--constitutional-duties)
  - [Article 28 — Duties of Individuals](#article-28--duties-of-individuals)
  - [Article 29 — Duties of Institutions](#article-29--duties-of-institutions)
  - [Article 30 — Duties of Governance Authorities](#article-30--duties-of-governance-authorities)
  - [Article 31 — Duties of Auditors](#article-31--duties-of-auditors)
  - [Article 32 — Duties of Protocol Maintainers](#article-32--duties-of-protocol-maintainers)
  - [Article 33 — Duties of Runtime Operators](#article-33--duties-of-runtime-operators)
- [Part V — Constitutional Legitimacy Chain](#part-v--constitutional-legitimacy-chain)
  - [Article 34 — The Canonical Chain](#article-34--the-canonical-chain)
  - [Article 35 — No Constitutional Bypass](#article-35--no-constitutional-bypass)
  - [Article 36 — Claimed vs Recognized](#article-36--claimed-vs-recognized)
- [Part VI — Bootstrap of Legitimacy](#part-vi--bootstrap-of-legitimacy)
  - [Article 37 — The Bootstrap Problem](#article-37--the-bootstrap-problem)
  - [Article 38 — Bootstrap Models Considered](#article-38--bootstrap-models-considered)
  - [Article 39 — Adopted Bootstrap Doctrine](#article-39--adopted-bootstrap-doctrine)
  - [Article 40 — Genesis Period](#article-40--genesis-period)
  - [Article 41 — First Governance Authority](#article-41--first-governance-authority)
- [Part VII — Constitutional Court](#part-vii--constitutional-court)
  - [Article 42 — The Constitutional Review Council](#article-42--the-constitutional-review-council)
  - [Article 43 — Jurisdiction](#article-43--jurisdiction)
  - [Article 44 — Limits of the Council](#article-44--limits-of-the-council)
  - [Article 45 — Council Composition](#article-45--council-composition)
- [Part VIII — Constitutional Review](#part-viii--constitutional-review)
  - [Article 46 — Review of RFCs](#article-46--review-of-rfcs)
  - [Article 47 — Review of Runtime](#article-47--review-of-runtime)
  - [Article 48 — Review of Governance Rules](#article-48--review-of-governance-rules)
  - [Article 49 — Review of Decisions](#article-49--review-of-decisions)
- [Part IX — Conflict Resolution](#part-ix--conflict-resolution)
  - [Article 50 — Conflict Types](#article-50--conflict-types)
  - [Article 51 — Conflict Resolution Order](#article-51--conflict-resolution-order)
  - [Article 52 — Interpretation During Conflict](#article-52--interpretation-during-conflict)
- [Part X — Constitutional Amendments](#part-x--constitutional-amendments)
  - [Article 53 — Amendment Authority](#article-53--amendment-authority)
  - [Article 54 — Amendment Process](#article-54--amendment-process)
  - [Article 55 — Ratification Requirements](#article-55--ratification-requirements)
  - [Article 56 — Unamendable Core](#article-56--unamendable-core)
  - [Article 57 — Emergency Amendments](#article-57--emergency-amendments)
- [Part XI — Constitutional Emergencies](#part-xi--constitutional-emergencies)
  - [Article 58 — Constitutional Emergency](#article-58--constitutional-emergency)
  - [Article 59 — Emergency Powers](#article-59--emergency-powers)
  - [Article 60 — Continuity Under Emergency](#article-60--continuity-under-emergency)
  - [Article 61 — Constitutional Restoration](#article-61--constitutional-restoration)
- [Part XII — Constitutional Invariants](#part-xii--constitutional-invariants)
- [Part XIII — Constitutional Compliance](#part-xiii--constitutional-compliance)
  - [Article 62 — Constitutionally Compliant](#article-62--constitutionally-compliant)
  - [Article 63 — Constitutionally Non-Compliant](#article-63--constitutionally-non-compliant)
  - [Article 64 — Constitutionally Invalid](#article-64--constitutionally-invalid)
  - [Article 65 — Constitutionally Superseded](#article-65--constitutionally-superseded)
  - [Article 66 — Constitutional Certification](#article-66--constitutional-certification)
- [Part XIV — Constitutional Maturity Model](#part-xiv--constitutional-maturity-model)
- [Part XV — Relationship to Existing RFCs](#part-xv--relationship-to-existing-rfcs)
- [Part XVI — Open Constitutional Questions](#part-xvi--open-constitutional-questions)
- [Part XVII — Conformance](#part-xvii--conformance)

---

## Part I — Foundational Constitutional Order

### Article 1 — Purpose of the Protocol

**1.1 Nature of AOC Protocol**

AOC Protocol is not merely a software framework. It is not an identity system, a governance tool, a blockchain protocol, a credential exchange format or an access-control specification. Each of those descriptions captures a derivative function, not the constitutional purpose.

AOC Protocol is a **constitutional protocol for legitimacy** — a formal system for ensuring that digital authority is born from traceable identity, supported by verifiable evidence, scoped by recognized standing, limited by explicit governance, and always remainss subject to challenge, audit and revocation.

**1.2 Primary Purposes**

The purposes of AOC Protocol, listed in order of constitutional priority, are:

1. **Preservation of Individual Sovereignty.** Every individual is the primary architect of their own digital existence. The protocol exists, first and foremost, to protect that primacy against erosion by institutional capture, technical convenience or market power.

2. **Preservation of Institutional Sovereignty.** Legitimate institutions have a constitutionally recognized right to govern their own domains, certify standing within those domains, and participate in protocol governance — provided they do not do so by absorbing individual sovereignty.

3. **Production of Legitimate Digital Governance.** The protocol provides the constitutional infrastructure through which governance decisions, authority recognitions, standing evaluations and claim validations may be produced in a manner that is legitimate, traceable and challengeable.

4. **Traceable Legitimacy.** Every assertion of authority, standing, capability or governance status must trace back to its constitutional origin. Untraceable authority is constitutionally void.

5. **Bounded Authority.** No authority recognized by this protocol is unlimited. Every authority has a scope, a time, a purpose and a set of conditions under which it expires or may be revoked.

6. **Accountable Decisions.** Every consequential decision produced by or within the protocol must identify its author, basis, authority, scope and challenge path.

7. **Auditability.** The protocol must make it possible to reconstruct the constitutional state of any recognized subject, authority or decision at any point in time, under independent audit, using preserved records.

8. **Continuity.** Constitutional validity does not expire through change, transition or emergency. Historical records must survive every transformation of the protocol's governance, runtime or registry infrastructure.

9. **Anti-Capture.** No single actor — whether individual, institution, governance body, runtime operator, protocol maintainer, AI agent or external adopter — may accumulate exclusive control over identity, standing, authority, decisions, governance or audit.

**1.3 What AOC Is Not**

AOC Protocol MUST NOT be construed as:

- a product or commercial offering;
- a national jurisdiction or sovereign state;
- a legal instrument enforceable in external courts by virtue of this Charter alone;
- an autonomous agent with interests independent of those it serves;
- a complete substitute for external legal frameworks;
- a closed system whose participants have no rights outside its boundaries.

---

### Article 2 — Protected Constitutional Interests

The following interests are constitutionally protected by AOC Protocol. No RFC, governance rule, runtime implementation or decision may diminish these interests except through the formal amendment process defined in Part X, subject to the unamendable core defined in Article 56.

**2.1 Individual Sovereignty**

The individual must remain the architect of their own digital system. This means:

- The individual's identity, data, claims, consents, revocations and participations are theirs to control.
- No registry, runtime, institution or governance body may assert ownership of an individual's identity or standing.
- No technical implementation may make it structurally impossible for an individual to exit, revoke or migrate.
- The individual's sovereign status does not depend on any institution's recognition of it.

**2.2 Institutional Sovereignty**

Institutions may govern legitimate domains without owning the individuals within those domains. This means:

- Institutions may define governance rules, recognize standing, certify claims and produce decisions within their constitutional scope.
- Institutional authority is legitimate only within the bounds of its recognized jurisdiction.
- Institutional governance does not transfer individual sovereignty to the institution.
- Institutions are constitutionally subordinate to RFC-000.

**2.3 Legitimacy**

No authority, standing or decision is valid merely because it is asserted. Legitimacy requires the full constitutional chain defined in Part V. Claimed legitimacy without constitutional basis produces no valid effect.

**2.4 Consent**

Consent must be explicit, bounded, revocable, purpose-specific and auditable. The protocol MUST NOT recognize any action taken on behalf of a subject as valid unless the applicable consent was obtained, recorded and remains in effect at the time of the action.

**2.5 Accountability**

Every consequential action must be attributable to an identified actor acting under an identified authority within an identified scope. Anonymous constitutional power is prohibited.

**2.6 Transparency**

Rules governing standing, authority and decisions must be publicly available. Procedures for evaluating and producing constitutional outcomes must be inspectable. Outcomes must be explainable in terms of the rules that produced them.

**2.7 Auditability**

The constitutional state relevant to any recognized subject, authority, decision or governance event must be reconstructable from preserved records under legitimate audit process.

**2.8 Continuity**

Historical truth must survive change, revocation, supersession and institutional transition. When a record is superseded, revoked or amended, the new state is added; the old state is preserved. The protocol MUST NOT permit retroactive erasure of constitutional history.

**2.9 Anti-Capture**

No actor may monopolize identity recognition, evidence acceptance, standing evaluation, authority recognition, decision production, governance rulemaking, constitutional review or audit. Separation of powers is a constitutional requirement.

**2.10 Due Process**

Every consequential adverse act — revocation of recognized standing, invalidation of authority, rejection of claims, enforcement of governance rules — must be preceded by or accompanied by a process that is accessible, known, fair, challengeable and capable of producing a reasoned outcome.

---

### Article 3 — Constitutional Supremacy

**3.1 Hierarchy of Normative Instruments**

The following hierarchy governs all normative instruments within AOC Protocol. Each layer is subordinate to all layers above it.

| Rank | Layer                            | Examples                                                    |
|------|----------------------------------|-------------------------------------------------------------|
| 1    | RFC-000 Constitutional Charter   | This document                                               |
| 2    | Ratified Constitutional Amendments | Amendments adopted through the process in Part X           |
| 3    | Core Constitutional RFCs         | RFC-001, RFC-004, RFC-005 and its sub-specifications        |
| 4    | Derived and Extension RFCs       | Domain-specific extensions, capability extensions           |
| 5    | Governance Rules                 | Ratified rules produced by recognized Governance Authorities|
| 6    | Runtime Implementations          | Software that executes the protocol                         |
| 7    | Operational Policies             | Operating procedures for specific deployments               |
| 8    | Local Configurations             | Instance-level settings                                     |
| 9    | User Interfaces                  | Presentation layers                                         |
| 10   | External Integrations            | Third-party adaptors and bridges                            |

**3.2 Supremacy Rules**

- A lower layer MUST NOT redefine, override, contradict or narrow any requirement established by a higher layer.
- A runtime MUST NOT override a constitutional rule, even in the interest of operational efficiency or performance.
- Governance rules MUST NOT contradict RFC-000, even when adopted by a recognized Governance Authority.
- Local implementation choices MUST NOT reduce the constitutional protections guaranteed by higher-layer instruments.
- Adoption, market power, technical popularity, commercial success or operational convenience MUST NOT create constitutional legitimacy. Widespread use does not ratify.
- An RFC that contradicts RFC-000 is constitutionally void to the extent of the contradiction.

**3.3 Absolute Position of RFC-000**

The following subjects are not above RFC-000:

- No RFC, however specific or technical.
- No implementation, however widely deployed.
- No runtime, however performant.
- No governance authority, however legitimately constituted.
- No founder or original author.
- No protocol maintainer or technical steward.
- No institution, however large or recognized.
- No AI agent, however capable.
- No cryptographic proof, however strong.
- No market adoption, however broad.
- No declared emergency.

This list is not exhaustive. The principle is absolute: nothing within AOC Protocol supersedes RFC-000 except a ratified constitutional amendment adopted through the process defined in Part X.

---

### Article 4 — Constitutional Validity

**4.1 Constitutionally Valid**

An act, rule, RFC, implementation, decision, or governance outcome is **constitutionally valid** when it:

- derives from and is consistent with RFC-000 and all applicable superior instruments;
- was produced by an actor with recognized authority within the applicable scope;
- followed the required constitutional process;
- is traceable, auditable and challengeable;
- has not been voided, superseded or revoked by a valid process.

*Example:* A standing evaluation produced by a recognized Standing Engine operating under a ratified governance rule, using accepted evidence, with a traceable evaluation path and an accessible challenge mechanism, is constitutionally valid.

**4.2 Constitutionally Non-Compliant**

An act, rule or implementation is **constitutionally non-compliant** when it fails to satisfy one or more constitutional requirements but the failure is remediable without nullifying all downstream effects. Non-compliance produces a duty to remediate within a defined period.

*Example:* A governance decision that omits a required audit trail but was otherwise produced by proper authority under proper process. The decision may stand while the audit trail is reconstructed, provided reconstruction is possible.

**4.3 Constitutionally Void**

An act is **constitutionally void** when it violates a fundamental constitutional requirement and produces no valid constitutional effect, regardless of any purported downstream reliance on it.

*Example:* An authority recognition produced without any standing evaluation, where no constitutional emergency or exception applied. The recognition is void and confers no authority on the recognized actor.

**4.4 Constitutionally Voidable**

An act is **constitutionally voidable** when it remains provisionally effective but is subject to challenge and may be invalidated through proper constitutional process. Voidable acts remain operative until challenged and invalidated or until a challenge window closes without challenge.

*Example:* A governance rule adopted with a procedural irregularity that did not affect the substantive outcome. The rule is voidable: it operates until challenged, but must be treated as potentially invalid.

**4.5 Constitutionally Superseded**

An act or rule is **constitutionally superseded** when it has been replaced prospectively by a valid successor instrument. Supersession does not erase the historical record of the superseded act; it terminates the act's forward normative force.

*Example:* RFC-005 v1 superseded by RFC-005 v2 through a valid amendment process. The v1 specification remains in the historical record but produces no new normative obligations after the effective date of v2.

**4.6 Constitutionally Invalid Ab Initio**

An act is **constitutionally invalid ab initio** when its originating process was constitutionally defective at inception, meaning it was never valid and never produced any legitimate constitutional effect.

*Example:* An initial Governance Authority constituted through a secret ratification process that excluded all challenge and public participation. The authority was invalid from the moment it was purportedly created, and every act it subsequently produced must be re-evaluated on constitutional grounds.

---

### Article 5 — Constitutional Interpretation

**5.1 Interpretive Principles**

When interpreting RFC-000 or any constitutional instrument derived from it, the following principles apply in the order listed:

1. **Sovereignty over convenience.** Where an interpretation would preserve individual or institutional sovereignty at the cost of operational convenience, sovereignty controls.

2. **Limitation over unchecked power.** Where an interpretation would limit the scope of authority versus expand it, the limiting interpretation controls.

3. **Transparency over opacity.** Where an interpretation would produce a more explainable or inspectable outcome, that interpretation controls.

4. **Challengeability over finality.** Where an interpretation would preserve or expand the right to challenge, that interpretation controls over one that would foreclose challenge.

5. **Preservation of historical truth.** No interpretation may sanction the rewriting, erasure or concealment of constitutional history.

**5.2 No Implied Authority**

Authority MUST NOT be inferred from:

- identity or role within the protocol;
- level of access to systems or registries;
- possession of cryptographic credentials;
- title or organizational position;
- control over runtime infrastructure;
- market adoption or technical influence.

Authority exists only where it has been explicitly recognized through the constitutional process defined in Part V.

**5.3 Narrowness of Power Grants**

Where a constitutional instrument is ambiguous about the scope of a grant of power, the narrower interpretation controls. The burden of constitutional justification falls on those who exercise power, not on those who challenge it.

**5.4 Breadth of Rights Protection**

Where a constitutional instrument is ambiguous about the scope of a right or protection, the broader interpretation controls. The benefit of the doubt flows to the protected subject.

**5.5 No Interpretation by Self-Interest**

An actor who stands to benefit from a particular constitutional interpretation MUST NOT be the sole or final interpreter of that interpretation. Constitutional interpretation that affects the scope of the interpreter's own authority requires independent review.

---

## Part II — The Twelve Constitutional Principles

The following twelve principles are the structural pillars of AOC Protocol's constitutional order. Each principle is inalienable, mutually reinforcing and, taken together, constitute the complete normative architecture of the protocol.

---

### Article 6 — Supremacy

**6.1 Definition**

The constitutional supremacy principle holds that RFC-000 is the highest normative source within AOC Protocol and that all other instruments, rules, implementations and decisions derive their legitimacy from conformity with it.

**6.2 Constitutional Function**

Supremacy protects every other constitutional principle from erosion by subordinate instruments. Without supremacy, any RFC, runtime or governance body could effectively override constitutional protections by simply asserting the authority to do so.

**6.3 What It Protects**

- The integrity of the constitutional order as a whole.
- Individual and institutional sovereignty against capture by technical or governance layers.
- The coherence and predictability of constitutional rules across time and implementations.

**6.4 What It Prohibits**

- **Implementation supremacy:** A runtime or software deployment MUST NOT claim authority that contradicts RFC-000.
- **Founder supremacy:** Original authors or maintainers MUST NOT retain constitutional authority beyond the Genesis Period defined in Part VI.
- **Runtime supremacy:** No deployed instance of AOC may override constitutional rules on the grounds of technical necessity.
- **Governance supremacy:** No Governance Authority may declare itself above review by the Constitutional Review Council or above RFC-000.
- **Market supremacy:** Widespread adoption does not confer constitutional supremacy on any actor, runtime or interpretation.
- **Emergency supremacy:** A declared constitutional emergency does not suspend RFC-000. Emergency powers are bounded by Part XI.

**6.5 Consequences of Violation**

An act that claims supremacy over RFC-000 is constitutionally void. Any instrument that purports to place any actor above RFC-000 is invalid to the extent of that purported elevation.

**6.6 Relationship to RFCs**

Every RFC is subordinate to RFC-000. An RFC that contradicts a principle established in RFC-000 is void to the extent of the contradiction. The Constitutional Review Council has jurisdiction to identify and declare such contradictions under Article 43.

---

### Article 7 — Legitimacy

**7.1 Definition**

Legitimacy is the constitutional property of an act, authority, standing recognition, governance rule or decision that renders it normatively binding within AOC Protocol. Legitimacy is not a binary quality — it is a traceable chain from constitutional primitives to a claimed constitutional effect.

**7.2 Constitutional Function**

The legitimacy principle ensures that no constitutional effect is produced merely by assertion, convenience, delegation of convenience or market force. It requires that every claim to constitutional status be grounded in the canonical chain defined in Part V.

**7.3 Requirements**

Legitimacy requires all of the following:

- **Identity:** The actor producing or claiming the effect must be a recognized identity within the scope of the relevant process.
- **Evidence:** The basis for the claim, authority or decision must be supported by accepted evidence.
- **Claims:** The specific attributes relied upon must have been formally claimed and not merely assumed.
- **Standing:** The actor must have recognized standing for the relevant action within the relevant domain.
- **Recognition:** The standing, authority or capability must have been recognized by a legitimate authority, not merely claimed.
- **Authority:** The actor must hold recognized authority for the specific act being performed.
- **Valid Process:** The applicable constitutional process must have been followed.
- **Traceability:** Every step in the legitimacy chain must be traceable through preserved records.

**7.4 No Self-Legitimization**

No constitutional primitive may self-legitimize. An actor MUST NOT:

- recognize their own standing;
- grant themselves authority;
- audit their own decisions;
- ratify amendments that benefit their own power;
- interpret constitutional provisions that govern their own scope.

**7.5 Consequences of Violation**

An act produced without legitimacy is constitutionally void or voidable depending on the nature and severity of the deficiency. Persistent patterns of illegitimate action constitute evidence of constitutional capture and trigger the anti-capture protections of Article 17.

**7.6 Relationship to RFCs**

- RFC-001 supplies the identity primitive.
- RFC-004 supplies the evidence primitive.
- RFC-005 supplies the claims primitive.
- RFC-005-H1 and RFC-005-H2 supply the standing traceability and engine.
- RFC-005-H8 supplies the authority recognition model.
- RFC-005-H9 supplies the decision framework.
- All of these are instruments of legitimacy and are subordinate to this principle.

---

### Article 8 — Consent

**8.1 Definition**

Consent is the explicit, bounded, traceable and revocable authorization by a constitutional subject for a defined act, relationship or data use within a defined scope and time.

**8.2 Constitutional Function**

The consent principle ensures that no action is taken on behalf of a subject, against a subject, or using the subject's identity, data or standing without their genuine authorization. It is the primary mechanism by which individual sovereignty is operationalized within governance processes.

**8.3 Requirements for Valid Consent**

Consent is constitutionally valid only when it is:

- **Explicit:** Not inferred, assumed or implied by default.
- **Granular:** Scoped to the specific purpose, not broadly applied to all future uses.
- **Revocable:** Capable of being withdrawn by the consenting subject at any time, subject to any constitutionally valid processes that attach to the revocation of consent already acted upon.
- **Purpose-bound:** Tied to a specific, disclosed purpose and not transferable to other purposes without renewed consent.
- **Traceable:** Recorded in a form that can be retrieved and audited.
- **Time-bounded or reviewable:** Either expiring after a defined period or subject to mandatory review at a defined interval.
- **Free from coercive capture:** Not obtained by conditioning access to fundamental protocol participation on agreement to unlimited or unrevocable terms.

**8.4 Categories of Consent**

- **Individual consent:** A natural person's authorization for a specific act or data use within a specific scope.
- **Institutional consent:** An institution's authorization for governance participation, delegation or information sharing within its recognized constitutional scope.
- **Delegated consent:** Consent granted on behalf of a subject by a recognized delegate within the bounds of the delegation (see Article 9). Delegated consent MUST NOT exceed the scope of the original consent.
- **Governance consent:** The ratification, participation or approval of a governance body in a constitutional process. Governance consent must itself satisfy the requirements of this Article.
- **Emergency exception:** During a declared constitutional emergency under Part XI, the normal consent requirements may be temporarily suspended for a narrowly defined class of acts. Any such suspension must be the minimum necessary, must be time-limited, must be documented, and must be subject to review and challenge after the emergency.

**8.5 Consequences of Violation**

Any act performed without valid consent where consent was required is constitutionally void or voidable. Systematic violation of the consent principle constitutes evidence of capture.

---

### Article 9 — Delegation

**9.1 Definition**

Delegation is the formal transfer of a bounded subset of a recognized authority's rights, powers or standing to another actor for a defined purpose, within a defined scope and for a defined or reviewable duration.

**9.2 Constitutional Function**

The delegation principle enables the construction of complex governance and authority structures without permitting the evasion of constitutional accountability. Delegation extends authority functionally while preserving the constitutional trace back to its source.

**9.3 Requirements**

Delegation MUST be:

- **Explicit:** Delegation does not occur by inference or implication. It must be a documented, identified act.
- **Bounded:** The delegated authority must be narrower in scope than the source authority. A delegation that grants the same or greater scope as the source is constitutionally void.
- **Traceable:** Every delegation must be reconstructable to its source.
- **Revocable:** The delegating authority must retain the power to revoke the delegation, except where the delegation is to a constitutionally independent body (such as the Constitutional Review Council), in which case revocability is subject to the rules governing that body.
- **Auditable:** The exercise of delegated authority must be independently auditable.
- **Accountability-preserving:** Delegation does not relieve the delegating authority of accountability for the constitutional scope it delegated. The delegating authority remains responsible for ensuring that the delegated authority was exercised constitutionally.

**9.4 Prohibition on Delegation of Non-Possessed Authority**

No actor may delegate what they do not themselves possess. A delegation purporting to grant authority the delegating actor does not hold is constitutionally void.

**9.5 Consequences of Violation**

A delegation that violates these requirements is void. Acts performed under a void delegation inherit the void status of the delegation.

**9.6 Relationship to RFCs**

RFC-005-H5 (Delegated Standing) operationalizes this principle and is subordinate to it.

---

### Article 10 — Limitation

**10.1 Definition**

The limitation principle holds that all authority, power and standing recognized within AOC Protocol is bounded, and that unlimited authority is constitutionally prohibited.

**10.2 Constitutional Function**

Limitation ensures that no actor — regardless of the legitimacy of their initial recognition — may accumulate unbounded power over any aspect of the protocol. It is the constitutional mechanism that prevents concentration of authority from becoming capture.

**10.3 Dimensions of Limitation**

Every authority must be bounded by all of the following:

- **Scope:** The subject matter over which the authority may be exercised.
- **Time:** The duration for which the authority holds, after which it expires or must be renewed.
- **Purpose:** The specific constitutional purpose for which the authority was recognized.
- **Jurisdiction:** The domain or set of subjects over which the authority applies.
- **Standing:** The authority may only be exercised by actors with the required standing.
- **Governance:** The authority is constrained by applicable governance rules.
- **Evidence:** The exercise of authority must remain grounded in the evidence that justified its recognition.
- **Challengeability:** The authority and its exercise must remain challengeable under Article 15.

**10.4 Unlimited Authority is Unconstitutional**

Any instrument, governance rule, delegation or runtime configuration that purports to create unlimited authority is constitutionally void. This includes:

- authority with no defined scope;
- authority with no expiration or review mechanism;
- authority immune from challenge;
- authority that expands itself without external ratification;
- authority that self-exempts from audit.

**10.5 Consequences of Violation**

Any act performed under purported unlimited authority is constitutionally void. The actor who exercised such authority is subject to constitutional accountability under Article 13.

---

### Article 11 — Revocability

**11.1 Definition**

Revocability is the constitutional principle that every recognition, standing, authority, delegation, consent and governance status within AOC Protocol must be capable of being ended through a defined constitutional process.

**11.2 Constitutional Function**

Revocability is the counterpart of recognition. The power to grant must be accompanied by the power to withdraw. A recognition that cannot be revoked is not a bounded authority — it is a permanent transfer of constitutional power, which is prohibited by Article 10.

**11.3 Requirements**

Every constitutional recognition MUST be capable of being:

- **Suspended:** Temporarily paused pending review or challenge.
- **Revoked:** Permanently ended prospectively by the appropriate authority.
- **Superseded:** Replaced by a valid successor recognition.
- **Challenged:** Subjected to formal constitutional review at any time by a subject with standing.
- **Reviewed:** Periodically re-evaluated even in the absence of a formal challenge.

**11.4 History Preservation**

Revocation MUST preserve historical truth:

- A revoked recognition must be marked as revoked, with a timestamp, the identity of the revoking authority and the stated basis.
- The record of the original recognition must remain intact and accessible.
- Acts validly performed under the recognition before revocation are not retroactively invalidated solely by the revocation, unless the original recognition was constitutionally void ab initio.

**11.5 Revocation Must Not Rewrite Truth**

Revocation terminates prospective constitutional force. It does not erase the historical record. Any system that deletes or rewrites records as part of a revocation process violates this principle.

**11.6 Consequences of Violation**

A constitutional instrument that creates an irrevocable recognition or authority is void to the extent of that irrevocability.

---

### Article 12 — Oversight

**12.1 Definition**

Oversight is the constitutional principle requiring that every layer of the legitimacy chain — from identity recognition to governance decisions — is subject to independent monitoring, review and accountability.

**12.2 Constitutional Function**

Oversight closes the loop on all other constitutional principles. It ensures that legitimacy, consent, accountability and anti-capture are not merely declared but actually operative.

**12.3 Scope of Oversight**

Oversight MUST apply to:

- identity recognition processes;
- evidence acceptance and rejection;
- claim verification;
- standing evaluation;
- capability mapping and recognition;
- authority recognition and exercise;
- decision validation and execution;
- governance rule adoption and enforcement;
- runtime conformance with constitutional requirements.

**12.4 Independence Requirement**

Oversight MUST be independent of the actor being overseen. An actor MUST NOT oversee their own processes, their own authority, their own standing evaluations or their own governance decisions.

**12.5 Consequences of Violation**

Processes conducted without independent oversight are constitutionally non-compliant. Where the lack of oversight produced a material constitutional defect, the resulting act may be void or voidable.

---

### Article 13 — Accountability

**13.1 Definition**

Accountability is the constitutional principle that every consequential act within AOC Protocol is attributable to an identified actor operating under identified authority on an identified constitutional basis.

**13.2 Constitutional Function**

Accountability makes constitutional authority real rather than formal. It ensures that the exercise of recognized power leaves a traceable record that can be reconstructed, audited, challenged and — where appropriate — sanctioned.

**13.3 Required Attribution Elements**

Every consequential act MUST record:

- **Actor:** The identified subject who performed the act.
- **Authority:** The specific recognized authority under which the act was performed.
- **Basis:** The evidence and rules that supported the act.
- **Evidence:** References to the evidence record relied upon.
- **Rule:** The specific governance rule or constitutional provision that authorized the act.
- **Time:** The timestamp of the act.
- **Scope:** The domain and subjects affected.
- **Decision path:** The sequence of evaluations and determinations that produced the outcome.
- **Challenge path:** The mechanism available to any subject with standing to challenge the act.

**13.4 Prohibition of Anonymous Constitutional Power**

No actor may exercise constitutional power anonymously. An act whose author cannot be identified or whose authority cannot be traced is constitutionally void.

**13.5 Consequences of Violation**

An act that lacks required attribution elements is constitutionally non-compliant. An act performed under deliberately obscured attribution is constitutionally void.

---

### Article 14 — Transparency

**14.1 Definition**

Transparency is the constitutional principle that the rules, procedures and outcomes governing constitutional subjects within AOC Protocol are publicly accessible, inspectable and explainable.

**14.2 Constitutional Function**

Transparency enables challenge, audit and reconstruction. Without transparency, the other constitutional principles cannot be operationalized by subjects who do not have access to the rules that govern them.

**14.3 What Must Be Transparent**

- **Rules:** All governance rules, RFC requirements and constitutional instruments that affect subjects must be publicly available.
- **Procedures:** The procedures for evaluating standing, recognizing authority and producing decisions must be inspectable.
- **Outcomes:** Every constitutional outcome must be explainable in terms of the rules and evidence that produced it.
- **Records:** Audit records, standing histories, authority recognitions and decision logs must be accessible under legitimate process.
- **History:** The constitutional history of every recognized subject must be reconstructable.

**14.4 Protected Transparency**

Not all data must be public. The transparency principle is satisfied when:

- the rules governing the use of private data are public;
- the fact of consequential acts is auditable even if some underlying data is protected;
- protected data may be accessed under legitimate constitutional audit process;
- the subject of the data retains access to their own data.

A rule that prevents the subject of a decision from understanding the basis of that decision is unconstitutional, regardless of how the implementing data is classified.

**14.5 Consequences of Violation**

An outcome that cannot be explained to the subject it affects is constitutionally non-compliant. A rule that is intentionally obscured to prevent challenge is constitutionally void.

---

### Article 15 — Challenge

**15.1 Definition**

Challenge is the constitutional right of every subject with standing to formally contest any constitutional act, recognition, rule or interpretation that affects them.

**15.2 Constitutional Function**

Challenge is the primary mechanism by which all other constitutional principles remain operative under adversarial conditions. It is the safety valve of the constitutional order. Without challenge, every other principle is dependent on voluntary compliance.

**15.3 Scope of Challenge Rights**

Every subject with standing MUST be able to challenge:

- the basis and process of their identity recognition;
- the acceptance or rejection of evidence in processes affecting them;
- the verification or rejection of their claims;
- standing evaluations and their outcomes;
- capability mappings that affect their authority;
- authority recognitions affecting them;
- the validity of decisions affecting them;
- governance rules under which they are governed;
- runtime conformance with constitutional requirements;
- constitutional interpretations that affect their rights.

**15.4 Prohibition on Self-Protection from Challenge**

No authority may block challenges against itself. A governance rule, RFC, decision or runtime configuration that prevents, discourages or imposes disproportionate barriers to challenge against the actor who produced it is constitutionally void.

**15.5 Challenge Process Requirements**

A challenge process is constitutionally adequate only if it:

- is accessible to any subject with standing;
- has a defined, non-excessive filing requirement;
- produces a reasoned outcome;
- is independent of the challenged actor;
- preserves records of the challenge and outcome;
- allows further review of the challenge outcome.

**15.6 Consequences of Violation**

A constitutional process that forecloses valid challenge is constitutionally void. Any outcome produced without an accessible challenge mechanism is voidable.

---

### Article 16 — Continuity

**16.1 Definition**

Continuity is the constitutional principle that the historical record of every constitutional subject, authority, decision and governance event must survive all transitions — technical, institutional, governance and emergency.

**16.2 Constitutional Function**

Continuity ensures that legitimacy chains remain traceable even as the protocol evolves, that revocations do not erase the past, and that the constitutional state at any point in time can be reconstructed by an independent auditor.

**16.3 Dimensions of Continuity**

The protocol MUST preserve:

- **Identity continuity:** The history of identity recognitions, amendments, revocations and supersessions for every subject.
- **Evidence continuity:** The record of evidence accepted and rejected in constitutional processes.
- **Claim continuity:** The history of claims made, verified, disputed and resolved.
- **Standing continuity:** The full standing history of every subject in every evaluated domain.
- **Authority continuity:** The history of authority recognitions, delegations, exercises, suspensions and revocations.
- **Decision continuity:** The complete record of consequential decisions, including their authority basis, evidence foundation and challenge history.
- **Governance continuity:** The history of governance rules, amendments, ratifications and supersessions.
- **Audit continuity:** The record of all audits, findings and resolutions.
- **Historical truth:** The factual record of constitutional events as they occurred, immutable after the close of the relevant challenge window.

**16.4 Change Creates New Records**

No constitutional update, amendment, revocation or correction may overwrite an existing record. Change produces a new record with appropriate metadata. The prior record remains in the historical archive.

**16.5 Consequences of Violation**

A system that permits the overwriting or deletion of constitutional records violates this principle and is constitutionally non-compliant. Any act taken to obscure or destroy constitutional history is constitutionally void and constitutes evidence of capture.

---

### Article 17 — Anti-Capture

**17.1 Definition**

Capture is the condition in which a single actor, coalition or class of actors acquires effective control over one or more constitutional primitives — identity, evidence, claims, standing, capability, authority, decision, governance, audit or amendment — in a manner that eliminates or materially reduces the separation of powers required by this Charter.

**17.2 Constitutional Function**

The anti-capture principle is the constitutional immune system of AOC Protocol. It ensures that the concentration of power — whether through technical control, governance accumulation, market dominance or institutional merger — cannot nullify the constitutional order.

**17.3 Prohibited Captures**

No single actor may control:

- the creation and recognition of identity;
- the acceptance and rejection of evidence;
- the verification of claims;
- the evaluation of standing;
- the mapping of capability;
- the recognition of authority;
- the production of decisions;
- the adoption of governance rules;
- the conduct of audit;
- the amendment process;
- the interpretation of RFC-000.

**17.4 Systemic Capture**

The anti-capture principle applies to systemic conditions, not only to individual bad actors. A constitutional architecture that structurally enables capture — even without a specific captured actor — violates this principle.

**17.5 Capture Indicators**

The following are indicators of potential constitutional capture, requiring immediate review:

- A single actor holds recognized authority over more than one adjacent layer of the legitimacy chain.
- A single actor controls both the execution of a process and the audit of that process.
- A governance body controls both its own composition and the rules governing its authority.
- Challenge mechanisms are systematically unused, inaccessible or ineffective.
- Constitutional amendments have been adopted without meaningful independent review.

**17.6 Consequences of Violation**

A condition of capture voids the legitimacy of every constitutional act produced under the captured process. It triggers emergency review under Part XI.

---

## Part III — Constitutional Rights

The following rights are constitutional guarantees held by subjects of AOC Protocol. Rights are not granted by governance authorities; they are recognized by this Charter. No governance rule, RFC, runtime or decision may eliminate these rights. They may be clarified and operationalized by subordinate instruments but never narrowed below the floor established here.

---

### Article 18 — Right to Identity

**18.1 Holder:** Every subject participating in or affected by AOC Protocol.

**18.2 Scope:** Every subject has the right to identity representation that is:
- portable across implementations and registries;
- not captive to any single provider, runtime or governance domain;
- auditable in the sense that the history of identity recognitions affecting the subject is accessible to the subject;
- challengeable when the identity record is incorrect, outdated or produced by an unconstitutional process.

**18.3 Limits:** The right to identity does not include the right to forge, fabricate or misrepresent identity. It does not preclude identity verification requirements in appropriate governance contexts.

**18.4 Enforcement Principle:** No implementation may make a subject's identity non-portable as a design requirement. Any system that structurally prevents a subject from migrating their identity record violates this right.

**18.5 Relationship to RFCs:** RFC-001 (Identity Layer) operationalizes this right and is subordinate to it.

---

### Article 19 — Right to Consent

**19.1 Holder:** Every subject participating in or affected by AOC Protocol.

**19.2 Scope:** Every subject has the right not to have data, standing, authority or decisions imposed on them beyond valid consent or constitutionally mandated process.

**19.3 Limits:** Consent may be required as a condition of participation in specific governance processes. Refusal of consent may result in non-participation, but MUST NOT result in loss of fundamental protocol rights.

**19.4 Enforcement Principle:** Any act performed without valid consent where consent was required is voidable by the subject. Systematic violation of consent is a capture indicator.

---

### Article 20 — Right to Explanation

**20.1 Holder:** Any subject affected by a consequential constitutional outcome.

**20.2 Scope:** Every subject has the right to a sufficient explanation of:
- what was decided or concluded about them;
- the authority under which the decision was made;
- the evidence relied upon;
- the rules applied;
- how to challenge the outcome.

**20.3 Limits:** Explanation does not require disclosure of protected third-party data. It does require that the structure of the reasoning be accessible even where specific underlying data is protected.

**20.4 Enforcement Principle:** A decision that cannot be explained to its subject is constitutionally non-compliant.

---

### Article 21 — Right to Challenge

**21.1 Holder:** Any subject with standing who is affected by a consequential constitutional outcome.

**21.2 Scope:** Defined fully in Article 15.

**21.3 Limits:** Challenge must be filed within applicable windows and must meet minimum standing requirements. These requirements MUST NOT be set at levels that are effectively prohibitive.

**21.4 Enforcement Principle:** No authority may block challenges against itself. Any attempt to prevent or penalize legitimate challenge is constitutionally void.

---

### Article 22 — Right to Reconstruction

**22.1 Holder:** Any subject affected by a constitutional action.

**22.2 Scope:** Every subject has the right to reconstruct:
- their constitutional state at the time of a relevant action;
- the authority chain that produced a decision affecting them;
- the evidence accepted or rejected in processes affecting them;
- the standing evaluation history that determined their standing.

**22.3 Limits:** Reconstruction uses preserved records. It does not create a right to modify records.

**22.4 Enforcement Principle:** A system that does not preserve sufficient records to support reconstruction is constitutionally non-compliant with respect to the continuity principle.

---

### Article 23 — Right to Audit

**23.1 Holder:** Any subject with recognized auditor standing, or any subject auditing processes that directly affect their own constitutional status.

**23.2 Scope:** Every constitutional process must be auditable by an authorized and independent auditor. Audit includes review of:
- process records;
- authority chains;
- evidence acceptance rationale;
- decision paths;
- governance rule provenance.

**23.3 Limits:** Audit access to third-party protected data is governed by applicable privacy and governance rules. This right does not create unlimited data access.

**23.4 Enforcement Principle:** A process structured to prevent audit is constitutionally void.

---

### Article 24 — Right to Revocation

**24.1 Holder:** Every subject who has granted consent, recognition or standing within the protocol.

**24.2 Scope:** Every revocable recognition, consent, delegation, standing authorization or decision must have an accessible, defined and functional revocation path.

**24.3 Limits:** Revocation may have prospective consequences defined by applicable governance rules. Revocation does not erase the history of acts performed under the revoked authorization.

**24.4 Enforcement Principle:** A system that makes revocation structurally impossible is constitutionally non-compliant.

---

### Article 25 — Right to Due Process

**25.1 Holder:** Every subject facing a consequential adverse constitutional act.

**25.2 Scope:** No subject may be deprived of recognized standing, authority, recognition or decision validity without a process that is:
- known in advance or made known before the act;
- accessible;
- fair;
- conducted by an actor independent of the actor adverse to the subject;
- capable of producing a reasoned outcome;
- subject to further review.

**25.3 Limits:** The specifics of due process may vary by context and governance domain, subject to the floor established by this Article.

**25.4 Enforcement Principle:** A deprivation of constitutional status without due process is voidable by the affected subject.

---

### Article 26 — Right to Constitutional Review

**26.1 Holder:** Any subject with standing, recognized institution, or governance authority.

**26.2 Scope:** Any RFC, governance rule, runtime implementation or consequential decision may be subjected to review against RFC-000. The right to seek such review cannot be blocked by the actor whose act is being reviewed.

**26.3 Limits:** Review is subject to standing requirements and jurisdictional rules of the Constitutional Review Council.

**26.4 Enforcement Principle:** Constitutional review is a right, not a privilege. Denial of review by the reviewed actor is constitutionally void.

---

### Article 27 — Right to Exit and Portability

**27.1 Holder:** Every subject participating in AOC Protocol.

**27.2 Scope:** No subject may be structurally trapped within a specific provider, registry implementation, governance domain or runtime deployment when a constitutionally equivalent exit is possible. This includes:
- portability of identity records;
- portability of standing history;
- portability of consent records;
- portability of evidence records;
- exit from governance domains without forfeiture of constitutional protections.

**27.3 Limits:** Exit portability does not require that all governance-domain-specific recognitions transfer automatically to other domains. It requires that the underlying constitutional record — identity, evidence, standing history — is portable.

**27.4 Enforcement Principle:** A system architected to prevent exit through technical lock-in violates this right and is constitutionally non-compliant.

---

## Part IV — Constitutional Duties

Constitutional rights are matched by constitutional duties. The following duties apply to each class of participant in AOC Protocol.

---

### Article 28 — Duties of Individuals

Individuals participating in AOC Protocol MUST:

- Act within the scope of their valid, recognized authority.
- Respect the sovereignty of other individuals, not using the protocol as a means to dominate, capture or impersonate others.
- Not forge, fabricate or misrepresent standing, identity, claims, evidence or authority.
- Respect and participate in challenge processes in good faith.
- Preserve and provide evidence when participating in governance processes where such evidence is constitutionally required.
- Not use protocol mechanisms to evade accountability for acts they have performed.

---

### Article 29 — Duties of Institutions

Institutions operating within AOC Protocol MUST:

- Not capture individual sovereignty. An institution MUST NOT architect its governance so that individual subjects cannot exit, challenge, revoke or exercise their constitutional rights.
- Govern only within the scope of their legitimately recognized jurisdiction.
- Maintain auditability of all governance acts, standing evaluations and decisions.
- Preserve the challenge rights of every subject within their domain.
- Maintain clear separation between institutional identity and the identities of individual members. Institutional authority does not flow automatically to or from member identity.
- Respect revocation and supersession processes, including when they apply to the institution's own authority.
- Disclose conflicts of interest that affect governance processes.

---

### Article 30 — Duties of Governance Authorities

Governance Authorities within AOC Protocol MUST:

- Remain at all times subordinate to RFC-000.
- Act only within the scope of their recognized authority.
- Maintain separation of powers: the authority that adopts rules MUST NOT be the sole authority that enforces and audits those rules.
- Disclose conflicts of interest when considering matters that affect the authority's own standing, scope or composition.
- Preserve the due process rights of subjects affected by governance decisions.
- Maintain constitutional continuity by preserving complete records of governance acts.
- Support review of governance rules by the Constitutional Review Council.
- Not expand their own authority without external ratification.

---

### Article 31 — Duties of Auditors

Auditors within AOC Protocol MUST:

- Maintain independence from the actors, processes and systems they audit.
- Preserve the integrity of evidence relied upon in audit.
- Not perform self-audit of processes in which they are actors.
- Distinguish design-level constitutional failures from runtime-level implementation failures.
- Report constitutional gaps, non-compliance and potential capture accurately and without suppression.
- Preserve audit records and make them available under legitimate constitutional process.
- Challenge their own conclusions when new evidence emerges.

---

### Article 32 — Duties of Protocol Maintainers

Protocol maintainers — those who maintain the canonical specification, repository and reference implementations — MUST:

- Preserve the constitutional hierarchy: no change may be merged that contradicts RFC-000 without a valid amendment having been adopted under Part X.
- Maintain complete version history of all constitutional instruments.
- Preserve public visibility of all changes to constitutional instruments, including editorial changes that affect meaning.
- Distinguish clearly between editorial changes (which do not alter constitutional requirements) and constitutional amendments (which do).
- Not merge changes that reduce constitutional protections unless a valid amendment has been ratified.
- Subject proposed changes to RFC-000 to the formal amendment process, regardless of the change's apparent simplicity.

---

### Article 33 — Duties of Runtime Operators

Those who deploy and operate implementations of AOC Protocol MUST:

- Implement constitutional requirements faithfully and completely.
- Not override, disable or circumvent constitutional safeguards in the interest of performance, operational convenience or cost reduction.
- Preserve records sufficient to support reconstruction, audit and challenge.
- Expose audit interfaces that allow authorized independent auditors to review constitutional compliance.
- Fail closed when constitutional validity cannot be established — meaning the system defaults to preserving rights rather than forcing through an unvalidated act.
- Report discovered constitutional non-compliance to the appropriate governance and audit bodies.
- Not deploy configurations that structurally prevent exit, challenge or revocation.

---

## Part V — Constitutional Legitimacy Chain

### Article 34 — The Canonical Chain

The following chain defines the canonical sequence of constitutional primitives through which legitimate authority is produced within AOC Protocol. Each layer depends on the layer above it. No layer may be bypassed.

```
Identity
    ↓
Evidence
    ↓
Claim
    ↓
Standing
    ↓
Capability
    ↓
Authority
    ↓
Decision
    ↓
Governance
```

**34.1 Identity**

Constitutional function: establishes the recognized existence of a subject within the protocol. Identity is the base primitive. Without recognized identity, no subsequent layer can proceed. Identity is not merely self-claimed — it is recognized through a process defined in RFC-001 and governed by the principles of Article 7.

**34.2 Evidence**

Constitutional function: provides the factual foundation for claims made by or about a subject. Evidence is the basis on which claims are verified and standing is evaluated. Unverified claims without evidence produce no constitutional effects. Evidence is governed by RFC-004.

**34.3 Claim**

Constitutional function: asserts a specific attribute, qualification, relationship or status of a subject, grounded in evidence. Claims are the interface between raw identity and constitutionally recognized standing. Claims are governed by RFC-005.

**34.4 Standing**

Constitutional function: represents the recognized constitutional status of a subject within a specific domain, based on verified claims and accepted evidence. Standing determines which constitutional processes a subject may participate in and which authorities a subject may exercise. Standing is governed by RFC-005-H1 through RFC-005-H3.

**34.5 Capability**

Constitutional function: maps a subject's recognized standing to specific constitutional capabilities — actions that a subject is constitutionally authorized to perform. Capability is not claimed; it is derived from standing through a defined mapping process. Capability is governed by RFC-005-H4 and RFC-005-H7.

**34.6 Authority**

Constitutional function: recognizes a subject's capacity to exercise a defined set of constitutional powers within a defined scope. Authority is recognized by an appropriate governance body on the basis of demonstrated capability. Authority is governed by RFC-005-H8.

**34.7 Decision**

Constitutional function: produces a constitutionally binding outcome within the scope of an actor's recognized authority and the applicable governance rules. Decisions are the operational expression of authority. Decisions are governed by RFC-005-H9.

**34.8 Governance**

Constitutional function: the system of rules, bodies and processes through which the protocol's constitutional requirements are maintained, interpreted, amended and enforced. Governance is the institutional expression of the accumulated legitimacy chain.

---

### Article 35 — No Constitutional Bypass

**35.1 Definition**

A constitutional bypass occurs when a lower or later constitutional effect is produced without satisfying the required prior primitives in the canonical chain.

**35.2 Prohibited Bypasses**

The following are constitutional bypasses and are prohibited:

| Bypass | Description |
|--------|-------------|
| Authority without Standing | Recognizing authority for an actor who has not achieved the required standing. |
| Decision without Authority | Producing a binding constitutional decision without the actor holding recognized authority for that decision. |
| Governance without Legitimacy | Adopting governance rules through a process not grounded in the legitimacy chain. |
| Claim without Evidence | Treating a claim as constitutionally verified without accepted evidence. |
| Capability without Scope | Attributing capabilities to an actor outside the scope defined by their standing. |
| Runtime enforcement without constitutional basis | Enforcing rules that have no constitutional grounding. |
| Amendment without ratification | Treating a proposed amendment as effective without a completed ratification process. |
| Standing without identity | Evaluating standing for an unrecognized subject. |
| Recognition without process | Conferring recognition through informal agreement rather than constitutional process. |

**35.3 Effect of Bypass**

All constitutional bypasses are invalid and produce void or voidable acts, except where RFC-000 explicitly defines an emergency exception under Part XI.

---

### Article 36 — Claimed vs Recognized

**36.1 Principle**

Only recognized constitutional states produce constitutional effects. Claimed states are assertions awaiting recognition. They produce no binding constitutional effects until the recognition process is completed.

**36.2 Distinctions**

| Claimed State | Recognized State | Effect |
|---------------|-----------------|--------|
| Claimed identity | Recognized identity (via RFC-001 process) | Only recognized identity produces standing |
| Claimed evidence | Accepted evidence (via RFC-004 process) | Only accepted evidence supports claims |
| Claimed standing | Recognized standing (via RFC-005-H2 process) | Only recognized standing produces capability |
| Claimed authority | Recognized authority (via RFC-005-H8 process) | Only recognized authority produces valid decisions |
| Proposed decision | Valid decision (via RFC-005-H9 process) | Only valid decisions produce binding outcomes |
| Proposed governance rule | Ratified governance rule | Only ratified rules produce constitutional obligations |

**36.3 Reliance on Claimed States**

No actor may rely upon a claimed but unrecognized state as the basis for a consequential constitutional act. Any act that relies on a claimed but unrecognized state inherits the constitutional deficiency of that claim.

---

## Part VI — Bootstrap of Legitimacy

### Article 37 — The Bootstrap Problem

**37.1 Statement of the Problem**

Every governance system faces an irreducible bootstrap problem: the first governance authority cannot derive its legitimacy from a pre-existing governance authority, because none exists. Yet without legitimate governance authority, the protocol has no constitutional foundation.

This creates a circularity: governance legitimacy requires a legitimate process; a legitimate process requires governance; the first governance authority must therefore establish both simultaneously.

**37.2 Prohibited Solutions**

AOC Protocol MUST NOT resolve the bootstrap problem through:

- **Founder absolutism:** Permanent constitutional supremacy granted to original authors.
- **Self-recognition:** An authority declaring its own legitimacy without independent ratification.
- **Hidden councils:** Informal groups who informally establish governance without transparent process.
- **Market capture:** Treating widespread adoption as constitutional ratification.
- **Technical maintainer capture:** Allowing those who control the repository or runtime to hold permanent governance authority by virtue of that control.
- **Institutional capture:** Delegating bootstrap legitimacy to an existing external institution without a defined, challengeable process.

**37.3 Required Properties of the Solution**

The adopted bootstrap doctrine must:

- be transparent and publicly documented;
- define a clear start and end for the bootstrap period;
- limit the powers exercised during bootstrap;
- produce a recognizably legitimate first governance authority through a challengeable process;
- sunset bootstrap-period powers after ratification;
- prohibit permanent founder supremacy.

---

### Article 38 — Bootstrap Models Considered

Three models were evaluated in the development of this Charter.

**38.1 Model A — Founder Model**

*Description:* The initial founders act as the Genesis Authority with full governance powers from the moment the protocol is published.

*Advantages:*
- Operational simplicity.
- Clear decision-making structure during initial development.
- Fast initial deployment.

*Risks:*
- Creates permanent governance capture risk.
- Founders may not be representative of the broader participant community.
- Initial governance acts may be self-serving without external checks.
- No formal mechanism forces transition to broader governance.

*Capture potential:* High. The history of open protocols demonstrates that founder-controlled governance rarely produces voluntary power transfer.

*Legitimacy weaknesses:* An authority that recognized itself cannot trace its legitimacy through the canonical chain. All acts produced under founder authority inherit this deficiency.

**38.2 Model B — Ratification Model**

*Description:* A provisional charter is drafted and published. It becomes constitutionally effective only after a defined ratification event that satisfies minimum participation and review criteria.

*Advantages:*
- Clear legitimacy: the Constitution is not effective until ratified.
- Transition from provisional to ratified state is observable and challengeable.
- Participants who ratify take on constitutional duties.

*Risks:*
- Ratification may be captured by a narrow group.
- Without rules about who may participate in ratification, the model can replicate the founder model through selective invitation.
- Long ratification periods may produce governance vacuums.

*Requirements:* The ratification threshold must be defined, the ratification body must be independent of the founders, and the ratification process must be publicly observable.

*Legitimacy strengths:* Strong, provided the ratification process itself is constitutionally sound.

**38.3 Model C — Sovereignty-First Model**

*Description:* No actor begins with permanent governance authority. Initial participants begin with self-claimed identity and limited standing. Legitimacy emerges through transparent ratification, evidence of participation, and challengeable recognition. Governance authority is earned through the canonical chain over time.

*Advantages:*
- Most aligned with the legitimacy chain defined in Part V.
- Prevents premature consolidation of governance authority.
- Produces governance structures that are genuinely legitimacy-derived.

*Risks:*
- Bootstrap complexity: the protocol cannot govern itself until governance is established, creating a coordination challenge.
- Risk of governance vacuum during the initial period.
- Vulnerable to capture during the unstructured initial phase.

*Alignment with AOC:* Highest alignment with AOC's core constitutional principles. The bootstrapping cost is worth the legitimacy gain.

---

### Article 39 — Adopted Bootstrap Doctrine

AOC Protocol adopts a **Sovereignty-First Ratification Model** that combines elements of Models B and C with additional safeguards.

**39.1 Principles of the Adopted Doctrine**

1. **Provisional founder role:** The initial authors of RFC-000 serve as constitutional stewards during the Genesis Period defined in Article 40. They MUST NOT be treated as holding permanent governance authority.

2. **Limited founder powers:** During the Genesis Period, founding stewards may:
   - Draft and publish constitutional instruments;
   - Propose participants for the initial ratification process;
   - Facilitate the organization of the ratification event;
   - Publish constitutional audits;
   - Receive and record challenges.

   Founding stewards MUST NOT during the Genesis Period:
   - Adopt binding governance rules;
   - Recognize authority for themselves or their affiliates without independent process;
   - Conduct decisions with permanent constitutional effect;
   - Prevent challenges to the constitutional instruments being drafted.

3. **Temporary constitutional stewardship:** The founding stewards hold a fiduciary duty to the constitutional principles, not to their own interests.

4. **Public ratification event:** The Constitution becomes constitutionally effective upon completion of a public ratification event that satisfies the criteria defined in Article 41.

5. **First Governance Authority recognition:** The first Governance Authority is recognized through the ratification process, not appointed by the founders.

6. **Sunset of founder privileges:** Upon completion of ratification, all bootstrap-period powers held by founding stewards expire automatically. Former stewards participate as ordinary subjects of the protocol thereafter.

7. **Prohibition on permanent founder supremacy:** No provision of any RFC, governance rule or decision may restore constitutional supremacy to any founding steward after the Genesis Period.

**39.2 The Founding Stewards' Pledge**

Any actor who serves as a founding constitutional steward implicitly agrees to the following:

- I hold authority in trust for the constitutional principles, not for myself.
- I will facilitate ratification, not control it.
- I will step down when ratification is complete.
- I will support challenges to the instruments I draft.
- I will not use my position to ensure a predetermined outcome.

---

### Article 40 — Genesis Period

**40.1 Definition**

The Genesis Period is the defined interval between the initial publication of RFC-000 as a draft and the completion of the first constitutional ratification event.

**40.2 Events of the Genesis Period**

During the Genesis Period, the following MUST occur:

1. RFC-000 is drafted and published as a public draft.
2. All initial constitutional RFCs (RFC-001, RFC-004, RFC-005 series) are published.
3. Criteria for ratification participation are published.
4. A challenge window is opened for all published constitutional instruments.
5. Constitutional challenges are received, recorded and addressed.
6. Candidate participants in the first governance authority are proposed.
7. The ratification event is organized and conducted.
8. The first Governance Authority is recognized through ratification.

**40.3 Genesis Period Powers**

During the Genesis Period only, founding stewards MAY exercise the limited powers defined in Article 39. These powers are constitutional exceptions, not precedents.

**40.4 Genesis Period Limits**

- The Genesis Period has a defined maximum duration. If ratification does not occur within that duration, the Genesis Period MUST be formally extended with a published explanation and challenge window, or the constitutional process restarted.
- No act performed during the Genesis Period may be used as a precedent for expanding founder powers after ratification.
- All Genesis Period acts MUST be archived in the constitutional record.

**40.5 End of Genesis**

The Genesis Period ends upon:

- Completion of the ratification event, or
- Formal constitutional determination that the Genesis Period must be restarted.

**40.6 Challenge Path**

Any participant in the Genesis Period MAY file a formal constitutional challenge to any aspect of the Genesis process. Such challenges MUST be recorded, addressed and archived before ratification is declared complete.

---

### Article 41 — First Governance Authority

**41.1 Constitutional Legitimacy Requirement**

The first Governance Authority of AOC Protocol becomes legitimate only through a ratification process that satisfies the following criteria:

**41.2 Identity of Provisional Recognizers**

The ratification body consists of subjects who:

- hold recognized identity within the protocol;
- are independent of the founding stewards (no steward may be the sole recognizer of their own governance authority);
- represent a diversity of participation types — individual participants, institutional participants and technical participants should each be represented;
- have publicly declared their participation and basis for participation before the ratification event.

**41.3 Evidence of Participation**

Every participant in the ratification event MUST:

- have a recorded identity in the canonical identity registry;
- have filed their participation declaration within the published window;
- have reviewed the constitutional instruments being ratified.

**41.4 Ratification Threshold**

The ratification threshold MUST require:

- A meaningful quorum of participants, defined in the ratification event criteria;
- Independent review by at least one body with no pre-existing governance interest;
- A challenge window during which objections may be filed and must be resolved before ratification closes.

**41.5 Challenge Window**

Before ratification is declared complete, a public challenge window MUST remain open for a defined period. All filed challenges MUST be addressed and archived.

**41.6 Publication of Recognition Basis**

The basis for recognizing the first Governance Authority MUST be published, including:

- list of participating ratifiers;
- evidence of their participation;
- any challenges filed and how they were resolved;
- the scope of authority recognized;
- the review date or expiration conditions.

**41.7 Anti-Capture Check**

Before ratification is finalized, an independent anti-capture check MUST be conducted, confirming that no single actor or closely affiliated group controls a majority of the ratification votes.

**41.8 No Self-Perpetuation**

The first Governance Authority MUST NOT be constitutionally capable of perpetuating itself indefinitely without review. Its recognition MUST include:

- a review date or term limit;
- a defined process for succession;
- a prohibition on modifying the rules governing its own composition without external ratification.

---

## Part VII — Constitutional Court

### Article 42 — The Constitutional Review Council

**42.1 Establishment**

AOC Protocol establishes a **Constitutional Review Council** (the "Council") as the supreme body for constitutional interpretation, conflict resolution and review of constitutional compliance within the protocol.

**42.2 Nature**

The Constitutional Review Council is a constitutional body, not a governance body. It does not produce governance rules. It reviews constitutional compliance and produces interpretive and invalidation determinations. Its authority derives from RFC-000, not from any Governance Authority.

**42.3 Purposes**

The Council exists to:

- Interpret RFC-000 in cases of genuine ambiguity;
- Resolve conflicts between constitutional instruments (see Part IX);
- Review RFCs, governance rules, runtime implementations and decisions for constitutional compliance;
- Invalidate unconstitutional acts;
- Preserve constitutional continuity across governance and technical transitions;
- Serve as the final arbiter of constitutional interpretation within AOC Protocol.

---

### Article 43 — Jurisdiction

The Constitutional Review Council has jurisdiction to review and determine:

- Conflicts between RFC and RFC;
- Conflicts between any RFC and RFC-000;
- Conflicts between runtime behavior and constitutional requirements;
- Conflicts between governance rules and constitutional requirements;
- Conflicts between decisions and recognized authority;
- Conflicts between claimed authority and recognized standing;
- Emergency actions for constitutional compliance;
- Proposed amendments for validity prior to ratification;
- Bootstrap disputes during and after the Genesis Period.

The Council's jurisdiction is triggered by:

- a formal challenge filed by a subject with standing;
- a referral by a Governance Authority;
- a referral by a recognized auditor;
- an autonomous review initiated by the Council under its constitutional mandate.

---

### Article 44 — Limits of the Council

The Constitutional Review Council MUST NOT:

- Rewrite RFC-000 unilaterally. Only the amendment process of Part X may modify RFC-000.
- Create new authority for itself beyond what is defined in this Charter.
- Self-appoint permanent members. Council composition is governed by Article 45.
- Block challenges against its own decisions. Council decisions are subject to the challenge process defined in Article 15.
- Override a completed ratification. The Council may review the ratification process for constitutional compliance, but may not substitute its judgment for a valid ratification outcome.
- Eliminate individual sovereignty or institutional sovereignty by interpretation.
- Suspend anti-capture protections.
- Produce decisions with retroactive effect that erase historically valid acts.

---

### Article 45 — Council Composition

**45.1 Principles**

The composition of the Constitutional Review Council MUST satisfy the following principles:

- **Independence:** Members of the Council MUST NOT hold concurrent governance authority in any body whose acts the Council may review. Independence is structural, not merely declared.

- **Rotation:** No permanent members. All positions are subject to defined terms and rotation to prevent entrenchment.

- **Conflict disclosure:** Every member must disclose conflicts of interest before participating in any matter in which they have an interest. Conflicted members MUST recuse.

- **No self-review:** No member may participate in review of acts in which they were an actor.

- **Term limits:** Members hold positions for defined terms, after which they must leave or be re-confirmed through a new constitutional process.

- **Challengeability:** The composition of the Council, the basis for any member's appointment, and the process of any appointment may be challenged by subjects with standing.

- **Diversity of authority sources:** No single Governance Authority, institution, jurisdiction or technical implementation may appoint a majority of the Council.

- **No single institution control:** No single institution may hold more than a constitutionally defined minority of Council seats.

**45.2 Appointment**

Council members are appointed through a process that:

- requires recognition of their standing by a body independent of the appointing authority;
- is publicly documented;
- is challengeable before the appointment takes effect.

**45.3 Removal**

Council members may be removed through:

- a valid constitutional challenge;
- a governance process that satisfies independence requirements;
- expiration of term.

Removal must be documented and archived.

---

## Part VIII — Constitutional Review

### Article 46 — Review of RFCs

**46.1** Every RFC within AOC Protocol is subject to constitutional review against RFC-000 at any time upon a valid challenge or referral.

**46.2** Review of an RFC must determine:

- Whether the RFC derives its constitutional authority validly from RFC-000 or an applicable superior instrument;
- Whether the RFC contradicts any higher-order constitutional principle;
- Whether the RFC creates unconstitutional authority — authority that is unlimited, self-recognizing, non-delegated, non-challengeable or beyond any scope definition;
- Whether the RFC preserves the constitutional rights of subjects (challenge, audit, revocation, transparency, anti-capture);
- Whether the RFC maintains the canonical legitimacy chain.

**46.3** An RFC found to be unconstitutional is void to the extent of the contradiction. The remaining valid provisions of the RFC, if separable, remain in effect.

---

### Article 47 — Review of Runtime

**47.1** Every runtime implementation of AOC Protocol is subject to constitutional review.

**47.2** A runtime is unconstitutional if it:

- Bypasses required primitives in the canonical chain;
- Prevents any subject with standing from exercising their right to challenge;
- Prevents authorized independent audit;
- Prevents reconstruction of constitutional state;
- Creates unbounded authority through its implementation logic;
- Captures identity by making migration structurally impossible;
- Erases or overwrites constitutional history;
- Allows any subject to self-recognize standing or authority;
- Allows any subject to self-audit their own acts;
- Produces decisions without the actor holding recognized authority.

**47.3** A runtime found to be unconstitutional in any of the above respects is non-compliant and operators must remediate within a defined period or cease constitutional operations.

---

### Article 48 — Review of Governance Rules

**48.1** Governance rules are subject to constitutional review for:

- Whether the rule was adopted by a legitimately recognized Governance Authority within its scope;
- Whether the adopting authority followed the required governance process;
- Whether the rule itself is consistent with RFC-000;
- Whether the rule is challengeable by subjects it affects;
- Whether the rule contains anti-capture safeguards.

**48.2** A governance rule adopted outside the scope of the adopting authority is void. A governance rule that contradicts RFC-000 is void to the extent of the contradiction.

---

### Article 49 — Review of Decisions

**49.1** Consequential decisions are subject to constitutional review for:

- Whether the decision-maker held recognized authority for the specific decision;
- Whether the applicable governance process was followed;
- Whether the decision was within the defined scope of the authority;
- Whether the decision has a valid governance basis;
- Whether the decision is supported by accepted evidence;
- Whether an accessible challenge path exists;
- Whether the decision is auditable by an independent body;
- Whether the constitutional state at the time of the decision is reconstructable.

**49.2** A decision found to be unconstitutional on any of the above grounds is void or voidable depending on the nature of the deficiency.

---

## Part IX — Conflict Resolution

### Article 50 — Conflict Types

The following conflict types are recognized within AOC Protocol and are subject to formal constitutional resolution:

| Conflict Type | Description |
|---------------|-------------|
| RFC vs RFC | Two RFCs impose contradictory requirements |
| RFC vs Runtime | A runtime behavior contradicts an RFC requirement |
| Governance Rule vs RFC | A governance rule contradicts an RFC |
| Governance Rule vs RFC-000 | A governance rule contradicts this Charter |
| Decision vs RFC-000 | A decision is inconsistent with a Charter principle |
| Authority vs RFC-000 | A recognized authority exceeds constitutional limits |
| Standing vs RFC-000 | A standing evaluation violates constitutional requirements |
| Runtime vs constitutional requirement | Runtime behavior fails to satisfy a Charter requirement |
| Emergency action vs constitutional protections | An emergency act violates Charter-protected rights |

---

### Article 51 — Conflict Resolution Order

When a conflict is identified, it is resolved by the following hierarchy, applied in order:

1. **RFC-000 controls.** In any conflict involving RFC-000, RFC-000 prevails. No exception applies except through a valid ratified amendment.

2. **Ratified constitutional amendment controls** if it validly addresses the specific conflict and was adopted through the process of Part X.

3. **More specific constitutional RFC controls over general technical RFC** when two RFCs of the same rank conflict and one is more specifically applicable to the subject matter of the conflict.

4. **Later RFC controls over earlier RFC** only if the later RFC was properly ratified, is not unconstitutional and the conflict is not addressed by a higher-ranking instrument.

5. **Runtime never controls over RFC.** When runtime behavior contradicts an RFC requirement, the RFC requirement controls. The runtime must be corrected.

6. **Operational policy never controls over runtime constitutional constraints.** When an operational policy conflicts with a constitutional runtime constraint, the constitutional constraint controls.

7. **Emergency action never permanently overrides constitutional rights.** Emergency measures may temporarily narrow the exercise of rights under the conditions of Part XI, but may never permanently eliminate them.

---

### Article 52 — Interpretation During Conflict

When a conflict between constitutional instruments is ambiguous — meaning the resolution hierarchy does not clearly produce a single outcome — the following interpretive rules apply:

- **Preserve sovereignty:** The interpretation that better preserves individual and institutional sovereignty controls.
- **Preserve challengeability:** The interpretation that better preserves the right to challenge controls.
- **Preserve auditability:** The interpretation that produces a more auditable outcome controls.
- **Preserve historical truth:** The interpretation that better protects the continuity of constitutional records controls.
- **Limit power:** The interpretation that grants less authority to the conflicting parties controls.
- **Prevent capture:** The interpretation that is less susceptible to capture by a single actor controls.
- **Prefer reversible remedies:** Where possible, choose interpretations that produce reversible rather than permanent outcomes.
- **Fail closed for authority expansion:** Ambiguity about whether authority exists MUST be resolved against the existence of the authority.
- **Fail open for rights protection:** Ambiguity about whether a right applies MUST be resolved in favor of the right, where doing so is safe.

---

## Part X — Constitutional Amendments

### Article 53 — Amendment Authority

**53.1** Only the following actors may propose amendments to RFC-000:

- Recognized Governance Authorities within their constitutional scope;
- The Constitutional Review Council;
- Recognized auditors on matters within their audit scope;
- Any subject holding sufficient standing, as defined by applicable governance rules;
- Any recognized institution with sufficient standing;
- Emergency review bodies, under the narrow conditions defined in Article 57.

**53.2** Proposal of an amendment does not confer authority to adopt it. Adoption requires ratification under Article 55.

---

### Article 54 — Amendment Process

Every amendment to RFC-000 MUST follow this ten-step process:

1. **Proposal:** The proposed amendment is formally submitted with a complete specification of the change.

2. **Publication:** The proposed amendment is published publicly in a designated constitutional record accessible to all subjects.

3. **Evidence and Rationale:** The proposing actor must submit a constitutional rationale explaining why the amendment is necessary, what problem it solves and why it is consistent with the unamendable core of Article 56.

4. **Constitutional Impact Analysis:** An independent constitutional impact analysis is conducted, assessing:
   - effects on all existing RFCs;
   - effects on subject rights;
   - effects on governance structure;
   - potential capture risks introduced;
   - consistency with the legitimacy chain.

5. **Challenge Window:** A defined public challenge window opens. Any subject with standing may file a constitutional challenge to the proposed amendment. Challenges must be addressed before the process advances.

6. **Review by the Constitutional Review Council:** The Council reviews the proposed amendment for constitutional validity.

7. **Ratification:** The amendment is submitted to a ratification process satisfying the requirements of Article 55.

8. **Adoption:** Upon successful ratification, the amendment is adopted with a defined effective date.

9. **Transition Period:** A transition period is defined during which affected RFCs, runtimes and governance rules must be updated to conform.

10. **Archival:** The superseded text is archived in the constitutional record with a timestamp and reference to the adopting amendment.

---

### Article 55 — Ratification Requirements

Ratification of a constitutional amendment MUST satisfy:

- **Quorum:** A defined minimum number of eligible participants must participate in the ratification process.
- **Independence:** The ratifying body must be independent of the primary beneficiary of the proposed amendment.
- **Anti-Capture Review:** An independent review must confirm that no single actor or affiliated group controls a majority of ratification votes.
- **Public Record:** The ratification process and outcome must be publicly documented and archived.
- **Challenge Window:** A challenge window must remain open before the ratification is declared final.
- **Evidence of Participation:** Every ratifying participant must have a recorded identity and documented basis for their participation.
- **Effective Date:** Ratification must produce a defined effective date.
- **Versioning:** The ratified amendment must produce a new version identifier for RFC-000 or the affected instruments.

---

### Article 56 — Unamendable Core

**56.1** The following constitutional principles constitute the unamendable core of RFC-000. No amendment may eliminate, negate or reduce these principles below the floor established by this Charter:

- Individual sovereignty
- Institutional sovereignty
- The right to challenge
- Auditability
- Anti-capture
- Accountability
- Constitutional supremacy of RFC-000
- Historical preservation and continuity
- Revocability of recognized power
- Prohibition of unlimited authority

**56.2** These principles MAY be clarified, strengthened, extended or operationalized by amendment. They MUST NOT be abolished, suspended, narrowed below their current floor or conditioned on circumstances that would effectively eliminate them.

**56.3** An amendment that purports to modify the unamendable core is constitutionally void to the extent of the modification. The Constitutional Review Council has jurisdiction to identify and declare such void amendments under Article 43.

---

### Article 57 — Emergency Amendments

**57.1** During a declared constitutional emergency, a limited class of temporary amendments may be adopted through an expedited process.

**57.2** Emergency amendments MUST:

- Be temporary, with an automatic expiration date that does not exceed the duration of the emergency plus a defined review period;
- Be reviewable by the Constitutional Review Council;
- Preserve the right to challenge, even if the process is modified;
- Not permanently eliminate any right from the unamendable core;
- Be publicly archived with full documentation of the emergency context;
- Be ratified or voided through normal constitutional process within a defined period after the emergency ends.

**57.3** An emergency amendment that is not ratified within the required period after the emergency automatically expires.

**57.4** No provision of an emergency amendment may be used as a precedent for expanding powers in non-emergency contexts.

---

## Part XI — Constitutional Emergencies

### Article 58 — Constitutional Emergency

**58.1 Definition**

A constitutional emergency is a condition in which one or more layers of the canonical legitimacy chain become unavailable, compromised, captured or inoperable such that the constitutional functions of those layers cannot be performed through normal process.

**58.2 Emergency Conditions**

Constitutional emergencies include but are not limited to:

- A recognized Governance Authority becomes non-functional, captured or self-dealing.
- The identity registry becomes unavailable or compromised.
- The evidence layer is systematically corrupted.
- An authority system is captured by a single actor.
- A runtime becomes non-compliant and cannot be corrected through normal governance.
- The decision registry is irreconcilably forked.
- The Constitutional Review Council is incapacitated.
- A cryptographic primitive on which recognition or evidence depends is compromised.
- An institution central to the governance chain collapses.

**58.3 Declaration**

A constitutional emergency may be declared by:

- The Constitutional Review Council;
- A majority of recognized Governance Authorities acting jointly;
- An emergency auditor body with recognized standing.

A declaration MUST include: the specific condition triggering the emergency, the affected constitutional layer, the estimated scope and duration, and the proposed emergency measures.

---

### Article 59 — Emergency Powers

**59.1** Emergency powers are constitutionally valid only when:

- A constitutional emergency has been formally declared;
- The powers are narrowly scoped to the specific constitutional failure;
- The powers are the minimum necessary to address the failure;
- The powers are time-limited, expiring automatically at the end of the emergency or after a defined maximum period;
- The powers are independently auditable;
- The powers are challengeable, even if through a modified process;
- The powers cannot permanently amend RFC-000 or the unamendable core;
- The powers are subject to review immediately after expiration.

**59.2** Emergency powers MUST NOT:

- Suspend individual sovereignty;
- Eliminate the right to challenge;
- Allow self-recognition or self-audit;
- Create permanent constitutional effects;
- Transfer governance authority to unrecognized actors without expedited ratification;
- Erase or overwrite constitutional records.

---

### Article 60 — Continuity Under Emergency

**60.1** During a constitutional emergency, the protocol MUST continue to preserve:

- All identity records and their history;
- All evidence records and acceptance histories;
- All standing records and evaluation histories;
- All authority recognition records and their histories;
- All decision records and audit trails;
- All challenge records, including unresolved challenges;
- The constitutional records of the emergency itself;
- The ability of subjects to reconstruct their constitutional state.

**60.2** Emergency infrastructure MUST prioritize preservation of records over all other operational functions. When there is a conflict between operational capability and record preservation, record preservation controls.

---

### Article 61 — Constitutional Restoration

**61.1** After a constitutional emergency ends, the following restoration process MUST occur:

1. All emergency acts are reviewed by the Constitutional Review Council or an equivalent independent body for constitutional compliance.

2. Acts found to be invalid are marked as such in the constitutional record, with documentation of the invalidity.

3. Acts found to be constitutionally valid are preserved in the permanent constitutional record.

4. Temporary powers expire on their scheduled date or upon formal closure of the emergency, whichever is earlier.

5. Every subject affected by an emergency act receives an explanation of the acts that affected them and their constitutional status.

6. Challenge windows reopen for emergency acts that have not yet been reviewed.

7. Normal constitutional operations resume under the governing instruments as of the start of the emergency, updated by any validly ratified acts that occurred during the emergency.

---

## Part XII — Constitutional Invariants

The following invariants are unconditional constitutional requirements. Each invariant is a minimum floor. No RFC, governance rule, runtime, decision or amendment may violate an invariant unless the invariant is modified through the formal amendment process of Part X, subject to the unamendable core of Article 56.

### Group A — Sovereignty Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-A01 | No system within AOC may assert ownership of an individual subject. |
| RFC000-INV-A02 | No institution may absorb individual sovereignty through governance participation. |
| RFC000-INV-A03 | Institutional sovereignty must not erase individual sovereignty. |
| RFC000-INV-A04 | Exit must remain structurally possible where a constitutionally equivalent alternative exists. |
| RFC000-INV-A05 | Individual identity is portable and not captive to any single runtime or registry. |
| RFC000-INV-A06 | Individual consent cannot be assumed from participation alone. |
| RFC000-INV-A07 | Institutional authority does not imply ownership of individual data. |
| RFC000-INV-A08 | Withdrawal from a governance domain does not forfeit the individual's constitutional protections. |
| RFC000-INV-A09 | No subject's constitutional rights depend solely on the continued operation of any single institution. |
| RFC000-INV-A10 | Sovereignty is recognized by this Charter; it is not granted by any governance authority. |

### Group B — Legitimacy Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-B01 | No authority without recognized standing. |
| RFC000-INV-B02 | No decision without recognized authority. |
| RFC000-INV-B03 | No governance without legitimacy traceable through the canonical chain. |
| RFC000-INV-B04 | No recognition without a traceable process. |
| RFC000-INV-B05 | No legitimacy by assertion alone. |
| RFC000-INV-B06 | No standing without recognized identity. |
| RFC000-INV-B07 | No capability without recognized standing in the applicable scope. |
| RFC000-INV-B08 | Legitimacy must be reconstructable from preserved records. |
| RFC000-INV-B09 | No bypass of a required legitimacy chain primitive. |
| RFC000-INV-B10 | Claimed legitimacy and recognized legitimacy are constitutionally distinct. |

### Group C — Consent Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-C01 | Consent must be explicit. Implied or assumed consent is not constitutionally valid. |
| RFC000-INV-C02 | Consent must be bounded to a specific purpose. |
| RFC000-INV-C03 | Consent must be revocable where constitutionally revocable. |
| RFC000-INV-C04 | Consent cannot be silently expanded beyond its original scope. |
| RFC000-INV-C05 | Delegated consent cannot exceed the scope of the original consent. |
| RFC000-INV-C06 | Consent obtained under coercive conditions is constitutionally void. |
| RFC000-INV-C07 | Emergency exceptions to consent requirements must be the minimum necessary and time-limited. |
| RFC000-INV-C08 | The record of consent must be preserved and auditable. |
| RFC000-INV-C09 | Consent may not be conditioned on waiver of constitutional rights. |
| RFC000-INV-C10 | Institutional consent does not substitute for individual consent where individual consent is required. |

### Group D — Authority Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-D01 | Authority cannot self-create. |
| RFC000-INV-D02 | Authority cannot self-recognize. |
| RFC000-INV-D03 | Authority cannot self-expand. |
| RFC000-INV-D04 | Authority cannot self-audit. |
| RFC000-INV-D05 | Authority cannot exceed its defined scope. |
| RFC000-INV-D06 | Authority cannot exceed its defined time limit. |
| RFC000-INV-D07 | Authority cannot be transferred without a valid delegation process. |
| RFC000-INV-D08 | Unlimited authority is unconstitutional. |
| RFC000-INV-D09 | Authority exercised beyond its scope is void. |
| RFC000-INV-D10 | Authority held by a captured actor is constitutionally suspect and subject to emergency review. |
| RFC000-INV-D11 | Market adoption confers no authority. |
| RFC000-INV-D12 | Technical control of a runtime confers no governance authority. |

### Group E — Decision Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-E01 | Every decision requires a recognized decision authority. |
| RFC000-INV-E02 | Every decision requires a valid constitutional process. |
| RFC000-INV-E03 | Every decision must have a defined scope. |
| RFC000-INV-E04 | Every consequential decision must be challengeable. |
| RFC000-INV-E05 | Every consequential decision must be reconstructable. |
| RFC000-INV-E06 | A decision produced by an unconstitutional authority is void. |
| RFC000-INV-E07 | A decision produced outside the authority's scope is void. |
| RFC000-INV-E08 | A decision without an accessible explanation is non-compliant. |
| RFC000-INV-E09 | No decision may retroactively erase a valid prior act without constitutional process. |
| RFC000-INV-E10 | Emergency decisions must be time-limited and subject to post-emergency review. |

### Group F — Governance Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-F01 | Governance is subordinate to RFC-000. |
| RFC000-INV-F02 | All governance rules must be challengeable. |
| RFC000-INV-F03 | Governance cannot eliminate the right to challenge. |
| RFC000-INV-F04 | Governance cannot eliminate audit. |
| RFC000-INV-F05 | Governance cannot make itself constitutionally supreme. |
| RFC000-INV-F06 | A governance rule adopted outside the authority's scope is void. |
| RFC000-INV-F07 | A governance authority cannot modify the rules governing its own composition without external ratification. |
| RFC000-INV-F08 | A governance authority cannot grant itself authority beyond its recognized scope. |
| RFC000-INV-F09 | Governance must maintain a publicly accessible record of its rules and rule-adoption history. |
| RFC000-INV-F10 | No governance authority may be permanent without a defined review mechanism. |

### Group G — Review Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-G01 | Every consequential constitutional act must be reviewable against RFC-000. |
| RFC000-INV-G02 | Constitutional review cannot be blocked by the actor whose act is under review. |
| RFC000-INV-G03 | Review must preserve records. |
| RFC000-INV-G04 | Review must be independent where power is at stake. |
| RFC000-INV-G05 | Review findings must be documented and archived. |
| RFC000-INV-G06 | A subject who initiates review in good faith must not be penalized for doing so. |
| RFC000-INV-G07 | Review of the Constitutional Review Council itself must be available. |
| RFC000-INV-G08 | Review does not require certainty of violation — a credible basis is sufficient for review to proceed. |
| RFC000-INV-G09 | Review findings are advisory with respect to future conduct and binding with respect to the specific act reviewed. |
| RFC000-INV-G10 | A pattern of adverse review findings triggers mandatory governance review of the reviewed actor. |

### Group H — Amendment Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-H01 | No amendment without ratification through the process of Part X. |
| RFC000-INV-H02 | No hidden or informal amendment. |
| RFC000-INV-H03 | No retroactive erasure of constitutional history through amendment. |
| RFC000-INV-H04 | No emergency amendment may be permanent without ratification. |
| RFC000-INV-H05 | No amendment may abolish individual sovereignty. |
| RFC000-INV-H06 | No amendment may abolish the right to challenge. |
| RFC000-INV-H07 | No amendment may abolish auditability. |
| RFC000-INV-H08 | No amendment may abolish anti-capture protections. |
| RFC000-INV-H09 | Every amendment must have a documented rationale and constitutional impact analysis. |
| RFC000-INV-H10 | The amendment process itself must be publicly auditable. |

### Group I — Anti-Capture Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-I01 | No actor may control all stages of the legitimacy chain. |
| RFC000-INV-I02 | No self-audit of one's own constitutional acts. |
| RFC000-INV-I03 | No self-recognition of one's own standing or authority. |
| RFC000-INV-I04 | No monopoly over identity recognition. |
| RFC000-INV-I05 | No monopoly over evidence acceptance. |
| RFC000-INV-I06 | No monopoly over standing evaluation. |
| RFC000-INV-I07 | No monopoly over authority recognition. |
| RFC000-INV-I08 | No monopoly over constitutional interpretation. |
| RFC000-INV-I09 | No monopoly over the amendment process. |
| RFC000-INV-I10 | No monopoly over audit. |
| RFC000-INV-I11 | No actor may control both the creation and the oversight of the same power. |
| RFC000-INV-I12 | Capture of any layer triggers constitutional emergency review of that layer. |

### Group J — Continuity and History Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-J01 | Constitutional records may not be deleted. |
| RFC000-INV-J02 | Constitutional records may not be overwritten retroactively. |
| RFC000-INV-J03 | Revocation does not erase the historical record of the revoked act. |
| RFC000-INV-J04 | Supersession does not erase the historical record of the superseded instrument. |
| RFC000-INV-J05 | The constitutional state at any historical point must be reconstructable. |
| RFC000-INV-J06 | Emergency acts must be archived in the permanent constitutional record. |
| RFC000-INV-J07 | The history of every recognized subject must survive governance transitions. |
| RFC000-INV-J08 | Records preservation takes priority over operational efficiency when they conflict. |
| RFC000-INV-J09 | Any act that destroys constitutional records is constitutionally void and constitutes a capture indicator. |
| RFC000-INV-J10 | The archive of superseded constitutional instruments must remain publicly accessible. |

### Group K — Process Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-K01 | No constitutional process may exclude subjects with valid standing without a constitutional basis. |
| RFC000-INV-K02 | Process requirements must be published before the process occurs. |
| RFC000-INV-K03 | Challenge windows must be open before a process produces final constitutional effects. |
| RFC000-INV-K04 | An actor who controls a process MUST NOT be the sole reviewer of that process. |
| RFC000-INV-K05 | Due process requires an accessible, known, fair procedure before adverse acts. |
| RFC000-INV-K06 | Due process requirements cannot be waived by governance rule. |
| RFC000-INV-K07 | Emergency process exceptions must be documented and reviewed after the emergency. |

### Group L — Bootstrap and Genesis Invariants

| ID | Invariant |
|----|-----------|
| RFC000-INV-L01 | No founder holds permanent governance supremacy. |
| RFC000-INV-L02 | The Genesis Period has a defined end; it does not extend indefinitely. |
| RFC000-INV-L03 | Founding steward powers expire automatically upon completion of ratification. |
| RFC000-INV-L04 | The first Governance Authority must be recognized through a challengeable process. |
| RFC000-INV-L05 | No act of the Genesis Period may be used as a precedent for expanded founder authority post-ratification. |
| RFC000-INV-L06 | The first Governance Authority cannot be self-perpetuating without a defined review process. |
| RFC000-INV-L07 | Bootstrap disputes must be adjudicated through a process independent of the founders. |

---

## Part XIII — Constitutional Compliance

### Article 62 — Constitutionally Compliant

An RFC, runtime, governance rule or decision is **constitutionally compliant** when it satisfies all of the following:

1. It derives its authority from a source recognized by RFC-000 or a valid superior instrument.
2. It was produced through a constitutionally valid process.
3. It is consistent with all constitutional principles in Part II.
4. It does not violate any right established in Part III.
5. It does not violate any constitutional invariant in Part XII.
6. It has not been voided, superseded or revoked by a valid constitutional act.
7. It preserves the rights of subjects to challenge, audit, reconstruct and revoke.
8. It maintains the canonical legitimacy chain and does not create a constitutional bypass.

---

### Article 63 — Constitutionally Non-Compliant

**63.1 Remediable Non-Compliance**

An artifact is **remediably non-compliant** when it fails to satisfy one or more compliance criteria but the failure is correctable without voiding all downstream effects. Remediable non-compliance creates a duty to remediate within a defined period.

*Examples:*
- A governance decision that is missing a required audit trail element, where the trail can be reconstructed.
- A runtime that does not expose an audit interface but otherwise implements constitutional requirements correctly.
- An RFC that omits a required challenge mechanism but does not create unconstitutional authority.

**63.2 Non-Remediable Non-Compliance**

An artifact is **non-remediably non-compliant** when the constitutional failure is structural and cannot be corrected without voiding the affected artifact and its downstream effects.

*Examples:*
- A governance rule that structurally eliminates the right to challenge.
- A runtime that architecturally prevents identity portability.
- An RFC that creates unlimited, unchecked authority.

Non-remediably non-compliant artifacts are constitutionally void to the extent of the non-compliance.

---

### Article 64 — Constitutionally Invalid

An artifact is **constitutionally invalid** when:

- It was produced by an actor without recognized authority for the specific act;
- It bypassed a required primitive in the canonical legitimacy chain;
- It was produced in violation of a constitutional invariant;
- Its originating process was void ab initio.

Constitutional invalidity is a determination made by the Constitutional Review Council under its jurisdiction in Article 43. An invalid artifact produces no constitutional effects, regardless of reliance.

---

### Article 65 — Constitutionally Superseded

An artifact is **constitutionally superseded** when:

- A valid successor instrument has been adopted through the appropriate constitutional process;
- The effective date of the successor has passed;
- The superseded artifact has been archived with appropriate metadata.

Supersession terminates forward normative force. It does not erase the historical record. An artifact that produced valid constitutional effects before supersession retains those effects unless independently invalidated.

---

### Article 66 — Constitutional Certification

**66.1 Purpose**

Constitutional certification is the formal recognition that a specific artifact — an RFC, runtime specification, governance rule framework, or decision framework — is constitutionally compliant as of a defined review date.

**66.2 Requirements for Certification**

Certification MUST be:

- **Evidence-based:** Certification must be grounded in a documented constitutional review of the artifact.
- **Auditable:** The basis for certification must be preserved and accessible to independent review.
- **Time-bounded:** Certification applies as of a defined review date and expires or requires renewal at defined intervals. The passage of time, changes to governing instruments or changes to the artifact's implementation may require re-certification.
- **Revocable:** Certification may be revoked by the issuing authority upon a valid constitutional challenge or upon discovery of non-compliance.
- **Challengeable:** The issuance, scope and continued validity of a certification may be challenged by any subject with standing.

**66.3 Certification Scope**

Certification attests to compliance with the constitutional requirements applicable at the time of review. It does not:

- guarantee future compliance after changes to the artifact or governing instruments;
- substitute for ongoing audit;
- preclude challenge.

---

## Part XIV — Constitutional Maturity Model

The Constitutional Maturity Model defines the stages through which AOC Protocol may progress toward a fully sovereign constitutional order. An honest assessment of current maturity is a constitutional obligation; overclaiming maturity is a compliance failure.

---

### Level 1 — Concepts

**Definition:** Constitutional ideas exist in textual or philosophical form, but no formal primitives have been specified.

**Criteria:**
- Constitutional principles can be articulated but not operationalized.
- No defined identity, evidence, claims or standing primitives.
- No formal governance structure.

**Evidence Required:**
- Published conceptual documents.

**Failure Modes:**
- Protocol operates on implicit authority without constitutional basis.
- Governance is entirely informal.

**Exit Criteria:**
- At least one constitutional primitive is formally specified and published.

---

### Level 2 — Primitives

**Definition:** Constitutional primitives — identity, evidence, claims, standing — are formally defined and published.

**Criteria:**
- RFC-001 (Identity) is published and operational.
- RFC-004 (Evidence) is published and operational.
- RFC-005 (Claims) is published and operational.
- At least one standing evaluation specification is published.

**Evidence Required:**
- Published and ratified RFCs for each primitive.
- Demonstrated ability to recognize identity and evaluate standing.

**Failure Modes:**
- Primitives are defined but not connected in a legitimacy chain.
- Standing evaluations operate without authority recognition.

**Exit Criteria:**
- All primitives are connected in a verifiable canonical chain.

---

### Level 3 — Legitimacy Chain

**Definition:** The complete canonical chain from identity to governance is formally specified and traceable.

**Criteria:**
- All layers of the canonical chain (Article 34) are specified.
- RFC-000 is ratified as the supreme constitutional instrument.
- The first Governance Authority is recognized through the bootstrap process.
- The Constitutional Review Council is constituted.

**Evidence Required:**
- Ratified RFC-000.
- Ratified governance authority recognition record.
- Constituted Constitutional Review Council.
- Demonstrable end-to-end traceability of at least one legitimate decision.

**Failure Modes:**
- Chain exists in specification but is bypassed in practice.
- Governance authority acts outside its recognized scope.
- Review Council is not independent.

**Exit Criteria:**
- At least one full-chain legitimacy trace is independently audited and verified.

---

### Level 4 — Executable Constitution

**Definition:** Runtime implementations enforce constitutional requirements, not merely document them.

**Criteria:**
- Runtimes enforce the canonical chain as a prerequisite for constitutional effects.
- Challenge mechanisms are accessible and functional.
- Audit interfaces expose sufficient evidence for independent audit.
- Records preservation is enforced by the runtime, not dependent on operator goodwill.
- Constitutional bypasses are detected and rejected by the runtime.

**Evidence Required:**
- Constitutional runtime conformance audit (Article 47).
- Demonstrated challenge mechanism operations.
- Demonstrated audit interface operations.
- Demonstrated reconstruction from preserved records.

**Failure Modes:**
- Constitutional requirements are encoded but unenforced.
- Challenge mechanisms exist in specification but are inaccessible in practice.
- Audit interfaces are present but produce insufficient evidence.

**Exit Criteria:**
- All constitutional requirements are enforced at runtime.
- An independent constitutional runtime audit produces a compliant finding.

---

### Level 5 — Self-Auditable Constitution

**Definition:** The system can audit its own constitutional compliance under independent constraints, without relying on external description of what it is doing.

**Criteria:**
- The protocol produces sufficient constitutional records to support a complete audit of any constitutional act from external records alone.
- An independent auditor with no prior knowledge of the system can reconstruct the constitutional state of any subject at any historical point.
- Constitutional certification (Article 66) is operational and has been issued for at least one major constitutional instrument.
- Challenge processes have been exercised and produced documented outcomes.

**Evidence Required:**
- Completed independent audit of constitutional state reconstruction.
- Issued and archived constitutional certifications.
- Documented challenge resolutions.

**Failure Modes:**
- Records are preserved but insufficient for independent reconstruction.
- Audit process requires insider access to be meaningful.
- Certifications are issued without independent basis.

**Exit Criteria:**
- Full independent audit of constitutional compliance is completed and published.

---

### Level 6 — Sovereign Constitution

**Definition:** The protocol can preserve sovereignty, legitimacy, continuity and anti-capture across institutional, technical and governance transitions — including under adversarial conditions.

**Criteria:**
- The protocol has survived at least one significant governance transition (e.g., renewal of Governance Authority) without constitutional discontinuity.
- The protocol has survived at least one significant technical transition (e.g., migration of a core runtime) without loss of constitutional records.
- The anti-capture protections have been demonstrated in an adversarial scenario.
- The emergency protocol has been exercised or tested under realistic conditions.
- The unamendable core has been tested through at least one amendment attempt that correctly failed.

**Evidence Required:**
- Records of governance and technical transitions.
- Anti-capture audit findings.
- Emergency protocol exercise records.
- Constitutional stability metrics over time.

**Failure Modes:**
- Protocol is constitutionally sovereign on paper but vulnerable under practical stress.
- Governance transitions are managed informally, bypassing constitutional process.
- Anti-capture protections are not exercised because challenges are discouraged.

**Exit Criteria:**
- Sovereign constitutional status is confirmed by an independent constitutional audit following a real-world transition.

---

## Part XV — Relationship to Existing RFCs

The following matrix defines the constitutional relationship between RFC-000 and each existing constitutional RFC. RFC-000 governs all of them. This matrix specifies the nature and limits of that governance.

---

### RFC-001 — Identity Layer

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 1 (Purpose), Article 2.1 (Individual Sovereignty), Article 18 (Right to Identity), RFC000-INV-B06, RFC000-INV-A01 |
| Protected Interests | Individual sovereignty; portability of identity; non-captive representation; challenge against identity records |
| Limits Imposed by RFC-000 | RFC-001 MUST NOT create identity recognitions that are irrevocable, non-portable or immune to challenge. It MUST NOT permit identity capture by a single registry. Identity recognition MUST be traceable. |
| Invalid States | Identity records that cannot be challenged. Identity registries that prevent portability. Self-recognition of identity without process. |
| Required Compliance Checks | Portability check; challenge mechanism availability; audit interface; revocation path; reconstruction support |

---

### RFC-004 — Evidence Layer

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 2.3 (Legitimacy), Article 7 (Legitimacy principle), RFC000-INV-B05, RFC000-INV-J01 |
| Protected Interests | Evidence integrity; traceability of acceptance decisions; independence of evidence evaluation; continuity of evidence records |
| Limits Imposed by RFC-000 | RFC-004 MUST NOT permit evidence to be accepted without a traceable evaluation process. It MUST preserve records of accepted and rejected evidence. Evidence evaluation MUST be independent of the actor whose claims the evidence supports. |
| Invalid States | Evidence accepted without process. Evidence records deleted or overwritten. Self-acceptance of evidence by the beneficiary. |
| Required Compliance Checks | Evaluation traceability; record preservation; independence of evaluation; reconstruction capability |

---

### RFC-005 — Claims Framework

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 34.3 (Claim), Article 7 (Legitimacy), RFC000-INV-B09, RFC000-INV-C01 |
| Protected Interests | Claims traceability; evidence basis of claims; challenge of claim verification outcomes |
| Limits Imposed by RFC-000 | RFC-005 MUST NOT permit claims to be treated as verified without accepted evidence. Claim verification MUST be challengeable. Claims MUST NOT be expanded beyond their original scope without renewed process. |
| Invalid States | Claims verified without evidence. Claims that cannot be challenged. Claims expanded silently beyond original scope. |
| Required Compliance Checks | Evidence basis verification; challenge mechanism; scope adherence; record preservation |

---

### RFC-005-H1 — Standing Traceability

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 34.4 (Standing), Article 13 (Accountability), RFC000-INV-B01, RFC000-INV-J05 |
| Protected Interests | Full traceability of standing evaluations; historical standing record; reconstruction capability |
| Limits Imposed by RFC-000 | All standing evaluations MUST be fully traceable to their constitutional basis. Standing history MUST be preserved. Standing MUST NOT be assigned without a traceable process. |
| Invalid States | Standing assigned without traceable evaluation. Standing history deleted or overwritten. Evaluation chain that cannot be reconstructed. |
| Required Compliance Checks | Complete trace to identity, evidence and claims; historical record; reconstruction test |

---

### RFC-005-H2 — Standing Engine

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 34.4 (Standing), Article 12 (Oversight), RFC000-INV-I03, RFC000-INV-D01 |
| Protected Interests | Algorithmic independence; challenge of engine outputs; consistency of evaluation; anti-capture of standing production |
| Limits Imposed by RFC-000 | The Standing Engine MUST NOT evaluate standing for actors in processes where the Engine operator has a conflict. Engine outputs MUST be challengeable. Engine behavior MUST be auditable. |
| Invalid States | Self-evaluation of standing. Engine outputs immune to challenge. Engine operation without audit interface. |
| Required Compliance Checks | Independence verification; challenge interface; audit interface; conflict disclosure |

---

### RFC-005-H3 — Standing Governance

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 30 (Duties of Governance Authorities), Article 6 (Supremacy), RFC000-INV-F01, RFC000-INV-F07 |
| Protected Interests | Legitimacy of standing governance rules; challenge against governance rules; prevention of self-serving governance |
| Limits Imposed by RFC-000 | Governance rules for standing MUST NOT reduce the constitutional floor for challenge, auditability or portability. Rules MUST be adopted through a legitimate governance process. |
| Invalid States | Governance rules adopted without recognized authority. Rules that eliminate challenge of standing outcomes. Rules that the adopting body cannot itself be challenged under. |
| Required Compliance Checks | Authority of adopting body; challenge mechanism for rules; consistency with RFC-000 rights |

---

### RFC-005-H4 — Capability Mapping

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 34.5 (Capability), Article 10 (Limitation), RFC000-INV-D05, RFC000-INV-D08 |
| Protected Interests | Capability scoping; prevention of capability inflation; challenge of capability determinations |
| Limits Imposed by RFC-000 | Capability MUST derive from standing. Capability MUST NOT exceed the scope of the standing that grounds it. Capability assignments MUST be challengeable. |
| Invalid States | Capability assigned without standing. Capability that exceeds standing scope. Capability immune from challenge. |
| Required Compliance Checks | Standing basis; scope adherence; challenge interface |

---

### RFC-005-H5 — Delegated Standing

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 9 (Delegation), RFC000-INV-C05, RFC000-INV-D07 |
| Protected Interests | Bounded delegation; accountability preservation through delegation; revocability of delegated standing |
| Limits Imposed by RFC-000 | Delegated standing MUST NOT exceed the source standing. Delegation MUST be explicit and traceable. Delegation MUST be revocable by the source. Accountability cannot be eliminated through delegation. |
| Invalid States | Delegation that exceeds source standing. Irrevocable delegations. Delegations that obscure the accountability chain. |
| Required Compliance Checks | Scope comparison to source; traceability; revocation path; accountability preservation |

---

### RFC-005-H6 — Standing Algorithms

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 14 (Transparency), Article 23 (Right to Audit), RFC000-INV-G04, RFC000-INV-K02 |
| Protected Interests | Transparency of algorithmic evaluation; explainability of outputs; consistency and auditability of algorithms |
| Limits Imposed by RFC-000 | Standing algorithms MUST produce explainable outputs. Algorithm inputs and logic MUST be auditable. Algorithms MUST NOT introduce unconstitutional biases or capture mechanisms. |
| Invalid States | Algorithms that produce unexplainable outputs affecting subjects. Opaque algorithms immune to audit. Algorithms that encode capture by a specific class of actors. |
| Required Compliance Checks | Explainability test; audit interface; capture analysis |

---

### RFC-005-H7 — Capability Engine

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 34.5 (Capability), Article 12 (Oversight), RFC000-INV-I04, RFC000-INV-D05 |
| Protected Interests | Independence of capability determination; challenge of engine outputs; scope enforcement |
| Limits Imposed by RFC-000 | The Capability Engine MUST enforce capability scope limits. It MUST NOT assign capabilities beyond standing scope. Engine outputs MUST be challengeable and auditable. |
| Invalid States | Capability assigned beyond standing scope. Engine outputs immune to challenge. Self-assignment of capability. |
| Required Compliance Checks | Scope enforcement test; challenge interface; audit interface |

---

### RFC-005-H8 — Authority Recognition Model

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 34.6 (Authority), Article 10 (Limitation), Article 17 (Anti-Capture), RFC000-INV-D01–D12 |
| Protected Interests | Bounded authority recognition; prevention of unlimited authority; traceability of authority to capability; independence of recognition |
| Limits Imposed by RFC-000 | Authority recognition MUST be grounded in recognized capability. All recognized authority MUST have a defined scope, time limit and challenge path. No self-recognition. No unlimited authority. No recognition immune to review. |
| Invalid States | Self-recognition of authority. Unlimited authority recognition. Authority recognized without capability basis. Authority immune to challenge or review. |
| Required Compliance Checks | Capability basis; scope definition; time limit; challenge path; independence of recognition body; review mechanism |

---

### RFC-005-H9 — Decision Framework

| Dimension | Detail |
|-----------|--------|
| Constitutional Basis | Article 34.7 (Decision), Article 13 (Accountability), Article 25 (Right to Due Process), RFC000-INV-E01–E10 |
| Protected Interests | Decision validity; accountability of decision-makers; due process for affected subjects; challenge of decisions; reconstruction |
| Limits Imposed by RFC-000 | Decisions MUST be produced by actors with recognized authority. Decisions MUST follow the applicable governance process. Decisions MUST be explainable to affected subjects. Every decision MUST have an accessible challenge path. Decision records MUST be preserved permanently. |
| Invalid States | Decision by unauthorized actor. Decision without process. Decision that cannot be challenged. Decision that cannot be reconstructed. Decision that erases prior valid acts without constitutional basis. |
| Required Compliance Checks | Authority verification; process conformance; explanation availability; challenge interface; record preservation; reconstruction test |

---

## Part XVI — Open Constitutional Questions

The following questions are identified as constitutionally significant but are not resolved by this Charter. They require further deliberation, evidence and constitutional process before they may be addressed authoritatively. They are recorded here to ensure they are addressed by future governance processes rather than resolved informally.

1. **Exact ratification thresholds:** What minimum number of independent participants constitutes a legitimate ratification quorum? What is the basis for defining that threshold?

2. **Membership criteria for the first ratification body:** Who is eligible to participate in the first constitutional ratification event? What standing requirements apply, and who evaluates those requirements before the standing system is operational?

3. **Cryptographic proof requirements:** To what extent must constitutional acts be supported by cryptographic proofs? Under what conditions may non-cryptographic evidence satisfy constitutional requirements?

4. **Cross-jurisdictional recognition:** How does AOC Protocol handle the recognition of identity, standing and authority across legal jurisdictions with conflicting requirements?

5. **AI agent constitutional personhood limits:** To what extent, if any, may AI agents hold recognized standing, capability or authority within AOC Protocol? What constitutional limits apply to AI agent participation in governance?

6. **External legal enforceability:** Under what conditions, if any, may constitutional acts within AOC Protocol produce effects enforceable in external legal systems? How does RFC-000 relate to national law and international law?

7. **Interaction with national law:** When national law requires disclosure, access, or modification of data in ways that conflict with constitutional protections, how should a runtime operator respond? Does compliance with national law override constitutional obligations?

8. **Emergency governance triggers:** What quantitative or qualitative thresholds trigger a constitutional emergency? Who has standing to evaluate whether a threshold has been met?

9. **Constitutional fork handling:** If AOC Protocol forks into two or more incompatible implementations, which fork, if any, retains constitutional legitimacy? How is constitutional continuity preserved across a fork?

10. **Long-term archival requirements:** What are the technical and institutional requirements for preserving constitutional records indefinitely? Who bears responsibility for archival infrastructure?

11. **Governance succession:** What is the constitutional process for successor governance authorities when a recognized Governance Authority expires, fails or is dissolved?

12. **External institutional recognition:** Under what conditions may external institutions — national governments, international bodies, standards organizations — be recognized as having standing within AOC Protocol governance? What constitutional safeguards apply to such recognition?

13. **Minimum standing thresholds for constitutional review requests:** What standing is sufficient to file a constitutional challenge or seek review by the Constitutional Review Council?

14. **Constitutional status of protocol forks maintained by third parties:** What constitutional obligations, if any, apply to implementations that derive from AOC Protocol but are not maintained by the primary governance authority?

---

## Part XVII — Conformance

This Part defines what it means for an implementation, design or governance framework to claim conformance with RFC-000.

A conformance claim is a formal assertion that a specified artifact satisfies the requirements of RFC-000 at a specified level. Conformance claims are subject to constitutional certification under Article 66 and may be challenged under Article 15.

---

### RFC-000 Design Conformant

**Definition:** A design or specification is RFC-000 Design Conformant when, as documented, it satisfies the constitutional requirements of RFC-000 for its stated scope.

**Minimum Requirements:**

- The design explicitly acknowledges its constitutional basis in RFC-000.
- The design preserves all constitutional rights in Part III for subjects within its scope.
- The design maintains the canonical legitimacy chain for all constitutional acts within its scope.
- The design does not create constitutional bypasses.
- The design includes accessible challenge mechanisms for all consequential acts.
- The design does not create unlimited authority.
- The design includes record preservation provisions sufficient for audit and reconstruction.

**Limitation:** Design conformance does not imply runtime conformance. A design may be conformant while an implementation of the design is not.

---

### RFC-000 Runtime Conformant

**Definition:** A runtime is RFC-000 Runtime Conformant when, in operation, it enforces the constitutional requirements of RFC-000 for all constitutional acts it performs or mediates.

**Minimum Requirements:**

- The runtime enforces the canonical legitimacy chain: no constitutional effect is produced without all required prior primitives.
- The runtime detects and rejects constitutional bypasses.
- The runtime provides accessible, functional challenge interfaces for all subjects with standing.
- The runtime preserves all constitutional records in a form that supports reconstruction.
- The runtime fails closed when constitutional validity cannot be established.
- The runtime exposes audit interfaces sufficient for independent review.
- The runtime enforces authority scope limits.
- The runtime enforces time limits on recognized authority.
- The runtime does not permit self-recognition or self-audit.
- The runtime supports identity portability.

---

### RFC-000 Audit Conformant

**Definition:** A runtime or system is RFC-000 Audit Conformant when it produces and preserves evidence sufficient for an independent auditor to conduct a complete constitutional audit of any constitutional act within its scope.

**Minimum Requirements:**

- Every constitutional act produces a complete attribution record (Article 13 elements).
- The record of every legitimacy chain evaluation is preserved.
- Records are accessible to authorized independent auditors without requiring insider cooperation.
- Records support reconstruction of constitutional state at any historical point within the scope.
- Records cannot be modified or deleted after creation.
- Audit interfaces are publicly documented.
- Audit results are preserved in the constitutional record.

---

### RFC-000 Sovereignty Conformant

**Definition:** A runtime or system is RFC-000 Sovereignty Conformant when it preserves individual and institutional sovereignty under ordinary conditions and under constitutional stress.

**Minimum Requirements:**

- Identity portability is technically enforced: migration cannot be prevented by design.
- Exit from any governance domain is structurally possible.
- Individual consent is enforced as a prerequisite for all consent-requiring acts.
- The right to challenge is not structurally impeded.
- No single actor controls a majority of identity recognition, standing evaluation and authority recognition within the system.
- The system remains operable for subjects exercising revocation rights.
- Sovereignty protections are enforced equally for all subjects and not subject to governance override below the constitutional floor.

---

## Closing Statement

This Charter is a living instrument, subject to amendment through the process defined in Part X and subject to interpretation through the Constitutional Review Council established in Part VII. It is not a product specification, a technical architecture or a governance manual. It is the foundational law of AOC Protocol.

Every RFC, governance rule, runtime, decision and governance act produced under AOC Protocol derives its constitutional legitimacy from conformity with this Charter. Nothing within AOC Protocol is above it.

The principles it enshrines — individual sovereignty, institutional legitimacy, bounded authority, traceable legitimacy, challengeable power, auditable history and permanent anti-capture — are not features to be implemented and then optimized away. They are the constitutional commitments that give the protocol its reason for existing.

*Let this Charter be the foundation. Let what is built upon it be worthy of it.*

---

*RFC-000 Constitutional Charter v2.0*
*AOC Protocol Architecture Working Group*
*Draft — Pending Ratification*
*2026-06-07*
