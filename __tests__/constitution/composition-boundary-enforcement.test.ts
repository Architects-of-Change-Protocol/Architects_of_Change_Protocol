import { createConstitutionalFixture, repositoryRoot } from './fixture';
import { spawnSync } from 'node:child_process';

describe('composition boundary enforcement', () => {
  it('passes repository composition and registry governance', () => {
    const result = spawnSync(process.execPath, ['scripts/check-composition-boundaries.mjs'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Composition boundary scanner passed');
  });

  it('rejects registry resolution from a domain service', () => {
    const fixture = createConstitutionalFixture();
    try {
      fixture.write('src/domain/order-service.ts', 'export const load = (registry: any) => registry.resolve("orders");\n');
      const result = fixture.run('check-composition-boundaries.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('LAW-007 Violation');
    } finally {
      fixture.cleanup();
    }
  });

  it.each(['Runtime', 'Adapter', 'Provider'])('rejects new %s implementation construction from a domain service', (suffix) => {
    const fixture = createConstitutionalFixture();
    try {
      fixture.write('src/domain/order-service.ts', `export const create = () => new Order${suffix}();\n`);
      const result = fixture.run('check-composition-boundaries.mjs');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('LAW-006 Violation');
    } finally {
      fixture.cleanup();
    }
  });

  it('permits construction in an explicit composition-root module', () => {
    const fixture = createConstitutionalFixture();
    try {
      fixture.write('src/order-composition-root.ts', 'export const create = () => new OrderRuntime();\n');
      const result = fixture.run('check-composition-boundaries.mjs');
      expect(result.status).toBe(0);
    } finally {
      fixture.cleanup();
    }
  });
});
