# Sovereign Asset Core (AOC Protocol Slice 1)

Status: implemented. This document records the design of the first real
Sovereign Asset core in AOC Protocol, closing the primary gaps from the
Sovereign Digital Asset Readiness Audit that are in scope for this slice:
`SAP-GAP-001`, `SAP-GAP-002`, `SAP-GAP-003`, `SAP-GAP-004`, `SAP-GAP-006`,
and `SAP-GAP-009`. `SAP-GAP-005` (lineage) is explicitly **not** addressed
here — see "Out of scope" below.

Protocol Slice 0 (`SAP-GAP-008`, `SAP-GAP-010`) is the completed
foundation this slice builds on: the asset/content layer participates in
the real build/test graph, and `aoc-canonical-json/1` is the single
authoritative canonicalization contract. This slice does not redo either
decision.

## 1. The five core concepts

```text
SovereignAssetId
       │
       ├── persistent identity, independently minted
       ├── independent of storage, content, and manifest
       │
       ↓
Signed SovereignManifest
       │
       ├── ContentIdentity / contentDigest
       ├── registrant
       ├── originClaim
       ├── authorityClaims
       ├── manifest state
       ├── timestamp
       └── cryptographic proof
```

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
- **SovereignManifest** — a portable, signed record describing sovereign
  assertions about an asset: its content identity, registrant, origin
  claim, authority claims, and lifecycle state.
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

Fingerprinting, perceptual hashing, and watermarking are explicitly out of
scope (see §9) — a re-encoded copy of otherwise-identical content
legitimately produces a different `ContentIdentity`. That is expected,
not a defect, for this slice.

## 4. SovereignManifestV1 and SignedSovereignManifest

```ts
const SOVEREIGN_MANIFEST_SCHEMA_VERSION = 'aoc-sovereign-manifest/1';

interface SovereignManifestV1 {
  schemaVersion: typeof SOVEREIGN_MANIFEST_SCHEMA_VERSION;
  canonicalizationProfile: typeof CANONICAL_JSON_PROFILE; // 'aoc-canonical-json/1'
  sovereignAssetId: SovereignAssetId;
  manifestVersion: number;               // real field in v1; no history chain yet (§10)
  contentIdentity: ContentIdentity;
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
  verification as not performed".
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

## 10. Versioning and lineage (out of scope, not precluded)

`manifestVersion` is a real, validated field (`>= 1`, integer) in v1, but
this slice does not implement a supersession/history ledger — a
`superseded` manifest's predecessor is not linked, chained, or retained
anywhere by this code. Full lineage (ancestor/descendant traversal,
multi-parent derivation, inherited obligations) is `SAP-GAP-005`,
explicitly scoped to **Protocol Slice 2** and not started here.

`SovereignManifestV1` deliberately has **no** `parentId` field of any
kind, singular or otherwise — adding a singular `parentId` now would force
a breaking migration once Slice 2 needs multi-parent derivation. Nothing
in this schema shape prevents Slice 2 from adding parent-relationship,
manifest-version-chain, or derivative-relationship fields additively.

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

- Full lineage: ancestor/descendant traversal, multi-parent derivation,
  inherited obligations (`SAP-GAP-005`, Protocol Slice 2).
- Fingerprinting: ISCC, acoustic fingerprinting, perceptual hashing,
  watermarking.
- Any Enterprise concept: `AccessGrant`, `ExecutionGrant`,
  `ProtectedResource`, encryption of distributed assets, `KeyBroker`, kill
  switch, settlement, royalties.
- Legal adjudication or automatic ownership resolution of any kind.
- Blockchain of any kind.

None of these are implied by anything in this document. In particular:
**AOC does not prevent copying**, and **registration does not establish
legal ownership merely because someone registered first** — both are
explicitly false statements this slice's design was required to avoid
making true by accident.
