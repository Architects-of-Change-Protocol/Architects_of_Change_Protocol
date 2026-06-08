import { createConstitutionalFixture, repositoryRoot } from './fixture';
import { spawnSync } from 'node:child_process';

const runRepositoryScanner = () => spawnSync(process.execPath, ['scripts/check-constitutional-boundaries.mjs'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

describe('constitutional boundary enforcement', () => {
  it('enforces Protocol purity, Enterprise ownership, compatibility ownership, and dependency direction in the repository', () => {
    const result = runRepositoryScanner();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Constitutional boundary scanner passed');
  });

  it('rejects Protocol to Enterprise dependencies with LAW-005', () => {
    const fixture = createConstitutionalFixture();
    try {
      fixture.write('packages/protocol/src/contracts/illegal.ts', "import '@aoc/enterprise';\n");
      const result = fixture.run('check-constitutional-boundaries.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('LAW-005 Violation');
      expect(result.stderr).toContain("Protocol imports Enterprise '@aoc/enterprise'");
    } finally {
      fixture.cleanup();
    }
  });

  it('rejects illegal source imports from a compatibility package with LAW-003', () => {
    const fixture = createConstitutionalFixture();
    try {
      fixture.write('packages/audit-runtime/src/index.ts', "export * from '../../protocol/src/contracts';\n");
      const result = fixture.run('check-constitutional-boundaries.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('LAW-003 Violation');
      expect(result.stderr).toContain('compatibility source imports an illegal owner');
    } finally {
      fixture.cleanup();
    }
  });

  it('rejects behavior ownership in a compatibility package with LAW-003', () => {
    const fixture = createConstitutionalFixture();
    try {
      fixture.write('packages/audit-runtime/src/index.ts', 'export class LegacyAuditRuntime { run() { return true; } }\n');
      const result = fixture.run('check-constitutional-boundaries.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('LAW-003 Violation');
    } finally {
      fixture.cleanup();
    }
  });
});
