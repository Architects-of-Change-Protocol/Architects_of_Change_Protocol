import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAuditGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-audit-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('audit authority governance',()=>{
 it('validates the repository audit authority governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Audit authority scanner passed');});
 it('rejects invalid authority records',()=>{const f=createConstitutionalFixture();try{writeAuditGovernance(f);f.write('docs/constitution/AUDIT-AUTHORITIES.md',`# Audit Authorities\n\n**Constitution Version:** v1.0\n\n## Audit authority catalog\n\n| Audit Authority ID | Audit Authority Name | Authority Class | Owner | Amendment | Status |\n|---|---|---|---|---|---|\n| INVALID | Test | Constitutional | Constitution | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-audit-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('AUD-V-001');}finally{f.cleanup();}});
});
