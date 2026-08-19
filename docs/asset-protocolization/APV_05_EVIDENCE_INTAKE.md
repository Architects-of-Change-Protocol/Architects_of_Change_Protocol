# APV-05 — Evidence Intake Layer

> **Status:** `VERIFIED` — implemented in `@aoc/asset-protocolization`
> (`packages/asset-protocolization/src/evidence/`).
>
> **Depends on:** APV-03 (asset profile framework), APV-04 (`ProtocolizationCase`).
> **Consumed by:** APV-07 (verification), and every later slice that needs to know what a
> case was given.

```text
Evidence received     !=  evidence verified.
Evidence associated   !=  requirement satisfied.
Evidence complete     !=  case ready.
```

Those three lines are the whole slice. Everything below explains how the code holds them.

---

## 1. What the evidence intake layer is

The mechanism by which a `ProtocolizationCase` is *told about* evidence.

One operation — `intakeProtocolizationEvidence` — takes a submission, decides whether it is
**structurally admissible**, and, if it is, returns an updated case, an immutable receipt,
and the two events that describe what happened. It is a pure function: no network call, no
database call, no registry lookup, no file read, no digest computation, no signature check.
The only outside world it touches is the injected clock and the injected profile catalogue.

When it succeeds, its claim is exactly this:

```text
APV accepted this evidence reference structurally into this case workflow,
on behalf of this tenant, against these requirements of this pinned profile
version, through this intake pathway, at this instant.
```

It is not a claim that the evidence is authentic, true, authoritative, current, sufficient
or legally effective; not that the requirements it was offered against are satisfied; not
that any identity is resolved, ownership established or authority proven; and not that the
case is ready. Every one of those is a conclusion a later slice reaches by *reading* what
this one recorded.

## 2. What APV-05 owns

```text
the intake envelope            ProtocolizationEvidenceSubmission
the intake identity layer      EvidenceIntakeId
the intake pathway vocabulary  EvidenceIntakeCategoryId (opaque, open)
the acceptance record          EvidenceIntakeReceipt
structural admission           validateProtocolizationEvidenceSubmission
the operation                  intakeProtocolizationEvidence
the audit fact                 ProtocolizationEvidenceReceived
the persistence port           EvidenceIntakeRepository (+ in-memory implementation)
```

## 3. What APV-05 does not own

```text
the evidence record itself     CanonicalEvidence — Protocol's, reused, never redefined
what kind of evidence it is    EvidenceType — Protocol's, never widened
where a reference came from    CanonicalReferenceSource — Protocol's provenance primitive
integrity / signature material CanonicalProofRef — Protocol's, referenced, never checked
credential material            CanonicalCredentialRef — Protocol's, referenced, never checked
registry references            CanonicalRegistryRef / CanonicalRegistryEntryRef — Protocol's
the case aggregate             ProtocolizationCase — APV-04's, consumed, not redesigned
the requirement definitions    AssetProfile — APV-03's, read through the pin, never mutated
verification                   APV-07
declarations / claims          APV-06
attestation workflow           APV-08
the fuller state machine       APV-09
protocolization execution      APV-10
concrete profiles              APV-11 and later
```

## 4. Relationship to `CanonicalEvidence`

The reuse map's row 5 answers "represent one piece of evidence (APV-05)" with
`CanonicalEvidence` + `EvidenceType`, verdict **REUSE**. APV-05 discharges that literally:

```text
Protocol Evidence duplicated:  NO
```

There is no `Evidence`, `EvidenceType`, `APVEvidence` or `VerticalEvidence` type anywhere in
the vertical. `packages/asset-protocolization/tests/evidence-intake-boundaries.test.ts`
asserts both halves mechanically — that no such type is declared, and that Protocol's
evidence vocabulary is genuinely referenced, so the first assertion cannot pass for the
wrong reason.

Every type APV-05 *does* introduce is named for a workflow act, never for evidence:
*submission*, *intake*, *receipt*, *category*, *pathway*, *repository*.

### The two intake pathways

