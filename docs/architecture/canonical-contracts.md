# AOC Canonical Runtime Contracts (v1)

## Design principles
- Implementation-neutral and strongly typed contracts.
- Additive extensibility through `extensions` records.
- Immutable-oriented payloads using readonly semantics.
- Zero-trust runtime posture: explicit subject, scope, constraints, issuer, and traceability.
- AI-agent compatibility with deterministic IDs, explainability metadata, and machine-evaluable conditions.

## 1) Identity Contract
Defined in `packages/identity/src/contracts.ts`.

The canonical principal model supports `human`, `service`, `agent`, and `workload` identities with tenant and federation metadata for sovereign multi-tenant execution.

Validation expectations:
- `id` MUST be globally unique within the trust domain.
- `createdAt` and `updatedAt` MUST be RFC 3339 UTC timestamps.
- Claims SHOULD include issuer provenance and lifecycle timestamps.
- `tenant.tenantId` and `tenant.organizationId` MUST be present for isolation-safe enforcement.

## 2) Capability Token Schema
Defined in `packages/capability-tokens/src/contracts.ts`.

Capability tokens carry subject/resource/scope with bounded constraints, delegation metadata, attenuation lineage, and proof metadata.

Validation expectations:
- `expiresAt` MUST be in the future at issuance.
- Delegation chain depth MUST NOT exceed `maxDepth`.
- Child tokens MUST be equal or stricter than `attenuationOf` parent scope.
- `revocationRefs` SHOULD reference revocation list identifiers or event streams.

## 3) Consent Grant + Policy Decision Contracts
Defined in `packages/consent-engine/src/contracts.ts`.

Consent grant is the legal/purpose constraint layer. Policy decision is the runtime evaluation result layer.

Validation expectations:
- Consent `allowedOperations` MUST map to enforceable scope operations.
- Revoked grants MUST NOT be used for new decisions after `revokedAt`.
- Conditional decisions SHOULD include obligations.
- `policyRevisionIds` MUST be immutable references to evaluated policy snapshots.

## 4) Audit Event Envelope
Defined in `packages/audit-sdk/src/contracts.ts`.

Audit envelope provides causal, tenant-isolated traceability across policy, consent, and capability enforcement.

Validation expectations:
- `eventId` MUST be unique and immutable.
- `timestamp` MUST be authoritative event time.
- `tenantIsolation` MUST always be present.
- Correlation IDs SHOULD be propagated end-to-end across distributed calls.

## 5) Scope Grammar Model
Defined in `packages/scoped-access/src/contracts.ts`.

Canonical grammar defines namespace/wildcards/attenuation semantics and deny precedence.

Validation expectations:
- Deny MUST override allow in merged scope sets.
- Recursive wildcard `**` MUST only apply where explicitly permitted by the grammar.
- Attenuation MUST never remove inherited deny conditions.

## Security considerations
- Default deny when contracts are missing, malformed, expired, or unverifiable.
- Enforce monotonic attenuation for delegated capability chains.
- Keep trust and federation metadata separate from authorization outcome to avoid conflation.
- Log decisions with consent/capability/policy references for explainable governance.

## Interoperability guidance
- Map contracts to OIDC/SAML/SCIM identity providers through `federation` metadata.
- Keep external protocol evidence in `proofRef`, `policyRefs`, and trace references.
- Use versioned schema IDs in every serialized artifact.
- Adopt deterministic identifiers (e.g., canonical hash over stable fields) for replay-safe dedupe and provenance.
