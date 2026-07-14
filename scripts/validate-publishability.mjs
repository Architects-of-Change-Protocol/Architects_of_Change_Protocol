import { execSync } from 'node:child_process';
import { mkdtempSync, cpSync, rmSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const repo=resolve('.');

const rootPkg = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8'));
if (rootPkg.private !== true) {
  throw new Error('Root package.json must remain private:true to prevent accidental publication from the monorepo root.');
}

const protocolPkg = JSON.parse(readFileSync(join(repo, 'packages/protocol/package.json'), 'utf8'));
const metadataErrors = [];
if (!protocolPkg.license) metadataErrors.push('missing "license"');
if (!protocolPkg.repository?.url) metadataErrors.push('missing "repository.url"');
if (!Array.isArray(protocolPkg.files) || !protocolPkg.files.includes('dist')) metadataErrors.push('"files" must include "dist"');
if (!protocolPkg.exports?.['.']) metadataErrors.push('missing root "." export');
if (!protocolPkg.exports?.['./package.json']) metadataErrors.push('missing "./package.json" export');
if (!existsSync(join(repo, 'packages/protocol/README.md'))) metadataErrors.push('missing packages/protocol/README.md');
if (!existsSync(join(repo, 'packages/protocol/LICENSE'))) metadataErrors.push('missing packages/protocol/LICENSE');
if (metadataErrors.length) {
  throw new Error(`@aoc/protocol package metadata is not publishability-ready:\n- ${metadataErrors.join('\n- ')}`);
}

execSync('npm run build --workspace @aoc/protocol',{stdio:'inherit'});
const packJson=execSync('npm pack --json ./packages/protocol',{encoding:'utf8'});
const packMeta=JSON.parse(packJson)[0];
let tar = packMeta.filename;
if (!existsSync(join(repo, tar))) {
  const candidates = readdirSync(repo).filter((file) => file.endsWith('.tgz') && file.includes('aoc') && file.includes('protocol'));
  if (candidates.length !== 1) {
    throw new Error(`Expected exactly one protocol tarball, found: ${candidates.join(', ')}`);
  }
  tar = candidates[0];
}
const fixture=join(repo,'tests/fixtures/external-consumer');
const temp=mkdtempSync(join(tmpdir(),'aoc-protocol-consumer-'));
cpSync(fixture,temp,{recursive:true});
execSync(`npm install ${JSON.stringify(join(repo, tar))}`,{cwd:temp,stdio:'inherit'});
execSync('tsc -p tsconfig.json --noEmit',{cwd:temp,stdio:'inherit'});
execSync('node scripts/assert-invalid-imports.mjs',{cwd:repo,stdio:'inherit'});
execSync('node scripts/check-declaration-leaks.mjs',{cwd:repo,stdio:'inherit'});
rmSync(temp,{recursive:true,force:true});
