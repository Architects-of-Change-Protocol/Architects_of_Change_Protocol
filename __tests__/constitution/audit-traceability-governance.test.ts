import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAuditGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-audit-traceability.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('audit traceability governance',()=>{
 it('validates the repository audit traceability governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Audit traceability scanner passed');});
 it('rejects missing traceability dimensions',()=>{const f=createConstitutionalFixture();try{writeAuditGovernance(f);f.write('docs/constitution/AUDIT-TRACEABILITY-POLICY.md',`# Audit Traceability Policy\n\n**Constitution Version:** v1.0\n\n## Artifact Traceability\n\nEvery artifact must trace to: Domain\n`);const r=f.run('check-audit-traceability.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('AUD-V-006');}finally{f.cleanup();}});
});
