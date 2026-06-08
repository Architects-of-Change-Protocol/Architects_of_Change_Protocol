import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeTrustGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-trust-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('trust lifecycle governance',()=>{
 it('validates lifecycle transitions and activation evaluation',()=>{const r=run();expect(r.status).toBe(0);expect(r.stdout).toContain('Trust lifecycle scanner passed');});
 it('rejects invalid lifecycle transitions',()=>{const f=createConstitutionalFixture();try{writeTrustGovernance(f,{lifecycleRows:'| TRT-0001 | TRS-0001 | Proposed | Active | Constitution | Evaluation | AOC-AMD-0001 | 2026-06-08 |'});const r=f.run('check-trust-lifecycle.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("TRS-V-005 TRT-0001 contains invalid lifecycle transition 'Proposed' → 'Active'");}finally{f.cleanup();}});
});
