# Credential Contract Source Audit

Date: 2026-06-03

## Purpose

This audit reviews existing credential-like concepts before adding public canonical credential contracts for the RFC-005 claims trust model. The review confirms that AOC Main should define portable credential descriptors only: references, subject and issuer descriptors, status references, manifests, attestations, and presentations. Issuance, storage, wallet, revocation checking, verification, standing evaluation, authority derivation, trust scoring, and decision authorization remain outside public protocol contracts.

## Reviewed Files and Directories

- `packages/protocol/src/claims/`
- `packages/protocol/src/claims/proofs/`
- `packages/protocol/src/claims/registries/`
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
- `docs/audits/registry-interface-source-audit.md`

## Existing Credential-Like Concepts

### Claims and Trust Chain

`packages/protocol/src/claims/` already defines canonical evidence, assertions, claims, attestations, verifications, standing, capabilities, authorities, and decisions. The `ClaimType.Credential` value confirms that credentials are already named in the claims vocabulary, but the current contract surface did not yet provide portable credential containers. Existing claim contracts provide reusable IDs, timestamps, metadata, subject, issuer, attester, verifier, proof references, and registry references.

### Proof References

`packages/protocol/src/claims/proofs/` defines proof references and proof envelopes for hash, signature, attestation, integrity, chain, audit, and trace proof artifacts. These files are reusable because credentials should reference proof artifacts without validating them. Proof contracts also set the precedent that protocol contracts describe proof material without executing signature verification or chain validation.

### Registry References

`packages/protocol/src/claims/registries/` defines registry references, registry entry references, lookup requests/results, registry attestations, and manifests. Credential contracts should reuse registry entry references so credentials can identify issuer registries, subject registries, credential registries, status lists, and proof registries without implementing registry lookup or storage.

### Base Contracts

`packages/protocol/src/contracts/` defines reusable primitives such as `CanonicalId`, `UtcDateTime`, capability token shapes, consent grants, audit event envelopes, and trust domain identifiers. Credential contracts should reuse `CanonicalId` and `UtcDateTime` while avoiding capability-token, consent, and audit-envelope behavior.

### Identity Package

`packages/identity/` provides identity descriptors, identity status, identity source, trust level, verification level, actor relationships, delegation, and identity claims. These concepts are credential-adjacent but are package-specific identity contracts rather than RFC-005 credential containers. They are suitable migration candidates for future adapters that emit canonical credential references or credential subjects.

### Shared Types

`packages/shared-types/` includes actor, identity, capability, consent, audit, governance, authority, delegation, and revocation-like fields such as `revokedAt`. These are operational or cross-runtime data structures, not canonical credential contracts. Reusable public ideas include issuer IDs, subject IDs, capability references, revocation descriptors, and audit correlation references.

### Runtime Trust

`runtime/trust/types.ts` includes identity issuers, identity credential records, consent records, identity verification results, and trust audit events. `runtime/trust/service.ts` registers credentials, stores credential records in maps, verifies identity, checks expiration/revocation, and emits audit events. This is the clearest existing credential runtime implementation and must remain private/runtime. Reusable public ideas include credential references, issuer identity, subject identity, issued/expires timestamps, revoked status descriptors, wallet/source locators, and audit references.

### Runtime Attestations

`runtime/attestations/` includes attestation chains, capability attestations, governance attestations, remote attestations, AI attestations, and integrity proof structures. These establish useful attester, statement, issued-at, proof, chain, federation, and remote audit concepts. Runtime chain evaluation and attestation construction remain non-goals for canonical credential contracts.

### Runtime Governance

`runtime/governance/` includes governance sessions, obligations, escalation, reason codes, authority profiles, grants, decisions, machine capability envelopes, and runtime state. These concepts show where credentials may later feed runtime policy, but credential contracts must not derive authority, grant capabilities, evaluate standing, or authorize decisions.

### Protocol Identity, Policy, and Audit

