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

## Production capsules: all eight canonical minerals

**All eight** of the canonical minerals are now real implementations of the socket above, exported from
`@aoc/protocol/sovereignty-capabilities` and executed through `invokeSovereigntyCapability` like any
other implementation. They are plain factories with no import-time side effects, they register
themselves nowhere, and they expose no second entry point that would bypass the common result and
evidence semantics.

```ts
import {
  buildSovereigntyCapabilityInvocation,
  createIdentitySovereigntyCapabilityImplementation,
  createIntegritySovereigntyCapabilityImplementation,
  createInteroperabilitySovereigntyCapabilityImplementation,
  createLicensingTermsSovereigntyCapabilityImplementation,
  createPortabilitySovereigntyCapabilityImplementation,
  createProvenanceSovereigntyCapabilityImplementation,
  createVerifiabilitySovereigntyCapabilityImplementation,
  createGovernanceCompatibilitySovereigntyCapabilityImplementation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
} from '@aoc/protocol/sovereignty-capabilities';
```

All eight derive their advertised `capability` ref from the SM-01 registry, so none can drift from the
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

- **Claims are unsigned.** Provenance itself neither signs nor verifies: cryptographic attribution
  requires passing a claim through the existing signing primitives, and the resulting `SignedClaim` is
  then checked independently by `AOC.VERIFIABILITY` (SM-08), which verifies but never signs.
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
  payload hash, timestamps, digests — is preserved exactly and judged later by `AOC.VERIFIABILITY`, or
  by whoever else is entitled to.
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

Whether a receiving system can work out what arrived, which of its semantics that system
understands, and whether it can safely consume it is a different question. That is
AOC.INTEROPERABILITY's contract, documented below.

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

### AOC.INTEROPERABILITY

Answers exactly one question: *when a sovereign representation arrives somewhere else, can the
receiving system determine what it is, which of its semantics that system understands, which it does
not, and whether it can safely consume it?*

Two operations, and no more:

```
describe-bundle        canonical bundle       ─►  profile + descriptor
assess-compatibility   descriptor + support   ─►  compatibility report
```

The interoperability *data contracts* live in `@aoc/protocol/interoperability`; this capsule makes
describing and assessing ordinary capability invocations producing capability-attributed evidence —
the same split SM-06 uses between `@aoc/protocol/portability` and its capsule.

#### Portability versus Interoperability

| | Question | Answer |
| --- | --- | --- |
| **Portability** | Can the representation *move*? | a canonical bundle, and a parser that reconstructs it |
| **Interoperability** | Can the receiver *understand* what arrived, and assess whether it can consume it? | a profile, a descriptor, and a compatibility report |

Interoperability operates **beside** the portability bundle, never inside it.
`SovereigntyPortabilityBundleV1` is untouched: its six-field contract gained no `interop`, `profile`,
`mediaType`, `descriptor` or `compatibility` field, because adding one would mutate a completed
Portability contract, break its six-field invariant, change its deterministic serialization, and
couple two minerals that have no reason to be coupled.

#### Three artifacts, three different jobs

**The profile** is a static Protocol contract describing a *family* of representations: what an AOC
sovereign representation means, at all. It is the same value in every process, for every subject.

**The descriptor** describes one *concrete* bundle: what is actually present in it. "Representations
in this family may contain signed manifests and Derivation claims" is a profile statement; "this
bundle contains one unsigned manifest and one Derivation claim" is a descriptor statement. Collapsing
the two would leave a consumer unable to distinguish what the format allows from what arrived.

**The consumer support declaration** is supplied by the *receiving system*, stating what it
understands. The compatibility report is the comparison.

#### The canonical profile

```ts
AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1 = {
  schemaVersion: 'aoc-sovereignty-interoperability-profile/1',
  id:            'aoc:interoperability-profile:sovereignty-portability',
  version:       '1.0.0',
  mediaType:     'application/vnd.aoc.sovereignty-portability+json',
  representation: {
    schemaVersion:          'aoc-sovereignty-portability-bundle/1',   // the SM-06 constant
    canonicalizationProfile: 'aoc-canonical-json/1',                  // the canonical JSON constant
  },
  artifactKinds:         ['claim', 'manifest', 'signed-claim', 'signed-manifest', 'standing'],
  manifestArtifactKinds: ['manifest', 'signed-manifest'],
  claimArtifactKinds:    ['claim', 'signed-claim'],
  claimTypes:            ['Authorship', 'Derivation', 'Origin'],
  standingStatuses:      [...],
  semanticVocabulary:    AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY,
}
```

A consumer holding this document can read the profile id, the profile version, the wire media type,
the bundle schema, the canonicalization profile, the artifact kinds, the claim semantics and the full
semantic vocabulary **without inspecting AOC source code**. That is the principal machine-readable
output of SM-07.

The profile version is deliberately **not** the npm package version. The package version moves
whenever any part of `@aoc/protocol` changes; the semantics an external system negotiates against
must move only when those semantics do.

The representation constants are imported from SM-06 and the canonical JSON profile rather than
re-typed as literals, so the profile cannot describe a bundle schema the bundle no longer uses.

It is a frozen constant, not something a builder assembles per invocation: no clock, no environment
inspection, no capability discovery, and no `registerProfile` / `findProfile` / profile registry. One
canonical profile is what SM-07 needs; generalising to many before a second one exists would invent a
lookup problem Protocol does not have.

##### The media type

`application/vnd.aoc.sovereignty-portability+json` is an **AOC Protocol media-type identifier**. It
is *not* registered with IANA, and this constant claims no such registration. Its purpose is to let a
receiving system name the representation it is holding during negotiation. Protocol performs no HTTP
content negotiation, sets no header, reads no header and ships no server: the string is metadata.

##### What the profile deliberately does not contain

- **`implementedCapabilities`** — a representation profile describes semantics, never which capsules
  happen to be constructed inside some runtime. The canonical capability catalog and a given
  process's capability availability are different facts, and conflating them would let a consumer
  infer execution readiness from a document that knows nothing about any runtime.
- **Translation tables** — no `mapToW3C`, no `mapToC2PA`. The base profile is AOC-native.
- **Trust** — no score, confidence, reputation or `verifiedIssuer`.
- **Presentation** — no labels, icons or colours. Semantics, not UI.
- **Business rules** — no `billingTier`, `premiumFeature` or `requiredForCommercialUse`.
- **Storage** — no provider, endpoint or storage URI. The media type identifies the representation,
  never where a copy of one is kept.
- **`generatedAt` / `digest` / `signature`** — the profile is a constant, so a timestamp would be a
  lie; integrity or proof over its serialization is explicit composition with AOC.INTEGRITY or
  AOC.VERIFIABILITY.

#### The semantic vocabulary

A receiving system can read an AOC bundle's field names — `sovereignAssetId`, `contentIdentity`,
`assertedOrigin` — and still not know what any of them *mean*. Field names are not semantics.

`AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY` is the Protocol-owned statement of those meanings, built
from the **existing** `CanonicalSemanticVocabulary`, `CanonicalSemanticCategory` and
`CanonicalSemanticTerm` contracts in `@aoc/protocol/claims`. There is no `InteropSemanticTerm` and no
parallel semantic model: two semantic models for one Protocol is how two descriptions of one concept
start to disagree.

Ten terms under the `aoc.sovereignty` namespace, grouped by the mineral whose contract they belong
to:

| Category | Terms |
| --- | --- |
| Identity Semantics | Sovereign Subject, Sovereign Asset Identity, External Reference, Sovereign Manifest |
| Integrity Semantics | Content Identity |
| Provenance Semantics | Origin Assertion, Authorship Assertion, Derivation Assertion, Claim Standing |
| Portability Semantics | Portable Sovereign Representation |

Descriptions are factual and mineral-boundary-safe. *Content Identity* says it is "not the sovereign
identity"; *Derivation Assertion* says it "establishes no legal authorization"; *Claim Standing* says
it "neither removes the claim nor settles the dispute it describes".

The vocabulary describes meaning and does nothing else, preserving the behaviour-free philosophy the
claims-layer contracts were written under. Nothing in it classifies runtime data, resolves an
ontology, walks a graph, scores confidence, derives authority, evaluates a rule or reaches a
conclusion. Every id is an explicit, stable Protocol constant — nothing is minted at import time,
because a vocabulary whose term ids changed per process could never be referenced from a claim, a
support declaration or a report.

