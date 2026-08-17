# Sovereignty Capabilities (the canonical eight)

AOC Protocol defines exactly eight Sovereignty Capabilities — the "sovereignty minerals". This
document is a pointer to the contract, not a second source of truth: the canonical inventory lives in
`packages/protocol/src/sovereignty-capabilities/` and is published as
`@aoc/protocol/sovereignty-capabilities`.

## The inventory

| # | Key | Canonical id | Version | Name |
| --: | --- | --- | --- | --- |
| 1 | `identity` | `aoc:sovereignty-capability:identity` | 1.0.0 | Identity |
| 2 | `integrity` | `aoc:sovereignty-capability:integrity` | 1.0.0 | Integrity |
| 3 | `provenance` | `aoc:sovereignty-capability:provenance` | 1.0.0 | Provenance |
| 4 | `portability` | `aoc:sovereignty-capability:portability` | 1.0.0 | Portability |
| 5 | `interoperability` | `aoc:sovereignty-capability:interoperability` | 1.0.0 | Interoperability |
| 6 | `verifiability` | `aoc:sovereignty-capability:verifiability` | 1.0.0 | Verifiability |
| 7 | `licensing_terms` | `aoc:sovereignty-capability:licensing-terms` | 1.0.0 | Licensing & Terms |
| 8 | `governance_compatibility` | `aoc:sovereignty-capability:governance-compatibility` | 1.0.0 | Governance Compatibility |

Enumeration order is canonical and deterministic. Membership is closed: a consumer cannot register a
ninth capability, and there is no runtime registration API. Adding one is an act of Protocol
evolution — a new key in `SOVEREIGNTY_CAPABILITY_KEYS`, a definition, and tests.

## A Sovereignty Capability is not a capability grant

The word *capability* is overloaded in this repository. Everything in the right-hand column below
describes a **grant** — permission for someone to do something — and none of it is a Sovereignty
Capability:

| Sovereignty Capability | Legacy capability models (unchanged) |
| --- | --- |
| A sovereignty property the Protocol provides | `CapabilityToken` / `CapabilityGrant` — bearer authorization over a resource |
| Has a fixed canonical id and a semantic version | `ProtocolCapabilityDefinition` (`protocol/capabilities/`) — a `wallet`/`portfolio`/`insight` financial permission catalog |
| Has no subject, holder, expiry, scope or issuer | `RuntimeCapability`, delegation and consent capability types — runtime execution authorization |

New symbols are therefore sovereignty-qualified (`SovereigntyCapabilityId`,
`SovereigntyCapabilityDefinition`, `listSovereigntyCapabilities`, …) so both vocabularies can coexist.
No legacy type was renamed; convergence is later work.

## Identity and version contract

- **Identifier grammar** — `aoc:sovereignty-capability:<slug>`, following the existing AOC scheme
  established by `SovereignAssetId` (`aoc:sovereign-asset:<uuid>`). Unlike a `SovereignAssetId`, a
  capability id is never minted: it is a deterministic, human-readable Protocol constant, independent
  of subject, provider, grant, evidence and runtime.
- **Key** — a stable snake_case programmatic name (`licensing_terms`). Display capitalization is
  never the machine identity.
- **Version** — `SovereigntyCapabilityVersion`, a SemVer-shaped version of the capability's own
  semantic contract. It is not the package version, `manifestVersion`, `schemaVersion`, the
  canonicalization profile, an adapter `contractVersion`, or a grant version. It exists so a future
  work package can state "this operation consumed Verifiability 1.0.0". The exported template
  literal type is only a cheap compile-time filter — TypeScript's `${number}` also admits `-1.2.3`,
  `1e2.0.0` and `1.2.3.4` — so `isSovereigntyCapabilityVersion` (exactly `^\d+\.\d+\.\d+$`) is the
  authoritative rule and is what consumers validating or persisting a version should call.

## Discovery

```ts
import {
  getSovereigntyCapability,
  getSovereigntyCapabilityByKey,
  listSovereigntyCapabilities,
} from '@aoc/protocol/sovereignty-capabilities';

listSovereigntyCapabilities();                                    // all eight, canonical order
getSovereigntyCapability('aoc:sovereignty-capability:identity');  // exact canonical definition
getSovereigntyCapabilityByKey('governance_compatibility');
getSovereigntyCapability('aoc:sovereignty-capability:wallet');    // undefined — never coerced
```

The subpath depends on nothing outside `@aoc/protocol` itself. Discovery is pure data and pure
lookups; the invocation spine additionally uses `@aoc/protocol/identity` (to validate an optional
`SovereignSubjectRef`) and `node:crypto`'s `randomUUID` (to mint an invocation id) — the same two
things `mintSovereignAssetId` already uses. `AuditEventSink`, `AuditEventEnvelope` and
`CanonicalEvidenceId` are imported as **types only**, so nothing from `@aoc/protocol/adapters`,
`/contracts` or `/claims` enters the runtime graph. No filesystem, storage, network, provider,
runtime or Enterprise code is reachable from this subpath. Prior to SM-03 the discovery surface had
no runtime dependency at all, including `node:crypto`; consuming a capability requires minting an
identity, so that is no longer true of the subpath as a whole.

## Scope of this contract

Definitions carry Protocol metadata only — `id`, `key`, `namespace`, `version`, `name`,
`description`. There are deliberately no input/output/evidence contract references, because those
contracts do not exist yet and a placeholder would assert an implementation that has not been built.
Colour, icon, crystal geometry, marketing copy, tier, pricing and provider configuration are
presentation or product concerns and never appear here.

Definitions answer *what capabilities exist, what are their identities and versions, and how are they
discovered*. **How** one is consumed is the separate, equally common contract described below.

## Frontend

`frontend/app/src/landing/protocol/content.ts` keeps the display model (dock ids, crystal geometry,
maturity status, landing copy) but is no longer a source of truth for which capabilities exist. Each
entry names its Protocol key, and
`__tests__/architecture/sovereignty-capability-frontend-parity.test.ts` fails if the landing taxonomy
drifts from the registry in membership, order or canonical name.

## Invoking a capability (the common socket)

SM-01 built the shelf; this is the socket the minerals plug into. One generic, typed contract
carries *any* of the eight from request to result to portable evidence, without the common layer
knowing what any of them means.

