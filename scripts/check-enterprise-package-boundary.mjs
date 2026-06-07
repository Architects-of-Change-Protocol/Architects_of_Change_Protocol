import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const enterpriseRoot = resolve(repositoryRoot, 'enterprise');
const sourceRoot = resolve(enterpriseRoot, 'src');

const collectSourceFiles = (directory) => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return entry.isFile() && /\.(?:ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(entry.name) ? [path] : [];
  });

const readModuleSpecifiers = (source) => {
  const specifiers = [];
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.push(match[1]);
  }
  return specifiers;
};

const forbiddenImports = [
  { label: 'Protocol source import', matches: (specifier) => /(?:^|\/)packages\/protocol\/src(?:\/|$)/.test(specifier) },
  { label: 'Protocol source subpath', matches: (specifier) => /^@aoc\/protocol\/src(?:\/|$)/.test(specifier) },
  { label: 'invalid Protocol alias', matches: (specifier) => /^@\/aoc\/protocol(?:\/|$)/.test(specifier) },
  { label: 'repository lib alias', matches: (specifier) => /^@\/lib(?:\/|$)/.test(specifier) },
  { label: 'application source import', matches: (specifier) => /(?:^|\/)src\/(?:app|lib)(?:\/|$)/.test(specifier) },
  { label: 'legacy runtime relative import', matches: (specifier) => /^(?:\.\.\/)+(?:runtime)(?:\/|$)/.test(specifier) },
  { label: 'legacy runtime package source', matches: (specifier) => /(?:^|\/)packages\/[^/]*-runtime(?:\/|$)/.test(specifier) },
  { label: 'test-only source import', matches: (specifier) => /(?:^|\/)(?:__tests__|tests?|fixtures?)(?:\/|$)/.test(specifier) },
];

const violations = [];
for (const file of collectSourceFiles(sourceRoot)) {
  const displayPath = relative(repositoryRoot, file);
  for (const specifier of readModuleSpecifiers(readFileSync(file, 'utf8'))) {
    for (const rule of forbiddenImports) {
      if (rule.matches(specifier)) violations.push(`${displayPath}: ${rule.label} '${specifier}'`);
    }
  }
}

const packageJson = JSON.parse(readFileSync(resolve(enterpriseRoot, 'package.json'), 'utf8'));
const requiredExports = [
  '.',
  './assurance',
  './assurance/audit',
  './assurance/verification',
  './assurance/trust',
  './assurance/observability',
  './assurance/runtime-adapters',
  './assurance/runtime-profile',
];
for (const subpath of requiredExports) {
  if (!packageJson.exports?.[subpath]) violations.push(`enterprise/package.json: missing public export '${subpath}'`);
}

if (violations.length > 0) {
  console.error('Enterprise package boundary check failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Enterprise package boundary check passed (${collectSourceFiles(sourceRoot).length} source files, ${requiredExports.length} public exports).`);
