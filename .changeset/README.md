# Changesets

This repository uses Changesets for controlled package version governance.

- Run `npm run changeset` when a PR changes release-managed package behavior.
- Run `npm run release:status` to preview version and changelog impact.
- Do not run `changeset publish` until registry/auth policy is explicitly enabled.