```
SovereigntyCapabilityDefinition        registry: what exists
        │
        ▼
SovereigntyCapabilityRef               id + version, portable
        │
        ▼
SovereigntyCapabilityInvocation<TInput>   what was requested
        │
        ▼
SovereigntyCapabilityImplementation<TInput, TOutput>   the capsule
        │
        ▼
invokeSovereigntyCapability(invocation, implementation, options?)
        │
        ├──────────────────────┐
        ▼                      ▼
SovereigntyCapabilityResult   SovereigntyCapabilityInvocationEvidenceV1
                               │
                               ▼
                          optional AuditEventSink
```

### Definition vs reference

A `SovereigntyCapabilityDefinition` is the registry's description of a capability. A
`SovereigntyCapabilityRef` is the two fields — `id` and `version` — small enough to embed in an
invocation, a result and an evidence record. Name, key, namespace and description are *not* copied
into a ref: they are derivable from `id`, and a copy is only something that can drift. Derive refs
from the registry (`toSovereigntyCapabilityRef`, `getSovereigntyCapabilityRef`,
`getSovereigntyCapabilityRefByKey`) rather than writing `{ id, version }` literals.

`version` is the capability's own semantic contract version — never the package version, the
manifest `schemaVersion`, the canonicalization profile, or an adapter `contractVersion`. The invoker
compares the requested ref against the implementation's declared ref exactly. Requesting
`AOC.INTEGRITY 1.0.0` from an implementation advertising `2.0.0` is rejected before execution, as is
requesting Identity from an Integrity implementation. Nothing is ever resolved to "latest".

A ref naming a capability version this build does not define is still *structurally* valid, so
evidence produced by an older or newer Protocol build stays describable and replayable; it simply
matches no implementation here.

### Invocation id vs correlation id

| | `invocationId` | `correlationId` |
| --- | --- | --- |
| Identifies | one attempt to consume one capability | a caller-chosen group of invocations |
| Required | yes | no |
| Minted by Protocol | yes, `mintSovereigntyCapabilityInvocationId()` | never |
| Format | `aoc:sovereignty-capability-invocation:<uuid>` | opaque, non-blank string |
| Interpreted by Protocol | no (opaque past the namespace) | no |

An `invocationId` is never derived from the capability, subject, input, provider or timestamp —
deriving it would silently merge two genuinely separate consumption events into one record. Two
invocations may share a `correlationId` while keeping distinct `invocationId`s; correlation implies
no ordering, causality or dependency.

### The subject is optional, and that is load-bearing

`subject?: SovereignSubjectRef` is optional at the common layer, because requiring it would make two
of the canonical eight inexpressible:

| Flow | subject before | subject after |
| --- | --- | --- |
| Identity-shaped — an external thing gets its first `SovereignAssetId` | absent | **present** (returned by the capability) |
| Integrity-shaped — bytes with no sovereign identity at all | absent | absent |
| Ordinary — an existing subject is operated on | present | present |

Whether a given capability requires, ignores, returns or creates a subject is a capability-specific
rule that its own implementation declares. The precedence rule the invoker applies is fixed:

1. the subject the implementation returned, if any (Identity creating one is exactly this);
2. otherwise the subject the invocation carried, if any;
3. otherwise no subject.

The first does not have to equal the second: an implementation returning a subject is stating the
*affected or resulting* subject, and it is taken at its word.

### Capability-specific input and output

`TInput` and `TOutput` are opaque to this layer. Input is **not** required to be canonical JSON: a
`Uint8Array`, a stream handle or a class instance is a legitimate capability input, and the common
layer never canonicalizes, hashes, copies, freezes or inspects it. That is what keeps Integrity
usable over raw bytes. The invocation object is an in-process API contract; the *evidence* is the
portable artifact.

### Result

`SovereigntyCapabilityResult<TOutput>` is a success/failure discriminated union — never truthiness,
never a bare thrown `Error`. Three invariants hold for every result:

```
result.invocationId  === invocation.invocationId
result.capability    === invocation.capability   (id and version)
result.correlationId === invocation.correlationId
```

A result can therefore never claim a capability, version or invocation other than the requested one.

### Evidence

Every accepted, completed invocation produces a `SovereigntyCapabilityInvocationEvidenceV1`:
schema version, invocation id, capability ref, `requestedAt`/`completedAt`, outcome, and optionally
correlation id, subject, reason codes and `evidenceRefs`. It is JSON-safe, canonicalizes under
`aoc-canonical-json/1`, and omits absent optional fields structurally rather than emitting
`undefined` (which that profile refuses outright).

**Raw payloads are excluded, deliberately.** The common evidence record never contains `input`,
`output`, bytes, credentials, tokens, key material, exception messages or stack traces. Inputs may
be binary or non-canonicalizable, outputs may be confidential, and evidence has to stay small and
safe enough to hand to someone not entitled to the payload. Capability-specific artifacts are
*referenced* through `evidenceRefs` (reusing `CanonicalEvidenceId`, the same reference type
`AuthorityClaim.evidenceRefs` already uses), never inlined.

**Evidence is not proof of truth.** It states exactly one thing: *this Protocol record says
capability `id` at version `version` ran under invocation `invocationId` and reported this outcome.*
Unsigned invocation evidence is not cryptographic proof and must not be called that. It does not
establish that the implementation was trustworthy, that the subject exists outside AOC, that any
claim is true, that ownership exists, or that a provider behaved. Verifiability is what strengthens
evidence where strengthening is warranted.

### Evidence persistence

`options.evidenceSink` reuses the existing Protocol-owned `AuditEventSink`
(`@aoc/protocol/adapters`) and `AuditEventEnvelope` (`@aoc/protocol/contracts`) rather than
introducing a second logging architecture: both are provider-neutral and Enterprise-independent, and
both are imported as types only. `toSovereigntyCapabilityInvocationAuditEvent` performs the mapping —
`eventId` is the invocation id (one record per invocation, so delivery is idempotent for a sink that
de-duplicates), `payload.evidence` carries the record whole, and `actorId` is never set because
Protocol does not know who requested an invocation.

The sink is genuinely optional. With none configured the invocation still runs and `result.evidence`
is still the full portable record — Protocol does not need hosted infrastructure to be usable. When
one *is* configured, exactly one delivery is attempted, it is never retried, and a failure is
surfaced as a typed `SovereigntyCapabilityInvocationError` rather than silently swallowed. The
implementation is never re-run to recover from a delivery failure.

