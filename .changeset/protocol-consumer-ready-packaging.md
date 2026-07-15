---
"@aoc/protocol": patch
---

Make `@aoc/protocol` externally consumable and verify it end-to-end as a packaged dependency:

- Add package metadata required for a real publish decision (`license`, `repository`, `homepage`,
  `bugs`, `engines`), a package-local `LICENSE`, and a canonical root `"."` export (plus
  `"./package.json"`) alongside the existing `contracts`/`errors`/`claims`/`adapters`/`runtime-registry`
  subpaths. No existing export was removed, renamed, or changed shape.
- Add `packages/protocol/README.md` documenting installation, usage, the public export table, and the
  CommonJS/ESM compatibility that was actually tested (not just declared).
- Add `test-consumers/{typescript-cjs,javascript-cjs,typescript-esm}` and
  `scripts/validate-protocol-consumer.mjs` (wired to `npm run protocol:consumer:check`), which install
  a real `npm pack` tarball into isolated fixtures and compile/execute them against every public
  subpath, including the runtime-bearing `claims` and `runtime-registry` symbols.
- Extend `scripts/validate-publishability.mjs` with package-metadata completeness checks and align CI
  (`ci.yml` Node version, `publishability.yml` now also runs `protocol:consumer:check`).
- Update `docs/versioning-and-stability.md` and add `docs/protocol/PUBLIC_API.md`,
  `docs/release/PACKAGE_DISTRIBUTION_STRATEGY.md`, and
  `docs/integration/CONSUMER_MIGRATION_GUIDE.md`.

This is packaging-only: no contract semantics changed, nothing was published, and
`packages/protocol/package.json` remains `"private": true`.
