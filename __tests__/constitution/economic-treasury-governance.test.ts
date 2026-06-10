import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeEconomicsGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-economic-treasury.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('economic treasury governance',()=>{
 it('validates the repository economic treasury governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Economics treasury scanner passed');});
 it('rejects invalid treasury records',()=>{const f=createConstitutionalFixture();try{writeEconomicsGovernance(f);f.write('docs/constitution/ECONOMIC-TREASURY-POLICY.md',`# Economic Treasury Policy\n\n**Constitution Version:** v1.0\n\n## Treasury policy catalog\n\n| Treasury Policy ID | Authority Class | Allocation Governed | Reserve Governed | Distribution Governed | Consumption Funding | Federation Funding | Sustainability Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n| INVALID | Constitutional | Yes | Yes | Yes | Yes | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-economic-treasury.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ECO-V-006");}finally{f.cleanup();}});
});
