# Sovereign Asset Core (AOC Protocol Slice 1)

## Public package consumption

External systems consume the canonical model only through the declared
`@aoc/protocol/identity`, `@aoc/protocol/canonical`, and
`@aoc/protocol/manifest` exports. The registry is a Protocol-owned port:
infrastructure may persist it, but must provide latest resolution and exact
`resolveVersion(id, version)` historical resolution without substituting or
rewriting a stored version. No tenant or storage-provider identity is part of
that contract.

Cryptographic verification establishes integrity and attributability under
the presented or independently resolved key. It does not adjudicate copyright,
legal ownership, or the truth of a claim.

Status: implemented. This document records the design of the first real
Sovereign Asset core in AOC Protocol, closing the primary gaps from the
Sovereign Digital Asset Readiness Audit that are in scope for this slice:
`SAP-GAP-001`, `SAP-GAP-002`, `SAP-GAP-003`, `SAP-GAP-004`, `SAP-GAP-006`,
and `SAP-GAP-009`. `SAP-GAP-005` (lineage) was explicitly **not** addressed
by this slice — see "Out of scope" below — and has since been closed by
AOC-P-SM-05, recorded in §16.

Protocol Slice 0 (`SAP-GAP-008`, `SAP-GAP-010`) is the completed
foundation this slice builds on: the asset/content layer participates in
the real build/test graph, and `aoc-canonical-json/1` is the single
authoritative canonicalization contract. This slice does not redo either
decision.

## 1. The core concepts

```text
SovereignAssetId
       │
       ├── persistent identity, independently minted
       ├── independent of storage, content, manifest, and external reference
       │
       ↓
Signed SovereignManifest
       │
       ├── externalReference?           (how another namespace refers to it)
       ├── ContentIdentity?             (integrity of one representation)
       ├── registrant
       ├── originClaim
       ├── authorityClaims
       ├── manifest state
       ├── timestamp
       └── cryptographic proof
```

Since AOC-P-SM-02 the sovereign subject is *not* required to be bytes. A
subject is identified, an external namespace may refer to it, and integrity
is attached only when genuine integrity material exists — see §15.

- **SovereignAssetId** — who/what the asset is. A persistent identity,
  independently minted (`aoc:sovereign-asset:<uuid>`, via `node:crypto`'s
  `randomUUID()` — the smallest mature identifier scheme already available
  in this runtime; no new dependency was introduced to mint it). It is
  never derived from a SHA hash, content digest, URL, CID, storage
  provider, manifest hash, registrant, or timestamp.
- **ContentIdentity** — what exact bytes are associated with the
  manifest. `{ algorithm: 'sha256', digest }`, computed as
  `sha256(raw content bytes)` and nothing else. This is deliberately
  distinct from the legacy `content_hash` on `ContentManifestV1`
  (`content/types.ts`), which mixes in `manifest.storage`/`subject`/etc —
  that historical behavior is preserved unchanged (see
  `content/__tests__/legacy-identity-stability.test.ts`) and is not what
  `ContentIdentity` computes.
- **SovereignExternalReference** — how a *different* namespace refers to
  the same sovereign subject: `{ namespace, id, locator? }`, all opaque to
  Protocol. Optional, open-world, never an alternate identity, never
  dereferenced (§15).
- **SovereignSubjectRef** — the universal Protocol-level subject reference:
  `{ sovereignAssetId, externalReference? }`. It deliberately carries no
  integrity material, which is what makes a non-byte subject (an AI agent,
  an API resource, an external token, a building, an object from a system
  that does not exist yet) a first-class sovereign subject (§15).
- **SovereignManifest** — a portable, signed record describing sovereign
  assertions about an asset: its optional external reference, its optional
  content identity, registrant, origin claim, authority claims, and
  lifecycle state.
- **AuthorityClaim** (and **OriginClaim**) — who declared what about the
  asset. A `CanonicalClaim` (see `@aoc/protocol/claims`), not a parallel
  rights system. A valid signature over a claim proves the issuer made
  the assertion; it never proves the assertion is historically or legally
  true.
- **StoragePointer** — where bytes are currently available. Deliberately
  absent from `SovereignManifestV1` — see §4.

### The foundational invariants

```text
Asset Identity ≠ Content Digest
Asset Identity ≠ Manifest Digest
Asset Identity ≠ Storage Location
Asset Identity ≠ External Identifier
Asset Identity ≠ Locator
Sovereign Identity ≠ Integrity
External Reference ≠ Authority Claim
Registration ≠ Legal Ownership
Possession ≠ Authority
Signature ≠ Truth of the Signed Claim
```

Every one of these is enforced structurally, not just documented:

- `SovereignAssetId` is minted by `mintSovereignAssetId()`
  (`packages/protocol/src/identity/sovereign-asset-id.ts`), which takes no
  input whatsoever — there is no code path by which content, a manifest,
  or a storage location can influence it.
