import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeVotingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-voting-challenges.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('voting challenge governance',()=>{
 it('validates the repository voting challenge catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Voting challenge scanner passed');});
 it('rejects invalid challenge grounds',()=>{const f=createConstitutionalFixture();try{writeVotingGovernance(f);f.write('docs/constitution/VOTING-CHALLENGE-POLICY.md',`# Voting Challenge Policy\n\n**Constitution Version:** v1.0\n\n## Challenge registry\n\n| Challenge ID | Voting ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| VCH-0001 | VOT-0001 | Invalid Grounds Type | Fixture | Fixture | N/A | Pending | AOC-AMD-0001 | Active |\n`);const r=f.run('check-voting-challenges.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("VOTE-V-009");}finally{f.cleanup();}});
});
