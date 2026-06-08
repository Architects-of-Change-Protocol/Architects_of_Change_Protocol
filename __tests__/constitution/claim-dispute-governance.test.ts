import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeClaimGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-claim-disputes.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('claim dispute governance',()=>{
 it('validates the dispute policy',()=>{const r=run();expect(r.status).toBe(0);expect(r.stdout).toContain('Claim dispute scanner passed');});
 it('rejects invalid dispute grounds',()=>{const f=createConstitutionalFixture();try{writeClaimGovernance(f,{disputeRows:'| CLD-0001 | CLM-0001 | Popularity | Evidence | Reviewer | Accepted | DEC-0001 | AOC-AMD-0001 | Resolved |'});const r=f.run('check-claim-disputes.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("CLM-V-007 CLD-0001 has invalid grounds 'Popularity'");}finally{f.cleanup();}});
});
