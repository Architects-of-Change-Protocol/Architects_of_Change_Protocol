import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writePolicyGovernance } from './fixture';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-policy-hierarchy.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });

describe('policy hierarchy governance', () => {
  it('validates the repository policy hierarchy', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  it('rejects a child policy that weakens its parent', () => {
    const fixture = createConstitutionalFixture();
    try {
      writePolicyGovernance(fixture, {
        policyRows: [
          '| POL-0001 | Parent | Constitutional | Constitution | CAP-0001–CAP-0004 | Integrity | Require | 50 | 100 | No | AOC-AMD-0001 | Not scheduled | Canonical | Active |',
          '| POL-0002 | Child | Governance | Constitution | CAP-0002 | Governance | Require | 20 | 80 | No | AOC-AMD-0001 | Not scheduled | Canonical | Active |',
          '| POL-0003 | Runtime | Runtime | Protocol | CAP-0003 | Evidence | Require | 60 | 70 | No | AOC-AMD-0001 | Not scheduled | Canonical | Active |',
          '| POL-0004 | Operational | Operational | Enterprise | CAP-0004 | Audit | Require | 60 | 60 | Yes | AOC-AMD-0001 | Not scheduled | Canonical | Active |',
        ].join('\n'),
      });
      const result = fixture.run('check-policy-hierarchy.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('POL-V-002 POL-0002 weakens parent POL-0001');
    } finally { fixture.cleanup(); }
  });
});
