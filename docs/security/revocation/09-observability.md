# 09 — Observability

`protocol/revocation/revocation-telemetry.ts`.

## Events

| Event | Emitted by | When |
|---|---|---|
| `revocation.check.started` | `createRegistryRevocationCheck` | Every call, before the underlying registry lookup |
| `revocation.check.not_revoked` | `createRegistryRevocationCheck` | Registry returned `false` |
| `revocation.check.revoked` | `createRegistryRevocationCheck` | Registry returned `true` |
| `revocation.check.unknown` | `createRegistryRevocationCheck` | Registry returned a non-boolean value |
| `revocation.check.failed` | `createRegistryRevocationCheck` | Registry threw |
| `revocation.command.started` | `ControlPlaneService.revokeGrant` | Every call |
| `revocation.command.completed` | `ControlPlaneService.revokeGrant` | A fresh (non-replayed) revocation completed, with `latencyMs` |
| `revocation.command.failed` | `ControlPlaneService.revokeGrant` | Grant not found, or subject mismatch |
| `revocation.idempotency.replayed` | `ControlPlaneService.revokeGrant` | Cache hit, or grant was already revoked |
| `revocation.idempotency.conflict` | `ControlPlaneService.revokeGrant` | Same key, different payload |

`revocation.cascade.*` and `revocation.billing_override` from the sprint's full §37 list are not
emitted: there is no cascade to instrument (see `06-cascade-design.md`) and no billing integration
point to instrument an override against (see `08-billing-safety-override.md`) — emitting an event
for something that structurally cannot happen would be misleading telemetry, not observability.

## Fields

Every payload carries a subset of: `operation`, `grantId`/`subjectId`, `subjectType`,
`revocationId`, `idempotencyKeyPresent` (never the raw key value in the started/failed events —
only in the conflict event, where the key itself is the useful diagnostic and is not a secret),
`errorCode`, `latencyMs`, `reason`.

## Redaction

`redactRevocationTelemetryPayload` runs every payload through a key-name filter
(`/secret|private[_-]?key|password|token$|credential$|raw[_-]?claims|raw[_-]?passport/i`) before
it reaches the caller's telemetry hook, replacing matching values with `'[redacted]'`. This is a
defense-in-depth backstop — the event builders in this module never construct a payload containing
such fields in the first place, but a caller assembling its own payload and passing it through
`emitRevocationTelemetry` gets the same protection.

Tested in `protocol/revocation/__tests__/revocationCheck.test.ts` and
`runtime/__tests__/controlPlaneRevocation.test.ts` (both assert `JSON.stringify(payload)` never
matches `/secret|privateKey|password/i` across every emitted event).

## Wiring status

`ControlPlaneService`'s constructor accepts an optional `RevocationTelemetryHook`; tests exercise
it directly. `runtime/api/routes.ts`'s `capabilityRevocationCheck` and the `DEFAULT_RUNTIME_CORE`'s
`ControlPlaneService` do **not** currently wire a telemetry hook to a real sink — there is no
established logging/metrics sink elsewhere in this codebase to integrate with (no `console.*`
telemetry convention, no metrics client). The hook is a documented, tested extension point; wiring
it to a real sink is a one-line change once such a sink exists, and is recommended in
`13-final-verdict.md`.
