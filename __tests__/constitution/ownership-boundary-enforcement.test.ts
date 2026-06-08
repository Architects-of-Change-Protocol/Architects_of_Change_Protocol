import { createConstitutionalFixture, repositoryRoot } from './fixture';
import { spawnSync } from 'node:child_process';

describe('ownership boundary enforcement', () => {
  it('passes the repository ownership inventory', () => {
    const result = spawnSync(process.execPath, ['scripts/check-ownership-boundaries.mjs'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Ownership boundary scanner passed');
  });

  it.each([
    ['runtime owner', 'src/domain/billing.ts', 'export class BillingRuntime {}\n'],
    ['registry owner', 'src/domain/accounts.ts', 'export class AccountRegistry {}\n'],
    ['defaults owner', 'src/domain/profile.ts', 'export const BillingDefaults = {};\n'],
    ['composition owner', 'src/domain/service.ts', 'export class BillingCompositionRoot {}\n'],
  ])('rejects a new %s outside an authorized ownership domain', (_label, path, source) => {
    const fixture = createConstitutionalFixture();
    try {
      fixture.write(path, source);
      const result = fixture.run('check-ownership-boundaries.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('LAW-002 Violation');
      expect(result.stderr).toContain('outside an authorized ownership domain');
    } finally {
      fixture.cleanup();
    }
  });
});
