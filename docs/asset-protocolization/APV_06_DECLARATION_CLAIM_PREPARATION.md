# APV-06 — Declaration / Claim Preparation Layer

> **Status:** `VERIFIED` — implemented in `@aoc/asset-protocolization`
> (`packages/asset-protocolization/src/declarations/`).
>
> **Depends on:** APV-03 (asset profile framework), APV-04 (`ProtocolizationCase`),
> APV-05 (evidence intake).
> **Consumed by:** APV-07 (verification), APV-08 (attestation), and every later slice that
> needs to know who asserted what.

```text
A declaration record proves that a declaration was recorded.
It does not prove the proposition declared.
```

```text
Declaration recorded        !=  declaration true.
Claim exists                !=  claim verified.
Evidence linked             !=  claim proven.
Declarant identity          !=  declarant authority.
Declaration present         !=  requirement satisfied.
All declarations present    !=  case ready.
```

Those lines are the whole slice. Everything below explains how the code holds them.

---

## 1. What the declaration layer is

The mechanism by which a participant *asserts something* into a `ProtocolizationCase`.

One operation — `recordProtocolizationDeclaration` — takes a submission, decides whether it
is **structurally admissible**, and, if it is, returns an updated case, an immutable record,
and the two events that describe what happened. It is a pure function: no network call, no
database call, no identity resolution, no signature check, no policy evaluation. The only
outside world it touches is the injected clock and the injected profile catalogue.

When it succeeds, its claim is exactly this:

```text
APV recorded that this participant asserted this proposition
into this case workflow, under this pinned profile version,
against these requirements, pointing at this already-admitted evidence,
at this instant.
```

Each word is load-bearing. It is **not** a claim that the proposition is true; that the
declarant is who they say they are; that the declarant owns, authored, controls or may act
for anything; that the evidence they pointed at supports them; that the requirement they
were correlated to is satisfied; or that the case is ready. Every one of those is a
conclusion a later slice reaches by *reading* what this one recorded.

### The five things this layer keeps apart

APV-06 exists to establish, in code, that these are five different statements:

```text
someone says X                          ← APV-06 records this
evidence exists that may relate to X    ← APV-05 records this
verification evaluates whether X holds  ← APV-07
a professional attests X within scope Y ← APV-08
someone is authorized to act            ← governance, outside this vertical
```

None of them implies the next. A system that cannot tell them apart will eventually treat a
form submission as a legal fact.

## 2. What APV-06 owns

```text
the declaration envelope       ProtocolizationDeclarationSubmission
the declaration identity layer DeclarationId
the two claim pathways         DeclarationPathway (Reference | Canonical)
the acceptance record          ProtocolizationDeclarationRecord
structural admission           validateProtocolizationDeclarationSubmission
the operation                  recordProtocolizationDeclaration
the audit fact                 ProtocolizationDeclarationRecorded
the persistence port           DeclarationRepository (+ in-memory implementation)
```

## 3. What APV-06 does not own

```text
the claim record itself        CanonicalClaim      — Protocol's, referenced, never redefined
the assertion record           CanonicalAssertion  — Protocol's, never constructed here
the claim vocabulary           ClaimType           — Protocol's, never widened
the participant model          CanonicalPrincipalRef / PrincipalKind — Protocol's
the evidence record            CanonicalEvidence   — Protocol's, admitted by APV-05
the requirement model          AssetProfile / AssetDeclarationRequirement — APV-03's
the case aggregate             ProtocolizationCase — APV-04's
the material pathway           ProtocolizationMaterialKind.Declaration — APV-04's
```

It also owns none of: verification, adjudication of conflicts, identity resolution,
authority resolution, delegation validation, attestation, readiness, legal effect,
protocolization, governance, tokenization or payment.

## 4. Relationship to `CanonicalClaim` — the substrate decision

This was the central architectural question of the slice, and the answer is deliberate.

### The vertical never constructs a `CanonicalClaim`

Look at what Protocol's `CanonicalClaim` actually requires:

