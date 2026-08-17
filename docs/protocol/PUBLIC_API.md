# @aoc/protocol Public API

This is the governed list of every export path `@aoc/protocol` publishes, generated from the actual
barrel files under `packages/protocol/src/`. It supersedes ad-hoc inspection of source — if a symbol
isn't listed here, treat it as internal even if it happens to be reachable via a deep import (deep
imports are unsupported and actively blocked, see `scripts/assert-invalid-imports.mjs`).

## Governance policy

- Every public symbol must be reachable through one of the barrels below (`packages/protocol/src/*/index.ts`)
  and declared in `packages/protocol/package.json` `exports`. No other import path is supported.
- Deep imports (`@aoc/protocol/dist/...`, `@aoc/protocol/src/...`, `@aoc/protocol/internal/...`) are
  not supported, regardless of whether they happen to resolve in a given bundler.
- Removing or renaming a stable public export requires a Changeset classified `major` and an entry in
  this document's history.
- Additive, backwards-compatible exports (new fields, new subpaths, new deprecated-but-present aliases)
  require a Changeset classified `minor`.
- Fixes that don't change any exported contract shape require a Changeset classified `patch`.
- Experimental subpaths (`adapters`, `runtime-registry`) may change shape without a major bump while
  they remain marked experimental in `docs/versioning-and-stability.md`, but any such change still
  requires a Changeset (minor or patch) documenting the change.
- Internal APIs (anything not in this table) must never be exported accidentally — this is enforced by
  `__tests__/architecture/protocol-purity.test.ts` asserting the barrel `index.ts` files are the only
  public entry points and by the tarball-content check in `scripts/validate-protocol-consumer.mjs`.

## Export table