`EvidenceIntakePathway` has exactly two members, and they differ only in what the caller
already holds. Both end at the same place — a `CanonicalEvidenceId` naming a Protocol
record.

| Pathway | Caller supplies | Intake does |
|---|---|---|
| `Reference` | a `CanonicalEvidenceId` | records it; never dereferences it |
| `Canonical` | a whole `CanonicalEvidence` | reads `id`, `type`, `createdAt`; records the id; **discards the document** |

There is deliberately **no third pathway in which this package constructs a
`CanonicalEvidence`.** Constructing one requires an `id`, and minting a canonical record
identifier is neither deterministic nor this vertical's to perform; it also requires an
`issuer`, a `source` and a `description` that intake frequently does not legitimately know.
Faking any of them to make intake convenient would put a fabricated Protocol record into
circulation — precisely the failure the whole boundary exists to prevent. This is APV-05's
answer to "receive, normalize or both": **receive a reference, or receive a record the
caller legitimately already has.**

The `Canonical` pathway checks only the three fields intake actually reads. That is an
*admission* check over a Protocol type, not a second definition of it — the same call APV-04
made for `CanonicalRegistryEntryRef`, and for the same anti-drift reason. Protocol publishes
a runtime validator for `CanonicalStanding` and none for `CanonicalEvidence`; if it ever
publishes one, `isAdmissibleCanonicalEvidence` collapses into a call to it. (Recorded as an
observation, not a blocker — see §14.)

### Intake category is not `EvidenceType`

Two different questions, and conflating them is the most likely way this layer would go
wrong:

```text
EvidenceIntakeCategoryId   how the evidence reached the workflow   vertical, open, opaque
EvidenceType               what generic kind of record it is       Protocol, closed, reused
```

They vary independently. A `Document` may arrive by upload or by registry export; one
upload pathway may carry `Document`, `Certification` or `AuditRecord` records. The vertical
owns the first; Protocol owns the second, and APV-05 never widens it.

## 5. Relationship to `ProtocolizationCase`

Intake does not maintain a parallel evidence list on the case. It performs the association
through APV-04's own `addProtocolizationCaseMaterial`, as a
`ProtocolizationMaterialKind.Evidence` material naming a `CanonicalEvidenceId`:

```text
CanonicalEvidence / CanonicalEvidenceId          (Protocol)
        │
        ▼
ProtocolizationEvidenceSubmission                (APV-05, transient)
        │  structural admission
        ▼
addProtocolizationCaseMaterial                   (APV-04, unchanged)
        │
        ├──▶ ProtocolizationCase                 revision + 1, one material added
        ├──▶ EvidenceIntakeReceipt               (APV-05, immutable)
        ├──▶ ProtocolizationMaterialAdded        (APV-04's event, unchanged)
        └──▶ ProtocolizationEvidenceReceived     (APV-05's event)
        │
        ▼
requirement structural progress: Pending → MaterialPresent
```

Delegating means APV-04 enforces, once and in one place, everything it already owns: the
lifecycle rule, the requirement-id rule, the pinned-version rule, the duplicate-material
rule, the clock rule, the revision rule and the freeze. There is one implementation of each
and one set of error codes for each.

### Changes to APV-04 and APV-03

```text
APV-04 aggregate, lifecycle, tenancy, pinning, revision rules:  unchanged
Protocol core:                                                  unchanged
```

Two purely additive, internal, behaviour-preserving changes were made so APV-05 could reuse
existing grammars instead of restating them:

- `src/identifiers.ts` — `isDottedToken` gained an `export` keyword. APV-05's category ids
  are dotted tokens under exactly APV-03's grammar.
- `src/case/case-identifiers.ts` — the internal `isInstanceIdentifier` was renamed
  `isProtocolizationInstanceIdentifier` and exported. An `EvidenceIntakeId` is the same
  *instance* identifier kind as a case id or a material id.

Neither is part of the package facade; the boundary test asserts they stay internal.

## 6. The intake lifecycle