```text
id              a minted canonical record identifier
type            a ClaimType
subject         what the claim is about
issuer          who issued it
assertionRef    a CanonicalAssertionId naming a CanonicalAssertion
                that must itself exist somewhere
evidenceRefs    the evidence the claim travels with
attestationRefs the attestations it travels with
issuedAt        when it was issued
```

Two of those cannot be honestly produced by this layer. Minting a canonical record
identifier is not this vertical's act. And `assertionRef` would require APV-06 to mint a
*second* identifier for a `CanonicalAssertion` record it neither builds nor stores — leaving
a claim in circulation that points at an assertion that does not exist.

Fabricating either to make a declaration convenient would put a counterfeit Protocol record
into the world, which is precisely the failure the whole boundary exists to prevent. APV-05
refused to construct `CanonicalEvidence` for the same reason
([`APV_05_EVIDENCE_INTAKE.md` §4](./APV_05_EVIDENCE_INTAKE.md)); this is that refusal applied
to the claim substrate.

There is therefore no `prepareProtocolizationClaim` in this package, and nothing named
"prepare" that produces a Protocol record.

### The two declaration pathways

Both end at the same place — a `CanonicalClaimId` naming a Protocol record — and differ only
in what the caller already holds.

```text
Reference   the caller names an already-recorded CanonicalClaim by id, and states
            the ClaimType (plus a claimSubtype where the profile narrows it) so the
            correlation can be checked. Nothing here dereferences the record: this
            package cannot resolve a Protocol record and must not pretend otherwise,
            so naming one asserts that it exists no more than naming a file asserts
            that it is readable.

Canonical   the caller supplies the CanonicalClaim document it constructed elsewhere.
            The operation reads its `id` (which becomes the recorded reference) and
            its `type` (which becomes the declared claim type), checks that the fields
            it reads are structurally admissible, and then discards the document.
```

The `Canonical` arm deliberately carries **no** `claimType` field of its own: the document is
the single spelling of it, so the two can never disagree.

### What the vertical owns instead

The *declaration record* — the auditable account of who asserted what, when, into which case,
under which pinned profile, against which requirements, pointing at which evidence. That is a
workflow fact this package is entitled to state, and it is the thing APV-07 reads.

```text
declaration record  ──names──▶  CanonicalClaimId   (Protocol's record, never copied)
                    ──names──▶  CanonicalEvidenceId[]  (APV-05's material, never copied)
```

No claim payload is snapshotted into vertical workflow state. A second copy of a Protocol
record is a copy that can drift from the record it copies.

### `CanonicalAssertionId` — Gate A0 `U-3` stays undischarged

`U-3` gives this vertical ownership of assertion identifiers *if it ever needs one*. APV-06
does not: a `CanonicalAssertion` is reachable only through `CanonicalClaim.assertionRef`, and
this package constructs no claim. So it mints no assertion identifier and writes no helper for
one. `U-3` remains open, which is the honest state to leave it in.

## 5. Machine-readable semantics — and why there is no `DeclarationKindId`

APV-06 introduces **no** new vocabulary for *what* is being declared, because APV-03 already
froze one. An `AssetDeclarationRequirement` states the declaration it requires as Protocol's
`ClaimType` plus an optional vertical `claimSubtype` token:

```ts
{
  id: 'declaration.correspondence.required',
  kind: AssetRequirementKind.Declaration,
  obligation: AssetRequirementObligation.Required,
  claimType: ClaimType.Custom,
  claimSubtype: 'my.declaration.subject-correspondence',
}
```

A submission carries exactly that pair, and it is the whole of what a declaration *means* to a
machine.

A parallel `DeclarationKindId` would have been a second claim-requirement language for one
concept: a profile saying `claimType: Custom, claimSubtype: 'x.y'` while a submission said
`declarationKind: 'x.y'`, and something would then have to decide which of the two a later
evaluator believes.

