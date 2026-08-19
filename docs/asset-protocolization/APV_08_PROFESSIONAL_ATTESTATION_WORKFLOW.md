# APV-08 — Professional Attestation Workflow

> **Status.** `VERIFIED` — implemented in `@aoc/asset-protocolization`
> (`packages/asset-protocolization/src/attestation/`).

APV-08 is the structured **professional / human review layer** of Asset
Protocolization. It lets an appropriately identified reviewer receive a bounded,
auditable snapshot of one `ProtocolizationCase` and record a scoped professional
decision — optionally producing a legitimate Protocol `CanonicalAttestation`
where, and only where, the substrate genuinely supports one.

```text
AssetProfile                    APV-03
    |
    v
ProtocolizationCase             APV-04
    |
    +-- Evidence                APV-05
    +-- Declarations            APV-06
    +-- Automated verification  APV-07
    |
    v
APV-08 Professional review
    |
    +-- ProfessionalReviewRequest      intent, bound to a case revision
    +-- ProfessionalReviewPacket       deterministic view of that basis
    +-- ProfessionalReviewDecision     the reviewer's recorded position
    +-- CanonicalAttestation           Protocol's artifact, where legitimate
    |
    v
Review / attestation history
    |
    | FUTURE
    v
APV-09 state machine  ->  APV-10 protocolization execution
```

---

## 1. The truth boundary

**Read this first.** Everything below depends on it.

```text
Professional review        !=   automated verification
Review decision            !=   CanonicalAttestation
Attest                     !=   universal truth
Attest                     !=   case READY
Attest                     !=   protocolized
Reject                     !=   case state Rejected
RequestMoreEvidence        !=   case state MoreEvidenceRequired
Abstain                    !=   Fail
Credential reference present  != credential valid
Credential valid           !=   authority over this subject
Reviewer identity          !=   legal authority
Attestation within scope Y !=   truth outside scope Y
Attestation material present != requirement satisfied
```

APV-08 introduces professional review. It does not introduce universal truth,
final case readiness or legal authority; it does not replace an official
registry; and it never makes a reviewer the owner of a subject.

---

## 2. Four concepts, deliberately not one

| Concept | What it is | Owner | Persisted |
|---|---|---|---|
| `ProfessionalReviewRequest` | the *intent*: review this attestation requirement, on this case revision | vertical | yes, append-only |
| `ProfessionalReviewPacket` | a *deterministic projection* of that review basis | vertical | no — reconstructible |
| `ProfessionalReviewDecision` | what an identified reviewer *did* | vertical | yes, append-only |
| `CanonicalAttestation` | Protocol's attestation artifact | **Protocol** | wherever Protocol records live |

Collapsing any two of these loses something real. A request without a decision is
an open question; a decision without a request has no basis; a packet is a view,
not a record; and an attestation is a Protocol artifact that a decision may
*reference* but is never the same thing as.

---

## 3. Review actions — frozen, and never a boolean

```text
Attest               the reviewer is willing to make the requested attestation,
                     within the declared scope, on the packet they reviewed

Reject               the reviewer declines the requested attestation after review

RequestMoreEvidence  the reviewer cannot responsibly attest on this basis and
                     names, machine-readably, what further material is needed

Abstain              the reviewer declines to reach a substantive decision
```

These are **vertical workflow actions**. None of them is added to any Protocol
enum: `AttestationType` and `VerificationStatus` are unchanged, and Protocol
never learns that professional review exists.

There is no `approved: boolean` anywhere, because every boolean spelling erases
members:

```text
approved = action === Attest    collapses "I decline", "I need more" and
                                "I am not the right person" into one answer
approved = action !== Reject    promotes an abstention and an unanswered
                                request into approval
```

Only `Attest` may produce or reference a `CanonicalAttestation`. `Reject`,
`RequestMoreEvidence` and `Abstain` produce **no canonical artifact at all** —
Protocol defines no `CanonicalRejection`, and inventing an attestation whose type
or statement encoded a refusal would put a counterfeit record into circulation.