```text
submission arrives
        │
        ├─ acting tenant valid and owns the case?      no ──▶ throw, nothing produced
        ├─ submission structurally admissible?         no ──▶ throw, nothing produced
        ├─ submission names this case?                 no ──▶ throw, nothing produced
        ├─ evidence already in this case?              yes ─▶ throw, nothing produced
        └─ APV-04 accepts the material?                no ──▶ throw, nothing produced
                │ yes
                ▼
        case + receipt + two events
```

The order is part of the contract. The tenant gate fires first specifically so that a
caller acting as the wrong tenant never learns, from a duplicate-evidence error, whether a
given evidence reference is already in someone else's case.

A failure at any step produces **nothing**: no receipt, no event, no case mutation and no
revision increment. A rejected submission leaves the case byte-for-byte as it was, which is
asserted directly.

## 7. Structural validation — and what it deliberately is not

Read the word "validation" here narrowly and literally. The result field is named
`admitted`, not `valid`, because *valid* is the word that quietly slides from "conforms to a
schema" to "is legitimate", and this layer only ever means the first.

**What APV-05 checks:**

```text
intake id well formed              case id well formed
material id well formed            category id well formed
pathway declared and known         payload matches the declared pathway
evidence reference non-blank       supplied evidence document has id/type/createdAt
requirement ids non-empty          requirement ids unique and well formed
requirement ids declared by the pinned profile version
timestamps canonical UTC           correlation id non-blank when present
source descriptor names a Protocol ReferenceSourceKind and a non-blank locator
unknown fields rejected            present-but-undefined optionals rejected
acting tenant present and owns the case
case accepts material in its current state
intake is not a replay of one already in this case
```

**What APV-05 does not verify — and could not:**

```text
the evidence record exists           a digest matches any bytes
a signature is cryptographically valid   a document is authentic
a document is unexpired              a registry statement is true
a registry is authoritative for this proposition
a credential belongs to its presenter    a credential is current
the evidence is fresh enough for the profile
the claim the evidence supports is true
the requirement is satisfied         the profile's requirements are met
ownership, authority or identity is established
the case is ready
```

Those belong to APV-07 and later. APV-05 introduces no `PASS`/`FAIL`/`WARNING`/
`MANUAL_REVIEW`/`UNAVAILABLE` vocabulary, no outcome, no status and no verdict of any kind.

## 8. Progressive evidence accumulation

A `ProtocolizationCase` may exist long before the evidence that will support it. APV-05 is
built for that, and is explicitly **not** a single `submit → verify → finish` transaction.

```text
T0   case created                      requirements projected, all Pending
T1   identity material received        receipt 1, revision 2
T2   documentary evidence received     receipt 2, revision 3
T3   external reference received       receipt 3, revision 4
T4   professional evidence received    receipt 4, revision 5
T5   registry observation received     receipt 5, revision 6
T6   newer evidence received           receipt 6, revision 7 — T2's is still there
T7   [APV-07] verification reads all of it
```

Each intake is independent, carries its own instant, and produces its own receipt. **No
intake rewrites, replaces or deletes what an earlier one recorded.** Later evidence that
supersedes earlier evidence is simply a further intake; both remain observable. Formalizing
supersession — which record wins, on whose authority — is a later slice's work, and
inventing it here would be a policy decision this slice has no mandate to make.

The receipt repository has no update and no delete for the same reason: rewriting a receipt
would be rewriting history, and removing one would erase the only record that evidence
entered a case. A correction is a new intake with a new `intakeId`.

This is what lets an asset protocolization process *begin* before every external or formal
process has completed. The architecture records what has been received so far and what has
not; it presumes no formal external recognition merely because evidence was received, and
it makes no legal claim of any kind. Soberanía records; it does not replace an official registry.

## 9. Requirement correlation and progress

Every requirement id on a submission must be declared by the **exact profile version the
case is pinned to**. Publishing `2.0.0` of a profile line does not make a requirement that
exists only there associable on a case pinned to `1.0.0`; there is no latest-version lookup
anywhere in this package. An unknown, malformed, empty or duplicated requirement id is
rejected, with APV-04's `PROTOCOLIZATION_CASE_UNKNOWN_REQUIREMENT`.

