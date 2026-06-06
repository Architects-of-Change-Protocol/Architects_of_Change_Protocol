# PR-04 Assurance Ownership Validation

## Validation basis

Validation was performed before extraction against:

1. `docs/architecture/protocol-extraction-execution-plan.md`;
2. `docs/architecture/protocol-runtime-dependency-report.md`;
3. the live runtime/package source tree; and
4. the Protocol adapter surface in `packages/protocol/src/adapters/index.ts`.

`docs/architecture/extraction-ownership-matrix.md` is not present in this checkout. The execution plan explicitly records that the intended ownership matrix was unavailable when that plan was authored. PR-04 therefore does not fabricate or modify a Protocol ownership artifact; this report records the live-source validation and treats the dependency report plus execution plan as the available boundary authority.

## Validated Assurance inventory

| Component | Current location before PR-04 | Ownership classification | Dependencies | Protocol adapter contracts used / applicable | Migration risk |
|---|---|---|---|---|---|
| Signed audit runtime, decision finalization, chain creation and verification | `packages/audit-runtime/src/index.ts` | Enterprise Assurance runtime | `@aoc-runtime/shared-types`, signing/hash functions from `@aoc-runtime/crypto` | `AuditEventSink` is the event persistence seam; signed runtime event shapes remain existing runtime compatibility types | Medium: package consumers require an unchanged export surface and signature verification must remain byte-for-byte compatible |
| Legacy in-memory audit persistence, filtering, ordering, retention, and replay-oriented listing | `runtime/audit/service.ts` (`InMemoryAuditService`) | Enterprise Assurance runtime | Legacy `protocol/audit` event/query types | `AuditEventSink` for canonical audit envelopes | Medium: the historical audit type barrel contains overlapping legacy/current names, so the shim must preserve the exact old method signatures |
| Hosted audit aggregation and processing | `runtime/audit/service.ts` (`RuntimeAuditService`) | Enterprise Assurance runtime | Trust, payout, and data-access event sources | Source adapters internally; `AuditEventSink` remains the canonical outbound seam | Medium: constructor compatibility spans three existing services with different event unions |
| Identity verification workflow | `runtime/trust/service.ts` (`verifyIdentity`) | Enterprise Assurance verification runtime | Issuer, credential, consent stores and wall-clock input | `VerificationProvider`, `VerificationKeyResolver` for canonical claim verification; legacy identity verification remains wire-compatible | High: verification reason codes and emitted audit ordering are public behavior |
| Payout trust verification orchestration | `runtime/trust/service.ts` (`enforcePayoutKyc`) | Enterprise Assurance verification/trust runtime | Identity verification workflow and trust audit events | Verification runtime boundary; canonical implementations use `VerificationProvider` | High: payout allow/deny reason strings and audit events are compatibility-sensitive |
| Federated signer registry and trust-chain evaluation | `packages/trust-registry-runtime/src/index.ts` | Enterprise Assurance trust runtime | Federation nodes/edges, governance signatures, trust scopes from shared runtime types | `RegistryLookup`, `TrustRegistryProvider` for canonical registry access | High: trust-path and revocation evaluation must not change during relocation |
| Hosted identity issuer/credential/consent registry service | `runtime/trust/service.ts` | Enterprise Assurance trust runtime | In-memory maps and identity verification engine | `RegistryLookup`, `TrustRegistryProvider` are exercised by the new canonical trust registry | High: hosted API routes and multiple services directly import the historical path |
| Runtime telemetry, metrics, trace context, and health reporting | `runtime/observability.ts` | Enterprise Assurance observability runtime | Runtime endpoint vocabulary and version constants | `ObservabilityEventSink`, `ProtocolEventSink`, `SecurityEventSink`, `AuditEventSink` | Medium: timestamps and version metadata require parity; endpoint vocabulary remains structurally stable |
| Structured runtime logger | `runtime/logging/logger.ts` | Enterprise Assurance observability runtime | `console.log` JSON output | Event sinks are available for future injection; logger output remains unchanged in PR-04 | Low: small API, but log serialization is externally observable |
| Attestation creation and validation | `runtime/attestations/*` | Enterprise Assurance runtime, intentionally deferred | Runtime-local attestation types and registries | `AttestationLookup`, `VerificationProvider` | High: no attestation-runtime adapter migration or golden parity corpus was in scope for this Assurance-only slice |
| Capability verification | `protocol/capability/capability-verify.ts` | Mixed legacy Protocol-adjacent implementation, intentionally deferred | Capability parser/hash implementation | Future `VerificationProvider` binding | High: moving it would touch a Protocol-adjacent capability surface beyond the explicit Assurance runtime paths and risks contract interpretation changes |
| Cryptographic payload verification | `crypto/engine.ts` | Shared cryptographic primitive, not Assurance-owned | Node cryptography and crypto-owned types | Used behind verification/audit implementations, not moved | High: shared primitive ownership is broader than Assurance and changing it would affect many packages |
| Portable cognition integrity verification | `packages/portable-cognition/src/index.ts` | Portable cognition runtime, intentionally deferred | Portable package hashes and shared types | Future `VerificationProvider` integration | Medium: separate package ownership and no existing Assurance compatibility path |
| Evidence, attestation, proofs, lineage, and explainability directories | No dedicated Enterprise runtime yet | Reserved Enterprise Assurance ownership | Future protocol contracts/adapters | Future seams; no implementations moved in PR-04 | Medium to high depending on persistence and replay behavior |

## Boundary result

- No files under `packages/protocol/src/contracts`, `packages/protocol/src/claims`, `packages/protocol/src/errors`, or Protocol fixtures were modified.
- Enterprise consumes Protocol adapter interfaces; Protocol does not import Enterprise.
- Copy-first compatibility is retained at all historical runtime/package entry points changed by this PR.
- Deferred components are represented by explicit Enterprise Assurance ownership directories and README files, not speculative implementations.