It is **not** a ninth mineral. There is no `AOC.SEMANTIC_VOCABULARY`, and the canonical inventory
stays at eight — the vocabulary supports AOC.INTEROPERABILITY the same way the portability bundle
supports AOC.PORTABILITY.

#### The representation descriptor

```ts
SovereigntyInteroperabilityDescriptorV1 {
  schemaVersion: 'aoc-sovereignty-interoperability-descriptor/1';
  profile:       { id; version };            // versioned reference, never a bare name
  mediaType;
  subject:       SovereignSubjectRef;        // the bundle's own, passed through
  representation: { schemaVersion; canonicalizationProfile };
  present: {
    manifestArtifactKinds;   // 'manifest' | 'signed-manifest', unique + sorted
    manifestVersions;        // historical manifestVersion values, ascending
    claimArtifactKinds;      // 'claim' | 'signed-claim', unique + sorted
    claimTypes;              // Origin | Authorship | Derivation, unique + sorted
    standingStatuses;        // verbatim, unique + sorted
    semanticRequirements;    // { namespace, termRef }, unique + sorted
  };
}
```

The descriptor is **not a copy of the bundle**. Manifests, claims, standings, proofs, digests,
statements, evidence references and metadata are never duplicated into it: it reports which semantic
shapes are present, and the bundle carries the data. A descriptor that inlined the payload would be a
second representation of the same sovereign facts, free to drift from the first, and would leak that
payload into every place a description was safe to send.

There is deliberately **no `descriptorId`** and **no `describedAt`**. A descriptor is a deterministic
description of an existing representation, not a new sovereign object with an owner and a lifecycle,
and describing the same bundle twice must produce the same value. *When* a description was produced
is recorded truthfully in the SM-03 invocation evidence.

`manifestVersions` is *historical manifest version* information about the subject — the versions of
its record that travelled. It is not the manifest schema version, the bundle schema version or the
profile version, each of which is a single value elsewhere in the document.

A **subject-only** bundle is describable, and its feature arrays are simply empty. An external system
still learns that it is holding an AOC sovereign subject representation.

Wrapper kind and semantic type are independent facts, and both are reported. A signed `Derivation`
contributes `signed-claim` to `claimArtifactKinds` and `Derivation` to `claimTypes`. A manifest's
*embedded* `originClaim` and `authorityClaims` contribute their semantic concepts, but are never
promoted into `claimArtifactKinds` or `claimTypes`: an embedded assertion is part of the manifest, not
a separately presented claim artifact.

##### Semantic requirements: concept identity, not occurrence identity

Where artifacts carry `semanticRefs`, the descriptor extracts the concepts a consumer must understand
as `{ namespace, termRef }`:

```ts
InteroperabilitySemanticRequirement { namespace; termRef }
```

This does not replace `CanonicalSemanticRef` — it is a compatibility requirement extracted *from*
one. The distinction is the whole point: `CanonicalSemanticRef.id` identifies one *occurrence* of a
reference, the particular pointer sitting on one particular claim, while `namespace` + `termRef`
identify the *concept* being pointed at. Two refs `{id: 'ref-a', namespace: 'x', termRef: 't'}` and
`{id: 'ref-b', namespace: 'x', termRef: 't'}` are the same requirement, listed once. Requirements
union across every supplied artifact, deterministically ordered, and the source refs are never
mutated or resolved.

If a representation carries no semantic refs, it imposes no semantic requirements, and that dimension
is satisfied. No requirement is invented to have something to check.

#### The consumer support declaration

```ts
SovereigntyInteroperabilityConsumerSupportV1 {
  schemaVersion: 'aoc-sovereignty-interoperability-support/1';
  profile: { id; acceptedVersions };
  mediaTypes;
  representationSchemaVersions;
  canonicalizationProfiles;
  artifactKinds;
  claimTypes;
  standingStatuses;
  semanticTerms;    // { namespace, termRef }
}
```

**Explicit declaration, never inference.** AOC never derives this from a user-agent, a package name,
an installed dependency, a runtime version, a browser, a request header or a provider — every one of
those would be Protocol guessing at semantic understanding from an operational signal. "This system
has `@aoc/protocol` installed" is not the same fact as "this system understands Derivation
assertions".

**Never fetched.** No well-known URL, no DID document lookup, no service discovery, no registry, no
DNS. Support is caller input. A convenience layer that retrieves a declaration over the network can be
built later, on top, without changing what the declaration means.

**No consumer identity.** There is no `consumerId`, `application`, `tenant`, `company` or `user`.
Compatibility is a relation between what a representation requires and what a consumer declares —
*who* is asking changes nothing about the answer.

**Fails closed, and never cleans.** A malformed declaration is rejected rather than repaired: nothing
trims a blank entry, drops an unrecognised artifact kind, coerces a value, or deduplicates a repeated
one. Silently cleaning a dirty declaration would mean assessing compatibility against a document the
consumer never wrote, and reporting the result as if it had. Duplicates are rejected for the same
reason a duplicate manifest version is rejected by the SM-06 bundle: `['claim', 'claim']` is
ambiguous input, not emphasis. Callers wanting normalization use
`buildSovereigntyInteroperabilityConsumerSupportV1`, which sorts and deduplicates *their own* input
before it becomes a contract.

Profile versions are matched **exactly**. A consumer that accepts `1.0.0` is not assumed to accept
`2.0.0`, and one that accepts `2.0.0` is not assumed to accept `1.0.0`. No "closest version" is
chosen. Exact matching is sufficient for v1 and adds no dependency; when the profile grows a second
same-major version, `acceptedVersions` is where that widening is declared, additively.

#### The compatibility report

```ts
SovereigntyInteroperabilityCompatibilityReportV1 {
  schemaVersion: 'aoc-sovereignty-interoperability-report/1';
  status: 'compatible' | 'partially-compatible' | 'incompatible';
  core: { profile; mediaType; representationSchema; canonicalizationProfile };
  unsupportedArtifactKinds;
  unsupportedClaimTypes;
  unsupportedStandingStatuses;
  unsupportedSemanticTerms;
  reasonCodes;
}
```

##### Core versus feature requirements

| | Requirement | Missing means |
| --- | --- | --- |
| **Core** | interoperability profile id + version | `incompatible` |
| | media type | `incompatible` |
| | portability bundle schema | `incompatible` |
| | canonicalization profile | `incompatible` |
| **Feature** | artifact kinds present | `partially-compatible` |
| | claim types present | `partially-compatible` |
| | standing statuses present | `partially-compatible` |
| | semantic concepts required | `partially-compatible` |

Core means: without this, the consumer cannot read the representation as the representation it is. A
consumer that supports `application/json` but not the AOC media type is **incompatible** — generic
JSON support is never read as semantic support. A consumer that can parse JSON but does not declare
`aoc-canonical-json/1` is likewise incompatible: canonical wire semantics matter.

Feature gaps are computed whether or not core support holds, so an `incompatible` result still tells
a consumer which features it would *also* have been missing.

```
FULL          consumer understands the profile, the wire form, and every artifact kind, claim
              type, standing status and semantic concept actually present

PARTIAL       core representation understood, but one or more represented features are not

INCOMPATIBLE  one or more core representation requirements are unsupported
```

##### Partial never authorizes data loss

This is the critical point. `partially-compatible` means *"the consumer reports incomplete semantic
understanding"*. It does **not** mean "drop the unsupported artifacts and continue".

Protocol produces no reduced bundle, strips nothing, downgrades nothing and projects nothing. There
is no `stripUnsupportedArtifacts`, no `downgradeBundle`, no `convertToSupportedSubset` and no
`bestEffortImport`. After a partial report, the bundle, its canonical wire form and the descriptor are
byte-for-byte what they were. Whether to reject the representation, keep the unsupported parts as
opaque data, ask for a translation, or proceed knowingly is the **caller's** decision — silently
making it for them is how sovereign data disappears in transit.

An unsupported `Derivation` is reported as unsupported. It is not rewritten into `ClaimType.Custom`
and it is not discarded.

##### Explicit, never scored

There is no "80% compatible", no `0.74` match and no confidence value. A consuming system cannot act
responsibly on a number: it needs to know *which* semantics it does not understand. The result is an
enumerated status plus concrete, deterministically sorted gaps and stable reason codes:

