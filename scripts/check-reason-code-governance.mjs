import fs from 'fs';

const source = fs.readFileSync(new URL('../runtime/governance/reason-codes.ts', import.meta.url), 'utf8');
const requiredTokens = [
  'REASON_CODE_CATEGORIES',
  'REASON_CODE_SEVERITIES',
  'REASON_CODE_AUDIENCES',
  'REASON_CODE_LIFECYCLES',
  'canonicalReasonCodeRegistry',
  'legacyReasonCodeAliases',
  'normalizeReasonCode',
  'isSdkSafeReasonCode'
];
const errors = [];
for (const token of requiredTokens) if (!source.includes(token)) errors.push(`missing token: ${token}`);

const codes = [...source.matchAll(/code:\s*'([A-Z0-9_]+)'/g)].map((m) => m[1]);
if (!codes.length) errors.push('no registry codes found');
if (new Set(codes).size !== codes.length) errors.push('duplicate code entries found');
for (const c of codes) if (!/^[A-Z][A-Z0-9_]*$/.test(c)) errors.push(`invalid code naming pattern: ${c}`);

if (errors.length) {
  console.error('reason-code-governance check failed');
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}
console.log(`reason-code-governance check passed (${codes.length} entries)`);
