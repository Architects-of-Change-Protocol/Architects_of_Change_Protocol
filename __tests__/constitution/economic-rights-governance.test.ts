import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeEconomicsGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-economic-rights.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('economic rights governance',()=>{
 it('validates the repository economic rights governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Economics rights scanner passed');});
 it('rejects invalid rights records',()=>{const f=createConstitutionalFixture();try{writeEconomicsGovernance(f);f.write('docs/constitution/ECONOMIC-RIGHTS-POLICY.md',`# Economic Rights Policy\n\n**Constitution Version:** v1.0\n\n## Rights policy catalog\n\n| Rights Policy ID | Authority Class | Access Rights | Consumption Rights | Transfer Rights | Settlement Rights | Treasury Rights | Federation Rights | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n| INVALID | Constitutional | Yes | Yes | Yes | Yes | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-economic-rights.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ECO-V-001");}finally{f.cleanup();}});
});
