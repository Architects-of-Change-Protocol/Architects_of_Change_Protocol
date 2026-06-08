import { createConstitutionalFixture, repositoryRoot, writeConstitutionalGovernance } from './fixture';
import { spawnSync } from 'node:child_process';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-constitutional-versioning.mjs'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

describe('constitutional version governance', () => {
  it('validates repository version history and amendment references', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Constitutional versioning scanner passed');
  });

  it('rejects a current version missing from version history', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeConstitutionalGovernance(fixture, { version: 'v2.0' });
      fixture.write('docs/constitution/CONSTITUTION-VERSION-HISTORY.md', '# History\n\n| v1.0 | 2026-06-08 | AOC-AMD-0001 | Old | None |\n');
      const result = fixture.run('check-constitutional-versioning.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('current Constitution version v2.0 is missing from version history');
    } finally {
      fixture.cleanup();
    }
  });

  it('accepts a tracked version upgrade', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeConstitutionalGovernance(fixture, { version: 'v2.0', amendmentId: 'AOC-AMD-0002' });
      const result = fixture.run('check-constitutional-versioning.mjs');
      expect(result.status).toBe(0);
    } finally {
      fixture.cleanup();
    }
  });
});
