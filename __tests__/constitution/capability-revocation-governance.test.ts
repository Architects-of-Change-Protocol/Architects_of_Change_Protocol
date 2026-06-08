import { createConstitutionalFixture, repositoryRoot, writeCapabilityGovernance } from './fixture';
import { spawnSync } from 'node:child_process';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-capability-revocation.mjs'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

describe('capability revocation governance', () => {
  it('validates repository capability revocations', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  it('rejects active use descended from a revoked assignment', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeCapabilityGovernance(fixture, {
        assignmentRows: [
          '| CAA-0001 | CAP-0003 | Protocol | Constitution | Root | Revoked | AOC-AMD-0001 |',
          '| CAA-0002 | CAP-0003 | Enterprise | Protocol | CAA-0001 | Delegated | AOC-AMD-0001 |',
        ].join('\n'),
      });
      const result = fixture.run('check-capability-revocation.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('CAP-V-004 revoked assignment CAA-0001 retains active child CAA-0002');
    } finally {
      fixture.cleanup();
    }
  });
});
