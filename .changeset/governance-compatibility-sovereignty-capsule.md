---
'@aoc/protocol': minor
---

Add the eighth and last production Sovereignty Capability capsule —
`AOC.GOVERNANCE_COMPATIBILITY` — to `@aoc/protocol/sovereignty-capabilities`,
together with a new `@aoc/protocol/governance-compatibility` subpath carrying the
sovereign governance handoff it projects and validates.

This closes the canonical eight-mineral architecture: eight canonical
definitions, eight production capsules, no ninth mineral.

SM-09 let an issuer say, machine-readably, what it declares about a sovereign
subject. What was still missing was the last step: a way for a system that is not
AOC to take custody of that sovereign state and govern it — and, just as
importantly, a place for AOC Protocol to *stop*. SM-10 supplies exactly one new
document for that, and refuses to supply anything beyond it.

## New subpath: `@aoc/protocol/governance-compatibility`

`SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION` (`aoc-sovereign-governance-handoff/1`)
and `SovereignGovernanceHandoffV1`: exactly six top-level fields, in a closed
envelope.

| Field | Contract | Owner |
| --- | --- | --- |
| `schemaVersion` | `'aoc-sovereign-governance-handoff/1'` | this subpath |
| `canonicalizationProfile` | `CANONICAL_JSON_PROFILE` | `@aoc/protocol/canonical` |
| `subject` | `SovereignSubjectRef` | `@aoc/protocol/identity` (SM-02) |
| `resource` | `ResourceRef` | `@aoc/protocol/contracts` |
| `representation` | `SovereigntyPortabilityBundleV1` | `@aoc/protocol/portability` (SM-06) |
| `semantics` | `SovereigntyInteroperabilityDescriptorV1` | `@aoc/protocol/interoperability` (SM-07) |

Everything except the envelope is an existing contract, reused rather than
re-declared: there is no `GovernedSubject`, `GovernedResourceRef`,
`GovernanceBundleV1` or second semantic descriptor. An unknown top-level field —
`policy`, `decision`, `grant`, `owner`, `authority`, `status`, `approval`,
`governanceReady` — makes the handoff invalid, enforced by rejecting *any*
unrecognized key rather than by denylisting the governance concepts somebody
might try to add.

There is deliberately no `handoffId`, `generatedAt`, `handoffDigest` or
`signature`. The handoff is a deterministic projection of an existing subject,
not a new sovereign object: the same representation and tenant produce a
byte-identical canonical handoff every time, *when* a projection happened lives in
the SM-03 evidence, and integrity or proof over the document is explicit
composition with `AOC.INTEGRITY` and `AOC.VERIFIABILITY` over its canonical
serialization.

Also exported: `buildSovereignGovernanceResourceRef`,
`tryBuildSovereignGovernanceHandoffV1`, `buildSovereignGovernanceHandoffV1`,
`validateSovereignGovernanceHandoffV1`, `isValidSovereignGovernanceHandoffV1`,
`sovereignGovernanceSubjectsEqual` and
`SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES`.

## `SOVEREIGN_GOVERNED_RESOURCE_KIND` becomes Protocol-owned

```
resource.kind       = 'aoc:sovereign-asset'
resource.id         = subject.sovereignAssetId
resource.tenantId   = the caller's explicit governance context, if any
resource.attributes = structurally absent in v1
```

One kind for every subject — byte document, physical painting, plot of land,
external token, AI agent, API resource, alien-system object — and
`subject.externalReference.namespace` is opaque, so no branch reads it. The id is
the sovereignty anchor, never a manifest digest, `ContentIdentity.digest`,
external-reference id, locator, CID, provider id, database id, token address or
registry record id: a subject that changes provider, locator, bytes or manifest
version is still the same sovereign subject, and a grant keyed to a transient
representation would silently detach the moment that representation changed.

APV-02 froze the identical value as a *temporarily* vertical-owned
`PROTOCOLIZED_RESOURCE_KIND`, stating that promotion to Protocol becomes
appropriate once a second, generic producer of sovereign-resource references
appears. SM-10 is that producer, so there is now one authoritative definition. The
dependency direction is unchanged: Asset Protocolization may consume Protocol,
never the reverse; APV's stricter required tenancy stays a vertical constraint,
while generic `tenantId` here is optional, preserved verbatim when supplied,
rejected when blank, and never inferred or defaulted.

