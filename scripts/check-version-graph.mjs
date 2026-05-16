#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const packageFiles = execSync("rg --files -g 'package.json'", { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .filter((f) => !f.startsWith('node_modules/'));

const packages = [];
for (const relFile of packageFiles) {
  const full = path.join(root, relFile);
  const json = JSON.parse(fs.readFileSync(full, 'utf8'));
  if (!json.name) continue;
  packages.push({
    file: relFile,
    dir: path.dirname(relFile),
    name: json.name,
    version: json.version ?? '<missing>',
    private: Boolean(json.private),
    deps: {
      ...(json.dependencies ?? {}),
      ...(json.optionalDependencies ?? {}),
      ...(json.peerDependencies ?? {}),
      ...(json.devDependencies ?? {})
    }
  });
}

const byName = new Map(packages.map((p) => [p.name, p]));
const internalNames = new Set(packages.map((p) => p.name));

const classifySpec = (spec = '') => {
  if (!spec) return 'missing';
  if (spec.startsWith('file:')) return 'file';
  if (spec.startsWith('workspace:')) return 'workspace';
  if (/^(\^|~)?\d+\.\d+\.\d+([-.].+)?$/.test(spec)) return 'semver';
  return 'other';
};

const roleFor = (pkg) => {
  if (pkg.name === '@aoc/protocol') return 'protocol';
  if (pkg.name.startsWith('@aoc/') && pkg.name !== '@aoc/protocol') return 'facade';
  if (pkg.name.startsWith('@aoc-runtime/')) return 'runtime';
  if (pkg.file.startsWith('examples/')) return 'example';
  if (pkg.file.startsWith('frontend/')) return 'app';
  if (pkg.file.startsWith('tests/fixtures/')) return 'fixture';
  return 'other';
};

const errors = [];
const rows = [];

for (const pkg of packages) {
  const role = roleFor(pkg);
  if (pkg.version === '<missing>') errors.push(`${pkg.name}: missing version in ${pkg.file}`);

  for (const [depName, spec] of Object.entries(pkg.deps)) {
    const internal = internalNames.has(depName);
    const specType = classifySpec(spec);
    const targetExists = !internal || byName.has(depName);
    rows.push(`${pkg.name}@${pkg.version} -> ${depName}@${spec} [${specType}]${internal ? ' internal' : ''}`);

    if (depName.toLowerCase().includes('pmfreak')) {
      errors.push(`${pkg.name}: forbidden dependency on PMFreak-like package (${depName})`);
    }
    if (specType === 'workspace') {
      errors.push(`${pkg.name}: workspace protocol not allowed (${depName}: ${spec})`);
    }
    if (internal && !targetExists) {
      errors.push(`${pkg.name}: internal dependency target missing (${depName})`);
    }

    const target = byName.get(depName);
    const targetRole = target ? roleFor(target) : 'external';

    if (role === 'protocol' && ['facade', 'runtime', 'app', 'example'].includes(targetRole)) {
      errors.push(`${pkg.name}: protocol package may not depend on ${depName} (${targetRole})`);
    }
    if (role === 'facade' && targetRole === 'facade') {
      errors.push(`${pkg.name}: facade may not depend on another facade (${depName})`);
    }
    if (role === 'facade' && !['protocol', 'external'].includes(targetRole)) {
      errors.push(`${pkg.name}: facade has invalid dependency target ${depName} (${targetRole})`);
    }
    if (role === 'runtime' && !['protocol', 'facade', 'external'].includes(targetRole)) {
      errors.push(`${pkg.name}: runtime has invalid dependency target ${depName} (${targetRole})`);
    }
  }
}

console.log('Package inventory:');
for (const pkg of packages.sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`- ${pkg.name} | version=${pkg.version} | private=${pkg.private} | role=${roleFor(pkg)} | file=${pkg.file}`);
}
console.log('\nDependency edges:');
for (const row of rows.sort()) console.log(`- ${row}`);

if (errors.length) {
  console.error('\nVersion graph check failed:');
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log('\nVersion graph check passed.');