One evidence reference may support several requirements, and several evidence references
may support one requirement:

```text
Evidence E1 ──┬── requirement R2          Requirement R1 ──┬── Evidence E1
              └── requirement R5                           ├── Evidence E2
                                                           └── Evidence E3
```

Neither duplicates a canonical evidence record. Widening an *already-intaken* evidence's
correlation is not a second intake — it is APV-04's
`associateProtocolizationCaseMaterial` on the material the receipt names.

### Material present ≠ satisfied ≠ verified ≠ ready

Accepted evidence moves a requirement's `materialStatus` from `Pending` to
`MaterialPresent`. That is the **only** projection change intake can cause, and
`ProtocolizationRequirementMaterialStatus` has exactly those two members — there is no
`Verified`, `Satisfied`, `Approved`, `Complete` or `Ready` to reach.

A `Conditional` requirement stays `Unresolved` after evidence arrives: evidence does not
resolve whether the requirement even *applies*. Evidence offered against an `Optional` or
`NotRequired` requirement is recorded, because something genuinely was supplied — APV-05
invents no prohibition where APV-03 declared none, and the obligation is still reported as
declared.

A case with material present for every requirement its profile declares is still a `Draft`.
Completeness of material is not readiness, and nothing in this package says otherwise.

## 10. Tenant isolation

Intake is tenant-bound in the domain and in the repository contract, never by a caller
remembering to filter.

The acting tenant travels in the operation context, exactly as for every APV-04 case
operation, and deliberately **not** as a field on the submission: a tenant read off the
value being operated on can never disagree with itself, so a cross-tenant call would be
invisible. A second spelling on the submission could also disagree with the context's, and
then something would have to decide which is authoritative.

```text
tenant A intakes into tenant A's case            accepted
tenant B intakes into tenant A's case            PROTOCOLIZATION_CASE_TENANT_MISMATCH
blank or malformed acting tenant                 EVIDENCE_INTAKE_TENANT_REQUIRED
tenant B reads tenant A's receipt by intake id   undefined
tenant B lists tenant A's case                   []  — same as a case with no intakes
two tenants using the same intake id             both stored, no collision
```

Every repository method takes the tenant. There is no `get(intakeId)` overload, no
`listByCase(caseId)` overload and no cross-tenant enumeration: knowing another tenant's
`intakeId` or `caseId` must be worth exactly nothing.

## 11. Identity and uniqueness

Three identity layers, deliberately not conflated:

| Identifier | Scope | Enforced by | Why |
|---|---|---|---|
| `EvidenceIntakeId` | **tenant** — `(tenantId, intakeId)` | `EvidenceIntakeRepository.save` | Intake ids are minted by tenants; a global constraint would leak existence across a tenant boundary and fail legitimate saves for an invisible reason |
| `ProtocolizationMaterialId` | **case** | APV-04's aggregate | An association exists only inside the case that holds it |
| `CanonicalEvidenceId` | at most one evidence material **per case**; unbounded across cases | `intakeProtocolizationEvidence` | Within a case, two materials naming one record are one record counted twice; across cases, one survey or certificate may legitimately bear on several subjects |

An intake id identifies *the attempt* — it exists for a submission that was rejected, and it
is what an audit reader follows to answer "what did we do with what arrived at 14:02?". A
material id identifies *the association inside the case* — it exists only for an intake that
succeeded, and material can also reach a case through APV-04's own pathway with no intake
behind it. A successful intake produces one of each and records the correspondence.

Deliberate duplicate behaviour:

```text
same intakeId twice (same tenant)              EVIDENCE_INTAKE_DUPLICATE          (repository)
same evidenceRef twice into one case           EVIDENCE_INTAKE_DUPLICATE_EVIDENCE (operation)
same evidenceRef into a different case         accepted
same materialId twice in one case              PROTOCOLIZATION_CASE_DUPLICATE_MATERIAL
same evidence against a second requirement     associateProtocolizationCaseMaterial, not an intake
```

