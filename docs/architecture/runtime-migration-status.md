# Runtime Adapter Migration Status

**Report date:** 2026-06-07
**Program increment:** PR-07 — Runtime Adapter Registry Migration

## Executive summary

The canonical Protocol adapter surface is fully tokenized and registry-addressable: **15 of 15 contracts (100%)**. All canonical concrete adapter implementations currently present in Enterprise Assurance can be registered from the Enterprise composition root. Protocol contains no runtime implementation import or construction.

This report distinguishes registry migration from implementation creation. PR-07 does not invent policy, authorization, governance, revocation, capability, attestation, or credential-status behavior where no canonical implementation currently exists; doing so would violate the infrastructure-only scope.

## Current runtime bindings

Before PR-07, concrete canonical adapters were constructed directly by consumers and architecture tests:

| Implementation | Canonical contract bindings |
|---|---|
| `EnterpriseVerificationProvider` | `VerificationProvider` |
| `InMemoryVerificationKeyResolver` | `VerificationKeyResolver` |
| `InMemoryCanonicalTrustRegistry` | `RegistryLookup`, `TrustRegistryProvider` |
| `InMemoryAssuranceEventSink` | `AuditEventSink`, `ObservabilityEventSink`, `SecurityEventSink`, `ProtocolEventSink` |
| `InMemoryAuditEventSink` | Alternate `AuditEventSink` implementation |

Legacy runtime classes that do not implement a canonical `@aoc/protocol/adapters` contract are outside this registry migration. They remain unchanged until a future PR defines or adopts a canonical adapter seam for them.

## Migrated bindings

The Enterprise Assurance composition root now maps every canonical token to an explicit adapter option. Existing in-memory trust-registry and assurance-event implementations are supplied as defaults. Verification and key-resolution implementations, including the existing Enterprise implementations, are registered when provided by the runtime profile.

The Assurance parity tests now resolve canonical verification, trust-registry, and event-sink behavior through `AdapterRegistry` rather than invoking those implementation bindings directly.

| Token | Registration path | State |
|---|---|---|
| `verification.provider` | Explicit Enterprise adapter option | Registry-backed |
| `verification.key-resolver` | Explicit Enterprise adapter option | Registry-backed |
| `policy.provider` | Explicit Enterprise adapter option | Registry-ready; no canonical implementation in scope |
| `execution.authorization` | Explicit Enterprise adapter option | Registry-ready; no canonical implementation in scope |
| `audit.sink` | Enterprise default or explicit override | Registry-backed |
| `observability.sink` | Enterprise default or explicit override | Registry-backed |
| `governance.provider` | Explicit Enterprise adapter option | Registry-ready; no canonical implementation in scope |
| `revocation.lookup` | Explicit Enterprise adapter option | Registry-ready; no canonical implementation in scope |
| `registry.lookup` | Enterprise default or explicit override | Registry-backed |
| `trust-registry.provider` | Enterprise default or explicit override | Registry-backed |
| `capability.lookup` | Explicit Enterprise adapter option | Registry-ready; no canonical implementation in scope |
| `attestation.lookup` | Explicit Enterprise adapter option | Registry-ready; no canonical implementation in scope |
| `credential-status.lookup` | Explicit Enterprise adapter option | Registry-ready; no canonical implementation in scope |
| `security.sink` | Enterprise default or explicit override | Registry-backed |
| `protocol-event.sink` | Enterprise default or explicit override | Registry-backed |

## Remaining bindings

There are **no remaining direct bindings for existing canonical adapter implementations in the migrated Assurance verification, trust-registry, and event-sink paths**.

Seven canonical contracts currently have no repository implementation identified by the PR-02/PR-04 inventory:

- `PolicyDecisionProvider`
- `ExecutionAuthorizationProvider`
- `GovernanceDecisionProvider`
- `RevocationLookup`
- `CapabilityLookup`
- `AttestationLookup`
- `CredentialStatusLookup`

These are implementation gaps, not registry gaps. A runtime that requires one must provide it during bootstrap; validation fails startup if it is omitted.

## Coverage

| Measure | Coverage | Result |
|---|---:|---|
| Canonical adapter contracts with stable tokens | 15 / 15 | 100% |
| Canonical tokens accepted by Enterprise bootstrap | 15 / 15 | 100% |
| Existing canonical implementation bindings with a registry path | 8 / 8 | 100% |
| Protocol runtime/Enterprise implementation imports | 0 | Pass |
| Protocol runtime implementation constructors | 0 | Pass |
| Default Enterprise bindings available without caller configuration | 6 / 15 | Profile-dependent |

**Migration percentage: 100%** for the PR-07 objective: every canonical adapter contract is registry-addressable and every existing canonical implementation binding has a registration path. This percentage does not claim that implementations exist for all optional contracts.

## Startup readiness

A runtime profile declares its required tokens. Startup succeeds only when all required tokens are registered. The startup inventory reports token, implementation, status, source, and version. Missing required adapters produce `RegistryValidationError` and a failed report before the runtime is marked ready.

## Guardrails and follow-up

- Protocol may add contracts and matching tokens, but never implementation imports.
- Runtime/Enterprise composition roots own registration and required-token profiles.
- New canonical adapter implementations must be added to a runtime bootstrap before consumers use them.
- Domain services should prefer constructor injection of resolved adapters; they should not use the registry as an ambient service locator.
- Distributed registries, runtime discovery, persistence, decorators, reflection, and dependency-injection frameworks remain explicit non-goals.
