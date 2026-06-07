# Runtime Bootstrap Consolidation

## Why consolidation exists

PR-07 introduced the canonical Protocol adapter registry and PR-08 made it operational for Enterprise Assurance. The remaining startup flow was domain-specific: Enterprise constructed defaults, selected required tokens, invoked registry bootstrap, and resolved typed dependencies in one assurance-only helper. Repeating that shape for Governance, Execution, PMFreak, or a package-extracted runtime would allow validation, reporting, and failure behavior to drift.

PR-09 establishes one startup sequence:

```text
RuntimeProfile
  -> profile-specific RuntimeCompositionRoot
  -> RuntimeBootstrapEngine
  -> RuntimeAdapterBootstrap / AdapterRegistry
  -> RuntimeBootstrapResult
  -> typed ResolvedRuntimeContext
  -> RuntimeCompositionResult
```

The sequence is explicit, profile-driven, and auditable. It does not introduce a dependency-injection framework, global service locator, reflection, discovery, or environment-driven implementation loading.

## Profile lifecycle

1. A package declares an implementation-free `RuntimeProfile` using canonical Protocol adapter tokens.
2. A profile-specific composition root constructs default implementations and applies caller overrides.
3. The composition root converts those instances into adapter registrations.
4. `RuntimeBootstrapEngine` creates or accepts an `AdapterRegistry`, selects validation tokens from the profile mode, and delegates registration and validation to `RuntimeAdapterBootstrap`.
5. The engine emits a normalized `RuntimeBootstrapResult` containing profile metadata, status, validation mode, required, missing and registered adapters, warnings, inventory, and duration.
6. The composition root resolves package-owned typed dependencies and adds them as `resolvedContext`, producing `RuntimeCompositionResult`.
7. Runtime services receive the resolved typed context rather than performing registry lookups.

## Composition-root responsibilities

A composition root is the only layer in this architecture that may:

- construct concrete implementations;
- select defaults when the profile permits defaults;
- apply caller-supplied overrides;
- attach implementation source and version metadata;
- invoke the shared bootstrap engine;
- call profile-specific typed resolvers; and
- return a typed runtime context.

For Enterprise Assurance, `EnterpriseAssuranceRuntimeCompositionRoot` owns the in-memory assurance event sink and trust-registry defaults. `bootstrapEnterpriseAssuranceRuntime()` remains as the compatibility helper and delegates to that root.

## Bootstrap-engine responsibilities

`RuntimeBootstrapEngine` owns reusable startup flow only. It:

- accepts a profile, registrations, optional registry, and optional logger;
- creates a registry when none is supplied;
- delegates registration and validation to `RuntimeAdapterBootstrap`;
- applies strict, profile, or permissive validation semantics; and
- normalizes startup evidence into `RuntimeBootstrapResult`.

The engine does **not** import Enterprise, construct implementations, choose profile defaults, load environment variables, access databases or SDKs, resolve profile-specific types, or create runtime services.

## Validation modes

| Mode | Validation set | Missing-token behavior | Intended use |
|---|---|---|---|
| `strict` | Every token in `AllAdapterTokens` | Startup throws `RegistryValidationError` | Certification, hardened production, complete enterprise runtime |
| `profile` | `profile.requiredTokens` | Startup throws `RegistryValidationError` | Assurance and future domain profiles |
| `permissive` | `profile.requiredTokens` | Result is `degraded`; missing tokens and warnings are reported without throwing | Development, tests, partial demonstrations |

Optional tokens are declared for auditability and capability discovery. Their absence does not fail `profile` or `permissive` validation. In `strict` mode all canonical tokens are required, including tokens that a narrower profile marks optional.

## Startup reports

The legacy `RuntimeAdapterStartupReport` remains the low-level registry report for compatibility. The canonical profile-aware result is `RuntimeBootstrapResult`, and a completed profile composition returns `RuntimeCompositionResult<TContext>`. The normalized shape includes:

- the full profile and profile ID;
- startup status and validation mode;
- effective required adapters;
- missing and registered adapters;
- warnings;
- registry inventory and timing; and
- the underlying low-level startup report.

## Migration notes

- The eight Assurance required tokens moved from a resolver-local hardcoded array into `EnterpriseAssuranceRuntimeProfile`.
- `AssuranceRuntimeAdapterTokens` remains as a deprecated compatibility alias to `EnterpriseAssuranceRuntimeProfile.requiredTokens`.
- `resolveAssuranceRuntimeAdapters()` remains in Enterprise and is invoked only after shared bootstrap succeeds.
- The PR-08 low-level `createEnterpriseRuntimeAdapterBootstrap()` and `bootstrapEnterpriseRuntimeAdapters()` helpers remain available with unchanged fail-closed behavior.
- Future profiles should declare a profile and implement a composition root; they should not fork the engine or introduce a new startup-report shape.
