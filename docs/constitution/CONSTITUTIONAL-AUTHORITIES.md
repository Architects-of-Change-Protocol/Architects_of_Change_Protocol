# Constitutional Authorities

**Constitution Version:** v5.0

## Authority lifecycle fields

Every authority must define:

- Owner
- Purpose
- Creation Amendment
- Retirement Amendment
- Status

Valid statuses are `Canonical`, `Transitional`, `Deprecated`, and `Retired`.

## Canonical authorities

| Authority | Owner | Purpose | Creation Amendment | Retirement Amendment | Status |
|---|---|---|---|---|---|
| Protocol | `packages/protocol/src` | Owns canonical contracts, claims, errors, tokens, registry abstractions, adapter contracts, bootstrap contracts, composition contracts, and profile contracts. | AOC-AMD-0001 | Not scheduled | Canonical |
| Enterprise | `enterprise/src` | Owns extracted runtime implementations, assurance implementations, profiles, composition roots, defaults, and typed resolvers. | AOC-AMD-0001 | Not scheduled | Canonical |
| Compatibility | `packages/audit-runtime/src`; `packages/trust-registry-runtime/src`; `runtime/audit`; `runtime/trust`; `runtime/observability.ts` | Owns deprecated compatibility facades that may re-export, delegate, or translate signatures without owning new behavior. | AOC-AMD-0001 | Not scheduled | Deprecated |
| Constitution | `docs/constitution` | Owns constitutional authority, laws, policies, amendment procedure, amendment catalog, authority and capability catalogs, capability lifecycle, delegation and revocation policy, version history, scanners, and release gate obligations. | AOC-AMD-0001 | Not scheduled | Canonical |

## Transitional authorities

These authorities are temporary and closed. Adding to or removing from this list requires a ratified constitutional amendment.

| Authority | Owner | Purpose | Creation Amendment | Retirement Amendment | Status |
|---|---|---|---|---|---|
| authorization-runtime | `packages/authorization-runtime/src` | Pre-extraction authorization runtime implementation authority. | AOC-AMD-0001 | Required before retirement | Transitional |
| capability-runtime | `packages/capability-runtime/src` | Pre-extraction capability runtime implementation authority. | AOC-AMD-0001 | Required before retirement | Transitional |
| consent-runtime | `packages/consent-runtime/src` | Pre-extraction consent runtime implementation authority. | AOC-AMD-0001 | Required before retirement | Transitional |
| governance-runtime | `packages/governance-runtime/src` | Pre-extraction governance runtime implementation authority. | AOC-AMD-0001 | Required before retirement | Transitional |
| portable-cognition | `packages/portable-cognition/src` | Pre-extraction portable cognition runtime implementation authority. | AOC-AMD-0001 | Required before retirement | Transitional |
| vault-runtime | `packages/vault-runtime/src` | Pre-extraction vault runtime implementation authority. | AOC-AMD-0001 | Required before retirement | Transitional |
| runtime/governance | `runtime/governance` | Pre-extraction governance runtime source authority. | AOC-AMD-0001 | Required before retirement | Transitional |
| runtime/marketplace | `runtime/marketplace` | Pre-extraction marketplace runtime source authority. | AOC-AMD-0001 | Required before retirement | Transitional |
| runtime/monetization | `runtime/monetization` | Pre-extraction monetization runtime source authority. | AOC-AMD-0001 | Required before retirement | Transitional |
| runtime/payout | `runtime/payout` | Pre-extraction payout runtime source authority. | AOC-AMD-0001 | Required before retirement | Transitional |
| pmfreak-adapter | `examples/pmfreak-adapter/src` | Pre-extraction PMFreak adapter authority. | AOC-AMD-0001 | Required before retirement | Transitional |

## Authorized composition authorities

Composition authority is intentionally narrow. These files may construct implementations, register adapters, apply defaults, apply overrides, or resolve registries because they are explicit composition seams.

| Authority | Owner | Purpose | Creation Amendment | Retirement Amendment | Status |
|---|---|---|---|---|---|
| enterprise runtime adapter bootstrap | `enterprise/src/assurance/runtime-adapter-bootstrap.ts` | Enterprise assurance composition bootstrap. | AOC-AMD-0001 | Not scheduled | Canonical |
| enterprise runtime adapter resolver | `enterprise/src/assurance/runtime-adapter-resolver.ts` | Enterprise assurance typed resolver seam. | AOC-AMD-0001 | Not scheduled | Canonical |
| protocol runtime bootstrap engine | `packages/protocol/src/runtime-registry/runtime-bootstrap-engine.ts` | Protocol bootstrap contract and registry composition abstraction. | AOC-AMD-0001 | Not scheduled | Canonical |
| runtime API routes | `runtime/api/routes.ts` | Runtime API composition seam. | AOC-AMD-0001 | Not scheduled | Canonical |
| runtime API server | `runtime/api/server.ts` | Runtime API server composition seam. | AOC-AMD-0001 | Not scheduled | Canonical |
| PMFreak adapter composition | `examples/pmfreak-adapter/src/index.ts` | Adapter composition entrypoint. | AOC-AMD-0001 | Required before retirement | Transitional |
| frontend runtime client | `frontend/app/src/lib/runtimeClient.ts` | Frontend runtime client composition seam. | AOC-AMD-0001 | Not scheduled | Canonical |
