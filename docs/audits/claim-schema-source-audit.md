# Claim Schema Source Audit

| Field | Value |
|---|---|
| Audit | Canonical Claim Schema Source Audit |
| Date | 2026-06-02 |
| Scope | Existing claim, evidence, attestation, governance decision, standing, capability, and authority terminology across AOC Main |
| Output | Source inventory and migration guidance for the canonical trust model contracts |

## Executive Finding

AOC Main already contains many trust-adjacent contracts, but they are distributed across protocol, runtime, SDK, identity, capability, consent, audit, and governance surfaces. The repository has a pre-existing `@aoc/protocol/claims` export, but its source currently exposes only a minimal primitive `Claim` shape. That export location is the correct canonical home because RFC-005 now makes the trust chain constitutional and because the protocol package is already the implementation-neutral package boundary.

The canonical schema layer should therefore expand `packages/protocol/src/claims/` into the single source of truth for trust model contracts while leaving existing runtime, SDK, adapter, and product-specific implementations intact.

## Audit Inputs

Primary source locations reviewed:

- `docs/rfcs/RFC-005-Claims-Framework.md`
- `docs/rfcs/RFC-004-evidence-layer-v1.md`
- `docs/audits/rfc005-source-audit.md`
- `docs/audits/claims-attestations-audit-2026-06-02.md`
- `packages/protocol/src/claims/index.ts`
- `packages/protocol/src/contracts/index.ts`
- `src/contracts/capability-claims.ts`
- `src/capabilities/types.ts`
- `src/decisions/types.ts`
- `packages/shared-types/src/index.ts`
- `packages/shared-types/src/contracts.ts`
- `runtime/distributed/types.ts`
- `runtime/capabilities/types.ts`
- `runtime/capabilities/governance.ts`
- `protocol/identity-policy/types.ts`
- `protocol/identity-policy/README.md`
- `protocol/governance/governance-compliance-spec.md`
- `protocol/protocol-invariants-spec.md`

Commands used during audit:

```sh
find .. -name AGENTS.md -print
find packages/protocol -maxdepth 5 -type f | sort
rg -n "export (type|interface|enum|const).*?(Claim|Evidence|Attestation|Capability|Authority|Decision|Verification|Standing|Governance|Identity)|type .*?(Claim|Evidence|Attestation|Capability|Authority|Decision|Verification|Standing)|interface .*?(Claim|Evidence|Attestation|Capability|Authority|Decision|Verification|Standing)|enum .*?(Claim|Evidence|Attestation|Capability|Authority|Decision|Verification|Standing)" --glob '*.ts' --glob '!**/dist/**' --glob '!**/node_modules/**'
rg -n "GA-01|RFC-001|RFC-002|RFC-003|RFC-004|RFC-005" docs protocol *.md --glob '!**/dist/**'
```

## Existing Claim Definitions

### `packages/protocol/src/claims/index.ts`

- Existing contract: `Claim` with `type` and `value`.
- Classification: canonical location, non-canonical shape.
- Finding: reusable only as evidence that the package export already exists. The shape is too small for RFC-005 because it does not model subject, issuer, assertions, evidence, attestations, lifecycle timestamps, or metadata.

### `src/contracts/capability-claims.ts`

- Existing contracts: `CapabilityClaim`, `CapabilityClaimVersion`, `ClaimIssuerType`, `ClaimSubjectType`.
- Reusable concepts:
  - issuer structure;
  - subject structure;
  - authority/action vocabulary;
  - temporal lineage through `issuedAt`;
  - proof envelope vocabulary.
- Duplicate concepts:
  - claim subject and issuer definitions overlap with identity and shared actor references;
  - authority is embedded in a capability claim rather than modeled as a derived contract.
- Migration candidate: map `CapabilityClaim` into `CanonicalClaim` with `ClaimType.Capability`, `assertionRef`, `evidenceRefs`, and domain-specific metadata.

### Identity claim candidates

- Existing identity concepts appear in `packages/identity/src/contracts.ts`, `packages/shared-types/src/index.ts`, and `protocol/identity-policy/types.ts`.
- Reusable concepts:
  - actor identifiers;
  - actor types;
  - active/inactive trust-chain status;
  - authority boundaries;
  - delegation limits.
- Duplicate concepts:
  - identity status and authority status are mixed in policy prechecks;
  - identity activity is sometimes treated as authorization readiness.
- Migration candidate: identity packages should project identity assertions into `CanonicalClaim` with `ClaimType.Identity` rather than defining independent base claim semantics.

## Existing Evidence Definitions

### RFC-004 Evidence Layer

