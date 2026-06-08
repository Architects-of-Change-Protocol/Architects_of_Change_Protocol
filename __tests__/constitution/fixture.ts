import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';

export const repositoryRoot = resolve(__dirname, '../..');

export type ConstitutionalFixture = {
  root: string;
  write(path: string, contents: string): void;
  run(script: string): SpawnSyncReturns<string>;
  cleanup(): void;
};

export const createConstitutionalFixture = (): ConstitutionalFixture => {
  const root = mkdtempSync(join(tmpdir(), 'aoc-constitution-'));
  const write = (path: string, contents: string) => {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents);
  };

  write('package.json', JSON.stringify({ name: 'fixture-root', private: true, workspaces: ['packages/*', 'enterprise'] }));
  write('packages/protocol/package.json', JSON.stringify({
    name: '@aoc/protocol',
    exports: {
      './contracts': './dist/contracts/index.js',
      './runtime-registry': './dist/runtime-registry/index.js',
    },
  }));
  write('packages/protocol/src/contracts/index.ts', 'export type Contract = { id: string };\n');
  write('packages/protocol/src/runtime-registry/index.ts', 'export interface RegistryContract { resolve(token: string): unknown }\n');
  write('enterprise/package.json', JSON.stringify({
    name: '@aoc/enterprise',
    exports: { '.': './dist/index.js', './assurance': './dist/assurance/index.js' },
  }));
  write('enterprise/src/index.ts', "export * from './assurance';\n");
  write('enterprise/src/assurance/index.ts', 'export const assurance = true;\n');
  write('enterprise/src/assurance/runtime-adapter-bootstrap.ts', 'export class EnterpriseAssuranceRuntimeCompositionRoot {}\n');

  return {
    root,
    write,
    run: (script) => spawnSync(process.execPath, [join(repositoryRoot, 'scripts', script), '--root', root], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    }),
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
};
