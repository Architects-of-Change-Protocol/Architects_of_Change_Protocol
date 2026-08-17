---
'@aoc/protocol': minor
---

Add the fourth production Sovereignty Capability capsule — `AOC.PORTABILITY` — to
`@aoc/protocol/sovereignty-capabilities`, together with the canonical sovereign
portability bundle on a new `@aoc/protocol/portability` subpath. SM-04 made
Identity and Integrity real implementations of the SM-03 socket and SM-05 added
Provenance; Portability now joins them, and the gap it closes is that a
subject's sovereign representation previously existed only as live runtime
objects inside whichever application created it.

New subpath `@aoc/protocol/portability`:
`SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION`
(`aoc-sovereignty-portability-bundle/1`), `SovereigntyPortabilityBundleV1`, the
manifest artifact union (`PortableSovereignManifestArtifact` over
`{ kind: 'manifest' }` and `{ kind: 'signed-manifest' }`), the claim artifact
union (`PortableSovereignClaimArtifact` over `{ kind: 'claim' }` and
`{ kind: 'signed-claim' }` around `PortableSovereignClaim` =
`OriginClaim | AuthorityClaim | DerivationClaim`), their closed kind
vocabularies and accessors `portableManifestOf` / `portableClaimOf`,
`buildSovereigntyPortabilityBundleV1` and its non-throwing
`tryBuildSovereigntyPortabilityBundleV1`,
`validateSovereigntyPortabilityBundleV1` / `isValidSovereigntyPortabilityBundleV1`,
the artifact type guards, `serializeSovereigntyPortabilityBundle`,
`parseSovereigntyPortabilityBundle`, and the stable
`SOVEREIGNTY_PORTABILITY_REASON_CODES` map.

New on `@aoc/protocol/claims`: the first runtime structural validators for
`CanonicalStanding` — `validateCanonicalStanding` / `isValidCanonicalStanding`
and `CanonicalStandingValidationResult`. The type was previously type-only, and
a bundle that carries standing records across an external trust boundary needs
to be able to check them. They validate shape only: no dispute is adjudicated,
no timestamps are ordered and no `claimRef` is resolved.

New on `@aoc/protocol/sovereignty-capabilities`:
`createPortabilitySovereigntyCapabilityImplementation`, its input/output unions
and per-operation contracts, `PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS`
(`export-bundle`, `import-bundle`), the stable
`PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES` map — which spreads in the
bundle-level codes so one defect has one code on every surface — and
`validatePortabilitySovereigntyCapabilityInput` /
`isValidPortabilitySovereigntyCapabilityInput`.

The bundle is a *representation*, not a new sovereign object. It has six
envelope fields and deliberately no `bundleId` (the subject's identity is
already `SovereignAssetId`), no `exportedAt` (an automatic timestamp would make
the same sovereign state serialize differently every time; when an export
happened is recorded truthfully in the SM-03 invocation evidence), no bundle
digest, hash, checksum or signature, no provider, storage pointer, bucket,
region, tenant, source-application or destination-application field, no content
bytes, no completeness flag, and no licence, ownership, custody, policy or
governance semantics. The subject is the SM-02 `SovereignSubjectRef` itself
rather than a parallel portable subject model, and
`externalReference.locator` is preserved verbatim but never dereferenced,
required, or treated as identity or transport.

Determinism is a contract, not an accident. Envelope arrays are copied and
canonically ordered — manifests by `manifestVersion` ascending, claims by
underlying claim `id`, standings by `id` — with duplicates on all three keys
rejected so the order is total. Caller arrays are never mutated, and nested
artifacts are never rewritten: `evidenceRefs` are not sorted, `authorityClaims`
inside a historical manifest are not reordered, statements, locators and proof
timestamps are untouched, and embedded manifest claims are not extracted or
deduplicated against the bundle's own claim list. Canonical import
normalization is envelope ordering only. The result is that an equivalent
artifact set in any input order produces one canonical serialization, and
repeated export/import cycles produce byte-identical output with no drift.

Serialization is the existing `aoc-canonical-json/1` and nothing else: no
second canonicalizer, no pretty-printed canonical form, and no ZIP, TAR, CBOR,
MessagePack, protobuf, custom extension, compression or encryption.
`parseSovereigntyPortabilityBundle` is an explicit external trust boundary that
fails closed with a stable reason rather than a leaked `JSON.parse` exception —
including on an unsupported *future* bundle schema and on an unknown artifact
kind, both rejected rather than best-effort imported or silently skipped, since
for a sovereignty transport a failed import is strictly better than a quietly
lossy one. Unrecognized fields in the structures SM-06 owns and rebuilds are
reported rather than dropped; nested artifacts are carried by reference and
never rebuilt. Structural validity is reported as `valid`, never `verified`.

Boundaries are deliberate. Portability never mints a `SovereignAssetId` —
`export-bundle` requires an existing subject (`PORTABILITY_SUBJECT_REQUIRED`)
and `import-bundle` returns the existing subject that arrived in the bundle. It
never signs or verifies: supplied `SignedSovereignManifest` and `SignedClaim`
material is preserved exactly, so a structurally transportable but
cryptographically invalid artifact transports successfully and is judged later
by whoever is entitled to. It never computes a `ContentIdentity` or a manifest
digest, and never repairs a supplied `manifestDigest`. It creates no provenance
— transport history is not sovereign provenance — leaves a `Contested` standing
contested, and never reactivates a manifest lifecycle state. It transfers no
ownership, title, rights, custody or authority. It reaches nothing outside
itself: no filesystem, network, provider, chain, registry, database or
Enterprise dependency, no key material or credential, and no recursive ancestor
expansion — a `DerivationClaim` naming sources A and B transports those
references intact without fetching or building bundles for them.

Import is not persistence. No `SovereignAssetRegistry` is injected, and that is
not only principle: `register` takes a `SignedSovereignManifest` while
AOC.IDENTITY produces unsigned ones, so defining import as "call register"
would have made signing a precondition of portability. Import means the
canonical AOC representation was accepted and reconstructed in memory; storing
it is the consumer's infrastructure decision. `import-bundle` therefore works
with **no** invocation subject, which is the ordinary case for a bundle
arriving from elsewhere, and a subject supplied explicitly must match the
bundle's exactly (`PORTABILITY_SUBJECT_MISMATCH`) rather than being reconciled.

Integrity over a bundle is explicit mineral composition rather than a hidden
field: serialize the bundle, then invoke AOC.INTEGRITY over the UTF-8 bytes.
All three `test-consumers/` fixtures verify from a real `npm pack` tarball that
this holds across a transport — the wire string and its `ContentIdentity` are
identical before and after import — and the strongest fixture runs the first
four-mineral flow end to end: Integrity measures bytes, Identity mints the
subject and manifest, Provenance asserts an origin and contests it, Portability
exports the canonical bundle, and a second runtime holding only the JSON string
reconstructs the same subject, manifest, claim and standing. No fake
implementation, no source import, no Enterprise package, no database and no
provider.

Additive only: no existing export changed, the canonical inventory remains
eight and read-only, capability versions are unchanged at `1.0.0`, the capsule
derives its advertised ref from the SM-01 registry rather than a literal, no
module has import-time side effects, and no global implementation registry is
introduced. The portability bundle is a Portability *contract*, not a ninth
mineral. SM-06 establishes one canonical AOC wire representation and a
versioned schema so it can be safely imported at all; whether a non-AOC system
can understand, map or translate those semantics is AOC.INTEROPERABILITY's
question, and no external-standard mapping exists here.