Nothing is silently ignored. A no-op that reports success would either emit an event
describing something that did not happen, or claim success with nothing to show for it —
both leave an audit reader with a false account of the case.

## 12. Timestamps

Four distinct instants, deliberately not flattened into one:

| Instant | Owner | Meaning |
|---|---|---|
| `CanonicalEvidence.createdAt` | Protocol | when the evidence record was created |
| `observedAt` | the **source** | when the source observed what the evidence describes |
| `receivedAt` | the **intake workflow** | when the vertical was told |
| `addedAt` | the **case** | when the association was recorded |

`receivedAt` and the material's `addedAt` are the same instant by construction — one clock
read, so a receipt and the material it describes can never disagree about when one act
happened. `observedAt` is optional, supplied by the caller, preserved verbatim, and
**never invented**: a submission that supplies none leaves it absent rather than defaulting
to the intake instant, because "we observed this now" and "we received this now" are
different assertions and only one of them is ours to make.

The clock is APV-04's injected `ProtocolizationClock`. No module under `src/` calls
`Date.now()` or an argument-less `new Date()` — asserted mechanically, not by convention.

### Freshness is preserved, never evaluated

APV-05 reaches no verdict of `fresh`, `stale`, `expired` or `acceptable age`. A registry
observation seventeen months outside a profile's thirty-day freshness window is **accepted**,
with its `observedAt` intact — refusing it would be APV-07's freshness evaluation, performed
early and in the wrong layer. An `observedAt` *after* `receivedAt` is likewise accepted:
clock skew between an external source and this system is not a structurally impossible
timestamp, and deciding what to make of it is a later slice's judgement. What APV-05
guarantees is that the untouched values survive so that judgement is possible.

## 13. Persistence

```text
implemented:  domain receipt + repository port + one in-memory implementation
not added:    database, migration, schema, blob store, file store
```

Receipts live in the vertical, discharging Gate A0 `U-6` for the intake layer exactly as
APV-04 discharged it for cases: no vertical workflow persistence port goes into Soberanía
Protocol, and Protocol never learns intake exists.

The repository stores **receipts, not evidence**. A `CanonicalEvidence` record lives wherever
Protocol records live. There is no file, no blob, no document body, no upload handling and
no PII by construction — the same exclusion APV-04 froze for case material and APV-02 §2.3
froze for the result envelope. Evidence whose substance is a document reaches this layer as
a *reference*.

### Transactional limitation — stated, not papered over

A successful intake produces two things that belong in two stores: an updated
`ProtocolizationCase` and an `EvidenceIntakeReceipt`. `intakeProtocolizationEvidence`
persists **neither**. It returns both, so the composition layer can commit them together
under whatever transactional facility it actually has.

That is deliberate. Performing the two writes inside the operation would let it report
success after the first succeeded and the second failed — a case carrying material with no
receipt behind it. Two in-memory `Map` writes are not atomic, and pretending otherwise would
hide a real failure mode behind a convenient API. No distributed transaction framework is
invented here.

## 14. Extension points

Described, not implemented.

| Future need | Extension point | Protocol change? |
|---|---|---|
| A new evidence source (upload, registry, credential, sensor…) | a new opaque `EvidenceIntakeCategoryId` | no |
| Source-specific normalization | a composition-layer function producing a `ProtocolizationEvidenceSubmission` | no |
| A registry connector | a vertical adapter behind Protocol's `RegistryLookup` port, feeding a submission | no |
| Document/blob storage | a composition-layer store; the reference reaches intake, the bytes never do | no |
| A production receipt store | an adapter implementing `EvidenceIntakeRepository` | no |
| Persisted domain events | project `ProtocolizationEvidenceReceived` into `AuditEventEnvelope` (APV-09) | no |
| Verification of any of it | APV-07, reading receipts, materials and the referenced Protocol records | no |
| Supersession semantics | a later slice over the append-only intake history | no |

### Why there is no `EvidenceIntakeAdapter` port

