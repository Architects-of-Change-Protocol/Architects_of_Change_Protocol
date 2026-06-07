# Runtime Adapter Registry

**Status:** Implemented by PR-07
**Boundary:** Protocol contracts → Protocol registry abstraction → Runtime/Enterprise composition root → Runtime implementation

## Purpose

The Runtime Adapter Registry is the repository's inversion-of-control boundary for canonical adapter contracts. Protocol owns adapter interfaces, stable adapter identities, registry behavior, validation results, and startup report shapes. Runtime and Enterprise own implementations and composition.

Protocol never imports, constructs, discovers, or selects an implementation. A runtime composition root explicitly registers an implementation and consumers resolve it by a protocol-owned `AdapterToken`.

```text
Protocol consumer
  -> AdapterToken<TContract>
  -> AdapterRegistry.resolve(token)
  -> runtime-owned TContract implementation
```

## Public API

The registry is exported from `@aoc/protocol/runtime-registry`.

- `AdapterRegistry` provides `register`, `resolve`, `has`, `list`, `remove`, and `validate`.
- `AdapterToken<T>` is a stable, serializable, human-readable, versioned contract identity.
- `AdapterTokens` contains one token for every contract exported by `@aoc/protocol/adapters`.
- `RegisteredAdapter` is an inventory record containing token, implementation, status, source, and implementation version.
- `RegistryValidationResult` reports required, registered, and missing tokens plus validation duration.
- `RuntimeAdapterBootstrap` registers an explicit set of adapters, validates required tokens, and produces a `RuntimeAdapterStartupReport`.

The initial implementation is intentionally an in-memory `Map`. It performs no persistence, caching, reflection, discovery, dependency injection, governance, policy evaluation, execution, or adapter business logic.

## Canonical token inventory

| Contract | Token | Contract version |
|---|---|---:|
| `VerificationProvider` | `verification.provider` | 1.0 |
| `VerificationKeyResolver` | `verification.key-resolver` | 1.0 |
| `PolicyDecisionProvider` | `policy.provider` | 1.0 |
| `ExecutionAuthorizationProvider` | `execution.authorization` | 1.0 |
| `AuditEventSink` | `audit.sink` | 1.0 |
| `ObservabilityEventSink` | `observability.sink` | 1.0 |
| `GovernanceDecisionProvider` | `governance.provider` | 1.0 |
| `RevocationLookup` | `revocation.lookup` | 1.0 |
| `RegistryLookup` | `registry.lookup` | 1.0 |
| `TrustRegistryProvider` | `trust-registry.provider` | 1.0 |
| `CapabilityLookup` | `capability.lookup` | 1.0 |
| `AttestationLookup` | `attestation.lookup` | 1.0 |
| `CredentialStatusLookup` | `credential-status.lookup` | 1.0 |
| `SecurityEventSink` | `security.sink` | 1.0 |
| `ProtocolEventSink` | `protocol-event.sink` | 1.0 |

Token IDs are compatibility identifiers. Renaming a TypeScript interface does not silently rename its token. A breaking contract revision must use a new contract version and, when simultaneous resolution is required, a distinct token ID.

## Lifecycle

```text
Runtime startup
  -> create AdapterRegistry
  -> construct runtime implementations in the composition root
  -> create RuntimeAdapterBootstrap with explicit registrations
  -> register implementations
  -> validate required tokens
  -> emit startup report
  -> mark runtime ready, or fail startup with RegistryValidationError
```

`AdapterRegistry.validate()` is non-throwing so diagnostics can inspect missing adapters. `RuntimeAdapterBootstrap.bootstrap()` fails closed with `RegistryValidationError` when a required token is missing. The error carries the complete failed startup report.

## Enterprise composition root

`createEnterpriseRuntimeAdapterBootstrap` lives in Enterprise Assurance, not Protocol. It supplies the existing in-memory registry and event-sink implementations and accepts explicit implementations for every other canonical adapter contract. Callers decide which tokens are required for their runtime profile.

```ts
const registry = new AdapterRegistry(logger);
const report = createEnterpriseRuntimeAdapterBootstrap(registry, {
  adapters: {
    verificationProvider,
    policyDecisionProvider,
    executionAuthorizationProvider,
  },
  required: [
    AdapterTokens.VerificationProvider,
    AdapterTokens.PolicyDecisionProvider,
    AdapterTokens.ExecutionAuthorizationProvider,
    AdapterTokens.AuditEventSink,
  ],
  logger,
}).bootstrap();
```

Application code then receives the registry or, preferably, resolves adapters once at its own composition boundary and injects the typed contracts into narrower services. The registry must not become a general-purpose service locator inside domain logic.

## Inventory and logging

`list()` returns a deterministic token-sorted inventory. Every record includes:

- token ID and display name;
- implementation name;
- registration status;
- source package/composition root;
- implementation version.

Optional structured logging supports `Adapter Registered`, `Adapter Removed`, `Adapter Validation`, `Adapter Missing`, `Registry Ready`, and `Registry Failed`. Log events contain contract identity and validation state, never adapter payloads or business data.

## Boundary enforcement

`runtime-adapter-boundary.test.ts` scans every Protocol TypeScript source import and fails on Runtime, Enterprise, infrastructure, database, or external implementation dependencies. It also rejects construction of classes named as Runtime, Enterprise, or InMemory implementations inside the registry source.

Allowed in Protocol:

- contracts, claims, errors, and adapter interfaces;
- adapter tokens and registry abstractions;
- in-memory registry storage for registration metadata and object references.

Forbidden in Protocol:

- runtime or Enterprise classes;
- infrastructure/database services;
- external SDK implementations;
- implementation selection, discovery, or construction.

## Performance contract

Registry resolution is a single `Map.get` and is tested at less than 1 ms average per resolution. Validation is linear in the required-token count and is tested at less than 100 ms for the canonical startup set. No network, persistence, reflection, or scanning occurs on the resolution path.

## Registry Usage Policy

The registry is a runtime composition mechanism, not an ambient service locator.

- Use `AdapterRegistry` only in an explicit runtime composition root or resolver module.
- Resolve each runtime profile once, then inject the returned canonical contract dependencies into services.
- Do not call `registry.resolve(...)` repeatedly from domain services or business workflows.
- Do not store a process-global registry or hide registry access behind mutable singleton state.
- Validate every required adapter profile during startup and fail closed with `RegistryValidationError` when the profile is incomplete.
- A direct resolution of an unregistered token must surface `AdapterNotRegisteredError`; consumers must not silently construct a fallback.
- Optional adapters may be omitted only when the composition profile explicitly declares them optional.
- Default implementations are permitted only when the Enterprise bootstrap profile owns and documents that choice.
- Duplicate registration remains an error so startup cannot select an implementation by registration order.

The Enterprise assurance profile follows this policy through `bootstrapEnterpriseAssuranceRuntime`. The composition helper bootstraps the required profile, validates all eight assurance tokens, resolves them into `AssuranceRuntimeAdapters`, and returns typed dependencies for injection. Focused verification, trust, and event-sink resolvers support narrower composition profiles without placing registry access in implementation classes.
