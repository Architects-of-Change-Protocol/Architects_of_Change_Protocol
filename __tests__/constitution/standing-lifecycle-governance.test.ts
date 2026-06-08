import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeStandingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-standing-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('standing lifecycle governance',()=>{
 it('validates the repository standing lifecycle',()=>{const result=run();expect(result.status).toBe(0);expect(result.stderr).toBe('');expect(result.stdout).toContain('Standing lifecycle scanner passed');});
 it('rejects revoked standing reactivation',()=>{const fixture=createConstitutionalFixture();try{writeStandingGovernance(fixture,{lifecycleRows:'| SLT-0001 | STD-0001 | Revoked | Active | Constitution | AOC-AMD-0001 | 2026-06-08 |'});const result=fixture.run('check-standing-lifecycle.mjs');expect(result.status).toBe(1);expect(result.stderr).toContain("STD-V-006 SLT-0001 contains invalid lifecycle transition 'Revoked' → 'Active'");}finally{fixture.cleanup();}});
});
