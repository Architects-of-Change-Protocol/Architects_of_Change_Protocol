# PR-04 Assurance Parity Report

## Compatibility shims

| Historical path | Shim type | Enterprise owner |
|---|---|---|
| `packages/audit-runtime/src/index.ts` | Re-export | `enterprise/src/assurance/audit/signed-audit-runtime.ts` |
| `packages/trust-registry-runtime/src/index.ts` | Re-export | `enterprise/src/assurance/trust/federated-trust-registry.ts` |
| `runtime/audit/service.ts` | Typed compatibility facade | `enterprise/src/assurance/audit/in-memory-audit.ts` |
| `runtime/trust/service.ts` | Re-export | `enterprise/src/assurance/trust/identity-trust-service.ts` |
| `runtime/trust/types.ts` | Type re-export | `enterprise/src/assurance/trust/types.ts` |
| `runtime/observability.ts` | Re-export | `enterprise/src/assurance/observability/runtime-observability.ts` |
| `runtime/logging/logger.ts` | Re-export | `enterprise/src/assurance/observability/runtime-logger.ts` |

## Automated parity coverage

`__tests__/architecture/assurance-extraction-parity.test.ts` validates:

- package shim identity for extracted signed audit, trust, and registry runtimes;
- old/new in-memory audit retention, ordering, cloning, and output equality;
- old/new identity verification outputs and audit side effects;
- old/new trace-context and health snapshot equality under a fixed clock;
- `VerificationProvider` plus `VerificationKeyResolver` behavior;
- `RegistryLookup` plus `TrustRegistryProvider` behavior; and
- all four Protocol observability/event sink seams.

## PR-02 fixture and contract status

The repository's configured Jest suite includes `__tests__/contracts/contract-fixtures.test.ts`, the contract fixture snapshots, all `tests/contracts/**/*.test.ts`, and architecture boundary tests. These are run by the required `npm test -- --runInBand` command.

## Differences

No output differences were found for the exercised old/new paths.

Internal-only structural differences:

1. Hosted audit aggregation now accepts a list of structural event sources inside Enterprise; the historical three-service constructor is preserved by the old facade.
2. Identity verification rules are delegated to `IdentityVerificationEngine`; public result and audit behavior are unchanged.
3. Runtime endpoint vocabulary and version defaults are locally represented in Enterprise observability to avoid importing runtime implementation modules.

## Final command results

This section is finalized after all required commands are run:

- `npm test -- --runInBand`: passed (11 suites, 31 tests, 3 snapshots).
- focused extracted-runtime tests (`runtime/__tests__/auditTrail.test.ts` and `runtime/trust/__tests__/service.test.ts`): passed (2 suites, 19 tests).
- all 27 runtime suites with TypeScript diagnostics disabled so historical suites could execute: 18 suites passed and 9 failed. The failures are outside the extracted modules and are dominated by the pre-existing missing `normalizeReasonCode` reference in `runtime/api/routes.ts`; `controlPlaneHosted.test.ts` also reports the pre-existing `FileControlPlaneStore` constructor failure. The affected Assurance unit suites passed.
- all 27 runtime suites with normal TypeScript diagnostics: could not execute cleanly because excluded historical runtime tests contain existing compile errors in API tests, legacy audit type imports, route typing, and execution lifecycle status coverage. This configured repository does not include those tests in `npm test`.
- `npm run lint:semantic-ownership`: passed.
- `npm run check:runtime-boundaries`: passed.
- `npm run typecheck`: passed.
- `git diff --check`: passed.
