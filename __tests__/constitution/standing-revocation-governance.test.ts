import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeStandingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-standing-revocation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('standing revocation governance',()=>{
 it('validates repository standing revocation',()=>{const result=run();expect(result.status).toBe(0);expect(result.stderr).toBe('');expect(result.stdout).toContain('Standing revocation scanner passed');});
 it('rejects revocation without a constitutional cause',()=>{const fixture=createConstitutionalFixture();try{writeStandingGovernance(fixture,{revocationRows:'| SRV-0001 | STD-0003 | claimant-1 | Convenience | EVID-1 | Protocol | AOC-AMD-0001 | 2026-06-08 | Revoked |'});const result=fixture.run('check-standing-revocation.mjs');expect(result.status).toBe(1);expect(result.stderr).toContain("STD-V-007 SRV-0001 has invalid cause 'Convenience'");}finally{fixture.cleanup();}});
});
