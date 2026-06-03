# AOC Canonical Claims and Trust Contracts

This package is the canonical TypeScript contract surface for the RFC-005 trust and authority model.

The constitutional chain represented here is:

```text
Evidence
  ↓
Assertion
  ↓
Claim
  ↓
Attestation
  ↓
Verification
  ↓
Standing
  ↓
Capability
  ↓
Authority
  ↓
Decision
```

## Why this package exists

RFC-005 makes claims, trust, standing, capability derivation, authority derivation, and decisions constitutional protocol concepts. AOC products and future ecosystem implementations need one stable schema layer that preserves those concepts without importing runtime behavior.

`packages/protocol/src/claims/` is the canonical location because:

- `@aoc/protocol/claims` already exists as a package export;
- the protocol package is implementation-neutral;
- canonical trust contracts belong below runtime, SDK, enterprise, PMFreak, JAPI, LegalTech, HRKey, and future product implementations;
- the package can be consumed from a single import surface without depending on storage, APIs, registries, or engines.

## What belongs here

This package owns protocol-level contracts and enum vocabularies for:

- `CanonicalEvidence`;
- `CanonicalAssertion`;
- `CanonicalClaim`;
- `CanonicalAttestation`;
- `CanonicalVerification`;
- `CanonicalStanding`;
- `CanonicalCapability`;
- `CanonicalAuthority`;
- `CanonicalDecision`;
- claim, evidence, attestation, verification, standing, authority, and decision status vocabularies;
- stable primitive aliases used by those contracts.

Contracts in this package should remain portable, implementation-neutral, and durable across product lines.

## What does not belong here

This package must not contain:

- claim registries;
- storage schemas or database adapters;
- APIs or route handlers;
- lifecycle engines;
- verification engines;
- standing evaluators;
- authority resolvers;
- product-specific workflow logic;
- PMFreak, JAPI, LegalTech, HRKey, or enterprise-only fields;
- provider-specific proof, credential, wallet, or transport formats.

Those concerns should be implemented later as adapters, runtimes, services, or product projections that consume this canonical contract layer.

## Import surface

Use the public subpath export:

```ts
import type {
  CanonicalClaim,
  CanonicalEvidence,
  CanonicalAttestation,
  CanonicalVerification,
  CanonicalStanding,
  CanonicalCapability,
  CanonicalAuthority,
  CanonicalDecision,
} from '@aoc/protocol/claims';
```

Runtime packages may translate their own operational records into these contracts, but these contracts must not import runtime package types.

## Canonical References

Canonical references identify and describe the principals, sources, and scopes that appear across the RFC-005 trust chain. They are contract-level references, not runtime identity records, registry entries, storage rows, or lookup results.

A `CanonicalPrincipalRef` may describe a human, organization, system, AI agent, runtime, governance body, market maker, credential issuer, or unknown principal. A `CanonicalReferenceSource` records the source namespace or locator used for that reference, such as a URI, DID, wallet, email address, domain, registry key, document, audit trace, runtime trace, internal identifier, or external identifier. A `CanonicalScopeRef` gives authority contracts a structured scope descriptor while preserving compatibility with existing open record scopes.

References do not imply verification. A principal reference can identify or describe a principal even when no verifier has evaluated it. Verification remains represented by `CanonicalVerification`.

References do not imply standing. Standing remains a separate lifecycle conclusion represented by `CanonicalStanding`.

References do not imply authority. Authority remains derived from standing and capabilities and is represented by `CanonicalAuthority`.

References exist to preserve explainability across Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision without coupling the canonical schema layer to identity services, registries, runtime resolvers, or product-specific systems.