So a new *category* of declaration — "I created this work", "I am authorized to act for this
entity", "this external entry corresponds to this subject" — is a **profile** that names
`ClaimType.Custom` with a new `claimSubtype` token. It is a configuration change, not a change
to this package, not a change to APV-04, and emphatically not a change to AOC Protocol: no
member is ever added to `ClaimType` for an asset category. The test fixtures demonstrate a
whole proposition family (`test.declaration.subject-correspondence`) that no production code
has ever heard of.

### The human-readable statement

`statement` is optional, bounded and **presentation only**. No behaviour anywhere in this
package reads it, parses it, matches on it, derives a requirement from it, or compares two
statements to decide that two declarations are the same declaration. What a declaration means
to a machine is `claimType` + `claimSubtype`; this is what it reads like to a reviewer.

It is deliberately excluded from the event (§14), it is never an identity (§11), and callers
should keep personal data out of it — it is the one unstructured field in the slice.

## 6. Declarant, tenant and subject are three different things

```text
tenant       the workflow isolation boundary        ProtocolizationTenantId
declarant    the participant who asserted           CanonicalPrincipalRef
subject      what the case is about                 ProtocolizationCaseSubject
```

None is ever derived from another. One tenant routinely processes declarations from many
participants, and no participant identity is inferred from a tenant id. The declarant is a
participant asserting something *about* the subject — conflating the two would make every case
a case about whoever last filled in a form, so
`ProtocolizationCase.subject` is never touched by this layer.

### The declarant is Protocol's own primitive

`CanonicalPrincipalRef` is documented as identifying a principal *without proving identity,
standing, or authority* — exactly the assertion this layer is entitled to make. The vertical
therefore declares no participant, actor or party type of its own, and a human, an
organization, a system and an AI are all representable through `PrincipalKind` without APV-06
knowing the difference.

`PrincipalKind.Unknown` is admissible, and that is not an oversight: a participant whose
canonical identity has not been resolved is a first-class case in progressive protocolization.
The honest record is "an unresolved principal asserted X"; refusing it would push callers into
inventing a kind they do not know.

### Recording a declarant is not authenticating one

Nothing here verifies that the principal exists, that the caller *is* that principal, or that
the principal may make this assertion.

```text
recorded:      Actor A says X
never implied: Actor A was entitled to say X
```

### Why the declarant is not cross-checked against `claim.issuer`

On the `Canonical` pathway the supplied claim names its own issuer, and APV-06 deliberately
does not require it to equal the declarant. A participant may legitimately submit a claim
issued by someone else — an agent acting for a party is the obvious case — and deciding
whether a *particular* differing pair is legitimate is exactly the delegation question this
layer must not answer. Requiring equality would silently forbid a legal arrangement; asserting
equivalence would silently manufacture one. Recording both, unjudged, does neither.

## 7. Relationship to `ProtocolizationCase`

A successful declaration performs its case mutation through APV-04's own
`addProtocolizationCaseMaterial`, with `ProtocolizationMaterialKind.Declaration` — the material
kind APV-04 already froze, whose payload is a `CanonicalClaimId`.

There is **no** second declarations list on the case. Delegating means one implementation of
the lifecycle rule, the requirement-id rule, the pinned-version rule, the duplicate-material
rule, the clock rule and the revision rule — and exactly one revision increment per
declaration.

```text
recordProtocolizationDeclaration
    │
    ├── tenant gate                      (before anything reads the case)
    ├── structural admission             (declaration-validation.ts)
    ├── case identity match
    ├── duplicate-claim check            (scoped to this case)
    ├── evidence links resolve           (scoped to this case)
    ├── profile compatibility            (the rule APV-03 encodes)
    └── addProtocolizationCaseMaterial   (APV-04 owns everything from here)
            │
            └── revision + 1, material appended, requirement states correlated
```

### Changes to APV-03, APV-04 and APV-05

None. No production file in `src/requirements.ts`, `src/profile*.ts`, `src/case/` or
`src/evidence/` was modified. APV-06 is additive: one new directory, one new block of exports
in the package facade. The only shared test fixture that changed is `createTestCatalog`, which
now also catalogues the APV-06 test profiles.

