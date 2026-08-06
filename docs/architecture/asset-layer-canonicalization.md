# Asset Layer Build/Test Activation & Canonical JSON (AOC Protocol Slice 0)

Status: implemented. This document records the decisions made while
closing `SAP-GAP-008` (asset/content modules excluded from the real
build/CI graph) and `SAP-GAP-010` (two divergent canonical JSON
implementations in cryptographically relevant paths), per the Sovereign
Digital Asset Readiness Audit. It intentionally does **not** introduce
`SovereignAssetId`, `SovereignManifest`, or any new authority/provenance
model — those belong to a future slice.

## 1. Implementation map (as found)

- `content/`, `pack/`, `field/`, `storage/`, `resolver/`, `sdl/` are
  loose root-level TypeScript modules (no `tsconfig.json` / `package.json`
  of their own). Their `__tests__` directories all had passing tests, but
  `jest.config.js`'s `testMatch` never listed them, so `npm test` never
  ran them and CI never observed their state.
- The root `tsconfig.json` project-reference graph (`tsc -b`, i.e. `npm
  run build` / `npm run typecheck`) only covers `packages/*`, `crypto`,
  `enterprise`, and `examples/pmfreak-adapter` — real publishable
  workspace packages. Other root-level runtime code (`capability/`,
  `consent/`, `enforcement/`, `vault/`, `interpreter/`, `aoc/`,
  `protocol/`, `runtime/`, and now the asset layer) is, by existing
  repository convention, typechecked either implicitly via `ts-jest`
  during test execution, or — for the modules judged safety-critical
  enough to warrant it regardless of test coverage — via a dedicated
  `tsc --noEmit -p tsconfig.<area>.json` script wired into
  `check:aoc-boundaries` (see `tsconfig.revocation.json` /
  `check:revocation-typecheck` for the existing precedent this slice
  follows).
- `crypto/` is a real workspace package (`@aoc-runtime/crypto`) with its
  own `tsconfig.json`/`package.json`, participates in `tsc -b`, and ships
  a committed `dist/`. Its own `crypto/__tests__/` directory was, like the
  asset layer, missing from `testMatch` and so was equally invisible to
  CI — activated as part of this slice since it is exactly the module
  `SAP-GAP-010` concerns.
- `canonicalize.ts` (root) exported `canonicalizeJSON`, consumed
  (transitively, via `content/canonical.ts`, `pack/canonical.ts`,
  `field/canonical.ts`, `storage/canonical.ts`, `capability/canonical.ts`,
  `consent/canonical.ts`, and `aocId.ts`) by every legacy content/pack/
  field/capability/consent identity and hash computation in the repo.
- `crypto/engine.ts` had its own inline `canonicalize()` +
  `JSON.stringify()` combination backing `canonicalSerialize` /
  `stableHash` / `signPayload` / `verifyPayloadSignature` — the real
  hashing/signing primitives consumed by `governance-runtime`,
  `consent-runtime`, `portable-cognition`, and
  `enterprise/src/assurance/audit/signed-audit-runtime.ts`.
- A repository-wide sweep for other reimplemented canonicalizers (see
  §4) found two more, both intentionally left untouched in this slice.

## 2. Golden-vector comparison (captured before any change)

Both implementations were exercised, before any code changed, against a
full battery of vectors: property ordering, nested objects/arrays,
strings, Unicode, empty object/array, integers, negative numbers,
floats, zero/negative zero, large integers, scientific-notation
magnitudes, booleans, null, undefined (top-level/nested/array),
non-finite numbers, functions, symbols, bigint, and `Date` objects.

Result: **byte-identical output for every realistic payload** (anything
that is a plain finite-number/string/boolean/null/array/object). The two
implementations diverged only on values that should never legitimately
appear in a hash/signature input:

| Vector | root `canonicalizeJSON` (pre-slice) | `crypto/engine.ts` inline (pre-slice) |
|---|---|---|
| `undefined` (top-level, nested, array element) | throws | silently dropped / coerced to `null` |
| `NaN` / `Infinity` / `-Infinity` | throws | silently coerced to `null` |
| function / symbol | throws | silently coerced to `undefined`, then dropped |
| bigint | throws | throws (different message) |
| `Date` object | `{}` (own-enumerable-properties are empty) | `{}` (same) |

This is the reason the two implementations could be unified with **no
observable change to any existing hash, signature, or identifier**
derived from a well-formed payload — see §3.

## 3. Decision: authoritative canonicalization contract

**Option A was selected**: keep the stronger existing AOC canonicalizer
(root `canonicalizeJSON`, which fails closed on unsupported input) as the
one authoritative implementation, rather than adopting an external
standard (e.g. JCS/RFC 8785) or inventing a new profile from scratch. It
was already the de facto standard for every asset/content/capability/
consent module in the repository; the crypto engine was the outlier.

- The implementation now lives in `crypto/canonicalize.ts`, exported as
  `canonicalizeJSON` alongside a versioned profile identifier,
  `CANONICAL_JSON_PROFILE = 'aoc-canonical-json/1'`.
