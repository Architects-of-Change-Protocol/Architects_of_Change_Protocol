import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeDecisionGovernance } from './fixture';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-decision-appeals.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });

describe('decision appeal governance', () => {
  it('validates repository decision appeals', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Decision appeals scanner passed');
  });

  it('rejects appeals against non-appealable decisions', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeDecisionGovernance(fixture, { appealRows: '| APL-0001 | DEC-0001 | Procedural defect | EVID-0001 | Rejected | AOC-AMD-0001 | Resolved |' });
      const result = fixture.run('check-decision-appeals.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("DEC-V-005 APL-0001 targets non-appealable decision 'DEC-0001'");
    } finally { fixture.cleanup(); }
  });


  it('rejects revocations without a constitutional cause', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeDecisionGovernance(fixture, { revocationRows: '| DRV-0001 | DEC-0002 | Convenience | EVID-0002 | Constitution | AOC-AMD-0001 | 2026-06-08 | Revoked |' });
      const result = fixture.run('check-decision-governance.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("DEC-V-009 DRV-0001 has invalid cause 'Convenience'");
    } finally { fixture.cleanup(); }
  });
});
