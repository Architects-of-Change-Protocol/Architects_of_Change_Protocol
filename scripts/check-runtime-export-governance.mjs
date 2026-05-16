import fs from 'node:fs';

const runtimeIndex = fs.readFileSync(new URL('../runtime/index.ts', import.meta.url), 'utf8');
const disallowedPublicExports = [
  "export * from './governance'",
  "export * from './distributed'",
  "export * from './capabilities'",
  "export * from './attestations'",
  "export * from './execution-fabric'",
  "export * from './sovereign-runtime'",
  "export * from './marketplace'",
];

const violations = disallowedPublicExports.filter((entry) => runtimeIndex.includes(entry));

const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const requiredExports = ['.', './runtime', './runtime/internal', './runtime/experimental'];
const missingExports = requiredExports.filter((key) => !packageJson.exports || !(key in packageJson.exports));

if (violations.length || missingExports.length) {
  console.error('Runtime export governance violations detected.');
  if (violations.length) {
    console.error('Disallowed exports present in runtime/index.ts:');
    for (const violation of violations) console.error(` - ${violation}`);
  }
  if (missingExports.length) {
    console.error('Missing package.json exports keys:');
    for (const key of missingExports) console.error(` - ${key}`);
  }
  process.exit(1);
}

console.log('Runtime export governance checks passed.');
