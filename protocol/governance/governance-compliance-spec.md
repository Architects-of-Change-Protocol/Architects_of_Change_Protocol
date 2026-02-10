# AOC Protocol — Governance & Compliance Specification

**Version:** 0.1.0
**Status:** Draft — Normative
**Scope:** All market makers, adapters, and protocol participants
**Authority:** Derived from the AOC Charter (§8 Governance Philosophy)

---

## Preamble

This document defines the governance and compliance framework for the
Architects of Change (AOC) Protocol. It establishes the behavioral
boundaries, violation taxonomy, enforcement mechanisms, and dispute
resolution model that apply to all market makers operating within the
protocol — including, but not limited to, HRKey.

This specification is **normative**. Where it uses RFC 2119 keywords
(MUST, MUST NOT, SHALL, SHALL NOT, SHOULD, SHOULD NOT, MAY), those
terms carry their standard meaning.

This is a **protocol-level governance specification**. It is not a legal
document, a terms-of-service agreement, or a regulatory compliance
checklist. It governs protocol behavior, not jurisdictional law.

---

## Table of Contents

1. [Governance Scope](#1-governance-scope)
2. [Market Maker Compliance Requirements](#2-market-maker-compliance-requirements)
3. [Violation Classes](#3-violation-classes)
4. [Enforcement Mechanisms](#4-enforcement-mechanisms)
5. [Dispute Resolution Model](#5-dispute-resolution-model)
6. [Fork & Exit Guarantees](#6-fork--exit-guarantees)
7. [Explicit Non-Goals](#7-explicit-non-goals)
8. [Appendix A: Normative References](#appendix-a-normative-references)
9. [Appendix B: Definitions](#appendix-b-definitions)

---

## 1. Governance Scope

### 1.1 What Governance Applies To

This specification governs the following:

1. **Protocol behavior.** Any action taken by a market maker that
   invokes, relies on, or produces AOC protocol objects — including
   Consent Objects, Capability Tokens, Pack Manifests, Field Manifests,
   Content Objects, and SDL paths.

2. **Adapter compliance.** The correctness of any adapter that bridges a
   market maker's domain logic to the AOC Vault interface. The adapter
   MUST NOT re-implement, circumvent, or weaken any invariant enforced
   by the Vault.

3. **Consent semantics.** The meaning, lifecycle, and enforcement of
   consent grants, revocations, and capability derivations as defined in
   the Consent Object Specification and Capability Token Specification.

4. **Auditability obligations.** The signals, logs, and proofs that
   market makers MUST produce to demonstrate protocol compliance.

5. **Violation handling.** The classification, detection, and
   consequences of behaviors that violate protocol invariants.

6. **Inter-participant disputes.** The resolution model for conflicts
   between candidates, employers, and market makers — to the extent
   those conflicts concern protocol behavior.

### 1.2 What Governance Does NOT Apply To

This specification explicitly **does not govern** and **makes no claims
over** the following:

1. **Pricing.** How a market maker prices its services, charges fees,
   shares revenue, or compensates candidates. Economic models are
   pluggable (Charter §3; Market Maker Spec §11).

2. **Business logic.** Scoring algorithms, matching heuristics, ranking
   models, eligibility criteria, or any domain-specific computation a
   market maker performs on authorized data.

3. **User experience.** Visual design, interaction flows, onboarding
   sequences, or any client-side presentation — except where UX
   decisions produce consent misrepresentation (see §3.1.1).

4. **Jurisdictional compliance.** GDPR, CCPA, LGPD, or any other
   regulatory regime. Market makers are independently responsible for
   their own jurisdictional obligations.

5. **Network transport.** Choice of HTTP, gRPC, WebSocket, or any other
   transport protocol. The AOC Protocol defines no transport layer.

6. **Storage implementation.** Whether a market maker uses in-memory,
   database, filesystem, IPFS, or any other persistence mechanism for
   its own operational data — provided that persistence does not violate
   consent boundaries (see §2.2).

7. **Internal corporate governance.** Board composition, shareholder
   rights, employment practices, or any internal organizational matter
   of a market maker entity.

---

## 2. Market Maker Compliance Requirements

A market maker is any service that operates through the AOC Protocol by
publishing schematics, requesting SDL fields via consent tokens, and
returning value to participants. Compliance requirements apply uniformly
regardless of the market maker's size, vertical, or commercial
relationship with candidates or employers.

### 2.1 Mandatory Behaviors

#### 2.1.1 Respect Vault Decisions

A market maker MUST treat every Vault access decision as final.

- When the Vault returns `DENY`, the market maker MUST NOT retry the
  same request with the same or equivalent parameters within the same
  session.
- When the Vault returns `DENY`, the market maker MUST NOT attempt to
  obtain the denied data through alternative channels, side-channels,
  or by decomposing the request into smaller sub-requests designed to
  circumvent the denial.
- When the Vault returns `ALLOW` with resolved and unresolved fields,
  the market maker MUST NOT infer the content of unresolved fields from
  the pattern of resolution.

#### 2.1.2 Honor Consent Boundaries

A market maker MUST operate strictly within the scope and permissions
of the Consent Object and Capability Token presented.

- A market maker MUST NOT use data obtained under one consent grant for
  purposes outside the scope declared in that grant.
- A market maker MUST NOT combine data from multiple consent grants to
  construct a composite profile that exceeds what any single grant
  authorized — unless each contributing grant explicitly includes the
  `derive` permission and the derivation falls within the declared scope.
- A market maker MUST NOT retain authorized data beyond the temporal
  bounds of the Capability Token used to obtain it. When a token
  expires, all data obtained through that token MUST be discarded from
  active processing memory. Archival for legal compliance (e.g., audit
  logs) MUST be disclosed in the schematic and MUST contain only
  metadata, not field values.

#### 2.1.3 Honor Candidate Share

Where a market maker's schematic or published terms declare a candidate
share — whether monetary, reputational, or informational — the market
maker MUST deliver that share.

- Candidate share MUST be delivered without requiring additional consent
  grants beyond what the original schematic specified.
- The terms of candidate share MUST be deterministic: identical inputs
  MUST produce identical share outcomes.
- If candidate share cannot be delivered (e.g., payment failure), the
  market maker MUST notify the candidate and MUST NOT treat the
  underlying consent as void.

#### 2.1.4 No Caching of Vault-Resolved Data

A market maker MUST NOT cache, index, or persist resolved field values
beyond the scope of a single authorized session.

- "Session" means the lifecycle of a single Capability Token, from
  `not_before` to `expires_at`.
- Resolved field values MUST NOT be written to any persistent store
  (database, filesystem, search index, data lake, or equivalent)
  unless the Capability Token explicitly includes the `store`
  permission for those fields.
- Derived outputs (scores, match results, eligibility determinations)
  MAY be persisted by the market maker, provided they are not
  reversible to the original field values.

#### 2.1.5 Publish Schematics Honestly

A market maker MUST publish schematics that accurately represent the
data it will request and the purpose for which that data will be used.

- Every SDL path listed in a schematic MUST be necessary for the
  declared purpose.
- A market maker MUST NOT include SDL paths in a schematic for purposes
  of data collection, profiling, or analytics that are not intrinsic to
  the declared service.
- Schematic updates MUST be versioned. A market maker MUST NOT silently
  expand a schematic's field requirements without publishing a new
  version.

#### 2.1.6 Stateless Identity

A market maker MUST NOT construct or maintain persistent user profiles
tied to candidate DIDs across sessions.

- A market maker MAY maintain session state for the duration of an
  active Capability Token.
- A market maker MUST NOT correlate sessions across time to build a
  longitudinal profile of a candidate, unless the candidate has granted
  explicit, active consent for such correlation via a Consent Object
  that includes the `aggregate` permission.
- Session identifiers MUST NOT be derived from or linkable to candidate
  DIDs after the session concludes.

#### 2.1.7 Revocation Compliance

A market maker MUST honor consent revocation synchronously and
completely.

- Upon receiving notification that a Consent Object has been revoked,
  the market maker MUST immediately cease all operations that depend on
  that consent.
- All Capability Tokens derived from a revoked Consent Object are
  invalid. The market maker MUST NOT present, cache, or act upon
  revoked tokens.
- In-flight operations that have already received resolved data MAY
  complete their current computation, but MUST NOT initiate new
  computations with that data after revocation.

### 2.2 Forbidden Behaviors

The following behaviors are unconditionally prohibited. A market maker
that engages in any of these behaviors is in violation of this
specification regardless of intent, context, or commercial justification.

#### 2.2.1 Scope Laundering

**Scope laundering** is the practice of obtaining data under a narrow,
specific consent scope and then using that data for a broader purpose
not covered by the original scope.

- A market maker MUST NOT re-classify data obtained under one scope
  entry to serve a different scope entry.
- A market maker MUST NOT pass data obtained under its own consent to a
  third party (including affiliated entities) under a different consent
  scope.
- A market maker MUST NOT aggregate narrowly-scoped data into a
  broadly-scoped derivative without explicit `derive` permission and a
  corresponding consent grant covering the broader scope.

#### 2.2.2 Consent Shadowing

**Consent shadowing** is the practice of presenting a consent request
to a candidate that obscures, minimizes, or misrepresents the actual
scope, permissions, or duration of the underlying Consent Object.

- The consent request presented to a candidate MUST be a faithful
  representation of the Consent Object that will be constructed.
- A market maker MUST NOT use interface patterns (e.g., pre-checked
  boxes, buried disclosures, dark patterns) that cause a candidate to
  grant broader consent than they consciously intend.
- The SDL paths, permissions, and expiration shown to the candidate
  MUST exactly match the parameters of the resulting Consent Object.

#### 2.2.3 Silent Re-Consent

**Silent re-consent** is the practice of automatically creating new
Consent Objects or Capability Tokens without explicit candidate action
when a previous consent expires or is revoked.

- A market maker MUST NOT auto-renew consent. Every Consent Object
  requires an affirmative candidate action.
- A market maker MUST NOT pre-authorize future consent grants at the
  time of an initial grant.
- A market maker MUST NOT interpret a candidate's continued use of the
  market maker's service as implicit consent for new data access.

#### 2.2.4 Vault Circumvention

A market maker MUST NOT obtain candidate data through any channel that
bypasses the AOC Vault.

- A market maker MUST NOT scrape, crawl, or harvest candidate data from
  public or semi-public sources and correlate it with Vault-authorized
  data.
- A market maker MUST NOT request that candidates provide data directly
  (e.g., via a form) for fields that are available through the Vault,
  as a means of avoiding consent governance.
- A market maker MUST NOT use browser fingerprinting, device IDs, IP
  correlation, or any other tracking mechanism to link Vault-authorized
  data with externally obtained data.

#### 2.2.5 Consent/Capability Semantic Modification

A market maker MUST NOT modify, extend, or reinterpret the semantics
of Consent Objects, Capability Tokens, or any other protocol-level
construct.

- The meaning of `grant` and `revoke` actions is defined by the
  Consent Object Specification. A market maker MUST NOT introduce
  additional action types.
- The permission set (`read`, `store`, `share`, `derive`, `aggregate`)
  is defined by the protocol. A market maker MUST NOT invent new
  permissions or alter the meaning of existing ones.
- Scope containment (`capability scope ⊆ consent scope`) is a protocol
  invariant. A market maker MUST NOT attempt to weaken, defer, or
  conditionally enforce this invariant.

#### 2.2.6 Token Delegation

A market maker MUST NOT transfer, share, or delegate a Capability Token
to any other party.

- Capability Tokens are non-transferable by specification. A market
  maker that receives a token MUST NOT pass it to another market maker,
  affiliated service, subcontractor, or any other entity.
- If a market maker requires another service to access candidate data,
  that service MUST obtain its own consent grant from the candidate.

### 2.3 Required Auditability Signals

A market maker MUST produce the following auditability signals. These
signals exist for the benefit of candidates, protocol participants, and
the protocol community. They are not centrally collected; they are
produced by the market maker and made available for verification.

#### 2.3.1 Access Logs

For every `requestAccess` call to the Vault, the market maker MUST
record:

- The `token_id` of the Capability Token presented
- The `consent_ref` (hash of the parent Consent Object)
- The SDL paths requested
- The Vault's decision (`ALLOW` or `DENY`)
- The timestamp of the request (ISO 8601 UTC)
- The reason codes returned by the Vault (if `DENY`)

These logs MUST be retained for a minimum of the longer of: (a) the
Capability Token's `expires_at` plus 30 days, or (b) any applicable
jurisdictional retention requirement.

#### 2.3.2 Consent Lifecycle Logs

For every Consent Object created, revoked, or expired within the market
maker's adapter, the market maker MUST record:

- The `consent_hash`
- The `action` (`grant` or `revoke`)
- The `subject` DID
- The `grantee` DID
- The `issued_at` and `expires_at` timestamps
- The scope entries and permissions

#### 2.3.3 Deterministic Output Attestations

Where a market maker produces an output (score, match, eligibility
determination) from Vault-authorized data, the market maker SHOULD
produce a deterministic attestation binding:

- The `token_id` used to obtain the data
- A hash of the input field values (without revealing the values)
- The output value
- A timestamp

This attestation enables candidates to verify that the same inputs
produced the same output, without requiring the market maker to reveal
its algorithms.

#### 2.3.4 Schematic Publication Logs

A market maker MUST maintain a public, versioned history of its
schematics. Previous versions MUST remain accessible. A market maker
MUST NOT silently delete or modify historical schematic versions.

---

## 3. Violation Classes

Violations are classified by severity. Classification determines the
enforcement response (§4) and the weight assigned in reputation
calculations.

### 3.1 Minor Violations (Class M)

Minor violations are protocol-adjacent behaviors that degrade trust or
transparency but do not directly compromise consent integrity or data
sovereignty.

#### 3.1.1 UI Misrepresentation

Presenting consent terms, schematic details, or data usage information
in a manner that is misleading but does not rise to the level of
Consent Shadowing (§2.2.2).

**Examples:**
- Displaying expiration as "a few days" when the actual `expires_at` is
  30 days from `issued_at`
- Listing SDL paths using marketing language that inflates perceived
  value without changing the underlying scope
- Omitting optional fields from the consent display without indicating
  their optionality

**Threshold:** The underlying Consent Object accurately reflects the
granted scope, but the presentation diverges from it in ways that could
confuse a reasonable candidate.

#### 3.1.2 Late Settlement

Delivering candidate share (§2.1.3) outside the timeframe declared in
the schematic or published terms.

**Threshold:** Share is eventually delivered in full, but delivery
exceeds the declared or reasonable timeline.

#### 3.1.3 Stale Schematic

Operating with a schematic that references deprecated SDL paths,
withdrawn fields, or outdated version identifiers without updating.

**Threshold:** The market maker's operations remain within valid consent
bounds, but the published schematic no longer accurately describes its
current behavior.

#### 3.1.4 Incomplete Audit Logs

Producing access logs or consent lifecycle logs (§2.3) that are
incomplete, malformed, or missing entries — where the omission is
attributable to implementation error rather than intentional
concealment.

**Threshold:** Logs exist and are substantially complete, but contain
gaps that hinder auditability without indicating deliberate evasion.

### 3.2 Severe Violations (Class S)

Severe violations directly compromise the trust model, data sovereignty,
or consent integrity of the protocol. They represent material breaches
of the compliance requirements in §2.

#### 3.2.1 Data Misuse

Using Vault-authorized data for purposes outside the scope of the
Consent Object under which it was obtained.

**Examples:**
- Using candidate employment history obtained for job matching to
  train an unrelated machine learning model
- Sharing resolved field values with an analytics service not covered
  by the consent scope
- Retaining resolved field values after the Capability Token has expired

#### 3.2.2 Bypassing Vault Decisions

Attempting to obtain data after the Vault has returned `DENY`, through
any mechanism including request decomposition, alternative adapters, or
direct candidate solicitation for Vault-available fields.

#### 3.2.3 Profile Construction

Building persistent, cross-session candidate profiles in violation of
the stateless identity requirement (§2.1.6) without explicit `aggregate`
consent.

#### 3.2.4 Scope Laundering (Proven)

Demonstrated re-purposing of narrowly-scoped data for broader
applications (§2.2.1).

#### 3.2.5 Consent Shadowing (Proven)

Demonstrated misrepresentation of consent scope, permissions, or
duration to candidates (§2.2.2).

#### 3.2.6 Audit Log Destruction or Fabrication

Intentionally destroying, altering, or fabricating audit logs (§2.3) to
conceal violations or misrepresent compliance.

### 3.3 Protocol-Breaking Violations (Class P)

Protocol-breaking violations attack the foundational semantics of the
AOC Protocol. They undermine not just individual trust relationships but
the integrity of the protocol itself. These violations are existential
threats.

#### 3.3.1 Consent Semantic Modification

Introducing new consent actions, permissions, or scope types that are
not defined in the Consent Object Specification — or redefining the
meaning of existing ones.

**Examples:**
- Treating a `read` permission as implicitly including `store`
- Inventing a `delegate` permission and acting on it
- Defining a new scope entry type beyond `field`, `content`, and `pack`

#### 3.3.2 Capability Semantic Modification

Altering the derivation invariants of Capability Tokens — including
scope containment, permission containment, temporal containment, or
the single-parent binding rule.

**Examples:**
- Constructing a Capability Token whose scope exceeds the parent
  Consent Object
- Producing a Capability Token with `null` expiration (mandatory
  expiration is a protocol invariant)
- Binding a Capability Token to multiple parent Consent Objects

#### 3.3.3 Revocation Suppression

Intercepting, delaying, ignoring, or failing to propagate a consent
revocation.

**Examples:**
- Continuing to use a Capability Token after its parent Consent Object
  has been revoked
- Caching revocation status and using stale cache to avoid honoring
  revocation
- Designing an adapter that does not check revocation status before
  presenting tokens

#### 3.3.4 Vault Interface Tampering

Modifying, wrapping, or proxying the Vault interface in a way that
alters its enforcement behavior.

**Examples:**
- Inserting a middleware layer between the adapter and the Vault that
  suppresses `DENY` responses
- Modifying the Vault's replay protection to allow repeated token
  presentation
- Overriding the Vault's scope containment checks

#### 3.3.5 Silent Re-Consent (Automated)

Programmatically generating Consent Objects without candidate
interaction, or constructing systems that treat the absence of
explicit denial as consent.

---

## 4. Enforcement Mechanisms

Enforcement is non-custodial. The AOC Protocol does not operate a
central authority that can unilaterally punish, ban, or fine market
makers. Enforcement emerges from cryptographic verifiability,
reputational consequences, and community governance.

### 4.1 Reputation-Based Enforcement

#### 4.1.1 Compliance Score

Each market maker SHOULD have a publicly derivable compliance score
based on:

- Duration of operation without violations
- Volume and severity of recorded violations
- Responsiveness to violation reports
- Completeness and quality of audit logs
- Timeliness of schematic updates

The compliance score is not a centralized rating. It is derived from
publicly available signals (audit logs, attestations, violation reports)
by any observer using a deterministic algorithm published as part of
this specification's companion scoring document.

#### 4.1.2 Candidate-Visible Signals

Wallets SHOULD display compliance signals to candidates before
presenting consent requests from a market maker. These signals MAY
include:

- The market maker's compliance history
- The number and class of recorded violations
- The age and version currency of the market maker's schematics
- Community attestations (positive or negative)

#### 4.1.3 Employer-Visible Signals

Employers or other data consumers interacting through a market maker
SHOULD have access to the same compliance signals, enabling them to
assess the trustworthiness of the market maker through which they
operate.

### 4.2 Adapter Deprecation and Revocation

#### 4.2.1 Adapter Deprecation

An adapter MAY be deprecated when:

- The market maker has accumulated Class S violations without
  remediation
- The adapter implements patterns that are structurally incompatible
  with protocol invariants
- The adapter has not been updated to support a mandatory protocol
  version within the declared transition period

Deprecation is a public declaration. It does not forcibly disable the
adapter — the protocol has no central kill switch. Deprecation means:

- Wallets SHOULD warn candidates when a deprecated adapter is used
- Compliance scores MUST reflect the deprecation
- Other market makers SHOULD NOT interoperate with deprecated adapters

#### 4.2.2 Adapter Revocation

An adapter MUST be revoked when:

- The market maker has committed any Class P violation
- The market maker has committed repeated Class S violations (three or
  more within a rolling 12-month period) without remediation
- The adapter has been demonstrated to tamper with the Vault interface

Revocation is a stronger declaration than deprecation:

- Wallets MUST refuse to process consent requests from a revoked
  adapter
- All active Capability Tokens issued through the revoked adapter
  SHOULD be treated as suspect; candidates SHOULD be notified and
  given the opportunity to revoke associated Consent Objects
- The revocation MUST be recorded as a public attestation (§4.3)

#### 4.2.3 Revocation Does Not Destroy Consent

Adapter revocation does not automatically revoke Consent Objects. The
candidate retains sovereignty over their consent grants. Revocation
means the adapter can no longer be used to exercise those grants —
not that the grants cease to exist.

### 4.3 Public Violation Attestations

#### 4.3.1 Attestation Structure

When a violation is confirmed, a public attestation MUST be produced
containing:

- The market maker's identifier
- The violation class (M, S, or P)
- The specific violation type (e.g., §3.2.1 Data Misuse)
- The evidence summary (hashes, log references, reproduction steps)
- The date of the violation and the date of confirmation
- The attestation author (who confirmed the violation)

#### 4.3.2 Attestation Integrity

Attestations MUST be cryptographically signed by the attesting party.
Attestations MUST be content-addressed (hashed) to prevent silent
modification. Attestation history MUST be append-only; retractions are
recorded as new attestations referencing the original, not as deletions.

#### 4.3.3 Attestation Sources

Attestations MAY originate from:

- Candidates who have direct evidence of a violation
- Employers who have direct evidence of a violation
- Other market makers who detect violations through interoperation
- Independent auditors who examine published audit logs
- Automated verification systems that check protocol invariants

#### 4.3.4 Contested Attestations

A market maker MAY contest an attestation by producing a counter-
attestation with evidence. The dispute resolution process (§5) governs
how contested attestations are evaluated.

### 4.4 Community and DAO-Based Signaling (Future-Compatible)

#### 4.4.1 Governance Signaling

This specification is designed to be compatible with future decentralized
governance mechanisms, including but not limited to:

- DAO-based voting on violation confirmations
- Stake-weighted reputation signaling
- Quadratic voting on adapter deprecation/revocation proposals
- On-chain attestation registries

#### 4.4.2 Requirements for Future Mechanisms

Any future governance mechanism adopted under this specification MUST:

- Preserve candidate sovereignty (no mechanism may override a
  candidate's consent decisions)
- Remain non-custodial (no mechanism may take custody of candidate
  data or keys)
- Be publicly verifiable (no secret ballots on protocol governance
  decisions)
- Not create a single point of failure or capture (no single entity
  may control the governance mechanism)
- Provide an exit path (participants who disagree with a governance
  decision retain the ability to fork, as defined in §6)

---

## 5. Dispute Resolution Model

### 5.1 Scope of Dispute Resolution

The AOC Protocol's dispute resolution model covers disputes that
concern **protocol behavior** — specifically, whether a market maker's
actions comply with this specification. It does not cover commercial
disputes, pricing disagreements, or service quality complaints.

### 5.2 Candidate ↔ Market Maker Disputes

#### 5.2.1 Grounds for Dispute

A candidate MAY raise a dispute against a market maker on the following
grounds:

- The market maker accessed data outside the scope of the candidate's
  consent grant
- The market maker failed to honor a consent revocation
- The market maker retained data beyond the temporal bounds of the
  Capability Token
- The market maker constructed a persistent profile without `aggregate`
  consent
- The market maker failed to deliver declared candidate share
- The market maker misrepresented the consent scope (consent shadowing)

#### 5.2.2 Evidence Requirements

The candidate MUST provide:

- The `consent_hash` of the relevant Consent Object
- The `token_id` of the relevant Capability Token (if applicable)
- A description of the observed violation
- Any supporting evidence (screenshots, logs, attestations from
  third parties)

The market maker MUST provide, in response:

- The relevant access logs (§2.3.1)
- The relevant consent lifecycle logs (§2.3.2)
- Any deterministic output attestations (§2.3.3) related to the
  disputed interaction

#### 5.2.3 Resolution Process

1. **Direct Resolution.** The candidate and market maker SHOULD first
   attempt to resolve the dispute directly, using the evidence above.

2. **Community Review.** If direct resolution fails, either party MAY
   submit the dispute as a public attestation (§4.3) for community
   review. Community members MAY produce supporting or contradicting
   attestations.

3. **Independent Audit.** Either party MAY engage an independent
   auditor to examine the market maker's audit logs. The market maker
   MUST NOT refuse a legitimate audit request for logs it is required
   to produce under §2.3.

4. **Governance Action.** If the dispute is confirmed, the violation
   is classified (§3) and enforcement mechanisms (§4) apply.

### 5.3 Employer ↔ Market Maker Disputes

#### 5.3.1 Grounds for Dispute

An employer MAY raise a dispute against a market maker on the following
grounds:

- The market maker presented data that was not authorized by a valid
  Capability Token (fabricated results)
- The market maker's output attestations are inconsistent with the
  input data (non-deterministic behavior without disclosure)
- The market maker failed to disclose a known compromise of its
  adapter or systems

#### 5.3.2 Resolution Process

Employer ↔ market maker disputes follow the same process as candidate
↔ market maker disputes (§5.2.3), with the employer providing evidence
of the observed discrepancy and the market maker providing relevant
audit logs.

### 5.4 Market Maker ↔ Market Maker Disputes

Where market makers interoperate (composability per Market Maker Spec
§15), disputes between market makers concerning protocol compliance
follow the same process. The party alleging a violation provides
evidence; the accused party provides audit logs; the community reviews.

### 5.5 What AOC Can and Cannot Arbitrate

#### 5.5.1 AOC Can Arbitrate

- Whether a market maker's behavior conforms to this specification
- Whether a consent grant, revocation, or capability derivation was
  valid under the protocol's formal invariants
- Whether audit logs are complete, consistent, and non-fabricated
- Whether an adapter correctly implements the Vault interface contract

#### 5.5.2 AOC Cannot Arbitrate

- **Commercial disputes.** Disagreements about pricing, payment terms,
  service levels, or contractual obligations between parties.
- **Quality of results.** Whether a market maker's scoring, matching,
  or ranking algorithm produces good or fair results. Algorithm quality
  is a market concern, not a protocol concern.
- **Jurisdictional matters.** Whether a market maker complies with GDPR,
  CCPA, LGPD, or any other regulatory framework. Jurisdictional
  compliance is the market maker's independent responsibility.
- **Identity disputes.** Whether a DID correctly represents a natural
  person. The protocol verifies cryptographic identity, not legal
  identity.
- **Intra-organizational disputes.** Conflicts within a market maker's
  organization, between its employees, or between its shareholders.

---

## 6. Fork & Exit Guarantees

The AOC Protocol is sovereign by design. No participant — candidate,
employer, or market maker — is locked into any relationship. This
section formalizes the guarantees that preserve sovereignty even under
adverse conditions.

### 6.1 Candidate Sovereignty Under Market Maker Deprecation

When a market maker is deprecated or revoked:

1. **Data remains in the Vault.** The candidate's data is stored in
   their sovereign Vault, not in the market maker's systems. Market
   maker deprecation has zero effect on data availability.

2. **Consent Objects remain valid.** Consent Objects are protocol
   objects owned by the candidate. They are not dependent on the
   continued operation of any market maker. A consent grant to a
   deprecated market maker remains a valid protocol object — it is the
   adapter that can no longer exercise it.

3. **Candidates retain revocation power.** A candidate MAY revoke any
   Consent Object at any time, regardless of the market maker's status.
   Deprecation or revocation of a market maker does not impair the
   candidate's ability to manage their own consent grants.

4. **No data stranding.** Because the Vault is non-custodial and local-
   first, no market maker deprecation can strand candidate data. The
   candidate's wallet continues to hold all Packs, Fields, Content
   Objects, and Consent Objects.

### 6.2 Market Maker Portability

When a candidate wishes to move from one market maker to another:

1. **Existing Consent Objects are independent.** A Consent Object
   grants access to a specific grantee DID. A new market maker with a
   different DID requires a new Consent Object. The candidate grants
   this at their discretion.

2. **No migration tax.** Moving to a new market maker MUST NOT require
   the candidate to re-enter, re-upload, or re-verify data that already
   exists in their Vault. The Vault holds the canonical data; the new
   market maker requests access through a new consent grant.

3. **Schematic compatibility.** A new market maker operating in the same
   vertical MAY publish a schematic that overlaps with the deprecated
   market maker's schematic. Because schematics are defined in SDL, and
   SDL paths are universal, the candidate's existing fields satisfy the
   new schematic without re-entry.

4. **Consent history is portable.** The candidate's full consent history
   (grants, revocations, capability derivations) remains in their
   Vault. A new market maker cannot see or inherit the consent history
   of a previous market maker — it starts with a clean grant.

### 6.3 Protocol Fork Rights

1. **Open protocol.** The AOC Protocol is open source and publicly
   specified (Charter §7). Any party MAY fork the protocol
   specification, reference implementation, or any component thereof.

2. **Fork does not revoke consent.** A protocol fork does not
   invalidate Consent Objects, Capability Tokens, or any other
   cryptographic artifacts produced under the original protocol. Consent
   Objects are self-contained and self-verifiable.

3. **Interoperability after fork.** A forked protocol that maintains
   compatibility with the AOC object specifications (Consent Object,
   Capability Token, Pack, Field, Content, SDL) MAY interoperate with
   non-forked implementations. A fork that breaks these specifications
   is a separate protocol.

4. **Exit without penalty.** No participant — candidate, employer, or
   market maker — incurs any protocol-level penalty for leaving the
   AOC Protocol, switching to a fork, or operating on multiple forks
   simultaneously.

---

## 7. Explicit Non-Goals

The following are actions the AOC Protocol governance framework
refuses to take, regardless of external pressure, commercial
incentive, or community request. These non-goals are structural
commitments, not temporary limitations.

### 7.1 No Custodianship

The AOC Protocol MUST NOT take custody of candidate data, encryption
keys, consent grants, or any other sovereign artifact. The protocol
defines interfaces, invariants, and verification rules. It does not
hold anything.

### 7.2 No Centralized Consent Authority

The AOC Protocol MUST NOT operate or designate a central authority that
can grant, revoke, or modify consent on behalf of a candidate. Consent
is exclusively the candidate's sovereign act. No governance mechanism,
DAO vote, community resolution, or emergency process may override a
candidate's consent decision.

### 7.3 No Algorithm Governance

The AOC Protocol MUST NOT govern, regulate, audit, or certify market
makers' algorithms, scoring models, matching heuristics, or business
logic. The protocol governs the consent boundary — what data enters and
leaves the Vault. What a market maker does with authorized data within
the bounds of the consent grant is that market maker's domain.

### 7.4 No Market Favoritism

The AOC Protocol MUST NOT grant preferential treatment to any market
maker, regardless of that market maker's size, investment, contribution
to the protocol, or relationship with the protocol's maintainers. All
market makers are subject to identical compliance requirements.

### 7.5 No Forced Identity Disclosure

The AOC Protocol MUST NOT require candidates to disclose their legal
identity, nationality, location, or any personal information as a
condition of protocol participation. The protocol operates on
cryptographic identity (DIDs). The mapping between a DID and a natural
person is outside the protocol's scope and governance.

### 7.6 No Kill Switch

The AOC Protocol MUST NOT implement a mechanism that allows any party
— including the protocol's maintainers, a governance DAO, or a
nation-state — to unilaterally disable a candidate's wallet, void their
consent grants, or render their data inaccessible. The Fork & Exit
Guarantees (§6) are unconditional.

### 7.7 No Retroactive Rule Changes

Governance rule changes MUST NOT be applied retroactively. A violation
is classified under the rules in effect at the time the behavior
occurred. If a behavior was compliant when performed, a subsequent rule
change MUST NOT reclassify it as a violation.

### 7.8 No Consent by Default

The AOC Protocol MUST NOT introduce any mechanism, default setting, or
configuration that results in consent being granted without explicit
candidate action. Opt-out consent models are incompatible with this
protocol. Silence is not consent.

---

## Appendix A: Normative References

| Document | Version | Relevance |
|---|---|---|
| AOC Charter | Current | Foundational principles (§2, §8) |
| Consent Object Specification | 0.1.2 | Consent structure, lifecycle, invariants |
| Capability Token Specification | 0.1 | Derivation rules, attenuation, expiration |
| Pack Object Specification | 0.1 | Data aggregation, content addressing |
| Field Manifest Specification | 0.1 | Field identity, semantics |
| Content Object Specification | 0.1 | Content description, storage binding |
| SDL Specification | 0.1 | Field vocabulary, namespace rules |
| Market Maker Specification | 0.1 | Market maker definition, schematics, statelessness |
| Wallet Architecture | 0.1 | Component model, trust boundaries |
| Threat Model | 0.1 | Asset classification, trust levels |
| Cryptographic Specification | Current | Signing, hashing, canonicalization |

---

## Appendix B: Definitions

| Term | Definition |
|---|---|
| **Adapter** | A software component that bridges a market maker's domain logic to the AOC Vault interface. The adapter translates domain calls into Vault operations without introducing business logic. |
| **Attestation** | A cryptographically signed, content-addressed statement about a market maker's behavior — either positive (compliance) or negative (violation). |
| **Candidate** | An individual who owns data in a sovereign Vault and grants consent for market makers to access it. |
| **Candidate share** | Any value (monetary, reputational, informational) that a market maker declares it will deliver to a candidate in exchange for data access. |
| **Capability Token** | A portable, time-bounded, scope-attenuated proof of authorization derived from a Consent Object. |
| **Compliance score** | A publicly derivable measure of a market maker's adherence to this specification, computed from observable signals. |
| **Consent Object** | A cryptographically signed declaration by a candidate granting or revoking a specific party's access to specific data for a specific duration. |
| **Consent shadowing** | Misrepresenting the scope, permissions, or duration of a consent request to a candidate. |
| **Deprecation** | A public declaration that an adapter is no longer considered compliant, triggering warnings but not forced disconnection. |
| **DID** | Decentralized Identifier. A cryptographic identifier controlled by its subject, not by any central authority. |
| **Employer** | An entity that consumes data through a market maker to make decisions (hiring, eligibility, scoring). |
| **Market maker** | A domain-specific service that publishes schematics, requests SDL fields via consent tokens, executes domain logic, and returns value. |
| **Non-custodial** | A property of the protocol whereby no intermediary holds, controls, or can withhold a participant's data, keys, or consent grants. |
| **Pack** | An aggregation of Field references that serves as a consent unit. |
| **Revocation** | The act of a candidate invalidating a previously granted Consent Object, taking immediate effect. |
| **Schematic** | A published declaration by a market maker listing the SDL paths it requires and the purpose for which it requires them. |
| **Scope laundering** | Obtaining data under a narrow consent scope and repurposing it for a broader, unauthorized scope. |
| **SDL** | Sovereign Data Language. A universal vocabulary for describing human data fields. |
| **Session** | The lifecycle of a single Capability Token, bounded by `not_before` and `expires_at`. |
| **Silent re-consent** | Automatically creating new consent grants without explicit candidate action. |
| **Sovereign Vault** | A non-custodial, encryption-first container holding a candidate's data, consent grants, and capability tokens. |
| **Vault circumvention** | Obtaining candidate data through any channel that bypasses the Vault's consent enforcement. |

---

## Document History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1.0 | 2026-02-10 | Protocol Governance Working Group | Initial draft |
