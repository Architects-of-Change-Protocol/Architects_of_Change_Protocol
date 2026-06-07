#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const writeReports = process.argv.includes('--write');

const canonicalSurfaces = {
  contracts: 'packages/protocol/src/contracts/index.ts',
  claims: 'packages/protocol/src/claims/index.ts',
  errors: 'packages/protocol/src/errors/index.ts',
  adapters: 'packages/protocol/src/adapters/index.ts',
};

const legacySurfaces = [
  { path: 'src/capabilities/types.ts', exportPath: 'legacy capabilities', target: 'contracts' },
  { path: 'src/policies/types.ts', exportPath: 'legacy policies', target: 'contracts' },
  { path: 'src/delegations/types.ts', exportPath: 'legacy delegations', target: 'contracts' },
  { path: 'src/agents/types.ts', exportPath: 'actor-model', target: 'contracts' },
  { path: 'src/audit/types.ts', exportPath: 'legacy audit contracts', target: 'contracts' },
  { path: 'src/consent/types.ts', exportPath: 'legacy consent contracts', target: 'contracts' },
  { path: 'src/decisions/types.ts', exportPath: 'legacy decision contracts', target: 'contracts' },
  { path: 'src/contracts/capability-claims.ts', exportPath: 'contracts/capability-claims', target: 'claims' },
  { path: 'src/errors/contracts.ts', exportPath: 'legacy errors', target: 'errors' },
  { path: 'src/adapters/interfaces.ts', exportPath: 'ports/*', target: 'adapters' },
];

const renamedSymbols = new Map([
  ['adapters:PolicyDecisionAdapter', 'PolicyDecisionProvider'],
  ['adapters:CapabilityRegistryAdapter', 'CapabilityLookup'],
  ['adapters:DelegationStoreAdapter', 'RegistryLookup'],
  ['adapters:AuditSinkAdapter', 'AuditEventSink'],
  ['adapters:IdentityResolverAdapter', 'RegistryLookup'],
  ['adapters:AgentAccessEvaluatorAdapter', 'ExecutionAuthorizationProvider'],
]);

const actorModelInventory = [
  'Actor',
  'ActorId',
  'ActorReference',
  'ActorContext',
  'ActorType',
  'ActorCapability',
  'ActorMetadata',
  'ActorScope',
].map((symbol) => ({
  symbol,
  sourceFile: 'legacy actor-model inventory',
  exportPath: 'actor-model',
  target: 'contracts',
}));

const portInventory = [
  ['ports/access-verification', 'AccessVerificationPort', 'ExecutionAuthorizationProvider'],
  ['ports/policy-evaluation', 'PolicyEvaluatorPort', 'PolicyDecisionProvider'],
  ['ports/trust-coordination', 'TrustCoordinationPort', 'RevocationLookup'],
  ['ports/trust-domain', 'TrustDomainPort', 'TrustRegistryProvider'],
].map(([exportPath, symbol, canonical]) => ({
  symbol,
  sourceFile: 'legacy ports inventory',
  exportPath,
  target: 'adapters',
  canonical,
}));

const requiredCoverageInventory = {
  claims: [
    'CapabilityClaim',
    'DelegationClaim',
    'GrantClaim',
    'VerificationClaim',
    'TrustClaim',
    'AttestationClaim',
    'CredentialClaim',
    'RevocationClaim',
  ],
  errors: [
    'AccessError',
    'VerificationError',
    'AuthorizationError',
    'TrustError',
    'RevocationError',
    'ExecutionError',
    'GovernanceError',
    'PolicyError',
    'RuntimeError',
  ],
  adapters: [
    'VerificationKeyResolver',
    'VerificationProvider',
    'RevocationLookup',
    'RegistryLookup',
    'TrustRegistryProvider',
    'CapabilityLookup',
    'AttestationLookup',
    'CredentialStatusLookup',
    'AuditEventSink',
    'SecurityEventSink',
    'ProtocolEventSink',
    'PolicyDecisionProvider',
    'GovernanceDecisionProvider',
    'ExecutionAuthorizationProvider',
    'ObservabilityEventSink',
  ],
};
const coverageInventory = Object.entries(requiredCoverageInventory).flatMap(([target, symbols]) =>
  symbols.map((symbol) => ({
    symbol,
    sourceFile: `PR-05 ${target} coverage inventory`,
    exportPath: `legacy ${target} coverage`,
    target,
  })),
);

