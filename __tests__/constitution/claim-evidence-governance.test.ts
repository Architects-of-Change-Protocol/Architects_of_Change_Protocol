import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeClaimGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-claim-evidence.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('claim evidence governance',()=>{
 it('validates evidence coverage',()=>{const r=run();expect(r.status).toBe(0);expect(r.stdout).toContain('Claim evidence scanner passed');});
 it('rejects missing integrity rules',()=>{const f=createConstitutionalFixture();try{writeClaimGovernance(f,{evidenceRows:'| CEP-0001 | CLM-0001 | Required | One | Source |  | Trace | AOC-AMD-0001 | Active |'});const r=f.run('check-claim-evidence.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('CLM-V-008 CEP-0001 is missing Integrity Rules');}finally{f.cleanup();}});
});
