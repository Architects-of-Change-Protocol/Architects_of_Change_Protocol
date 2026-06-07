# Runtime Profile Model

## Schema

`RuntimeProfile` is an implementation-free Protocol contract:

```ts
interface RuntimeProfile {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly requiredTokens: readonly AdapterToken[];
  readonly optionalTokens?: readonly AdapterToken[];
  readonly allowDefaults: boolean;
  readonly validationMode: 'strict' | 'profile' | 'permissive';
}
```

Profiles describe startup policy; they do not contain factories, implementation instances, environment readers, database handles, external clients, or typed domain resolvers.

## Identity and metadata

- `id` is a stable audit identifier such as `enterprise.assurance`, `enterprise.governance`, `enterprise.execution`, or `pmfreak.host`.
- `name` is a human-readable label.
- `description` explains the profile boundary and intended runtime.
- `allowDefaults` records whether the owning composition root may choose default implementations. The Protocol engine does not construct or inspect defaults.

Profile objects and token arrays should be immutable so startup evidence always refers to a stable declaration.

## Required and optional adapters

`requiredTokens` defines the minimum dependency set for a profile-ready runtime. In `profile` mode, every required token must be registered before typed resolution begins.

`optionalTokens` documents supported integrations that are not needed for profile readiness. Optional adapters may be supplied by overrides and appear in inventory. Their absence does not fail `profile` or `permissive` startup. `strict` mode deliberately supersedes the distinction by requiring every canonical adapter token.

Required and optional lists are declarations, not implementation selectors. A composition root decides which instances satisfy those tokens.

## Validation behavior

### Strict

`strict` validates `AllAdapterTokens`, regardless of the profile's narrower required list. Any missing canonical adapter causes `RegistryValidationError`. This mode is appropriate for certification and complete hardened runtimes.

### Profile

`profile` validates only `requiredTokens`. Missing optional tokens are accepted. Any missing required token causes `RegistryValidationError`. This is the normal mode for bounded domain runtimes.

### Permissive

`permissive` validates `requiredTokens` but does not throw when they are missing. The normalized result has `status: 'degraded'`, identifies every missing adapter, and includes a warning. This mode must not be treated as production readiness.

| Mode | Effective required set | Throws on missing | Normalized status with missing tokens |
|---|---|---:|---|
| `strict` | `AllAdapterTokens` | Yes | No result; validation error carries the low-level failed report |
| `profile` | `requiredTokens` | Yes | No result; validation error carries the low-level failed report |
| `permissive` | `requiredTokens` | No | `degraded` |

## Enterprise Assurance example

`EnterpriseAssuranceRuntimeProfile` uses `profile` validation.

Required adapters:

- `VerificationProvider`
- `VerificationKeyResolver`
- `RegistryLookup`
- `TrustRegistryProvider`
- `AuditEventSink`
- `SecurityEventSink`
- `ProtocolEventSink`
- `ObservabilityEventSink`

Optional adapters:

- `PolicyDecisionProvider`
- `ExecutionAuthorizationProvider`
- `GovernanceDecisionProvider`
- `RevocationLookup`
- `CapabilityLookup`
- `AttestationLookup`
- `CredentialStatusLookup`

The Enterprise composition root supplies event-sink and trust-registry defaults, accepts verification and other overrides, runs the shared engine, and then calls the Enterprise-owned assurance resolver.

## Example declaration

```ts
const GovernanceRuntimeProfile: RuntimeProfile = Object.freeze({
  id: 'enterprise.governance',
  name: 'Enterprise Governance Runtime',
  requiredTokens: Object.freeze([
    AdapterTokens.GovernanceDecisionProvider,
    AdapterTokens.AuditEventSink,
  ]),
  optionalTokens: Object.freeze([
    AdapterTokens.PolicyDecisionProvider,
  ]),
  allowDefaults: true,
  validationMode: RuntimeProfileValidationMode.Profile,
});
```

This example is illustrative only; PR-09 does not implement a Governance runtime.
