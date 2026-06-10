import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeEconomicsGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-economic-assets.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('economic assets governance',()=>{
 it('validates the repository economic assets governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Economics assets scanner passed');});
 it('rejects invalid asset records',()=>{const f=createConstitutionalFixture();try{writeEconomicsGovernance(f);f.write('docs/constitution/ECONOMIC-ASSET-POLICY.md',`# Economic Asset Policy\n\n**Constitution Version:** v1.0\n\n## Asset class catalog\n\n| Asset Class ID | Asset Class | Constitutional Source | Owner | Delegation Allowed | Revocable | Challengeable | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| INVALID | Capability Asset | CAPABILITY-CONSTITUTION.md | Constitution | No | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-economic-assets.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ECO-V-003");}finally{f.cleanup();}});
});