## 8. Requirement correlation — the one rule APV-03 encodes

A declaration correlates only to requirements of the case's **exact pinned** profile version.
There is no latest-, current- or nearest-version resolution anywhere in this package.

On top of APV-04's own requirement-id checks, APV-06 enforces the compatibility rules that
APV-03 genuinely encodes — the requirement `kind` vocabulary, and the declaration requirement's
own `claimType` / `claimSubtype`:

```text
every correlated requirement is a Declaration requirement
every correlated requirement names this claimType
every correlated requirement's claimSubtype, when it declares one,
  is the subtype this submission carries
```

### Why *every*, and not merely *at least one*

Because APV-04's `correlate` is **kind-blind**. It moves every id in `requirementIds` to
`MaterialPresent` and stamps each with the new material's id. If a declaration could name a
non-declaration requirement, the case would report evidence, verification, attestation or
identity material as present when a `CanonicalClaimId` — and nothing else — had arrived, with
nothing in the projection to mark the difference.

```text
A Declaration material association must NOT cause an Evidence-only,
Verification-only, Attestation-only, Identity-only, or otherwise mechanically
incompatible requirement to become MaterialPresent merely because that
requirement id was included in the Declaration association.
```

"Someone asserted something" is not a document, not a check and not an attestation, and a
profile that asked for one of those has not been answered by an assertion. The whole
association is therefore rejected with `DECLARATION_REQUIREMENT_INCOMPATIBLE`, whose `details.
requirementIds` names exactly the offending ids — and it is rejected **before**
`addProtocolizationCaseMaterial` runs, so a refused declaration leaves the case byte-for-byte
as it was, with no material, no revision increment and no requirement moved off `Pending`.

Correlating one declaration to *several* declaration requirements is still permitted: the rule
is "every correlated requirement is a Declaration requirement", not "exactly one".

This reads a vocabulary APV-03 froze; it invents no semantics. What is deliberately still not
inferred is anything about whether the declaration is true, adequate, or counts toward the
requirement's `minimumCount`.

### Correlation is not satisfaction

Passing the check means the profile asked for a declaration of this type and one was offered.
Whether the declaration is true, whether it counts, and whether the requirement's
`minimumCount` is met are all questions for a later evaluator.

### Conditional requirements stay unresolved

A declaration correlated to a `Conditional` requirement leaves its
`ProtocolizationRequirementConditionStatus` at `Unresolved`. Declaring against a requirement
does not resolve whether the requirement even applies.

## 9. Evidence linkage — and what a link is not

A declaration may optionally name evidence **already admitted into this case** through APV-05:

```text
Declaration D1 ──▶ Evidence E1
               ──▶ Evidence E2
```

Every reference must already be evidence material in this case. That is the only thing about
it this layer can mechanically know, and checking it keeps a record from pointing at evidence
that never entered the workflow. It is also — without any tenant comparison at all — what makes
another tenant's evidence unlinkable: a case holds only material admitted into it, so a
reference to evidence in a different tenant's case simply is not there. The failure is
indistinguishable from "no such evidence anywhere", which is the answer a caller is entitled to.

### A link is not support

```text
Evidence linked  !=  claim proven.
Evidence linked  !=  claim supported.
Evidence linked  !=  claim verified.
```

The evidence may support the assertion, contradict it, be irrelevant to it, be stale, be
ambiguous, or be forged. APV-06 records only that the declarant pointed at it. There is no
`evidenceSupportsClaim`, `supportStrength`, `relevance`, `sufficiency`, `corroborated` or
`contradicted` field, and no field where any such verdict could live. Establishing an actual
support relationship is a `CanonicalVerification` produced by APV-07.

### No duplication

The evidence is referenced by `CanonicalEvidenceId`. It is not copied into the declaration, not
re-admitted, and not counted twice: one evidence material may relate to many declarations, and
one declaration may point at many evidence items.

## 10. Progressive declaration

