# Registry Interface Source Audit

Date: 2026-06-03

## Purpose

This audit reviewed existing registry-like, issuer, identity, evidence, audit, policy, decision, namespace, and source concepts before adding public canonical registry interface contracts for the RFC-005 claims trust model. The review confirms that AOC Main should define portable registry references, entry descriptors, manifests, lookup result contracts, and registry attestations only. Runtime lookup, storage, indexing, sync, scoring, authority derivation, standing derivation, and decision authorization remain non-goals.

## Reviewed files and areas

- `packages/protocol/src/claims/`
- `packages/protocol/src/claims/proofs/`
- `packages/protocol/src/contracts/`
- `packages/identity/`
- `packages/shared-types/`
- `runtime/trust/`
- `runtime/attestations/`
- `runtime/governance/`
- `protocol/identity/`
- `protocol/identity-policy/`
- `protocol/audit/`
- `protocol/policy/`
- `docs/rfcs/RFC-004-evidence-layer-v1.md`
- `docs/rfcs/RFC-005-Claims-Framework.md`
- `docs/audits/claim-schema-source-audit.md`
- `docs/audits/principal-reference-source-audit.md`
- `docs/audits/proof-envelope-source-audit.md`

## Existing registry-like concepts

### Protocol claims surface

`packages/protocol/src/claims/` already defines the canonical trust chain and open primitives for subjects, issuers, sources, attesters, verifiers, decision makers, scopes, timestamps, IDs, and metadata. Claims and evidence already preserve `proofRefs`, which are suitable precedents for optional `registryRefs` because both are portability references rather than embedded runtime behavior.

`packages/protocol/src/claims/references.ts` defines `CanonicalReferenceSource` and includes `ReferenceSourceKind.Registry`, which is reusable for source descriptors and confirms that registry location is a first-class reference concept. The same file makes clear that references do not imply authority, standing, identity proof, or lookup.

`packages/protocol/src/claims/proofs/` defines proof references and envelopes. Proof contracts name proof artifacts and participants without implementing proof creation or validation. This is the closest architectural precedent for registry interface contracts.

### Protocol contracts and shared primitives

`packages/protocol/src/contracts/index.ts` defines `CanonicalId`, `UtcDateTime`, `ResourceRef`, proof metadata, capability tokens, consent grants, scoped access requests, audit event envelopes, and trust domain identifiers. `CanonicalId` and `UtcDateTime` are reusable primitives. Capability token, consent, and audit envelope behavior should not be imported into registry contracts because they are broader contract families and not registry descriptors.

`packages/shared-types/` provides compatibility/shared exports. It does not need to own the canonical registry surface because RFC-005 public trust model contracts already live in `@aoc/protocol/claims`.

### Identity registry concepts

`protocol/identity/actor-registry.ts` defines an `ActorRegistryAdapter`, in-memory adapter, `ActorRegistry`, `registerActor`, `updateActor`, `deactivateActor`, and `resolveActor`. This is an implementation/runtime registry and should remain outside public canonical registry contracts. Reusable concepts are entry IDs, lifecycle status, and actor/principal subject identity.

`packages/identity/src/contracts.ts` and `protocol/identity/types.ts` define identities, actors, trust levels, verification statuses, relationships, delegation, and sources of truth. These are useful migration candidates for future references into canonical registry entries, but their runtime validation and actor lifecycle behavior should remain private or package-local.

### Trust and issuer registry concepts

`runtime/trust/types.ts` defines identity issuers, identity credentials, consent records, verification results, and trust audit events. It includes issuer IDs, credential refs, active flags, supported KYC levels, credential refs, subject hashes, wallet addresses, revocation timestamps, and reason codes. Reusable concepts include issuer/principal identity, credential entry types, active/revoked/deprecated-like statuses, and audit/event references. Runtime trust verification, active issuer checks, consent checks, and reason-code evaluation must remain runtime/private.

`runtime/trust/service.ts` stores issuers, credentials, and consents in maps and performs credential verification and consent checks. This is explicitly not a public registry contract model.

### Attestation and proof runtime concepts

`runtime/attestations/` defines attestation chains, capability attestations, governance attestations, remote attestations, AI attestations, and integrity proof runtime structures. Reusable concepts include attester, statement, issued time, federation references, remote decision references, remote audit references, and proof references. Chain evaluation and runtime attestation construction are implementation concerns.

### Governance, policy, and decision concepts

`runtime/governance/` defines sessions, obligations, escalation, authority profiles, machine capability envelopes, behavior policies, autonomous grants, autonomous decisions, reason codes, and runtime state. These files use authority IDs, policy IDs, namespace paths, trust paths, delegation chains, and policy sources. Reusable public concepts include namespace and policy entry references. Governance runtime evaluation, authority resolution, escalation, and decision execution must remain private/runtime.

