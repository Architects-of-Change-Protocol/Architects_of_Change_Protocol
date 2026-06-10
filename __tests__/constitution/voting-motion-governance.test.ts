import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeVotingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-voting-motions.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('voting motion governance',()=>{
 it('validates the repository voting motion catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Voting motion scanner passed');});
 it('rejects invalid voting class in motion policy',()=>{const f=createConstitutionalFixture();try{writeVotingGovernance(f);const p=`${f.root}/docs/constitution/VOTING-MOTION-POLICY.md`;f.write('docs/constitution/VOTING-MOTION-POLICY.md',readFileSync(p,'utf8').replace('| VMN-0001 | Constitutional |','| VMN-0001 | Invalid |'));const r=f.run('check-voting-motions.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("VOTE-V-006");}finally{f.cleanup();}});
});
