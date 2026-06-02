# Claims, Attestations, and Evidence Concepts Audit

Date: 2026-06-02

## Objective

Audit the available AOC ecosystem workspace for existing implementations, abstractions, RFCs, packages, schemas, types, models, services, governance concepts, or protocol primitives related to claims, attestations, assertions, credentials, verifications, evidence-backed statements, trust transfer, standing, approvals, and decisions.

## Scope Inspected

- `Architects_of_Change_Protocol` was inspected directly.
- No sibling `PMFreak` or `AOC Enterprise` repository was present under `/workspace` during this audit. The available PMFreak material is the in-repo `examples/pmfreak-adapter` plus extraction references in architecture documentation.
- In-repo architecture documents reference historical PMFreak and AOC Enterprise extraction targets, including capability claims, approval runtime, trust-domain verification, external verifier handshakes, distributed trust coordination, and deterministic verification migrations.

## Search Terms

The repository was searched for these terms, excluding `node_modules`, `.git`, and `package-lock.json`:

`claim`, `claims`, `attestation`, `attest`, `credential`, `credentials`, `assertion`, `assert`, `verification`, `verified`, `evidence`, `provenance`, `trust`, `approval`, `decision`, and `standing`.

Observed match counts:

| Term | Count |
|---|---:|
| `claim` | 20 |
| `claims` | 38 |
| `attestation` | 137 |
| `attest` | 5 |
| `credential` | 46 |
| `credentials` | 14 |
| `assertion` | 87 |
| `assert` | 5 |
| `verification` | 266 |
| `verified` | 103 |
| `evidence` | 424 |
| `provenance` | 171 |
| `trust` | 562 |
| `approval` | 39 |
| `decision` | 949 |
| `standing` | 1 |

## Existing Concepts

### Protocol-level claim surface

- `packages/protocol/src/claims/index.ts` already exposes a protocol package subpath, `@aoc/protocol/claims`, but the model is currently minimal: a `Claim` has only `type` and primitive `value`.
- `packages/protocol/package.json` exports `./claims`, which means there is already a package boundary for a claims primitive even if the primitive is underspecified.
- `src/contracts/capability-claims.ts` defines a richer `CapabilityClaim` with versioning, issuer, subject, authority, constraints, lineage, and proof metadata. This is the strongest existing claims-shaped contract.

### Identity claims and credentials-adjacent metadata

- `packages/identity/src/contracts.ts` defines an `IdentityContract` with `claims`, `trust`, `tenant`, and optional `federation` metadata.
- The identity `Claim` includes `name`, `value`, `issuer`, `issuedAt`, optional `expiresAt`, and optional confidence. This overlaps with credentials and assertions, but it is identity-specific and does not include evidence references, verification state, revocation references, or proof envelopes.
- Identity `TrustMetadata` includes assurance level, verification methods, trust frameworks, and attestation metadata.

### Evidence Layer RFC

- `docs/rfcs/RFC-004-evidence-layer-v1.md` defines Evidence as a protocol-level layer for tamper-detectable, auditable, infrastructure-independent artifacts.
- It explicitly names contracts, decision records, certifications, credentials, approval records, and AI decision records as evidence-relevant artifacts.
- It defines Evidence ID determinism, immutability, portability, verification outcomes, registry responsibilities, and the limit that evidence verification does not decide truthfulness, authority, legal validity, or completeness.

### Runtime attestation layer

- `runtime/attestations` defines a Governance Attestation Layer for AOC Core runtimes.
- `runtime/attestations/types.ts` defines attestation types for governance decisions, capability issuance/use, delegation validation, AI execution, remote governance, and audit snapshots.
- It also defines `IntegrityProof`, `GovernanceAttestation`, `CapabilityAttestation`, `AIAttestation`, and `RemoteGovernanceAttestation`.
- `runtime/attestations/integrity-proof.ts` implements hash-based local integrity proofs with optional parent-proof linkage.
- `runtime/attestations/governance-attestation.ts` implements in-memory creation, lookup, validation, and integration hooks for governance attestations.
- `runtime/attestations/attestation-chain.ts` implements chain append, validation, continuity checks, timestamp-regression checks, and chain reconstruction from a tail attestation.
- `runtime/attestations/capability-attestation.ts`, `ai-attestation.ts`, and `remote-attestation.ts` provide specialized validators for capability, AI, and federated governance attestations.

