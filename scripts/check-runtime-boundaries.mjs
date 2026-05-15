import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const root = process.cwd();
const files = ['runtime/index.ts', 'runtime/api/routes.ts'];

const errors = [];

for (const file of files) {
  const src = readFileSync(resolve(root, file), 'utf8');
  for (const match of src.matchAll(/from ['"](\.{1,2}\/[^'"]+)['"]/g)) {
    const spec = match[1];
    const base = resolve(root, dirname(file), spec);
    const candidates = [
      `${base}.ts`,
      `${base}.tsx`,
      resolve(base, 'index.ts'),
      resolve(base, 'index.tsx'),
    ];
    if (!candidates.some((c) => existsSync(c))) {
      errors.push(`${file}: missing module '${spec}'`);
    }
  }

  for (const match of src.matchAll(/export\s+\*\s+from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
    const spec = match[1];
    const base = resolve(root, dirname(file), spec);
    const candidates = [`${base}.ts`, resolve(base, 'index.ts')];
    if (!candidates.some((c) => existsSync(c))) {
      errors.push(`${file}: dead re-export '${spec}'`);
    }
  }
}

if (errors.length > 0) {
  console.error('Runtime boundary integrity check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Runtime boundary integrity check passed.');
