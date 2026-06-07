import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  EnterpriseAssuranceRuntimeProfile,
} from '@aoc/enterprise/assurance/runtime-profile';
import {
  EnterpriseAssuranceRuntimeCompositionRoot,
  resolveAssuranceRuntimeAdapters,
} from '@aoc/enterprise/assurance/runtime-adapters';
import { AdapterTokens, RuntimeBootstrapEngine } from '@aoc/protocol/runtime-registry';

const root = join(__dirname, '..', '..');
const enterpriseSrc = join(root, 'enterprise', 'src');
const protocolSrc = join(root, 'packages', 'protocol', 'src');

const collectTypeScriptFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTypeScriptFiles(path);
    return entry.isFile() && entry.name.endsWith('.ts') ? [path] : [];
  });

const readImports = (filePath: string): string[] => {
  const source = readFileSync(filePath, 'utf8');
  const specifiers: string[] = [];
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.push(match[1]);
  }
  return specifiers;
};

const enterpriseImports = () => collectTypeScriptFiles(enterpriseSrc).flatMap((file) =>
  readImports(file).map((specifier) => ({ file: relative(root, file), specifier })),
);

describe('Enterprise runtime extraction boundary', () => {
  it('exports the Enterprise Assurance runtime profile', () => {
    expect(EnterpriseAssuranceRuntimeProfile.id).toBe('enterprise.assurance');
    expect(EnterpriseAssuranceRuntimeProfile.requiredTokens).toContain(AdapterTokens.VerificationProvider);
  });

  it('exports the Enterprise Assurance runtime adapter composition surface', () => {
    expect(EnterpriseAssuranceRuntimeCompositionRoot).toBeDefined();
    expect(resolveAssuranceRuntimeAdapters).toBeDefined();
  });

  it('keeps Enterprise implementation construction outside Protocol', () => {
    const protocolSource = collectTypeScriptFiles(protocolSrc)
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');

    expect(protocolSource).not.toMatch(/InMemoryAssuranceEventSink|InMemoryCanonicalTrustRegistry/);
    expect(readFileSync(join(enterpriseSrc, 'assurance', 'runtime-adapter-bootstrap.ts'), 'utf8'))
      .toMatch(/new InMemoryAssuranceEventSink\(\)/);
  });

  it('uses the Protocol registry and bootstrap engine from the Enterprise composition root', () => {
    const compositionSource = readFileSync(
      join(enterpriseSrc, 'assurance', 'runtime-adapter-bootstrap.ts'),
      'utf8',
    );

    expect(RuntimeBootstrapEngine).toBeDefined();
    expect(compositionSource).toMatch(/from '@aoc\/protocol\/runtime-registry'/);
    expect(compositionSource).toMatch(/new RuntimeBootstrapEngine\(/);
  });

  it('has no Protocol source, legacy runtime, or root application imports', () => {
    const violations = enterpriseImports().filter(({ specifier }) =>
      /packages\/protocol\/src|^@aoc\/protocol\/src(?:\/|$)|^@\/aoc\/protocol|^@\/lib|(?:^|\/)src\/(?:app|lib)(?:\/|$)|^(?:\.\.\/)+runtime(?:\/|$)|(?:^|\/)packages\/[^/]*-runtime(?:\/|$)/.test(specifier),
    );

    expect(violations).toEqual([]);
  });
});
