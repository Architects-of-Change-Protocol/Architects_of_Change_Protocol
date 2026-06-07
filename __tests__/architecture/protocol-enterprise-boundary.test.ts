import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(__dirname, '..', '..');
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

const protocolImports = () => collectTypeScriptFiles(protocolSrc).flatMap((file) =>
  readImports(file).map((specifier) => ({ file: relative(root, file), specifier })),
);

describe('Protocol to Enterprise package boundary', () => {
  it('does not import Enterprise', () => {
    expect(protocolImports().filter(({ specifier }) =>
      /(^@aoc\/enterprise(?:\/|$))|(?:^|\/)enterprise(?:\/|$)/.test(specifier),
    )).toEqual([]);
  });

  it('does not import runtime implementation packages or legacy runtime source', () => {
    expect(protocolImports().filter(({ specifier }) =>
      /(^@aoc-runtime\/)|(?:^|\/)runtime(?:\/|$)|(?:^|\/)packages\/[^/]*-runtime(?:\/|$)/.test(specifier),
    )).toEqual([]);
  });

  it('does not import infrastructure or external implementation modules', () => {
    expect(protocolImports().filter(({ specifier }) =>
      /(?:^|\/)(?:infrastructure|database|db|supabase|external-sdk|persistence|storage|transport)(?:\/|$)/.test(specifier),
    )).toEqual([]);
  });

  it('does not construct Enterprise or in-memory implementations', () => {
    const constructions = collectTypeScriptFiles(protocolSrc).flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return [...source.matchAll(/new\s+((?:Enterprise|InMemory)[A-Za-z0-9_]*)\s*\(/g)]
        .map((match) => ({ file: relative(root, file), implementation: match[1] }));
    });

    expect(constructions).toEqual([]);
  });
});
