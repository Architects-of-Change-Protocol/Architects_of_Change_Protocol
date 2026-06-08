import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeCapabilityGovernance } from './fixture';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-capability-authorities.mjs'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

describe('capability authority governance', () => {
  it('validates the repository capability authority catalog', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Capability authority scanner passed');
  });

  it('rejects unauthorized capability creation', () => {
    const fixture = createConstitutionalFixture();
    try {
      writeCapabilityGovernance(fixture);
      const path = `${fixture.root}/docs/constitution/CAPABILITY-AUTHORITIES.md`;
      const catalog = readFileSync(path, 'utf8').replace(
        '| CAP-0004 | Read | Operational | Enterprise | Yes | Yes | AOC-AMD-0001 |',
        '| CAP-9999 | Unratified Power | Operational | Enterprise | Yes | Yes | AOC-AMD-9999 |',
      );
      fixture.write('docs/constitution/CAPABILITY-AUTHORITIES.md', catalog);
      const result = fixture.run('check-capability-authorities.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("CAP-V-001 CAP-9999 creation amendment 'AOC-AMD-9999' is not ratified");
    } finally {
      fixture.cleanup();
    }
  });
});