`protocol/identity/` includes actor objects, identity references, delegation, actor registry adapters, and trust chains. `protocol/identity-policy/` binds identity context to policy evaluation. `protocol/policy/` and `protocol/audit/` include decision traces, PDP contracts, policy objects, audit events, and query/correlation models. These should remain separate from credential descriptors because they implement actor resolution, policy evaluation, audit normalization, and decision tracing.

### RFCs and Prior Audits

RFC-004 establishes an evidence layer where evidence is distinct from interpretation and execution. RFC-005 establishes the trust chain and explicitly distinguishes credentials from claims, verification, standing, authority, and decisions. Prior audits established canonical claim contracts, principal references, proof envelopes, and registry interfaces; credential contracts should compose those canonical artifacts rather than duplicate them.

## Reusable Credential Concepts

- Credential IDs and locators.
- Credential issuer descriptors.
- Credential subject descriptors.
- Credential status descriptors such as draft, issued, active, suspended, revoked, expired, superseded, archived, and unknown.
- Claim references instead of embedded claims.
- Evidence, attestation, proof, and registry references.
- Issued and expiration timestamps.
- Portable manifests describing what credential descriptors represent.
- Credential attestations that declare support for a descriptor without evaluating it.
- Credential presentations as portable presentation events without wallet or selective-disclosure behavior.

## Existing Identity Credential Concepts

- `runtime/trust` identity credential records include subject hashes, issuer IDs, credential hashes, KYC levels, wallet addresses, issued timestamps, expiration timestamps, and revocation timestamps.
- `packages/identity` identity contracts include identity source, status, trust level, verification level, and actor relationship concepts.
- `protocol/identity` references identities, actors, trust chains, and delegation.

Canonical credential contracts should not import KYC-specific or wallet-specific semantics, but they should support generic subject, issuer, locator, status, proof, and registry references.

## Capability-Token Credential Concepts

- `packages/protocol/src/contracts` and `packages/shared-types` include capability tokens, capability references, scopes, issuers, subjects, proofs, expirations, and revocation-related fields.
- `runtime/governance` and `packages/shared-types` include authority profiles and machine grants with issued/expires/revoked timestamps.

These are credential-like in portability and subject/issuer shape, but they represent permissions or authority-bearing runtime artifacts. Canonical credential contracts may include `CapabilityCredential` as a descriptor type, but must not grant capability or authority.

## Certification and License Concepts

- `ClaimType.Certification` and `EvidenceType.Certification` already name certification concepts.
- RFC-005 describes claims that may include certification, authorization, role, governance, and compliance facts.
- Governance and policy files include approval, escalation, and authority concepts that may be backed by certification or license credentials.

Canonical credential contracts should support `CertificationCredential`, `ProfessionalCredential`, and `OrganizationCredential` without implementing license verification or compliance scoring.

## Issuer and Subject Concepts

- Canonical claims already use `CanonicalSubject` and `CanonicalIssuer`.
- Principal references distinguish humans, organizations, systems, AI, runtimes, governance bodies, market makers, credential issuers, and unknown principals.
- Runtime trust records use issuer IDs, subject hashes, and consumer IDs.
- Identity and registry contracts provide actor/principal and registry references.

Credential contracts should define credential-specific issuer and subject descriptors that may point to `CanonicalPrincipalRef` and registry entries, while clearly avoiding identity proof and issuer-authority verification.

## Revocation and Status Concepts

- Runtime trust credential records include `revoked_at` and verification reason codes such as `EXPIRED` and `REVOKED`.
- Shared types include `revokedAt` across consent, capability, delegation, and governance structures.
- Claim contracts include verification status, standing status, authority status, and decision status.
- Registry contracts include registry entry statuses.

Credential status must remain a descriptor. `CredentialStatus.Revoked` can declare or observe a state, but only a verification, standing, governance, or enterprise engine can evaluate what that state means.

## Proof and Registry References Related to Credentials