- `manifestDigest` is a derived value computed by
  `computeManifestDigest()`/`signSovereignManifest()`
  (`packages/protocol/src/manifest/manifest.ts`) — it is never stored
  inside `SovereignManifestV1` itself, so it structurally cannot be
  confused with `sovereignAssetId`.
- `SovereignManifestV1` has no storage-related field at all (see §4).
- The manifest field is named `registrant`, not `owner`/`legalOwner` (see
  §5), and `AuthorityClaim`/`OriginClaim` are claims, not facts.
- `verifySovereignManifest()` reports `signature: 'valid'` and
  `issuerBinding: 'not_performed' | 'unverified' | 'verified'` as
  independent checks (see §7) — a valid signature alone never implies a
  verified issuer identity.

## 2. SovereignAssetId

```ts
type SovereignAssetId = string; // "aoc:sovereign-asset:<uuid>"
mintSovereignAssetId(): SovereignAssetId
isValidSovereignAssetId(value: unknown): value is SovereignAssetId
assertValidSovereignAssetId(value: unknown): asserts value is SovereignAssetId
```

`isValidSovereignAssetId` is structural only — it confirms the value is
well-formed, not that it is registered, resolvable, or was minted by this
runtime.

## 3. ContentIdentity

```ts
type ContentDigestAlgorithm = 'sha256'; // v1: exact byte identity only
interface ContentIdentity { algorithm: ContentDigestAlgorithm; digest: string }
computeContentIdentity(bytes: Uint8Array): ContentIdentity
verifyContentIdentity(bytes, expected): { valid: boolean; reason?: 'UNSUPPORTED_CONTENT_DIGEST_ALGORITHM' | 'CONTENT_DIGEST_MISMATCH' }
```

`ContentIdentity` answers "does this representation match the integrity
commitment?", which is a different question from "which subject is this?".
It is therefore optional on a sovereign manifest (§15) — but nothing about
it is weakened when it *is* declared: `computeContentIdentity` and
`verifyContentIdentity` are unchanged, and a declared identity is verified
exactly as strictly as before.

Fingerprinting, perceptual hashing, and watermarking are explicitly out of
scope (see §9) — a re-encoded copy of otherwise-identical content
legitimately produces a different `ContentIdentity`. That is expected,
not a defect, for this slice.

## 4. SovereignManifestV1 and SignedSovereignManifest

```ts
const SOVEREIGN_MANIFEST_SCHEMA_VERSION = 'aoc-sovereign-manifest/1';

interface SovereignManifestV1 extends SovereignSubjectRef {
  schemaVersion: typeof SOVEREIGN_MANIFEST_SCHEMA_VERSION;
  canonicalizationProfile: typeof CANONICAL_JSON_PROFILE; // 'aoc-canonical-json/1'
  sovereignAssetId: SovereignAssetId;          // from SovereignSubjectRef
  externalReference?: SovereignExternalReference; // from SovereignSubjectRef (§15)
  manifestVersion: number;               // real field in v1; no history chain yet (§10)
  contentIdentity?: ContentIdentity;     // optional since SM-02 (§15)
  registrant: string | CanonicalPrincipalRef;
  originClaim?: OriginClaim;
  authorityClaims: readonly AuthorityClaim[];
  state: SovereignAssetState;            // 'active' | 'disputed' | 'superseded' | 'withdrawn'
  createdAt: string;                     // ISO-8601
}

interface SignedSovereignManifest {
  manifest: SovereignManifestV1;
  manifestDigest: string;                // sha256(canonicalize(manifest))
  proof: SovereignProof;                 // Ed25519, see §6
}
```

`buildSovereignManifestV1()` and `signSovereignManifest()`
(`packages/protocol/src/manifest/manifest.ts`) construct and validate
this contract; `validateSovereignManifestV1()` is exported separately so
`verifySovereignManifest()` can re-run the same structural checks against
an already-resolved manifest.

There is deliberately no `StoragePointer`/URI field anywhere on this
type. Storage bindings are operational metadata that must never
contribute to the sovereign core (§9 of the implementation brief);
callers that need a `SovereignAssetId -> StoragePointer[]` mapping should
keep it in a separate, storage-neutral index outside this contract. The
storage-migration acceptance test
(`tests/contracts/sovereign-registry.test.ts`) demonstrates this by using
the existing root `storage/pointer.ts` (`buildStoragePointer`) entirely
outside the sovereign manifest to model "the same content, two different
storage pointers, one unchanged identity."

## 5. Registrant, not owner

`registrant` is a verifiable fact about who submitted the asset for
registration. It is never named `owner`/`legalOwner`, and registering an
asset is never treated as proof of legal ownership anywhere in this
slice's code, tests, or documentation. Declared authority/authorship/
rights assertions are represented as `AuthorityClaim`s (§8) — claims, not
facts — layered on top of, and independent from, `registrant`.

