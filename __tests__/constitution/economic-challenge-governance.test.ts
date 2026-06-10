import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeEconomicsGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-economic-challenges.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('economic challenge governance',()=>{
 it('validates the repository economic challenge governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Economics challenges scanner passed');});
 it('rejects invalid challenge records',()=>{const f=createConstitutionalFixture();try{writeEconomicsGovernance(f);f.write('docs/constitution/ECONOMIC-CHALLENGE-POLICY.md',`# Economic Challenge Policy\n\n**Constitution Version:** v1.0\n\n## Challenge registry\n\n| Challenge ID | Economic Authority ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| INVALID | ECO-0001 | Invalid Right | evidence | Constitution | DEC-0001 | Resolved | AOC-AMD-0001 | Closed |\n`);const r=f.run('check-economic-challenges.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ECO-V-008");}finally{f.cleanup();}});
});
