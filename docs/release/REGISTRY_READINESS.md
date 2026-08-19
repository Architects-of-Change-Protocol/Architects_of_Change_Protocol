# @aoc/protocol Registry Readiness

Assessment of distribution channels for the first `@aoc/protocol` prerelease. **No registry has
been selected, no publication has occurred, and nothing here authorizes one.** Sequencing strategy
lives in [`PACKAGE_DISTRIBUTION_STRATEGY.md`](PACKAGE_DISTRIBUTION_STRATEGY.md); this document
records the readiness state and the verified facts as of 2026-07-15.

## Channel comparison

| Channel | Consumer experience | Access control | Infrastructure needed | Readiness today |
| --- | --- | --- | --- | --- |
| **npm public registry** | Best: `npm install @aoc/protocol`, version ranges, `npm audit`, lockfile integrity | Public to the world | npm org/scope control, publish token or trusted-publisher OIDC, 2FA | **Blocked** — scope control unverified (see below); founder decision required |
| **GitHub Packages** | Requires consumer `.npmrc` scoped-registry config before install works | GitHub org-level; can stay private to the org | GH Packages write token in CI (outside repo), consumer-side registry config | **Blocked** — founder decision required; no credentials exist (correctly) |
| **GitHub release tarball** | `npm install <url>` or download+install; no range resolution, no registry audit story | Repo visibility | A release process (tag + attached artifact) — prohibited this sprint | **Not started by design** — creating releases/tags is out of scope until authorized |
| **Internal pinned tarball** (current) | Manual hand-off; vendored file + checksum + lock record | Whoever holds the file | None — fully working today | **Ready and in use** — Soberanía Enterprise consumes it in blocking CI (see [`REFERENCE_CONSUMER_EVIDENCE.md`](REFERENCE_CONSUMER_EVIDENCE.md)) |

## Verified registry facts (2026-07-15) — and their limits

- `npm view @aoc/protocol` and `npm view @aoc/audit-sdk` against `registry.npmjs.org` return
  **E404 Not Found**.
- A registry search for `scope:aoc` returns **zero packages** (`total: 0`).

**What this proves:** `@aoc/protocol` is not currently published to the public npm registry.

**What this does NOT prove:** it does **not** prove that the `@aoc` scope is available, unowned, or
controlled by this project. An npm organization/scope can exist with zero public packages, and
scope ownership is not queryable through the package endpoints used above. Any statement that "the
`@aoc` scope is controlled" would be unevidenced and must not be made.

## Blockers requiring founder action / external verification

1. **`@aoc` scope control** — verify (or acquire) ownership of the npm scope, or explicitly choose
   a channel that does not need it (GitHub Packages under the existing org). *External
   verification; cannot be resolved from this repository.*
2. **Registry selection** — one of the four channels above, recorded as a founder decision.
3. **Credential provisioning** — publish token / OIDC trusted publisher configured **outside** this
   repository; nothing credential-shaped may be committed here.
4. **`private: true` flip** — a deliberate reviewed commit, only after 1–3 are resolved (guarded
   today by `scripts/validate-publishability.mjs` and `scripts/validate-release-candidate.mjs`).
5. **Prerelease tag choice** (`rc` vs `next`) — per [`PRERELEASE_POLICY.md`](PRERELEASE_POLICY.md).

Until all five are resolved, the supported channel remains the internal pinned tarball, which is
fully validated and requires none of them.
