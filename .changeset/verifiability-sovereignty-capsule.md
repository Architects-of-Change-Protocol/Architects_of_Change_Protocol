---
'@aoc/protocol': minor
---

Add the sixth production Sovereignty Capability capsule — `AOC.VERIFIABILITY` — to
`@aoc/protocol/sovereignty-capabilities`, together with the additive
`verifySignedSovereignClaim` reporting helper on `@aoc/protocol/manifest`.

SM-07 let a receiving system determine what an arriving sovereign representation
*means*. But understanding what an artifact claims to be says nothing about
whether the proof attached to it holds. AOC Protocol already owned strong
cryptographic primitives — `SovereignProof`, `SignedSovereignManifest`,
`SignedClaim`, `verifySovereignManifest`, `verifySignedClaim`,
`verifySovereignSignature` — but no capability exposed them through the common
SM-03 socket, so an independent consumer could not ask the question through the
same contract every other mineral answers through. SM-08 closes that gap without
adding a single line of new cryptography.

## New on `@aoc/protocol/sovereignty-capabilities`

`createVerifiabilitySovereigntyCapabilityImplementation({ verificationKeyResolver? })`
with three operations and their typed input/output unions, validators and reason
codes:

| Operation | Target | Report |
| --- | --- | --- |
| `verify-signed-manifest` | `SignedSovereignManifest` | structure, manifest digest, signature, content digest, issuer binding |
| `verify-signed-claim` | `SignedClaim` over an Origin, Authorship or Derivation claim | claim structure, claim digest, signature, issuer binding |
| `verify-sovereign-proof` | any canonicalizable payload + a `SovereignProof` | valid/invalid with a stable reason |

Every check is reported individually. A verification never collapses to one
boolean, and a check that was not attempted is reported as `not_performed`
rather than folded into an optimistic result.

**Verification-first, deliberately.** There is no `generate-key-pair`,
`sign-manifest`, `sign-claim` or `sign-payload` operation. The SM-03 invocation
input is a generic transport shared by every capability, and turning it into a
carrier for `privateKeyPem`, seed phrases, KMS secrets or wallet secrets would
solve the wrong problem. No private key field exists in the input contract in
any spelling, nothing in the capsule calls `generateSovereignKeyPair`, and
nothing in it signs. All signing primitives remain public and unchanged, and are
exactly what the test suites and all three packed consumer fixtures use to
produce the artifacts they then verify. A managed signer/KMS abstraction is
deferred rather than invented to fill the gap.

**No content bytes.** `verify-signed-manifest` accepts none, so
`checks.contentDigest` is honestly `not_performed` even for a manifest that
carries a real `ContentIdentity`. Accepting bytes would make the mineral
boundary read "Verifiability secretly performs Integrity"; a caller wanting both
runs AOC.INTEGRITY over the bytes and AOC.VERIFIABILITY over the signed
manifest, correlating them with one `correlationId`. Nothing ever turns
`not_performed` into `valid`.

**Optional, three-state issuer binding.** The Protocol-owned
`VerificationKeyResolver` is *injected*, never discovered — no global lookup, no
mutable registry, no ambient default. Without one the binding is
`not_performed`; a resolver returning no descriptor or a different `keyId` gives
`unverified` and an invalid verification; a resolver that throws is a failed
execution with `VERIFIABILITY_KEY_RESOLUTION_FAILED`, exactly one attempt, no
retry and no leaked exception text, message, stack or credential. "Not checked"
and "checked and did not bind" stay distinct facts. Signature validity and
issuer binding are independent dimensions, and all four combinations are
expressible.

**Invalid artifact vs unreadable invocation.** A bad signature, a digest
mismatch, a malformed claim, an unsupported proof algorithm or canonicalization
profile, a non-canonicalizable payload and an unverified binding are all
ordinary **successful** executions with `verification.valid === false` — the
machine answered the question, and the answer was "no", exactly as an Integrity
digest mismatch has successfully checked. Capability failure is reserved for
input that cannot be read at all: an unknown operation, a missing target, a
subject that is not the artifact's, or a resolver fault.

## New on `@aoc/protocol/manifest`

