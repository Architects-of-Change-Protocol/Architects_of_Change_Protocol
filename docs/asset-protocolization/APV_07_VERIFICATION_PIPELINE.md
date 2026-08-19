# APV-07 — Verification Pipeline

> **Status:** `VERIFIED` — implemented in `@aoc/asset-protocolization`
> (`packages/asset-protocolization/src/verification/`).
>
> **Depends on:** APV-03 (asset profile framework), APV-04 (`ProtocolizationCase`),
> APV-05 (evidence intake), APV-06 (declaration / claim preparation).
> **Consumed by:** APV-08 (professional review / attestation), APV-09 (protocolization state
> machine), and every later slice that needs to know what was checked and what it found.

```text
A verification result proves that a defined check evaluated defined inputs
under a defined profile/check contract at a defined case revision
and returned a defined outcome.

It proves nothing else.
```

## Read these seven lines before anything else

```text
APV verification outcome    !=  Protocol VerificationStatus.
PASS                        !=  universal truth.
FAIL                        !=  case rejection.
WARNING                     !=  PASS.
MANUAL_REVIEW               !=  attestation.
UNAVAILABLE                 !=  FAIL.
All checks PASS             !=  READY.
```

Every one of those is enforced in code and asserted in tests, not merely asked for here.
The rest of this document explains how.

---

## 1. What the verification pipeline is

APV-07 is the first Asset Protocolization slice whose primary job is to **evaluate**
accumulated material rather than record it.

The vertical already knew which subject is being processed, which exact `AssetProfile`
version is pinned, which requirements exist, which evidence was admitted, which
declarations were recorded, who asserted what, and when each of those workflow facts
happened. What it could not do was *execute the automated checks the pinned profile
declares*. That is this slice.

Two operations do the work:

```text
executeProtocolizationVerificationCheck   one declared check, one case, one result
runProtocolizationVerification            every declared check, one case revision
```

Both are pure with respect to the case: they read it and never write to it. When one
succeeds, its claim is exactly this:

```text
APV executed this check — which this case's exact pinned profile version declares
for this requirement — against this case as it stood at this revision,
over the inputs named on the result, at this instant,
and it returned this outcome for this reason.
```

Success means *the execution happened and is recorded*. It does not mean the check passed:
a `Fail` is as successful an execution as a `Pass`.

### What APV-07 is not

```text
not a readiness evaluator          APV-09 owns case state and READY
not a professional reviewer        APV-08 owns attestation
not a truth oracle                 no check concludes that anything asserted is true
not an authority engine            Soberanía Enterprise owns authority and policy
not a second Protocol Verification substrate
not a storage, registry, identity or crypto implementation
```

## 2. Ownership boundary

```text
Soberanía Protocol
    CanonicalVerification, CanonicalVerificationId, VerificationStatus
    CanonicalClaim, CanonicalClaimId, ClaimType
    CanonicalEvidenceId, CanonicalPrincipalRef, CanonicalRegistryEntryRef
    ContentIdentity, ContentDigestAlgorithm, verifyContentIdentity
    SovereignSubjectRef, AdapterResult, ProtocolError, CanonicalId, UtcDateTime
        — unchanged by this slice, in every particular

Asset Protocolization Vertical (APV-07)
    VerificationCheckOutcome              the five automated-check outcomes
    AssetVerificationCheck                one executable check
    VerificationCheckRegistry             checkId -> implementation
    VerificationCheckContext              the bounded view a check may see
    VerificationExecutionId               one execution's identity
    VerificationReasonCode                why, as a stable machine token
    ProtocolizationVerificationResult     the immutable execution record
    VerificationResultRepository          vertical workflow persistence (Gate A0 / U-6)
    VerificationClaimResolver             ports for the outside world
    VerificationContentResolver
    VerificationError                     structural and configuration refusals
```

**Protocol core modified: NO.** Not one file under `packages/protocol/` changed.

## 3. The outcome model

```text
Pass          the check executed and its defined pass condition was satisfied
Fail          the check executed and its defined failure condition was established
Warning       the check executed and identified a non-fatal concern
ManualReview  the check executed and established that automation cannot
              responsibly conclude
Unavailable   the check is known and was correctly invoked, but could not obtain
              an input it needs, so no evaluation happened
```

### `VerificationCheckOutcome` is not `VerificationStatus`

This is the single most expensive mistake available in the slice, so it is worth being
explicit about why the two are different concepts and not two spellings of one.

```text
VerificationStatus            Pending | Verified | Failed
  the status of one CanonicalVerification record — a generic Protocol substrate
  concept that exists whether or not this vertical does

VerificationCheckOutcome      Pass | Fail | Warning | ManualReview | Unavailable
  the result of executing one AssetProfile-declared check against one
  ProtocolizationCase at one case revision — a vertical workflow fact
```

APV-07 therefore declares its own vocabulary rather than widening Protocol's. No
`VerificationStatus.Pass`, `.Warning`, `.ManualReview` or `.Unavailable` was added; nothing
under `src/verification/` so much as imports the Protocol enum; and
`tests/verification-outcomes.test.ts` reads Protocol's own source to assert that its member
list is still exactly `Pending | Verified | Failed`. A vertical whose richer outcome model
forced a Protocol enum to grow would have made every other consumer of that enum pay for a
distinction only this vertical needs.

### Never a boolean

There is no `passed` field anywhere in the slice, because every boolean spelling erases at
least one member:

```text
passed = outcome === Pass    erases the difference between a real failure and a
                             check that could not run at all
passed = outcome !== Fail    silently promotes Warning, ManualReview and
                             Unavailable into success
```

