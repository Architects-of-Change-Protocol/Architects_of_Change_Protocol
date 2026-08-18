---
'@aoc/protocol': minor
---

Add the fifth production Sovereignty Capability capsule — `AOC.INTEROPERABILITY` — to
`@aoc/protocol/sovereignty-capabilities`, together with the self-describing
sovereign profile, representation descriptor, consumer support declaration and
compatibility evaluator on a new `@aoc/protocol/interoperability` subpath.

SM-06 made a sovereign representation portable: it can leave one runtime as
canonical JSON and be reconstructed elsewhere as the same representation. But a
receiving system holding that JSON could read its field names and still not know
what any of them *mean*, which of its semantics that system understands, or
whether it could safely consume it. SM-07 closes that gap without translating,
dropping or adjudicating anything.

## New subpath `@aoc/protocol/interoperability`

**The canonical profile.** `AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1` at
`aoc-sovereignty-interoperability-profile/1` — a frozen, deterministic,
provider-neutral document naming the profile id
(`aoc:interoperability-profile:sovereignty-portability`), the profile version
(`1.0.0`), the wire media type
(`application/vnd.aoc.sovereignty-portability+json`), the SM-06 bundle schema,
the `aoc-canonical-json/1` profile, the artifact kinds, the claim semantics and
the semantic vocabulary. A consumer can read every negotiable fact from it
without inspecting AOC source code.

The profile version is deliberately not the npm package version: the package
version moves whenever any part of `@aoc/protocol` changes, while the semantics
an external system negotiates against must move only when those semantics do.
The representation constants are imported from SM-06 and the canonical JSON
profile rather than re-typed, so the profile cannot describe a bundle schema the
bundle no longer uses. `AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE` is an AOC
Protocol media-type identifier and claims no IANA registration.

**The canonical sovereignty semantic vocabulary.**
`AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY` — ten terms under the
`aoc.sovereignty` namespace covering Sovereign Subject, Sovereign Asset
Identity, External Reference, Content Identity, Sovereign Manifest, Origin
Assertion, Authorship Assertion, Derivation Assertion, Claim Standing and
Portable Sovereign Representation, grouped into Identity, Integrity, Provenance
and Portability categories. Built from the **existing**
`CanonicalSemanticVocabulary`, `CanonicalSemanticCategory` and
`CanonicalSemanticTerm` contracts — no parallel semantic model is introduced —
and behaviour-free by construction: it states meanings and resolves, scores,
evaluates and decides nothing. Every id is a stable Protocol constant; nothing
is minted at import time.

**The representation descriptor.** `SovereigntyInteroperabilityDescriptorV1` at
`aoc-sovereignty-interoperability-descriptor/1`, describing one *concrete*
bundle: the manifest and claim artifact kinds present, the historical manifest
versions carried, the underlying claim types, the standing statuses, and the
semantic concepts a consumer must understand. It duplicates no bundle payload,
and carries deliberately no `descriptorId` and no `describedAt` — describing the
same bundle twice produces the same value, and *when* a description happened is
recorded in the SM-03 invocation evidence. Semantic requirements are extracted
from `CanonicalSemanticRef` as `namespace` + `termRef`: concept identity, never
the ref's occurrence id, so two differently-identified refs to one concept
deduplicate to one requirement.

**The consumer support declaration.**
`SovereigntyInteroperabilityConsumerSupportV1` at
`aoc-sovereignty-interoperability-support/1`, supplied explicitly by the
receiving system. Never inferred from a user-agent, package name, runtime or
provider, and never fetched from a well-known URL, DID document, registry or
DNS. It carries no consumer identity, because *who* is asking changes nothing
about the answer. Its validator fails closed on unknown vocabulary and on
duplicate entries rather than silently cleaning a machine-readable contract;
callers normalize their own input through
`buildSovereigntyInteroperabilityConsumerSupportV1`.