The one pre-existing in-Protocol spelling of the same wire value — the SM-03
evidence audit-envelope projection — now references the constant instead of
repeating the literal.

## New capsule: `AOC.GOVERNANCE_COMPATIBILITY`

Two operations, and no third:

```
prepare-governance-handoff    representation (+ optional tenant) → handoff
validate-governance-handoff   candidate document                 → validation report
```

`prepare-governance-handoff` works with **no** invocation subject and returns the
existing subject the representation arrived with; an explicitly supplied subject
must match it exactly, and a mismatch fails without producing a document. Its
input accepts no `actor`, `principal`, `action`, `scope`, `policy`, `authority`,
`grant`, `decision`, `owner` or credential field, and its output carries the
handoff and nothing else — no `ready`, `governable`, `complete` or `sufficient`
flag, because Protocol cannot know what artifacts exist beyond the ones it was
handed or what a policy it has never seen requires.

An invalid *candidate* under `validate-governance-handoff` is an ordinary
**successful** execution reporting `valid: false`, the pattern Integrity,
Interoperability, Verifiability and Licensing & Terms already established; no
subject is fabricated from an unreadable one. A mismatching explicit subject over
a *valid* handoff is an attribution failure instead.

Validation re-derives the canonical SM-07 descriptor from the handoff's own
representation with SM-07's pure helper and compares it under
`aoc-canonical-json/1`, so a descriptor that is individually well-formed and about
the same subject but describes a *different* bundle is rejected with
`GOVERNANCE_COMPATIBILITY_SEMANTICS_MISMATCH`. Nothing is ever repaired.

## Governance compatible is not governed

```
governance compatible ≠ governed
handoff               ≠ decision
resource reference    ≠ grant
license terms         ≠ policy
claim                 ≠ authority
signature             ≠ authority
registrant            ≠ owner
authority             ≠ decision
decision              ≠ enforcement
structural validity   ≠ policy sufficiency
```

A structurally valid handoff may carry zero claims, no licence terms, unsigned
artifacts, contested standings, a `Permission` and a `Restriction` over the same
action, and proofs that do not hold — every one a legitimate sovereign state
governance may need *in order to* decide.

`invokeSovereigntyCapability` is not called anywhere in the mineral: the SM-06
bundle validator and the SM-07 descriptor helper are reused as pure libraries, so
one prepare produces exactly one evidence record rather than a hidden chain of
them, and a caller may prepare a handoff directly without running
Interoperability first. Nothing verifies a signature, resolves a key, binds an
issuer, resolves a contested standing, picks a winner between contradictory
clauses, turns a `Permission` into a grant or scope, a `Restriction` into a deny
or an `Obligation` into a compliance status. No `PolicyDecision`,
`ScopedAccessRequest`, `CapabilityToken`, `CapabilityGrant`, `ConsentGrant`,
`Delegation`, `CanonicalCapability`, `CanonicalAuthority` or `CanonicalDecision`
is constructed, and no owner or authority is inferred from a registrant, a claim
issuer, a licence issuer or a valid signature. There is no network, filesystem,
database, cache, chain, provider SDK, global registry, import-time side effect,
randomness or clock, and no new runtime dependency — `@aoc/protocol` still has
none.

`SovereigntyPortabilityBundleV1`, the SM-07 profile and descriptor schema and the
core `aoc.sovereignty` vocabulary are all unchanged: the handoff *wraps*
Portability, and no `governance-handoff` artifact kind exists, so a handoff can
never contain a representation containing a handoff. SM-10 adds no semantic
vocabulary of its own.

## Coverage

244 suites / 2317 tests green. All three packed-tarball consumer fixtures
(`typescript-cjs`, `javascript-cjs`, `typescript-esm`) run the full eight-mineral
flow against the installed artifact and hand the resulting handoff to a small
external consumer that reads the resource, the semantics and the claims — and
returns no allow and no deny, because it is not a policy engine and neither is
anything upstream of it. Each fixture also tampers with `resource.id` and with the
descriptor and confirms a successful execution reporting `valid: false`.