Both fail in the direction that matters — they turn *we do not know* into an answer — so the
outcome travels whole, all the way to whoever is entitled to interpret it.

### Outcome semantics, in full

**`Pass`** — this check, these inputs, this pinned profile version, this case revision. It
does not mean all case requirements are satisfied, that anything is legally true, that the
asset is owned, that an identity is universally proven, that a professional approves, or
that the case is READY.

**`Fail`** — this check's defined failure condition was established. It does not cancel the
case, does not reject it, does not delete or invalidate the evidence and declarations it
read, and does not mean protocolization is impossible. A `Fail` is an input to a later
decision, never the decision.

**`Warning`** — a non-fatal concern that must stay visible. Deliberately not a shade of
`Pass`: a warning that anything downstream may round to success is a warning that was never
worth emitting, and nothing in this package collapses one.

**`ManualReview`** — automation cannot responsibly reach the required conclusion, and the
matter is surfaced for later human or professional consideration. It is *not* an
attestation, an approval, a rejection, a reviewer assignment or a queue entry. APV-08 owns
professional review; APV-07 neither performs it nor pretends to have started it.

**`Unavailable`** — the check is known and was correctly invoked, but could not obtain an
input or dependency, so nothing was evaluated.

```text
registry service unreachable   !=  registry check failed
canonical record unresolvable  !=  canonical record wrong
content bytes not readable     !=  digest mismatch
```

Converting a dependency outage into `Fail` would manufacture a negative finding out of an
infrastructure event, and a later reader would have no way to tell the two apart.

### No verdict, no score, no ranking

There is no aggregate outcome, no percentage, no weighting, no majority rule, no confidence
number and no worst-outcome-wins reduction anywhere in the slice. `countVerificationOutcomes`
reports how many results carried each of the five outcomes — every member present, including
zeros — and stops there. Reducing a set of findings to one answer is APV-09's job, and a
professional reviewer needs to see every finding rather than a summary that already decided
for them.

## 4. The check model

### `AssetVerificationCheckId` is reused, not respelled

APV-03 froze it as an opaque dotted lowercase token, and profiles are already written
against it. APV-07 imports it and declares no second spelling — a copy here would be free to
drift from the one profiles use.

### The check contract

```text
checkId                        which AssetProfile-declared check this is
execute(context) -> execution  what it found, and on what basis
```

That is deliberately all of it. A check is not told which tenant may run it, whether the
case is in an acceptable state, whether the pinned profile declares it for the requirement
it is being run against, or how to persist anything — every one of those is enforced by the
engine *before* `execute` is called, in one place, so a new check cannot forget one.

An execution carries `outcome`, and optionally `reasonCode`, `summary`, `inputRefs` and
`canonicalVerificationRef`. The engine validates it structurally before it can become
history: an outcome outside the closed set, a malformed reason code, unbounded prose or an
unknown field is refused with `VERIFICATION_CHECK_EXECUTION_INVALID`.

### Sync or async

`execute` returns `AdapterResult<VerificationCheckExecution>` — `T | Promise<T>`, which is
how this repository already spells "a port that may or may not need to go somewhere"
(`@aoc/protocol/adapters`). A pure check returns its execution directly; one that awaits a
resolver returns a promise; the engine awaits either. So the abstraction never forecloses an
asynchronous check, and no pure check is made impure to pay for that: validation, plan
construction, result construction, projections and the repository are all synchronous, and
only the two operations that actually invoke an executor are `async`.

### The registry

`VerificationCheckRegistry` resolves `checkId -> implementation` by **exact** identifier. No
prefix match, no suffix match, no substring match, no case folding, no normalization, no
fallback to a "closest" check, and no resolution by a profile's display label — a registry
that guessed would let a profile silently execute an implementation it never named, which is
the same class of failure as resolving a profile version by "latest". It never branches on
asset category, profile id, subject shape or jurisdiction; it is a map.

A second registration under the same id is **refused**, never silently replacing the first:
otherwise the meaning of a `checkId` — and therefore of every historical result carrying it —
could change with load order. Registration failures happen at construction rather than at
first execution, so a deployment that cannot perform the checks its profiles declare does not
start.

The registry is system/configuration-level, exactly like the profile catalogue: it carries no
tenant and holds no case data. Everything tenant-bound lives on the results.

### The extension mechanism

Adding a check is `registry.register(check)`. It is **not** a change to Soberanía Protocol,
not a change to `ProtocolizationCase`, not a change to the engine, and not a new branch
anywhere. `tests/verification-truth-semantics.test.ts` exercises this directly by registering
a check written after the engine, consulting a port the engine knows nothing about, and
executing it through a profile fixture.

## 5. Profile integration

### Where `checkIds` come from

`AssetVerificationRequirement.checkIds`, on the case's **exact pinned profile version**,
resolved through `AssetProfileCatalog.get(profileId, profileVersion)`. There is no `latest`,
`current`, `newest`, `nearest` or fallback lookup anywhere in the package. A pinned version
that has been withdrawn from the catalogue makes its cases fail loudly
(`PROTOCOLIZATION_CASE_PROFILE_NOT_FOUND`) rather than quietly reassessing them under
different rules.

The result records the exact pin, field by field, so it stays independently readable without
resolving the case — and so a v1-pinned case that had executed a v2 check would be visible
in the record itself.

### Undeclared checks are rejected

Global registration is not permission. A deployment may register a hundred checks; what a
given case may run is only what *its own pinned profile version* asked for, correlated to
*the requirement that asked for it*. So all three of these are refused with
`VERIFICATION_CHECK_NOT_DECLARED`:

```text
a registered check no requirement declares
a check declared only by a newer profile version
a check declared by a different requirement of the same profile
```