### Decisions, approvals, and policy traces

- `packages/governance-runtime/src/index.ts` defines `GovernanceDecision` with `allow`, `deny`, and `conditional` outcomes, reason lists, policy source IDs, and inherited scope chain.
- `packages/governance-runtime/src/index.ts` also signs governance decisions by hashing the decision and evaluation context, then producing a `SignedAuthorizationDecision`.
- `packages/authorization-runtime/src/index.ts` composes policy, federated trust, governance, capability, and consent checks into `AuthorizationDecision` envelopes containing provenance and explainability.
- `runtime/policy/types.ts` and `runtime/policy/evaluation.ts` define policy decisions, conflicts, obligations, evaluation traces, and normalized allow/deny outcomes.
- `runtime/governance/reason-codes.ts` provides a decision/reason registry with categories, severity, audience, lifecycle, classification, audit safety, and telemetry classification.
- `DECISION_REGISTRY_MODEL.md` documents this registry as the canonical location for deterministic reason-code lookups.

### Trust transfer, standing, and federated authority

- `protocol/identity/types.ts` defines trust levels, verification status, actor authority boundaries, delegation grants, and trust chains.
- `protocol/identity/trust-chain.ts` builds and validates trust paths from delegation grants, including continuity and max-depth checks.
- `packages/shared-types/src/index.ts` defines `RuntimeTrustNode`, `RuntimeTrustEdge`, `RuntimeFederation`, `AuthorityTrustProfile`, `GovernanceSignature`, and signed authorization/audit/consent records.
- `packages/trust-registry-runtime/src/index.ts` evaluates whether a governance signature is trusted for a scope, checks signer registration, revocation, expiry, scope compatibility, and federated trust paths.
- `FEDERATED_TRUST_SEMANTICS.md` defines trust states and fail-closed guarantees for revoked, untrusted, incompatible, degraded, and capability-limited trust.

### Audit and provenance

- `packages/audit-runtime/src/index.ts` defines decision explanations, federated provenance, governance provenance, attribution, audit contracts, signed audit events, chain verification, and provenance enrichment for finalized decisions.
- `packages/shared-types/src/contracts.ts` defines `AuthorizationDecisionEnvelope` with provenance and explainability records.
- `packages/shared-types/src/index.ts` defines signed audit events and portable cognition integrity hashes, including a `provenanceHash`.

### Execution attestations and distributed continuations

- `runtime/execution-fabric/types.ts` defines `ExecutionContinuation.requiredAttestationRefs`, `ExecutionAttestationRef`, an `AttestationLayerAdapter`, and `ExecutionAttestationRecord` decisions such as authorized, completed, failed, replayed, revoked, suspended, and resumed.
- `EXECUTION_ATTESTATION_MODEL.md` documents execution attestation canonical decisions and reason-code/visibility-tier inclusion.
- `FEDERATED_ATTESTATION_MODEL.md` documents remote runtime attestation exchange and attestation chains in federated execution lineage.

### PMFreak and AOC Enterprise overlap visible in this repo

- `examples/pmfreak-adapter/src/index.ts` shows PMFreak integrating `AuthorizationRuntime`, `GovernanceRuntime`, `CapabilityRuntime`, `ConsentRuntime`, and `AuditRuntime` through provider interfaces.
- `docs/architecture/aoc-multi-repo-extraction-plan.md` identifies `src/aoc/protocol/contracts/capability-claims.ts` as “Capability claim semantics + verification contract” targeted for the Protocol repo, and identifies multiple Enterprise/PMFreak migrations related to approvals, trust domains, external verifier handshakes, distributed trust coordination, and deterministic verification.
- `docs/architecture/aoc-layering.md` defines the intended dependency direction: PMFreak depends on AOC Enterprise, which depends on AOC Protocol.

## Partial Implementations