---

## 4. Review request — and why it binds a revision

```ts
ProfessionalReviewRequest {
  reviewRequestId, tenantId, caseId, profile,
  attestationRequirementId,       // AssetRequirementKind.Attestation only
  requestedAttestationType,       // one of the pinned requirement's acceptedTypes
  requestedScope,                 // machine-readable; see §6
  reviewBasisRevision,            // the case revision this review is about
  requestedAt, correlationId?
}
```

A professional must never unknowingly attest a moving target.
`reviewBasisRevision` fixes what "this case" meant when review was asked for, and
it never moves. Evidence admitted later, a declaration recorded later and a check
executed later are all outside a request bound to the earlier revision.

There is deliberately **no** `reviewer`, `assignedTo`, `status`, `state` or
`dueAt` on a request. Assignment is APV-13's; a status field would be a second
lifecycle competing with APV-04's.

---

## 5. Review packet — a projection, not an aggregate

`buildProfessionalReviewPacket(context, case, request, inputs)` is pure: no
clock, no repository, no I/O, no mutation. Sections:

| Section | Source | Notes |
|---|---|---|
| `subject` | APV-04 `case.subject` + state | the case's binding; never the reviewer's or a declarant's |
| `participants` | APV-06 declarants | see §5.1 |
| `declarations` | APV-06 records | reused; statement carried for the human, never for machine semantics |
| `evidence` | APV-05 receipts | references and review-relevant metadata; no documents exist to copy |
| `automatedChecks` | APV-07 results | all five outcomes, unreduced |
| `exceptions` | projection over the above | see §8 |
| `attestationRequested` | pinned profile requirement | obligation, accepted types, attester constraint, jurisdiction context |
| `scope` | the request | what is being asked, machine-readably |

### 5.1 Participants — no `Applicant` was invented

APV-04 models no applicant, owner or party list. The only participant role the
workflow genuinely observes is *who was recorded as declaring something*
(`ProtocolizationDeclarationRecord.declarant`), so
`ProfessionalReviewParticipantRole` currently has exactly one member,
`Declarant`. **This is a documented limitation, not an omission**: inventing an
applicant would put a fact into a professional's packet that no part of this
system ever established.

### 5.2 Determinism

The packet carries **no `builtAt`**. An instant would be the one field that
changed between two builds of the same basis, and a packet whose bytes move is a
packet nobody can prove was the one the reviewer saw. Rebuilding from the same
inputs produces the same packet, byte for byte, and mutating a returned packet is
impossible — it is deeply frozen.

### 5.3 Revision filtering — the exact rule

```text
declarations      included when record.caseRevision      <= reviewBasisRevision
evidence receipts included when receipt.caseRevision      <= reviewBasisRevision
verification      for each (requirementId, checkId): the latest result whose
                  evaluatedCaseRevision <= reviewBasisRevision, tie-broken by
                  executedAt then executionId
the case itself   must be exactly at reviewBasisRevision
```

The last line is the strict one, and it is deliberate. A case is an immutable
value here — every operation returns a new one and the old one keeps existing —
so "the case at revision 12" is something a caller can hold. The alternative,
projecting a revision-15 case into a revision-12 basis, cannot be done honestly:
materials carry an `addedAt` but no revision, and `requirementStates` is a live
projection, so the packet would show progress that three later operations
produced. Failing loudly (`REVIEW_BASIS_REVISION_INVALID`) is the only
alternative to doing it silently.

**Result currency, not staleness policy.** A result that evaluated an earlier
revision is *kept*, marked `currentForReviewBasis: false`, and listed under
`exceptions.staleCheckExecutionIds`. It is not invalidated, expired or hidden:
the reviewer sees both revisions and decides. Whether a non-current result must
be re-executed is APV-09's question.

---

## 6. Scope is mandatory, and never prose

