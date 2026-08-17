---
'@aoc/protocol': minor
---

Add the third production Sovereignty Capability capsule — `AOC.PROVENANCE` — to
`@aoc/protocol/sovereignty-capabilities`, together with the first first-class
derivation relationship and lineage semantics in `@aoc/protocol/manifest`.
SM-04 made Identity and Integrity real implementations of the SM-03 socket;
Provenance now joins them, and the major semantic gap it closes is derivation
lineage, which the Protocol previously had no machine-identifiable way to
express.

New on `@aoc/protocol/claims`: the additive `ClaimType.Derivation` member. No
existing `ClaimType` value was removed, renamed or re-spelled.

New on `@aoc/protocol/manifest`: `DerivationClaim`, `DerivationRelationKind`
(`DerivedFrom`, `TransformedFrom`, `CombinedFrom`, `ExtractedFrom`,
`GeneratedFrom`, `Custom`) with `DERIVATION_RELATION_KINDS`,
`BuildDerivationClaimInput`, `buildDerivationClaim`, and the structural
validators `validateDerivationClaim` / `isValidDerivationClaim` plus
`validateOriginClaim` / `isValidOriginClaim` and `validateAuthorityClaim` /
`isValidAuthorityClaim` for the pre-existing claim types. Lineage traversal
arrives as `traceSovereignLineage` with `SovereignLineageTrace`,
`SovereignLineageNode`, `SovereignLineageEdge`, `SovereignLineageDirection`,
`SOVEREIGN_LINEAGE_DIRECTIONS`, `SOVEREIGN_LINEAGE_TRACE_SCHEMA_VERSION`
(`aoc-sovereign-lineage-trace/1`), `DEFAULT_SOVEREIGN_LINEAGE_MAX_DEPTH` and
its input validators.

New on `@aoc/protocol/sovereignty-capabilities`:
`createProvenanceSovereigntyCapabilityImplementation`, its input/output unions
and per-operation contracts, `PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS`
(`declare-origin`, `declare-authorship`, `record-derivation`,
`contest-provenance-claim`, `trace-lineage`), the stable
`PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES` map, and
`validateProvenanceSovereigntyCapabilityInput` /
`isValidProvenanceSovereigntyCapabilityInput`.

Lineage lives in the claim layer, not the manifest. `SovereignManifestV1`
gained **no** `parentId` and no derivation field of any kind: a manifest field
would force a tree, make multi-parent composition inexpressible, turn a
contestable assertion into an identity field, and conflate manifest evolution
(the same subject at version 2) with asset derivation (a different subject made
from this one). A `DerivationClaim`'s `subject` is the child and its asserted
sources travel in metadata, so a subject can carry zero, one or many derivation
assertions from issuers who disagree. Sources are named by `SovereignAssetId`
and never by locator, provider, external reference, `ContentIdentity` or
manifest digest, so an edge survives provider migration and re-encoding.

Boundaries are deliberate. Provenance requires an existing subject and mints
none (`PROVENANCE_SUBJECT_REQUIRED`); it needs no bytes, `ContentIdentity` or
manifest digest, so a building or an API resource receives provenance exactly
like a file does. It never signs or verifies — `signClaim`, `verifySignedClaim`
and the manifest signing primitives are unchanged, still public, and remain
Verifiability's contract; the claims returned here are unsigned canonical
records. It never mutates a manifest, and contesting a claim returns a
`Contested` `CanonicalStanding` beside the untouched original rather than
deleting it, changing manifest state, or deciding who is right. Nothing is
inherited along a derivation edge: no licence, rights, obligations, authority,
authorship, evidence refs or governance policy. Equal `ContentIdentity` creates
no lineage and lineage implies no equal `ContentIdentity`. The formal capsule
exposes only `declare-authorship` with the kind fixed to `Authorship`; the
low-level `buildAuthorityClaim` still offers `License`, `Rights` and `Custom`,
which stay out of this capsule so the Licensing & Terms boundary holds. No
network, provider, chain, registry, database or filesystem access, and no key
material — `assertedOrigin` is stored as data and never dereferenced.

`trace-lineage` is a pure function over caller-supplied claims: there is no
global lineage database, graph service or external graph dependency. Traversal
is iterative and visited-set guarded, ordering is deterministic (by depth, then
`SovereignAssetId`), `maxDepth` truncation is reported through `truncated`
rather than presented as a complete lineage, and a cycle in the supplied data
is reported as `cycleDetected` on a **successful** analysis. Cycle detection is
a real back-edge search, so ordinary multi-parent diamonds are not mistaken for
loops. A single `record-derivation` rejects direct self-reference and claims
nothing about global acyclicity, and contested claims are not silently removed
from a trace — Protocol preserves history rather than hiding it.

Additive only: no existing export changed, the canonical inventory remains
eight and read-only, capability versions are unchanged at `1.0.0`, the capsule
derives its advertised ref from the SM-01 registry rather than a literal, no
module has import-time side effects, and no global implementation registry is
introduced. Derivation is a Provenance semantic, not a ninth mineral. All flows
— Identity → Provenance composition, multi-parent derivation, ancestor and
descendant traversal, and contestation — are verified from a real `npm pack`
tarball by all three `test-consumers/` fixtures, using no fake implementation
and no Enterprise package.
