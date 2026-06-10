import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeEconomicsGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-economic-consumption.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('economic consumption governance',()=>{
 it('validates the repository economic consumption governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Economics consumption scanner passed');});
 it('rejects invalid consumption records',()=>{const f=createConstitutionalFixture();try{writeEconomicsGovernance(f);f.write('docs/constitution/ECONOMIC-CONSUMPTION-POLICY.md',`# Economic Consumption Policy\n\n**Constitution Version:** v1.0\n\n## Consumption policy catalog\n\n| Consumption Policy ID | Authority Class | Consumption Events | Consumption Limits | Consumption Rights | Accounting Required | Auditing Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| INVALID | Constitutional | GCU consumption | Constitutional budget | Constitutional rights | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-economic-consumption.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ECO-V-004");}finally{f.cleanup();}});
});