```ts
ProfessionalReviewScope {
  requirementId,        // one attestation requirement, never a list
  attestationType,      // Protocol's AttestationType
  subjectRef,           // the case's own SovereignSubjectRef, checked field by field
  caseRevision,         // must equal the request's reviewBasisRevision
  propositionRefs,      // non-empty: what the attestation is about
  scopeStatement?,      // human-readable; no machine semantics
  limitations?          // human-readable; no machine semantics
}
```

An `Attest` without a scope is not representable (`REVIEW_SCOPE_REQUIRED`), and a
scope naming nothing is refused. Nothing downstream may derive machine meaning
from `scopeStatement` or `limitations` — a system whose readiness depended on
parsing a sentence would be a system whose readiness could be changed by
rephrasing one.

`scope.propositionRefs` is narrower than `decision.reviewedRefs`: the first is
what the attestation speaks to, the second is everything the professional looked
at.

---

## 7. Review decision

```ts
ProfessionalReviewDecision {
  decisionId, reviewRequestId, tenantId, caseId, profile,
  attestationRequirementId,
  reviewer,                       // CanonicalPrincipalRef — Protocol's
  reviewerCredentialRefs?,        // CanonicalCredentialRef[] — as presented
  action,                         // the four, closed
  scope?,                         // required for Attest, forbidden otherwise
  reviewBasisRevision,
  resultingCaseRevision?,         // present iff attestation material was added
  reviewedRefs?,                  // required for Attest
  reasonCode?,                    // required for the three non-attesting actions
  requestedMaterial?,             // required for RequestMoreEvidence only
  note?,                          // bounded, human-only, never in an event
  canonicalAttestationRef?,       // Protocol's id, never the decisionId
  attestationMaterialId?,
  decidedAt, correlationId?
}
```

Append-only. There is no update, no delete, no retraction and no supersession
pointer. A reviewer who changes position does so through a **new request bound to
a new revision** and a new decision beside the old one.

**One terminal decision per request.** The domain operation is pure and holds no
repository, so terminality is enforced where decisions live: a second decision
for the same request is refused with `REVIEW_REQUEST_ALREADY_DECIDED`, and an
exact retry with `REVIEW_DECISION_DUPLICATE`. A duplicate attestation therefore
cannot be created by re-running a commit.

---

## 8. Exceptions — a projection, never a second verification system

```text
failedCheckExecutionIds          warningCheckExecutionIds
manualReviewCheckExecutionIds    unavailableCheckExecutionIds
staleCheckExecutionIds           unexecutedChecks
pendingMaterialRequirementIds    unresolvedConditionalRequirementIds
```

Every list is computed by reading structured fields that already exist. Nothing
is re-evaluated, nothing is re-decided, no source record is touched, and no
operation branches on any of it. Remove the section and not one fact is lost —
it exists so a reviewer opening a packet with sixty results does not have to read
all sixty to find the four that matter.

---

## 9. APV-07 integration — nothing is hidden, nothing decides

```text
Pass          visible      Fail          visible
Warning       visible      ManualReview  visible
Unavailable   visible
```

There is no filter, no severity threshold, no aggregate verdict and no reduction
anywhere. In particular:

- a **`ManualReview` never blocks packet construction** — the packet is exactly
  what a `ManualReview` asks for, and refusing to build it would defeat the
  architecture that emitted it;
- an **`Unavailable` is never reinterpreted** as a `Pass` or a `Fail`;
- a **`Warning` is never rounded** into a `Pass` because another check passed;
- a **`Fail` never forces a `Reject`** — a professional may attest within a
  narrower scope, and the code contains no `if (allPass) attest` or
  `if (anyFail) reject` branch of any kind.

And a professional decision **never rewrites an APV-07 result**. An `Attest`
recorded over a basis containing a `Fail` leaves that `Fail` exactly where it
was. Both facts remain true, both remain readable, and the tension between them
is information APV-09 may need rather than a contradiction to tidy away. The same
holds for declarations, evidence receipts and claims: none of them gains a
`verified`, `accepted` or `approved` flag because a professional looked at it.

---