const sourceFiles = [
  ...legacySurfaces.map(({ path }) => resolve(root, path)),
  ...Object.values(canonicalSurfaces).map((path) => resolve(root, path)),
];
const program = ts.createProgram(sourceFiles, {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  strict: true,
});
const checker = program.getTypeChecker();

function exportedSymbols(filePath) {
  const source = program.getSourceFile(resolve(root, filePath));
  if (!source) throw new Error(`Unable to load ${filePath}`);
  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (!moduleSymbol) return [];
  return checker.getExportsOfModule(moduleSymbol).map(({ name }) => name).filter((name) => name !== 'default').sort();
}

const canonicalExports = Object.fromEntries(
  Object.entries(canonicalSurfaces).map(([surface, path]) => [surface, new Set(exportedSymbols(path))]),
);

const legacyInventory = legacySurfaces.flatMap((surface) =>
  exportedSymbols(surface.path).map((symbol) => ({
    symbol,
    sourceFile: surface.path,
    exportPath: surface.exportPath,
    target: surface.target,
  })),
);
legacyInventory.push(...actorModelInventory, ...portInventory, ...coverageInventory);

const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage']);
function collectConsumerFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    if (ignoredDirectories.has(entry)) return [];
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return collectConsumerFiles(path);
    return /\.(?:[cm]?[jt]sx?)$/.test(entry) ? [path] : [];
  });
}
const consumerFiles = collectConsumerFiles(root).filter(
  (path) => !path.includes('/packages/protocol/src/') && !path.endsWith('/scripts/check-symbol-parity.mjs'),
);
const consumerText = consumerFiles.map((path) => ({ path, text: readFileSync(path, 'utf8') }));
function consumerCount(symbol) {
  const pattern = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  return consumerText.filter(({ text }) => pattern.test(text)).length;
}

const rows = legacyInventory.map((item) => {
  const canonical = item.canonical ?? renamedSymbols.get(`${item.target}:${item.symbol}`) ?? item.symbol;
  const ready = canonicalExports[item.target].has(canonical);
  const consumers = consumerCount(item.symbol);
  return {
    ...item,
    canonical,
    consumers,
    priority: consumers > 0 || item.exportPath === 'actor-model' ? 'High' : item.target === 'adapters' ? 'Medium' : 'Low',
    status: ready ? 'Ready' : 'Missing',
  };
});

const uniqueRows = [...new Map(rows.map((row) => [`${row.exportPath}:${row.symbol}`, row])).values()];
const unmapped = uniqueRows.filter(({ status }) => status !== 'Ready');
const mapped = uniqueRows.length - unmapped.length;
const readiness = uniqueRows.length === 0 ? 100 : (mapped / uniqueRows.length) * 100;

const ownership = new Map();
for (const [surface, symbols] of Object.entries(canonicalExports)) {
  for (const symbol of symbols) {
    const owners = ownership.get(symbol) ?? [];
    owners.push(surface);
    ownership.set(symbol, owners);
  }
}
const ownershipAmbiguities = [...ownership.entries()].filter(([, owners]) => owners.length > 1);

function parityReport() {
  const table = uniqueRows
    .sort((a, b) => a.exportPath.localeCompare(b.exportPath) || a.symbol.localeCompare(b.symbol))
    .map(
      (row) =>
        `| \`${row.exportPath}.${row.symbol}\` | \`${row.target}.${row.canonical}\` | ${row.status} | ${row.consumers} | ${row.status === 'Ready' ? 'Yes' : 'No'} | ${row.priority} |`,
    )
    .join('\n');
  return `# Protocol Symbol Parity Report\n\n> Generated by \`npm run check:symbol-parity -- --write\`. Do not hand-edit inventory rows.\n\n## Summary\n\n- Legacy symbols audited: **${uniqueRows.length}**\n- Canonical symbols: **${[...ownership.keys()].length}**\n- Mapped symbols: **${mapped}**\n- Unmapped symbols: **${unmapped.length}**\n- Migration readiness: **${readiness.toFixed(1)}%**\n- Mode: **report-only** (unmapped symbols are reported but do not fail CI)\n\n## Inventory\n\n| Legacy export | Canonical export | Status | Consumers | Migration ready | Priority |\n|---|---|---:|---:|---:|---:|\n${table}\n\n## Scope notes\n\n- Consumer counts are repository-local source-file counts and intentionally exclude generated \`dist\` output and the canonical Protocol implementation.\n- The actor-model and named port rows preserve the prior audit inventory even though this repository retains those concepts under \`src/agents/types.ts\` and \`src/adapters/interfaces.ts\`.\n- This report establishes export availability only. It does not rewrite consumer imports, move implementations, or remove legacy exports.\n`;
}