**The compatibility report.**
`SovereigntyInteroperabilityCompatibilityReportV1` at
`aoc-sovereignty-interoperability-report/1`, with an enumerated
`compatible` / `partially-compatible` / `incompatible` status. Core requirements
(profile identity and version, media type, bundle schema, canonicalization
profile) are distinguished from feature requirements (artifact kinds, claim
types, standing statuses, semantic concepts): a missing core requirement is
incompatible, a missing feature is partial. Gaps are reported as explicit,
deterministically sorted lists with stable reason codes — never as a score, a
percentage or a confidence value, because a consuming system cannot act
responsibly on a number. Profile versions match exactly; no "closest version" is
chosen, and generic JSON support is never read as semantic support.

## New on `@aoc/protocol/sovereignty-capabilities`

`createInteroperabilitySovereigntyCapabilityImplementation` with two operations
— `describe-bundle` and `assess-compatibility` — and their typed input/output
unions, validators and reason codes.

`describe-bundle` works with **no** invocation subject, which is load-bearing: a
receiving application usually has no local record of a subject that arrived from
somewhere else. It returns the subject the bundle already carried; nothing is
minted. An explicitly supplied subject is checked for exact SM-02 equality and
never reconciled.

An incompatible or partial compatibility report is an ordinary **successful**
execution. The caller asked whether a consumer can consume a representation, and
Interoperability determined the answer; "no" is a successful assessment, exactly
as an Integrity check that correctly reports a digest mismatch has successfully
checked. Capability failure is reserved for input that cannot be read at all: a
malformed bundle, descriptor or support declaration, an unsupported operation,
or a subject mismatch.

## Boundaries

`SovereigntyPortabilityBundleV1` is **unchanged**. Its six-field contract gained
no `interop`, `profile`, `mediaType`, `descriptor` or `compatibility` field:
Interoperability operates beside the portability bundle, never inside it.

Enforced by source-scanning tests, Interoperability never mints an identity,
never signs or verifies, never computes or repairs a digest, never creates
provenance, and never invokes the AOC.PORTABILITY capsule — it reuses the
Portability bundle *contract* and validator, which is contract reuse rather than
hidden capability execution, so composing minerals stays the caller's decision.
It reaches no filesystem, network, database, provider or Enterprise code,
introduces no mutable profile or adapter registry, and carries no trust score,
policy decision or ownership semantics. It branches on no subject namespace,
asset type or business domain: a physical property, an external token, an
autonomous agent, an API resource and a subject from an unknown system all
describe through exactly the same architecture.

`partially-compatible` never authorizes data loss. There is no
`stripUnsupportedArtifacts`, no `downgradeBundle`, no
`convertToSupportedSubset` and no `bestEffortImport`: after a partial report the
bundle, its canonical wire form and the descriptor are byte-for-byte what they
were, and an unsupported `Derivation` is reported as unsupported rather than
rewritten into `ClaimType.Custom` or discarded.

No external standard is implemented in any form — no W3C VC, DID, C2PA, SPDX,
CycloneDX, JSON-LD, Open Badges, XACML, Rego or Cedar adapter, mapping or
dependency. Those are mappings *between* AOC semantics and someone else's, and
they presuppose the stable self-describing statement of what AOC semantics are
that this capsule establishes. Regulated-sector profiles are deferred on the
same basis.

221 suites / 1665 tests / 3 snapshots green, `protocol:rc:check` 21/21, and all
three packed-tarball consumer fixtures verify the first five-mineral flow:
Integrity, Identity, Provenance, Portability, transport, Portability again, then
Interoperability describing what arrived and reporting full, partial and
incompatible consumption against three declared support sets.

Additive only: the canonical inventory remains eight and read-only, capability
versions are unchanged at `1.0.0`, and no global implementation or profile
registry is introduced. The profile, vocabulary, descriptor and compatibility
report are Interoperability *artifacts*, not a ninth mineral — there is no
`AOC.COMPATIBILITY`, `AOC.TRANSLATION`, `AOC.SCHEMA` or `AOC.SEMANTICS`.