## 6. Signature model

`@aoc/protocol` has **zero runtime-package dependencies** — this is a
pre-existing, mechanically-enforced invariant (see
`scripts/check-version-graph.mjs`'s `role === 'protocol'` rule and
`docs/release/RELEASE_CANDIDATE_READINESS.md`'s "zero runtime
dependencies" SBOM claim), so this slice's signing code cannot import
`@aoc-runtime/crypto`'s `signPayload`/`verifyPayloadSignature`/
`GovernanceSignature` even though those are the existing production-real
Ed25519 implementation. `packages/protocol/src/manifest/proof.ts`
therefore reimplements the *identical primitive pattern* natively:

```text
sign:   canonicalize(payload) --sha256--> payloadHash --ed25519 sign-->   SovereignProof
verify: canonicalize(payload) --sha256--> payloadHash' == proof.payloadHash?
                                       --ed25519 verify(payloadHash', proof.publicKey, proof.signature)-->  bool
```

This is the same algorithm choice `crypto/engine.ts`'s `signPayload`/
`verifyPayloadSignature`/`stableHash` make (Ed25519 via Node's built-in
`node:crypto`, over the SHA-256 digest of the canonical-JSON
serialization) — no new cryptographic algorithm is introduced, and the
canonicalizer is the same single authoritative implementation both sides
use (see §11). `SovereignProof` is a new, protocol-native envelope shape
(not `GovernanceSignature`) because `GovernanceSignature`'s
`provenance.chainPosition`/`previousHash` fields are audit-log-chain
concepts that don't belong in a portable sovereign manifest, and because
protocol cannot depend on the package that defines it regardless.

`verifySovereignManifest()` never collapses "the signature is
cryptographically valid" with "the signer's identity is verified" — see
§7.

## 7. Verification result shape

```ts
interface SovereignManifestVerificationResult {
  valid: boolean;
  checks: {
    manifestStructure: 'valid' | 'invalid';
    manifestDigest: 'valid' | 'invalid';
    signature: 'valid' | 'invalid';
    contentDigest: 'valid' | 'invalid' | 'not_performed';
    issuerBinding: 'verified' | 'unverified' | 'not_performed';
  };
  reasons: readonly string[];
}
```

- `contentDigest` is `'not_performed'`, never a silent `'valid'`, when no
  content bytes were supplied — see
  `tests/contracts/sovereign-manifest.test.ts` "honestly reports content
  verification as not performed". It is also `'not_performed'` when the
  manifest declares no `contentIdentity` at all, *including* when the
  caller supplied `contentBytes`: with no declared commitment there is
  nothing to compare against, and Protocol will not invent a comparison
  target (reason code
  `CONTENT_DIGEST_NOT_PERFORMED_NO_CONTENT_IDENTITY`). Absence of an
  integrity assertion is never reported as `'invalid'` — that would claim
  an integrity failure that nobody asserted.
- `issuerBinding` distinguishes "nobody attempted to bind the signature to
  a known principal" (`not_performed`, when no
  `VerificationKeyResolver` is supplied) from "an attempt was made and it
  failed" (`unverified`) from "an attempt was made and the resolved key
  matches" (`verified`). The resolver reused here is
  `VerificationKeyResolver` from the pre-existing
  `@aoc/protocol/adapters` surface — no new key/principal abstraction was
  invented for this slice. A `not_performed` issuer-binding check does
  not by itself fail `valid`; an attempted-and-failed one does.
- `valid` is `true` only when every *attempted* check passed. It is never
  a bare `true`/`false` standing in for "everything was checked" when
  some checks were honestly skipped — `checks` makes exactly what was and
  was not attempted visible to the caller.

## 8. Claims: reusing CanonicalClaim, not forking it

The Sovereign Digital Asset Readiness Audit found the existing
`CanonicalClaim` (RFC-005 trust-chain) architecture in
`packages/protocol/src/claims/` directionally correct. This slice extends
it minimally rather than building a parallel rights system:

- `ClaimType` gained two members: `Origin` and `Authorship` (see
  `packages/protocol/src/claims/claim-enums.ts`). Both are generic —
  domain-specific rights taxonomies (e.g. music roles) belong to future
  domain profiles, not core Protocol.
- `OriginClaim` and `AuthorityClaim`
  (`packages/protocol/src/manifest/claims.ts`) are `CanonicalClaim`-typed
  interfaces, not new unrelated shapes. `subject` is the
  `SovereignAssetId` (already representable — `CanonicalSubject = string
  | CanonicalPrincipalRef`); domain-specific fields
  (`assertedOrigin`, authority `kind`/`statement`) live in `metadata`,
  which `CanonicalClaim` already supports.
