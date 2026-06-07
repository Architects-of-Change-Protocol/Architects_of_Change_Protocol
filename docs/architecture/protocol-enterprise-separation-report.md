# Protocol–Enterprise Separation Report

## What Protocol owns

Protocol owns the portable semantic and runtime bootstrap model:

- contracts, claims, and errors;
- adapter interfaces and canonical adapter tokens;
- adapter registry behavior and validation errors;
- runtime profile and validation-mode contracts;
- low-level adapter bootstrap and shared bootstrap engine; and
- composition-root, composition-options, composition-result, and startup-report contracts.

Protocol does not select or construct Assurance implementations.

## What Enterprise owns

Enterprise owns the Assurance implementation layer:

- audit, verification, trust, and observability implementations;
- in-memory Assurance defaults;
- the Enterprise Assurance runtime profile;
- registration of defaults and caller overrides;
- typed runtime adapter resolution; and
- the Enterprise Assurance composition root.

## What remains shared

The monorepo still supplies build orchestration, TypeScript configuration, shared types, crypto utilities, tests, and release tooling. Sharing repository infrastructure does not transfer semantic or implementation ownership back into Protocol.

## What remains legacy

The following remain intentionally available:

- `packages/audit-runtime` and `packages/trust-registry-runtime` compatibility packages;
- root `runtime/audit`, `runtime/trust`, and `runtime/observability.ts` bridges; and
- other root/package runtime domains outside the Assurance extraction scope.

They are classified in the Enterprise boundary report and are not imported by Enterprise production source.

## What is now enforceable

PR-10 makes these rules executable:

1. Enterprise must expose the eight approved package surfaces.
2. Enterprise must consume Protocol through public package subpaths.
3. Enterprise must not reach into Protocol source, root application code, legacy runtime source, runtime package source, or test fixtures.
4. Protocol must not import Enterprise, implementation runtimes, infrastructure, storage, transport, or external implementation modules.
5. Protocol must not construct `Enterprise*` or `InMemory*` implementations.
6. Enterprise's composition root must continue to use Protocol's registry/bootstrap engine.

## Future extraction work

Future PRs should address, independently and without widening Protocol ownership:

1. migrate consumers from audit/trust compatibility wrappers;
2. package shared crypto for standalone Enterprise publication;
3. extract Governance runtime implementations;
4. extract Execution runtime implementations;
5. extract remaining observability/application runtime bridges; and
6. establish independent package release/version policy for Enterprise.

## Separation conclusion

Protocol is implementation-free for the audited Assurance scope. Enterprise is the explicit owner of Assurance implementations, defaults, profile, typed resolver, and composition root. The dependency edge is one-way from Enterprise to Protocol public exports, and automated checks now prevent regression.
