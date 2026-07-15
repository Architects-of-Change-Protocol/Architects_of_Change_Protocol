# 12 — Rollback

> The rollback can not restore fail-open.

If any part of this sprint's changes need to be reverted, follow this order. At every step, the
system must remain at least as fail-closed as before the revert — never re-introduce the optional
`isRevoked?:` callback pattern documented in `01-current-state.md`.

## TypeScript API changes

Revert the commits touching `protocol/revocation/`, `protocol/capability/`, `protocol/consent/`,
`protocol/enforcement/`, `protocol/execution/`, `aoc/capabilities/core/evaluateCapabilityAccess.ts`,
`aoc/capabilities/legacy/capabilityEnforcer.ts`, and `aoc/capabilities/core/reasonCodes.ts`
together, as one unit — they are mutually dependent (the type changes in `capability-types.ts`/
`consent-types.ts` are what the engine/machine files were updated against). Do not revert only
some of them; a partial revert reintroduces a type mismatch, not a working fail-open state.

If reverted, material callers (`enforcement-engine.ts`, `execution-engine.ts`, `capability-mint.ts`)
return to accepting an optional `isRevoked` callback that real callers don't populate — this is
the original bug. **Do not revert this layer without also blocking the affected endpoints
(`/enforcement/evaluate`, `/execution/authorize`) at the route layer** until a replacement
fail-closed mechanism is in place.

## Repository / write-path changes (`runtime/controlPlane.ts`)

Revert to the prior direct-mutation `revokeGrant`. This reintroduces: no idempotency guard
(repeated calls move `revoked_at` forward), no evidence trail, no subject-mismatch check. If this
revert is necessary, `runtime/api/routes.ts`'s `/access/grant/revoke` handler must be reverted in
the same commit (the try/catch around `RevocationIdempotencyConflictError` and the new
`RevokeGrantResult` response shape depend on the new service).

## Route changes (`runtime/api/routes.ts`)

Revert together with the `protocol/revocation` module — `evaluateEnforcement`/`authorizeExecution`
now require a second `checkRevocation` argument; reverting the route without reverting the engine
signatures is a compile error, and reverting the engine signatures without reverting the route
silently restores the "revocation never checked at the API boundary" bug (`01-current-state.md`
§2). If a partial rollback is genuinely required, add a temporary explicit deny-all guard on
`/enforcement/evaluate` and `/execution/authorize` rather than letting them silently fall back to
"allow" — this preserves the "no reintroduce ambiguous revocation semantics" rollback constraint
from ADR §12 even mid-rollback.

## SQL / migrations

None were added this sprint (see `06-cascade-design.md` — no persistent store exists yet), so
there is nothing to roll back at this layer.

## Telemetry

`protocol/revocation/revocation-telemetry.ts` and the telemetry hooks in `revocation-check.ts` /
`controlPlane.ts` are additive and optional (`telemetry?:` parameters, all calls guarded with
`?.`). Reverting them has no functional effect on fail-closed behavior — safe to revert
independently if needed.

## CI gate

`scripts/check-revocation-fail-closed.mjs` and its wiring in `package.json`
(`check:revocation-safety`, appended to `check:aoc-boundaries`). Reverting this removes the
preventive control described in `08-billing-safety-override.md` and the structural backstop in
`05-fail-closed-policy.md` — do this last, and only if the underlying code it checks is also being
reverted (an orphaned gate checking for patterns that were reverted away is harmless but useless).

## Caller migrations (`runtime/sdk/client.ts`)

Purely additive/type-following changes with no behavioral surface of their own (the file doesn't
compile into anything that runs in CI today — see `11-migration-and-compatibility.md`). Safe to
revert independently; has no bearing on fail-closed guarantees either way.

## Manual recovery expectation

If any layer above is rolled back, the manual-recovery expectation is: **block the affected
material operations at the nearest still-standing checkpoint** rather than letting the system
default to allow. For `/enforcement/evaluate` and `/execution/authorize` specifically, that means
returning `success(false)`/an explicit deny decision from the route handler until the fail-closed
engine layer is restored — never letting `checkRevocation` silently disappear from the call graph.
