import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeDecisionGovernance } from './fixture';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-decision-evidence.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });

describe('decision evidence governance', () => {
  it('validates repository decision evidence requirements', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Decision evidence scanner passed');
  });

  it('rejects decisions without evidence requirements', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeDecisionGovernance(fixture, { evidenceRows: '| EVID-0002 | DEC-0002 | 1 verified record | Fixture source | Fixture traceability | Fixture integrity | AOC-AMD-0001 | Active |' });
      const result = fixture.run('check-decision-evidence.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("DEC-V-001 DEC-0001 has no evidence requirement 'EVID-0001'");
    } finally { fixture.cleanup(); }
  });
});