- Existing source: `docs/rfcs/RFC-004-evidence-layer-v1.md`.
- Reusable concepts:
  - evidence is infrastructure-independent;
  - evidence must be portable and independently verifiable;
  - evidence verification is structural/provenance-oriented, not a declaration of truth or authority.
- Duplicate concepts:
  - audit events, runtime telemetry, and signed records all act as evidence in current implementations but do not share a canonical evidence contract.
- Migration candidate: canonicalize evidence references through `CanonicalEvidence` and permit runtime/audit artifacts to be referenced as `EvidenceType.AuditRecord`, `EvidenceType.SystemRecord`, or `EvidenceType.AIOutput`.

### Audit and runtime evidence candidates

- Existing sources: `packages/audit-runtime/src/index.ts`, `packages/shared-types/src/contracts.ts`, and `runtime/distributed/types.ts`.
- Reusable concepts:
  - event identifiers;
  - emitted timestamps;
  - actor/provenance fields;
  - signed audit and governance provenance envelopes.
- Conflict: these artifacts currently combine evidence, attestation, and decision explanation in runtime-specific shapes.
- Migration candidate: treat audit/runtime records as evidence inputs and decision-explainability outputs, not as canonical claims.

## Existing Attestation Definitions

### Runtime/federated attestations

- Existing sources: `runtime/distributed/types.ts`, `EXECUTION_ATTESTATION_MODEL.md`, `FEDERATED_ATTESTATION_MODEL.md`.
- Reusable concepts:
  - runtime attestation identity;
  - attested runtime references;
  - issued timestamps;
  - attestation chains.
- Duplicate concepts:
  - `RuntimeAttestation`, `AIConnectorAttestation`, and execution/federation attestation language all express attributable support but use separate names and structures.
- Migration candidate: map these to `CanonicalAttestation` with `AttestationType.System`, `AttestationType.AI`, or `AttestationType.Remote`.

### Governance and capability attestations

- Existing sources: governance docs, capability lineage docs, runtime capability governance types.
- Reusable concepts:
  - governance body as attester;
  - policy lineage;
  - issuance and revocation metadata.
- Conflict: governance approvals are sometimes represented as decisions and sometimes as attestations.
- Migration candidate: governance support for a claim should be a `CanonicalAttestation`; governance acceptance/rejection should be a `CanonicalDecision`.

## Existing Governance Decisions

### Policy and authorization decisions

- Existing sources: `src/decisions/types.ts`, `packages/shared-types/src/contracts.ts`, `packages/authorization-runtime/src/index.ts`, `packages/consent-runtime/src/index.ts`, and `runtime/distributed/types.ts`.
- Reusable concepts:
  - decision status/outcome vocabularies;
  - decision context;
  - reason/rationale fields;
  - policy references;
  - evaluation timestamps.
- Duplicate concepts:
  - `PolicyDecision`, `AuthorizationDecisionEnvelope`, `ConsentDecision`, `RuntimeFederationDecision`, and distributed governance decisions all encode outcomes.
- Conflict: allow/deny authorization decisions are not the same as RFC-005 decision lifecycle states.
- Migration candidate: runtime policy decisions should reference `CanonicalDecision` only when they are consequential protocol decisions derived from authority.

## Existing Capability and Authority Contracts

### Capability contracts

- Existing sources: `packages/protocol/src/contracts/index.ts`, `src/capabilities/types.ts`, `runtime/capabilities/types.ts`, `runtime/capabilities/governance.ts`, `packages/capability-tokens/src/contracts.ts`.
- Reusable concepts:
  - capability identifiers;
  - scopes;
  - constraints;
  - delegation;
  - lifecycle states;
  - revocation metadata.
- Duplicate concepts:
  - capability token, capability grant, runtime capability, normalized capability, and capability claim all represent overlapping authority-bearing concepts.
- Conflict: some capability contracts act as credentials/tokens while RFC-005 defines capability as derived from standing claims.
- Migration candidate: use `CanonicalCapability` as the derivation contract, then keep tokens/grants as implementation projections.

### Authority contracts

- Existing sources: `packages/shared-types/src/index.ts`, `src/contracts/capability-claims.ts`, `protocol/identity-policy/types.ts`, and `runtime/capabilities/governance.ts`.
- Reusable concepts:
  - authority identifiers;
  - authority boundaries;
  - delegation chains;
  - scoped action/resource fields;
  - trust profiles.
- Duplicate concepts:
  - authority appears as embedded claim authority, identity authority boundary, machine authority snapshot, resource authority profile, and capability status.
- Conflict: authority is often co-located with capability or identity, while RFC-005 requires authority to derive from capabilities.
- Migration candidate: introduce `CanonicalAuthority` as independent from claims and capabilities; downstream authority resolvers can later derive it.

## Reusable Types

