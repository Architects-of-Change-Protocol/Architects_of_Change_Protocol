# 01 — Current State (pre-sprint inventory)

This repository has no persistent database backing agent identity, passports, delegations, or
execution grants. The one real SQL schema in the repo
(`frontend/app/supabase/migrations/20260506_phase2_consent_relationship_console.sql`) belongs to a
separate marketing-consent product surface and is not read by any server code — it is unrelated to
the canonical protocol revocation domain this sprint covers.

Before this sprint, revocation logic existed as five-plus independent, non-interoperating
in-memory implementations:

1. **`capability/` (capability-token hash registry)** — `capability/revocation.ts`,
   `capability/registries/InMemoryRevocationRegistry.ts`. Deterministic `Set<string>` lookup, no
   I/O, therefore no error/timeout modes. This subsystem was already effectively fail-closed
   (`isRevoked()` never throws) and is now wrapped as the canonical
   `RevocationCheckPort` via `createRegistryRevocationCheck` (`protocol/revocation/revocation-check.ts`).

2. **`protocol/` core (consent/capability/enforcement/execution)** — the real bug. Revocation was
   an *optional* callback (`isRevoked?: (x) => boolean`) on evaluation options. Real callers never
   populated it:
   - `protocol/enforcement/enforcement-request.ts` parsed `isRevoked` out of a JSON payload — but a
     JSON payload can never carry a function, so `isRevoked` was unconditionally `undefined` for
     every real HTTP-style caller of `/enforcement/evaluate` and `/execution/authorize`.
   - `protocol/consent/consent-state.ts` and `protocol/capability/capability-state.ts` did
     `if (opts.isRevoked?.(x) === true) return revoked; ...continue to expiry checks...` — an
     absent callback silently fell through to "active", never to "unknown".
   - **Net effect**: the two most "canonical-looking" protocol entry points never checked
     revocation in production. Fixed in this sprint — see `03`–`05`.

3. **`aoc/capabilities/core/evaluateCapabilityAccess.ts`** — `evaluateMarketMakerTrust()` returned
   `null` ("pass") whenever `request.marketMakerRegistry` was not supplied, even though the
   function exists specifically to catch a revoked market maker. Fixed — see `05`.

4. **`packages/capability-runtime` + `packages/shared-types`** — `CapabilityRef` has no
   `revokedAt` field at all; capability revocation is structurally unrepresentable in that stack.
   **Not fixed in this sprint** — see `13-final-verdict.md` §Remaining Risks. This is a separate
   publishable package (`packages/*`) and touching its public contract shape is a larger,
   independently-scoped change.

5. **`protocol/consent/capability-authorize.ts`** (`authorizeWithCapability`) — a sixth,
   HMAC-signed capability-token format (`capability_id`/`consent_id`/subject/requester/resource/
   action) used by `runtime/enforcement/enforceCapability.ts` and the (currently non-functional)
   `runtime/api/server.ts` HTTP layer. Has **no revocation check of any kind**. **Not fixed in this
   sprint** — the HTTP server layer it serves does not compile/run today for reasons unrelated to
   revocation (see `10-test-evidence.md`), so this is documented as a residual risk rather than
   patched blind.

6. **`runtime/controlPlane.ts`** (`ControlPlaneService.revokeGrant`) — the one write path already
   wired to a real API route (`/access/grant/revoke`). Pre-sprint: direct field mutation
   (`grant.revoked_at = nowIso()`), no idempotency guard (repeated calls moved the timestamp
   forward), no evidence record. Rebuilt in this sprint — see `06` and `07`.

Test infrastructure: `jest.config.js`'s `testMatch` covered only four directories
(`tests/contracts`, `__tests__/contracts`, `__tests__/architecture`, `__tests__/constitution`). None
of the 39 pre-existing test files that exercised revocation logic lived in those directories, so
none of them ran in CI. This sprint added narrowly-scoped `testMatch` entries — see
`10-test-evidence.md` for exactly which directories and why the rest remain excluded.
