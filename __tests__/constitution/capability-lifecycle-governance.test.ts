import { createConstitutionalFixture, repositoryRoot, writeCapabilityGovernance } from './fixture';
import { spawnSync } from 'node:child_process';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-capability-governance.mjs'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

describe('capability lifecycle governance', () => {
  it('validates the repository capability lifecycle', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  it('rejects an invalid lifecycle transition', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeCapabilityGovernance(fixture, {
        transitionRows: '| CAT-0001 | CAA-0001 | Revoked | Ratified | Constitution | AOC-AMD-0001 |',
      });
      const result = fixture.run('check-capability-governance.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("CAP-V-007 CAT-0001 contains invalid lifecycle transition 'Revoked' → 'Ratified'");
    } finally {
      fixture.cleanup();
    }
  });
});
