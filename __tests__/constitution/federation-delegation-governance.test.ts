import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeFederationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-federation-delegation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('federation delegation governance',()=>{
 it('validates the repository federation delegation',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Federation delegation scanner passed');});
 it('rejects invalid delegation records',()=>{const f=createConstitutionalFixture();try{writeFederationGovernance(f);f.write('docs/constitution/FEDERATION-DELEGATION-POLICY.md',`# Federation Delegation Policy\n\n**Constitution Version:** v1.0\n\n## Delegation registry\n\n| Delegation ID | Source Constitution | Target Constitution | Delegated Authority | Scope | Expiration | Revocation Rule | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| FDEL-0001 | SourceSystem | TargetSystem | CAP-0001 | Governance scope | 2027-01-01 | On revocation | AOC-AMD-0001 | InvalidStatus |\n`);const r=f.run('check-federation-delegation.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("FED-V-004");}finally{f.cleanup();}});
});
