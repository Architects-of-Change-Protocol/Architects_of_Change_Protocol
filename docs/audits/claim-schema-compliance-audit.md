# Claim Schema Constitutional Compliance Audit

| Field | Value |
|---|---|
| Audit | Canonical Claim Schema Constitutional Compliance Audit |
| Date | 2026-06-02 |
| Scope | `packages/protocol/src/claims/` canonical contracts |
| Constitutional Chain | Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision |

## Executive Finding

The canonical trust model contracts align with RFC-005 by preserving each trust-chain concept as an independent contract. The schema layer intentionally introduces no registry, storage, API, lifecycle engine, verification engine, standing engine, or authority resolver.

The contracts are located in `packages/protocol/src/claims/` because `@aoc/protocol/claims` is already a public protocol package export and because the protocol package is the implementation-neutral surface for constitutional contracts.

## Compliance Matrix

| Source | Alignment | Assessment |
|---|---|---|
| GA-01 | Authority must be explicit, governed, auditable, and non-arbitrary. | The contracts require authority to reference capabilities and decisions to reference authority. Claims cannot directly authorize decisions. |
| RFC-001 | Identity must be portable and not collapsed into runtime authorization. | `ClaimType.Identity` exists, while identity-specific runtime or provider fields are kept out of the canonical claim contract. |
| RFC-002 | Governance must preserve explicit policy and review boundaries. | `ClaimType.Governance`, `EvidenceType.BoardResolution`, `AttestationType.Governance`, and `DecisionStatus` provide governance vocabulary without implementing governance engines. |
| RFC-003 | Knowledge and interpretive outputs must remain traceable to sources. | `CanonicalAssertion` binds statements to evidence references before claims are formalized. |
| RFC-004 | Evidence must be portable, independently verifiable, and distinct from truth or authority. | `CanonicalEvidence` is independent from claim, verification, standing, authority, and decision contracts. |
| RFC-005 | The trust chain must be concept-first, implementation-neutral, and explainable end-to-end. | Each node in the RFC-005 chain is represented by its own canonical contract and reference fields preserve derivation boundaries. |

## RFC-005 Chain Review

### Evidence

`CanonicalEvidence` captures the evidence identifier, type, subject, issuer, source, description, creation timestamp, and protocol-neutral metadata. It does not contain verification output, standing, authority, or decision fields.

### Assertion

`CanonicalAssertion` is first-class and captures the interpretive statement between evidence and claim. It references evidence by identifier and records the subject, issuer, and creation timestamp.

### Claim

`CanonicalClaim` captures formal claim content through type, subject, issuer, assertion reference, evidence references, attestation references, issuance time, optional expiration, and metadata. It intentionally excludes verification results, standing, authority, and decisions.

### Attestation

`CanonicalAttestation` unifies human, organization, system, AI, remote, and governance support for claims under a single model. It supports a claim reference, attester, statement, issuance timestamp, and metadata.

### Verification

`CanonicalVerification` is output-only: it references a claim, status, verifier, verified timestamp, findings, and optional confidence. It does not mutate claims and does not determine standing.

### Standing

`CanonicalStanding` is independent from claims and records mutable claim standing through status, reason, effective timestamp, and optional expiration. This preserves the RFC-005 requirement that standing changes over time.

### Capability

`CanonicalCapability` derives from claim and standing references. It is not modeled as a claim or token and does not contain authority resolution behavior.

### Authority

`CanonicalAuthority` derives from capability references and carries scope, status, and issuance time. It is not modeled as a capability and does not resolve policy.

### Decision

`CanonicalDecision` derives from an authority reference and records decision status, decision maker, decision date, and reason. It does not duplicate claim or capability state.

## Gaps

1. RFC-001, RFC-002, and RFC-003 are referenced by RFC-004 but are not present as standalone RFC files in the repository. Compliance was therefore assessed from the repository's identity, governance, knowledge, and protocol documentation rather than from dedicated RFC source files.
2. The canonical contracts use primitive string references for subjects, issuers, attesters, verifiers, sources, and decision makers. A future RFC may refine these into structured principal/reference contracts.
3. Proof/signature envelopes are intentionally absent because the prompt requested contracts only and existing proof vocabularies are inconsistent across capability claims, audit events, runtime attestations, and governance signatures.
4. Verification status is intentionally simple (`Pending`, `Verified`, `Failed`). Future evidence-specific verification may need to map RFC-004 `VALID`, `INVALID`, and `INDETERMINATE` vocabulary into claim verification outputs.
5. Claim metadata remains open-ended for longevity. Future schema governance may need to define metadata namespacing and reserved keys.

## Ambiguities

1. Whether `ClaimType.Authorization` and `CanonicalAuthority` should be connected by a formal policy derivation record is left for a future authority-resolution contract.
2. Whether one attestation can support multiple claims is left for future attestation extension work; the current canonical contract is single-claim by design for integrity and simplicity.
3. Whether `CanonicalVerification.confidence` should be normalized to a bounded numeric range is left unspecified in this contract pass.
4. Whether standing status transitions require a separate lifecycle event contract is out of scope for this contract-only phase.
5. Whether `CanonicalScope` should become a structured resource/action/tenant scope is future authority-schema work.

## Future Work

1. Define principal/reference contracts for subjects, issuers, attesters, verifiers, sources, and decision makers.
2. Define proof-envelope contracts that can map capability proofs, governance signatures, signed audit events, wallet credentials, and remote attestations.
3. Define adapter guidance from existing capability tokens, identity claims, runtime attestations, audit events, and policy decisions into the canonical contracts.
4. Define lifecycle event contracts for standing, authority, and decision transitions.
5. Define a validation-only schema package or generator if the ecosystem later requires JSON Schema, Zod, or OpenAPI projections.
6. Define migration plans for existing `CapabilityClaim`, identity policy authority boundaries, runtime capabilities, and distributed attestation records.

## Compliance Conclusion

The canonical claim schema layer is constitutionally compliant with RFC-005 because it preserves the separations between evidence, assertion, claim, attestation, verification, standing, capability, authority, and decision. It also respects GA-01 by making authority explicit and auditable without implementing resolution behavior.
