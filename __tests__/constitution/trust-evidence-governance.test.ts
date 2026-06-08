import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeTrustGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-trust-evidence.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('trust evidence governance',()=>{
 it('validates evidence coverage and integrity',()=>{const r=run();expect(r.status).toBe(0);expect(r.stdout).toContain('Trust evidence scanner passed');});
 it('rejects trust without integrity rules',()=>{const f=createConstitutionalFixture();try{writeTrustGovernance(f,{evidenceRows:'| TEP-0001 | TRS-0001 | Source | 100% |  | Recent | One | Calculation | AOC-AMD-0001 | Active |'});const r=f.run('check-trust-evidence.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('TRS-V-008 TEP-0001 is missing Integrity Rules');}finally{f.cleanup();}});
});
