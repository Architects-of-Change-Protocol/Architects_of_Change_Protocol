# Runtime Bootstrap Migration Report

## Scope

PR-09 consolidates runtime startup architecture without moving implementations, changing assurance behavior, or implementing additional runtime domains.

## Previous bootstrap model

Before PR-09:

- Protocol owned `AdapterRegistry`, canonical tokens, and `RuntimeAdapterBootstrap`.
- Enterprise Assurance constructed default implementations and registrations in an assurance helper.
- The Assurance resolver owned a standalone required-token array.
- The complete Assurance helper manually passed that array to low-level bootstrap, then resolved typed dependencies.
- Startup reports described registry validation but carried no profile identity, validation mode, normalized warnings, or resolved-context contract.

That model worked for Assurance but offered no common declaration or flow for future Governance, Execution, Observability, PMFreak host, or externally packaged runtimes.

## New bootstrap model

After PR-09:

1. Protocol owns implementation-free `RuntimeProfile` and validation-mode contracts.
2. Protocol owns `RuntimeBootstrapEngine`, which delegates to the existing low-level bootstrap and emits `RuntimeBootstrapResult`.
3. Protocol owns generic composition-root, composition-options, composition-result, and resolved-context contracts.
4. Enterprise owns `EnterpriseAssuranceRuntimeProfile` and `EnterpriseAssuranceRuntimeCompositionRoot`.
5. The Enterprise root constructs defaults and overrides, invokes the shared engine, and performs typed Assurance resolution.
6. `bootstrapEnterpriseAssuranceRuntime()` remains public and delegates to the composition root.

## Assurance migration status

| Surface | Status | Notes |
|---|---|---|
| Required-token declaration | Migrated | Canonical source is `EnterpriseAssuranceRuntimeProfile.requiredTokens`. |
| Optional-token declaration | Added | Seven optional Assurance integrations are explicitly listed. |
| Default construction | Preserved | In-memory event sink and trust registry remain Enterprise-owned. |
| Override behavior | Preserved | Caller adapters continue to override defaults. |
| Registry bootstrap | Consolidated | Complete Assurance startup uses `RuntimeBootstrapEngine`. |
| Typed resolution | Preserved | `resolveAssuranceRuntimeAdapters()` remains in Enterprise. |
| Compatibility helper | Preserved | `bootstrapEnterpriseAssuranceRuntime()` and PR-08 low-level helpers remain. |
| Failure behavior | Preserved | Assurance uses `profile` mode and fails closed when any of its eight required adapters is absent. |
| Startup evidence | Expanded | Result now includes profile, validation mode, effective requirements, missing/registered adapters, warnings, inventory, and duration. |

## Remaining bootstrap surfaces

PR-09 intentionally does not implement or migrate runtime profiles that do not yet have a concrete composition surface. Future work should inventory and migrate, in priority order:

1. full Enterprise or certification runtime (`strict` candidate);
2. Governance runtime;
3. Execution runtime;
4. Observability runtime;
5. PMFreak host runtime; and
6. any extracted external runtime package.

Each candidate should reuse the Protocol engine and result contracts while retaining implementation construction and typed resolution in its owning package.

## Risk assessment

| Risk | Assessment | Mitigation |
|---|---|---|
| Assurance behavior drift | Low | Defaults, overrides, typed resolver, required tokens, and fail-closed behavior are preserved and covered by PR-08 plus PR-09 tests. |
| Protocol implementation leakage | Low | Engine/profile modules import only registry primitives and canonical tokens; an architecture test checks the engine source for Enterprise implementation references. |
| Compatibility break | Low | Existing low-level helpers and `AssuranceRuntimeAdapterTokens` remain available; the latter is a deprecated alias. |
| Conflicting status semantics | Managed | Low-level report preserves `ready`/`failed`; normalized permissive startup maps a failed validation report to `degraded` without throwing. |
| Future profile divergence | Reduced | Validation selection, registry setup, warnings, inventory, and timing are centralized in one engine. |
| Defaults becoming hidden | Reduced | Profiles explicitly declare `allowDefaults`; concrete defaults remain visible in the owning composition root. |

## Future migration rules

A future profile migration is complete only when it:

- declares an immutable profile with required and optional tokens;
- identifies its validation mode and defaults policy;
- owns implementation construction in a package-local composition root;
- delegates registry flow to `RuntimeBootstrapEngine`;
- resolves typed dependencies outside Protocol;
- returns `RuntimeCompositionResult`; and
- tests missing-token behavior and startup metadata.

No future runtime should introduce a parallel registry, bootstrap engine, startup report, global locator, reflection-based discovery, or Protocol-owned business implementation factory.
