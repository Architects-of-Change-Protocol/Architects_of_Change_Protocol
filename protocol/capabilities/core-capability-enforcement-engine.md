# AOC Protocol — Core Capability Enforcement Engine

**Version:** 0.1  
**Status:** Draft implementation guide  
**Layer:** Authorization / enforcement

## Purpose

The core capability enforcement engine is the central decision layer for evaluating whether a requested action against a requested resource is authorized by a capability grant. It exists to satisfy the MVP blocker invariants for fail-closed authorization, deterministic decisions, and explainable denies.

Primary engine entrypoint:

```ts
evaluateCapabilityAccess(input: CapabilityAccessRequest): CapabilityAccessDecision
```

Canonical runtime consumption entrypoint:

```ts
consumeCapabilityAccess(input: CapabilityConsumptionRequest): CapabilityConsumptionDecision
```

## API Summary

`CapabilityAccessRequest` supports:

- `capability`: capability token/grant object to evaluate.
- `consent?`: optional parent grant for provenance checking.
- `action`: exact requested action string.
- `resource`: exact requested resource (`ScopeEntry` or `"type:ref"`).
- `marketMakerId?`: optional request-side market-maker binding.
- `now?`: deterministic evaluation timestamp override.
- `usageContext?` / `policyContext?`: hook context for future extensions.
- `hooks?.usage` / `hooks?.policy`: optional deterministic deny/allow hooks. Thrown hook errors fail closed as `INTERNAL_EVALUATION_ERROR` at the owning hook stage.

`CapabilityAccessDecision` returns:

- `allowed`: boolean.
- `decision`: `"allow" | "deny"`.
- `reasonCode`: stable machine-readable decision code.
- `reason`: short human-readable explanation.
- `evaluatedAt`: canonical UTC timestamp used for evaluation.
- `checks`: per-stage pass/fail state.
- `metadata`: compact audit/debug metadata.

## Evaluation Order

The engine is intentionally ordered and fail-closed:

1. **Integrity**
   - Capability presence is required.
   - Capability structure is validated with the canonical capability validator.
   - Optional consent, if supplied, is structurally validated and matched against `consent_ref`.
   - Optional capability `status`, if present, must equal `active`.
2. **Temporal validity**
   - `not_before` is enforced when present.
   - `expires_at` is required and enforced.
   - Invalid timestamps deny.
3. **Action authorization**
   - Requested action must exactly equal one of the capability permissions.
4. **Resource authorization**
   - Requested resource must exactly match a scoped `type:ref` entry.
   - No fuzzy matching or wildcard fallback is allowed.
5. **Market-maker binding**
   - If the capability declares `marketMakerId` / `market_maker_id`, the request must provide the same value.
6. **Extension hooks**
   - Optional usage and policy hooks run only after core checks pass.
   - Explicit hook denies surface as `USAGE_DENIED` / `POLICY_DENIED`.
   - Thrown usage-hook errors fail closed as `INTERNAL_EVALUATION_ERROR` with `failureStage: "usage"`.
   - Thrown policy-hook errors fail closed as `INTERNAL_EVALUATION_ERROR` with `failureStage: "policy"`.

## Fail-Closed Behavior

The engine denies by default when:

- capability is missing;
- capability is malformed;
- consent provenance is invalid or mismatched;
- status is not active;
- the request falls outside the time window;
- action or resource are not explicitly authorized;
- a required market-maker binding is missing or mismatched;
- a usage/policy hook denies; or
- internal evaluation cannot complete safely.

No permissive fallback path is allowed.

## Stable Reason Codes

Current reason codes:

- `ACCESS_ALLOWED`
- `CAPABILITY_MISSING`
- `CAPABILITY_INVALID`
- `CAPABILITY_INACTIVE`
- `CAPABILITY_NOT_YET_VALID`
- `CAPABILITY_EXPIRED`
- `CONSENT_EXPIRED`
- `EXPIRATION_MISMATCH`
- `ACTION_MISSING`
- `ACTION_NOT_ALLOWED`
- `RESOURCE_MISSING`
- `RESOURCE_NOT_ALLOWED`
- `MARKET_MAKER_REQUIRED`
- `MARKET_MAKER_MISMATCH`
- `UNKNOWN_MARKET_MAKER`
- `MARKET_MAKER_DEPRECATED`
- `MARKET_MAKER_REVOKED`
- `USAGE_DENIED`
- `POLICY_DENIED`
- `CONSENT_INVALID`
- `CONSENT_MISMATCH`
- `INTERNAL_EVALUATION_ERROR`

These codes are intended for deterministic branching, audit logging, and future Decision/Error Object alignment.

## Runtime Consumption Boundary

`consumeCapabilityAccess(...)` is the canonical protocol-level runtime boundary for presenting a capability for use. It wraps the core engine without bypassing it and adds the execution-time checks that the engine intentionally leaves outside its narrow authorization core.

