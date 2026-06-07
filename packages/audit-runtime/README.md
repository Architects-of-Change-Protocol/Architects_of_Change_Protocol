# Audit Runtime Compatibility Wrapper

This package is a deprecated compatibility wrapper. Enterprise Assurance owns the canonical implementation, and this package only re-exports that public surface for existing consumers.

## Migration

Replace imports from this package with:

```ts
import { /* existing symbols */ } from '@aoc/enterprise/assurance/audit';
```

No new behavior, implementation classes, or feature ownership may be added here. The Enterprise Assurance maintainers own retirement of this wrapper under `docs/architecture/legacy-runtime-sunset-plan.md`.
