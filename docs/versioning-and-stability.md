# @aoc/protocol Versioning and Stability

## Public surface and stability tiers

| Subpath | Stability | Runtime/type-only |
| --- | --- | --- |
| `@aoc/protocol` (root, alias of `./contracts`) | Stable | Type-only |
| `@aoc/protocol/contracts` | Stable | Type-only |
| `@aoc/protocol/errors` | Stable | Type-only |
| `@aoc/protocol/claims` | Stable | Mixed — `ClaimType`/`EvidenceType`/`AttestationType`/etc. are runtime enum objects; contract shapes are types |
| `@aoc/protocol/adapters` | Experimental | Type-only (interfaces) |
| `@aoc/protocol/runtime-registry` | Experimental | Runtime (`AdapterRegistry`, `RuntimeAdapterBootstrap`, `RuntimeBootstrapEngine`, tokens, error classes) |

`adapters` and `runtime-registry` are public but classified experimental: they are newer than
`contracts`/`claims`/`errors` and more likely to change shape as real runtime implementations
(Enterprise) start consuming them.

## Semver intent
- Patch: non-breaking declaration clarifications; packaging/metadata-only changes.
- Minor: additive contract fields/types/subpaths that preserve backwards compatibility.
- Major: breaking structural changes to exported protocol contracts, removal/rename of a stable
  export, or promoting an experimental subpath's breaking change to a stable one.

## Compatibility guarantees
- No `src/*` or `dist/*` deep-path public exports — only the subpaths declared in
  `packages/protocol/package.json` `exports` resolve. Verified by
  `scripts/assert-invalid-imports.mjs` and `scripts/validate-protocol-consumer.mjs`.
- Declarations must resolve for external TypeScript consumers using normal package installs.
  Verified with `moduleResolution: "nodenext"` in both a CommonJS and an ESM external consumer
  (see `test-consumers/typescript-cjs`, `test-consumers/typescript-esm`).
- Module system: the package declares `"type": "commonjs"` and ships CommonJS-only output (no
  separate `import`/`require` export conditions — this is not a declared dual package). Both
  `require("@aoc/protocol/...")` and `import ... from "@aoc/protocol/..."` are tested end-to-end
  against a real `npm pack` tarball via `npm run protocol:consumer:check`; ESM `import` works
  because Node's ESM loader statically detects the emitted CommonJS named exports
  (`cjs-module-lexer`), not because a separate ESM build exists.
- Node.js `>=20` (matches `packages/protocol/package.json` `engines` and repo-wide CI).

## Deprecation
Deprecated symbols are retained for at least one minor cycle before removal in a major release.
Currently deprecated: `Claim`/`LegacyClaim` (`./claims`), the `legacy-contracts` re-exports
(`./contracts`), and the `*Port`-suffixed adapter aliases (`AccessVerificationPort`,
`PolicyEvaluatorPort`, `TrustCoordinationPort`, `TrustDomainPort` in `./adapters`).
