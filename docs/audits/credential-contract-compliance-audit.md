# Credential Contract Compliance Audit

Date: 2026-06-03

## Summary

The canonical credential contracts align with the RFC-005 trust model by defining portable descriptors that bundle references to claims, evidence, attestations, proofs, registries, issuers, subjects, and credential status. They deliberately avoid verification, standing, authority, and decision behavior.

## Alignment with RFC-005 Claims Framework

RFC-005 separates evidence, assertions, claims, attestations, verification, standing, capability, authority, and decisions. The credential contracts preserve that separation by making a credential a portable container of references, not a truth engine. `CanonicalCredential.claimRefs` references canonical claims rather than embedding or replacing them. Credential status is a descriptor, not claim standing.

## Alignment with RFC-004 Evidence Layer

RFC-004 treats evidence as support material rather than a conclusion or action. Credential contracts align with that model by allowing `evidenceRefs` and `proofRefs` while avoiding evidence interpretation, proof validation, storage, or enforcement behavior.

## Alignment with A2 Canonical Contracts

The A2 trust model contracts remain authoritative for evidence, assertions, claims, attestations, verifications, standing, capabilities, authorities, and decisions. Credentials add portability around those artifacts. Optional `credentialRefs` were added only to evidence, claims, attestations, verifications, and proof envelopes because those artifacts can reference portable credential descriptors without collapsing into standing, capability, authority, or decision layers.

## Alignment with A3 References

Credential subjects, issuers, holders, and recipients can point to `CanonicalPrincipalRef`. Credential status sources can use canonical source descriptors. This preserves reference portability without proving identity, standing, or authority.

## Alignment with A4 Proofs

Credentials and credential references can include `CanonicalProofRef` values. This supports signature, hash, attestation, integrity, chain, audit, and trace proof portability without implementing proof verification.

## Alignment with A5 Registries

Credential subjects, issuers, references, status references, manifests, attestations, and presentations can include registry entry references. This supports credential registries, issuer registries, status registries, and proof registries without adding lookup, storage, indexing, sync, or registry trust evaluation to AOC Main.

## Why Credential Is Not Claim

A claim is a formal statement about a subject. A credential is a package that references one or more claims and supporting artifacts. A credential can carry a claim reference, but it does not make the claim true or currently usable.

## Why Credential Is Not Proof

A proof is a cryptographic, audit, integrity, chain, attestation, or trace artifact. A credential may reference proofs, but the credential does not validate, compute, or verify proof material.

## Why Credential Is Not Verification

Verification evaluates whether a claim or artifact is supported. Credential contracts contain no verifier behavior, validation methods, signature checking, DID resolution, revocation checking, or VC verification logic.

## Why Credential Is Not Standing

Standing is the current usability state of a claim. A credential status reference can state `Active`, `Revoked`, `Expired`, or another descriptor, but it does not decide whether related claims have standing.

## Why Credential Is Not Authority

Authority is derived from standing claims, capabilities, delegation rules, governance policy, and constraints. Possession or presentation of a credential does not grant authority by itself.

## Why Credential Is Not Decision

A decision is a consequential action taken under authority. Credential presentation can be evidence for later evaluation, but it does not approve, deny, execute, revoke, suspend, escalate, or authorize anything by itself.

## Why Credential Supports Explainability

Credentials improve explainability by preserving portable links among claims, evidence, attestations, proofs, registries, issuers, subjects, and statuses. Auditors and governance systems can inspect which artifacts a credential pointed to without relying on hidden runtime state. Because the contracts are reference-based, explanations can cite the exact claim, proof, registry, issuer, and subject descriptors used by downstream engines.

## Public/Private Boundary

Public Main may define:

- Credential references.
- Credential descriptors.
- Credential subjects.
- Credential issuers.
- Credential status references.
- Credential manifests.
- Credential attestations.
- Credential presentations.

Private/Enterprise should own:

- Credential issuance.
- Credential verification.
- Credential revocation checking.
- Credential wallet flows.
- Credential selective disclosure.
- Credential trust scoring.
- Credential standing evaluation.
- Authority derived from credentials.
- Decision authorization based on credentials.

No private credential logic is implemented in AOC Main.

## Migration Guidance

### Identity

Identity packages may map identity records, actor references, and issuer references into `CanonicalCredentialSubject`, `CanonicalCredentialIssuer`, and `CanonicalCredentialRef`. Identity verification and actor resolution should remain in identity/runtime packages.

### Claims

Claims can reference credentials through optional `credentialRefs` when a portable credential supports the claim. Claims should not embed full credentials or rely on credential possession as proof of truth.

### Proofs

Proof envelopes can reference credentials when proof artifacts are associated with a credential bundle. Signature, hash, chain, audit, and trace validation should remain outside protocol contracts.

### Registries

Registry packages can register or locate credential descriptors using registry entry references and manifests. Lookup, storage, indexing, synchronization, and trust ranking are implementation responsibilities.

### Runtime

Runtime trust services can adapt existing credential records to canonical descriptors at boundaries. Registration, storage, verification, consent checks, revocation checks, and audit emission remain runtime behavior.

### Governance

Governance systems can consume credential references as part of explainable evidence trails. They must still derive standing, capability, authority, and decisions through governance policy and standing evaluation.

### Enterprise

Enterprise systems can implement issuance, wallet, VC, DID, revocation, selective disclosure, trust scoring, and credential lifecycle systems behind the public contracts. Those systems should emit canonical references and descriptors at public boundaries.

## Future Work

- Define optional credential profile guidance for common identity, certification, professional, organization, and system credential descriptors.
- Define registry profile examples for credential registries and status registries.
- Define mapping guidance from W3C Verifiable Credentials into canonical descriptors without implementing VC verification.
- Define enterprise adapter patterns for runtime credential issuance and revocation services.
- Add examples showing how a credential supports a claim without granting standing or authority.
