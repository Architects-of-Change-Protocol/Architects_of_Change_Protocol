import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRuntimeGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-runtime-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('runtime lifecycle governance',()=>{
 it('validates the repository runtime lifecycle governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Runtime lifecycle scanner passed');});
 it('rejects invalid lifecycle transitions',()=>{const f=createConstitutionalFixture();try{writeRuntimeGovernance(f);f.write('docs/constitution/RUNTIME-LIFECYCLE.md',`# Runtime Lifecycle\n\n**Constitution Version:** v1.0\n\n## Runtime lifecycle transition ledger\n\n| Transition ID | Execution ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n| TRN-0001 | EXEC-0001 | Retired | Executing | RUN-0001 | EVD-0001 | AOC-AMD-0001 | 2026-01-01 |\n`);const r=f.run('check-runtime-lifecycle.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("RUN-V-010");}finally{f.cleanup();}});
});
