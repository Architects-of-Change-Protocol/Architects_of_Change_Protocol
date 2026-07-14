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
| `@aoc/protocol/contracts` | `CanonicalId`, `UtcDateTime`, `ResourceRef`, `Delegation`, `Constraint`, `ProofMetadata`, `CapabilityToken`, `CapabilityGrant`, `AgentScope`, `ContextCondition`, `ConsentGrant`, `PolicyDecision`, `ScopedAccessRequest`, `AuditEventEnvelope`, `TrustDomainIdentifier` | Stable | Type-only | 0.1.0 | Also re-exports `legacy-contracts` types (compatibility-only, deprecated) |
| `@aoc/protocol/errors` | `ProtocolError` and related error types (`protocol-error`), plus `legacy-errors` | Stable | Type-only | 0.1.0 | Pure re-export barrel |
| `@aoc/protocol/claims` | RFC-005 claim family: `primitives`, `claim-enums` (`ClaimType`, `EvidenceType`, `AttestationType`, `VerificationStatus`, `StandingStatus`, `AuthorityStatus`, `DecisionStatus`), `references`, `proofs/*`, `registries/*`, `credentials/*`, `vocabulary/*`, `CanonicalClaim`, `CanonicalAttestation`, `CanonicalVerification`, `CanonicalStanding`, `CanonicalCapability`, `CanonicalAuthority`, `CanonicalDecision` | Stable | Mixed — `claim-enums` and `legacy-claims` constants are runtime values; contract shapes are types | 0.1.0 | Also declares deprecated `LegacyClaim`/`Claim` locally and re-exports `legacy-claims` |
| `@aoc/protocol/adapters` | `AdapterResult<T>`, `AdapterLookupContext`, `VerificationKeyDescriptor`, `VerificationKeyResolver`, `RevocationStatus`, `RevocationLookup`, `RegistryLookup`, `TrustRegistryProvider`, `CapabilityLookup`, `AttestationLookup`, `CredentialStatusLookup`, `AuditEventSink`, `SecurityEvent`, `SecurityEventSink`, `ProtocolEvent`, `ProtocolEventSink`, `PolicyDecisionRequest`, `PolicyDecisionResult`, `PolicyDecisionProvider`, `GovernanceDecisionProvider`, `ExecutionAuthorizationRequest`, `ExecutionAuthorizationResult`, `ExecutionAuthorizationProvider`, `VerificationProvider`, `ObservabilityEventSink` | Experimental | Type-only (interfaces) | Added post-0.1.0 (see `docs/architecture/protocol-export-surface-report.md`) | Also declares deprecated aliases `AccessVerificationPort`, `PolicyEvaluatorPort`, `TrustCoordinationPort`, `TrustDomainPort` |
| `@aoc/protocol/runtime-registry` | `AdapterRegistry`, `RuntimeAdapterBootstrap`, `RuntimeBootstrapEngine`, `createAdapterToken`, `AdapterTokens`, `AllAdapterTokens`, `RuntimeProfileValidationMode`, `RuntimeBootstrapStatus`, `RegisteredAdapterStatus`, `RuntimeAdapterBootstrapStatus`, `AdapterRegistryEventType`, `AdapterNotRegisteredError`, `AdapterAlreadyRegisteredError`, `RegistryValidationError` | Experimental | Runtime (classes, frozen const objects, error classes) | Added post-0.1.0 | The only subpath with real executable runtime behavior beyond enum constants |

## Verified consumer coverage

Every subpath in the table above is exercised end-to-end (installed from a real `npm pack` tarball,
compiled, and executed) by `npm run protocol:consumer:check` against the fixtures in
`test-consumers/`. See `docs/versioning-and-stability.md` for the CJS/ESM compatibility evidence.
