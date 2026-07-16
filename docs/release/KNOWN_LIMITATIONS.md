# @aoc/protocol Known Limitations

Verified facts about what the release-candidate state does **not** include, as of 2026-07-15.
Consumers and decision-makers should read this alongside
[`RELEASE_CANDIDATE_READINESS.md`](RELEASE_CANDIDATE_READINESS.md).

1. **The package remains `"private": true`.** It cannot be published in its current state, by
   design; flipping the flag is a founder decision guarded by CI checks.
2. **No registry has been selected.** npm public, GitHub Packages, and GitHub release tarball are
   compared but undecided — see [`REGISTRY_READINESS.md`](REGISTRY_READINESS.md).
3. **Control of the `@aoc` npm scope is not verified.** `npm view` returns E404 and a scope search
   returns zero packages, which proves only that the package is unpublished — not that the scope is
   available or controlled. External verification is required before any npm publish.
4. **No public prerelease exists.** `0.2.0` is a proposed version derived from pending Changesets;
   no version has been cut, tagged, or published. The prerelease tag (`rc` vs `next`) is an open
   founder decision ([`PRERELEASE_POLICY.md`](PRERELEASE_POLICY.md)).
5. **Release authority is incomplete.** Founder authorization is defined as required, but no
   release owner or backup publisher has been designated
   ([`RELEASE_AUTHORITY.md`](RELEASE_AUTHORITY.md)).
6. **AOC Enterprise consumes a pinned internal tarball**, not a registry package. Its validation
   evidence ([`REFERENCE_CONSUMER_EVIDENCE.md`](REFERENCE_CONSUMER_EVIDENCE.md)) is real and
   CI-blocking, but it is consumption of `file:./vendor/aoc-protocol-0.1.0.tgz` — no deployment
   claim is made.
7. **No 1.0 compatibility guarantee exists.** All versions are 0.x; stable subpaths follow semver
   intent, but pre-1.0 minors may add surface, and no long-term support commitment has been made.
8. **Two public subpaths are experimental.** `./adapters` and `./runtime-registry` may change shape
   without a major bump while marked experimental in
   [`../versioning-and-stability.md`](../versioning-and-stability.md).
9. **Enterprise-side follow-ups exist and are consumer-side items, not Protocol defects:**
   Enterprise's crypto verification modules (`capability-verifier`, `delegation-verifier`) import
   `CapabilityToken` from `@aoc/protocol` but internally widen the token to an untyped record for
   payload inspection — a typing-hardening follow-up owned and tracked by Enterprise. Nothing in
   Protocol's contract surface blocks it.
10. **Shipped declaration maps reference unshipped sources.** `dist/**/*.d.ts.map` point at
    `../src`, which is intentionally excluded from the tarball; the maps are inert for consumers
    (go-to-definition falls back to `.d.ts`). Decide before 1.0: ship `src` or stop emitting maps
    in the package build. Changing this now would change the tarball hash, so it is deliberately
    deferred.
11. **The Apache-2.0 relicense broke byte-identity with the Enterprise-validated artifact —
    intentionally.** PR #319 (2026-07-16) appended `"license": "Apache-2.0"` to
    `packages/protocol/package.json`; forensic diff confirms that is the only file and only line
    that changed in the tarball (old: `4e5289b7…96b27`, new: `d4a8b67d…c7704`). Enterprise's
    pinned tarball and compatibility lock still reference the pre-relicense artifact and will need
    revalidation at the next version cut.
12. **Two license-metadata inconsistencies inside the package, introduced by PR #319, are pending
    cleanup.** (a) `packages/protocol/package.json` carries a duplicate `license` key — the
    original `"MIT"` near the top was not removed when `"Apache-2.0"` was appended at the bottom
    (JSON parsers take the last value, so tooling reports Apache-2.0, but the raw file ships both);
    (b) `packages/protocol/LICENSE` still contains the MIT license text. Both must be fixed — with
    a patch Changeset, per `docs/protocol/PUBLIC_API.md` governance — before any distribution.
    Deliberately not fixed in the RC-readiness PR, which does not modify `packages/protocol/**`.
