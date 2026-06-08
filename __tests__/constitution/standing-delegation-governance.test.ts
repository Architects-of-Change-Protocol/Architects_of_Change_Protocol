import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeStandingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-standing-delegation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('standing delegation governance',()=>{
 it('validates repository standing delegation',()=>{const result=run();expect(result.status).toBe(0);expect(result.stderr).toBe('');expect(result.stdout).toContain('Standing delegation scanner passed');});
 it('rejects delegation of non-delegable standing',()=>{const fixture=createConstitutionalFixture();try{writeStandingGovernance(fixture,{delegationRows:'| SDG-0001 | STD-0003 | claimant-1 | claimant-2 | Full | 2026-06-08 | 2026-06-09 | EVID-1 | AOC-AMD-0001 | Active |'});const result=fixture.run('check-standing-delegation.mjs');expect(result.status).toBe(1);expect(result.stderr).toContain("STD-V-004 SDG-0001 delegates non-delegable standing 'STD-0003'");}finally{fixture.cleanup();}});
});
