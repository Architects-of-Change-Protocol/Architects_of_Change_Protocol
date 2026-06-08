import { createConstitutionalFixture, repositoryRoot, writeConstitutionalGovernance } from './fixture';
import { spawnSync } from 'node:child_process';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-constitutional-amendments.mjs'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

describe('constitutional amendment governance', () => {
  it('accepts the repository amendment record and constitutional artifacts', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Constitutional amendment scanner passed');
  });

  it('rejects a law modification without an amendment', () => {
    const fixture = createConstitutionalFixture();
    try {
      fixture.write('docs/constitution/ARCHITECTURAL-LAWS.md', '# Changed laws\n');
      const result = fixture.run('check-constitutional-amendments.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('protected constitutional files changed without a ratified amendment record');
    } finally {
      fixture.cleanup();
    }
  });

  it('accepts a law modification authorized by a ratified amendment', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeConstitutionalGovernance(fixture, { affectedLaws: 'LAW-001', affectedAuthorities: 'Constitution' });
      fixture.write('docs/constitution/ARCHITECTURAL-LAWS.md', '# Changed laws\n');
      const result = fixture.run('check-constitutional-amendments.mjs');
      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');
    } finally {
      fixture.cleanup();
    }
  });
});
