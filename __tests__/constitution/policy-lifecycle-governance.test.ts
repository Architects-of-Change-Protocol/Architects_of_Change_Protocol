import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writePolicyGovernance } from './fixture';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-policy-governance.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });

describe('policy lifecycle governance', () => {
  it('validates aggregate repository policy governance', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Policy governance scanner passed');
  });

  it('rejects an invalid policy lifecycle transition', () => {
    const fixture = createConstitutionalFixture();
    try {
      writePolicyGovernance(fixture, { lifecycleRows: '| PLT-0001 | POL-0001 | Revoked | Active | AOC-AMD-0001 | 2026-06-08 |' });
      const result = fixture.run('check-policy-governance.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("POL-V-008 PLT-0001 contains invalid lifecycle transition 'Revoked' → 'Active'");
    } finally { fixture.cleanup(); }
  });
});
