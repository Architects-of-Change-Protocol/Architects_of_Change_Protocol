import { readFileSync } from 'node:fs';

const checks = [
  {
    file: 'packages/capability-runtime/src/index.ts',
    forbidden: 'export type CapabilityDecisionReason =',
    message: 'Capability decision reasons must come from @aoc-runtime/shared-types canonical contracts.'
  },
  {
    file: 'packages/consent-runtime/src/index.ts',
    forbidden: '"allowed" | "denied" | "no_grant" | "expired" | "revoked"',
    message: 'Consent reason union must come from canonical contracts.'
  },
  {
    file: 'packages/authorization-runtime/src/index.ts',
    forbidden: '"policy" | "governance" | "capability" | "consent"',
    message: 'Authorization failedStage union must come from canonical contracts.'
  }
];

const failures = checks.filter(({ file, forbidden }) => readFileSync(file, 'utf8').includes(forbidden));
if (failures.length) {
  for (const failure of failures) console.error(`Contract drift: ${failure.message} (${failure.file})`);
  process.exit(1);
}

console.log('Contract drift check passed. Canonical runtime contract types are in use.');
