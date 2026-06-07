# Compatibility Wrapper Policy

## Policy statement

A compatibility wrapper preserves an old import path while delegating to a canonical owner. It is a temporary release mechanism and must never become a second implementation layer.

## Required rules

1. Compatibility wrappers may re-export canonical owners.
2. Compatibility wrappers may preserve old API names and signatures when direct re-export is insufficient.
3. Compatibility wrappers may not introduce new behavior.
4. Compatibility wrappers may not own canonical implementation logic, mutable state, defaults, profiles, or registries.
5. Compatibility wrappers must include `@deprecated` guidance naming the canonical replacement.
6. Compatibility wrappers must include an inline migration instruction and, for package wrappers, a README `Migration` section.
7. Compatibility wrappers must have a named retirement owner and an evidence-gated sunset plan.
8. Compatibility wrappers must appear in `legacy-runtime-inventory.md` with their classification and status.
9. Compatibility wrappers must be covered by export/behavior compatibility tests and automated boundary checks.
10. Compatibility wrappers may not import Protocol source paths or PMFreak/application code.
11. Compatibility wrappers may depend on Enterprise public package subpaths. A monorepo-relative Enterprise source path is allowed only for an existing root bridge that cannot yet resolve the package export in its TypeScript project.
12. Compatibility wrappers are frozen: changes are limited to security, compatibility, migration guidance, and removal preparation.

## Permitted forms

Preferred package wrapper:

```ts
/** @deprecated Use `@aoc/enterprise/assurance/audit`. */
export * from '@aoc/enterprise/assurance/audit';
```

Permitted root compatibility facade:

```ts
/** @deprecated Use the Enterprise implementation. */
export class HistoricalConstructorFacade {
  private readonly implementation: EnterpriseImplementation;
  // Methods only translate the historical signature and delegate behavior.
}
```

A facade is permitted only when direct re-export would break an existing constructor or method contract. It must not retain independent state or duplicate algorithms.

## Prohibited forms

- a new runtime class with independent behavior in a legacy package;
- direct imports from `packages/protocol/src`, `@aoc/protocol/src`, or repository `protocol/*` source;
- imports from PMFreak, frontend application code, tests, or fixtures;
- new default adapter selection, registry mutation, persistence, telemetry, or policy decisions;
- wrapper-only exports with no canonical Enterprise equivalent unless explicitly approved as a removal blocker;
- feature work accepted solely on a deprecated path.

## Enforcement

`scripts/check-legacy-runtime-compatibility.mjs` checks the governed Assurance surfaces for Enterprise delegation, prohibited imports, implementation class ownership, deprecation markers, and migration guidance. `legacy-runtime-boundary.test.ts` executes the scanner in the architecture test suite, while `legacy-runtime-compatibility.test.ts` verifies export identity and behavior parity.

Any new compatibility surface must update the scanner manifest, inventory, migration report, sunset plan, and architecture tests in the same change.
