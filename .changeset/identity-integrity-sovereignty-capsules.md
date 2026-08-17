---
'@aoc/protocol': minor
---

Add the first two production Sovereignty Capability capsules — `AOC.IDENTITY` and
`AOC.INTEGRITY` — to `@aoc/protocol/sovereignty-capabilities`. SM-01 defined
*what* the eight sovereignty minerals are, SM-02 defined *what* can receive
sovereignty and SM-03 defined *how* a capability is consumed; two of the eight
are now real implementations of that socket rather than canonical descriptors
beside disconnected primitives.

New: `createIdentitySovereigntyCapabilityImplementation` and
`createIntegritySovereigntyCapabilityImplementation`, their input/output
contracts (`IdentitySovereigntyCapabilityInput` / `…Output`,
`IntegritySovereigntyCapabilityInput` / `…Output` and the operation members),
their public validators (`validateIdentitySovereigntyCapabilityInput`,
`isValidIdentitySovereigntyCapabilityInput` and the Integrity equivalents), the
stable reason-code maps `IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES` and
`INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES`, and
`INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS`.

Identity creates a sovereign identity: it mints a new `SovereignAssetId`,
associates an optional open-world external reference, binds an optional
*precomputed* `ContentIdentity`, records the registrant, and returns the
resulting `SovereignSubjectRef` plus a canonical `SovereignManifestV1`. It
requires no subject on the invocation and returns the one it created; an
invocation that already names a subject is an ordinary failed outcome
(`IDENTITY_SUBJECT_ALREADY_EXISTS`) rather than a second mint. Integrity wraps
the existing `computeContentIdentity`, `verifyContentIdentity` and
`computeManifestDigest` primitives behind three closed operations, works over
bytes with no sovereign identity at all, and never mints one.

No new semantics were invented underneath: `mintSovereignAssetId`,
`buildSovereignManifestV1`, the SM-02 subject/reference validators and the three
integrity primitives are reused verbatim, and there is no second hash, digest or
canonicalization implementation.

Deliberate boundaries. Identity never computes or verifies a `ContentIdentity`
and Integrity never creates identity, so the two compose through their public
output and input without either depending on the other. Identity does not sign:
its output is a `SovereignManifestV1`, never a `SignedSovereignManifest`, because
signature and issuer binding are Verifiability's contract — an unsigned manifest
is a canonical record, not cryptographic proof. Identity asserts no ownership;
`registrant` records who submitted a registration and nothing more. An Integrity
digest mismatch is reported as a *successful* check whose result is invalid
(`CONTENT_DIGEST_MISMATCH`), never as a failed execution, so "the capability
misbehaved" and "the assertion does not hold" stay distinguishable. Neither
capsule performs network, provider, chain, registry or storage I/O, handles key
material, or introduces provenance, lineage, licensing, governance, policy,
grant, pricing or tokenization semantics.

Additive only: no existing export changed, the canonical inventory remains eight
and read-only, capability versions are unchanged at `1.0.0`, both capsules derive
their advertised ref from the SM-01 registry rather than a literal, no module has
import-time side effects, and no global implementation registry is introduced —
a capsule is still passed explicitly to `invokeSovereigntyCapability`. The
remaining six minerals are not production capsules. Both flows, and their
composition under one shared correlation id, are verified from a real `npm pack`
tarball by all three `test-consumers/` fixtures, using no fake implementation and
no Enterprise package.
