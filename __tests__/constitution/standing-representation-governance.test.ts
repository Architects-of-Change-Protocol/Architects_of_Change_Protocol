import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeStandingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-standing-representation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('standing representation governance',()=>{
 it('validates repository standing representation',()=>{const result=run();expect(result.status).toBe(0);expect(result.stderr).toBe('');expect(result.stdout).toContain('Standing representation scanner passed');});
 it('rejects representation of non-representable standing',()=>{const fixture=createConstitutionalFixture();try{writeStandingGovernance(fixture,{representationRows:'| SRP-0001 | STD-0001 | principal | representative | Proxy | Review | 2026-06-08 | 2026-06-09 | EVID-1 | AOC-AMD-0001 | Active |'});const result=fixture.run('check-standing-representation.mjs');expect(result.status).toBe(1);expect(result.stderr).toContain("STD-V-005 SRP-0001 represents non-representable standing 'STD-0001'");}finally{fixture.cleanup();}});
});
