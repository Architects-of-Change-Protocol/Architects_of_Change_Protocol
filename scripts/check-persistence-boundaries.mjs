import { readFileSync } from 'node:fs';

const files = [
  'runtime/trust/service.ts',
  'runtime/access/service.ts',
  'runtime/payout/rlusdPayoutExecutor.service.ts',
  'runtime/usage/service.ts',
  'runtime/audit/service.ts'
];

const violations = [];
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  if (!src.includes('Repository')) {
    violations.push(`${file}: missing repository boundary usage`);
  }
}

if (violations.length) {
  console.error('Persistence boundary check failed:');
  for (const v of violations) console.error(`- ${v}`);
  process.exit(1);
}

console.log('Persistence boundary check passed.');
