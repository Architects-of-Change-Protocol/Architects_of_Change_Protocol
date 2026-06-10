import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRuntimeGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-runtime-audit.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('runtime audit governance',()=>{
 it('validates the repository runtime audit governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Runtime audit scanner passed');});
 it('rejects invalid audit policy records',()=>{const f=createConstitutionalFixture();try{writeRuntimeGovernance(f);f.write('docs/constitution/RUNTIME-AUDIT-POLICY.md',`# Runtime Audit Policy\n\n**Constitution Version:** v1.0\n\n## Audit policy catalog\n\n| Audit Policy ID | Audit Domain | Authority Class | Execution Audit | Evidence Audit | Integrity Audit | Consumption Audit | Compliance Audit | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n| INVALID | Full Audit | Constitutional | Yes | Yes | Yes | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-runtime-audit.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("RUN-V-009");}finally{f.cleanup();}});
});