## 10. `CanonicalAttestation` — the substrate decision (Option C)

APV-05 constructs no `CanonicalEvidence`, APV-06 no `CanonicalClaim`, APV-07 no
`CanonicalVerification` — each because a mandatory field could not be established
without invention. APV-08 is the first slice where that is not true:

```text
id         CanonicalId       caller-provided, like every instance identifier here
type       AttestationType   from the pinned requirement's acceptedTypes
attester   CanonicalAttester the reviewer's own CanonicalPrincipalRef
claimRef   CanonicalClaimId  a claim this case already holds  <-- see below
statement  string            the attester's own words, supplied by the reviewer
issuedAt   CanonicalTimestamp the injected clock's instant
```

**Selected architecture: Option C.** `Attest` records a vertical decision always,
*and* may additionally produce a legitimate `CanonicalAttestation` when the
caller supplies the pieces above. `Reject`, `RequestMoreEvidence` and `Abstain`
remain purely vertical workflow decisions.

### The `claimRef` anti-invention rule

A `CanonicalAttestation` is structurally an attestation *about a claim*. So the
claim must be one the case already holds — an APV-06 declaration's
`CanonicalClaimId`, associated as `Declaration` material at or before the review
basis. Where the case holds no such claim, no attestation is constructed and the
operation fails deterministically with
`REVIEW_ATTESTATION_CANNOT_BE_CONSTRUCTED`. The reviewer's `Attest` is still
recorded in full: **a professional position without a Protocol artifact is an
honest outcome, and a fabricated artifact is not.**

Construction is centralized in `prepareCanonicalAttestationFromReview`, which
either builds a structurally legitimate record or fails. There is no partial
attestation and no repair path.

```text
CanonicalAttestation reused:        YES
CanonicalAttestationId reused:      YES  (caller-provided; no format invented)
Protocol Attestation duplicated:    NO
ReviewDecisionId used as an attestation id:  NEVER
```

### `CanonicalAssertionId` — Gate A0 `U-3` stays undischarged

`CanonicalAttestation` requires a `claimRef`, not an `assertionRef`. A
`CanonicalAssertion` is reachable only through `CanonicalClaim.assertionRef`, and
APV-08 constructs no `CanonicalClaim`. **No assertion identifier was needed, so
none was written.** `U-3` remains open, which is the honest state to leave it in.

---

## 11. Signing model

Protocol models a proof as a `CanonicalProofRef` and explicitly "references a
proof artifact without embedding, resolving, or validating that artifact".
APV-08 therefore signs nothing itself. It declares a narrow port:

```ts
interface AttestationSigner {
  sign(request: AttestationSigningRequest): AdapterResult<CanonicalProofRef>;
}
```

```text
production signer implemented:  NO
port declared:                  YES
test adapter:                   YES — in tests/, never in src/
no signer configured:           attestation carries no proofRefs (Protocol allows it)
signer fails:                   REVIEW_SIGNATURE_UNAVAILABLE; no attestation is produced
```

Never done, and mechanically asserted against: base64 of a reviewer id called a
signature, a hash of the object called signed, generated keys, test keys in
production code, a credential id used as a signature, or any invented envelope,
algorithm identifier or proof format. No KMS, HSM, wallet, browser signer or
blockchain binding exists in this package.

```text
proof reference present  !=  signature verified
signature verified       !=  legally sufficient
```

---

## 12. Reviewer identity, credentials and profile constraints

The reviewer is Protocol's `CanonicalPrincipalRef`. The vertical defines no
second identity model.

```text
reviewer != tenant      a tenant hosts and isolation-scopes the workflow
reviewer != subject     the thing protocolized is not the person reviewing it
reviewer != declarant   the asserter is not assumed to be the reviewer
```

What `AssetAttesterConstraint` states mechanically is enforced mechanically:

