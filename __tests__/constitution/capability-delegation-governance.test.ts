import { createConstitutionalFixture, repositoryRoot, writeCapabilityGovernance } from './fixture';
import { spawnSync } from 'node:child_process';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-capability-delegation.mjs'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

describe('capability delegation governance', () => {
  it('validates repository capability delegations', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  it('rejects delegation of a non-delegable capability', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeCapabilityGovernance(fixture, {
        assignmentRows: [
          '| CAA-0001 | CAP-0001 | Constitution | Constitution | Root | Ratified | AOC-AMD-0001 |',
          '| CAA-0002 | CAP-0001 | Protocol | Constitution | CAA-0001 | Delegated | AOC-AMD-0001 |',
        ].join('\n'),
      });
      const result = fixture.run('check-capability-delegation.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("CAP-V-002 CAA-0002 delegates non-delegable capability 'CAP-0001'");
    } finally {
      fixture.cleanup();
    }
  });
});