### Failure taxonomy

| Situation | Shape | Evidence |
| --- | --- | --- |
| Capability succeeded | `status: 'succeeded'` result | yes |
| Capability failed expectedly | `status: 'failed'` result with its reason codes | yes |
| Rejected before execution (bad envelope, unknown capability, ref mismatch, invalid subject) | throws, code `SOVEREIGNTY_CAPABILITY_INVOCATION_REJECTED` | none — the invocation was never accepted |
| Implementation threw, or returned a malformed outcome | throws, code `SOVEREIGNTY_CAPABILITY_IMPLEMENTATION_ERROR` | sanitized failure evidence, delivered when possible |
| Configured sink rejected the record | throws, code `SOVEREIGNTY_CAPABILITY_EVIDENCE_DELIVERY_FAILED` | constructed and returned on the error |

An expected capability failure is a normal result, not an exception. A thrown implementation is a
bug and is never quietly converted into an ordinary failure. In every path the implementation is
invoked at most once.

### What this layer is not

It executes a Sovereignty Capability implementation; it makes no AOC Enterprise governance decision.
No policy is evaluated, no grant is issued or checked, no access is authorized, no credential is
brokered, nothing is enforced, priced, metered, rate-limited or settled. Implementations are passed
in explicitly — there is no global mutable implementation registry, because a registration API here
would undo SM-01's read-only inventory from the other end.

### Example

```ts
import {
  buildSovereigntyCapabilityInvocation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
} from '@aoc/protocol/sovereignty-capabilities';
import type { SovereigntyCapabilityImplementation } from '@aoc/protocol/sovereignty-capabilities';

const capability = getSovereigntyCapabilityRefByKey('verifiability')!;

const implementation: SovereigntyCapabilityImplementation<{ document: string }, { checked: boolean }> = {
  capability,
  async invoke(invocation) {
    return { status: 'succeeded', output: { checked: invocation.input.document.length > 0 } };
  },
};

const result = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({ capability, input: { document: 'hello' } }),
  implementation,
);

result.evidence.capability;
// { id: 'aoc:sovereignty-capability:verifiability', version: '1.0.0' }
```

## Production capsules: Identity, Integrity, Provenance and Portability

Four of the canonical eight are now real implementations of the socket above, exported from
`@aoc/protocol/sovereignty-capabilities` and executed through `invokeSovereigntyCapability` like any
other implementation. They are plain factories with no import-time side effects, they register
themselves nowhere, and they expose no second entry point that would bypass the common result and
evidence semantics.

```ts
import {
  buildSovereigntyCapabilityInvocation,
  createIdentitySovereigntyCapabilityImplementation,
  createIntegritySovereigntyCapabilityImplementation,
  createPortabilitySovereigntyCapabilityImplementation,
  createProvenanceSovereigntyCapabilityImplementation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
} from '@aoc/protocol/sovereignty-capabilities';
```

All four derive their advertised `capability` ref from the SM-01 registry, so none can drift from the
canonical id or version. None reads the network, a provider, a chain, a registry or storage.

### AOC.IDENTITY

Answers exactly one question: *create a new canonical AOC sovereign identity for this registration
action, and return the canonical subject representation.*

| | |
| --- | --- |
| Input | `IdentitySovereigntyCapabilityInput` — `registrant`, optional `externalReference`, optional **precomputed** `contentIdentity` |
| Output | `IdentitySovereigntyCapabilityOutput` — `{ subject: SovereignSubjectRef; manifest: SovereignManifestV1 }` |
| Subject before | must be **absent** |
| Subject after | **present** — the one it just created |
| Factory | `createIdentitySovereigntyCapabilityImplementation({ clock? })` |

It mints a new `SovereignAssetId` through `mintSovereignAssetId`, builds the canonical record through
`buildSovereignManifestV1`, and returns the resulting subject. A new identity begins at
`manifestVersion: 1` in state `active`, with `authorityClaims: []` and no `originClaim`.

The invocation must not already name a subject. Creating identity for a subject that already has one
would fork it rather than identify it, so that case returns an ordinary failed outcome with reason
code `IDENTITY_SUBJECT_ALREADY_EXISTS` — not an exception, and not a second mint. A caller-supplied
`sovereignAssetId` is likewise not accepted: a capability that took one would not be establishing
identity at all. Two identical invocations therefore produce two distinct sovereign identities;
Identity creation is not content-addressed and is never de-duplicated by external reference, content
identity or registrant. Whether two ids denote the same real-world thing is a separate resolution
question this capability does not answer.

`createdAt` comes from an injectable clock, not from `invocation.requestedAt`: that field is
caller-supplied envelope metadata describing when the *request* was built, which is a different fact
from when the sovereign record was produced.

**Identity does not sign.** The output carries a `SovereignManifestV1`, never a
`SignedSovereignManifest`. Identity establishes *what the sovereign subject is*; whether a
cryptographic assertion over that record can be independently verified is AOC.VERIFIABILITY's
question. A capsule that generated a key pair and signed its own output would silently absorb part of
another mineral and make an unsigned-by-choice registration inexpressible. Sign the returned manifest
with `signSovereignManifest` when a proof is actually wanted — and note that an unsigned manifest is a
canonical record, not cryptographic proof.

**Identity does not claim ownership.** `registrant` records who submitted the registration. It is not
`owner`, `legalOwner` or `beneficialOwner`, and nothing in the output asserts that the registrant
owns, controls or holds any legal right over the referenced external thing. The record says *this AOC
subject references this external identifier*, and no more. Declared (and disputable) authority
assertions are `AuthorityClaim`, which belongs to Provenance.

Reason codes: `IDENTITY_SUBJECT_ALREADY_EXISTS`, `IDENTITY_INVALID_INPUT`,
`IDENTITY_INVALID_REGISTRANT`, `IDENTITY_INVALID_EXTERNAL_REFERENCE`,
`IDENTITY_INVALID_CONTENT_IDENTITY`.

### AOC.INTEGRITY

Answers: *what exact integrity commitment applies to this representation, and does a representation
match a declared commitment?* Three operations, a closed set for capability version 1.0.0:

