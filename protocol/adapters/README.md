# AOC Adapter Identity + Optional Registry

This module defines the canonical adapter identity model for AOC and provides an **official but optional** in-memory adapter registry.

## Permissionless by design

- AOC remains an open, permissionless protocol.
- No adapter registration is required to use consent, capability lifecycle, enforcement, or execution flows.
- This registry is an ecosystem utility layer for discovery, metadata, and trust signaling.

## Why this optional registry exists

The official registry layer is intended for:

- discovery of known adapters in the AOC ecosystem
- standardized metadata
- trust signals (`declared`, `verified`, `revoked`)
- future compliance overlays
- future hosted/official AOC infrastructure

It is **not** a protocol gatekeeper.

## Status semantics

- `declared`: adapter record is declared, but not automatically trusted.
- `verified`: adapter has a positive verification signal from the official registry.
- `revoked`: adapter status is revoked in this registry context; protocol primitives can still exist independently.

## Notes for integrators

- You can run AOC integrations without this registry.
- You can run your own private/public adapter index.
- Using the official registry does not invalidate adapters that are outside of it.

## Current scope

This PR intentionally includes only core identity + optional registry model:

- canonical adapter type (`AOCAdapterRecord`)
- parse/normalize/validate (fail-closed)
- in-memory optional registry
- simple filtering and resolution
- policy helpers

Explicitly out of scope for now:

- human approval workflows
- billing and API keys
- network transport and auth
- persistent databases
- dashboards
- advanced governance
- dynamic reputation scoring
- cryptographic certification workflows
