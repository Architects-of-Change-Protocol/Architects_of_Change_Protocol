# PR Release Guidance (Changesets)

## When a PR needs a changeset
Add a changeset when a PR changes behavior, dependencies, packaging, or exported contracts of a release-managed package.

## When a PR usually does not need a changeset
- Docs-only changes with no package behavior impact.
- CI-only edits with no package release effect.
- Internal refactors that do not change package runtime/types/build output.

## How to create one
1. Run `npm run changeset`.
2. Select impacted package(s).
3. Choose bump type (patch/minor/major) using semver policy.
4. Write concise human-readable summary of impact.

## Choosing patch/minor/major
- **Patch**: non-breaking fixes/docs/tooling updates.
- **Minor**: additive/non-breaking capability.
- **Major**: breaking API/contract/ownership changes.

## Examples
- Add optional field to protocol type: **minor** for `@aoc/protocol`, typically corresponding facade bumps.
- Fix packaging metadata without API impact: **patch**.
- Remove exported field from canonical contract: **major**.

## Facade handling
If protocol re-exported contracts change, include corresponding facade changesets unless a facade is intentionally pinned and documented.