| Constraint | Enforced? | Why |
|---|---|---|
| `acceptedPrincipalKinds` | yes | `PrincipalKind` is a comparable Protocol field |
| `credential.acceptedTypes` | yes | `CanonicalCredentialRef.type` is comparable |
| `credential.acceptedStatuses` | yes, when declared | a ref that declares *no* status cannot satisfy a constraint that names acceptable ones |
| `acceptedRoles` | **no** | an opaque vertical token with no structurally comparable Protocol field; guessing at one would be this package deciding what a profession is |
| `credential.acceptedIssuerNamespaces` | **no** | `CanonicalCredentialIssuer` carries an id and a kind, not a namespace |
| `credential.freshness` | **no** | expiry lives on a `CanonicalCredential`; this workflow receives a *reference* |
| `jurisdictions` | carried, never interpreted | this package knows no jurisdiction's law |

Everything not enforced travels into the packet, where a human reads it.

```text
principal kind matches  != this reviewer is who they say they are
credential ref present  != the credential exists
credential type matches != the credential is valid
declared status Active  != the credential is currently active
all constraints match   != this reviewer may lawfully issue this attestation
```

Credential references are stored **as presented at decision time**. If a
credential is suspended or expires later, the historical record does not change.

No profession is hard-coded anywhere: no notary, lawyer, architect, accountant or
surveyor logic, and no jurisdiction-specific legal reasoning. A boundary test
asserts this mechanically over the source.

---

## 13. Case integration and the two revisions

A legitimate attestation is added through APV-04's own
`addProtocolizationCaseMaterial` as
`ProtocolizationMaterialKind.Attestation`, correlated to **exactly one**
attestation requirement. Nothing reaches into the aggregate.

```text
reviewedCaseRevision   10   the state the professional examined
resultingCaseRevision  11   the state after their attestation was associated —
                            new material the reviewer, by definition, did not review
```

Both are recorded explicitly and separately, and the decision validator refuses a
`resultingCaseRevision` that is not strictly greater. A reader must never be able
to conclude that the attestation covered revision 11.

The association moves the requirement `Pending -> MaterialPresent` and **no
further**. There is no `Satisfied`, no `Ready`, no `Approved` and no
`Protocolized` to reach: material present is never semantic satisfaction.

`Reject`, `RequestMoreEvidence` and `Abstain` add no case material at all, and
offering an attestation alongside one of them is refused.

---

## 14. Requirement-kind compatibility

Only `AssetRequirementKind.Attestation` may be targeted. The defence is threefold:

1. **Structurally** — a request names one `attestationRequirementId`, never a
   list, so a mixture of kinds is not representable.
2. **Explicitly** — that requirement must be of kind `Attestation`
   (`REVIEW_REQUIREMENT_INCOMPATIBLE`), checked before anything is touched.
3. **On the way out** — the attestation material is correlated to exactly that
   one requirement, so it can never move an Identity, Declaration, Evidence or
   Verification requirement to `MaterialPresent`.

A rejected request leaves the case byte-for-byte unchanged, at the same revision,
with both review repositories empty.

---

## 15. Exact profile version

Review is governed by the **exact** version the case pinned. There is no latest,
current or nearest resolution anywhere. A case pinned to `1.0.0` reviews under
`1.0.0`'s accepted types, principal kinds and credential constraints after
`2.0.0` is registered — even when `2.0.0` redefines the same requirement id.

---

## 16. Re-review, history and conflicting professionals

The intended history, and what the tests actually execute:

```text
case created
  -> declaration recorded            (APV-06)
  -> evidence admitted               (APV-05)
  -> checks executed                 (APV-07)
  -> review request R1 @ revision N
  -> RequestMoreEvidence
  -> new evidence admitted           (APV-05)   revision N+1
  -> review request R2 @ revision N+1
  -> Attest  (+ CanonicalAttestation)           revision N+2
  -> future APV-09 state evaluation
```

R1 stays bound to revision `N` forever; its packet never absorbs the later
evidence, and rebuilding it against the moved-on case fails loudly rather than
silently. Both requests and both decisions remain readable, in order.

