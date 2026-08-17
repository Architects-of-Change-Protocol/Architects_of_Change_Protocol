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

### Status

The socket exists; the minerals do not yet fill it. SM-03 ships **no** production implementation of
any of the eight — the flows above are exercised by test-only implementations. SM-04 will make
Identity and Integrity the first real capsules, wrapping the existing `mintSovereignAssetId`,
`buildSovereignManifestV1` and `computeContentIdentity` primitives. Provenance, Portability,
Interoperability, Licensing & Terms and Governance Compatibility follow in later work packages, and
their lineage, transfer, terms and governance semantics belong to their own inputs and outputs —
never to this common contract.