```
INTEROPERABILITY_UNSUPPORTED_PROFILE
INTEROPERABILITY_UNSUPPORTED_MEDIA_TYPE
INTEROPERABILITY_UNSUPPORTED_REPRESENTATION_SCHEMA
INTEROPERABILITY_UNSUPPORTED_CANONICALIZATION_PROFILE
INTEROPERABILITY_UNSUPPORTED_ARTIFACT_KIND
INTEROPERABILITY_UNSUPPORTED_CLAIM_TYPE
INTEROPERABILITY_UNSUPPORTED_STANDING_STATUS
INTEROPERABILITY_UNSUPPORTED_SEMANTIC_TERM
```

Reason codes and every unsupported array are explicitly sorted, so `Set` iteration order can never
define public output. The same descriptor and the same support declaration always produce the same
report: no `reportId`, no `assessedAt`, no random value.

#### Incompatibility is not execution failure

A caller asks: *"is consumer C compatible with descriptor D?"* Interoperability determines the answer:
*"no."* That is a **successful assessment**.

| Outcome | SM-03 result | report status |
| --- | --- | --- |
| Consumer understands everything present | `succeeded` | `compatible` |
| Consumer understands the core but not every feature | `succeeded` | `partially-compatible` |
| Consumer does not understand the core | `succeeded` | `incompatible` |
| Descriptor malformed | `failed` | *(none)* |
| Support declaration malformed | `failed` | *(none)* |
| Bundle malformed | `failed` | *(none)* |
| Explicit invocation subject ≠ representation subject | `failed` | *(none)* |

This mirrors the Integrity pattern: an Integrity check that correctly reports a digest mismatch has
successfully checked. Returning a capability failure for an ordinary incompatibility would make "the
question could not be answered" indistinguishable from "the answer was negative".

#### Subjectless description

`describe-bundle` works with **no** `invocation.subject`, and that is load-bearing: the receiving
application usually has no local record of the subject yet, which is the ordinary case for a bundle
that arrived from somewhere else. On success the outcome returns `bundle.subject`, so the common
result and evidence resolve onto the subject the representation is about. Nothing is minted — it is
the same `SovereignAssetId` the exporting runtime had.

Supplying `invocation.subject` asserts that the bundle is expected to be about exactly that
reference. It is checked for **exact** SM-02 equality, never reconciled: the same `SovereignAssetId`
under a different external reference is a mismatch, and no winner is picked.

#### Boundaries Interoperability holds

- **Verifiability.** `verifySignedClaim`, `verifySovereignManifest` and `verifySovereignSignature`
  are never called. A descriptor may report that a `signed-claim` is present and that its underlying
  type is `Derivation`; it never reports that the signature holds. Understanding what an artifact
  *claims to be* is Interoperability; establishing whether its proof is *authentic* is Verifiability.
- **Integrity.** `computeContentIdentity` and `computeManifestDigest` are never called and no digest
  is repaired. Describing that a representation canonicalizes under `aoc-canonical-json/1` is
  describing integrity metadata, not producing it.
- **Identity.** `mintSovereignAssetId` is never called, on either operation.
- **Provenance.** Describing a `DerivationClaim` asserts nothing about derivation. No claim, standing
  or lineage is built.
- **Portability.** The Portability *contract* is reused — the bundle type and its validator — because
  describing a representation requires knowing what a valid one is. The AOC.PORTABILITY *capsule* is
  never invoked: `invokeSovereigntyCapability` does not appear in this source at all, so composing
  minerals stays the caller's decision, visible in the caller's own evidence.
- **Governance.** A report never says allow, deny, approve, reject, grant or enforce. What an
  application does with an incomplete understanding belongs to the application or Enterprise layer.
- **Trust.** No trust score, confidence, reputation, authority level or `verifiedIssuer`. A system can
  perfectly understand a claim it has every reason to distrust: understandable ≠ trusted, and
  compatible ≠ true.
- **Ownership.** Understanding a representation says nothing about who owns the subject, who
  presented it, or who the issuer is.
- **The outside world.** No fetch, no filesystem, no database, no persistence, no dynamic code
  execution, no key material. Both operations are pure functions of their inputs.
- **The subject's domain.** No namespace, asset type or business domain is read. A physical property,
  an external token, an autonomous agent, an API resource and a subject from a system nobody has heard
  of all describe through exactly the same architecture, differing only in their data.

#### A cross-system negotiation, end to end

```
SOURCE SYSTEM                              RECEIVING SYSTEM

  AOC.PORTABILITY / export-bundle            AOC.PORTABILITY / import-bundle
        │                                          ▲   (no local subject needed)
        ▼                                          │
  canonical bundle ──────► transport (JSON) ───────┘
                                                   │
                                                   ▼
                                     AOC.INTEROPERABILITY / describe-bundle
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                            canonical profile            bundle descriptor
                       (id, version, media type,      ├── representation schema
                        bundle schema, canonical      ├── artifact kinds present
                        JSON profile, artifact        ├── claim types present
                        kinds, claim types,           ├── standing statuses present
                        semantic vocabulary)          └── semantic requirements
                                     └─────────────┬─────────────┘
                                                   ▼
                                        consumer support declaration
                                        (supplied by the receiver)
                                                   │
                                     AOC.INTEROPERABILITY / assess-compatibility
                                                   │
                        ┌──────────────────────────┼──────────────────────────┐
                        ▼                          ▼                          ▼
                   COMPATIBLE            PARTIALLY COMPATIBLE            INCOMPATIBLE
              understands everything    understands the core,       does not understand
                   present              not every feature —          the bundle schema,
                                        nothing is dropped           media type, profile
                                                                     or canonicalization
```

Nothing was translated, nothing was verified, nothing was adjudicated and nothing was discarded.

#### External standard mappings are deferred

W3C Verifiable Credentials, DIDs, C2PA, SPDX, CycloneDX, JSON-LD contexts, Open Badges, XACML,
OPA/Rego, Cedar and chain metadata are **not implemented**, in any form. No adapter, no translation
table, no mapping, and no dependency on any of them.

That does not make SM-07 incomplete. Those are mappings *between* AOC semantics and someone else's;
they presuppose a stable, self-describing statement of what AOC semantics *are*, which is what this
capsule establishes. Each may later become an optional mapping profile, an adapter, or an ecosystem
bridge — layered on top of this handshake, never in place of it. Regulated-sector profiles (health,
finance, public sector) are deferred on the same basis.

There is deliberately no adapter framework to hang them on yet: no `registerInteropAdapter`, no
adapter marketplace, no global translation registry, no schema-bridge registry and no dynamic adapter
discovery. Building the mutable plugin surface before the stable semantic handshake would be building
the extension point before the thing being extended.

#### JSON Schema

The repository publishes no JSON Schema files for any contract today, and SM-07 does not invent a
parallel schema system for its four. The interoperability contracts are validated by the runtime
validators described above. Publishing stable JSON Schemas at versioned URIs remains the documented
direction in `docs/architecture/versioning-strategy.md`, and is future interoperability hardening
across the whole contract surface rather than a per-capsule concern.

#### Profile evolution

Future profile versions follow the existing repository versioning strategy: an explicit
`schemaVersion` on every document, additive change wherever it is safe, unsupported profile schemas
and major versions rejected rather than best-effort read, no field repurposing, and stable
identifiers. A future version may add claim types, artifact kinds, external mapping metadata or
sector vocabularies without redefining any meaning established here.

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

## AOC.VERIFIABILITY

Answers exactly one question: *given a sovereign artifact and the proof attached to it, can an
independent party determine whether that proof is cryptographically and structurally sound?*

It is the sixth of the canonical eight to become a real implementation of the SM-03 socket. The
cryptographic primitives it consumes already existed in `@aoc/protocol/manifest` —
`verifySovereignManifest`, `verifySignedClaim` and `verifySovereignSignature`. SM-08 does not add
cryptography; it exposes the cryptography Protocol already owns through the common capability socket,
so a consumer holding only the published package can ask the question and get an answer that is
capability-attributed, machine-readable, and honest about what it did *not* check.

| | |
| --- | --- |
| Input | `VerifiabilitySovereigntyCapabilityInput` — a closed union discriminated on `operation` |
| Output | `VerifiabilitySovereigntyCapabilityOutput` — a matching closed union of verification reports |
| Subject before | optional on every operation |
| Subject after | the artifact's own subject for manifest and claim verification; absent for generic proofs |
| Factory | `createVerifiabilitySovereigntyCapabilityImplementation({ verificationKeyResolver? })` |

### Three operations, deliberately

| Operation | Target | Report |
| --- | --- | --- |
| `verify-signed-manifest` | `SignedSovereignManifest` | structure, manifest digest, signature, content digest, issuer binding |
| `verify-signed-claim` | `SignedClaim` over an Origin, Authorship or Derivation claim | claim structure, claim digest, signature, issuer binding |
| `verify-sovereign-proof` | any canonicalizable payload + a `SovereignProof` | valid / invalid with a stable reason |

