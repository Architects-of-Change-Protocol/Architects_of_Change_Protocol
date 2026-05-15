# Principal Model

## Canonical actor model
- **Principal**: canonical identity anchor for a runtime participant (`principal_id`).
- **Subject**: the principal whose data/capability/consent is being operated on.
- **Requester**: the principal asking to act on subject resources.
- **Consumer**: service/application principal that consumes runtime APIs.
- **Actor**: behavior role (`human`, `service`, `agent`, `runtime`) attached to a principal.
- **Capability Holder**: principal currently holding a capability token or delegated right.
- **Tenant**: optional organizational boundary (`tenant_id`) for policy/accounting partitioning.
- **Runtime Identity**: identity for a runtime process/node (still a principal with actor kind `runtime`).
- **Machine Identity**: non-human service principal (typically `service`).
- **Agent Identity**: autonomous principal (actor kind `agent`).

## Compatibility policy
Legacy wire fields (`subject_hash`, `subject_id`, `requester_id`, `consumer_id`) remain unchanged for backward compatibility and map to canonical principal semantics.
