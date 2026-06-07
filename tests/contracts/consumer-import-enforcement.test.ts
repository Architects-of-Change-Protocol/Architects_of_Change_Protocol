import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

const repositoryRoot = resolve(__dirname, '../..');
const approvedProtocolImports = new Set([
  '@aoc/protocol/adapters',
  '@aoc/protocol/claims',
  '@aoc/protocol/contracts',
  '@aoc/protocol/errors',
  '@aoc/protocol/runtime-registry',
]);
const ignoredDirectories = new Set(['.git', 'coverage', 'dist', 'node_modules']);
const sourceExtensions = /\.(?:[cm]?[jt]sx?)$/;
const legacyImplementationFiles = new Set(
  [
    'src/adapters/interfaces.ts',
    'src/agents/types.ts',
    'src/audit/types.ts',
    'src/capabilities/types.ts',
    'src/consent/types.ts',
    'src/contracts/capability-claims.ts',
    'src/decisions/types.ts',
    'src/delegations/types.ts',
    'src/errors/contracts.ts',
    'src/policies/types.ts',
  ].map((path) => resolve(repositoryRoot, path)),
);

type ImportViolation = {
  consumer: string;
  line: number;
  importPath: string;
  reason: string;
};

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    if (ignoredDirectories.has(entry)) return [];
    const path = join(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return collectSourceFiles(path);
    return sourceExtensions.test(entry) ? [path] : [];
  });
}

function resolveRelativeImport(consumer: string, importPath: string): string | undefined {
  if (!importPath.startsWith('.')) return undefined;
  const base = resolve(dirname(consumer), importPath);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, join(base, 'index.ts'), join(base, 'index.tsx')];
  return candidates.find((candidate) => {
    try {
      return statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
}

function violationReason(consumer: string, importPath: string): string | undefined {
  if (importPath.startsWith('@aoc/protocol/') && !approvedProtocolImports.has(importPath)) {
    return 'Protocol package import is not an approved ownership surface';
  }
  if (/^(?:\.\.?\/)*(?:packages\/)?protocol\/src(?:\/|$)/.test(importPath)) {
    return 'Protocol source deep import';
  }

  const resolvedImport = resolveRelativeImport(consumer, importPath);
  if (resolvedImport?.startsWith(resolve(repositoryRoot, 'packages/protocol/src') + '/')) {
    return 'Relative Protocol package source import';
  }
  if (resolvedImport && legacyImplementationFiles.has(resolvedImport)) {
    return 'Legacy Protocol implementation import';
  }
  return undefined;
}

function collectImportSpecifiers(file: string): Array<{ importPath: string; line: number }> {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const imports: Array<{ importPath: string; line: number }> = [];

  function visit(node: ts.Node): void {
    let specifier: ts.StringLiteralLike | undefined;
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      specifier = node.moduleSpecifier;
    } else if (ts.isCallExpression(node) && node.arguments.length === 1 && ts.isStringLiteralLike(node.arguments[0])) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
        specifier = node.arguments[0];
      }
    }

    if (specifier) {
      imports.push({
        importPath: specifier.text,
        line: source.getLineAndCharacterOfPosition(specifier.getStart(source)).line + 1,
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return imports;
}

function auditConsumerImports(): ImportViolation[] {
  return collectSourceFiles(repositoryRoot)
    .filter(
      (file) =>
        !file.startsWith(resolve(repositoryRoot, 'packages/protocol') + '/') &&
        file !== resolve(repositoryRoot, 'src/index.ts'),
    )
    .flatMap((consumer) =>
      collectImportSpecifiers(consumer).flatMap(({ importPath, line }) => {
        const reason = violationReason(consumer, importPath);
        return reason
          ? [{ consumer: relative(repositoryRoot, consumer), line, importPath, reason }]
          : [];
      }),
    );
}

describe('consumer Protocol imports', () => {
  it('reports deep and legacy imports without enforcing them in phase 1', () => {
    const violations = auditConsumerImports();
    if (violations.length > 0) {
      console.warn(
        `Protocol consumer import report (${violations.length} violation${violations.length === 1 ? '' : 's'}):\n` +
          violations
            .map(({ consumer, line, importPath, reason }) => `- ${consumer}:${line} ${importPath} (${reason})`)
            .join('\n'),
      );
    }

    // Phase 1 deliberately remains report-only. A future migration PR can
    // replace this assertion with expect(violations).toHaveLength(0).
    expect(Array.isArray(violations)).toBe(true);
  });
});
