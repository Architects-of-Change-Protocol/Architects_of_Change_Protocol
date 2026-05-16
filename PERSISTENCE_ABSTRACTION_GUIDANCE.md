# Persistence Abstraction Guidance

## Principles
- Keep persistence vendor-neutral.
- Keep business invariants in service layer, not in storage adapters.
- Avoid API changes when introducing durable backends.

## Adapter rules
1. Implement repository interfaces from `runtime/storage.ts`.
2. Preserve deterministic behaviors (sorting/filtering semantics where relevant).
3. Preserve idempotency semantics (`withdrawal_id` in payout execution).
4. Preserve audit append-only assumptions.

## Non-goals
- No ORM introduction.
- No mandatory distributed storage assumptions.
- No topology-specific runtime branching in core logic.
