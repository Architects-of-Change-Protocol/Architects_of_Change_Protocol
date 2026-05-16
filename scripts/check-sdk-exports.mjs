import fs from 'node:fs';
const pkg = JSON.parse(fs.readFileSync('packages/aoc-sdk/package.json', 'utf8'));
const required = ['.', './identity', './contracts', './package.json'];
const missing = required.filter((k) => !pkg.exports?.[k]);
if (missing.length) {
  console.error(`Missing SDK exports: ${missing.join(', ')}`);
  process.exit(1);
}
console.log('SDK export map check passed.');
