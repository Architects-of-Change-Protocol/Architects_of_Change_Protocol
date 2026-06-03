# Principal Reference Compliance Audit

Date: 2026-06-02

## Summary

Canonical principal, reference source, and scope reference contracts align the RFC-005 trust model with the next layer of canonicity. The new contracts improve explainability for subjects, issuers, attesters, verifiers, decision makers, evidence sources, and authority scopes while preserving backwards compatibility with existing string references.

## Alignment with RFC-005

RFC-005 requires a durable explanation chain:

```text
Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision
```

Structured references support that chain by making the referenced actor or source explicit without collapsing the stages together. Evidence can now identify its subject, issuer, and source as structured references. Claims can identify subject and issuer references. Attestations and verifications can identify structured attesters and verifiers. Decisions can identify structured decision makers. Authority can identify structured scopes.

The contracts remain implementation-neutral and do not introduce registries, APIs, storage, verification engines, standing engines, authority resolvers, or runtime lookup behavior.

## Why references are not verification

A `CanonicalPrincipalRef` or `CanonicalReferenceSource` identifies or describes a referenced principal or source. It does not say that the identifier has been validated, that the source is authentic, or that a verifier has accepted it. Verification remains a separate `CanonicalVerification` record with a verifier, status, findings, timestamp, and optional confidence.

## Why references are not standing

Standing is a lifecycle conclusion about a claim after verification and policy interpretation. A reference may appear in evidence, assertions, claims, attestations, or verifications before any standing exists. Standing remains represented by `CanonicalStanding` and is not embedded into reference descriptors.

## Why references are not authority

Authority is derived from capabilities and standing and is represented by `CanonicalAuthority`. A principal reference to a governance body, credential issuer, market maker, runtime, or organization does not itself grant authority. Structured references only preserve the identity of the referenced principal or scope so that authority derivation can be explained later.

## Explainability improvements

Structured principal references improve long-term explainability by distinguishing:

- a human subject from an organization subject;
- an organization issuer from a credential issuer;
- an AI attester from a system attester;
- a runtime verifier from a governance verifier;
- a governance body decision maker from a market maker;
- a source URI from a DID, wallet, registry key, document, audit trace, or runtime trace;
- a workspace scope from a project, resource, action, policy, market, organization, global, or custom scope.

This makes the trust chain more durable without forcing product packages to adopt a runtime identity service.

## Migration guidance

### Identity

Identity packages should map `Actor`, `IdentityContract`, DID references, external provider references, and internal identity IDs into `CanonicalPrincipalRef` and `CanonicalReferenceSource` at protocol boundaries. They should not replace their verification status, trust metadata, tenant metadata, or federation synchronization records with canonical references.

### Capability

Capability packages should map requester, grantor, issuer, subject, resource, action, workspace, and project references into canonical principal and scope references when producing RFC-005-compatible claims, capabilities, or authorities. Product permission vocabularies and proof envelopes remain product-specific until a future proof contract phase.

### Runtime

Runtime packages should map system actors, AI actors, machine actors, runtime IDs, audit refs, remote decision refs, runtime traces, and namespace paths into canonical references for explainability. Runtime enforcement, counters, quotas, escalation paths, and validation results remain runtime-specific.

### Governance

Governance packages should map governance bodies, human reviewers, policy IDs, policy traces, obligation sources, audit refs, and decision makers into canonical references. Governance sessions, obligations, escalation workflows, and policy decisions remain separate runtime records.

### Enterprise

Enterprise adapters should prefer structured references at integration boundaries while retaining string compatibility for legacy consumers. They can use `ReferenceSourceKind.Registry`, `ReferenceSourceKind.ExternalId`, `ReferenceSourceKind.Domain`, or `ReferenceSourceKind.InternalId` to preserve enterprise identity-provider provenance without importing provider schemas into the protocol layer.

## Future work

1. Define proof-envelope contracts that can map signatures, wallet credentials, signed audit events, runtime integrity proofs, and remote attestations.
2. Define adapter guidance for mapping identity, capability, governance, trust, and runtime records into canonical claims.
3. Define lifecycle events for standing transitions without adding a standing engine to the schema layer.
4. Define namespaced metadata governance and reserved metadata keys.
5. Define versioned migration guidance for replacing raw string references once downstream packages are ready.
6. Evaluate whether `CanonicalScopeRef` should eventually become required for authority after compatibility windows close.