`verifySignedSovereignClaim` — the additive companion to
`verifySovereignManifest`, reporting `claimStructure`, `claimDigest`,
`signature` and a three-state `issuerBinding` as separate outcomes. It reuses
`verifySignedClaim` for the digest and signature and the existing
`validateOriginClaim` / `validateAuthorityClaim` / `validateDerivationClaim`
validators for the structure, preserving their reason codes verbatim. This is
what makes an important case expressible: an issuer can cryptographically sign
malformed data, so `claimStructure: 'invalid'` alongside `signature: 'valid'`
is an ordinary outcome rather than a contradiction or a crash.
`VerifiableSovereignClaim` is a type alias over the three existing canonical
claim interfaces — not a second claim model.

Purely additive: `verifySignedClaim`, `verifySovereignManifest`,
`verifySovereignSignature`, `signClaim`, `signSovereignManifest`,
`signSovereignPayload` and `generateSovereignKeyPair` are all unchanged in
signature and semantics.

## Boundaries

No new cryptography. `aoc-canonical-json/1` + SHA-256 + Ed25519 remain the only
profile: no secp256k1, ECDSA, RSA, BLS, P-256, Keccak, SHA-3, multihash,
`personal_sign`, EIP-712 or chain signature format is interpreted, and there is
no second canonicalizer, SHA implementation, Ed25519 verifier or base64url
decoder anywhere in the capsule.

Enforced by source-scanning tests, Verifiability never signs, generates or
stores a key, never accepts content bytes, never mints an identity, never
creates provenance, never reads or writes claim standing, never creates a
`CanonicalVerification` record, never widens `VerificationStatus`, never
requires a `VerificationProvider`, and never invokes another capsule. It
performs no revocation lookup, no certificate-chain or PKI validation, no DID
resolution and no key-validity-window policy; it emits no allow/deny decision,
no trust, confidence or risk score, and no ownership, licence or legal-authority
field. It reaches no filesystem, network, database, chain, wallet, provider or
Enterprise code, introduces no global key registry or trusted key store, and
branches on no subject namespace, asset type or business domain — an alien
namespace, a property registry, an external token system, an AI agent and an API
resource all produce byte-identical reports.

Nothing is mutated: no public key normalized, no `keyId` rewritten, no
`payloadHash` repaired, no signature replaced, no artifact re-signed and no
canonicalized rewrite returned as a "fixed" artifact. A broken proof stays
broken. The verification report is deterministic and carries no `verifiedAt`,
`reportId` or `verificationId` — *when* a verification ran is the SM-03
evidence's job — and the report itself is never signed, so no recursion exists.

The generic SM-03 evidence carries no key material, signature, payload hash,
manifest digest, signed artifact, resolver descriptor or verification report:
only capability, version, invocation id, timestamps, outcome, optional
correlation and optional subject.

`SovereigntyPortabilityBundleV1` is **unchanged** — its six-field contract
gained no verification field — and the SM-07 profile and descriptor are
unchanged too. A descriptor reports that a `signed-claim` is *present*; it never
reports that the signature holds, and it did not start doing so because a capsule
now exists.

## Epistemic boundaries

A passing signature establishes, at most, that the holder of the private key
matching the proof's public key signed this canonical payload — plus, when
`issuerBinding` is `verified`, that the caller's resolver binds that key id to
the asserted issuer. It establishes nothing about historical truth, legal
ownership, authorization, licence validity, key revocation status, trust or what
any system should do next. A signed `DerivationClaim` verifying proves the
issuer asserted the derivation, never that it happened; a cryptographically
valid claim can be `Contested` at the same moment, and a test proves both facts
coexist with neither adjudicating the other.

224 suites / 1795 tests / 3 snapshots green, `protocol:rc:check` 21/21, and all
three packed-tarball consumer fixtures verify the first six-mineral flow:
Integrity measures the bytes, Identity mints the subject and manifest, Provenance
records the derivation, a TEST-ONLY issuer signs both artifacts through the
existing low-level primitives, Portability exports and a second runtime imports
the canonical bundle, Interoperability detects the signed artifacts, and
Verifiability independently checks them — proving a valid signature, an honestly
unperformed content check, a bound and a wrongly-bound issuer key, and a
fail-closed invalid result for an artifact tampered with in transit.

Additive only: the canonical inventory remains eight and read-only, capability
versions are unchanged at `1.0.0`, and no global implementation or key registry
is introduced. Cryptographic proof and signature semantics are Verifiability
*semantics*, not a ninth mineral — there is no `AOC.CRYPTOGRAPHY`,
`AOC.SIGNATURE`, `AOC.TRUST`, `AOC.PROOF` or `AOC.KEYS`.
