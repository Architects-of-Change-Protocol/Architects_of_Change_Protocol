# 05 — Fail-Closed Policy

The single gate: `resolveMaterialActionDecision` (`protocol/revocation/revocation-policy.ts`).

```ts
function resolveMaterialActionDecision(status: RevocationStatus): 'allow' | 'block' {
  return status.status === 'verified_not_revoked' ? 'allow' : 'block';
}
```

| Status | Material action |
|---|---|
| `verified_not_revoked` | allow |
| `revoked` | block |
| `unknown` (any of the 9 failure categories) | block |

No caller re-derives this decision independently — `evaluateCapabilityState` and
`evaluateConsentState` both call the shared resolver and map the result onto their existing
`active | expired | revoked | revocation_unknown | invalid` (or `not_yet_active` for capabilities)
state machines. `enforcement-policy.ts`'s `mapCapabilityStateToReason` then turns
`revocation_unknown` into `ENFORCEMENT_REASON_CODES.CAPABILITY_REVOCATION_UNKNOWN`, which denies
exactly like `CAPABILITY_REVOKED` does — the caller (`evaluateEnforcement`, `authorizeExecution`)
never sees a path where `revocation_unknown` reaches "allowed".

## Where this is enforced end-to-end

1. `protocol/capability/capability-state.ts` / `protocol/consent/consent-state.ts` — the state
   machines. `opts.checkRevocation` is invoked inside a try/catch; a thrown exception or a
   non-`RevocationStatus` return both collapse to `unknown` via
   `revocationLookupFailedStatus`, never to "not revoked".
2. `protocol/enforcement/enforcement-engine.ts` / `protocol/execution/execution-engine.ts` — thread
   the mandatory `checkRevocation` through to the state machines and to
   `evaluateCapabilityAccess`; deny before any scope/permission/subject/grantee/market-maker match
   is even evaluated if the capability state isn't `active`.
3. `runtime/api/routes.ts` — the trust boundary. `capabilityRevocationCheck` is built server-side
   from the canonical capability-hash registry (`capability/revocation.ts` via
   `createRegistryRevocationCheck`) and injected into `evaluateEnforcement`/`authorizeExecution`.
   The wire type (`EnforcementRequest`/`ExecutionRequest`) no longer has an `isRevoked` field at
   all, so a client cannot inject a fake status even if it tries — proven by
   `runtime/api/__tests__/routesRevocation.test.ts`'s "client-supplied isRevoked field ... is
   ignored" test.
4. `aoc/capabilities/core/evaluateCapabilityAccess.ts` — `evaluateMarketMakerTrust` denies with
   `MARKET_MAKER_TRUST_UNVERIFIABLE` when a capability declares a `marketMakerId` binding but no
   registry was supplied to verify it, instead of returning `null` ("pass").

## What "block before execute" means concretely

Every one of the call sites above returns its denial *before* constructing an
`execution_contract`/`authorization_token` or performing the underlying action. There is no
`execute -> check later` path anywhere in the changed code: `authorizeExecution` only calls
`buildExecutionContract`/`buildAuthorizedExecutionResult` after `enforcementDecision.allowed` is
confirmed true, which itself required `checkRevocation` to have returned `verified_not_revoked`.
