# Sovereignty Capabilities (the canonical eight)

AOC Protocol defines exactly eight Sovereignty Capabilities — the "sovereignty minerals". This
document is a pointer to the contract, not a second source of truth: the canonical inventory lives in
`packages/protocol/src/sovereignty-capabilities/` and is published as
`@aoc/protocol/sovereignty-capabilities`.

## The inventory

| # | Key | Canonical id | Version | Name |
| --: | --- | --- | --- | --- |
| 1 | `identity` | `aoc:sovereignty-capability:identity` | 1.0.0 | Identity |
| 2 | `integrity` | `aoc:sovereignty-capability:integrity` | 1.0.0 | Integrity |
| 3 | `provenance` | `aoc:sovereignty-capability:provenance` | 1.0.0 | Provenance |
| 4 | `portability` | `aoc:sovereignty-capability:portability` | 1.0.0 | Portability |
| 5 | `interoperability` | `aoc:sovereignty-capability:interoperability` | 1.0.0 | Interoperability |
| 6 | `verifiability` | `aoc:sovereignty-capability:verifiability` | 1.0.0 | Verifiability |
| 7 | `licensing_terms` | `aoc:sovereignty-capability:licensing-terms` | 1.0.0 | Licensing & Terms |
| 8 | `governance_compatibility` | `aoc:sovereignty-capability:governance-compatibility` | 1.0.0 | Governance Compatibility |

Enumeration order is canonical and deterministic. Membership is closed: a consumer cannot register a
ninth capability, and there is no runtime registration API. Adding one is an act of Protocol
evolution — a new key in `SOVEREIGNTY_CAPABILITY_KEYS`, a definition, and tests.

## A Sovereignty Capability is not a capability grant

The word *capability* is overloaded in this repository. Everything in the right-hand column below
describes a **grant** — permission for someone to do something — and none of it is a Sovereignty
Capability:

| Sovereignty Capability | Legacy capability models (unchanged) |
| --- | --- |
| A sovereignty property the Protocol provides | `CapabilityToken` / `CapabilityGrant` — bearer authorization over a resource |
| Has a fixed canonical id and a semantic version | `ProtocolCapabilityDefinition` (`protocol/capabilities/`) — a `wallet`/`portfolio`/`insight` financial permission catalog |
| Has no subject, holder, expiry, scope or issuer | `RuntimeCapability`, delegation and consent capability types — runtime execution authorization |

New symbols are therefore sovereignty-qualified (`SovereigntyCapabilityId`,
`SovereigntyCapabilityDefinition`, `listSovereigntyCapabilities`, …) so both vocabularies can coexist.
No legacy type was renamed; convergence is later work.

## Identity and version contract

- **Identifier grammar** — `aoc:sovereignty-capability:<slug>`, following the existing AOC scheme
  established by `SovereignAssetId` (`aoc:sovereign-asset:<uuid>`). Unlike a `SovereignAssetId`, a
  capability id is never minted: it is a deterministic, human-readable Protocol constant, independent
  of subject, provider, grant, evidence and runtime.
- **Key** — a stable snake_case programmatic name (`licensing_terms`). Display capitalization is
  never the machine identity.
- **Version** — `SovereigntyCapabilityVersion`, a SemVer-shaped version of the capability's own
  semantic contract. It is not the package version, `manifestVersion`, `schemaVersion`, the
  canonicalization profile, an adapter `contractVersion`, or a grant version. It exists so a future
  work package can state "this operation consumed Verifiability 1.0.0". The exported template
  literal type is only a cheap compile-time filter — TypeScript's `${number}` also admits `-1.2.3`,
  `1e2.0.0` and `1.2.3.4` — so `isSovereigntyCapabilityVersion` (exactly `^\d+\.\d+\.\d+$`) is the
  authoritative rule and is what consumers validating or persisting a version should call.

## Discovery

```ts
import {
  getSovereigntyCapability,
  getSovereigntyCapabilityByKey,
  listSovereigntyCapabilities,
} from '@aoc/protocol/sovereignty-capabilities';

listSovereigntyCapabilities();                                    // all eight, canonical order
getSovereigntyCapability('aoc:sovereignty-capability:identity');  // exact canonical definition
getSovereigntyCapabilityByKey('governance_compatibility');
getSovereigntyCapability('aoc:sovereignty-capability:wallet');    // undefined — never coerced
```

The subpath has zero dependencies (not even `node:crypto`), so it is browser-safe and cannot pull
filesystem, storage, runtime or Enterprise code into a bundle.

## Scope of this contract

Definitions carry Protocol metadata only — `id`, `key`, `namespace`, `version`, `name`,
`description`. There are deliberately no input/output/evidence contract references, because those
contracts do not exist yet and a placeholder would assert an implementation that has not been built.
Colour, icon, crystal geometry, marketing copy, tier, pricing and provider configuration are
presentation or product concerns and never appear here.

This surface answers *what capabilities exist, what are their identities and versions, and how are
they discovered*. It does not answer *how are they executed* — there is no invocation API.

## Frontend

`frontend/app/src/landing/protocol/content.ts` keeps the display model (dock ids, crystal geometry,
maturity status, landing copy) but is no longer a source of truth for which capabilities exist. Each
entry names its Protocol key, and
`__tests__/architecture/sovereignty-capability-frontend-parity.test.ts` fails if the landing taxonomy
drifts from the registry in membership, order or canonical name.
