# AOC Capability Module

## Purpose

`aoc/capabilities` is the protocol-level capability enforcement module for Architects of Change. It is the reusable core for capability authorization and consumption across market-maker domains (HRKey, health, finance, and future integrations).

## What this module provides

- Canonical capability authorization: `evaluateCapabilityAccess(...)`
- Runtime consumption boundary: `consumeCapabilityAccess(...)`
- Capability token APIs: `mintCapabilityToken(...)` and `validateCapabilityToken(...)`
- Market-maker trust boundary: `MarketMakerRegistry`
- Interpreter enforcement hook: `interpretWithCapability(...)`
- Legacy bridge adapter: `legacy/capabilityEnforcer`
- Deterministic runtime throttling: optional fixed-window rate limiting in `consumeCapabilityAccess(...)`

## How application layers should use it

Application integrations (including HRKey) should treat this folder as a client-facing protocol SDK boundary:

1. Construct capability + consent + request inputs in app code.
2. Call `evaluateCapabilityAccess(...)` for deterministic authorization decisions.
3. Call `consumeCapabilityAccess(...)` for runtime use (replay, revocation, rate limiting, payment, usage metering).
4. Keep all policy/usage hooks pure and deterministic.

### Runtime rate limiting (MVP)

`consumeCapabilityAccess(...)` optionally accepts:

- `rateLimit.registry` (sync in-memory or equivalent deterministic registry)
- `rateLimit.maxAttempts`
- `rateLimit.windowMs`

Behavior:

- rate limiting is **runtime throttling**, not authorization
- it runs **after** `evaluateCapabilityAccess(...)` allow and **before** payment/interpreter/nonce side effects
- keying strategy is `capability.consent_ref` (business-level throttle key)
- denial reason code is `RATE_LIMITED`
- omitting `rateLimit` preserves existing non-throttled behavior

## What is intentionally not included

This module does **not** include:

- UI or controller logic
- HTTP transport and routing
- persistence/database implementations
- governance policy authoring process
- market-maker business workflows

Those concerns remain outside the capability core and should depend on this module rather than duplicate enforcement logic.
