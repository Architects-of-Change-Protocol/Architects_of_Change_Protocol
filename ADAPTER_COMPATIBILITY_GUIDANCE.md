# Adapter Compatibility Guidance

Future durable adapters must:
1. Implement `runtime/storage.ts` interfaces exactly.
2. Preserve ordering/filtering semantics under all query paths.
3. Preserve idempotency semantics for payout lookups.
4. Preserve append-only visibility for audit/usage streams.
5. Pass repository parity tests unchanged.
