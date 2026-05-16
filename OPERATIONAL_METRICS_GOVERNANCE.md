# Operational Metrics Governance

## Canonical runtime metrics
- `runtime.metering.success`
- `runtime.metering.failure`

## Governance rules
- Metrics represent operational posture, not domain truth.
- Emit bounded-cardinality tags only (e.g., endpoint, status).
- Never include identifiers that are secrets or personal payload bodies.
- Keep metric families stable across versions unless versioned explicitly.