- `crypto/engine.ts`'s `canonicalSerialize` now delegates to it directly
  (same TypeScript project, plain local import) — the inline
  `canonicalize()` helper and its `JSON.stringify(...)` serialization
  step were removed entirely. `stableHash`, `signPayload`, and
  `verifyPayloadSignature` are unchanged except that they now sit on top
  of the shared implementation.
- The root `canonicalize.ts` is now a thin re-export of
  `crypto/canonicalize.ts`, so every existing `from './canonicalize'` /
  `from '../canonicalize'` import across `content/`, `pack/`, `field/`,
  `storage/`, `capability/`, `consent/`, and `aocId.ts` keeps working
  unchanged — no consumer file needed to move or change its imports.
- The contract is documented in the module itself (see the JSDoc header
  of `crypto/canonicalize.ts`) in enough detail that another language's
  implementation could reproduce it byte-for-byte: sorted object keys,
  JSON string-escaping, `Number#toString`-based numeric rendering, no
  insignificant whitespace, and a hard rejection of `undefined` and
  non-finite numbers rather than silent coercion.

### Why no `canonicalizationVersion` field was added to existing types

Because the two implementations are proven byte-identical for every
value that has ever legitimately been hashed or signed in this
repository (§2), there is no observable hash/signature drift to version
around for *existing* material. Adding a mandatory
`canonicalizationProfile`/`canonicalizationVersion` field to
`GovernanceSignature` or the legacy content/pack/field manifests now
would be a breaking, unrequested change to those contracts for no
compatibility benefit. Instead, `CANONICAL_JSON_PROFILE` is exported and
ready to be embedded as a required field on the future
`SovereignManifest` type in the next slice, which is where a real
multi-profile concern first arises.

## 4. Other canonicalizers found, not touched in this slice

A repository-wide search for reimplemented canonicalization logic found
two additional occurrences beyond the two named in the audit
(`canonicalize.ts` and `crypto/engine.ts`):

- `protocol/consent/capability-hash.ts` — an independent, array-positional
  `canonicalizeCapabilityPayload` that feeds a real `sha256` hash
  (`hashCapabilityPayload`). This is cryptographically relevant but scopes
  to a different, Enterprise-adjacent capability-token concept in
  `protocol/` (itself flagged as architectural debt — see `SAP-GAP-012`
  in the audit and the boundary note in `README`/`ARCHITECTURE.md`).
  Fixing it would touch capability-token hashes outside the asset/content
  layer this slice targets, so it is left as a documented follow-up.
- `interpreter/aiInterpreter.ts`'s `stableSerialize` — structurally
  similar (sorted keys, recursive `JSON.stringify`) but not
  cryptographically relevant: it only builds a deterministic
  human/AI-readable guardrail string, never a hash or signature input.
  Left untouched.

Neither is part of `SAP-GAP-008`/`SAP-GAP-010` as scoped by the audit;
both are reported here so they are not silently missed by a future slice.

## 5. Build/test graph activation

- `jest.config.js` `testMatch` now includes `crypto/__tests__/**`,
  `content/__tests__/**`, `pack/__tests__/**`, `field/__tests__/**`,
  `storage/__tests__/**`, `resolver/__tests__/**`, `sdl/__tests__/**`.
  All of these suites passed before this change (proving they were
  honestly orphaned, not broken) and continue to pass now that they run
  under `npm test`.
- `tsconfig.assets.json` (new) explicitly lists every non-test asset-layer
  source file plus the root `canonicalize.ts`/`aocId.ts`/`hash.ts` files
  they depend on, following the existing `tsconfig.revocation.json`
  pattern. `npm run check:asset-layer-typecheck` runs
  `tsc --noEmit -p tsconfig.assets.json` and is now the last step of
  `npm run check:aoc-boundaries` — which `ci.yml` runs directly on every
  push/PR, and which `validate:release`/`release-validation.yml` also
  invokes as its first step. This guarantees a broken asset-layer type
  no longer silently falls out of CI.
- No new workspace package was created for `content/pack/field/storage/
  resolver/sdl` — that would require a publishability/export-surface
  decision (`SAP-GAP-009`) that belongs to the next slice, not this one.
  The activation pattern used here mirrors how every other non-package
  root runtime module (`capability/`, `consent/`, `enforcement/`,
  `vault/`, `protocol/revocation/`, etc.) already participates in this
  repository's build/test graph.

## 6. Storage integrity (unchanged)

`storage/localFsAdapter.ts`'s `get()` still calls
`enforceStorageIntegrity()` (from `enforcement/`) to verify raw-byte
SHA-256 on read; this hash is entirely independent of
`canonicalizeJSON`/`canonicalSerialize` (it hashes the raw stored bytes,
not a canonicalized manifest object) and was not touched. Its existing
tests (`storage/__tests__/localFsAdapter.test.ts`) cover both accept
(original bytes) and reject (tampered bytes) paths and now run in CI via
the `testMatch` change above.
