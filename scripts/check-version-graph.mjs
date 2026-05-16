#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const files = execSync("find . -name package.json -not -path './node_modules/*'", { encoding: 'utf8' })
  .trim()
  .split('\n')
  .map(f => f.replace(/^\.\//, ''));

const packages = files
  .map(file => ({ file, json: JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')) }))
  .filter(p => p.json.name);

const byName = new Map(packages.map(p => [p.json.name, p]));
const errors = [];

for (const pkg of packages) {
  const deps = {
    ...(pkg.json.dependencies || {}),
    ...(pkg.json.devDependencies || {}),
    ...(pkg.json.peerDependencies || {}),
    ...(pkg.json.optionalDependencies || {})
  };

  for (const [name, spec] of Object.entries(deps)) {
    if (String(spec).startsWith('workspace:')) {
      errors.push(`${pkg.json.name} uses forbidden workspace protocol for ${name}: ${spec}`);
    }

    if (name.toLowerCase().includes('pmfreak')) {
      errors.push(`${pkg.json.name} depends on PMFreak-like package: ${name}`);
    }

    if (name.startsWith('@aoc') && !byName.has(name)) {
      errors.push(`${pkg.json.name} depends on missing internal package: ${name}`);
    }
  }
}

console.log('Package inventory:');
for (const pkg of packages) {
  console.log(`- ${pkg.json.name}@${pkg.json.version || '0.0.0'} (${pkg.file})`);
}

if (errors.length) {
  console.error('\nVersion graph violations:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nVersion graph check passed.');
