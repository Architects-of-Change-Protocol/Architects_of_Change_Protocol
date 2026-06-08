import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';

export const repositoryRoot = resolve(__dirname, '../..');

export type ConstitutionalFixture = {
  root: string;
  write(path: string, contents: string): void;
  run(script: string, args?: string[]): SpawnSyncReturns<string>;
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
    run: (script, args = []) => spawnSync(process.execPath, [join(repositoryRoot, 'scripts', script), '--root', root, ...args], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    }),
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
};

export const writeConstitutionalGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
  status?: 'Ratified' | 'Pending' | 'Rejected' | 'Superseded';
  affectedLaws?: string;
  affectedAuthorities?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  const status = options.status ?? 'Ratified';
  const affectedLaws = options.affectedLaws ?? 'LAW-008';
  const affectedAuthorities = options.affectedAuthorities ?? 'Constitution';

  fixture.write('docs/constitution/CONSTITUTION.md', `# Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/CONSTITUTION-VERSION-HISTORY.md', `# History\n\n| Version | Date | Amendments | Summary | Breaking Changes |\n|---|---|---|---|---|\n| ${version} | 2026-06-08 | ${amendmentId} | Test amendment | None |\n`);
  fixture.write('docs/constitution/AMENDMENT-PROCEDURE.md', '# Amendment Procedure\n');
  fixture.write('docs/constitution/AMENDMENT-CATALOG.md', `# Amendment Catalog\n\n**Constitution Version:** ${version}\n\n## ${amendmentId} — Test Amendment\n\n- **Amendment ID:** ${amendmentId}\n- **Title:** Test Amendment\n- **Author:** Test\n- **Date:** 2026-06-08\n- **Type:** Type C\n- **Version:** ${version}\n- **Affected Laws:** ${affectedLaws}\n- **Affected Authorities:** ${affectedAuthorities}\n- **Rationale:** Test governance.\n- **Risk Assessment:** Test risk.\n- **Migration Impact:** Test migration.\n- **Ratification Status:** ${status}\n`);

  const canonicalRows = [
    ['Protocol', 'packages/protocol/src', 'Protocol owner', 'Canonical'],
    ['Enterprise', 'enterprise/src', 'Enterprise owner', 'Canonical'],
    ['Compatibility audit', 'packages/audit-runtime/src', 'Compatibility owner', 'Deprecated'],
    ['Compatibility trust', 'packages/trust-registry-runtime/src', 'Compatibility owner', 'Deprecated'],
    ['runtime audit', 'runtime/audit', 'Compatibility owner', 'Deprecated'],
    ['runtime trust', 'runtime/trust', 'Compatibility owner', 'Deprecated'],
    ['runtime observability', 'runtime/observability.ts', 'Compatibility owner', 'Deprecated'],
    ['authorization-runtime', 'packages/authorization-runtime/src', 'Transitional owner', 'Transitional'],
    ['capability-runtime', 'packages/capability-runtime/src', 'Transitional owner', 'Transitional'],
    ['consent-runtime', 'packages/consent-runtime/src', 'Transitional owner', 'Transitional'],
    ['governance-runtime', 'packages/governance-runtime/src', 'Transitional owner', 'Transitional'],
    ['portable-cognition', 'packages/portable-cognition/src', 'Transitional owner', 'Transitional'],
    ['vault-runtime', 'packages/vault-runtime/src', 'Transitional owner', 'Transitional'],
    ['runtime governance', 'runtime/governance', 'Transitional owner', 'Transitional'],
    ['runtime marketplace', 'runtime/marketplace', 'Transitional owner', 'Transitional'],
    ['runtime monetization', 'runtime/monetization', 'Transitional owner', 'Transitional'],
    ['runtime payout', 'runtime/payout', 'Transitional owner', 'Transitional'],
    ['pmfreak-adapter', 'examples/pmfreak-adapter/src', 'Transitional owner', 'Transitional'],
    ['Constitution', 'docs/constitution', 'Constitution owner', 'Canonical'],
    ['bootstrap', 'enterprise/src/assurance/runtime-adapter-bootstrap.ts', 'Composition authority', 'Canonical'],
    ['resolver', 'enterprise/src/assurance/runtime-adapter-resolver.ts', 'Composition authority', 'Canonical'],
    ['engine', 'packages/protocol/src/runtime-registry/runtime-bootstrap-engine.ts', 'Composition authority', 'Canonical'],
    ['routes', 'runtime/api/routes.ts', 'Composition authority', 'Canonical'],
    ['server', 'runtime/api/server.ts', 'Composition authority', 'Canonical'],
    ['adapter', 'examples/pmfreak-adapter/src/index.ts', 'Composition authority', 'Transitional'],
    ['client', 'frontend/app/src/lib/runtimeClient.ts', 'Composition authority', 'Canonical'],
  ];
  const rows = canonicalRows.map(([authority, owner, purpose, authorityStatus]) => `| ${authority} | \`${owner}\` | ${purpose} | ${amendmentId} | Not scheduled | ${authorityStatus} |`).join('\n');
  fixture.write('docs/constitution/CONSTITUTIONAL-AUTHORITIES.md', `# Authorities\n\n**Constitution Version:** ${version}\n\n| Authority | Owner | Purpose | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|\n${rows}\n`);
};
