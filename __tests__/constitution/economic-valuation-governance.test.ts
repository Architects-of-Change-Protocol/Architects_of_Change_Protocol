import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeEconomicsGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-economic-valuation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('economic valuation governance',()=>{
 it('validates the repository economic valuation governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Economics valuation scanner passed');});
 it('rejects invalid valuation records',()=>{const f=createConstitutionalFixture();try{writeEconomicsGovernance(f);f.write('docs/constitution/ECONOMIC-VALUATION-POLICY.md',`# Economic Valuation Policy\n\n**Constitution Version:** v1.0\n\n## Valuation model catalog\n\n| Valuation Model ID | Model Name | Authority Class | Basis | GCU Denominated | SCU Denominated | Evidence Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| INVALID | Consumption Value | Runtime | Consumption accounting | No | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-economic-valuation.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ECO-V-007");}finally{f.cleanup();}});
});
