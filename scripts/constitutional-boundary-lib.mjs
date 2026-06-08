import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';

export const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const SKIPPED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'coverage', '.next', 'build', '__tests__', 'tests', 'fixtures']);

export const LAW_NAMES = Object.freeze({
  'LAW-001': 'Protocol Purity',
  'LAW-002': 'Enterprise Ownership',
  'LAW-003': 'Compatibility Ownership',
  'LAW-004': 'Public Export Governance',
  'LAW-005': 'Dependency Direction',
  'LAW-006': 'Composition Ownership',
  'LAW-007': 'Runtime Registry Usage',
  'LAW-008': 'Release Governance',
});

export const TRANSITIONAL_RUNTIME_OWNERS = Object.freeze([
  'packages/authorization-runtime/src',
  'packages/capability-runtime/src',
  'packages/consent-runtime/src',
  'packages/governance-runtime/src',
  'packages/portable-cognition/src',
  'packages/vault-runtime/src',
  'runtime/governance',
  'runtime/marketplace',
  'runtime/monetization',
  'runtime/payout',
  'examples/pmfreak-adapter/src',
]);

export const COMPATIBILITY_ROOTS = Object.freeze([
  'packages/audit-runtime/src',
  'packages/trust-registry-runtime/src',
  'runtime/audit',
  'runtime/trust',
  'runtime/observability.ts',
]);

export const AUTHORIZED_COMPOSITION_FILES = Object.freeze([
  'enterprise/src/assurance/runtime-adapter-bootstrap.ts',
  'enterprise/src/assurance/runtime-adapter-resolver.ts',
  'packages/protocol/src/runtime-registry/runtime-bootstrap-engine.ts',
  'runtime/api/routes.ts',
  'runtime/api/server.ts',
  'examples/pmfreak-adapter/src/index.ts',
  'frontend/app/src/lib/runtimeClient.ts',
]);

const extensionOf = (path) => {
  const match = path.match(/(\.d\.ts|\.[^.\/]+)$/);
  return match?.[1] ?? '';
};

export function toPosix(path) {
  return path.split(sep).join('/');
}

export function parseRootArgument(argv = process.argv.slice(2), fallback = process.cwd()) {
  const index = argv.indexOf('--root');
  if (index === -1) return resolve(fallback);
  if (!argv[index + 1]) throw new Error('--root requires a repository path');
  return resolve(argv[index + 1]);
}

export function collectSourceFiles(root) {
  if (!existsSync(root)) return [];
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile() && SOURCE_EXTENSIONS.has(extensionOf(entry.name)) && !entry.name.endsWith('.d.ts')) files.push(path);
    }
  };
  if (statSync(root).isDirectory()) visit(root);
  else if (SOURCE_EXTENSIONS.has(extensionOf(root)) && !root.endsWith('.d.ts')) files.push(root);
  return files;
}

export function repositorySourceFiles(root) {
  const candidates = ['packages', 'enterprise/src', 'src', 'runtime', 'crypto', 'examples', 'frontend/app/src', 'integration'];
  return candidates.flatMap((candidate) => collectSourceFiles(resolve(root, candidate)));
}

export function readModuleSpecifiers(source) {
  const specifiers = [];
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.push({ specifier: match[1], index: match.index ?? 0 });
  }
  return specifiers;
}

export function lineNumber(source, index) {
  return source.slice(0, index).split('\n').length;
}

export function violation(law, file, line, message) {
  return { law, file, line, message };
}

export function formatViolation(item) {
  return `${item.law} Violation (${LAW_NAMES[item.law]}): ${item.file}:${item.line} ${item.message}`;
}

export function runScanner(name, scan, argv = process.argv.slice(2)) {
  let root;
  try {
    root = parseRootArgument(argv);
  } catch (error) {
    console.error(`${name} failed closed: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  let violations;
  try {
    violations = scan(root);
  } catch (error) {
    console.error(`${name} failed closed: ${error.stack ?? error.message}`);
    process.exitCode = 1;
    return;
  }
  if (violations.length > 0) {
    console.error(`${name} failed (${violations.length} violation${violations.length === 1 ? '' : 's'}):`);
    for (const item of violations) console.error(`- ${formatViolation(item)}`);
    process.exitCode = 1;
    return;
  }
  console.log(`${name} passed (repository: ${toPosix(relative(process.cwd(), root) || '.')}).`);
}

export function relativePath(root, path) {
  return toPosix(relative(root, path));
}

export function isWithin(path, prefix) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function workspaceManifests(root) {
  const paths = [];
  for (const directory of ['packages', 'examples']) {
    const parent = resolve(root, directory);
    if (!existsSync(parent)) continue;
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      const manifest = resolve(parent, entry.name, 'package.json');
      if (entry.isDirectory() && existsSync(manifest)) paths.push(manifest);
    }
  }
  for (const candidate of ['enterprise/package.json', 'package.json']) {
    const manifest = resolve(root, candidate);
    if (existsSync(manifest)) paths.push(manifest);
  }
  return paths.map((path) => ({ path, directory: dirname(path), manifest: JSON.parse(readFileSync(path, 'utf8')) }));
}

export function packageNameFromSpecifier(specifier) {
  if (!specifier.startsWith('@')) return specifier.split('/')[0];
  return specifier.split('/').slice(0, 2).join('/');
}

export function packageSubpath(specifier) {
  const name = packageNameFromSpecifier(specifier);
  const suffix = specifier.slice(name.length);
  return suffix ? `.${suffix}` : '.';
}

export function declaredExportKeys(manifest) {
  if (!manifest.exports) return new Set();
  if (typeof manifest.exports === 'string' || Array.isArray(manifest.exports)) return new Set(['.']);
  const keys = Object.keys(manifest.exports);
  return new Set(keys.some((key) => key.startsWith('.')) ? keys : ['.']);
}

export function exportAllows(keys, subpath) {
  if (keys.has(subpath)) return true;
  for (const key of keys) {
    if (!key.includes('*')) continue;
    const [before, after] = key.split('*');
    if (subpath.startsWith(before) && subpath.endsWith(after ?? '')) return true;
  }
  return false;
}
