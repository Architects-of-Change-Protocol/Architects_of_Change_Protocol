import { execSync } from 'node:child_process';
import { mkdtempSync, cpSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const repo=resolve('.');
execSync('npm run build --workspace @aoc/protocol',{stdio:'inherit'});
const packJson=execSync('npm pack --json ./packages/protocol',{encoding:'utf8'});
const tar=JSON.parse(packJson)[0].filename;
const fixture=join(repo,'tests/fixtures/external-consumer');
const temp=mkdtempSync(join(tmpdir(),'aoc-protocol-consumer-'));
cpSync(fixture,temp,{recursive:true});
execSync(`npm install ${join(repo,tar)}`,{cwd:temp,stdio:'inherit'});
execSync('tsc -p tsconfig.json --noEmit',{cwd:temp,stdio:'inherit'});
execSync('node scripts/assert-invalid-imports.mjs',{cwd:repo,stdio:'inherit'});
execSync('node scripts/check-declaration-leaks.mjs',{cwd:repo,stdio:'inherit'});
rmSync(temp,{recursive:true,force:true});