That is the whole surface. There is deliberately **no** `generate-key-pair`, `sign-manifest`,
`sign-claim` or `sign-payload` operation — see "Verification-first" below.

```ts
import {
  buildSovereigntyCapabilityInvocation,
  createVerifiabilitySovereigntyCapabilityImplementation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
} from '@aoc/protocol/sovereignty-capabilities';

const verifiability = createVerifiabilitySovereigntyCapabilityImplementation();

const result = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: getSovereigntyCapabilityRefByKey('verifiability')!,
    input: { operation: 'verify-signed-manifest', signedManifest },
    // no subject: the artifact carries its own
  }),
  verifiability,
);

result.output.verification;
// {
//   valid: true,
//   checks: {
//     manifestStructure: 'valid',
//     manifestDigest:    'valid',
//     signature:         'valid',
//     contentDigest:     'not_performed',   // <- the Integrity boundary, reported
//     issuerBinding:     'not_performed',   // <- no resolver was configured
//   },
//   reasons: [],
// }
result.subject;            // the manifest's own subject — nothing was minted
result.evidence.outcome;   // 'succeeded'
```

### What a passing verification establishes

At most:

> The holder of the private key matching the proof's public key signed this canonical payload — and,
> when `issuerBinding` is `verified`, the resolver the caller supplied binds that key id to the
> asserted issuer.

Nothing else. In particular:

```
signature valid           ≠  assertion true
digest valid              ≠  legal ownership
issuer key bound          ≠  issuer factually correct
cryptographically valid   ≠  uncontested
verification result       ≠  governance decision
```

A signature does not establish that the assertion is historically true, that the issuer owns the
subject, that a derivation was authorized, that copyright or a licence exists, that a court would
accept the claim, that the key has not been revoked, or that any system should act on it. Those
distinctions are held in the code, the types, the reason codes and the tests, not only in this
paragraph.

### Verification-first: no signing, no private keys

The capsule verifies and never produces proofs, and that is a design decision rather than missing
work. A production signer needs an explicit key-management architecture, and the SM-03 invocation
input is a *generic transport shared by every capability* — turning it into a carrier for
`privateKeyPem`, seed phrases, KMS secrets or wallet secrets would solve the wrong problem and put key
material somewhere no capability contract should put it.

So: no operation accepts private key material in any spelling, nothing here calls
`generateSovereignKeyPair`, and nothing here calls `signSovereignManifest`, `signClaim` or
`signSovereignPayload`. All of those primitives remain public, unchanged and directly usable by
issuers, fixtures and applications that have their own key management — which is exactly how the test
suites and all three packed consumer fixtures produce the artifacts they then verify. A managed
signer/KMS abstraction is deferred rather than invented to fill the gap.

### `contentDigest` is `not_performed`, and that is the point

`verify-signed-manifest` accepts **no** content bytes. The underlying `verifySovereignManifest`
primitive supports them; this capsule calls it without them, and the resulting
`contentDigest: 'not_performed'` is the honest report of a check nobody asked for.

Accepting bytes here would make the mineral boundary read "Verifiability secretly performs Integrity".
A caller who wants both runs them side by side:

```
bytes ──► AOC.INTEGRITY      ──► content check      ┐
                                                    ├── one correlationId
signed manifest ──► AOC.VERIFIABILITY ──► proof check ┘
```

Nothing in this module ever turns `not_performed` into `valid`, or reports a `contentVerified` flag. A
manifest that genuinely carries a `ContentIdentity` still reports `contentDigest: 'not_performed'`,
because the bytes were never supplied and never asked for.

### Issuer binding is optional, and three-state

A `SovereignProof` carries its own `publicKey`, so cryptographic self-consistency can be checked
entirely offline. Binding a key to an *issuer* requires knowledge Protocol does not have, so the
resolver is injected — never discovered, never global, never defaulted.

| Configuration | `issuerBinding` | Execution |
| --- | --- | --- |
| no resolver | `not_performed` | succeeded |
| resolver returns a descriptor whose `keyId` matches the proof | `verified` | succeeded |
| resolver returns `undefined`, or a descriptor with a different `keyId` | `unverified` | succeeded, verification invalid |
| resolver throws | — | **failed**, `VERIFIABILITY_KEY_RESOLUTION_FAILED` |

"Not checked" and "checked and did not bind" are different facts, and collapsing them to a boolean
would lose the one that matters. A resolver fault is a *dependency fault*, not a negative
cryptographic result: returning a partial report whose binding line silently meant "the key service
fell over" would be read as "the key did not bind". Exactly one resolver attempt is made per required
binding — no retry, no backoff, no fallback resolver, and no raw exception text, stack or credential
reaches the result or the evidence.

Binding is a **key relationship** and nothing more. It is not ownership, not legal identity, not KYC,
not a certificate chain, and not a statement that the key is currently valid or unrevoked.

Signature validity and issuer binding are independent dimensions, and all four combinations are
expressible:

```
signature valid   + binding verified       ->  valid
signature valid   + binding not_performed  ->  valid   (binding was never claimed)
signature valid   + binding unverified     ->  invalid
signature invalid + binding verified       ->  invalid
```

### Invalid artifact vs unreadable invocation

This distinction is load-bearing:

| Situation | Outcome |
| --- | --- |
| bad signature, digest mismatch, malformed claim, unsupported proof algorithm, unsupported canonicalization profile, non-canonicalizable payload, unverified binding | **succeeded** execution, `verification.valid === false` |
| missing `signedClaim`, unknown `operation`, input that is not an object, a subject that is not the artifact's, a resolver fault | **failed** execution with a `VERIFIABILITY_*` reason code |

An artifact that can be inspected and is invalid is a *question that was answered*, exactly as an
Integrity digest mismatch has successfully checked and an Interoperability incompatibility has
successfully assessed. Capability failure is reserved for input that cannot be read at all. The input
validator therefore checks only enough wrapper structure to hand the target to the real verifier
safely — it never requires the inner manifest or claim to be *valid*, because an invalid one is
precisely a legitimate verification target.

### Signature over a malformed claim

An issuer can cryptographically sign malformed data, so the claim report keeps structure and
cryptography as independent dimensions:

```
claimStructure: 'invalid'    // the claim violates its canonical shape
claimDigest:    'valid'      // it hashes to what SignedClaim.digest says
signature:      'valid'      // the issuer really did sign exactly this
valid:          false
reasons:        ['INVALID_ASSERTED_ORIGIN']
```

`verify-signed-claim` reuses the real runtime validators — `validateOriginClaim`,
`validateAuthorityClaim`, `validateDerivationClaim` — dispatched on `claim.type`, and a claim type with
no runtime validator is reported as `UNSUPPORTED_SOVEREIGN_CLAIM_TYPE` rather than waved through on the
strength of a passing signature.

### Subject semantics

| Operation | Invocation subject absent | Invocation subject present |
| --- | --- | --- |
| `verify-signed-manifest` | returns the manifest's own `SovereignSubjectRef` | must be **exactly** equal (SM-02 rules, external reference included), else `VERIFIABILITY_SUBJECT_MISMATCH` |
| `verify-signed-claim` | returns `{ sovereignAssetId: claim.subject }` | its `sovereignAssetId` must equal `claim.subject`; the invocation's own external reference is what survives |
| `verify-sovereign-proof` | no subject at all | preserved purely as attribution context |

Attribution survives a negative result: an artifact whose signature does not verify is still
identifiably about subject X, so a failed verification does not erase the subject. Conversely, nothing
is fabricated — a claim whose subject is not a valid `SovereignAssetId` yields no subject rather than a
minted one, and a generic payload is never inspected for `sovereignAssetId`, `subject` or `id`, because
guessing a schema is how a proof check quietly becomes an identity claim.

A claim carries sovereign identity, not the subject's current external reference. That is why the claim
match rule is sovereign-identity equality only, and why no external reference is ever invented from a
claim.

### Reason codes: two layers, kept apart

**Verification-result reasons** explain why a verification that ran came back negative. These are the
underlying primitives' own codes, preserved verbatim rather than renamed or re-prefixed:
`MANIFEST_DIGEST_MISMATCH`, `SIGNATURE_INVALID`, `PROOF_PAYLOAD_HASH_MISMATCH`, `CLAIM_DIGEST_MISMATCH`,
`CLAIM_SIGNATURE_INVALID`, `ISSUER_BINDING_UNVERIFIED`, the `INVALID_CLAIM_*` structural codes, plus the
capsule-owned `VERIFIABILITY_PAYLOAD_NOT_CANONICALIZABLE` and
`VERIFIABILITY_SOVEREIGN_PROOF_INVALID`.

