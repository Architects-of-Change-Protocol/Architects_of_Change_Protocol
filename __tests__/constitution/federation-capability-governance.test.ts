import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeFederationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-federation-capabilities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('federation capability governance',()=>{
 it('validates the repository federation capabilities',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Federation capability scanner passed');});
 it('rejects invalid capability sharing records',()=>{const f=createConstitutionalFixture();try{writeFederationGovernance(f);f.write('docs/constitution/FEDERATION-CAPABILITY-POLICY.md',`# Federation Capability Policy\n\n**Constitution Version:** v1.0\n\n## Capability sharing registry\n\n| Sharing ID | Federation ID | Source Constitution | Target Constitution | Capability | Mode | Scope | Expiration | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n| INVALID | FED-0003 | SourceSystem | TargetSystem | CAP-0001 | Capability Sharing | Runtime scope | 2027-01-01 | AOC-AMD-0001 | Active |\n`);const r=f.run('check-federation-capabilities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("FED-V-001");}finally{f.cleanup();}});
});
