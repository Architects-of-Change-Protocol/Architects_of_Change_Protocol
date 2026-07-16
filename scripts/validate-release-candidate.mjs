#!/usr/bin/env node
// Release-candidate gate for @aoc/protocol: one command that proves the tree is RC-ready.
// Strictly non-destructive — it never publishes, tags, versions, or writes to the tree
// (its only writes are npm-pack tarballs inside a temp dir, removed afterwards).
//
// Coverage: build, tests, typecheck, public-API governance, symbol parity, version graph,
// Changeset status, package metadata, the private-publication block, tarball generation +
// contents + reproducibility, committed manifest/SBOM evidence freshness, consumer fixtures,
// release-documentation existence + internal links + required content markers.
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const repo = resolve('.');
const results = [];
const run = (cmd, opts = {}) =>
  execSync(cmd, { cwd: repo, stdio: 'inherit', ...opts });
const capture = (cmd) => execSync(cmd, { cwd: repo, encoding: 'utf8' });

const check = (name, fn) => {
  process.stdout.write(`\n== rc:check :: ${name} ==\n`);
  try {
    fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error: error.message ?? String(error) });
    console.error(`[FAIL] ${name}: ${error.message ?? error}`);
  }
};

// --- toolchain-quality gates (delegate to the existing battery) ---
check('typecheck', () => run('npm run typecheck'));
check('build', () => run('npm run build'));
check('tests', () => run('npm test'));
check('public API governance', () => run('npm run check:public-export-governance'));
check('symbol parity', () => run('npm run check:symbol-parity'));
check('version graph', () => run('npm run check:version-graph'));
check('Changeset status', () => run('npx changeset status'));

// --- package metadata and the private-publication block ---
const protocolPkg = JSON.parse(readFileSync(join(repo, 'packages/protocol/package.json'), 'utf8'));
const rootPkg = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8'));
check('package metadata', () => {
  const missing = [];
  if (protocolPkg.name !== '@aoc/protocol') missing.push('name must be @aoc/protocol');
  if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(protocolPkg.version ?? '')) missing.push('semver version');
  for (const field of ['license', 'repository', 'homepage', 'bugs', 'engines', 'main', 'types']) {
    if (!protocolPkg[field]) missing.push(`missing "${field}"`);
  }
  if (!protocolPkg.exports?.['.']) missing.push('missing root "." export');
  if (!Array.isArray(protocolPkg.files) || !protocolPkg.files.includes('dist')) missing.push('"files" must include "dist"');
  if (missing.length) throw new Error(missing.join('; '));
});
check('private publication block', () => {
  // Default posture: @aoc/protocol must be unpublishable. The one exception is the
  // founder-authorized release commit itself, where private:false is required by the
  // publication approval gate — that run must set AOC_PUBLISH_AUTHORIZED=1 explicitly
  // (never set in CI workflows; see docs/release/RELEASE_AUTHORITY.md).
  const publishAuthorized = process.env.AOC_PUBLISH_AUTHORIZED === '1';
  if (protocolPkg.private !== true && !publishAuthorized) {
    throw new Error(
      'packages/protocol/package.json must remain "private": true until a founder-authorized publish decision (set AOC_PUBLISH_AUTHORIZED=1 only on the authorized release commit)',
    );
  }
  if (protocolPkg.private === true && publishAuthorized) {
    throw new Error('AOC_PUBLISH_AUTHORIZED=1 is set but the package is still private — remove the override or flip the flag deliberately');
  }
  if (rootPkg.private !== true) throw new Error('root package.json must remain "private": true in every scenario');
});

