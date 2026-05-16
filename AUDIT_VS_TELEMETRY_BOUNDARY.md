# Audit vs Telemetry Boundary

## Audit
Business/security evidence: consent decisions, capability grants/revocations, payout decisions, governance actions.

## Telemetry
Operational behavior: runtime health, request lifecycle, response emission, latency/availability, metering success/failure.

## Usage/Metering
Consumption and billability events belong in usage/metering systems and may emit summarized telemetry for operations.

## Must never log
Raw payloads, access tokens, API keys, secrets, private keys, credentials, or stack traces containing sensitive internals.
