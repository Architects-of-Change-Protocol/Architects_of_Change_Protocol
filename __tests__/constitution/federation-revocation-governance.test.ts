import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeFederationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-federation-revocation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('federation revocation governance',()=>{
 it('validates the repository federation revocation',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Federation revocation scanner passed');});
 it('rejects missing revocation authority registry',()=>{const f=createConstitutionalFixture();try{writeFederationGovernance(f);f.write('docs/constitution/FEDERATION-REVOCATION-POLICY.md',`# Federation Revocation Policy\n\n**Constitution Version:** v1.0\n\n## Revocation authority registry\n\n| Federation ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n`);const r=f.run('check-federation-revocation.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("FED-V-009");}finally{f.cleanup();}});
});
