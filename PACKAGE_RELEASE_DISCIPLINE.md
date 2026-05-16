# Package Release Discipline

## Release checklist
- [ ] Update versions through canonical constants and package versions.
- [ ] Validate version graph consistency.
- [ ] Validate compatibility matrix references current transport/contracts versions.
- [ ] Run full build/type/boundary/export checks.
- [ ] Confirm no new hardcoded transport/runtime literals.

## npm publishing readiness
- Ensure package metadata is complete (`name`, `version`, `exports`, `types`).
- Ensure dist output matches declared exports.
- Ensure runtime/SDK compatibility docs are updated for the target version.
