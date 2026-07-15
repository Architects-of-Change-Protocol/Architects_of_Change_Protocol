# @aoc/protocol Release Authority

Who may authorize, execute, and roll back releases of `@aoc/protocol`. This document records the
**current, factual** state of release authority — it does not invent names, roles, or backups that
have not been designated.

## Authorization

- **Every publication — prerelease or stable — requires explicit, written founder authorization**
  naming the exact version and dist-tag (per [`PRERELEASE_POLICY.md`](PRERELEASE_POLICY.md)). No
  CI job, bot, or contributor may publish on their own initiative; no automated publish pipeline
  exists, deliberately.

## Roles

| Role | Holder | Status |
| --- | --- | --- |
| Release authority (authorizes) | Founder | Standing — the only authority evidenced by repository governance (`RELEASE_GOVERNANCE_MODEL.md`, `PACKAGE_DISTRIBUTION_STRATEGY.md`, `PRERELEASE_POLICY.md`) |
| Release owner (executes a given release) | **Pending founder designation** | No release owner is evidenced anywhere in the repository; none is invented here |
| Backup publisher | **Pending** | No backup is designated; designating one is part of the pre-publication checklist |

## Required approvals per release

1. Written founder authorization (version + dist-tag + channel).
2. Green `npm run protocol:rc:check` (the RC gate) on the exact release commit.
3. Evidence regenerated for that commit (`npm run protocol:release:manifest`) and committed under
   [`evidence/`](evidence/).
4. The publication approval gate in
   [`RELEASE_CANDIDATE_READINESS.md`](RELEASE_CANDIDATE_READINESS.md) fully checked off.

## Credential custody

- **No publication credentials exist in this repository** — no tokens, no `.npmrc` auth, no
  workflow secrets consumed by any publish step (there is no publish step). This is verified state,
  not aspiration.
- When provisioned, credentials live outside the repository (registry-side trusted publisher /
  OIDC preferred; otherwise a 2FA-protected token in the platform secret store), are scoped to the
  minimum needed, and are never committed, echoed into logs, or shared out-of-band.

## Tag authority

- No git tags or GitHub Releases exist for `@aoc/protocol`, and none may be created outside a
  founder-authorized release execution. Tags are cut only from the exact commit that passed the RC
  gate, by the designated release owner.

## Emergency process

On a suspected credential compromise or bad publish:

1. Revoke/rotate the affected credential at the registry immediately (founder or release owner).
2. Follow [`ROLLBACK_PLAN.md`](ROLLBACK_PLAN.md) — burn the affected version, point consumers at
   the last known-good pinned version, publish a corrected **new** version once safe.
3. Record the incident, timeline, and burned versions in `docs/release/` as evidence.

## Evidence retention

Release evidence — manifests, checksums, SBOMs, dry-run records, consumer validation evidence — is
retained **in git** under [`docs/release/evidence/`](evidence/) and referenced from the readiness
report. Evidence is append-only in spirit: superseded evidence is replaced by regeneration in a
reviewed commit, never silently edited.