Rejection happens before the executor runs, so a refused request has no side effect at all.

### Unknown check id vs. `Unavailable`

Two conditions that look similar and are not:

```text
A  the profile declares a checkId with no registered implementation
       -> VERIFICATION_CHECK_NOT_REGISTERED, a thrown configuration error

B  a registered check cannot obtain an input or dependency
       -> a successful execution record with outcome Unavailable
```

A missing implementation means the deployment cannot perform a check its own profile demands.
Recording that as an ordinary outcome would let a mis-deployed system look like a working one
with a flaky dependency, so it fails loudly and produces no result. `runProtocolizationVerification`
fails the whole batch rather than silently skipping the missing check.

## 6. Requirement-kind compatibility

APV-06's targeted audit found that APV-04's `correlate` is **kind-blind**: it moves every id
it is handed to `MaterialPresent`, so one declaration offered against
`[declarationRequirement, evidenceRequirement]` left the case reporting evidence material
that did not exist. APV-07 answers that class of defect three times over.

**Structurally.** An execution names **one** `requirementId`, never a list. A mixture of
kinds is not representable in the request, so it cannot be smuggled past a filter that only
looked at the first element.

**Explicitly.** That single requirement must be `AssetRequirementKind.Verification`. Naming
an `Identity`, `Declaration`, `Evidence` or `Attestation` requirement is refused with
`VERIFICATION_REQUIREMENT_INCOMPATIBLE`, before anything else happens and before any executor
runs.

**Constructively.** Even a refusal that somehow got through could not contaminate anything,
because this layer writes **no case material at all**. There is no code path by which a
verification result can mark any requirement — of any kind — as `MaterialPresent`.

`tests/verification-correlation.test.ts` proves all three: each incompatible kind is rejected;
the case is byte-for-byte unchanged and still at the same revision after every refusal; the
executor is never reached; a requirement-id *list* is refused as a malformed request; and a
full successful batch leaves every requirement `Pending` and the material list empty.

Within verification requirements, `checkId` must be one the requirement itself declares —
see §5. The built-in count check applies the same discipline to counting: an evidence
requirement is answered by evidence material and by nothing else, so a stray declaration
correlated to it contributes nothing toward its `minimumCount`.

## 7. Execution context

A check receives a *view* of one case under one pinned profile version, and nothing else:

```text
tenantId, caseId              who and which case
profile                       the exact pin
assetProfile                  the pinned profile document (the check contract)
requirementId, requirement    the verification requirement that declared this check
checkId                       the check being executed
subject                       the case's subject binding
caseState, caseRevision       what is being evaluated
requirementProgress           APV-04's own projection against the pinned profile
materials                     every material association on the case
evidenceReceipts              APV-05 receipts for this case, as supplied
declarations                  APV-06 records for this case, as supplied
now                           the execution instant, as a value
resolvers                     the ports this execution was given
```

It is handed **no** repository, **no** profile catalogue, **no** clock port, **no** other
case, **no** other tenant's anything, no environment and no ambient globals — so a check
cannot widen its own basis, and a reader of a result can tell from this type alone what could
possibly have been evaluated.

Two details are load-bearing. The instant is a *value*, not a port: the engine reads the
injected `ProtocolizationClock` once, validates it, and passes the result through, so a check
cannot be non-deterministic and two checks in one batch cannot disagree about when "now" was.
And the whole context is deeply frozen — `readonly` is erased at runtime, so without it a
check could edit the case's material list or another check's view of the same batch.

Receipts and declarations are *supplied by the caller* rather than fetched, because the
engine holds no repository. Every one is checked to belong to the acting tenant and this case
before any check sees it; without that gate, cross-tenant isolation would be advisory.

## 8. The result model

```text
schemaVersion               'aoc-protocolization-verification/1'
executionId                 identity of this execution; unique within the tenant
tenantId, caseId            who and which case
profile                     the exact pinned (profileId, profileVersion)
requirementId               the verification requirement that declared the check
checkId                     the check that ran
evaluatedCaseRevision       the case revision this execution evaluated
outcome                     one of the five
reasonCode?                 why, as a stable dotted machine token
summary?                    bounded human-readable detail; never a machine semantic
inputRefs?                  what the check actually read, as references
executedAt                  the execution instant, from the injected clock
canonicalVerificationRef?   a real CanonicalVerification, when one exists
correlationId?              the request that produced it
```

There is no `passed` boolean, no score, no confidence number and no case-level verdict field.
Each would be a lossy re-spelling of `outcome`, and the loss always falls toward reporting
certainty the check did not have.

### Reason codes

An outcome alone is often insufficient: two failures of one check for entirely different
reasons — material missing versus a digest mismatch — would otherwise be distinguishable only
by reading prose. `VerificationReasonCode` is an opaque dotted token under APV-03's grammar,
so a new check ships with its own reasons and needs no change to this package. It must never
be a product or legal conclusion: `material.missing` and `dependency.unavailable` describe
what the check observed; `owner.not.legal.titleholder` would be a conclusion no automated
check here is entitled to reach.

### Human-readable detail

`summary` is for people, bounded, and never the machine semantic — nothing in the package
reads it, parses it or branches on it. Machine behaviour depends on `checkId`, `outcome`,
`reasonCode` and `inputRefs`, and on nothing else. It is deliberately **absent from events**:
an event fans out to subscribers who may have no business reading it, and a reader entitled
to it reads the result.

### Input references

References, never copies. A result that embedded whole evidence documents, claim records or
declaration statements would be a second copy of somebody else's record — free to drift, and
carrying payload and possibly PII into an audit trail that has no business holding either.
`VerificationInputKind` names the nine kinds of thing a check in this slice can legitimately
have read.

