import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeTrustGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-trust-issuance.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('trust issuance governance',()=>{
 it('validates standing, claim, evidence, and authority requirements',()=>{const r=run();expect(r.status).toBe(0);expect(r.stdout).toContain('Trust issuance scanner passed');});
 it('rejects issuance without a claim',()=>{const f=createConstitutionalFixture();try{writeTrustGovernance(f,{issuanceRows:'| TRS-0001 | Required | Optional | Required | Constitution | No | Not applicable | Required | AOC-AMD-0001 | Active |'});const r=f.run('check-trust-issuance.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('TRS-V-003 TRS-0001 must mark Claim Requirement Required');}finally{f.cleanup();}});
});
