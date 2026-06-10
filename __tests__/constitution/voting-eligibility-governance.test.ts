import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeVotingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-voting-eligibility.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('voting eligibility governance',()=>{
 it('validates the repository voting eligibility catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Voting eligibility scanner passed');});
 it('rejects invalid voting class in eligibility policy',()=>{const f=createConstitutionalFixture();try{writeVotingGovernance(f);const p=`${f.root}/docs/constitution/VOTING-ELIGIBILITY-POLICY.md`;f.write('docs/constitution/VOTING-ELIGIBILITY-POLICY.md',readFileSync(p,'utf8').replace('| VEL-0001 | Constitutional |','| VEL-0001 | Invalid |'));const r=f.run('check-voting-eligibility.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("VOTE-V-003");}finally{f.cleanup();}});
});
