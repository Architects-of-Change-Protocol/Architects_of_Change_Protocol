import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeDecisionGovernance } from './fixture';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-decision-lifecycle.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });

describe('decision lifecycle governance', () => {
  it('validates the repository decision lifecycle', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Decision lifecycle scanner passed');
  });

  it('rejects revoked decision reactivation', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeDecisionGovernance(fixture, { lifecycleRows: '| DLT-0001 | DEC-0001 | Revoked | Approved | AOC-AMD-0001 | 2026-06-08 |' });
      const result = fixture.run('check-decision-lifecycle.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("DEC-V-006 DLT-0001 contains invalid lifecycle transition 'Revoked' → 'Approved'");
    } finally { fixture.cleanup(); }
  });
});