| `operation` | Input | Output | Wraps |
| --- | --- | --- | --- |
| `compute-content-identity` | `bytes: Uint8Array` | `{ contentIdentity }` | `computeContentIdentity` |
| `verify-content-identity` | `bytes`, `expected: ContentIdentity` | `{ check: { valid, reason? } }` | `verifyContentIdentity` |
| `compute-manifest-digest` | `manifest: SovereignManifestV1` | `{ manifestDigest }` | `computeManifestDigest` |

No new hashing semantics are introduced: `ContentIdentity` remains SHA-256 over the exact bytes, and
there is no second digest implementation. The caller's `Uint8Array` reaches the primitive untouched —
never frozen, cloned, canonicalized or re-encoded.

The invocation's `subject` is optional and, when present, is attribution/context only. It can never
influence a digest: the same bytes under different subjects, or under the same subject at different
locators, produce the same `ContentIdentity`. Integrity never mints a `SovereignAssetId` and never
returns a subject of its own.

**A mismatch is a successful check with a negative result, not a failed execution.** If the caller
asks "do these bytes match this commitment?" and the correct answer is "no", the capability did its
job. So the result is `status: 'succeeded'` with `output.check.valid === false` and
`output.check.reason === 'CONTENT_DIGEST_MISMATCH'`, and the evidence records `outcome: 'succeeded'`.
Reporting it as a failed execution would conflate *the Integrity capability did not run properly* with
*the integrity assertion does not hold*, and make the two indistinguishable in evidence. A failed
outcome is reserved for malformed input: `INTEGRITY_INVALID_INPUT`,
`INTEGRITY_UNSUPPORTED_OPERATION`, `INTEGRITY_INVALID_BYTES`,
`INTEGRITY_INVALID_EXPECTED_CONTENT_IDENTITY`, `INTEGRITY_INVALID_MANIFEST`.

`compute-manifest-digest` belongs here because it answers *what is the canonical digest of this
manifest?* It does **not** answer *was this manifest signed by the right principal?* — signature
checking, issuer binding, public-key resolution and proof-payload validation are AOC.VERIFIABILITY,
and none of them happen in this capsule. Generic canonicalization is deliberately not offered as an
operation either: a `canonicalize-any-json` operation would broaden Integrity into Interoperability's
contract. `computeManifestDigest` *uses* canonicalization internally, which is not the same as
exposing it.

### AOC.PROVENANCE

Answers: *what does someone assert about where this sovereign subject came from, who claims to have
authored it, what it derives from — and does anyone dispute that?*

| | |
| --- | --- |
| Input | `ProvenanceSovereigntyCapabilityInput` — a closed union over five operations |
| Output | `ProvenanceSovereigntyCapabilityOutput` — the matching discriminated result |
| Subject before | must be **present** |
| Subject after | unchanged — Provenance never creates a subject |
| Factory | `createProvenanceSovereigntyCapabilityImplementation({ clock? })` |

| Operation | Produces |
| --- | --- |
| `declare-origin` | an `OriginClaim` via the existing `buildOriginClaim` |
| `declare-authorship` | an `AuthorityClaim` via `buildAuthorityClaim`, kind fixed to `Authorship` |
| `record-derivation` | a `DerivationClaim` — the new first-class lineage assertion |
| `contest-provenance-claim` | a `Contested` `CanonicalStanding` via the existing `contestClaim` |
| `trace-lineage` | a `SovereignLineageTrace` over caller-supplied claims |

Unlike Identity (which must *not* be given a subject) and standalone Integrity (which needs none),
Provenance **requires** `invocation.subject`: it describes something that already exists. An
invocation without one is an ordinary failed outcome carrying `PROVENANCE_SUBJECT_REQUIRED` — no
subject is minted to have something to describe, and AOC.IDENTITY is never called internally.

#### Assertions, not history

Every operation records what an issuer *asserts*:

```
provenance assertion ≠ historical truth
provenance assertion ≠ legal ownership
derivation relation  ≠ permission to derive
signature            ≠ truth
```

A well-formed but disputable assertion therefore **succeeds**. "I authored this" may be false, and
Protocol cannot know that from an invocation; refusing to record it would be a claim Protocol has no
basis for. Disagreement is expressed by contesting the claim, which records that a challenge exists
without deciding who is right.

### Derivation lineage

The gap SM-05 closes is derivation. Origin, authorship, contestation and signing primitives already
existed; a machine-identifiable *derivation relationship between sovereign subjects* did not.

```
   metadata.sourceSovereignAssetIds          claim.subject
        A ──┐
            ├────────── relation ─────────────► C
        B ──┘
```

A `DerivationClaim` is a `CanonicalClaim` with `type: ClaimType.Derivation`. Its `subject` is the
**child**; the asserted parents live in `metadata.sourceSovereignAssetIds`, alongside a `relation`, an
optional `statement` and an optional `occurredAt`.

#### Why this is a claim and not `manifest.parentId`

`SovereignManifestV1` deliberately has **no** `parentId` and no derivation field of any kind. A single
manifest field would:

- force a tree, when a subject may have zero, one or many parents;
- make multi-parent composition inexpressible;
- turn a contestable assertion into an identity field;
- make competing lineage assertions from different issuers impossible to represent;
- conflate manifest evolution (*the same subject at version 2*) with asset derivation (*a different
  subject made from this one*).

A new `manifestVersion` is not a new child subject, and a new `SovereignAssetId` is not automatically
derived from a previous one. Derivation exists only where an explicit provenance assertion says so.

#### Why sources are SovereignAssetIds

An edge names the sovereign subject and never an `externalReference.id`, locator, URL, CID,
`ContentIdentity`, `manifestDigest` or provider id. `A → C` has to stay true after A moves to another
provider or its bytes change, so lineage identity is *subject* identity, not location or
representation. A source with no `SovereignAssetId` yet gets one through AOC.IDENTITY first — that
composition is the point, and Protocol grows no second, weaker kind of ancestor.

#### The relation vocabulary

`DerivedFrom`, `TransformedFrom`, `CombinedFrom`, `ExtractedFrom`, `GeneratedFrom`, `Custom`. Generic
across domains, with no music-, software-, token- or AI-specific member, and no embedded legal
conclusion: there is deliberately no `PlagiarizedFrom`, `Infringes`, `AuthorizedDerivative` or
`IllegalCopy`.

