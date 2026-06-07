import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const canonicalImplementations = [
  'EnterpriseVerificationProvider',
  'InMemoryVerificationKeyResolver',
  'InMemoryCanonicalTrustRegistry',
  'InMemoryAssuranceEventSink',
  'InMemoryAuditEventSink',
] as const;

const repositoryRoot = resolve(__dirname, '..', '..');
const protocolSource = resolve(repositoryRoot, 'packages/protocol/src');

const scanRoots = ['enterprise/src', 'runtime', 'packages', '__tests__'] as const;

const collectTypeScriptFiles = (directory: string): string[] => readdirSync(resolve(process.cwd(), directory), {
  withFileTypes: true,
}).flatMap((entry) => {
  const relativePath = `${directory}/${entry.name}`;
  if (entry.isDirectory()) {
    if (entry.name === 'dist' || entry.name === 'node_modules') return [];
    return collectTypeScriptFiles(relativePath);
  }
  return entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts') ? [relativePath] : [];
});


const importSpecifiers = (source: string): string[] => {
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  return patterns.flatMap((pattern) => [...source.matchAll(pattern)].map((match) => match[1]));
};

type Classification = 'Allowed composition root' | 'Allowed test fixture' | 'Forbidden runtime consumer direct wiring';

const classify = (file: string): Classification => {
  if (file === 'enterprise/src/assurance/runtime-adapter-bootstrap.ts') return 'Allowed composition root';
  if (file.includes('/__tests__/') || file.startsWith('__tests__/')) return 'Allowed test fixture';
  return 'Forbidden runtime consumer direct wiring';
};

describe('runtime adapter direct-wiring boundary', () => {
  it('prevents Protocol from importing runtime, Enterprise, infrastructure, or external implementations', () => {
    const forbidden = collectTypeScriptFiles(relative(process.cwd(), protocolSource)).flatMap((file) =>
      importSpecifiers(readFileSync(resolve(process.cwd(), file), 'utf8'))
        .filter((specifier) =>
          /(^@aoc-runtime\/|^@aoc\/enterprise(?:\/|$)|(^|\/)(?:enterprise|runtime|infrastructure|database|external-sdk)(?:\/|$))/.test(
            specifier,
          ),
        )
        .map((specifier) => ({ file: relative(repositoryRoot, resolve(process.cwd(), file)), specifier })),
    );

    expect(forbidden).toEqual([]);
  });

  it('keeps implementation construction out of the Protocol registry', () => {
    const registrySources = collectTypeScriptFiles('packages/protocol/src/runtime-registry')
      .map((file) => readFileSync(resolve(process.cwd(), file), 'utf8'))
      .join('\n');

    expect(registrySources).not.toMatch(
      /new\s+(?:Runtime(?!AdapterBootstrap)|Enterprise|InMemory)[A-Z][A-Za-z0-9_]*/,
    );
  });

  it('classifies canonical implementation construction and rejects runtime-consumer wiring', () => {
    const findings = scanRoots.flatMap(collectTypeScriptFiles).flatMap((file) => {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8');
      return canonicalImplementations
        .filter((implementation) => source.includes(`new ${implementation}`))
        .map((implementation) => ({ file, implementation, classification: classify(file) }));
    });

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        file: 'enterprise/src/assurance/runtime-adapter-bootstrap.ts',
        classification: 'Allowed composition root',
      }),
      expect.objectContaining({
        file: '__tests__/architecture/runtime-adapter-migration.test.ts',
        classification: 'Allowed test fixture',
      }),
    ]));
    expect(findings.filter(({ classification }) => classification === 'Forbidden runtime consumer direct wiring'))
      .toEqual([]);
  });

  it('keeps adapter resolution out of Enterprise domain implementation modules', () => {
    const domainFiles = [
      'enterprise/src/assurance/verification/canonical-verification.ts',
      'enterprise/src/assurance/trust/canonical-trust-registry.ts',
      'enterprise/src/assurance/observability/protocol-event-sinks.ts',
    ];

    for (const file of domainFiles) {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8');
      expect(source).not.toContain('AdapterRegistry');
      expect(source).not.toContain('.resolve(AdapterTokens.');
    }
  });
});