Because `ProtocolizationEvidenceSubmission` already is one. Anything that can produce a
submission plugs in — a registry client, an upload handler, a credential presentation reader
— and the intake operation is identical for all of them. Normalization belongs in the
composition layer where the I/O lives, not in a pure domain package, so an extra port would
be an abstraction with exactly one shape behind it and nothing to vary. A test-only
normalizer in `tests/fixtures/test-evidence.ts` demonstrates the pattern end to end.

### Observation, not a blocker

Protocol publishes a runtime structural validator for `CanonicalStanding`
(`isValidCanonicalStanding`) and none for `CanonicalEvidence`. APV-05 therefore performs its
own narrow *admission* check over the three fields it reads. This is recorded as an
observation about Protocol's current published surface, **not** as a core gap that blocks
this slice: the vertical needs no Protocol change to do its job, and no Protocol change was
made. If Protocol later publishes an evidence validator, `isAdmissibleCanonicalEvidence`
collapses into a call to it.

## 15. Errors

APV-05 reuses APV-04's codes for everything about the case, and introduces codes only for
what belongs to the intake layer itself.

```text
EVIDENCE_INTAKE_SUBMISSION_INVALID    submission failed structural admission (carries reasonCodes)
EVIDENCE_INTAKE_TENANT_REQUIRED       acting tenant missing or malformed
EVIDENCE_INTAKE_TENANT_MISMATCH       acting tenant does not own the addressed receipt
EVIDENCE_INTAKE_CASE_MISMATCH         submission names a different case than the one operated on
EVIDENCE_INTAKE_DUPLICATE             (tenantId, intakeId) already exists
EVIDENCE_INTAKE_DUPLICATE_EVIDENCE    this case already holds evidence material for this reference
EVIDENCE_INTAKE_RECEIPT_INVALID       receipt document failed validation (carries reasonCodes)
```

Delegated to APV-04, unchanged: `PROTOCOLIZATION_CASE_TENANT_MISMATCH`,
`PROTOCOLIZATION_CASE_INVALID_TRANSITION` (a `Cancelled` case rejects evidence),
`PROTOCOLIZATION_CASE_UNKNOWN_REQUIREMENT`, `PROTOCOLIZATION_CASE_DUPLICATE_MATERIAL`,
`PROTOCOLIZATION_CASE_INVALID_TIMESTAMP`, `PROTOCOLIZATION_CASE_PROFILE_NOT_FOUND`.

There is deliberately no `EVIDENCE_INTAKE_CASE_NOT_FOUND`: the operation is handed the case
it operates on, so "no such case" is a repository lookup failure and is already spelled
`PROTOCOLIZATION_CASE_NOT_FOUND`. One condition gets one machine-readable code.

`EvidenceIntakeError` has the same shape as `ProtocolizationCaseError` and
`AssetProfileError` — a real `Error` structurally satisfying `ProtocolError`. `code` and
`details` are the stable surface; nothing downstream may parse `message`.

## 16. Auditability and events

One event, `ProtocolizationEvidenceReceived`. There is no `EvidenceVerified`,
`EvidenceApproved`, `RegistryConfirmed`, `ClaimProven`, `OwnershipEstablished`,
`ProfessionalApproved`, `CaseReady` or `AssetProtocolized` — an event named for something
that cannot happen yet is a promise the code does not keep, and each of those names would
additionally assert a conclusion no part of this vertical is entitled to reach.

It is a **separate union** from APV-04's. A successful intake mutates the case through
APV-04's own operation, which emits its own `ProtocolizationMaterialAdded`; that event is
returned unchanged alongside this one. Widening `PROTOCOLIZATION_CASE_EVENT_TYPES` would
have made a closed, reviewed union of case facts grow a member that is not a case fact.

The two events describe the same instant from two layers — the case says *material was
associated*, intake says *evidence was received through this pathway from this source* — and
they share `occurredAt` and `caseRevision`, which is what lets an audit reader join them
without inventing an ordering. Ordering within one case is the monotonic case revision;
APV-05 introduces no second counter and no event sourcing.

