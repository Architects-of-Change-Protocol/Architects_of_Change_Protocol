import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeGovernanceGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-governance-outcomes.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('governance outcome governance',()=>{
 it('validates the repository governance outcome policies',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Governance outcome scanner passed');});
 it('rejects outcome policy with invalid amendment',()=>{const f=createConstitutionalFixture();try{writeGovernanceGovernance(f);f.write('docs/constitution/GOVERNANCE-OUTCOME-POLICY.md',f.read('docs/constitution/GOVERNANCE-OUTCOME-POLICY.md').replace('AOC-AMD-0001 | Active','AOC-AMD-9999 | Active'));const r=f.run('check-governance-outcomes.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('GOV-V-014');}finally{f.cleanup();}});
});
