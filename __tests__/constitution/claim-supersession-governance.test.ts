import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeClaimGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-claim-supersession.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('claim supersession governance',()=>{
 it('validates the supersession policy',()=>{const r=run();expect(r.status).toBe(0);expect(r.stdout).toContain('Claim supersession scanner passed');});
 it('rejects subject mismatch',()=>{const f=createConstitutionalFixture();try{writeClaimGovernance(f,{supersessionRows:'| CLS-0001 | CLM-0001 | CLM-0002 | No | Higher Evidence Quality | Better evidence | DEC-0001 | AOC-AMD-0001 | Effective |'});const r=f.run('check-claim-supersession.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('CLM-V-006 CLS-0001 does not establish Same Subject');}finally{f.cleanup();}});
});
