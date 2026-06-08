import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writePolicyGovernance } from './fixture';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-policy-authorities.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });

describe('policy authority governance', () => {
  it('validates the repository policy authority catalog', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Policy authority scanner passed');
  });

  it('rejects unauthorized policy creation', () => {
    const fixture = createConstitutionalFixture();
    try {
      writePolicyGovernance(fixture);
      const path = `${fixture.root}/docs/constitution/POLICY-AUTHORITIES.md`;
      fixture.write('docs/constitution/POLICY-AUTHORITIES.md', readFileSync(path, 'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical | Active |', 'AOC-AMD-9999 | Not scheduled | Canonical | Active |'));
      const result = fixture.run('check-policy-authorities.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("POL-V-001 POL-0001 creation amendment 'AOC-AMD-9999' is not a ratified Type B or Type C amendment");
    } finally { fixture.cleanup(); }
  });
});
