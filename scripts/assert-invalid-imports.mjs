import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const invalid = ['@aoc/protocol/src/contracts', '@aoc/protocol/internal/foo', '@aoc/protocol/dist/contracts/index.js'];
for (const specifier of invalid) {
  try { require.resolve(specifier); console.error(`Unexpectedly resolved: ${specifier}`); process.exitCode = 1; }
  catch { /* expected */ }
}
if (process.exitCode) process.exit(process.exitCode);
