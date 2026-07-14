# Architects of Change Protocol

AOC Protocol defines the semantic contract layer for programmable authority.

This repository contains protocol-level concepts such as:

- capability semantics
- delegation semantics
- policy decision contracts
- actor and subject models
- audit lineage contracts
- SDK/API interface types

This repository is not the enterprise runtime implementation.

## Layering

- AOC Protocol: contracts, semantics, interfaces
- AOC Enterprise: runtime, persistence, APIs, SDK implementation
- PMFreak: vertical PM product consuming AOC layers

## AOC Protocol package (`packages/protocol`)

The versioned, publishable slice of this layering is the `@aoc/protocol` npm workspace package at
[`packages/protocol/`](packages/protocol/). (This is distinct from the top-level [`protocol/`](protocol/)
directory, which is unversioned source feeding the private root `aoc-runtime` package — the two are
unrelated despite the shared name.)

`@aoc/protocol` is validated as an external dependency through real tarball installs, not just unit
tests: `npm run protocol:pack` builds and packs it, and `npm run protocol:consumer:check` installs the
resulting tarball into isolated TypeScript/CommonJS, JavaScript/CommonJS, and TypeScript/ESM consumer
fixtures under [`test-consumers/`](test-consumers/) and runs them. Publication to a package registry is
a separate, not-yet-made release decision — see
[`docs/release/PACKAGE_DISTRIBUTION_STRATEGY.md`](docs/release/PACKAGE_DISTRIBUTION_STRATEGY.md).

### Quick start

```bash
npm ci
npm run build --workspace @aoc/protocol
npm test                         # repo-wide jest suite, includes protocol architecture boundary tests
npm run protocol:pack            # npm pack ./packages/protocol
npm run protocol:pack:check      # build + pack + install into a fixture + typecheck + import-boundary checks
npm run protocol:consumer:check  # install the tarball into test-consumers/* and run them
npm run protocol:release:check   # both of the above
```

### Release process

Changes to `@aoc/protocol`'s public contracts are tracked with [Changesets](.changeset/). Run
`npm run changeset` to record a change, `npm run release:status` to preview the version impact, and
`npm run validate:release` (also run in CI) before merging. No publish, tag, or GitHub release is
performed automatically — see `.changeset/README.md` and
[`docs/release/PACKAGE_DISTRIBUTION_STRATEGY.md`](docs/release/PACKAGE_DISTRIBUTION_STRATEGY.md) for
the sequencing this repository intends to follow before any registry publish.

## Current status

`packages/protocol/src` has been audited for runtime independence: it has no imports reaching
Enterprise, PMFreak, other runtime packages, or infrastructure/persistence/transport code. This is
enforced automatically by `__tests__/architecture/protocol-purity.test.ts` and
`__tests__/architecture/protocol-enterprise-boundary.test.ts`, and by `scripts/check-version-graph.mjs`
(which rejects `workspace:` dependency specifiers and PMFreak-named dependencies repo-wide). The
package is packable, installable from a tarball, and importable via its declared `exports` map without
any monorepo-only paths or aliases — see `packages/protocol/README.md` for consumer-facing usage and
compatibility details.
