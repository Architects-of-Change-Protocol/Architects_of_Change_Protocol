# Protocol Runtime Dependency Report

## Scope

This inventory covers the protocol-owned contract surfaces in `packages/protocol/src/contracts`, `packages/protocol/src/claims`, `packages/protocol/src/errors`, and the new adapter seam surface in `packages/protocol/src/adapters`. The scan found no direct imports from runtime, governance, assurance, operations, persistence, transport, or observability packages. The dependencies below are contract-level runtime concerns represented by fields, references, or lookup-result shapes that future Enterprise packages must satisfy through protocol-owned adapter interfaces.

## Inventory

| Protocol Contract | Runtime Dependency | Dependency Type | Risk | Recommended Adapter |
|---|---|---|---|---|
| `CapabilityToken.revocationRefs` | Revocation lookup for capability status | Indirect reference field | Runtime revocation services could leak into protocol validation if callers try to dereference refs inside Protocol | `RevocationLookup` |
| `CapabilityToken.proof` | Verification key and proof resolution | Indirect proof metadata | Proof validation could pull verifier/key-management runtime into Protocol | `VerificationKeyResolver`, `VerificationProvider` |
| `CapabilityGrant` / `CapabilityToken` | Capability runtime and delegated grant lookup | Semantic execution dependency | Execution grant stores may become coupled to canonical capability contracts | `CapabilityLookup`, `ExecutionAuthorizationProvider` |
| `AuditEventEnvelope` | Audit sink persistence and append-only event logging | Event envelope for runtime sink | Audit persistence or transport could leak into Protocol if event recording is embedded in contract code | `AuditEventSink` |
| `CanonicalRegistryLookupRequest` / `CanonicalRegistryLookupResult` | Registry lookup client and registry storage | Lookup request/result contract | Trust registry client implementations could be mistaken for protocol-owned lookup behavior | `RegistryLookup` |
| `CanonicalRegistryRef` / `CanonicalRegistryEntryRef` / `CanonicalRegistryEntry` | Trust registry provider and entry retrieval | Reference and entry contract | Registry storage, sync, scoring, or federation runtime could leak into Protocol | `TrustRegistryProvider` |
| `CanonicalRegistryAttestation` | Registry attestation runtime | Attestation reference contract | Attestation construction/evaluation could couple Assurance runtime to Protocol | `AttestationLookup` |
| `CanonicalAttestation` | Attestation retrieval and verifier workflow | Attestation contract | Assurance implementations could move into Protocol if lookup and evaluation are not adapter-bound | `AttestationLookup`, `VerificationProvider` |
| `CanonicalVerification` | Verification engine and verifier findings | Verification result contract | Verification engines, DID resolvers, and key resolvers could leak into claim contracts | `VerificationProvider`, `VerificationKeyResolver` |
| `CanonicalCredentialRef` references in claims/proofs/verifications | Credential status and issuer status lookup | Credential reference contract | Credential status, wallet, or issuer transport clients could leak into Protocol | `CredentialStatusLookup`, `VerificationKeyResolver` |
| `CanonicalDecision` / `PolicyDecision` | Governance and policy runtime decisioning | Decision contract | Governance sessions and policy engines could become protocol dependencies | `PolicyDecisionProvider`, `GovernanceDecisionProvider` |
| `CanonicalProofRef` / proof contracts | Proof verification, trace replay, and key resolution | Proof reference contract | Proof replay/verification behavior could import runtime verifiers or observability | `VerificationProvider`, `VerificationKeyResolver`, `ObservabilityEventSink` |
| `CanonicalTraceProof` | Runtime/policy trace lookup and observability | Trace evidence contract | Trace replay or observability pipelines could leak into Protocol | `ObservabilityEventSink`, `ProtocolEventSink` |
| `CanonicalAuditProof` | Audit trail lookup and audit sink | Audit evidence contract | Audit log readers/writers could couple Protocol to persistence | `AuditEventSink` |
| `CanonicalAuthority` | Authority resolution and governance runtime | Governance reference contract | Authority resolution could pull governance runtime into Protocol | `GovernanceDecisionProvider`, `TrustRegistryProvider` |
| `CanonicalStanding` | Standing/status evaluation runtime | Assurance/governance evaluation | Standing evaluation may require policy, registry, or verification runtime | `TrustRegistryProvider`, `PolicyDecisionProvider` |
| `ProtocolEvent` / `SecurityEvent` adapter contracts | Event emitters and security telemetry | Adapter seam only | Future implementations must not invert ownership by making Protocol emit or persist events directly | `ProtocolEventSink`, `SecurityEventSink`, `ObservabilityEventSink` |
| `ExecutionAuthorizationRequest` / `ExecutionAuthorizationResult` adapter contracts | Execution runtime authorization | Adapter seam only | Execution fabric could leak into Protocol if authorization is implemented in contracts | `ExecutionAuthorizationProvider` |

## Risks discovered

1. Protocol currently has no direct runtime imports, but several contracts intentionally carry runtime-resolvable references (`revocationRefs`, proof refs, registry refs, trace/audit proof refs). These are safe only while dereferencing remains outside Protocol.
2. Registry lookup request/result contracts are close to runtime behavior by name. The new `RegistryLookup` interface makes the seam explicit without adding implementation.
3. Audit, trace, and security event contracts can attract persistence and observability implementations. The new sink interfaces define the boundary while keeping Protocol passive.
4. Policy/governance and execution decisions share simple contract shapes with runtime decisions. The new provider interfaces reserve the dependency direction for Enterprise-owned implementations.

## Boundary conclusion

Protocol should continue to own semantic shapes, references, and adapter interfaces only. Enterprise, Assurance, Governance, Operations, and runtime packages should implement these adapters and pass them into consumers without adding implementation imports to `@aoc/protocol`.