### PII

APV-06's free-form `statement` may contain personal data. It is never read by any check here,
never copied into a result, never put in a reason code, and never emitted on an event. Checks
use structured declaration semantics — `claimType`, `claimSubtype`, `declarant`, `claimRef` —
and nothing else.

## 9. `CanonicalVerification` — the substrate decision

**Architecture C was selected: vertical result only, plus an optional reference to an
already-existing `CanonicalVerification`.**

### Why not A (construct one)

Look at what `CanonicalVerification` actually requires:

```text
id           a minted canonical record identifier
claimRef     a CanonicalClaimId naming a claim this verification is about
status       Pending | Verified | Failed
verifier     who verified
verifiedAt   when
findings     what was found
```

Two of those cannot be honestly produced by an APV check. Minting a canonical record
identifier is not this vertical's act. And most APV checks are not *about a claim at all*: a
required-material-presence check, a minimum-count check and a digest check have no
`claimRef`, no verifier principal and no Protocol status that fits — `Pass`, `Warning`,
`ManualReview` and `Unavailable` have no home in `Pending | Verified | Failed`, and the whole
point of §3 is that they must not be given one. Fabricating an id, a claim reference, a
verifier or a status to make the field look populated would put a counterfeit Protocol record
into circulation, which is precisely the failure the boundary exists to prevent. APV-05
refused to construct `CanonicalEvidence` and APV-06 refused to construct `CanonicalClaim` for
the same reason; this is the same refusal applied to the verification substrate.

### Why C rather than B

Some future check legitimately *will* consult a real `CanonicalVerification` — a Protocol
verification provider returns one. Discarding that reference would lose audit information the
executor genuinely had. So `canonicalVerificationRef` exists, is **optional**, and is absent
everywhere a check has no genuine record behind it. `tests/verification-boundaries.test.ts`
asserts mechanically that no verifier, instant, findings list or `Verified` status is ever
constructed under `src/verification/`.

```text
CanonicalVerification reused:      YES (referenced when one legitimately exists)
CanonicalVerificationId reused:    YES (as the type of that optional reference)
Protocol Verification duplicated:  NO
Fake CanonicalVerification minted: NO
```

A `VerificationExecutionId` is a vertical workflow identifier. It is never written into
`canonicalVerificationRef`, never used as a `CanonicalVerificationId`, and never used as an
APV-04 verification material payload.

## 10. APV-04 `ProtocolizationMaterialKind.Verification` — the integration decision

**APV-07 results are not written into the case as APV-04 material. No case mutation happens
at all.**

`ProtocolizationVerificationMaterial` carries a `CanonicalVerificationId` — a Protocol record
identifier. A `VerificationExecutionId` is a vertical workflow identifier. Writing one into
the other's field would be a type-level lie that every downstream reader would inherit, and
minting a real `CanonicalVerification` to avoid it is refused for the reasons in §9. So the
answer is the honest one: **no case Verification material is created for a vertical-only check
result.**

A composition layer that *does* hold a legitimate `CanonicalVerificationId` may of course
associate it through APV-04's own pathway — that pathway is unchanged and needs nothing from
this slice.

### This also closes the revision feedback loop

Consider what would happen if recording a result raised the case revision:

```text
check 1 evaluates revision 10
recording its result makes the case revision 11
check 2 evaluates revision 11 — whose only difference from 10 is check 1's own output
check 3 evaluates revision 12 — and so on
```

Verification would generate its own input churn, no two checks in a run could agree on what
they had evaluated, and re-running anything would move the target. As written, a hundred
executions against revision `7` all evaluate revision `7`, and the case is byte-for-byte
unchanged when they finish. That is why the result model needs no `recordedRevision` beside
its `evaluatedCaseRevision`: there is nothing for a second revision field to differ from.

## 11. Case revision binding, currency and re-execution

Every result records `evaluatedCaseRevision`. A result produced at revision `4` remains a
statement about revision `4` forever: adding evidence at revision `5` neither updates it nor
invalidates it, and nothing in the package rewrites one.

### Result currency is not evidence freshness

```text
evidence freshness   was the observation recent enough, per the constraint the
                     pinned profile declares?
                     -> a check evaluates it, and the answer is an outcome

result currency      was this check executed against the case state a reader is
                     now looking at?
                     -> nobody evaluates it; it is a comparison of two integers
```

`isVerificationResultCurrentForRevision` is that comparison, and it is deliberately exact
rather than "at least": a check that ran against an older revision saw strictly less. It does
not mark the result stale, expire it, invalidate it or suggest re-running it — whether a
non-current result must be re-executed before some further step is policy, and policy is
APV-09's.

### Re-execution

Checks are rerunnable, and a new execution produces a *new* immutable result with a new
`executionId`. A `Pass` from yesterday and a `Fail` today coexist, in order, each bound to the
revision it actually evaluated. There is no "current result" pointer anywhere;
`listLatestVerificationResults` computes a latest *view* on read, keyed by
`(requirementId, checkId)` — because one `checkId` may legitimately be declared by several
verification requirements, and correlating by check alone would let one requirement's result
stand in for another's.

## 12. Batch execution

`listProtocolizationVerificationPlan` produces the deterministic `(requirementId, checkId)`
plan from the pinned profile: verification requirements in declaration order, and within each,
`checkIds` in declaration order. It is stable across runs and independent of registration
order, which is what makes "execution order does not change results" a property rather than a
hope.

Checks are independent by construction: nothing expresses a dependency between two of them,
and **no dependency is inferred from a check id's spelling**. A check that genuinely needed
another's output would need an explicit machine-readable dependency in the profile, and APV-03
declares none — so orchestrating one is a later slice's work.