**Capability-failure reasons** explain why the operation could not execute:
`VERIFIABILITY_INVALID_INPUT`, `VERIFIABILITY_UNSUPPORTED_OPERATION`, `VERIFIABILITY_SUBJECT_MISMATCH`,
`VERIFIABILITY_INVALID_SIGNED_MANIFEST_TARGET`, `VERIFIABILITY_INVALID_SIGNED_CLAIM_TARGET`,
`VERIFIABILITY_INVALID_GENERIC_PROOF_TARGET`, `VERIFIABILITY_KEY_RESOLUTION_FAILED`.

### Determinism

A verification report is a deterministic function of its inputs: the same artifact and the same
resolver answer produce the same report. It carries no `verifiedAt`, `checkedAt`, `generatedAt`,
`reportId` or `verificationId` — *when* a verification happened, and under which invocation, is
recorded truthfully in the SM-03 invocation evidence instead, and the report itself is never signed.
There is no recursion: a consumer wanting a proof over a verification report uses
`signSovereignPayload` externally.

### Boundaries Verifiability holds

- **Signing and keys.** No signing operation, no key generation, no key storage, no rotation, no PKI,
  no global key registry, no trusted key store, no `generateSovereignKeyPair`, no private key field.
- **Cryptography.** No second canonicalizer, SHA implementation, Ed25519 verifier, base64url decoder or
  signature engine. `aoc-canonical-json/1` + SHA-256 + Ed25519 remain the only profile: no secp256k1,
  ECDSA, RSA, BLS, P-256, Keccak, SHA-3, multihash, `personal_sign`, EIP-712 or chain signature format
  is interpreted, and no new cryptographic dependency is added.
- **Integrity.** No content bytes are accepted, hashed or compared, and `computeManifestDigest` is not
  called to "fix" anything.
- **Identity.** `mintSovereignAssetId` is not called. An imported signed manifest already contains its
  `SovereignAssetId`.
- **Provenance.** No claim, standing or lineage is created. A valid signature over a `DerivationClaim`
  proves the issuer asserted the derivation, never that it happened.
- **Standing.** No `StandingStatus` is read or written and `contestClaim` is not called. A
  cryptographically valid claim can be `Contested` at the same moment, and both facts coexist without
  either adjudicating the other.
- **Records.** No `CanonicalVerification` is created — a cryptographic check is not a verifier's
  assessment of whether a claim is *true* — no `VerificationStatus` member is added or assigned, no
  `VerificationProvider` is required, and nothing is persisted.
- **Revocation.** No `RevocationLookup`, OCSP, CRL, credential status or chain query. A `verified`
  binding does **not** imply a non-revoked key.
- **Trust chains.** No X.509, CA path, DID resolution (`did:key`, `did:web`), web of trust or trust
  registry. A binding is only as authoritative as the resolver the caller injected.
- **Time.** `proof.signedAt` is preserved and read, never turned into an expiry, freshness or
  key-validity-window rule that no canonical primitive owns. A resolver descriptor's `validFrom` /
  `validUntil` are not evaluated in v1.
- **Scoring.** No trust, confidence, credibility, reputation, assurance or risk score. Every check
  reports `valid` / `invalid` / `not_performed`.
- **Deciding.** No allow, deny, approve, reject, grant, block or enforce. A governance system may
  later require that verification passed; that is its policy.
- **Legal semantics.** No `legalOwnerVerified`, `copyrightVerified`, `authorizedDerivative`,
  `licenseValid` or `legalAuthorityConfirmed` field exists.
- **Mutation.** The manifest, claim, proof and payload are read and left exactly as they were. No public
  key is normalized, no `keyId` rewritten, no `payloadHash` repaired, no signature replaced, no artifact
  re-signed, and no canonicalized rewrite is returned as a "fixed" artifact. A broken proof stays broken.
- **Other minerals.** `invokeSovereigntyCapability` is not called here. Composition stays the caller's
  decision, visible in the caller's own evidence.
- **The outside world.** No filesystem, network, database, chain, RPC, wallet, provider or Enterprise
  code. Key material either travels inside the `SovereignProof` or comes from the injected resolver;
  how *that* finds a key is the adapter's concern.
- **The subject.** No namespace, asset type or business domain is branched on. An alien namespace, a
  property registry, an external token system, an AI agent and an API resource all verify through
  exactly the same architecture, and produce byte-identical reports.

### Verifiability alongside its neighbours

| Mineral | Question | Verifiability's relationship |
| --- | --- | --- |
| **Integrity** | Do these bytes match this declared content identity? | separate operation, separate invocation; `contentDigest: 'not_performed'` is the seam |
| **Provenance** | Who asserts what about this subject's origin and lineage? | Verifiability checks the signature on the assertion, never converts it into the assertion being true |
| **Portability** | Can this representation move? | Portability preserves proof material byte for byte; Verifiability checks it after transport, with an identical report |
| **Interoperability** | Can the receiver understand what arrived? | a descriptor reports that a `signed-claim` is *present*; it never reports that the signature holds |

`SovereigntyPortabilityBundleV1` is unchanged by SM-08 — its six-field contract gained no verification
field — and the SM-07 profile and descriptor are unchanged too: describing an artifact and verifying it
are different jobs, and a descriptor that started saying `verified-signature` because a capsule now
exists would be reporting a check it never ran.

Verifiability is also not a runtime *dependency* of any of them. A caller holding a `SignedClaim`
directly verifies it with no Identity, Portability or Interoperability invocation at all.

### What Verifiability does not yet cover

Production means the defined v1 contract is real and consumable — not that every verification problem
is solved. Still open, and deliberately not papered over:

- **Proof issuance is not a capability operation.** Signing remains available through the existing
  low-level primitives; managed signing and KMS integration are deferred.
- **No key lifecycle.** No generation, storage, rotation, escrow or recovery.
- **No revocation or credential status.** Issuer binding does not imply a currently valid key.
- **No certificate chain, PKI or DID resolution**, and no external wallet signature profiles.
- **No key validity-window policy**, because no existing canonical primitive defines one.
- **Issuer binding is optional**, and a resolver binding is only as authoritative as the resolver.
- **Only three claim types are structurally verified** — Origin, Authorship and Derivation — because
  those are the ones with real runtime validators.
- **Nothing is persisted.** No verification result is stored, no `CanonicalVerification` record is
  created, and claim standing is never altered.
- **Cryptographic validity is not truth.** Protocol reports what the mathematics says and stops there.

## AOC.LICENSING_TERMS

The seventh production capsule, added by SM-09. It answers:

> What permissions, restrictions and obligations does an issuer declare over this sovereign subject —
> in a structured, attributable, portable form another system can read?

```ts
import { createLicensingTermsSovereigntyCapabilityImplementation } from '@aoc/protocol/sovereignty-capabilities';

const licensing = createLicensingTermsSovereigntyCapabilityImplementation();
// licensing.capability → { id: 'aoc:sovereignty-capability:licensing-terms', version: '1.0.0' }
```

The reusable terms model lives on its own subpath, `@aoc/protocol/licensing`, so the schema, builder
and validators are usable without the capability socket — the same split SM-06 and SM-07 already make
between a contract layer and its capsule. A focused walkthrough of the model lives in
[`LICENSING_TERMS.md`](./LICENSING_TERMS.md).

### Declaration is not enforcement

This is the load-bearing boundary of the whole mineral, and it holds in every direction:

```
declared permission    ≠ runtime authorization
declared restriction   ≠ enforced denial
declared obligation    ≠ proof of compliance
signed license claim   ≠ legal validity
issuer declares rights ≠ issuer proven to hold rights
license terms          ≠ ownership transfer
license terms          ≠ policy decision
license terms          ≠ access grant
license terms          ≠ DRM
```

A `Permission`/`CommercialUse` clause means *"the issuer declares commercial use permitted under
these terms"*. It produces no `CapabilityGrant`, no `CapabilityToken`, no `AccessGrant`, no
credential, no signed URL, no ACL entry and no authorization result. A `Restriction` clause blocks no
request, deletes no file, revokes no URL, disables no playback and prevents no copy. An
`Obligation`/`Attribute` clause does not establish that attribution happened, and an `Obligation` to
pay does not establish that anyone paid.

