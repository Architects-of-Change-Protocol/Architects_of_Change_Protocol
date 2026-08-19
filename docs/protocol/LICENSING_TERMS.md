# Structured Sovereign License Terms

The data model behind `AOC.LICENSING_TERMS`, published as `@aoc/protocol/licensing`. The capability
that runs it through the common invocation and evidence spine is documented in
[`SOVEREIGNTY_CAPABILITIES.md`](./SOVEREIGNTY_CAPABILITIES.md); this page is about the terms
themselves.

## What a declaration is

> **Issuer I declared these terms over subject X.**

That sentence is the entire meaning of a `LicenseTermsClaim`. It does **not** mean the issuer owns the
copyright, holds title, had the authority to grant anything, or that the terms are enforceable in any
jurisdiction. A valid signature over one proves the issuer made the declaration — never that the
declaration is legally sound.

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
parent terms           ≠ child terms
Contested              ≠ invalid signature
```

Soberanía Protocol records what someone declares. It does not decide whether an action is allowed, grant
access, enforce a restriction, determine legal ownership, calculate royalties or resolve conflicting
declarations. Soberanía Enterprise or another external governance system may later *consume* these terms and
reach its own decisions; that consumption is outside Protocol.

## The claim

`LicenseTermsClaim` is a **specialized `AuthorityClaim`**, not a new claim family:

```ts
interface LicenseTermsClaim extends AuthorityClaim {
  readonly metadata: Readonly<{
    readonly kind: typeof AuthorityClaimKind.License;
    readonly statement: string;
    readonly terms: SovereignLicenseTermsV1;
  } & Record<string, unknown>>;
  readonly semanticRefs: readonly CanonicalSemanticRef[];
}
```

- `type` stays `ClaimType.Authorship` — the existing family whose semantic sub-kinds are `Authorship`,
  `Rights`, `License` and `Custom`. SM-09 performs no legacy claim-model convergence.
- No `ClaimType.License` was added, no `CanonicalClaim` was forked, and no `LicenseClaimBase`,
  `TermsClaimBase`, `PermissionClaimBase` or `RestrictionClaimBase` exists.
- `ClaimType.Authorization` is deliberately not used: it means "principal P is authorized to perform
  action A", which is a conclusion about an actor, while a declaration is a premise somebody else may
  later reason from.

`buildLicenseTermsClaim` reuses `buildAuthorityClaim` with `kind: AuthorityClaimKind.License`, so the
base fields have exactly one construction site in the package. It throws on a malformed declaration
rather than repairing it, and mints nothing: no claim id, no rule id, no subject, no standing, no
evidence reference.

## The terms document

```ts
const SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION = 'aoc-sovereign-license-terms/1';

