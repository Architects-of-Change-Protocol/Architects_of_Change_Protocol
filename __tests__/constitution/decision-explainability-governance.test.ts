import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeDecisionGovernance } from './fixture';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-decision-explainability.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });

describe('decision explainability governance', () => {
  it('validates repository decision explanations', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Decision explainability scanner passed');
  });

  it('rejects approved decisions without explanations', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeDecisionGovernance(fixture, { explanationRows: '' });
      const result = fixture.run('check-decision-explainability.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('DEC-V-003 approved decision DEC-0001 has no explanation');
    } finally { fixture.cleanup(); }
  });
});
