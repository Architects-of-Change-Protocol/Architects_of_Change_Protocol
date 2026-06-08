# Constitutional Boundary Policy

## Purpose

The repository is the first constitutional authority for AOC architecture. Architectural ownership is expressed as policy, executable scanners, fixture-backed tests, CI gates, and release gates. Human memory and reviewer familiarity are defense-in-depth, not enforcement mechanisms.

## Constitutional layers

1. **Protocol boundary:** `packages/protocol/src` is pure contract and composition-abstraction territory.
2. **Enterprise boundary:** `enterprise/src` owns extracted Assurance implementations, defaults, profiles, resolvers, and composition.
3. **Legacy compatibility boundary:** audit, trust, and observability compatibility surfaces may delegate or re-export only.
4. **Public export boundary:** package consumers use declared export-map entries and never another package's source/private paths.
5. **Ownership boundary:** implementation-owner declarations occur only in enumerated ownership domains.
6. **Package dependency boundary:** Enterprise may depend on Protocol; Protocol may not depend on Enterprise, runtime, or infrastructure.
7. **Composition boundary:** implementation construction and registry resolution occur only at composition seams.
8. **Release boundary:** all four constitutional scanners are mandatory release prerequisites.

## Governed roots

| Root | Constitutional role |
|---|---|
| `packages/protocol/src` | Canonical Protocol owner |
| `enterprise/src` | Canonical extracted Enterprise owner |
| `packages/audit-runtime/src` | Deprecated audit compatibility package |
| `packages/trust-registry-runtime/src` | Deprecated trust compatibility package |
| `runtime/audit`, `runtime/trust`, `runtime/observability.ts` | Deprecated source compatibility bridges |
| `packages/*/src`, `src`, `runtime`, `crypto`, `examples`, `frontend/app/src`, `integration` | Cross-package export and composition audit scope |

## Closed transitional authorities

PR-12 is governance-only and does not extract unrelated runtimes. The following pre-existing roots are therefore registered as transitional implementation owners:

- `packages/authorization-runtime/src`
- `packages/capability-runtime/src`
- `packages/consent-runtime/src`
- `packages/governance-runtime/src`
- `packages/portable-cognition/src`
- `packages/vault-runtime/src`
- `runtime/governance`
- `runtime/marketplace`
- `runtime/monetization`
- `runtime/payout`
- `examples/pmfreak-adapter/src`

This list is an ownership ceiling, not permission to create another root. Changing it requires updating constitutional policy, tests, the violation catalog, and enforcement review. Audit and trust runtime packages are deliberately absent because they are compatibility owners after extraction.

## Fail-closed behavior

Each scanner:

- exits non-zero for every detected violation;
- prints the law ID, law name, file, line, and remediation context;
- exits non-zero if required canonical ownership roots are missing;
- exits non-zero on malformed input or scanner exceptions;
- accepts `--root <path>` solely to run isolated enforcement fixtures.

Generated output, dependencies, coverage output, test fixtures, and test code are excluded from production ownership scans. Tests are separately governed by the constitutional test suite.

## Amendment procedure

A constitutional amendment must:

1. identify the law being changed;
2. explain why an existing composition or ownership authority is insufficient;
3. update the policy, law, matrix, and catalog together;
4. add a failing-before/passing-after scanner fixture;
5. pass `npm run check:aoc-boundaries` and `npm run validate:release`.

An allowlist-only change without policy and test changes is incomplete.