`runProtocolizationVerification` executes the whole plan and **does not stop at the first
failure**: a reviewer's question is almost never "is there a problem?" but "what is the
complete set of problems?". It reads the clock once, so every result in one batch shares an
instant and a revision, and returns results, events, the shared revision and the shared
instant — and no verdict.

### Why there is no `VerificationRun` entity

Everything a run aggregate would carry — which case, which profile, which revision, which
instant, which request — is already on every result and identical across the batch. The
entity would add an identifier and no fact, so it was not introduced. Correlation across a
batch is `(evaluatedCaseRevision, executedAt, correlationId)`.

### Duplicate declared check ids

`validateAssetProfile` rejects a requirement listing one check twice, so the shape can only
arrive from a reconstructed or corrupted document. Both the plan builder and the single-check
operation fail loudly (`VERIFICATION_CHECK_DECLARED_TWICE`) rather than executing it twice and
producing two results whose only difference is an identifier.

## 13. Identity and idempotency

One identity, `VerificationExecutionId`, scoped to `(tenantId, executionId)` — exactly like an
intake id and a declaration id, and for the same reason: execution ids are minted by tenants,
so a globally unique constraint would let one tenant's identifier collide with another's,
leaking existence across a tenant boundary and failing a legitimate `save` for a reason its
caller can neither see nor fix.

Ids are caller-provided and never generated here, following APV-04/05/06: minting needs a
UUID source or a counter, and a pure domain layer that mints its own identifiers cannot be
tested by asserting on its output.

The operations are pure and persist nothing, so they cannot themselves double-execute. Replay
under an identifier that already exists is refused at the repository with
`VERIFICATION_RESULT_DUPLICATE` — a deterministic rejection rather than a silent overwrite,
matching APV-05 and APV-06.

## 14. Built-in checks

Production ships a **small** library, and only where the proposition is mechanically encoded
in APV-03's own vocabulary and therefore means the same thing for a sound recording, a plot of
land, a dataset and a category nobody has invented yet.

```text
check.material.present          every Required non-verification requirement of the
                                pinned profile has at least one material association
check.material.minimum-count    every Required requirement declaring minimumCount has
                                at least that many materials of the answering kind
check.identity.strategy         every Required identity requirement is evidenced by a
                                strategy it accepts, and any registry entry conforms
                                to the AssetRegistryConstraint it declares
check.evidence.freshness        every observation behind this case's evidence satisfies
                                the AssetFreshnessConstraint the pinned profile declares
check.declaration.claim-type    every declaration names a CanonicalClaim whose actual
                                type is the one the declaration recorded
check.declaration.competing     no declaration requirement carries assertions from two
                                or more distinct declarants
check.content.digest            the subject's content bytes produce exactly the
                                ContentIdentity the case pinned
```

Each reports **one** outcome under a declared precedence:

```text
Fail  >  Unavailable  >  Warning  >  Pass
```

`Unavailable` outranks `Warning` and `Pass` on purpose: when part of the basis could not be
read, any conclusion weaker than "I could not look" would claim more than the check knows.
`Fail` outranks it because a definite negative finding was reached on the part that *was*
readable.

### What is deliberately absent

```text
costa-rica-title-valid    finca-owner        real-estate-*
artwork-authentic         song-rights        vehicle-title-valid
nft-valid                 spotify-owner      *-legally-transferable
```

Those are propositions about particular asset classes and particular legal systems. They
belong to future profiles, adapters and configured checks — each of which reaches the engine
through `register` with no change to the built-in library, the engine, or Protocol.

### Evidence verification

`check.material.present` and `check.material.minimum-count` are the evidence-based checks the
roadmap named, and they are honest about their scope: **`MaterialPresent` is not semantically
verified**. A `Pass` means references were recorded where the profile expected them. It does
not mean the referenced records exist, are authentic, are current, are adequate, or that any
requirement is *satisfied*. Verification requirements are excluded from the presence check
because they are answered by executions, which are never written back as case material —
counting them would make the check fail on every case forever, for a structural reason having
nothing to do with the case.

`check.material.present` reports `ManualReview` with `condition.unresolved` when every
`Required` requirement has material but a `Conditional` one has none and no evaluated
condition. That requirement might be irrelevant to this case or a genuine gap, and nothing
available can tell the two apart: `Pass` would assume the first, `Fail` the second.

Reading `CanonicalEvidence` documents themselves, and judging their content, remain adapter
extension points — this slice ships no evidence resolver.

### Freshness

Only what the pinned profile actually says. `AssetFreshnessConstraint` carries
`maxAgeSeconds`, `observedAfter` and `mustNotBeExpired`, and the check evaluates exactly those.
**No legal validity period was invented** — no "documents older than six months are stale", no
jurisdictional expiry rule, no default. A profile that declares no freshness constraint gets
`Pass` with `freshness.not.constrained`, which says precisely that nothing was constrained.

The instant compared is `EvidenceIntakeReceipt.observedAt` — when the *source* observed what
the evidence describes, which APV-05 preserved verbatim and deliberately refused to judge,
default or repair. Notably not `receivedAt`: comparing against that would make every stale
document look fresh the moment it was submitted. Evidence whose receipt carries no
`observedAt` yields `Unavailable`, never an assumed instant. `mustNotBeExpired` reads expiry
from a Protocol record this package holds no resolver for, so it too yields `Unavailable` and
names the missing dependency.

A future-dated observation — which APV-05 and APV-06 admitted without adjudicating
plausibility — yields `Warning` rather than `Fail`: the anomaly stays visible without being
called a failure. And a failing freshness check **deletes nothing**: the evidence stays in the
case, the receipt stays in its repository, and neither is marked invalid.

