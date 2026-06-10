import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRuntimeGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-runtime-execution.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('runtime execution governance',()=>{
 it('validates the repository runtime execution governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Runtime execution scanner passed');});
 it('rejects invalid execution policy records',()=>{const f=createConstitutionalFixture();try{writeRuntimeGovernance(f);f.write('docs/constitution/RUNTIME-EXECUTION-POLICY.md',`# Runtime Execution Policy\n\n**Constitution Version:** v1.0\n\n## Execution policy catalog\n\n| Execution Policy ID | Authority Class | Authority Required | Capability Required | Policy Required | Decision Required | Evidence Required | Audit Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n| INVALID | Constitutional | Yes | Yes | Yes | Yes | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-runtime-execution.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("RUN-V-003");}finally{f.cleanup();}});
});
