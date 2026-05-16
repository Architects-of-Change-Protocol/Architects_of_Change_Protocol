import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('packages/aoc-sdk/src');
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.ts'));
const forbidden = ['/runtime/internal', '/runtime/experimental', '/governance', '/distributed', '/marketplace', '/sovereign-runtime'];
const violations = [];
for (const file of files) {
  const full = path.join(srcDir, file);
  const text = fs.readFileSync(full, 'utf8');
  for (const bad of forbidden) {
    if (text.includes(bad)) violations.push(`${file}: forbidden import pattern ${bad}`);
  }
}
if (violations.length) {
  console.error('SDK import boundary check failed');
  for (const v of violations) console.error(`- ${v}`);
  process.exit(1);
}
console.log('SDK import boundary check passed.');