interface SovereignLicenseTermsV1 {
  readonly schemaVersion: typeof SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION;
  readonly audience: SovereignLicenseTermsAudience;
  readonly effectiveAt?: CanonicalTimestamp;
  readonly rules: readonly SovereignLicenseTermsRuleV1[];
}
```

`schemaVersion` versions the *terms document* and nothing else — independent of the `@aoc/protocol`
package version, the capability version, the claim id, the manifest version and the portability bundle
schema. A future or unknown schema fails closed rather than being read best-effort.

Fields that are deliberately absent:

| Absent | Because |
| --- | --- |
| `termsId` / `licenseId` / `agreementId` | the assertion already has `LicenseTermsClaim.id`; two identities for one declaration is how references start pointing at the wrong thing |
| `createdAt` / `generatedAt` / `declaredAt` | the claim already has `issuedAt`, and SM-03 evidence already records when the declaration was made |
| `expiresAt` | `CanonicalClaim.expiresAt` is the one source of truth |
| `price` / `currency` / `royaltyRate` / `fee` / `revenueShare` / `paymentSchedule` / `wallet` / `settlementAddress` | a first-class money model carries financial semantics Protocol does not implement and must not imply |
| `jurisdiction` / `governingLaw` | Protocol performs no legal interpretation and no choice-of-law evaluation |
| `owner` / `copyrightOwner` / `titleHolder` | the issuer is an *asserting* principal; recording who declared terms is not establishing who owns anything |

Unknown fields are rejected. Every SM-09-owned structure — the terms document, each audience variant,
each rule, each action reference — is validated with exact-key checks, so `automaticRoyaltyRate` fails
closed instead of travelling, being signed, and being read by three systems as though Protocol had
agreed to it. Silently dropping it would be worse: the issuer would believe it was declared.

`AuthorityClaim.metadata` as a whole stays **open**. That extensibility predates SM-09 and belongs to
the claims layer; the licensing validator only insists on `kind`, `statement` and `terms`.

## Audience

Terms nobody is addressed to are not terms, so the audience is required rather than defaulted — an
implicit "everyone" would be Protocol inventing the most consequential clause in the document.

```ts
{ kind: 'Public' }
{ kind: 'Principal', principal: 'principal:acme' }
{ kind: 'Principal', principal: { id: 'principal:acme', kind: 'Organization' } }
{ kind: 'Custom', namespace: 'example:membership', id: 'premium-members' }
```

**`Public` means a general/public audience — nothing more.** It does not mean public domain, CC0,
free, out of copyright, attribution-free or commercially unrestricted. A `Public` audience with a
`Restriction`/`CommercialUse` clause is an ordinary, coherent document, and no reader may infer
permissions from the audience alone.

`Principal` reuses the same `string | CanonicalPrincipalRef` shape the claims layer already uses for
`CanonicalIssuer` — there is no `LicenseeIdentity`, `LicenseHolderIdentity` or `RightsPrincipal`.
Naming a principal is not authenticating, resolving or authorizing one.

`Custom` is opaque in both halves and is never interpreted: no membership lookup, no group expansion,
no registry, no network, no inference about who is inside it.

## Rules

```ts
interface SovereignLicenseTermsRuleV1 {
  readonly id: string;
  readonly effect: 'Permission' | 'Restriction' | 'Obligation';
  readonly action: SovereignLicenseActionRef;
  readonly statement: string;
}
```

The effects are deliberately **not** `Allow`/`Deny`. Those name the output of a runtime decision, and
a vocabulary that used them would invite every reader to treat a stored declaration as an evaluated
verdict.

| Effect | Declares | Does not |
| --- | --- | --- |
| `Permission` | the action is permitted under these terms | issue a grant, token, credential or access |
| `Restriction` | the action is restricted under these terms | block, revoke, disable or prevent anything |
| `Obligation` | the action is required under these terms | establish that it was ever performed |

`id` is a caller-supplied *local clause* identifier, unique within one document. Protocol mints
nothing — no UUID, no hash, no counter — and the clause id is emphatically not an identity for the
declaration, which `LicenseTermsClaim.id` already is. Duplicate clause ids are **reported**, never
silently deduplicated. The same action may appear many times under different clause ids, including as
a `Permission` and a `Restriction` at once.

`statement` is required, non-blank, human-readable data. It is recorded and transported verbatim and is
**never** parsed, tokenized, pattern-matched or turned into executable policy. There is no condition
language in v1 — no `and`, `or`, `not`, comparison operator, expression tree, CEL, Rego, Cedar, JSON
Logic or XACML — because a rule language is a decision engine wearing a data model's clothes.

**Rule order is the issuer's.** Nothing sorts, deduplicates or normalizes the array. Canonical JSON
canonicalizes object keys, not the semantic order of a caller's list. Sparse arrays are rejected:
`Array.prototype.every` skips holes, so a hole would otherwise reach a signed claim as a clause nobody
wrote.

The full legal instrument is not replaced by these clauses. It is referenced through the claim's
`evidenceRefs` — a contract, a licence instrument, a written consent, a registry record — and the
structured rules are the machine-readable skeleton beside it. Nothing is ever fabricated there, and
nothing is resolved: a reference is not proof that its target exists, let alone that it says what the
terms say.

## Actions are open-world

```ts
interface SovereignLicenseActionRef {
  readonly namespace: CanonicalSemanticNamespace;
  readonly termRef: CanonicalSemanticTermId;
}
```

A sovereign subject may be a document, a song, a dataset, an API, an AI agent, a parcel of land, an
external token or something nobody has modelled yet. A global closed action enum would make every one
of those a Protocol change, so:

- `aoc.licensing` is the **Protocol-owned core**, and inside it a term must be one of this version's
  canonical action concepts. `aoc.licensing:comercial-use` is a typo worth rejecting, not a new
  concept.
- **Any other namespace** is accepted opaquely and preserved exactly: `example.real-estate:lease`,
  `example.api:invoke`, `example.ai:fine-tune`, `example.token:transfer`,
  `future-system:quantum-copy`. Protocol preserves them without understanding them.

The Protocol-owned action core is `access`, `use`, `reproduce`, `distribute`, `display`, `perform`,
`modify`, `derive`, `commercial-use`, `sublicense` and `attribute`. It is a starting core, never a
ceiling, and it is not privileged at runtime: `aoc.licensing:commercial-use` and
`example.real-estate:lease` travel through byte-identical code paths, and no production branch
anywhere reads an action id to decide what to do.

**Nothing is ever dereferenced.** A term is an identifier, never a locator: no HTTP, no ontology
registry, no DID, no DNS, no JSON-LD context and no semantic resolver exists in this package. A URL is
not required and is not accepted as identity.

An action reference deliberately carries no `id`. `CanonicalSemanticRef` has one because it identifies
one concrete *occurrence* of a reference sitting on one artifact; inside a rule only the *concept* is
needed, and minting an occurrence id there would create an identifier with no holder and make two
clauses about the very same concept look different.

## Semantic references, and why they matter

Every built `LicenseTermsClaim` carries `CanonicalSemanticRef[]` in a canonical order:

1. `aoc.licensing:license-terms-declaration` — always
2. the permission concept, if any clause declares one
3. the restriction concept, if any clause declares one
4. the obligation concept, if any clause declares one
5. every distinct action concept, sorted by namespace then term

Concepts are deduplicated by `(namespace, termRef)` identity, so three `CommercialUse` clauses impose
one requirement rather than three. Ref ids are `<claimId>:semantic:<n>` — deterministic, collision-free
within a claim, and following the same `<claimId>:assertion` convention the claim builders already use.
A `randomUUID()` here would make the same declaration serialize, digest and sign differently on every
construction, which is fatal for a document meant to be signed and compared.

These refs are what lets the **unchanged** SM-07 Interoperability machinery discover that an arriving
claim carries licensing semantics — including semantics defined by somebody else. A clause over
`example.real-estate:lease` surfaces that concept as a compatibility requirement, so a receiving
system is told "you need to understand this" without Protocol ever defining, resolving or interpreting
it.

No interoperability descriptor schema change, no profile bump and no mutation of the SM-07 core
`aoc.sovereignty` vocabulary was needed for any of it. `aoc.licensing` is its own namespace precisely
so a later mineral shipping could not change what the interoperability profile advertises.

## Time

| Field | Lives on | Means |
| --- | --- | --- |
| `issuedAt` | `CanonicalClaim` | when the claim was asserted/recorded |
| `effectiveAt` | `SovereignLicenseTermsV1` | when the issuer says the terms begin applying |
| `expiresAt` | `CanonicalClaim` | when the declaration stops applying |

`issuedAt: 2026-08-18` with `effectiveAt: 2026-09-01` is an ordinary case, so `effectiveAt` is never
defaulted from `issuedAt` — absent means absent. Nothing compares any of these to now: there is no
`isActive`, `isCurrentlyEffective`, `isExpiredNow` or `isNotYetEffective`, and no
`StandingStatus.Active` or `StandingStatus.Expired` is ever created. A future-effective declaration is
structurally valid; an expired historical declaration is structurally valid historical data.

No ordering between the three is enforced. No canonical repository rule owns such an ordering, and
inventing one would make a backdated correction or a retroactive licence structurally malformed — a
legal timing judgement Protocol has no business making.

## Contradiction, multiplicity and precedence

A document may declare:

```
R1  Permission   aoc.licensing:commercial-use   "commercial use permitted"
R2  Restriction  aoc.licensing:commercial-use   "commercial use restricted"
```

Both are structurally valid. Protocol says *"the issuer declared both"*. It does **not** say commercial
use is allowed, does **not** say it is denied, and applies no precedence: not restriction-beats-
permission, not latest-claim-wins, not signed-beats-unsigned, not verified-issuer-wins, not
principal-specific-beats-public.

A subject may likewise carry many declarations from many issuers with different dates, audiences and
contradictory terms. Nothing resolves which is "current", and `supersede-license-terms` is deliberately
not implemented in v1: the standing model can express `Superseded`, but supersession implies
precedence, and precedence deserves its own explicit design.

## Composition

```
bytes ──► AOC.INTEGRITY ──► ContentIdentity
                                  │
          AOC.IDENTITY ◄──────────┘──► Subject X + Manifest
                │
                ├──► AOC.PROVENANCE      ──► Origin / Derivation claims
                └──► AOC.LICENSING_TERMS ──► LicenseTermsClaim
                                                  │
                              issuer's own signClaim (TEST or production keys)
                                                  ▼
                                            SignedClaim
                                                  │
                     AOC.PORTABILITY ──► canonical JSON ──► AOC.PORTABILITY
                                                  │
                              AOC.INTEROPERABILITY ──► descriptor carrying
                                                       licensing semantic requirements
                                                  │
                                 AOC.VERIFIABILITY ──► cryptographic verification