Declarations arrive over the life of a case, in any order relative to evidence, from any number
of participants, minutes or months apart. Nothing assumes a single
submit-everything-then-verify transaction.

```text
T0  case created
T1  declarant A asserts X                      (no evidence exists yet)
T2  evidence E1 arrives                         (APV-05)
T3  evidence E2 arrives                         (APV-05)
T4  declarant B asserts Y, pointing at E1 + E2
T5  declaration D3 arrives
T6  verification evaluates the accumulated record  (APV-07)
```

Both orders are first-class:

- **Declaration before evidence.** A declaration may legitimately exist before any supporting
  evidence. Declaration *admissibility* is not declaration *evidentiary sufficiency*, and a
  profile's `minimumCount` is a later evaluator's arithmetic.
- **Evidence before declaration.** A declaration arriving later may link evidence already in
  the case, without either object being duplicated and without any support conclusion.

Each declaration is independent, each produces its own record at its own instant, and no
declaration rewrites, replaces or deletes what an earlier one recorded. Every declaration
remains individually observable: there is no "current declaration state" that the last one
overwrote.

### The progressive assurance principle

```text
Recording a declaration early creates evidence that
the declaration was made at a given time.

It does not create evidence that the declaration is true.
```

The system can prove `Actor A asserted X at T` long before it can say anything at all about
whether X is correct.

### The audit fact and the asserted proposition

```text
"Actor A declared X at T"   is a historical fact about the workflow —
                            auditable, timestamped, pinned to a profile version,
                            and true regardless of X.

"X"                         remains merely the asserted proposition
                            until something later evaluates it.
```

This distinction is the reason the slice is worth having.

## 11. Conflicting declarations — preserved, never adjudicated

Two participants may assert propositions that cannot both be right. APV-06 records both.

```text
Declarant A asserts X.
Declarant B asserts NOT-X.
```

It does not compare a new declaration against the declarations already in the case, does not
overwrite one with the other, does not mark either false, does not choose a winner, and does
not emit a failure for the pair. Both remain in the case's material list and in the declaration
log, in the order they were made.

**Does APV-06 adjudicate conflicts? No.** Detecting and adjudicating a conflict is APV-07's
work, and it needs both declarations on the record to do it — an intake layer that silently
dropped the second one would destroy exactly the input the verification slice depends on.

## 12. Identity, uniqueness and replay

```text
(tenantId, declarationId)   repository identity. Tenant-scoped, so two tenants may hold
                            the same declarationId and neither observes the other's.
claimRef within one case    at most one declaration material may name one CanonicalClaimId
                            in one case. Across cases the same claim may be named again.
materialId within one case  enforced by the case aggregate (APV-04).
statement text              never an identity of anything.
```

Deterministic replay behaviour:

| Situation | Behaviour |
|---|---|
| Same `declarationId` saved twice for one tenant | `DECLARATION_DUPLICATE`, never an overwrite |
| Same `claimRef` twice in one case | `DECLARATION_DUPLICATE_CLAIM` |
| Exact replay of one submission | `DECLARATION_DUPLICATE_CLAIM` (the claim check fires first) |
| Same `materialId` reused in one case | `PROTOCOLIZATION_CASE_DUPLICATE_MATERIAL` (APV-04) |
| Same proposition, two different declarants | Both recorded — two people said it |
| Word-for-word identical statement text | Irrelevant; identity is by identifier, never by text |
| Same declarant, later, distinct `declarationId` | Recorded separately, preserved |

Correlating a declaration that is *already* in the case with a further requirement is not a new
declaration at all — it is APV-04's `associateProtocolizationCaseMaterial` on the material the
record names.

## 13. Corrections, supersession and retraction

There is no update, no delete and no retraction anywhere in this slice.

A participant who wants to correct a statement makes a **new** declaration with a new
`declarationId`. Both remain observable, in order, and a later slice reads the pair. Erasing or
overwriting the first would destroy the only evidence of what was originally asserted, which is
the one thing an assertion log exists to preserve.

