import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writePolicyGovernance } from './fixture';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-policy-conflicts.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });

describe('policy conflict governance', () => {
  it('validates deterministic repository conflict resolution', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  it('rejects ambiguous incompatible policies', () => {
    const fixture = createConstitutionalFixture();
    try {
      writePolicyGovernance(fixture, {
        policyRows: [
          '| POL-0001 | Baseline | Constitutional | Constitution | CAP-0001–CAP-0004 | Integrity | Require | 10 | 100 | No | AOC-AMD-0001 | Not scheduled | Canonical | Active |',
          '| POL-0002 | Allow Claims | Governance | Constitution | CAP-0002 | Claims | Allow | 20 | 80 | No | AOC-AMD-0001 | Not scheduled | Canonical | Active |',
          '| POL-0003 | Deny Claims | Runtime | Protocol | CAP-0002, CAP-0003 | Claims | Deny | 20 | 80 | No | AOC-AMD-0001 | Not scheduled | Canonical | Active |',
          '| POL-0004 | Operations | Operational | Enterprise | CAP-0004 | Audit | Require | 20 | 60 | Yes | AOC-AMD-0001 | Not scheduled | Canonical | Active |',
        ].join('\n'),
      });
      const result = fixture.run('check-policy-conflicts.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('POL-V-003 POL-0002 and POL-0003 have ambiguous conflicting rules and no unique winner');
    } finally { fixture.cleanup(); }
  });
});
