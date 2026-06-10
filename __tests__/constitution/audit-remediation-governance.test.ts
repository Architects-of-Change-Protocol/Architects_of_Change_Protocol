import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAuditGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-audit-remediation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('audit remediation governance',()=>{
 it('validates the repository audit remediation governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Audit remediation scanner passed');});
 it('rejects missing remediation fields',()=>{const f=createConstitutionalFixture();try{writeAuditGovernance(f);f.write('docs/constitution/AUDIT-REMEDIATION-POLICY.md',`# Audit Remediation Policy\n\n**Constitution Version:** v1.0\n\n## Finding Fields\n\nEvery finding must contain: Status\n`);const r=f.run('check-audit-remediation.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('AUD-V-001');}finally{f.cleanup();}});
});
