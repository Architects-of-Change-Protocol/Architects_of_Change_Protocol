# Runtime Behavioral Invariants

## Invariants
- Trust verification uses latest credential by `issued_at` ordering.
- Payout idempotency is keyed by `withdrawal_id`.
- Usage summaries are derived from append history and endpoint-sorted output.
- Protocol audit query outputs are sorted by `occurred_at` ascending.
- Protocol audit retention trims oldest events first.
