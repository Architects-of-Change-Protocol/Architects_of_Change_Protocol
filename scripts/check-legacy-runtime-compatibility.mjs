import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageWrappers = [
  {
    root: resolve(repositoryRoot, 'packages/audit-runtime'),
    entrypoint: 'src/index.ts',
    target: '@aoc/enterprise/assurance/audit',
  },
  {
    root: resolve(repositoryRoot, 'packages/trust-registry-runtime'),
    entrypoint: 'src/index.ts',
    target: '@aoc/enterprise/assurance/trust',
  },
];
const rootBridges = [
  {
    root: resolve(repositoryRoot, 'runtime/audit'),
    entrypoints: ['index.ts', 'service.ts'],
    scanDirectory: true,
    targetPattern: /enterprise\/src\/assurance\/audit/,
  },
  {
    root: resolve(repositoryRoot, 'runtime/trust'),
    entrypoints: ['index.ts', 'service.ts', 'types.ts'],
    scanDirectory: true,
    targetPattern: /enterprise\/src\/assurance\/trust/,
  },
  {
    root: resolve(repositoryRoot, 'runtime'),
    entrypoints: ['observability.ts'],
    targetPattern: /enterprise\/src\/assurance\/observability/,
  },
];

const collectTypeScriptSources = (root) => {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root)) {
    if (entry === 'dist' || entry === 'node_modules' || entry === '__tests__') continue;
    const path = resolve(root, entry);
    if (statSync(path).isDirectory()) files.push(...collectTypeScriptSources(path));
    else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) files.push(path);
  }
  return files;
};

const readModuleSpecifiers = (source) => {
  const specifiers = [];
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

const violations = [];
const report = (file, message) => violations.push(`${relative(repositoryRoot, file)}: ${message}`);
const forbiddenImports = [
  {
    label: 'Protocol source import',
    matches: (specifier) => /(?:^|\/)(?:packages\/protocol\/src|protocol)(?:\/|$)/.test(specifier),
  },
  {
    label: 'Protocol source subpath',
    matches: (specifier) => /^@aoc\/protocol\/src(?:\/|$)/.test(specifier),
  },
  {
    label: 'PMFreak application import',
    matches: (specifier) => /(?:^|\/)(?:examples\/pmfreak-adapter|pmfreak|frontend\/app)(?:\/|$)/i.test(specifier),
  },
];

const allSources = new Set();
for (const wrapper of packageWrappers) {
  const entrypoint = resolve(wrapper.root, wrapper.entrypoint);
  const readme = resolve(wrapper.root, 'README.md');
  for (const file of collectTypeScriptSources(resolve(wrapper.root, 'src'))) allSources.add(file);

  if (!existsSync(entrypoint)) {
    report(entrypoint, 'missing compatibility entrypoint');
    continue;
  }
  const source = readFileSync(entrypoint, 'utf8');
  if (!source.includes('@deprecated')) report(entrypoint, 'missing @deprecated marker');
  if (!source.includes('Migrate to')) report(entrypoint, 'missing inline migration guidance');
  if (!source.includes(`export * from '${wrapper.target}'`)) {
    report(entrypoint, `must re-export canonical owner '${wrapper.target}'`);
  }
  if (!existsSync(readme) || !/## Migration/.test(readFileSync(readme, 'utf8'))) {
    report(readme, 'missing Migration section');
  }
}

for (const bridge of rootBridges) {
  const bridgeSources = [];
  if (bridge.scanDirectory) {
    for (const file of collectTypeScriptSources(bridge.root)) allSources.add(file);
  }
  for (const entrypointName of bridge.entrypoints) {
    const entrypoint = resolve(bridge.root, entrypointName);
    if (!existsSync(entrypoint)) {
      report(entrypoint, 'missing compatibility bridge entrypoint');
      continue;
    }
    allSources.add(entrypoint);
    bridgeSources.push(readFileSync(entrypoint, 'utf8'));
    const source = bridgeSources.at(-1);
    if (!source.includes('@deprecated')) report(entrypoint, 'missing @deprecated marker');
    if (!source.includes('Migrate to')) report(entrypoint, 'missing inline migration guidance');
  }
  if (!bridgeSources.flatMap(readModuleSpecifiers).some((specifier) => bridge.targetPattern.test(specifier))) {
    report(resolve(bridge.root, bridge.entrypoints[0]), 'does not delegate to its Enterprise Assurance owner');
  }
}

for (const file of allSources) {
  const source = readFileSync(file, 'utf8');
  for (const specifier of readModuleSpecifiers(source)) {
    for (const rule of forbiddenImports) {
      if (rule.matches(specifier)) report(file, `${rule.label} '${specifier}'`);
    }
  }

  const classNames = [...source.matchAll(/\bexport\s+class\s+([A-Za-z_$][\w$]*)/g)].map((match) => match[1]);
  if (classNames.length > 0) {
    const isExplicitDelegatingFacade = source.includes('Compatibility facade')
      && source.includes('private readonly implementation')
      && /enterprise\/src\/assurance\//.test(source)
      && source.includes('@deprecated');
    if (!isExplicitDelegatingFacade) {
      report(file, `defines implementation class(es) ${classNames.join(', ')} instead of delegating to Enterprise`);
    }
  }
}

if (violations.length > 0) {
  console.error('Legacy runtime compatibility check failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Legacy runtime compatibility check passed (${allSources.size} wrapper source files, ${packageWrappers.length + rootBridges.length} governed surfaces).`);