1. **Claims exist, but are fragmented.** The protocol package has a minimal `Claim`; identity has a richer identity-only claim; capability claims have a much richer authority/proof/lineage contract. These should be reconciled rather than replaced.
2. **Attestations are runtime-backed, not yet protocol-backed.** The runtime attestation layer has strong operational semantics, but local storage and JSON-stringify hashing mean it is not yet a canonical protocol primitive.
3. **Evidence is specified but not implemented as a package.** RFC-004 provides strong conceptual structure, but the codebase lacks an `Evidence`, `EvidenceId`, `EvidenceRegistry`, or `VerificationOutcome` package surface.
4. **Verification appears in multiple domains.** Identity verification status, attestation validators, audit-chain verification, policy evaluation, trust-registry evaluation, and Evidence Layer verification all use verification-like language with different semantics.
5. **Trust transfer is strong but domain-specific.** Actor trust chains and runtime trust registries model delegation and federated authority, but they are not generalized as claim standing or trust transfer for arbitrary claims.
6. **Decisions are mature but not modeled as claims.** Governance, policy, authorization, execution, and reason-code registries already provide decision records and traces that can be lifted into claim/evidence envelopes.
7. **Approval concepts are embedded.** Approval appears through capability lineage, human review thresholds, extraction-plan migration references, approval records in RFC-004, and policy/governance decisions rather than as a single canonical approval model.

## Architectural Conflicts with an Emerging RFC-005 Claims Framework

Because no `RFC-005` file was present in the repository at audit time, these conflicts are stated against the likely direction of a claims framework inferred from the requested concept set.

1. **Name collision and semantic drift around `Claim`.** `@aoc/protocol/claims` currently exports a primitive-only `Claim`, while identity and capability claims carry richer issuer, lifecycle, proof, lineage, and authority semantics. RFC-005 should not simply extend one existing meaning without defining the relationship among generic claims, identity claims, and capability claims.
2. **Evidence vs claim truth boundary.** RFC-004 explicitly limits evidence verification to structural integrity and provenance, not truthfulness, authority, legal validity, or completeness. RFC-005 must avoid saying that evidence-backed claims are automatically true or authorized; it should separate claim assertion, evidence binding, verification, and adjudication.
3. **Runtime attestation durability gap.** Runtime attestations use in-memory maps and JSON.stringify-based hashes. That conflicts with any RFC-005 requirement for portable, deterministic, infrastructure-independent claims unless these implementations are treated as adapters/foundations rather than canonical protocol records.
4. **Proof model inconsistency.** Capability claims use `proof.algorithm`, `keyId`, and `signature`; shared runtime types use `GovernanceSignature`; attestations use `IntegrityProof` hashes; audit events use signed chain records. RFC-005 should define a common proof-envelope vocabulary or explicit adapters among these forms.
5. **Verification outcome inconsistency.** RFC-004 uses `VALID`, `INVALID`, and `INDETERMINATE`; existing runtime validators often return `{ valid: boolean; reasons: string[] }`; policy and authorization use allow/deny/conditional. RFC-005 should define claim-verification outcomes without collapsing them into authorization decisions.
6. **Layering risk.** Existing architecture requires Protocol to avoid dependencies on Enterprise and PMFreak. Claims should not import runtime services, provider interfaces, Supabase migrations, or PMFreak-specific approval workflows.
7. **Trust and standing are not the same as authorization.** Existing trust registries and authorization runtime can deny or allow actions, but RFC-005 should define “standing to assert/verify/adjudicate a claim” separately from permission to execute an action.

## Reusable Assets

- Reuse `@aoc/protocol/claims` as the eventual protocol package entry point, but replace/expand the current minimal `Claim` carefully and version it.
- Reuse `src/contracts/capability-claims.ts` for the initial authority, lineage, constraints, and proof vocabulary.
- Reuse identity claim fields (`issuer`, `issuedAt`, `expiresAt`, `confidence`) and trust metadata as identity-domain projections of generic claims.
- Reuse RFC-004 concepts for Evidence, Evidence ID, verification outcomes, and evidence registry roles.
- Reuse `runtime/attestations` validators and chain logic as runtime adapters for claim attestations, not as canonical protocol definitions.
- Reuse `GovernanceSignature`, `SignedAuthorizationDecision`, `SignedAuditEvent`, and trust-registry evaluation as proof/trust adapters.
- Reuse `AuthorizationDecisionEnvelope`, `PolicyEvaluationTrace`, reason-code registry, and audit runtime provenance for decision-backed claims.
- Reuse `protocol/identity/trust-chain.ts` and `packages/trust-registry-runtime` to compute claim standing and trust transfer paths.
- Reuse the PMFreak adapter as evidence that product-level integrations should call runtime/package APIs rather than own protocol semantics.

