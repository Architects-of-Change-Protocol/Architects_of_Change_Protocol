# 08 — Billing Safety Override (ADR §13)

> The following operations must never be rejected solely because the tenant has insufficient
> balance: revoke identity, revoke passport, suspend agent, invalidate credential, invalidate
> execution grants, report a security incident, restrict compromised capabilities.

## Evidence this holds today

1. **Structural**: `runtime/controlPlane.ts` has zero imports from `runtime/usage` or
   `runtime/monetization`. There is no code path inside `ControlPlaneService` that can consult
   billing/entitlement state, because none exists.
2. **Route-level**: `runtime/api/routes.ts`'s `DEFAULT_PRICING_RULES` covers exactly
   `/data/access`, `/payout/execute`, `/trust/verify`. `/access/grant/revoke` — the one containment
   endpoint wired to a real route in this codebase — is absent, and is explicitly listed in the new
   `CONTAINMENT_ENDPOINTS` constant with an `isContainmentEndpoint()` helper.
3. **Test-level**: `runtime/api/__tests__/routesRevocation.test.ts` — "`/access/grant/revoke` is a
   containment endpoint and is never metered/priced" asserts
   `isContainmentEndpoint('/access/grant/revoke') === true && isMeteredEndpoint('/access/grant/revoke') === false`.
   `runtime/__tests__/controlPlaneRevocation.test.ts` — "revokeGrant succeeds even when a
   simulated billing/entitlement state would deny other operations" constructs a
   zero-balance/suspended/expired billing snapshot and shows it plays no role in the revoke path
   (the assertion is necessarily about the absence of an integration point, since none exists to
   assert `false` against).
4. **CI gate**: `scripts/check-revocation-fail-closed.mjs` Check 3 parses
   `CONTAINMENT_ENDPOINTS` and `DEFAULT_PRICING_RULES` out of `runtime/api/routes.ts` and fails the
   build if any containment endpoint ever appears in the pricing list. This is the preventive
   control: a future PR that wires metering onto `/access/grant/revoke` without reading this doc
   fails CI before merge, not after an incident.

## What this doesn't cover

There is no real "consumption may be recorded and billed later" mechanism to point to — this
sprint didn't build one, because there's no real billing state on this path to defer. If a future
sprint adds entitlement checks to more routes, it must (a) add any new containment endpoint to
`CONTAINMENT_ENDPOINTS` in the same change, and (b) never place that check ahead of the security
action in the route handler. The CI gate enforces (a) for the pricing-rules symptom; it does not
(and cannot, via static analysis alone) enforce ordering inside a handler body — that remains a
code-review responsibility, flagged explicitly in the `/access/grant/revoke` handler's comment in
`runtime/api/routes.ts`.
