---
'@aoc/protocol': minor
---

Add the seventh production Sovereignty Capability capsule — `AOC.LICENSING_TERMS` —
to `@aoc/protocol/sovereignty-capabilities`, together with a new
`@aoc/protocol/licensing` subpath carrying the structured, portable sovereign
license terms model it declares and validates.

SM-08 let an independent party check whether the proof attached to a sovereign
artifact holds. But a subject that can be identified, measured, attributed,
moved, described and verified still could not say, in a form a machine can read,
what its issuer *declares* may be done with it. The low-level claim architecture
already had the right primitive — `AuthorityClaimKind.License` has existed since
the manifest layer was written, and SM-05 deliberately left it outside the formal
Provenance capsule for exactly this mineral — but a generic `AuthorityClaim`
requires only a free-text `statement`, which is not enough for a production
Licensing & Terms capability. SM-09 adds the missing structure without adding a
single new claim type.

## New subpath: `@aoc/protocol/licensing`

`SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION` (`aoc-sovereign-license-terms/1`) and
`SovereignLicenseTermsV1`: a required audience, an optional issuer-supplied
`effectiveAt`, and a required, non-empty, order-preserving list of clauses.

| Field | Shape | Notes |
| --- | --- | --- |
| `audience` | `Public` \| `Principal` \| `Custom` | required; `Public` means a public *audience*, never public domain |
| `effectiveAt` | `CanonicalTimestamp?` | when the issuer says terms begin applying; **never** defaulted from `issuedAt` |
| `rules` | `SovereignLicenseTermsRuleV1[]` | non-empty, dense, caller-ordered |

Each clause carries a caller-supplied local `id`, an effect
(`Permission`/`Restriction`/`Obligation`), an open-world action reference, and a
required non-blank `statement`.

`LicenseTermsClaim` is a **specialized `AuthorityClaim`** with
`metadata.kind === AuthorityClaimKind.License` and `metadata.terms`.
`buildLicenseTermsClaim` reuses `buildAuthorityClaim`, and
`validateLicenseTermsClaim` reuses `validateAuthorityClaim` for the shared base
rules rather than restating them.

**No `ClaimType.License` was added**, `CanonicalClaim` is not forked, and there is
no `LicenseClaimBase`, `TermsClaimBase`, `PermissionClaimBase` or
`RestrictionClaimBase`. `ClaimType.Authorization` is deliberately not the
representation either: it means "principal P is authorized to perform action A",
a conclusion about an actor, while a licensing declaration is a premise somebody
else may later reason from. Collapsing them would make every stored declaration
read as an evaluated verdict.

**Effects are `Permission`/`Restriction`/`Obligation`, not `Allow`/`Deny`.** Those
two words name the output of a runtime decision, and a vocabulary that used them
would invite every reader to treat a declaration as a verdict.

**Actions are open-world.** A `(namespace, termRef)` concept pair, never a URL and
never dereferenced. Inside the Protocol-owned `aoc.licensing` namespace a term
must be one of this version's canonical action concepts — `aoc.licensing:comercial-use`
is a typo worth rejecting — while `example.real-estate:lease`,
`example.api:invoke`, `example.ai:fine-tune`, `example.token:transfer` and
`future-system:quantum-copy` are preserved exactly and never claimed to be
understood. A sovereign subject may be a document, an API, an AI agent, a parcel
of land, an external token or something nobody has modelled yet, and a closed
global action enum would make every one of those a Protocol change.

**Closed structures, open metadata.** Every SM-09-owned structure — the terms
document, each audience variant, each clause, each action reference — uses
exact-key validation, so `automaticRoyaltyRate` fails closed rather than being
accepted and silently ignored. `AuthorityClaim.metadata` as a whole stays open;
that extensibility predates SM-09.

