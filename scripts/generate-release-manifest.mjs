#!/usr/bin/env node
// Builds @aoc/protocol, packs it twice, and proves the tarball is byte-for-byte reproducible
// before recording supply-chain evidence: SHA-256/SHA-512 checksums, npm integrity, the full
// file list, toolchain versions, and the source commit. With --check it only verifies
// reproducibility (CI mode, writes nothing); without it, it writes a release manifest and an
// SPDX SBOM under docs/release/evidence/ for the packed version.
//
// This script never publishes, tags, or contacts a registry.
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const repo = resolve('.');
const checkOnly = process.argv.includes('--check');
const evidenceDir = join(repo, 'docs/release/evidence');

const run = (cmd, opts = {}) => execSync(cmd, { cwd: repo, encoding: 'utf8', ...opts });

const pkg = JSON.parse(readFileSync(join(repo, 'packages/protocol/package.json'), 'utf8'));

console.log(`== protocol release manifest (${checkOnly ? 'check' : 'generate'}) ==`);
run('npm run build --workspace @aoc/protocol', { stdio: 'inherit', encoding: undefined });

const temp = mkdtempSync(join(tmpdir(), 'aoc-protocol-manifest-'));
const packInto = (subdir) => {
  const dest = join(temp, subdir);
  mkdirSync(dest, { recursive: true });
  const meta = JSON.parse(run(`npm pack --json --pack-destination ${JSON.stringify(dest)} ./packages/protocol`))[0];
  const bytes = readFileSync(join(dest, meta.filename));
  return {
    meta,
    path: join(dest, meta.filename),
    bytes,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    sha512: createHash('sha512').update(bytes).digest('hex'),
  };
};

try {
  const first = packInto('a');
  const second = packInto('b');

  if (first.sha256 !== second.sha256) {
    console.error('Tarball is NOT reproducible: two consecutive packs of the same tree differ.');
    console.error(`  pack 1 sha256: ${first.sha256}`);
    console.error(`  pack 2 sha256: ${second.sha256}`);
    process.exit(1);
  }
  console.log(`reproducibility: two consecutive packs are byte-identical (sha256 ${first.sha256})`);

  if (checkOnly) {
    console.log('protocol release manifest check PASSED');
    process.exit(0);
  }

  const files = run(`tar -tzf ${JSON.stringify(first.path)}`)
    .trim()
    .split('\n')
    .map((line) => line.replace(/^package\//, ''))
    .sort();

  const gitCommit = run('git rev-parse HEAD').trim();
  // The tarball is a pure function of packages/protocol (plus toolchain), so cleanliness is
  // judged on that path only — evidence files written by this script live outside it.
  const gitStatus = run('git status --porcelain -- packages/protocol').trim();
  const npmVersion = run('npm --version').trim();

  const manifest = {
    _generatedBy: 'scripts/generate-release-manifest.mjs — evidence only; records a pack, authorizes nothing',
    package: {
      name: pkg.name,
      version: pkg.version,
      private: pkg.private === true,
      license: pkg.license,
      engines: pkg.engines,
      exports: Object.keys(pkg.exports ?? {}),
      runtimeDependencies: pkg.dependencies ?? {},
    },
    source: {
      repository: pkg.repository?.url ?? null,
      gitCommit,
      protocolWorkspaceClean: gitStatus === '',
    },
    toolchain: {
      node: process.version,
      npm: npmVersion,
    },
    tarball: {
      filename: first.meta.filename,
      sizeBytes: first.bytes.length,
      fileCount: files.length,
      sha256: first.sha256,
      sha512: first.sha512,
      npmIntegrity: first.meta.integrity,
      reproducible: true,
    },
    generatedAt: new Date().toISOString(),
    files,
  };

  mkdirSync(evidenceDir, { recursive: true });
  const manifestPath = join(evidenceDir, `aoc-protocol-${pkg.version}-release-manifest.json`);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`wrote ${manifestPath}`);

  // Generate the SBOM from the extracted tarball itself (not the monorepo root) so the
  // SPDX document's `documentDescribes` points at @aoc/protocol — the artifact being
  // distributed — rather than at the private aoc-runtime workspace root.
  const sbomDir = join(temp, 'sbom');
  mkdirSync(sbomDir, { recursive: true });
  execSync(`tar -xzf ${JSON.stringify(first.path)} -C ${JSON.stringify(sbomDir)}`);
  const sbomCwd = join(sbomDir, 'package');
  execSync('npm install --package-lock-only --no-audit --no-fund', { cwd: sbomCwd, stdio: 'pipe' });
  const sbom = execSync('npm sbom --sbom-format spdx', { cwd: sbomCwd, encoding: 'utf8' });
  const sbomDoc = JSON.parse(sbom);
  if (!(sbomDoc.documentDescribes ?? []).some((id) => id.includes('aoc.protocol'))) {
    throw new Error(`SBOM documentDescribes does not reference @aoc/protocol: ${JSON.stringify(sbomDoc.documentDescribes)}`);
  }
  const sbomPath = join(evidenceDir, `aoc-protocol-${pkg.version}.sbom.spdx.json`);
  writeFileSync(sbomPath, sbom.endsWith('\n') ? sbom : `${sbom}\n`);
  console.log(`wrote ${sbomPath} (describes @aoc/protocol@${pkg.version})`);

  if (!manifest.source.protocolWorkspaceClean) {
    console.warn('WARNING: packages/protocol had uncommitted changes; this manifest does not describe a pure commit.');
  }
  console.log('protocol release manifest GENERATED');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
