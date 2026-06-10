import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRuntimeGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-runtime-obligations.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('runtime obligation governance',()=>{
 it('validates the repository runtime obligation governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Runtime obligations scanner passed');});
 it('rejects invalid obligation policy records',()=>{const f=createConstitutionalFixture();try{writeRuntimeGovernance(f);f.write('docs/constitution/RUNTIME-OBLIGATION-POLICY.md',`# Runtime Obligation Policy\n\n**Constitution Version:** v1.0\n\n## Obligation policy catalog\n\n| Obligation Policy ID | Authority Class | Execution Obligations | Evidence Obligations | Settlement Obligations | Audit Obligations | Compliance Obligations | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| INVALID | Constitutional | Yes | Yes | Yes | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-runtime-obligations.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("RUN-V-007");}finally{f.cleanup();}});
});
