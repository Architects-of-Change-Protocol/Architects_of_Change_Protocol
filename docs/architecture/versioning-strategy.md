# AOC Canonical Contract Versioning Strategy

## Semantic versioning model
Each contract uses `schemaVersion` with `MAJOR.MINOR.PATCH` semantics.

- MAJOR: breaking structure or meaning changes.
- MINOR: additive, backward-compatible fields and enum members.
- PATCH: documentation clarifications and non-semantic corrections.

## Compatibility rules
- Producers MUST emit a concrete `schemaVersion`.
- Consumers SHOULD accept the same MAJOR with newer MINOR when unknown fields are ignorable.
- Consumers MUST reject unsupported MAJOR versions.
- Additive evolution SHOULD use optional fields, never field repurposing.

## Deprecation process
1. Mark field or enum value as deprecated in docs and SDK types.
2. Maintain behavior through at least one MINOR cycle.
3. Remove only in next MAJOR release.

## Identifier and trace stability
- `id`, `tokenId`, `grantId`, `decisionId`, and `eventId` are immutable once issued.
- Policy and consent references MUST point to immutable revisioned artifacts.
- Causality and correlation identifiers SHOULD be preserved across hops.

## Validation and governance
- Publish JSON Schemas at stable URIs with explicit version paths.
- Maintain machine-readable changelog entries per schema.
- Require conformance tests for every MINOR/MAJOR release.

## Extensibility guardrails
- Extension data MUST live under `extensions` maps.
- Extension keys SHOULD be namespaced (e.g., `vendor.feature`).
- Extensions MUST NOT alter core field semantics.

## Interoperability roadmap
- Define profile documents for regulated sectors (health, finance, public sector) without changing core contracts.
- Provide translation adapters for OPA/Rego, Cedar, and XACML ecosystems at policy edges.
- Support signed envelopes as optional profile layers, not required base semantics.
