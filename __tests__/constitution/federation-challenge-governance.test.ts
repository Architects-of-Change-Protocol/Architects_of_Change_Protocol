import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeFederationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-federation-challenges.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('federation challenge governance',()=>{
 it('validates the repository federation challenges',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Federation challenge scanner passed');});
 it('rejects invalid challenge grounds',()=>{const f=createConstitutionalFixture();try{writeFederationGovernance(f);f.write('docs/constitution/FEDERATION-CHALLENGE-POLICY.md',`# Federation Challenge Policy\n\n**Constitution Version:** v1.0\n\n## Challenge registry\n\n| Challenge ID | Federation ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| FCHL-0001 | FED-0001 | Invalid Grounds Type | Evidence | Initiator | DEC-0001 | Pending | AOC-AMD-0001 | Active |\n`);const r=f.run('check-federation-challenges.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("FED-V-010");}finally{f.cleanup();}});
});
