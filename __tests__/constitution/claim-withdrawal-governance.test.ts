import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeClaimGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-claim-withdrawal.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('claim withdrawal governance',()=>{
 it('validates the withdrawal policy',()=>{const r=run();expect(r.status).toBe(0);expect(r.stdout).toContain('Claim withdrawal scanner passed');});
 it('rejects unauthorized withdrawal',()=>{const f=createConstitutionalFixture();try{writeClaimGovernance(f,{withdrawalRows:'| CLW-0001 | CLM-0001 | Stranger | Convenience | None | Reason | DEC-0001 | AOC-AMD-0001 | Effective |'});const r=f.run('check-claim-withdrawal.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("CLM-V-005 CLW-0001 has invalid authority basis 'Convenience'");}finally{f.cleanup();}});
});
