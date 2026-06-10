import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeFederationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-federation-trust.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('federation trust governance',()=>{
 it('validates the repository federation trust',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Federation trust scanner passed');});
 it('rejects invalid trust levels',()=>{const f=createConstitutionalFixture();try{writeFederationGovernance(f);f.write('docs/constitution/FEDERATION-TRUST-POLICY.md',`# Federation Trust Policy\n\n**Constitution Version:** v1.0\n\n## Trust registry\n\n| Trust Record ID | Federation ID | Source Constitution | Target Constitution | Trust Level | Conditions | Evidence | Decision Reference | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|---|\n| FTRS-0001 | FED-0003 | SourceSystem | TargetSystem | Invalid Trust Level | None | Evidence | DEC-0001 | 2026-06-10 | Active |\n`);const r=f.run('check-federation-trust.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("FED-V-003");}finally{f.cleanup();}});
});
