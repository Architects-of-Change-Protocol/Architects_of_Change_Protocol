# SDK Architecture

The SDK foundation is `packages/aoc-sdk` and is intentionally a thin productization layer over the stable runtime client surface.

- Stable runtime transport and semantics stay in `runtime/sdk/client.ts`.
- SDK wraps that client with safe initialization and curated exports.
- Canonical contracts are imported from `@aoc-runtime/shared-types`.
- Canonical identity normalization is exposed through `normalizeIdentity`.
- Internal and experimental runtime entrypoints are excluded.
