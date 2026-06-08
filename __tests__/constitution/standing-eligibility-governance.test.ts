import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeStandingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-standing-eligibility.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('standing eligibility governance',()=>{
 it('validates repository standing eligibility',()=>{const result=run();expect(result.status).toBe(0);expect(result.stderr).toBe('');expect(result.stdout).toContain('Standing eligibility scanner passed');});
 it('rejects standing without eligibility evidence requirements',()=>{const fixture=createConstitutionalFixture();try{writeStandingGovernance(fixture,{eligibilityRows:'| SEP-0001 | STD-0001 | Requirements | Disqualifiers |  | Validation | Renewal | AOC-AMD-0001 | Active |'});const result=fixture.run('check-standing-eligibility.mjs');expect(result.status).toBe(1);expect(result.stderr).toContain('STD-V-003 SEP-0001 is missing Evidence Requirements');}finally{fixture.cleanup();}});
});