Formal supersession semantics are deliberately not invented here. A future retraction, if the
frozen architecture ever calls for one, should itself be an auditable assertion rather than a
deletion.

## 14. Timestamps

```text
declaredAt   when the declarant says the declaration was made.
             Optional, supplied by the caller, never invented, preserved verbatim.

recordedAt   when the vertical accepted it. The operation's own instant, read from the
             injected ProtocolizationClock, and identical to the resulting material's
             `addedAt`, the case event's `occurredAt` and the declaration event's.
```

The two answer different questions — "when do they say they asserted it?" and "when did we
accept it?" — and collapsing them would let the workflow's own timeline be rewritten by whoever
fills in a form. A submission that supplies no `declaredAt` leaves it **absent** rather than
defaulting to the recording instant, exactly as APV-05 treats `observedAt`.

Nothing compares the two. A `declaredAt` in the future is recorded as supplied: whether a
claimed instant is plausible is a later slice's question against the profile's own freshness
rules. The clock is read exactly once per operation, so the record and the material it
describes can never disagree about when the same act happened.

## 15. Tenant isolation

Every operation and every repository method requires an explicit acting tenant.

```text
domain      the tenant gate runs before anything reads the case, so a cross-tenant
            caller cannot learn from an error code whether their guesses about the
            case were right.
repository  get(tenantId, declarationId) / exists(tenantId, declarationId) /
            listByCase(tenantId, caseId) / save(record).
            There is no tenant-free overload and no cross-tenant enumeration.
evidence    a cross-tenant evidence link fails as "no such evidence in this case",
            which is indistinguishable from evidence that never existed.
```

A tenant cannot record a declaration into another tenant's case, retrieve another tenant's
record, enumerate another tenant's declarations, link another tenant's evidence, or infer from
error behaviour that a duplicate identifier exists in another tenant.

This is APV-04's and APV-05's tenancy model, reused. There is no third tenancy model.

## 16. Structural validation — and what it deliberately is not

`validateProtocolizationDeclarationSubmission` and
`validateProtocolizationDeclarationRecord` decide whether a value has the *shape* this workflow
can carry. The result field is named `admitted`, not `valid`, for the reason APV-05 named its
own: "valid" is the word that quietly slides from *conforms to a schema* to *is legitimate*,
and this layer only ever means the first — which matters more here than anywhere else in the
vertical, because the thing being admitted is somebody's assertion about the world.

**What is checked**

```text
identifiers are well formed        timestamps are canonical UTC
required fields are present        optionals are absent rather than undefined
unknown fields are rejected        requirement ids are unique and non-empty
the declarant ref is usable        the claim type is one Protocol declares
the statement is bounded text      the pathway matches its payload
the claim document is admissible   evidence links resolve inside the case
the case exists, matches, and is in a state that accepts material
the requirement ids belong to the exact pinned profile version
the correlated declaration requirements' claim type and subtype match
```

**What is not checked, and could not be**

```text
the claim record exists            the proposition is true
the declarant is authenticated     the declarant has authority
the delegation is valid            the signature is authentic
the linked evidence supports it    the evidence is sufficient
the credential is current          the registry statement is true
contradictions are resolved        the requirement is satisfied
a professional approved it         the case is ready
the assertion is legally binding
```

### No semantic `valid` boolean

There is no `isValid`, `isTrue`, `isVerified`, `isApproved`, `isAuthorized`, `claimConfirmed`
or `ownershipEstablished` field on any APV-06 type, and the record's unknown-field rejection
means one cannot be smuggled onto a record either. The vocabulary is *admitted*, *recorded* and
*structurally accepted* throughout.

## 17. Requirement progress semantics

A successful declaration moves the correlated requirement's material status:

```text
Pending  ──▶  MaterialPresent
```

That is the entire projection, and it still has exactly the two members APV-04 froze. It means
only:

```text
a declaration material reference exists for this requirement.
```

