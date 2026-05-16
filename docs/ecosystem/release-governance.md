# AOC Ecosystem Release Governance

## Package manager and local dependency strategy
- Repository package manager is npm (`packageManager: npm@11.4.2`).
- Internal package links must use npm-compatible specifiers (`file:../...`) under current strategy.
- `workspace:*` is not allowed unless package manager strategy is intentionally changed and approved.
- Install determinism is preserved through `npm ci` + `package-lock.json`.

## Release-managed package inventory policy
- Release-managed packages: canonical protocol (`@aoc/protocol`), compatibility facades (`@aoc/*`), and runtime packages (`@aoc-runtime/*`) that are shipped as discrete packages.
- Private/internal status is allowed, but versions are still governed via Changesets (`privatePackages.version=true`).
- Fixture/demo apps may remain private and are typically excluded from public publishing, but still require intentional dependency updates.

## Changesets workflow
1. Make package-affecting change.
2. Run `npm run changeset` and select impacted package(s).
3. Use semver class per policy below.
4. Run `npm run release:status` to review graph/changelog intent.
5. Ensure `npm run validate:release` passes.
6. Merge only with explicit release impact trail (changeset file + CI).

No publishing is performed in this phase.

## Semver policy for canonical contracts
### Patch
- Documentation updates.
- Declaration comments.
- Non-breaking validation/tooling updates.
- Bug fixes that preserve exported types and contract shape.

### Minor
- Additive optional fields.
- New exported types.
- New compatibility facade packages.
- New non-breaking subpath exports.

### Major
- Removing exported types.
- Renaming exported fields.
- Changing required fields.
- Incompatible union value changes.
- Removing subpath exports.
- Changing canonical ownership rules.

## Compatibility facade versioning policy
- Facades should usually bump when canonical re-exported protocol contracts change.
- Facade-specific helpers may bump independently when protocol contracts are unchanged.
- Facade package identity (name/import path) must remain stable.
- Facade deprecations require migration notes before removal.
- Facade compatibility exports must not silently diverge from `@aoc/protocol` contracts.

## Dependency bump propagation
- `updateInternalDependencies: "patch"` is used to keep internal graph aligned when dependent packages change.
- Validate every dependency edge with `npm run check:version-graph`.

## Release channels
- **alpha**: internal experiments.
- **beta**: partner/internal app validation.
- **stable**: production-consumable packages.
- **internal**: private implementation packages/registries.

## Private registry readiness
- Keep package access restricted until registry/auth policy is configured.
- Do not add registry secrets to repository.
- Do not run publish commands until private registry configuration and token management are approved.

## Pre-release and release gates
Before any release channel action:
- `npm ci`
- `npm run validate:release`
- `npm run release:status`
- Review generated changelog impact and package graph output.
