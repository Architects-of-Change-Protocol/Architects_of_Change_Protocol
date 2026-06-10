import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeVotingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-voting-delegations.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('voting delegation governance',()=>{
 it('validates the repository voting delegation catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Voting delegation scanner passed');});
 it('rejects invalid voting class in delegation policy',()=>{const f=createConstitutionalFixture();try{writeVotingGovernance(f);const p=`${f.root}/docs/constitution/VOTING-DELEGATION-POLICY.md`;f.write('docs/constitution/VOTING-DELEGATION-POLICY.md',readFileSync(p,'utf8').replace('| Constitutional | No |','| Invalid | No |'));const r=f.run('check-voting-delegations.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("VOTE-V-005");}finally{f.cleanup();}});
});
