import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeDecisionGovernance } from './fixture';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-decision-authorities.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });

describe('decision authority governance', () => {
  it('validates the repository decision authority catalog', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Decision authority scanner passed');
  });

  it('rejects unauthorized decision creation', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeDecisionGovernance(fixture);
      const path = `${fixture.root}/docs/constitution/DECISION-AUTHORITIES.md`;
      fixture.write('docs/constitution/DECISION-AUTHORITIES.md', readFileSync(path, 'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical | Approved |', 'AOC-AMD-9999 | Not scheduled | Canonical | Approved |'));
      const result = fixture.run('check-decision-authorities.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("DEC-V-004 DEC-0001 creation amendment 'AOC-AMD-9999' is not a ratified Type B or Type C amendment");
    } finally { fixture.cleanup(); }
  });
});