```
                        AOC PROTOCOL
                    LicenseTermsClaim
                            │
                            ▼
                  portable declaration
                            │
        ────────────────────┼────────────────────  ← Protocol stops here
                            ▼
           External Governance / AOC Enterprise
                            │
                            ▼
                   policy interpretation
                            │
                            ▼
                        decision
                            │
                            ▼
                      enforcement
```

### Why `AuthorityClaimKind.License`, and not a new claim type

The claim architecture already had the right primitive. `AuthorityClaimKind` has carried
`Authorship`, `Rights`, `License` and `Custom` since the manifest layer was written, and SM-05
deliberately exposed only `Authorship` from the formal Provenance capsule — leaving `License` for
this mineral. SM-09 therefore adds **no** `ClaimType.License`, forks no `CanonicalClaim`, and
introduces no `LicenseClaimBase`, `TermsClaimBase`, `PermissionClaimBase` or `RestrictionClaimBase`.

What was genuinely missing was *structure*. A generic `AuthorityClaim` requires only a free-text
`statement`, which is not enough for a production Licensing & Terms capability, so
`metadata.terms` carries a versioned `SovereignLicenseTermsV1` document beside it.

`ClaimType.Authorization` is deliberately **not** the representation either.

| | means | is |
| --- | --- | --- |
| `ClaimType.Authorization` | "principal P is authorized to perform action A" | a conclusion about an actor |
| `LicenseTermsClaim` | "issuer I declares these permissions, restrictions and obligations over subject X" | a premise somebody else may reason from |

A declaration may later *inform* an authorization. It is not itself one, and collapsing the two would
make every stored declaration read as an evaluated verdict.

### Three operations, deliberately

```
declare-license-terms         terms over invocation.subject   -> LicenseTermsClaim
validate-license-terms        an unknown candidate            -> valid/invalid + reasons
contest-license-terms-claim   a licensing claim + a reason    -> the claim, unchanged, + Contested standing
```

That is the whole surface. There is deliberately no `evaluate-license`, `is-action-permitted`,
`is-action-restricted`, `isAllowed`, `isDenied`, `authorize-use`, `canUse`, `canDistribute`,
`canDerive` or `check-obligation` operation, and no condition language to write one with — no `and`,
`or`, `not`, comparison operator, expression tree, CEL, Rego, Cedar, JSON Logic or XACML. This is an
absolute boundary rather than deferred work.

`supersede-license-terms` is **not** implemented in v1 either. The standing model can already express
`Superseded`, but supersession implies precedence between declarations, and precedence deserves its
own explicit design rather than arriving as a side effect of a convenience operation.

### No precedence, ever

A document may declare a `Permission` and a `Restriction` over the identical action. Both are
structurally valid, both are recorded, and Protocol says only *"the issuer declared both"*. It does
not say commercial use is allowed, does not say it is denied, and does not decide that restriction
beats permission, that the latest claim wins, that a signed claim beats an unsigned one, that a
verified issuer beats an unverified one, or that a principal-specific document beats a public one.

A subject may carry many licensing declarations, from many issuers, with different dates, audiences
and contradictory terms. Nothing in Protocol resolves which is "current".

### No wall clock, no derived standing

`issuedAt`, `effectiveAt` and `expiresAt` are declaration *data*.

| Field | Lives on | Means |
| --- | --- | --- |
| `issuedAt` | `CanonicalClaim` | when the claim was asserted/recorded |
| `effectiveAt` | `SovereignLicenseTermsV1` | when the issuer says the terms begin applying |
| `expiresAt` | `CanonicalClaim` | when the declaration stops applying |

`issuedAt: 2026-08-18` with `effectiveAt: 2026-09-01` is an ordinary case, so `effectiveAt` is never
defaulted from `issuedAt` — absent means absent. There is no second expiration field inside the terms
document: `CanonicalClaim.expiresAt` is the one source of truth. Nothing compares any of them to now,
so there is no `isActive`, `isCurrentlyEffective`, `isExpiredNow` or `isNotYetEffective`, and no
`StandingStatus.Active` or `StandingStatus.Expired` is ever created. A future-effective declaration
is structurally valid; an expired historical declaration is structurally valid historical data. No
ordering between the three is enforced either, so a backdated correction and a retroactive licence
stay expressible.

### Invalid candidate vs unreadable request

The distinction matters, and the two are kept apart:

| Case | Execution | Report |
| --- | --- | --- |
| `validate-license-terms` over `{}` | **succeeded** | `validation.valid === false` |
| `declare-license-terms` with no rules | **failed** | `LICENSING_TERMS_RULES_REQUIRED`, and no partial claim |

Asking "is this valid?" and being told "no" is a successful execution: the capability answered the
question. Capability failure is reserved for input that cannot be read at all — an unknown operation,
a missing subject for a declaration, or a candidate about a different subject than the invocation.

Validation runs with **no** invocation subject at all, which is what lets a receiving system holding
only a document ask whether it is well formed; a valid candidate's own subject then becomes the
result's attribution, and an invalid one never has a subject fabricated for it.

### Crypto validity is not terms validity

An issuer can perfectly well sign a structurally malformed terms document. Both of these are true of
the same artifact at the same moment, and neither is wrong:

```
AOC.VERIFIABILITY   signature valid
AOC.LICENSING_TERMS terms invalid
```

The licensing capsule never signs — no operation accepts a private key, seed, mnemonic or KMS secret
in any spelling, and it calls no signing primitive. An issuer signs a returned claim with the existing
public `signClaim`, and AOC.VERIFIABILITY checks it. Tampering with a rule effect, a rule statement,
an audience or an action after signing is detected by Verifiability as a digest/signature failure, and
Licensing repairs nothing: it evaluates whatever structure it is actually handed.

Contestation composes the same way. A signed licensing claim that verifies stays byte-identical
through `contest-license-terms-claim`, so *cryptographically valid* and *Contested* coexist without
contradiction — the standing records that a challenge exists, not that anybody is right.

### Boundaries Licensing & Terms holds

- **Creates no identity.** `mintSovereignAssetId` is never called; `declare-license-terms` requires
  `invocation.subject` and accepts no `sovereignAssetId` of its own, so a claim can never disagree
  with the invocation it was made under.
- **Requires no content.** No bytes, no `ContentIdentity`, no manifest digest. Terms attach to
  sovereign subject *identity*, which is what lets a building, a parcel of land, an API resource, an
  AI agent, an external token and a physical painting receive terms exactly as a file does.
- **Creates no provenance.** No `OriginClaim`, authorship claim or `DerivationClaim` appears as a side
  effect. One declaration produces one licensing claim.
- **Inherits nothing.** Terms never travel along a derivation edge. There is no `inheritLicense`,
  `copyTerms`, `propagateRestrictions` or `propagateRights`, and a `Permission`/`Derive` clause on a
  parent does not give a child the parent's terms — the child needs its own declaration.
- **Concludes no ownership.** No `owner`, `legalOwner`, `copyrightOwner`, `titleHolder` or
  `beneficialOwner` field exists, and a manifest's `registrant` is never read as the licensing issuer:
  registering a subject and declaring terms over it are different acts, possibly by different parties.
  There is no `transfer`, `assign`, `convey`, `sell` or `title-transfer` operation.
- **Does no economics.** No price, currency, royalty rate, fee, revenue share, payment schedule,
  wallet or settlement address; no `calculateRoyalty`, `settleRoyalty`, `splitRevenue`, `invoice` or
  `meterUsage`; no billing, tax or jurisdiction engine. A payment expectation is expressible as an
  `Obligation` over an external action concept plus a `statement`, with the instrument referenced
  through `evidenceRefs` — and nothing is calculated or settled.
- **Does no DRM.** No encryption, watermarking, playback control, kill switch, remote disable or copy
  prevention.
- **Translates to no external standard.** No SPDX, Creative Commons, ODRL, RightsML or NFT-licence
  mapping. Those are adapters over this model, and inventing them here would bake somebody else's
  semantics into the Protocol contract.
- **Reaches nothing.** No filesystem, network, database, chain, provider, registry or resolver. An
  action term is an identifier and is never dereferenced, URL-shaped or not; a custom audience is
  never expanded into members.
- **Invokes no other mineral.** `invokeSovereigntyCapability` is not called from the capsule.
- **Branches on nothing.** No namespace, media type, filename, asset type or business domain is read,
  and even the core action concepts — `CommercialUse`, `Derive`, `Attribute` — trigger no distinct
  production behaviour.

