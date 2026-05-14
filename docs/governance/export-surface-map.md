# Export Surface Map (Canonical)

## Canonical public packages

| Package | Stable entrypoint | Surface class | Notes |
|---|---|---|---|
| `@aoc/capability-tokens` | `@aoc/capability-tokens` | contracts, shared types | Exposes only capability token contract types and schema examples. |
| `@aoc/consent-engine` | `@aoc/consent-engine` | contracts | Exposes consent grant and policy decision contracts only. |
| `@aoc/identity` | `@aoc/identity` | contracts | Exposes identity contract types and schema example only. |
| `@aoc/scoped-access` | `@aoc/scoped-access` | contracts | Exposes scope grammar and scope expression contract types only. |
| `@aoc/audit-sdk` | `@aoc/audit-sdk` | contracts, shared types | Exposes audit envelope contracts only. |

## Export policy

- Public imports MUST resolve through package root entrypoints only.
- Deep imports into `/src/*`, `/dist/*`, or individual contract files are not stable.
- Barrels (`src/index.ts`) export stable API only; no internal runtime implementation modules.

## Deprecated/ambiguous surfaces

- Any import path that bypasses package root (e.g. `@aoc/identity/src/contracts`) is **deprecated**.
- Legacy `@aoc-runtime/*` naming is tolerated for existing consumers but not canonical for new SDK integrations.

## Stable import examples

```ts
import { CapabilityToken } from '@aoc/capability-tokens';
import { ConsentGrant } from '@aoc/consent-engine';
import { IdentityContract } from '@aoc/identity';
```
