# Runtime State Model

## Current state domains
- API key state
- Trust state (issuers, credentials, consents, trust audit)
- Data access state (tokens + access audit)
- Payout state (idempotency results + payout audit)
- Usage state (usage records)
- Protocol audit stream

## State ownership
- Each service owns semantics, but state read/write passes through repository contracts.
- This decouples storage mechanics from runtime behavior.

## Durability posture
- Default implementations are in-memory.
- The runtime is now durability-ready at interface boundaries but not yet durable in default configuration.
