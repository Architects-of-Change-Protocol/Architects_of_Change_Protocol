# 10 — Test Evidence

All commands below were actually run against this branch; output is real, not illustrative.

## Unit tests — revocation-safety-specific suites

```
$ npx jest --config jest.config.js \
    --testMatch '**/protocol/revocation/**/*.test.ts' \
    --testMatch '**/protocol/consent/__tests__/**/*.test.ts' \
    --testMatch '**/protocol/capability/__tests__/**/*.test.ts' \
    --testMatch '**/protocol/enforcement/__tests__/**/*.test.ts' \
    --testMatch '**/protocol/execution/__tests__/**/*.test.ts' \
    --testMatch '**/runtime/__tests__/controlPlaneRevocation.test.ts' \
    --testMatch '**/runtime/api/__tests__/routesRevocation.test.ts' \
    --testMatch '**/enforcement/__tests__/evaluateCapabilityAccess.test.ts'

Test Suites: 11 passed, 11 total
Tests:       153 passed, 153 total
```

Covers, mapped to the sprint's §39 checklist:

| # | Requirement | Test |
|---|---|---|
| 1 | Verified not revoked | `enforcementEngine.test.ts` "request válido => allow"; `consentEngine.test.ts` "accepts a valid active consent" |
| 2–6 | Revoked identity/passport/credential/delegation/execution grant | Only `capability_grant` and `consent_grant` are real subjects in this repo; both covered (`enforcementEngine.test.ts` "capability revoked", `consentEngine.test.ts` "marks consent as revoked") |
| 7 | Unknown due to DB error | `revocationCheck.test.ts` "FAIL-CLOSED REGRESSION: a registry that throws never becomes 'not revoked'" |
| 8 | Unknown due to timeout | `revocationCheck.test.ts` "FAIL-CLOSED REGRESSION: a check that never resolves times out to unknown" |
| 9 | Permission denied | `revocationPolicy.test.ts` `revocationPermissionDeniedStatus` case in the `it.each` block |
| 10 | Malformed record | `revocationPolicy.test.ts` `revocationRecordMalformedStatus` case |
| 11 | Unsupported version | `revocationPolicy.test.ts` `revocationUnsupportedVersionStatus` case |
| 12 | Authority mismatch | `revocationPolicy.test.ts` `revocationAuthorityMismatchStatus` case |
| 13 | Trust-domain mismatch | `revocationPolicy.test.ts` `revocationTrustDomainMismatchStatus` case |
| 14 | Subject mismatch | `revocationPolicy.test.ts` `revocationSubjectMismatchStatus` case; `controlPlaneRevocation.test.ts` "subject_id mismatch blocks the revoke" |
| 15 | Missing identifier | N/A — no identifier-optional subject type exists to construct this case against |
| 16 | Expired passport | No real passport subject exists; capability/consent expiry covered by `capabilityLifecycle.test.ts` "evaluate expired" |
| 17 | Superseded passport | Not modeled — see `03-revocation-semantics.md` |
| 18 | Suspended identity | Not modeled — see `03-revocation-semantics.md` |
| 19 | Compromised key | Not modeled — no key-management subsystem exists in this codebase |
| 20 | Material caller blocks unknown | `enforcementEngine.test.ts` "FAIL-CLOSED REGRESSION: unknown revocation status => deny"; `executionEngine.test.ts` same |
| 21 | Material caller blocks revoked | Same files, "capability revoked" cases |
| 22 | Material caller allows verified not revoked | Same files, "request válido => allow" |
| 23 | Billing failure does not block revocation | `controlPlaneRevocation.test.ts` "billing safety override"; `routesRevocation.test.ts` "billing safety override" |
| 24 | Telemetry redacts secrets | `revocationCheck.test.ts` and `controlPlaneRevocation.test.ts` "emits ... telemetry ... without secrets" |
| 25 | Error mapping is stable | `revocationPolicy.test.ts` "mapRevocationStatusToHttpStatus" suite |

## Negative fail-open regression proof (§41)

Two independent, literal reproductions of the anti-pattern:

- `protocol/revocation/__tests__/revocationCheck.test.ts` — a registry whose `isRevoked` throws
  (`{ isRevoked: () => { throw new Error('connection reset by peer') } }`) must resolve to
  `status: 'unknown'`, never `false`/`null`. Passing.
- `runtime/api/__tests__/routesRevocation.test.ts` — the actual, previously-broken production
  path: mint a capability, call `/enforcement/evaluate` (allowed), revoke the capability via the
  same registry `routes.ts` is wired to, call `/enforcement/evaluate` again with the identical
  payload, assert it now denies with `CAPABILITY_REVOKED`. This is the literal end-to-end
  reproduction of the bug described in `01-current-state.md` §2, now fixed.

## CI gate

```
$ npm run check:aoc-boundaries
...
> check:revocation-safety
> node scripts/check-revocation-fail-closed.mjs
Revocation fail-closed gate passed.
```

Verified the gate actually fails on regression: temporarily reintroduced
`isRevoked?: (x: unknown) => boolean` in a scratch file and reran the script — it failed with the
expected violation message, then the scratch file was removed and the gate passed again.

## Full suite (everything `npm test` runs)

```
$ npm test
Test Suites: 181 passed, 181 total
Tests:       810 passed, 810 total
```

`jest.config.js`'s `testMatch` was extended with narrowly-scoped entries (see `11-migration-and-
compatibility.md`) rather than rewritten broadly: a full-repo sweep during investigation found 26
pre-existing, unrelated test suites that fail to type-check for reasons that predate this sprint
(e.g. `runtime/execution-fabric/__tests__/lifecycle.test.ts` — a `Record` type missing keys;
`protocol/memory/__tests__/*.test.ts` — stale assertion values; `runtime/__tests__/*Hosted.test.ts`
and `runtime/__tests__/enforcement.test.ts` — reference a `FileControlPlaneStore` and
`createRuntimeServer`/`issueCapabilityToken` that don't exist in this codebase).
`integration/hrkey/__tests__/payoutEngine.test.ts` remains excluded for the same class of reason
(`runtime/index.ts` re-exports a constant `runtime/types/transport.ts` doesn't actually export).
None of these are revocation-related; sweeping them all into CI in this sprint would have
introduced unrelated red builds and is explicitly out of scope
(`AGENTIC_COORDINATION_MODEL.md`-style scope discipline; the sprint brief itself says "mantén el
alcance estrictamente limitado al dominio de revocación"). They are listed here, not hidden, and
recommended as follow-up in `13-final-verdict.md`.

## DB-backed integration tests — NOT RUN, honestly documented absence

**No DB-backed integration tests were run, and none are claimed.** This repository has no
Postgres/Supabase-backed store for any canonical revocation subject (see `01-current-state.md`).
The one SQL migration in the repo (`frontend/app/supabase/migrations/
20260506_phase2_consent_relationship_console.sql`) is for an unrelated consent-marketing product
and is not read by any server code — grepped for `@supabase/supabase-js` and `pg` usage outside
that migration/seed folder; zero hits. There is no live database connection anywhere in this
codebase to write an integration test against.

Building a real DB-backed integration suite (RLS denial, cross-tenant access, cascade rollback
inside a real transaction, concurrent-revoke-under-real-locking) requires first building the
persistent store this sprint deliberately did not fabricate (see `06-cascade-design.md`). That
persistence layer — schema, RLS policies, a `CanonicalRevocationService` backed by a real
transaction/RPC instead of an in-memory `Map` — is the recommended next sprint
(`13-final-verdict.md`). Declaring DB-backed coverage complete here would violate the sprint's own
instruction not to claim tests that didn't run.
