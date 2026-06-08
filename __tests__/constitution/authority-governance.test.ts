import { createConstitutionalFixture, repositoryRoot, writeConstitutionalGovernance } from './fixture';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-authority-governance.mjs'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

describe('constitutional authority governance', () => {
  it('validates the repository authority catalog', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Authority governance scanner passed');
  });

  it('rejects a new runtime authority without an amendment and catalog entry', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeConstitutionalGovernance(fixture, { status: 'Pending', affectedAuthorities: 'None' });
      fixture.write('packages/new-runtime/src/index.ts', 'export class NewRuntime {}\n');
      const result = fixture.run('check-authority-governance.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("runtime or adapter authority root 'packages/new-runtime/src' is not cataloged");
      expect(result.stderr).toContain('no ratified authority amendment exists');
    } finally {
      fixture.cleanup();
    }
  });

  it('accepts a new authority with a ratified amendment and catalog entry', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeConstitutionalGovernance(fixture, { affectedAuthorities: 'New Runtime Authority' });
      fixture.write('packages/new-runtime/src/index.ts', 'export class NewRuntime {}\n');
      const authorities = `\n| new-runtime | \`packages/new-runtime/src\` | Test authority | AOC-AMD-0001 | Not scheduled | Transitional |\n`;
      fixture.write('docs/constitution/CONSTITUTIONAL-AUTHORITIES.md', `${readFileSync(`${fixture.root}/docs/constitution/CONSTITUTIONAL-AUTHORITIES.md`, 'utf8')}${authorities}`);
      const result = fixture.run('check-authority-governance.mjs');
      expect(result.status).toBe(0);
    } finally {
      fixture.cleanup();
    }
  });
});
