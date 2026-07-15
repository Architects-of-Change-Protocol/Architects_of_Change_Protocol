# @aoc/protocol Package Distribution Strategy

This document compares distribution options for `@aoc/protocol` and recommends a sequence. It does
**not** authorize publication — `packages/protocol/package.json` remains `"private": true`, and no
`npm publish`, GitHub Package publish, release, or tag has been performed as part of the sprint that
introduced this document.

## Options

| Option | Advantages | Risks | Requirements |
| --- | --- | --- | --- |
| npm public registry | Maximum consumer convenience; standard tooling (`npm install @aoc/protocol`) | Scope/name availability is unverified (see below); public visibility of a pre-1.0 contract surface; requires ongoing publish governance | npm organization, publish token, 2FA, a founder decision to make the package non-private |
| GitHub Packages | Keeps distribution inside GitHub's org-level access control; no separate npm org needed | Consumers must configure a scoped registry (`.npmrc`) before `npm install` works; less familiar to external contributors | GitHub Packages write token, consumer-side registry configuration |
| GitHub release tarball | No registry to provision at all; reuses existing GitHub Actions/release infrastructure | Consumers install via a URL/tarball rather than `npm install <name>`; no version-range resolution, no `npm audit`/lockfile integrity story | A release process (tag + attached tarball); still no registry auth needed |
| Local tarball (current state) | Zero infrastructure; exactly what `npm run protocol:pack` / `protocol:consumer:check` already validate | Not a scalable distribution mechanism; every consumer must be handed a file | None — already working today |

## npm name availability

**Not verified in this sprint.** Whether the `@aoc` npm organization scope exists and whether
`@aoc/protocol` is available or already claimed is an external check against the npm registry that
has not been performed here. Do not assume availability. Verifying this is a prerequisite for the
"npm public registry" option, not something this document establishes.

## Recommended sequence

1. **Tarball reproducibility** (done this sprint) — `npm run protocol:pack` and
   `npm run protocol:consumer:check` produce and validate a real tarball on demand, in CI and locally.
2. **Enterprise consumes a tarball or release candidate** — `enterprise/package.json` currently
   declares no dependency on `@aoc/protocol` at all (see
   `docs/integration/CONSUMER_MIGRATION_GUIDE.md`), which is a gap to close in the Enterprise
   migration sprint before any registry publish, so the real consumer-facing contract gets exercised
   by the actual downstream project before it's exposed externally.
3. **PMFreak consumes the same version** — once Enterprise has adopted a specific `@aoc/protocol`
   version (directly for public contracts it needs, or transitively through Enterprise for
   Enterprise-owned functionality), PMFreak should pin to that same version rather than tracking a
   different one.
4. **Prerelease registry publication** — publish a `0.x` or tagged prerelease (e.g. `0.2.0-rc.0`) to
   whichever registry is chosen above, gated on the npm-name/GitHub-Packages requirements being
   resolved and a founder sign-off to flip `private: false`. Prerelease channels, authorization, and
   rollback rules are governed by [`PRERELEASE_POLICY.md`](PRERELEASE_POLICY.md); the concrete
   approval gate is in [`RELEASE_CANDIDATE_READINESS.md`](RELEASE_CANDIDATE_READINESS.md).
5. **Stabilization** — accumulate real external (or Enterprise/PMFreak-as-first-consumer) usage
   feedback against the prerelease; resolve the open "decisions requiring founder" items (see the
   package README and this sprint's final deliverable) before committing to a stable surface.
6. **Eventual `1.0.0`** — only once `contracts`, `claims`, and `errors` have been stable across at
   least one real consumer migration, and `adapters`/`runtime-registry` have either stabilized or been
   explicitly re-scoped, per `docs/versioning-and-stability.md`.

This sprint completes step 1 only. Steps 2–6 are out of scope here and are not scheduled by this
document — they are sequencing guidance for whoever picks up the next sprint.