### Integrity and signatures

Digest comparison uses Protocol's own `verifyContentIdentity`, `ContentIdentity` and
`ContentDigestAlgorithm`. **No hashing algorithm, signature format, key model or proof format
is defined anywhere in this package**, and an algorithm Protocol does not support yields
`Unavailable` rather than a silently skipped check — the same fail-closed choice Protocol
itself makes.

Bytes arrive through `VerificationContentResolver`, because APV-05 stores references and never
content: there is no blob store, no filesystem access, no object storage, no content-addressed
network and no upload path anywhere in this vertical.

```text
bytes produce the pinned digest      -> Pass         digest.matches
bytes deterministically differ       -> Fail         digest.mismatch
resolver unreachable                 -> Unavailable  dependency.unavailable
no resolver bound                    -> Unavailable  content.resolver.unavailable
subject has no content identity      -> Unavailable  content.identity.absent
algorithm unsupported                -> Unavailable  digest.algorithm.unsupported
```

**Signature presence and signature validity remain distinct**, and neither is implemented as a
production check. Presence would be a pure structural check over `CanonicalProofRef` material;
validity requires an injected verifier and real key material. Collapsing them would let a
present-but-invalid signature read as verified, so APV-07 implements neither rather than
implementing the one that looks like both. Both are extension points.

### Claim-type resolution — APV-06's open item, closed

On the `Reference` pathway, APV-06 recorded the `ClaimType` the *caller stated* about a claim
it named, and — having no way to dereference a Protocol record — could not check that
statement against the record. With a `VerificationClaimResolver` bound,
`check.declaration.claim-type` does exactly that comparison:

```text
resolved record's type == recorded type   -> Pass         claim.type.consistent
resolved record's type != recorded type   -> Fail         claim.type.mismatch
record not found                          -> Unavailable  claim.unresolved
source unreachable                        -> Unavailable  dependency.unavailable
no resolver bound                         -> Unavailable  claim.resolver.unavailable
```

**The caller is never assumed to have been right.** Without a resolver, or when the resolver
cannot answer, the outcome is `Unavailable` — never `Pass`. A declared type becomes a checked
type only by actually reading the record.

A match proves the record is of the type the declaration said. It does **not** prove the
proposition the claim asserts, that the declarant is who they say, that they were entitled to
assert it, or that the evidence they pointed at supports them. And a mismatch **rewrites
nothing**: the declaration record is immutable, and a `Fail` produces a finding, not a
correction.

### Conflicting declarations

`check.declaration.competing` reports `ManualReview` when one declaration requirement carries
assertions from two or more distinct declarants, and `Pass` otherwise. It **never returns
`Fail`**, and the reason is structural: nothing in the frozen vocabulary encodes negation,
polarity or equivalence between two propositions. `ClaimType`, `claimSubtype`, declarant,
subject and claim reference are all it may read, and none of them can express "X" and "not X".
Two principals asserting into the same requirement slot is a *competing* pair that automation
can detect and cannot adjudicate: both may be true, one may be a correction, one may be
fraudulent. `Fail` would be that judgement made without the semantics to make it; `Pass` would
hide a genuine question.

**No free text is read, ever.** `statement` is not consulted here or anywhere else in the
package. Parsing prose into a truth value — by pattern, by heuristic, by language model or by
any other means — would make the outcome non-deterministic and dress an inference up as a
mechanical finding. `tests/verification-builtin-checks.test.ts` records a declaration whose
text a human would read as a flat contradiction and asserts that the check passes anyway.

Competing declarations stay: both remain in the case, both in the repository, neither
rewritten, withdrawn or marked superseded.

### Identity and registry

`check.identity.strategy` evaluates that the identifying material the profile demanded is
present and structurally conforms. It is **not identity resolution**: nothing contacts an
identity provider, dereferences an external reference, queries a registry or confirms that
anyone is who they say. Resolving an identity or a registry entry against a live external
source is a legitimate future check, arriving as a registered implementation with an injected
resolver port — and a resolver that cannot be reached yields `Unavailable`, never a
manufactured confirmation.

Registry conformance uses `RegistryType`, `RegistryAuthorityLevel`, `RegistryEntryType` and an
opaque namespace allow-list — Protocol's own vocabulary, exactly as Gate A0 / `U-2` froze it.

```text
Costa Rica-specific logic added:  NO
Registro Nacional connector:      NO
real-estate semantics added:      NO
```

**Identity is never authority.** A `Pass` says the subject carries the identifying material
the profile asked for. It does not say a declarant owns the subject, may act for it, or may
bind another party. Authority is a separate question with a separate owner.

## 15. What a check may reach — the ports

```text
VerificationClaimResolver     resolveClaim(claimRef)     -> Resolved | NotFound | Unavailable
VerificationContentResolver   readContent(subjectRef)    -> Resolved | NotFound | Unavailable
```

Both optional. A check that needs a port it was not given must not fail loudly and must not
fail *falsely*: it did not discover a problem, it was unable to look — which is exactly
`Unavailable`.

Resolution is a three-member status rather than `undefined` because "there is no such record"
and "I could not reach the place records live" are different facts, and a port that returned
`undefined` for both would discard the difference at the boundary.

**APV-07 ships no production adapter.** No HTTP registry connector, no object store, no
content-addressed network, no identity provider, no database, no blockchain, no payment
provider. Binding a port to something real is an infrastructure decision with its own owner
and its own review. Tests use deterministic in-memory adapters.

