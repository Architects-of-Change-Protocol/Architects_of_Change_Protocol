import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAuditGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-audit-integrity.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('audit integrity governance',()=>{
 it('validates the repository audit integrity governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Audit integrity scanner passed');});
 it('rejects missing integrity dimensions',()=>{const f=createConstitutionalFixture();try{writeAuditGovernance(f);f.write('docs/constitution/AUDIT-INTEGRITY-POLICY.md',`# Audit Integrity Policy\n\n**Constitution Version:** v1.0\n\n## Integrity Dimensions\n\n- Version Integrity\n`);const r=f.run('check-audit-integrity.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('AUD-V-008');}finally{f.cleanup();}});
});
