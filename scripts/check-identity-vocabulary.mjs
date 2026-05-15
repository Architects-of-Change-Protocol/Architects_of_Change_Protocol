import { readFileSync } from 'node:fs';

const files = ['runtime/api/routes.ts', 'runtime/controlPlane.ts', 'runtime/access/types.ts', 'runtime/trust/types.ts', 'runtime/usage/types.ts'];
const mustContain = {
  'runtime/controlPlane.ts': ['subject_id', 'requester_id'],
  'runtime/access/types.ts': ['subject_hash', 'consumer_id'],
};

const errors = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (!text.includes('canonical') && !text.includes('Canonical')) {
    errors.push(`${file}: missing canonical identity guidance comment/annotation.`);
  }
  for (const token of mustContain[file] ?? []) {
    if (!text.includes(token)) errors.push(`${file}: expected compatibility token '${token}' missing.`);
  }
}

if (errors.length) {
  console.error('Identity vocabulary guardrail failed:');
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log('Identity vocabulary guardrail passed.');
