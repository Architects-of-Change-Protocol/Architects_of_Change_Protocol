# Protocol Adapter Contracts

## Boundary rule

Protocol owns adapter interfaces only. Enterprise, Assurance, Governance, Operations, and runtime packages own implementations. Adapter implementations must depend on Protocol; Protocol must not depend on runtime implementations.

## Adapter catalog

| Adapter | Responsibility | Input contracts | Output contracts | Ownership | Future implementing package |
|---|---|---|---|---|---|
| `VerificationKeyResolver` | Resolve issuer/proof key material descriptors for verifiers without performing network or persistence work in Protocol | `CanonicalId`, `CanonicalProofRef`, `AdapterLookupContext` | `VerificationKeyDescriptor` | Protocol interface | Enterprise/Assurance |
| `VerificationProvider` | Evaluate a canonical claim and return verifier findings | `CanonicalClaim`, `AdapterLookupContext` | `CanonicalVerification` | Protocol interface | Enterprise/Assurance |
| `RevocationLookup` | Resolve revocation references for capabilities, credentials, or other revocable artifacts | revocation ref string, optional subject id, `AdapterLookupContext` | `RevocationStatus` | Protocol interface | Enterprise/Assurance |
| `CredentialStatusLookup` | Resolve credential status using protocol credential references | `CanonicalCredentialRef`, `AdapterLookupContext` | `RevocationStatus` or undefined | Protocol interface | Enterprise/Assurance |
| `RegistryLookup` | Execute trust registry lookup requests | `CanonicalRegistryLookupRequest`, `AdapterLookupContext` | `CanonicalRegistryLookupResult` | Protocol interface | Enterprise/Assurance |
| `TrustRegistryProvider` | Retrieve trust registry descriptors and entries | `CanonicalRegistryRef`, `CanonicalRegistryEntryRef`, `AdapterLookupContext` | `CanonicalRegistryRef`, `CanonicalRegistryEntry` | Protocol interface | Enterprise/Assurance |
| `CapabilityLookup` | Retrieve canonical capability/grant descriptions by id | `CanonicalId`, `AdapterLookupContext` | `CanonicalCapability` or `CapabilityToken` | Protocol interface | Enterprise/Execution |
| `AttestationLookup` | Retrieve canonical attestation descriptions by id | `CanonicalId`, `AdapterLookupContext` | `CanonicalAttestation` | Protocol interface | Enterprise/Assurance |
| `AuditEventSink` | Accept protocol audit event envelopes for an external audit implementation | `AuditEventEnvelope`, `AdapterLookupContext` | void | Protocol interface | Enterprise/Assurance |
| `SecurityEventSink` | Accept security events for an external security telemetry implementation | `SecurityEvent`, `AdapterLookupContext` | void | Protocol interface | Enterprise/Assurance |
| `ProtocolEventSink` | Accept protocol lifecycle/domain events for external event emitters | `ProtocolEvent`, `AdapterLookupContext` | void | Protocol interface | Enterprise/Operations |
| `ObservabilityEventSink` | Accept protocol, security, or audit observations without binding Protocol to observability runtimes | `ProtocolEvent`, `SecurityEvent`, `AuditEventEnvelope`, `AdapterLookupContext` | void | Protocol interface | Enterprise/Operations |
| `PolicyDecisionProvider` | Request a policy decision from an external policy runtime | `PolicyDecisionRequest`, `AdapterLookupContext` | `PolicyDecisionResult` | Protocol interface | Enterprise/Governance |
| `GovernanceDecisionProvider` | Resolve governance decisions related to canonical claims | `CanonicalClaim`, `AdapterLookupContext` | `CanonicalDecision` or undefined | Protocol interface | Enterprise/Governance |
| `ExecutionAuthorizationProvider` | Request execution authorization from an external execution runtime | `ExecutionAuthorizationRequest`, `AdapterLookupContext` | `ExecutionAuthorizationResult` | Protocol interface | Enterprise/Execution |

## Implementation constraints

- Adapter files must contain TypeScript interfaces/types only.
- Adapter files must not import runtime, governance, assurance, operations, persistence, transport, observability, environment, or network modules.
- Adapter implementations must live outside `@aoc/protocol`.
- Protocol consumers should depend on `@aoc/protocol/adapters` instead of deep-importing adapter source files.
