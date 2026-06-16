import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const repoRoot = resolve(__dirname, '../..');
const frontendPagesDir = resolve(repoRoot, 'frontend/app/src/pages');
const frontendRuntimeConsumerPath = resolve(repoRoot, 'frontend/app/src/aoc/runtime-consumer.ts');
const runtimeConsumerPath = resolve(repoRoot, 'src/aoc/runtime-consumer.ts');

function collectTsFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return collectTsFiles(fullPath);
    if (/\.tsx?$/.test(entry)) return [fullPath];
    return [];
  });
}

function getImports(file: string): string[] {
  const src = readFileSync(file, 'utf8');
  const importRe = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(src)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

describe('authorization boundary', () => {
  it('app routes use runtime-consumer authority boundary', () => {
    const pages = collectTsFiles(frontendPagesDir);
    const violations: string[] = [];
    for (const page of pages) {
      const imports = getImports(page);
      for (const imp of imports) {
        // Identity/authority constants must not be imported from runtimeClient
        if (imp.includes('runtimeClient') && imp !== '../aoc/runtime-consumer') {
          const src = readFileSync(page, 'utf8');
          // Only flag if the page imports authority symbols from runtimeClient
          if (/MOCK_SUBJECT_ID|MOCK_REQUESTER_ID|authorityBoundary|resolveRole/.test(src)) {
            const hasRuntimeConsumer = imports.some((i) => i.includes('runtime-consumer'));
            if (!hasRuntimeConsumer) {
              violations.push(
                `${relative(repoRoot, page)} imports authority symbols from ${imp} instead of aoc/runtime-consumer`,
              );
            }
          }
        }
      }
    }
    expect(violations).toHaveLength(0);
  });

  it('runtime-consumer imports only approved boundaries', () => {
    expect(existsSync(runtimeConsumerPath)).toBe(true);
    expect(existsSync(frontendRuntimeConsumerPath)).toBe(true);

    for (const consumerPath of [runtimeConsumerPath, frontendRuntimeConsumerPath]) {
      const src = readFileSync(consumerPath, 'utf8');
      const importRe = /(?:import|from)\s+['"]([^'"]+)['"]/g;
      const deepProtocolImports: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = importRe.exec(src)) !== null) {
        const imp = m[1];
        if (imp.startsWith('@aoc/protocol/') || /packages\/protocol\/src/.test(imp)) {
          deepProtocolImports.push(imp);
        }
      }
      expect(deepProtocolImports).toHaveLength(0);
    }
  });
});
