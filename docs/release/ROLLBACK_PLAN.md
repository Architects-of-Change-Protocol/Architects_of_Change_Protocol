# @aoc/protocol Rollback Plan

Concrete failure scenarios and their responses. Two invariants govern every scenario (from
[`PRERELEASE_POLICY.md`](PRERELEASE_POLICY.md)):

1. **Artifacts are immutable and version numbers are never reused.** A bad version is *burned*,
   never mutated or republished.
2. **Consumer rollback is pin-based**: consumers return to the previous known-good exact version /
   vendored tarball, verified by recorded checksum
   ([`evidence/`](evidence/)).

`npm unpublish` is **not** a rollback mechanism. It is an emergency measure reserved for credential
compromise or accidental disclosure of non-public material, requires founder authorization, and
even then the burned version number is never reused.

## Scenarios

### 1. Broken prerelease (defect found in `0.2.0-rc.N` after publication)

- Stop promotion; announce the defect on the tracking issue.
- Consumers: pin back to the previous known-good version (or the vendored 0.1.0 tarball,
  SHA-256 `4e5289b7…96b27`).
- Fix forward: publish `0.2.0-rc.N+1` from a new commit that passed the RC gate. Record the burned
  version in the cycle's readiness report.
- If the prerelease dist-tag (`rc`/`next`) points at the broken version, repoint it to the previous
  candidate — repointing a dist-tag mutates no artifact.

### 2. Declaration regression (`.d.ts` breaks downstream typecheck)

- Treat as scenario 1 — declarations are part of the public artifact.
- Reproduce with the consumer fixtures (`npm run protocol:consumer:check`) and add a fixture case
  covering the regression before the corrected version ships, so it cannot recur silently.

### 3. Export regression (a public subpath or symbol disappears or resolves differently)

- Treat as scenario 1, and additionally: removal/rename of a stable export requires a `major`
  Changeset per `docs/protocol/PUBLIC_API.md`. An accidental removal discovered post-publication is
  a defect; the corrected version restores the export. The parity/governance checks
  (`check:symbol-parity`, `check:public-export-governance`) must be extended if they failed to
  catch it.

### 4. Consumer incompatibility (Enterprise or another consumer fails against a new version)

- Do not force the consumer forward. The consumer stays on its pinned version (Enterprise's
  `protocol-consumer.lock.json` makes this the default posture).
- Classify: consumer-side misuse → consumer fix, guided by
  [`MIGRATION_GUIDE_0.2.md`](MIGRATION_GUIDE_0.2.md); Protocol-side contract break → scenario 1/3,
  fix-forward in Protocol.

### 5. Checksum mismatch (distributed artifact does not match recorded evidence)

- **Do not install. Stop distribution of that copy immediately.**
- Rebuild from the recorded source commit: the tarball is reproducible
  (`npm run protocol:release:manifest` asserts double-pack identity), so a legitimate artifact
  matches the recorded SHA-256 exactly.
- If a mismatching artifact reached any consumer or channel, treat as a potential supply-chain
  incident: identify provenance of the bad copy, notify consumers with the correct checksum, and
  record the incident. The recorded manifest in git is the source of truth.

### 6. Compromised publishing credential

- Revoke/rotate the credential at the registry immediately
  ([`RELEASE_AUTHORITY.md`](RELEASE_AUTHORITY.md) emergency process).
- Audit registry activity for unauthorized publishes; any unauthorized version is burned and
  deprecated (scenario 7 mechanics), and consumers are notified with known-good checksums.
- This is the one scenario where `npm unpublish` of an attacker-published artifact may be
  justified, with founder authorization.
- Post-incident: move to trusted-publisher/OIDC if a long-lived token was the vector.

### 7. Registry incident (registry outage, corrupted hosting, or wrongly-served content)

- Consumers fall back to the vendored internal tarball + checksum — the distribution mechanism
  that already works with no registry at all.
- Verify served content against recorded checksums once the registry recovers; if the registry
  served wrong bytes, escalate to the registry operator and treat as scenario 5 for any affected
  consumer.

## Standard mechanics referenced above

- **Pinning the previous version:** exact-version reinstall (registry) or vendored tarball
  reinstall (file), checksum-verified, in one reviewed commit that also reverts any dependent
  migration changes.
- **Deprecating a bad version:** `npm deprecate <pkg>@<version> "<pointer to good version>"` — an
  additive registry annotation that mutates no artifact. Requires the same authorization as
  publishing.
- **Publishing a corrected version:** always a **new** version number from a commit that passed
  the full RC gate (`npm run protocol:rc:check`), with regenerated evidence
  (`npm run protocol:release:manifest`).