`protocol/policy/` defines policy objects, PDP inputs/outputs, decision traces, policy conditions, and policy source concepts. These are useful for `PolicyRegistry` and `DecisionRegistry` entry categories, but PDP evaluation and decision tracing are not registry behavior.

`protocol/identity-policy/` binds identity context to policy evaluation. It is a runtime integration surface and should not influence public registry contracts beyond confirming that registries must not embed policy engines.

### Audit and evidence concepts

`protocol/audit/` defines audit event types, audit correlation, event envelopes, query filters, trace IDs, actor refs, trust chain refs, policy trace IDs, and audit normalization/builders. Reusable concepts include audit references, trace references, correlation IDs, event IDs, and metadata. Query filters, audit plane behavior, and normalization are implementation concerns.

RFC-004 emphasizes independent verifiability, traceability, portability, archival, and avoiding vendor/platform dependence. Registry contracts can support those goals by naming where evidence and proofs may be located without assuming that storage or verification endpoints stay available.

### RFC-005 and existing audits

RFC-005 and the claim schema audit establish Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision as the trust chain. The principal reference audit explicitly treats references as protocol-level descriptors rather than registry entries, lookup services, resolvers, verification engines, standing engines, or authority resolvers. The proof envelope audit establishes proof vocabulary as portable and behavior-free. Registry contracts should follow those precedents.

## Reusable registry concepts

- Canonical IDs and UTC timestamps.
- Canonical metadata as open, readonly records.
- Canonical principals for registry subjects, maintainers, attesters, and issuers.
- Canonical sources for registry source descriptors.
- Canonical proof references for registry entries, manifests, and attestations.
- Registry/source namespace vocabulary from `CanonicalReferenceSource`.
- Lifecycle statuses such as active, deprecated, revoked, superseded, archived, and unknown.
- Entry categories for claims, evidence, assertions, attestations, verifications, standing, capabilities, authorities, decisions, principals, proofs, credentials, policies, and custom entries.
- Authority declaration levels that identify how a registry is declared or recognized without deriving authority.

## Duplicate concepts

- Actor registry behavior in `protocol/identity/actor-registry.ts` overlaps by name but is runtime storage/resolution.
- Trust issuer records in `runtime/trust/types.ts` resemble issuer registries but include verification and consent semantics.
- Audit query filters and trust audit events resemble registry search but should not become registry lookup behavior.
- Policy decision traces and PDP outputs resemble decision registry entries but include evaluation behavior.
- Reference source `Registry` overlaps with registry references; it should remain a source kind, while `CanonicalRegistryRef` identifies a registry itself.

## Conflicting terminology

- `registry` currently means both runtime actor maps and source-of-truth references.
- `authority` can mean registry authority over a namespace or RFC-005 derived authority. Registry authority level must be declaration metadata only.
- `status` can mean verification status, standing status, authority status, decision status, or registry entry lifecycle status. A dedicated `RegistryEntryStatus` avoids conflating these meanings.
- `lookup` can imply an API/client. `CanonicalRegistryLookupRequest` and `CanonicalRegistryLookupResult` must remain contracts for request/result shapes only.
- `source` can be a human-readable origin, runtime source, evidence source, or canonical reference source. Registry source should use the existing `CanonicalSource` alias and not introduce storage coupling.

## Migration candidates

- Identity actor records may reference `CanonicalRegistryEntryRef` when an actor/principal is listed in a public or federated principal registry.
- Trust issuer and credential records may migrate public descriptors to `PrincipalRegistry` and `CredentialRegistry` contracts while retaining verification in runtime trust services.
- Evidence and audit traces may attach registry entry references to evidence artifacts and proof envelopes for portability.
- Policy objects and decision traces may be represented as `PolicyRegistry` and `DecisionRegistry` entries when they need public location descriptors.
- Governance authority profiles may publish registry manifests or attestations, but authority derivation must remain outside registry contracts.

## Concepts suitable for public canonical contracts

- Registry identifiers, entry identifiers, namespaces, and locators.
- Registry references.
- Registry entry references.
- Registry entry descriptors.
- Registry lookup request/result shapes.
- Registry attestations.
- Registry manifests.
- Optional registry references on evidence, claims, attestations, verifications, and proof envelopes.

## Concepts that should remain runtime/private

- Registry lookup clients and API implementations.
- Registry sync, indexing, and search.
- Database tables, in-memory maps, caches, and persistence adapters.
- Conflict resolution, registry prioritization, and trust scoring.
- Verification engines and proof validation.
- Standing evaluators.
- Authority resolvers.
- Decision authorization and execution.
- Identity verification, KYC, consent, and revocation checks.

## Non-goals

- No storage schema.
- No database tables or adapters.
- No API routes or clients.
- No lookup runtime.
- No registry sync, indexing, or search.
- No verification, standing, authority, trust scoring, or decision engine.
- No forced registry references on existing canonical contracts.