Identity resolution, external registry observation, credential status and signature
verification are all legitimate future ports — each arrives with the check that needs it,
through the same registry, with no change to Protocol and no change to the engine.

## 16. Programmer error is not `Unavailable`

There is no `try`/`catch` around an executor anywhere in the engine. A check that throws — a
bug, a broken invariant, a malformed implementation — propagates. Laundering a defect into
`Unavailable` would make a broken check indistinguishable from a working one reporting a
dependency outage, and the whole value of `Unavailable` is that the difference stays visible.

A check that returns something the engine will not store fails with
`VERIFICATION_CHECK_EXECUTION_INVALID` rather than having its output repaired.

## 17. Tenancy

Every operation is tenant-bound, and the acting tenant is the *context's*, never the case's —
a check that reads the tenant off the value it is checking always agrees with itself, which is
why APV-04 made the acting tenant a parameter.

```text
tenant A executes against A's case              permitted
tenant B executes against A's case              VERIFICATION_TENANT_MISMATCH
tenant B supplies A's receipts or declarations  VERIFICATION_TENANT_MISMATCH
inputs from another case of the same tenant     VERIFICATION_CASE_MISMATCH
tenant B reads A's result by id                 undefined
tenant B enumerates A's case                    empty, indistinguishable from no executions
```

The tenant gate runs before any sensitive inspection, so a caller cannot probe another
tenant's profile shape, requirement ids or execution ids through error differences.

## 18. Lifecycle

```text
Draft      accepts verification execution
Active     accepts verification execution
Cancelled  refuses new execution (VERIFICATION_CASE_CANCELLED)
```

Cancellation is terminal and a cancelled case accepts no further work. Refusing new executions
is **not** hiding old ones: results recorded before cancellation remain readable and auditable
forever.

**No state is added, and none is transitioned.** An execution — of any outcome — leaves the
case in exactly the state it found it. A `Fail` does not cancel, reject or suspend anything;
APV-09 owns state decisions.

## 19. Persistence

`VerificationResultRepository`, in the vertical, for the reason Gate A0 / `U-6` settled for
cases, receipts and declaration records: no vertical workflow persistence port goes into
Soberanía Protocol, and Protocol never learns that verification execution exists. APV-07 ships
the **port** and one deterministic in-memory implementation — no database adapter, no
migration, no schema.

```text
get(tenantId, executionId)                                    exact-id lookup
exists(tenantId, executionId)
listByCase(tenantId, caseId)                                  execution order
listByRequirementCheck(tenantId, caseId, requirementId, checkId)
save(result)                                                  append-only
```

Append-only: no update, no delete. Rewriting a result would be rewriting history, and removing
one would erase the only evidence that a case once passed — or once failed. `save` rejects a
duplicate `(tenantId, executionId)` and never overwrites. Results are validated on the way in
and deeply frozen, so a caller cannot mutate stored history through a reference it saved.

Ordering is `executedAt`, then `executionId` as a stable tie-break — not insertion order,
which would make the reference implementation's `Map` an accidental part of the contract a
database adapter could not reproduce. The tie-break is load-bearing: one batch shares a single
`executedAt`.

**Transactional limitation, stated plainly.** The operations return a result and an event and
persist neither, exactly as APV-05 and APV-06 return a receipt or a record without storing it.
A composition layer decides when and how to commit, under whatever transactional facility it
actually has. Since APV-07 mutates no case, there is no two-store write to coordinate — the
result is the only thing to persist.

## 20. Events

```text
ProtocolizationVerificationCheckExecuted
    executionId, tenantId, caseId, profile, requirementId, checkId,
    evaluatedCaseRevision, outcome, reasonCode?, occurredAt, correlationId?
```

One event, because this slice performs one operation. Read the name literally — *executed*.
Not verified, not approved, not satisfied.

There is deliberately no `AssetVerified`, `OwnershipVerified`, `IdentityConfirmed`,
`RequirementSatisfied`, `CaseApproved`, `CaseReady`, `ProfessionalApproved` or
`AssetProtocolized`: each names a conclusion no part of this vertical may reach. And no
`VerificationRunCompleted` — a batch is a convenience over independent executions, not a fact
of its own, and an event for it would invite a reader to treat the batch as a verdict.

This is a **separate union** from APV-04's closed case-event union, following APV-05 and
APV-06 — and with a stronger reason: recording a result mutates no case at all, so there is no
case event to widen and no case revision to consume.

The payload carries identifiers, the outcome and the machine reason — never evidence
documents, claim records, declaration statements, resolved content bytes, personal data or
secrets. `summary` and `inputRefs` are both absent; a reader entitled to them reads the
result. Events are **outputs**, not the source of truth.

## 21. Error model

```text
VERIFICATION_REQUEST_INVALID            malformed execution request
VERIFICATION_TENANT_REQUIRED            acting tenant missing or malformed
VERIFICATION_TENANT_MISMATCH            foreign case, receipt or declaration
VERIFICATION_CASE_MISMATCH              input belongs to another case
VERIFICATION_CASE_CANCELLED             terminal case accepts no new execution
VERIFICATION_REQUIREMENT_INCOMPATIBLE   requirement is not of kind Verification
VERIFICATION_CHECK_NOT_DECLARED         pinned profile's requirement does not declare it
VERIFICATION_CHECK_NOT_REGISTERED       declared, but no implementation exists
VERIFICATION_CHECK_REGISTRATION_INVALID malformed or duplicate registration
VERIFICATION_CHECK_DECLARED_TWICE       corrupted profile lists one check twice
VERIFICATION_CHECK_EXECUTION_INVALID    executor returned something unstorable
VERIFICATION_RESULT_INVALID             result document failed validation
VERIFICATION_RESULT_DUPLICATE           (tenantId, executionId) already exists
VERIFICATION_TIMESTAMP_INVALID          clock non-canonical, or earlier than the case
```

