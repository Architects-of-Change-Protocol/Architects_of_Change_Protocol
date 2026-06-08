import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writePolicyGovernance } from './fixture';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-policy-exceptions.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });

describe('policy exception governance', () => {
  it('validates the repository exception registry', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  it('rejects an expired active exception', () => {
    const fixture = createConstitutionalFixture();
    try {
      writePolicyGovernance(fixture, { exceptionRows: '| PEX-0001 | Temporary | Protocol | 30 days | POL-0003 | Require alternate evidence | AOC-AMD-0001 | 2020-01-01 | 2020-01-31 | Active |' });
      const result = fixture.run('check-policy-exceptions.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('POL-V-004 PEX-0001 expired on 2020-01-31');
    } finally { fixture.cleanup(); }
  });
});