Events are **outputs**, not the source of truth. The receipt is the record; a dropped event
loses a notification, never intake history.

## 17. Deliberate non-goals

APV-05 implements none of: declarations or claims (APV-06); verification execution,
outcomes, hash verification, signature verification, freshness evaluation, identity
resolution or conflict adjudication (APV-07); professional review, notary or lawyer
workflow, `ATTEST`/`REJECT`/`REQUEST_MORE_EVIDENCE`/`ABSTAIN` (APV-08); an expanded state
machine or `READY`/`PROTOCOLIZED`/`SUPERSEDED` (APV-09); protocolization execution or
`ProtocolizationResult` (APV-10); concrete asset profiles (APV-11); file, blob or upload
infrastructure, S3, Supabase Storage, IPFS or Pinata; real registry connectors; Enterprise
authority, policy, approvals or grants; `TOKENIZE`, tokenization, tokenizer adapters,
blockchain or smart contracts; fees, billing, Stripe, settlement or payments.

There is also no waiver, override, exception-approval or admin bypass. Each of those raises
questions of authority, delegation, policy and audit that belong to later architecture.

## 18. Architectural prohibitions

Asserted by `packages/asset-protocolization/tests/evidence-intake-boundaries.test.ts` and
`evidence-intake-truth-semantics.test.ts`, alongside APV-03's and APV-04's own boundary
tests:

```text
no parallel Evidence / EvidenceType / CanonicalEvidence substrate
no parallel Claim / Attestation / Verification / Credential / Proof / identity primitive
no parallel provenance primitive — CanonicalReferenceSource is reused
Protocol's evidence vocabulary is genuinely referenced, so the guards cannot pass vacuously
no import outside @aoc/protocol's declared subpaths and relative modules — not even node:
no dependency other than @aoc/protocol
no Enterprise, runtime, monetization, tokenizer, storage or persistence import
no branch on assetCategory, assetType, profileId or categoryId
no Date.now() and no argument-less new Date()
no fetch, no registry lookup, no file read, no runtime/adapter/provider/client construction
no digest computation, no signature verification, no freshness evaluation
no isVerified / isAuthentic / isOwner / isAuthoritative / isApproved / isReady / claimProven
no readonly `valid` / `verified` / `trusted` / `approved` field
no PASS / FAIL / WARNING / MANUAL_REVIEW / UNAVAILABLE
no ATTEST / REQUEST_MORE_EVIDENCE / ABSTAIN, no review queue or packet
no READY / PROTOCOLIZED / SUPERSEDED, no ProtocolizationResult
no CanonicalClaim minting, no claimRef, no assertion id
no closed EvidenceIntakeCategory enum
no asset-class, jurisdiction, tokenization, payment or upload vocabulary
no concrete product profile id
no APV-05 concept anywhere in @aoc/protocol
```

And, restated because it is the point of the whole boundary:

```text
Protocol                 != Asset Protocolization
Asset Protocolization    != Enterprise Governance
Enterprise Governance    != Tokenizer
Protocolization          != Tokenization
```

## 19. Architecture after APV-05

```text
Soberanía Protocol
│  generic identity / evidence / claim / attestation / verification primitives
│  CanonicalEvidence, EvidenceType, CanonicalReferenceSource, proof & credential refs
▼
AssetProfile                        (APV-03)  what a category requires
▼
ProtocolizationCase                 (APV-04)  one tenant, one subject,
│                                             one pinned profile version,
│                                             lifecycle + material correlation
▼
Evidence intake                     (APV-05)  receive · admit structurally ·
│                                             reference · correlate · timestamp · record
▼
[FUTURE] declarations (APV-06) · verification (APV-07) · attestation (APV-08)
[FUTURE] state machine (APV-09) · finalization (APV-10)
▼
Protocolized asset
▼
Soberanía Enterprise
▼
External capability
└── optional TOKENIZE ──▶ Tokenizer
```

APV-05 implements only the evidence intake layer.
