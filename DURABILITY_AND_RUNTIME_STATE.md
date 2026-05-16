# Durability and Runtime State

## What improved
- Runtime state boundaries are now explicit and adapter-ready.
- In-memory coupling in core services is reduced.

## What remains in-memory
- Default repositories are still process-local.
- Multi-instance deployments still require external durable adapters to avoid divergence.

## Operational implications
- Single-instance/local operation unchanged.
- Enterprise/multi-instance readiness improved by contract seams, not infra rollout.

## Next hardening step
- Add a contract test suite that runs against every repository implementation (in-memory + future durable adapters) to verify behavior parity.
