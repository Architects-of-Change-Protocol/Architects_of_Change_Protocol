# APV-04 — Protocolization Case and Lifecycle Foundation

| Field | Value |
|---|---|
| Work package | APV-04 (Workstream A, Asset Protocolization Vertical) |
| Status | Implemented — second vertical code slice |
| Package | `@aoc/asset-protocolization` (`packages/asset-protocolization/src/case`) |
| Depends on | [`APV_03_ASSET_PROFILE_FRAMEWORK.md`](./APV_03_ASSET_PROFILE_FRAMEWORK.md), [`APV_02_VERTICAL_PROTOCOL_CONTRACT.md`](./APV_02_VERTICAL_PROTOCOL_CONTRACT.md), [`adr-asset-protocolization-vertical-boundary.md`](../architecture/adr-asset-protocolization-vertical-boundary.md) |
| Gate | GATE A0 — **RATIFIED** (see [`README.md`](./README.md#gate-a0--ratified)) |
| Protocol core modified | **No** |

This document describes only what APV-04 added. The frozen artifacts above are
the architectural baseline and are not restated here.

---

## 1. What a `ProtocolizationCase` is

> A `ProtocolizationCase` is **one tenant's attempt to protocolize one subject
> under one immutable `AssetProfile` version**.

It is the workflow aggregate. It records what is happening in this specific
attempt: which profile governs it, which subject it is about, what has been
supplied against which requirements, where it is in its lifecycle, and when each
of those became true.

```text
Tenant
  │
  ▼
ProtocolizationCase
  ├── pinned AssetProfile         (profileId + profileVersion, immutable)
  ├── subject binding             (SovereignSubjectRef [+ ContentIdentity])
  ├── requirement projection      (one state per profile requirement)
  ├── material references         (associations to Protocol records)
  ├── lifecycle state             (Draft | Active | Cancelled)
  ├── deterministic operations    (pure functions, one event each)
  └── auditable timestamps
```

It is **not** the protocolized asset — that is a signed `SovereignManifestV1`
that does not exist yet. It is **not** a `ProtocolizationResultV1`; that envelope
(APV-02 §2.1) exists only for a case that finished and deliberately carries no
case state. It is not an Enterprise governance object, not a tokenization
request, and not a transaction.

---

## 2. Profile versus case

| | `AssetProfile` (APV-03) | `ProtocolizationCase` (APV-04) |
|---|---|---|
| Answers | *What does this category of asset require?* | *What is happening in this attempt?* |
| Scope | global / system-level (`AssetProfileScope.Global`) | tenant-bound |
| Lifetime | versioned, reusable, immutable once catalogued | one instance, stateful |
| Nature | configuration / domain definition | workflow state |
| Tenancy | none — profiles carry no `tenantId` | mandatory |

A case never alters the semantics of its profile. It does not copy requirement
definitions, restate obligations, or hold a mutable snapshot that could drift
from the catalogued document: it holds the `(profileId, profileVersion)` pin and
reads through it. Requirement `label`, `kind`, `obligation`, `condition`,
`freshness` and every other definition exist in exactly one place — the profile.

---

## 3. What APV-04 owns

- `ProtocolizationCase` — the aggregate, its identity and its immutability;
- **required, immutable tenancy** on the aggregate;
- **profile pinning** to an exact `(profileId, profileVersion)`;
- **subject binding** — which subject the attempt is about;
- **requirement projection** — one case-level state per profile requirement;
- **material association** — correlating references to requirements;
- the **lifecycle** and its complete transition table;
- **case domain events** for the five operations that exist;
- **case validation** for untrusted, reconstructed state;
- the **case persistence port**, and one in-memory implementation;
- case error codes.

## 4. What APV-04 explicitly does not own

`ProtocolizationCase` neither owns nor redefines:

- `CanonicalEvidence`, `CanonicalClaim`, `CanonicalAttestation`,
  `CanonicalVerification`, `CanonicalCredentialRef`, `CanonicalRegistryRef`,
  `CanonicalRegistryEntryRef`, `ResourceRef`, `SovereignSubjectRef`,
  `SovereignExternalReference`, `ContentIdentity` — all Protocol's, all
  referenced, none restated;
- verification execution and any check-outcome vocabulary — APV-07's;
- readiness evaluation and the final protocolization act — later slices;
- Enterprise authority, policy, grants, approvals and delegation;
- external registry truth, and any means of reaching a registry;
- legal conclusions: ownership, title, validity, standing, transferability;
- fees, billing and settlement;
- tokenization, in any form.

---

## 5. Lifecycle

```text
        ┌─────────┐   activate    ┌──────────┐
        │  Draft  │──────────────▶│  Active  │
        └────┬────┘               └────┬─────┘
             │                         │
             │  cancel                 │  cancel
             ▼                         ▼
        ┌──────────────────────────────────┐
        │           Cancelled              │  terminal
        └──────────────────────────────────┘
```

| Item | Value |
|---|---|
| States | `Draft`, `Active`, `Cancelled` |
| Initial state | `Draft` |
| Allowed transitions | `Draft → Active`, `Draft → Cancelled`, `Active → Cancelled` |
| Prohibited | `Active → Draft`, `Cancelled → *`, and every self-transition |
| Accepts material | `Draft`, `Active` |
| Rejects material | `Cancelled` |

Three states, because a state is added when an operation in this package can
actually reach it. `Ready`, `Protocolized`, `Approved`, `Rejected` and
`Authorized` all depend on evaluation machinery that does not exist yet; naming
one now would leave it either unreachable or — far worse — reachable on a rule
that only resembles the real one.

`Active → Draft` is absent so that "when was this activated?" stays answerable
from the aggregate. `Cancelled → *` is absent because reopening is a governance
concept (who may reopen, on what authority) and inventing it here would be the
waiver mechanism APV-04 is forbidden to build. Both are additive amendments when
a frozen artifact requires them.

### Cancellation

Cancellation is a **state, not a deletion**. A cancelled case keeps its profile
pin, its subject, every material association it accumulated, and every timestamp,
so *what was attempted, and what was supplied, before this was abandoned?* stays
answerable. Erasure is a data-lifecycle concern with its own retention and
authority questions; it is not what cancelling a case means.

An optional free-text `cancellationReason` may be recorded. It is presentation
only — exactly like `AssetProfileMetadata` — and no machine semantics read it.
There is deliberately no reason taxonomy: a closed vocabulary of cancellation
reasons is a policy artifact.

Cancelling an already-cancelled case fails rather than succeeding idempotently:
a second success would either invent a second cancellation event or report
success with nothing to show for it.

---

## 6. Tenancy

`tenantId` is **required, non-blank and immutable** on every case.

Protocol's `tenantId` is optional and advisory — `ResourceRef.tenantId?`,
`AdapterLookupContext.tenantId?`, and `TENANT_AND_ACTOR_BOUNDARIES.md` states
tenant semantics "must not be implicitly inferred" (APV-00 F-4). The substrate
therefore will not enforce isolation, and the vertical must. That is a vertical
obligation the ADR assigned and this slice discharges; Protocol's optional
tenancy is untouched.

Concretely:

- there is no `tenantId?` on the case aggregate;
- there is no global tenant fallback, and no `"default"`, `"system"` or
  `"public"` substituted for a missing one;
- every operation takes the **acting** tenant as a separate parameter, so a
  cross-tenant call is detectable — an operation that read the tenant off the
  case it was handed could never disagree with itself;
- every repository method takes the tenant; there is no `get(caseId)` overload
  and no cross-tenant lookup, public or otherwise;
- cases are identified by `(tenantId, caseId)` — see §10.

The type is Protocol's `CanonicalId`, so the tenant a case is bound to is the
tenant that later reaches Enterprise through
`ProtocolizationResultV1.governedResource.tenantId` (APV-02 §4) with no
re-spelling in between.

---

## 7. Profile pinning

A case is created against an exact `(profileId, profileVersion)` pair, which
must resolve in the catalogue at creation time or the case is not created.

```ts
readonly profile: ProtocolizationProfileRef;   // { profileId, profileVersion }
```

This is the shape APV-02 §2.1 froze for `ProtocolizationResultV1.profile`,
materialized here because the case is the first thing in the vertical that pins
a profile — the pin a case is created with must be the pin its eventual result
carries.

Nothing in this package ever asks the catalogue for a *latest*, *current*,
*default* or *nearest* version. A case created under `example.profile / 1.0.0`
still means `example.profile / 1.0.0` after `2.0.0` is published: the pin does
not move, the requirement projection does not change, and a requirement id that
exists only in `2.0.0` is not associable on the `1.0.0` case. A profile withdrawn
from a catalogue makes its cases fail loudly rather than being quietly reassessed
under different rules.

---

## 8. Subject binding

```ts
interface ProtocolizationCaseSubject {
  readonly subjectRef: SovereignSubjectRef;      // @aoc/protocol/identity
  readonly contentIdentity?: ContentIdentity;    // @aoc/protocol/identity
}
```

Both fields are Protocol's; the vertical defines no identity type and redefines
none. This is the reuse map's row 1 (`SovereignSubjectRef` for "identify the
asset (APV-04)") and row 3 (`ContentIdentity`).

**It binds; it does not prove.** Creating a case asserts only that this attempt
is about this subject — not that the subject exists, is owned by the applicant,
has been protocolized, or that any identifying material has been checked.

| Subject shape | `subjectRef.externalReference` | `contentIdentity` |
|---|---|---|
| Content-addressable (has bytes) | absent, or an opaque namespace | present |
| Externally referenced (no bytes) | present — namespace + opaque id | **absent** |
| Not yet identified | absent | absent |

All three are valid. Neither absence is a defect: whether content identity or an
external reference is required is the *profile's* decision, and only for the
profile the case is pinned to.

`SovereignAssetId` is required because it is minted, never derived — from bytes,
locator or registry id — so carrying one commits to nothing about what the
subject is. It is the correlation key that lets inputs, requirements, material
and a future signed manifest all name the same thing, and APV-02 I-3 requires
`record.manifest.sovereignAssetId` to be exactly this value. Minting happens in
the composition layer via Protocol's `mintSovereignAssetId`; this package never
mints.

The binding is **immutable**. Identity material that arrives later — a registry
entry, an external reference observed after intake, a content digest computed
once a file was uploaded — attaches as *material* correlated to an identity
requirement, never by rewriting the binding. A case can therefore never quietly
become a case about a different subject.

---

## 9. Requirement progress — and what it is not

At creation, every requirement of the pinned profile is projected onto the case
as one `ProtocolizationCaseRequirementState`, in declaration order. Every
obligation is projected — `Required`, `Optional`, `Conditional` **and**
`NotRequired` — because dropping the ones that look irrelevant would flatten the
profile's vocabulary into required/not-required and lose a recorded decision.

Each state carries the requirement **id** and nothing else from the profile:

| Field | Meaning |
|---|---|
| `requirementId` | which profile requirement this tracks |
| `materialStatus` | `Pending` or `MaterialPresent` |
| `materialIds` | which material associations point at it |
| `firstMaterialAt` | when the first material arrived (absent while `Pending`) |
| `updatedAt` | when this requirement's case-level state last changed |

`materialStatus` is a projection of `materialIds` (`Pending` **iff** empty), and
validation checks the two agree, so the summary can never disagree with the
detail.

### Material present ≠ satisfied ≠ verified ≠ ready

This is the distinction the whole slice is built around.

```text
material present   =  a reference was recorded against this requirement
satisfied/verified =  someone read the referenced records and decided
ready              =  every applicable requirement was decided favourably
```

APV-04 can honestly report the first. It cannot report the second or third,
because:

- a claim can exist and be untrue;
- evidence can exist and fail validation;
- an attestation can exist and be invalid, or out of scope;
- a registry lookup can exist and be stale;
- a credential can exist and be expired or revoked.

So no operation, field or exported name in this slice says `ready`, `verified`,
`satisfied`, `complete`, `attested` or `protocolizable`. The progress API is
named for what it reports:

```ts
listProtocolizationCaseRequirementProgress(protocolizationCase, profile, filter?)
listProtocolizationCasePendingMaterialRequirements(protocolizationCase, profile)
getProtocolizationCaseRequirementProgress(protocolizationCase, profile, requirementId)
```

An empty pending list means only that material is present wherever it was
structurally expected. It is not readiness, and a caller that treats it as
readiness has drawn a conclusion the function did not offer.

### Conditional requirements

APV-04 evaluates no condition, so every `Conditional` requirement reports
`conditionStatus: 'Unresolved'` and stays in the pending list. That is
deliberately not a boolean: a condition that has not been evaluated is neither
"applies" nor "does not apply", and collapsing it to either would silently drop a
requirement from a later evaluation or invent one that never applied.

---

## 10. Material references

A material entry is an **association**, never a record:

> this case was told about this reference, at this instant, in connection with
> these requirements.

```ts
{
  materialId, kind, requirementIds[], addedAt, correlationId?, <one payload>
}
```

| `kind` | Payload | Protocol type |
|---|---|---|
| `ContentIdentity` | `contentIdentity` | `ContentIdentity` |
| `ExternalReference` | `externalReference` | `SovereignExternalReference` |
| `RegistryEntry` | `registryEntryRef` | `CanonicalRegistryEntryRef` |
| `Declaration` | `claimRef` | `CanonicalClaimId` |
| `Evidence` | `evidenceRef` | `CanonicalEvidenceId` |
| `Verification` | `verificationRef` | `CanonicalVerificationId` |
| `Attestation` | `attestationRef` | `CanonicalAttestationId` |
| `Credential` | `credentialRef` | `CanonicalCredentialId` |

The set is closed to what an APV-03 profile can require: the three identity
strategies, the four requirement families that name a Protocol record, and the
credential an attester constraint refers to. **A new asset category never adds a
member — it writes a profile.**

Nothing here is a blob: no bytes, no documents, no upload, no storage adapter, no
PII, by construction — the same exclusion APV-02 §2.3 froze for the result
envelope, for the same reason.

A `Verification` association carries the verification's **id only**. Its `status`
is deliberately not copied onto the case: a status on the association would be a
second, staleable copy of an outcome the vertical does not own, and reading it
out of the case would be manufactured verification.

### Correlation rules

Every association must name at least one requirement, ids must be unique within
the association, and each must be declared by the pinned profile version *and*
projected on the case. A material id must be unique within the case.
Re-associating a material with a requirement it already answers is rejected
rather than ignored — a silent no-op would either emit an event describing an
association that did not happen, or report success while emitting nothing.

There is no material-removal operation, and correspondingly no removal event.
Detaching a reference from an auditable case is a retention question, not a
workflow one.

---

## 11. Operations, immutability and time

Every operation is a pure function over an immutable aggregate: it takes a case,
returns a **new** case plus the one event the transition produced, and mutates
nothing. There is no `case.state = ...`, no setter and no method, so an illegal
transition is not something a caller can express.

```ts
createProtocolizationCase(context, input)
activateProtocolizationCase(context, protocolizationCase)
addProtocolizationCaseMaterial(context, protocolizationCase, input)
associateProtocolizationCaseMaterial(context, protocolizationCase, input)
cancelProtocolizationCase(context, protocolizationCase, input?)
reconstituteProtocolizationCase(value, options?)
```

Creation is centralized so that a case built from an object literal elsewhere
cannot carry an unpinned profile, an absent tenant, a projection that disagrees
with the profile, or a state no transition can produce. An operation either
returns a valid case or throws — never a partially valid one — and every returned
case is deeply frozen, because `readonly` is erased at runtime.

**Immutable for the life of the case:** `caseId`, `tenantId`, `profile`,
`subject`, `createdAt`, `schemaVersion`.

`ProtocolizationCaseContext` carries the injected `catalog`, `clock` and acting
`tenantId`. No module under `src/` calls `Date.now()` or an argument-less
`new Date()` — a property the boundary test asserts mechanically. The clock is a
port because a domain that reads the host clock is neither deterministic nor
testable; binding it (`() => new Date().toISOString()`) belongs to the
composition layer, alongside case-id minting, for the same reason. A clock that
returns a non-canonical instant, or one earlier than the case's `updatedAt`,
fails the operation rather than being repaired.

---

## 12. Auditability and events

Five events, one per operation that exists:

```text
ProtocolizationCaseCreated       caseId, tenantId, profile, revision, occurredAt,
                                 subjectRef, requirementIds
ProtocolizationCaseActivated     caseId, tenantId, profile, revision, occurredAt
ProtocolizationMaterialAdded     + materialId, materialKind, requirementIds
ProtocolizationMaterialAssociated + materialId, requirementIds (newly added only)
ProtocolizationCaseCancelled     + reason?
```

There is deliberately no speculative event for a future slice — no
`AssetVerified`, `AssetProtocolized`, `TokenizationAuthorized`, `TokenIssued`,
`PaymentReceived`, `RegistryUpdated` or `ProfessionalApproved`. An event named
for something that cannot happen yet is a promise the code does not keep.

These are typed vertical events rather than `AuditEventEnvelope`s because an
envelope needs an `eventId`, and minting one is a non-deterministic act this
package cannot perform. Projecting them into `AuditEventEnvelope` and handing
them to an `AuditEventSink` belongs to the layer that owns identifier minting and
the sink — reuse-map row 17, APV-09. This is not a second audit framework: it is
a closed union of five facts.

**Events are outputs, not the source of truth.** The aggregate is, and it carries
the timestamps that answer the audit questions on its own — `createdAt`,
`activatedAt`, `cancelledAt`, each material's `addedAt` and each requirement
state's `firstMaterialAt`/`updatedAt`. A dropped event loses a notification,
never case history.

### Ordering

`revision` is a monotonic counter, `1` at creation and `+1` per successful
operation, and each event carries the revision the case had after it. This
follows `SovereignManifestV1.manifestVersion` — the repository's existing
aggregate-revision precedent — rather than introducing event sourcing. A simple
aggregate does not become an event-sourced system merely because it emits events.

---

## 13. Persistence

```text
ProtocolizationCase persistence owner: the Asset Protocolization Vertical
```

Gate A0 / `U-6` settled this: no vertical workflow persistence port goes into Soberanía
Protocol, and Protocol never learns the case exists.

**APV-04 implements the port and one deterministic in-memory implementation. It
implements no database adapter, no migration and no schema.** The domain slice
does not need one, and binding the interface to a store is an infrastructure
decision with its own owner and review — making it in the slice that defines the
domain would couple the vertical's domain package to a database. No Supabase,
Postgres, Prisma, Redis, filesystem or external SaaS is referenced anywhere.

```ts
interface ProtocolizationCaseRepository {
  get(tenantId, caseId): AdapterResult<ProtocolizationCase | undefined>;
  exists(tenantId, caseId): AdapterResult<boolean>;
  save(protocolizationCase): AdapterResult<void>;
}
```

`AdapterResult<T> = T | Promise<T>` is Protocol's own port convention
(`@aoc/protocol/adapters`), so an asynchronous adapter satisfies the same
interface as the synchronous reference implementation.

### Identity model — `(tenantId, caseId)`

Case ids are minted by tenants, so a globally-unique constraint would let one
tenant's choice of identifier collide with another's: that both leaks the
existence of a case across a tenant boundary and makes a legitimate creation fail
for a reason its caller cannot see or fix. Tenant scoping is the only rule that
keeps a tenant's identifier space its own.

### Concurrency

One revision rule covers duplicate creation and lost updates without any locking:
a case at revision 1 must not already exist
(`PROTOCOLIZATION_CASE_ALREADY_EXISTS`), and a case at revision *n* must replace
a stored revision *n − 1* (`PROTOCOLIZATION_CASE_REVISION_CONFLICT`). Stored
cases are validated on the way in and deeply frozen, so a caller cannot mutate
stored state through a reference it saved or received.

Reconstruction is validated, never trusted: `reconstituteProtocolizationCase` and
`validateProtocolizationCase` refuse malformed persisted state — bad ids, a
missing tenant, a broken pin, non-canonical or out-of-order timestamps, an
unknown lifecycle state, duplicate requirement-state or material ids, a status
that disagrees with its material list, a material naming an unprojected
requirement, and (when the profile is supplied) a requirement the pinned version
does not declare. "It was once internal" is not an integrity guarantee.

---

## 14. Errors

`ProtocolizationCaseError` is a real `Error` that structurally satisfies
`ProtocolError` (`code` + `message` + `details`), exactly like `AssetProfileError`
— one error convention for the package, not two. `message` is a debugging aid;
`code` and `details.reasonCodes` are the stable, reportable surface, and nothing
downstream may parse presentation text.

| Situation | Code |
|---|---|
| Malformed case, input or material | `PROTOCOLIZATION_CASE_INVALID` (+ `reasonCodes`) |
| Missing or malformed acting tenant | `PROTOCOLIZATION_CASE_INVALID_TENANT` |
| Acting tenant is not the case's | `PROTOCOLIZATION_CASE_TENANT_MISMATCH` |
| Pinned profile version not catalogued | `PROTOCOLIZATION_CASE_PROFILE_NOT_FOUND` |
| Supplied profile is not the pinned one | `PROTOCOLIZATION_CASE_PROFILE_MISMATCH` |
| Requirement not declared by the pin | `PROTOCOLIZATION_CASE_UNKNOWN_REQUIREMENT` |
| Material id already in the case | `PROTOCOLIZATION_CASE_DUPLICATE_MATERIAL` |
| Material already answers the requirement | `PROTOCOLIZATION_CASE_DUPLICATE_ASSOCIATION` |
| No such material in the case | `PROTOCOLIZATION_CASE_UNKNOWN_MATERIAL` |
| Transition not permitted from this state | `PROTOCOLIZATION_CASE_INVALID_TRANSITION` |
| Clock non-canonical or moving backwards | `PROTOCOLIZATION_CASE_INVALID_TIMESTAMP` |
| No stored case at this key | `PROTOCOLIZATION_CASE_NOT_FOUND` |
| A case already exists at this key | `PROTOCOLIZATION_CASE_ALREADY_EXISTS` |
| Stored revision is not the expected one | `PROTOCOLIZATION_CASE_REVISION_CONFLICT` |

Structural detail travels in `details.reasonCodes` using
`PROTOCOLIZATION_CASE_VALIDATION_CODES`, mirroring APV-03's
`validateAssetProfile` / `ASSET_PROFILE_VALIDATION_CODES` split.

---

## 15. Protocol primitives reused

| Need | Primitive | Subpath |
|---|---|---|
| Which subject this attempt is about | `SovereignSubjectRef`, `SovereignAssetId` | `@aoc/protocol/identity` |
| How another namespace names it | `SovereignExternalReference` | `@aoc/protocol/identity` |
| Byte identity, when there are bytes | `ContentIdentity` | `@aoc/protocol/identity` |
| Registry entry association | `CanonicalRegistryEntryRef`, `CanonicalRegistryRef` | `@aoc/protocol/claims` |
| Declaration / evidence / verification / attestation / credential references | `CanonicalClaimId`, `CanonicalEvidenceId`, `CanonicalVerificationId`, `CanonicalAttestationId`, `CanonicalCredentialId` | `@aoc/protocol/claims` |
| Tenant and correlation identifiers | `CanonicalId` | `@aoc/protocol/contracts` |
| Canonical instants | `UtcDateTime` | `@aoc/protocol/contracts` |
| Error shape | `ProtocolError` | `@aoc/protocol/errors` |
| Port result convention | `AdapterResult<T>` | `@aoc/protocol/adapters` |

Duplicated by APV-04: **none**.

---

## 16. Extension points

Described, not implemented.

| Future need | Extension point | Protocol change? |
|---|---|---|
| A new asset category | a new `AssetProfile` — never a case change | no |
| Verification results | associate `CanonicalVerification` records; APV-07 executes and records outcomes | no |
| Readiness evaluation | an evaluator over the pinned profile + progress + referenced records | no |
| Protocolization finalization | a later slice emitting `ProtocolizationResultV1` (APV-02 §2.1) | no |
| Professional workflows | review packet + reviewer actions (APV-08/13) over attestation material | no |
| Registry adapters | vertical adapters behind Protocol's `RegistryLookup` port | no |
| Fees | vertical-owned assessment events (`U-4`); no payment, ever, in this package | no |
| Enterprise governance | reads `ProtocolizationResultV1.governedResource`; never the case | no |
| `TOKENIZE` capability / tokenizer | Workstream B, after GATE A4; outside this vertical entirely | no |
| A production case store | an adapter implementing `ProtocolizationCaseRepository` in the composition layer | no |
| Persisted domain events | project the case events into `AuditEventEnvelope` (APV-09) | no |

---

## 17. Deliberate non-goals

APV-04 implements none of: concrete asset profiles; evidence upload, blob or file
storage; IPFS/Pinata; registry connectors; verification execution or any
`PASS`/`FAIL` pipeline; a professional review workbench; readiness evaluation;
protocolization finalization; ownership adjudication; authority resolution; legal
validation or legal conclusions; Enterprise policy, grants, delegation or
capabilities; `TOKENIZE`, tokenization, tokenizer adapters, blockchain or smart
contracts; fees, billing, Stripe, settlement or payments.

There is also **no waiver, override, exception-approval, force-ready or admin
bypass** capability. Each of those immediately raises questions of authority,
delegation, policy and audit that belong to later architecture and potentially
Soberanía Enterprise.

---

## 18. Architectural prohibitions

Asserted by
`packages/asset-protocolization/tests/protocolization-case-boundaries.test.ts`,
alongside APV-03's own boundary test:

```text
no parallel Evidence / Claim / Attestation / Verification / Credential /
   ResourceRef / SovereignSubjectRef / SovereignExternalReference /
   ContentIdentity / CanonicalRegistry*Ref definition
no import outside @aoc/protocol's declared subpaths and Node built-ins
no dependency other than @aoc/protocol
no Enterprise, runtime, monetization, tokenizer or persistence import
no branch on assetCategory, assetType or profileId — profiles drive behaviour
no Date.now() and no argument-less new Date() — the clock is injected
no fetch, no registry.resolve(), no runtime/adapter/provider construction
no asset-class, tokenization, payment or legal-conclusion vocabulary
no concrete product profile id
```

And, restated because it is the point of the whole boundary:

```text
Protocol                 != Asset Protocolization
Asset Protocolization    != Enterprise Governance
Enterprise Governance    != Tokenizer
Protocolization          != Tokenization
```

---

## 19. Architecture after APV-04

```text
Soberanía Protocol
│  generic identity / evidence / claim / attestation / verification primitives
▼
AssetProfile                        (APV-03)  what a category requires
▼
ProtocolizationCase                 (APV-04)  one tenant, one subject,
│                                             one pinned profile version,
│                                             lifecycle + material correlation
▼
[FUTURE] verification / readiness / finalization
▼
Protocolized asset
▼
Soberanía Enterprise
▼
External capability
└── optional TOKENIZE ──▶ Tokenizer
```

APV-04 implements only the `ProtocolizationCase` layer.
