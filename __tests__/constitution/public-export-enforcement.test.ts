import { createConstitutionalFixture, repositoryRoot } from './fixture';
import { spawnSync } from 'node:child_process';

describe('public export governance enforcement', () => {
  it('passes all repository package imports through declared exports', () => {
    const result = spawnSync(process.execPath, ['scripts/check-public-export-governance.mjs'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Public export governance scanner passed');
  });

  it.each([
    ["import '@aoc/protocol/src/contracts';\n", 'deep/internal package import'],
    ["import '@aoc/protocol/private/claims';\n", 'deep/internal package import'],
    ["import '@aoc/protocol/not-exported';\n", 'is not declared'],
  ])('rejects ungoverned consumption: %s', (source, expected) => {
    const fixture = createConstitutionalFixture();
    try {
      fixture.write('src/consumer.ts', source);
      const result = fixture.run('check-public-export-governance.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('LAW-004 Violation');
      expect(result.stderr).toContain(expected);
    } finally {
      fixture.cleanup();
    }
  });
});
