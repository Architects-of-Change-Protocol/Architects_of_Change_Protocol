# Changelog

Version bumps and per-package changelogs are generated exclusively by
[Changesets](.changeset/) at version-cut time (`changeset version`). This root file tracks the
**Unreleased** state of the release-managed packages between cuts. It records intent derived from
the actual pending changesets in [`.changeset/`](.changeset/) and merged work on `main` — nothing
below has been published, tagged, or released, and no release date is assigned.

## Unreleased

Pending changesets (verified via `npx changeset status --verbose`):

### `@aoc/protocol` — pending **minor** (0.1.0 → proposed 0.2.0)

- **Public API stabilization** (`aoc-protocol-public-api-stabilization`, PR #315): stabilized the
  public shapes of `ScopedAccessRequest` and `AuditEventEnvelope` after their first real cross-repo
  consumption by AOC Enterprise. `AuditEventEnvelope` gained five additive, optional,
  backwards-compatible fields (`occurredAt`, `subject: ResourceRef`, `correlationId: CanonicalId`,
  `reasonCodes: readonly string[]`, `schemaVersion: string`). `ScopedAccessRequest` is unchanged —
  `requestedScope` confirmed as the sole canonical scope field. `AocIdentityClaims` explicitly
  documented as an Enterprise-owned concept, not added to Protocol.
- **Consumer-ready packaging** (`protocol-consumer-ready-packaging`, PR #314): package metadata for
  a real publish decision (`license`, `repository`, `homepage`, `bugs`, `engines`), package-local
  `LICENSE`, canonical root `"."` export (plus `"./package.json"`), package README, external
  consumer fixtures (`test-consumers/`) validated against a real `npm pack` tarball, CI alignment.
- **RFC-005 contract additions** (patch-level changesets `credential-contracts`,
  `fair-registries-locate`, `gentle-principals-claim`, `proof-envelope-contracts`,
  `semantic-vocabulary-contracts`): canonical credential, registry-interface,
  principal/reference-source/scope-reference, proof-envelope, and semantic-vocabulary contracts for
  trust model portability and explainability. Deprecated the legacy minimal `Claim` shape in favor
  of `CanonicalClaim`.

No exports were removed or renamed. No breaking changes.

Additionally, merged work on `main` not yet covered by a changeset: PR #319 relicensed the
repository (and `@aoc/protocol`'s package metadata) from MIT to **Apache-2.0**. Two in-package
metadata inconsistencies from that change (duplicate `license` key; package-local `LICENSE` still
MIT text) are pending cleanup with their own patch changeset — see
`docs/release/KNOWN_LIMITATIONS.md`.

### `@aoc/audit-sdk` — pending **patch** (0.1.0 → proposed 0.1.1)

- Fixed `auditEventSchemaExample`, a pre-existing, unreferenced constant whose `required` field
  list never matched the real `AuditEventEnvelope` shape. It now reflects the real required fields
  (`aoc-protocol-public-api-stabilization`).

### `@aoc/capability-tokens`, `@aoc/consent-engine`, `@aoc/scoped-access` — pending **patch** (0.1.0 → proposed 0.1.1)

- Internal-dependency bumps only, per `.changeset/config.json`
  (`updateInternalDependencies: "patch"`). No behavior change of their own.

## 0.1.0

Initial versioned state of the release-managed workspace packages. Never published to any
registry; distributed to the reference consumer (AOC Enterprise) as a pinned, checksummed internal
tarball only — see `docs/release/REFERENCE_CONSUMER_EVIDENCE.md`.
