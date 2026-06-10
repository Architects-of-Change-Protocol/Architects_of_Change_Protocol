import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeVotingGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-voting-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('voting lifecycle governance',()=>{
 it('validates the repository voting lifecycle',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Voting lifecycle scanner passed');});
 it('rejects invalid lifecycle transition',()=>{const f=createConstitutionalFixture();try{writeVotingGovernance(f);f.write('docs/constitution/VOTING-LIFECYCLE.md',`# Voting Lifecycle\n\n**Constitution Version:** v1.0\n\n## Voting lifecycle transition ledger\n\n| Transition ID | Voting ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n| VLT-0001 | VOT-0001 | Retired | Draft | Constitution | test | AOC-AMD-0001 | 2026-06-10 |\n`);const r=f.run('check-voting-lifecycle.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("VOTE-V-007");}finally{f.cleanup();}});
});
