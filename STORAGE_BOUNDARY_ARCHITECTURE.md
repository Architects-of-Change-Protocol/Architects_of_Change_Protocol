# Storage Boundary Architecture

This runtime now uses storage boundary contracts for stateful domains without selecting a persistence vendor.

## Boundary contracts
- `ApiKeyRepository`
- `TrustStateRepository`
- `DataAccessRepository`
- `PayoutStateRepository`
- `UsageRepository`
- `ProtocolAuditRepository`

Defined in: `runtime/storage.ts`.

## Design
- Business services depend on repository contracts.
- Default in-memory repositories remain first-class for local/dev and tests.
- Durable implementations can be added later by implementing these interfaces, without changing API routes or protocol logic.
