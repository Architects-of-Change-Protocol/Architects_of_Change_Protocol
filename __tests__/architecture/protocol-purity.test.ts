import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(__dirname, '..', '..');
const protocolSrc = join(root, 'packages', 'protocol', 'src');

const collectTypeScriptFiles = (dir: string): string[] => {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return collectTypeScriptFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.ts') ? [fullPath] : [];
  });
};

const readImports = (filePath: string): string[] => {
  const source = readFileSync(filePath, 'utf8');
  const specifiers: string[] = [];
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      specifiers.push(match[1]);
    }
  }

  return specifiers;
};

const protocolImports = () =>
  collectTypeScriptFiles(protocolSrc).flatMap((filePath) =>
    readImports(filePath).map((specifier) => ({
      file: relative(root, filePath),
      specifier,
    })),
  );

describe('protocol package purity', () => {
  it('has explicit public protocol subpath sources', () => {
    for (const subpath of ['contracts', 'claims', 'errors', 'adapters']) {
      expect(existsSync(join(protocolSrc, subpath, 'index.ts'))).toBe(true);
    }
  });

  it('does not import runtime packages or runtime source from protocol contracts', () => {
    const runtimeImports = protocolImports().filter(({ specifier }) =>
      /(^@aoc-runtime\/|(^|\/)runtime(\/|$)|packages\/(?:.*-runtime|provider-interfaces|shared-types)(\/|$))/.test(specifier),
    );

    expect(runtimeImports).toEqual([]);
  });

  it('does not import enterprise or operations source from protocol contracts', () => {
    const enterpriseImports = protocolImports().filter(({ specifier }) =>
      /(^|\/)(enterprise|operations|pmfreak|api|sdk)(\/|$)|^@aoc\/sdk$|^@aoc\/aoc-sdk$/.test(specifier),
    );

    expect(enterpriseImports).toEqual([]);
  });

  it('does not import observability, persistence, transport, or governance implementations from protocol contracts', () => {
    const implementationImports = protocolImports().filter(({ specifier }) =>
      /(^|\/)(observability|telemetry|persistence|storage|database|db|supabase|transport|http|governance)(\/|$)|governance-runtime/.test(
        specifier,
      ),
    );

    expect(implementationImports).toEqual([]);
  });
});
