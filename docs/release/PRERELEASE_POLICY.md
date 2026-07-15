# @aoc/protocol Prerelease Policy

This policy governs how prerelease versions of `@aoc/protocol` (and any other release-managed
package in this repository) are authorized, produced, supported, and retired. It exists **before**
any prerelease has been published: as of the Release Candidate Readiness Sprint that introduced this
document, **no prerelease of `@aoc/protocol` exists on any registry**, `packages/protocol/package.json`
remains `"private": true`, and no tag, GitHub Release, or `npm publish` has been performed.

## Definitions — the distribution ladder

These five states are distinct. Documents and announcements must never conflate them.

| State | What it is | What it is not |
| --- | --- | --- |
| **Internal tarball** | An `npm pack` artifact built from a known commit and handed directly to a consumer (e.g. the `vendor/aoc-protocol-0.1.0.tgz` pinned by AOC Enterprise). Verified by checksum, never fetched from a registry. | A release. It carries no registry existence, no tag, and no support commitment beyond the commit it was built from. |
| **Prerelease** | A registry-published version with a prerelease suffix (e.g. `0.2.0-rc.0`) under a non-`latest` dist-tag. Exists so real consumers can validate a candidate before it becomes stable. | A stable release. Consumers must expect it to be superseded and must pin exactly. |
| **Stable release** | A registry-published version without a prerelease suffix (e.g. `0.2.0`), promoted from a prerelease that survived consumer validation. Covered by `docs/versioning-and-stability.md` semver intent. | A guarantee of API permanence — pre-1.0, minor versions may still evolve the surface additively. |
| **1.0** | The first major version, declared only once `contracts`, `claims`, and `errors` have been stable across at least one real consumer migration and the experimental subpaths (`adapters`, `runtime-registry`) have stabilized or been re-scoped. | Implied by any 0.x release, however polished. |
| **General Availability** | A product/governance declaration (support, lifecycle, commercial commitments) layered on top of a stable release by an explicit founder decision. | A technical artifact state. Publishing 1.0 does not itself declare GA. |

## Authorization

- **Only the founder / release authority may authorize a prerelease.** Authorization is explicit,
  written (issue, PR approval, or signed-off release checklist), and names the exact version and
  dist-tag to be published. No CI job, bot, or contributor may publish on their own initiative.
- Prerequisites that must all be true before authorization is even requested:
  1. `npm run validate:release` and `npm run protocol:release:check` pass on the release commit;
  2. the release manifest and checksums for the candidate tarball have been generated and recorded
     (`npm run protocol:release:manifest`);
  3. Changesets — never manual edits — computed the version;
  4. npm scope/name ownership for `@aoc` is verified externally (as of this writing `@aoc/protocol`
     returns 404 on the public registry and the `@aoc` scope shows zero packages, but **absence of
     packages is not proof of scope control** — ownership must be confirmed by the founder before
     any publish);
  5. registry choice and credentials exist outside this repository (no tokens are, or may be,
     committed or configured here).

## Allowed prerelease tags

Two tag families are permitted, with distinct meanings:

| Tag | Version shape | Meaning | Dist-tag |
| --- | --- | --- | --- |
| `next` | `X.Y.Z-next.N` | Rolling preview of whatever is queued for the next release; may change shape between iterations | `next` |
| `rc` | `X.Y.Z-rc.N` | Release candidate: believed final for `X.Y.Z`; only regressions found in validation may change it | `rc` |

`beta` is reserved but **not currently enabled** — it may be adopted by a future revision of this
policy if a longer-lived preview channel becomes necessary. No other suffixes (`alpha`, `canary`,
date stamps) are permitted.

**Which tag the first prerelease will use is an open founder decision.** This repository is prepared
for both: Changesets' `pre enter rc` / `pre enter next` modes work against the current
`.changeset/config.json` without further changes. Until that decision is recorded here, no
prerelease may be cut.

- A prerelease is **never** published under the `latest` dist-tag.
- Prerelease numbering is monotonic within a family (`-rc.0`, `-rc.1`, …) and resets only when the
  base version changes.

## Stability, compatibility, and support expectations

- A prerelease carries the **same public surface rules** as the target stable version: subpath
  stability tiers per `docs/versioning-and-stability.md`, no deep imports, CommonJS output with
  tested ESM interop, Node `>=20`.
- Between two prereleases of the same base version (`-rc.0` → `-rc.1`), changes must be limited to
  fixes for defects found in validation. Between `next` iterations, additive change is allowed;
  breaking change still requires the base version to be re-derived by Changesets.
- Prereleases are supported **only until the corresponding stable version ships** (or the candidate
  is abandoned). They receive no backported fixes: the remedy for a broken prerelease is the next
  prerelease iteration.
- Consumers of a prerelease must pin an exact version. Ranges (`^`, `~`, `>=`) against prerelease
  versions are unsupported.

## Duration and promotion to stable

- A prerelease window should be **time-boxed** (guideline: 1–4 weeks) and exists to collect
  validation from at least one real consumer — for `@aoc/protocol`, that consumer is AOC Enterprise,
  which must build green against the candidate before promotion.
- Promotion to stable requires: (1) consumer validation evidence recorded in
  `docs/release/` (readiness report or successor); (2) no open defects against the candidate's
  public surface; (3) `changeset pre exit` followed by the normal Changesets version flow — the
  stable version is published as a **new artifact from the same source commit as the final
  candidate**, not by re-tagging the prerelease artifact.
- A candidate that fails validation is abandoned, not patched in place (see below).

## Deprecation within prerelease lines

- When a stable version ships, all prereleases of that base version are considered superseded; the
  registry `npm deprecate` mechanism should point them at the stable version.
- Symbols deprecated during a prerelease follow the repository-wide
  `DEPRECATION_AND_LIFECYCLE_POLICY.md` (retained at least one minor cycle; removal only in a major).

## Rollback and failed versions

- **Published artifacts are immutable. Never mutate, republish, or overwrite a version that has
  reached a registry** — not to fix a defect, not to re-run a botched publish, not even seconds
  after publishing. (`npm unpublish` within the regret window is an emergency measure reserved for
  credential compromise or accidental disclosure of non-public material, and requires founder
  authorization; it is not a release-engineering tool.)
- **Version numbers are never reused.** If `0.2.0-rc.0` is published and found broken, the fix ships
  as `0.2.0-rc.1`; if a stable `0.2.0` is broken, the fix ships as `0.2.1` (or the next version
  Changesets derives). A failed or abandoned version number is burned permanently, even if the
  artifact was only briefly available or the publish half-failed.
- Rollback for consumers is **pin-based**: consumers roll back by reinstalling the previous known-good
  version (or the checksummed internal tarball they already vendor). The release manifest and
  checksums recorded per candidate (`docs/release/evidence/`) are what make that verifiable.
- Dist-tags may be repointed (`rc` → an earlier candidate) as a coordination signal, but repointing
  never alters any published artifact.
- A failed prerelease must be recorded: what failed, which version was burned, and which iteration
  replaced it, in the release readiness report or its successor for that cycle.

## What this policy does not do

- It does not authorize any publication. No prerelease exists as of this document's introduction.
- It does not select the first prerelease tag (`rc` vs `next`) — that is an explicit pending
  founder decision, recorded as such in `docs/release/RELEASE_CANDIDATE_READINESS.md`.
- It does not modify the Changesets configuration, versions, or CI publish behavior (none exists).