## Recommended Direction

Claims should become a combination of protocol primitive, shared package, governance capability, and PMFreak/AOC Enterprise domain projection.

### 1. Protocol Primitive

Define RFC-005 Claims as a protocol primitive in `@aoc/protocol/claims`. The primitive should own the canonical vocabulary:

- `Claim`
- `ClaimId`
- `ClaimSubject`
- `ClaimIssuer`
- `ClaimStatement`
- `ClaimEvidenceRef`
- `ClaimProof`
- `ClaimStatus`
- `ClaimVerificationResult`
- `ClaimStanding`
- `ClaimDecisionRef`
- `ClaimLifecycleEvent`

The protocol primitive should remain implementation-neutral and should not depend on runtime packages.

### 2. Shared Package

Create or expand a shared package for reusable Typescript schemas and validators. A good path is either:

- expand `packages/protocol/src/claims`, or
- add `packages/claims` if the claim model becomes large enough to warrant its own package.

Recommendation: start inside `@aoc/protocol/claims` because that export already exists, then extract only if the surface grows.

### 3. Governance Capability

Add claims as a governance capability that can answer:

- Who has standing to issue this claim?
- Which policy authorized the claim?
- Which trust path transferred authority?
- Which obligations attach to the claim?
- Which decision/adjudication accepted, rejected, superseded, revoked, or qualified it?

This should reuse governance decisions, reason codes, policy traces, trust registries, and audit provenance.

### 4. Runtime Attestation Adapter

Keep `runtime/attestations` as the operational attestation adapter for runtime events. It should implement protocol claim/evidence interfaces where appropriate, but canonical claims should not be defined in the runtime folder.

### 5. PMFreak Domain Model

PMFreak should consume Claims as domain objects for product workflows such as approvals, customer discovery evidence, product decisions, expert credentials, and market assertions. PMFreak should not own the base claim vocabulary.

### 6. AOC Enterprise Capability

AOC Enterprise should own production runtime services: persistence, policy enforcement, external verifier handshakes, enterprise approval workflows, trust-domain administration, and deterministic verification services.

## Proposed Layering

```text
AOC Protocol
  RFC-005 + @aoc/protocol/claims canonical types
  RFC-004 evidence references and verification vocabulary

Shared Packages
  Optional validators, schema helpers, canonicalization, hashing utilities

AOC Runtime / AOC Enterprise
  Claim registry service
  Claim verification service
  Standing evaluator
  External verifier handshakes
  Attestation adapters
  Audit/provenance integration

PMFreak
  Product-specific claim templates and workflows
  Approval/decision UX
  Domain-specific assertions and evidence collection
```

## Immediate Next Steps

1. Draft RFC-005 to explicitly distinguish Claim, Evidence, Attestation, Verification, Decision, Approval, Credential, and Standing.
2. Promote a versioned canonical claim contract under `packages/protocol/src/claims` while preserving compatibility for the existing minimal `Claim` export.
3. Define adapters from identity claims, capability claims, governance decisions, execution attestations, and evidence artifacts into the canonical claim model.
4. Standardize proof envelopes across `CapabilityClaim.proof`, `GovernanceSignature`, `IntegrityProof`, and signed audit events.
5. Define a tri-state claim verification result compatible with RFC-004 (`valid`, `invalid`, `indeterminate`) and keep it separate from authorization decisions (`allow`, `deny`, `conditional`).
6. Define `ClaimStanding` using actor trust chains and runtime trust registries.
7. Treat runtime attestations as claim/evidence producers, not the canonical claim schema.
8. Avoid rebuilding existing decision, trust, audit, policy-trace, and attestation-chain assets.