It does not mean the claim is true, the claim is verified, the requirement is satisfied, or the
case is ready. A case in which **every** declaration requirement has material is still a
`Draft` or `Active` case: there is no `Ready` state to reach, because deciding readiness needs
the claims themselves and an evaluator that does not exist in this slice.

## 18. Persistence

`DeclarationRepository` is a **port**, declared in the vertical, with one deterministic
in-memory implementation. This is Gate A0 `U-6` applied to a third aggregate: no vertical
workflow persistence port goes into AOC Protocol, and Protocol never learns that declarations
exist.

No database adapter, migration, schema or blob store was added. Binding the port to a store is
an infrastructure decision with its own owner and its own review.

It stores **records of declarations**, not claims. A `CanonicalClaim` lives wherever Protocol
records live.

### Append-only

There is no `update` and no `delete`. `save` rejects a second write under the same
`(tenantId, declarationId)` rather than overwriting, records are validated on the way in, and
everything handed back is deeply frozen — so a caller cannot mutate stored history by holding
on to a reference it saved.

### Transactional limitation — stated, not papered over

A successful declaration must update the case *and* record a declaration record: two writes to
two stores. `recordProtocolizationDeclaration` performs **neither**. It returns:

```text
protocolizationCase   the updated aggregate
record                the immutable declaration record
caseEvent             APV-04's ProtocolizationMaterialAdded
declarationEvent      APV-06's ProtocolizationDeclarationRecorded
```

so a composition layer can commit them together under whatever transactional facility it
actually has. Performing them inside the operation would let it report success after the first
write succeeded and the second failed — a case carrying declaration material with no record
behind it. There is no distributed transaction here and none is pretended.

## 19. Errors

```text
DECLARATION_SUBMISSION_INVALID      structural admission failed; carries reasonCodes
DECLARATION_TENANT_REQUIRED         the acting tenant is missing or malformed
DECLARATION_TENANT_MISMATCH         the acting tenant does not own the record addressed
DECLARATION_CASE_MISMATCH           the submission names a different case
DECLARATION_DUPLICATE               (tenantId, declarationId) already exists
DECLARATION_DUPLICATE_CLAIM         this case already holds declaration material
                                    naming this canonical claim
DECLARATION_REQUIREMENT_INCOMPATIBLE  a correlated requirement is not a declaration
                                    requirement; carries the offending ids
DECLARATION_CLAIM_TYPE_MISMATCH     a correlated declaration requirement names a different
                                    claimType, or a claimSubtype this submission lacks
DECLARATION_EVIDENCE_LINK_UNKNOWN   a supporting evidence ref is not evidence material here
DECLARATION_RECORD_INVALID          a record document failed validation
```

Everything about the *case* is APV-04's to refuse and is delegated rather than restated: a
cancelled case, an unknown requirement id, a requirement id from a newer profile version, a
duplicate material id, a clock that moved backwards and a broken aggregate each fail with their
existing `PROTOCOLIZATION_CASE_*` code. Re-spelling any of them here would create two codes for
one condition.

**Not one code is an outcome.** Every code names a structural refusal: a shape this workflow
cannot carry, or a correlation the pinned profile does not describe. There is no code meaning
the declaration was disbelieved, contradicted, unsupported, unauthorized or rejected on its
merits — refusing a declaration on its merits is an evaluation this slice does not perform. A
structurally admissible declaration is always recorded, including one that flatly contradicts a
declaration already in the case.

`code` and `details` are the stable machine surface; `message` is a debugging aid and nothing
downstream may parse it.

## 20. Auditability and events

One event, because this slice performs one operation:

```text
ProtocolizationDeclarationRecorded
```

Read the name literally: *recorded*. Not believed, not accepted as true, not counted toward
anything.

There is no `ProtocolizationClaimPrepared` alongside it, because this package prepares no
`CanonicalClaim` — a second event named for preparing one would describe something that never
happens. And there is no `ClaimVerified`, `ClaimProven`, `DeclarationApproved`,
`OwnershipConfirmed`, `AuthorityConfirmed`, `ProfessionalAttested`, `CaseReady` or
`AssetProtocolized`: an event named for something that cannot happen yet is a promise the code
does not keep.