**A new `aoc.licensing` semantic vocabulary**, built from the existing
`CanonicalSemanticTerm`/`Category`/`Vocabulary` contracts — no second semantic
framework — carrying the declaration and effect concepts plus a non-exhaustive
core of eleven action concepts. The SM-07 core `aoc.sovereignty` vocabulary is
**not** appended to: licensing concepts live in their own namespace precisely so a
later mineral shipping cannot change what the interoperability profile advertises.

## New on `@aoc/protocol/sovereignty-capabilities`

`createLicensingTermsSovereigntyCapabilityImplementation({ clock? })` with three
operations and their typed input/output unions, validator and reason codes:

| Operation | Input | Output |
| --- | --- | --- |
| `declare-license-terms` | issuer, statement, audience, rules, optional dates and evidence refs | one `LicenseTermsClaim` |
| `validate-license-terms` | an `unknown` candidate | `valid` + stable reasons |
| `contest-license-terms-claim` | a licensing claim + a reason | the claim, unchanged, + a `Contested` standing |

`declare-license-terms` requires `invocation.subject` and accepts no
`sovereignAssetId` of its own, so a claim can never disagree with the invocation
it was made under; it mints nothing and requires no bytes, no `ContentIdentity`
and no manifest digest, which is what lets a building, a parcel of land, an API
resource, an AI agent and an external token receive terms exactly as a file does.

**Invalid candidate vs unreadable request.** Validating `{}` is an ordinary
**successful** execution reporting `valid: false` — the capability answered the
question. A malformed *declare* request is a failed execution with no partial
claim. Validation also runs with **no** invocation subject at all, attributing a
valid candidate's own subject and never fabricating one for an unreadable
candidate.

## Boundaries

**No evaluation, in any form.** There is no `evaluate-license`,
`is-action-permitted`, `is-action-restricted`, `isAllowed`, `isDenied`,
`authorize-use`, `canUse`, `canDistribute`, `canDerive` or `check-obligation`
operation, and no condition language to write one with — no `and`/`or`/`not`,
operator, expression tree, CEL, Rego, Cedar, JSON Logic or XACML. Clause
statements are inert data and are never parsed into policy.

**No precedence.** A document may declare a `Permission` and a `Restriction` over
the identical action; both are recorded and Protocol says only "the issuer
declared both". Restriction does not beat permission, the latest claim does not
win, signed does not beat unsigned, a verified issuer does not beat an unverified
one, and principal-specific does not beat public. A subject may carry many
contradictory declarations from many issuers and nothing resolves which is
"current". `supersede-license-terms` is deliberately not implemented in v1.

**No wall clock.** `issuedAt`, `effectiveAt` and `expiresAt` are declaration data.
Nothing compares them to now, so there is no `isActive`, `isCurrentlyEffective`,
`isExpiredNow` or `isNotYetEffective`, and no `StandingStatus.Active` or
`.Expired` is ever created. `effectiveAt` is never defaulted from `issuedAt`, and
`CanonicalClaim.expiresAt` is the one expiration field — the terms document has no
second one. No ordering between the three is enforced, so a backdated correction
and a retroactive licence stay expressible.

Enforced by source-scanning tests, the capsule never signs (no private key,
secret key, seed, mnemonic or KMS field exists in its input contract in any
spelling), never verifies, never mints identity, never creates an `OriginClaim`,
authorship claim or `DerivationClaim`, never inherits terms across a derivation
edge, never reads a manifest's `registrant` as the licensing issuer, and produces
no `owner`, `legalOwner`, `copyrightOwner` or `titleHolder` field and no transfer
operation. It contains no price, currency, royalty rate, fee, revenue share,
payment schedule, wallet or settlement address, no `calculateRoyalty`,
`splitRevenue`, `invoice` or `meterUsage`, and no billing, tax or jurisdiction
engine — a payment expectation is expressible as an `Obligation` over an external
action concept plus a statement, with the instrument referenced through
`evidenceRefs`, and nothing is calculated or settled. There is no encryption,
watermarking, playback control, kill switch or copy prevention, no SPDX, Creative
Commons, ODRL, RightsML or NFT-licence mapping, no filesystem, network, database,
chain, provider, registry or resolver, no Enterprise or Asset Protocolization
import, and no branch on subject namespace, media type, asset type or business
domain — even `CommercialUse`, `Derive` and `Attribute` trigger no distinct
production behaviour.