Conditions APV-04 already owns are delegated rather than restated, so an unknown requirement
id, a broken aggregate and a withdrawn profile version still fail with their existing
`PROTOCOLIZATION_CASE_*` codes and there are never two codes for one condition.

**An outcome is never an error.** `Fail`, `Warning`, `ManualReview` and `Unavailable` all come
back as results; there is no code meaning "verification failed".

## 22. Structural validation

Persisted results are validated before they are trusted — a repository can hand back anything,
and a result whose invariants are broken would be read as history that never happened.
Validated: schema version, every identifier, the profile ref, a case revision that could
actually exist (`>= 1`, integer), the outcome against the closed set, reason-code grammar,
summary bounds, input-ref shape, canonical timestamps, and unknown fields. A present-but-
`undefined` optional is invalid rather than absent, matching every other validator in the
package.

Executor return values are validated by the same module, before they can become history.

## 23. Deliberate non-goals

```text
professional attestation, reviewer, ATTEST/REJECT/ABSTAIN     APV-08
readiness, expanded state machine, READY                      APV-09
protocolization execution, ProtocolizationResult, finalization APV-10
concrete asset profiles                                        APV-11+
production registry connectors, identity providers, blob stores
signature validity verification (port + adapter, not this slice)
waiver, override, forcePass, ignoreFailure, adminOverride, markVerified
policy, approvals, grants, obligations, revocation             Soberanía Enterprise
token issuance, contracts, custody, settlement                 Tokenizer / Workstream B
fee assessment, billing, payments
database adapters, migrations, schemas
```

## 24. Architectural prohibitions

Enforced by `tests/verification-boundaries.test.ts`,
`tests/verification-truth-semantics.test.ts`, `tests/verification-outcomes.test.ts` and
`tests/verification-correlation.test.ts`:

```text
no parallel Verification, Claim, Evidence, Attestation, Credential, Proof,
  Principal or subject-identity type is defined
Protocol's VerificationStatus is never imported, widened, renamed or reinterpreted
no CanonicalVerification is minted, and no Protocol record is constructed
no branch on an asset category, a profile id, a subject shape, or a check id's spelling
no import outside @aoc/protocol's declared subpaths and relative modules
no Enterprise, runtime, monetization, tokenizer, governance or storage dependency
no clock of its own — Date.now(), new Date() and Math.random() appear nowhere
no I/O, no adapter, no provider, no client, no createHash/createSign/createVerify
no truth, readiness, authority or legal identifier anywhere in the source
no APV-08, APV-09 or APV-10 concept
no concrete product profile id and no closed check vocabulary
no test-only check is exported
no change to Soberanía Protocol
```

```text
Protocol                 != Asset Protocolization
Asset Protocolization    != Enterprise Governance
Enterprise Governance    != Tokenizer
Check result             != Truth
Check result             != Professional attestation
Protocolization          != Tokenization
```

## 25. Handoff to APV-08

APV-08 will need a professional review package containing the subject, the participants, the
declarations, the evidence, the automated check findings, the exceptions, the attestation
requested and its scope. APV-07 builds none of that — but its result structures preserve
enough that automated findings can later be included **without reinterpreting raw logs**:

```text
what ran        checkId + requirementId + the exact pinned profile version
what it found   outcome + reasonCode + bounded summary
what it read    inputRefs, as stable references into evidence, claims,
                declarations, materials and the subject
when, over what executedAt + evaluatedCaseRevision
which request   correlationId
```

`countVerificationOutcomes` gives a reviewer the shape of the findings without deciding for
them, and `listLatestVerificationResults` gives the current view without destroying the
history behind it. Every `Warning`, `ManualReview` and `Unavailable` reaches APV-08
undiminished — which is the point: those are precisely the findings a professional exists to
consider.

**APV-09 non-ownership.** Nothing here decides readiness, transitions a case, or ranks
outcomes. Whether a non-current result must be re-executed, what combination of findings
permits progress, and what READY means are all APV-09's, and APV-07 deliberately leaves them
unanswered.

## 26. Architecture after APV-07

```text
Soberanía Protocol
│  generic identity / evidence / claim / attestation / verification primitives
│  CanonicalVerification, CanonicalVerificationId, VerificationStatus (untouched),
│  CanonicalClaim, ClaimType, CanonicalEvidenceId, CanonicalPrincipalRef,
│  CanonicalRegistryEntryRef, ContentIdentity, verifyContentIdentity, AdapterResult
▼
AssetProfile                        (APV-03)  what a category requires,
│                                             including which checkIds
▼
ProtocolizationCase                 (APV-04)  one tenant, one subject,
│                                             one pinned profile version,
│                                             lifecycle + material correlation
├──────────────────────────┐
▼                          ▼
Evidence intake            Declaration / claim preparation
(APV-05)                   (APV-06)
└──────────┬───────────────┘
           ▼
Verification pipeline               (APV-07)  resolve pinned checkIds ·
           │                                  execute declared checks ·
           │                                  bounded context · explicit outcome ·
           │                                  preserve basis + case revision ·
           │                                  immutable append-only results
           │                                  — mutates no case, decides no readiness
           ▼
      [FUTURE] professional attestation (APV-08)
           ▼
      [FUTURE] state machine (APV-09) · finalization (APV-10)
           ▼
      Protocolized asset
           ▼
      Soberanía Enterprise
           ▼
      External capability
      └── optional TOKENIZE ──▶ Tokenizer
```

APV-07 implements only the verification pipeline.
