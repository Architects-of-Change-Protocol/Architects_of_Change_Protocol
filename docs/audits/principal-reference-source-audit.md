# Principal Reference Source Audit

Date: 2026-06-02

## Purpose

This audit reviewed existing principal, actor, identity, source, scope, resource, action, governance, trust, and attestation terminology before adding canonical reference contracts for the RFC-005 claims trust model. The review confirms that the new contracts should remain protocol-level identifiers and descriptors rather than runtime registries, lookup services, verification engines, standing engines, or authority resolvers.

## Reviewed files and directories

- `packages/protocol/src/claims/`
- `packages/protocol/src/contracts/`
- `packages/identity/`
- `packages/shared-types/`
- `protocol/identity/`
- `protocol/identity-policy/`
- `runtime/governance/`
- `runtime/trust/`
- `runtime/attestations/`
- `src/contracts/capability-claims.ts`
- `src/capabilities/`
- `src/decisions/`
- `docs/rfcs/RFC-005-Claims-Framework.md`
- `docs/audits/claim-schema-source-audit.md`
- `docs/audits/claim-schema-compliance-audit.md`

## Existing principal, actor, and reference types

### Canonical protocol contracts

`packages/protocol/src/contracts/index.ts` already defines stable primitives and runtime-adjacent protocol contracts:

- `CanonicalId = string`
- `UtcDateTime = string`
- `ResourceRef` with `kind`, `id`, optional `tenantId`, and string attributes
- `CapabilityToken` with `issuer`, `subject`, `resource`, `scope`, `delegation`, and `proof`
- `ScopedAccessRequest` with `principalId`, `resource`, and `requestedScope`
- `AuditEventEnvelope` with optional `actorId`
- `TrustDomainIdentifier = string`

Reusable concept: `CanonicalId` is the correct identifier primitive for principal references. `ResourceRef` demonstrates resource scoping but is capability-token oriented and should not be imported into claim references as a runtime/resource model.

### Protocol identity module

`protocol/identity/types.ts` defines a product/runtime identity model:

- `ActorType = human | organization | brand | app | ai_agent | delegate | system`
- `IdentityReferenceKind = internal | did | external_provider`
- `IdentityReference` with verification status and timestamps
- `Actor` with trust level, activity, organization hierarchy, and authority boundary
- `DelegationGrant` with allowed actions and scopes
- `TrustChain` with root actor, delegated actors, path, validity, and reasons

Reusable concepts: humans, organizations, AI agents, systems, actor display names, DID references, internal references, delegation scopes, actions, and trust paths are semantically important.

Product/runtime-specific concepts: `verificationStatus`, `trustLevel`, `active`, authority boundary rules, delegation validation, timestamps, and registry behavior should remain outside the canonical reference contract.

### Identity package

`packages/identity/src/contracts.ts` defines an identity contract facade:

- `PrincipalType = human | service | agent | workload`
- `Claim` with `name`, `value`, `issuer`, timestamps, and confidence
- `TrustMetadata` with assurance level, verification methods, frameworks, attestation data, and risk flags
- `TenantMetadata` and `FederationMetadata`
- `IdentityContract` with status, claims, trust, tenant, federation, tags, and extensions

Reusable concepts: principal typing, issuer identifiers, display names, tenant/organization metadata, federation source-of-truth, and external subject patterns.

Product/runtime-specific concepts: verification methods, assurance levels, identity status, tenant residency, federation synchronization, and identity claims are runtime identity records, not claim-chain references.

### Runtime trust

`runtime/trust/types.ts` defines identity issuer, credential, consent, withdrawal, verification result, and trust audit event records. It includes issuer IDs, subject hashes, wallet addresses, credential refs, consumer IDs, KYC levels, and reason codes.

Reusable concepts: credential issuers, wallet source values, credential refs, subject hashes, issuer IDs, consent/audit event source patterns.

Runtime-specific concepts: KYC levels, credential hashes, consent records, payout logic, verification results, and trust audit record schemas must remain runtime trust concerns.

### Runtime attestations

`runtime/attestations/types.ts` defines attestation records for governance decisions, capabilities, AI execution, remote governance, and integrity proof references. It uses actor IDs, runtime IDs, federation refs, remote decision refs, remote audit refs, allowed scopes, executed actions, human review refs, and escalation refs.

Reusable concepts: AI actors, runtime identifiers, audit refs, remote decision refs, federation refs, integrity proof refs, scopes, and actions.

Runtime-specific concepts: attestation chain validation, integrity proofs, remote governance options, and execution counters are not canonical reference contracts.

### Runtime governance

