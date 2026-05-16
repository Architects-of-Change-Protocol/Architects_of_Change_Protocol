# Platform Evolution Guidance

## Safe evolution sequence
1. Update canonical constants in `runtime/versioning.ts`.
2. Update compatibility matrix and semver policy docs.
3. Ensure handshake metadata reflects new version intent.
4. Run full governance validation suite.

## Examples
- Compatible: add optional response field in transport envelope with MINOR bump.
- Incompatible: remove/rename required envelope field; requires MAJOR bump.