function consolidationReport() {
  const byTarget = Object.keys(canonicalSurfaces).map((target) => {
    const targetRows = uniqueRows.filter((row) => row.target === target);
    const targetReady = targetRows.filter((row) => row.status === 'Ready').length;
    return `| \`@aoc/protocol/${target}\` | ${targetReady}/${targetRows.length} | ${targetReady === targetRows.length ? 'Ready for migration' : targetReady ? 'Partially ready' : 'Blocked'} |`;
  }).join('\n');
  const missing = unmapped.length ? unmapped.map((row) => `- \`${row.exportPath}.${row.symbol}\` → \`${row.target}.${row.canonical}\``).join('\n') : '- None.';
  const ambiguities = ownershipAmbiguities.length
    ? ownershipAmbiguities.map(([symbol, owners]) => `- \`${symbol}\`: ${owners.map((owner) => `\`${owner}\``).join(', ')}`).join('\n')
    : '- None across the four approved ownership surfaces.';
  return `# Protocol Export Consolidation\n\n> Generated by \`npm run check:symbol-parity -- --write\`.\n\n## Readiness\n\n| Approved ownership surface | Mapped legacy symbols | State |\n|---|---:|---|\n${byTarget}\n\n## Ready for migration\n\n${unmapped.length === 0 ? 'All audited legacy symbols have a canonical export. Consumer migration can be performed as an import rewrite.' : `${mapped} audited symbols have canonical exports.`}\n\n## Partially ready\n\n${unmapped.length > 0 && mapped > 0 ? 'At least one surface has both mapped and missing symbols.' : 'None.'}\n\n## Blocked\n\n${unmapped.length > 0 ? `${unmapped.length} symbol(s) remain blocked.` : 'None.'}\n\n## Missing symbols\n\n${missing}\n\n## Ownership ambiguities\n\n${ambiguities}\n\n## Consolidation policy\n\n- \`@aoc/protocol/contracts\` owns actor, capability, delegation, consent, policy, decision, and audit contract shapes.\n- \`@aoc/protocol/claims\` owns capability, delegation, grant, verification, trust, attestation, credential, and revocation claim vocabulary.\n- \`@aoc/protocol/errors\` owns access, verification, authorization, trust, revocation, execution, governance, policy, and runtime error contracts.\n- \`@aoc/protocol/adapters\` owns all external lookup, decision-provider, authorization-provider, event-sink, and legacy port seams.\n- Legacy exports remain available; no implementation or consumer source is moved by this consolidation.\n`;
}

if (writeReports) {
  writeFileSync(resolve(root, 'docs/architecture/protocol-symbol-parity-report.md'), parityReport());
  writeFileSync(resolve(root, 'docs/architecture/protocol-export-consolidation.md'), consolidationReport());
}

console.log('Protocol symbol parity (report mode)');
console.log(`Legacy Symbols: ${uniqueRows.length}`);
console.log(`Canonical Symbols: ${[...ownership.keys()].length}`);
console.log(`Mapped Symbols: ${mapped}`);
console.log(`Unmapped Symbols: ${unmapped.length}`);
console.log(`Migration Readiness: ${readiness.toFixed(1)}%`);
if (unmapped.length) {
  console.warn('Unmapped legacy exports:');
  for (const row of unmapped) console.warn(`- ${row.exportPath}.${row.symbol} -> ${row.target}.${row.canonical}`);
}
if (ownershipAmbiguities.length) {
  console.warn(`Ownership ambiguities: ${ownershipAmbiguities.length}`);
  for (const [symbol, owners] of ownershipAmbiguities) console.warn(`- ${symbol}: ${owners.join(', ')}`);
}
console.log('Result: report-only; findings do not fail the build.');
