# Legacy Runtime Migration Report

## PR-11 outcome

PR-11 reclassifies Assurance legacy runtime paths as compatibility-only surfaces. It does not delete exports or change runtime behavior.

| Surface | Delegation result | Deprecation result | Migration state |
|---|---|---|---|
| `@aoc-runtime/audit-runtime` | Direct re-export of `@aoc/enterprise/assurance/audit` | Entrypoint and README guidance added | Open: production consumers remain |
| `@aoc-runtime/trust-registry-runtime` | Direct re-export of `@aoc/enterprise/assurance/trust` | Entrypoint and README guidance added | Open: production consumers remain |
| `runtime/audit` | Historical signatures delegate to Enterprise audit services | Entrypoint and facades marked deprecated | Open: hosted runtime and tests remain |
| `runtime/trust` | Direct Enterprise trust re-export bridge | Entrypoints marked deprecated | Open: hosted runtime and tests remain |
| `runtime/observability.ts` | Direct Enterprise observability re-export bridge | Entrypoint marked deprecated | Open: hosted runtime remains |

## Implementation hardening

- The root audit bridge no longer imports the repository `protocol/audit` source tree. Enterprise owns the legacy audit compatibility event/query types used by the facade.
- Package wrappers contain no implementation classes and use Enterprise public package subpaths.
- Hosted trust and observability bridges contain no implementation logic.
- The only classes retained in a governed legacy surface are the audit constructor/signature facades; their mutable implementation and behavior remain Enterprise-owned.
- The scanner rejects Protocol-source imports, PMFreak/application imports, unapproved implementation classes, missing Enterprise delegation, and missing deprecation/migration guidance.

## Remaining migration candidates

| Priority | Consumer | Current dependency | Recommended action |
|---|---|---|---|
| 1 | `examples/pmfreak-adapter/src/index.ts` | `@aoc-runtime/audit-runtime` | Rewrite the example to `@aoc/enterprise/assurance/audit` in an example-focused change |
| 1 | `packages/authorization-runtime/src/index.ts` | both legacy packages | Migrate imports after confirming package dependency and release implications |
| 2 | `runtime/api/routes.ts`, `runtime/api/server.ts` | root audit/trust/observability bridges | Move hosted composition to Enterprise public surfaces |
| 2 | `runtime/access`, `runtime/payout`, `runtime/sdk` | root trust/audit types | Move type imports with hosted composition cleanup |
| 3 | runtime tests and extraction parity tests | legacy paths | Retain as compatibility coverage until associated production consumer migration |
| 4 | historical architecture/extraction documents | textual references | Keep historical reports; link current readers to the sunset plan where edited |

## Repeatable consumer scan

Use this source-only search when updating the report:

```bash
rg -n --glob '!**/dist/**' --glob '!node_modules/**' \
  '@aoc-runtime/(audit-runtime|trust-registry-runtime)|packages/(audit-runtime|trust-registry-runtime)|runtime/(audit|trust|observability)' .
```

Also inspect relative imports whose text omits the `runtime/` prefix:

```bash
rg -n --glob '!**/dist/**' --glob '*.{ts,tsx,js,mjs,cjs}' \
  "from ['\"][^'\"]*(audit|trust|observability)[^'\"]*['\"]" runtime __tests__ packages examples
```

Generated `dist` files and package-lock workspace entries should be updated by normal builds/install operations but are not counted as independent consumers.

## Compatibility-window status

The migration window remains open because production consumers still exist. Freeze and removal gates have not been met. Enterprise Assurance owns the wrappers' retirement review, and no removal date is asserted by this PR.
