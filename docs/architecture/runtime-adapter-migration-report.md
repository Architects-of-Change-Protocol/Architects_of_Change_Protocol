# Runtime Adapter Migration Report

**Status:** Implemented by PR-08
**Scope:** Canonical Enterprise assurance verification, trust registry, and event-sink bindings
**Boundary:** Enterprise composition root → Protocol `AdapterRegistry` → canonical adapter contracts

## Summary

```text
Canonical adapters migrated:
8 / 15

Existing canonical implementation bindings migrated:
8 / 8

Remaining direct runtime bindings:
0

Coverage:
100% of the PR-08 assurance migration scope
```

The eight migrated contracts are the complete current Enterprise assurance profile: `VerificationProvider`, `VerificationKeyResolver`, `RegistryLookup`, `TrustRegistryProvider`, `AuditEventSink`, `SecurityEventSink`, `ProtocolEventSink`, and `ObservabilityEventSink`. The repository-wide Protocol token inventory contains fifteen contracts; the other seven have no existing Enterprise assurance implementation binding to migrate in this PR.

Before PR-08, the Enterprise bootstrap registered canonical implementations, but callers manually selected tokens and called `AdapterRegistry.resolve(...)` themselves. This left runtime dependency shape and required-profile completeness implicit at each call site. PR-08 introduces typed profile resolvers and `bootstrapEnterpriseAssuranceRuntime`, which validates the complete assurance profile, resolves it once at composition, and returns dependencies typed only by canonical Protocol contracts.

## Direct Bindings Before Migration

| Runtime path | Previous binding |
|---|---|
| Verification | Callers constructed `EnterpriseVerificationProvider` and `InMemoryVerificationKeyResolver`, registered them, then manually resolved individual tokens. |
| Trust registry | Callers constructed `InMemoryCanonicalTrustRegistry`, registered the same object under two tokens, then manually resolved both tokens. |
| Event sinks | Callers constructed `InMemoryAssuranceEventSink`, registered it under four sink tokens, then manually resolved individual tokens. |
| Complete assurance startup | No typed helper represented or validated the complete eight-adapter runtime dependency profile. |

## Registry-Backed Bindings After Migration

| Runtime path | New binding |
|---|---|
| Verification | `resolveVerificationRuntimeAdapters(registry)` returns `VerificationProvider` and `VerificationKeyResolver`. |
| Trust registry | `resolveTrustRuntimeAdapters(registry)` returns `RegistryLookup` and `TrustRegistryProvider`. |
| Event sinks | `resolveEventSinkRuntimeAdapters(registry)` returns all four event-sink contracts. |
| Complete assurance startup | `bootstrapEnterpriseAssuranceRuntime(registry, options)` registers defaults/overrides, validates all eight required tokens, and returns `AssuranceRuntimeAdapters`. |

## Files Migrated

- `enterprise/src/assurance/runtime-adapter-resolver.ts` — typed assurance profile, focused resolvers, complete resolver, and required-token inventory.
- `enterprise/src/assurance/runtime-adapter-bootstrap.ts` — complete bootstrap-and-resolve composition helper and public resolver exports.
- `__tests__/architecture/assurance-extraction-parity.test.ts` — existing canonical adapter consumers now use typed resolvers rather than manual token resolution.
- `__tests__/architecture/runtime-adapter-migration.test.ts` — runtime resolution, fail-closed, isolation, and behavior parity coverage.
- `__tests__/architecture/runtime-adapter-boundary.test.ts` — repository scan and direct-wiring classification.
- `docs/architecture/runtime-adapter-registry.md` — registry usage policy.

## Migrated Bindings

| Adapter | Previous binding | New registry-backed binding | Files changed | Behavior parity | Status |
|---|---|---|---|---|---|
| `VerificationProvider` | Directly constructed provider, manually registered/resolved | `resolveVerificationRuntimeAdapters` / complete assurance resolver | Resolver, bootstrap, parity and migration tests | Same verification result, findings, verifier, and timestamp | Migrated |
| `VerificationKeyResolver` | Directly constructed in-memory resolver, manually registered/resolved | `resolveVerificationRuntimeAdapters` / complete assurance resolver | Resolver, bootstrap, parity and migration tests | Same resolver object and key lookup behavior | Migrated |
| `RegistryLookup` | Directly constructed trust registry, manually registered/resolved | `resolveTrustRuntimeAdapters` / complete assurance resolver | Resolver, bootstrap, parity and migration tests | Same lookup result, observed time, entries, and store | Migrated |
| `TrustRegistryProvider` | Same concrete store manually registered under a second token | `resolveTrustRuntimeAdapters` / complete assurance resolver | Resolver, bootstrap, parity and migration tests | Same registry/entry retrieval and shared-store identity | Migrated |
| `AuditEventSink` | Direct sink construction and manual token resolution | `resolveEventSinkRuntimeAdapters` / complete assurance resolver | Resolver, bootstrap, parity and migration tests | Same cloned event values and ordering | Migrated |
| `SecurityEventSink` | Direct sink construction and manual token resolution | `resolveEventSinkRuntimeAdapters` / complete assurance resolver | Resolver, bootstrap, parity and migration tests | No loss, duplication, or mutation | Migrated |
| `ProtocolEventSink` | Direct sink construction and manual token resolution | `resolveEventSinkRuntimeAdapters` / complete assurance resolver | Resolver, bootstrap, parity and migration tests | No loss, duplication, or mutation | Migrated |
| `ObservabilityEventSink` | Direct sink construction and manual token resolution | `resolveEventSinkRuntimeAdapters` / complete assurance resolver | Resolver, bootstrap, migration tests | Same shared sink and observation semantics | Migrated |

