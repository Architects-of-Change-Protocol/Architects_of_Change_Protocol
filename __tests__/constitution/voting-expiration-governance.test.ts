import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeVotingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-voting-expiration.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('voting expiration governance',()=>{
 it('validates the repository voting expiration catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Voting expiration scanner passed');});
 it('rejects invalid voting class in expiration policy',()=>{const f=createConstitutionalFixture();try{writeVotingGovernance(f);const p=`${f.root}/docs/constitution/VOTING-EXPIRATION-POLICY.md`;f.write('docs/constitution/VOTING-EXPIRATION-POLICY.md',readFileSync(p,'utf8').replace('| VEX-0001 | Constitutional |','| VEX-0001 | Invalid |'));const r=f.run('check-voting-expiration.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("VOTE-V-007");}finally{f.cleanup();}});
});