| Export path | Symbols | Stability | Runtime/type | Since | Notes |
| --- | --- | --- | --- | --- | --- |
| `@aoc/protocol` (root) | Alias of `./contracts` | Stable | Type-only | 0.1.0 (root export added this sprint) | `"."` in `exports` was added as part of the consumer-readiness sprint; no symbol changes |
| `@aoc/protocol/contracts` | `CanonicalId`, `UtcDateTime`, `ResourceRef`, `Delegation`, `Constraint`, `ProofMetadata`, `CapabilityToken`, `CapabilityGrant`, `AgentScope`, `ContextCondition`, `ConsentGrant`, `PolicyDecision`, `ScopedAccessRequest`, `AuditEventEnvelope`, `TrustDomainIdentifier` | Stable | Type-only | 0.1.0 (`AuditEventEnvelope`'s `occurredAt`/`subject`/`correlationId`/`reasonCodes`/`schemaVersion` fields added in the Public API Stabilization Sprint, additive/minor) | Also re-exports `legacy-contracts` types (compatibility-only, deprecated). `ScopedAccessRequest.requestedScope` is and has always been the sole scope field — there is no `scope`/`action` alias. |
| `@aoc/protocol/errors` | `ProtocolError` and related error types (`protocol-error`), plus `legacy-errors` | Stable | Type-only | 0.1.0 | Pure re-export barrel |
| `@aoc/protocol/claims` | RFC-005 claim family: `primitives`, `claim-enums` (`ClaimType`, `EvidenceType`, `AttestationType`, `VerificationStatus`, `StandingStatus`, `AuthorityStatus`, `DecisionStatus`), `references`, `proofs/*`, `registries/*`, `credentials/*`, `vocabulary/*`, `CanonicalClaim`, `CanonicalAttestation`, `CanonicalVerification`, `CanonicalStanding`, `CanonicalCapability`, `CanonicalAuthority`, `CanonicalDecision` | Stable | Mixed — `claim-enums` and `legacy-claims` constants are runtime values; contract shapes are types | 0.1.0 | Also declares deprecated `LegacyClaim`/`Claim` locally and re-exports `legacy-claims` |
| `@aoc/protocol/adapters` | `AdapterResult<T>`, `AdapterLookupContext`, `VerificationKeyDescriptor`, `VerificationKeyResolver`, `RevocationStatus`, `RevocationLookup`, `RegistryLookup`, `TrustRegistryProvider`, `CapabilityLookup`, `AttestationLookup`, `CredentialStatusLookup`, `AuditEventSink`, `SecurityEvent`, `SecurityEventSink`, `ProtocolEvent`, `ProtocolEventSink`, `PolicyDecisionRequest`, `PolicyDecisionResult`, `PolicyDecisionProvider`, `GovernanceDecisionProvider`, `ExecutionAuthorizationRequest`, `ExecutionAuthorizationResult`, `ExecutionAuthorizationProvider`, `VerificationProvider`, `ObservabilityEventSink` | Experimental | Type-only (interfaces) | Added post-0.1.0 (see `docs/architecture/protocol-export-surface-report.md`) | Also declares deprecated aliases `AccessVerificationPort`, `PolicyEvaluatorPort`, `TrustCoordinationPort`, `TrustDomainPort` |
| `@aoc/protocol/runtime-registry` | `AdapterRegistry`, `RuntimeAdapterBootstrap`, `RuntimeBootstrapEngine`, `createAdapterToken`, `AdapterTokens`, `AllAdapterTokens`, `RuntimeProfileValidationMode`, `RuntimeBootstrapStatus`, `RegisteredAdapterStatus`, `RuntimeAdapterBootstrapStatus`, `AdapterRegistryEventType`, `AdapterNotRegisteredError`, `AdapterAlreadyRegisteredError`, `RegistryValidationError` | Experimental | Runtime (classes, frozen const objects, error classes) | Added post-0.1.0 | The only subpath with real executable runtime behavior beyond enum constants |
| `@aoc/protocol/identity` | `SovereignAssetId`, `mintSovereignAssetId`, `parseSovereignAssetId`, `isValidSovereignAssetId`, `assertValidSovereignAssetId`, `ContentIdentity`, `ContentDigestAlgorithm`, `computeContentIdentity`, `isValidContentIdentity`, `contentIdentitiesEqual`, `verifyContentIdentity`, `contentIdentityKey` | Stable, expanding | Mixed | Added post-0.1.0 | Independent UUID asset identity and exact-byte SHA-256 identity; neither contains storage semantics |
| `@aoc/protocol/canonical` | `CANONICAL_JSON_PROFILE`, `canonicalizeJSON` | Stable, expanding | Runtime | Added post-0.1.0 | Deterministic `aoc-canonical-json/1` representation; unsupported profiles fail manifest validation |
| `@aoc/protocol/manifest` | `SovereignManifestV1`, `SignedSovereignManifest`, `SovereignAssetRegistry`, manifest/claim/proof types, builders and validators, `computeManifestDigest`, `generateSovereignKeyPair`, `signSovereignManifest`, `verifySovereignManifest`, `resolveSovereignAsset`, `resolveSovereignAssetVersion` | Stable, expanding | Mixed | Added post-0.1.0 | Versioned canonical manifests, Ed25519 proofs, verification results, and a storage-neutral version-preserving registry port |
| `@aoc/protocol/sovereignty-capabilities` | `SOVEREIGNTY_CAPABILITY_NAMESPACE`, `SOVEREIGNTY_CAPABILITY_KEYS`, `SOVEREIGNTY_CAPABILITY_IDS`, `SOVEREIGNTY_CAPABILITIES`, `listSovereigntyCapabilities`, `getSovereigntyCapability`, `getSovereigntyCapabilityByKey`, `isSovereigntyCapabilityId`, `isSovereigntyCapabilityKey`, `isSovereigntyCapabilityVersion`, `SovereigntyCapabilityId`, `SovereigntyCapabilityKey`, `SovereigntyCapabilityNamespace`, `SovereigntyCapabilityVersion`, `SovereigntyCapabilityDefinition`, `SovereigntyCapabilityRef`, `toSovereigntyCapabilityRef`, `getSovereigntyCapabilityRef`, `getSovereigntyCapabilityRefByKey`, `isValidSovereigntyCapabilityRef`, `sovereigntyCapabilityRefsEqual`, `SovereigntyCapabilityInvocationId`, `mintSovereigntyCapabilityInvocationId`, `isValidSovereigntyCapabilityInvocationId`, `SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION`, `SovereigntyCapabilityInvocation`, `SovereigntyCapabilityInvocationSchemaVersion`, `SovereigntyCapabilityInvocationValidationResult`, `BuildSovereigntyCapabilityInvocationInput`, `buildSovereigntyCapabilityInvocation`, `validateSovereigntyCapabilityInvocation`, `isValidSovereigntyCapabilityInvocation`, `SovereigntyCapabilityImplementation`, `SovereigntyCapabilityExecutionOutcome`, `SovereigntyCapabilitySuccessOutcome`, `SovereigntyCapabilityFailureOutcome`, `isValidSovereigntyCapabilityExecutionOutcome`, `SOVEREIGNTY_CAPABILITY_RESULT_SCHEMA_VERSION`, `SovereigntyCapabilityResult`, `SovereigntyCapabilitySuccessResult`, `SovereigntyCapabilityFailureResult`, `SovereigntyCapabilityResultSchemaVersion`, `resolveSovereigntyCapabilitySubject`, `SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION`, `SOVEREIGNTY_CAPABILITY_INVOCATION_EVENT_TYPE`, `SovereigntyCapabilityInvocationEvidenceV1`, `SovereigntyCapabilityInvocationEvidenceSchemaVersion`, `SovereigntyCapabilityInvocationOutcomeStatus`, `isValidSovereigntyCapabilityInvocationEvidence`, `toSovereigntyCapabilityInvocationAuditEvent`, `invokeSovereigntyCapability`, `InvokeSovereigntyCapabilityOptions`, `SovereigntyCapabilityClock`, `SovereigntyCapabilityInvocationError`, `isSovereigntyCapabilityInvocationError`, `SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES`, `SovereigntyCapabilityInvocationErrorCode`, `SovereigntyCapabilityInvocationErrorDetails`, `CanonicalEvidenceId` (re-export), `createIdentitySovereigntyCapabilityImplementation`, `IdentitySovereigntyCapabilityImplementation`, `IdentitySovereigntyCapabilityInput`, `IdentitySovereigntyCapabilityOutput`, `IdentitySovereigntyCapabilityInputValidationResult`, `IdentitySovereigntyCapabilityReasonCode`, `CreateIdentitySovereigntyCapabilityImplementationOptions`, `validateIdentitySovereigntyCapabilityInput`, `isValidIdentitySovereigntyCapabilityInput`, `IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES`, `createIntegritySovereigntyCapabilityImplementation`, `IntegritySovereigntyCapabilityImplementation`, `IntegritySovereigntyCapabilityInput`, `IntegritySovereigntyCapabilityOutput`, `IntegritySovereigntyCapabilityInputValidationResult`, `IntegritySovereigntyCapabilityReasonCode`, `IntegritySovereigntyCapabilityOperation`, `ComputeContentIdentityIntegrityInput`, `ComputeContentIdentityIntegrityOutput`, `VerifyContentIdentityIntegrityInput`, `VerifyContentIdentityIntegrityOutput`, `ComputeManifestDigestIntegrityInput`, `ComputeManifestDigestIntegrityOutput`, `IntegrityContentIdentityCheck`, `validateIntegritySovereigntyCapabilityInput`, `isValidIntegritySovereigntyCapabilityInput`, `INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES`, `INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS` | Stable | Mixed — frozen constant data, pure lookup functions, and the invocation runtime | Added post-0.1.0 (invocation & evidence spine added in SM-03; production Identity and Integrity capsules added in SM-04, both additive/minor) | Canonical identity, version and discovery for the eight Sovereignty Capabilities, the common contract for invoking one and producing portable capability-attributed evidence, and the first two production capsules. The inventory stays read-only: there is no registration or mutation API, and no global implementation registry — `invokeSovereigntyCapability` takes its implementation as an explicit argument, and the capsule factories have no import-time side effects. Two of the eight (`AOC.IDENTITY`, `AOC.INTEGRITY`) ship production implementations; the other six do not. Capability versions are unchanged at `1.0.0` — adding an implementation is not a capability-contract change. Runtime dependencies are `@aoc/protocol/identity`, `@aoc/protocol/manifest` (capsules only) and `node:crypto` (`randomUUID`); `AuditEventSink`, `AuditEventEnvelope` and `CanonicalEvidenceId` are type-only imports. See `docs/protocol/SOVEREIGNTY_CAPABILITIES.md` |

## Governance decisions (Public API Stabilization Sprint)

- **`AocIdentityClaims` is intentionally not part of this API.** AOC Enterprise's local ambient
  shim (`types/aoc-protocol/index.d.ts`) invented this symbol; it was never exported by any Protocol
  subpath and has no equivalent in Protocol's git history. Protocol's principal-identity surface is,
  by design (see `docs/audits/principal-reference-source-audit.md`), limited to non-verifying
  *references* (`@aoc/protocol/claims` `CanonicalPrincipalRef`) — verified identity/auth claims
  (e.g. token subject claims) are an implementation-specific concern and belong in the consuming
  product, not in Protocol. Enterprise's migration off this import is tracked as separate,
  Enterprise-side follow-up work.
- **`ScopedAccessRequest`'s shape (`principalId`, `resource`, `requestedScope`, `requestedAt`) is
  unchanged and has been canonical since the type's introduction** — there is no historical
  `scope`/`action` shape to preserve compatibility with.
- **`AuditEventEnvelope` gained five additive, optional fields** (`occurredAt`, `subject`,
  `correlationId`, `reasonCodes`, `schemaVersion`) to make the envelope a viable target for
  consumers migrating from richer, product-specific audit event shapes (e.g. Enterprise's
  `event_id`/`occurred_at`/`subject_id`/`requester_id`/`request_id`/`reason` fields). `actorId`
  represents the acting/requesting principal, not the subject; `subject` (new) represents the
  entity the event is about, reusing `ResourceRef` rather than introducing a new shape.

## Verified consumer coverage

Every subpath in the table above is exercised end-to-end (installed from a real `npm pack` tarball,
compiled, and executed) by `npm run protocol:consumer:check` against the fixtures in
`test-consumers/`. See `docs/versioning-and-stability.md` for the CJS/ESM compatibility evidence.