### Licensing & Terms alongside its neighbours

| Mineral | Question | Licensing's relationship |
| --- | --- | --- |
| **Identity** | What is this subject? | required, never created; the claim's subject is the invocation's |
| **Integrity** | Do these bytes match? | irrelevant — a declaration needs no byte representation at all |
| **Provenance** | Where did it come from? | coexists over one subject; nothing is inferred in either direction, and nothing is inherited along a derivation edge |
| **Portability** | Can it move? | a `LicenseTermsClaim` is an `AuthorityClaim`, so the existing `claims` array carries it — unsigned as `claim`, signed as `signed-claim` |
| **Interoperability** | Can the receiver understand it? | the claim's `semanticRefs` surface the licensing concepts, which the unchanged SM-07 machinery discovers generically |
| **Verifiability** | Does the proof hold? | verifies a signed licensing claim; a valid signature says nothing about whether the terms are well formed, lawful or owned |

`SovereigntyPortabilityBundleV1` is **unchanged** by SM-09 — its six-field contract gained no
`licenses`, `terms` or `permissions` field — and the SM-07 profile, descriptor schema and core
`aoc.sovereignty` vocabulary are unchanged too. Licensing concepts live in their own `aoc.licensing`
namespace precisely so a later mineral shipping could not change what the interoperability profile
advertises.

### What Licensing & Terms does not yet cover

Production means the defined v1 contract is real and consumable — not that every licensing problem is
solved. Still open, and deliberately not papered over:

- **No evaluation, decision or enforcement**, in any form. That is the mineral's boundary, not a gap.
- **No precedence, supersession or current-terms resolution.**
- **No terms inheritance** across derivation.
- **No condition language.** Clause conditions live in the human-readable `statement` and are never
  parsed.
- **No money model.** No pricing, royalties, billing, settlement or tax.
- **No legal interpretation.** No jurisdiction model, no choice-of-law evaluation, no enforceability
  finding.
- **No external standard adapters** (SPDX, Creative Commons, ODRL, RightsML, NFT licences).
- **No principal validation beyond the structural floor.** `CanonicalPrincipalRef` still has no fully
  canonical runtime validator — the gap SM-04 and SM-05 recorded — and SM-09 documents rather than
  closes it.
- **A declaration is not a right.** Protocol records that an issuer declared terms; whether they had
  the authority to is outside what any offline structural check can establish.

## AOC.GOVERNANCE_COMPATIBILITY

The eighth and last production capsule, added by SM-10. It closes the canonical shelf, and it answers:

> What does an external governance system need in order to *address* and *interpret* this sovereign
> subject — and how does the Protocol supply it without becoming that governance system?

```ts
import { createGovernanceCompatibilitySovereigntyCapabilityImplementation } from '@aoc/protocol/sovereignty-capabilities';

const governance = createGovernanceCompatibilitySovereigntyCapabilityImplementation();
// governance.capability → { id: 'aoc:sovereignty-capability:governance-compatibility', version: '1.0.0' }
```

The reusable handoff model lives on its own subpath, `@aoc/protocol/governance-compatibility`, so the
schema, the resource projection, the builder and the validator are usable without the capability
socket — the same split SM-06, SM-07 and SM-09 already make between a contract layer and its capsule.
A focused walkthrough lives in [`GOVERNANCE_COMPATIBILITY.md`](./GOVERNANCE_COMPATIBILITY.md).

| | |
| --- | --- |
| Operations | `prepare-governance-handoff`, `validate-governance-handoff` |
| Produces | `SovereignGovernanceHandoffV1` (`aoc-sovereign-governance-handoff/1`) |
| Requires a subject | No — `prepare` derives it from the representation; an explicit one must match exactly |
| Reads the clock | No |
| Reaches outside | No — no network, filesystem, database, cache, registry, provider or chain |

### Governance compatible is not governed

This is the load-bearing boundary of the whole mineral, and of the Protocol:

```
governance compatible ≠ governed
handoff               ≠ decision
resource reference    ≠ grant
license terms         ≠ policy
claim                 ≠ authority
signature             ≠ authority
registrant            ≠ owner
issuer                ≠ owner
authority             ≠ decision
decision              ≠ enforcement
structural validity   ≠ policy sufficiency
```

A valid handoff does **not** mean ALLOW. It does **not** mean DENY. It does **not** mean approved. It
means the external governance system can stably address and interpret the Protocol representation.

```
                    AOC PROTOCOL

              Sovereign Subject
                     │
                     ▼
            Portable Representation
                     │
                     ├─────────────► Semantic Descriptor
                     │
                     ▼
             Canonical ResourceRef
                     │
                     ▼
          SovereignGovernanceHandoffV1
                     │
═════════════════════╪══════════════════════════════════════
                     │ Protocol ends
                     ▼
             External Governance
                     │
                     ▼
                   Policy
                     │
                     ▼
                  Decision
                     │
                     ▼
                Obligations
                     │
                     ▼
                   Grant
                     │
                     ▼
                Enforcement
```

### The handoff

Exactly six top-level fields, and a closed envelope — an unknown key such as `policy`, `decision`,
`grant`, `owner`, `authority`, `status`, `approval` or `governanceReady` makes the document invalid:

```ts
interface SovereignGovernanceHandoffV1 {
  readonly schemaVersion: 'aoc-sovereign-governance-handoff/1';
  readonly canonicalizationProfile: 'aoc-canonical-json/1';
  readonly subject: SovereignSubjectRef;                        // SM-02, reused
  readonly resource: ResourceRef;                               // canonical Protocol contract, reused
  readonly representation: SovereigntyPortabilityBundleV1;      // SM-06, unchanged
  readonly semantics: SovereigntyInteroperabilityDescriptorV1;  // SM-07, derived
}
```

There is deliberately no `handoffId`, no `generatedAt`, no `handoffDigest` and no `signature`. The
handoff is a deterministic projection of an existing subject, not a new sovereign object: the same
representation and tenant produce a byte-identical canonical handoff every time, *when* a projection
happened is recorded in the SM-03 evidence, and integrity or proof over the document is explicit
composition with AOC.INTEGRITY and AOC.VERIFIABILITY over its canonical serialization.

### The resource projection

```
resource.kind       = SOVEREIGN_GOVERNED_RESOURCE_KIND   ('aoc:sovereign-asset')
resource.id         = subject.sovereignAssetId
resource.tenantId   = the caller's explicit governance context, if any
resource.attributes = structurally absent in v1
```

One kind for every subject — a byte document, a physical painting, a plot of land, an external token,
an autonomous agent, an API resource and a subject from a system nobody has heard of all project
through the same code onto the same kind, and `subject.externalReference.namespace` is opaque. The id
is the sovereignty anchor, never a manifest digest, `ContentIdentity.digest`, external-reference id,
locator, CID, URL, provider id, database id, token address or registry record id: a subject that
changes provider, locator, bytes or manifest version is still the same sovereign subject, and a grant
keyed to a transient representation would silently detach the moment that representation changed.

`SOVEREIGN_GOVERNED_RESOURCE_KIND` is now Protocol-owned. The Asset Protocolization vertical froze the
same value as `PROTOCOLIZED_RESOURCE_KIND` in APV-02, explicitly as *temporarily* vertical-owned,
stating that promotion becomes appropriate once a second generic producer of sovereign-resource
references appeared. SM-10 is that producer, so there is now one authoritative definition. The
dependency direction is unchanged: Asset Protocolization may consume Protocol, never the reverse.

`tenantId` is optional, preserved exactly when supplied, rejected when blank, and **never** inferred —
no `'default'`, no `'public'`, nothing read from the subject namespace, the registrant, the issuer, an
environment variable or an Enterprise tenant. A specialized consumer may require one; narrowing a
generic Protocol contract is where that constraint belongs.

### Structural validity is not policy sufficiency

A structurally valid handoff may carry zero claims, no licence terms, unsigned artifacts, contested
standings, a `Permission` and a `Restriction` over the same action, cryptographic proofs that do not
hold, semantic requirements nobody recognises, and no tenant. Every one of those is a legitimate
sovereign state governance may need *in order to* decide.

- **Verifiability is not run, and is not hidden.** `prepare-governance-handoff` checks no signature,
  resolves no key and binds no issuer, so a representation carrying a tampered proof still prepares
  successfully — while `AOC.VERIFIABILITY`, invoked independently over the same artifact, honestly
  reports `valid: false`. Those two facts are supposed to coexist; conflating them would make "handed
  to governance" silently read as "cryptographically sound". A handoff never embeds an ephemeral
  verification result either, so its meaning cannot depend on when it was built.
