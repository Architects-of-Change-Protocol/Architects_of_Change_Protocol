# Economic Lifecycle

**Constitution Version:** v18.0

## Valid lifecycle states

Created → Allocated → Available → Reserved → Consumed → Settled → Disputed → Revoked → Retired

## Valid transitions

- **Created → Allocated** — Economic authority is created and then allocated to an owner.
- **Allocated → Available** — Allocated authority becomes available for consumption or reservation.
- **Available → Reserved** — Available authority is reserved for a specific purpose.
- **Reserved → Consumed** — Reserved authority is consumed.
- **Reserved → Available** — Reserved authority is released back to available.
- **Consumed → Settled** — Consumed authority is settled against obligations.
- **Consumed → Disputed** — Consumed authority consumption is disputed.
- **Settled → Retired** — Settled authority is retired after all obligations are complete.
- **Disputed → Resolved** — Disputed consumption is resolved.
- **Disputed → Revoked** — Disputed consumption is revoked.
- **Resolved → Retired** — Resolved authority is retired.
- **Revoked → Retired** — Revoked authority is retired.
- **Retired → (none)** — Retired is a terminal state.

## Lifecycle transition ledger

| Transition ID | Economic Authority ID | From | To | Authorized By | Evidence | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|
