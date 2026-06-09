import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeTrustGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-trust-decay.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('trust decay governance',()=>{
 it('validates legal decay and historical preservation',()=>{const r=run();expect(r.status).toBe(0);expect(r.stdout).toContain('Trust decay scanner passed');});
 it('rejects decay that deletes history',()=>{const f=createConstitutionalFixture();try{writeTrustGovernance(f,{decayRows:'| TRS-0001 | Yes | Time | Recalculate | Zero | No | AOC-AMD-0001 | Active |'});const r=f.run('check-trust-decay.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('TRS-V-006 TRS-0001 does not preserve trust history');}finally{f.cleanup();}});
});