- **Contested claims travel.** A `StandingStatus.Contested` standing stays exactly as it was. The
  dispute may be the entire reason a decision has to be made.
- **Contradictory terms travel.** SM-09 can represent a `Permission` and a `Restriction` over the same
  action; SM-10 carries both, with no winner, no precedence and no `resolvedTerms`.

There is consequently no `ready`, `governanceReady`, `sufficient`, `complete` or `allEvidencePresent`
flag anywhere: the Protocol cannot know what artifacts exist beyond the ones it was handed, and cannot
know what a policy it has never seen requires.

### Validation proves the descriptor belongs to the representation

`validate-governance-handoff` re-derives the canonical SM-07 descriptor from the handoff's own
representation, with SM-07's own pure helper, and compares it under `aoc-canonical-json/1`. A
descriptor that is individually well-formed and about the same subject, but that describes some
*other* bundle, is rejected with `GOVERNANCE_COMPATIBILITY_SEMANTICS_MISMATCH` — otherwise a
governance engine could be handed a materially incomplete picture that looked entirely valid.

An invalid *candidate* is an ordinary **successful** execution reporting `valid: false`, the same
pattern Integrity, Interoperability, Verifiability and Licensing & Terms already established. Nothing
is repaired: a re-pointed resource is reported, never rewritten to agree with the subject.

### What Governance Compatibility never does

- **Invoke another mineral.** `invokeSovereigntyCapability` is not called anywhere in it. The SM-06
  bundle validator and the SM-07 descriptor helper are reused as *pure libraries*, so one prepare
  produces exactly one evidence record rather than a hidden chain of them, and a caller may prepare a
  handoff directly without running Interoperability first.
- **Decide.** No `PolicyDecision`, no allow, no deny, no conditional, no default-deny and no
  default-allow. There is no `evaluate`, `authorize`, `decide`, `approve`, `grant` or `enforce`
  operation, and no condition language to write one with.
- **Produce authority.** `CanonicalCapability`, `CanonicalAuthority` and `CanonicalDecision` already
  exist in the Protocol and SM-10 auto-constructs **none** of them. Claims existing on a subject do not
  mean a governance capability exists; a registrant, a claim issuer, a licence issuer and a valid
  signature are none of them an authority; and an authority is not a decision. The trust chain
  `Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority →
  Decision` must not be jumped from its left half to its right half.
- **Grant or request access.** No `ScopedAccessRequest`, `CapabilityToken`, `CapabilityGrant`,
  `ConsentGrant` or `Delegation`. A handoff is object/state context; an access request is an
  actor/action event.
- **Translate terms into policy.** A declared `Permission` becomes no grant and no scope, a
  `Restriction` no deny, an `Obligation` no compliance status.
- **Infer ownership.** No `owner`, `legalOwner`, `titleHolder` or `registeredOwner` field exists
  anywhere in the surface, and none is derived from a registrant or an issuer.
- **Mint, hash or assert.** No `mintSovereignAssetId`, no content bytes, no digest computation, no
  origin, authorship or derivation claim.
- **Reach outside or persist.** No network, filesystem, database, cache, chain or provider SDK; no
  global registry and no import-time side effect. The handoff is returned, never stored.
- **Depend on the legacy policy runtime.** This is not the `protocol/policy` resource/evaluation
  model, and SM-10 rewrites none of it.

`SovereigntyPortabilityBundleV1` is unchanged — the handoff *wraps* Portability rather than extending
it, and no `governance-handoff` artifact kind exists, so a handoff can never contain a representation
containing a handoff. The SM-07 profile, descriptor schema and core `aoc.sovereignty` vocabulary are
unchanged too, and SM-10 adds no semantic vocabulary of its own: the handoff is a structural contract,
and the nested descriptor already describes the semantic content.

### What Governance Compatibility does not yet cover

Production means the defined v1 contract is real and consumable — not that governance is solved.
Still open, and deliberately so:

- **No governance policy, decision, authority resolution, obligation state, grant issuance,
  enforcement or revocation.** That is the mineral's boundary, not a gap.
- **No actor/action request evaluation.** The handoff is about an object and its state.
- **No `resource.attributes`** in v1.
- **No adapter** for OPA, Cedar, AWS IAM, Azure, a DAO or AOC Enterprise. The standardized handoff
  *is* the integration boundary; a mapping layer would be a consumer's concern, not the Protocol's.
- **No handoff persistence.** It is returned to its caller.
- **No payment, tokenization or legal adjudication.**

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

The socket exists and **all eight** minerals now fill it. `AOC.IDENTITY`, `AOC.INTEGRITY`,
`AOC.PROVENANCE`, `AOC.PORTABILITY`, `AOC.INTEROPERABILITY`, `AOC.VERIFIABILITY`,
`AOC.LICENSING_TERMS` and `AOC.GOVERNANCE_COMPATIBILITY` are production capsules consuming the common
invocation and evidence architecture end-to-end, verified from a real `npm pack` tarball by all three
fixtures in `test-consumers/` — including the full eight-mineral flow, in which Integrity measures
bytes, Identity mints the subject, Provenance asserts its derivation, Licensing & Terms declares
structured permissions, restrictions and obligations over it, a TEST-ONLY issuer signs the resulting
claim through the existing low-level primitives, Portability exports the canonical bundle, a second
runtime holding only the JSON string imports it, Interoperability describes what arrived, Verifiability
independently checks the transported proof, and Governance Compatibility projects the whole thing into
a `SovereignGovernanceHandoffV1` that an external consumer reads — addressing a stable
`aoc:sovereign-asset` resource, reading the semantics present in the representation, and reaching no
decision at all, because the Protocol ends there.

Every mineral is now a production capsule:

| Mineral | Production capsule |
| --- | --- |
| Identity | **yes** |
| Integrity | **yes** |
| Provenance | **yes** — origin, authorship, derivation, contestation and lineage traversal |
| Portability | **yes** — canonical bundle export and import, provider-neutral, no reminting |
| Interoperability | **yes** — self-describing profile, bundle descriptor, and full/partial/incompatible compatibility assessment |
| Verifiability | **yes** — signed manifest, signed claim and generic sovereign proof verification, with explicit per-check outcomes and optional issuer/key binding |
| Licensing & Terms | **yes** — structured, versioned terms declaration, validation and contestation, with no evaluation, precedence or enforcement |
| Governance Compatibility | **yes** — deterministic sovereign governance handoff and its validation, with no policy, decision, authority, grant or enforcement |

Adding a production capsule was never a capability-contract change: capability versions remain
`1.0.0`, and the canonical inventory remains exactly eight. Derivation and lineage
are Provenance *semantics*, not a ninth mineral — there is no `AOC.LINEAGE`, `AOC.AUTHORSHIP`,
`AOC.DERIVATION` or `AOC.CUSTODY`. The portability bundle is likewise a Portability *contract*, not an
`AOC.BUNDLE` or `AOC.EXPORT` mineral, and the interoperability profile, semantic vocabulary,
descriptor and compatibility report are Interoperability *artifacts* — there is no `AOC.COMPATIBILITY`,
`AOC.TRANSLATION`, `AOC.SCHEMA` or `AOC.SEMANTICS`. Cryptographic proof and signature semantics are
likewise Verifiability *semantics*, not a ninth mineral: there is no `AOC.CRYPTOGRAPHY`,
`AOC.SIGNATURE`, `AOC.TRUST`, `AOC.PROOF` or `AOC.KEYS`. The structured terms document, its licensing
vocabulary and its rule model are Licensing & Terms *artifacts* for the same reason — there is no
`AOC.LICENSE`, `AOC.RIGHTS`, `AOC.PERMISSION`, `AOC.RESTRICTIONS`, `AOC.ROYALTIES` or `AOC.DRM`. The
governance handoff and its `ResourceRef` projection close the list the same way — they are Governance
Compatibility *artifacts*, so there is no `AOC.GOVERNANCE`, `AOC.POLICY`, `AOC.AUTHORITY`, `AOC.GRANT`,
`AOC.ACCESS`, `AOC.ENFORCEMENT`, `AOC.DECISION` or `AOC.RESOURCE` mineral, and SM-10 adds no ninth
member to the inventory. There is still no global implementation registry
and no profile registry: a capsule is passed explicitly to `invokeSovereigntyCapability`, the one
canonical profile is a frozen constant, and wiring several capsules together is a future composition
concern.