// --- tarball generation, contents, reproducibility, evidence freshness ---
const temp = mkdtempSync(join(tmpdir(), 'aoc-protocol-rc-'));
let tarballSha256 = null;
try {
  const packInto = (subdir) => {
    const dest = join(temp, subdir);
    mkdirSync(dest, { recursive: true });
    const meta = JSON.parse(capture(`npm pack --json --pack-destination ${JSON.stringify(dest)} ./packages/protocol`))[0];
    const bytes = readFileSync(join(dest, meta.filename));
    return { meta, path: join(dest, meta.filename), sha256: createHash('sha256').update(bytes).digest('hex') };
  };
  let first;
  check('tarball generation', () => {
    first = packInto('a');
  });
  check('tarball contents', () => {
    const entries = capture(`tar -tzf ${JSON.stringify(first.path)}`)
      .trim()
      .split('\n')
      .map((line) => line.replace(/^package\//, ''));
    const leaked = entries.filter((entry) => /__tests__|__snapshots__|fixture|\.env|secret|coverage|(^|\/)src\//i.test(entry));
    if (leaked.length) throw new Error(`disallowed entries in tarball: ${leaked.join(', ')}`);
    if (!entries.includes('LICENSE') || !entries.includes('README.md')) {
      throw new Error('tarball must include LICENSE and README.md');
    }
  });
  check('reproducibility', () => {
    const second = packInto('b');
    if (first.sha256 !== second.sha256) {
      throw new Error(`two consecutive packs differ: ${first.sha256} vs ${second.sha256}`);
    }
    tarballSha256 = first.sha256;
    console.log(`  byte-identical double pack: sha256 ${tarballSha256}`);
  });
  check('release manifest evidence', () => {
    const manifestPath = join(repo, `docs/release/evidence/aoc-protocol-${protocolPkg.version}-release-manifest.json`);
    if (!existsSync(manifestPath)) {
      throw new Error(`missing ${manifestPath} — run: npm run protocol:release:manifest`);
    }
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    for (const key of ['package', 'source', 'toolchain', 'tarball', 'files']) {
      if (!manifest[key]) throw new Error(`manifest missing "${key}"`);
    }
    if (manifest.tarball.reproducible !== true) throw new Error('manifest does not record a reproducible pack');
    if (tarballSha256 && manifest.tarball.sha256 !== tarballSha256) {
      throw new Error(
        `manifest sha256 (${manifest.tarball.sha256}) is stale — current pack is ${tarballSha256}; regenerate with: npm run protocol:release:manifest`,
      );
    }
  });
  check('SBOM evidence', () => {
    const sbomPath = join(repo, `docs/release/evidence/aoc-protocol-${protocolPkg.version}.sbom.spdx.json`);
    if (!existsSync(sbomPath)) throw new Error(`missing ${sbomPath} — run: npm run protocol:release:manifest`);
    const sbom = JSON.parse(readFileSync(sbomPath, 'utf8'));
    if (!sbom.spdxVersion) throw new Error('SBOM is not an SPDX document');
    const described = JSON.stringify(sbom);
    if (!described.includes('@aoc/protocol')) throw new Error('SBOM does not describe @aoc/protocol');
  });
} finally {
  rmSync(temp, { recursive: true, force: true });
}

// --- consumer fixtures (installs the real tarball into isolated consumers) ---
check('consumer fixtures', () => run('node scripts/validate-protocol-consumer.mjs'));

// --- release documentation: existence, required content markers, internal links ---
const requiredDocs = [
  'CHANGELOG.md',
  'docs/guides/CONSUMER_GUIDE.md',
  'docs/getting-started/QUICK_START.md',
  'docs/protocol/PUBLIC_API.md',
  'docs/versioning-and-stability.md',
  'docs/integration/CONSUMER_MIGRATION_GUIDE.md',
  'docs/release/PACKAGE_DISTRIBUTION_STRATEGY.md',
  'docs/release/PRERELEASE_POLICY.md',
  'docs/release/RELEASE_CANDIDATE_READINESS.md',
  'docs/release/MIGRATION_GUIDE_0.2.md',
  'docs/release/REGISTRY_READINESS.md',
  'docs/release/RELEASE_AUTHORITY.md',
  'docs/release/RELEASE_NOTES_0.2.0.md',
  'docs/release/REFERENCE_CONSUMER_EVIDENCE.md',
  'docs/release/ROLLBACK_PLAN.md',
  'docs/release/KNOWN_LIMITATIONS.md',
];
check('documentation existence', () => {
  const missing = requiredDocs.filter((doc) => !existsSync(join(repo, doc)));
  if (missing.length) throw new Error(`missing: ${missing.join(', ')}`);
});
check('changelog content', () => {
  const text = readFileSync(join(repo, 'CHANGELOG.md'), 'utf8');
  if (!/^## Unreleased$/m.test(text)) throw new Error('CHANGELOG.md must contain an "## Unreleased" section');
});
check('release notes content', () => {
  const text = readFileSync(join(repo, 'docs/release/RELEASE_NOTES_0.2.0.md'), 'utf8');
  if (!text.includes('Draft — not published')) {
    throw new Error('RELEASE_NOTES_0.2.0.md must carry status "Draft — not published"');
  }
});
check('registry-readiness content', () => {
  const text = readFileSync(join(repo, 'docs/release/REGISTRY_READINESS.md'), 'utf8');
  if (!/404/.test(text) || !/does NOT prove/i.test(text)) {
    throw new Error('REGISTRY_READINESS.md must record the 404-does-not-prove-scope-ownership caveat');
  }
});
check('internal links', () => {
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  const broken = [];
  for (const doc of requiredDocs) {
    const text = readFileSync(join(repo, doc), 'utf8');
    for (const match of text.matchAll(linkPattern)) {
      const target = match[1].split('#')[0].trim();
      if (!target || /^(https?:|mailto:)/.test(target)) continue;
      if (!existsSync(resolve(join(repo, dirname(doc)), target))) {
        broken.push(`${doc} → ${match[1]}`);
      }
    }
  }
  if (broken.length) throw new Error(`broken links:\n  ${broken.join('\n  ')}`);
});

// --- summary ---
console.log('\n== RC validation summary ==');
console.log('| Check | Result |');
console.log('| --- | --- |');
for (const r of results) console.log(`| ${r.name} | ${r.ok ? 'PASS' : 'FAIL'} |`);
const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\nprotocol:rc:check FAILED (${failed.length}/${results.length})`);
  process.exit(1);
}
console.log(`\nprotocol:rc:check PASSED (${results.length} checks)`);
