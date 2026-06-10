import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeVotingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-voting-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('voting authority governance',()=>{
 it('validates the repository voting catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Voting authority scanner passed');});
 it('rejects unauthorized voting creation',()=>{const f=createConstitutionalFixture();try{writeVotingGovernance(f);const p=`${f.root}/docs/constitution/VOTING-AUTHORITIES.md`;f.write('docs/constitution/VOTING-AUTHORITIES.md',readFileSync(p,'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical |','AOC-AMD-9999 | Not scheduled | Canonical |'));const r=f.run('check-voting-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("VOTE-V-011 VOT-0001 creation amendment 'AOC-AMD-9999'");}finally{f.cleanup();}});
});
