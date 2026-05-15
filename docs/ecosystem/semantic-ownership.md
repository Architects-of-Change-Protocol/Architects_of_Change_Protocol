# Semantic Ownership Governance

## Canonical authority

`@aoc/protocol/contracts` is the single source of truth for canonical protocol semantics.

## Ownership matrix

- Canonical owner: `@aoc/protocol/contracts`
  - `CapabilityToken`, `CapabilityGrant`, `ConsentGrant`, `Delegation`, `AgentScope`, `AuditEventEnvelope`, `PolicyDecision`, `ResourceRef`, `ScopedAccessRequest`, `TrustDomainIdentifier`.
- Compatibility facades:
  - `@aoc/capability-tokens`
  - `@aoc/consent-engine`
  - `@aoc/scoped-access`
  - `@aoc/audit-sdk`
- Package-specific domain contract owner:
  - `@aoc/identity` (identity-domain semantics remain local).

## Layering and dependency directions

GOOD
- Protocol -> canonical contracts
- Runtime packages -> consume protocol contracts
- Enterprise runtimes -> implement behavior
- PMFreak/apps -> consume protocol/facade contracts

BAD
- Runtime packages redefining protected protocol contracts
- Vertical apps owning protocol semantics
- Cross-runtime semantic drift through local redefinitions

## Extension rules

- Compatibility packages may add package-specific helpers/schemas.
- Protected symbol names must not be locally redefined outside `@aoc/protocol/contracts`.
- Extensions must compose with canonical contracts rather than fork them.

## Anti-patterns

- Copy/pasted interface definitions for protected symbols.
- Contract drift by “almost identical” local interfaces.
- Pulling runtime implementation concerns into protocol contracts.