- `AuthorityClaimKind` (`Authorship | Rights | License | Custom`) is a
  protocol-native sub-kind carried in `metadata.kind` rather than a new
  top-level `ClaimType` per role, keeping the core vocabulary generic.
- `SignedClaim<TClaim>` wraps any `CanonicalClaim` with a digest and a
  `SovereignProof`, using the same signing primitives as manifests (§6).
  Mutating a signed claim's `subject`, `issuer`, or any other field
  invalidates verification — see
  `tests/contracts/sovereign-claims.test.ts`.
- `StandingStatus` gained one member: `Contested`. A `CanonicalStanding`
  with `status: 'Contested'` records a dispute against a `claimRef`
  without deleting, mutating, or replacing the original claim — the claim
  and its evidence remain independently verifiable throughout. Legal or
  institutional adjudication of a contested claim is explicitly external
  to Protocol (and, per the audit correction, is **not** Enterprise's
  call either — Enterprise may operationally decide to restrict
  commercial execution while a claim is disputed, but that is a
  governance decision about execution, not a determination of legal
  ownership).

## 9. Content match ≠ ownership conflict

`SovereignAssetRegistry.findByContentDigest()`
(`packages/protocol/src/manifest/registry.ts`) is the only mechanism this
slice provides for detecting that two `SovereignAssetId`s share an exact
`ContentIdentity`. Finding more than one result is reported as a plain
fact — a content match — and is never treated automatically as:

- invalid (the second registration is not blocked or rejected);
- the same legal asset;
- proof that the first registrant is the legal owner;
- proof of fraud by the second registrant.

`tests/contracts/sovereign-registry.test.ts` demonstrates this directly:
registering the same bytes under two different registrants succeeds for
both, both resolve independently, and `findByContentDigest` surfaces both
without picking a side. Marking one of the underlying claims `Contested`
(§8) is how an actual dispute gets represented, on request, without the
Protocol ever adjudicating it.

## 10. Versioning and lineage

`manifestVersion` is a real, validated field (`>= 1`, integer) in v1. The
registry port requires infrastructure to retain and resolve exact signed
versions; the test-only reference registry demonstrates that immutability.
The Protocol package does not implement a production history ledger, and a
`superseded` manifest's predecessor is not cryptographically linked or chained
by the v1 schema. Full lineage (ancestor/descendant traversal,
multi-parent derivation) was `SAP-GAP-005`, explicitly scoped beyond this
slice and not started here; it is now implemented as a *claim*, in
AOC-P-SM-05 — see §16.

`SovereignManifestV1` deliberately has **no** `parentId` field of any
kind, singular or otherwise — adding a singular `parentId` would force
a breaking migration the moment multi-parent derivation is needed. That
prediction held: SM-05 added multi-parent lineage and the manifest still has
no `parentId`, because lineage turned out to belong in the claim layer rather
than in the identity record at all (§16). Inherited obligations remain
deliberately absent — nothing travels along a lineage edge.

## 11. Canonicalization ownership (relocation, not a new implementation)

Slice 0 made `crypto/canonicalize.ts` (in the `@aoc-runtime/crypto`
workspace package) the single authoritative `aoc-canonical-json/1`
implementation, with the root `canonicalize.ts` re-exporting it. This
slice's `SovereignManifestV1` is contractually required to canonicalize
under `aoc-canonical-json/1` — but `@aoc/protocol` cannot depend on
`@aoc-runtime/crypto` (§6, §12). Since `@aoc-runtime/crypto` depending on
`@aoc/protocol` *is* an allowed edge (`role === 'runtime'` may depend on
`role === 'protocol'`), the fix was to relocate the implementation, not
duplicate it:

- The exact same implementation (byte-identical, comment header updated
  to record this move) now lives at
  `packages/protocol/src/canonical/canonicalize.ts`, exported as
  `@aoc/protocol/canonical`.
- `crypto/canonicalize.ts` is now a two-line re-export of
  `@aoc/protocol/canonical`.
- The root `canonicalize.ts` re-export (consumed unchanged by `content/`,
  `pack/`, `field/`, `storage/`, `capability/`, `consent/`, `aocId.ts`)
  did not need to change at all — it still re-exports from
  `./crypto/canonicalize`, which now itself re-exports one level further.
