import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRuntimeGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-runtime-challenges.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('runtime challenge governance',()=>{
 it('validates the repository runtime challenge governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Runtime challenges scanner passed');});
 it('rejects invalid challenge grounds',()=>{const f=createConstitutionalFixture();try{writeRuntimeGovernance(f);f.write('docs/constitution/RUNTIME-CHALLENGE-POLICY.md',`# Runtime Challenge Policy\n\n**Constitution Version:** v1.0\n\n## Challenge registry\n\n| Challenge ID | Execution ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| RCHAL-0001 | EXEC-0001 | Invalid Grounds Type | EVD-0001 | RUN-0001 | DEC-0001 | Pending | AOC-AMD-0001 | Active |\n`);const r=f.run('check-runtime-challenges.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("RUN-V-009");}finally{f.cleanup();}});
});
