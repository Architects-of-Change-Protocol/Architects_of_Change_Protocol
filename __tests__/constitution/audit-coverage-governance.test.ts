import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAuditGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-audit-coverage.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('audit coverage governance',()=>{
 it('validates the repository audit coverage governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Audit coverage scanner passed');});
 it('rejects missing coverage categories',()=>{const f=createConstitutionalFixture();try{writeAuditGovernance(f);f.write('docs/constitution/AUDIT-COVERAGE-POLICY.md',`# Audit Coverage Policy\n\n**Constitution Version:** v1.0\n\n## Coverage Categories\n\n- Artifact Coverage\n`);const r=f.run('check-audit-coverage.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('AUD-V-007');}finally{f.cleanup();}});
});
