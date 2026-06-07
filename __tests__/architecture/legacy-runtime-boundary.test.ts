import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repositoryRoot = resolve(__dirname, '../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');

describe('PR-11 legacy runtime boundary', () => {
  it('passes the executable compatibility boundary scanner', () => {
    const result = spawnSync(process.execPath, ['scripts/check-legacy-runtime-compatibility.mjs'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Legacy runtime compatibility check passed');
  });

  it.each([
    ['packages/audit-runtime/src/index.ts', '@aoc/enterprise/assurance/audit'],
    ['packages/trust-registry-runtime/src/index.ts', '@aoc/enterprise/assurance/trust'],
    ['runtime/audit/index.ts', '@aoc/enterprise/assurance/audit'],
    ['runtime/trust/index.ts', '@aoc/enterprise/assurance/trust'],
    ['runtime/observability.ts', '@aoc/enterprise/assurance/observability'],
  ])('%s carries deprecation and migration guidance', (path, replacement) => {
    const source = read(path);
    expect(source).toContain('@deprecated');
    expect(source).toContain(replacement);
    expect(source).toContain('Migrate to');
  });

  it('wires the scanner into the aggregate AOC boundary command', () => {
    const packageJson = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
    expect(packageJson.scripts['check:legacy-runtime-compatibility'])
      .toBe('node scripts/check-legacy-runtime-compatibility.mjs');
    expect(packageJson.scripts['check:aoc-boundaries'])
      .toContain('npm run check:legacy-runtime-compatibility');
  });
});
