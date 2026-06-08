import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeClaimGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-claim-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('claim lifecycle governance',()=>{
 it('validates lifecycle transitions',()=>{const r=run();expect(r.status).toBe(0);expect(r.stdout).toContain('Claim lifecycle scanner passed');});
 it('rejects invalid transitions',()=>{const f=createConstitutionalFixture();try{writeClaimGovernance(f,{lifecycleRows:'| CLT-0001 | CLM-0001 | Draft | Accepted | Constitution | AOC-AMD-0001 | 2026-06-08 |'});const r=f.run('check-claim-lifecycle.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("CLM-V-004 CLT-0001 contains invalid lifecycle transition 'Draft' → 'Accepted'");}finally{f.cleanup();}});
});
