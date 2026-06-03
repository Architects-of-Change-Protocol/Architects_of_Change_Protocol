# Proof Envelope Source Audit

Date: 2026-06-03

## Scope

This audit reviewed existing proof-like concepts across the repository before adding a canonical proof vocabulary for the RFC-005 trust model. The review focused on runtime attestations, integrity proofs, remote attestations, governance and capability attestations, AI attestations, audit trails, traces, credential-adjacent contracts, claims, evidence, RFC-004, RFC-005, A2 canonical contracts, and A3 principal/reference contracts.

## Existing proof-like concepts

| Area | Source | Existing concept | Notes |
|---|---|---|---|
| Runtime attestations | `runtime/attestations/types.ts` | `GovernanceAttestation`, `CapabilityAttestation`, `AIAttestation`, `RemoteGovernanceAttestation` | Runtime-specific attestation records with validation/runtime hooks. |
| Runtime integrity | `runtime/attestations/types.ts`, `runtime/attestations/integrity-proof.ts` | `IntegrityProof`, `IntegrityProofType`, `payloadHash`, `parentProofRef` | Implements hash generation, in-memory proof storage, validation, and resolution. This belongs outside AOC Main canonical schema. |
| Attestation chains | `runtime/attestations/attestation-chain.ts` | Chain append, validate, resolve, reconstruct from tail | Represents proof lineage and continuity, but as runtime behavior. |
| Governance attestations | `runtime/attestations/governance-attestation.ts` | `integrityProofRef`, `previousAttestationRef`, policy and relationship refs | Runtime governance attestation combines actor, decision, policy trace, capability refs, and integrity proof reference. |
| Capability attestations | `runtime/attestations/capability-attestation.ts` | `governanceAttestationRef`, validity window, revocation refs | Capability-specific attestation linked to governance attestation. |
| AI attestations | `runtime/attestations/ai-attestation.ts` | `humanReviewRefs`, `escalationRefs`, executed actions | AI execution proof-like record with runtime validation options. |
| Remote attestations | `runtime/attestations/remote-attestation.ts` | federation, remote decision, remote audit refs | Cross-runtime proof-like linkage with trust-domain validation. |
| Audit trail | `protocol/audit/types.ts`, `protocol/audit/audit-event.ts`, `packages/audit-sdk/src/contracts.ts` | `AuditEvent`, `AuditEventEnvelope`, `trustChainRef`, `policyTraceId`, `traceIds` | Audit events can function as proof artifacts but are currently audit-domain contracts. |
| Policy traces | `protocol/policy/decision-trace.ts` | `PolicyDecisionTrace` | Runtime/policy trace record with trace ID, evaluated policies, actor, resource, and reason. |
| Capability hashes and signatures | `protocol/consent/capability-hash.ts`, `protocol/consent/capability-sign.ts`, `protocol/capability/capability-verify.ts` | deterministic hash, HMAC signature, capability hash verification | Existing implementation-level cryptographic and verification behavior; not canonical schema. |
| Capability token proof metadata | `packages/protocol/src/contracts/index.ts`, `packages/capability-tokens/src/contracts.ts` | `ProofMetadata`, `CapabilityToken.proof` | A2-era proof metadata exists for capability tokens and should remain compatible while the canonical proof vocabulary matures. |
| Claims and evidence | `packages/protocol/src/claims/*`, `docs/rfcs/RFC-004-evidence-layer-v1.md`, `docs/rfcs/RFC-005-Claims-Framework.md` | evidence, assertion, claim, attestation, verification | Claims framework has the chain but did not have canonical proof artifacts. |
| A3 references | `packages/protocol/src/claims/references.ts` | `CanonicalPrincipalRef`, `CanonicalReferenceSource`, trace/audit source kinds | Structured references can describe proof sources but are not proof contracts. |

## Duplicate proof representations

1. Runtime `IntegrityProof` represents hash/integrity data with `proofId`, `proofType`, `payloadHash`, `generatedAt`, and optional `parentProofRef`.
2. Capability token `ProofMetadata` represents proof type, proof reference, and issuance time for capability tokens.
3. Runtime governance attestations include `integrityProofRef` and `previousAttestationRef`, effectively creating a proof-reference and chain model.
4. Audit contracts include `trustChainRef`, `policyTraceId`, and `traceIds`, which are proof-like references in audit terminology.
5. Remote governance attestations include remote decision and remote audit references that overlap with audit proof and chain proof concepts.

## Existing hash concepts

- `runtime/attestations/integrity-proof.ts` creates SHA-256 hashes for runtime integrity proofs.
- `protocol/consent/capability-hash.ts` creates SHA-256 hashes for canonical capability payloads.
- `protocol/capability/capability-verify.ts` recomputes deterministic capability hashes to detect integrity mismatch.
- Several governance documents mention immutable ancestry hashes for memory and intent replay semantics.

## Existing signature concepts

- `protocol/consent/capability-sign.ts` signs capability hashes with HMAC-SHA-256.
- `packages/protocol/src/contracts/index.ts` includes `ProofMetadata.proofType` values such as `jwt`, `mTLS`, and `detached-signature`.
- RFC-004 discusses signed artifacts and platform-independent evidentiary value conceptually.

## Existing trace concepts

- `protocol/policy/decision-trace.ts` defines `PolicyDecisionTrace`.
- `protocol/audit/types.ts` defines audit correlations with `traceIds`.
- Runtime, memory, intent, capability, and sovereign execution documents discuss runtime, decision, lineage, and audit-safe traces.
- A3 reference source kinds already include `AuditTrace` and `RuntimeTrace`.

## Existing integrity concepts

- Runtime integrity proof generation and validation exists under `runtime/attestations`.
- Capability verification detects capability hash integrity mismatch.
- Governance and runtime documents describe fail-closed integrity checks, replay guards, immutable ancestry hashes, and tamper-detectable records.

## Architectural conclusion

The repository contains multiple valid proof-like concepts, but they are package-specific and often mixed with validation or runtime behavior. AOC Main needs a neutral schema vocabulary that can reference these artifacts without implementing cryptography, verification, chain validation, runtime verification, standing evaluation, authority evaluation, or decision authorization. The appropriate location is `packages/protocol/src/claims/proofs/` because proofs support the RFC-005 claims chain and can be exported from `@aoc/protocol/claims` while preserving separation from runtime and Enterprise behavior.

## Migration candidates for future deprecation review

These contracts should eventually map toward `CanonicalProofRef` or `CanonicalProofEnvelope` at protocol boundaries without removal or compatibility breaks:

1. `runtime/attestations/types.ts` `IntegrityProof` → `CanonicalHashProof` and `CanonicalIntegrityProof`.
2. `runtime/attestations/types.ts` `GovernanceAttestation` → `CanonicalAttestationProof` and `CanonicalChainProof` for `previousAttestationRef` lineage.
3. `runtime/attestations/types.ts` `RemoteGovernanceAttestation` → `CanonicalAttestationProof`, `CanonicalAuditProof`, and `CanonicalChainProof`.
4. `runtime/attestations/types.ts` `AIAttestation` → `CanonicalTraceProof` or `CanonicalAttestationProof` depending on whether the artifact is execution trace or attestation.
5. `packages/protocol/src/contracts/index.ts` `ProofMetadata` → `CanonicalProofRef` for capability-token proof references.
6. `protocol/audit/types.ts` `AuditEvent` and `AuditCorrelation` → `CanonicalAuditProof` and `CanonicalTraceProof` references.
7. `protocol/policy/decision-trace.ts` `PolicyDecisionTrace` → `CanonicalTraceProof` references.
