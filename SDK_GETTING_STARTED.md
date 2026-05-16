# SDK Getting Started

1. Import `createSafeRuntimeClient` from `@aoc/sdk`.
2. Initialize with `mode: 'local'` for local workflows, or `mode: 'remote'` + `apiKey` for hosted runtime.
3. Use typed methods on the returned `HostedRuntimeSdk` for capability, consent/access, and audit/usage APIs.

See `examples/sdk/*.ts`.
