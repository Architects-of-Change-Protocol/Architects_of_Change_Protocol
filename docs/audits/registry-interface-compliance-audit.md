# Registry Interface Compliance Audit

Date: 2026-06-03

## Summary

The canonical registry interface contracts add an implementation-neutral location layer for the RFC-005 trust model. The new contracts define registry types, entry types, authority declaration levels, entry lifecycle statuses, lookup result statuses, registry identifiers, registry references, entry references, entry descriptors, lookup request/result shapes, registry attestations, and registry manifests.

The contracts are intentionally descriptive. They do not implement storage, lookup, verification, standing, authority derivation, trust scoring, or decision authorization.

## Alignment with RFC-005 Claims Framework

RFC-005 establishes the canonical trust chain: Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision. The registry interface supports that chain by making object location portable and explainable. Registry references can be attached optionally to evidence, claims, attestations, verifications, and proof envelopes without changing the semantics of standing, capability, authority, or decision.

The registry layer answers where claims, evidence, proofs, principals, policies, authorities, and decisions may be located. It does not decide whether those objects are true, valid, current, authoritative, or executable.

## Alignment with RFC-004 Evidence Layer

RFC-004 emphasizes verifiability, traceability, portability, archival continuity, and resistance to platform/vendor dependence. Registry contracts support those goals by allowing evidence and proofs to carry portable location descriptors and proof references without requiring consumers to depend on a storage provider, lookup endpoint, or proprietary verification system.

A registry entry can describe a locator for evidence and carry proof references. That improves explainability and traceability while keeping verification separate.

## Why registry is not storage

Storage persists records. A registry contract only describes a registry, an entry, a locator, a manifest, or an observed lookup result. The public protocol surface does not define database tables, object stores, indexes, caches, persistence adapters, retention rules, synchronization protocols, or search APIs.

## Why registry is not verification

Verification evaluates whether evidence, claims, attestations, proofs, or chains satisfy verification criteria. Registry contracts may reference proofs, but they do not validate proofs, compute confidence, perform issuer checks, or produce verification status. `CanonicalRegistryLookupResult.status` is lookup-result status, not claim verification status.

## Why registry is not standing

Standing reflects the recognized lifecycle of a claim in the RFC-005 trust model. Registry entry status reflects only the lifecycle of a registry entry descriptor. An active registry entry does not imply active claim standing, and a revoked registry entry does not by itself evaluate claim standing.

## Why registry is not authority

Registry authority level describes how a registry declares or receives recognition for a namespace. It does not grant RFC-005 authority. Canonical authority remains derived from standing and capabilities, not from registry presence.

## Why registry is not decision

Decision contracts consume authority and produce outcomes. Registry contracts may locate decision records or describe decision registries, but they do not authorize, deny, execute, or trace decisions.

## Why registry supports explainability

Registry references and entry references allow consumers to explain where a canonical object or proof was declared to be located. Registry manifests explain which entry types a registry supports. Registry attestations explain who declared or recognized a registry and when. Lookup result contracts can preserve observed outcomes without requiring a lookup implementation in AOC Main.

## Public/Private Boundary

Public Main may define:

- registry references;
- registry manifests;
- registry entries;
- registry lookup result contracts; and
- registry attestation contracts.

Private/Enterprise should own:

- registry sync;
- registry trust scoring;
- registry prioritization;
- registry conflict resolution;
- registry lookup implementation;
- registry indexing;
- authority derived from registry state; and
- standing derived from registry state.

This preserves the public protocol surface as a portable contract layer while leaving operational registry behavior to private, runtime, enterprise, or ecosystem implementations.

## Migration guidance

### Identity

Identity packages may attach `CanonicalRegistryEntryRef` to principal or actor descriptors when a public, organizational, federated, or external principal registry is relevant. Actor registration, identity verification, active flags, source-of-truth enforcement, and relationship resolution should remain implementation-specific.

### Evidence

Evidence contracts can use optional `registryRefs` to identify where evidence descriptors are listed. Evidence storage, archive retrieval, integrity verification, and document search remain outside registry contracts.

### Claims

Claims can use optional `registryRefs` to preserve portability and explainability. Claim truth, confidence, verification, standing, and authority must continue to be represented by their own canonical contracts.

### Proofs

Proof envelopes can use optional `registryRefs` when proof references are published in a proof registry or audit registry. Proof generation, cryptographic validation, and chain verification remain outside public registry contracts.

### Runtime

Runtime trust, attestations, governance, and policy systems may consume registry contracts as input/output descriptors, but runtime services should not be imported into `@aoc/protocol/claims`. Runtime lookup clients, caches, maps, evaluators, and synchronization jobs remain private/runtime.

### Governance

Governance bodies may publish registry manifests or registry attestations declaring registry recognition, deprecation, or supersession. Governance engines must not derive authority or standing solely from registry contracts in AOC Main.

### Enterprise

Enterprise systems may implement registry sync, registry scoring, namespace prioritization, conflict resolution, audit indexing, and authorization policies. Those behaviors should use the public contracts as shapes but remain outside the public protocol package.

## Future work

- Define optional JSON Schema artifacts for registry contracts if the protocol package adopts schema emission.
- Define governance procedures for recognizing protocol-level registries without implementing recognition engines.
- Add enterprise/runtime registry client interfaces in a private package if needed.
- Provide migration notes for existing actor, issuer, credential, audit, policy, and decision registries.
- Consider registry-specific conformance fixtures for external consumers.

## Compliance conclusion

The registry interface contracts align with RFC-005 and RFC-004 by increasing portability and explainability while preserving clean boundaries between public protocol contracts and private/runtime implementations.
