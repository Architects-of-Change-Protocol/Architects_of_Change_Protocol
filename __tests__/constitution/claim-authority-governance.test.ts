import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeClaimGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-claim-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('claim authority governance',()=>{
 it('validates the repository claim catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Claim authority scanner passed');});
 it('rejects unauthorized claim creation',()=>{const f=createConstitutionalFixture();try{writeClaimGovernance(f);const p=`${f.root}/docs/constitution/CLAIM-AUTHORITIES.md`;f.write('docs/constitution/CLAIM-AUTHORITIES.md',readFileSync(p,'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical |','AOC-AMD-9999 | Not scheduled | Canonical |'));const r=f.run('check-claim-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("CLM-V-001 CLM-0001 creation amendment 'AOC-AMD-9999'");}finally{f.cleanup();}});
});
