# `@aoc/asset-protocolization`

The Asset Protocolization Vertical — a vertical built **on** AOC Protocol.

> It is not AOC Protocol, it is not AOC Enterprise, and it does not tokenize.

## What this package contains

APV-03, the first vertical code slice: the **asset profile framework**.

An `AssetProfile` states what must be satisfied for a particular category of
asset to be processed by the vertical — which identifying material, which
declarations, which evidence, which automated checks and which attestation, in
which jurisdictions, and how fresh each input must be.

```ts
import {
  createAssetProfileCatalog,
  listAssetProfileReadinessRequirements,
  validateAssetProfile,
} from '@aoc/asset-protocolization';

const catalog = createAssetProfileCatalog([myProfile]);
const resolved = catalog.get('my.profile.v1', '1.0.0');
const outstanding = listAssetProfileReadinessRequirements(resolved!, 'GLOBAL');
```

## What it does not contain

No evidence, claim, attestation, verification, standing, credential, proof,
subject-identity or integrity type — every one of those is Protocol's and is
referenced, never redefined. No case, no lifecycle, no persistence, no
verification execution, no review workflow, no fee assessment, no governance, no
tokenization. No concrete product profile: the fixtures under `tests/fixtures/`
are test-only.

## Dependency envelope

`@aoc/protocol` and nothing else. `scripts/check-version-graph.mjs` classifies
every `@aoc/*` package other than `@aoc/protocol` as a **facade**, and a facade
may depend only on `protocol` or `external`. That is the intended constraint, not
an obstacle: every concrete capability arrives by injection of a
Protocol-declared port, bound in a composition root.

## Documentation

- `docs/asset-protocolization/APV_03_ASSET_PROFILE_FRAMEWORK.md` — this slice.
- `docs/asset-protocolization/README.md` — the workstream and the Gate A0 record.
- `docs/architecture/adr-asset-protocolization-vertical-boundary.md` — the frozen
  boundary.
