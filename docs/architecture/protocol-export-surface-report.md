# Protocol Export Surface Report

## Objective

PR-03 hardens public Protocol import seams without rewriting existing consumers. The goal is to make intended imports explicit and discourage source-level deep imports while preserving current compatibility.

## Public subpaths

| Subpath | Status | Owned content | Runtime leakage review |
|---|---|---|---|
| `@aoc/protocol/contracts` | Existing, preserved | Canonical IDs, capability token/grant, consent grant, policy decision, scoped access request, audit envelope, trust domain identifier | No runtime imports found |
| `@aoc/protocol/claims` | Existing, preserved | Canonical RFC-005 claim, proof, credential, registry, vocabulary, decision, attestation, and verification contracts | No runtime imports found |
| `@aoc/protocol/errors` | Existing, preserved | Public protocol error contract surface | No runtime imports found |
| `@aoc/protocol/adapters` | Added | Protocol-owned interfaces for verification, revocation, registry, audit/security events, policy/governance, execution authorization, and observability seams | Interfaces only; no implementation imports |

## Hardening changes

1. Added `@aoc/protocol/adapters` to package exports so future runtime packages can implement Protocol adapter contracts through a public subpath.
2. Added the same adapter subpath to TypeScript path mapping and Jest module mapping so source tests and internal packages can use the public import path.
3. Kept existing `contracts`, `claims`, and `errors` subpaths unchanged to preserve backward compatibility.
4. Did not rewrite consumer imports, remove shims, move runtime implementations, or delete code.

## Backward compatibility

- Existing subpaths remain stable.
- The package `main` and `types` entries remain unchanged.
- No consumer import rewrites were performed in this PR.
- Deep imports are not removed in this PR; future PRs can add warnings or rewrites after runtime extraction seams are stable.

## Recommended future work

1. Add consumer validation for `@aoc/protocol/adapters` once runtime packages start implementing these interfaces.
2. Add package-tarball checks for the adapter declaration output.
3. Consider a report-only deep-import lint before PR-09 import rewrites.