- `crypto/__tests__/canonicalize.test.ts` and
  `canonicalization-integration.test.ts` (Slice 0's golden vectors) pass
  unchanged, proving no observable behavior changed.

This is a relocation of *ownership*, not a redo of Slice 0's substantive
decision (which canonicalizer to standardize on, and its fail-closed
semantics) — that decision is unchanged.

## 12. Ed25519 signing: why it isn't literally `crypto/engine.ts`

See §6. The short version: `@aoc/protocol` may not depend on
`@aoc-runtime/crypto` (enforced by `scripts/check-version-graph.mjs`), so
`signPayload`/`verifyPayloadSignature`/`GovernanceSignature` could not be
imported. `packages/protocol/src/manifest/proof.ts` reimplements the same
Ed25519-over-canonical-JSON-SHA-256 pattern using `node:crypto` directly.
No new algorithm was introduced.

Because this repository's `tsconfig.base.json` uses classic (`Node10`)
module resolution — which does not understand the `node:` specifier
scheme, and for which a bare `'crypto'` specifier is ambiguous here
because a real workspace package lives at the repo-root `crypto/`
directory — `packages/protocol/src/node-compat.d.ts` declares the same
minimal `node:crypto` ambient shim `crypto/node-compat.d.ts` already uses
for the same reason, scoped to `@aoc/protocol`'s own build and excluded
from `tsconfig.test.json` so it never conflicts with the real
`@types/node` declarations Jest's full-repo type-checked run uses.

## 13. Registry and resolution ports

```ts
interface SovereignAssetRegistry {
  register(signed: SignedSovereignManifest): void | Promise<void>;
  resolve(sovereignAssetId: SovereignAssetId): SignedSovereignManifest | null | Promise<...>;
  findByContentDigest(contentIdentity: ContentIdentity): readonly SignedSovereignManifest[] | Promise<...>;
}
resolveSovereignAsset(registry, sovereignAssetId) // pure lookup only
```

`@aoc/protocol` declares the port only — no graph database, no
blockchain, no vendor binding, and (per `docs/architecture/protocol-
adapter-contracts.md`'s "Protocol owns adapter interfaces only... Protocol
must not depend on runtime implementations") no concrete class ships in
the published package either. The reference in-memory implementation used
by this slice's own tests,
`tests/contracts/fixtures/in-memory-sovereign-asset-registry.ts`, is
explicitly test-only — no persistence, no concurrency control, no
replication — and is not part of the `@aoc/protocol` publishable surface.
A production implementation must supply its own durable registry behind
the same interface (this is exactly the shape AOC Enterprise's Slice 2
`ProtectedResource` construction is expected to consume — see the final
report's "Enterprise integration readiness" section).

`resolveSovereignAsset()` and `SovereignAssetRegistry.resolve()` never
authorize access, issue grants, evaluate Enterprise policy, or call
Enterprise. They resolve sovereign semantics only.

## 14. Out of scope for this slice

Per the implementation brief, this slice does not implement, and this
document does not claim:

- Full lineage: ancestor/descendant traversal, multi-parent derivation
  (`SAP-GAP-005`) — out of scope for *this slice*, and since implemented by
  AOC-P-SM-05 (§16). Inherited obligations remain out of scope permanently at
  this layer: provenance describes history, it does not transfer rights.
- Fingerprinting: ISCC, acoustic fingerprinting, perceptual hashing,
  watermarking.
- Any Enterprise concept: `AccessGrant`, `ExecutionGrant`,
  `ProtectedResource`, encryption of distributed assets, `KeyBroker`, kill
  switch, settlement, royalties.
- Legal adjudication or automatic ownership resolution of any kind.
- Blockchain of any kind.
- (SM-02) A common capability invocation layer, evidence-on-invocation,
  Provenance lineage, a Portability capsule, an Interoperability capsule,
  structured Licensing & Terms, a Governance Compatibility bundle,
  tokenization of anything, provider resolution, or convergence of the
  legacy access-governance runtime (`consent/ScopeEntry`,
  `protocol/enforcement`, `protocol/execution`) onto the canonical subject
  model — see §15.

None of these are implied by anything in this document. In particular:
**AOC does not prevent copying**, and **registration does not establish
legal ownership merely because someone registered first** — both are
explicitly false statements this slice's design was required to avoid
making true by accident.

## 15. Universal sovereign subject reference (AOC-P-SM-02)

Status: implemented. Slice 1 made `SovereignAssetId` independent of
content, storage and manifest — but `SovereignManifestV1` still *required*
`contentIdentity`, so the registered sovereign record silently assumed every
sovereign subject has a byte-addressable representation. That is correct for
`photo.jpg` and artificial for an AI agent, an API resource, an external
token, a legal/institutional entitlement, a building, or an object from a
system nobody has built yet: those subjects would have had to fabricate
stand-in bytes purely to obtain a digest so the manifest could exist.
SM-02 removes that requirement without weakening integrity anywhere.

### 15.1 Three concepts that must never collapse

```text
SovereignAssetId    what the thing is in AOC sovereignty space
ExternalReference   how another namespace names/points at it
ContentIdentity     whether one representation matches an integrity commitment
```

They may be associated on the same manifest. They are never equivalent, and
none of them derives another:

```text
SovereignAssetId ≠ externalReference.namespace / .id / .locator
SovereignAssetId ≠ contentIdentity.digest
externalReference ≠ AuthorityClaim
contentIdentity is optional for sovereign identity
```

### 15.2 The types

```ts
// @aoc/protocol/identity
interface SovereignExternalReference {
  readonly namespace: string;   // which external namespace owns `id`; open-world
  readonly id: string;          // opaque inside that namespace; never parsed
  readonly locator?: string;    // passive addressing hint; never dereferenced
}

interface SovereignSubjectRef {
  readonly sovereignAssetId: SovereignAssetId;
  readonly externalReference?: SovereignExternalReference;
}

validateSovereignExternalReference(value: unknown): { valid: boolean; reasons: readonly string[] }
isValidSovereignExternalReference(value: unknown): value is SovereignExternalReference
buildSovereignExternalReference({ namespace, id, locator? }): SovereignExternalReference
isValidSovereignSubjectRef(value: unknown): value is SovereignSubjectRef
sovereignExternalReferencesEqual(a, b): boolean
toSovereignSubjectRef(subject: SovereignSubjectRef): SovereignSubjectRef
```

`SovereignSubjectRef` is a general Protocol subject reference, not a
manifest field group: `SovereignManifestV1 extends SovereignSubjectRef`
(§4), so the canonical subject model and the registered sovereign record
cannot drift into disconnected islands, and later work packages
(capability invocation, a governance bundle) can carry "which sovereign
subject this is" without knowing what kind of thing it is.

### 15.3 What Protocol deliberately does not validate

Validation is minimal on purpose: `namespace` and `id` must be non-blank
strings, and `locator` must be a non-blank string *if present*. No URL/URI
syntax, DID, UUID, SHA-256, CID, blockchain-address form, HTTP(S) scheme,
known provider or known namespace is required or checked, and there is no
`ExternalReferenceKind` enum and no branch on `namespace` anywhere — an
unknown future namespace is valid by construction. Values are never
trimmed, normalized or rewritten: an external identifier must survive
Protocol byte-exactly. A present-but-`undefined` optional field is
reported as a structural defect rather than accepted, because
`aoc-canonical-json/1` refuses to serialize `undefined` and an absent
optional field must therefore be structurally *omitted* to be signable.

### 15.4 Locators are passive data

Protocol performs **zero** network activity: it never fetches, resolves,
connects to, or probes a locator, never queries a registry, provider,
chain or namespace authority, and never checks that the referenced object
exists. A locator is signed metadata and nothing more, which is also what
keeps this contract free of SSRF, hidden I/O, provider coupling, and false
verification claims. `tests/contracts/sovereign-subject-reference.test.ts`
asserts this structurally (no network primitive anywhere in
`packages/protocol/src`) and behaviourally (a throwing `fetch` is never
called across build/sign/serialize/verify).

### 15.5 What a valid signature over an external reference proves

`externalReference` is part of the signed manifest, so mutating its
`namespace`, `id`, or `locator` after signing invalidates both the manifest
digest and the signature — the binding is tamper-evident. What that proves
is exactly one thing: **the signer signed this binding.** It does not prove
the external object exists, is reachable, is owned or controlled by the
signer, or that the external namespace agrees. `registrant` remains "who
submitted this", `AuthorityClaim` remains a claim, and legal/institutional
adjudication remains external (§5, §8).

### 15.6 Integrity is optional, never fabricated

`contentIdentity` is optional on the manifest, and absence is represented
by structural omission — never by `contentIdentity: undefined`, and never
by a fabricated digest such as `sha256(externalReference.id)`,
`sha256(locator)`, or `sha256(canonicalize(subject))`. Absence is truthful;
fabricated integrity is not. Verification reflects this honestly (§7):

| Manifest | `contentBytes` supplied | `contentDigest` |
| --- | --- | --- |
| declares `contentIdentity` | correct bytes | `valid` |
| declares `contentIdentity` | wrong bytes | `invalid` (overall `valid: false`) |
| declares `contentIdentity` | none | `not_performed` |
| declares no `contentIdentity` | none | `not_performed` |
| declares no `contentIdentity` | any bytes | `not_performed` + reason `CONTENT_DIGEST_NOT_PERFORMED_NO_CONTENT_IDENTITY` |

A manifest with no declared integrity can still be overall `valid`: every
check that was applicable passed, and the one that was not applicable is
visibly `not_performed` rather than silently `valid`.

The registry port follows the same rule: a manifest that declares no
`contentIdentity` is never indexed under, or matched by,
`findByContentDigest` — absence of an assertion is not a wildcard (§13).

### 15.7 Non-byte subjects are first-class

All six subjects below use the *same* generic structures. There is no
`TokenSubjectRef`, `BuildingSubjectRef`, `AgentSubjectRef` or
`APIResourceRef`, and no domain profile is needed for any of them.

| Subject | External reference | `contentIdentity` |
| --- | --- | --- |
| `photo.jpg` | optional | yes — that is where byte integrity lives |
| AI agent | `example:agent-system` / `agent-92817` / `agent://runtime/92817` | no |
| external token | `example:token-network` / `token-0xabc-42` | no |
| API resource | `example:api` / `customer-resource-92817` / `https://example.invalid/...` | no |
| building reference | `example:property-registry` / `folio-92817` | no |
| unknown future object | `alien-system-v47` / `alien-resource-92817` / `future://provider/object/92817` | no |

Those namespaces are test examples, not canonical namespaces, and none of
them is hardcoded in Protocol.

An external token and a physical building each receive their own
independent `SovereignAssetId`. Protocol tokenizes neither and asserts **no**
relationship between them: "this token represents that building" is an
attributable claim, not something a subject reference may imply.

### 15.8 Identity survives location and representation change

- Changing `externalReference.locator` in a new manifest version keeps the
  same `SovereignAssetId` (and produces a different manifest digest). This
  is the seed of Portability; the Portability capability itself is not built
  here.
- Adding or changing `contentIdentity` in a later manifest version keeps the
  same `SovereignAssetId`.
- Historical versions are never rewritten: `resolveVersion(id, n)` continues
  to return the exact signed version registered as `n`, and each version
  verifies independently.

`externalReference` deliberately carries no history: no `parentId`,
`derivedFrom`, `createdBy`, `ownedBy`, or `transferredFrom`. It answers
"what external thing is this identity associated with?", never "where did
it come from" — and that separation still holds after SM-05, which put
history in `DerivationClaim` rather than anywhere in the identity record
(§16).

### 15.9 Wire-contract decision: `aoc-sovereign-manifest/1` is retained

SM-02 makes a previously required field optional and adds one new optional
field. That is deliberately *not* a new schema version, and the reasoning is
recorded here rather than assumed:

- **New readers accept every old payload.** Every pre-SM-02 manifest (which
  always carried `contentIdentity` and never carried `externalReference`)
  builds, canonicalizes, signs, verifies and resolves byte-identically —
  this is backward compatibility in the sense `SEMVER_POLICY.md` uses, and
  it is covered by regression tests, not assertion.
- **The newly valid payload set is larger.** A pre-SM-02 reader would
  reject a manifest that declares no `contentIdentity`
  (`INVALID_CONTENT_IDENTITY`). That is a forward-compatibility limit, and
  it is bounded to zero in practice because no such reader has ever been
  released: `@aoc/protocol` is `"private": true` and has never been
  published to any registry (`docs/release/REGISTRY_READINESS.md`,
  `docs/release/PRERELEASE_POLICY.md`), so there is no deployed consumer
  that could receive a payload it cannot parse.
- **Introducing `aoc-sovereign-manifest/2` would be the larger, less
  truthful change**: it would require a dual-support window for two schema
  versions and would have to reverse the existing fail-closed contract test
  that asserts `aoc-sovereign-manifest/2` is unsupported — a real
  compatibility break taken purely for symbolism.

Consequence: a **minor** changeset on `@aoc/protocol` (additive exports plus
an additive contract relaxation, no existing export changed, no export map
change — the new symbols ship on the existing `@aoc/protocol/identity`
subpath).

### 15.10 What SM-02 does not claim

The correct claim after SM-02 is: *the canonical AOC Protocol sovereign
subject model can represent arbitrary external things without requiring
content integrity.* It is **not** "every AOC runtime path now supports
arbitrary subjects". The legacy access-governance runtime is untouched and
still cannot consume arbitrary subjects:

- `consent/ScopeEntry` still models a resource as
  `{ type: 'field' | 'content' | 'pack', ref: sha256 }` — a closed kind set
  with a hash-shaped ref;
- `protocol/enforcement` and `protocol/execution` resources still follow
  that legacy shape;
- `content/contentId.ts` and `content/contentManifest.ts` still fold
  storage/manifest metadata into a content hash (the contradictory legacy
  model §3 already flags).

Converging those consumers onto `SovereignSubjectRef` is deliberately
deferred to a later legacy-convergence work package, and SM-02 changed none
of them.

## 16. Derivation lineage as a claim (AOC-P-SM-05)

Status: implemented. This section closes `SAP-GAP-005` and records *how*, so
the earlier sections' "lineage is out of scope" statements stay readable as
history rather than as current truth.

Slice 1 predicted that a singular `manifest.parentId` would force a breaking
migration once multi-parent derivation was needed. The prediction held, and
the resolution was not "add a better manifest field" — it was that lineage
does not belong in the identity record at all.

### 16.1 `SovereignManifestV1` still has no lineage field

SM-05 added **no** `parentId`, `derivedFrom`, `parents`, `ancestors` or any
other lineage field to `SovereignManifestV1`. The schema is unchanged. The
reasoning:

- a sovereign subject may have zero, one or many parents, so a singular field
  is wrong and a plural one only moves the problem;
- several issuers may assert *different, competing* lineages for the same
  subject — a manifest field can hold only one of them;
- a lineage assertion must be contestable, and a field in the identity record
  is not an assertion anyone can dispute without rewriting identity;
- manifest evolution and asset derivation are different facts. `manifestVersion`
  2 is *the same subject, later*. A derived asset is *a different subject*. A
  field on the manifest invites conflating them.

### 16.2 Lineage is a `CanonicalClaim`

```
   metadata.sourceSovereignAssetIds          claim.subject
        A ──┐
            ├────────── relation ─────────────► C
        B ──┘
```

`DerivationClaim` (`@aoc/protocol/manifest`) is a `CanonicalClaim` with the new
`ClaimType.Derivation`. Its `subject` is the **child**; the asserted parents
live in `metadata.sourceSovereignAssetIds`, with a `relation`
(`DerivedFrom`, `TransformedFrom`, `CombinedFrom`, `ExtractedFrom`,
`GeneratedFrom`, `Custom`), an optional `statement` and an optional
`occurredAt`. It reuses `CanonicalClaim`, `CanonicalIssuer`,
`CanonicalTimestamp` and `CanonicalEvidenceId` — there is no parallel lineage
object model.

Because it is a claim, everything the claim layer already provides applies:
multiple issuers may assert competing lineage for one subject, and any of
those assertions can be marked `Contested` through the existing `contestClaim`
without the claim being deleted or rewritten.

At least one source is required, duplicates are rejected rather than silently
collapsed, and direct self-derivation `A → A` is rejected. That is the only
cycle claim a single assertion makes — one claim cannot establish that a wider
graph is acyclic.

### 16.3 Edges name subjects, not locations

A source is a `SovereignAssetId` and never an `externalReference.id`, locator,
URL, CID, `ContentIdentity`, `manifestDigest` or provider id. This is the same
invariant §1 and §15.8 establish for identity, applied to lineage: `A → C` must
remain true after A migrates to another provider, changes locator or is
re-encoded. Lineage identity is *subject* identity.

A source that has no `SovereignAssetId` yet is given one through AOC.IDENTITY
first. That composition is deliberate — Protocol grows no second, weaker kind
of "unidentified external ancestor".

### 16.4 `occurredAt` is not `issuedAt`

`issuedAt` is when the claim was recorded; `occurredAt` is when the issuer
asserts the transformation happened. A 2026 claim about a 2019 transformation is
an ordinary case, and it is what makes importing historical assertions possible.
Both are asserted values: neither establishes that the event occurred.

### 16.5 Traversal without infrastructure

`traceSovereignLineage` walks a caller-supplied set of derivation claims in
either direction (`ancestors`, `descendants`) and returns a portable
`SovereignLineageTrace` of nodes, edges, `cycleDetected`, `truncated` and the
applied `maxDepth`. Each edge keeps the `claimId` that created it.

There is no global lineage database, graph service or external graph library.
Protocol defines the semantics; where claims are stored and indexed is
infrastructure's decision, and requiring a global graph to answer "what did this
come from?" would end the portability the rest of this document is built on. The
consequence is stated rather than hidden: a trace is complete *with respect to
the dataset supplied to it*.

Traversal is iterative and visited-set guarded, ordering is deterministic (depth,
then `sovereignAssetId`), a cycle in the supplied data is reported as a
successful analysis rather than a crash, and `truncated` marks a depth-bounded
walk instead of presenting it as a complete lineage.

### 16.6 Nothing travels along a lineage edge

This is the invariant that keeps the mineral boundaries intact. If `C` derives
from `A`, Protocol does **not** copy to `C`:

`A`'s licence, authority claims, rights assertions, restrictions, obligations,
ownership, governance policy, evidence refs, or authorship.

Lineage describes provenance. Rights inheritance, if it is ever appropriate at
all, belongs to `AOC.LICENSING_TERMS` and `AOC.GOVERNANCE_COMPATIBILITY`.
Likewise, derivation and authorship are independent assertions — `C` deriving
from `A` implies neither that they share an author nor that they do not — and
derivation and integrity are independent: a transformation normally *changes*
the bytes, and two subjects sharing a `ContentIdentity` are not thereby related.

### 16.7 What SM-05 does not claim

`SAP-GAP-005` is closed for ancestry, descent and multi-parent derivation. It is
not closed for everything a reader might file under "provenance":

- claims are **unsigned** until separately passed through the existing signing
  primitives; there is still no formal Verifiability capsule;
- `evidenceRefs` are references, not resolved evidence, and a bare ref is not
  proof its target exists;
- **custody** — possession, control, legal title, custodian roles, transfer
  intervals, jurisdiction — is deliberately not modelled, and inventing a custody
  state machine here would fake completeness;
- a production history ledger and cryptographic chaining of superseded manifest
  versions (§10) remain unbuilt;
- legal and historical truth remain external. Protocol records assertions and
  disputes; it adjudicates neither.
