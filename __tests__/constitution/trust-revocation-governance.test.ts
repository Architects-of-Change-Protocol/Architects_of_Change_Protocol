import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeTrustGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-trust-revocation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('trust revocation governance',()=>{
 it('validates revocation causes, authority, evidence, and decisions',()=>{const r=run();expect(r.status).toBe(0);expect(r.stdout).toContain('Trust revocation scanner passed');});
 it('rejects unauthorized revocation',()=>{const f=createConstitutionalFixture();try{writeTrustGovernance(f,{revocationRows:'| TRV-0001 | TRS-0001 | Subject | Convenience | Evidence | Stranger | DEC-0001 | AOC-AMD-0001 | 2026-06-08 | Revoked |'});const r=f.run('check-trust-revocation.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("TRS-V-007 TRV-0001 has invalid cause 'Convenience'");}finally{f.cleanup();}});
});