`runtime/governance/types.ts` defines governance sessions, obligations, escalations, human review, machine capability envelopes, authority profiles, machine actors, autonomous grants, behavior policies, and autonomous decisions. It uses actor IDs, machine actor IDs, authority IDs, capability IDs, namespace paths, trust paths, delegation chains, policy IDs, restricted domains, and authority sources.

Reusable concepts: governance bodies, machine/runtime actors, policy scopes, namespace/resource-like scopes, authority source descriptors, trust path explainability.

Runtime-specific concepts: obligation execution, state transitions, autonomous runtime policies, quota enforcement, machine reconciliation, and escalation workflows.

### Capability and decision product contracts

`src/contracts/capability-claims.ts` defines issuer and subject shapes with `issuerType`, `subjectType`, user IDs, agent IDs, workspace IDs, project IDs, action, requested permission, resource type, resource ID, lineage, constraints, and proof.

`src/capabilities/types.ts` defines workspace/project identifiers, capability permissions, resource types, requesters, grantors, and metadata.

`src/decisions/types.ts` defines policy references and evaluation sources such as policy engines, delegation engines, consent engines, manual review, and system sources.

Reusable concepts: workspace, project, resource, action, policy, system source, manual review source, issuer/subject typing, and lineage source identifiers.

Product/runtime-specific concepts: permission vocabularies, request and grant statuses, proof signatures, policy engine internals, and decision context are not canonical reference contracts.

### RFC-005 and previous audits

`docs/rfcs/RFC-005-Claims-Framework.md` and the claim schema audits establish the chain from Evidence through Decision and explicitly note that raw strings for subjects, issuers, attesters, verifiers, sources, decision makers, and scopes are a future refinement area. The compliance audit recommended defining principal/reference contracts and structured scope contracts while avoiding engines and storage.

## Reusable concepts

- `CanonicalId` as the stable string-compatible identifier primitive.
- Human, organization, system, AI agent, runtime/machine actor, governance body, market actor, and credential issuer concepts.
- DID, wallet, email/domain-like, internal ID, external provider, registry, document, audit trace, and runtime trace reference sources.
- Workspace, project, resource, action, policy, market, organization, global, and custom scope concepts.
- Display names and metadata as descriptive, non-authoritative fields.
- Trust-chain explainability through references rather than embedded verification or authority decisions.

## Duplicate concepts

- `ActorType`, `PrincipalType`, `ClaimIssuerType`, and `ClaimSubjectType` all classify actors differently.
- `IdentityReferenceKind`, credential refs, wallet addresses, source-of-truth, policy/evaluation sources, and audit refs all represent reference source concepts with different names.
- `allowedScopes`, `requestedScopes`, `namespacePaths`, `scope`, `resource`, `resourceType`, `resourceId`, `action`, `permission`, and `policyId` all describe scope/action/resource boundaries.
- `issuer`, `attester`, `verifier`, `decisionMaker`, `actorId`, `principalId`, `machineActorId`, and `grantedByActorId` are all principal-like references.

## Conflicting terminology

- `actor`, `principal`, `subject`, `issuer`, `attester`, `verifier`, and `decisionMaker` are sometimes used as identity records and sometimes as raw identifiers.
- `source` can mean evidence source, identity source of truth, evaluation source, authority source, runtime source, or audit source.
- `scope` can mean string permissions, namespace paths, resource selectors, policy scope, or runtime authority envelope contents.
- `AI` appears as `AI`, `ai_agent`, `agent`, machine actor, workload, and autonomous runtime actor.
- `organization`, `brand`, `tenant`, and governance body overlap but are not identical.

## Migration recommendations

1. Add protocol-level reference contracts in `packages/protocol/src/claims/references.ts` and export them from `@aoc/protocol/claims`.
2. Preserve string compatibility for existing canonical contracts while allowing structured references.
3. Treat `CanonicalPrincipalRef` as a descriptor only; do not import runtime `Actor`, `IdentityContract`, or registry types.
4. Treat `CanonicalReferenceSource` as a source descriptor only; do not embed verification state, credential state, or trust results.
5. Treat `CanonicalScopeRef` as a scope descriptor only; do not resolve resources, permissions, policy decisions, or authority.
6. Let identity, capability, governance, trust, and runtime packages map their product-specific records into canonical references at integration boundaries.
7. Keep legacy claim compatibility but clearly deprecate minimal `Claim` in favor of `CanonicalClaim`.

## Non-goals

- No registry implementation.
- No storage schema or database table.
- No runtime lookup API.
- No identity verification engine.
- No standing lifecycle engine.
- No authority resolver.
- No capability derivation engine.
- No governance decision engine.
- No proof/signature envelope migration.
- No product-specific permission vocabulary migration.