- Canonical proof references can point to signatures, hashes, attestation proofs, integrity proofs, audit proofs, chain proofs, and trace proofs.
- Canonical registry entry references can point to credential registries, issuer registries, subject registries, status registries, and proof registries.
- Existing claims and evidence already accept proof and registry references; optional credential references can be added to claims, evidence, attestations, verifications, and proof envelopes to support portability.

## Duplicate Concepts

- `credential_ref`, `identity_ref`, `CapabilityRef`, `ResourceRef`, and registry entry locators all represent reference-like concepts with different scopes.
- `issuer`, `issuer_id`, `issuedByActorId`, and `identity_issuer` describe issuer-like concepts across protocol and runtime boundaries.
- `subject`, `subjectActorId`, `subject_hash`, `principalRef`, and actor IDs describe subjects at different abstraction levels.
- `revoked_at`, `revokedAt`, standing status, authority status, verification status, and registry entry status all use status terminology with different meanings.
- Audit events and proof/audit references both describe evidence trails but should not be collapsed.

## Conflicting Terminology

- `status` may mean credential lifecycle, registry entry lifecycle, claim standing, verification result, authority state, decision state, runtime obligation state, or identity state.
- `credential` may mean a portable descriptor, a runtime database record, a KYC identity record, a Verifiable Credential, or a capability token.
- `issuer` may identify a declarative issuer, an issuer registry record, a governance authority, a runtime identity provider, or a signing key controller.
- `verification` may mean claim verification, identity verification, signature verification, credential format validation, or revocation checking.
- `authority` may be confused with credential issuance authority; canonical credentials must not grant authority by themselves.

## Migration Candidates

- Runtime trust identity credential records can expose public descriptors as `CanonicalCredential`, `CanonicalCredentialIssuer`, `CanonicalCredentialSubject`, and `CanonicalCredentialStatusRef` while retaining verification and storage logic in runtime services.
- Identity package contracts can map identity and actor references to `CanonicalCredentialSubject` and `CanonicalCredentialIssuer` where portable credentials are needed.
- Capability-token and governance grants can reference `CanonicalCredentialRef` when a credential supports a claim, while preserving actual capability and authority derivation in existing runtime packages.
- Registry implementations can register credential descriptors using `CanonicalRegistryEntryRef` and `CanonicalCredentialManifest` without moving lookup/storage logic into protocol contracts.
- Proof envelope producers can attach optional `credentialRefs` when a proof envelope supports credential portability.

## Concepts That Should Remain Runtime or Private

- Credential issuance workflows.
- Credential storage, database tables, indexes, and persistence.
- Credential APIs, adapters, and service classes.
- Wallet integration and presentation exchange protocols.
- DID resolution and Verifiable Credential verification.
- Signature verification and proof validation.
- Revocation checking and status-list resolution.
- KYC policy evaluation and consent checking.
- Standing evaluation, authority derivation, trust scoring, and decision authorization.
- Runtime audit-event emission and governance decision execution.

## Concepts Suitable for Public Canonical Contracts

- `CanonicalCredentialId`, `CanonicalCredentialNamespace`, and `CanonicalCredentialLocator`.
- `CredentialType`, `CredentialFormat`, `CredentialStatus`, `CredentialSubjectKind`, and `CredentialIssuerKind`.
- `CanonicalCredentialSubject`.
- `CanonicalCredentialIssuer`.
- `CanonicalCredentialStatusRef`.
- `CanonicalCredentialRef`.
- `CanonicalCredential`.
- `CanonicalCredentialManifest`.
- `CanonicalCredentialAttestation`.
- `CanonicalCredentialPresentation`.
- Optional `credentialRefs` on evidence, claims, attestations, verifications, and proof envelopes.

## Non-Goals

- No issuance runtime.
- No credential persistence or database schema.
- No credential API.
- No wallet protocol.
- No DID resolution.
- No Verifiable Credential verification.
- No signature verification.
- No revocation checking.
- No standing evaluation.
- No authority derivation.
- No trust scoring.
- No decision authorization.
