# Enterprise Package Readiness

## Assurance extraction score

**Enterprise package readiness: 100% for the Assurance extraction scope.**

This score measures ownership, public surface completeness, Protocol dependency direction, package contents, and automated boundary enforcement. It does not claim that every repository runtime domain has been extracted or that packages have been published.

## Readiness evidence

| Category | Status | Evidence |
|---|---|---|
| Package exports | Ready | Eight intentional root/Assurance subpaths are declared. |
| Build configuration | Ready | Enterprise has its own composite `tsconfig.json` and `build` script. |
| Typecheck configuration | Ready | Enterprise has an independent `typecheck` script. |
| Pack dry-run | Ready | `npm pack ./enterprise --dry-run --json` includes only `dist` plus package metadata and resolves every declared export after build. |
| Public surface | Ready | Runtime adapters and runtime profile have explicit subpath exports. |
| Protocol dependency | Ready | Enterprise source imports Protocol only through public `@aoc/protocol/*` exports. |
| Reverse dependency | Ready | Protocol has no Enterprise, implementation-runtime, or infrastructure imports. |
| Default implementations | Ready | In-memory event and trust defaults are constructed only in Enterprise. |
| Composition | Ready | Enterprise uses Protocol's registry/bootstrap engine and retains typed resolution. |
| Boundary automation | Ready | Source scanner and two architecture suites enforce both dependency directions. |
| Legacy wrappers | Classified | Wrappers are retained and documented; deletion is intentionally deferred. |

## Package contents

The package allowlist remains `dist`, preventing source files, repository tests, root application code, and unrelated runtime directories from entering the tarball. The new runtime-adapters index emits JavaScript, declarations, and declaration maps beneath `dist/assurance/runtime-adapters`.

## Build and typecheck status

The canonical checks are:

```bash
npm --prefix enterprise run build
npm --prefix enterprise run typecheck
```

The repository declares TypeScript `^5.9.3`; validation should use the installed repository toolchain. A machine that skips dependency installation may fall back to a global TypeScript version and produce toolchain deprecation errors unrelated to Enterprise source. That environment condition is not an extraction-boundary blocker.

## Protocol dependency status

The Enterprise boundary scanner permits `@aoc/protocol/*` and package-local relative imports. It rejects Protocol source paths, invalid root aliases, application source, legacy runtime relative imports, runtime package source paths, and test-only modules.

## Legacy wrapper status

Compatibility packages and root runtime bridges remain available. They are not dependencies of Enterprise production source. Their consumers can migrate incrementally to the Enterprise public subpaths.

## Extraction blockers

There are **no blockers for Assurance ownership extraction**.

The following release-engineering work remains before independent publication from a different repository:

1. package the repository-level `@aoc-runtime/crypto` project as an installable dependency;
2. declare and version all non-Protocol Enterprise package dependencies for publication;
3. replace monorepo project references with the extracted repository's package build graph; and
4. remove `private: true` only through the release-governance process.

Those items do not require Protocol source or PMFreak application code and therefore do not invalidate the PR-10 package boundary.
