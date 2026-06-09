import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeReputationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-reputation-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('reputation authority governance',()=>{
 it('validates the repository reputation catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Reputation authority scanner passed');});
 it('rejects unauthorized reputation creation',()=>{const f=createConstitutionalFixture();try{writeReputationGovernance(f);const p=`${f.root}/docs/constitution/REPUTATION-AUTHORITIES.md`;f.write('docs/constitution/REPUTATION-AUTHORITIES.md',readFileSync(p,'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical |','AOC-AMD-9999 | Not scheduled | Canonical |'));const r=f.run('check-reputation-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("REP-V-001 REP-0001 creation amendment 'AOC-AMD-9999'");}finally{f.cleanup();}});
});