Like APV-05, this is a **separate union** from APV-04's. The case mutation emits APV-04's own
`ProtocolizationMaterialAdded`, returned unchanged alongside this one; widening
`PROTOCOLIZATION_CASE_EVENT_TYPES` would have made a closed, reviewed union of case facts grow
a member that is not a case fact. The two events describe the same instant from two layers and
share `occurredAt` and `caseRevision`, which is what lets an audit reader join them without
inventing an ordering.

The human `statement` is deliberately **not** on the event: an event fans out to subscribers who
may have no business reading free text a participant typed, it is the one unstructured field in
the slice, and nothing downstream may derive machine meaning from it anyway. A reader entitled
to the text reads the record.

Events are **outputs**, not the source of truth. The record is the record; a dropped event loses
a notification, never declaration history.

## 21. Deliberate non-goals

```text
verification of any kind                  APV-07
conflict detection and adjudication       APV-07
PASS / FAIL / WARNING / MANUAL_REVIEW / UNAVAILABLE outcomes   APV-07
professional attestation workflow         APV-08
ATTEST / REJECT / REQUEST_MORE_EVIDENCE / ABSTAIN              APV-08
readiness, expanded state machine         APV-09
protocolization execution, final record   APV-10
concrete asset profiles                   APV-11+
identity resolution, authority resolution, delegation validation
policy, approvals, grants, obligations, revocation             AOC Enterprise
token issuance, contracts, custody, settlement                 Tokenizer / Workstream B
fee assessment, billing, payments
registry connectors, network I/O of any kind
database adapters, blob stores, upload handling
```

## 22. Architectural prohibitions

Enforced by `tests/declaration-boundaries.test.ts` and
`tests/declaration-truth-semantics.test.ts`:

```text
no parallel Claim, Assertion, Evidence, Attestation, Verification, Credential,
  Proof, Principal or subject-identity type is defined
no canonical record identifier is minted, and no Protocol record is constructed
no branch on an asset category, a profile id, a claim subtype or an individual ClaimType member
no import outside @aoc/protocol's declared subpaths and relative modules
no Enterprise, runtime, monetization, tokenizer, governance or storage dependency
no clock of its own — Date.now() and new Date() appear nowhere
no I/O, no adapter, no provider, no client construction
no truth, verification, authority or legal identifier anywhere in the source
no concrete product profile id and no closed declaration vocabulary
no change to AOC Protocol
```

```text
Protocol                 != Asset Protocolization
Asset Protocolization    != Enterprise Governance
Enterprise Governance    != Tokenizer
Declaration              != Truth
Protocolization          != Tokenization
```

## 23. Architecture after APV-06

```text
AOC Protocol
│  generic identity / evidence / claim / attestation / verification primitives
│  CanonicalClaim, CanonicalClaimId, ClaimType, CanonicalPrincipalRef, PrincipalKind,
│  CanonicalEvidenceId, CanonicalReferenceSource
▼
AssetProfile                        (APV-03)  what a category requires,
│                                             including which declarations
▼
ProtocolizationCase                 (APV-04)  one tenant, one subject,
│                                             one pinned profile version,
│                                             lifecycle + material correlation
├──────────────────────────┐
▼                          ▼
Evidence intake            Declaration / claim preparation
(APV-05)                   (APV-06)
receive · admit ·          assert · admit · correlate ·
reference · correlate ·    link evidence · timestamp · record
timestamp · record
└──────────┬───────────────┘
           ▼
      [FUTURE] verification (APV-07)
           ▼
      [FUTURE] professional attestation (APV-08)
           ▼
      [FUTURE] state machine (APV-09) · finalization (APV-10)
           ▼
      Protocolized asset
           ▼
      AOC Enterprise
           ▼
      External capability
      └── optional TOKENIZE ──▶ Tokenizer
```

APV-06 implements only the declaration / claim preparation layer.