#### `occurredAt` vs `issuedAt`

`issuedAt` is when the claim was recorded; `occurredAt` is when the issuer asserts the transformation
actually happened. A claim issued in 2026 about a 2019 transformation is an ordinary case, which is
what makes importing historical assertions possible. Both are asserted values — neither establishes
that the event occurred.

#### Cardinality and self-reference

At least one source is required, duplicates are reported rather than silently collapsed (a caller who
sent `[A, A, B]` made a mistake worth surfacing), and direct self-derivation `A → A` is rejected.

That last rejection is the *only* cycle claim a single assertion makes. `record-derivation` cannot and
does not assert that a wider lineage graph is acyclic — the rest of the graph was never supplied.
Cycles across several claims are a finding of `trace-lineage` over a supplied dataset.

### Tracing lineage

```ts
const trace = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('provenance')!,
    subject,                                   // the root
    input: { operation: 'trace-lineage', direction: 'ancestors', derivationClaims },
  }),
  createProvenanceSovereigntyCapabilityImplementation(),
);
```

The caller supplies the claims. There is no `ProvenanceDatabase`, no `LineageGraphService`, no global
asset graph, no graph-database dependency and no external graph library: Protocol defines what a
derivation relationship *means*, and where claims are stored and indexed is infrastructure's decision.
A Protocol that needed a global lineage database to answer "what did this come from?" would stop being
portable and provider-neutral. The honest consequence is stated rather than hidden — a trace is
complete *with respect to the supplied dataset* and says nothing about claims it was never shown.

`direction` is `ancestors` (what the root derives from) or `descendants` (what derives from it). Both
are answered from the same claim set; the reverse relationship is built in memory, so no separately
maintained inverse index is required.

The result is a portable, JSON-safe `SovereignLineageTrace`:

| Field | Meaning |
| --- | --- |
| `rootSovereignAssetId` | the subject the walk started from |
| `nodes` | reached subjects with their depth — the root is never restated here |
| `edges` | `{ claimId, childSovereignAssetId, sourceSovereignAssetIds, relation }` |
| `cycleDetected` | the supplied claims contain a real back edge |
| `truncated` | `maxDepth` was reached with reachable subjects left unexplored |
| `maxDepth` | the bound actually applied |

Each edge keeps the `claimId` that created it — a lineage a consumer cannot attribute back to a claim
is a lineage it cannot contest — and carries no issuer payload, statement or evidence document.

#### Determinism

Ordering is part of the contract, not an accident of `Set` iteration or of the order claims were
passed in: `nodes` ascend by depth, then by `sovereignAssetId` within a depth; `edges` follow
traversal order, and within one subject by `claimId`. The same semantic claim set always produces the
same trace.

#### Termination and honesty

Traversal is breadth-first and iterative — never recursive — guarded by a visited set and bounded by
`maxDepth` (default `DEFAULT_SOVEREIGN_LINEAGE_MAX_DEPTH`). A cyclic dataset terminates and reports
`cycleDetected: true` on a **successful** invocation: the caller asked what the graph looks like and is
being told, accurately, that it loops. That is an analysis result, not an implementation crash, and no
edge is silently dropped to make the graph look acyclic.

Cycle detection is a genuine back-edge search rather than a "have I seen this subject before" check,
because those are not the same question: a diamond (`A → B`, `A → C`, `B → D`, `C → D`) reaches `A` by
two paths and is perfectly ordinary multi-parent history, not a loop.

When `maxDepth` bites, `truncated: true` says so rather than presenting a partial lineage as complete.

#### Contested history is still history

A trace analyses every derivation claim it is given and never filters by standing, so a contested claim
still appears in the lineage it asserts. Standing is a separate record precisely so a consumer can
choose to show everything, only uncontested edges, or both side by side. Silently deleting contested
edges would make Protocol quietly pick a winner in a dispute it is not entitled to resolve.

### Contestation

`contest-provenance-claim` reuses the existing `contestClaim` primitive. The claim must be about the
invocation's subject (`PROVENANCE_CLAIM_SUBJECT_MISMATCH` otherwise). The result carries the original
claim **unmodified** alongside a `CanonicalStanding` with `status: Contested`.

Protocol records that a challenge exists. It does not record that the challenger is correct. No claim
is deleted or superseded, no manifest lifecycle state is changed as a side effect, and no policy,
approval, governance body, oracle or human reviewer is consulted — AOC Enterprise may later decide
operationally not to act on contested provenance, but that is an operational decision, not an
adjudication of history.

### Boundaries Provenance holds

| It does not | Because |
| --- | --- |
| mint a `SovereignAssetId` | identity creation is AOC.IDENTITY |
| require bytes, `ContentIdentity` or a manifest digest | integrity is AOC.INTEGRITY, and a subject need not have bytes |
| sign or verify anything | signature and issuer binding are AOC.VERIFIABILITY |
| mutate a `SovereignManifestV1` | claims are appendable assertions, not manifest edits |
| inherit licences, rights, obligations or terms along an edge | AOC.LICENSING_TERMS |
| inherit authority, authorship or governance policy | AOC.GOVERNANCE_COMPATIBILITY |
| infer ownership from origin, authorship, derivation or registration | none of them establishes legal ownership |
| dereference `assertedOrigin` or any locator | assertions are data; Protocol performs no I/O |

Derivation and authorship are independent assertions: `C` deriving from `A` implies neither that they
share an author nor that they do not. Derivation and integrity are likewise independent: a
transformation normally *changes* the bytes, and two subjects with an identical `ContentIdentity` are
not thereby related.

The formal capsule exposes only `declare-authorship`, with the kind fixed to `AuthorityClaimKind.Authorship`.
The low-level `buildAuthorityClaim` primitive still offers `License`, `Rights` and `Custom` and is
unchanged; keeping them out of this capsule is what stops Provenance from becoming a licence factory
before AOC.LICENSING_TERMS exists.

### What Provenance does not yet cover

Production means the defined v1 contract is real and consumable — not that every provenance problem is
solved. Still open, and deliberately not papered over:

- **Claims are unsigned.** Cryptographic attribution requires passing a claim through the existing
  signing primitives; a formal Verifiability capsule does not exist yet.
