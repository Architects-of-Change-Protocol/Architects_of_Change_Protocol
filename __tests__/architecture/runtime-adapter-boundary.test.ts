import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const repositoryRoot = join(__dirname, '..', '..');
const protocolSource = join(repositoryRoot, 'packages', 'protocol', 'src');

const collectTypeScriptFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTypeScriptFiles(path);
    return entry.isFile() && entry.name.endsWith('.ts') ? [path] : [];
  });

const importSpecifiers = (source: string): string[] => {
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  return patterns.flatMap((pattern) => [...source.matchAll(pattern)].map((match) => match[1]));
};

describe('runtime adapter boundary', () => {
  it('prevents Protocol from importing runtime, Enterprise, infrastructure, or external implementations', () => {
    const forbidden = collectTypeScriptFiles(protocolSource).flatMap((file) =>
      importSpecifiers(readFileSync(file, 'utf8'))
        .filter((specifier) =>
          /(^@aoc-runtime\/|^@aoc\/enterprise(?:\/|$)|(^|\/)(?:enterprise|runtime|infrastructure|database|external-sdk)(?:\/|$))/.test(
            specifier,
          ),
        )
        .map((specifier) => ({ file: relative(repositoryRoot, file), specifier })),
    );

    expect(forbidden).toEqual([]);
  });

  it('keeps implementation construction out of the Protocol registry', () => {
    const registrySources = collectTypeScriptFiles(join(protocolSource, 'runtime-registry'))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');

    expect(registrySources).not.toMatch(/new\s+(?:Runtime|Enterprise|InMemory)[A-Z][A-Za-z0-9_]*/);
  });
});
