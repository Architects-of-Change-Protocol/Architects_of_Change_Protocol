import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeVotingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-voting-weights.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('voting weight governance',()=>{
 it('validates the repository voting weight catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Voting weight scanner passed');});
 it('rejects invalid voting class in weight policy',()=>{const f=createConstitutionalFixture();try{writeVotingGovernance(f);const p=`${f.root}/docs/constitution/VOTING-WEIGHT-POLICY.md`;f.write('docs/constitution/VOTING-WEIGHT-POLICY.md',readFileSync(p,'utf8').replace('| VWT-0001 | Constitutional |','| VWT-0001 | Invalid |'));const r=f.run('check-voting-weights.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("VOTE-V-004");}finally{f.cleanup();}});
});