- **`evidenceRefs` are references, not resolved evidence.** Protocol does not resolve them, and a bare
  ref is not proof its target exists. Caller-supplied refs are preserved verbatim and none is ever
  fabricated from a digest, invocation id, subject id or URL.
- **Lineage completeness depends on the supplied dataset.** There is no global provenance database.
- **Global acyclicity is not provable** from a single `record-derivation`.
- **Custody is not modelled.** Possession, control, legal title, custodian roles, transfer intervals and
  jurisdiction are materially more complex than origin/authorship/derivation, and inventing a custody
  state machine here would fake completeness. Custody-specific provenance is deferred.
- **Legal and historical truth remain external.** Protocol records assertions and disputes; it
  adjudicates neither.

### AOC.PORTABILITY

Answers: *can this subject's sovereign representation leave the system it is currently used in, and
remain the SAME sovereign representation elsewhere?*

| | |
| --- | --- |
| Input | `PortabilitySovereigntyCapabilityInput` — a closed union over two operations |
| Output | `PortabilitySovereigntyCapabilityOutput` — the matching discriminated result |
| Subject before | **required** for `export-bundle`; **optional** for `import-bundle` |
| Subject after | export: unchanged; import: the subject that arrived **in the bundle** |
| Factory | `createPortabilitySovereigntyCapabilityImplementation()` |

| Operation | Produces |
| --- | --- |
| `export-bundle` | a canonical `SovereigntyPortabilityBundleV1` plus its canonical wire string |
| `import-bundle` | the reconstructed bundle, plus its canonical wire string, plus the existing subject |

Two operations, deliberately. There is no file manager, no listing, no partial patch, no diff, no
merge and no sync — each of those is a lifecycle or reconciliation semantic that portability does not
own.

The portable *data contract* lives on its own subpath, `@aoc/protocol/portability`, beside the
identity/manifest/claim primitives it carries; the capsule above is what makes export and import
ordinary capability invocations with capability-attributed evidence. The bundle is usable without the
capsule, and neither surface defines the contract twice.

```
APPLICATION A ─► sovereign subject + supplied sovereign artifacts
                     │
                     ▼
              PORTABILITY BUNDLE ──(canonical JSON)──► arbitrary transport
                                                              │
                                                              ▼
APPLICATION B ◄─ same SovereignAssetId, same supplied artifacts
```

### The canonical bundle

```ts
export const SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION = 'aoc-sovereignty-portability-bundle/1';

export interface SovereigntyPortabilityBundleV1 {
  readonly schemaVersion: typeof SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION;
  readonly canonicalizationProfile: typeof CANONICAL_JSON_PROFILE;   // 'aoc-canonical-json/1'
  readonly subject: SovereignSubjectRef;
  readonly manifests: readonly PortableSovereignManifestArtifact[];
  readonly claims: readonly PortableSovereignClaimArtifact[];
  readonly standings: readonly CanonicalStanding[];
}
```

Six fields, and the omissions are as deliberate as the inclusions:

| Absent | Why |
| --- | --- |
| `bundleId` | the bundle represents existing artifacts; it is not a new sovereign object, and the subject's identity is already `SovereignAssetId` |
| `exportedAt` | an automatic timestamp would make the same sovereign state serialize differently every time. *When* an export happened is recorded truthfully in the SM-03 invocation evidence |
| `digest` / `hash` / `checksum` | integrity over a bundle is explicit composition — serialize, then invoke AOC.INTEGRITY over the bytes |
| `bundleSignature` | signing and verifying a portable artifact is AOC.VERIFIABILITY's contract, and it does not exist yet |
| `provider`, `storageUri`, `bucket`, `CID`, `region`, `tenantId` | a bundle that named where it came from would be transport-history dependent and provider-coupled — the exact lock-in portability removes |
| `sourceApplication` / `destinationApplication` | same reason; migration provenance, if anyone wants it, is an explicit claim |
| `contentBytes` | a building, an API resource, an agent or an external token may have no byte payload at all |
| `complete` / `containsFullHistory` | Protocol has no global registry of manifests, claims or standing records and could not know |
| `license`, `terms`, `policy`, `governanceContext`, ownership | other minerals' contracts, not envelope metadata |

The one nested locator that survives is `subject.externalReference.locator`, because it belongs to the
canonical SM-02 subject model. It is preserved verbatim and never dereferenced, required, or treated
as identity or as transport.

**The subject is the SM-02 `SovereignSubjectRef` itself.** There is no parallel "portable subject"
model — a second subject type is exactly how two representations of one subject start to disagree.

### Artifact unions

Both canonical manifest states are portable, and neither is forced — AOC.IDENTITY produces *unsigned*
manifests while the lower-level primitives can produce signed ones, and a transport demanding either
would make a legitimate half of the Protocol unportable:

```ts
type PortableSovereignManifestArtifact =
  | { kind: 'manifest';        manifest: SovereignManifestV1 }
  | { kind: 'signed-manifest'; signedManifest: SignedSovereignManifest };

type PortableSovereignClaim = OriginClaim | AuthorityClaim | DerivationClaim;

type PortableSovereignClaimArtifact =
  | { kind: 'claim';        claim: PortableSovereignClaim }
  | { kind: 'signed-claim'; signedClaim: SignedClaim<PortableSovereignClaim> };
```

A signed artifact travels whole — `manifest`/`claim`, digest and proof — never flattened into the
envelope, and never re-signed, re-digested or re-timestamped.

The claim union is deliberately *not* `CanonicalClaim` in general: there is no canonical runtime
validator for every current and future variant, so accepting an arbitrary one at an external trust
boundary would advertise an understanding of semantics Protocol does not have. `ClaimType.Custom` is
not used as an escape hatch for that gap, and a future additive bundle version can widen the union
once the validators exist.

### Cross-field invariants

- Every manifest's `sovereignAssetId` and every claim's `subject` must equal
  `bundle.subject.sovereignAssetId`. A mismatch fails closed and the artifact is **never** rewritten
  to agree.
- `manifestVersion` must be unique across the whole manifest list, signed and unsigned wrappers alike
  — a signed wrapper already contains its manifest, so the same version must not appear twice under
  two wrappers.
- Underlying claim ids must be unique, again across wrappers, and duplicates are reported rather than
  silently deduplicated.