```

**Portability.** A `LicenseTermsClaim` is an `AuthorityClaim`, so the existing `claims` array carries
it: unsigned as `kind: 'claim'`, signed as `kind: 'signed-claim'`. No `kind: 'license'` was invented —
the transport wrapper says signed/unsigned claim, and the claim's own metadata says `License`.
`SovereigntyPortabilityBundleV1` keeps exactly six fields and gained no `licenses`, `terms` or
`permissions` field. Portability applies no licensing validation of its own; `validateLicenseTermsClaim`
owns those rules.

**Interoperability.** The descriptor discovers the licensing concepts through ordinary claim
`semanticRefs`. A consumer supporting all of them is `compatible`; one missing a single licensing
action concept is `partially-compatible` — and partial compatibility never authorizes data loss:
nothing is dropped, downgraded, projected or rewritten.

**Verifiability.** The licensing capsule never signs. No operation accepts a private key, secret key,
seed, mnemonic or KMS secret in any spelling. An issuer signs a returned claim with the existing public
`signClaim`, and AOC.VERIFIABILITY checks it. Tampering with a rule effect, statement, audience or
action after signing is detected as a digest/signature failure, and Licensing repairs nothing.

**Crypto validity is not terms validity.** An issuer can sign a structurally malformed terms document.
Both of these are true of the same artifact at the same moment, and neither is wrong:

```
AOC.VERIFIABILITY   signature valid
AOC.LICENSING_TERMS terms invalid
```

**Provenance.** A declaration creates no `OriginClaim`, authorship claim or `DerivationClaim`, and
terms never travel along a derivation edge. If A carries terms and C is recorded as derived from A, C
receives **no** licensing claim automatically — and a `Permission`/`Derive` clause on A declares that
deriving is permitted while saying nothing at all about what terms the resulting child carries. The
child needs its own explicit declaration.

**Contestation.** `contest-license-terms-claim` returns the claim unchanged beside a `Contested`
standing. The claim stays byte-identical, so a signature over it still verifies: *cryptographically
valid* and *Contested* coexist without contradiction. Protocol records the dispute; adjudication is
external.

## Privacy

Terms can be principal-specific or commercially sensitive. The SM-03 evidence spine stays
**payload-free**: an evidence record carries the capability, its version, the invocation id,
timestamps, the outcome, an optional correlation id and an optional subject — never the rules, the
statements, the audience, the claim, the semantic refs or any legal text. The result carries the
claim; evidence is not a second terms repository.

## Deliberately deferred

Policy evaluation · permission enforcement · access grants · provider adapters · credential issuance ·
DRM · usage metering · royalty calculation · billing · settlement · tax · jurisdiction interpretation ·
legal adjudication · licence precedence · current-effective-terms resolution · automatic supersession ·
terms inheritance · SPDX · Creative Commons · ODRL · RightsML · managed signing/KMS · revocation ·
title transfer · tokenization.

Governance handoff belongs to SM-10, `AOC.GOVERNANCE_COMPATIBILITY`. SM-09 produces terms; SM-10 will
make sovereign state consumable by governance.
