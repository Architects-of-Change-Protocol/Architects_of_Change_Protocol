import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeFederationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-federation-governance.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('federation governance governance',()=>{
 it('validates the repository federation governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Federation governance scanner passed');});
 it('rejects invalid governance records',()=>{const f=createConstitutionalFixture();try{writeFederationGovernance(f);f.write('docs/constitution/FEDERATION-GOVERNANCE-POLICY.md',`# Federation Governance Policy\n\n**Constitution Version:** v1.0\n\n## Federated governance registry\n\n| Governance Record ID | Federation ID | Motion Reference | Consensus Reference | Mandate Reference | Outcome Reference | Participating Sovereigns | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| INVALID | FED-0002 | GMP-0001 | CSN-0001 | GMD-0001 | GOP-0001 | SourceSystem; TargetSystem | AOC-AMD-0001 | Active |\n`);const r=f.run('check-federation-governance.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("FED-V-007");}finally{f.cleanup();}});
});