- A standing's `claimRef` must resolve to a claim inside the bundle
  (`PORTABILITY_DANGLING_STANDING_CLAIM_REF`): a standing with no represented claim is not
  self-contained sovereign standing. Nothing is fetched to resolve it.
- `evidenceRefs` are emphatically **not** held to that rule. An evidence ref may legitimately point at
  separately stored evidence; the reference is preserved and never resolved. *A portable claim
  reference is not a bundled evidence payload.*

Historical manifests may carry a *different* `externalReference` from the bundle subject — an old
locator, an old external-reference state — and that is preserved, not reconciled. The only hard
cross-field invariant is `sovereignAssetId` equality.

### Canonical ordering and determinism

Envelope arrays are copied (never mutated in place) and sorted:

| List | Key |
| --- | --- |
| `manifests` | `manifestVersion` ascending |
| `claims` | underlying claim `id`, lexicographically |
| `standings` | `id`, lexicographically |

Duplicates on all three keys are rejected, so the order is total and no arbitrary secondary key is
invented. Ordering historical manifests ascending is *serialization determinism*, not adjudication —
it does not make the latest version authoritative beyond existing manifest semantics.

This normalizes the **envelope** and nothing inside it. `evidenceRefs` are not sorted,
`authorityClaims` inside a historical manifest are not reordered, statements are not rewritten,
locators are not touched and proof timestamps are not changed:

> canonical import normalization = envelope ordering only.

The practical consequence: the same artifact set supplied as `[A, B, C]` or `[C, A, B]` serializes
identically, and repeated export/import cycles produce byte-identical output with no cumulative drift.

### Serialization and the import trust boundary

```ts
serializeSovereigntyPortabilityBundle(bundle)   // → canonicalizeJSON(bundle), the wire form
parseSovereigntyPortabilityBundle(serialized)   // → { valid: true, bundle } | { valid: false, reasons }
```

One serializer, one profile: `aoc-canonical-json/1`, the same one the rest of Protocol hashes and
signs under. No second canonicalizer, no stable-stringify variant, no pretty-printed "canonical" form,
and no ZIP, TAR, CBOR, MessagePack, protobuf, custom extension, compression or encryption — those are
transport and storage concerns that layer outside without redefining anything.

The parser is the import trust boundary and fails closed on every defect, with a stable reason rather
than a leaked `JSON.parse` exception: malformed JSON, an unsupported bundle schema, an unsupported
canonicalization profile, an invalid subject, an unknown artifact kind, a subject mismatch, a
duplicate version or id, an invalid or dangling standing, and any value the canonical profile refuses.

An importer seeing `aoc-sovereignty-portability-bundle/2` **fails closed**. A v1 importer does not
pretend to understand future semantics, and an unrecognized artifact kind is rejected rather than
skipped — for a sovereignty transport, a failed import is strictly better than a quietly lossy one.
Unrecognized fields in the structures SM-06 owns and rebuilds (the envelope, the artifact wrappers,
the subject) are likewise reported rather than dropped; nested artifacts are carried by reference and
never rebuilt, so nothing about them can be lost and their own layers' tolerance is unchanged.

### Structural validity is not verification

`validateSovereigntyPortabilityBundleV1` reports `valid`, never `verified`. A structurally valid
bundle means a supported schema and profile, a valid subject, recognized artifact kinds, valid nested
structures, artifact/subject consistency, unique versions and ids, resolvable standing references, and
a canonicalizable value.

It does **not** mean signatures verified, claims historically true, content bytes matching a
`ContentIdentity`, evidence refs resolvable, the bundle globally complete, the issuer's identity
established, or ownership proven.

### Subjectless import, and why it matters

An importing application may have no local record of the subject yet — the ordinary case for a bundle
arriving from somewhere else. So `import-bundle` runs with `invocation.subject` absent, and the
implementation returns the subject **from the bundle**, which SM-03's subject-precedence rule then
places on the result and its evidence.

This is not Identity creation. No `SovereignAssetId` was minted; the one that arrives is the one the
exporting runtime already had.

Supplying a subject explicitly is an assertion that the bundle is expected to be about exactly that
reference, and it is checked for **exact** equality — same `SovereignAssetId` *and* same external
reference. A same-id-different-locator pair fails with `PORTABILITY_SUBJECT_MISMATCH` rather than
being reconciled: silently picking a winner between two locators is a lifecycle decision, not a
transport one.

### What import does and does not mean

| | |
| --- | --- |
| Imported | **yes** |
| Reconstructed in memory as a canonical AOC representation | **yes** |
| Registered in a `SovereignAssetRegistry` | **no** — not performed |
| Stored in a database, filesystem or provider | **no** — not performed |
| Cryptographically verified | **no** — not performed |
| Historically true | **not established** |
| Legally authoritative, or owned by the importer | **not established** |

Import is deliberately independent of registry persistence, and not only on principle:
`SovereignAssetRegistry.register` takes a `SignedSovereignManifest` while AOC.IDENTITY produces
unsigned ones, so defining import as "call register" would have made *signing* a precondition of
portability. Persistence is the consumer's infrastructure decision, made on data the capsule returns.

### Boundaries Portability holds

- **Identity.** Never calls `mintSovereignAssetId`, on either operation. Export requires a subject;
  import returns the one that arrived.
- **Integrity.** Never calls `computeContentIdentity` or `computeManifestDigest`, and never "fixes" a
  supplied `manifestDigest`. A tampered digest survives transport unchanged, for Integrity or
  Verifiability to reveal later.
- **Verifiability.** Never signs and never verifies. Supplied proof material — public key, signature,
  payload hash, timestamps, digests — is preserved exactly and judged later by whoever is entitled to.
  A structurally transportable but cryptographically invalid artifact transports successfully; that is
  correct behaviour, not a portability failure.
- **Provenance.** Moving a bundle asserts no origin, authorship, derivation or custody. Transport
  history is not sovereign provenance unless somebody asserts it through AOC.PROVENANCE. Contested
  standing stays `Contested`; manifest lifecycle states are never reactivated by an import.
- **Ownership.** Possession of a bundle is possession of data — no title, custody, rights or authority.
- **Storage.** No provider, backend, bucket, CID or storage pointer, and no bytes are moved. A 500 MB
  video travels through whichever storage transport the application chooses; the sovereign record that
  describes it travels here, and `ContentIdentity` inside a manifest is what connects the two.
