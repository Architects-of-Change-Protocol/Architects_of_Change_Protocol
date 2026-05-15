# Contract Versioning Guidance

## Version Marker
- Use `RUNTIME_CONTRACTS_VERSION` as the compatibility anchor.

## Change Policy
- Additive contract changes: append new literals/optional fields, keep existing literals stable.
- Breaking changes: create next version marker and dual-support window in runtime/SDK.

## Hardening Workflow
1. Add/update canonical type in `packages/shared-types/src/contracts.ts`.
2. Replace duplicated local unions/interfaces in runtime/SDK packages.
3. Run `npm run check:contract-drift` and full validation suite.
