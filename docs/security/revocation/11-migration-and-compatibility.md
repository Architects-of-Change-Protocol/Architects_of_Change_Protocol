# 11 — Migration and Compatibility

This sprint made deliberate breaking changes rather than preserving fail-open behavior for
compatibility, per the sprint's own instruction ("no mantengas compatibilidad a costa de
fail-open"). Every real caller was migrated in the same change.

## Breaking API changes

| Symbol | Before | After | Callers migrated |
|---|---|---|---|
| `evaluateCapabilityState(capability, opts?)` | `opts` optional, `opts.isRevoked` optional boolean callback | `opts` required, `opts.checkRevocation: RevocationCheckPort` required | `capability-machine.ts`, `enforcement-engine.ts`, all `protocol/capability`/`protocol/enforcement` tests |
| `evaluateConsentState(consent, opts?)` | Same shape as above | Same shape as above | `consent-machine.ts`, `capability-mint.ts`, `protocol/consent` tests |
| `evaluateCapabilityAccess(capability, request)` | `request.isRevoked?` | `request.checkRevocation` required | `enforcement-engine.ts`, `capabilityLifecycle.test.ts` |
| `doesConsentAllowScope(consent, request)` | `request.isRevoked?` | `request.checkRevocation` required | `consentEngine.test.ts` |
| `evaluateEnforcement(request)` | 1 argument | `evaluateEnforcement(request, checkRevocation)` — 2 arguments | `execution-engine.ts`, `runtime/api/routes.ts`, `runtime/sdk/client.ts`, `enforcementEngine.test.ts` |
| `authorizeExecution(request)` | 1 argument | `authorizeExecution(request, checkRevocation)` — 2 arguments | `runtime/api/routes.ts`, `runtime/sdk/client.ts`, `executionEngine.test.ts` |
| `mintCapability(input)` | No revocation awareness | `input.checkConsentRevocation: RevocationCheckPort` required | `capability-mint.ts` internal, all capability tests |
| `EnforcementRequest` / `ExecutionRequest` (wire types) | Had an `isRevoked?: (capability) => boolean` field (never usable over JSON) | Field removed entirely | `enforcement-request.ts`, `execution-request.ts` parsers no longer read it |
| `ControlPlaneService.revokeGrant(input)` | Returned `GrantedAccess` directly, `input: { grant_id, reason? }` | Returns `RevokeGrantResult` (`{ grant, revocationId, idempotentReplay, evidenceRecordId, completedAt }`); `input` gained `subject_id?`, `requester_id?`, `idempotency_key?` | `runtime/api/routes.ts`, `runtime/sdk/client.ts` |
| `ControlPlaneService.decideAccessRequest(input)` | `input.decision: ConsentDecision` (object) — but the only real caller (`routes.ts`) was passing a bare string, a pre-existing type error | `input.decision: 'approve' \| 'deny'` (string) + `input.reason?`; the service builds the `ConsentDecision` object internally | `runtime/api/routes.ts` (this also fixed a pre-existing, previously-uncaught type error) |
| `capabilityAccessReasonCodes` | — | Added `MARKET_MAKER_TRUST_UNVERIFIABLE` | `aoc/capabilities/legacy/capabilityEnforcer.ts` mapping table updated to route it to `REQUEST_CONTEXT_MISMATCH` |
| `ENFORCEMENT_REASON_CODES` / `EXECUTION_REASON_CODES` | — | Added `CAPABILITY_REVOCATION_UNKNOWN` | `enforcement-policy.ts` `mapCapabilityStateToReason` |

## Not migrated (deliberately, documented as residual risk)

- `packages/capability-runtime` / `packages/shared-types` (`CapabilityRef` has no `revokedAt`
  field) — a separate publishable package; widening its public contract is a larger, independently
  scoped change. See `13-final-verdict.md`.
- `protocol/consent/capability-authorize.ts` (`authorizeWithCapability`) and its caller
  `runtime/enforcement/enforceCapability.ts` — a sixth capability-token format with no revocation
  check, gating live `POST /data/access`/`POST /payout/execute` traffic via `runtime/api/server.ts`
  (exported from `runtime/index.ts`'s "stable" public surface). **Correction (independent
  review)**: this is not safely inert — see `02-threat-model.md` and `14-independent-review.md`
  for why the prior framing here understated the risk.
- `runtime/sdk/client.ts` was updated for type consistency (it's a real caller of the changed
  functions) but its own test (`runtime/__tests__/runtimeHosted.test.ts`) is not enabled in CI —
  it fails to compile for a pre-existing, unrelated reason (`runtime/types/transport.ts` doesn't
  actually export `RUNTIME_TRANSPORT_VERSION`, which `runtime/index.ts` tries to re-export). **The
  independent review confirmed this concretely**: a deliberately introduced one-line regression in
  this file (dropping the `checkRevocation` argument from the local-mode `evaluateEnforcement`
  call) was caught by **neither** `npm run typecheck` nor `npm test` — see
  `14-independent-review.md` §Mutation Testing.

## Corrections made during independent review (commits after `cc0ca97`)

- `runtime/api/routes.ts` — `/capability/mint` now explicitly passes
  `checkConsentRevocation: ALWAYS_UNKNOWN_REVOCATION_CHECK` instead of leaving the field unset.
  Previously the endpoint always failed (safely, but by accident — via an uncaught `TypeError`
  from calling `undefined` as a function, caught by `resolveConsentRevocationStatus`'s try/catch).
  Behavior is unchanged (still always denies, since no consent-revocation registry exists), but it
  is now a deliberate, tested, documented decision instead of an implicit side effect.
- `runtime/controlPlane.ts` — `fingerprintRevokeInput` now includes `subject_id`/`requester_id` in
  addition to `grant_id`/`reason`. Previously, replaying a known `idempotency_key` with a
  different `subject_id` against the same `grant_id`/`reason` returned the cached
  (already-authorized) result without re-running the subject-mismatch check, because a cache hit
  short-circuits before that check runs. Minor information-disclosure-adjacent gap, no
  state-mutation risk (the grant was already correctly revoked on the first call) — fixed anyway
  since it was a confirmed, cheaply-fixable defect.

## Auxiliary fixes made to unblock revocation test coverage

Two small, unrelated-but-necessary fixes were required to get revocation-relevant tests actually
running in CI (both documented and tested, not silent):

1. `capability/capabilityToken.ts:1` — `import crypto from 'crypto'` → `import crypto from
   'node:crypto'`. Not the root cause (see #2) but a best-practice improvement made alongside it.
2. `tsconfig.test.json` — added `"exclude": ["node_modules", "**/dist/**",
   "crypto/node-compat.d.ts"]`. Root cause: `crypto/node-compat.d.ts` is an ambient ` declare
   module "node:crypto"` shim intended only for the isolated `crypto/` package's own composite
   build (`crypto/tsconfig.json` restricts its own program to `crypto/*.ts`/`*.d.ts`).
   `tsconfig.test.json` had no `include`/`files` restriction, so ts-jest's default whole-repo
   program picked up this ambient shim globally, corrupting `crypto.randomBytes`'s inferred type
   for every test in the process. This silently broke 9 test suites (`capability/__tests__/
   capability.test.ts`, `enforcement/__tests__/evaluateCapabilityAccess.test.ts`, `vault/
   __tests__/vault.test.ts`, and others) that had nothing to do with the `crypto/` package.