- **Discovery.** Export bundles what the caller supplied. It never queries a registry, index, provider
  or Enterprise service to "complete" the set — Protocol has no universal claim registry and could not
  guarantee completeness if it tried.
- **Recursion.** A `DerivationClaim` naming sources A and B transports with those references intact;
  bundles for A and B are not fetched, built or implied. Exporting one subject never expands into
  exporting a graph. Callers wanting bundles for A, B and C export three.
- **The outside world.** No fetch, upload, download, IPFS, S3 or chain RPC; no key material,
  credential or secret; no dynamic code execution from imported metadata. Imported data is data.

### Portability is not Interoperability

SM-06 establishes **one canonical AOC wire representation** and a versioned schema so that the
representation can be safely imported at all. Schema versioning is basic serialization safety, not
interoperability.

Whether a *non-AOC* system can understand, map, translate, negotiate or consume these semantics —
W3C VC, DID, C2PA, SPDX, JSON-LD contexts, media-type registries, cross-protocol adapters — is a
different question, and none of it exists here. That is AOC.INTEROPERABILITY's contract.

### A migration, end to end

```
SOURCE APP                                   DESTINATION APP
  collect Subject X, Manifest(s),              AOC.PORTABILITY / import-bundle
  Claim(s), Standing(s)                          (no local subject needed)
        │                                            ▲
        ▼                                            │
  AOC.PORTABILITY / export-bundle ──► canonical JSON ─┘
        │                                            │
        └──► (optional) AOC.INTEGRITY over the string, both sides — same digest
                                                     │
                                                     ▼
                                 same Subject X, same supplied artifacts,
                                 persisted by the destination's own
                                 infrastructure if it chooses to
```

No source provider is required at any point, and nothing was reminted.

### Identity is not Integrity

The two are independently consumable, and neither depends on the other:

| Scenario | AOC.IDENTITY | AOC.INTEGRITY | Result |
| --- | --- | --- | --- |
| An external building, a token, an agent, an alien-namespace object | required | **not required** | a real `SovereignSubjectRef` and manifest with `contentIdentity` structurally absent |
| Loose bytes nobody has minted an identity for | **not required** | required | a real `ContentIdentity`, no subject anywhere |
| A photo that wants both | required | required, composed | a manifest carrying the digest Integrity produced |

An absent `contentIdentity` is *omitted*, never emitted as `undefined` and never fabricated from the
external reference, the locator or the manifest itself.

### Composing them

Composition runs through the public output of one and the public input of the other. Nothing links
them in code:

```ts
const integrity = createIntegritySovereigntyCapabilityImplementation();
const identity = createIdentitySovereigntyCapabilityImplementation();
const correlationId = 'photo-onboarding-001';

const measured = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('integrity')!,
    correlationId,
    input: { operation: 'compute-content-identity', bytes },   // no subject
  }),
  integrity,
);

const registered = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('identity')!,
    correlationId,
    input: { registrant, externalReference, contentIdentity: measured.output.contentIdentity },
  }),
  identity,
);

registered.output.manifest.contentIdentity;  // exactly what Integrity produced
registered.output.subject;                   // the subject Identity created
```

The two invocations share one `correlationId` and keep distinct `invocationId`s. Correlation is a
caller-chosen grouping: it implies no ordering, causality, dependency, workflow, policy or
authorization. Integrity never saw the subject; Identity never recomputed the digest.

### Evidence from the capsules

All three rely entirely on the common SM-03 invocation evidence, and none widens it. An Identity
evidence record names the newly created subject; an Integrity evidence record names a subject only if
the invocation supplied one; a Provenance evidence record names the subject the invocation carried,
since Provenance never creates one. None carries the raw input, the raw output, the bytes, the
manifest, the manifest digest, the `ContentIdentity`, the registrant payload, key material or
exception text.

Provenance evidence specifically excludes the claim it produced, the lineage graph it computed, the
issuer payload and any referenced evidence document. Those belong to the capability *output*, which
the caller already holds; evidence has to stay small enough and safe enough to hand to someone who is
not entitled to the payload.

No capsule populates `evidenceRefs`. A `ContentIdentity` is not automatically a `CanonicalEvidenceId`,
a `manifestDigest` is not automatically a stored artifact, a provenance claim is not automatically an
evidence-store record, and an unsigned manifest is not one either. With no real evidence storage or
resolution semantics in Protocol, leaving the field absent is the honest option — fabricating a
`CanonicalEvidenceId` from a digest, an invocation id or a subject id would be worse than empty.

### Status

The socket exists and **four of the eight** minerals now fill it. `AOC.IDENTITY`, `AOC.INTEGRITY`,
`AOC.PROVENANCE` and `AOC.PORTABILITY` are production capsules consuming the common invocation and
evidence architecture end-to-end, verified from a real `npm pack` tarball by all three fixtures in
`test-consumers/` — including the first four-mineral flow, in which Integrity measures bytes, Identity
mints the subject, Provenance asserts its origin, Portability exports the canonical bundle, and
Integrity digests the wire string identically on both sides of a transport.

The remaining four are **not** production capsules, and they do not become ones merely because four
now are:

| Mineral | Production capsule |
| --- | --- |
| Identity | **yes** |
| Integrity | **yes** |
| Provenance | **yes** — origin, authorship, derivation, contestation and lineage traversal |
| Portability | **yes** — canonical bundle export and import, provider-neutral, no reminting |
| Interoperability | not yet |
| Verifiability | not yet — strong signing and verification *primitives* exist in `@aoc/protocol/manifest`, but no capsule wraps them |
| Licensing & Terms | not yet |
| Governance Compatibility | not yet |

Their transfer, terms, verification and governance semantics belong to their own inputs and outputs —
never to this common contract. Adding a production capsule is not a capability-contract change:
capability versions remain `1.0.0`, and the canonical inventory remains eight. Derivation and lineage
are Provenance *semantics*, not a ninth mineral — there is no `AOC.LINEAGE`, `AOC.AUTHORSHIP`,
`AOC.DERIVATION` or `AOC.CUSTODY`. The portability bundle is likewise a Portability *contract*, not an
`AOC.BUNDLE` or `AOC.EXPORT` mineral. There is still no global implementation registry: a capsule is
passed explicitly to `invokeSovereigntyCapability`, and wiring several together is a future
composition concern.
