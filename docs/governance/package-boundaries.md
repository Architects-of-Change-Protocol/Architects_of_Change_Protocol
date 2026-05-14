# Package Boundaries and Consumption Rules

## Boundary intent

This repository is the canonical protocol primitive and deterministic runtime foundation. Package boundaries are designed to keep consumer imports stable without exposing implementation detail.

## Boundary rules

1. **Contracts packages** publish schema and type contracts only.
2. **Runtime packages** publish runtime interfaces and deterministic execution primitives only.
3. **Provider interfaces** publish adapter/provider abstractions only.
4. **Shared types** publish cross-package, implementation-neutral type aliases/interfaces only.
5. Internal wiring modules remain non-exported and non-importable from package roots.

## Consumer policy

- AOC-Enterprise, PMFreak, HRKey, and external SDKs MUST consume root entrypoints only.
- Consumers MUST NOT deep import contract internals, runtime internals, or generated output folders.
- New public API requires explicit root barrel export and package-level `exports` declaration.

## Canonical import philosophy

- Prefer semantic package names over folder-oriented import paths.
- Keep import paths stable while allowing internal refactors.
- Treat package root exports as API contracts under governance.

### Good

```ts
import { ConsentGrant } from '@aoc/consent-engine';
import { AuditEventEnvelope } from '@aoc/audit-sdk';
```

### Avoid

```ts
import { ConsentGrant } from '@aoc/consent-engine/src/contracts';
import { AuditEventEnvelope } from '../../packages/audit-sdk/src/contracts';
```
