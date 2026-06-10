import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAuditGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-audit-domains.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('audit domain governance',()=>{
 it('validates the repository audit domain governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Audit domain scanner passed');});
 it('rejects missing domains',()=>{const f=createConstitutionalFixture();try{writeAuditGovernance(f);f.write('docs/constitution/AUDIT-DOMAIN-POLICY.md',`# Audit Domain Policy\n\n**Constitution Version:** v1.0\n\n## Auditable Domains\n\nAuthority\n`);const r=f.run('check-audit-domains.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('AUD-V-008');}finally{f.cleanup();}});
});
