import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAuditGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-audit-certification.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('audit certification governance',()=>{
 it('validates the repository audit certification governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Audit certification scanner passed');});
 it('rejects missing certification levels',()=>{const f=createConstitutionalFixture();try{writeAuditGovernance(f);f.write('docs/constitution/AUDIT-CERTIFICATION-POLICY.md',`# Audit Certification Policy\n\n**Constitution Version:** v1.0\n\n## Certification level catalog\n\n| Certification Level | Level Name | Definition | Certified | Amendment |\n|---|---|---|---|---|\n| Level 0 | Unverified | No audit | Not certified | AOC-AMD-0001 |\n`);const r=f.run('check-audit-certification.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('AUD-V-010');}finally{f.cleanup();}});
});