## Composition with the six existing minerals

**Portability is unchanged.** `SovereigntyPortabilityBundleV1` keeps exactly six
fields and gained no `licenses`, `terms` or `permissions` field: a
`LicenseTermsClaim` is an `AuthorityClaim`, so the existing `claims` array carries
it — unsigned as `kind: 'claim'`, signed as `kind: 'signed-claim'`. No
`kind: 'license'` was invented. Round trips preserve claim id, subject, issuer,
audience, rule order, external action concepts, `effectiveAt`, `expiresAt`,
`semanticRefs` and `evidenceRefs` byte for byte.

**Interoperability is unchanged.** Generated `semanticRefs` are ordinary
`CanonicalSemanticRef`s with deterministic `<claimId>:semantic:<n>` ids,
deduplicated by concept identity and ordered canonically, so the existing SM-07
descriptor discovers licensing semantics — including external ones — with no
descriptor schema change and no profile bump. A consumer supporting every
licensing concept is `compatible`; one missing a single action concept is
`partially-compatible`, and nothing is dropped, downgraded or rewritten.

**Verifiability composes without Licensing signing anything.** The existing
`signClaim` signs a `LicenseTermsClaim`, and the real `AOC.VERIFIABILITY` capsule
verifies it. Tampering with a rule effect, statement, audience or action after
signing is detected as a digest/signature failure, and Licensing repairs nothing.

**Cryptographic validity is not terms validity**, and both directions are tested:
an issuer can sign a structurally malformed terms document, so "signature valid"
alongside "terms invalid" is an ordinary representable pair rather than a
contradiction. A signed claim that verifies also stays byte-identical through
contestation, so *cryptographically valid* and *`Contested`* coexist.

**Provenance keeps its boundary.** A declaration creates no provenance claim, and
terms never travel along a derivation edge: a child recorded as derived from a
parent carrying terms receives none of them, and a `Permission`/`Derive` clause
declares that deriving is permitted while saying nothing about the child's terms.

## Privacy

Terms are frequently principal-specific or commercially sensitive, so the generic
SM-03 evidence stays payload-free: capability, version, invocation id,
timestamps, outcome, optional correlation id and optional subject — never the
rules, statements, audience, claim or semantic refs.

232 suites / 2056 tests / 3 snapshots green, `protocol:rc:check` 21/21, and all
three packed-tarball consumer fixtures verify the first seven-mineral flow:
Integrity measures the bytes, Identity mints the subject and manifest, Provenance
records the derivation, Licensing & Terms declares structured permissions,
restrictions and obligations over it, a TEST-ONLY issuer signs the resulting claim
through the existing low-level primitives, Portability exports and a second
runtime imports the canonical bundle, Interoperability discovers the licensing
semantics and reports both full and partial compatibility, and Verifiability
independently checks the transported proof — proving a valid signature, a
fail-closed result for terms tampered with in transit, a signed-but-malformed
document that is cryptographically valid and semantically invalid at once, and a
valid signature coexisting with a `Contested` standing.

Additive only: the canonical inventory remains eight and read-only, capability
versions are unchanged at `1.0.0`, and no global implementation registry is
introduced. Structured terms, the licensing vocabulary and the rule model are
Licensing & Terms *semantics*, not a ninth mineral — there is no `AOC.LICENSE`,
`AOC.RIGHTS`, `AOC.PERMISSION`, `AOC.RESTRICTIONS`, `AOC.ROYALTIES` or `AOC.DRM`.
Governance Compatibility remains the one mineral with no production capsule, and
nothing here anticipates its handoff.