Consumption semantics:

1. **Structural validation** — capability is validated with the canonical token validator; optional consent is validated and, if supplied, matched against the capability.
2. **Revocation at consumption time** — revoked capabilities deny immediately with a machine-readable revoke code before resource delivery.
3. **Replay handling** — if a nonce registry is supplied and `consume !== false`, replay is checked before authorization; repeated presentation denies. If `consume === false`, the request is treated as a non-marking presentation for replay only, and replay is not checked or marked. If `requireReplayProtection` is `true` but no nonce registry is supplied, the request denies fail-closed.
4. **Central authorization** — `evaluateCapabilityAccess(...)` remains the source of truth for action/resource/market-maker/policy decisions, including fail-closed dual expiration enforcement. Runtime access requires both capability and parent consent to be unexpired, capability expiry to stay within the consent window, and temporal ordering consistency (`capability.expires_at` must be strictly later than both capability `issued_at` and consent `issued_at`). Market-maker enforcement is lifecycle-aware: a bound `marketMakerId` must both exist in the supplied registry and be operationally trusted. `active` market makers pass, while `deprecated` and `revoked` both deny fail-closed with distinct reason codes. This is a deterministic runtime trust gate, not reputation scoring, governance, or persistence.
5. **Per-consent payment enforcement** — if the parent consent defines `pricing`, authorization still runs first, but consumption denies with `PAYMENT_REQUIRED` unless `paymentContext?.paid === true`. Pricing never overrides a market-maker trust deny. This is only a deterministic gate on use of the grant, not billing, settlement, wallet logic, or payment processing.
6. **Per-consent usage metering** — if a consent-usage registry is supplied, usage is recorded by `consent_ref` after the authorization decision is made. `usageCount` increments only on allowed consumption attempts; `lastAccessedAt` and `lastAccessResult` update on both allow and deny. This metering is deterministic protocol state for the grant itself, not analytics, billing, or quota enforcement. Payment-required denies are recorded as denied attempts and do not increment `usageCount`.
7. **Post-allow marking** — nonce state is marked only after an allow decision and only when `consume !== false` and a nonce registry is present. Denies never mark replay state.

When `consume === false`, usage is still recorded if a consent-usage registry is present. `consume` only controls replay marking, not whether an access attempt updates per-consent usage state.

If usage metering fails, the original allow/deny decision is preserved and the response may omit the `usage` block. Metering is strictly a side effect and MUST NOT change authorization behavior.

`CapabilityConsumptionDecision` may include an optional `payment` block whenever the parent consent declares pricing:

```ts
payment: {
  required: boolean;
  amount?: number;
  currency?: string;
}
```

`required` is `true` only when a priced consent was authorized but `paymentContext?.paid` was not `true`. The protocol does not verify how payment happened; it only consumes an external paid/not-paid signal.

`CapabilityConsumptionDecision` may include an optional `usage` block when metering is enabled:

```ts
usage: {
  usageCount: number;
  lastAccessedAt: string;
  lastAccessResult: 'allow' | 'deny';
}
```

Non-goals of the consumption boundary in this card:

- billing systems, payment processing, or stored balances;
- quotas or usage-based denies;
- AI interpreter execution;
- transport-specific HTTP/UI shaping.

## Extension Points

The engine intentionally leaves narrow interfaces for future cards:

- **Usage metering / quota** via `hooks.usage` layered after canonical consumption.
- **Policy interpreters / AI-assisted policy** via `hooks.policy`.
- **Richer payment integrations** above the protocol gate while preserving the same `paid` signal boundary.
- **Generalized resource matching** by extending the resource-normalization layer without changing the public decision envelope.
- **Further market-maker grant binding refinements** while preserving the same decision API.

## Notes for Integrators

- Prefer passing `now` in tests and integration boundaries that require deterministic output.
- Do not mutate the caller’s capability object; the engine normalizes to an internal immutable view.
- Input normalization/classification uses structured local input errors rather than message-fragment matching.
- The legacy `protocol/capabilities/capabilityEnforcer` bridge remains intentionally read-scoped for existing vault/resolver consumers. It now delegates its runtime decision to `consumeCapabilityAccess(...)` and maps newer decision codes onto the closest legacy surface: consent issues → `CONSENT_MISMATCH`, market-maker binding and trust issues (required, mismatch, unknown, deprecated, revoked) → `REQUEST_CONTEXT_MISMATCH`, usage/policy/payment denies → `RESOURCE_RESTRICTION_FAILED`, while preserving legacy `REVOKED` / `REPLAY` compatibility for token revocation and replay.
- Treat the returned `reasonCode` as the source of truth for programmatic behavior; `reason` is for operators and audit trails.
