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

## How application layers should use it

Application integrations (including HRKey) should treat this folder as a client-facing protocol SDK boundary:

1. Construct capability + consent + request inputs in app code.
2. Call `evaluateCapabilityAccess(...)` for deterministic authorization decisions.
3. Call `consumeCapabilityAccess(...)` for runtime use (replay, revocation, payment, usage metering).
4. Keep all policy/usage hooks pure and deterministic.

## What is intentionally not included

This module does **not** include:

- UI or controller logic
- HTTP transport and routing
- persistence/database implementations
- governance policy authoring process
- market-maker business workflows

Those concerns remain outside the capability core and should depend on this module rather than duplicate enforcement logic.