**Conflicting decisions are preserved and never adjudicated.** Reviewer A's
`Attest` and reviewer B's `Reject` on two valid requests both stand, both remain
addressable, and nothing in this package picks a winner, marks one superseded or
weights them. Deciding what a disagreement means for a case is APV-09's.

Multiple attestation requirements are reviewed independently, each with its own
request, scope and decision. There is deliberately no case-global
`professionalReviewed` flag anywhere.

---

## 17. Lifecycle

```text
Draft      new review requests and decisions accepted
Active     new review requests and decisions accepted
Cancelled  refused (REVIEW_CASE_CANCELLED); existing review history stays readable
```

No lifecycle state is added, and no action transitions one.

---

## 18. Tenant isolation

Every operation and every repository method takes the acting tenant, and the
acting tenant is a *parameter* rather than read off the value being checked.
Tenant B cannot create a request for tenant A's case, build its packet, record a
decision on it, read a request or decision, or enumerate its history — and a
`get` for a foreign record is indistinguishable from a `get` for one that never
existed. Identifiers are scoped `(tenantId, id)`, so two tenants may use the same
request or decision id without collision.

A reviewer principal may legitimately appear in many tenants' workflows. That
never widens a read: retrieval still requires tenant context.

---

## 19. Events

```text
ProfessionalReviewRequested
ProfessionalReviewDecisionRecorded
ProfessionalAttestationRecorded    (only where an attestation was produced)
```

Plus APV-04's own `ProtocolizationMaterialAdded`, returned **unchanged** where an
attestation was associated. APV-04's closed case-event union is not widened,
following APV-05, APV-06 and APV-07.

There is no `CaseApproved`, `CaseReady`, `AssetVerified`, `RequirementSatisfied`
or `AssetProtocolized`. Payloads carry identifiers, the action and the machine
reason — never reviewer notes, scope prose, declaration statements, evidence,
credential references or personal data. Events are outputs; the request and the
decision are the records.

---

## 20. Persistence

`ProfessionalReviewRequestRepository` and
`ProfessionalReviewDecisionRepository`, each with one deterministic in-memory
implementation. Tenant-scoped, append-only, no update, no delete, deterministic
ordering (instant, then identifier). No database adapter, migration or schema —
binding the ports to a store is an infrastructure decision with its own owner,
exactly as Gate A0 `U-6` settled for cases, receipts, declaration records and
verification results.

There is **no packet repository** (a packet is reconstructible) and **no
attestation repository** (a `CanonicalAttestation` is a Protocol record and not
this vertical's to take custody of).

`recordProfessionalReviewDecision` returns `{ decision, decisionEvent,
protocolizationCase?, caseEvent?, attestation?, attestationEvent? }` and stores
none of it. Independent repository writes are **not** atomic here, and this
package does not pretend otherwise: the composition layer commits them together
under whatever transactional facility it actually has.

---

## 21. Errors

Stable `REVIEW_*` / `REVIEWER_*` codes on a `ProfessionalReviewError` that
structurally satisfies `ProtocolError`, following APV-04…APV-07 exactly.

**A review outcome is never an error.** `Reject`, `RequestMoreEvidence` and
`Abstain` all return successfully. Errors mean a malformed, unauthorized or
incoherent *operation* — never a professional's substantive conclusion. There is
deliberately no code meaning "review failed".

---

## 22. Boundary — what APV-08 is not

```text
Protocol core modified                 NO
Protocol enum widened                  NO
Protocol attestation duplicated        NO
APV-09 state machine                   NO
APV-10 protocolization execution       NO
concrete profile (digital.artifact.v1) NO
professional workbench / UI / inbox    NO
reviewer assignment / queue / notify   NO
Enterprise governance                  NO
tokenization / blockchain / custody    NO
payments / fee model                   NO
real-estate, Costa Rica, registry law  NO
```

APV-09 owns case state and readiness. APV-10 owns protocolization execution.
APV-11 owns concrete profiles. APV-13 owns the professional workbench. APV-14
owns the fee model. None of them is started here.