## Remaining Bindings

No forbidden runtime-consumer direct binding remains for the eight scoped canonical contracts. Direct implementation construction remains only where it is intentional and classified below.

| Binding | Location | Classification | Reason not migrated | Follow-up PR |
|---|---|---|---|---|
| `new InMemoryAssuranceEventSink()` | `enterprise/src/assurance/runtime-adapter-bootstrap.ts` | Allowed composition root | Explicit Enterprise default implementation for the assurance profile | None |
| `new InMemoryCanonicalTrustRegistry()` | `enterprise/src/assurance/runtime-adapter-bootstrap.ts` | Allowed composition root | Explicit Enterprise default implementation shared by both trust contracts | None |
| Canonical implementation construction | Architecture tests | Allowed test fixture | Required to create bootstrap inputs and direct-path parity baselines | None |
| Legacy trust/audit/observability re-exports and wrappers | `runtime/*`, `packages/*-runtime/*` | Legacy path | Compatibility surfaces are not canonical adapter consumers and deleting them is an explicit non-goal | Future compatibility cleanup, if scheduled |
| Seven non-assurance canonical tokens | Protocol token inventory | Not in scope | No existing Enterprise assurance implementation binding exists to migrate | Migrate when a runtime profile owns implementations |

## Behavior Parity Validation

- Verification compares direct implementation output with output reached through the registry-backed resolver using the same claim, key store, strategy, and lookup context.
- Trust registry checks lookup and provider views against the same seeded store and confirms both resolved contracts retain shared-store identity.
- Event-sink validation writes audit, security, and protocol events through direct and registry-backed paths, then compares values and ordering. Mutation after recording confirms payload cloning remains unchanged.
- Complete-profile startup confirms all eight adapters resolve and that the documented shared default implementations remain shared across their contract tokens.
- Missing complete-profile adapters fail during bootstrap with `RegistryValidationError`; direct incomplete resolution fails with `AdapterNotRegisteredError`.
- Independent registries resolve independent implementation instances, demonstrating that the migration introduced no hidden global state.

## Migration Coverage

Two complementary metrics are reported:

1. **Scoped binding coverage: 8 / 8 = 100%.** Every existing canonical implementation binding in the Enterprise assurance verification, trust registry, and event-sink paths now has a typed registry-backed resolution path.
2. **Canonical token breadth: 8 / 15 = 53.3%.** Seven Protocol adapter tokens have no existing implementation binding in this Enterprise assurance profile and therefore were not migration candidates.

The acceptance coverage percentage is **100%** because PR-08 measures migration of existing bindings, not implementation of adapters that do not yet exist.

## Risk Assessment

| Risk | Mitigation | Residual risk |
|---|---|---|
| Service locator risk | Registry access is confined to bootstrap/resolver modules; domain implementation boundary tests reject registry references. Dependencies are resolved once and returned as typed contracts. | Future consumers could bypass the helper; the boundary inventory must remain maintained. |
| Default implementation ambiguity | Enterprise defaults are constructed only in the documented bootstrap profile. Caller overrides are explicit. | Adding another profile will require equally explicit default documentation. |
| Missing adapter startup risk | The complete profile fixes an eight-token required list and uses `RuntimeAdapterBootstrap`, which throws `RegistryValidationError`. Resolver calls also fail with `AdapterNotRegisteredError`. | Narrow custom profiles remain responsible for declaring their own required tokens. |
| Duplicate registration risk | `AdapterRegistry` continues to throw `AdapterAlreadyRegisteredError`; PR-08 adds no overwrite or fallback behavior. | None within a single registry instance. |
| Event duplication risk | One shared sink is registered under four contracts, each event is emitted once, and parity tests assert exact count/order. | A caller could intentionally emit the same event through multiple contracts; that is outside resolution behavior. |
| Behavior drift risk | Implementations and Protocol interfaces were not moved or modified; direct-vs-registry parity tests compare outputs and side effects. | Future implementation changes still require their normal behavior tests. |

## Architectural Outcome

The registry is now an active Enterprise runtime resolution mechanism rather than registry infrastructure alone. Runtime composition knows implementation classes; downstream services receive canonical Protocol contracts. Protocol remains implementation-free, and no process-global registry, discovery mechanism, reflection layer, or dependency-injection framework was introduced.
