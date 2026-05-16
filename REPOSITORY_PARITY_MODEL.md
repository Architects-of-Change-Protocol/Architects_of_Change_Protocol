# Repository Parity Model

All repository implementations MUST preserve canonical runtime semantics:
- key uniqueness is key-based (latest write wins per key);
- append-only event streams preserve insertion order when listed raw;
- query APIs return deterministic filtered/sorted views;
- retention behavior must match configured bounds.

Parity is validated by shared repository contract tests in `runtime/__tests__/repositoryParity.test.ts`.
