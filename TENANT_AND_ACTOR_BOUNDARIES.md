# Tenant and Actor Boundaries

## Current boundary posture
- No forced multi-tenant rewrite.
- `tenant_id` is optional and advisory in canonical principal context.
- Actor kind taxonomy is stable (`human`, `service`, `agent`, `runtime`) and non-authoritative for auth.

## Guardrails
- Tenant semantics must not be implicitly inferred from `consumer_id` unless explicitly documented.
- Actor kind must not replace trust/consent checks.
- Runtime identity is distinct from subject/requester/consumer roles, even if represented by same principal ID space.

## Federation readiness risk
- Principal namespace collision across runtimes remains open until federation identity contracts are introduced.