The following concepts should be reused semantically, without importing implementation-specific runtime types into the protocol claims package:

1. `CanonicalId` and `UtcDateTime` from `packages/protocol/src/contracts/index.ts` as base primitive semantics.
2. Capability subject/issuer vocabulary from `src/contracts/capability-claims.ts`.
3. Actor and namespace reference vocabulary from `packages/shared-types/src/index.ts`.
4. RFC-004 evidence portability, independence, and verifiability principles.
5. Governance provenance and audit event envelope concepts from audit/shared packages.
6. Runtime/federated attestation concepts as adapter inputs.
7. Policy and authorization decision rationale concepts as adapter outputs.
8. Capability lineage, scope, and revocation semantics as future derivation inputs.

## Duplicate Concepts

1. Claim is duplicated as protocol primitive, capability claim, identity-domain assertions, runtime trust assertions, compatibility assertions, and policy assertions.
2. Evidence is duplicated as audit events, signed records, telemetry events, documents, and runtime traces.
3. Attestation is duplicated as runtime attestation, AI connector attestation, execution attestation, governance signatures, and signed audit events.
4. Decision is duplicated as policy decision, authorization decision, consent decision, distributed governance decision, and runtime federation decision.
5. Capability is duplicated as token, grant, request, runtime capability, normalized capability, and claim authority payload.
6. Authority is duplicated as identity authority boundary, machine authority snapshot, resource authority profile, delegated authority edge, and embedded claim authority.

## Conflicting Terminology

1. `Claim` sometimes means a primitive value, sometimes a capability-specific credential-like record, and sometimes an assertion-like statement.
2. `Verification` sometimes means evidence integrity, runtime validation, policy evaluation, or authorization decision.
3. `Decision` sometimes means allow/deny policy output and sometimes a governance lifecycle event.
4. `Capability` sometimes means derived permission, active runtime token, requested grant, or authority claim.
5. `Authority` sometimes means identity boundary, delegated capability, trust profile, or final decision eligibility.
6. `Attestation` sometimes means signed support for a claim and sometimes runtime integrity proof.
7. `Standing` is not consistently represented as an independent, mutable protocol state.

## Migration Candidates

1. Replace the minimal `@aoc/protocol/claims` `Claim` with RFC-005 canonical contracts while preserving a compatibility alias only if later needed.
2. Map `CapabilityClaim` to `CanonicalClaim` plus `CanonicalCapability` rather than embedding authority resolution in the claim itself.
3. Map identity actor/authority-boundary state into identity claims and standing records.
4. Map runtime, AI, remote, and governance attestations into `CanonicalAttestation`.
5. Map policy/authorization/consent outputs into `CanonicalDecision` only when they represent authority-derived consequential decisions.
6. Map audit events, board resolutions, contracts, certifications, system records, and AI outputs into `CanonicalEvidence`.
7. Introduce future adapters that translate existing runtime package outputs into canonical protocol contracts without changing existing runtime behavior.

## Concepts That Should Become Canonical

1. Evidence as a portable support artifact.
2. Assertion as the interpretive bridge from evidence to claim.
3. Claim as a formal statement about a subject, separate from verification and standing.
4. Attestation as attributable support for a claim.
5. Verification as output about claim support, not authorization.
6. Standing as mutable validity state independent from claim content.
7. Capability as derived from standing claims, not identical to a claim.
8. Authority as derived from capabilities, not identical to capability.
9. Decision as authority-derived consequential action state.
10. Central enum vocabularies for claim, evidence, attestation, verification, standing, authority, and decision status.

## Location Recommendation

Use `packages/protocol/src/claims/`.

Rationale:

- the package export `@aoc/protocol/claims` already exists;
- RFC-005 is constitutional and protocol-level;
- protocol contracts must not depend on runtime, database, API, storage, provider, or product packages;
- the package already has path mappings and package export support;
- placing these contracts under `trust` would obscure the existing public claims import surface and make migration harder.

## Non-Canonical Existing Concepts

The following concepts are not deprecated as code, but should be considered non-canonical as base trust-model schemas:

- minimal `Claim` shape in `packages/protocol/src/claims/index.ts`;
- `CapabilityClaim` as a base claim schema;
- runtime-specific `RuntimeAttestation` as a base attestation schema;
- policy `allow`/`deny` output as a base RFC-005 decision schema;
- capability token/grant status as standing or authority status;
- identity authority boundary as final authority.

## Audit Conclusion

The repository is ready for a canonical protocol schema layer in `packages/protocol/src/claims/`. Existing implementation contracts should be preserved and migrated by adapters in later work. The new layer should define only contracts and enum vocabularies, with no registry, storage, API, lifecycle engine, verification engine, standing engine, or authority resolver.
